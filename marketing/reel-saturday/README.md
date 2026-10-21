# "Your Saturday, back." Reel production kit

A 30-second Instagram Reel for Nest & Rest Cleaning. It's finished and ready to post: motion graphics, typography in the website's own fonts, an original soundtrack and sound design, plus the caption, cover, posting plan and an optional Higgsfield B-roll pack.

| File | What it is |
|---|---|
| `nest-and-rest-saturday-reel.mp4` | **The Reel.** 1080×1920, 30 fps, 30s, H.264 + AAC 48 kHz, −14 LUFS. Loops seamlessly. |
| `nest-and-rest-saturday-reel-sfx-only.mp4` | The same picture with sound effects only, so you can add a trending song in Instagram. |
| `cover.png` | Cover frame (also reads well in the 3:4 profile-grid crop). |
| `reel.html` | Source for the animation. Open it in a browser to preview it with sound (click or press space). |
| `timeline.js` | The one cue sheet that drives both picture and sound. |
| `audio.py` | Builds the original soundtrack and sound effects from code. |
| `render.mjs` | Renders `reel.html` frame by frame to video and adds the soundtrack. |

---

## 1. The idea

**One idea: your Saturday shouldn't belong to chores. Nest & Rest cleans any day, Monday to Saturday, even while you're out, and you pay nothing until it's done.**

- **Who it's for:** busy households in Scarborough and North York, the same people the website talks to ("cleaning always ends up on your weekend").
- **The opening:** a dirty-screen illusion. The first frame looks like a soft-focus video with a hair, two fingerprints and dust "on the glass", and asks *"Is that on your screen?"* Most people's reflex is to rub their phone. Then a squeegee wipes the screen clean from the inside and drags the hair off: *"Made you look. Your home's next."* It stops anyone, even people who don't care about cleaning, and the joke *is* the service.
- **Feeling:** surprise, then relief. It ends on "You rest."
- **Format:** UI-led kinetic typography. After the gag, the story plays out on things people tap every day (a calendar, a price calculator, a checklist, a booking screen, a text), styled in the Nest & Rest brand.
- **Every claim is from your website:** from $145, no deposit and pay after, the five-step standard, the 24-hour free re-clean, "I clean every home myself", Monday to Saturday 8am to 6pm, no need to be home, confirmed by text, and 20% off for the first 50 households. Nothing is made up.

### Why it's built for the algorithm

Instagram's head, Adam Mosseri, has named watch time, likes per reach and sends per reach as the main ranking signals. Each choice below aims at one of those:

| Signal | What the Reel does |
|---|---|
| Hold in the first second | The dirty-screen illusion. Viewers inspect the frame (and their phone) instead of swiping. |
| Watch time and completion | The gag pays off at 2s, a new frame every 2 to 3s after that, and chapters numbered 01 to 06 so viewers feel progress. |
| Rewatches | A frame-exact loop: the end card dissolves back into the dirty screen ("dirty again"), and the music's last bar runs into its first. People rewatch to catch the trick. Replays count as watch time. |
| Sends | "Made you look" is the kind of trick people forward to a friend to see if it gets them too. |
| Muted viewing | Every line is burned in. The Reel works with the sound off. |
| Comments and DMs | One ask: **Comment REST for your price.** Each comment opens a DM conversation, which is a lead. |
| Originality | Original audio, no watermarks, made natively at 9:16. |

---

## 2. Hooks, scored

Three hooks that fit, each with separate spoken and on-screen lines, scored 0 to 100 on frontload, specificity, stakes, address and brevity.

| # | Formula | On-screen (6 words max) | Spoken | Front | Spec | Stakes | Address | Brevity | Score |
|---|---|---|---|---|---|---|---|---|---|
| **H0** | Cold Open Demo (pattern interrupt) | **Is that on your screen?** | "Wait. Is that on your screen?" | 90 | 60 | 45 | 100 | 95 | **78 STRONG** |
| H1 | Negative Command | Stop losing Saturdays to chores. | "Stop losing your Saturdays to chores." | 95 | 70 | 75 | 90 | 90 | 84 STRONG |
| H2 | The Callout | Scarborough, your Saturday's booked. | "Scarborough, North York: your Saturday's already booked. With chores." | 70 | 85 | 60 | 90 | 60 | 73 STRONG |

**The Reel opens on H0 and lands H1 at 4s.** H1 scores higher on words alone, but the rubric only reads the text. H0's real power is visual: the hair on the "glass" works on anyone, whether or not they've thought about cleaning. H1 then turns that attention into the problem. Scoring weeds out weak hooks; it can't pick between two strong ones. For that, use the Trial Reel A/B test in section 8.

---

## 3. Script and beat sheet

120 BPM: one beat = 0.5s, 15 bars = 30s. Every cut lands on a beat.

| Time | Beat | On screen | Picture and motion | Sound |
|---|---|---|---|---|
| 0.0–1.5 | **HOOK** | Is that on your *screen?* | A soft-focus, sunlit room drifting like video. On the "glass": a hair, two oily fingerprints, dust and lint, perfectly still. | Muffled groove, riser starts at 1.0 |
| 1.5–2.0 | **THE WIPE** | | A squeegee blade wipes the screen from the inside; it catches the hair and drags it off the edge. | Rubber squeak and swish |
| 2.0–4.0 | **PAYOFF** | Made you look. Your home's *next.* | Navy. A glint sweeps across the clean glass; a notification pops: "Screen cleaned · 1 hair · 2 fingerprints · dust". | **Drop.** Impact, glint chime, notification ding |
| 4.0–6.0 | **PROBLEM** | Stop losing *Saturdays* to chores. | Vertical push. A "Saturday" calendar with 4 chores; a green underline draws, and the chores are struck and swiped away on the beat, 4 → 0. | Swipe and a rising blip per chore |
| 6.0–8.0 | **STAKE** | Get your *Saturday* back. | **Squeegee wipe** to ivory. Same calendar, same spot (match cut): an all-day green block springs open: "*Yours.*" | Full groove |
| 8.0–10.5 | 01 Price | Your price, *before you book.* | **House iris** (the logo's house shape opens the scene). Condo, 1 bed, 1 bath tap on; the odometer rolls to **$145**. | Taps, ticks, landing chime, then **half a beat of silence** |
| 10.5–12.5 | 02 Payment | **$0** *to book.* Pay after it's done. | Hard cut on the hit. Giant $0 crash-zooms in from a blur. e-Transfer · card · cash. | Impact on the cut |
| 12.5–15.5 | 03 The standard | 5 steps. *Every visit.* | Squeegee wipe. The five steps tick off **on the beat**. | A climbing "check" on each tick |
| 15.5–17.5 | 04 Guarantee | Missed a spot? *Free re-clean.* | Vertical push. A mini squeegee wipes smudges off a big outlined "24h" and fills it in. | Squeak, sparkle chime |
| 17.5–20.0 | 05 Founder | "I clean every home *myself.*" Mann Patel · Founder | House iris. Your photo **inside the logo's house**, with the dots, sparkle and green swoosh drawing in. | Drums drop out, music warms |
| 20.0–23.0 | 06 Booking | Any day, *Mon to Sat.* | Squeegee wipe. A booking screen: Mon to Sat, Sunday greyed out; Tuesday gets tapped, then Morning; a green chip pops "No need to be home"; a text arrives: "Hi, it's Mann from Nest & Rest. See you Tuesday morning!" | Day strip ticks, tap, text ding |
| 23.0–25.5 | **OFFER** | **20%** off your *first visit.* (First 50 households) | Crash zoom with a flash. Gradient 20% counts up. Scarborough & North York. | Clap roll and riser, impact on the zoom |
| 25.5–29.5 | **ASK** | We clean. *You rest.* **Comment REST for your price** · Mon to Sat · 8am to 6pm | Squeegee wipe. The logo builds piece by piece; the CTA springs in and pulses on the beat; your hours and contact follow. | Logo shimmer, CTA pop |
| 29.5–30.0 | **LOOP** | | The end card dissolves back into the dirty screen, which lands on the exact first frame. | The filter closes back to the muffled intro |

**Checks:** hook under 3s ✓ · no beat over 4s ✓ · payoff at 2s, well before halfway ✓ · one ask ✓ · loops ✓ · no em dashes or AI filler words on screen or in the caption ✓.

### Optional voiceover (your voice, recorded in the Instagram editor)

The Reel doesn't need a voiceover. If you add one, read this at a normal pace. It's 73 words, about 27s at 165 words per minute, so it fits the cuts.

```
(0.0)  Wait. Is that on your screen?
(2.0)  Made you look. Your home's next.
(4.0)  Stop losing your Saturdays to chores.
(6.0)  Get your weekend back.
(8.0)  You see your price before you book.
(10.5) Nothing to pay until it's done.
(12.5) Five steps, every single visit.
(15.5) Missed a spot? I come back, free.
(17.5) I clean every home myself.
(20.0) Monday to Saturday. No need to be home.
(23.0) First fifty households get twenty percent off.
(25.5) We clean. You rest. Comment REST.
```

### On-screen cards (timed)

```
0.0   Is that on your screen?
2.0   Made you look. Your home's next.
4.0   Stop losing Saturdays to chores.
6.0   Get your Saturday back.  /  Yours.
8.0   Your price, before you book.  /  $145
10.5  $0 to book.  /  Pay after it's done.
12.5  5 steps. Every visit.
15.5  Missed a spot? Free re-clean.  /  24h
17.5  "I clean every home myself."
20.0  Any day, Mon to Sat.  /  No need to be home
23.0  20% off your first visit.
25.5  We clean. You rest.  /  Comment REST for your price  /  Mon to Sat · 8am to 6pm
```

```
REEL READY
hook:      #H0 Cold Open Demo (dirty-screen illusion), scored 78, with #H1 (84) at 4s
length:    30s across 13 beats, seamless loop
on-screen: 12 cards
caption:   below (section 7)
```

---

## 4. Design system

### Canvas and layout

- **1080 × 1920, 30 fps.** Words stay inside **x 80–850, y 230–1440**: clear of Instagram's top bar, the right-hand like/comment/share rail and the caption at the bottom. The bottom 480px is left quiet on purpose.
- **Editorial left column.** Chapter label at y 252, headline at y 318, the UI card from about y 660 to 1400. Every scene uses the same grid, so 13 fast beats still feel like one piece.
- **Match cut.** The calendar card sits in the same place in the problem and the stake, so "4 chores" becomes "Yours." without the eye having to move.

### Colour (your website's tokens)

| Token | Hex | Role |
|---|---|---|
| Ink Navy | `#0B2C4D` → `#071E35` | Dark scenes (gradient), headline type on light |
| Badge Ivory | `#F7F4EE` | Light scenes, type on navy (12.9:1 contrast) |
| Linen Stone | `#EFEAE1` / `#E6DFD3` | Guarantee scene, UI chips |
| Logo house blue | `#1DA1E8` | Accent words on navy (4.9:1, large text) |
| Wordmark blue | `#0E5C9E` | Accent words on ivory (6.3:1) |
| Leaf Green | `#7DC243` | Chapter labels on navy, ticks, "Yours.", "No need to be home", the REST tag |
| Logo cyan | `#45CFE0` | Sparkles and the gradient on 20% only |

Colour only ever comes from the logo, the same rule as the website.

### Typography: only the website's two fonts

| Use | Typeface | Setting |
|---|---|---|
| Headlines | **Montserrat ExtraBold 800** | 92–150px, line height 1.0, tracking −3.5% |
| Accent words (*screen?, next., Saturdays, before you book, Every visit, myself, Mon to Sat, first visit, You rest*) | **Montserrat ExtraBold 800**, in logo blue | 90–200px |
| Big numbers ($0, $145, 20%, 24h) | **Montserrat Black 900** | 250–640px, tracking −5 to −6% |
| UI: calendar, chips, booking, messages, toast | **DM Sans** 500–700 | 26–40px, like a real app |
| Chapter labels | Montserrat Bold 700, uppercase | 26px, +0.24em tracking, matching the website's labels |

**Bold all the way through.** Headlines stay ExtraBold from start to finish, like the website. Each headline's key word is picked out in the logo's blue (sky on navy, wordmark blue on ivory) and often sized up, so it reads first without changing weight. Every bold line was measured to stay inside the safe zone.

### Brand motifs, used as motion

- **The squeegee** is the signature: it wipes the dirty screen in the hook, then wipes scene to scene four more times and cleans the "24h". It's the one move that could only belong to a cleaning company.
- **The house** from your logo becomes the iris transition and the frame for your photo.
- **The four-point sparkle** twinkles wherever something is finished or clean.
- **The green swoosh** draws under your portrait and the end-card logo.

---

## 5. Motion

- **The dirt holds still while the room drifts.** That's what sells the illusion: the background moves like video, but the hair, prints and dust don't, as if they were on the glass. The fingerprints are drawn procedurally (oily haze plus broken ridges, masked to a finger-pad shape), and the same seed is used every render, so they never flicker.
- **Easing:** exponential ease-out for anything arriving, cubic in-out for wipes, damped springs with one overshoot for UI pops, exponential decay for camera punches.
- **Word reveals:** each word rises out of its own line mask with a 50–90ms stagger and a 7° tilt that settles to zero.
- **Transitions:** squeegee wipe ×5 (the first one is the hook), vertical push with motion blur ×2, house iris ×2, crash zoom with flash ×1, a hard cut after half a beat of silence ×1, and the dissolve that closes the loop.
- **Camera:** a slow drift on every scene plus punches of +4.5% scale and a 0.5° shake on the three big hits (2.0s, 10.5s, 23.0s).
- **Micro-interactions:** the hair dragged by the blade, a glint across the clean glass, a "Screen cleaned" notification, swipe-to-delete with a live counter, chip taps, odometers that spin a full turn before landing, ticks on the beat, a day strip that cascades in, a tap ripple on Tuesday, a text bubble, a CTA that pulses on the beat.
- **Finish:** 6% film grain and a soft vignette on the navy scenes, so the flat colour doesn't band after Instagram compresses it. The grain re-seeds at 7.5 fps, not every frame: noise that changes every frame eats the bitrate and turns blocky once Instagram re-encodes it.

---

## 6. Audio

**Original track, made from code: soft house, 120 BPM, F major.** You own it outright, so there's no copyright mute and it works on business accounts, which can't use most commercial songs.

- **Chords, one bar each:** Csus (the hook) · **F**maj7 (the drop, as the hair comes off) · Am7 · B♭maj7 · Fmaj7 · Am7 · Dm7 · B♭maj7 · Fmaj7 · B♭maj7 (founder) · Fmaj7 · Dm7 · B♭maj7 · **F**maj7 ("You rest.") · C. The track starts and ends on C, the chord that wants to resolve, and resolves to F exactly when the squeegee finishes the wipe. That pull is part of why the loop invites a replay.
- **Instruments:** four-on-the-floor kick, claps, 16th-note hats and shaker, off-beat bass (with harmonics so it's audible on phone speakers), FM electric piano stabs, a soft supersaw pad, a plucked arpeggio through a dotted-eighth ping-pong delay, and room reverb.
- **Arrangement:** a muffled intro under the dirty screen that opens into the drop, half a beat of silence before "$0", a stripped-back, warmer founder bar, a clap roll and riser into the offer, an end card without the arpeggio so it breathes, then the filter closes back to the intro so the loop is seamless.
- **Mix:** the kick ducks the music (sidechain pump), the sub-bass is shelved down (phones can't play it and it wastes loudness), and the track is mastered to **−14 LUFS integrated and −1 dBTP**, the level social and streaming apps commonly normalise to, so Instagram shouldn't need to turn it down or squash it.
- **Sound effects (synced to the frame):** the rubber squeak of the blade catching the hair, a glint chime, a notification ding, a swipe and rising blip per deleted chore, a squeegee swish on every wipe, whooshes, calculator taps, odometer ticks, climbing checks, a day-strip cascade and a tap on Tuesday, a text-received ding, sparkle chimes, and three impacts.

**Want a trending song instead?** Upload `nest-and-rest-saturday-reel-sfx-only.mp4`. In the Reels editor, tap the music icon and pick a track marked with the trending arrow ↗. Soft house, lo-fi house or an upbeat instrumental around 115–125 BPM matches the cut rhythm best. Set the song to about 70% and keep the original audio (the effects) at 100%. If the account is a business account, the music library is limited to commercially cleared tracks, which is why the original track is the default. When you post with the original track, rename the audio "Your Saturday, back · Nest & Rest" so others can reuse it and it links back to you.

---

## 7. Caption, hashtags, cover

**Caption** (your voice, from your website's tone). The first line shows before "more":

```
Did you just try to wipe your screen? 😄

Now imagine your whole home that clean, without giving up your Saturday.

I'm Mann, and I clean every Nest & Rest home myself, across Scarborough and North York, any day Monday to Saturday. You don't need to be home. You see your exact price before you book (regular cleans from $145), you pay nothing until it's done, and if I miss a spot, tell me within 24 hours and I'll come back and fix it, free.

Our first 50 households get 20% off their first visit.

Comment REST and I'll send you your price.

📍 Home cleaning in Scarborough & North York · Mon to Sat, 8am to 6pm
📞 647 978 6903 · nestnrestcleaning.com
```

**Hashtags (3 to 5, specific beats broad):** `#ScarboroughCleaning #NorthYorkCleaning #TorontoHouseCleaning #HomeCleaningToronto #NestAndRest`

**Also set:** location tag *Scarborough, Toronto* · alt text: *"Animated Reel. It opens on what looks like a hair and fingerprints on your phone screen, which a squeegee wipes away. Then a Saturday calendar full of chores gets cleared, followed by Nest & Rest's price from $145, no deposit, a five-step standard, a free 24-hour re-clean, founder Mann Patel, booking any day Monday to Saturday without being home, and 20% off for the first 50 households."* · cover: `cover.png` (the calendar frame; the dirty-screen frame would look like a smudge in your grid).

**Pinned comment:** `Comment REST and I'll text you your exact price 👇 (and yes, the hair wasn't real)`

**DM reply for everyone who comments REST:**

```
Hi! It's Mann from Nest & Rest 👋 Thanks for commenting.
What kind of home is it (condo, townhouse or house), and how many bedrooms and bathrooms?
I'll send your exact price. Or see it instantly here: nestnrestcleaning.com/book/
```

Reply to every comment within the first hour; replies count as conversation. If you get more comments than you can answer by hand, a comment-to-DM tool (for example ManyChat) can send the message above automatically.

---

## 8. Posting plan

- **When:** Sunday evening, 6 to 8pm. People have just spent the weekend on chores and are planning the week, and you clean Monday to Saturday, so the very next day is bookable. Repost to your Story on Thursday evening, when the weekend chores start to loom.
- **Story:** share the Reel with a quiz sticker: *"Did you try to wipe your screen?" Yes 😅 / No, I'm too smart*
- **Trial Reels (accounts with 1,000+ followers):** post this version as a Trial Reel to non-followers first. Then test a version that skips the dirty screen and opens straight on "Stop losing Saturdays to chores." Keep whichever holds viewers longer. That variant is a timing change in `timeline.js` and a re-render.
- **Cross-post:** upload the same clean file (no watermark) to Facebook Reels, TikTok and YouTube Shorts.
- **When the 50 founding spots are gone:** delete or change the 20% scene (S10 in `reel.html`) and re-render.

---

## 9. Higgsfield B-roll pack (optional upgrade)

The Reel is finished without this. If you want real-world texture, generate these clips in Higgsfield (9:16, 1080p, 3–5s each) and lay them under or between the cards in the Instagram editor or CapCut. Or send them back and they can be built into `reel.html` as background plates.

**Ground rules:** use AI footage only as mood. Never present it as a real client's home or a real before-and-after. Don't make an AI version of yourself: your real photo or a 3-second phone clip is more trustworthy. Grade everything toward the palette: shadows toward navy `#0B2C4D`, highlights toward ivory `#F7F4EE`.

| # | Where | Camera move | Prompt |
|---|---|---|---|
| 1 | Behind the dirty screen (0–1.5s) | **Dolly In**, very slow | Vertical 9:16. A calm, sunlit Toronto condo living room, completely out of focus: soft window light, a grey sofa, a plant, warm wood floor. Shallow depth of field, gentle drift, natural colour, ivory and navy palette. No people, no text. |
| 2 | Under the first wipe (1.5–2.0s) | **Dolly In** (macro) | Macro close-up of a rubber squeegee pulling across a fogged glass shower door in one smooth stroke, revealing a spotless sunlit bathroom behind it. Water droplets catching light, slow motion, ivory tiles, cinematic. 9:16, no people. |
| 3 | Checklist, "Street shoes off" (13.5s) | **Crane Down** | Overhead close-up at a condo front door: a person slips off outdoor sneakers and steps into clean indoor slip-on house shoes on a light oak floor. Warm morning light, minimalist entryway. 9:16. |
| 4 | Checklist, "Kitchen and bath cloths kept apart" (14.5s) | **Focus Change** (rack focus) | Two neatly folded microfiber cloths, one blue and one green, on a white marble counter. Rack focus from blue to green. Soft daylight, product-shot styling. 9:16, no text. |
| 5 | Guarantee (15.5–17.5s) | **Arc** / **360 Orbit** | Slow arc around a gleaming kitchen island in a Scarborough townhouse, faucet shining, stovetop spotless, morning light streaks. Ultra clean, calm. 9:16, no people. |
| 6 | Booking, "No need to be home" (21.5s) | **Tracking** | A hand turns a key in a condo lockbox in a bright hallway, then the door swings open onto a tidy, sunlit apartment. Clean, calm, trustworthy. 9:16. |
| 7 | End card (25.5–29.5s) | **Super Dolly Out** | A family relaxing on a sofa in a spotless, sun-filled living room, kids laughing, coffee on the table. Gentle slow dolly out, golden hour, warm editorial lifestyle film look. 9:16. |
| 8 | Founder (17.5–20s) | Not AI: shoot it | 3 seconds on your phone: you at a client's door (with permission), ringing once and smiling. It's the "Introduced by name" step, filmed for real. |

Higgsfield's model list and preset names change often. The moves above (Dolly In/Out, Crane, Arc/Orbit, Tracking, Focus Change) are standard camera-control presets, but check the exact names in the app. Lock the seed when you like a look, so the clips match each other.

---

## 10. Editing and re-rendering

```bash
cd marketing/reel-saturday
python3 audio.py                                    # soundtrack -> build/soundtrack.wav, soundtrack.m4a
NODE_PATH="$(npm root -g)" node render.mjs          # picture + sound -> both MP4s
NODE_PATH="$(npm root -g)" node render.mjs --stills 0,7.5,20   # check single frames in build/
NODE_PATH="$(npm root -g)" node render.mjs --cover 4.6         # cover.png
```

Needs Node with Playwright (Chromium), Python 3 with numpy and scipy, and ffmpeg.

- **Change words:** edit the scene's text in `reel.html`. Keep each card to 6 words or fewer.
- **Change timing:** edit `timeline.js`. Picture and sound both read it, so they stay in sync.
- **Change the sound:** chords, drums and effects are all in `audio.py`.

Every frame is a pure function of time (`window.__seek(t)`), so a render is exact and repeatable: no dropped frames and no drift between picture and sound.
