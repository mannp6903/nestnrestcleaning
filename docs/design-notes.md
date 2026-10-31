# Design notes (v5, October 2026)

This is how the site looks and why, so later changes stay consistent. The reasoning is in [the v5 spec](superpowers/specs/2026-10-30-website-v5-design.md), which builds on [v4](superpowers/specs/2026-10-29-website-redesign-v4-design.md) and [v3](superpowers/specs/2026-10-29-website-redesign-v3-design.md).

**Direction:** calm and clear. Calm home care, easy booking. The page is white with ivory sections, has navy for weight and teal for action, and uses few boxes. The price box is the main tool. Everything else reads like a well-set page, not a stack of cards.

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
| `--fs-display` / `--fs-h1` / `--fs-h2` / `--fs-h3` | 44–68 / 36–56 / 28–40 / 20–22px | the home slogan, page titles, sections, cards and steps (phone to desktop) |
| `--fw-head` | 700 | every heading. 800 is kept for big prices only |
| `--fs-support` | 14px | supporting text people need: what an extra covers, hints, "per visit", table headings. Never smaller |
| `--fs-badge` | 13.5px | "Recommended", service tags and the "Extra" tag in the comparison |
| `--fs-money` | 17px | every price in a list or table (price tables, extras, service choices) |
| `--fs-fine` / `--fs-tag` | 13px / 12px | fine print / tags. Nothing on the site is smaller than 12px |
| `--money` | Plus Jakarta Sans | every price, with tabular, lining figures (DM Sans's file has no tabular figures) |

Fonts: Plus Jakarta Sans for headings, buttons and money, DM Sans for text, both self-hosted. A heading's closing full stop is wrapped in `.stop` by the build so it doesn't drift at large sizes. Colours: navy `#0A2D5C`, teal `#2FA4A6`, sky `#6FC3E0`, sand `#EFD9AE`, ivory `#F7F3EA`. Every text colour pairing is checked by `contrast holds in both themes`.

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
- **Plan strip** (`plansGrid()`): one bordered strip of cells divided by hairlines. The plan marked `recommended` in `js/config.js` is tinted and flagged "Recommended". Don't call it "Most popular" unless booking records show it is.
  - "Prices shown for: Regular Cleaning · 2-bedroom, 1-bathroom condo" sits above the strip, so its prices aren't mistaken for the price box's.
  - Each plan ends with its own button, "Choose every 2 weeks" and so on, which opens booking with that plan selected (`book/?s=regular&f=biweekly`).
  - Phones: one plan per row (name left, price right, button under). Two across from 600px, four from 1024px.
- **FAQ** (`.faq-list`): one list with a hairline between questions.
- **The standard band:** the five steps on the left. The guarantee sits on the right as plain text beside a rule, with no card inside the card.
- **Price labels:** every price says what it's for, right above it: the price box's live line (`priceFor()` in both `tools/build.mjs` and `js/site.js`), the plan strip and the worked examples.
- **How your price is worked out** (pricing page, `priceExplainer()`): four steps (base price, extras, one discount, estimate then Mann confirms), next to two worked examples.
  - The build computes the examples from `js/config.js` with the same functions the booking form uses.
  - `site.js` recomputes them in the browser, as it does the price tables.
  - A test checks the examples against a real booking.
- **Phone menu:** while it is open, the page behind it is inert, so keyboard focus stays in the header and menu. Escape closes it and returns focus to the menu button.
- **Action words** (`ACT` in `tools/build.mjs`), one per stage. A booking is a request Mann confirms, so the words say request:
  - "Request a clean" on every way into the booking form ("Request" where space is short, "Request again" on Help). The booking page's title is "Request a clean".
  - "Choose a preferred day" on the price box, where a price is already calculated, and on step 1's Continue. Step 2's is "Add your details".
  - "Send cleaning request" on the final button.
  - "Choose every 2 weeks" (and so on) on the plans.
  - With the Cal.com calendar on, they change to "Book a clean", "Book this clean" and "Choose your time".
- **Service scope** (`checklistFor()`, `scopeSummary()`, `scopeMore()`): each room leads with what every visit covers (check). Under it, a quieter box lists "Add as an extra" (plus) and "Not part of this clean" (dash). Extras are listed one row per extra with its own price (`roomExtras()`), so a checklist row with two extras ("Inside fridge and oven") shows "Inside oven +$40" and "Inside fridge +$40", never one price for both. Extras tied to no checklist row (heavy pet hair) sit under Whole home. The lead line is "16 tasks in every visit"; extras and exclusions are the line under it. A note below the rooms names the smallest step up that covers the exclusions.
- **Price box:** the price, then the regular price and time, then the offer as one teal line. No separate offer box.
- **Booking, step 1:** arriving from a price box, the service and home sit in one card ("Your clean, from the price box") with Edit, which opens the full choices. Arriving from a plan, a note says which plan is selected and where to change it.
- **Folded sections** (`section()` in the booking page, `.section-box`): optional parts fold away under a summary that says what's chosen in them ("Inside oven · +$40", "I'll be home · Dog · Our products"), so nothing selected is out of sight. Step 1 has "Anything unusual about your home?" and Extras; step 3 has Visit preferences (getting in, building, pets, products, notes) and Referred by a client. An error or an Edit from the review opens its section first.
- **Check your clean** (`renderReview()` in `js/site.js`): what decides the clean and its price comes first, at full size (Service, Your home when ticked, Extras, Plan, Preferred time, and the Estimate in bold with the time on site). Under "Your details and visit", a compact summary at 14px: Contact (with how to confirm), Address, Visit (getting in, pets, products), and Notes or Referred by when given. Every row keeps its Edit.
- **Preferred day:** Earlier and Later page through the 21 days a screen at a time, and the line between them says which dates are in view. More days ahead: raise `daysAhead` in `js/config.js`.
- **Booking errors:** each sits under the choice it's about (`[data-step-error]`), describes every option in it, and takes focus to the first option. The toast is only for confirmations ("Link copied"), never for errors.
- **Pricing page:** links under the title jump to Estimate, Prices, Plans, Extras and Compare. One tab per service shows one price table at a time, at every width (`bindPriceTabs()` in `js/site.js`); visitors without JavaScript see all four. The room-by-room comparison is folded, and opens from the Compare link.
- **Navy panels:** both sit on the content grid (1220px), so their text lines up with the page.
- **Phone menu:** "Request a clean" first, then Services, Plan your clean and About us. It opens where the header ends.
  - Tapping a link to another page keeps the menu up with a small spinner on that link until the next page replaces it. Closing it at once showed the old page for a second or two, which looked as if the tap hadn't worked.
  - Opening the menu fetches its pages quietly in the background, once per page, so they open sooner. This is skipped when the visitor has data saver on or a very slow connection.
  - A link to a section on the same page ("How booking works" on the home page) closes the menu and lands there at once, without a long smooth scroll.
- **Booking buttons on phones:** Back is the arrow alone (its name stays for screen readers), so "Send cleaning request" fits beside it and the sticky bar stays one row.
- **Desktop nav:** the section you're in is underlined in teal; only a link to the page itself gets `aria-current="page"`.
- **Which clean do I need?** (`chooser()`, pricing page): one situation per service from `CHOOSER`. Keep each line true to the service page.
- **Owner line** (`pricer(L, key, heading, { owner: true })`): inner price boxes say who confirms the price, with Mann's photo. The home page uses the hero line instead.
- **Labels above headings:** only where they add something the heading doesn't say. Not above FAQ headings, which already say "questions".
- **Compact files:** the pages load `css/site.min.css` and `js/site.min.js`. Edit `css/site.css` and `js/site.js`, then run the build.

## v6 and v7: local, visual, quick to act on (30–31 October 2026)

v6 made the site warmer (Mann in the first person, the postal check in the hero, the logo's nest under the price box). v7 gives it a local identity and takes out everything unconfirmed. Nothing on the site is a placeholder: what Mann hasn't decided stays off the page, and the owner keeps the list of open decisions privately.

- **Landmark artwork** (`tools/landmarks.mjs`): original inline SVG, drawn for this site, in the brand's navy, teal, sand and sky (every colour is a `--lm-*` token in `css/site.css`, with a dark set that lights the windows). An illustrated montage, not one real viewpoint, laid out west to east: North York Centre's towers, the civic centre's glass front and the reflecting pool and fountains at Mel Lastman Square; a street of homes; the Scarborough Bluffs' pale, gullied cliffs under a line of trees, the beach, Lake Ontario and the marina at Bluffer's Park. A small, faint CN Tower gives Toronto context only. Cues checked on 31 October 2026 against the City of Toronto's Mel Lastman Square page and Destination Toronto's Scarborough page. Nothing implies an affiliation with those places.
  - `heroNarrow()`: the two districts side by side. Phones see it under the introduction; computers at the foot of the headline column, inside the first screen, beside the price box. Tablets cap it at 560px.
  - `heroWide()`: the full panorama, above the closing call to action on computers.
  - `districtScene(slug)`: the Scarborough and North York art on the home page's district cards (decorative inside their links) and in the district pages' heroes (with its own name).
- **Hero** (`.hero-home`): "House cleaning in Scarborough & North York", the slogan, Mann in the first person, the landmark scene, the postal check as one pill (`#pc-home`), Request a clean, and the price box in the logo's nest (`assets/logo-nest.svg`). The "New · Airbnb turnovers" link shows on phones; computers have "Airbnb hosts" in the menu.
- **Postal check** (`bindPostalChecks()`): the first three characters against the 41 postal areas in `serviceArea` (17 Scarborough, 24 North York, confirmed by Mann on 30 October 2026). In the area: "Yes, I clean in M1B (Scarborough)." and **Request a clean** (or, on the host page, **Tell me about your listing**). Outside: a calm note and **Join the waitlist by email**. Not a postal area: "Enter a postal code like M1B 2K3." The district list on the home page says the exact address is confirmed when Mann replies.
- **Services** (`#services`): the four photo cards, the plans (`homePlans()`, `#plans`: "Set it once. Stay ahead."), then "Not a regular home?" with Airbnb turnovers (New), Residence Care, Small Office Cleaning and For realtors.
- **Room by room** (`roomExplorer()`, `#rooms`): Regular, Deep and Move-In / Move-Out as a switch; Kitchen, Bathrooms, Bedrooms & living and Whole home as tabs (`bindExplorer()`: arrow keys, Home and End). Each room shows its photo, what's included, the extras with their prices and what isn't part of the clean, all from `checklist` and `addons` in `js/config.js`, the same data as the service pages, pricing and booking. The booking button follows the chosen clean (`book/?s=deep`). Without JavaScript every room shows the regular clean. The rooms follow the checklist's own groups; bedrooms and living areas are one group there, so they're one tab.
- **How it works** (`#how`, v8): one section instead of three. The three booking steps; then Mann (photo, "I clean every home myself.", his line and the vision link) with the re-clean guarantee under him as his promise; beside them, the five things that happen at every visit on a navy panel (`#standard`). Mann's photos at work join it once they're in `assets/photos` as `mann-at-door`, `mann-kit` and `mann-linens`. Then **Airbnb turnovers** (`hostsSection()`): the timeline from an example 11am checkout to a 4pm check-in, and a quote button. Prices, a host package and a first-turnover offer appear only once they're set in `quoteServices.airbnb`.
- **Service area** (`areasSection()`, `#areas`): two district cards with their art, then every neighbourhood, linked where it has a page, with a search that filters as you type (`bindHoodFinder()`: ignores case, accents and punctuation; nothing typed is stored or sent). No match points to the postal check. Without JavaScript the full list shows and the search box stays hidden.
- **Airbnb host page** (`services/airbnb-cleaning/`, `pageType: "host"`): the host form in the hero, the timeline, what every turnover covers (the regular-clean checklist, room by room), pricing ("Quoted per unit" until prices are set), why hosts book Mann, three steps with a postal check that fills the form's postal code, host questions, and a closing panel back to the form. Linens, restocking and photo reports appear only once decided.
- **Insurance badge:** an HTML comment at the end of the trust strip (`trustStrip()`), for November 2026, with wording from the policy. Until then the site never says insured, bonded or fully covered.
- **Motion:** the timeline steps and district cards rise 22px as they scroll into view, only where the browser supports scroll-driven animation and the visitor hasn't asked for less motion. Transform only, so text never fades below its contrast.
- **v8, a shorter home page** (31 October 2026, from the owner's review): about 9.7 desktop screens at 1440 × 900, down from 12.4, and 16 phone screens, down from 17.3. The booking steps, Mann, the standard and the guarantee said the same reassurance four times; they're one section now. The plans moved under the service cards, the guides became three links beside the questions (hidden on phones, as the guides section was), the district cards sit beside the neighbourhood finder on computers, and sections have a little less air (84px at most, from 96px). `tools/qa/v8.test.mjs` keeps the page within 10 desktop screens.
- **v8, the desktop hero as one composition:** less space above and between the hero's parts, so at 1440 × 900 and 1280 × 800 the headline, the landmark art under the main button and the price box beside them all fit the first screen, and the art's foot sits level with the price box's. Fonts and colours unchanged.
- **v8, the host form in two steps** (`quoteForm(…, { steps })`): "You and your listing" (name, phone, email, postal code, units, bedrooms), then "Turnovers and linens" (turnovers a month, checkout and check-in, linens, listing link, notes). Progress shows above; Next checks step 1 first; Back (the text button or the browser's) returns to step 1 with every answer kept, since both steps are one form. Nothing is stored in the browser. Without JavaScript both steps show as one form.
- **v8, change requests on the Help page** (`changeForm()`, `bindChange()`): booking reference (NR-…, typed any way), what to do (change the day or time, change what's cleaned, cancel), the change, and how Mann should reply (text, call or email: only that field is asked for). It's sent like every form (FormSubmit, or the Google Sheet's Changes tab) and the confirmation says the booking stays as it is until Mann confirms. A failed send offers an email with everything filled in. The email links stay beside it.
- **v8, words:** "Request a clean" is the way into booking everywhere, the postal check included. The re-clean guarantee's 24 hours are always described as the time to report what was missed ("Report anything missed within 24 hours of your clean…"). The room explorer opens with "Choose a service and room to see what we clean."
- **Checks:** `tools/qa/v8.test.mjs`, `tools/qa/v7.test.mjs` (no placeholders on any page, the art's names, the explorer with and without JavaScript, the neighbourhood finder, and the home price box and booking agreeing with the pricing formula) and `tools/qa/host.test.mjs`.

## Reference patterns

v4 rendered the reference sites remotely on 29 October 2026 (they are blocked from this build environment directly). Earlier patterns keep their original evidence labels. All are original executions; no wording, images, code or page layouts were copied.

| Pattern on this site | Seen at | Evidence |
|---|---|---|
| "Not included" listed beside what's included | Maid Sailors pricing (https://maidsailors.com/pricing/), "What we can't clean" | Rendered 29 Oct 2026 |
| A caption under the main action saying what happens next | Hellamaid header (https://hellamaid.ca) | Rendered 29 Oct 2026 |
| Calm through lighter headings and spacing | Molly Maid Canada (https://mollymaid.ca) | Rendered 29 Oct 2026 |
| Price first, with no contact details needed; first visit and later visits shown apart | Hellamaid direct booking (https://hellamaid.ca) | Owner's recheck report, 28 Oct 2026 (E03/E11) |
| Each service says who it's for, next to what's included | Hellamaid package checklists | Owner's recheck report (E13) |
| A photograph with each service | AspenClean Toronto (https://aspenclean.com) | Web search summary, unverified |
| Separate paths for different customers ("Not a regular home?") | MaidThis (https://maidthis.com) | Web search summary, unverified |
| The price explained in steps, with worked examples | Maid Sailors (https://maidsailors.com), and a common convention | Web search summary, unverified |

v7 rendered these on 31 October 2026 through a remote renderer (first-screen screenshots and page text; nothing was submitted):

| Pattern on this site | Seen at | What we did differently |
|---|---|---|
| An illustrated landmark montage for place | Hellamaid homepage (https://hellamaid.ca/), hero: Canadian landmarks in the brand's yellow, beside a quote form | Original artwork of our two districts only, in our palette; the price needs no contact details |
| A cleaner at work with the city visible | Hellamaid Toronto (https://hellamaid.ca/house-cleaning-service-toronto/), hero photo | Waiting for Mann's own photos (shot list in the owner's handover) rather than stock |
| A room-by-room checklist with tabs by clean type | Hellamaid Toronto, "Our Signature 50-Point Checklist" | Room tabs and a clean switch over the checklist the booking already uses |
| A real team photo and a single Book Now | AspenClean Toronto (https://aspenclean.com/en-ca/pages/toronto-house-cleaning-maid-services) | One primary action everywhere; real photos once Mann supplies them |
| A city skyline photo for a local page | Cleany Toronto (https://cleany.ca/locations/toronto/) | Avoided: a downtown skyline would suggest downtown service |
| "Which describes you best?" routing by customer type | Turno for cleaners (https://turno.com/for-cleaner/) | "Not a regular home?" routes hosts, larger homes, offices and realtors |
| District page led by its best-known scenery, then neighbourhood cards | Destination Toronto, Scarborough (https://www.destinationtoronto.com/neighbourhoods/scarborough/) | District cards and district heroes with original art; neighbourhoods as a searchable list |

Not adopted: a contact form in front of the price, repeated calls to action, and any claim the business can't back up (insurance, bonding, review counts, awards, years in business).

## Images

| Image | Source | Where |
|---|---|---|
| Owner portrait (`assets/founder-mann-patel*`) | Supplied by the owner | Hero owner line, founder section, vision page |
| Room photos (`assets/photos/*`: living room, kitchen, entryway, bathroom, bedroom) | AI-generated illustrations. The footer says "Room photos are illustrations, not photos of client homes." | Home service cards, service, guide and gift pages |
| Empty home (`assets/photos/empty-home-*`, not in the repository yet) | AI-generated illustration, made in Canva on 30 Oct 2026 and saved in the owner's Canva uploads, or a real photo of an empty condo after a move-out clean | The Move-In / Move-Out card and service page, in place of the slippers, as soon as the files are added |
| Deep-clean close-up (`assets/photos/deep-detail-*`, not in the repository yet) | Wanted: a real close-up result (a degreased stovetop, a descaled tap, clean grout) | The Deep Cleaning card and service page, in place of the kitchen, as soon as the files are added. Update its description in `PHOTOS` in `tools/build.mjs` to match the photo |
| Logo (`assets/logo*.svg`) | Traced from the original logo artwork | Header, footer, navy-band watermark |
| Landmark artwork (`tools/landmarks.mjs`, inline SVG) | Original illustration drawn for this site in code, 31 Oct 2026; owned by the business | Home hero, home district cards, district page heroes, the panorama above the home page's last call to action |
| Logo nest (`assets/logo-nest.svg`) | The logo mark without its house | Behind the home price box |

No stock or generated people are shown as staff or customers, and there are no before-and-after images.

## Wanted: replacements and decisions

1. **The empty-home picture for move-in and move-out.** It's in your Canva uploads (generated 30 Oct 2026, 1136 × 1408); a real photo of an empty condo after one of your move-out cleans is even better. Run `python3 tools/add_photo.py <the photo> empty-home`, which crops it to the site's 4:5 frame and writes the four files, then run the build: the move-out card and page switch to it by themselves.
1. **A close-up for deep cleaning** (a degreased stovetop, a descaled tap, clean grout), so the deep clean looks different from a regular one: `python3 tools/add_photo.py <the photo> deep-detail`.
2. **Two or three real photos of you at work** (you preparing your kit, wiping a counter, at the door in house shoes), with no client or home identifiable. These beat any illustration for trust. Send them over and they can go beside the founder section and the standard band.
3. **Real photos from your own jobs**, with each client's permission, to replace the illustrations.
   - Use the same file names in `assets/photos`, at 928 × 1152 px (JPEG and WebP, 600 and 928 wide).
   - Then remove the footer's illustration note.
4. **Insurance.** Its status is unverified, so the site doesn't mention it. Once you have a policy, send the insurer and coverage and it can be added where people decide (the standard band and the help page).
5. **Reviews.** The reviews section stays hidden until `reviews` in `js/config.js` holds real reviews. Never add invented ones.
6. **Competitor check.** Done remotely in v4. For a direct recheck from this environment, allow hellamaid.ca, aspenclean.com, maidthis.com, maidsailors.com and mollymaid.ca in its network settings.

## Checks

Run `node tools/build.mjs`, then:

- `node tools/qa/run.mjs` runs the browser tests: layout at 320 to 1440px, 200% text, keyboard, axe, contrast, booking maths, and the v3, v4 and v5 design rules (`design`, `home`, `v4`, `v5`). `v5` includes a complete phone booking at 360, 390 and 430px, a failed send, a retry and the done screen.
- `node tools/qa/perf.mjs` runs the lab LCP and CLS budget.
- [docs/phone-checklist.md](phone-checklist.md) is a 10-minute check on a real phone.
