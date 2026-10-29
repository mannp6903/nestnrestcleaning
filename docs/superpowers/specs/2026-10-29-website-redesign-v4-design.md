# Website redesign v4: calm and clear

Date: 29 October 2026. Owner: Mann Patel. Branch: `ccr-34b46dcc-ovzksf`.

The brief asked for an evidence-based audit and score of the live site, a typography audit, a look at current competitor sites, a chosen direction, and an implemented upgrade in a reviewable branch. Routine design choices were pre-approved. Merging and publishing wait for the owner.

The full audit, scorecard, reference research and before/after captures are in the audit page shared with the owner. This file records what was decided and why, so later changes stay consistent.

## 1. Evidence

- **Live site:** blocked from this environment directly. Loaded through a remote renderer (Firecrawl) on 29 Oct 2026. Its stylesheet version matches `main` at `a0ec72e`, so the live site and `main` are the same build.
- **Rendered locally:** `main` served like GitHub Pages, in Chromium at 360, 390, 768, 1024 and 1440 px: 15 pages, full page and first screen.
- **Interactions:** price box, phone menu, postal check in and outside the area, all three booking steps, empty-field errors on each, Edit from the review, the phone summary, a failed and a successful send. Every request was intercepted locally.
- **Baseline measurements:** the repository suite passed 100 of 100. Lab LCP 1.94 to 2.05 s on a throttled phone, CLS 0.
- **Reference sites:** Hellamaid, Maid Sailors (pricing), Molly Maid Canada, AspenClean (prices page) and MaidThis, rendered remotely on 29 Oct 2026. Earlier rounds couldn't see any of them.

## 2. Baseline score

Expert assessment on the owner's 100-point rubric: **phone 67, computer 74, overall 70** (60% phone, 40% computer, a chosen priority, not traffic data).

The ten issues that drove the work, all observed or measured:

1. Service pages listed what's included and paid extras, but none of what a clean leaves out (Regular Cleaning: 0 of 10).
2. Step 2's error was a floating toast over the arrival windows, with focus left on Continue. It could still cover the Email field on step 3.
3. The home `h1` was the slogan; "what and where" was a 14 px line above it.
4. Six labels opened the booking form. "Choose your time" and "See my price" led to a postal-code step.
5. Headings at weight 800 and −0.03em. The full stop's 0.103em left side-bearing left a visible gap on 169 of 235 h1 and h2 headings.
6. The DM Sans file has no tabular figures, yet the booking total and summary used it, so totals changed width as they updated.
7. On a phone, the offer bar wrapped to two lines and the price box repeated the offer in a tinted pill.
8. Pricing was 14,070 px tall at 390 px, with four tables stacked.
9. Service heroes left about 330 px empty at 1440 px. The two navy panels sat at different widths.
10. On a phone, the sticky Continue bar and summary took about 175 px; the done screen kept "Earliest day to request".

## 3. References adopted

| Pattern | Seen at | Adapted as |
|---|---|---|
| Exclusions listed next to the checklist ("What we can't clean") | maidsailors.com/pricing/ | "Not included" rows on every service page, generated from the checklist |
| Each action captioned with what happens next | hellamaid.ca header | A note under the hero's main action: "About two minutes. Mann confirms your day and time." |
| Calm through restraint: regular-weight headings, generous spacing | mollymaid.ca | Headings at 700 on a smaller scale, in the existing sans |
| The basis of a price explained before the tool | aspenclean.com prices page | Kept: "How your price is worked out" (v3) |

Not adopted: Hellamaid's and MaidThis's contact details before the price, a chat bubble over content, and any claim the business can't support.

## 4. Direction

**A. Calm and clear (chosen):** fix what the audit found where people decide, keep three rounds of tested behaviour, add no weight. **B. Home journal** (Fraunces serif, sand surfaces, large imagery) was set aside: it needs real photography, clashes with the condensed wordmark, adds about 40 KB of fonts, and moves attention from price and booking.

## 5. Typography

Fonts unchanged: Plus Jakarta Sans (headings, buttons, money) and DM Sans (text), self-hosted. The problems were in how they were applied.

| Element | Font | Weight | Phone | Desktop | Line height | Tracking |
|---|---|---|---|---|---|---|
| Display (home slogan) | Plus Jakarta Sans | 700 | 44 | 68 | 1.04 | −0.022em |
| H1 | Plus Jakarta Sans | 700 | 36 | 56 | 1.06 | −0.02em |
| H2 | Plus Jakarta Sans | 700 | 28 | 40 | 1.12 | −0.018em |
| H3 | Plus Jakarta Sans | 700 | 20 | 22 | 1.25 | −0.01em |
| Lede | DM Sans | 400 | 18 | 20 | 1.5 | 0 |
| Body | DM Sans | 400 | 17 | 17 | 1.62 | 0 |
| Nav (desktop) | Plus Jakarta Sans | 600 | — | 16 | 1.2 | 0 |
| Buttons | Plus Jakarta Sans | 700 | 16 | 16 | 1.2 | 0 |
| Labels | DM Sans | 600 | 15 | 15 | 1.4 | 0 |
| Inputs | DM Sans | 400 | 16 | 16 | 1.4 | 0 |
| Money | Plus Jakarta Sans, tabular | 700–800 | by role | by role | 1–1.3 | 0 |
| Fine print | DM Sans | 400 | 13 | 13 | 1.45 | 0 |
| Tags | DM Sans or Plus Jakarta Sans | 700 | 12 | 12 | 1.3 | 0 |

Tokens are at the top of `css/site.css` (`--fs-display`, `--fs-h1`, `--fs-h2`, `--fs-h3`, `--fs-lede`, `--fs-small`, `--fs-fine`, `--fs-tag`, `--fw-head`, `--ls-*`, `--money`). 12 px is the floor for any text.

The build wraps a heading's closing full stop in `<span class="stop">` (`tidyStops` in `tools/build.mjs`), and `.stop` pulls it 0.05em closer. The words don't change. `setHeading` in `js/site.js` does the same for headings set by the script.

## 6. Changes

- **Service pages:** every task in the service's rooms, in three groups: included (check), paid extra (plus, "Extra"), not included (dash, "Not included"). A count line ("16 tasks included · 6 paid extras · 10 not included"). A pointer to the smallest step up that covers the exclusions ("Deep Cleaning includes 8 of the 10"). On computers, the service's photo fills the hero under the facts.
- **Home hero:** one `h1` holding "House cleaning in Scarborough & North York" and the slogan. A note under the main action.
- **Actions:** "Book a clean" wherever a link opens the booking form ("Book" where space is short); "Book this clean" on the price box, which carries the home details over. The booking page's `h1` is "Book a clean".
- **Price box:** the offer is one line under the price ("20% off your first visit · For our first 50 households"), not a separate box.
- **Offer bar:** a short wording under 480 px, so it stays on one line.
- **Booking:** step 2's day and window errors, and the large-home message on step 1, sit beside their choice, describe every option in it, and move focus to the first option. The toast is no longer used for validation. The done and calendar screens drop "Earliest day to request". The phone summary bar is shorter.
- **Money:** all prices in Plus Jakarta Sans with tabular, lining figures. A price that changes glows once (none under reduced motion).
- **Pricing on phones and tablets:** a tab per service above the tables shows one at a time. Arrow keys, Home and End move between tabs; a link to `#prices-deep` opens that table. Computers, and anyone without JavaScript, see all four.
- **Layout:** both navy panels sit on the content grid, so their text lines up with the page. Section spacing and phone heading sizes are tighter. Facts rows size to their content ("Open daily · 9am–11pm" stays on one line).

Unchanged: prices, discount rules, the checklist, booking fields and payload, form endpoints, the postal check, URLs, titles, descriptions, canonicals, structured data, analytics events and dark mode.

## 7. Verification

- `tools/qa/v4.test.mjs`: scope lists match the checklist for every service; step-2 errors are inline with focus; money is tabular; the done screen drops the stale line; the price switcher (phone, keyboard, hash, computer); panels aligned; heading stops; one action vocabulary; nothing under 12 px on phones.
- Existing tests updated where a rule intentionally changed: type scale, the hero's action label and `h1`, the price-box offer.
- `tools/qa/perf.mjs` before and after, same settings.

## 8. Owner decisions

- **Real photos** from your own jobs (with permission) to replace the illustrated rooms. This is the biggest remaining gap in the imagery score.
- **Insurance or bonding**, **reviews** and **a mailing address**: shown only once they're real.
- **Labels:** if you prefer the price-first header label ("See my price"), it can come back, pointed at the price box rather than the booking form.
