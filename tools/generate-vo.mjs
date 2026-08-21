#!/usr/bin/env node
/**
 * generate-vo.mjs — (re)generate the explainer-film voiceover with ElevenLabs.
 *
 * The film is narrated in two languages, one MP3 per scene:
 *
 *   English             assets/vo/<id>.mp3       voice: Liam
 *   Traditional Chinese assets/vo/zh/<id>.mp3    voice: Akun (native Taiwan)
 *
 * The spoken text is NOT stored here. film.js owns it, in the COPY i18n object
 * as `'<id>.vo'` under `en:` / `zh:`, and this script reads those lines so the
 * audio can never drift from the captions and visuals.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * WHY THIS SCRIPT MEASURES WHAT IT RENDERS
 *
 * Each scene runs for a fixed `dur` in film.js and the next scene stops the
 * audio dead. A clip longer than its scene is not "slightly long" — it is cut
 * off mid-word, which is exactly how the Chinese film used to fail.
 *
 * ElevenLabs does not render deterministically: the same Chinese line came
 * back anywhere from 9.7s to 11.2s across runs, a spread far wider than the
 * headroom in most scenes. So a single render cannot be trusted to fit.
 *
 * This script therefore renders each line `--takes` times, measures every take
 * with ffprobe, and keeps the LONGEST take that still finishes HEADROOM before
 * the scene ends — longest, because a rushed read is worse than a full one,
 * and there is no reason to prefer a take that leaves dead air. If no take
 * fits it keeps the shortest, prints OVER, and tells you to shorten the line
 * in film.js. Shorten the text; do not lengthen the scene.
 *
 * Without ffprobe on PATH it still renders, but it cannot check fit and says so.
 * ──────────────────────────────────────────────────────────────────────────
 * USAGE
 *   source ~/.config/tadapop/eleven.env        # exports ELEVENLABS_API_KEY
 *
 *   node tools/generate-vo.mjs --list-voices          # find/confirm a voice id
 *   node tools/generate-vo.mjs --lang zh              # all 9 Chinese clips
 *   node tools/generate-vo.mjs --lang zh s4 s7        # just those scenes
 *   node tools/generate-vo.mjs --lang en --bump       # English + cache-bust
 *   node tools/generate-vo.mjs --lang zh --dry-run    # show text + budgets only
 *   node tools/generate-vo.mjs --lang zh --takes 5    # more tries at a tight fit
 *
 * CONFIG (env)
 *   ELEVENLABS_API_KEY      required (also accepts XI_API_KEY)
 *   ELEVENLABS_VOICE_ID     override the voice for --lang en
 *   ELEVENLABS_VOICE_ID_ZH  override the voice for --lang zh
 *   ELEVENLABS_MODEL_ID     override the model for whichever --lang you run
 *
 * NOTE: Chinese needs a paid ElevenLabs tier. The good native Taiwan-Mandarin
 * voices live in the shared voice library, and the API refuses those on the
 * free plan ("You need to be on the creator tier or above to use this voice").
 * ──────────────────────────────────────────────────────────────────────────
 */
import { readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';

const execFileP = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const FILM_JS = join(ROOT, 'film.js');

const API_KEY = process.env.ELEVENLABS_API_KEY || process.env.XI_API_KEY || '';
const VOICE_SETTINGS = { stability: 0.45, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true };

/**
 * eleven_v3 rejects a free-floating stability — it only accepts 0.0 (creative),
 * 0.5 (natural) or 1.0 (robust). Everything else is passed through unchanged.
 */
function settingsFor(model) {
  return model === 'eleven_v3' ? { ...VOICE_SETTINGS, stability: 0.5 } : VOICE_SETTINGS;
}

/** Per language: where the clips live, and who reads them. */
const LANGS = {
  en: {
    dir: join(ROOT, 'assets', 'vo'),
    voice: process.env.ELEVENLABS_VOICE_ID || 'TX3LPaxmHKxFdv7VOQHJ', // Liam
    voiceName: 'Liam (energetic, social-media creator)',
    model: process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2',
  },
  zh: {
    dir: join(ROOT, 'assets', 'vo', 'zh'),
    voice: process.env.ELEVENLABS_VOICE_ID_ZH || 'BrbEfHMQu0fyclQR7lfh', // Kevin Tu
    voiceName: 'Kevin Tu (natural, steady — native Taiwan Mandarin)',
    // v3 renders Mandarin markedly better than multilingual_v2 for this voice;
    // the user picked this exact voice+model pair by ear from an audition.
    model: process.env.ELEVENLABS_MODEL_ID || 'eleven_v3',
  },
};

/** A clip must finish this many seconds before its scene ends. */
const HEADROOM = 0.6;

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const optVal = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : dflt;
};
const LANG = optVal('--lang', 'en');
const TAKES = Math.max(1, Number(optVal('--takes', '3')) || 3);
const sceneIds = args.filter((a) => /^s\d+$/.test(a));
const dryRun = flags.has('--dry-run');

function die(msg) { console.error(`\n✗ ${msg}\n`); process.exit(1); }

/**
 * Pull the narration and the scene clock out of film.js.
 *
 * Two independent reads, because the two live in different places: the text is
 * in the COPY i18n object, the length is on the scene object that renders it.
 */
async function readFilm(lang) {
  const src = await readFile(FILM_JS, 'utf8');

  // `dur` is the authority on how long a clip may be.
  const durations = {};
  for (const m of src.matchAll(/id:\s*'(s\d+)',\s*dur:\s*(\d+)/g)) durations[m[1]] = Number(m[2]) / 1000;

  // Narrow to the requested language's block inside COPY so `en:` lines can't
  // be picked up while generating `zh:` (both define the same keys).
  const open = src.indexOf(`\n  ${lang}: {`);
  if (open < 0) die(`No \`${lang}:\` block in film.js's COPY object.`);
  const block = src.slice(open, src.indexOf('\n  },', open));

  const out = [];
  for (const m of block.matchAll(/'(s\d+)\.vo':\s*'((?:\\.|[^'\\])*)'/g)) {
    out.push({ id: m[1], vo: m[2].replace(/\\(['"\\])/g, '$1'), dur: durations[m[1]] });
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
  console.log(`\nUse one with:  export ELEVENLABS_VOICE_ID=<id>   (or _ZH for Chinese)\n`);
}

/** Seconds of audio, or null when ffprobe isn't installed. */
async function duration(file) {
  try {
    const { stdout } = await execFileP('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
    return Number(stdout.trim()) || null;
  } catch { return null; }
}

async function render(voice, model, text, file) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: model, voice_settings: settingsFor(model) }),
  });
  if (!res.ok) die(`TTS failed: ${res.status} ${await res.text()}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
}

/** Render a scene `TAKES` times and keep the best-fitting take. */
async function synth(sc, cfg) {
  const limit = sc.dur != null ? sc.dur - HEADROOM : null;
  const dest = join(cfg.dir, `${sc.id}.mp3`);
  const takes = [];

  for (let i = 0; i < TAKES; i++) {
    const tmp = join(cfg.dir, `.${sc.id}.take${i}.mp3`);
    await render(cfg.voice, cfg.model, sc.vo, tmp);
    takes.push({ file: tmp, secs: await duration(tmp) });
    if (takes[0].secs == null) break; // no ffprobe — one take is all we can judge
  }

  const timed = takes.filter((t) => t.secs != null);
  let pick = takes[0], note = 'no ffprobe — fit unchecked';
  if (timed.length && limit != null) {
    const fits = timed.filter((t) => t.secs <= limit);
    pick = fits.length ? fits.reduce((a, b) => (b.secs > a.secs ? b : a))   // fullest read that fits
                       : timed.reduce((a, b) => (b.secs < a.secs ? b : a)); // least-bad overrun
    const margin = limit - pick.secs;
    note = fits.length
      ? `${pick.secs.toFixed(2)}s / ${sc.dur.toFixed(1)}s scene  (${margin.toFixed(2)}s spare)`
      : `${pick.secs.toFixed(2)}s OVERRUNS a ${sc.dur.toFixed(1)}s scene — SHORTEN '${sc.id}.vo' in film.js`;
  }

  await writeFile(dest, await readFile(pick.file));
  await Promise.all(takes.map((t) => unlink(t.file).catch(() => {})));

  const ok = limit == null || pick.secs == null || pick.secs <= limit;
  console.log(`  ${ok ? '✓' : '✗'} ${sc.id}.mp3  ${note}`);
  if (timed.length > 1) console.log(`      takes: ${timed.map((t) => t.secs.toFixed(2)).join('  ')}`);
  return ok;
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
  if (!LANGS[LANG]) die(`Unknown --lang "${LANG}". Use one of: ${Object.keys(LANGS).join(', ')}`);
  if (!API_KEY && !dryRun) die('Set ELEVENLABS_API_KEY (source ~/.config/tadapop/eleven.env) and re-run.');

  const cfg = LANGS[LANG];
  const all = await readFilm(LANG);
  if (!all.length) die(`No '<id>.vo' lines parsed from film.js's COPY.${LANG} — has the format changed?`);

  const want = sceneIds.length ? sceneIds : all.map((s) => s.id);
  const targets = want.map((id) => all.find((s) => s.id === id) || die(`Scene "${id}" not in COPY.${LANG} (have: ${all.map((s) => s.id).join(', ')})`));

  console.log(`\n${LANG} · ${cfg.voiceName}\nvoice ${cfg.voice} · model ${cfg.model}${dryRun ? ' · DRY RUN' : ` · best of ${TAKES} takes`}\n`);

  if (dryRun) {
    for (const sc of targets) {
      const budget = sc.dur != null ? `${(sc.dur - HEADROOM).toFixed(1)}s of a ${sc.dur.toFixed(1)}s scene` : 'unknown scene length';
      console.log(`  ${sc.id}  ${String(sc.vo.length).padStart(3)} chars → must fit ${budget}\n      ${sc.vo}`);
    }
    return console.log('');
  }

  await mkdir(cfg.dir, { recursive: true });
  const results = [];
  for (const sc of targets) results.push(await synth(sc, cfg)); // sequential — friendly to rate limits

  if (flags.has('--bump')) await bumpVov();

  const over = targets.filter((_, i) => !results[i]);
  if (over.length) {
    console.log(`\n✗ ${over.length} clip(s) overrun their scene: ${over.map((s) => s.id).join(', ')}`);
    console.log(`  Shorten those '<id>.vo' lines in film.js and re-run. Punctuation is`);
    console.log(`  expensive — each 。or ，costs roughly half a second of pause.\n`);
    process.exit(1);
  }
  console.log(`\nDone.${flags.has('--bump') ? '' : '  Remember to bump `const VOV` in film.js (or re-run with --bump).'}\n`);
}

main().catch((e) => die(e.stack || String(e)));
