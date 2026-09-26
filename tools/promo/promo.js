/* Tadapop social promo — 9:16, ~28s, captions + music, no voiceover.
   Story: alone I quit by day 3 → I bet my friends → one challenge, everyone
   in → check in with proof → the leaderboard → day 30, nobody quit → Tadapop.

   Scenes are pure functions of time: build(node) draws once and returns
   update(lt), which sets every style from the scene-local time lt (seconds).
   window.__promo.seek(t) is what render.mjs drives. */
(function () {
  'use strict';
  const LANG = /[?&]lang=zh/.test(location.search) ? 'zh' : 'en';
  document.documentElement.lang = LANG === 'zh' ? 'zh-Hant' : 'en';

  const COPY = {
    en: {
      s1a: 'Day 3 of my<br>new habit…',
      s1b: '…and I already <b>quit.</b>',
      streak: 'STREAK',
      s2: 'So I made it a <b>bet</b><br>with my friends.',
      crew: 'the gym crew',
      m1: '30 days. Every day.<br>No photo, it didn’t happen.',
      m2: 'I’m in 💪',
      m3: 'in. loser buys dinner 🍜',
      m4: 'deal 😤',
      s3: 'One challenge.<br><b>Everyone’s in.</b>',
      chName: '30-Day Move',
      chMeta: 'EVERY DAY · 30 DAYS',
      chProof: 'PHOTO PROOF',
      joined: (n) => n + ' JOINED',
      code: 'INVITE CODE',
      s4: 'Check in every day.<br><b>With proof.</b>',
      day12: 'DAY 12',
      checkIn: 'Check in',
      checked: '✓ Checked in',
      s5: 'Everyone sees<br><b>who showed up.</b>',
      board: 'LEADERBOARD · DAY 12',
      unit: 'days',
      s6a: 'Day 30.',
      s6b: '<b>Nobody quit.</b>',
      s6c: 'Turns out I don’t skip<br>when my friends are watching.',
      tag: 'Habit challenges<br>with friends',
      free: 'Free on iPhone &amp; Android',
      you: 'You', a: 'Mia', b: 'Leo', c: 'Sam',
    },
    zh: {
      s1a: '新習慣<br>第 3 天…',
      s1b: '…我就<b>放棄了。</b>',
      streak: '連續天數',
      s2: '所以我跟朋友<br><b>打了個賭。</b>',
      crew: '健身小組',
      m1: '30 天，每天都要做。<br>沒拍照就不算！',
      m2: '我加入 💪',
      m3: '+1，輸的請吃飯 🍜',
      m4: '來啊 😤',
      s3: '開一個挑戰，<br><b>大家都加入。</b>',
      chName: '30 天動起來',
      chMeta: '每天 · 30 天',
      chProof: '需附照片',
      joined: (n) => n + ' 人已加入',
      code: '邀請碼',
      s4: '每天打卡，<br><b>附上證明。</b>',
      day12: '第 12 天',
      checkIn: '打卡',
      checked: '✓ 已打卡',
      s5: '誰有做到，<br><b>大家都看得到。</b>',
      board: '排行榜 · 第 12 天',
      unit: '天',
      s6a: '第 30 天。',
      s6b: '<b>沒有人放棄。</b>',
      s6c: '原來朋友在看的時候，<br>我就不會偷懶。',
      tag: '揪朋友一起的<br>習慣挑戰',
      free: 'iPhone 與 Android 免費下載',
      you: '我', a: '小美', b: '阿傑', c: '小安',
    },
  }[LANG];

  const COL = {
    void: '#0B0E17', panel: '#141A29', panel2: '#1A2233', line: '#26304a',
    ink: '#E8ECF5', dim: '#7C8AA5', faint: '#4F5B76', amber: '#FFB454', amberDeep: '#E8922E',
    go: '#5BE39B', goDeep: '#2FB979', blue: '#7FA9FF', red: '#FF9A7C', violet: '#C9A6FF',
  };
  const PEOPLE = {
    you: { name: COPY.you, col: COL.blue },
    a: { name: COPY.a, col: COL.go },
    b: { name: COPY.b, col: COL.violet },
    c: { name: COPY.c, col: COL.red },
  };

  /* ------------------------------ helpers ------------------------------ */
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const E = {
    out: (t) => 1 - Math.pow(1 - t, 3),
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    back: (t) => { const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  };
  const prog = (lt, at, dur, e) => (e || E.out)(clamp((lt - at) / dur));

  function el(tag, cls, css, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (css) Object.assign(e.style, css);
    if (html != null) e.innerHTML = html;
    return e;
  }
  /* Fade + rise + springy scale in from `at`. */
  function show(n, lt, at, o) {
    o = o || {};
    const dy = o.dy != null ? o.dy : 16, s = o.s != null ? o.s : 0.92, dur = o.dur || 0.45, x = o.x || 0;
    const a = clamp((lt - at) / 0.16);
    const k = E.back(clamp((lt - at) / dur));
    n.style.opacity = a;
    n.style.transform = 'translate(' + (x * (1 - k)).toFixed(2) + 'px,' + (dy * (1 - k)).toFixed(2) + 'px) scale(' + (s + (1 - s) * k).toFixed(4) + ')';
  }
  function cap(node, html, top) {
    const c = el('div', 'cap', top != null ? { top: top + 'px' } : null, html);
    node.appendChild(c);
    return c;
  }
  function ava(p, size) {
    const a = el('div', 'ava', { background: p.col }, LANG === 'zh' ? p.name.slice(-1) : p.name[0]);
    if (size) Object.assign(a.style, { width: size + 'px', height: size + 'px', fontSize: Math.round(size * 0.4) + 'px' });
    return a;
  }
  /* Deterministic confetti: every particle's path is a function of its index. */
  function confetti(node, cx, cy, n) {
    const cols = [COL.amber, COL.blue, COL.go, COL.red, COL.violet];
    const ps = [];
    for (let i = 0; i < n; i++) {
      const p = el('div', 'conf', { background: cols[i % cols.length], borderRadius: i % 3 ? '50%' : '2px', left: cx + 'px', top: cy + 'px', opacity: 0 });
      node.appendChild(p);
      const ang = (i / n) * Math.PI * 2 + (i % 7) * 0.37;
      const v = 150 + (i % 6) * 38;
      ps.push({ p, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v - 120, spin: (i % 2 ? 1 : -1) * (200 + i * 17), life: 1.5 + (i % 5) * 0.12 });
    }
    return function (lt, at) {
      const t = lt - at;
      ps.forEach((q) => {
        if (t < 0) { q.p.style.opacity = 0; return; }
        const x = q.vx * t, y = q.vy * t + 260 * t * t;
        q.p.style.opacity = clamp(1 - t / q.life);
        q.p.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + (q.spin * t).toFixed(0) + 'deg)';
      });
    };
  }

  /* ------------------------------- scenes ------------------------------ */

  /* 1 · the hook: alone, the streak dies on day 3 */
  const s1 = {
    dur: 3.4,
    build(node) {
      const a = cap(node, COPY.s1a, 96);
      a.style.fontSize = LANG === 'zh' ? '34px' : '35px';
      const box = el('div', 'panel', { position: 'absolute', left: '90px', right: '90px', top: '250px', height: '150px', display: 'grid', placeItems: 'center', textAlign: 'center' });
      box.innerHTML = '<div><div class="mono" style="font-size:11px;letter-spacing:.2em;color:' + COL.dim + '">🔥 ' + COPY.streak + '</div>' +
        '<div class="mono js-n" style="font-size:78px;font-weight:600;line-height:1;margin-top:8px;color:' + COL.amber + '">3</div></div>';
      node.appendChild(box);
      const num = box.querySelector('.js-n');
      const melt = el('div', null, { position: 'absolute', left: '0', right: '0', top: '410px', textAlign: 'center', fontSize: '64px' }, '🫠');
      node.appendChild(melt);
      const b = cap(node, COPY.s1b, 500);
      return (lt) => {
        show(a, lt, 0.05, { dy: 20 });
        show(box, lt, 0.35, { s: 0.8 });
        // the count ticks 1 → 2 → 3, then the streak goes quiet: no red, no
        // shame — the number just fades out of the amber.
        num.textContent = lt < 0.55 ? '1' : lt < 0.8 ? '2' : '3';
        const fall = prog(lt, 1.55, 0.6);
        num.style.color = fall > 0.5 ? COL.faint : COL.amber;
        num.style.textShadow = fall > 0.5 ? 'none' : '0 0 24px rgba(255,180,84,.55)';
        box.style.transform += ' rotate(' + (-7 * fall).toFixed(2) + 'deg) translateY(' + (10 * fall).toFixed(1) + 'px)';
        show(melt, lt, 1.75, { dy: 30, s: 0.4, dur: 0.55 });
        show(b, lt, 1.45, { dy: 18 });
      };
    },
  };

  /* 2 · the bet, in the group chat */
  const s2 = {
    dur: 4.0,
    build(node) {
      const c = cap(node, COPY.s2);
      const chat = el('div', 'panel', { position: 'absolute', left: '22px', right: '22px', top: '196px', padding: '12px 12px 14px' });
      const head = el('div', null, { display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', marginBottom: '10px', borderBottom: '1px solid ' + COL.line });
      const avs = el('div', null, { display: 'flex' });
      ['you', 'a', 'b', 'c'].forEach((k, i) => { const a = ava(PEOPLE[k], 22); a.style.marginLeft = i ? '-6px' : '0'; a.style.border = '2px solid ' + COL.panel; avs.appendChild(a); });
      head.append(avs, el('div', 'disp', { fontWeight: '700', fontSize: '14px' }, COPY.crew), el('div', 'mono', { marginLeft: 'auto', fontSize: '10px', color: COL.faint }, '4'));
      chat.appendChild(head);
      const list = el('div', null, { display: 'flex', flexDirection: 'column', gap: '8px' });
      const msgs = [
        { k: 'you', html: COPY.m1 },
        { k: 'a', html: COPY.m2 },
        { k: 'b', html: COPY.m3 },
        { k: 'c', html: COPY.m4 },
      ].map((m) => {
        const me = m.k === 'you';
        const b = el('div', 'bubble' + (me ? ' me' : ''), me ? null : { alignSelf: 'flex-start' },
          (me ? '' : '<span class="who" style="color:' + PEOPLE[m.k].col + '">' + PEOPLE[m.k].name + '</span>') + m.html);
        b.style.transformOrigin = me ? '100% 100%' : '0 100%';
        list.appendChild(b);
        return b;
      });
      chat.appendChild(list);
      node.appendChild(chat);
      return (lt) => {
        show(c, lt, 0.05);
        show(chat, lt, 0.3, { dy: 24, s: 0.96 });
        msgs.forEach((m, i) => show(m, lt, 0.75 + i * 0.62, { dy: 12, s: 0.7, dur: 0.4 }));
      };
    },
  };

  /* 3 · one challenge, everyone joins */
  const s3 = {
    dur: 4.0,
    build(node) {
      const c = cap(node, COPY.s3);
      const card = el('div', 'panel', { position: 'absolute', left: '22px', right: '22px', top: '200px', padding: '18px' });
      card.innerHTML =
        '<div style="display:flex;align-items:center;gap:12px">' +
        '<div style="width:46px;height:46px;border-radius:12px;background:' + COL.panel2 + ';border:1px solid ' + COL.line + ';display:grid;place-items:center;font-size:24px">🏃</div>' +
        '<div><div class="disp" style="font-weight:900;font-size:21px">' + COPY.chName + '</div>' +
        '<div style="display:flex;gap:6px;margin-top:7px;flex-wrap:wrap"><span class="tag" style="white-space:nowrap">' + COPY.chMeta + '</span>' +
        '<span class="tag" style="white-space:nowrap;color:' + COL.amber + ';border-color:rgba(255,180,84,.45)">📷 ' + COPY.chProof + '</span></div></div></div>' +
        '<div style="height:1px;background:' + COL.line + ';margin:16px 0"></div>' +
        '<div class="mono js-count" style="font-size:11px;letter-spacing:.16em;color:' + COL.go + ';margin-bottom:12px"></div>';
      const row = el('div', null, { display: 'flex', justifyContent: 'space-between', padding: '0 4px' });
      const people = ['you', 'a', 'b', 'c'].map((k) => {
        const w = el('div', null, { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '62px' });
        w.append(ava(PEOPLE[k], 50), el('div', null, { fontSize: '12px', color: COL.dim, fontWeight: '500' }, PEOPLE[k].name));
        row.appendChild(w);
        return w;
      });
      card.appendChild(row);
      const code = el('div', null, { marginTop: '18px', padding: '12px 14px', borderRadius: '12px', background: COL.void, border: '1px dashed ' + COL.line, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        '<span class="mono" style="font-size:10px;letter-spacing:.16em;color:' + COL.faint + '">' + COPY.code + '</span>' +
        '<span class="mono" style="font-size:18px;font-weight:600;letter-spacing:.2em;color:' + COL.amber + '">K7Q2MX</span>');
      card.appendChild(code);
      node.appendChild(card);
      const count = card.querySelector('.js-count');
      const at = [0.7, 1.1, 1.5, 1.9];
      return (lt) => {
        show(c, lt, 0.05);
        show(card, lt, 0.25, { dy: 24, s: 0.95 });
        people.forEach((p, i) => show(p, lt, at[i], { dy: 0, s: 0.3, dur: 0.45 }));
        const n = at.filter((x) => lt >= x).length;
        count.textContent = COPY.joined(Math.max(1, n));
        show(code, lt, 2.3, { dy: 10 });
      };
    },
  };

  /* 4 · the daily check-in, with a photo */
  const s4 = {
    dur: 4.2,
    build(node) {
      const c = cap(node, COPY.s4);
      const card = el('div', 'panel', { position: 'absolute', left: '40px', right: '40px', top: '196px', padding: '12px', overflow: 'hidden' });
      card.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;margin:2px 4px 10px">' +
        '<span class="disp" style="font-weight:700;font-size:14px">🏃 ' + COPY.chName + '</span>' +
        '<span class="mono" style="font-size:10px;letter-spacing:.14em;color:' + COL.dim + '">' + COPY.day12 + '</span></div>';
      const frame = el('div', null, { position: 'relative', height: '252px', borderRadius: '12px', overflow: 'hidden', background: COL.panel2 });
      const img = el('img', null, { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover' });
      img.src = '/assets/proof/gym.jpg';
      const flash = el('div', null, { position: 'absolute', inset: '0', background: '#fff', opacity: 0 });
      frame.append(img, flash);
      card.appendChild(frame);
      const btn = el('div', 'btn', { marginTop: '12px' });
      card.appendChild(btn);
      node.appendChild(card);
      const reacts = ['🔥', '💪', '👏'].map((e, i) => {
        const r = el('div', null, { position: 'absolute', right: (34 + i * 38) + 'px', top: '470px', width: '44px', height: '44px', borderRadius: '50%', background: COL.panel2, border: '1px solid ' + COL.line, display: 'grid', placeItems: 'center', fontSize: '22px' }, e);
        node.appendChild(r);
        return r;
      });
      return (lt) => {
        show(c, lt, 0.05);
        show(card, lt, 0.25, { dy: 24, s: 0.95 });
        // the shutter: photo fades in behind a white flash
        img.style.opacity = lt < 0.85 ? 0 : 1;
        flash.style.opacity = lt < 0.8 ? 0 : clamp(1 - (lt - 0.8) / 0.35);
        img.style.transform = 'scale(' + (1.12 - 0.12 * prog(lt, 0.85, 1.4)).toFixed(4) + ')';
        const done = lt >= 1.95;
        const press = lt > 1.7 && lt < 1.95 ? 0.95 : 1;
        btn.textContent = done ? COPY.checked : COPY.checkIn;
        btn.style.background = done ? COL.go : COL.amber;
        btn.style.color = '#0b1a10';
        const bounce = done ? 1 + 0.06 * Math.sin(clamp((lt - 1.95) / 0.35) * Math.PI) : press;
        btn.style.transform = 'scale(' + bounce.toFixed(4) + ')';
        btn.style.boxShadow = done ? '0 0 30px -4px rgba(91,227,155,' + (0.6 * (1 - prog(lt, 1.95, 1.2))).toFixed(3) + ')' : 'none';
        reacts.forEach((r, i) => {
          show(r, lt, 2.4 + i * 0.3, { dy: 26, s: 0.3, dur: 0.5 });
          const rise = prog(lt, 2.4 + i * 0.3, 1.4);
          r.style.transform += ' translateY(' + (-14 * rise).toFixed(1) + 'px)';
        });
      };
    },
  };

  /* 5 · the leaderboard: you finish today and take first */
  const s5 = {
    dur: 4.2,
    build(node) {
      const c = cap(node, COPY.s5);
      const board = el('div', 'panel', { position: 'absolute', left: '22px', right: '22px', top: '200px', height: '290px' });
      board.appendChild(el('div', 'mono', { position: 'absolute', left: '18px', top: '16px', fontSize: '10.5px', letterSpacing: '.16em', color: COL.dim }, COPY.board));
      const data = [
        { k: 'a', n: 11, to: 11 },
        { k: 'you', n: 11, to: 12 },
        { k: 'b', n: 9, to: 10 },
        { k: 'c', n: 9, to: 9 },
      ];
      const rows = data.map((d, i) => {
        const p = PEOPLE[d.k];
        const r = el('div', 'row' + (d.k === 'you' ? ' me' : ''));
        const rank = el('span', 'rank', null, String(i + 1));
        const num = el('span', 'mono', { fontWeight: '600', fontSize: '20px' }, String(d.n));
        const right = el('div', null, { marginLeft: 'auto', display: 'flex', alignItems: 'baseline', gap: '5px' });
        right.append(num, el('span', 'mono', { fontSize: '10px', color: COL.faint }, COPY.unit));
        r.append(rank, ava(p, 34), el('div', null, { fontWeight: d.k === 'you' ? '700' : '500', fontSize: '15px' }, p.name), right);
        board.appendChild(r);
        return { r, rank, num, d };
      });
      const crown = el('div', null, { position: 'absolute', fontSize: '22px', left: '52px', top: '0', opacity: 0 }, '👑');
      board.appendChild(crown);
      node.appendChild(board);
      const Y0 = 46, H = 58;
      return (lt) => {
        show(c, lt, 0.05);
        show(board, lt, 0.25, { dy: 24, s: 0.95 });
        const swap = prog(lt, 1.75, 0.55, E.inOut);
        rows.forEach((o, i) => {
          show(o.r, lt, 0.45 + i * 0.1, { dy: 10, s: 1, x: 0 });
          let slot = i;
          if (i === 0) slot = swap;       // Mia: 0 → 1
          if (i === 1) slot = 1 - swap;   // you: 1 → 0
          o.r.style.top = (Y0 + slot * H).toFixed(1) + 'px';
          o.r.style.zIndex = i === 1 ? 2 : 1;
          const tick = o.d.k === 'b' ? 0.95 : 1.3;
          const ticked = o.d.to !== o.d.n && lt >= tick;
          o.num.textContent = String(ticked ? o.d.to : o.d.n);
          o.num.style.color = ticked ? COL.go : COL.ink;
          const pop = ticked ? 1 + 0.35 * Math.sin(clamp((lt - tick) / 0.3) * Math.PI) : 1;
          o.num.style.display = 'inline-block';
          o.num.style.transform = 'scale(' + pop.toFixed(3) + ')';
        });
        const settled = lt >= 2.3;
        rows[0].rank.textContent = settled ? '2' : '1';
        rows[1].rank.textContent = settled ? '1' : '2';
        rows[1].rank.style.color = settled ? COL.amber : COL.faint;
        rows[0].rank.style.color = settled ? COL.faint : COL.amber;
        rows[1].r.style.boxShadow = 'inset 0 0 0 1px rgba(255,180,84,.35), 0 0 ' + (30 * (1 - prog(lt, 2.3, 1.2))).toFixed(1) + 'px -4px rgba(255,180,84,' + (settled ? 0.7 : 0) + ')';
        show(crown, lt, 2.35, { dy: 10, s: 0.4, dur: 0.5 });
        crown.style.top = (Y0 - 14) + 'px';
        crown.style.transform += ' rotate(-14deg)';
      };
    },
  };

  /* 6 · day 30, nobody quit */
  const s6 = {
    dur: 3.8,
    build(node) {
      const a = el('div', LANG === 'zh' ? 'disp' : 'mono', { position: 'absolute', left: '0', right: '0', top: '120px', textAlign: 'center', fontSize: LANG === 'zh' ? '42px' : '46px', fontWeight: LANG === 'zh' ? '800' : '600', color: COL.amber, textShadow: '0 0 30px rgba(255,180,84,.45)' }, COPY.s6a);
      const cup = el('div', null, { position: 'absolute', left: '0', right: '0', top: '200px', textAlign: 'center', fontSize: '96px' }, '🏆');
      const b = cap(node, COPY.s6b, 338);
      b.style.fontSize = '36px';
      const sub = el('div', null, { position: 'absolute', left: '30px', right: '30px', top: '410px', textAlign: 'center', fontSize: '17px', lineHeight: '1.45', color: COL.dim }, COPY.s6c);
      const burst = el('div', null, { position: 'absolute', inset: '0', pointerEvents: 'none' });
      const conf = confetti(burst, 176, 250, 42);
      node.append(a, cup, sub, burst);
      return (lt) => {
        show(a, lt, 0.05, { dy: 14 });
        show(cup, lt, 0.4, { dy: 30, s: 0.3, dur: 0.6 });
        conf(lt, 0.55);
        show(b, lt, 0.85);
        show(sub, lt, 1.5, { dy: 10, s: 1 });
      };
    },
  };

  /* 7 · end card */
  const s7 = {
    dur: 4.2,
    last: true,
    build(node) {
      const box = el('div', null, { position: 'absolute', left: '0', right: '0', top: '150px', textAlign: 'center' });
      const logo = el('img', null, { width: '104px', height: '104px', borderRadius: '24px', boxShadow: '0 0 70px rgba(255,180,84,.35)' });
      logo.src = '/assets/logo.png';
      const name = el('div', 'disp', { fontWeight: '900', fontSize: '42px', letterSpacing: '1px', marginTop: '20px' }, 'Tada<span style="color:' + COL.amber + '">pop</span>');
      const tag = el('div', 'disp', { fontWeight: '700', fontSize: '22px', lineHeight: '1.3', marginTop: '14px', color: COL.ink }, COPY.tag);
      const pill = el('div', null, { display: 'inline-block', marginTop: '28px', padding: '13px 22px', borderRadius: '999px', background: COL.amber, color: '#1a1205', fontWeight: '700', fontSize: '15px' }, COPY.free);
      const url = el('div', 'mono', { marginTop: '16px', fontSize: '14px', letterSpacing: '.12em', color: COL.dim }, 'tadapop.app');
      box.append(logo, name, tag, pill, url);
      node.appendChild(box);
      return (lt) => {
        show(logo, lt, 0.05, { dy: 0, s: 0.5, dur: 0.6 });
        show(name, lt, 0.35);
        show(tag, lt, 0.6);
        show(pill, lt, 0.95, { dy: 0, s: 0.75 });
        show(url, lt, 1.2, { dy: 8, s: 1 });
      };
    },
  };

  const SCENES = [s1, s2, s3, s4, s5, s6, s7];
  const DURATION = SCENES.reduce((s, x) => s + x.dur, 0);
  const FADE = 0.18;

  /* -------------------------------- engine ------------------------------ */
  const root = document.getElementById('root');
  let cur = -1, upd = null, node = null;
  function seek(t) {
    t = clamp(t, 0, DURATION);
    let acc = 0;
    for (let i = 0; i < SCENES.length; i++) {
      const S = SCENES[i];
      if (t < acc + S.dur || i === SCENES.length - 1) {
        if (i !== cur) {
          root.innerHTML = '';
          node = el('div', 'scene');
          root.appendChild(node);
          upd = S.build(node);
          cur = i;
        }
        const lt = t - acc;
        upd(lt);
        const fadeIn = i === 0 ? 1 : clamp(lt / FADE);
        const fadeOut = S.last ? 1 : clamp((S.dur - lt) / FADE);
        node.style.opacity = Math.min(fadeIn, fadeOut);
        return;
      }
      acc += S.dur;
    }
  }

  /* Ready once fonts and every image the film uses have loaded — a frame
     captured before that would show a fallback face or an empty photo. */
  const imgs = ['/assets/proof/gym.jpg', '/assets/logo.png'].map((src) => new Promise((res) => {
    const i = new Image(); i.onload = i.onerror = res; i.src = src;
  }));
  const faces = ['900 20px Chivo', '700 20px Chivo', '400 20px Inter', '500 20px Inter', '600 20px Inter', '400 20px "JetBrains Mono"', '600 20px "JetBrains Mono"'];
  const fonts = document.fonts ? Promise.all(faces.map((f) => document.fonts.load(f).catch(() => null))) : Promise.resolve();
  const ready = Promise.all([fonts].concat(imgs));

  const render = /[?&]render=1/.test(location.search);
  window.__promo = { duration: DURATION, seek, ready, lang: LANG };
  seek(0);
  if (!render) {
    ready.then(() => {
      const t0 = performance.now();
      const loop = () => { seek(((performance.now() - t0) / 1000) % (DURATION + 1)); requestAnimationFrame(loop); };
      loop();
    });
  }
})();
