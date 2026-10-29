# Website redesign v3: calm home-care, easy booking

Date: 29 October 2026. Owner: Mann Patel. Source: "Nest & Rest Cleaning — Website Redesign and Implementation Master Prompt" (29 October 2026).

The brief asks for a substantial, visible upgrade. It should be built in the real codebase, keep the business facts and booking logic intact, and be delivered as a reviewable branch and preview. The owner pre-approved routine design choices ("choose the one that best fits the business, and implement it without waiting for approval"). Merging and publishing still wait for the owner's explicit instruction.

## 1. Research (accessed 29 October 2026)

**Limitation.** This environment's network policy blocks hellamaid.ca, aspenclean.com, maidthis.com, maidsailors.com and nestnrestcleaning.com. Neither a direct request nor the web-fetch tool could load them, so **no current rendered review of the reference sites was possible.**

Evidence used instead, labelled by strength:

- **Hellamaid:** first-hand observations from the owner's own recheck report of 28 October 2026 (`Nest_Rest_Hellamaid_Functions_UX_Refresh_2026-10-28.md`, records E05, E11, E13 and section 8). These are recorded observations of the homepage and the direct booking flow, not re-verified today.
- **AspenClean, MaidThis, Maid Sailors:** secondhand web-search summaries only, unverified. No visual or layout observations.
- **Nest & Rest:** the live site's own code, which is identical to the merged `main` at `35051ad`, rendered locally at 360, 390, 768, 1024 and 1440 px.

| Criterion | Hellamaid (owner's report, 28 Oct) | AspenClean Toronto (search only) | MaidThis (search only) | Maid Sailors (search only) | Nest & Rest today |
|---|---|---|---|---|---|
| Visual hierarchy | Strong yellow/black actions; busy homepage with hero form, estimator and repeated CTAs | Not observed | Not observed | Not observed | Clear hero and price box; too many boxed sections; the 20% offer repeated four times |
| Typography | Poppins headings, system body | Not observed | Not observed | Not observed | Plus Jakarta Sans + DM Sans, readable |
| Colour | Yellow/black | Not observed | Not observed | Not observed | Navy, teal, sand, ivory: recognisable |
| Photography | Work images and review modules | Search: service pages focus on green products and staff claims; images not observed | Not observed | Not observed | Owner portrait (real); five illustrated rooms, disclosed as illustrations |
| Navigation | National navigation, many destinations | Search: one-off, regular, move-in/out paths | Search: separate residential and vacation-rental paths | Not observed | Five short labels plus "See my price": good |
| Service clarity | Package checklists inside booking (33 deep / 45 move-out tasks) | Search: lists one-off, regular, move-in/out | Search: home vs host paths | Search: basic, deep, laundry (third-party) | Good on service pages; homepage cards don't say who each service is for |
| Pricing clarity | Direct booking shows price without contact; homepage estimator hides price behind a contact form | Search: "contact for a quote", no prices | Search: flat-rate per clean (claims) | Not found | Price shown with no contact; how a price is built is spread across paragraphs |
| Booking effort | Many small steps; calendar with real availability | Search: online or phone | Search: online booking (claim) | Not observed | Three steps, request-based, editable summary |
| Mobile usability | Not tested in the report | Not observed | Not observed | Not observed | Works at 320–430 px; homepage about 11,400 px long on a phone |
| Accessibility | Not tested | Not observed | Not observed | Not observed | Automated checks pass; mobile menu doesn't manage focus |

**Patterns adapted.** All are original executions; no wording, images, code or page layouts are copied.

1. **Price first, no contact needed, with first visit and later visits shown apart** (Hellamaid direct booking, E03/E11). The hero price box keeps leading. The pricing page gains a plain explanation of how a price is built.
2. **Say who each service is for, next to what's included** (Hellamaid package checklists, E13). Service cards show "Best for" from `idealFor` and link to the room-by-room list.
3. **A photograph with each service** (AspenClean, unverified: its service pages lead with the service and its products). Photo-led service cards use the existing room illustrations. They show no people and stay disclosed as illustrations.
4. **Separate paths for different customers** (MaidThis residential vs host paths, unverified). Below the four home services, a slim row reads: not a regular home? Residence Care, offices, realtors. Only existing services; no Airbnb service is added.
5. **Explain the price in steps, with a worked example** (Maid Sailors-style add-on pricing, unverified; a common convention). The pricing page shows: base, then extras, then one discount, then estimate, then Mann confirms.

**Not adopted:** a contact form in front of the price, repeated CTAs, national clutter, and any claim this business can't support (insured, bonded, reviews, counts, years).

## 2. Baseline audit (observed in local renders of `35051ad`)

Working well, and kept:
- the ungated hero price box;
- honest request wording, also on the calendar file ("requested, not confirmed yet", TENTATIVE);
- the founder story;
- the five-step standard;
- the postal-code check;
- the three-step booking form, with its scope rules and its tests;
- dark mode.

Problems observed:
1. **Repeated promotion.** The 20% founding offer appears in the top bar, the price box, every service price, and a separate navy "Founding households" panel.
2. **Card overload.** On the homepage:
   - 6 service cards, each with a full-width navy button;
   - 3 step cards;
   - a navy panel with another navy card inside it;
   - 4 plan cards;
   - 11 separately boxed FAQ items;
   - a navy final panel.
3. **Decoration.** A gradient glow behind every hero, and a room photo peeking out from behind the price box.
4. **Templated eyebrows.** A teal pill label tops every section; headings are centred in two sections and left-aligned elsewhere.
5. **Services.** Homepage cards don't say who each service is for. Quote services sit in the same grid as bookable ones.
6. **Pricing.** How base price, extras, the first-visit discount, plan discounts and the final agreed price relate is only told in paragraphs.
7. **Mobile menu.** Escape closes it but leaves focus nowhere. The page behind stays reachable by Tab while the menu covers it.
8. **Length.** The homepage is about 11,400 px tall at 390 px.

These are observations. Conversion effects are hypotheses until real visitor data exists.

## 3. Direction

**A. Calm home-care, editorial (chosen).** Generous white space on white and ivory, navy type, teal reserved for actions and small accents.
- Sections are told by spacing and hairline rules rather than boxes.
- Photography is attached to each service.
- Headings are left-aligned throughout.
- One navy band per page at most, apart from the closing call to action.
- Booking convenience comes from the persistent price box and one clear action.

It fits an owner-led home-care brand and answers the audit directly.

**B. Booking-app utility.** Chip-heavy, sticky estimator bar on every page, dense controls, bright teal. Fast, but it would read as an app rather than a careful person in your home, and it adds more boxes, not fewer.

Direction A is chosen; B's useful part, quick access to booking on phones, already exists in the phone action bar.

## 4. Design system changes (`css/site.css`)

Fonts unchanged: Plus Jakarta Sans for headings, DM Sans for text, both self-hosted. Colours unchanged; contrast stays checked by the existing tests.

| Token or rule | Today | v3 |
|---|---|---|
| `--card-radius` | 20px | 14px |
| `--band-radius` | 28px | 20px |
| `--field-radius` | 14px | 12px |
| Card surface | Border, soft shadow, hover lift | Hairline border, no shadow, no lift. Hover deepens the border to `--field` (fine pointers, no reduced motion) |
| Eyebrow `.label` / `.kicker` | Teal pill with dot | Plain text: DM Sans 0.86rem, 700, `--teal-ink`; `#8FE0DD` on navy; no background or dot |
| Section heads | Mixed centred and left | Left-aligned everywhere. From 60em: heading on the left, intro or link on the right |
| Hero background | Gradient glow | Plain page colour |
| Secondary action | Bordered ghost button | Text link with arrow (`.text-link`). Ghost buttons stay only on navy bands |
| FAQ | One box per question | One list with hairline dividers |
| Steps ("Request in two minutes") | Three cards | Three columns under a hairline rule, numbered (it is a real sequence) |
| Plans | Four cards | One bordered strip of four cells divided by rules ("Most popular" flag kept) |

Unchanged:
- pill-shaped primary buttons (52px, 44px small);
- 16px or larger form text;
- focus rings;
- reduced-motion rules;
- dark-mode tokens, extended to anything new.

## 5. Page changes

**Homepage (`tools/build.mjs` home page):**
- **Hero:**
  - no gradient and no peeking photo;
  - eyebrow "House cleaning in North York & Scarborough";
  - H1 "We clean. You rest." and the lede, both unchanged;
  - one primary action "Book your clean", plus the text link "How it works";
  - owner line kept;
  - the price box stays: right on desktop, after the copy on phones (first screen, as today).
- **Trust strip:** kept.
- **Services:** four photo cards: Regular, Deep, Move-in/out, Kitchen & Bath. Each card has:
  - a photo (living room, kitchen, entryway, bathroom);
  - the service name;
  - "Best for: <first idealFor>";
  - "From $X · $Y first visit" (existing data);
  - a small "Book" button to `book/?s=<key>`;
  - a "What's included" link to the service page.

  Layout: one column on phones, two from 37.5em, four from 64em. Below the cards, the row "Not a regular home?" links Residence Care, Small Office Cleaning and For realtors, each with its one-line purpose.
- **How it works:** the three steps in the new row style; text unchanged.
- **The Nest & Rest standard:** navy band. The five steps on the left; the guarantee on the right as plain text under a rule, with no card inside the card and no photo.
- **Regular plans:** the new plan strip.
- **Founder:** kept. The separate "Founding households" panel is removed; the offer stays in the top bar, the price box and service prices.
- **Areas, guides:** restyled through the shared tokens.
- **FAQ:** the new list.
- **Closing call to action:** kept, with the v3 radius.

**Pricing page:** new section "How your price is worked out", right after the hero, in four steps:
1. **Base price:** from the service and home size.
2. **Extras:** each with its own price.
3. **One discount:** the founding first-visit discount or your plan's discount, whichever is larger, never both. Later visits get the plan discount.
4. **Estimate:** Mann confirms the final price before the clean (half baths, basements, larger homes).

Two labelled examples follow, computed at build time from `js/config.js` with the same functions the price tables use:

- **Example A:** Regular Cleaning, 2-bed, 1-bath condo, every 2 weeks: regular price, first visit, later visits.
- **Example B:** Deep Cleaning, 3-bed, 2-bath house with inside oven: base, the extra, total, first visit.

No new rates; no change to discount stacking.

**Service, area, help, gift, realtors, guides and booking pages:** they inherit the tokens, eyebrows, left-aligned heads, FAQ list and plain heroes. The "Other services" cards follow the flat card. Booking logic, fields, payloads and wording are unchanged.

## 6. Accessibility, mobile, performance, SEO

- **Mobile menu.** While open, everything outside the header and menu is `inert`. Escape or a link closes it. Escape returns focus to the menu button.
- **Widths.** Layouts verified at 320, 360, 390, 430, 768, 1024 and 1440 px (1024 joins the layout checks). The 200% browser-zoom equivalent at 1280 is 640 CSS px, inside the checked range. Text at 200% is already checked.
- **Automated checks.** The existing keyboard, announcement and axe checks must keep passing. Their limits are stated in the hand-over.
- **Images.** Service-card photos use the existing 600/928 JPEG and WebP files, lazy-loaded, with width, height and `sizes`. No new third-party scripts. The hero loses an image, so the first screen gets lighter.
- **SEO.** URLs, titles, descriptions, canonicals, structured data and the sitemap are unchanged. No ratings or claims are added.
- **Performance.** `tools/qa/perf.mjs` before and after, same lab settings. Limits stay: LCP 2.2s or less, CLS 0.05 or less.

## 7. Verification and hand-over

- Design tests are updated to the v3 rules: radii, eyebrows, left-aligned heads, no hover lift, plain heroes, photo service cards, one primary hero action, no founding panel, the FAQ list and the plan strip.
- New tests:
  - pricing examples match the booking calculator for the same inputs;
  - mobile-menu focus;
  - the 1024 px layout.
- Full suite, perf, and before/after screenshots at matching sizes (390 and 1440 for the main templates; 768 and 1024 for home).
- Clickable preview at the existing preview link. Branch pushed. **No merge or publish without the owner's instruction.**

## 8. Owner decisions and missing assets

- **Real photos** of finished work (with clients' permission) to replace the illustrated rooms, at the same file names and 928 × 1152 px.
- **Insurance or bonding status:** not shown until confirmed.
- **Reviews:** none shown until genuine ones exist; the review page collects them.
- **Network access:** allow the four reference domains if a rendered competitor review is wanted.
- **Google Sheet set-up:** see `docs/google-sheet-setup.md`, from the previous round.
