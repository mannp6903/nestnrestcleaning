# Social posts: October 2026

Five feed posts for Instagram and Facebook. Each is 1080 × 1350 (4:5), the tallest size both feeds show uncropped.

- **Figma (editable source):** https://www.figma.com/design/3HedZL7VFYwob3ZS1qcalp
- **Images to upload:** `posts/`
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

## Editing in Figma

- Colours are variables in the **Nest & Rest** collection, and type uses the text styles (Display, Label, Body, CTA). Change one and every post updates.
- The logo is the **Logo/Lockup** component, rebuilt as vectors from `assets/logo.png`. To use the original artwork, drop `assets/logo.png` into that component; every post updates.
- Each post's call to action is the **CTA** property on its Footer instance.
