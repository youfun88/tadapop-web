#!/usr/bin/env node
/* Voice the habit-programs intro film with ElevenLabs.

     source ~/.config/tadapop/eleven.env      # exports ELEVENLABS_API_KEY
     node tools/habits/vo.mjs                 # both languages, every scene
     node tools/habits/vo.mjs --lang zh h4 h6 # just those

   Same voices and models as the homepage films (tools/generate-vo.mjs): Liam
   in English on multilingual_v2, Kevin Tu in Taiwan Mandarin on v3, which the
   owner picked by ear.

   Uses the with-timestamps endpoint, so every clip comes with the time each
   character is spoken. timing-<lang>.json keeps the clip's length and where
   each sentence starts, which is what lets habits.js put the captions exactly
   under the voice rather than guessing from the length of the text.

   Output: assets/habits/vo/<lang>/<id>.mp3 and assets/habits/vo/timing-<lang>.json */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = JSON.parse(readFileSync(join(ROOT, 'tools/habits/script.json'), 'utf8'));
const OUT = join(ROOT, 'assets/habits/vo');
const KEY = process.env.ELEVENLABS_API_KEY || process.env.XI_API_KEY || '';

const BASE_SETTINGS = { stability: 0.45, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true };
const VOICES = {
  en: { voice: 'TX3LPaxmHKxFdv7VOQHJ', model: 'eleven_multilingual_v2', settings: BASE_SETTINGS }, // Liam
  // v3 accepts only 0, 0.5 or 1 for stability.
  zh: { voice: 'BrbEfHMQu0fyclQR7lfh', model: 'eleven_v3', settings: { ...BASE_SETTINGS, stability: 0.5 }, tempo: 1.06 }, // Kevin Tu
};

const args = process.argv.slice(2);
const li = args.indexOf('--lang');
const LANGS = li >= 0 ? [args[li + 1]] : ['en', 'zh'];
const ONLY = args.filter((a) => /^h\d+$/.test(a));
const VERIFY_ONLY = args.includes('--verify-only');

if (!KEY) {
  console.error('Set ELEVENLABS_API_KEY first (source ~/.config/tadapop/eleven.env).');
  process.exit(1);
}

/** Sentence starts, in seconds, from ElevenLabs' per-character alignment. */
function sentenceStarts(text, alignment) {
  const chars = alignment?.characters ?? [];
  const starts = alignment?.character_start_times_seconds ?? [];
  const joined = chars.join('');
  // Sentences end at . ! ? 。！？ — the same split habits.js uses for captions.
  const parts = text.match(/[^.!?。！？]+[.!?。！？]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  const out = [];
  let from = 0;
  for (const p of parts) {
    const head = p.slice(0, Math.min(6, p.length));
    let at = joined.indexOf(head, from);
    if (at < 0) at = from;
    out.push({ text: p, at: starts[at] ?? (out.length ? out[out.length - 1].at : 0) });
    from = at + p.length;
  }
  return out;
}

const seconds = (file) =>
  Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());

for (const lang of VERIFY_ONLY ? [] : LANGS) {
  const v = VOICES[lang];
  mkdirSync(join(OUT, lang), { recursive: true });
  const timingFile = join(OUT, `timing-${lang}.json`);
  const timing = existsSync(timingFile) ? JSON.parse(readFileSync(timingFile, 'utf8')) : {};
  for (const scene of SCRIPT.scenes) {
    if (ONLY.length && !ONLY.includes(scene.id)) continue;
    const text = scene[lang];
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.voice}/with-timestamps?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: v.model, voice_settings: v.settings }),
    });
    if (!res.ok) {
      console.error(`✗ ${lang} ${scene.id}: ${res.status} ${(await res.text()).slice(0, 300)}`);
      process.exit(1);
    }
    const body = await res.json();
    const file = join(OUT, lang, `${scene.id}.mp3`);
    writeFileSync(file, Buffer.from(body.audio_base64, 'base64'));
    // Kevin Tu on v3 reads slowly enough to take the Mandarin cut well past two
    // minutes; 6% faster is not audible as speed, only as pace.
    const tempo = v.tempo ?? 1;
    if (tempo !== 1) {
      const tmp = file.replace(/\.mp3$/, '.raw.mp3');
      execFileSync('mv', [file, tmp]);
      execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', tmp, '-filter:a', `atempo=${tempo}`, '-b:a', '128k', file]);
      execFileSync('rm', [tmp]);
    }
    const len = seconds(file);
    const sentences = sentenceStarts(text, body.alignment).map((s) => ({ ...s, at: Number((s.at / tempo).toFixed(3)) }));
    timing[scene.id] = { len: Number(len.toFixed(3)), sentences };
    console.log(`✓ ${lang} ${scene.id}  ${len.toFixed(2)}s`);
  }
  writeFileSync(timingFile, JSON.stringify(timing, null, 2) + '\n');
}

/* --verify: transcribe every clip back with Scribe and print it beside the
   script, so a misread word is caught by reading, not by a viewer. */
if (args.includes('--verify') || VERIFY_ONLY) {
  for (const lang of LANGS) {
    for (const scene of SCRIPT.scenes) {
      if (ONLY.length && !ONLY.includes(scene.id)) continue;
      const form = new FormData();
      form.append('model_id', 'scribe_v1');
      form.append('language_code', lang === 'zh' ? 'zho' : 'eng');
      form.append('file', new Blob([readFileSync(join(OUT, lang, `${scene.id}.mp3`))]), `${scene.id}.mp3`);
      const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': KEY }, body: form });
      const heard = res.ok ? (await res.json()).text : `(scribe ${res.status})`;
      console.log(`${lang} ${scene.id}\n  script: ${scene[lang]}\n  heard:  ${heard}`);
    }
  }
}
