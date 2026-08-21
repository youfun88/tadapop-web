/* =====================================================================
   Tadapop explainer film — scene engine + 9 animated scenes.
   Pure DOM + Web Animations API. Female AI voiceover (speechSynthesis)
   with synced captions (captions carry the message when muted).
   Internal scene coordinate space: 1000 x 563 (scaled to fit viewport).
   ===================================================================== */

/* ========================== film copy (i18n) ==========================
   Every user-visible string in the film lives here and nowhere else: the
   player chrome, the captions, the voiceover script, and the text drawn
   inside the mock app UI the scenes render. Nothing below this block should
   hold an English literal — translating the film is exactly this object.

   ## The language comes from the page, never from the browser

   Each page exists twice, and /zh/ declares `lang="zh-Hant"`. By the time the
   film loads, lang.js has already decided which of the two the visitor is on
   and remembered a manual choice. The film is embedded in that page, so it
   reads the decision off <html> instead of re-deciding from navigator.language
   — otherwise a Chinese-browser reader who deliberately clicked "English"
   would get a Chinese film sitting on an English page.

   ## Fallbacks

   An unknown or missing lang is English, and so is any key a translation
   happens to be missing: a gap shows the English line rather than the word
   "undefined" burned into a caption.

   ## Markup and timing

   Lines that carry markup keep it. The <span class="hi"> / <span class="go">
   highlights are what make a caption legible in the second and a half it is on
   screen, so a translation highlights the *equivalent word* rather than
   whatever happens to sit in the same position.

   Every caption is on screen for a fixed number of seconds, choreographed
   against the animation. The English copy is written to the beat of the line,
   not to its word count, and it fits the clock — the clock never moves for it.

   The Chinese captions are different in kind: they are a TRANSCRIPT of what
   BOBO says, word for word. They used to be separate display copy that said
   the same thing a different way, which reads as a subtitling bug to anyone
   who is both listening and reading — the voice says 「喂！說你喔。」 while the
   screen says 「老是明天再說？」. If you change a zh `capN`, change the matching
   `vo` line with it, and re-measure CAP_AT.

   Chinese terminology follows the app (its src/i18n/zh.ts): 競技場 for Arena,
   任務 for mission, T點數 for Tpoint, 連續紀錄 for streak, and the four example
   habits are the app's own template names so the film and the product name the
   same things. Traditional (Taiwan) forms and full-width punctuation only.
   ====================================================================== */
const COPY = {
  en: {
    /* ---- player chrome ---- */
    'ui.close': '✕ CLOSE',
    'ui.soundOn': '♪ SOUND ON',
    'ui.soundOff': '♪ SOUND OFF',
    'ui.replay': '⟳ REPLAY',
    'ui.pause': '❚❚ PAUSE',
    'ui.resume': '▶ PLAY',
    'ui.tapForSound': '🔊 Tap for sound',
    'ui.hostName': 'HOST · <b>BOBO</b>',
    'ui.tada': 'Tada! 🎉',
    /* Stamped onto the launch button from the real scene durations — see the
       note where TOTAL is computed. */
    'ui.filmLength': '· {n} sec',
    'end.headline': 'Your first mission starts now.',
    'end.watchAgain': '⟳ Watch again',
    'end.close': 'Close',
    'cta.getBeta': 'Get the beta — iOS & Android →',

    /* ---- chrome of the mock app the scenes draw ---- */
    'app.missionControl': 'MISSION CONTROL',
    'app.todayOnTrack': 'TODAY · ON TRACK',
    'app.streak': 'STREAK',
    'app.tpoints': 'TPOINTS',
    'app.dayUnit': 'd',
    'app.missionsToday': 'MISSIONS · TODAY',
    'app.dayStreak': 'DAY STREAK',
    'app.longest': 'LONGEST',
    'app.completion': 'COMPLETION',

    /* ---- scene 1 · cold open ---- */
    's1.brandSub': 'DAILY MISSIONS · STREAKS · THE ARENA',
    's1.cap1': 'Yeah, you — the one who keeps saying <span class="hi">tomorrow</span>.',
    's1.cap2': '<span class="go">Tomorrow just clocked in.</span>',
    's1.vo': 'Yeah, you — the one who keeps saying tomorrow. Tomorrow just clocked in.',

    /* ---- scene 2 · the three mission types ---- */
    's2.mInbox': 'Inbox to zero',
    's2.mWater': 'Drink 8 glasses of water',
    's2.mRead': 'Read 20 pages',
    's2.mDeepWork': 'Deep work block — 90 min',
    's2.metaDaily': 'DAILY',
    's2.metaWater': '{n}/8 glasses',
    's2.metaPages': '20/20 pages',
    's2.metaTimer': '90 MIN',
    's2.metaTimerLeft': '89:58 LEFT',
    's2.metaTimerDone': '90 MIN DONE',
    's2.cap1': 'See those missions glowing? That\'s <span class="hi">today</span>, asking for you.',
    's2.cap2': 'Tap one done. Count the water, the steps, the pages.',
    's2.cap3': 'Or punch a timer and <span class="go">vanish into deep work</span>.',
    's2.vo': 'See those missions glowing? That\'s today, asking for you. Tap one done. Count the water, the steps, the pages. Or punch a timer and vanish into deep work.',

    /* ---- scene 3 · the all-or-nothing Tpoint ---- */
    's3.mission': 'Morning workout — 20 min',
    's3.metaTimer': '20 MIN',
    's3.metaDone': '20 MIN DONE',
    's3.cleared': 'ALL MISSIONS CLEARED · +1 TPOINT',
    's3.cap1': 'Clear every single one and the day pays out: <span class="go">one Tpoint</span>.',
    's3.cap2': 'Miss one? Nothing. <span class="hi">All or nothing</span>, no nibbling.',
    's3.vo': 'Clear every single one and the day pays out: one Tpoint. Miss one? Nothing. All or nothing, no nibbling.',

    /* ---- scene 4 · streaks ---- */
    's4.cleared': 'ALL OBJECTIVES CLEARED — DAY SECURED',
    's4.cap1': '<span class="go">Day locked.</span> Your streak climbs one taller.',
    's4.cap2': 'No freebies out here, friend, just yesterday-you losing to today-you, again.',
    's4.vo': 'Day locked. Your streak climbs one taller. No freebies out here, friend, just yesterday-you losing to today-you, again.',

    /* ---- scene 5 · stats ---- */
    's5.heatmap': 'ACTIVITY · 1 YEAR',
    's5.byMission': 'BY MISSION · LAST 30 DAYS',
    's5.barWater': 'Drink 8 glasses of water',
    's5.barDeepWork': 'Deep work block',
    's5.barMeditate': 'Meditate 10 minutes',
    's5.cap1': 'Now look back. A whole year going <span class="go">green</span>,',
    's5.cap2': 'and numbers too honest to argue with. That\'s your receipts.',
    's5.vo': 'Now look back. A whole year going green, and numbers too honest to argue with. That\'s your receipts.',

    /* ---- scene 6 · the Arena opens ---- */
    's6.tabToday': 'TODAY',
    's6.tabStats': 'STATS',
    's6.tabArena': 'ARENA',
    's6.tabProfile': 'PROFILE',
    's6.convene': '⚑ CONVENE A CHALLENGE',
    's6.challenge': 'Hydration Challenge',
    's6.challengeMeta': '8 GLASSES EACH DAY · 7 DAYS · 4 PLAYERS',
    's6.live': 'LIVE',
    's6.cap1': 'Doing it solo? <span class="hi">Cute.</span>',
    's6.cap2': 'Drag your friends in — the <span class="hi">Arena</span>\'s open.',
    's6.vo': 'Doing it solo? Cute. Drag your friends in — the Arena\'s open.',

    /* ---- scene 7 · the live leaderboard ---- */
    's7.liveDay': 'LIVE · DAY 3/7',
    's7.leaderboard': 'LEADERBOARD · MOST DAYS',
    's7.missedCol': 'MISSED',
    's7.today': '{v} TODAY',
    's7.doneProof': '✓ DONE TODAY · 📷 PROOF',
    's7.missedADay': 'MISSED A DAY',
    's7.you': 'You',
    's7.youTag': '(you)',
    's7.cap1': 'Invite your crew, set days and a target, go live.',
    's7.cap2': 'Most days completed tops the board. <span class="hi">Miss one, minus one.</span>',
    's7.cap3': 'Post proof, talk trash.',
    's7.vo': 'Invite your crew, set days and a target, go live. Most days completed tops the board. Miss one, minus one. Post proof, talk trash.',

    /* the three rivals — they appear in scene 7 and again in scene 8 */
    'player.a': 'Aria K.',
    'player.b': 'Kenji T.',
    'player.c': 'Noor A.',

    /* ---- scene 8 · results ---- */
    's8.challengeLine': '💧 HYDRATION CHALLENGE · 7 DAYS',
    's8.winner': 'You — that\'s you!',
    's8.winnerMeta': '7 DAYS · MOST DAYS COMPLETED',
    's8.standings': 'FINAL STANDINGS',
    's8.daysUnit': 'DAYS',
    's8.cap1': 'Win together. Lose together.',
    's8.cap2': 'Get scary good — <span class="hi">together</span>.',
    's8.vo': 'Win together. Lose together. Get scary good — together.',

    /* ---- scene 9 · sign-off ---- */
    's9.title': 'Track. Compete. <span style="color:{amber}">Become.</span>',
    's9.cap1': 'Tadapop. Track it, race your friends, become the you you keep describing.',
    's9.cap2': 'Free on iPhone and Android.',
    's9.cap3': 'Now up, soldier. Your first mission starts <span class="go">now</span>. Tada!',
    's9.vo': 'Tadapop. Track it, race your friends, become the you you keep describing. Free on iPhone and Android. Now up, soldier. Your first mission starts now. Tada!',
  },

  zh: {
    /* ---- player chrome ---- */
    'ui.close': '✕ 關閉',
    'ui.soundOn': '♪ 聲音開',
    'ui.soundOff': '♪ 聲音關',
    'ui.replay': '⟳ 重播',
    'ui.pause': '❚❚ 暫停',
    'ui.resume': '▶ 播放',
    'ui.tapForSound': '🔊 點一下開聲音',
    'ui.hostName': '主持人 · <b>BOBO</b>',
    'ui.tada': 'Tada! 🎉',
    'ui.filmLength': '· {n} 秒',
    'end.headline': '你的第一項任務，現在開始。',
    'end.watchAgain': '⟳ 再看一次',
    'end.close': '關閉',
    'cta.getBeta': '下載測試版 — iOS 與 Android →',

    /* ---- chrome of the mock app the scenes draw ----
       The English console voice shouts in ALL CAPS; Chinese has no case, so
       the same emphasis comes from being terse — two to four characters, as
       in the app itself. */
    'app.missionControl': '任務控制中心',
    'app.todayOnTrack': '今天 · 進度正常',
    'app.streak': '連續天數',
    'app.tpoints': 'T點數',
    'app.dayUnit': '天',
    'app.missionsToday': '任務 · 今天',
    'app.dayStreak': '連續天數',
    'app.longest': '最長',
    'app.completion': '完成率',

    /* ---- narration ----
       These nine lines are the ONLY Simplified text in this file, and that is
       deliberate: `vo:` is never rendered. It is fed to the speech engine and
       nothing else — the words on screen come from `capN`, and the mock app UI
       has its own keys. So this is a pronunciation script, not copy.

       It is Simplified because Traditional input made this voice misread the
       terms that matter. 競技場 came back as "重擊場", 鎖定 as "耍定", and s9
       stuttered on 成為. The same lines in Simplified read correctly. The
       model's Mandarin prior is Mainland-weighted; giving it the character
       forms it expects fixes the pronunciation without changing one character
       of what a viewer actually reads.

       tools/generate-vo.mjs transcribes every take back with speech-to-text
       and rejects any that does not match these lines, because the failures
       are per-take: the same text renders correctly on one attempt and slurs
       on the next. Homophone spellings in the transcript are fine (亮/量);
       a changed sound is not. */

    /* ---- scene 1 · cold open ---- */
    's1.brandSub': '每日任務 · 連續紀錄 · 競技場',
    's1.cap1': '嘴上老是<span class="hi">明天明天</span>。',
    's1.cap2': '<span class="go">明天，早就來打卡了。</span>',
    's1.vo': '嘴上老是明天明天。明天，早就来打卡了。',

    /* ---- scene 2 · the three mission types ----
       Mission names are the app's own template translations, so a viewer who
       downloads after watching sees the identical wording in the library. */
    's2.mInbox': '清空收件匣',
    's2.mWater': '喝 8 杯水',
    's2.mRead': '讀 20 頁書',
    's2.mDeepWork': '深度工作 — 90 分鐘',
    's2.metaDaily': '每天',
    's2.metaWater': '{n}/8 杯',
    's2.metaPages': '20/20 頁',
    's2.metaTimer': '90 分鐘',
    's2.metaTimerLeft': '剩 89:58',
    's2.metaTimerDone': '90 分鐘完成',
    's2.cap1': '任務亮了。做完<span class="go">打個勾</span>，幾杯水、幾頁書，通通記下來。',
    's2.cap2': '計時器一按，<span class="go">直接閉關</span>。',
    's2.vo': '任务亮了。做完打个勾，几杯水、几页书，通通记下来。计时器一按，直接闭关。',

    /* ---- scene 3 · the all-or-nothing Tpoint ---- */
    's3.mission': '晨間運動 — 20 分鐘',
    's3.metaTimer': '20 分鐘',
    's3.metaDone': '20 分鐘完成',
    's3.cleared': '今天全部完成 · +1 T點數',
    's3.cap1': '全部做完才有 <span class="go">T點數</span>。',
    's3.cap2': '少一項？<span class="hi">直接歸零</span>。要嘛全拿，要嘛空手。',
    's3.vo': '全部做完才有T点数。少一项？直接归零。要嘛全拿，要嘛空手。',

    /* ---- scene 4 · streaks ---- */
    's4.cleared': '所有任務完成 — 拿下今天',
    's4.cap1': '今天<span class="go">鎖定</span>，連續紀錄再疊一層。',
    's4.cap2': '沒在放水，昨天的你<span class="hi">又輸了</span>。',
    's4.vo': '今天锁定，连续纪录再叠一层。没在放水，昨天的你又输了。',

    /* ---- scene 5 · stats ---- */
    's5.heatmap': '活動紀錄 · 一年',
    's5.byMission': '依任務 · 近 30 天',
    's5.barWater': '喝 8 杯水',
    's5.barDeepWork': '深度工作',
    's5.barMeditate': '冥想 10 分鐘',
    's5.cap1': '回頭看，一整年<span class="go">綠得發亮</span>。',
    's5.cap2': '數字懶得跟你客氣。',
    's5.vo': '回头看，一整年绿得发亮。数字懒得跟你客气。',

    /* ---- scene 6 · the Arena opens ---- */
    's6.tabToday': '今天',
    's6.tabStats': '統計',
    's6.tabArena': '競技場',
    's6.tabProfile': '個人',
    's6.convene': '⚑ 發起挑戰',
    's6.challenge': '喝水挑戰',
    's6.challengeMeta': '每天 8 杯 · 7 天 · 4 位成員',
    's6.live': '進行中',
    's6.cap1': '自己練？<span class="hi">真乖。</span>',
    's6.cap2': '揪朋友進<span class="hi">競技場</span>。',
    's6.vo': '自己练？真乖。揪朋友进竞技场。',

    /* ---- scene 7 · the live leaderboard ---- */
    's7.liveDay': '進行中 · 第 3/7 天',
    's7.leaderboard': '排行榜 · 最多天數',
    's7.missedCol': '漏掉天數',
    's7.today': '今天 {v} 杯',
    's7.doneProof': '✓ 今日打卡 · 📷 證明',
    's7.missedADay': '漏掉一天',
    's7.you': '你',
    's7.youTag': '（你）',
    's7.cap1': '揪人、設天數，開賽。做越多，<span class="go">爬越高</span>。',
    's7.cap2': '<span class="hi">漏一天扣一天</span>，拍照嗆爆對手。',
    's7.vo': '揪人、设天数，开赛。做越多，爬越高，漏一天扣一天，拍照呛爆对手。',

    /* Taiwanese given names rather than transliterated ones: the rivals have
       to read as the viewer's own friends at a glance, and the avatar badge
       shows only name[0]. */
    'player.a': '怡君',
    'player.b': '志豪',
    'player.c': '雅婷',

    /* ---- scene 8 · results ---- */
    's8.challengeLine': '💧 喝水挑戰 · 7 天',
    's8.winner': '冠軍 — 就是你！',
    's8.winnerMeta': '7 天 · 完成天數最多',
    's8.standings': '最終排名',
    's8.daysUnit': '天',
    's8.cap1': '一起贏，一起輸，',
    's8.cap2': '<span class="hi">最後一起強到爆。</span>',
    's8.vo': '一起赢，一起输，最后一起强到爆。',

    /* ---- scene 9 · sign-off ---- */
    's9.title': '記錄。較勁。<span style="color:{amber}">蛻變。</span>',
    's9.cap1': 'Tadapop。成為你說過的那個人。',
    's9.cap2': 'iPhone、Android 免費。<span class="go">換你上場。</span>',
    's9.vo': 'Tadapop。成为你说过的那个人。iPhone、Android免费。换你上场。Tada！',
  },
};

/** 'zh-Hant' / 'zh-TW' -> zh. Anything else, or nothing at all, -> en. */
const LANG = /^zh/i.test(document.documentElement.lang || '') ? 'zh' : 'en';

/**
 * One line of copy in the page's language, with `{slot}` substitution.
 * A key missing from a translation falls through to the English line.
 */
function t(key, vars) {
  var s = COPY[LANG][key];
  if (s == null) s = COPY.en[key];
  if (s == null) return '';
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
}

/**
 * The captions of a scene, and the moment each one appears.
 *
 * Both languages caption what BOBO is actually saying, word for word, so these
 * are subtitle cues rather than display copy. The two narrators do not reach
 * the same sentence at the same moment, so the timings are per language and
 * measured off the rendered clips with word-level speech-to-text — not
 * guessed, and not shared. English also needs a third beat in the scenes where
 * its line is long; the number of entries here is the number of `capN` keys
 * the scene has in that language.
 *
 * Re-record a line and these numbers are stale. Re-measure them.
 */
const CAP_AT = {
  en: {
    s1: [0.0, 2.58],
    s2: [0.0, 4.04, 7.84],
    s3: [0.0, 4.14],
    s4: [0.0, 3.12],
    s5: [0.0, 2.66],
    s6: [0.0, 2.36],
    s7: [0.0, 3.96, 7.94],
    s8: [0.0, 2.5],
    s9: [0.0, 3.98, 7.14],
  },
  zh: {
    s1: [0, 1.74],
    s2: [0, 6.12],
    s3: [0, 2.08],
    s4: [0, 3.22],
    s5: [0, 2.36],
    s6: [0, 1.34],
    s7: [0, 5.14],
    s8: [0, 1.62],
    s9: [0, 3.4],
  },
};
function capsFor(id) {
  const times = (CAP_AT[LANG] || CAP_AT.en)[id] || [0];
  const out = [];
  for (let i = 0; i < times.length; i++) {
    const html = t(id + '.cap' + (i + 1));
    if (html) out.push({ at: times[i], html: html });
  }
  return out;
}

/** For plain-text copy that has to be dropped into an innerHTML string. */
function escText(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

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
    if (LANG === 'zh') {
      // Traditional first: a zh-CN voice reads these characters with Mainland
      // pronunciation and vocabulary, which is not the page this film is on.
      voice = vs.find((x) => /^zh[-_](TW|HK|Hant)/i.test(x.lang)) || vs.find((x) => /^zh/i.test(x.lang)) || null;
      return;
    }
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
    u.lang = LANG === 'zh' ? 'zh-TW' : 'en-US';
    u.rate = 1.03; u.pitch = 1.07; u.volume = 1;
    u.onstart = () => { host.classList.add('speaking'); startMouth(null); rampMusic(MUSIC_DUCK, 260); };
    u.onend = () => { host.classList.remove('speaking'); stopMouth(); rampMusic(MUSIC_FULL, 550); };
    try { speechSynthesis.speak(u); } catch (e) {}
  }

  /* --------------------- lip-sync (synthesized mouth) ------------------- */
  // BOBO's mouth is driven by a synthesized "chatter" while a clip plays.
  // We deliberately do NOT tap the voiceover with a Web Audio analyser:
  // routing a media element through createMediaElementSource() silences
  // playback in iOS WebKit / in-app webviews (the bug where the voice
  // vanished but the SFX clicks kept playing). The element plays on its own
  // reliable output instead.
  let mouthRAF = null, chatterT = 0;
  const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function setMouth(open) {
    const m = host && host.querySelector('#alienMouth'); if (!m) return;
    const o = Math.max(0, Math.min(1, open));
    m.style.transform = 'scaleY(' + (0.18 + o).toFixed(3) + ') scaleX(' + (1 - o * 0.14).toFixed(3) + ')';
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
  const closeBtn = el('button', 'film-close', null, t('ui.close'));
  top.appendChild(closeBtn);

  const stageWrap = el('div', 'film-stagewrap');
  const stage = el('div', 'film-stage');
  stageWrap.appendChild(stage);
  // The stage is a picture of the app, not a copy of it. Scenes draw <button>
  // elements to mime taps, and those have no accessible name and nothing to
  // operate — reachable by Tab they are just dead stops between the real
  // controls. The film's meaning reaches a screen reader through the caption
  // and the voiceover instead.
  stageWrap.setAttribute('aria-hidden', 'true');
  if ('inert' in HTMLElement.prototype) stageWrap.inert = true;

  const host = el('div', 'film-host');
  host.innerHTML =
    '<div class="film-host-tada">' + t('ui.tada') + '</div>' +
    '<div class="film-host-ring"><div class="film-host-inner">' + hostSVG() + '</div></div>' +
    '<div class="film-wave"><i></i><i></i><i></i><i></i><i></i></div>' +
    '<div class="film-host-name">' + t('ui.hostName') + '</div>';

  const caption = el('div', 'film-caption');

  const controls = el('div', 'film-controls');
  const prog = el('div', 'film-progress', null, '<span></span>');
  const progFill = prog.firstChild;
  const muteBtn = el('button', 'film-btn', null, t('ui.soundOn'));
  const pauseBtn = el('button', 'film-btn', null, t('ui.pause'));
  const replayBtn = el('button', 'film-btn', null, t('ui.replay'));
  const time = el('div', 'film-time', null, '0:00 / 1:37');
  controls.append(prog, time, pauseBtn, muteBtn, replayBtn);

  const end = el('div', 'film-end');
  end.innerHTML =
    '<img src="/assets/logo.png" alt="Tadapop"/>' +
    '<h3>' + t('end.headline') + '</h3>' +
    '<div class="film-end-row">' +
    '<button class="film-cta" data-act="install">' + escText(t('cta.getBeta')) + '</button>' +
    '<button class="film-btn" data-act="replay">' + t('end.watchAgain') + '</button>' +
    '<button class="film-btn" data-act="close">' + t('end.close') + '</button>' +
    '</div>';

  const unmute = el('button', 'film-unmute', null, t('ui.tapForSound'));
  overlay.append(stageWrap, host, caption, top, controls, unmute, end);

  /* --------------------------- engine state ----------------------------- */
  let sceneAnims = [], sceneTimers = [], rootAnims = [], idx = -1, playing = false, timeTimer = null, curAudio = null;
  let paused = false, pausedAt = 0, clockT0 = 0, clockHeld = 0;
  function anim(node, frames, opts) {
    const a = node.animate(frames, Object.assign({ duration: 600, fill: 'both', easing: 'ease' }, opts || {}));
    sceneAnims.push(a); return a;
  }
  /* A scene is choreographed out of setTimeout calls, and a setTimeout cannot
     be paused — so each one remembers the function it owes and the moment it
     is due. Pausing clears the real timer and keeps the debt; resuming
     re-arms it for whatever was left. */
  function after(ms, fn) {
    const rec = { fn: fn, due: performance.now() + ms };
    rec.id = setTimeout(function () { rec.done = true; fn(); }, ms);
    sceneTimers.push(rec);
    return rec;
  }
  function clearScene() {
    sceneAnims.forEach((a) => { try { a.cancel(); } catch (e) {} });
    sceneTimers.forEach((t) => clearTimeout(t.id));
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

  /* A scene's length is the English performance's length, and Chinese does not
     always fit in it. Where the gap is only rhythm, the Chinese is cut to fit —
     that is the rule everywhere else in this film and it holds.
     
     s1 is where it stopped holding. The cold open is a two-part joke: the first
     caption establishes that you are the one always saying "tomorrow", the
     second lands it by having tomorrow turn up for work. Cutting the setup to
     fit five seconds left 「明天已經打卡了」 on screen with nothing behind it,
     which is not a tighter joke — it is half of one. The scene gets the extra
     second instead. English is untouched. */
  const SCENE_DUR = { zh: { s1: 6200 } };
  const durOverrides = SCENE_DUR[LANG];
  if (durOverrides) scenes.forEach((sc) => { if (durOverrides[sc.id]) sc.dur = durOverrides[sc.id]; });
  const TOTAL = scenes.reduce((s, x) => s + x.dur, 0);
  time.textContent = '0:00 / ' + fmtClock(TOTAL);

  // The launch button used to carry a hand-written running time and it drifted:
  // it promised 90 seconds for a film whose own clock read 1:15. Only the
  // scenes know how long the film is, so the button asks them.
  const lengthEl = launch.querySelector('.film-launch-time');
  if (lengthEl) lengthEl.textContent = t('ui.filmLength', { n: Math.round(TOTAL / 1000) });

  /* ---- pre-recorded voiceover (ElevenLabs) ----
     One MP3 per scene per language: /assets/vo/<id>.mp3 in English (voice:
     Liam) and /assets/vo/zh/<id>.mp3 in Traditional Chinese (voice: Akun, a
     native Taiwan-Mandarin speaker). Bump VOV to bust the CDN cache when
     regenerating. Falls back to the browser voice if a clip won't load/play.

     /zh shipped for a while with no clips at all and fell through to
     speechSynthesis, which stalled mid-sentence and read the lines in
     whichever Chinese voice the OS happened to have installed. Both languages
     are a recorded performance now, and sayTTS() is only a safety net for a
     clip that fails to download.

     Every clip is cut to finish inside its scene's `dur` — see tools/
     generate-vo.mjs, which measures each render and rejects one that would be
     truncated by the scene change. */
  const VOV = 7;
  const VO_DIR = LANG === 'zh' ? '/assets/vo/zh/' : '/assets/vo/';
  function voSrc(id) { return VO_DIR + id + '.mp3?v=' + VOV; }

  /* ONE element for all nine lines, re-pointed per scene.
     There used to be nine, one per clip, and on iOS the voice died partway
     through every viewing while the music kept going. iOS unlocks media
     elements one at a time, and only the ones you call play() on inside a
     user gesture — so the tap that started the sound unlocked the clip that
     happened to be playing, and the music, and nothing else. Every later
     scene called play() on an element the browser had never been given
     permission for, and it was refused.

     A single element unlocked once stays unlocked however many times its src
     changes afterwards, which is why this is the shape to keep. Do not go
     back to an element per clip to get preloading — warm the HTTP cache
     instead, as below. */
  const voEl = new Audio();
  voEl.preload = 'auto';

  /* Prefetch through the HTTP cache rather than through media elements, so
     the clips are local by the time the element asks for them without
     creating ten decoders iOS has to keep alive. */
  let voWarmed = false;
  function warmVO() {
    if (voWarmed) return;
    voWarmed = true;
    scenes.forEach((sc) => { if (sc.id) { try { fetch(voSrc(sc.id), { cache: 'force-cache' }).catch(() => {}); } catch (e) {} } });
  }
  /* ---- score bed (ElevenLabs Music — chiptune) ----
     One 78-second track under the whole 74.8-second film. A plain <audio>
     element rather than a Web Audio node, for the same reason the voiceover is
     one: createMediaElementSource() silences media playback in iOS WebKit.

     THE LEVEL LIVES IN THE FILE, NOT IN THIS CODE. iOS ignores
     HTMLMediaElement.volume outright — there it is effectively read-only, and
     only the hardware buttons move it. So every volume set below does nothing
     on an iPhone, and the bed as originally mastered (-10.6 LUFS, a good 7 dB
     LOUDER than the -17.7 LUFS narration) simply buried BOBO for the whole
     film. The mp3 is now mastered to about -34 LUFS, roughly 16 LU under the
     voice, which is what actually makes the speech audible on a phone. If you
     replace the track, match that measurement — ffmpeg -af ebur128 — rather
     than turning a number down here, or iOS will not hear the difference.

     The ducking below is a refinement for the browsers that honour volume,
     not the thing keeping the narration clear. The ramp is stepped by hand
     because HTMLMediaElement.volume has no scheduled automation the way a
     GainNode does — and routing this through a GainNode is not an option,
     see the note on the voiceover element. */
  const MUSIC_FULL = 1, MUSIC_DUCK = 0.45;
  const music = new Audio('/assets/music/film-bed.mp3?v=' + VOV);
  music.preload = 'auto';
  music.loop = true; // the end card outlasts the track
  music.volume = 0;
  let musicRamp = null, musicOff = null;
  function rampMusic(to, ms) {
    clearInterval(musicRamp);
    const from = music.volume, steps = Math.max(1, Math.round(ms / 40));
    let i = 0;
    musicRamp = setInterval(() => {
      i++;
      try { music.volume = Math.max(0, Math.min(1, from + (to - from) * (i / steps))); } catch (e) {}
      if (i >= steps) { clearInterval(musicRamp); musicRamp = null; }
    }, 40);
  }
  /** `rewind` on a fresh play; false when un-muting part-way through. */
  function startMusic(rewind) {
    if (muted) return;
    clearTimeout(musicOff);
    if (rewind) { try { music.currentTime = 0; } catch (e) {} music.volume = 0; }
    const p = music.play();
    // Autoplay policy can refuse this; the film is still watchable without it.
    if (p && p.catch) p.catch(() => {});
    rampMusic(MUSIC_FULL, 900);
  }
  function stopMusic() {
    clearInterval(musicRamp); musicRamp = null;
    clearTimeout(musicOff);
    try { music.pause(); } catch (e) {}
  }
  /** Under the closing card, let it go rather than looping at somebody. */
  function fadeOutMusic() {
    rampMusic(0, 1800);
    clearTimeout(musicOff);
    musicOff = setTimeout(stopMusic, 1900);
  }

  function stopVO() {
    if (curAudio) { try { curAudio.pause(); } catch (e) {} curAudio.onended = null; curAudio = null; }
    // The element is reused, so leave its src alone — reloading it here would
    // throw away the buffered clip and re-fetch on every scene change.
    try { speechSynthesis.cancel(); } catch (e) {}
    host.classList.remove('speaking');
    stopMouth();
  }
  /** A clip that will not play at all — drop back to the browser voice. */
  function voFailed(a, sc) {
    if (curAudio !== a) return;
    host.classList.remove('speaking');
    stopMouth();
    rampMusic(MUSIC_FULL, 550);
    sayTTS(sc.vo);
  }
  function playVO(sc) {
    stopVO();
    if (muted || !sc) return;
    if (sc.id) {
      const a = voEl;
      curAudio = a;
      // Re-pointing the element is what keeps the iOS unlock — see voEl.
      if (a.getAttribute('src') !== voSrc(sc.id)) a.src = voSrc(sc.id);
      try { a.currentTime = 0; } catch (e) {}
      a.volume = 1;
      host.classList.add('speaking');
      a.onended = () => { if (curAudio === a) { host.classList.remove('speaking'); stopMouth(); rampMusic(MUSIC_FULL, 550); } };
      rampMusic(MUSIC_DUCK, 260);
      const p = a.play();
      // Drive the mouth with the synthesized "chatter" — do NOT route the VO
      // element through Web Audio. createMediaElementSource() silences media
      // playback in iOS WebKit / in-app webviews (SFX oscillators are fine),
      // which dropped the voiceover while clicks kept playing.
      startMouth(null);
      if (p && p.catch) {
        p.catch((err) => {
          if (curAudio !== a) return;
          // Pointing the element at a new clip and playing it in the same tick
          // makes Safari reject the previous request with AbortError. That is
          // this code doing its job, not a failure — retry once the new clip
          // is ready before giving up and falling back to the browser voice.
          if (err && err.name === 'AbortError') {
            a.addEventListener('canplay', function once() {
              a.removeEventListener('canplay', once);
              if (curAudio !== a || muted) return;
              const q = a.play();
              if (q && q.catch) q.catch(() => voFailed(a, sc));
            }, { once: true });
            return;
          }
          voFailed(a, sc);
        });
      }
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
    clockT0 = performance.now();
    clockHeld = 0;
    clearInterval(timeTimer);
    timeTimer = setInterval(() => {
      if (!playing || paused) return;
      const e = Math.min(TOTAL, performance.now() - clockT0 - clockHeld);
      time.textContent = fmtClock(e) + ' / ' + fmtClock(TOTAL);
    }, 250);
  }

  /* --------------------------- focus management -------------------------
     The overlay is aria-modal, which promises a screen reader that nothing
     outside it exists any more. Without focus moving in, that promise is a
     trap: the reader is sealed into a dialog it was never placed inside, and
     Tab keeps walking the page behind the film. So focus enters on open, is
     kept inside while the film runs, and is handed back to whatever opened it.

     `trapTargets` deliberately skips the stage — see where it is built. */
  let lastFocused = null;
  let hideTimer = null;
  const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function trapTargets() {
    return [].slice.call(overlay.querySelectorAll(FOCUSABLE))
      .filter((n) => !stageWrap.contains(n) && n.getClientRects().length);
  }

  function play(startMuted) {
    // Where to hand focus back. Anything already inside the overlay is not an
    // answer — Replay and a reopen during the close fade both re-enter here
    // from a button in the film itself — so those fall back to the launcher.
    if (!lastFocused) {
      const was = document.activeElement;
      lastFocused = was && was !== document.body && !overlay.contains(was) ? was : launch;
    }
    playing = true;
    paused = false;
    clockHeld = 0;
    pauseBtn.textContent = t('ui.pause');
    pauseBtn.setAttribute('aria-pressed', 'false');
    muted = !!startMuted;
    muteBtn.textContent = muted ? t('ui.soundOff') : t('ui.soundOn');
    unmute.style.display = muted ? 'block' : 'none';
    end.classList.remove('show');
    // Reopening inside the close fade would otherwise let that fade's pending
    // "now hide it" fire over the top of an open film — and now that focus
    // lives inside, hiding it would strand focus on a display:none button.
    clearTimeout(hideTimer);
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    // Close first: the one control every visitor needs, and the safe landing
    // spot for someone who cannot see that a film has taken over the page.
    // Not inside the rAF below — that never runs in a background tab, and
    // where focus sits must not depend on whether a fade got to start.
    try { closeBtn.focus(); } catch (e) {}
    requestAnimationFrame(() => overlay.classList.add('show'));
    fit();
    if (!muted) ac();
    warmVO();
    startMusic(true);
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

  /* ---- pause / resume ----
     Everything that moves has to stop together, and each kind stops its own
     way: Web Animations pause in place, the scene timers hand back what they
     still owe (see `after`), and the two media elements pause where they are.
     The clock keeps its own tally of time spent held so the readout does not
     jump forward over a pause.

     The mouth is stopped rather than frozen mid-shape: a held-open mouth on a
     silent frame reads as a bug, a closed one reads as someone waiting. */
  function setPaused(on) {
    if (!playing || paused === on) return;
    paused = on;
    pauseBtn.textContent = t(on ? 'ui.resume' : 'ui.pause');
    pauseBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    const anims = sceneAnims.concat(rootAnims);

    if (on) {
      pausedAt = performance.now();
      sceneTimers.forEach((r) => {
        if (r.done) return;
        clearTimeout(r.id);
        r.left = Math.max(0, r.due - pausedAt);
      });
      anims.forEach((a) => { try { a.pause(); } catch (e) {} });
      if (curAudio) { try { curAudio.pause(); } catch (e) {} }
      clearInterval(musicRamp); musicRamp = null;
      try { music.pause(); } catch (e) {}
      host.classList.remove('speaking');
      stopMouth();
      return;
    }

    clockHeld += performance.now() - pausedAt;
    sceneTimers.forEach((r) => {
      if (r.done || r.left == null) return;
      r.due = performance.now() + r.left;
      r.id = setTimeout(function () { r.done = true; r.fn(); }, r.left);
      r.left = null;
    });
    anims.forEach((a) => { try { a.play(); } catch (e) {} });
    if (!muted) {
      // Only if the clip had not already finished before the pause — resuming
      // a played-out element would replay a line the viewer just heard.
      if (curAudio && !curAudio.ended) {
        const p = curAudio.play();
        if (p && p.catch) p.catch(() => {});
        host.classList.add('speaking');
        startMouth(null);
      }
      startMusic(false);
    }
  }

  function finish() {
    playing = false;
    paused = false;
    stopVO();
    fadeOutMusic();
    end.classList.add('show');
  }

  function closeFilm() {
    playing = false;
    paused = false;
    clearScene();
    rootAnims.forEach((a) => { try { a.cancel(); } catch (e) {} });
    clearInterval(timeTimer);
    stopVO();
    stopMusic();
    unmute.style.display = 'none';
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    // Focus has to leave with the dialog. Dropped on <body> it would restart
    // keyboard navigation at the top of the document, which is a long way back
    // for someone who was three quarters of the way down the page.
    if (lastFocused && lastFocused.focus) { try { lastFocused.focus(); } catch (e) {} }
    lastFocused = null;
    hideTimer = setTimeout(() => { overlay.hidden = true; }, 380);
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
    muteBtn.textContent = t('ui.soundOn');
    unmute.style.display = 'none';
    ac();
    startMusic(!playing);
    if (playing && idx >= 0 && scenes[idx]) playVO(scenes[idx]);
  }
  launch.addEventListener('click', () => play(false));
  closeBtn.addEventListener('click', closeFilm);
  replayBtn.addEventListener('click', () => play(false));
  unmute.addEventListener('click', enableSound);
  pauseBtn.addEventListener('click', () => setPaused(!paused));
  muteBtn.addEventListener('click', () => {
    if (muted) { enableSound(); return; }
    muted = true;
    muteBtn.textContent = t('ui.soundOff');
    stopVO();
    stopMusic();
  });
  end.addEventListener('click', (e) => {
    const act = e.target && e.target.getAttribute('data-act');
    if (act === 'replay') play();
    else if (act === 'close') closeFilm();
    else if (act === 'install') { closeFilm(); const sec = document.getElementById('get'); if (sec) setTimeout(() => sec.scrollIntoView({ behavior: 'smooth', block: 'start' }), 450); else location.hash = '#get'; }
  });
  document.addEventListener('keydown', (e) => {
    if (overlay.hidden) return;
    if (e.key === 'Escape') { closeFilm(); return; }
    // Space is the universal play/pause. Let it through when a button has
    // focus, though — there it belongs to the button.
    if ((e.key === ' ' || e.key === 'Spacebar') && !(document.activeElement && document.activeElement.tagName === 'BUTTON')) {
      e.preventDefault(); setPaused(!paused); return;
    }
    if (e.key !== 'Tab') return;

    const list = trapTargets();
    if (!list.length) { e.preventDefault(); return; }
    const first = list[0], last = list[list.length - 1];
    const at = document.activeElement;
    const inside = overlay.contains(at) && !stageWrap.contains(at);

    if (!inside) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
    else if (e.shiftKey && at === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && at === last) { e.preventDefault(); first.focus(); }
  });

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

  // Bobo — painted hero (raster), riggable via layered overlays:
  // .ag-bob (whole-body bob while speaking), .ag-eye (eye layer scales to
  // blink), #alienMouth (audio lip-sync mouth overlay). Antennae + arms live
  // in the base art; liveliness comes from the body bob + blink + lip-sync.
  function hostSVG() {
    var b = '/assets/host/';
    return '' +
      '<div class="bobo-fit"><div class="bobo ag-bob">' +
      '<img class="bobo-layer bobo-base" src="' + b + 'bobo-base.png" alt="" draggable="false">' +
      '<img class="bobo-layer ag-eye bobo-eye" src="' + b + 'bobo-eye.png" alt="" draggable="false">' +
      '<img class="bobo-layer bobo-mouth" id="alienMouth" src="' + b + 'bobo-mouth.png" alt="" draggable="false">' +
      '</div></div>';
  }
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
  function header(streakVal, tpoints) {
    const h = el('div', 'fm-panel', { padding: '14px 18px', marginBottom: '12px' });
    h.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:16px">' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<span style="width:12px;height:12px;border-radius:99px;background:' + COL.amber + ';box-shadow:0 0 16px 2px rgba(255,180,84,.8)"></span>' +
          '<div><div class="fm-disp" style="font-weight:900;letter-spacing:.22em;font-size:16px">' + t('app.missionControl') + '</div>' +
          '<div class="fm-mono" style="color:' + COL.dim + ';font-size:10px;letter-spacing:.15em;margin-top:5px">' + t('app.todayOnTrack') + '</div></div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:24px">' +
          '<div style="text-align:right"><div class="fm-mono" style="color:' + COL.faint + ';font-size:9px;letter-spacing:.18em">' + t('app.streak') + '</div>' +
          '<div class="fm-disp js-streak" style="font-weight:700;font-size:22px;color:' + COL.amber + '">' + streakVal + '<span style="font-size:11px;color:' + COL.dim + ';margin-left:3px">' + t('app.dayUnit') + '</span></div></div>' +
          '<div style="text-align:right"><div class="fm-mono" style="color:' + COL.faint + ';font-size:9px;letter-spacing:.18em">' + t('app.tpoints') + '</div>' +
          '<div class="fm-disp js-tp" style="font-weight:700;font-size:22px;color:' + COL.amber + '">' + tpoints + '</div></div>' +
        '</div>' +
      '</div>';
    return h;
  }
  function missionRow(opts) {
    // opts: { title, meta, kind:'binary'|'count'|'timer', cat }
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
    const flo = el('span', 'fm-float', { right: '18px', top: '6px' });
    mid.appendChild(flo);
    row.append(tg, mid);
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
  function floatTpoint(row) {
    row._float.textContent = '+1';
    anim(row._float, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(-4px)' }, { opacity: 0, transform: 'translateY(-22px)' }], { duration: 1000, easing: 'ease-out' });
  }

  /* ----------------------------- Scene 1 ----------------------------- */
  const s1 = {
    id: 's1', dur: 5000,
    vo: t('s1.vo'),
    caps: capsFor('s1'),
    render(node) {
      const wrap = el('div', null, { position: 'absolute', inset: '0', display: 'grid', placeItems: 'center' });
      const box = el('div', null, { textAlign: 'center' });
      const logo = el('img', null, { width: '110px', height: '110px', borderRadius: '26px', boxShadow: '0 0 60px rgba(255,180,84,.3)' });
      logo.src = '/assets/logo.png';
      const title = el('div', 'fm-disp', { fontWeight: '900', fontSize: '60px', letterSpacing: '4px', marginTop: '22px', color: COL.ink });
      title.textContent = 'TADAPOP';
      const sub = el('div', 'fm-mono', { fontSize: '14px', letterSpacing: '.3em', color: COL.amber, marginTop: '10px' });
      sub.textContent = t('s1.brandSub');
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
    vo: t('s2.vo'),
    caps: capsFor('s2'),
    render(node) {
      const c = appCol(node, 600);
      c.appendChild(header(11, 47));
      const panel = el('div', 'fm-panel', { padding: '14px 16px 16px' });
      panel.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
        '<span class="fm-mono" style="font-size:12px;letter-spacing:.2em;color:' + COL.dim + '">' + t('app.missionsToday') + '</span>' +
        '<span class="fm-mono js-count" style="font-size:13px;font-weight:700;color:' + COL.ink + '">1/4</span></div>';
      const r1 = missionRow({ title: t('s2.mInbox'), meta: t('s2.metaDaily'), kind: 'binary', cat: COL.amber });
      const r2 = missionRow({ title: t('s2.mWater'), meta: t('s2.metaWater', { n: 5 }), kind: 'count', cat: COL.teal });
      const r3 = missionRow({ title: t('s2.mRead'), meta: t('s2.metaPages'), kind: 'count', cat: COL.blue });
      const r4 = missionRow({ title: t('s2.mDeepWork'), meta: t('s2.metaTimer'), kind: 'timer', cat: COL.amber });
      // pre-set r3 done
      complete(r3, t('s2.metaPages'));
      panel.append(r1, r2, r4); panel.insertBefore(r3, r4);
      c.appendChild(panel);
      const count = panel.querySelector('.js-count');

      // choreograph
      after(900, () => { complete(r1); count.textContent = '2/4'; });
      // water count up 5 -> 8
      let g = 5;
      const tickWater = () => { g++; r2._metric.textContent = t('s2.metaWater', { n: g }); anim(r2._tg, [{ transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 200 }); sfx.tick(); if (g < 8) after(380, tickWater); else after(150, () => { complete(r2, t('s2.metaWater', { n: 8 })); count.textContent = '3/4'; }); };
      after(2200, tickWater);
      // timer starts running, bar fills, completes
      after(5200, () => { r4._tg.classList.add('run'); r4._tg.innerHTML = pauseIcon(); r4._metric.textContent = t('s2.metaTimerLeft'); r4._metric.style.color = COL.blue; anim(r4._bar, [{ width: '0%' }, { width: '100%' }], { duration: 6000, fill: 'both', easing: 'linear' }); });
      after(11400, () => { complete(r4, t('s2.metaTimerDone')); count.textContent = '4/4'; count.style.color = COL.go; sfx.chime(); });
    },
  };

  /* ----------------------------- Scene 3 ----------------------------- */
  const s3 = {
    id: 's3', dur: 9200,
    vo: t('s3.vo'),
    caps: capsFor('s3'),
    render(node) {
      const c = appCol(node, 560);
      const head = header(12, 47);
      c.appendChild(head);
      const tpLabel = head.querySelector('.js-tp');
      const panel = el('div', 'fm-panel', { padding: '16px' });
      const r = missionRow({ title: t('s3.mission'), meta: t('s3.metaTimer'), kind: 'binary', cat: COL.teal });
      panel.appendChild(r);
      // the day's all-or-nothing payout, revealed once the last mission clears
      const cleared = el('div', 'fm-cleared', { opacity: '0', marginTop: '14px' });
      cleared.innerHTML = '<span style="width:9px;height:9px;border-radius:99px;background:' + COL.go + ';box-shadow:0 0 12px 2px rgba(91,227,155,.8)"></span> ' + t('s3.cleared');
      panel.appendChild(cleared);
      c.appendChild(panel);

      after(700, () => { complete(r, t('s3.metaDone')); floatTpoint(r); });
      after(1500, () => {
        anim(cleared, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 450, fill: 'both' });
        sfx.chime();
      });
      after(2300, () => {
        // Tpoints tick up — one more cleared day
        countUp(tpLabel, 47, 48, 500);
        anim(tpLabel, [{ transform: 'scale(1)', color: COL.go }, { transform: 'scale(1.3)' }, { transform: 'scale(1)', color: COL.amber }], { duration: 650, easing: POP, fill: 'both' });
      });
    },
  };

  /* ----------------------------- Scene 4 ----------------------------- */
  const s4 = {
    id: 's4', dur: 8400,
    vo: t('s4.vo'),
    caps: capsFor('s4'),
    render(node) {
      const c = appCol(node, 560);
      const panel = el('div', 'fm-panel', { padding: '18px' });
      panel.innerHTML =
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">' +
          '<div class="fm-seg">' + '<i></i><i></i><i></i><i></i><i></i>'.replace(/<i>/g, '<i>') + '</div>' +
          '<span class="fm-mono js-count" style="font-size:13px;font-weight:700;color:' + COL.ink + '">2/5</span></div>';
      const segWrap = panel.querySelector('.fm-seg');
      const cleared = el('div', 'fm-cleared', { opacity: '0', marginBottom: '16px' });
      cleared.innerHTML = '<span style="width:9px;height:9px;border-radius:99px;background:' + COL.go + ';box-shadow:0 0 12px 2px rgba(91,227,155,.8)"></span> ' + t('s4.cleared');
      panel.appendChild(cleared);
      // streak + rest day row
      const bottom = el('div', null, { display: 'flex', gap: '12px', marginTop: '4px' });
      const stat = el('div', 'fm-panel fm-stat', { flex: '1', textAlign: 'center' });
      stat.innerHTML = '<div class="k">' + t('app.dayStreak') + '</div><div class="v js-streak">11' + t('app.dayUnit') + '</div>';
      const longest = el('div', 'fm-panel fm-stat', { flex: '1', textAlign: 'center' });
      longest.innerHTML = '<div class="k">' + t('app.longest') + '</div><div class="v">23' + t('app.dayUnit') + '</div>';
      bottom.append(stat, longest); panel.appendChild(bottom);
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
        after(700, () => { countUp(stat.querySelector('.js-streak'), 11, 12, 600, (v) => v + t('app.dayUnit')); anim(stat, [{ boxShadow: '0 0 0 0 rgba(255,180,84,0)' }, { boxShadow: '0 0 26px -4px rgba(255,180,84,.6)' }, { boxShadow: '0 0 0 0 rgba(255,180,84,0)' }], { duration: 900 }); });
      }
      // A rest-day highlight used to live here. Both the `rest` container and
      // the `.js-rest` element it looked for are gone — neither is created
      // anywhere in this file — so the timer only ever threw an uncaught
      // ReferenceError 6.8s into the scene, on every play, in both languages.
      // Deleted rather than rebuilt: scene 4 is about the streak climbing, and
      // it reads fine without a rest day in it.
    },
  };

  /* ----------------------------- Scene 5 ----------------------------- */
  const s5 = {
    id: 's5', dur: 6800,
    vo: t('s5.vo'),
    caps: capsFor('s5'),
    render(node) {
      const c = appCol(node, 560, true);
      // stat cards
      const stats = el('div', null, { display: 'flex', gap: '10px', marginBottom: '12px' });
      [[t('app.dayStreak'), '12' + t('app.dayUnit')], [t('app.longest'), '23' + t('app.dayUnit')], [t('app.tpoints'), '142'], [t('app.completion'), '86%']].forEach(([k, v]) => {
        const s = el('div', 'fm-panel fm-stat'); s.innerHTML = '<div class="k">' + k + '</div><div class="v">' + v + '</div>'; stats.appendChild(s);
      });
      c.appendChild(stats);
      // heatmap — a full year, GitHub-style (52 weeks × 7 days)
      const WEEKS = 52;
      const hm = el('div', 'fm-panel', { padding: '16px' });
      hm.innerHTML = '<div class="fm-mono" style="font-size:11px;letter-spacing:.2em;color:' + COL.dim + ';margin-bottom:12px">' + t('s5.heatmap') + '</div>';
      const grid = el('div', null, { display: 'flex', gap: '3px', maxWidth: '520px', margin: '0 auto' });
      const cells = [];
      for (let w = 0; w < WEEKS; w++) {
        const col = el('div', null, { display: 'grid', gridTemplateRows: 'repeat(7,1fr)', gap: '3px', flex: '1' });
        for (let d = 0; d < 7; d++) { const cell = el('div', 'fm-cell'); col.appendChild(cell); cells.push({ cell, w, d }); }
        grid.appendChild(col);
      }
      hm.appendChild(grid); c.appendChild(hm);
      // completion bars
      const cr = el('div', 'fm-panel', { padding: '16px', marginTop: '12px' });
      cr.innerHTML = '<div class="fm-mono" style="font-size:11px;letter-spacing:.2em;color:' + COL.dim + ';margin-bottom:12px">' + t('s5.byMission') + '</div>';
      [[t('s5.barWater'), 92, COL.teal], [t('s5.barDeepWork'), 78, COL.amber], [t('s5.barMeditate'), 84, COL.blue]].forEach(([label, pct, col]) => {
        const row = el('div', null, { marginBottom: '9px' });
        row.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:5px">' +
          '<span class="fm-disp" style="font-size:14px">' + label + '</span><span class="fm-mono" style="font-size:12px">' + pct + '%</span></div>' +
          '<div style="height:7px;border-radius:4px;background:rgba(79,91,118,.22);overflow:hidden"><div class="js-pb" data-pct="' + pct + '" style="height:100%;width:0%;background:' + col + ';opacity:.85;border-radius:4px"></div></div>';
        cr.appendChild(row);
      });
      c.appendChild(cr);

      // animate cells filling green (deterministic-ish pattern, increasing density)
      const greens = ['rgba(91,227,155,.28)', 'rgba(91,227,155,.55)', COL.go];
      cells.forEach((o, i) => {
        const seed = (o.w * 7 + o.d);
        const density = 0.35 + (o.w / WEEKS) * 0.6;          // ramps up over the year
        const on = ((seed * 53) % 100) / 100 < density;
        if (!on) return;
        const lvl = (seed % 7 === 0) ? 2 : (seed % 3 === 0) ? 1 : 0;
        after(300 + o.w * 55 + ((o.d * 37) % 80), () => {
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
    id: 's6', dur: 5900,
    vo: t('s6.vo'),
    caps: capsFor('s6'),
    render(node) {
      const c = appCol(node, 560);
      // tabs
      const tabs = el('div', 'fm-panel', { padding: '6px', marginBottom: '14px', display: 'flex', gap: '6px' });
      // The Arena tab is the selected one — flagged rather than inferred from
      // the label, which is no longer a fixed English word.
      [['s6.tabToday', false], ['s6.tabStats', false], ['s6.tabArena', true], ['s6.tabProfile', false]].forEach(([key, on]) => {
        const b = el('div', 'fm-mono', { flex: '1', textAlign: 'center', padding: '10px 4px', fontSize: '12px', letterSpacing: '.12em', color: on ? COL.ink : COL.faint, borderBottom: '2px solid ' + (on ? COL.amber : 'transparent') });
        b.textContent = t(key); tabs.appendChild(b);
      });
      c.appendChild(tabs);
      const convene = el('button', 'fm-disp', { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', cursor: 'default', marginBottom: '14px', fontWeight: '700', fontSize: '14px', letterSpacing: '.06em', color: '#1a1206', background: 'linear-gradient(180deg,' + COL.amber + ',' + COL.amberDeep + ')', boxShadow: '0 8px 24px -8px rgba(255,180,84,.6)' });
      convene.textContent = t('s6.convene');
      c.appendChild(convene);
      const card = el('div', 'fm-panel', { padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' });
      card.innerHTML = '<div style="display:flex;align-items:center;gap:12px">' +
        '<span style="font-size:26px">💧</span><div>' +
        '<div class="fm-disp" style="font-weight:700;font-size:17px">' + t('s6.challenge') + '</div>' +
        '<div class="fm-mono" style="font-size:10px;color:' + COL.dim + ';margin-top:3px">' + t('s6.challengeMeta') + '</div></div></div>' +
        '<span class="fm-tag" style="color:' + COL.go + ';border-color:' + COL.go + '">' + t('s6.live') + '</span>';
      c.appendChild(card);
      anim(tabs.children[2], [{ opacity: .4 }, { opacity: 1 }], { duration: 500, fill: 'both' });
      anim(convene, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 500, delay: 400, fill: 'both', easing: POP });
      anim(card, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 550, delay: 900, fill: 'both', easing: POP });
      after(900, () => sfx.pop());
    },
  };

  /* ----------------------------- Scene 7 ----------------------------- */
  const s7 = {
    id: 's7', dur: 10500,
    vo: t('s7.vo'),
    caps: capsFor('s7'),
    render(node) {
      const c = appCol(node, 580);
      const RED = '#FF6B6B';
      const hdr = el('div', 'fm-panel', { padding: '16px 18px', marginBottom: '12px' });
      hdr.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between">' +
        '<div style="display:flex;align-items:center;gap:10px"><span style="font-size:22px">💧</span>' +
        '<span class="fm-disp" style="font-weight:700;font-size:18px">' + t('s6.challenge') + '</span></div>' +
        '<span class="fm-tag" style="color:' + COL.go + ';border-color:' + COL.go + '">' + t('s7.liveDay') + '</span></div>';
      c.appendChild(hdr);
      const board = el('div', 'fm-panel', { padding: '14px 16px' });
      board.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
        '<span class="fm-mono" style="font-size:11px;letter-spacing:.16em;color:' + COL.dim + '">' + t('s7.leaderboard') + '</span>' +
        '<span class="fm-mono" style="font-size:10px;letter-spacing:.18em;color:' + RED + '">' + t('s7.missedCol') + '</span></div>';
      // DAY 3/7: ranked by days completed; the MISSED column is the star stat.
      // `done` is a flag rather than a '✓' sniffed off the subtitle — the
      // subtitle is translated copy and must not double as a data field.
      const data = [
        { name: t('player.a'), me: false, today: t('s7.today', { v: '5/8' }), done: false, missed: 0 },
        { name: t('s7.you'),   me: true,  today: t('s7.today', { v: '6/8' }), done: false, missed: 0 },
        { name: t('player.b'), me: false, today: '',                          done: true,  missed: 1 },
        { name: t('player.c'), me: false, today: t('s7.today', { v: '3/8' }), done: false, missed: 1 },
      ];
      const rows = data.map((p, i) => {
        const row = el('div', 'fm-lb-row' + (p.me ? ' me' : ''));
        row.style.position = 'relative';
        row.innerHTML =
          '<span class="fm-rank' + (i === 0 ? ' lead' : '') + '">' + (i + 1) + '</span>' +
          '<span class="fm-ava' + (p.me ? ' me' : '') + '">' + p.name[0] + '</span>' +
          '<div style="flex:1;min-width:0"><div class="fm-lb-name">' + p.name + (p.me ? ' <span style="color:' + COL.amber + ';font-size:11px">' + t('s7.youTag') + '</span>' : '') + '</div>' +
          '<div class="fm-lb-sub' + (p.done ? ' done' : '') + '">' + (p.done ? t('s7.doneProof') : p.today) + '</div></div>' +
          '<span class="js-miss fm-mono" style="font-weight:700;font-size:16px;width:44px;text-align:right;color:' + (p.missed > 0 ? RED : COL.faint) + '">' + (p.missed > 0 ? '−' + p.missed : '0') + '</span>';
        board.appendChild(row);
        row._rank = row.querySelector('.fm-rank'); row._sub = row.querySelector('.fm-lb-sub'); row._miss = row.querySelector('.js-miss');
        return row;
      });
      c.appendChild(board);

      // a friend finishes; the leader MISSES a day (-1, red) and drops; you finish clean and climb to #1.
      after(1300, () => { rows[3]._sub.textContent = t('s7.today', { v: '7/8' }); sfx.tick(); });
      after(2500, () => {
        rows[0]._sub.textContent = t('s7.missedADay'); rows[0]._sub.style.color = RED;
        rows[0]._miss.textContent = '−1'; rows[0]._miss.style.color = RED;
        anim(rows[0]._miss, [{ transform: 'scale(1.7)' }, { transform: 'scale(1)' }], { duration: 460, easing: POP });
        sfx.whoosh();
      });
      after(4100, () => { rows[1]._sub.textContent = t('s7.doneProof'); rows[1]._sub.classList.add('done'); anim(rows[1]._sub, [{ opacity: .3 }, { opacity: 1 }], { duration: 420 }); sfx.pop(); });
      after(5300, () => {
        const H = rows[1].offsetTop - rows[0].offsetTop;
        anim(rows[1], [{ transform: 'translateY(0)' }, { transform: 'translateY(' + (-H) + 'px)' }], { duration: 650, fill: 'both', easing: 'cubic-bezier(.3,1.1,.3,1)' });
        anim(rows[0], [{ transform: 'translateY(0)' }, { transform: 'translateY(' + (H) + 'px)' }], { duration: 650, fill: 'both', easing: 'cubic-bezier(.3,1.1,.3,1)' });
        sfx.chime();
        after(720, () => {
          rows[1]._rank.textContent = '1'; rows[1]._rank.classList.add('lead');
          rows[0]._rank.textContent = '2'; rows[0]._rank.classList.remove('lead');
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
    id: 's8', dur: 5600,
    vo: t('s8.vo'),
    caps: capsFor('s8'),
    render(node) {
      const c = appCol(node, 560);
      const win = el('div', 'fm-panel', { padding: '24px', textAlign: 'center', marginBottom: '14px', position: 'relative', overflow: 'hidden' });
      win.innerHTML = '<div style="font-size:46px;margin-bottom:6px">🏆</div>' +
        '<div class="fm-mono" style="font-size:10px;letter-spacing:.22em;color:' + COL.faint + ';margin-bottom:8px">' + t('s8.challengeLine') + '</div>' +
        '<div class="fm-disp" style="font-weight:900;font-size:28px;color:' + COL.amber + '">' + t('s8.winner') + '</div>' +
        '<div class="fm-mono" style="font-size:12px;color:' + COL.dim + ';margin-top:6px">' + t('s8.winnerMeta') + '</div>';
      c.appendChild(win);
      // podium standings
      const board = el('div', 'fm-panel', { padding: '16px' });
      board.innerHTML = '<div class="fm-mono" style="font-size:11px;letter-spacing:.18em;color:' + COL.dim + ';margin-bottom:10px">' + t('s8.standings') + '</div>';
      [['🥇', t('s7.you'), '7'], ['🥈', t('player.a'), '6'], ['🥉', t('player.b'), '5'], ['', t('player.c'), '4']].forEach(([m, n, s], i) => {
        const row = el('div', 'fm-lb-row' + (i === 0 ? ' me' : ''));
        row.innerHTML = '<span style="font-size:18px;width:28px;text-align:center">' + m + '</span>' +
          '<span class="fm-disp" style="flex:1;font-size:15px;font-weight:' + (i === 0 ? '700' : '500') + '">' + n + '</span>' +
          '<span class="fm-mono" style="font-size:14px;font-weight:700">' + s + ' <span style="color:' + COL.faint + ';font-size:9px">' + t('s8.daysUnit') + '</span></span>';
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
    id: 's9', dur: 11400,
    vo: t('s9.vo'),
    caps: capsFor('s9'),
    render(node) {
      const wrap = el('div', null, { position: 'absolute', inset: '0', display: 'grid', placeItems: 'center' });
      const box = el('div', null, { textAlign: 'center' });
      const logo = el('img', null, { width: '96px', height: '96px', borderRadius: '22px', boxShadow: '0 0 60px rgba(255,180,84,.3)' });
      logo.src = '/assets/logo.png';
      const title = el('div', 'fm-disp', { fontWeight: '900', fontSize: '40px', letterSpacing: '2px', marginTop: '20px' });
      title.innerHTML = t('s9.title', { amber: COL.amber });
      const cta = el('div', 'fm-disp', { display: 'inline-block', marginTop: '24px', padding: '14px 28px', borderRadius: '10px', background: COL.amber, color: '#1a1205', fontWeight: '700', letterSpacing: '1px', fontSize: '15px' });
      cta.textContent = t('cta.getBeta');
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
