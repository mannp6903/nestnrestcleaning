# "Your Saturday, back." Reel production kit

A 24-second Instagram Reel for Nest & Rest Cleaning. It's finished and ready to post: motion graphics, typography, an original soundtrack and sound design, plus the caption, cover, posting plan and an optional Higgsfield B-roll pack.

| File | What it is |
|---|---|
| `nest-and-rest-saturday-reel.mp4` | **The Reel.** 1080×1920, 30 fps, H.264 + AAC 48 kHz, −14 LUFS. Loops seamlessly. |
| `nest-and-rest-saturday-reel-sfx-only.mp4` | The same picture with sound effects only, so you can add a trending song in Instagram. |
| `cover.png` | Cover frame (also reads well in the 3:4 profile-grid crop). |
| `reel.html` | Source for the animation. Open it in a browser to preview it with sound (click or press space). |
| `timeline.js` | The one cue sheet that drives both picture and sound. |
| `audio.py` | Builds the original soundtrack and sound effects from code. |
| `render.mjs` | Renders `reel.html` frame by frame to video and adds the soundtrack. |

---

## 1. The idea

**One idea: your Saturday shouldn't belong to chores, and getting it back costs you nothing upfront.**

- **Who it's for:** busy households in Scarborough and North York, the same people the website talks to ("cleaning always ends up on your weekend").
- **Feeling:** relief. It opens on the dread of a packed Saturday and ends on "You rest."
- **Format:** UI-led kinetic typography. The story plays out on things people tap every day (a calendar, a price calculator, a checklist, a text thread), styled in the Nest & Rest brand so it reads as premium, not as a template.
- **Every claim is from your website:** from $145, no deposit and pay after, the five-step standard, the 24-hour free re-clean, "I clean every home myself", booking in two minutes and confirmed by text, and 20% off for the first 50 households. Nothing is made up.

### Why it's built for the algorithm

Instagram's head, Adam Mosseri, has named watch time, likes per reach and sends per reach as the main ranking signals. Each choice below aims at one of those:

| Signal | What the Reel does |
|---|---|
| Hold in the first second | Words and motion on frame 1. The hook is readable before the first swipe-to-delete fires at 0.4s. |
| Watch time and completion | A new frame every 2 to 2.5s, chapters numbered 01 to 06 so viewers feel progress, and the payoff ("Yours.") lands at 2s, well before the halfway mark. |
| Rewatches | A frame-exact loop: the last half second wipes back to the first frame, and the music's last bar runs into its first. Replays count as watch time. |
| Muted viewing | Every line is burned in. The Reel works with the sound off. |
| Comments and DMs | One ask: **Comment REST for your price.** Each comment opens a DM conversation, which is a lead. |
| Sends | The hook is about a shared pain ("Stop losing Saturdays to chores"), the kind of thing people forward to whoever they share chores with. |
| Originality | Original audio, no watermarks, made natively at 9:16. |

---

## 2. Hooks, scored

Three formulas that fit, each with separate spoken and on-screen lines, scored 0 to 100 on frontload, specificity, stakes, address and brevity.

| # | Formula | On-screen (6 words max) | Spoken | Front | Spec | Stakes | Address | Brevity | Score |
|---|---|---|---|---|---|---|---|---|---|
| **H1** | Negative Command | **Stop losing Saturdays to chores.** | "Stop losing your Saturdays to chores." | 95 | 70 | 75 | 90 | 90 | **84 STRONG** |
| H3 | Cold Open Demo | Watch 4 chores disappear. | "Watch four chores disappear from your Saturday." | 80 | 85 | 55 | 80 | 85 | 77 STRONG |
| H2 | The Callout | Scarborough, your Saturday's booked. | "Scarborough, North York: your Saturday's already booked. With chores." | 70 | 85 | 60 | 90 | 60 | 73 STRONG |

**Winner: H1 on screen, H3 as the action under it.** While the hook text sits there, the four chores get swiped off the calendar, so the Reel gets both. H2 is the variant for a Trial Reel A/B test (section 8). Scoring weeds out weak hooks; it can't pick between two decent ones. Delivery, edit and audience decide that, which is what the A/B test is for.

---

## 3. Script and beat sheet

120 BPM: one beat = 0.5s. Every cut lands on a beat.

| Time | Beat | On screen | Picture and motion | Sound |
|---|---|---|---|---|
| 0.0–2.0 | **HOOK** | Stop losing *Saturdays* to chores. | Navy. A "Saturday" calendar card with 4 chores. A green underline draws under *Saturdays*; the chores are struck through and swiped away one by one, and the counter drops 4 → 0. | Muffled groove, a swipe and a rising blip per chore, riser into the drop |
| 2.0–4.5 | **STAKE** | Get your *Saturday* back. | **Squeegee wipe** to ivory. Same calendar, same spot (match cut): an all-day green block springs open: "*Yours.*" Sparkles. | **Drop.** Impact, full groove opens up |
| 4.5–7.0 | 01 Price | Your price, *before you book.* | **House iris** (the logo's house shape opens the next scene). Calculator: Condo, 1 bed, 1 bath tap on; odometer rolls to **$145**. | Taps, odometer ticks, landing chime, then **half a beat of silence** |
| 7.0–9.0 | 02 Payment | **$0** *to book.* Pay after it's done. | Hard cut on the hit. Giant $0 crash-zooms in from a blur. e-Transfer · card · cash. | Impact on the cut |
| 9.0–12.0 | 03 The standard | 5 steps. *Every visit.* | Squeegee wipe back to navy. The five steps tick off **on the beat**. | A climbing "check" on each tick |
| 12.0–14.0 | 04 Guarantee | Missed a spot? *Free re-clean.* | Vertical push with motion blur. Smudges on a big outlined "24h"; a mini squeegee wipes them clean and fills it in. | Squeak, sparkle chime |
| 14.0–16.5 | 05 Founder | "I clean every home *myself.*" Mann Patel · Founder | House iris. Your photo **inside the logo's house**, with the dots, sparkle and green swoosh drawing in. Slow pull-out. | Drums drop out, music warms: the breath moment |
| 16.5–19.0 | 06 Booking | Booked in *2 minutes.* | Squeegee wipe. A text thread: "Saturday at 10 works!", typing dots, "Hi, it's Mann from Nest & Rest. You're confirmed for Saturday at 10." Chip: No payment until it's done. | Send pop, receive ding, confirm chime |
| 19.0–21.5 | **PAYOFF** | **20%** off your *first visit.* (First 50 households) | Crash zoom through the phone with a flash. Gradient 20% counts up. Scarborough & North York. | Clap roll and riser, impact on the zoom |
| 21.5–24.0 | **ASK + LOOP** | We clean. *You rest.* **Comment REST for your price** | Squeegee wipe. The logo builds piece by piece. The CTA pill springs in and pulses on the beat. At 23.5 a final wipe lands on the exact first frame. | Logo shimmer, CTA pop; the filter closes back to the muffled intro |

**Checks:** hook under 3s ✓ · no beat over 4s (longest is 3.0s) ✓ · promise delivered at 2s ✓ · one ask ✓ · loops ✓ · no em dashes or AI filler words on screen or in the caption ✓.

### Optional voiceover (your voice, recorded in the Instagram editor)

The Reel doesn't need a voiceover. If you add one, read this at a normal pace. It's 57 words, about 21s at 165 words per minute, so it fits the cuts.

```
(0.0)  Stop losing your Saturdays to chores.
(2.0)  Get your weekend back.
(4.5)  You see your price before you book.
(7.0)  Nothing to pay until it's done.
(9.0)  Five steps, every single visit.
(12.0) Missed a spot? I come back, free.
(14.0) I clean every home myself.
(16.5) Booking takes two minutes.
(19.0) First fifty households get twenty percent off.
(21.5) We clean. You rest. Comment REST.
```

### On-screen cards (timed)

```
0.0   Stop losing Saturdays to chores.
2.0   Get your Saturday back.  /  Yours.
4.5   Your price, before you book.  /  $145
7.0   $0 to book.  /  Pay after it's done.
9.0   5 steps. Every visit.
12.0  Missed a spot? Free re-clean.  /  24h
14.0  "I clean every home myself."
16.5  Booked in 2 minutes.
19.0  20% off your first visit.
21.5  We clean. You rest.  /  Comment REST for your price
```

```
REEL READY
hook:      #H1 Negative Command, scored 84
length:    24s across 10 beats, seamless loop
on-screen: 10 cards
caption:   below (section 7)
```

---

## 4. Design system

### Canvas and layout

- **1080 × 1920, 30 fps.** Words stay inside **x 80–850, y 230–1440**: clear of Instagram's top bar, the right-hand like/comment/share rail and the caption at the bottom. The bottom 480px is left quiet on purpose.
- **Editorial left column.** Chapter label at y 252, headline at y 318, the UI card from about y 660 to 1400. Every scene uses the same grid, so 10 fast cuts still feel like one piece.
- **Match cut.** The calendar card sits in the same place in the hook and the payoff, so "4 chores" becomes "Yours." without the eye having to move.

### Colour (your website's tokens)

| Token | Hex | Role |
|---|---|---|
| Ink Navy | `#0B2C4D` → `#071E35` | Dark scenes (gradient), headline type on light |
| Badge Ivory | `#F7F4EE` | Light scenes, type on navy (12.9:1 contrast) |
| Linen Stone | `#EFEAE1` / `#E6DFD3` | Guarantee scene, UI chips |
| Logo house blue | `#1DA1E8` | Serif accent words on navy (4.9:1, large text) |
| Wordmark blue | `#0E5C9E` | Serif accent words on ivory (6.3:1) |
| Leaf Green | `#7DC243` | Chapter labels on navy, ticks, the "Yours." block, the REST tag |
| Logo cyan | `#45CFE0` | Sparkles and the gradient on 20% only |

Colour only ever comes from the logo, the same rule as the website.

### Typography

| Use | Typeface | Setting |
|---|---|---|
| Headlines | **Montserrat ExtraBold 800** (brand) | 92–150px, line height 1.0, tracking −3.5% |
| Big numbers ($0, $145, 20%, 24h) | **Montserrat Black 900** | 250–640px, tracking −5 to −6% |
| Emotional words (*Saturdays, back, before you book, Every visit, myself, You rest*) | **Instrument Serif Italic** (campaign accent, OFL) | 128–228px |
| UI: calendar, chips, messages | **DM Sans** 500–700 (brand) | 26–40px, like a real app |
| Chapter labels | Montserrat Bold 700, uppercase | 26px, +0.24em tracking, matching the website's labels |

Pairing a heavy geometric sans with a soft italic serif is the current editorial look. The sans carries the facts and the serif carries the feeling, so every headline has one warm word you can't miss.

### Brand motifs, used as motion

- **The house** from your logo becomes the iris transition and the frame for your photo.
- **The four-point sparkle** twinkles wherever something is finished or clean.
- **The green swoosh** draws under your portrait and the end-card logo.
- **The squeegee** is the signature transition: a diagonal blade with a rubber edge and a wet sheen wipes one scene clean to reveal the next. Five of the ten cuts use it, alternating direction. It's the one move that could only belong to a cleaning company.

---

## 5. Motion

- **Easing:** exponential ease-out for anything arriving (fast in, soft landing), cubic in-out for wipes, damped springs with one overshoot for UI pops, exponential decay for camera punches.
- **Word reveals:** each word rises out of its own line mask with a 50–90ms stagger and a 7° tilt that settles to zero.
- **Transitions:** squeegee wipe ×5, house iris ×2, vertical push with motion blur ×1, crash zoom with flash ×1, and a hard cut on the drop after half a beat of silence ×1.
- **Camera:** a slow drift on every scene (a wandering light, rotating outline shapes) plus punches of +4.5% scale and a 0.5° shake on the three big hits (2.0s, 7.0s, 19.0s).
- **Micro-interactions:** swipe-to-delete with a live counter, chip toggles, odometers that spin a full turn before landing, ticks on the beat, typing dots, message bubbles, a CTA that pulses on the beat.
- **Finish:** 6% film grain and a soft vignette on the navy scenes, so the flat colour doesn't band after Instagram compresses it. The grain re-seeds at 7.5 fps, not every frame: noise that changes every frame eats the bitrate and turns blocky once Instagram re-encodes it.

---

## 6. Audio

**Original track, made from code: soft house, 120 BPM, F major.** You own it outright, so there's no copyright mute and it works on business accounts, which can't use most commercial songs.

- **Chords, one bar each:** Csus · **F**maj7 (the drop) · Am7 · B♭maj7 · Fmaj7 · Am7 · Dm7 · B♭maj7 (founder) · Fmaj7 · Dm7 · B♭maj7 · C. The track starts and ends on C, the chord that wants to resolve, and resolves to F exactly when the first squeegee wipe hits. That's why the loop feels like it pulls you into a replay.
- **Instruments:** four-on-the-floor kick, claps, 16th-note hats and shaker, off-beat bass (with harmonics so it's audible on phone speakers), FM electric piano stabs, a soft supersaw pad, a plucked arpeggio through a dotted-eighth ping-pong delay, and room reverb.
- **Arrangement:** a muffled intro that opens into the drop, half a beat of silence before "$0", a stripped-back, warmer founder bar, a clap roll and riser into the offer, then the filter closes back to the intro so the loop is seamless.
- **Mix:** the kick ducks the music (sidechain pump), the sub-bass is shelved down (phones can't play it and it wastes loudness), and the track is mastered to **−14 LUFS integrated and −1 dBTP**, the level social and streaming apps commonly normalise to, so Instagram shouldn't need to turn it down or squash it.
- **Sound effects (synced to the frame):** a swipe plus a rising blip per deleted chore, a squeegee swish and rubber squeak on every wipe, whooshes, UI taps, odometer ticks, climbing checks, a send pop and receive ding, sparkle chimes, and three impacts.

**Want a trending song instead?** Upload `nest-and-rest-saturday-reel-sfx-only.mp4`. In the Reels editor, tap the music icon and pick a track marked with the trending arrow ↗. Soft house, lo-fi house or an upbeat instrumental around 115–125 BPM matches the cut rhythm best. Set the song to about 70% and keep the original audio (the effects) at 100%. If the account is a business account, the music library is limited to commercially cleared tracks, which is why the original track is the default. When you post with the original track, rename the audio "Your Saturday, back · Nest & Rest" so others can reuse it and it links back to you.

---

## 7. Caption, hashtags, cover

**Caption** (your voice, from your website's tone). The first line shows before "more":

```
Your Saturday shouldn't belong to your bathroom.

I'm Mann, and I clean every Nest & Rest home myself, across Scarborough and North York. You see your exact price before you book (regular cleans from $145), you pay nothing until it's done, and if I miss a spot, tell me within 24 hours and I'll come back and fix it, free.

Our first 50 households get 20% off their first visit.

Comment REST and I'll send you your price.

📍 Home cleaning in Scarborough & North York · Mon to Sat, 8am to 6pm
📞 647 978 6903 · nestnrestcleaning.com
```

**Hashtags (3 to 5, specific beats broad):** `#ScarboroughCleaning #NorthYorkCleaning #TorontoHouseCleaning #HomeCleaningToronto #NestAndRest`

**Also set:** location tag *Scarborough, Toronto* · alt text: *"Animated Reel: a Saturday calendar full of chores gets cleared, followed by Nest & Rest's price from $145, no deposit, a five-step standard, a free 24-hour re-clean, founder Mann Patel, and 20% off for the first 50 households."* · cover: `cover.png`.

**Pinned comment:** `Comment REST and I'll text you your exact price 👇`

**DM reply for everyone who comments REST:**

```
Hi! It's Mann from Nest & Rest 👋 Thanks for commenting.
What kind of home is it (condo, townhouse or house), and how many bedrooms and bathrooms?
I'll send your exact price. Or see it instantly here: nestnrestcleaning.com/book/
```

Reply to every comment within the first hour; replies count as conversation. If you get more comments than you can answer by hand, a comment-to-DM tool (for example ManyChat) can send the message above automatically.

---

## 8. Posting plan

- **When:** Thursday evening, 7 to 9pm. That's when people start dreading the weekend's chores, so the hook lands hardest, and Thursday-to-Saturday is exactly when someone would book. Repost to your Story on Saturday morning.
- **Story:** share the Reel with a poll sticker: *"Who cleans on Saturday at your place?" Me / Someone else 😅*
- **Trial Reels (accounts with 1,000+ followers):** post this version as a Trial Reel to non-followers first. Then run a second version with hook H2 ("Scarborough, your Saturday's booked.") and keep whichever holds viewers longer. Changing the hook is a one-line edit in `reel.html`.
- **Cross-post:** upload the same clean file (no watermark) to Facebook Reels, TikTok and YouTube Shorts.
- **When the 50 founding spots are gone:** delete or change the 20% scene (S8 in `reel.html`) and re-render.

---

## 9. Higgsfield B-roll pack (optional upgrade)

The Reel is finished without this. If you want real-world texture, generate these clips in Higgsfield (9:16, 1080p, 3–5s each) and lay them under or between the cards in the Instagram editor or CapCut. Or send them back and they can be built into `reel.html` as background plates.

**Ground rules:** use AI footage only as mood. Never present it as a real client's home or a real before-and-after. Don't make an AI version of yourself: your real photo or a 3-second phone clip is more trustworthy. Grade everything toward the palette: shadows toward navy `#0B2C4D`, highlights toward ivory `#F7F4EE`.

| # | Where | Camera move | Prompt |
|---|---|---|---|
| 1 | Behind the hook (0–2s) | **Crash Zoom In** or **Snorricam** | Vertical 9:16. Saturday morning in a bright Toronto condo bathroom, a tired person in a grey hoodie holding a scrub brush, staring at the tub. Soft overcast window light, handheld documentary feel, shallow depth of field, natural colour, ivory tiles, navy towels. No text, no logos. |
| 2 | Under the first squeegee wipe (2.0s) | **Dolly In** (macro) | Macro close-up of a rubber squeegee pulling across a fogged glass shower door in one smooth stroke, revealing a spotless sunlit bathroom behind it. Water droplets catching light, slow motion, ivory tiles, cinematic. 9:16, no people. |
| 3 | Checklist, "Street shoes off" (9.5s) | **Crane Down** | Overhead close-up at a condo front door: a person slips off outdoor sneakers and steps into clean indoor slip-on house shoes on a light oak floor. Warm morning light, minimalist entryway. 9:16. |
| 4 | Checklist, "Kitchen and bath cloths kept apart" (10.5s) | **Focus Change** (rack focus) | Two neatly folded microfiber cloths, one blue and one green, on a white marble counter. Rack focus from blue to green. Soft daylight, product-shot styling. 9:16, no text. |
| 5 | Guarantee (12–14s) | **Arc** / **360 Orbit** | Slow arc around a gleaming kitchen island in a Scarborough townhouse, faucet shining, stovetop spotless, morning light streaks. Ultra clean, calm. 9:16, no people. |
| 6 | End card (21.5–24s) | **Super Dolly Out** | A family relaxing on a sofa in a spotless, sun-filled living room, kids laughing, coffee on the table. Gentle slow dolly out, golden hour, warm editorial lifestyle film look. 9:16. |
| 7 | Founder (14–16.5s) | Not AI: shoot it | 3 seconds on your phone: you at a client's door (with permission), ringing once and smiling. It's the "Introduced by name" step, filmed for real. |

Higgsfield's model list and preset names change often. The moves above (Crash Zoom, Dolly In/Out, Crane, Arc/Orbit, Snorricam, Focus Change) are standard camera-control presets, but check the exact names in the app. Lock the seed when you like a look, so the clips match each other.

---

## 10. Editing and re-rendering

```bash
cd marketing/reel-saturday
python3 audio.py                                    # soundtrack -> build/soundtrack.wav, soundtrack.m4a
NODE_PATH="$(npm root -g)" node render.mjs          # picture + sound -> both MP4s
NODE_PATH="$(npm root -g)" node render.mjs --stills 0,7.5,20   # check single frames in build/
NODE_PATH="$(npm root -g)" node render.mjs --cover 0.34        # cover.png
```

Needs Node with Playwright (Chromium), Python 3 with numpy and scipy, and ffmpeg.

- **Change words:** edit the scene's text in `reel.html`. Keep each card to 6 words or fewer.
- **Change timing:** edit `timeline.js`. Picture and sound both read it, so they stay in sync.
- **Change the sound:** chords, drums and effects are all in `audio.py`.

Every frame is a pure function of time (`window.__seek(t)`), so a render is exact and repeatable: no dropped frames and no drift between picture and sound.
