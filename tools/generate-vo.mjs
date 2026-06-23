#!/usr/bin/env node
/**
 * generate-vo.mjs — (re)generate the explainer-film voiceover clips with ElevenLabs.
 *
 * The film's narration is one MP3 per scene in assets/vo/<id>.mp3. The spoken
 * text is the single source of truth in film.js (each scene's `vo:` field), so
 * this script READS those lines straight from film.js and synthesizes them —
 * keeping the audio in sync with whatever the captions/visuals say.
 *
 * Requires Node 18+ (global fetch). No npm install needed.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * USAGE
 *   export ELEVENLABS_API_KEY=sk_...           # required (your key)
 *
 *   node tools/generate-vo.mjs --list-voices   # find/confirm a voice id
 *   node tools/generate-vo.mjs s3 s5           # regenerate only scenes 3 & 5
 *   node tools/generate-vo.mjs                 # regenerate ALL scenes (s1..s9)
 *   node tools/generate-vo.mjs s3 s5 --bump    # also bump VOV in film.js (cache-bust)
 *   node tools/generate-vo.mjs s3 --dry-run    # print what would be sent, no API call
 *
 * CONFIG (env vars, all optional except the key)
 *   ELEVENLABS_API_KEY   your API key (also accepts XI_API_KEY)
 *   ELEVENLABS_VOICE_ID  voice id (default: Jessica, cgSgspJ2msm6clmf4uF4)
 *   ELEVENLABS_MODEL_ID  model (default: eleven_multilingual_v2)
 *
 * After regenerating, bump `const VOV` in film.js (or pass --bump) so the CDN
 * serves the new clips instead of the cached old ones.
 * ──────────────────────────────────────────────────────────────────────────
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const FILM_JS = join(ROOT, 'film.js');
const VO_DIR = join(ROOT, 'assets', 'vo');

const API_KEY = process.env.ELEVENLABS_API_KEY || process.env.XI_API_KEY || '';
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'cgSgspJ2msm6clMCkdW9'; // "Jessica" (Playful, Bright, Warm)
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
const VOICE_SETTINGS = { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true };

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const sceneIds = args.filter((a) => /^s\d+$/.test(a));
const dryRun = flags.has('--dry-run');

function die(msg) { console.error(`\n✗ ${msg}\n`); process.exit(1); }

/** Pull `{ id, vo }` for every scene out of film.js (the source of truth). */
async function readScenes() {
  const src = await readFile(FILM_JS, 'utf8');
  // For each `id: 'sN'`, grab the nearest following `vo: '...'` / "..." literal.
  const re = /id:\s*'(s\d+)'[\s\S]*?\bvo:\s*('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/g;
  const out = [];
  for (const m of src.matchAll(re)) {
    const inner = m[2].slice(1, -1).replace(/\\(['"\\])/g, '$1'); // unescape \' \" \\
    out.push({ id: m[1], vo: inner });
  }
  return out;
}

async function listVoices() {
  if (!API_KEY) die('Set ELEVENLABS_API_KEY first.');
  const res = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': API_KEY } });
  if (!res.ok) die(`/v1/voices failed: ${res.status} ${await res.text()}`);
  const { voices = [] } = await res.json();
  console.log(`\n${voices.length} voices on your account:\n`);
  for (const v of voices) console.log(`  ${v.voice_id}  ${v.name}${v.labels?.gender ? `  (${v.labels.gender})` : ''}`);
  console.log(`\nUse one with:  export ELEVENLABS_VOICE_ID=<id>\n`);
}

async function synth(scene) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
  if (dryRun) {
    console.log(`  [dry-run] ${scene.id}: "${scene.vo}"`);
    return;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text: scene.vo, model_id: MODEL_ID, voice_settings: VOICE_SETTINGS }),
  });
  if (!res.ok) die(`${scene.id} TTS failed: ${res.status} ${await res.text()}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const dest = join(VO_DIR, `${scene.id}.mp3`);
  await writeFile(dest, buf);
  console.log(`  ✓ ${scene.id}.mp3  (${(buf.length / 1024).toFixed(0)} KB)  "${scene.vo.slice(0, 56)}${scene.vo.length > 56 ? '…' : ''}"`);
}

/** Increment `const VOV = N` in film.js so the new clips bust the CDN cache. */
async function bumpVov() {
  const src = await readFile(FILM_JS, 'utf8');
  const next = src.replace(/(const VOV = )(\d+)(;)/, (_, a, n, c) => `${a}${Number(n) + 1}${c}`);
  if (next === src) { console.warn('  ! could not find `const VOV = N` to bump — do it by hand.'); return; }
  await writeFile(FILM_JS, next);
  console.log(`  ✓ bumped VOV → ${next.match(/const VOV = (\d+)/)[1]} in film.js`);
}

async function main() {
  if (flags.has('--list-voices')) return listVoices();
  if (!API_KEY && !dryRun) die('Set ELEVENLABS_API_KEY (your ElevenLabs key) and re-run.');

  const all = await readScenes();
  if (!all.length) die('No scenes parsed from film.js — has the `vo:` format changed?');

  const want = sceneIds.length ? sceneIds : all.map((s) => s.id);
  const targets = want.map((id) => all.find((s) => s.id === id) || die(`Scene "${id}" not found in film.js (have: ${all.map((s) => s.id).join(', ')})`));

  await mkdir(VO_DIR, { recursive: true });
  console.log(`\nVoice ${VOICE_ID} · model ${MODEL_ID}${dryRun ? ' · DRY RUN' : ''}\nGenerating ${targets.length} clip(s):\n`);
  for (const sc of targets) await synth(sc); // sequential — friendly to rate limits

  if (flags.has('--bump') && !dryRun) await bumpVov();
  console.log(`\nDone.${flags.has('--bump') || dryRun ? '' : '  Remember to bump `const VOV` in film.js (or re-run with --bump) to cache-bust.'}\n`);
}

main().catch((e) => die(e.stack || String(e)));
