# Modern redesign: design spec

Date: 28 October 2026. Status: approved in conversation, section by section; awaiting review of this written spec.

## Goal

Make nestnrestcleaning.com look as clean and modern as the best cleaning-company sites in Toronto, without copying any competitor's brand, wording, fonts or imagery. Success means a first-time visitor sees a calm, bright, current site with friendly type, and the booking flow and content keep working exactly as they do today.

## What the owner asked for

- Match the polish of the benchmark site: a **cleaner, modern look** (not new booking mechanics, menus or content).
- **Keep the colours and logo** (navy, teal, warm ivory); change the type and the visual treatment.
- Restyle the **whole site in one pass** (approach A), with a reworked homepage.
- Headline font: **Plus Jakarta Sans**.
- Hero subheading (approved copy): *"Your weekends are for living, not scrubbing. Mann cleans your home with care, so you come back to calm, and you pay only after the clean."*

## Out of scope

- Booking logic, pricing, scope rules, analytics events and form behaviour (all tested in the previous change). Only their look changes.
- New content types: no invented reviews, ratings, badges, team or stock people photos. Real reviews and jobs already have slots in `js/config.js`.
- Navigation items and page set stay the same.

## 1. Typography

- **Headings:** Plus Jakarta Sans (variable, 200–800), self-hosted at `assets/fonts/plus-jakarta-sans.woff2` under the SIL Open Font License (licence file added beside it). Sentence case, weight 800 for h1/h2 and 700 for h3, letter-spacing −0.03em (h1/h2) and −0.015em (h3).
- **Body, labels, prices in forms:** DM Sans, unchanged.
- **Remove Barlow Condensed** (both files, its licence and `@font-face` rules, and the preload). The logos are SVG drawings with no text, so nothing else uses it. Net font weight drops from 82 KB to 64 KB.
- **Scale** (desktop / phone): home h1 76 / 48px, page h1 60 / 40px, h2 46 / 32px, h3 21–24px, lede 19 / 17px, body 17px.
- Small section labels ("Services", "Pricing") become a **teal label pill**: DM Sans 13px bold, teal-ink on a pale teal background, with a dot. No more tracked uppercase.
- Buttons and text links use Plus Jakarta Sans 700 in sentence case.

## 2. Colour, surfaces and components

- **Page background white**; warm ivory (`#F7F3EA`) alternates as the tint for every other section. Navy stays for the standard/guarantee panel, the final call to action and the footer. Teal is for accents, icons, links and the highlighted card. All existing colour tokens and dark mode are kept; dark mode gets matching surfaces.
- **Buttons:** pill shape, 52px tall (44px small). Primary navy, secondary white with a hairline border, teal for quotes. Soft shadow on primary.
- **Cards:** white, 20px radius, hairline border plus a soft shadow, more padding. The highlighted card (e.g. "Recommended first visit") gets a teal border and glow. Gentle hover lift on pointer devices only, and none when reduced motion is requested.
- **Icons:** in rounded-square soft-teal chips (42px).
- **Fields:** 14px radius, the same contrast-tested borders and placeholder colour as today.
- **Hero backgrounds:** white with two soft radial glows (sky top right, sand bottom left).
- **Bands** (standard, final call to action): rounded inset panels (28px radius) inside the page width instead of full-bleed blocks.

## 3. Homepage layout (same sections, same order)

1. **Hero:** label pill, "We clean. You rest." (accent on "You rest."), the approved subheading, buttons "Book your clean" and "How it works", Mann's avatar line. On desktop the price box overlaps a rounded room photo; on phones the price box stays on the first screen and the photo is hidden, as today.
2. **Trust strip:** the four assurances in one row of icon chips (2×2 on phones).
3. **Services:** centred label, heading and subtitle; a three-column card grid with icon, tag, description, "From" price and a Book button.
4. **How it works:** three numbered steps joined by a line; button plus "What happens after you request".
5. **The Nest & Rest standard:** rounded navy panel with the five steps and the guarantee card.
6. **Regular plans:** four plan cards, "Most popular" highlighted.
7. **Founder:** ivory section, rounded photo, quote, founding-offer card.
8. Real jobs and reviews (hidden until data exists), **areas** with the postal check, **guides** as image cards, the **FAQ** in two columns.
9. **Final call to action:** rounded navy panel. Footer restyled, with the same links.

## 4. Other pages and the booking form

- Every page inherits the new type, surfaces and components through `css/site.css`. Sub-page heroes use the white glow background, label pill and sentence-case h1, with breadcrumbs kept.
- Price and comparison tables: lighter row lines and sentence-case headers; the comparison keeps its first column readable when scrolling sideways.
- **Booking:** same steps, fields, rules and scripts. Restyled progress bar, choice cards, extras rows, arrival windows, review box, summary card and step buttons.
- **Header:** white bar with the same links and "See my price" as a pill button; a soft shadow appears on scroll. The mobile menu is restyled, with the same items.

## Implementation notes

- Changes live in `css/site.css` (tokens, type, components), `tools/build.mjs` (hero markup, label pills, homepage section wrappers, font preload) and `assets/fonts/`. `js/site.js` changes only if a selector it relies on changes; the existing `data-*` hooks are kept.
- Copy changes are limited to the approved hero subheading. All other text stays as it is.
- Keep: the skip link, focus rings (3px sky), WCAG AA contrast (4.5:1 text, 3:1 large text and controls), reduced-motion rules, image dimensions, deferred scripts, the theme boot script and the no-JS notice.

## Testing and acceptance

- Re-run the existing browser regression suite: scope, request flow with mocked delivery, screening, analytics privacy, keyboard focus. All must pass unchanged.
- Responsive matrix at 320/360/390/430/768/1440px in light and dark: no sideways scrolling, no page errors.
- Contrast check of every new colour pair (pills, buttons, card text, footer) at 4.5:1 or better for normal text.
- Lab performance (same method as before): LCP stays at or below today's ~1.9s and CLS stays 0.
- Screenshots of the home, a service page, pricing, an area page, booking (all steps) and help, at phone and desktop size, sent to the owner for sign-off before merging.
