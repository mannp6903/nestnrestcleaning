# Nest & Rest Cleaning website

A mobile-first website for Nest & Rest Cleaning (Scarborough and North York, Toronto), built around the new nest-and-house logo.
It's built to turn visitors into booked clients and to rank on Google for local searches.

## Pages

| Page | Purpose |
|---|---|
| `/` | Home, kept short: a strong navy hero ("We clean. You rest.", Mann in the first person with the starting price, Request a clean, three promises, the instant price box, and the landmark art of North York Centre and the Scarborough Bluffs at night along its foot), Services & prices (four cards, then plans, extras and the services priced by quote), How to book (three steps, Mann, and the booking terms), questions, and Contact (email, hours, areas, the postal check and help with a booking) |
| `/pricing/` | Links to Estimate, Prices, Plans, Extras and Compare; every price by home size and type (one service's table at a time), plans you can choose, extras, a folded room-by-room comparison of regular, deep and move-out cleaning, pricing FAQ |
| `/book/` | Focused 3-step booking request: your home → plan & preferred time → your details, ending with "Check your clean", a full review with an Edit link on every detail. From a price box, the service and home show as one card with Edit; from a plan, that plan arrives selected. Extras, unusual homes, visit preferences and referrals fold into sections that say what's chosen. With a Cal.com link set: your home & plan → your details → pick a confirmed time on your calendar |
| `/services/<service>/` | One page per service (regular, deep, move-in/out, kitchen & bath, residence care, office), each with its own price table and, room by room, what's included, what's a paid extra and what isn't included |
| `/areas/<district>/` | Scarborough and North York, with their neighbourhoods and postal codes |
| `/areas/<district>/<neighbourhood>/` | 12 neighbourhood pages (Agincourt, Malvern, Guildwood, Birch Cliff, Highland Creek, Wexford, Willowdale, Don Mills, York Mills, Bayview Village, Bathurst Manor, Lawrence Manor) |
| `/services/airbnb-cleaning/` | Airbnb and short-term rental hosts: the same-day turnover timeline, what every turnover covers room by room, prices per turnover, the host package and first-turnover offer, why hosts book Mann, three steps to start, a postal check, host questions, and the host form in two steps (you and your listing; then turnovers a month, checkout and check-in times, linens and a listing link), with progress above and Back keeping every answer |
| `/realtors/` | Listing-prep, move-out and between-tenant cleaning for realtors, landlords and property managers, with a quote form |
| `/gift/` | Gift a clean: gift card request form (pay by e-Transfer, never expires) |
| `/guides/` | Five helpful articles: Scarborough & North York house cleaning prices (2026), move-out checklist, deep vs regular, preparing for a cleaner, how often to clean. Each opens with its question and a short answer |
| `/vision/` | Our vision: Mann's note, what we believe, always/never promises, the road ahead, hours given back, work with us |
| `/help/` | Help with a booking: a change request form (booking reference, the change, and how to reply: text, call or email), email links as another way, what happens after a request, reply times, codes and saved details |
| `/review/` | Review form to text clients after each clean (no rewards for reviews: Google and the Competition Bureau forbid undisclosed incentives). Hidden from search engines. |
| `/privacy/` | Privacy Policy (PIPEDA) |
| `/policies/` | Service Policies: booking, cancellation, payment, re-clean, gift cards, damage, keys, pets, safety |

Each page has its own title, description, social-share card and structured data (Service, FAQ, Article, breadcrumbs) and is listed in `sitemap.xml`. The review page and the 404 page are marked `noindex`.

**Written for search engines and AI assistants too.** Most AI crawlers (ChatGPT's, Claude's, Perplexity's) don't run JavaScript, so everything they need is in each page's HTML:

- **The business on every page:** one `HouseCleaningService` with the same `@id`, its price list (`OfferCatalog`, the same "from" prices the pages show), opening hours, areas, a `ReserveAction` pointing at `/book/`, and `sameAs` links to every profile you've filled in (see "Your listings" below). Real reviews are added on the home page, where they're shown.
- **Answer first:** every service page, area page, neighbourhood page and the pricing page has, right under the top section, the question people ask ("How much does a deep clean cost in Scarborough and North York?") and a one-paragraph answer with the price, the time on site and how payment works, all from `js/config.js`. Each guide opens with its question and a short answer the same way.
- **"Prices reviewed":** the answers and the price guide show the date in `pricingVersion`, so the date only changes when the prices do.
- `node tools/qa/run.mjs crawler` checks all of this against `js/config.js` in the HTML as built.

## Changing things

All settings are in `js/config.js`. Prices and contact details update on every page right away. Run `node tools/build.mjs` afterwards so search engines see the changes too.

- **Prices, offers, contact details, hours, FAQs, reviews:** edit `js/config.js`.
- **What each service includes (one rule for the whole site):** the room-by-room `checklist` decides it. `"yes"` is included, `"add"` is a paid extra and `""` is not offered. Each extra in `addons` names its checklist row in `task`, so the booking form, the price box, the service pages and the pricing page all follow the checklist: an included task can never be charged twice, and an extra a service doesn't offer can't be chosen. Today a move-in/move-out clean includes the oven, fridge, cabinets and wall spot cleaning, and doesn't offer laundry (the home is empty). The build stops with a message if a `task` doesn't match a checklist row.
- **What an extra covers:** `limit` on each extra (for example "up to 10 windows") is shown under it wherever it's offered. Keep each one true.
- **Charges that depend on the home (heavy pet hair):** an extra with `priceBox` (its wording, e.g. "Pets that shed a lot") is asked in every price box, so the price a household sees is the price it pays. Canada's rules on advertised prices (Bill C-59) treat a price that can't be paid because of a charge added later as misleading. The booking form arrives with it ticked or not, exactly as the price box had it.
- **Booking links:** `/book/` takes `s` (service: `regular`, `deep`, `move`, `detail`), `h` (`condo`, `town`, `house`), `bd` and `ba` (bedrooms, bathrooms), `f` (plan: `weekly`, `biweekly`, `monthly`), `x` (extras, comma-separated, e.g. `pets,oven`) and `pc` (postal code). For example, a link to text a client: `nestnrestcleaning.com/book/?s=deep&h=condo&bd=2&ba=1&pc=M2N5W9`. The postal code fills the form and is taken out of the address bar before analytics starts, so it never reaches Google Analytics.
- **Unusual homes:** `homeChecks` are the optional "Anything unusual about your home?" boxes on the booking form. Half baths, a basement, a second kitchen or heavy build-up keep the estimate but tell the customer you'll confirm the price before the clean. "Over about 3,000 sq ft" (`quote: "residence"`) sends them to the Residence Care quote form instead, with their home details filled in.
- **Founding spots left:** after each new founding household books, add 1 to `offers.founding.claimed`. Set `offers.founding.active` to `false` when they're all taken. The "X of 50 founding spots left" count is off (`showSpotsLeft: false`), so the site says "for our first 50 households" instead. Switch it on only while you update `claimed` after every founding booking.
- **Live booking calendar (Cal.com):** see [Booking calendar](#booking-calendar-calcom) below. Until `booking.calLink` is set, bookings are requests you confirm by text.
- **Live booking calendar (Easy!Appointments, on your own server):** fill in `booking.easyAppointments` (`url`, `provider`, `services`) instead of `booking.calLink`, never both. Setup is in [docs/ops-stack-setup.md](docs/ops-stack-setup.md), sections 2 and 8.
- **Your own server:** `server.name` and `server.location` say where it runs, and the privacy policy repeats them. Fill both in before you switch on Easy!Appointments, n8n form delivery, chat or the offers box. See [docs/ops-stack-setup.md](docs/ops-stack-setup.md), sections 1 and 8.
- **Forms sent to your own n8n:** `delivery: { provider: "webhook", endpoint: "https://…" }` sends every form to a workflow on your server. The workflow must answer `{ "ok": true, "reference": … }`. See [docs/ops-stack-setup.md](docs/ops-stack-setup.md), section 5.
- **Website chat (Chatwoot):** fill in both `chat.baseUrl` and `chat.websiteToken` to show chat on every page except booking. See [docs/ops-stack-setup.md](docs/ops-stack-setup.md), section 6.
- **Offers emails (listmonk):** `newsletter.optIn: true` adds an unticked "Email me seasonal offers" box to the booking form. It needs `business.mailingAddress` (CASL). The box reaches listmonk only when `delivery.provider` is `"webhook"` and the n8n workflow's listmonk step is built; otherwise leave it off or add people in listmonk yourself. See [docs/ops-stack-setup.md](docs/ops-stack-setup.md), section 7.
- **How far ahead people can ask:** `daysAhead` (21 today). The day strip has Earlier and Later buttons, so a longer window stays easy to use.
- **Earliest day to request:** the site shows the first day a customer can ask for, in Toronto time. These are preferred days, not confirmed openings: nothing is preselected, and the customer either picks a day and an arrival window or ticks "I'm flexible". `booking.leadDays` is how many days' notice you need (1 = tomorrow). Add any day you're full or away to `booking.blockedDates` as `"YYYY-MM-DD"`; it's then never offered.
- **Arrival windows:** `timeSlots`, each with its earliest (`start`) and latest (`end`) arrival. A window is greyed out when a clean that long couldn't finish by closing time after arriving at the end of the window, so a 7-hour deep clean can't be requested for the evening. "Any time" lets the customer leave it to you. The time on site assumes `booking.cleaners` (1) cleaner.
- **HST:** `taxRate` is 0, so prices and booking summaries say "No HST charged". Once you're registered, set it to 0.13: HST then shows as its own line. Discounted prices are rounded to the nearest dollar and the discount line is the difference, so every line adds up to the total.
- **Price version:** change `pricingVersion` (a date) whenever prices, extras or the checklist change. Every booking request carries it, so you know which prices the customer saw.
- **Mailing address:** paste one into `business.mailingAddress` (a PO box or mailbox service is fine) and run the build. Canada's anti-spam law (CASL) needs it in every business email and text, and Ontario's Consumer Protection Act needs it shown when customers book online. It then appears in the footer, the policies, the booking page and every confirmation email.
- **Referral credit:** the amount is `offers.referral`; the terms are in the "Referral credit" section of the Service Policies (`tools/build.mjs`). New clients give the referring client's first and last name in the optional "Referred by" box on the booking form, and it arrives as "Referred by" in your booking email.
- **Phone number:** private for now. `business.phoneDisplay` and `business.phone` are both `""`, so the site shows no call or text buttons, leaves the number out of Google's business data and the confirmation emails, and points people to email instead. To show it again, set `phoneDisplay` (e.g. `"647 555 0123"`) and `phone` (e.g. `"+16475550123"`) and run `node tools/build.mjs`.
- **WhatsApp:** `business.whatsapp` is the WhatsApp number (digits only, with the 1). Leave it `""` to hide every WhatsApp button.
- **Confirmation emails:** FormSubmit documents its automatic reply as unsupported for forms sent the way this site sends them, so the site no longer promises one. It's still requested (wording in `emails`, with the CASL footer from `emails.footer`) and any that arrive are a bonus. **Your own confirmation message is what confirms a booking and is the customer's written copy** (Ontario's Consumer Protection Act): include the day, arrival window, itemized price, change terms and the policies link, as in the "Confirming a booking" template below.
- **Gift a clean:** amounts and wording are in `offers.gift`. The home-page banner only shows in `bannerMonths` (November and December).
- **Neighbourhood pages:** each one is an entry in `neighbourhoods`. Keep every fact true and local. Run the build to add or change one. `condo: true` adds a "Booking a condo clean" section (concierge, parking, service elevator, codes), on Willowdale and Bayview Village today. `typical` is the most common kind of home there (`condo`, `town` or `house`): the page's price box starts on it and lists a typical home's prices. A neighbourhood page keeps only what's local (its answer, homes, postal codes, prices for a typical home, nearby areas, and its jobs and reviews once there are some); the full service list and the questions are on its district page, linked from it. A test keeps the 12 pages from becoming near-copies again.
- **"How did you hear about us?":** the booking form's answers are `booking.foundVia`. Each request says "Found us via", and Google Analytics counts the answers. Keep "ChatGPT or another AI assistant" in the list.
- **Airbnb turnovers:** everything for hosts is in `quoteServices.airbnb` in `js/config.js`: the price per turnover for each unit size (`prices`), the monthly `package`, the `firstOffer`, and how `linens`, `restock` and the `photoReport` work. Anything still `null` stays off the site, never a guess: until prices are set, turnovers are "quoted per unit" through the host form, and linens, restocking and photo reports aren't mentioned. Fill each one in as you decide it and run the build: the host page updates. Every turnover follows the regular-clean column of the room-by-room `checklist`. Host questions are the FAQs marked `"airbnb"`.
- **Real jobs:** add finished cleans to `jobs` (only with the client's permission, and never a street, building or unit). They appear on the matching area and neighbourhood pages and the home page. This is the strongest proof the site can show.
- **Guides:** the articles are in `tools/guides.mjs`. Prices inside them come from `js/config.js`. Each has an `answer` (its question and a short answer, shown first) and, if it quotes prices, `prices: true`, which shows "Prices reviewed" and moves its date with `pricingVersion`. Set `modified` whenever you change an article's words.
- **Adding a service or area, or changing page wording:** edit `js/config.js` or `tools/build.mjs`, then run `node tools/build.mjs` to regenerate the pages.
- **Trust badges** (eco-friendly products, police-checked) are off. Switch each on in `badges` only once it's true and documented. The insurance badge's spot is commented out in the home hero's promises (`heroFacts()` in `tools/build.mjs`) until the policy starts in November 2026: write its wording from the policy itself.
- **Service area:** postal-code prefixes for Scarborough and North York are in `serviceArea`. Requests from anywhere else are declined politely.
- **Social icons:** hidden until you paste your Facebook and Instagram profile URLs into `business.facebookUrl` / `business.instagramUrl`. Run the build and the icons appear as links and are added to Google's business data.
- **Hours and arrival windows:** open every day, 9am to 11pm. Change `business.hours`, `openDays`, `opens`/`closes` and `timeSlots` in `js/config.js`, then run the build.
- **Policies:** cancellation notice, late fee, re-clean and damage windows are in `policies`. Have a lawyer review the Privacy Policy and Service Policies.
- **The re-clean guarantee, word for word:** `policies.guarantee` is the one sentence used everywhere the guarantee is promised in full: service pages, the home page, policies, help, the Airbnb page, the FAQ, "Check your clean" and the done screen on the booking form, and both booking emails (`{guarantee}`). `{hours}` in it is `recleanWindowHours`. Short spots (the home hero, short lists) say "Free re-clean if reported within 24 hours". Change the sentence in config only, so it can never read two ways.
- **Your listings (Google, Yelp, HomeStars and social):** paste each public profile link into `business.googleBusinessUrl`, `yelpUrl`, `homestarsUrl`, `facebookUrl` and `instagramUrl` as it goes live, then run the build. They tell Google and AI assistants that these listings and this website are the same business. What to set up, in order: [docs/listings-checklist.md](docs/listings-checklist.md).
- **Reviews:** add real reviews to `reviews` in `js/config.js`; a reviews section then appears on the home page.
- **Vision page:** all its wording is in `vision` in `js/config.js`. Every "always" and "never" is a public promise, so keep each one true.
- **The five steps of every visit** (vision page, "The Nest & Rest standard") are `STANDARD` in `tools/build.mjs`. They are public promises too.
- **Hours given back:** the vision page's one mission number. Update `impact.hoursGivenBack` and `impact.households`. It stays hidden while it's 0.

## Bookings, quotes, gift cards and reviews

Everything is emailed to `nestnrestcleaning@gmail.com` through [FormSubmit](https://formsubmit.co), including "Text me this price" requests from the price box.
After any change of email address, send one test booking and click **Activate** in the FormSubmit email.
You can switch to saving every request in your own Google Sheet instead (see the next section).

- **Request, then confirmation.** A booking request is not a booked time. The customer sees "Request received · not confirmed yet" and that their time is held only once you confirm. Each request email has a **Status**, the preferred day and window, what's included, extras with prices, "Price to confirm" (half baths, a basement, more than 8 hours…), the time on site, the price version, building details and product preference.
- **Received means received.** The site shows "Request received" only when FormSubmit (or the Google Sheet) answers with an explicit success. An empty or unexpected answer is treated as a failure: the customer gets an email button with everything filled in (plus text and WhatsApp while those numbers are set) and can try again.
- **One reference per request.** A retry keeps the same reference (NR-…, or GIFT-… for gift cards), so if a request reaches you twice, the matching reference tells you it's one request. With the Google Sheet switched on, a retry never adds a second row.
- **Changes and rebooking:** customers send a change request from the Help page (their reference, what to change, and text, call or email for your reply), or email you with their reference from the done screen or the Help page. A change request is only a request: the customer is told their booking stays as it is until you confirm. On the same device, the booking form remembers their home and extras for a repeat booking.
- **Saved details:** home choices are kept on the customer's device for 14 days. Name, contact details, address and notes are kept only in the open browser tab and are deleted once the request is sent. "Clear my details from this device" is on the booking form and the Help page.

## Saving form requests to a Google Sheet

With this switched on, every form (bookings, quotes, gift cards, reviews and "Text me this price") is saved as a row in a Google Sheet you own, under one reference.
You get an alert email for each request, and customers who give an email get a short receipt saying it arrived and isn't confirmed yet.
Emails that fail are retried every 15 minutes, and each morning at 9 you get one email listing anything still waiting for your reply.

- **Set up:** follow `docs/google-sheet-setup.md` (about 15 minutes). The script to paste is `tools/sheet/Code.gs`.
- **Switch on:** in `js/config.js`, set `delivery: { provider: "sheet", endpoint: "<your /exec address>" }`, then run `node tools/build.mjs` so the privacy notes name the sheet.
- **Switch off:** set `provider` back to `"formsubmit"` and rebuild. The sheet keeps what's already saved.

## Booking calendar (Cal.com)

With your Cal.com link in `booking.calLink`, booking ends with picking a real time on your calendar, confirmed straight away.
The customer's details reach your inbox first (so you still get the lead if they leave), then the calendar opens with their name, email, phone and job notes filled in, and the slot length set from the job size.
Cal.com emails both of you the confirmation, with reschedule and cancel links.

1. Sign up free at [cal.com](https://cal.com) with the business email and connect your Google Calendar, so busy times are blocked.
2. Set your availability to every day, 9am to 11pm, Toronto time.
3. Create an event type, for example "Home clean" with the link `home-clean`. Turn on **multiple durations**, tick every length from 1 to 8 hours, and make 2 hours the default.
4. In the event's limits, set the minimum notice to 24 hours and add a 30 to 60 minute buffer after each clean for travel. Leave "requires confirmation" off so bookings confirm instantly.
5. Optional: in the booking questions, switch on the phone number field so it's filled in too.
6. Open your event link in a private browser window first: it must show your calendar with times, not "404" or a list of events. Then paste the part after `cal.com/` (for example `nestnrestcleaning/home-clean`) into `booking.calLink` in `js/config.js`, run `node tools/build.mjs`, and push.
7. Make one test booking on the live site, then cancel it from the confirmation email.

8. In the event's description, paste: *"Your booking is with Nest & Rest Cleaning, owned and operated by Mann Patel, [your mailing address], nestnrestcleaning@gmail.com. Nothing to pay until after your clean. Free to change up to 24 hours before; later changes, or if we can't get in, may cost up to 50% of the estimated price. Full terms: nestnrestcleaning.com/policies/"* Cal.com's emails then carry who you are and your terms too.

With the calendar on, block days off in Cal.com or Google Calendar; `booking.blockedDates` then only changes the "Next opening" line.
To go back to booking requests, set `calLink` to `""` and run the build again.

## Texts and emails you send yourself (CASL)

Canada's anti-spam law covers business texts and emails, even ones a customer asked for. Each one must say who you are, how to reach you, and how to opt out, and you must stop within 10 business days of a request. Templates:

- **A price someone asked for:** "Hi Priya, it's Mann from Nest & Rest Cleaning. A deep clean for your 2-bed condo is $285 ($228 for your first visit). Book: nestnrestcleaning.com/book — Mann, Nest & Rest Cleaning, nestnrestcleaning@gmail.com. Our details: nestnrestcleaning.com/policies/#contact. Reply STOP to opt out."
- **Confirming a booking:** "Hi Priya, it's Mann from Nest & Rest Cleaning. You're booked for Tue Oct 27, 10am: deep clean, about $228, paid after the clean. Free to change up to 24 hours before. Terms: nestnrestcleaning.com/policies/ — Reply STOP to opt out."
- **Asking for a review** (only to people you've cleaned for in the last 2 years): "Hi Priya, it's Mann from Nest & Rest Cleaning. Thank you for having me today! If you have a minute, I'd love your honest review: nestnrestcleaning.com/review/ — nestnrestcleaning@gmail.com. Reply STOP to opt out."

Keep a note of anyone who opts out and don't message them again. No promotional messages (offers, discounts, "book again") without the person's clear yes first.

## Growth tracking (for ads)

Paste a Google Analytics 4 ID (`G-…`) and/or a Meta Pixel ID into `analytics` in `js/config.js`, and update the Privacy Policy's cookies section at the same time.
The site then reports: book clicks, plan clicks (`plan_click`), call, text, WhatsApp and email taps, `quote_viewed` (a price was on screen), `booking_started` (first real use of the form, with where the visitor came from: `price_box`, `plan` or `direct`), `booking_step_completed`, `validation_failed` (step, field and a fixed code), `review_edit`, `request_not_confirmed`, and leads (`generate_lead` for bookings, quotes, gift cards and price requests; a booking's carries `found_via`, the answer to "How did you hear about us?"). Events carry categories and amounts only: never names, contact details, addresses, postal codes, codes or notes. How to read all this, including visits from AI assistants and a monthly check of what ChatGPT and others say about you: [docs/measurement.md](docs/measurement.md).
A `generate_lead` means FormSubmit accepted the request, not that a booking is confirmed. Count confirmed bookings from your own replies.

## Still to do (needs Mann, or a booking system)

From the October 2026 website audit. Everything the website itself can fix is done; these need a decision or an account:

1. **Confirm the defaults chosen for you** in `js/config.js`: laundry not offered with a move-out clean, the limit under each extra (especially "up to 10 windows"), half baths and basements confirmed by you rather than priced, and no HST. Change any of them there and run the build.
2. **Test delivery once.** Send one test booking with your own email address to confirm the request arrives, and see whether FormSubmit's automatic reply arrives too.
3. **A request record that doesn't depend on email.** Today a request exists only as an email. The audit recommends trying a booking system (for example BookingKoala's Starter plan) against the booking cases above before building anything custom, keeping this website as the front door. Until then, reply to every request within your promised time and keep your replies as the record. Another way is the self-hosted stack in [docs/ops-stack-setup.md](docs/ops-stack-setup.md): n8n saves each request in its own table before it confirms receipt, and Easy!Appointments keeps confirmed times in a calendar. It takes more setup than a hosted booking system, and you run the server yourself.
4. **Proof:** add real jobs to `jobs` and real reviews to `reviews` as they come in, and paste your Google Business Profile review link into `business.googleReviewUrl` once it exists. AI assistants lean hardest on reviews and listings when they recommend a cleaner, so this matters more than any design work: [docs/listings-checklist.md](docs/listings-checklist.md) has the order to do it in.
5. **Search Console:** connect it to see which pages and searches bring people, before adding more neighbourhood pages.

## Brand

How the site looks and why (tokens, components, the reference patterns behind them, image sources and the replacements wanted) is in [docs/design-notes.md](docs/design-notes.md).

- **Logo:** `assets/logo.svg` (horizontal), `logo-stacked.svg`, `logo-mark.svg` and their `-white` versions for dark backgrounds. Traced from the original logo artwork; the wordmark is Barlow Condensed.
- **Colours:** navy `#0A2D5C`, teal `#2FA4A6`, sky `#6FC3E0`, sand `#EFD9AE` on ivory `#F7F3EA`. All tokens are at the top of `css/site.css`.
- **Fonts:** Fraunces (headings: soft, rounded serifs, "You rest.") and Figtree (buttons, prices, labels and text: "We clean."), self-hosted in `assets/fonts` under the SIL Open Font License. How the Fraunces file was made is in `docs/design-notes.md`.
- **Service colours:** each service has its own hue from Toronto at night: regular is lake teal, deep is dusk violet, move-in/out is dawn apricot, kitchen and bath is sky. They're tokens at the top of `css/site.css`, checked for contrast in both themes.
- **Motion:** everything "settles": one soft easing curve and three speeds (`--ease-settle`, `--settle-quick`, `--settle`, `--settle-slow` in `css/site.css`). Nothing bounces or loops, text on the home hero is never faded in (it's the largest thing on a phone's first screen), and nothing moves for visitors who ask for reduced motion.
- **Signature moments:** "You rest." exhales once on the home page; the home hero's city goes from night to dawn as you scroll; every price box has a small house that fills with the rooms you describe; and pages change with a short crossfade, a service card's title gliding into its page's heading. How each works, and the rule that keeps the house from slowing phones down, is in `docs/design-notes.md` ("Phase 3").
- **Room photos** in `assets/photos` are AI-generated illustrations, and the footer says so. An empty-home picture for move-in and move-out is waiting in your Canva uploads: see "Wanted" in `docs/design-notes.md` for the four files to save; the build uses them as soon as they're there. Replace them with real photos from your own jobs (with the client's permission) as soon as you have them: same file names, 928 × 1152 px.

## Hosting

Live at https://nestnrestcleaning.com (GitHub Pages, custom domain set by the `CNAME` file). Moving to Cloudflare Pages or Netlify is recommended for a business site: the steps are in [docs/hosting-move.md](docs/hosting-move.md).
When you connect a custom domain, update `siteUrl` in `js/config.js` and run `node tools/build.mjs`.
Every push to `main` publishes the site automatically. Watch the "pages build and deployment" run under the repository's Actions tab; the change is live a minute or two after it turns green.

## Checking the site

After a change, rebuild and run the browser checks:

```
node tools/build.mjs
node tools/qa/run.mjs            # all checks below; add a word to run one file, e.g. booking
node tools/qa/perf.mjs           # load speed on a slow phone: fails if a page takes over 2.2s or jumps around
```

The checks cover:

- **booking:** the booking form's rules, plus the Pets and Notes rows.
- **delivery:** forms sent to the Google Sheet.
- **handoff:** large homes carried into the Residence Care quote, and quote dropdowns.
- **pricebox:** the price box.
- **privacy:** nothing personal in analytics.
- **layout and design:** screen widths, both themes, type and contrast.
- **a11y:** text at 200%, keyboard only, what screen readers hear, an axe-core scan, and long names.
- **sheet:** the Google Sheet script, run against stand-in Google services.
- **v4:** what's included and not on service pages, booking errors beside their field, tabular prices, the price switcher, aligned panels, one set of booking labels, and nothing under 12px.
- **v8:** the desktop hero's headline, button, price box and art on the first screen; the home page within 6 desktop and 10 phone screens; the Help page's change request (sent, failed, by text or by email) and its Google Sheet tab; "Request a clean" everywhere, and the re-clean's hours always described as a window for reporting.
- **v7:** no placeholder on any page, the landmark art's names, and the home price box and booking agreeing with the pricing formula.
- **home:** the short home page: one main action in the hero, the four service cards, plans, quote paths, How to book, Contact, and nothing left over from the long page. **host:** the Airbnb host page, its form and the ways into it.
- **v5:** plans you can choose, prices that say what they're for, the price-box card and folded sections in booking, paged dates, pricing jump links, stage-matched words, service pages that lead with what's covered, the type scale, contrast of the new parts, and a complete phone booking (with a failed send and a retry) at 360, 390 and 430px.

Both need Playwright with Chromium (`npm install -g playwright && npx playwright install chromium`). The checks serve the site from your computer and never send a real booking. For what only a real phone can show (its keyboard, autofill, VoiceOver or TalkBack), use `docs/phone-checklist.md`.

## Files

```
index.html, book/, services/, areas/, realtors/, gift/, guides/, help/, review/, 404.html   generated pages
css/site.css       design system (edit this; the build writes css/site.min.css, which the pages load)
js/config.js       business settings (edit this)
js/site.js         pricing, booking, forms, WhatsApp, tracking (the build writes js/site.min.js, which the pages load)
tools/build.mjs    page generator
tools/guides.mjs   the guide articles
tools/qa/          browser checks (see Checking the site)
tools/add_photo.py turns one photo into the four files a photo slot needs (python3 tools/add_photo.py photo.jpg empty-home)
assets/            logo, icons, founder photo, room photos, social-share image, fonts
```
