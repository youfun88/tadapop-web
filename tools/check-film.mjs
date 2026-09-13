#!/usr/bin/env node
/**
 * check-film.mjs — does the film add up?
 *
 * Every fault reported against these films so far was a LOGIC fault, not a
 * rendering one, and every one was caught by a person watching:
 *
 *   · a caption that said more than the voiceover said (「也沒有追蹤牙牙」)
 *   · a rules card reading "four sessions a week" under a challenge whose own
 *     meta line said forty minutes A DAY
 *   · a winner crowned on 7 days, of a 50-day challenge, standings 7/6/5/4
 *   · "six weeks later" — fifty days is seven
 *   · s6.chName, a key that does not exist, so the rules card showed a bare
 *     runner emoji and no challenge name for days
 *   · a whole voiceover regeneration written to assets/assets/vo2, a real URL
 *     nothing requests, while the site served the old audio under new captions
 *
 * None of those needed a browser to find. They needed somebody to read the
 * copy and the numbers together, which is what this does, every run.
 *
 *   node tools/check-film.mjs          # all cuts, both languages
 *   node tools/check-film.mjs --quiet  # only failures
 *
 * Exits non-zero if anything fails.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = readFileSync(join(ROOT, 'film2.js'), 'utf8');
const QUIET = process.argv.includes('--quiet');

let failures = 0;
const fail = (what, detail) => {
  failures++;
  console.log(`  ✗ ${what}`);
  for (const d of [].concat(detail ?? [])) console.log(`      ${d}`);
};
const pass = (what) => { if (!QUIET) console.log(`  ✓ ${what}`); };
const section = (name) => console.log(`\n${name}`);

/* ------------------------------------------------------------------ parse
   film2.js is a browser IIFE, so it cannot be imported. The three things
   worth checking are plain object literals, and they are lifted out and
   evaluated rather than pattern-matched — a regex over copy would miss the
   nested markup that is the whole point of a caption. */
function literalAfter(decl) {
  const i = SRC.indexOf(decl);
  if (i < 0) throw new Error(`cannot find ${decl}`);
  const start = SRC.indexOf('{', i);
  let depth = 0, inStr = null, esc = false;
  for (let j = start; j < SRC.length; j++) {
    const ch = SRC[j];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { inStr = ch; continue; }
    if (ch === '/' && SRC[j + 1] === '*') { j = SRC.indexOf('*/', j) + 1; continue; }
    if (ch === '/' && SRC[j + 1] === '/') { j = SRC.indexOf('\n', j); continue; }
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return SRC.slice(start, j + 1);
  }
  throw new Error(`unbalanced literal for ${decl}`);
}
const COPY = new Function(`return ${literalAfter('const COPY =')}`)();
const CAP_AT = new Function(`return ${literalAfter('const CAP_AT =')}`)();
const SCENE_DUR = new Function(`return ${literalAfter('const SCENE_DUR =')}`)();

/** Scene lengths: declared on the object, or overridden by recut(). */
const DUR = {};
for (const m of SRC.matchAll(/id:\s*'([a-z]\d+)',\s*dur:\s*(\d+)/g)) DUR[m[1]] = +m[2];
for (const m of SRC.matchAll(/recut\([^,]+,\s*'([a-z]\d+)',\s*(\d+)\)/g)) DUR[m[1]] = +m[2];

const CUTS = {};
for (const m of SRC.matchAll(/if \(CUT === '(\w+)'\) return \[([^\]]+)\]/g)) {
  CUTS[m[1]] = m[2].split(',').map((s) => s.trim());
}
CUTS.full = (/\n {2}return \[([^\]]+)\];\n/.exec(SRC) || [, ''])[1]
  .split(',').map((s) => s.trim()).filter(Boolean);

const VO_DIR = (cut, lang) =>
  join(ROOT, 'assets', cut === 'solo' ? 'vo-solo' : 'vo2', lang === 'zh' ? 'zh' : '');
const HEADROOM = 0.6;

const durFor = (id, lang) => (lang === 'zh' && SCENE_DUR.zh?.[id]) || DUR[id];

/* ------------------------------------------------------------------ text */
const strip = (s) => String(s).replace(/<[^>]*>/g, '');
/** Punctuation, spaces and case carry no meaning when comparing a caption to
    a spoken line — an em dash is a pause, not a word. */
const norm = (s) => strip(s)
  .toLowerCase()
  .replace(/[\s.,!?;:—–\-'"’“”()·、，。：；？！「」（）]/g, '');

/** Longest common subsequence length, for "how much of A is in B". */
function lcs(a, b) {
  if (!a.length || !b.length) return 0;
  let prev = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    const cur = new Array(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    }
    prev = cur;
  }
  return prev[b.length];
}

/** The captions for a scene, as one string.
    Some scenes are CUMULATIVE — n1.cap2 restates cap1 and adds to it — so a
    caption that contains an earlier one replaces it rather than appending. */
function captionText(id, lang) {
  const times = CAP_AT[lang]?.[id] || [0];
  const parts = [];
  for (let i = 0; i < times.length; i++) {
    const html = COPY[lang]?.[`${id}.cap${i + 1}`];
    if (!html) continue;
    const text = strip(html);
    const idx = parts.findIndex((p) => norm(text).includes(norm(p)));
    if (idx >= 0) parts[idx] = text;
    else parts.push(text);
  }
  return parts.join(' ');
}

const LANGS = ['en', 'zh'];
const allScenes = [...new Set(Object.values(CUTS).flat())];

/* ============================ 1 · every key resolves ==================== */
section('Copy keys');
{
  const used = new Set([...SRC.matchAll(/\bt\('([a-z0-9]+\.[A-Za-z0-9]+)'/g)].map((m) => m[1]));
  for (const lang of LANGS) {
    const missing = [...used].filter((k) => COPY[lang]?.[k] == null && COPY.en?.[k] == null);
    if (missing.length) fail(`${lang}: every t() key exists`, missing);
    else pass(`${lang}: all ${used.size} t() keys resolve`);
  }
  // A key that resolves to '' renders as nothing, silently — which is how the
  // rules card showed a bare runner emoji and no name for days.
  const enOnly = [...used].filter((k) => COPY.en?.[k] == null);
  if (enOnly.length) fail('no key falls through to an empty string', enOnly);
  else pass('no key falls through to an empty string');
}

/* ============================ 2 · captions match the voiceover ========== */
section('Captions say what the voiceover says');
for (const lang of LANGS) {
  for (const id of allScenes) {
    const vo = COPY[lang]?.[`${id}.vo`];
    if (!vo) { fail(`${lang} ${id}: has a voiceover line`); continue; }
    const caps = captionText(id, lang);
    if (!caps) { fail(`${lang} ${id}: has captions`); continue; }
    const a = norm(caps), b = norm(vo);
    const ratio = lcs(a, b) / Math.max(a.length, 1);
    if (ratio < 0.8) {
      fail(`${lang} ${id}: captions are ${(ratio * 100).toFixed(0)}% inside the voiceover`, [
        `caption: ${caps}`, `spoken : ${strip(vo)}`,
      ]);
    }
  }
}
if (!failures) pass('every caption is carried by its spoken line');

/* ============================ 3 · caption cues fit ====================== */
section('Caption timings');
for (const lang of LANGS) {
  for (const id of allScenes) {
    const times = CAP_AT[lang]?.[id];
    if (!times) { fail(`${lang} ${id}: has caption cues`); continue; }
    const n = times.filter((_, i) => COPY[lang]?.[`${id}.cap${i + 1}`]).length;
    if (n !== times.length) fail(`${lang} ${id}: ${times.length} cues but ${n} captions`);
    const dur = durFor(id, lang) / 1000;
    for (let i = 0; i < times.length; i++) {
      if (times[i] < 0 || times[i] >= dur) fail(`${lang} ${id}: cue ${i + 1} at ${times[i]}s is outside a ${dur}s scene`);
      if (i && times[i] <= times[i - 1]) fail(`${lang} ${id}: cue ${i + 1} does not follow cue ${i}`);
    }
  }
}
if (!QUIET) pass('every cue lands inside its scene, in order');

/* ============================ 4 · the audio is where it is served ======= */
section('Voiceover');
const haveFfprobe = (() => {
  try { execFileSync('ffprobe', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; }
})();
for (const [cut, ids] of Object.entries(CUTS)) {
  for (const lang of LANGS) {
    let total = 0;
    for (const id of ids) {
      const f = join(VO_DIR(cut, lang), `${id}.mp3`);
      const dur = durFor(id, lang);
      total += dur;
      if (!existsSync(f)) { fail(`${cut} ${lang} ${id}: clip exists`, f.replace(ROOT, '.')); continue; }
      if (!haveFfprobe) continue;
      const secs = +execFileSync('ffprobe',
        ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim();
      if (secs > dur / 1000 - HEADROOM) {
        fail(`${cut} ${lang} ${id}: clip fits its scene`,
          `${secs.toFixed(2)}s needs ${(dur / 1000 - HEADROOM).toFixed(2)}s — the next scene cuts it off mid-word`);
      }
    }
    if (!QUIET) console.log(`  · ${cut} ${lang} — ${ids.length} scenes, ${Math.floor(total / 60000)}:${String(Math.round(total % 60000 / 1000)).padStart(2, '0')}`);
  }
}

/* ============================ 5 · the numbers agree ===================== */
section('The challenge adds up');
{
  /* One challenge runs through the Club cut: 50 days, 40 minutes a day, 4
     players. Every number shown anywhere in it has to belong to THAT one.
     This is the class of fault that shipped three times. */
  const LEN = 50;
  const checks = [
    ['s6.challengeMeta', /50/, 'the Arena row names the challenge length'],
    ['a1.durNote', /50/, 'the create screen says how long it runs'],
    ['s7.liveDay', new RegExp(`/\\s*${LEN}`), 'the live header counts against 50'],
    ['s8.challengeLine', /50/, 'the results header says 50 days'],
  ];
  for (const lang of LANGS) {
    for (const [key, re, what] of checks) {
      const v = COPY[lang]?.[key];
      if (v == null) fail(`${lang}: ${key} exists`);
      else if (!re.test(v)) fail(`${lang}: ${what}`, `${key} = ${JSON.stringify(v)}`);
    }
    // Nobody can complete more days than the challenge has.
    const winner = COPY[lang]?.['s8.winnerMeta'] ?? '';
    const days = [...winner.matchAll(/(\d+)/g)].map((m) => +m[1]);
    const over = days.filter((d) => d > LEN);
    if (over.length) fail(`${lang}: the winner's total is possible`, `s8.winnerMeta = ${JSON.stringify(winner)} — ${over} > ${LEN}`);
    const board = [...SRC.matchAll(/\['🥇', t\('s7\.you'\), '(\d+)'\], \['🥈', [^,]+, '(\d+)'\], \['🥉', [^,]+, '(\d+)'\], \['', [^,]+, '(\d+)'\]/g)];
    for (const m of board) {
      const scores = m.slice(1).map(Number);
      if (scores.some((s) => s > LEN)) fail('final standings are possible', `${scores} against a ${LEN}-day challenge`);
      if (![...scores].every((s, i, a) => !i || a[i - 1] >= s)) fail('final standings are in order', String(scores));
    }
    /* Fifty days is seven weeks, and the film said six for a while.
       The first version of this check was case-sensitive, so /six/ never
       matched "Six weeks later" and it passed on the very mutation it was
       written for — the exact shape of vacuous guard it is here to prevent.
       It now reads the captions as well as the line, and demands a number
       rather than merely declining to find a wrong one. */
    const weeks = Math.round(LEN / 7);
    const WORDS = { five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
                    五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
    const spoken = [strip(COPY[lang]?.['n7.vo'] ?? ''), captionText('n7', lang)].join(' ');
    const found = new Set();
    for (const [word, n] of Object.entries(WORDS)) {
      const re = new RegExp(`${word}\\s*(weeks?|個?禮拜|週)`, 'i');
      if (re.test(spoken)) found.add(n);
    }
    if (!found.size) fail(`${lang}: n7 says how long the challenge ran`, spoken);
    else for (const n of found) {
      if (n !== weeks) fail(`${lang}: n7 names the right number of weeks`, `says ${n}, ${LEN} days is ${weeks}`);
    }
  }
  if (!QUIET) pass(`every number in the Club cut belongs to a ${LEN}-day challenge`);
}

/* ============================ 6 · retired vocabulary ==================== */
section('Vocabulary');
{
  const retired = [[/\bconven(e|ing|er)\b/i, 'convene/convener'], [/\barena\b/i, 'Arena'], [/競技場/, '競技場']];
  for (const lang of LANGS) {
    for (const [key, val] of Object.entries(COPY[lang] ?? {})) {
      if (typeof val !== 'string') continue;
      for (const [re, word] of retired) {
        if (re.test(strip(val))) fail(`${lang} ${key}: says "${word}"`, JSON.stringify(val));
      }
    }
  }
  if (!QUIET) pass('no retired vocabulary in any displayed string');
}

/* ============================ 7 · assets exist ========================== */
section('Assets');
{
  const refs = new Set([...SRC.matchAll(/'(\/assets\/[^']+\.(?:jpg|png|webp|mp4|mp3))'/g)].map((m) => m[1]));
  for (const r of refs) {
    if (!existsSync(join(ROOT, r))) fail(`${r} exists`);
  }
  if (!QUIET) pass(`all ${refs.size} referenced assets are on disk`);
}

/* ============================ 8 · the cuts are sane ===================== */
section('Assemblies');
{
  for (const [cut, ids] of Object.entries(CUTS)) {
    const unknown = ids.filter((id) => !DUR[id]);
    if (unknown.length) fail(`${cut}: every scene has a duration`, unknown);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupes.length) fail(`${cut}: no scene appears twice`, dupes);
  }
  // The mission list belongs to the solo cut and the superseded combined one.
  // Putting it back in the Club cut is what the split existed to undo.
  if (CUTS.arena?.includes('n8')) fail('the Club cut does not contain the mission-list scene');
  if (!QUIET) pass('every assembly is well formed');
}

console.log(failures ? `\n✗ ${failures} problem(s)\n` : '\n✓ the film adds up\n');
process.exit(failures ? 1 : 0);
