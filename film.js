/* =====================================================================
   Tadapop explainer film — scene engine + 9 animated scenes.
   Pure DOM + Web Animations API. Female AI voiceover (speechSynthesis)
   with synced captions (captions carry the message when muted).
   Internal scene coordinate space: 1000 x 563 (scaled to fit viewport).
   ===================================================================== */
(function () {
  'use strict';
  const overlay = document.getElementById('filmOverlay');
  const launch = document.getElementById('filmLaunch');
  if (!overlay || !launch) return;

  const COL = {
    void: '#0B0E17', panel: '#141A29', panel2: '#1A2233', line: '#26304a', lineSoft: '#1c2540',
    ink: '#E8ECF5', dim: '#7C8AA5', faint: '#4F5B76', amber: '#FFB454', amberDeep: '#E8922E',
    go: '#5BE39B', goDeep: '#2FB979', blue: '#7FA9FF', red: '#FF9A7C', teal: '#38D9D2', violet: '#C9A6FF',
  };

  /* ----------------------------- DOM helper ----------------------------- */
  function el(tag, cls, css, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (css) Object.assign(e.style, css);
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* ------------------------------- audio -------------------------------- */
  let muted = false, audioCtx = null;
  function ac() { try { if (!audioCtx) { const C = window.AudioContext || window.webkitAudioContext; if (C) audioCtx = new C(); } if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); } catch (e) {} return audioCtx; }
  function blip(freq, dur, when, type, vol) {
    const ctx = ac(); if (!ctx || muted) return;
    const t = ctx.currentTime + (when || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq; o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.02);
  }
  const sfx = {
    tick() { blip(660, 0.12, 0, 'triangle', 0.07); },
    pop() { blip(880, 0.14, 0, 'sine', 0.09); blip(1320, 0.12, 0.02, 'sine', 0.05); },
    chime() {[[880, 0], [1175, 0.12], [1568, 0.24]].forEach(([f, dt]) => blip(f, 0.5, dt, 'sine', 0.1)); },
    whoosh() { blip(220, 0.18, 0, 'sawtooth', 0.04); blip(140, 0.22, 0.02, 'sine', 0.04); },
    win() {[[523, 0], [659, 0.1], [784, 0.2], [1047, 0.32]].forEach(([f, dt]) => blip(f, 0.55, dt, 'triangle', 0.1)); },
  };

  /* ----------------------------- voiceover ------------------------------ */
  let voice = null;
  function pickVoice() {
    if (!window.speechSynthesis) return;
    const vs = speechSynthesis.getVoices() || [];
    if (!vs.length) return;
    const pref = ['samantha', 'google uk english female', 'google us english', 'victoria', 'karen', 'moira', 'tessa', 'serena', 'fiona', 'allison', 'ava', 'zira', 'aria', 'jenny'];
    for (const name of pref) { const v = vs.find((x) => x.name.toLowerCase().includes(name)); if (v) { voice = v; return; } }
    voice = vs.find((x) => /female/i.test(x.name) && /en/i.test(x.lang)) || vs.find((x) => /^en/i.test(x.lang)) || vs[0];
  }
  if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function sayTTS(text) {
    if (!window.speechSynthesis) return;
    try { speechSynthesis.cancel(); } catch (e) {}
    if (muted || !text) { host.classList.remove('speaking'); return; }
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.rate = 1.03; u.pitch = 1.07; u.volume = 1;
    u.onstart = () => { host.classList.add('speaking'); startMouth(null); };
    u.onend = () => { host.classList.remove('speaking'); stopMouth(); };
    try { speechSynthesis.speak(u); } catch (e) {}
  }

  /* --------------------- lip-sync (audio-driven mouth) ------------------ */
  // Tap the playing voiceover with a Web Audio analyser and open/close the
  // alien's mouth from the voice loudness. Falls back to a synthesized
  // "chatter" when there's no analyser (browser TTS path / no Web Audio).
  const voSrc = {};            // sc.id -> { source, analyser } (created once)
  let mouthRAF = null, chatterT = 0;
  function analyserFor(id, audioEl) {
    const ctx = ac(); if (!ctx) return null;
    if (voSrc[id]) return voSrc[id].analyser;
    try {
      const source = ctx.createMediaElementSource(audioEl);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256; analyser.smoothingTimeConstant = 0.55;
      source.connect(analyser); analyser.connect(ctx.destination);
      voSrc[id] = { source, analyser };
      return analyser;
    } catch (e) { return null; }
  }
  // Bobo is a photo, so we can't move his mouth — instead the whole character
  // bounces from the voice loudness, which reads as lively talking.
  const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function setMouth(open) {
    const m = host && host.querySelector('.film-host-img'); if (!m) return;
    const o = Math.max(0, Math.min(1, open));
    m.style.transform = 'translateY(' + (-o * 4).toFixed(2) + 'px) scale(' + (1 + o * 0.05).toFixed(3) + ')';
  }
  function startMouth(analyser) {
    stopMouth();
    if (reduceMotion) return;
    if (analyser) {
      const buf = new Uint8Array(analyser.fftSize);
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let s = 0; for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; s += v * v; }
        setMouth(Math.sqrt(s / buf.length) * 3.4);
        mouthRAF = requestAnimationFrame(tick);
      };
      tick();
    } else {
      const tick = () => {
        chatterT += 0.16;
        const env = 0.55 + 0.45 * Math.sin(chatterT * 0.7);
        setMouth(Math.max(0, (0.5 + 0.5 * Math.sin(chatterT * 5.2)) * env));
        mouthRAF = requestAnimationFrame(tick);
      };
      tick();
    }
  }
  function stopMouth() {
    if (mouthRAF) cancelAnimationFrame(mouthRAF);
    mouthRAF = null; setMouth(0);
  }

  /* ----- Bobo's celebratory "Tada!" when a task completes ----- */
  let tadaTimer = null;
  function boboTada() {
    const b = host.querySelector('.film-host-tada');
    if (b) {
      b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
      clearTimeout(tadaTimer);
      tadaTimer = setTimeout(() => b.classList.remove('show'), 1400);
    }
    const inner = host.querySelector('.film-host-inner');
    if (inner) { try { inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.13)' }, { transform: 'scale(1)' }], { duration: 480, easing: 'cubic-bezier(.2,1.4,.4,1)' }); } catch (e) {} }
  }

  /* --------------------------- player shell ----------------------------- */
  overlay.innerHTML = '';
  const top = el('div', 'film-top');
  top.appendChild(el('div', 'film-brand', null, '<img src="/assets/logo.png" alt=""/> TADAPOP'));
  const closeBtn = el('button', 'film-close', null, '✕ CLOSE');
  top.appendChild(closeBtn);

  const stageWrap = el('div', 'film-stagewrap');
  const stage = el('div', 'film-stage');
  stageWrap.appendChild(stage);

  const host = el('div', 'film-host');
  host.innerHTML =
    '<div class="film-host-tada">Tada! 🎉</div>' +
    '<div class="film-host-ring"><div class="film-host-inner"><img class="film-host-img" src="/assets/host/bobo.png" alt="Bobo"/></div></div>' +
    '<div class="film-wave"><i></i><i></i><i></i><i></i><i></i></div>' +
    '<div class="film-host-name">HOST · <b>BOBO</b></div>';

  const caption = el('div', 'film-caption');

  const controls = el('div', 'film-controls');
  const prog = el('div', 'film-progress', null, '<span></span>');
  const progFill = prog.firstChild;
  const muteBtn = el('button', 'film-btn', null, '♪ SOUND ON');
  const replayBtn = el('button', 'film-btn', null, '⟳ REPLAY');
  const time = el('div', 'film-time', null, '0:00 / 1:37');
  controls.append(prog, time, muteBtn, replayBtn);

  const end = el('div', 'film-end');
  end.innerHTML =
    '<img src="/assets/logo.png" alt="Tadapop"/>' +
    '<h3>Your first mission starts now.</h3>' +
    '<div class="film-end-row">' +
    '<button class="film-cta" data-act="waitlist">Join the waitlist →</button>' +
    '<button class="film-btn" data-act="replay">⟳ Watch again</button>' +
    '<button class="film-btn" data-act="close">Close</button>' +
    '</div>';

  const unmute = el('button', 'film-unmute', null, '🔊 Tap for sound');
  overlay.append(stageWrap, host, caption, top, controls, unmute, end);

  /* --------------------------- engine state ----------------------------- */
  let sceneAnims = [], sceneTimers = [], rootAnims = [], idx = -1, playing = false, timeTimer = null, curAudio = null;
  function anim(node, frames, opts) {
    const a = node.animate(frames, Object.assign({ duration: 600, fill: 'both', easing: 'ease' }, opts || {}));
    sceneAnims.push(a); return a;
  }
  function after(ms, fn) { const t = setTimeout(fn, ms); sceneTimers.push(t); return t; }
  function clearScene() {
    sceneAnims.forEach((a) => { try { a.cancel(); } catch (e) {} });
    sceneTimers.forEach((t) => clearTimeout(t));
    sceneAnims = []; sceneTimers = [];
    stage.innerHTML = '';
  }
  function countUp(node, from, to, ms, fmt) {
    const steps = Math.min(40, Math.max(10, Math.round(ms / 45)));
    let i = 0;
    const step = () => { i++; const v = Math.round(from + (to - from) * (i / steps)); node.textContent = fmt ? fmt(v) : v; if (i < steps) after(ms / steps, step); };
    after(ms / steps, step);
  }
  const ctx = { COL, el, anim, after, sfx, countUp, boboTada };

  /* ------------------------------ scenes -------------------------------- */
  const scenes = buildScenes(ctx);
  const TOTAL = scenes.reduce((s, x) => s + x.dur, 0);
  time.textContent = '0:00 / ' + fmtClock(TOTAL);

  /* ---- pre-recorded voiceover (ElevenLabs, voice: Jessica) ----
     One MP3 per scene in /assets/vo/. Bump VOV to bust the CDN cache when
     regenerating. Falls back to the browser voice if a clip won't load/play. */
  const VOV = 1;
  const voCache = {};
  scenes.forEach((sc) => { if (sc.id) { const a = new Audio('/assets/vo/' + sc.id + '.mp3?v=' + VOV); a.preload = 'auto'; voCache[sc.id] = a; } });
  function stopVO() {
    if (curAudio) { try { curAudio.pause(); } catch (e) {} curAudio.onended = null; curAudio = null; }
    try { speechSynthesis.cancel(); } catch (e) {}
    host.classList.remove('speaking');
    stopMouth();
  }
  function playVO(sc) {
    stopVO();
    if (muted || !sc) return;
    const a = sc.id && voCache[sc.id];
    if (a) {
      curAudio = a;
      try { a.currentTime = 0; } catch (e) {}
      a.volume = 1;
      host.classList.add('speaking');
      const an = analyserFor(sc.id, a);
      a.onended = () => { if (curAudio === a) { host.classList.remove('speaking'); stopMouth(); } };
      const p = a.play();
      startMouth(an);
      if (p && p.catch) p.catch(() => { if (curAudio === a) { host.classList.remove('speaking'); stopMouth(); sayTTS(sc.vo); } });
    } else {
      sayTTS(sc.vo);
    }
  }

  function showCaption(html) {
    caption.innerHTML = html;
    anim(caption, [{ opacity: 0, transform: 'translateX(-50%) translateY(8px)' }, { opacity: 1, transform: 'translateX(-50%) translateY(0)' }], { duration: 400, fill: 'both' });
  }

  function gotoScene(i) {
    clearScene();
    idx = i;
    if (i >= scenes.length) { return; }
    const sc = scenes[i];
    const node = el('div', 'film-scene');
    stage.appendChild(node);
    sfx.whoosh();
    anim(node, [{ opacity: 0 }, { opacity: 1 }], { duration: 450, fill: 'both' });
    try { sc.render(node, ctx); } catch (e) { /* keep film resilient */ }
    playVO(sc);
    (sc.caps || []).forEach((c) => { if (c.at <= 0) showCaption(c.html); else after(c.at * 1000, () => showCaption(c.html)); });
    if (i < scenes.length - 1) after(sc.dur, () => gotoScene(i + 1));
    else after(sc.dur, finish);
  }

  function startTimeReadout() {
    const t0 = performance.now();
    clearInterval(timeTimer);
    timeTimer = setInterval(() => {
      if (!playing) return;
      const e = Math.min(TOTAL, performance.now() - t0);
      time.textContent = fmtClock(e) + ' / ' + fmtClock(TOTAL);
    }, 250);
  }

  function play(startMuted) {
    playing = true;
    muted = !!startMuted;
    muteBtn.textContent = muted ? '♪ SOUND OFF' : '♪ SOUND ON';
    unmute.style.display = muted ? 'block' : 'none';
    end.classList.remove('show');
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => overlay.classList.add('show'));
    fit();
    if (!muted) ac();
    pickVoice();
    rootAnims.forEach((a) => { try { a.cancel(); } catch (e) {} });
    rootAnims = [];
    progFill.style.width = '0%';
    const pa = progFill.animate([{ width: '0%' }, { width: '100%' }], { duration: TOTAL, fill: 'both', easing: 'linear' });
    rootAnims.push(pa);
    anim(host, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 600, fill: 'both' });
    host.style.opacity = 1;
    startTimeReadout();
    gotoScene(0);
  }

  function finish() {
    playing = false;
    stopVO();
    end.classList.add('show');
  }

  function closeFilm() {
    playing = false;
    clearScene();
    rootAnims.forEach((a) => { try { a.cancel(); } catch (e) {} });
    clearInterval(timeTimer);
    stopVO();
    unmute.style.display = 'none';
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    setTimeout(() => { overlay.hidden = true; }, 380);
  }

  /* ------------------------------ controls ------------------------------ */
  function fit() {
    const availW = overlay.clientWidth * 0.96;
    const availH = overlay.clientHeight * 0.82;
    const s = Math.min(availW / 1000, availH / 563);
    stage.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
  }
  window.addEventListener('resize', () => { if (!overlay.hidden) fit(); });

  function enableSound() {
    muted = false;
    muteBtn.textContent = '♪ SOUND ON';
    unmute.style.display = 'none';
    ac();
    if (playing && idx >= 0 && scenes[idx]) playVO(scenes[idx]);
  }
  launch.addEventListener('click', () => play(false));
  closeBtn.addEventListener('click', closeFilm);
  replayBtn.addEventListener('click', () => play(false));
  unmute.addEventListener('click', enableSound);
  muteBtn.addEventListener('click', () => {
    if (muted) { enableSound(); return; }
    muted = true;
    muteBtn.textContent = '♪ SOUND OFF';
    stopVO();
  });
  end.addEventListener('click', (e) => {
    const act = e.target && e.target.getAttribute('data-act');
    if (act === 'replay') play();
    else if (act === 'close') closeFilm();
    else if (act === 'waitlist') { closeFilm(); location.hash = '#waitlist'; const inp = document.getElementById('email'); if (inp) setTimeout(() => inp.focus(), 450); }
  });
  document.addEventListener('keydown', (e) => { if (!overlay.hidden && e.key === 'Escape') closeFilm(); });

  /* ---- auto-play on load (muted, captioned) so the film isn't missed ----
     Forced with #film / ?film=1. Otherwise once per browser, and never for
     reduced-motion. Audio stays off until the visitor taps "Tap for sound". */
  function maybeAutoplay() {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const forced = /(^|[#&?])film(=1)?($|[#&?])/.test(location.hash + location.search);
    let seen = false;
    try { seen = localStorage.getItem('tdp_film_seen') === '1'; } catch (e) {}
    if (forced) { setTimeout(() => play(true), 600); return; }
    if (reduce || seen) return;
    try { localStorage.setItem('tdp_film_seen', '1'); } catch (e) {}
    setTimeout(() => { if (overlay.hidden) play(true); }, 1400);
  }
  if (document.readyState === 'complete') maybeAutoplay();
  else window.addEventListener('load', maybeAutoplay);

  /* ===================================================================== */
  function fmtClock(ms) { const s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
})();

/* ========================================================================
   Scene definitions. Each: { dur, vo, caps:[{at,html}], render(node, ctx) }
   ======================================================================== */
function buildScenes(ctx) {
  const { COL, el, anim, after, sfx, countUp, boboTada } = ctx;
  const POP = 'cubic-bezier(.2,1.4,.4,1)';

  // shared: a framed app column centered in the stage
  function appCol(node, width, anchorTop) {
    const c = el('div', null, anchorTop
      ? { position: 'absolute', left: '50%', top: '20px', transform: 'translateX(-50%)', width: (width || 600) + 'px' }
      : { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: (width || 600) + 'px' });
    node.appendChild(c);
    return c;
  }
  function header(streakVal, level, into) {
    const h = el('div', 'fm-panel', { padding: '14px 18px', marginBottom: '12px' });
    h.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:16px">' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<span style="width:12px;height:12px;border-radius:99px;background:' + COL.amber + ';box-shadow:0 0 16px 2px rgba(255,180,84,.8)"></span>' +
          '<div><div class="fm-disp" style="font-weight:900;letter-spacing:.22em;font-size:16px">MISSION CONTROL</div>' +
          '<div class="fm-mono" style="color:' + COL.dim + ';font-size:10px;letter-spacing:.15em;margin-top:5px">TODAY · ON TRACK</div></div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:20px">' +
          '<div style="text-align:right"><div class="fm-mono" style="color:' + COL.faint + ';font-size:9px;letter-spacing:.18em">STREAK</div>' +
          '<div class="fm-disp js-streak" style="font-weight:700;font-size:22px;color:' + COL.amber + '">' + streakVal + '<span style="font-size:11px;color:' + COL.dim + ';margin-left:3px">d</span></div></div>' +
          '<div style="min-width:140px">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:5px">' +
              '<span class="fm-mono js-lv" style="font-size:12px;font-weight:700;color:' + COL.amber + ';letter-spacing:.1em">LV.' + level + '</span>' +
              '<span class="fm-mono js-into" style="font-size:10px;color:' + COL.dim + '">' + into + '/100</span></div>' +
            '<div style="height:7px;border-radius:4px;background:rgba(79,91,118,.28);overflow:hidden">' +
              '<div class="js-lvbar" style="height:100%;width:' + into + '%;background:linear-gradient(90deg,' + COL.amberDeep + ',' + COL.amber + ');box-shadow:0 0 10px rgba(255,180,84,.6)"></div></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    return h;
  }
  function missionRow(opts) {
    // opts: { title, meta, xp, kind:'binary'|'count'|'timer', cat }
    const row = el('div', 'fm-row');
    const dotColor = opts.cat || COL.amber;
    const tg = el('button', 'fm-toggle');
    tg.innerHTML = opts.kind === 'count' ? '+1' : opts.kind === 'timer' ? playIcon() : '';
    const mid = el('div', null, { flex: '1', minWidth: '0', position: 'relative' });
    mid.innerHTML =
      '<div class="fm-title js-title">' + opts.title + '</div>' +
      '<div class="fm-meta"><span style="color:' + dotColor + '">●</span>' +
        '<span class="js-metric" style="color:' + COL.amber + '">' + (opts.meta || '') + '</span></div>' +
      (opts.kind === 'timer' ? '<div class="fm-timerbar"><div class="js-bar"></div></div>' : '');
    const flo = el('span', 'fm-float', { right: '64px', top: '6px' });
    mid.appendChild(flo);
    const tag = el('span', 'fm-tag', null, '+' + opts.xp);
    row.append(tg, mid, tag);
    row._tg = tg; row._title = mid.querySelector('.js-title'); row._metric = mid.querySelector('.js-metric');
    row._bar = mid.querySelector('.js-bar'); row._float = flo;
    return row;
  }
  function checkSVG() { return '<svg viewBox="0 0 24 24"><path class="fm-check" d="M5 12.5 L10 17.5 L19 6.5"/></svg>'; }
  function playIcon() { return '<svg viewBox="0 0 24 24" fill="currentColor" style="width:15px;height:15px"><path d="M7 4.5v15a1 1 0 0 0 1.54.84l11-7.5a1 1 0 0 0 0-1.68l-11-7.5A1 1 0 0 0 7 4.5z"/></svg>'; }
  function pauseIcon() { return '<svg viewBox="0 0 24 24" fill="currentColor" style="width:13px;height:13px"><rect x="5" y="4" width="5" height="16" rx="1.5"/><rect x="14" y="4" width="5" height="16" rx="1.5"/></svg>'; }
  function complete(row, metricText) {
    row._tg.classList.remove('run');
    row._tg.classList.add('on');
    row._tg.innerHTML = checkSVG();
    row._title.classList.add('done');
    if (metricText != null) row._metric.textContent = metricText;
    anim(row._tg, [{ transform: 'scale(.8)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 380, easing: POP });
    sfx.tick();
    boboTada();
  }
  function floatXp(row) {
    row._float.textContent = '+20';
    anim(row._float, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(-4px)' }, { opacity: 0, transform: 'translateY(-22px)' }], { duration: 1000, easing: 'ease-out' });
  }

  /* ----------------------------- Scene 1 ----------------------------- */
  const s1 = {
    id: 's1', dur: 5600,
    vo: 'Most habit apps feel like homework. Tadapop feels like mission control.',
    caps: [{ at: 0, html: 'Most habit apps feel like <span class="hi">homework</span>.' }, { at: 3.6, html: 'Tadapop feels like <span class="hi">mission control</span>.' }],
    render(node) {
      const wrap = el('div', null, { position: 'absolute', inset: '0', display: 'grid', placeItems: 'center' });
      const box = el('div', null, { textAlign: 'center' });
      const logo = el('img', null, { width: '110px', height: '110px', borderRadius: '26px', boxShadow: '0 0 60px rgba(255,180,84,.3)' });
      logo.src = '/assets/logo.png';
      const title = el('div', 'fm-disp', { fontWeight: '900', fontSize: '60px', letterSpacing: '4px', marginTop: '22px', color: COL.ink });
      title.textContent = 'TADAPOP';
      const sub = el('div', 'fm-mono', { fontSize: '14px', letterSpacing: '.3em', color: COL.amber, marginTop: '10px' });
      sub.textContent = 'DAILY MISSIONS · STREAKS · THE ARENA';
      box.append(logo, title, sub); wrap.appendChild(box); node.appendChild(wrap);
      anim(logo, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 700, easing: POP });
      anim(title, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 600, delay: 250, fill: 'both' });
      anim(sub, [{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 600, fill: 'both' });
      after(250, () => sfx.pop());
    },
  };

  /* ----------------------------- Scene 2 ----------------------------- */
  const s2 = {
    id: 's2', dur: 12000,
    vo: 'Every morning, your missions are waiting. Tap to check one off. Count your water, your steps, your pages. Or start a timer for deep work, and lock in.',
    caps: [{ at: 0, html: 'Your missions, every morning.' }, { at: 5, html: 'Tap. Count. Time it. <span class="go">Done.</span>' }],
    render(node) {
      const c = appCol(node, 600);
      c.appendChild(header(11, 7, 40));
      const panel = el('div', 'fm-panel', { padding: '14px 16px 16px' });
      panel.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
        '<span class="fm-mono" style="font-size:12px;letter-spacing:.2em;color:' + COL.dim + '">TODAY\'S OBJECTIVES</span>' +
        '<span class="fm-mono js-count" style="font-size:13px;font-weight:700;color:' + COL.ink + '">1/4</span></div>';
      const r1 = missionRow({ title: 'Inbox to zero', meta: 'DAILY', xp: 20, kind: 'binary', cat: COL.amber });
      const r2 = missionRow({ title: 'Drink 8 glasses of water', meta: '5/8 glasses', xp: 20, kind: 'count', cat: COL.teal });
      const r3 = missionRow({ title: 'Read 20 pages', meta: '20/20 pages', xp: 10, kind: 'count', cat: COL.blue });
      const r4 = missionRow({ title: 'Deep work block — 90 min', meta: '90 MIN', xp: 30, kind: 'timer', cat: COL.amber });
      // pre-set r3 done
      complete(r3, '20/20 pages');
      panel.append(r1, r2, r4); panel.insertBefore(r3, r4);
      c.appendChild(panel);
      const count = panel.querySelector('.js-count');

      // choreograph
      after(900, () => { complete(r1); count.textContent = '2/4'; });
      // water count up 5 -> 8
      let g = 5;
      const tickWater = () => { g++; r2._metric.textContent = g + '/8 glasses'; anim(r2._tg, [{ transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 200 }); sfx.tick(); if (g < 8) after(380, tickWater); else after(150, () => { complete(r2, '8/8 glasses'); count.textContent = '3/4'; }); };
      after(2200, tickWater);
      // timer starts running, bar fills, completes
      after(5200, () => { r4._tg.classList.add('run'); r4._tg.innerHTML = pauseIcon(); r4._metric.textContent = '89:58 LEFT'; r4._metric.style.color = COL.blue; anim(r4._bar, [{ width: '0%' }, { width: '100%' }], { duration: 6000, fill: 'both', easing: 'linear' }); });
      after(11400, () => { complete(r4, '90 MIN DONE'); count.textContent = '4/4'; count.style.color = COL.go; sfx.chime(); });
    },
  };

  /* ----------------------------- Scene 3 ----------------------------- */
  const s3 = {
    id: 's3', dur: 7500,
    vo: 'Every win earns XP. Watch your level climb, and feel that little rush, every single day.',
    caps: [{ at: 0, html: 'Every win earns <span class="hi">XP</span>.' }, { at: 4.5, html: '<span class="hi">Level up.</span>' }],
    render(node) {
      const c = appCol(node, 560);
      const head = header(12, 7, 80);
      c.appendChild(head);
      const lvbar = head.querySelector('.js-lvbar'), lvLabel = head.querySelector('.js-lv'), intoLabel = head.querySelector('.js-into');
      const panel = el('div', 'fm-panel', { padding: '16px' });
      const r = missionRow({ title: 'Morning workout — 20 min', meta: '20 MIN DONE', xp: 20, kind: 'binary', cat: COL.teal });
      panel.appendChild(r); c.appendChild(panel);

      after(700, () => { complete(r, '20 MIN DONE'); floatXp(r); intoLabel.textContent = '80/100'; });
      after(1400, () => { anim(lvbar, [{ width: '80%' }, { width: '100%' }], { duration: 1100, fill: 'both', easing: 'cubic-bezier(.2,1,.3,1)' }); });
      after(2700, () => {
        // level up
        sfx.chime();
        lvLabel.textContent = 'LV.8'; lvLabel.style.color = COL.go; intoLabel.textContent = '0/100';
        anim(lvbar, [{ width: '100%' }, { width: '0%' }], { duration: 350, fill: 'both' });
        const badge = el('div', 'fm-disp', { position: 'absolute', left: '50%', top: '-6px', transform: 'translate(-50%,-50%)', fontWeight: '900', fontSize: '40px', color: COL.go, textShadow: '0 0 30px rgba(91,227,155,.7)', whiteSpace: 'nowrap' });
        badge.textContent = 'LEVEL UP!';
        c.style.position = 'relative'; c.appendChild(badge);
        anim(badge, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.6)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.1)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }], { duration: 600, easing: POP, fill: 'both' });
        after(2200, () => anim(badge, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'both' }));
      });
    },
  };

  /* ----------------------------- Scene 4 ----------------------------- */
  const s4 = {
    id: 's4', dur: 10600,
    vo: 'Clear them all, and your day is secured. Your streak grows. Life gets busy? Spend a rest day, and keep the fire alive.',
    caps: [{ at: 0, html: 'Clear the day. <span class="go">Day secured.</span>' }, { at: 5, html: 'Protect your streak with a <span class="hi">rest day</span>.' }],
    render(node) {
      const c = appCol(node, 560);
      const panel = el('div', 'fm-panel', { padding: '18px' });
      panel.innerHTML =
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">' +
          '<div class="fm-seg">' + '<i></i><i></i><i></i><i></i><i></i>'.replace(/<i>/g, '<i>') + '</div>' +
          '<span class="fm-mono js-count" style="font-size:13px;font-weight:700;color:' + COL.ink + '">2/5</span></div>';
      const segWrap = panel.querySelector('.fm-seg');
      const cleared = el('div', 'fm-cleared', { opacity: '0', marginBottom: '16px' });
      cleared.innerHTML = '<span style="width:9px;height:9px;border-radius:99px;background:' + COL.go + ';box-shadow:0 0 12px 2px rgba(91,227,155,.8)"></span> ALL OBJECTIVES CLEARED — DAY SECURED';
      panel.appendChild(cleared);
      // streak + rest day row
      const bottom = el('div', null, { display: 'flex', gap: '12px', marginTop: '4px' });
      const stat = el('div', 'fm-panel fm-stat', { textAlign: 'center' });
      stat.innerHTML = '<div class="k">CURRENT STREAK</div><div class="v js-streak">11d</div>';
      const rest = el('div', 'fm-panel', { flex: '1', padding: '16px 18px' });
      rest.innerHTML = '<div class="fm-mono" style="font-size:10px;letter-spacing:.16em;color:' + COL.faint + '">STREAK FREEZES</div>' +
        '<div style="display:flex;gap:6px;align-items:center;margin-top:10px">' +
        '<span class="js-f0" style="width:14px;height:18px;border-radius:3px;background:' + COL.blue + ';box-shadow:0 0 6px rgba(127,169,255,.6)"></span>' +
        '<span style="width:14px;height:18px;border-radius:3px;background:' + COL.blue + ';box-shadow:0 0 6px rgba(127,169,255,.6)"></span>' +
        '<span style="width:14px;height:18px;border-radius:3px;background:rgba(79,91,118,.3)"></span>' +
        '<span class="fm-mono js-rest" style="margin-left:auto;font-size:10px;color:' + COL.amber + '">USE A REST DAY →</span></div>';
      bottom.append(stat, rest); panel.appendChild(bottom);
      c.appendChild(panel);
      const segs = segWrap.querySelectorAll('i');
      segs[0].classList.add('on'); segs[1].classList.add('on');
      const count = panel.querySelector('.js-count');

      // fill remaining segments
      let k = 2;
      const fill = () => { segs[k].classList.add('on'); anim(segs[k], [{ transform: 'scaleY(.3)' }, { transform: 'scaleY(1)' }], { duration: 220, easing: POP }); sfx.tick(); k++; count.textContent = k + '/5'; if (k < 5) after(420, fill); else after(250, secured); };
      after(800, fill);
      function secured() {
        count.style.color = COL.go;
        anim(cleared, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 450, fill: 'both' });
        sfx.chime();
        after(700, () => { countUp(stat.querySelector('.js-streak'), 11, 12, 600, (v) => v + 'd'); anim(stat, [{ boxShadow: '0 0 0 0 rgba(255,180,84,0)' }, { boxShadow: '0 0 26px -4px rgba(255,180,84,.6)' }, { boxShadow: '0 0 0 0 rgba(255,180,84,0)' }], { duration: 900 }); });
      }
      // highlight rest day
      after(6800, () => { const r = rest.querySelector('.js-rest'); anim(r, [{ opacity: .4 }, { opacity: 1 }], { duration: 500, iterations: 3, direction: 'alternate' }); });
    },
  };

  /* ----------------------------- Scene 5 ----------------------------- */
  const s5 = {
    id: 's5', dur: 9000,
    vo: 'Then see the proof. A twelve-week heatmap that fills in green as you show up. Plus the numbers that actually keep you honest.',
    caps: [{ at: 0, html: 'See the <span class="go">proof</span>.' }, { at: 5, html: '12 weeks of showing up.' }],
    render(node) {
      const c = appCol(node, 560, true);
      // stat cards
      const stats = el('div', null, { display: 'flex', gap: '10px', marginBottom: '12px' });
      [['CURRENT STREAK', '12d'], ['LONGEST', '23d'], ['DAYS CLEARED', '48'], ['TOTAL XP', '1480']].forEach(([k, v]) => {
        const s = el('div', 'fm-panel fm-stat'); s.innerHTML = '<div class="k">' + k + '</div><div class="v">' + v + '</div>'; stats.appendChild(s);
      });
      c.appendChild(stats);
      // heatmap
      const hm = el('div', 'fm-panel', { padding: '16px' });
      hm.innerHTML = '<div class="fm-mono" style="font-size:11px;letter-spacing:.2em;color:' + COL.dim + ';margin-bottom:12px">CLEAR HEATMAP · 12 WEEKS</div>';
      const grid = el('div', null, { display: 'flex', gap: '4px', maxWidth: '430px', margin: '0 auto' });
      const cells = [];
      for (let w = 0; w < 12; w++) {
        const col = el('div', null, { display: 'grid', gridTemplateRows: 'repeat(7,1fr)', gap: '4px', flex: '1' });
        for (let d = 0; d < 7; d++) { const cell = el('div', 'fm-cell'); col.appendChild(cell); cells.push({ cell, w, d }); }
        grid.appendChild(col);
      }
      hm.appendChild(grid); c.appendChild(hm);
      // completion bars
      const cr = el('div', 'fm-panel', { padding: '16px', marginTop: '12px' });
      cr.innerHTML = '<div class="fm-mono" style="font-size:11px;letter-spacing:.2em;color:' + COL.dim + ';margin-bottom:12px">COMPLETION RATE · LAST 30 DAYS</div>';
      [['Drink 8 glasses of water', 92, COL.teal], ['Deep work block', 78, COL.amber], ['Meditate 10 minutes', 84, COL.blue]].forEach(([t, pct, col]) => {
        const row = el('div', null, { marginBottom: '9px' });
        row.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:5px">' +
          '<span class="fm-disp" style="font-size:14px">' + t + '</span><span class="fm-mono" style="font-size:12px">' + pct + '%</span></div>' +
          '<div style="height:7px;border-radius:4px;background:rgba(79,91,118,.22);overflow:hidden"><div class="js-pb" data-pct="' + pct + '" style="height:100%;width:0%;background:' + col + ';opacity:.85;border-radius:4px"></div></div>';
        cr.appendChild(row);
      });
      c.appendChild(cr);

      // animate cells filling green (deterministic-ish pattern, increasing density)
      const greens = ['rgba(91,227,155,.28)', 'rgba(91,227,155,.55)', COL.go];
      cells.forEach((o, i) => {
        const seed = (o.w * 7 + o.d);
        const density = 0.35 + (o.w / 12) * 0.6;             // ramps up over weeks
        const on = ((seed * 53) % 100) / 100 < density;
        if (!on) return;
        const lvl = (seed % 7 === 0) ? 2 : (seed % 3 === 0) ? 1 : 0;
        after(300 + o.w * 90 + ((o.d * 37) % 80), () => {
          o.cell.style.background = greens[lvl];
          if (lvl === 2) o.cell.style.boxShadow = '0 0 8px -1px rgba(91,227,155,.6)';
          anim(o.cell, [{ transform: 'scale(.4)', opacity: .3 }, { transform: 'scale(1)', opacity: 1 }], { duration: 260, easing: POP });
        });
      });
      after(5200, () => { cr.querySelectorAll('.js-pb').forEach((b) => anim(b, [{ width: '0%' }, { width: b.dataset.pct + '%' }], { duration: 900, fill: 'both', easing: 'cubic-bezier(.2,1,.3,1)' })); });
    },
  };

  /* ----------------------------- Scene 6 ----------------------------- */
  const s6 = {
    id: 's6', dur: 6200,
    vo: "But the real magic? You don't have to do it alone. Step into the Arena.",
    caps: [{ at: 0, html: "You don't have to do it alone." }, { at: 4, html: 'Step into the <span class="hi">Arena</span>.' }],
    render(node) {
      const c = appCol(node, 560);
      // tabs
      const tabs = el('div', 'fm-panel', { padding: '6px', marginBottom: '14px', display: 'flex', gap: '6px' });
      ['TODAY', 'STATS', 'ARENA', 'SETTINGS'].forEach((t) => {
        const b = el('div', 'fm-mono', { flex: '1', textAlign: 'center', padding: '10px 4px', fontSize: '12px', letterSpacing: '.12em', color: t === 'ARENA' ? COL.ink : COL.faint, borderBottom: '2px solid ' + (t === 'ARENA' ? COL.amber : 'transparent') });
        b.textContent = t; tabs.appendChild(b);
      });
      c.appendChild(tabs);
      const convene = el('button', 'fm-disp', { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', cursor: 'default', marginBottom: '14px', fontWeight: '700', fontSize: '14px', letterSpacing: '.06em', color: '#1a1206', background: 'linear-gradient(180deg,' + COL.amber + ',' + COL.amberDeep + ')', boxShadow: '0 8px 24px -8px rgba(255,180,84,.6)' });
      convene.textContent = '⚑ CONVENE A CHALLENGE';
      c.appendChild(convene);
      const card = el('div', 'fm-panel', { padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' });
      card.innerHTML = '<div style="display:flex;align-items:center;gap:12px">' +
        '<span style="font-size:26px">💧</span><div>' +
        '<div class="fm-disp" style="font-weight:700;font-size:17px">Hydration Challenge</div>' +
        '<div class="fm-mono" style="font-size:10px;color:' + COL.dim + ';margin-top:3px">8 GLASSES EACH DAY · 7 DAYS · 4 PLAYERS</div></div></div>' +
        '<span class="fm-tag" style="color:' + COL.go + ';border-color:' + COL.go + '">LIVE</span>';
      c.appendChild(card);
      anim(tabs.children[2], [{ opacity: .4 }, { opacity: 1 }], { duration: 500, fill: 'both' });
      anim(convene, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 500, delay: 400, fill: 'both', easing: POP });
      anim(card, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 550, delay: 900, fill: 'both', easing: POP });
      after(900, () => sfx.pop());
    },
  };

  /* ----------------------------- Scene 7 ----------------------------- */
  const s7 = {
    id: 's7', dur: 11000,
    vo: 'Invite your friends, pick a challenge, set the days, and compete, live. Climb the leaderboard, drop proof photos, and talk a little trash.',
    caps: [{ at: 0, html: 'Invite friends. Compete <span class="go">live</span>.' }, { at: 6, html: 'Climb the <span class="hi">leaderboard</span>.' }],
    render(node) {
      const c = appCol(node, 580);
      const hdr = el('div', 'fm-panel', { padding: '16px 18px', marginBottom: '12px' });
      hdr.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between">' +
        '<div style="display:flex;align-items:center;gap:10px"><span style="font-size:22px">💧</span>' +
        '<span class="fm-disp" style="font-weight:700;font-size:18px">Hydration Challenge</span></div>' +
        '<span class="fm-tag" style="color:' + COL.go + ';border-color:' + COL.go + '">LIVE · DAY 3/7</span></div>';
      c.appendChild(hdr);
      const board = el('div', 'fm-panel', { padding: '14px 16px' });
      board.innerHTML = '<div class="fm-mono" style="font-size:11px;letter-spacing:.18em;color:' + COL.dim + ';margin-bottom:8px">LEADERBOARD · MOST DAYS COMPLETED</div>';
      // initial order: Aria 1, You 2, Kenji 3, Noor 4
      const data = [
        { name: 'Aria K.', me: false, score: 3, today: 'done' },
        { name: 'You', me: true, score: 2, today: '5/8 TODAY' },
        { name: 'Kenji T.', me: false, score: 2, today: '3/8 TODAY' },
        { name: 'Noor A.', me: false, score: 1, today: 'PENDING' },
      ];
      const rows = data.map((p, i) => {
        const row = el('div', 'fm-lb-row' + (p.me ? ' me' : ''));
        row.style.position = 'relative';
        row.innerHTML =
          '<span class="fm-rank' + (i === 0 ? ' lead' : '') + '">' + (i + 1) + '</span>' +
          '<span class="fm-ava' + (p.me ? ' me' : '') + '">' + p.name[0] + '</span>' +
          '<div style="flex:1;min-width:0"><div class="fm-lb-name">' + p.name + '</div>' +
          '<div class="fm-lb-sub' + (p.today === 'done' ? ' done' : '') + '">' + (p.today === 'done' ? '✓ DONE TODAY · 📷 PROOF' : p.today) + '</div></div>' +
          '<span class="fm-lb-score' + (i === 0 ? ' lead' : '') + '">' + p.score + '</span>' +
          '<span class="fm-mono" style="font-size:9px;color:' + COL.faint + ';width:34px">DAYS</span>';
        board.appendChild(row);
        row._rank = row.querySelector('.fm-rank'); row._sub = row.querySelector('.fm-lb-sub'); row._score = row.querySelector('.fm-lb-score');
        return row;
      });
      c.appendChild(board);

      // friends log in
      after(1400, () => { rows[2]._sub.textContent = '✓ DONE TODAY'; rows[2]._sub.classList.add('done'); anim(rows[2], [{ background: 'rgba(91,227,155,.16)' }, { background: 'transparent' }], { duration: 900 }); sfx.tick(); });
      after(2600, () => { rows[3]._sub.textContent = '6/8 TODAY'; sfx.tick(); });
      // you log + finish today, score 2->3, rise to #1
      after(4200, () => { rows[1]._sub.textContent = '✓ DONE TODAY · 📷 PROOF'; rows[1]._sub.classList.add('done'); rows[1]._score.textContent = '3'; anim(rows[1]._score, [{ transform: 'scale(1.5)', color: COL.go }, { transform: 'scale(1)' }], { duration: 500, easing: POP }); sfx.pop(); });
      after(5400, () => {
        // FLIP swap: You (row index 1) moves up past Aria (row index 0).
        // Use offsetTop (unscaled layout px) — the stage is CSS-scaled, so
        // getBoundingClientRect would return scaled distances and break the swap.
        const H = rows[1].offsetTop - rows[0].offsetTop; // positive
        anim(rows[1], [{ transform: 'translateY(0)' }, { transform: 'translateY(' + (-H) + 'px)' }], { duration: 650, fill: 'both', easing: 'cubic-bezier(.3,1.1,.3,1)' });
        anim(rows[0], [{ transform: 'translateY(0)' }, { transform: 'translateY(' + (H) + 'px)' }], { duration: 650, fill: 'both', easing: 'cubic-bezier(.3,1.1,.3,1)' });
        sfx.chime();
        after(720, () => {
          rows[1]._rank.textContent = '1'; rows[1]._rank.classList.add('lead'); rows[1]._score.classList.add('lead');
          rows[0]._rank.textContent = '2'; rows[0]._rank.classList.remove('lead'); rows[0]._score.classList.remove('lead');
          anim(rows[1], [{ boxShadow: '0 0 0 0 rgba(255,180,84,0)' }, { boxShadow: '0 0 26px -2px rgba(255,180,84,.55)' }, { boxShadow: '0 0 0 0 rgba(255,180,84,0)' }], { duration: 1100 });
          const crown = el('span', null, { position: 'absolute', left: '8px', top: '-14px', fontSize: '20px' });
          crown.textContent = '👑'; rows[1].appendChild(crown);
          anim(crown, [{ opacity: 0, transform: 'translateY(8px) rotate(-20deg)' }, { opacity: 1, transform: 'translateY(0) rotate(0)' }], { duration: 500, easing: POP, fill: 'both' });
        });
      });
    },
  };

  /* ----------------------------- Scene 8 ----------------------------- */
  const s8 = {
    id: 's8', dur: 7200,
    vo: 'Win together. Lose together. Get better — together.',
    caps: [{ at: 0, html: 'Get better — <span class="hi">together</span>.' }],
    render(node) {
      const c = appCol(node, 560);
      const win = el('div', 'fm-panel', { padding: '24px', textAlign: 'center', marginBottom: '14px', position: 'relative', overflow: 'hidden' });
      win.innerHTML = '<div style="font-size:46px;margin-bottom:6px">🏆</div>' +
        '<div class="fm-mono" style="font-size:10px;letter-spacing:.22em;color:' + COL.faint + ';margin-bottom:8px">💧 HYDRATION CHALLENGE · 7 DAYS</div>' +
        '<div class="fm-disp" style="font-weight:900;font-size:28px;color:' + COL.amber + '">You — that\'s you!</div>' +
        '<div class="fm-mono" style="font-size:12px;color:' + COL.dim + ';margin-top:6px">7 DAYS · MOST DAYS COMPLETED</div>';
      c.appendChild(win);
      // podium standings
      const board = el('div', 'fm-panel', { padding: '16px' });
      board.innerHTML = '<div class="fm-mono" style="font-size:11px;letter-spacing:.18em;color:' + COL.dim + ';margin-bottom:10px">FINAL STANDINGS</div>';
      [['🥇', 'You', '7'], ['🥈', 'Aria K.', '6'], ['🥉', 'Kenji T.', '5'], ['', 'Noor A.', '4']].forEach(([m, n, s], i) => {
        const row = el('div', 'fm-lb-row' + (i === 0 ? ' me' : ''));
        row.innerHTML = '<span style="font-size:18px;width:28px;text-align:center">' + m + '</span>' +
          '<span class="fm-disp" style="flex:1;font-size:15px;font-weight:' + (i === 0 ? '700' : '500') + '">' + n + '</span>' +
          '<span class="fm-mono" style="font-size:14px;font-weight:700">' + s + ' <span style="color:' + COL.faint + ';font-size:9px">DAYS</span></span>';
        board.appendChild(row);
      });
      c.appendChild(board);
      anim(win, [{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 600, easing: POP, fill: 'both' });
      after(150, () => { sfx.win(); confetti(win); });
    },
  };

  function confetti(host) {
    const cols = [COL.amber, COL.blue, COL.go, COL.red, COL.violet];
    for (let i = 0; i < 30; i++) {
      const p = el('div', 'fm-conf', { left: '50%', top: '40%', background: cols[i % cols.length], borderRadius: i % 3 ? '50%' : '2px' });
      host.appendChild(p);
      const ang = (i / 30) * Math.PI * 2 + (i % 5);
      const dist = 120 + (i % 6) * 28;
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist + 60;
      anim(p, [
        { transform: 'translate(0,0) scale(0)', opacity: 1, offset: 0 },
        { transform: 'translate(' + (dx * 0.4) + 'px,' + (dy * 0.3) + 'px) scale(1)', opacity: 1, offset: 0.25 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + (i * 40) + 'deg) scale(.5)', opacity: 0, offset: 1 },
      ], { duration: 1600 + (i % 5) * 120, easing: 'cubic-bezier(.15,.6,.3,1)', fill: 'both' });
    }
  }

  /* ----------------------------- Scene 9 ----------------------------- */
  const s9 = {
    id: 's9', dur: 10600,
    vo: "Tadapop. Track your progress, challenge your friends, and actually become who you said you'd be. Join the waitlist — your first mission starts now.",
    caps: [{ at: 0, html: '<span class="hi">Tadapop.</span>' }, { at: 6.5, html: 'Your first mission starts now.' }],
    render(node) {
      const wrap = el('div', null, { position: 'absolute', inset: '0', display: 'grid', placeItems: 'center' });
      const box = el('div', null, { textAlign: 'center' });
      const logo = el('img', null, { width: '96px', height: '96px', borderRadius: '22px', boxShadow: '0 0 60px rgba(255,180,84,.3)' });
      logo.src = '/assets/logo.png';
      const title = el('div', 'fm-disp', { fontWeight: '900', fontSize: '40px', letterSpacing: '2px', marginTop: '20px' });
      title.innerHTML = 'Track. Compete. <span style="color:' + COL.amber + '">Become.</span>';
      const cta = el('div', 'fm-disp', { display: 'inline-block', marginTop: '24px', padding: '14px 28px', borderRadius: '10px', background: COL.amber, color: '#1a1205', fontWeight: '700', letterSpacing: '1px', fontSize: '15px' });
      cta.textContent = 'Join the waitlist →';
      box.append(logo, title, cta); wrap.appendChild(box); node.appendChild(wrap);
      anim(logo, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 600, easing: POP, fill: 'both' });
      anim(title, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 600, delay: 250, fill: 'both' });
      anim(cta, [{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 500, delay: 700, easing: POP, fill: 'both' });
      after(250, () => sfx.pop());
      after(1300, () => sfx.chime());
    },
  };

  return [s1, s2, s3, s4, s5, s6, s7, s8, s9];
}
