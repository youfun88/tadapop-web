/* Tadapop habit-programs intro — 9:16, about two minutes, voiced.
   What the best habit books agree on, and how the app's programs use it:
   you've tried before → it's not willpower, it's autopilot → make the good
   thing automatic → 1 start tiny → 2 tie it to something you already do →
   3 plan the hard day → 4 feel good, it's proof of who you're becoming →
   miss one, not two → about 66 days → how Tadapop helps → start today.

   The narration is tools/habits/script.json; each scene lasts as long as its
   voice clip (assets/habits/vo/timing-<lang>.json) plus a breath either side,
   and the captions follow the voice sentence by sentence. Scenes are pure
   functions of scene-local time, as in the promo. */
(function () {
  'use strict';
  const LANG = /[?&]lang=zh/.test(location.search) ? 'zh' : 'en';
  document.documentElement.lang = LANG === 'zh' ? 'zh-Hant' : 'en';

  const COPY = {
    en: {
      day: 'DAY', week1: 'WEEK 1', week2: 'WEEK 2',
      h2big: 'of what we do each day', h2small: 'is habit — on autopilot',
      h3title: 'Don’t try harder.<br><b>Make it automatic.</b>',
      books: ['Atomic Habits', 'Tiny Habits', 'The Power of Habit'], research: '+ the research behind them',
      k1: '01 · START TINY', from: 'Run 5K', to: 'Put on your shoes', chips: ['⏱ 2 min', '📖 1 page', '🍃 1 breath'],
      k2: '02 · TIE IT TO WHAT YOU DO', after: 'After I brush my teeth', then: 'floss one tooth',
      k3: '03 · PLAN THE HARD DAY', ifc: 'IF', ift: 'I’m tired', thenc: 'THEN', thent: 'I do just 1 minute',
      k4: '04 · FEEL IT, BECOME IT', done: 'Done', proof: 'proof of who you’re becoming',
      k5: 'MISSED ONE?', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], rule: 'Never miss twice.',
      k6: 'GIVE IT TIME', daysLabel: 'days, on average, in one study',
      k7: 'HOW TADAPOP HELPS', pick: 'Pick', plan: 'Plan', check: 'Check in', w: 'W',
      steps: ['3 slow breaths', '2 minutes', '5 minutes', '10 minutes'], howGo: 'Last week: 5 of 7 days', easy: 'Grow it', right: 'Keep it', hard: 'Smaller',
      tag: 'Habit programs', cta: 'Start today', free: 'Free',
    },
    zh: {
      day: '第', week1: '第 1 週', week2: '第 2 週',
      h2big: '我們每天做的事', h2small: '都是習慣，自動駕駛',
      h3title: '不用更努力，<br><b>讓它變成自動的。</b>',
      books: ['《原子習慣》', '《設計你的小習慣》', '《為什麼我們這樣生活，那樣工作？》'], research: '＋ 背後的研究',
      k1: '01 · 從小開始', from: '跑 5 公里', to: '穿上跑鞋', chips: ['⏱ 2 分鐘', '📖 1 頁', '🍃 1 次呼吸'],
      k2: '02 · 接在你本來就會做的事後面', after: '刷完牙後', then: '用牙線清一顆牙',
      k3: '03 · 先想好難熬的那天', ifc: '如果', ift: '我很累', thenc: '就', thent: '只做 1 分鐘',
      k4: '04 · 感受它，成為那個人', done: '完成', proof: '證明你正在成為那個人',
      k5: '漏掉一天？', days: ['一', '二', '三', '四', '五', '六', '日'], rule: '別連續漏兩天。',
      k6: '給它時間', daysLabel: '天，一項研究的平均',
      k7: 'TADAPOP 怎麼幫你', pick: '選擇', plan: '計畫', check: '每週回顧', w: '第',
      steps: ['深呼吸 3 次', '2 分鐘', '5 分鐘', '10 分鐘'], howGo: '上週做到 5/7 天', easy: '長大一點', right: '維持', hard: '小一點',
      tag: '習慣養成計畫', cta: '就從今天開始', free: '免費',
    },
  }[LANG];

  const COL = {
    void: '#0B0E17', panel: '#141A29', panel2: '#1A2233', line: '#26304a',
    ink: '#E8ECF5', dim: '#7C8AA5', faint: '#4F5B76', amber: '#FFB454', amberDeep: '#E8922E',
    go: '#5BE39B', goDeep: '#2FB979', blue: '#7FA9FF', red: '#FF9A7C', violet: '#C9A6FF',
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
  function show(n, lt, at, o) {
    o = o || {};
    const dy = o.dy != null ? o.dy : 16, s = o.s != null ? o.s : 0.92, dur = o.dur || 0.45, x = o.x || 0;
    const a = clamp((lt - at) / 0.18);
    const k = E.back(clamp((lt - at) / dur));
    n.style.opacity = a;
    n.style.transform = 'translate(' + (x * (1 - k)).toFixed(2) + 'px,' + (dy * (1 - k)).toFixed(2) + 'px) scale(' + (s + (1 - s) * k).toFixed(4) + ')';
  }
  const abs = (css) => Object.assign({ position: 'absolute' }, css);
  function kicker(node, text) { const k = el('div', 'kicker', null, text); node.appendChild(k); return k; }
  function confetti(node, cx, cy, n) {
    const cols = [COL.amber, COL.blue, COL.go, COL.red, COL.violet];
    const ps = [];
    for (let i = 0; i < n; i++) {
      const p = el('div', 'conf', { background: cols[i % cols.length], borderRadius: i % 3 ? '50%' : '2px', left: cx + 'px', top: cy + 'px', opacity: 0 });
      node.appendChild(p);
      const ang = (i / n) * Math.PI * 2 + (i % 7) * 0.37;
      const v = 110 + (i % 6) * 30;
      ps.push({ p, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v - 90, spin: (i % 2 ? 1 : -1) * (200 + i * 17), life: 1.3 + (i % 5) * 0.1 });
    }
    return (lt, at) => {
      const t = lt - at;
      ps.forEach((q) => {
        if (t < 0) { q.p.style.opacity = 0; return; }
        q.p.style.opacity = clamp(1 - t / q.life);
        q.p.style.transform = 'translate(' + (q.vx * t).toFixed(1) + 'px,' + (q.vy * t + 230 * t * t).toFixed(1) + 'px) rotate(' + (q.spin * t).toFixed(0) + 'deg)';
      });
    };
  }
  /* Where the voice is, in scene time: the clip starts after LEAD. `T(i)` is
     when the i-th sentence begins — scenes time their beats to the words. */
  const LEAD = 0.45, TAIL = 0.7;

  /* Beats, by the words they land on. A scene asks C('name') and gets the
     moment that phrase is spoken, in either language — the two voices split
     their sentences differently ("One." is a sentence in English, 第一，is
     not), so counting sentences put the Chinese visuals seconds late. */
  const CUES = {
    h1: { fade: ['And by week two', '到了第二週'] },
    h2: { ring: ['about four in ten', '大約四成'] },
    h3: { books: ['the best habit books', '最好的幾本'] },
    h4: { shrink: ['Start so small', '從小到'], chips: ['Two minutes', '兩分鐘'] },
    h5: { anchor: ['Tie it', '把它接在'], link: ['I floss', '就用牙線'], done: ['The old habit', '舊習慣'] },
    h6: { ifc: ["If I'm tired", '如果我很累'], thenc: ["I'll do just", '就只做'], bars: ['People who', '事先想好備案'] },
    h7: { done: ['Every time', '每做一次'], proof: ['proof', '證明'] },
    h8: { heart: ['be kind', '對自己溫柔'], rule: ["Just don't miss two", '只要別連續'] },
    h9: { bars: ['not a sprint', '不是衝刺'] },
    h10: { pick: ['You pick', '你選'], plan: ['We build', '我們依照'], check: ['ask how', '問問你'], adjust: ['adjust', '一起調整'] },
  };

  /* ------------------------------- scenes ------------------------------ */
  // Each scene: build(node, T) → update(lt). T(i) = start of sentence i.
  const BUILD = {
    /* you've tried before: a run of days that goes quiet in week two */
    h1(node, C) {
      const box = el('div', 'panel', abs({ left: '28px', right: '28px', top: '150px', padding: '18px 16px 20px' }));
      const labels = el('div', 'mono', { display: 'flex', justifyContent: 'space-between', fontSize: '10px', letterSpacing: '.16em', color: COL.dim, marginBottom: '12px' },
        '<span>' + COPY.week1 + '</span><span>' + COPY.week2 + '</span>');
      const row = el('div', null, { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' });
      const dots = [];
      for (let i = 0; i < 14; i++) {
        const d = el('div', null, { height: '30px', borderRadius: '8px', background: COL.panel2, border: '1px solid ' + COL.line });
        row.appendChild(d); dots.push(d);
      }
      const big = el('div', 'mono', { textAlign: 'center', marginTop: '18px', fontSize: '56px', fontWeight: '600', lineHeight: '1', color: COL.amber });
      box.append(labels, row, big);
      node.appendChild(box);
      const fade = C('fade');
      return (lt) => {
        show(box, lt, 0.1, { s: 0.94 });
        const n = Math.min(9, Math.floor(clamp((lt - 0.4) / Math.max(0.5, fade - 0.6)) * 9.99));
        dots.forEach((d, i) => {
          const on = i < n;
          const quiet = lt > fade + 0.4;
          d.style.background = on ? (quiet ? COL.faint : COL.amber) : COL.panel2;
          d.style.borderColor = on && !quiet ? COL.amber : COL.line;
          d.style.boxShadow = on && !quiet && i === n - 1 ? '0 0 16px rgba(255,180,84,.5)' : 'none';
        });
        big.textContent = (LANG === 'zh' ? COPY.day + ' ' + Math.max(1, n) + ' 天' : COPY.day + ' ' + Math.max(1, n));
        big.style.color = lt > fade + 0.4 ? COL.faint : COL.amber;
      };
    },

    /* not willpower: about four in ten things we do are habit */
    h2(node, C) {
      const R = 74, CIRC = 2 * Math.PI * R;
      const wrap = el('div', null, abs({ left: '0', right: '0', top: '120px', display: 'grid', placeItems: 'center' }));
      wrap.innerHTML =
        '<svg width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="' + R + '" fill="none" stroke="' + COL.line + '" stroke-width="14"/>' +
        '<circle class="js-arc" cx="100" cy="100" r="' + R + '" fill="none" stroke="' + COL.amber + '" stroke-width="14" stroke-linecap="round" transform="rotate(-90 100 100)" stroke-dasharray="' + CIRC + '" stroke-dashoffset="' + CIRC + '"/></svg>' +
        '<div class="mono js-pct" style="position:absolute;top:70px;font-size:48px;font-weight:600;color:' + COL.amber + '">0%</div>';
      const arc = wrap.querySelector('.js-arc'), pct = wrap.querySelector('.js-pct');
      const big = el('div', 'disp', abs({ left: '20px', right: '20px', top: '340px', textAlign: 'center', fontWeight: '800', fontSize: '21px' }), COPY.h2big);
      const small = el('div', null, abs({ left: '20px', right: '20px', top: '372px', textAlign: 'center', fontSize: '15px', color: COL.dim }), '🔁 ' + COPY.h2small);
      node.append(wrap, big, small);
      const at = C('ring');
      return (lt) => {
        show(wrap, lt, 0.05, { s: 0.85 });
        const p = prog(lt, at + 0.6, 1.8, E.inOut) * 0.43;
        arc.setAttribute('stroke-dashoffset', (CIRC * (1 - p)).toFixed(1));
        pct.textContent = Math.round(p * 100) + '%';
        show(big, lt, at + 1.2);
        show(small, lt, at + 1.6);
      };
    },

    /* the reframe, and the books that agree */
    h3(node, C) {
      const t = el('div', 'title', null, COPY.h3title);
      node.appendChild(t);
      const cards = COPY.books.map((b, i) => {
        const c = el('div', 'panel', abs({ left: '44px', right: '44px', top: (228 + i * 62) + 'px', height: '50px', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', borderRadius: '14px' }),
          '<span style="font-size:20px">' + ['📘', '📗', '📙'][i] + '</span><span class="disp" style="font-weight:700;font-size:' + (b.length > 14 ? '13px' : '16px') + '">' + b + '</span>');
        node.appendChild(c);
        return c;
      });
      const r = el('div', 'mono', abs({ left: '0', right: '0', top: '420px', textAlign: 'center', fontSize: '11px', letterSpacing: '.14em', color: COL.dim }), COPY.research);
      node.appendChild(r);
      const at = C('books');
      return (lt) => {
        show(t, lt, 0.1);
        cards.forEach((c, i) => show(c, lt, at + i * 0.35, { x: i % 2 ? 30 : -30, dy: 0, s: 1 }));
        show(r, lt, at + 1.2, { dy: 8, s: 1 });
      };
    },

    /* 1 · start tiny */
    h4(node, C) {
      const k = kicker(node, COPY.k1);
      const from = el('div', 'panel', abs({ left: '50px', right: '50px', top: '130px', height: '64px', display: 'grid', placeItems: 'center' }),
        '<span class="disp" style="font-weight:800;font-size:22px">🏃 ' + COPY.from + '</span>');
      const strike = el('div', null, abs({ left: '70px', top: '161px', height: '3px', width: '0', background: COL.red, borderRadius: '2px' }));
      const arrow = el('div', null, abs({ left: '0', right: '0', top: '206px', textAlign: 'center', fontSize: '22px', color: COL.faint }), '↓');
      const to = el('div', 'panel', abs({ left: '78px', right: '78px', top: '244px', height: '58px', display: 'grid', placeItems: 'center', borderColor: COL.go, boxShadow: '0 0 30px rgba(91,227,155,.18)' }),
        '<span class="disp" style="font-weight:800;font-size:18px">👟 ' + COPY.to + '</span>');
      const chips = el('div', null, abs({ left: '16px', right: '16px', top: '350px', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }));
      const cs = COPY.chips.map((c) => { const e = el('div', 'chip', null, c); chips.appendChild(e); return e; });
      node.append(from, strike, arrow, to, chips);
      return (lt) => {
        show(k, lt, 0.05, { dy: 6, s: 1 });
        show(from, lt, 0.2);
        strike.style.width = (220 * prog(lt, C('shrink') + 0.2, 0.5)) + 'px';
        from.style.opacity = String(1 - 0.5 * prog(lt, C('shrink') + 0.5, 0.4));
        show(arrow, lt, C('shrink') + 0.5, { s: 1 });
        show(to, lt, C('shrink') + 0.75, { s: 0.7 });
        cs.forEach((c, i) => show(c, lt, C('chips') + i * 0.5, { dy: 10, s: 0.8 }));
      };
    },

    /* 2 · tie it to something you already do — the app's own "after → do" */
    h5(node, C) {
      const k = kicker(node, COPY.k2);
      const a = el('div', 'panel', abs({ left: '36px', right: '36px', top: '140px', height: '64px', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 18px' }),
        '<span style="font-size:26px">🪥</span><span class="disp" style="font-weight:700;font-size:18px;color:' + COL.dim + '">' + COPY.after + '</span>');
      const link = el('div', null, abs({ left: '50%', top: '208px', width: '2px', height: '0', background: COL.amber, marginLeft: '-1px' }));
      const b = el('div', 'panel', abs({ left: '36px', right: '36px', top: '268px', height: '64px', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 18px', borderColor: COL.amber }),
        '<span style="font-size:26px">🦷</span><span class="disp" style="font-weight:800;font-size:18px">' + COPY.then + '</span><span class="js-c" style="margin-left:auto;width:26px;height:26px;border-radius:50%;border:2px solid ' + COL.faint + '"></span>');
      const circ = b.querySelector('.js-c');
      node.append(a, link, b);
      return (lt) => {
        show(k, lt, 0.05, { dy: 6, s: 1 });
        show(a, lt, C('anchor'));
        link.style.height = (56 * prog(lt, C('link') - 0.4, 0.5)) + 'px';
        show(b, lt, C('link'));
        const done = lt > C('done');
        circ.style.background = done ? COL.go : 'transparent';
        circ.style.borderColor = done ? COL.go : COL.faint;
      };
    },

    /* 3 · plan the hard day: an if-then backup */
    h6(node, C) {
      const k = kicker(node, COPY.k3);
      const row = (top, tag, col, text, emoji) => el('div', 'panel', abs({ left: '30px', right: '30px', top: top + 'px', height: '70px', display: 'flex', alignItems: 'center', gap: '14px', padding: '0 16px' }),
        '<span class="mono" style="font-size:12px;font-weight:600;letter-spacing:.14em;color:' + col + ';min-width:44px">' + tag + '</span>' +
        '<span style="font-size:24px">' + emoji + '</span><span class="disp" style="font-weight:800;font-size:18px">' + text + '</span>');
      const a = row(140, COPY.ifc, COL.red, COPY.ift, '😴');
      const b = row(226, COPY.thenc, COL.go, COPY.thent, '⏱');
      const bars = el('div', null, abs({ left: '60px', right: '60px', top: '346px' }));
      bars.innerHTML =
        '<div style="height:12px;border-radius:6px;background:' + COL.panel2 + ';overflow:hidden"><div class="js-b1" style="height:100%;width:0;background:' + COL.faint + '"></div></div>' +
        '<div style="height:12px;border-radius:6px;background:' + COL.panel2 + ';overflow:hidden;margin-top:10px"><div class="js-b2" style="height:100%;width:0;background:' + COL.go + '"></div></div>';
      const b1 = bars.querySelector('.js-b1'), b2 = bars.querySelector('.js-b2');
      node.append(a, b, bars);
      return (lt) => {
        show(k, lt, 0.05, { dy: 6, s: 1 });
        show(a, lt, C('ifc'), { x: -24, dy: 0, s: 1 });
        show(b, lt, C('thenc'), { x: 24, dy: 0, s: 1 });
        show(bars, lt, C('bars'), { dy: 8, s: 1 });
        // No numbers: a plan made ahead helps a lot, and the bars say only that.
        b1.style.width = (45 * prog(lt, C('bars') + 0.3, 1.2)) + '%';
        b2.style.width = (85 * prog(lt, C('bars') + 0.5, 1.4)) + '%';
      };
    },

    /* 4 · feel good about it: it's proof of who you're becoming */
    h7(node, C) {
      const k = kicker(node, COPY.k4);
      const ring = el('div', null, abs({ left: '50%', top: '150px', width: '130px', height: '130px', marginLeft: '-65px', borderRadius: '50%', border: '4px solid ' + COL.faint, display: 'grid', placeItems: 'center', fontSize: '60px', color: COL.void, fontWeight: '900' }), '✓');
      const lab = el('div', 'disp', abs({ left: '0', right: '0', top: '296px', textAlign: 'center', fontWeight: '800', fontSize: '22px', color: COL.go }), COPY.done + ' ✨');
      const proof = el('div', 'mono', abs({ left: '20px', right: '20px', top: '346px', textAlign: 'center', fontSize: '13px', letterSpacing: '.08em', color: COL.amber }), '+1 · ' + COPY.proof);
      const boom = confetti(node, 180, 215, 26);
      node.append(ring, lab, proof);
      const at = C('done');
      return (lt) => {
        show(k, lt, 0.05, { dy: 6, s: 1 });
        show(ring, lt, 0.3, { s: 0.7 });
        const on = lt > at;
        ring.style.background = on ? COL.go : 'transparent';
        ring.style.borderColor = on ? COL.go : COL.faint;
        ring.style.boxShadow = on ? '0 0 50px rgba(91,227,155,.45)' : 'none';
        ring.style.color = on ? COL.void : 'transparent';
        boom(lt, at);
        show(lab, lt, at + 0.15, { s: 0.7 });
        show(proof, lt, C('proof'), { dy: 8, s: 1 });
      };
    },

    /* miss one, never two: a week with a gap, and it goes on */
    h8(node, C) {
      const k = kicker(node, COPY.k5);
      const grid = el('div', null, abs({ left: '24px', right: '24px', top: '150px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '7px' }));
      const pattern = [1, 1, 1, 0, 1, 1, 1];
      const cells = COPY.days.map((d, i) => {
        const c = el('div', null, { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
          '<span class="mono" style="font-size:11px;color:' + COL.dim + '">' + d + '</span>' +
          '<span class="js-d" style="width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-size:17px;font-weight:800;border:2px solid ' + COL.line + '"></span>');
        grid.appendChild(c);
        return c.querySelector('.js-d');
      });
      const rule = el('div', 'disp', abs({ left: '0', right: '0', top: '270px', textAlign: 'center', fontWeight: '900', fontSize: '28px' }), '<span style="color:' + COL.amber + '">' + COPY.rule + '</span>');
      const heart = el('div', null, abs({ left: '0', right: '0', top: '330px', textAlign: 'center', fontSize: '40px' }), '🤍');
      node.append(grid, rule, heart);
      return (lt) => {
        show(k, lt, 0.05, { dy: 6, s: 1 });
        show(grid, lt, 0.2, { s: 1 });
        cells.forEach((c, i) => {
          const on = lt > 0.5 + i * 0.35;
          if (!on) { c.style.background = 'transparent'; c.style.borderColor = COL.line; c.textContent = ''; return; }
          // The missed day is quiet, not red: no shame, just a gap.
          const hit = pattern[i] === 1;
          c.style.background = hit ? COL.go : 'transparent';
          c.style.borderColor = hit ? COL.go : COL.faint;
          c.style.borderStyle = hit ? 'solid' : 'dashed';
          c.style.color = COL.void;
          c.textContent = hit ? '✓' : '';
        });
        show(heart, lt, C('heart'), { s: 0.5 });
        show(rule, lt, C('rule'));
      };
    },

    /* about 66 days */
    h9(node, C) {
      const k = kicker(node, COPY.k6);
      const n = el('div', 'mono', abs({ left: '0', right: '0', top: '120px', textAlign: 'center', fontSize: '112px', fontWeight: '600', lineHeight: '1', color: COL.amber, textShadow: '0 0 40px rgba(255,180,84,.35)' }), '0');
      const lab = el('div', null, abs({ left: '0', right: '0', top: '250px', textAlign: 'center', fontSize: '16px', color: COL.dim }), COPY.daysLabel);
      const bars = el('div', null, abs({ left: '40px', right: '40px', top: '300px', height: '130px', display: 'flex', alignItems: 'flex-end', gap: '5px' }));
      const bs = [];
      for (let i = 0; i < 22; i++) {
        const b = el('div', null, { flex: '1', borderRadius: '3px 3px 0 0', background: i > 18 ? COL.go : COL.amberDeep, height: '0' });
        bars.appendChild(b); bs.push(b);
      }
      node.append(n, lab, bars);
      return (lt) => {
        show(k, lt, 0.05, { dy: 6, s: 1 });
        const p = prog(lt, 0.3, 2.4, E.inOut);
        n.textContent = String(Math.round(66 * p));
        show(lab, lt, 0.6, { dy: 6, s: 1 });
        bs.forEach((b, i) => {
          const g = prog(lt, C('bars') + i * 0.12, 0.5);
          b.style.height = (g * (14 + i * 5.2)) + 'px';
        });
      };
    },

    /* how Tadapop helps: pick → a tiny plan that grows → a weekly check-in */
    h10(node, C) {
      const k = kicker(node, COPY.k7);
      const col = (left, label) => {
        const c = el('div', null, abs({ left: left + 'px', top: '104px', width: '108px', textAlign: 'center' }),
          '<div class="mono" style="font-size:11px;letter-spacing:.14em;color:' + COL.dim + ';margin-bottom:8px">' + label + '</div>');
        node.appendChild(c);
        return c;
      };
      const c1 = col(10, COPY.pick), c2 = col(126, COPY.plan), c3 = col(242, COPY.check);
      const tiles = el('div', null, { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', justifyItems: 'center' });
      [['💪', ''], ['😴', ''], ['🧠', ''], ['🍎', '']].forEach(([e], i) => {
        const t = el('div', 'tile', { width: '50px', height: '50px', borderColor: i === 2 ? COL.amber : COL.line }, '<span style="font-size:22px">' + e + '</span>');
        tiles.appendChild(t);
      });
      c1.appendChild(tiles);
      const plan = el('div', null, { display: 'flex', flexDirection: 'column', gap: '6px' });
      const lines = COPY.steps.map((s, i) => {
        const l = el('div', null, { borderRadius: '9px', border: '1px solid ' + (i === 0 ? COL.amber : COL.line), padding: '7px 6px', fontSize: '12px', textAlign: 'left', background: COL.panel },
          '<span class="mono" style="color:' + (i === 0 ? COL.amber : COL.faint) + ';margin-right:5px">' + (LANG === 'zh' ? COPY.w + (i + 1) + '週' : COPY.w + (i + 1)) + '</span>' + s);
        plan.appendChild(l);
        return l;
      });
      c2.appendChild(plan);
      const q = el('div', 'panel', { padding: '8px 6px', borderRadius: '12px', fontSize: '12px', lineHeight: '1.3' }, COPY.howGo);
      const chips = el('div', null, { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' });
      const cs = [['🌱', COPY.easy], ['👍', COPY.right], ['🪶', COPY.hard]].map(([e, t], i) => {
        const c = el('div', 'chip', { justifyContent: 'center', fontSize: '12.5px', padding: '7px 8px' }, e + ' ' + t);
        chips.appendChild(c);
        return c;
      });
      c3.append(q, chips);
      const heart = el('div', 'disp', abs({ left: '20px', right: '20px', top: '400px', textAlign: 'center', fontWeight: '800', fontSize: '18px', color: COL.go }), '');
      node.appendChild(heart);
      return (lt) => {
        show(k, lt, 0.05, { dy: 6, s: 1 });
        show(c1, lt, C('pick'));
        show(c2, lt, C('plan'));
        lines.forEach((l, i) => show(l, lt, C('plan') + 0.2 + i * 0.35, { dy: 8, s: 1 }));
        show(c3, lt, C('check'));
        cs.forEach((c, i) => show(c, lt, C('check') + 0.3 + i * 0.3, { dy: 6, s: 0.8 }));
        // "adjust when life gets hard": the check-in answer lights up.
        const pick = lt > C('adjust');
        cs[0].style.borderColor = pick ? COL.go : COL.line;
        cs[0].style.background = pick ? 'rgba(91,227,155,.14)' : COL.panel2;
      };
    },

    /* start today */
    h11(node) {
      const box = el('div', null, abs({ left: '0', right: '0', top: '120px', textAlign: 'center' }));
      const logo = el('img', null, { width: '96px', height: '96px', borderRadius: '22px', boxShadow: '0 0 70px rgba(255,180,84,.35)' });
      logo.src = '/assets/logo.png';
      const name = el('div', 'disp', { fontWeight: '900', fontSize: '38px', letterSpacing: '1px', marginTop: '18px' }, 'Tada<span style="color:' + COL.amber + '">pop</span>');
      const tag = el('div', 'disp', { fontWeight: '700', fontSize: '20px', marginTop: '10px', color: COL.ink }, COPY.tag);
      const pill = el('div', null, { display: 'inline-block', marginTop: '24px', padding: '13px 24px', borderRadius: '999px', background: COL.amber, color: '#1a1205', fontWeight: '800', fontSize: '16px' }, COPY.cta + ' →');
      box.append(logo, name, tag, pill);
      node.appendChild(box);
      return (lt) => {
        show(logo, lt, 0.05, { dy: 0, s: 0.5, dur: 0.6 });
        show(name, lt, 0.35);
        show(tag, lt, 0.6);
        show(pill, lt, 1.2, { dy: 0, s: 0.75 });
      };
    },
  };

  /* -------------------------------- engine ------------------------------ */
  const root = document.getElementById('root');
  const cc = document.getElementById('cc');
  let SCENES = [], DURATION = 0;
  let cur = -1, upd = null, node = null, lastCap = null;
  const FADE = 0.2;

  function seek(t) {
    if (!SCENES.length) return;
    t = clamp(t, 0, DURATION);
    for (let i = 0; i < SCENES.length; i++) {
      const S = SCENES[i];
      if (t < S.start + S.dur || i === SCENES.length - 1) {
        if (i !== cur) {
          root.innerHTML = '';
          node = el('div', 'scene');
          root.appendChild(node);
          upd = BUILD[S.id](node, S.C);
          cur = i;
        }
        const lt = t - S.start;
        upd(lt);
        const fadeIn = i === 0 ? 1 : clamp(lt / FADE);
        const fadeOut = i === SCENES.length - 1 ? 1 : clamp((S.dur - lt) / FADE);
        node.style.opacity = Math.min(fadeIn, fadeOut);
        // The caption is the sentence being spoken; it holds through the pause
        // after it, and leaves with the scene.
        let text = '';
        S.sentences.forEach((s) => { if (lt >= LEAD + s.at - 0.05) text = s.text; });
        if (text !== lastCap) { cc.textContent = text; lastCap = text; }
        cc.style.opacity = Math.min(fadeIn, fadeOut);
        return;
      }
    }
  }

  /* When a cue phrase is spoken, in scene time. The phrase is found in the
     scene's text; its sentence's start is exact (from the voice's own
     alignment), and within the sentence it is placed by its share of the
     characters up to the next sentence — close enough to land a beat. */
  function cueClock(id, text, tm) {
    const table = CUES[id] || {};
    const k = LANG === 'zh' ? 1 : 0;
    const starts = tm.sentences.map((s) => ({ at: s.at, from: text.indexOf(s.text) }));
    return (name) => {
      const phrase = table[name] && table[name][k];
      const pos = phrase ? text.indexOf(phrase) : -1;
      if (pos < 0) {
        console.warn('cue not found', id, name);
        return LEAD;
      }
      let i = 0;
      while (i + 1 < starts.length && starts[i + 1].from >= 0 && starts[i + 1].from <= pos) i++;
      const a = starts[i];
      const next = starts[i + 1];
      const endAt = next ? next.at : tm.len;
      const endChar = next && next.from >= 0 ? next.from : text.length;
      const share = clamp((pos - Math.max(0, a.from)) / Math.max(1, endChar - Math.max(0, a.from)));
      return LEAD + a.at + share * (endAt - a.at);
    };
  }

  const ready = (async () => {
    const [script, timing] = await Promise.all([
      fetch('/tools/habits/script.json').then((r) => r.json()),
      fetch('/assets/habits/vo/timing-' + LANG + '.json').then((r) => r.json()),
    ]);
    let at = 0;
    SCENES = script.scenes.map((s, i) => {
      const tm = timing[s.id];
      const last = i === script.scenes.length - 1;
      const dur = LEAD + tm.len + (last ? 2.4 : TAIL);
      const scene = {
        id: s.id, start: at, dur, len: tm.len, sentences: tm.sentences,
        C: cueClock(s.id, s[LANG], tm),
      };
      at += dur;
      return scene;
    });
    DURATION = at;
    window.__habits.duration = DURATION;
    // Where each clip starts in the film, for the audio mix in render.mjs.
    window.__habits.voice = SCENES.map((s) => ({ id: s.id, at: Number((s.start + LEAD).toFixed(3)) }));
    const logo = new Promise((res) => { const i = new Image(); i.onload = i.onerror = res; i.src = '/assets/logo.png'; });
    const faces = ['900 20px Chivo', '800 20px Chivo', '700 20px Chivo', '400 20px Inter', '500 20px Inter', '600 20px Inter', '600 20px "JetBrains Mono"'];
    await Promise.all([logo].concat(document.fonts ? faces.map((f) => document.fonts.load(f).catch(() => null)) : []));
    seek(0);
    return true;
  })();

  const render = /[?&]render=1/.test(location.search);
  window.__habits = { duration: 0, seek, ready, lang: LANG, voice: [] };
  if (!render) {
    ready.then(() => {
      const t0 = performance.now();
      const loop = () => { seek(((performance.now() - t0) / 1000) % (DURATION + 1)); requestAnimationFrame(loop); };
      loop();
    });
  }
})();
