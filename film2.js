/* =====================================================================
   Tadapop explainer film — SECOND CUT, 2026-09-13.

   Same engine as film.js, a different argument. The first cut opens on the
   mechanics — missions, a console, one Tpoint a clean day — which persuades
   somebody who already likes habit trackers. This one opens on the reason
   anybody sticks to anything, which is other people, and lets the mechanics
   arrive once you care.

   film.js is untouched and still the one on the homepage. Both exist so they
   can be compared; whichever loses should then be deleted rather than left to
   rot as a second copy of an engine.

   Its voice lives in /assets/vo2/ so the two can never overwrite each other's
   takes — the scene ids are n1..n9 for the same reason.

   Scene engine + 9 animated scenes.
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

   Chinese terminology follows the app (its src/i18n/zh.ts): 俱樂部 for Club,
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
    'ui.seek': 'Seek',
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
    'cta.getBeta': 'Get the app — iOS & Android →',

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

    /* ---- n1 · cold open: the reason, not the mechanism ---- */
    'n1.brandSub': 'DO IT TOGETHER · KEEP SCORE · NO NAGGING',
    'n1.cap1': 'You already know what you should be doing.',
    'n1.cap2': 'You already know what you should be doing.<br><span class="hi">Nobody sticks to it alone.</span>',
    'n1.vo': 'You already know what you should be doing. Nobody sticks to it alone.',

    /* ---- n2 · pick the thing, pick the people ---- */
    'n2.cap1': 'So pick one thing. Then pick the people who will <span class="hi">notice</span>.',
    'n2.cap2': 'The Club is the third tab — and the one part that needs an account.',
    'n2.cap3': 'Invite-only. <span class="go">No strangers, no feed.</span>',
    'n2.vo': 'So pick one thing, then pick the people who will notice. The Club is the third tab, and the one part that needs an account. Invite only — no strangers, no feed.',

    /* ---- n3 · the deal, in the host's own words ---- */
    /* ---- a2 · it does not have to be the gym ---- */
    'a2.label': 'CHALLENGES YOU COULD START',
    'a2.mMove': '40 MIN A DAY \u00b7 50 DAYS \u00b7 4 PLAYERS',
    'a2.nSleep': 'In bed by 1:00',
    'a2.mSleep': '30 DAYS \u00b7 4 PLAYERS \u00b7 SCREENSHOT',
    'a2.nRead': '20 pages before sleep',
    'a2.mRead': '30 DAYS \u00b7 3 PLAYERS',
    'a2.proofTag': 'PROOF',
    'a2.cap1': 'It does not have to be the gym.',
    'a2.cap2': 'Anything you keep meaning to do and <span class="hi">keep putting off</span>.',
    'a2.vo': 'And it does not have to be the gym. Anything you keep meaning to do and keep putting off — moving more, getting to bed earlier, reading before you sleep.',

    /* ---- a1 / a3 · the create screen, built from photographs of it ---- */
    'a1.screen': 'NEW CHALLENGE',
    'a1.cName': 'CHALLENGE',
    'a1.cHow': 'HOW TO PLAY (OPTIONAL)',
    'a1.howText': 'Work out at least 40 minutes a day.\nYour photo must show the timer.',
    'a1.howNote': 'Everyone in this challenge sees this, including people you invite, before they join.',
    'a1.cDuration': 'DURATION',
    'a1.d7': '7 DAYS',
    'a1.d30': '30 DAYS',
    'a1.dCustom': 'CUSTOM',
    'a1.durNote': 'Counted from the day the host presses start.',
    'a1.cCadence': 'CADENCE',
    'a1.cEvery': 'EVERY DAY',
    'a1.cPerWeek': 'DAYS / WEEK',
    'a1.cadNote': 'Every day, or any few days each week.',
    'a1.cap1': 'Start one and <span class="hi">you are the host</span>.',
    'a1.cap2': 'Name it, say how to play — <span class="go">everyone reads that before they join</span>.',
    'a1.cap3': 'Then how long it runs, and how often.',
    'a1.vo': 'Start one and you are the host. Name it, say how to play — everyone reads that before they join — then set how long it runs, and how often.',

    'a3.cMin': 'MIN PLAYERS TO START',
    'a3.minNote': 'Once this many have joined, you can start it.',
    'a3.cMax': 'MAX PLAYERS',
    'a3.cJoin': 'WHO CAN JOIN',
    'a3.jAnyone': 'ANYONE',
    'a3.jApprove': 'APPROVE FIRST',
    'a3.joinNote': 'Anyone with the code joins instantly.',
    'a3.cInvite': 'WHO CAN INVITE',
    'a3.iAnyone': 'ANYONE',
    'a3.iHost': 'HOST ONLY',
    'a3.invNote': 'Any player can share the code.',
    'a3.cProof': 'PROOF OF COMPLETION',
    'a3.pOff': 'OFF',
    'a3.pRequire': 'REQUIRE PROOF',
    'a3.pType': 'TYPE',
    'a3.pPhoto': 'PHOTO',
    'a3.pVideo': 'VIDEO',
    'a3.pSee': 'SEEN BY',
    'a3.sAll': 'ALL PLAYERS',
    'a3.sHost': 'HOST ONLY',
    'a3.proofNote': 'Proof is required to check in — back out of the camera and the day stays unlogged.',
    'a3.btnCreate': 'CREATE',
    'a3.btnCancel': 'CANCEL',
    'a3.cap1': 'Then who is in it. <span class="hi">Once enough have joined, you start it.</span>',
    'a3.cap2': 'Who can join, who can invite — and whether a check-in needs <span class="hi">a photo, a clip, or both</span>.',
    'a3.cap3': 'Press it, and <span class="go">it exists</span>.',
    'a3.vo': 'Then who is in it. Once enough have joined you start it yourself, and the clock starts then. Who can join, who can invite, and whether a check-in needs a photo, a clip, or both. Then press the button.',

    'a4.badge': '0:38 \u00b7 VIDEO',
    'a4.when': '18:42',
    'a4.r1': 'Under two minutes',
    'a4.r2': 'Plays for seven days',
    'a4.r3': 'Then a still frame is kept',
    'a4.cap1': 'Video proof is just a clip off your phone.',
    'a4.cap2': 'It plays for a week, then <span class="hi">a still frame is kept</span>.',
    'a4.vo': 'And video proof is just a clip off your phone, under two minutes. It plays for a week, then only a still frame is kept.',

    'n3.rulesLabel': 'HOW TO PLAY',
    'n3.rules': 'Forty minutes a day, fifty days straight.\nMiss a day and you owe the pot a hundred.\nWe spend it on dinner at the end.',
    'n3.cap1': 'This is the deal — <span class="hi">everyone read it before they joined</span>.',
    'n3.cap2': 'Miss a day, a little goes in the pot. <span class="go">It buys the night out at the end.</span>',
    'n3.vo': 'And this is the deal, which everyone read before they joined. Miss a day and a little goes in the pot — not as a punishment. It is what buys the night out at the end.',

    /* ---- n4 · checking in ---- */
    'n4.lbLabel': 'LEADERBOARD \u00b7 DAYS DONE',
    'n4.missed': 'NOBODY YET',
    'n4.allDone': 'YOU\u2019RE UP',
    'n4.pending': '0/1 TODAY',
    'n4.logged': '1/1 TODAY',
    'n4.day': 'TODAY \u00b7 DAY 12 OF 50',
    'n4.notLogged': 'Not logged yet',
    'n4.btn': 'CHECK IN \u00b7 ADD PROOF',
    'n4.checkedIn': 'Checked in \u2713',
    'n4.undo': 'UNDO CHECK-IN',
    'n4.cap1': 'Every day, each of you answers the same question. <span class="hi">Did you do it?</span>',
    'n4.cap2': 'Do the work, then <span class="go">come back and log it</span>.',
    'n4.vo': 'Every day, each of you answers the same question. Did you do it? Do the work, then come back and log it.',

    /* ---- n5 · proof, if the group asked for it ---- */
    'n5.proofLabel': 'PROOF · VISIBLE TO ALL PLAYERS',
    'n5.cap1': 'If the group asked for proof, bring a photo or a clip.',
    'n5.cap2': 'Not to catch anyone out. <span class="go">Seeing somebody else go is what gets you out the door.</span>',
    'n5.vo': 'If the group asked for proof, bring a photo or a clip. Not to catch anyone out — seeing somebody else go is what gets you out the door.',

    /* ---- n6 · the board does the nagging ---- */
    'n6.cap1': 'And then the board just — <span class="hi">sits there</span>.',
    'n6.cap2': 'Nobody has to be the one who chases. <span class="go">It already shows.</span>',
    'n6.vo': 'And then the board just sits there. Nobody has to be the one who chases. It already shows.',

    /* ---- n7 · the week ends ---- */
    'n7.cap1': 'Seven weeks later, <span class="hi">the pot buys dinner</span>.',
    'n7.cap2': 'And every one of you did more than you would have <span class="go">alone</span>.',
    'n7.vo': 'Seven weeks later, the pot buys dinner. And every one of you did more than you would have alone. That was the whole point.',

    /* ---- n8 · your own half, quietly ---- */
    'n8.cap1': 'Your own habits are a <span class="hi">separate thing</span> — a list only you see.',
    'n8.cap2': 'Tap, count or time them. Private, offline, <span class="go">no account at all</span>.',
    'n8.vo': 'And your own habits are a separate thing entirely — a list only you see. Tap them, count them, or time them. Private, offline, no account at all.',

    /* ---- n9 · sign-off ---- */
    'n9.cap1': 'Joining someone’s challenge is <span class="go">free, forever</span>.',
    'n9.cap2': 'So ask three people, and <span class="hi">get better at something together</span>.',
    'n9.vo': 'Joining someone’s challenge is free, forever. So ask three people, and get better at something together. Tadapop.',

    /* ---- scene 1 · cold open ---- */
    's1.brandSub': 'DAILY MISSIONS · STREAKS · THE CLUB',
    's1.brandSub.solo': 'DAILY MISSIONS · STREAKS · NO ACCOUNT',
    's1.cap1': 'Yeah, you — the one who keeps saying <span class="hi">tomorrow</span>.',
    /* Carries the setup as well, for the reason the Chinese one does: captions
       replace each other, so a two-part joke lost its first half at the exact
       moment the second half needed it. */
    's1.cap2': 'Yeah, you — the one who keeps saying tomorrow.<br><span class="go">Tomorrow just clocked in.</span>',
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

    /* ---- scene 6 · the Club opens ---- */
    's6.tabToday': 'TODAY',
    's6.tabStats': 'STATS',
    's6.tabClub': 'CLUB',
    's6.tabProfile': 'PROFILE',
    's6.convene': '⚑ CREATE CHALLENGE',
    's6.challenge': '50-Day Movement',
    's6.challengeMeta': '40 MINUTES A DAY · 50 DAYS · 4 PLAYERS',
    's6.live': 'LIVE',
    's6.cap1': 'Doing it solo? <span class="hi">Cute.</span>',
    's6.cap2': 'Drag your friends in — the <span class="hi">Club</span>\'s open.',
    's6.vo': 'Doing it solo? Cute. Drag your friends in — the Club\'s open.',

    /* ---- scene 7 · the live leaderboard ---- */
    's7.liveDay': 'LIVE · DAY 12/50',
    's7.leaderboard': 'LEADERBOARD · MOST DAYS',
    's7.missedCol': 'MISSED',
    's7.today': '{v} DAYS',
    's7.doneProof': '✓ DONE TODAY · 🎬 PROOF',
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
    's8.challengeLine': '🏃 50-DAY MOVEMENT · 50 DAYS',
    's8.winner': 'You — that\'s you!',
    's8.winnerMeta': '46 DAYS · MOST DAYS COMPLETED',
    's8.standings': 'FINAL STANDINGS',
    's8.daysUnit': 'DAYS',
    's8.cap1': 'Win together. Lose together.',
    's8.cap2': 'Get scary good — <span class="hi">together</span>.',
    's8.vo': 'Win together. Lose together. Get scary good — together.',

    /* ---- the solo cut (b1..b6) ----
       Same art as the first film's scenes; a different argument over it.
       The Club cut sells being watched by people you like. This one is the
       opposite of that and has to say so in its first breath, or a viewer
       who wants to be left alone never finds out that they can be. ---- */
    'b1.cap1': 'Tadapop is a checklist for your day — <span class="hi">and nothing else</span>.',
    'b1.cap2': '<span class="go">No account. No feed. Works on a plane.</span>',
    'b1.vo': 'Tadapop is a checklist for your day, and nothing else. No account, no feed, and it works on a plane.',

    'b2.cap1': 'Put the things you actually meant to do on it.',
    'b2.cap2': 'Tap one done, count the water or the pages, or <span class="go">start a timer and disappear</span>.',
    'b2.vo': 'Put the things you actually meant to do on it. Tap one done, count the water or the pages, or start a timer and disappear.',

    'b3.cap1': 'Clear the whole day and it pays out: <span class="go">one Tpoint</span>.',
    'b3.cap2': 'Miss one and it does not — <span class="hi">the day is the unit</span>, not the task.',
    'b3.vo': 'Clear the whole day and it pays out one Tpoint. Miss one and it does not — the day is the unit here, not the task.',

    'b4.cap1': '<span class="go">Day locked.</span> The streak goes up one.',
    'b4.cap2': 'Break it and nothing scolds you. <span class="hi">It simply starts again.</span>',
    'b4.vo': 'Day locked, and the streak goes up one. Break it and nothing scolds you. It simply starts again.',

    'b5.cap1': 'Then one day you look back at a year of this,',
    'b5.cap2': 'and the grid has <span class="go">gone green</span>. Nobody had to see it but you.',
    'b5.vo': 'Then one day you look back at a year of this, and the grid has gone green. Nobody had to see it but you.',

    'b6.cap1': 'Free, offline, and <span class="go">nothing to sign up for</span>.',
    'b6.cap2': 'And when you want company, <span class="hi">the Club is one tab away</span>.',
    'b6.vo': 'Free, offline, and nothing to sign up for. And when you want company, the Club is one tab away. Tadapop.',

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
    'ui.seek': '調整播放位置',
    'ui.pause': '❚❚ 暫停',
    'ui.resume': '▶ 播放',
    'ui.tapForSound': '🔊 點一下開聲音',
    'ui.hostName': '主持人 · <b>BOBO</b>',
    'ui.tada': 'Tada! 🎉',
    'ui.filmLength': '· {n} 秒',
    'end.headline': '你的第一項任務，現在開始。',
    'end.watchAgain': '⟳ 再看一次',
    'end.close': '關閉',
    'cta.getBeta': '下載 App — iOS 與 Android →',

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
       terms that matter. 俱樂部 came back as "重擊場", 鎖定 as "耍定", and s9
       stuttered on 成為. The same lines in Simplified read correctly. The
       model's Mandarin prior is Mainland-weighted; giving it the character
       forms it expects fixes the pronunciation without changing one character
       of what a viewer actually reads.

       tools/generate-vo.mjs transcribes every take back with speech-to-text
       and rejects any that does not match these lines, because the failures
       are per-take: the same text renders correctly on one attempt and slurs
       on the next. Homophone spellings in the transcript are fine (亮/量);
       a changed sound is not. */

    /* ---- n1 ---- */
    'n1.brandSub': '一起做 · 自動記分 · 不用催',
    'n1.cap1': '該做什麼，你其實都知道。',
    'n1.cap2': '該做什麼，你其實都知道。<br><span class="hi">一個人，很難撐下去。</span>',
    'n1.vo': '該做什麼，你其實都知道。一個人，很難撐下去。',

    /* ---- n2 ---- */
    'n2.cap1': '那就挑一件事，再找幾個會<span class="hi">看見你</span>的人。',
    'n2.cap2': '俱樂部是第三個分頁，也是唯一需要帳號的地方。',
    'n2.cap3': '只能邀請加入。<span class="go">沒有陌生人，也沒有動態牆。</span>',
    'n2.vo': '挑一件事，找幾個會看見你的人。俱樂部是第三個分頁，唯一需要帳號的地方。只能邀請加入，沒有動態牆。',

    /* ---- n3 ---- */
    /* ---- a2 · 不一定是運動 ---- */
    'a2.label': '可以開的挑戰',
    'a2.mMove': '每天 40 分鐘 \u00b7 50 天 \u00b7 4 位成員',
    'a2.nSleep': '晚上 1 點前睡',
    'a2.mSleep': '30 天 \u00b7 4 位成員 \u00b7 附截圖',
    'a2.nRead': '睡前讀 20 頁',
    'a2.mRead': '30 天 \u00b7 3 位成員',
    'a2.proofTag': '成果',
    'a2.cap1': '不一定是運動。',
    'a2.cap2': '任何你<span class="hi">一直想做卻一直沒做</span>的事。',
    'a2.vo': '而且不一定是運動。任何你一直想做卻一直沒做的事都可以：多動一點、早點睡、睡前讀幾頁書。',

    /* ---- a1 / a3 · 發起挑戰的設定畫面 ---- */
    'a1.screen': '發起挑戰',
    'a1.cName': '挑戰名稱',
    'a1.cHow': '玩法（選填）',
    'a1.howText': '每天至少運動 40 分鐘。\n照片要拍到計時器。',
    'a1.howNote': '這段所有人都看得到，包括你邀請、還沒加入的人。',
    'a1.cDuration': '天數',
    'a1.d7': '7 天',
    'a1.d30': '30 天',
    'a1.dCustom': '自訂',
    'a1.durNote': '從主辦人按下開始那天算起。',
    'a1.cCadence': '頻率',
    'a1.cEvery': '每天',
    'a1.cPerWeek': '每週幾天',
    'a1.cadNote': '每天，或每週任選幾天。',
    'a1.cap1': '開一個，<span class="hi">你就是主辦人</span>。',
    'a1.cap2': '取名字、寫玩法——<span class="go">大家加入前都會先看到</span>。',
    'a1.cap3': '再決定做幾天、多常做。',
    'a1.vo': '開一個，你就是主辦人。取名字、寫玩法，大家加入前都會先看到。再決定做幾天、多常做。',

    'a3.cMin': '最少幾人才能開始',
    'a3.minNote': '人數到了，主辦人就能按下開始。',
    'a3.cMax': '人數上限',
    'a3.cJoin': '誰可以加入',
    'a3.jAnyone': '任何人',
    'a3.jApprove': '要先同意',
    'a3.joinNote': '有邀請碼就能直接進來。',
    'a3.cInvite': '誰可以邀請',
    'a3.iAnyone': '任何人',
    'a3.iHost': '只有主辦人',
    'a3.invNote': '每個成員都能分享邀請碼。',
    'a3.cProof': '完成證明',
    'a3.pOff': '不用',
    'a3.pRequire': '一定要附',
    'a3.pType': '類型',
    'a3.pPhoto': '照片',
    'a3.pVideo': '影片',
    'a3.pSee': '誰看得到',
    'a3.sAll': '所有成員',
    'a3.sHost': '只有主辦人',
    'a3.proofNote': '沒附證明就不算打卡——退出相機，那天就會留空。',
    'a3.btnCreate': '建立',
    'a3.btnCancel': '取消',
    'a3.cap1': '再決定誰能進來。<span class="hi">人數夠了，你按下開始。</span>',
    'a3.cap2': '誰能加入、誰能邀請，打卡要附<span class="hi">照片還是影片</span>。',
    'a3.cap3': '按下去，<span class="go">挑戰就成立了</span>。',
    'a3.vo': '再決定誰能進來。人數夠了你就能按下開始，時間從那刻算起。誰能加入、誰能邀請，打卡要附照片還是影片。',

    'a4.badge': '0:38 \u00b7 影片',
    'a4.when': '18:42',
    'a4.r1': '兩分鐘以內',
    'a4.r2': '播放七天',
    'a4.r3': '之後只留一張定格',
    'a4.cap1': '影片證明就是手機隨手拍的一段。',
    'a4.cap2': '播七天，之後<span class="hi">只留一張定格</span>。',
    'a4.vo': '影片證明就是手機隨手拍的一段，兩分鐘以內。播七天，之後只留一張定格。',

    'n3.rulesLabel': '玩法',
    'n3.rules': '每天運動四十分鐘，連續五十天。\n一天沒做到，罰一百入碗。\n最後用這筆錢大家一起去吃飯。',
    'n3.cap1': '這就是<span class="hi">大家加入前都看過</span>的規則。',
    'n3.cap2': '沒做到就丟一點錢進來。<span class="go">最後拿這筆錢一起慶功。</span>',
    'n3.vo': '這就是大家加入前都看過的規則。沒做到就丟一點錢進來，不是處罰，是最後大家一起慶功的基金。',

    /* ---- n4 ---- */
    'n4.lbLabel': '\u6392\u884c\u699c \u00b7 \u5b8c\u6210\u5929\u6578',
    'n4.missed': '\u9084\u6c92\u4eba\u6253\u5361',
    'n4.allDone': '\u4f60\u5148\u4e0a\u4f86\u4e86',
    'n4.pending': '\u4eca\u5929 0/1',
    'n4.logged': '\u4eca\u5929 1/1',
    'n4.day': '\u4eca\u5929 \u00b7 \u7b2c 12 \u5929 / \u5171 50 \u5929',
    'n4.notLogged': '今天還沒打卡',
    'n4.btn': '打卡 · 附上成果',
    'n4.checkedIn': '今天完成 ✓',
    'n4.undo': '取消打卡',
    'n4.cap1': '每天，每個人都回答同一個問題：<span class="hi">今天做了嗎？</span>',
    'n4.cap2': '照規則做完，<span class="go">回來打卡</span>。',
    'n4.vo': '每天每個人都回答同一個問題：今天做了嗎？照規則做完，回來打卡。',

    /* ---- n5 ---- */
    'n5.proofLabel': '成果 · 所有人都看得到',
    'n5.cap1': '如果你們說好要附證據，拍張照或一段影片。',
    'n5.cap2': '不是為了抓誰。<span class="go">看到別人真的去了，你才會想出門。</span>',
    'n5.vo': '如果說好要附證據，就拍張照或一段影片。不是為了抓誰，是看到別人真的去了，你才會想出門。',

    /* ---- n6 ---- */
    'n6.cap1': '然後排行榜就<span class="hi">放在那裡</span>。',
    'n6.cap2': '沒人需要當那個一直催的人。<span class="go">它自己會說話。</span>',
    'n6.vo': '然後排行榜就放在那裡。沒人需要當那個一直催的人，它自己會說話。',

    /* ---- n7 ---- */
    'n7.cap1': '七個禮拜後，<span class="hi">那筆錢請大家吃飯</span>。',
    'n7.cap2': '而你們每個人都比<span class="go">自己一個人</span>時做得更多。',
    'n7.vo': '七個禮拜後，那筆錢請大家吃飯。而你們每個人都比自己一個人時做得更多，這才是重點。',

    /* ---- n8 ---- */
    'n8.cap1': '你自己的習慣是<span class="hi">另一回事</span> — 一份只有你看得到的清單。',
    'n8.cap2': '打勾、計次或計時。不公開、離線可用、<span class="go">完全不用帳號</span>。',
    'n8.vo': '你自己的習慣是另一回事：一份只有你看得到的清單。打勾、計次或計時，不用帳號。',

    /* ---- n9 ---- */
    'n9.cap1': '參加別人的挑戰，<span class="go">永遠免費</span>。',
    'n9.cap2': '去找三個人，<span class="hi">一起變好</span>。',
    'n9.vo': '參加別人的挑戰，永遠免費。去找三個人，一起變好。Tadapop。',

    /* ---- scene 1 · cold open ---- */
    's1.brandSub': '每日任務 · 連續紀錄 · 俱樂部',
    's1.brandSub.solo': '每日任務 · 連續紀錄 · 不用帳號',
    's1.cap1': '喂！說你喔。嘴上老是<span class="hi">明天明天</span>。',
    /* The setup stays on screen under the punchline. Captions replace each
       other, so a two-part joke lost its first half at the exact moment the
       second half needed it — 「明天，早就來打卡了。」 alone is not a
       shorter joke, it is an unparseable sentence. The reveal still happens
       on the beat; it just does not take the setup away with it. */
    's1.cap2': '喂！說你喔。嘴上老是明天明天。<br><span class="go">明天，這不就來了。</span>',
    's1.vo': '喂！说你喔。嘴上老是明天明天。明天，这不就来了。',

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

    /* ---- scene 6 · the Club opens ---- */
    's6.tabToday': '今天',
    's6.tabStats': '統計',
    's6.tabClub': '俱樂部',
    's6.tabProfile': '個人',
    's6.convene': '⚑ 建立挑戰',
    's6.challenge': '50 天運動挑戰',
    's6.challengeMeta': '每天 40 分鐘 · 50 天 · 4 位成員',
    's6.live': '進行中',
    's6.cap1': '自己練？<span class="hi">真乖。</span>',
    's6.cap2': '揪朋友進<span class="hi">俱樂部</span>。',
    's6.vo': '自己练？真乖。揪朋友进竞技场。',

    /* ---- scene 7 · the live leaderboard ---- */
    's7.liveDay': '進行中 · 第 12/50 天',
    's7.leaderboard': '排行榜 · 最多天數',
    's7.missedCol': '漏掉天數',
    's7.today': '完成 {v} 天',
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
    's8.challengeLine': '🏃 50 天運動挑戰 · 50 天',
    's8.winner': '冠軍 — 就是你！',
    's8.winnerMeta': '46 天 · 完成天數最多',
    's8.standings': '最終排名',
    's8.daysUnit': '天',
    's8.cap1': '一起贏，一起輸，',
    's8.cap2': '<span class="hi">最後一起強到爆。</span>',
    's8.vo': '一起赢，一起输，最后一起强到爆。',

    /* ---- 單人版剪輯 (b1..b6) ---- */
    'b1.cap1': 'Tadapop 就是一份每天的清單，<span class="hi">沒有別的</span>。',
    'b1.cap2': '<span class="go">不用帳號、沒有動態牆，飛機上也能用。</span>',
    'b1.vo': 'Tadapop 就是一份每天的清單。不用帳號、沒有動態牆，飛機上也能用。',

    'b2.cap1': '把你真正想做的事放上去。',
    'b2.cap2': '打個勾、計次，或<span class="go">按下計時器關機專心做</span>。',
    'b2.vo': '把你真正想做的事放上去。打個勾、計次，或按下計時器關機專心做。',

    'b3.cap1': '整天清空，才拿得到<span class="go">一點 T 點數</span>。',
    'b3.cap2': '漏一項就沒有——這裡算的是<span class="hi">一整天</span>，不是單項。',
    'b3.vo': '整天清空才拿得到一點 T 點數。漏一項就沒有，這裡算的是一整天，不是單項。',

    'b4.cap1': '<span class="go">今天封存。</span>連續紀錄加一天。',
    'b4.cap2': '斷了也不會有人數落你。<span class="hi">重新開始就好。</span>',
    'b4.vo': '今天封存，連續紀錄加一天。斷了也沒人數落你，重新開始就好。',

    'b5.cap1': '然後某天回頭看這一年，',
    'b5.cap2': '整面格子都<span class="go">綠了</span>。除了你，沒人需要看到。',
    'b5.vo': '然後某天回頭看這一年，整面格子都綠了。除了你，沒人需要看到。',

    'b6.cap1': '免費、離線可用，<span class="go">完全不用註冊</span>。',
    'b6.cap2': '想找人一起的時候，<span class="hi">俱樂部就在隔壁分頁</span>。',
    'b6.vo': '免費、離線可用，完全不用註冊。想找人一起，俱樂部就在隔壁分頁。Tadapop。',

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
 * Which assembly this page is playing. One engine, three cuts.
 *
 * The combined cut kept having to announce which half of the app you were
 * looking at — "and your own habits are a separate thing entirely" — and a
 * viewer who has to be told that has already been confused. A film about one
 * half never has to say it. So the Club and the solo tracker each get their
 * own, and the page picks by setting this before the script loads:
 *
 *   arena  n1..n7, n9   the challenge, end to end
 *   solo   b1..b6       the private half: no account, no feed, offline
 *   full   n1..n9       the original combined cut, kept for its old URL
 *
 * Anything unrecognised falls back to `full`, so an old page that never set
 * the flag keeps playing exactly what it used to.
 */
function normaliseCut(v) { return ({ arena: 'arena', solo: 'solo', full: 'full' })[v] || 'full'; }
/* The page default. A launch button may override it with data-film-cut, which
   is what lets the homepage offer both films from one script. Mutable because
   the cut is not known until somebody presses a button. */
let CUT = normaliseCut(window.TADAPOP_FILM_CUT);

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
    n1: [0.0, 2.6], n2: [0.0, 3.4, 7.2], n3: [0.0, 3.9], n4: [0.0, 3.8], n5: [0.0, 3.6],
    n6: [0.0, 2.5], n7: [0.0, 3.1], n8: [0.0, 4.2], n9: [0.0, 3.6],
    b1: [0.0, 3.4], b2: [0.0, 2.8], b3: [0.0, 3.3], b4: [0.0, 2.7], b5: [0.0, 2.9], b6: [0.0, 3.2],
    a1: [0.0, 2.6, 7.0], a2: [0.0, 2.4], a3: [0.0, 4.2, 10.9], a4: [0.0, 4.2],
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
    n1: [0, 3.2], n2: [0, 3.2, 7.0], n3: [0, 3.6], n4: [0, 4.6], n5: [0, 3.4],
    n6: [0, 2.6], n7: [0, 2.8], n8: [0, 3.8], n9: [0, 3.2],
    b1: [0, 3.6], b2: [0, 2.6], b3: [0, 2.8], b4: [0, 2.6], b5: [0, 2.6], b6: [0, 3.0],
    a1: [0, 3.0, 8.0], a2: [0, 2.6], a3: [0, 3.4, 10.4], a4: [0, 4.0],
    s1: [0, 4.06],
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
  /* Every launcher on the page shares this one overlay and one engine. A page
     with a single film still just uses #filmLaunch and never sets a cut. */
  const launchers = Array.prototype.slice.call(document.querySelectorAll('#filmLaunch, [data-film-cut]'))
    .filter((el, i, all) => all.indexOf(el) === i);
  if (!overlay || !launchers.length) return;
  /* Whichever was pressed last — focus returns here when the film closes. */
  let launch = launchers[0];

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
  /* A vignette over the whole frame, above the stage and below the chrome.
     Every panel in this film is a dark rectangle on a dark ground, and
     without a fall-off at the edges the picture has no centre — the eye has
     nothing telling it where to sit. Built here rather than in film.css
     because that stylesheet is shared with the film already on the homepage,
     and this is not a change anybody asked for there. */
  stageWrap.appendChild(el('div', null, {
    position: 'absolute', inset: '0', pointerEvents: 'none', zIndex: '2',
    background: 'radial-gradient(128% 104% at 50% 44%, transparent 44%, rgba(2,4,9,.58) 100%)',
  }));
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
  prog.setAttribute('role', 'slider');
  prog.setAttribute('aria-label', t('ui.seek'));
  prog.setAttribute('aria-valuemin', '0');
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
  /* ---- the scene clock ----
     A scene is render() plus a queue of timers plus a set of animations, all
     measured from the moment the scene started. Everything below records its
     position on that clock rather than on the wall clock, which is what makes
     a scene reconstructible at an arbitrary offset — see catchUpTo.

     While catching up, `catchUp` IS the clock: anything scheduled by a timer we
     are replaying must be placed where it would have been, not where the wall
     clock happens to be. */
  let sceneT0 = 0, catchUp = null;
  function sceneNow() { return catchUp != null ? catchUp : performance.now() - sceneT0; }

  function anim(node, frames, opts) {
    const a = node.animate(frames, Object.assign({ duration: 600, fill: 'both', easing: 'ease' }, opts || {}));
    // Where in the scene this animation began, so a seek knows how far into it
    // to wind. Animations created by a replayed timer start later than 0.
    a.__at = sceneNow();
    sceneAnims.push(a); return a;
  }
  /* A scene is choreographed out of setTimeout calls, and a setTimeout can
     neither be paused nor asked where it had got to — so each one remembers the
     function it owes and its position on the scene clock. Pausing clears the
     real timer and keeps the debt; seeking replays or re-arms it. */
  function after(ms, fn) {
    const rec = { fn: fn, at: sceneNow() + ms, due: performance.now() + ms };
    rec.id = setTimeout(function () { rec.done = true; fn(); }, ms);
    sceneTimers.push(rec);
    return rec;
  }

  /**
   * Wind a freshly built scene forward to `offset` ms.
   *
   * Fires every timer already due, in order, letting each schedule whatever it
   * would have scheduled; re-arms the rest for the time they have left; then
   * winds each animation to where it would be. The result is the scene as it
   * would look had you watched it to that point.
   *
   * Sound effects are muted throughout: replaying eight seconds of a scene in
   * one tick would otherwise fire eight seconds of clicks and chimes at once.
   */
  function catchUpTo(offset) {
    if (!(offset > 0)) return;
    const realSfx = {};
    Object.keys(sfx).forEach((k) => { realSfx[k] = sfx[k]; sfx[k] = function () {}; });
    let guard = 0;
    for (;;) {
      let next = null;
      for (const r of sceneTimers) {
        if (r.done || r.at > offset) continue;
        if (!next || r.at < next.at) next = r;
      }
      if (!next || ++guard > 2000) break;
      clearTimeout(next.id);
      next.done = true;
      catchUp = next.at;
      try { next.fn(); } catch (e) { /* a scene that throws mid-seek still plays on */ }
    }
    catchUp = null;
    Object.keys(realSfx).forEach((k) => { sfx[k] = realSfx[k]; });
    const now = performance.now();
    sceneTimers.forEach((r) => {
      if (r.done) return;
      clearTimeout(r.id);
      const left = Math.max(0, r.at - offset);
      r.due = now + left;
      r.id = setTimeout(function () { r.done = true; r.fn(); }, left);
    });
    sceneAnims.forEach((a) => {
      try { a.currentTime = Math.max(0, offset - (a.__at || 0)); } catch (e) {}
    });
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
  let scenes = [];
  let TOTAL = 0;

  /* A scene's length is the English performance's length, and Chinese does not
     always fit in it. Where the gap is only rhythm, the Chinese is cut to fit —
     that is the rule everywhere else in this film and it holds.
     
     s1 is where it stopped holding. The cold open is a two-part joke: the first
     caption establishes that you are the one always saying "tomorrow", the
     second lands it by having tomorrow turn up for work. Cutting the setup to
     fit five seconds left 「明天已經打卡了」 on screen with nothing behind it,
     which is not a tighter joke — it is half of one. The scene gets the extra
     second instead. English is untouched. */
  /* Chinese says the same thing in more seconds — not a translation fault, a
     property of the language plus the pauses its punctuation buys. The first
     cut already needed this for s1; the second needs it for four, measured
     from the takes rather than guessed:
       n2 7.28s · n5 7.44s · n7 5.84s · n8 9.68s
     Each gets its clip plus the 0.6s of headroom the generator insists on. */
  /* Chinese runs longer than English for the same sentence, so a handful of
     scenes need more room. Keyed by SCENE ID — an entry whose id no longer
     exists is silently dead, which is how `s1: 7600` sat here doing nothing
     after that scene was recut as n1. */
  const SCENE_DUR = { zh: { n1: 7600, n2: 13600, a1: 11000, a2: 11400, a3: 15200, a4: 9800, n3: 11500, 
                            n4: 9600, n5: 10600, n7: 10000, n8: 11000,
                            b1: 8000, b2: 11000, b3: 9200, b4: 9200, b5: 8800, b6: 10000 } };
  function withOverrides(list) {
    const ov = SCENE_DUR[LANG];
    if (ov) list.forEach((sc) => { if (ov[sc.id]) sc.dur = ov[sc.id]; });
    return list;
  }
  /** Build a cut and make it the one the player is holding. */
  function applyCut(cut) {
    if (scenes.length && cut === CUT) return;
    CUT = cut;
    scenes = withOverrides(buildScenes(ctx, cut));
    TOTAL = scenes.reduce((a, x) => a + x.dur, 0);
    time.textContent = '0:00 / ' + fmtClock(TOTAL);
    voWarmed = false;   // a different cut is a different set of clips
  }
  /** How long a cut runs, without making it the current one. */
  function totalFor(cut) {
    return withOverrides(buildScenes(ctx, cut)).reduce((a, x) => a + x.dur, 0);
  }

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
  const VOV = 4;
  /* Real check-ins, used in n5. Listed here so warmVO can decode them. */
  const PROOF_SHOTS = ['/assets/proof/run.jpg', '/assets/proof/swim.jpg', '/assets/proof/cycle.jpg'];
  /* The arena cut reuses the combined cut's clips unchanged — it is the same
     scenes in the same order with one dropped, so re-rendering them would buy
     nothing but a chance to make them worse. The solo cut is all new lines. */
  function voDir() {
    const base = CUT === 'solo' ? '/assets/vo-solo/' : '/assets/vo2/';
    return LANG === 'zh' ? base + 'zh/' : base;
  }
  function voSrc(id) { return voDir() + id + '.mp3?v=' + VOV; }

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
    /* The proof photographs, too. They are the one scene whose whole claim is
       that there is something real to look at, so arriving at it with three
       empty frames is worse than arriving late. Decoded, not merely fetched —
       a cached-but-undecoded JPEG still costs a frame on the way in. */
    PROOF_SHOTS.forEach((src) => { try { const im = new Image(); im.src = src; if (im.decode) im.decode().catch(() => {}); } catch (e) {} });
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
  const MUSIC_SRC = '/assets/music/film-bed.mp3?v=' + VOV;
  const music = new Audio(MUSIC_SRC);
  /* preload was 'auto', which fetched all 1.2 MB of the score on every page
     load — for a film most visitors never press play on. It is by far the
     largest thing the site ships, and on a throttled connection it saturated
     the pipe for about six seconds, which is where the home page's Largest
     Contentful Paint was going: the poster image had downloaded but could not
     paint while this was in flight. Same treatment as the voiceover above:
     nothing until intent, then warm the HTTP cache so pressing play is still
     instant. */
  music.preload = 'none';
  let musicWarmed = false;
  function warmMusic() {
    if (musicWarmed) return;
    musicWarmed = true;
    try { fetch(MUSIC_SRC, { cache: 'force-cache' }).catch(() => {}); } catch (e) {}
  }
  launchers.forEach((b) => {
    b.addEventListener('pointerenter', warmMusic, { once: true });
    b.addEventListener('focus', warmMusic, { once: true });
    b.addEventListener('touchstart', warmMusic, { once: true, passive: true });
  });
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
  /** `offset` ms into the scene, so a seek starts the line where the picture is. */
  function playVO(sc, offset) {
    stopVO();
    if (muted || !sc) return;
    if (sc.id) {
      const a = voEl;
      curAudio = a;
      // Re-pointing the element is what keeps the iOS unlock — see voEl.
      const want = voSrc(sc.id);
      const from = Math.max(0, (offset || 0) / 1000);
      if (a.getAttribute('src') !== want) {
        a.src = want;
        // currentTime cannot be set before the new source has metadata, and a
        // seek into a scene lands mid-line often enough to matter.
        if (from > 0) a.addEventListener('loadedmetadata', function once() {
          a.removeEventListener('loadedmetadata', once);
          if (curAudio === a) { try { a.currentTime = from; } catch (e) {} }
        }, { once: true });
      }
      try { a.currentTime = from; } catch (e) {}
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

  /** `offset` ms into the scene — non-zero only when seeking. */
  function gotoScene(i, offset) {
    clearScene();
    idx = i;
    if (i >= scenes.length) { return; }
    const sc = scenes[i];
    sceneT0 = performance.now();
    catchUp = offset > 0 ? 0 : null;
    const node = el('div', 'film-scene');
    stage.appendChild(node);
    sfx.whoosh();
    /* A cut is a dip to black and then a slow settle forward. The flat
       450ms opacity fade this used to be is what a slideshow does between
       two slides; the push-in is what says a camera is looking at something.
       Scale only — no blur — because this is the full 1000x563 stage and a
       filter on it costs a frame on every cut. */
    anim(node, [
      { opacity: 0, transform: 'scale(1.035)' },
      { opacity: 1, transform: 'scale(1)' },
    ], { duration: 760, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
    try { sc.render(node, ctx); } catch (e) { /* keep film resilient */ }
    (sc.caps || []).forEach((c) => { if (c.at <= 0) showCaption(c.html); else after(c.at * 1000, () => showCaption(c.html)); });
    if (i < scenes.length - 1) after(sc.dur, () => gotoScene(i + 1));
    else after(sc.dur, finish);
    catchUp = null;
    catchUpTo(offset);
    // After the wind-forward, so the line starts from where the picture is.
    playVO(sc, offset);
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

  /** The three lazy BOBO layers, looked up fresh — the host is re-rendered. */
  function boboLayers() {
    return Array.prototype.slice.call(overlay.querySelectorAll('.bobo-layer'));
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
    // The film no longer always takes the page: above 900px it plays inside
    // the poster's own frame. Locking the page's scroll would then trap a
    // reader beside a 980px box for 75 seconds, so the lock is tied to
    // whether the overlay is actually covering the viewport rather than
    // assumed. Read after unhiding, because a hidden element has no
    // resolved position.
    const takesTheScreen = getComputedStyle(overlay).position === 'fixed';
    // BOBO's three layers are marked loading="lazy" so a visitor who never
    // presses play does not pay 3.1MB for them. Un-hiding their container is
    // NOT enough to start that fetch — nothing scrolls inside the overlay, so
    // the intersection that would trigger it never happens and the host stays
    // invisible for the whole film. Flipping the attribute to "eager" is what
    // actually starts the load, so it happens here, once, at the only moment
    // the artwork is genuinely needed.
    boboLayers().forEach((img) => { if (img.loading === 'lazy') img.loading = 'eager'; });
    if (takesTheScreen) document.body.style.overflow = 'hidden';
    // Close first: the one control every visitor needs, and the safe landing
    // spot for someone who cannot see that a film has taken over the page.
    // Not inside the rAF below — that never runs in a background tab, and
    // where focus sits must not depend on whether a fade got to start.
    try { closeBtn.focus(); } catch (e) {}
    requestAnimationFrame(() => overlay.classList.add('show'));
    fit();
    if (!muted) ac();
    warmVO();
    warmMusic();
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
  /* ---- fitting the picture ----
     The stage is a fixed 1000x563 coordinate space, but no scene paints all
     of it: every one draws inside a centred column no wider than SAFE_W, and
     the rest is empty margin. Fitting all 1000 units is right whenever height
     is what runs out — a wide window, the poster frame — and wrong when width
     is. On a phone-shaped window it spent more than a third of the screen on
     margin and left the app mock the size of a postage stamp. So the fit is
     taken against the column instead, and the empty margins run off the
     sides, where .film-stagewrap clips them. Nothing is lost that way: the
     column is 600 units at its widest, so it always lands inside the screen
     with room to spare.

     The rest is where the three pieces that are NOT the picture go. In the
     poster frame that is styles.css's business. Full screen, film.css pins
     the caption and BOBO to the bottom edge, which was right when the film
     was only ever shown on a desktop and is what put BOBO across the caption
     with the timecode printed over his name on a phone. So full screen the
     placement is derived here, and it differs by which way the screen runs:

       tall  — the picture cannot fill the height, so picture, caption and
               BOBO are stacked as one block between the bar and the controls;
       short — the picture cannot fill the width, so it keeps the middle with
               the caption over it, and BOBO stands in the side margin the
               fit leaves, narrowed to whatever that margin can hold. */
  const SAFE_W = 660, STAGE_H = 563;
  function fit() {
    const W = overlay.clientWidth, H = overlay.clientHeight;
    const byWidth = W * 0.96 / SAFE_W, byHeight = H * 0.82 / STAGE_H;
    const s = Math.min(byWidth, byHeight);
    stage.style.transform = 'translate(-50%, -50%) scale(' + s + ')';

    // Inside the poster frame every piece is laid out in container units by
    // styles.css, which knows the frame's shape. Hand them all back.
    if (getComputedStyle(overlay).position !== 'fixed') {
      stage.style.top = '';
      caption.style.top = caption.style.bottom = caption.style.width = '';
      host.style.left = host.style.bottom = host.style.width = '';
      return;
    }

    // The controls own the bottom strip of the screen either way: BOBO stands
    // on top of them, never inside them.
    const stageH = STAGE_H * s, stageW = 1000 * s;
    const ctrlH = controls.offsetHeight;
    host.style.bottom = (ctrlH + 10) + 'px';

    if (byHeight <= byWidth) {
      stage.style.top = '';
      caption.style.top = caption.style.bottom = '';
      const margin = (W - stageW) / 2;
      const hostW = Math.max(72, Math.min(132, margin - 12));
      host.style.width = hostW + 'px';
      host.style.left = Math.max(6, margin - hostW - 8) + 'px';
      // The caption belongs to the picture, so it is measured against the
      // picture rather than the screen — otherwise it runs out past the sides
      // of the film and into BOBO's margin.
      caption.style.width = Math.min(920, Math.max(280, stageW * 0.88)) + 'px';
      return;
    }

    host.style.left = host.style.width = '';
    caption.style.width = '';
    // Three lines of caption held in reserve rather than the caption's own
    // height: measuring it would shift the whole composition every time the
    // line changed, which is once every few seconds for 97 seconds.
    const barH = top.offsetHeight;
    const capLine = parseFloat(getComputedStyle(caption).fontSize) * 1.3;
    const gap = Math.min(28, Math.round(H * 0.03));
    const floor = H - ctrlH - 10 - host.offsetHeight - gap;
    const y0 = barH + Math.max(0, (floor - barH - (stageH + gap + capLine * 3)) / 2);
    stage.style.top = Math.round(y0 + stageH / 2) + 'px';
    caption.style.top = Math.round(y0 + stageH + gap) + 'px';
    caption.style.bottom = 'auto';
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
  launchers.forEach((b) => {
    const cut = normaliseCut(b.getAttribute('data-film-cut') || window.TADAPOP_FILM_CUT);
    /* Each button carries its own running time, and it is the SCENES that
       know it — a hand-written one drifted to promising 90 seconds for a film
       whose own clock read 1:15. */
    const lengthEl = b.querySelector('.film-launch-time');
    if (lengthEl) lengthEl.textContent = t('ui.filmLength', { n: Math.round(totalFor(cut) / 1000) });
    b.addEventListener('click', () => { launch = b; applyCut(cut); play(false); });
  });
  applyCut(normaliseCut(window.TADAPOP_FILM_CUT));
  closeBtn.addEventListener('click', closeFilm);
  replayBtn.addEventListener('click', () => play(false));
  unmute.addEventListener('click', enableSound);
  pauseBtn.addEventListener('click', () => setPaused(!paused));

  /* ---- scrubbing ----
     Dragging the amber line moves through the film.

     It SNAPS TO THE START OF A SCENE, and that is a real limitation rather than
     a rough edge to polish later. This is not a video: there is no frame to
     seek to. A scene is built by running render() and then a queue of timers
     against a fresh DOM, so the only states that exist are "scene N, played
     from its beginning". Landing halfway into one would mean rebuilding it and
     fast-forwarding every animation and timer inside it — for a 75-second film
     of nine scenes, the cost of that is not worth the precision it buys.

     So the readout while dragging shows where the thumb is, and letting go
     lands on the scene that contains it. Committing on release rather than on
     every move also stops a drag across the bar tearing down and rebuilding
     nine scenes on the way past. */
  let scrubbing = false;

  /** Where a pointer sits on the bar, as milliseconds into the film. */
  function timeFromPointer(e) {
    const r = prog.getBoundingClientRect();
    const f = r.width ? (e.clientX - r.left) / r.width : 0;
    return Math.max(0, Math.min(1, f)) * TOTAL;
  }

  /** Paint the bar and clock at `ms` without moving the film. */
  function previewAt(ms) {
    progFill.style.width = (ms / TOTAL) * 100 + '%';
    time.textContent = fmtClock(ms) + ' / ' + fmtClock(TOTAL);
  }

  /** Jump the film to `ms`, landing exactly there rather than on a scene edge. */
  function seekTo(ms) {
    const target = Math.max(0, Math.min(TOTAL - 1, ms));
    let acc = 0, i = 0;
    for (; i < scenes.length - 1; i++) {
      if (target < acc + scenes[i].dur) break;
      acc += scenes[i].dur;
    }
    // The clock is "now minus how far in we are", so the readout and the
    // progress animation agree without either of them being told twice.
    clockT0 = performance.now() - target;
    clockHeld = 0;
    rootAnims.forEach((a) => { try { a.currentTime = target; a.play(); } catch (e) {} });
    if (!muted) {
      try { music.currentTime = (target / 1000) % (music.duration || 1e9); } catch (e) {}
    }
    end.classList.remove('show');
    playing = true;
    paused = false;
    pauseBtn.textContent = t('ui.pause');
    gotoScene(i, target - acc);
  }

  prog.addEventListener('pointerdown', (e) => {
    if (overlay.hidden) return;
    scrubbing = true;
    prog.classList.add('scrubbing');
    try { prog.setPointerCapture(e.pointerId); } catch (err) {}
    // Freeze the bar so its own animation stops fighting the thumb.
    rootAnims.forEach((a) => { try { a.pause(); } catch (err) {} });
    stopVO();
    previewAt(timeFromPointer(e));
    e.preventDefault();
  });
  prog.addEventListener('pointermove', (e) => {
    if (!scrubbing) return;
    previewAt(timeFromPointer(e));
  });
  const endScrub = (e) => {
    if (!scrubbing) return;
    scrubbing = false;
    prog.classList.remove('scrubbing');
    try { prog.releasePointerCapture(e.pointerId); } catch (err) {}
    seekTo(timeFromPointer(e));
  };
  prog.addEventListener('pointerup', endScrub);
  prog.addEventListener('pointercancel', endScrub);

  /* Tapping the picture pauses it, the way every video player behaves.
     
     The pause button is in a row of five controls along the bottom edge, which
     on a phone is a small target in the least reachable part of the screen. The
     picture itself is the whole rest of the film and needs no aiming.

     Everything that already does something keeps doing it: the controls, the
     top bar, the end card and the "tap for sound" button are all excluded, so
     this only ever fires on the film itself. It stays off until the film is
     actually playing, so the tap that opens it cannot immediately pause it, and
     off once the end card is up, where the tap belongs to the buttons on it. */
  overlay.addEventListener('click', (e) => {
    if (!playing) return;
    const t = e.target;
    if (t && t.closest && t.closest('.film-controls, .film-top, .film-end, .film-unmute, button, a')) return;
    setPaused(!paused);
  });
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

  /* ---- auto-play, now only when it is explicitly asked for ----
     Forced with #film / ?film=1, which is what a shared "watch the film"
     link uses.

     The once-per-browser autoplay that used to live here is gone. It threw
     the full-screen overlay over the page 1.4 seconds after load, before
     the visitor had read a line of it — defensible when the film was hidden
     behind a small text button and would otherwise be missed, and simply a
     hijack now that the home page leads with a poster you press. The
     localStorage flag it set ('tdp_film_seen') is no longer read or
     written; a stale one on a returning visitor's machine is harmless. */
  function maybeAutoplay() {
    const forced = /(^|[#&?])film(=1)?($|[#&?])/.test(location.hash + location.search);
    if (forced) { setTimeout(() => play(true), 600); return; }
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
      // loading="lazy" is load-bearing, not a nicety. This overlay is built
      // eagerly on every page load so the film can open instantly, but these
      // three layers are 3.1MB of PNG that a visitor who never presses play
      // has no use for — which was more than twenty times the weight of the
      // rest of the home page put together. They sit inside a [hidden]
      // ancestor, so they never intersect the viewport and are not fetched
      // until the overlay is shown. Layout is unaffected: .bobo-layer is
      // inset:0/100% inside a container with a fixed aspect-ratio, so the
      // intrinsic size is never consulted. The home page warms them on
      // hover/focus of the play button, so pressing play still starts dry.
      '<img class="bobo-layer bobo-base" src="' + b + 'bobo-base.png" alt="" draggable="false" loading="lazy">' +
      '<img class="bobo-layer ag-eye bobo-eye" src="' + b + 'bobo-eye.png" alt="" draggable="false" loading="lazy">' +
      '<img class="bobo-layer bobo-mouth" id="alienMouth" src="' + b + 'bobo-mouth.png" alt="" draggable="false" loading="lazy">' +
      '</div></div>';
  }
})();

/* ========================================================================
   Scene definitions. Each: { dur, vo, caps:[{at,html}], render(node, ctx) }
   ======================================================================== */
function buildScenes(ctx, cut) {
  const CUT = cut;
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
      sub.textContent = t(CUT === 'arena' ? 'n1.brandSub' : CUT === 'solo' ? 's1.brandSub.solo' : 's1.brandSub');
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
      // The Club tab is the selected one — flagged rather than inferred from
      // the label, which is no longer a fixed English word.
      [['s6.tabToday', false], ['s6.tabStats', false], ['s6.tabClub', true], ['s6.tabProfile', false]].forEach(([key, on]) => {
        const b = el('div', 'fm-mono', { flex: '1', textAlign: 'center', padding: '10px 4px', fontSize: '12px', letterSpacing: '.12em', color: on ? COL.ink : COL.faint, borderBottom: '2px solid ' + (on ? COL.amber : 'transparent') });
        b.textContent = t(key); tabs.appendChild(b);
      });
      c.appendChild(tabs);
      const convene = el('button', 'fm-disp', { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', cursor: 'default', marginBottom: '14px', fontWeight: '700', fontSize: '14px', letterSpacing: '.06em', color: '#1a1206', background: 'linear-gradient(180deg,' + COL.amber + ',' + COL.amberDeep + ')', boxShadow: '0 8px 24px -8px rgba(255,180,84,.6)' });
      convene.textContent = t('s6.convene');
      c.appendChild(convene);
      const card = el('div', 'fm-panel', { padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' });
      card.innerHTML = '<div style="display:flex;align-items:center;gap:12px">' +
        '<span style="font-size:26px">🏃</span><div>' +
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
        '<div style="display:flex;align-items:center;gap:10px"><span style="font-size:22px">🏃</span>' +
        '<span class="fm-disp" style="font-weight:700;font-size:18px">' + t('s6.challenge') + '</span></div>' +
        '<span class="fm-tag" style="color:' + COL.go + ';border-color:' + COL.go + '">' + t('s7.liveDay') + '</span></div>';
      c.appendChild(hdr);
      const board = el('div', 'fm-panel', { padding: '14px 16px' });
      board.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
        '<span class="fm-mono" style="font-size:11px;letter-spacing:.16em;color:' + COL.dim + '">' + t('s7.leaderboard') + '</span>' +
        '<span class="fm-mono" style="font-size:10px;letter-spacing:.18em;color:' + RED + '">' + t('s7.missedCol') + '</span></div>';
      // DAY 12/50: ranked by days completed; the MISSED column is the star stat.
      // `done` is a flag rather than a '✓' sniffed off the subtitle — the
      // subtitle is translated copy and must not double as a data field.
      const data = [
        { name: t('player.a'), me: false, today: t('s7.today', { v: '9/12' }), done: false, missed: 0 },
        { name: t('s7.you'),   me: true,  today: t('s7.today', { v: '10/12' }), done: false, missed: 0 },
        { name: t('player.b'), me: false, today: '',                          done: true,  missed: 1 },
        { name: t('player.c'), me: false, today: t('s7.today', { v: '7/12' }), done: false, missed: 1 },
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
      after(1300, () => { rows[3]._sub.textContent = t('s7.today', { v: '8/12' }); sfx.tick(); });
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
      [['🥇', t('s7.you'), '46'], ['🥈', t('player.a'), '44'], ['🥉', t('player.b'), '41'], ['', t('player.c'), '38']].forEach(([m, n, s], i) => {
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


  /* ======================= SECOND CUT — the running order =======================
     Seven of these reuse a scene from the first cut unchanged: the app mockups
     were the good part and redrawing them would only introduce drift. What
     changes is the ORDER and what is said over them, which is where the first
     cut actually went wrong — it argued mechanics to people who have not yet
     been given a reason to care.

     Two are new, because the first cut predates the features: the host writing
     the deal in their own words, and proof that somebody else can see.
     ========================================================================== */

  /* n3 · the deal — the host's own rules, which is the thing people quote */
  const n3 = {
    id: 'n3', dur: 11000,
    vo: t('n3.vo'),
    caps: capsFor('n3'),
    render(node) {
      const c = appCol(node, 620);
      const panel = el('div', 'fm-panel', { padding: '18px 20px 20px' });
      const title = el('div', 'fm-disp', { fontSize: '24px', fontWeight: '800', color: COL.ink, marginBottom: '4px' });
      title.textContent = '\ud83c\udfc3 ' + t('s6.challenge');
      const meta = el('div', 'fm-mono', { fontSize: '12px', letterSpacing: '.12em', color: COL.dim, marginBottom: '18px' });
      meta.textContent = t('n3.rulesLabel');
      /* The rules read as a quote — an amber rule down the left, the host's
         own line breaks kept. It is the one place in the app where somebody
         else's words are shown verbatim, and it should look like it. */
      const quote = el('div', null, {
        borderLeft: '3px solid ' + COL.amber, paddingLeft: '16px',
        fontSize: '19px', lineHeight: '1.65', color: COL.ink, whiteSpace: 'pre-line',
      });
      panel.append(title, meta, quote); c.appendChild(panel);
      anim(panel, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 620, easing: POP });

      /* Typed a line at a time, because the point is that a person wrote it. */
      const lines = t('n3.rules').split('\n');
      lines.forEach((line, i) => {
        const ln = el('div', null, { opacity: '0' });
        ln.textContent = line;
        quote.appendChild(ln);
        after(900 + i * 1250, () => {
          anim(ln, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 520, fill: 'both' });
          sfx.tick();
        });
      });
    },
  };

  /* =====================================================================
     Motion language for the recut scenes.

     The first cut animated everything with POP — cubic-bezier(.2,1.4,.4,1),
     an overshoot. On a small confirmation (a checkbox taking a tick) an
     overshoot reads as delight. On a whole panel arriving it reads as cheap:
     furniture should not bounce. So the big moves use EASE instead — a long
     decelerating curve that starts fast and settles without ever passing the
     mark — and things arrive slightly out of focus, which is most of what
     makes a rendered rectangle feel like an object rather than a div that
     appeared. POP survives only where something is being CONFIRMED.
     ===================================================================== */
  const EASE = 'cubic-bezier(.16,1,.3,1)';

  /** A panel arriving: up, forward, into focus. Nothing overshoots. */
  function reveal(node, opts) {
    const o = opts || {};
    const dy = o.dy == null ? 26 : o.dy;
    anim(node, [
      { opacity: 0, transform: 'translateY(' + dy + 'px) scale(.975)', filter: 'blur(10px)' },
      { opacity: 1, transform: 'translateY(0px) scale(1)', filter: 'blur(0px)' },
    ], { duration: o.duration || 900, delay: o.delay || 0, easing: EASE, fill: 'both' });
  }

  /** The slow push-in every product film has and no still frame has. */
  function drift(col, ms, to) {
    anim(col, [
      { transform: 'translate(-50%,-50%) scale(1)' },
      { transform: 'translate(-50%,-50%) scale(' + (to || 1.02) + ')' },
    ], { duration: ms, easing: 'linear', fill: 'both' });
  }

  /** A soft pool of light behind the hero. Depth for one gradient. */
  function ambient(node, color, size) {
    const s = size || 900;
    const g = el('div', null, {
      position: 'absolute', left: '50%', top: '50%', width: s + 'px', height: s + 'px',
      transform: 'translate(-50%,-50%)', pointerEvents: 'none', opacity: '0',
      background: 'radial-gradient(circle, ' + color + ' 0%, transparent 62%)',
    });
    node.insertBefore(g, node.firstChild);
    anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 1500, easing: 'ease-out', fill: 'both' });
    return g;
  }

  /* n5 · proof — somebody else can see it, which is the whole mechanism.

     These are PHOTOGRAPHS, and they have to be. The claim the scene makes is
     that a person actually went and did the thing; a drawn placeholder of
     someone exercising makes the opposite case, and the first two attempts
     here (a gradient with a camera glyph, then an abstract "video poster")
     both read as an image that had failed to load. They are the owner's own
     check-ins — a run, a swim, a ride — which is also the only honest source
     for a screen whose entire subject is evidence. */
  const n5 = {
    id: 'n5', dur: 8200,
    vo: t('n5.vo'),
    caps: capsFor('n5'),
    render(node) {
      ambient(node, 'rgba(91,227,155,.10)', 1000);
      const c = appCol(node, 700);
      drift(c, 7200, 1.035);

      const label = el('div', 'fm-mono', {
        fontSize: '11px', letterSpacing: '.18em', color: COL.go,
        marginBottom: '20px', textAlign: 'center', opacity: '0',
      });
      label.textContent = '● ' + t('n5.proofLabel');
      c.appendChild(label);
      anim(label, [
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'translateY(0px)' },
      ], { duration: 760, easing: EASE, fill: 'both' });

      const rail = el('div', null, {
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '22px',
      });
      c.appendChild(rail);

      /* FLAT, and that took two goes to learn.
         ------------------------------------------------------------------
         The first build fanned these on a rotateY, which is the obvious
         "photos in space" move and wrong twice over: a 3-D transform breaks
         border-radius clipping in Chrome, so every angled card leaked its
         photograph past its own rounded corner, and rotating a photograph
         that is ITSELF a screenshot of a UI just makes that UI look broken.
         Scale and elevation carry the same hierarchy with none of that.

         The caption also moved OUT of the picture. Laid over it, the name sat
         on whatever the photo happened to have at the bottom — over the run
         it was white-on-white and simply could not be read. Below the frame
         it is legible over anything, and it is what the app really does. */
      const shots = [
        { src: '/assets/proof/run.jpg', who: t('player.a'), when: '07:12', w: 186, h: 232 },
        { src: '/assets/proof/swim.jpg', who: t('s7.you'), when: '19:04', w: 206, h: 258 },
        { src: '/assets/proof/cycle.jpg', who: t('player.b'), when: '12:08', w: 186, h: 232 },
      ];

      shots.forEach((sh, i) => {
        const col = el('div', null, {
          display: 'flex', flexDirection: 'column', flex: '0 0 auto',
          width: sh.w + 'px',
        });
        const card = el('div', null, {
          position: 'relative', width: '100%', height: sh.h + 'px',
          borderRadius: '18px', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,.10)',
          boxShadow: '0 44px 90px -34px rgba(0,0,0,.92)',
          opacity: '0',
        });
        const img = el('img');
        img.src = sh.src;
        img.alt = '';
        Object.assign(img.style, {
          position: 'absolute', inset: '0', width: '100%', height: '100%',
          objectFit: 'cover', display: 'block',
        });
        /* Ken Burns INSIDE the frame — the photo moves, the frame holds. */
        anim(img, [{ transform: 'scale(1)' }, { transform: 'scale(1.09)' }],
          { duration: 7200, easing: 'linear', fill: 'both' });

        const sheen = el('div', null, {
          position: 'absolute', inset: '-40%', pointerEvents: 'none',
          background: 'linear-gradient(74deg, transparent 43%, rgba(255,255,255,.16) 50%, transparent 57%)',
          transform: 'translateX(-70%)',
        });
        const vig = el('div', null, {
          position: 'absolute', inset: '0', pointerEvents: 'none',
          background: 'radial-gradient(118% 96% at 50% 46%, transparent 52%, rgba(4,7,13,.42) 100%)',
        });
        card.append(img, vig, sheen);
        col.appendChild(card);

        /* caption: who, and that it counted */
        const cap = el('div', null, {
          display: 'flex', alignItems: 'center', gap: '8px', marginTop: '11px', padding: '0 2px',
        });
        const who = el('div', 'fm-disp', {
          fontSize: '14px', fontWeight: '600', color: COL.ink,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        });
        who.textContent = sh.who;
        const when = el('div', 'fm-mono', {
          fontSize: '10px', color: COL.faint, marginLeft: 'auto', letterSpacing: '.06em',
        });
        when.textContent = sh.when;
        const tick = el('div', null, {
          width: '17px', height: '17px', borderRadius: '50%', flex: '0 0 auto',
          background: 'rgba(91,227,155,.95)', display: 'grid', placeItems: 'center',
          boxShadow: '0 0 14px -2px rgba(91,227,155,.8)', transform: 'scale(0)',
        });
        tick.innerHTML = '<svg viewBox="0 0 24 24" style="width:10px;height:10px">' +
          '<path d="M5 12.5 L10 17.5 L19 6.5" fill="none" stroke="#07130c" stroke-width="3.6" ' +
          'stroke-linecap="round" stroke-linejoin="round"/></svg>';
        cap.append(tick, who, when);
        cap.style.opacity = '0';
        col.appendChild(cap);
        rail.appendChild(col);

        after(480 + i * 300, () => {
          anim(card, [
            { opacity: 0, transform: 'translateY(38px) scale(1.10)', filter: 'blur(16px)' },
            { opacity: 1, transform: 'translateY(0px) scale(1)', filter: 'blur(0px)' },
          ], { duration: 1050, easing: EASE, fill: 'both' });
          anim(cap, [
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0px)' },
          ], { duration: 700, delay: 260, easing: EASE, fill: 'both' });
          sfx.pop();
        });
        /* The tick lands after the photo is legible, not with it: first you
           see what they did, then you see that it counted. */
        after(1620 + i * 300, () => {
          anim(tick, [
            { transform: 'scale(0)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' },
          ], { duration: 480, easing: POP, fill: 'both' });
          sfx.tick();
        });
        after(4300 + i * 150, () => {
          anim(sheen, [{ transform: 'translateX(-70%)' }, { transform: 'translateX(70%)' }],
            { duration: 1500, easing: 'ease-in-out' });
        });
      });
    },
  };


  /* a2 · what a challenge can be.
     ------------------------------------------------------------------
     The cut only ever showed one kind of challenge — exercise — and a
     viewer whose problem is that they go to bed at three came away thinking
     this app was not for them. It is the same mechanism whatever the thing
     is: somebody sets it, everybody answers the same question once a day.
     The sleep card carries a real Health screenshot because "how would I
     even prove that?" is the first objection to a sleep challenge, and one
     thumbnail answers it faster than a sentence. */
  const a2 = {
    id: 'a2', dur: 9000,
    vo: t('a2.vo'),
    caps: capsFor('a2'),
    render(node) {
      ambient(node, 'rgba(127,169,255,.08)', 940);
      const c = appCol(node, 580);
      drift(c, 9000, 1.02);

      const label = el('div', 'fm-mono', {
        fontSize: '10px', letterSpacing: '.2em', color: COL.dim,
        marginBottom: '14px', paddingLeft: '4px', opacity: '0',
      });
      label.textContent = t('a2.label');
      c.appendChild(label);
      anim(label, [
        { opacity: 0, transform: 'translateY(8px)' },
        { opacity: 1, transform: 'translateY(0px)' },
      ], { duration: 620, easing: EASE, fill: 'both' });

      const items = [
        { icon: '🏃', name: t('s6.challenge'), meta: t('a2.mMove') },
        { icon: '😴', name: t('a2.nSleep'), meta: t('a2.mSleep'), shot: '/assets/proof/sleep.jpg' },
        { icon: '📖', name: t('a2.nRead'), meta: t('a2.mRead') },
      ];

      items.forEach((it, i) => {
        const card = el('div', 'fm-panel', {
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '14px 16px', marginBottom: '10px', opacity: '0',
        });
        const icon = el('div', null, { fontSize: '24px', flex: '0 0 auto', lineHeight: '1' });
        icon.textContent = it.icon;
        const mid = el('div', null, { flex: '1', minWidth: '0' });
        const nm = el('div', 'fm-disp', { fontSize: '17px', fontWeight: '700', color: COL.ink });
        nm.textContent = it.name;
        const mt = el('div', 'fm-mono', {
          fontSize: '10px', letterSpacing: '.1em', color: COL.dim, marginTop: '4px',
        });
        mt.textContent = it.meta;
        mid.append(nm, mt);
        card.append(icon, mid);

        /* The one card that answers "how would I even prove that?". */
        if (it.shot) {
          const thumb = el('div', null, {
            width: '44px', height: '55px', borderRadius: '8px', overflow: 'hidden',
            flex: '0 0 auto', border: '1px solid ' + COL.line, position: 'relative',
          });
          const im = el('img');
          im.src = it.shot;
          im.alt = '';
          Object.assign(im.style, { width: '100%', height: '100%', objectFit: 'cover', display: 'block' });
          const tag = el('div', 'fm-mono', {
            position: 'absolute', left: '0', right: '0', bottom: '0',
            fontSize: '7px', letterSpacing: '.1em', textAlign: 'center',
            color: COL.go, background: 'rgba(8,11,18,.82)', padding: '2px 0',
          });
          tag.textContent = t('a2.proofTag');
          thumb.append(im, tag);
          card.appendChild(thumb);
        } else {
          const live = el('span', 'fm-tag', { color: COL.go, borderColor: COL.go, flex: '0 0 auto' });
          live.textContent = t('s6.live');
          card.appendChild(live);
        }

        c.appendChild(card);
        after(620 + i * 620, () => {
          anim(card, [
            { opacity: 0, transform: 'translateY(18px) scale(.985)', filter: 'blur(8px)' },
            { opacity: 1, transform: 'translateY(0px) scale(1)', filter: 'blur(0px)' },
          ], { duration: 760, easing: EASE, fill: 'both' });
          sfx.pop();
        });
      });
    },
  };

  /* ---------------------------------------------------------------------
     The create screen, in two scenes.

     The first version of a1 was invented — a tidy four-row form I guessed
     at. The real screen has nine sections and most of what makes the Club
     work is in them: that HOW TO PLAY is shown to people BEFORE they join,
     that a challenge will not start until enough have, that video proof
     expires into a still frame. None of that survives being summarised as
     "the host sets it up", so it is built from the screenshots instead.

     Split in two because it is genuinely two decisions: what the challenge
     IS, and who is in it.
     --------------------------------------------------------------------- */

  /** One settings block: a label, a control, and the line under it. */
  function setCard(label, build, note) {
    const card = el('div', 'fm-panel', { padding: '10px 12px 11px', opacity: '0' });
    const l = el('div', 'fm-mono', {
      fontSize: '9px', letterSpacing: '.18em', color: COL.dim, marginBottom: '9px',
    });
    l.textContent = label;
    card.appendChild(l);
    card.appendChild(build());
    if (note) {
      const n = el('div', 'fm-mono', {
        fontSize: '9px', lineHeight: '1.6', color: COL.faint, marginTop: '9px',
      });
      n.textContent = note;
      card.appendChild(n);
    }
    return card;
  }
  /** The amber segmented control the whole app is built out of. */
  function pills(labels, on) {
    const row = el('div', null, { display: 'flex', gap: '7px', flexWrap: 'wrap' });
    labels.forEach((t2, i) => {
      const sel = Array.isArray(on) ? on.indexOf(i) >= 0 : on === i;
      const p = el('div', 'fm-mono', {
        fontSize: '11px', letterSpacing: '.08em', padding: '7px 13px', borderRadius: '9px',
        color: sel ? '#1A1206' : COL.dim,
        background: sel ? COL.amber : 'transparent',
        border: '1px solid ' + (sel ? COL.amber : COL.line),
      });
      p.textContent = t2;
      row.appendChild(p);
    });
    return row;
  }
  /** The −  n  + stepper. */
  function stepper(value) {
    const row = el('div', null, { display: 'flex', alignItems: 'center', gap: '12px' });
    const mk = (ch) => {
      const b = el('div', 'fm-mono', {
        width: '30px', height: '30px', borderRadius: '8px', display: 'grid', placeItems: 'center',
        border: '1px solid ' + COL.line, color: COL.dim, fontSize: '14px',
      });
      b.textContent = ch;
      return b;
    };
    const v = el('div', 'fm-disp', { fontSize: '22px', fontWeight: '800', color: COL.ink, minWidth: '26px', textAlign: 'center' });
    v.textContent = value;
    row.append(mk('−'), v, mk('+'));
    return row;
  }

  /* a1 · what the challenge is */
  const a1 = {
    id: 'a1', dur: 10000,
    vo: t('a1.vo'),
    caps: capsFor('a1'),
    render(node) {
      ambient(node, 'rgba(255,180,84,.09)', 900);
      const c = appCol(node, 560);
      drift(c, 10000, 1.02);

      const head = el('div', 'fm-disp', {
        fontSize: '22px', fontWeight: '900', letterSpacing: '.16em',
        color: COL.ink, marginBottom: '12px', paddingLeft: '2px', opacity: '0',
      });
      head.textContent = t('a1.screen');
      c.appendChild(head);
      anim(head, [
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'translateY(0px)' },
      ], { duration: 640, easing: EASE, fill: 'both' });

      const nameCard = setCard(t('a1.cName'), () => {
        const row = el('div', null, { display: 'flex', gap: '8px', alignItems: 'stretch' });
        const emo = el('div', null, {
          width: '46px', borderRadius: '9px', border: '1px solid ' + COL.line,
          display: 'grid', placeItems: 'center', fontSize: '20px',
        });
        emo.textContent = '🏃';
        const box = el('div', 'fm-disp', {
          flex: '1', borderRadius: '9px', border: '1px solid ' + COL.line,
          padding: '10px 12px', fontSize: '16px', fontWeight: '600', color: COL.ink,
        });
        box.textContent = t('s6.challenge');
        row.append(emo, box);
        return row;
      });

      /* The note is the point of this card, not decoration: it is the only
         place the app promises that an invitee reads the deal before saying
         yes, which is what stops a challenge being a bait-and-switch. */
      const howCard = setCard(t('a1.cHow'), () => {
        const box = el('div', null, {
          borderRadius: '9px', border: '1px solid ' + COL.line, padding: '11px 12px',
          fontSize: '14px', lineHeight: '1.6', color: COL.ink, whiteSpace: 'pre-line',
        });
        box.textContent = t('a1.howText');
        return box;
      }, t('a1.howNote'));

      const durCard = setCard(t('a1.cDuration'),
        () => pills([t('a1.d7'), t('a1.d30'), t('a1.dCustom')], 1), t('a1.durNote'));
      const cadCard = setCard(t('a1.cCadence'),
        () => pills([t('a1.cEvery'), t('a1.cPerWeek')], 0), t('a1.cadNote'));

      [nameCard, howCard, durCard, cadCard].forEach((card, i) => {
        card.style.marginBottom = '9px';
        c.appendChild(card);
        after(620 + i * 900, () => {
          anim(card, [
            { opacity: 0, transform: 'translateY(16px) scale(.985)', filter: 'blur(8px)' },
            { opacity: 1, transform: 'translateY(0px) scale(1)', filter: 'blur(0px)' },
          ], { duration: 720, easing: EASE, fill: 'both' });
          sfx.tick();
        });
      });
    },
  };

  /* a3 · who is in it, and what counts */
  const a3 = {
    id: 'a3', dur: 14000,
    vo: t('a3.vo'),
    caps: capsFor('a3'),
    render(node) {
      ambient(node, 'rgba(255,180,84,.09)', 900);
      const c = appCol(node, 580);
      drift(c, 14000, 1.02);

      const grid = el('div', null, {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px', marginBottom: '7px',
      });
      const minCard = setCard(t('a3.cMin'), () => stepper('2'), t('a3.minNote'));
      const maxCard = setCard(t('a3.cMax'), () => pills(['4', '8', '20', '40'], 1));
      const joinCard = setCard(t('a3.cJoin'), () => pills([t('a3.jAnyone'), t('a3.jApprove')], 0), t('a3.joinNote'));
      const invCard = setCard(t('a3.cInvite'), () => pills([t('a3.iAnyone'), t('a3.iHost')], 0), t('a3.invNote'));
      grid.append(minCard, maxCard, joinCard, invCard);
      c.appendChild(grid);

      /* Full width, because it is the setting the next two scenes are about. */
      const proofCard = setCard(t('a3.cProof'), () => {
        const wrap = el('div', null, { display: 'flex', flexDirection: 'column', gap: '10px' });
        wrap.appendChild(pills([t('a3.pOff'), t('a3.pRequire')], 1));
        const typeRow = el('div', null, { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' });
        const lab = (txt) => {
          const x = el('div', 'fm-mono', { fontSize: '9px', letterSpacing: '.16em', color: COL.dim });
          x.textContent = txt;
          return x;
        };
        typeRow.append(lab(t('a3.pType')), pills([t('a3.pPhoto'), t('a3.pVideo')], [0, 1]),
                       lab(t('a3.pSee')), pills([t('a3.sAll'), t('a3.sHost')], 0));
        wrap.appendChild(typeRow);
        return wrap;
      }, t('a3.proofNote'));
      c.appendChild(proofCard);

      /* The button that actually makes it exist. Shown because "then you
         press the button" is a sentence a viewer has to be able to match to
         something, and because the challenge does NOT begin here — the host
         starts it later, from the lobby, and the clock starts then. */
      const actions = el('div', null, {
        display: 'flex', gap: '10px', marginTop: '9px', opacity: '0',
      });
      const go = el('div', 'fm-mono', {
        flex: '1', textAlign: 'center', padding: '12px 0', borderRadius: '12px',
        background: 'linear-gradient(180deg,#FFC46E,' + COL.amber + ')', color: '#1A1206',
        fontWeight: '800', fontSize: '13px', letterSpacing: '.1em',
        boxShadow: '0 14px 32px -12px rgba(255,180,84,.6)',
      });
      go.textContent = t('a3.btnCreate');
      const cancel = el('div', 'fm-mono', {
        width: '120px', textAlign: 'center', padding: '12px 0', borderRadius: '12px',
        border: '1px solid ' + COL.line, color: COL.dim, fontSize: '13px', letterSpacing: '.1em',
      });
      cancel.textContent = t('a3.btnCancel');
      actions.append(go, cancel);
      c.appendChild(actions);

      [minCard, maxCard, joinCard, invCard, proofCard].forEach((card, i) => {
        after(500 + i * 620, () => {
          anim(card, [
            { opacity: 0, transform: 'translateY(14px) scale(.985)', filter: 'blur(8px)' },
            { opacity: 1, transform: 'translateY(0px) scale(1)', filter: 'blur(0px)' },
          ], { duration: 680, easing: EASE, fill: 'both' });
          sfx.tick();
        });
      });
      after(3700, () => {
        anim(actions, [
          { opacity: 0, transform: 'translateY(12px)' },
          { opacity: 1, transform: 'translateY(0px)' },
        ], { duration: 620, easing: EASE, fill: 'both' });
      });
      /* pressed, on the line that says so */
      after(11200, () => {
        const ring = el('div', null, {
          position: 'absolute', left: '50%', top: '50%', width: '110px', height: '110px',
          marginLeft: '-55px', marginTop: '-55px', borderRadius: '50%',
          border: '2px solid rgba(255,180,84,.85)', pointerEvents: 'none',
        });
        go.style.position = 'relative';
        go.appendChild(ring);
        anim(ring, [
          { opacity: 0, transform: 'scale(1.6)' },
          { opacity: 1, transform: 'scale(.44)' },
          { opacity: 0, transform: 'scale(.36)' },
        ], { duration: 420, easing: 'ease-out', fill: 'both' });
        anim(go, [
          { transform: 'scale(1)' }, { transform: 'scale(.96)' }, { transform: 'scale(1)' },
        ], { duration: 400, delay: 240, easing: POP });
        after(260, () => { sfx.chime(); boboTada(); });
      });
    },
  };

  /* a4 · video proof — the owner's own clip, from his own gym.
     The footage is handheld and a bit soft, and that is the argument: this
     is what a real check-in looks like, nobody is producing anything. */
  const a4 = {
    id: 'a4', dur: 9800,
    vo: t('a4.vo'),
    caps: capsFor('a4'),
    render(node) {
      ambient(node, 'rgba(127,169,255,.09)', 940);
      const c = appCol(node, 640);
      drift(c, 9800, 1.03);

      const row = el('div', null, { display: 'flex', alignItems: 'center', gap: '30px' });
      c.appendChild(row);

      /* the clip, in a phone-shaped frame */
      const phone = el('div', null, {
        position: 'relative', width: '198px', height: '352px', flex: '0 0 auto',
        borderRadius: '26px', overflow: 'hidden', background: '#000',
        border: '1px solid rgba(255,255,255,.14)',
        boxShadow: '0 46px 92px -34px rgba(0,0,0,.95)', opacity: '0',
      });
      const vid = el('video');
      vid.src = '/assets/proof/gym.mp4';
      vid.poster = '/assets/proof/gym.jpg';
      vid.muted = true;
      vid.loop = true;
      vid.autoplay = true;
      vid.playsInline = true;
      vid.setAttribute('muted', '');
      vid.setAttribute('playsinline', '');
      Object.assign(vid.style, {
        position: 'absolute', inset: '0', width: '100%', height: '100%',
        objectFit: 'cover', display: 'block',
      });
      /* Autoplay can still be refused; the poster is then what shows, which
         is a frame of the same clip, so the scene never reads as broken. */
      try { const pr = vid.play(); if (pr && pr.catch) pr.catch(() => {}); } catch (e) {}

      const scrim = el('div', null, {
        position: 'absolute', left: '0', right: '0', bottom: '0', height: '38%',
        background: 'linear-gradient(to top, rgba(8,11,18,.92), transparent)',
      });
      const badge = el('div', 'fm-mono', {
        position: 'absolute', right: '10px', top: '10px', fontSize: '10px', color: COL.ink,
        background: 'rgba(11,14,23,.7)', padding: '3px 8px', borderRadius: '7px',
      });
      badge.textContent = t('a4.badge');
      const who = el('div', 'fm-disp', {
        position: 'absolute', left: '13px', bottom: '13px', fontSize: '15px', fontWeight: '700', color: '#fff',
      });
      who.textContent = t('s7.you');
      const when = el('div', 'fm-mono', {
        position: 'absolute', right: '13px', bottom: '15px', fontSize: '10px', color: 'rgba(255,255,255,.62)',
      });
      when.textContent = t('a4.when');
      phone.append(vid, scrim, badge, who, when);
      row.appendChild(phone);

      /* what happens to it afterwards — the part nobody reads in settings */
      const list = el('div', null, { flex: '1', minWidth: '0' });
      row.appendChild(list);
      [t('a4.r1'), t('a4.r2'), t('a4.r3')].forEach((line, i) => {
        const item = el('div', null, {
          display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '18px', opacity: '0',
        });
        const dot = el('div', null, {
          width: '7px', height: '7px', borderRadius: '50%', marginTop: '8px', flex: '0 0 auto',
          background: i === 2 ? COL.blue : COL.go,
          boxShadow: '0 0 12px -1px ' + (i === 2 ? COL.blue : COL.go),
        });
        const tx = el('div', 'fm-disp', { fontSize: '18px', lineHeight: '1.45', color: COL.ink });
        tx.textContent = line;
        item.append(dot, tx);
        list.appendChild(item);
        after(1500 + i * 900, () => {
          anim(item, [
            { opacity: 0, transform: 'translateX(14px)' },
            { opacity: 1, transform: 'translateX(0px)' },
          ], { duration: 620, easing: EASE, fill: 'both' });
          sfx.tick();
        });
      });

      after(360, () => {
        anim(phone, [
          { opacity: 0, transform: 'translateY(34px) scale(1.08)', filter: 'blur(14px)' },
          { opacity: 1, transform: 'translateY(0px) scale(1)', filter: 'blur(0px)' },
        ], { duration: 1000, easing: EASE, fill: 'both' });
        sfx.pop();
      });
    },
  };

  /* n4 · the daily check-in — the thing the first cut never showed.
     ------------------------------------------------------------------
     The previous assembly cut from "you made a challenge" straight to the
     TODAY MISSION LIST and narrated it as though tapping those rows was how
     you check in. It is not: those are your own habits, a separate half of
     the app. A viewer came away thinking the challenge IS your mission list.

     This is now the real screen, laid out from a photograph of it: the board
     with everyone still on nothing, and under it the one amber card with one
     button. The beat the scene is built around is that a single tap changes
     the whole board — your line turns green, your score goes positive, and
     you move to the top. That is the actual feeling of using it, and it is
     the only thing this scene is trying to say. */
  const n4 = {
    id: 'n4', dur: 8000,
    vo: t('n4.vo'),
    caps: capsFor('n4'),
    render(node) {
      const glow = ambient(node, 'rgba(255,180,84,.12)', 860);
      const c = appCol(node, 540);
      drift(c, 8000, 1.025);

      /* ---- the board, before anyone has answered ---- */
      const lbHead = el('div', null, {
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 6px 9px',
      });
      const lbTitle = el('div', 'fm-mono', { fontSize: '10px', letterSpacing: '.2em', color: COL.dim });
      lbTitle.textContent = t('n4.lbLabel');
      const lbState = el('div', 'fm-mono', { fontSize: '10px', letterSpacing: '.2em', color: COL.red });
      lbState.textContent = t('n4.missed');
      lbHead.append(lbTitle, lbState);

      const board = el('div', 'fm-panel', { padding: '4px 12px', overflow: 'hidden' });
      const people = [
        { name: t('player.a'), initial: t('player.a').slice(0, 1), me: false },
        { name: t('player.b'), initial: t('player.b').slice(0, 1), me: false },
        { name: t('s7.you'), initial: t('s7.you').slice(0, 1), me: true },
      ];
      const rows = people.map((p) => {
        const r = el('div', 'fm-lb-row' + (p.me ? ' me' : ''));
        r.innerHTML =
          '<span class="fm-rank">1</span>' +
          '<span class="fm-ava' + (p.me ? ' me' : '') + '">' + escText(p.initial) + '</span>' +
          '<span style="flex:1;min-width:0">' +
            '<span class="fm-lb-name" style="display:block">' + escText(p.name) + '</span>' +
            '<span class="fm-lb-sub js-sub" style="display:block">' + t('n4.pending') + '</span>' +
          '</span>' +
          '<span class="fm-lb-score js-score">11 <span style="color:' + COL.faint + ';font-size:9px">' + t('s8.daysUnit') + '</span></span>';
        board.appendChild(r);
        return r;
      });
      const me = rows[2];

      /* ---- the card: one question, one button ---- */
      const card = el('div', 'fm-panel', {
        padding: '18px 20px 20px', marginTop: '14px',
        border: '1px solid ' + COL.amber,
        boxShadow: '0 0 0 4px rgba(255,180,84,.07), 0 34px 80px -30px rgba(0,0,0,.9)',
      });
      const day = el('div', 'fm-mono', {
        fontSize: '10px', letterSpacing: '.2em', color: COL.dim, marginBottom: '9px',
      });
      day.textContent = t('n4.day');
      const state = el('div', 'fm-disp', {
        fontSize: '26px', fontWeight: '800', color: COL.ink, marginBottom: '18px', letterSpacing: '-.01em',
      });
      state.textContent = t('n4.notLogged');
      const btn = el('div', 'fm-mono', {
        borderRadius: '999px', padding: '17px 0', textAlign: 'center',
        background: 'linear-gradient(180deg,#FFC46E,' + COL.amber + ')',
        color: '#1A1206', fontWeight: '800', fontSize: '15px', letterSpacing: '.12em',
        boxShadow: '0 14px 34px -12px rgba(255,180,84,.65)',
      });
      btn.textContent = t('n4.btn');
      card.append(day, state, btn);

      c.append(lbHead, board, card);
      reveal(board, { duration: 950 });
      reveal(lbHead, { duration: 950, dy: 18 });
      reveal(card, { duration: 1000, delay: 140, dy: 34 });

      /* ---- the tap, and everything it moves ---- */
      after(2750, () => {
        /* A ring closing on the button, the way a finger is about to. */
        const ring = el('div', null, {
          position: 'absolute', left: '50%', top: '50%', width: '120px', height: '120px',
          marginLeft: '-60px', marginTop: '-60px', borderRadius: '50%',
          border: '2px solid rgba(255,180,84,.85)', pointerEvents: 'none',
        });
        btn.style.position = 'relative';
        btn.appendChild(ring);
        anim(ring, [
          { opacity: 0, transform: 'scale(1.6)' },
          { opacity: 1, transform: 'scale(.42)' },
          { opacity: 0, transform: 'scale(.34)' },
        ], { duration: 420, easing: 'ease-out', fill: 'both' });
        anim(btn, [
          { transform: 'scale(1)' }, { transform: 'scale(.955)' }, { transform: 'scale(1)' },
        ], { duration: 400, delay: 240, easing: POP });
        after(240, () => sfx.tick());
      });

      after(3220, () => {
        card.style.borderColor = COL.go;
        card.style.boxShadow = '0 0 0 4px rgba(91,227,155,.09), 0 34px 80px -30px rgba(0,0,0,.9)';
        btn.style.background = 'rgba(91,227,155,.10)';
        btn.style.color = COL.go;
        btn.style.border = '1px solid rgba(91,227,155,.55)';
        btn.style.boxShadow = 'none';
        btn.style.padding = '16px 0';
        btn.textContent = t('n4.undo');
        anim(btn, [{ opacity: 0.2 }, { opacity: 1 }], { duration: 380, easing: EASE });
        /* The line flips rather than crossfades: a value REPLACED, not a
           value fading into another one. */
        anim(state, [
          { opacity: 1, transform: 'translateY(0px)' },
          { opacity: 0, transform: 'translateY(-16px)' },
        ], { duration: 190, easing: 'ease-in', fill: 'forwards' });
        after(190, () => {
          state.textContent = t('n4.checkedIn');
          state.style.color = COL.go;
          anim(state, [
            { opacity: 0, transform: 'translateY(16px)' },
            { opacity: 1, transform: 'translateY(0px)' },
          ], { duration: 420, easing: EASE, fill: 'both' });
        });
        anim(glow, [{ opacity: 1 }, { opacity: 0.25 }], { duration: 900, easing: EASE, fill: 'both' });
        sfx.chime();
        boboTada();
      });

      /* Your line on the board answers a beat later — the board is a
         consequence of the tap, so it must not move at the same instant. */
      after(3620, () => {
        const sub = me.querySelector('.js-sub');
        const score = me.querySelector('.js-score');
        sub.textContent = t('n4.logged');
        sub.classList.add('done');
        score.innerHTML = '12 <span style="color:' + COL.faint + ';font-size:9px">' + t('s8.daysUnit') + '</span>';
        score.style.color = COL.go;
        me.style.background = 'rgba(91,227,155,.10)';
        anim(score, [
          { transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' },
        ], { duration: 520, easing: POP });
        anim(sub, [{ opacity: 0 }, { opacity: 1 }], { duration: 360, easing: EASE });
      });

      /* And then you move. Equal-height rows, so the reorder is two
         translations rather than a layout thrash — and it reads better:
         you can watch yourself pass them. */
      after(4020, () => {
        const h = me.offsetHeight;
        anim(me, [{ transform: 'translateY(0px)' }, { transform: 'translateY(' + (-2 * h) + 'px)' }],
          { duration: 720, easing: EASE, fill: 'both' });
        rows.slice(0, 2).forEach((r, i) => {
          anim(r, [{ transform: 'translateY(0px)' }, { transform: 'translateY(' + h + 'px)' }],
            { duration: 720, delay: 60 + i * 50, easing: EASE, fill: 'both' });
          const rk = r.querySelector('.fm-rank');
          after(360 + i * 50, () => { rk.textContent = '2'; });
        });
        after(300, () => { me.querySelector('.fm-rank').classList.add('lead'); });
        sfx.pop();
      });

      after(4400, () => {
        lbState.style.color = COL.go;
        lbState.textContent = t('n4.allDone');
        anim(lbState, [
          { opacity: 0, transform: 'translateY(-8px)' },
          { opacity: 1, transform: 'translateY(0px)' },
        ], { duration: 420, easing: EASE, fill: 'both' });
      });
    },
  };


  /* Seven reused, two new. Same objects, re-narrated: a scene is its art plus
     its line, and only the line changed. */
  function recut(scene, id, dur) {
    return { id: id, dur: dur || scene.dur, vo: t(id + '.vo'), caps: capsFor(id), render: scene.render };
  }
  const n1 = recut(s1, 'n1', 6200);
  const n2 = recut(s6, 'n2', 11000);
  const n6 = recut(s7, 'n6', 9000);
  const n7 = recut(s8, 'n7', 7000);
  /* The mission list appears ONCE, here, after the challenge has finished —
     and the line over it says outright that this is the other half. It is in
     the combined cut only; the two focused cuts do not need the disclaimer,
     which is the whole reason they were split. */
  const n8 = recut(s2, 'n8', 10500);
  const n9 = recut(s9, 'n9', 9000);

  /* The solo cut. Same art as the first film — the Today screen, the payout,
     the streak, the heatmap — re-narrated around being left alone. */
  const b1 = recut(s1, 'b1', 7000);
  const b2 = recut(s2, 'b2', 11500);
  const b3 = recut(s3, 'b3', 7800);
  const b4 = recut(s4, 'b4', 7200);
  const b5 = recut(s5, 'b5', 7600);
  const b6 = recut(s9, 'b6', 8200);

  if (CUT === 'arena') return [n1, n2, a2, a1, a3, n3, n4, n5, a4, n6, n7, n9];
  if (CUT === 'solo') return [b1, b2, b3, b4, b5, b6];
  return [n1, n2, n3, n4, n5, n6, n7, n8, n9];

}
