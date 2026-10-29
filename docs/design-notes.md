# Design notes (v3, October 2026)

This is how the site looks and why, so later changes stay consistent. The full reasoning is in [the v3 spec](superpowers/specs/2026-10-29-website-redesign-v3-design.md).

**Direction:** calm home care, easy booking. The page is white with ivory sections, has navy for weight and teal for action, and uses few boxes. The price box is the main tool. Everything else reads like a well-set page, not a stack of cards.

## Tokens

All tokens sit at the top of `css/site.css`. Dark mode redefines the colour roles under `:root[data-theme="dark"]`.

| Token | Value | Used for |
|---|---|---|
| `--card-radius` | 14px | cards, the price box, the plan strip, worked examples |
| `--band-radius` | 20px | the navy panels: the standard and the closing call to action |
| `--field-radius` | 12px | inputs, selects, steppers, choice cards, booking slots |
| `--r-lg` | 20px | photo frames, the booking panel and summary |
| `--line` | navy at 12% | dividers: FAQ rows, steps, plan cells, example rows |
| `--card-line` | navy at 8% | card borders |
| `--field` | `#7A8899` | control borders (3:1 or better), and the card border on hover |

Fonts: Plus Jakarta Sans for headings, DM Sans for text, both self-hosted. Colours: navy `#0A2D5C`, teal `#2FA4A6`, sky `#6FC3E0`, sand `#EFD9AE`, ivory `#F7F3EA`. Every text colour pairing is checked by `contrast holds in both themes`.

## Components

- **Eyebrow** (`.label`, `.kicker`): plain teal text in DM Sans, 0.86rem bold, above a heading. It has no pill and no dot. On navy it is light teal `#8FE0DD`.
- **Section head** (`.section-head`): always left-aligned. Add `.section-head-row` to put a link on the right from 760px.
- **Buttons:**
  - The main action is a navy pill, 52px tall (44px for `.btn-sm`).
  - A second action is a text link with an arrow (`.text-link`).
  - Outlined buttons (`.btn-ghost`) appear only on navy bands, in the phone menu and inside the booking form.
- **Cards:** a hairline border, no shadow, and they don't move. Under a mouse the border darkens, unless the visitor asked for less motion. Only the price box and the quote forms keep a soft shadow, because they are the working tools on the page.
- **Home service cards** (`homeServices()` in `tools/build.mjs`): a photo, the name, "Best for" from `idealFor`, the price with the first-visit price, **Book**, and **What's included**.
  - Columns: one on phones, two from 600px, four from 1024px.
  - On phones the photo is an 88px square beside the name.
  - Below the cards, "Not a regular home?" links Residence Care, Small Office Cleaning and For realtors.
- **Steps** (`.steps-3`): numbered columns under one hairline, not cards.
- **Plan strip** (`plansGrid()`): one bordered strip of four cells divided by hairlines. "Most popular" is tinted and flagged.
- **FAQ** (`.faq-list`): one list with a hairline between questions.
- **The standard band:** the five steps on the left. The guarantee sits on the right as plain text beside a rule, with no card inside the card.
- **How your price is worked out** (pricing page, `priceExplainer()`): four steps (base price, extras, one discount, estimate then Mann confirms), next to two worked examples.
  - The build computes the examples from `js/config.js` with the same functions the booking form uses.
  - `site.js` recomputes them in the browser, as it does the price tables.
  - A test checks the examples against a real booking.
- **Phone menu:** while it is open, the page behind it is inert, so keyboard focus stays in the header and menu. Escape closes it and returns focus to the menu button.

## Reference patterns

The competitor sites were blocked from this build environment, so none were viewed on 29 October 2026. Each pattern is labelled with the evidence it rests on. All are original executions; no wording, images, code or page layouts were copied.

| Pattern on this site | Seen at | Evidence |
|---|---|---|
| Price first, with no contact details needed; first visit and later visits shown apart | Hellamaid direct booking (https://hellamaid.ca) | Owner's recheck report, 28 Oct 2026 (E03/E11) |
| Each service says who it's for, next to what's included | Hellamaid package checklists | Owner's recheck report (E13) |
| A photograph with each service | AspenClean Toronto (https://aspenclean.com) | Web search summary, unverified |
| Separate paths for different customers ("Not a regular home?") | MaidThis (https://maidthis.com) | Web search summary, unverified |
| The price explained in steps, with worked examples | Maid Sailors (https://maidsailors.com), and a common convention | Web search summary, unverified |

Not adopted: a contact form in front of the price, repeated calls to action, Airbnb or other new services, and any claim the business can't back up (insurance, bonding, review counts, awards, years in business).

## Images

| Image | Source | Where |
|---|---|---|
| Owner portrait (`assets/founder-mann-patel*`) | Supplied by the owner | Hero owner line, founder section, vision page |
| Room photos (`assets/photos/*`: living room, kitchen, entryway, bathroom, bedroom) | AI-generated illustrations. The footer says "Room photos are illustrations, not photos of client homes." | Home service cards, service, guide and gift pages |
| Logo (`assets/logo*.svg`) | Traced from the original logo artwork | Header, footer, navy-band watermark |

No stock or generated people are shown as staff or customers, and there are no before-and-after images.

## Wanted: replacements and decisions

1. **Real photos from your own jobs**, with each client's permission, to replace the illustrations.
   - Use the same file names in `assets/photos`, at 928 × 1152 px (JPEG and WebP, 600 and 928 wide).
   - Then remove the footer's illustration note.
2. **Insurance.** Its status is unverified, so the site doesn't mention it. Once you have a policy, send the insurer and coverage and it can be added where people decide (the standard band and the help page).
3. **Reviews.** The reviews section stays hidden until `reviews` in `js/config.js` holds real reviews. Never add invented ones.
4. **Competitor check.** To compare against today's reference pages, allow these domains in the environment's network settings and ask for a recheck: hellamaid.ca, aspenclean.com, maidthis.com and maidsailors.com.

## Checks

Run `node tools/build.mjs`, then:

- `node tools/qa/run.mjs` runs the browser tests: layout at 320 to 1440px, 200% text, keyboard, axe, contrast, booking maths and the v3 design rules.
- `node tools/qa/perf.mjs` runs the lab LCP and CLS budget.
- [docs/phone-checklist.md](phone-checklist.md) is a 10-minute check on a real phone.
