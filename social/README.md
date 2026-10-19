# Social posts: October 2026

Five feed posts for Instagram and Facebook, each 1080 × 1350 (4:5, the tallest size both feeds show uncropped), plus a 1080 × 1920 story version of each.

- **Figma (editable source for the feed posts):** https://www.figma.com/design/3HedZL7VFYwob3ZS1qcalp
- **Feed images to upload:** `posts/`
- **Story images to upload:** `stories/` (see "Stories" below)
- **Prompt used to brief the work:** `PROMPT.md`

Every claim below comes from `js/config.js`. Nothing says insured, eco-certified or background-checked, and there are no star ratings, because none of those are switched on yet. When the founding offer ends, retire post 04 (set `offers.founding.active` to `false` on the site too).

Suggested order: post 01 first, then one post every two or three days. On Instagram the grid will alternate dark and light.

---

## 01 · We clean. You rest.
`posts/01-we-clean-you-rest.png`

**Instagram**
> We clean. You rest.
>
> Meticulous home cleaning across Scarborough and North York, done the same careful way every visit. A uniformed team, house shoes at your door, and your exact price before you book.
>
> See your price in seconds at nestnrestcleaning.com (link in bio).
>
> #Scarborough #NorthYork #Toronto #HomeCleaning #HouseCleaning #CleaningService #TorontoHomes #Willowdale #Agincourt #DonMills

**Facebook**
> We clean. You rest.
>
> Nest & Rest Cleaning is home cleaning for Scarborough and North York, done the same careful way every visit. You see your exact price before you book, there's no deposit, and you pay after the clean.
>
> See your price in seconds: https://nestnrestcleaning.com
> Prefer to talk? Call or text 647 978 6903, Monday to Saturday, 8 to 6.

**Alt text:** Navy graphic with a large four-point sparkle. Headline: "We clean. You rest." Smaller text: "Meticulous home cleaning, done the same careful way every visit." Nest & Rest Cleaning logo and nestnrestcleaning.com.

---

## 02 · Residence Care
`posts/02-residence-care.png`

**Instagram**
> Fine homes deserve a care plan.
>
> Residence Care is for larger homes with natural stone, marble, hardwood and glass. We start with a private walkthrough, write a room-by-room care plan, and use the right product on the right surface. The same team looks after your home whenever possible.
>
> Request a walkthrough at nestnrestcleaning.com (link in bio).
>
> #ResidenceCare #LuxuryHomes #TorontoHomes #NorthYork #YorkMills #BayviewVillage #Scarborough #MarbleCare #HomeCare #Toronto

**Facebook**
> Fine homes deserve a care plan, not a checklist.
>
> Residence Care is for homes over about 3,000 sq ft, or homes with natural stone, marble, hardwood and glass:
> 01 A private, in-person walkthrough
> 02 A written, room-by-room care plan
> 03 The same team each visit, whenever possible
>
> Request a walkthrough. We reply within one business day: https://nestnrestcleaning.com/services/residence-care/

**Alt text:** Navy and ivory graphic. Headline: "Fine homes deserve a care plan." Subline: "For larger homes with stone, marble, hardwood and glass." Three numbered steps: a private walkthrough, a written care plan, the same team whenever possible.

---

## 03 · Street shoes stay at the door
`posts/03-street-shoes-stay-at-the-door.png`

**Instagram**
> Street shoes stay at the door.
>
> Toronto streets carry grit and salt, especially in winter. Our team changes into indoor-only house shoes before stepping inside, so your floors only meet clean soles.
>
> A small detail. It's the standard.
>
> Book your clean at nestnrestcleaning.com (link in bio).
>
> #TheNestAndRestStandard #Scarborough #NorthYork #TorontoWinter #HomeCleaning #CleanHome #HardwoodFloors #CleaningService #Toronto

**Facebook**
> Street shoes stay at the door.
>
> Grit and road salt are hard on floors, especially in a Toronto winter. Our team changes into indoor-only shoes at your door, so your floors only meet clean soles.
>
> Book your clean: https://nestnrestcleaning.com

**Alt text:** Illustration of a pair of navy house shoes inside an arched doorway, on a warm stone background. Headline: "Street shoes stay at the door." Text: "We change into indoor-only shoes at your door, so your floors only meet clean soles."

---

## 04 · Founding households
`posts/04-founding-households-20-off.png`

**Instagram**
> 20% off your first visit, for our first 50 households.
>
> Founding households in Scarborough and North York get 20% off their first visit. No deposit, and you pay after the clean.
>
> Book your first visit at nestnrestcleaning.com (link in bio).
>
> #FoundingHousehold #Scarborough #NorthYork #Toronto #HomeCleaning #DeepCleaning #CleaningService #TorontoHomes #Willowdale

**Facebook**
> 20% off your first visit, reserved for our first 50 households.
>
> Founding households in Scarborough and North York receive 20% off their first visit. There's no deposit: you pay after the clean, by e-Transfer, card or cash.
>
> Book your first visit: https://nestnrestcleaning.com/book/

**Alt text:** Navy graphic with a dashed stitched border. Large text: "20% off your first visit." Text: "Reserved for our first 50 households in Scarborough and North York. No deposit. You pay after the clean."

---

## 05 · Three promises, kept
`posts/05-three-promises-kept.png`

**Instagram**
> Three promises, kept.
>
> 01 Your exact price, before you book.
> 02 No deposit. You pay after the clean.
> 03 Missed a detail? Tell us within 24 hours and we'll come back and re-clean it, free.
>
> See your price in seconds at nestnrestcleaning.com (link in bio).
>
> #Scarborough #NorthYork #Toronto #HomeCleaning #HouseCleaning #CleaningService #TorontoHomes #Willowdale #Malvern

**Facebook**
> Three promises, kept.
>
> 01 Your exact price, before you book. If your home needs much more or less time than expected, we tell you before we start, never after.
> 02 No deposit. You pay after the clean.
> 03 Missed a detail? Tell us within 24 hours and we'll come back and re-clean it, free of charge.
>
> See your price in seconds: https://nestnrestcleaning.com

**Alt text:** Ivory graphic. Headline: "Three promises, kept." Three numbered lines: "Your exact price, before you book." "No deposit. You pay after the clean." "Missed a detail? Tell us within 24 hours and we re-clean it, free."

---

## Stories (Instagram and Facebook)

`stories/` has a 1080 × 1920 version of each post, with the same numbers and names. All text sits inside the story safe area: 250 px from the top and 340 px from the bottom, where the app's own buttons go.

The story images aren't in Figma. Figma's Starter plan ran out of design-tool calls, so they're built in `stories/stories.html` (same colours, fonts and layout) and rendered with `node social/stories/render.mjs`. Edit the HTML and re-run to change them.

When you post each one, add a **link sticker** in the clear space just above the footer line:

| Story | Link sticker | Sticker text |
|---|---|---|
| 01 We clean. You rest. | https://nestnrestcleaning.com | See your price |
| 02 Residence Care | https://nestnrestcleaning.com/services/residence-care/ | Request a walkthrough |
| 03 Street shoes | https://nestnrestcleaning.com/book/ | Book your clean |
| 04 Founding households | https://nestnrestcleaning.com/book/ | Book your first visit |
| 05 Three promises | https://nestnrestcleaning.com | See your price |

Optional, for replies: on story 03 add a poll sticker, "Shoes off at home?" with options "Always" and "Depends". Remove story 04 when the founding offer ends.

## Motion: Reels and Stories (the scroll-stoppers)

`motion/` has five animated 1080 × 1920 videos (10 to 11 seconds), plus a cover image for each. Every video opens on a hook in the first second and ends on the same call-to-action card: website, call or text, no deposit. Post them as Reels on Instagram and Facebook, and reuse them as Stories.

**Sound.** Each video has its own original soundtrack, made for it, so there's nothing to license and no copyright claims:
- A bright 116–122 bpm music bed in the same key across all five, so they sound like one brand. Four of the tracks drop at the video's turning point: the screen wiped clean, the split into You vs Us, the floor swept, the jackpot. The price demo runs at full energy from the first frame.
- Sound effects on every on-screen beat: squeegee squeaks, muddy boot stomps, slot-machine ticks and dings, rising pops for the 50 houses, a calculator click and coin chime for the price, and sparkle chimes.
- A three-note sparkle chime (the sound logo) when the logo appears on the end card. It's the same in every video, so people learn it.

The music ducks under the effects so every hit reads, and each track is mastered to -14 LUFS, the loudness Instagram and Facebook play at, so they won't turn it down. If you'd rather ride a trending sound, add it in the app and turn the original audio down; the effects still carry the edit.

**Quality.** Rendered from maximum-quality frames with real motion blur (4 samples per frame, 180° shutter), encoded as H.264 High at about 10–20 Mbps with BT.709 colour (so the brand blues and greens stay exact), 30 fps, AAC 320 kbps at 48 kHz. That's well above what Instagram and Facebook keep, so their compression has a clean source to work from. Upload the files as they are; don't re-export them through another app.

| Video | The hook | Ends on |
|---|---|---|
| `01-is-your-screen-dirty.mp4` | The phone screen looks grimy, then a squeegee wipes it clean | "Book your clean" |
| `02-you-vs-us.mp4` | Your Saturday (brunch, the Bluffs, a nap) against our list (baseboards, grout, glass) | "We clean. You rest." · Regular cleaning from $110 |
| `03-shoes-off.mp4` | Muddy boot prints stamp in: salt, slush, grit, mud | House shoes at the door |
| `04-only-50.mp4` | Slot machine spins to 20%, then 50 houses fill the screen | "Be one of the first 50" |
| `05-price-in-seconds.mp4` | A live demo of the site's price calculator: 2 bed, 2 bath condo deep clean, $275, $220 first visit | "Try it now" |

All prices are the site's own numbers from `js/config.js` and the calculator in `js/site.js`. If prices change, edit `motion/motion.html` and re-render with `node social/motion/render.mjs`. Each scene's sound cues sit next to its animation in that file; `motion/audio.py` synthesises the soundtrack. Rendering needs Node with Playwright, ffmpeg, and Python with numpy and scipy (`pip install numpy scipy`). Add `--fast` for a quick preview.

### Captions

**01 · Is your screen dirty?**
> That was satisfying. Now imagine your whole home. ✨
> Meticulous home cleaning in Scarborough and North York. Exact price before you book, no deposit, pay after the clean.
> Text us at 647 978 6903 or see your price at the link in bio.
> #Scarborough #NorthYork #Toronto #CleanTok #SatisfyingClean #HomeCleaning #CleaningService #TorontoHomes

**02 · You vs Us**
> Your Saturday: brunch, the Bluffs, a long nap.
> Ours: baseboards, grout, glass.
> Fair trade? Regular cleaning from $110. Link in bio, or text 647 978 6903.
> #WeCleanYouRest #Scarborough #NorthYork #ScarboroughBluffs #Toronto #HomeCleaning #WeekendVibes #CleaningService

**03 · Shoes off**
> Salt. Slush. Grit. Mud. Not on your floors.
> Our team changes into indoor-only house shoes at your door, every visit.
> Book your clean: link in bio, or text 647 978 6903.
> #TorontoWinter #Scarborough #NorthYork #HardwoodFloors #HomeCleaning #CleanFloors #CleaningService #Toronto

**04 · Only 50**
> 20% off your first visit, for our first 50 households only.
> No deposit. You pay after the clean.
> Claim yours: link in bio, or text "FOUNDING" to 647 978 6903.
> #FoundingHousehold #Scarborough #NorthYork #Toronto #HomeCleaning #DeepCleaning #CleaningService #TorontoDeals

**05 · Price in seconds**
> What does a deep clean cost? Tap, tap: $275 for a 2 bed, 2 bath condo, or $220 as a founding household.
> Your exact price before you book. No deposit. Try it at the link in bio.
> #DeepCleaning #Scarborough #NorthYork #Toronto #CondoLife #HomeCleaning #CleaningService #TorontoCondos

### Turning views into bookings

- **Bio link:** point it at https://nestnrestcleaning.com. Every video sends people there or to your phone.
- **Text keyword:** caption 04 asks people to text "FOUNDING". Reply to those texts fast; the site promises a reply within 2 hours during business hours.
- **Boost as ads:** in Meta Ads Manager, use 01 and 05 as Reels and Stories ads, with the audience set to the Scarborough and North York postal areas (homeowners and renters, 25+), and "Leads" or "Website traffic" as the objective. Add your Meta Pixel ID to `analytics.metaPixelId` in `js/config.js` first, so bookings are tracked back to the ad.
- **Order:** 01 first (widest appeal), then 05, 03, 02, and 04 last. Space them two or three days apart, and put each one in your Story on the day it posts, with a link sticker.
- **Pin** 01 and 04 to the top of your Instagram grid.

## Editing in Figma

- Colours are variables in the **Nest & Rest** collection, and type uses the text styles (Display, Label, Body, CTA). Change one and every post updates.
- The logo is the **Logo/Lockup** component, rebuilt as vectors from `assets/logo.png`. To use the original artwork, drop `assets/logo.png` into that component; every post updates.
- Each post's call to action is the **CTA** property on its Footer instance.
