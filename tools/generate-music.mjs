#!/usr/bin/env node
/**
 * generate-music.mjs — (re)generate the explainer film's score bed.
 *
 * The film plays one instrumental track underneath the whole run:
 * `assets/music/film-bed.mp3`. This script asks ElevenLabs Music for it.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * WHY IT GENERATES SEVERAL AND MAKES YOU CHOOSE
 *
 * Music is a taste decision and the prompt is a weak lever — two runs of the
 * same prompt come back as different pieces, and the difference between
 * "inspiring" and "generic" is not something a flag can express. So the
 * default is to render every preset into a scratch folder and let a person
 * listen. Only `--install <key>` touches the file the film actually plays.
 *
 * Judge a bed UNDER the narration, never on its own. Any track sounds fine in
 * isolation; the question is whether BOBO is still intelligible over it, which
 * is why film.js ducks the music to MUSIC_DUCK while he speaks.
 * ──────────────────────────────────────────────────────────────────────────
 * USAGE
 *   source ~/.config/tadapop/eleven.env
 *
 *   node tools/generate-music.mjs --list                # show the presets
 *   node tools/generate-music.mjs                       # render all -> scratch
 *   node tools/generate-music.mjs T4 T2                 # render just these
 *   node tools/generate-music.mjs --install T4          # copy one into assets/
 *   node tools/generate-music.mjs --prompt "..." --name X   # your own brief
 *
 * The key needs the `music_generation` permission — a scope on the API key,
 * separate from the plan. Without it the API returns 401 missing_permissions.
 * ──────────────────────────────────────────────────────────────────────────
 */
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';

const execFileP = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT = join(ROOT, 'assets', 'music');
const SCRATCH = join(ROOT, '.music-takes'); // gitignored scratch, not shipped
const DEST = join(OUT, 'film-bed.mp3');

const API_KEY = process.env.ELEVENLABS_API_KEY || process.env.XI_API_KEY || '';

/**
 * Length: the film is the sum of the scene durations, and the track has to
 * outlast it — film.js loops the bed under the end card, and a loop point that
 * lands mid-film is audible. Read the real number rather than hard-coding it.
 */
async function filmLengthMs() {
  const src = await readFile(join(ROOT, 'film.js'), 'utf8');
  let total = 0;
  for (const m of src.matchAll(/id:\s*'s\d+',\s*dur:\s*(\d+)/g)) total += Number(m[1]);
  return total || 75000;
}

/** The briefs that produced the current bed. T4 is the one that shipped. */
const PRESETS = {
  T1: ['脈動科技感', 'Driving futuristic technology underscore, inspiring and uplifting. Pulsing synth arpeggios, glassy digital textures, clean electronic bass, light four-on-the-floor pulse, bright major-key chord progression that lifts. Modern high-tech product film energy, motivating and forward-moving. Instrumental only, no vocals, sits under a narrator.'],
  T2: ['電影感 × 激勵', 'Hybrid cinematic technology score, inspirational and determined. Pulsing low synth bass with soaring string-like pads, digital arpeggios, subtle percussive hits, an emotional rising chord progression. Futuristic but human and motivating. Instrumental, no vocals, leaves space for narration.'],
  T3: ['乾淨明亮', 'Clean modern tech-startup underscore, bright and motivational. Crisp plucked synths, warm pads, tight light drums, optimistic uplifting harmony, a sense of progress and achievement. Polished product-launch feel. Instrumental only, no vocals, background bed for voiceover.'],
  T4: ['勝利感 — SHIPPED', 'Energetic electronic anthem, futuristic and triumphant. Driving synth bass, rising filtered arpeggios, punchy electronic drums, big uplifting major chords, a feeling of levelling up and winning. High-tech and inspiring. Instrumental, no vocals, consistent drive.'],
  T5: ['極簡未來', 'Minimal futuristic underscore with emotional lift. Deep sub bass, sparse digital blips and glitchy textures, shimmering synth pads that swell, restrained but quietly powerful and motivating. Sleek high-technology feel. Instrumental, no vocals, spacious for narration.'],
  T6: ['synthwave', 'Retro-futuristic synthwave underscore, optimistic and driving. Warm analog synth bass, neon arpeggios, steady electronic drums, bright hopeful chord progression building to a lift. Tech-forward and inspiring without being aggressive. Instrumental, no vocals.'],
};

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const optVal = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d; };
const keys = args.filter((a) => PRESETS[a]);

function die(m) { console.error(`\n✗ ${m}\n`); process.exit(1); }
async function seconds(f) {
  try { const { stdout } = await execFileP('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]); return Number(stdout.trim()); }
  catch { return null; }
}

async function compose(name, prompt, ms) {
  const res = await fetch('https://api.elevenlabs.io/v1/music', {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ prompt, music_length_ms: ms }),
  });
  if (!res.ok) die(`${name} failed: ${res.status} ${await res.text()}`);
  const file = join(SCRATCH, `${name}.mp3`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
  const s = await seconds(file);
  console.log(`  ✓ ${name}  ${s ? s.toFixed(1) + 's' : ''}  → ${file.replace(ROOT + '/', '')}`);
}

async function main() {
  if (flags.has('--list')) {
    console.log('\nPresets:\n');
    for (const [k, [label]] of Object.entries(PRESETS)) console.log(`  ${k}  ${label}`);
    return console.log('\nRender all with no arguments, then --install <key>.\n');
  }

  if (flags.has('--install')) {
    const key = optVal('--install', '') || keys[0];
    const from = join(SCRATCH, `${key}.mp3`);
    const s = await seconds(from);
    if (s == null) die(`No rendered take at ${from.replace(ROOT + '/', '')} — render it first.`);
    const film = (await filmLengthMs()) / 1000;
    if (s < film) console.warn(`  ! ${key} is ${s.toFixed(1)}s, shorter than the ${film.toFixed(1)}s film — it will loop audibly.`);
    await mkdir(OUT, { recursive: true });
    await copyFile(from, DEST);
    console.log(`\n  ✓ installed ${key} → ${DEST.replace(ROOT + '/', '')}  (${s.toFixed(1)}s)`);
    return console.log(`  Bump \`const VOV\` in film.js so the CDN serves it.\n`);
  }

  if (!API_KEY) die('Set ELEVENLABS_API_KEY (source ~/.config/tadapop/eleven.env) and re-run.');

  // A few seconds of tail beyond the film, so the loop point never lands inside it.
  const ms = (await filmLengthMs()) + 3200;
  await mkdir(SCRATCH, { recursive: true });

  const custom = optVal('--prompt', '');
  const todo = custom ? [[optVal('--name', 'custom'), custom]]
                      : (keys.length ? keys : Object.keys(PRESETS)).map((k) => [k, PRESETS[k][1]]);

  console.log(`\nElevenLabs Music · ${(ms / 1000).toFixed(1)}s per take · ${todo.length} take(s)\n`);
  for (const [name, prompt] of todo) await compose(name, prompt, ms);
  console.log(`\nListen UNDER the narration, then:  node tools/generate-music.mjs --install <key>\n`);
}

main().catch((e) => die(e.stack || String(e)));
