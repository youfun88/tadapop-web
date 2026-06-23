# Tadapop — ~75-second explainer film

**Host:** "BOBO", a buff one-eyed alien fitness mascot who hosts mission control.
On the landing page he's the **painted hero art**, isolated and composited from
layers (body + eye + mouth) so he **blinks**, **lip-syncs** while talking, does a
gentle body-bob, and pops a **"Tada!"** on a cleared mission. Voiceover is real
ElevenLabs audio — voice **Liam** (energetic male), one MP3 per scene in
`assets/vo/`, with the browser speech engine as a fallback. Captions carry the
message when muted (most web video is watched silent).

**Tone:** fun, playful, and motivating — the "stop saying tomorrow" / **yesterday-you
vs today-you** energy. The promise: use Tadapop and your whole life clicks onto
track — you become the person you keep describing.

**Where it lives:** a "▶ Watch the film" button in the hero opens a fullscreen
cinematic player. Plays once; replay / install at the end. The app is in **open
beta** — the closing CTA sends viewers to install (iOS TestFlight + Android), not
a waitlist.

> The `vo:` text in `film.js` is the source of truth. To regenerate audio:
> `source ~/.config/tadapop/eleven.env && node tools/generate-vo.mjs --bump`.

---

## Scene 1 · Cold open  (~5s)
**VO:** "Yeah, you — the one who keeps saying tomorrow. Tomorrow just clocked in."
**Caption:** Still saying tomorrow? → *Tomorrow just clocked in.*
**Visual:** console grid powers on, the logo ignites, tagline snaps in.

## Scene 2 · Today's missions  (~12s)
**VO:** "See those missions glowing? That's today, asking for you. Tap one done. Count the water, the steps, the pages. Or punch a timer and vanish into deep work."
**Caption:** Today is asking for you. → Tap. Count. *Lock in.*
**Visual:** the Today panel; rows check off one by one — a binary task, water counting 5→8 glasses, a Deep-Work timer bar running.

## Scene 3 · Tpoints  (~9s)
**VO:** "Clear every single one and the day pays out: one Tpoint. Miss one? Nothing. All or nothing, no nibbling."
**Caption:** Clear them all → *+1 Tpoint* → Miss one → nothing
**Visual:** the last mission checks off, the day flips to CLEARED, "+1" floats up and the Tpoints counter ticks 47 → 48.

## Scene 4 · Streaks  (~8s)
**VO:** "Day locked. Your streak climbs one taller. No freebies out here, friend, just yesterday-you losing to today-you, again."
**Caption:** *Day locked.* Streak climbs. → Yesterday-you never stood a chance.
**Visual:** progress bar goes all-green (5/5), "ALL OBJECTIVES CLEARED — DAY SECURED"; two stat cards — DAY STREAK ticks 11→12 and LONGEST 23d. (No rest days / freezes — the streak just grows when you show up.)

## Scene 5 · Stats & heatmap  (~7s)
**VO:** "Now look back. A whole year going green, and numbers too honest to argue with. That's your receipts."
**Caption:** A whole year of green. → Numbers that don't lie.
**Visual:** the year heatmap fills cell by cell; stat cards (streak / longest / Tpoints / completion); completion-rate bars grow.

## Scene 6 · Enter the Arena  (~6s)
**VO:** "Doing it solo? Cute. Drag your friends in — the Arena's open."
**Caption:** Doing it solo? Cute. → Enter the *Arena.*
**Visual:** the ARENA tab, "⚑ CONVENE A CHALLENGE", a 💧 Hydration Challenge card.

## Scene 7 · Compete with friends  (~10.5s)
**VO:** "Invite your crew, set days and a target, go live. Most days completed tops the board. Miss one, minus one. Post proof, talk trash."
**Caption:** Go live. Climb the board. → Miss a day → *−1.*
**Visual:** live leaderboard (💧 Hydration Challenge · LIVE · DAY 3/7), ranked by MOST DAYS, with a red **MISSED** column. The leader misses a day → −1 (red) and drops; you finish today (✓ DONE · 📷 PROOF) and climb to #1 with a crown. Your row is marked "(you)".

## Scene 8 · Win together  (~5.6s)
**VO:** "Win together. Lose together. Get scary good — together."
**Caption:** Win. Lose. → Get scary good — *together.*
**Visual:** 🏆 winner banner, podium 🥇🥈🥉, confetti, "that's you!".

## Scene 9 · Close & CTA  (~11.4s)
**VO:** "Tadapop. Track it, race your friends, become the you you keep describing. Free on iPhone and Android. Now up, soldier. Your first mission starts now. Tada!"
**Caption:** Become who you said you'd be. → Your first mission starts *now.*
**Visual:** logo, "Track. Compete. Become.", and a "Get the beta — iOS & Android" button.

---

**Total:** ~75 seconds.
