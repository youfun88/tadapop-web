#!/usr/bin/env node
/* Render the social promo to MP4.

     node tools/promo/render.mjs            # both languages
     node tools/promo/render.mjs --lang zh  # one

   Serves the repo on a local port, drives headless Chrome over the DevTools
   Protocol (Node's built-in WebSocket — no puppeteer on this machine), seeks
   tools/promo/stage.html to every frame at 30 fps, and hands the frames plus
   the music bed to ffmpeg. Output: assets/promo/tadapop-promo-<lang>-v<N>.mp4.

   /assets is served immutable for a year (vercel.json), so a re-render must
   bump VERSION and the /promo pages must point at the new file names. */
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import { readFile } from 'node:fs/promises';

const VERSION = 1;
const FPS = 30;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
// The films' bed, mixed quiet to sit under a voice. With no voice here it is
// normalised to -14 LUFS, where TikTok and Reels play everything.
const MUSIC = join(ROOT, 'assets/music/film-bed.mp3');
const OUT_DIR = join(ROOT, 'assets/promo');
// scratch space for the Chrome profile and the frames; PROMO_TMP overrides
const TMP = process.env.PROMO_TMP || tmpdir();

const args = process.argv.slice(2);
const li = args.indexOf('--lang');
const LANGS = li >= 0 ? [args[li + 1]] : ['en', 'zh'];
// --stills <dir>: one JPEG per listed moment instead of a video, for review
const si = args.indexOf('--stills');
const STILLS = si >= 0 ? args[si + 1] : null;
const ti = args.indexOf('--at');
const AT = ti >= 0 ? args[ti + 1].split(',').map(Number) : null;

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const server = http.createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  try {
    const body = await readFile(join(ROOT, p));
    const ext = p.slice(p.lastIndexOf('.'));
    res.writeHead(200, { 'content-type': TYPES[ext] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;

const profile = mkdtempSync(join(TMP, 'promo-chrome-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((res, rej) => {
  let buf = '';
  chrome.stderr.on('data', (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) res(m[1]); });
  setTimeout(() => rej(new Error('Chrome did not start')), 15000);
});

const browser = new WebSocket(wsUrl);
await new Promise((r) => browser.addEventListener('open', r));
let id = 0;
const pending = new Map();
browser.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
});
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const mid = ++id; pending.set(mid, { res, rej });
  browser.send(JSON.stringify({ id: mid, method, params, sessionId }));
});

const evaluate = async (sid, expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }, sid);
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || ''));
  return r.result.value;
};

function run(cmd, argv) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, argv, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => { err += d; });
    p.on('close', (c) => (c === 0 ? res() : rej(new Error(cmd + ' exited ' + c + '\n' + err.slice(-2000)))));
  });
}

mkdirSync(OUT_DIR, { recursive: true });
let code = 0;
try {
  for (const lang of LANGS) {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId: sid } = await send('Target.attachToTarget', { targetId, flatten: true });
    await send('Page.enable', {}, sid);
    await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 640, deviceScaleFactor: 3, mobile: false }, sid);
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/tools/promo/stage.html?render=1&lang=${lang}` }, sid);
    // wait for the engine, then for fonts + images
    for (let i = 0; i < 100; i++) { if (await evaluate(sid, '!!window.__promo')) break; await new Promise((r) => setTimeout(r, 100)); }
    await evaluate(sid, 'window.__promo.ready.then(() => true)');
    // the page centres #stage in a 100vh grid; pin it to the viewport origin
    await evaluate(sid, "document.body.style.display='block';document.body.style.minHeight='0';true");
    const dur = await evaluate(sid, 'window.__promo.duration');
    if (STILLS) {
      mkdirSync(STILLS, { recursive: true });
      const ats = AT || Array.from({ length: Math.floor(dur) + 1 }, (_, i) => i + 0.9);
      for (const t of ats) {
        await evaluate(sid, `window.__promo.seek(${t});new Promise(r=>requestAnimationFrame(()=>r(true)))`);
        const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 360, height: 640, scale: 1 } }, sid);
        writeFileSync(join(STILLS, `${lang}-${String(t.toFixed(2)).padStart(5, '0')}.jpg`), Buffer.from(data, 'base64'));
      }
      console.log(`${lang}: ${ats.length} stills → ${STILLS}`);
      await send('Target.closeTarget', { targetId });
      continue;
    }
    const frames = Math.round(dur * FPS);
    const dir = mkdtempSync(join(TMP, 'promo-frames-'));
    process.stdout.write(`${lang}: ${frames} frames (${dur.toFixed(1)}s) `);
    for (let f = 0; f < frames; f++) {
      await evaluate(sid, `window.__promo.seek(${(f / FPS).toFixed(5)});new Promise(r=>requestAnimationFrame(()=>r(true)))`);
      const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 94, clip: { x: 0, y: 0, width: 360, height: 640, scale: 1 } }, sid);
      writeFileSync(join(dir, String(f).padStart(5, '0') + '.jpg'), Buffer.from(data, 'base64'));
      if (f % 60 === 0) process.stdout.write('.');
    }
    process.stdout.write('\n');
    const out = join(OUT_DIR, `tadapop-promo-${lang}-v${VERSION}.mp4`);
    const fadeAt = (dur - 1.6).toFixed(2);
    await run('ffmpeg', ['-y', '-framerate', String(FPS), '-i', join(dir, '%05d.jpg'),
      '-i', MUSIC,
      '-filter_complex', `[1:a]atrim=0:${dur.toFixed(3)},afade=t=in:d=0.3,loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=out:st=${fadeAt}:d=1.6[a]`,
      '-map', '0:v', '-map', '[a]',
      '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'slow',
      '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-shortest', out]);
    // a poster for the page: the end card
    await evaluate(sid, `window.__promo.seek(${(dur - 0.5).toFixed(3)});true`);
    const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 88, clip: { x: 0, y: 0, width: 360, height: 640, scale: 1 } }, sid);
    writeFileSync(join(OUT_DIR, `tadapop-promo-${lang}-v${VERSION}.jpg`), Buffer.from(data, 'base64'));
    rmSync(dir, { recursive: true, force: true });
    console.log('  → ' + out.replace(ROOT + '/', ''));
    await send('Target.closeTarget', { targetId });
  }
} catch (e) {
  console.error(e);
  code = 1;
} finally {
  browser.close();
  chrome.kill();
  server.close();
  setTimeout(() => { try { rmSync(profile, { recursive: true, force: true }); } catch {} process.exit(code); }, 500);
}
