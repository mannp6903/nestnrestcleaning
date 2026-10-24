# Nest & Rest Cleaning website

A mobile-first website for Nest & Rest Cleaning (Scarborough and North York, Toronto), built around the new nest-and-house logo.
It's built to turn visitors into booked clients and to rank on Google for local searches.

## Pages

| Page | Purpose |
|---|---|
| `/` | Home: instant price (visible on the first phone screen), services, how booking works, the Nest & Rest standard and guarantee, plans, founder and founding offer, areas, guides, FAQ |
| `/pricing/` | Every price by home size and type, plan discounts, extras, a room-by-room comparison of regular, deep and move-out cleaning, pricing FAQ |
| `/book/` | Focused 3-step booking: your home → plan & time → your details. With a Cal.com link set: your home & plan → your details → pick a confirmed time on your calendar |
| `/services/<service>/` | One page per service (regular, deep, move-in/out, kitchen & bath, residence care, office), each with its own price table |
| `/areas/<district>/` | Scarborough and North York, with their neighbourhoods and postal codes |
| `/areas/<district>/<neighbourhood>/` | 12 neighbourhood pages (Agincourt, Malvern, Guildwood, Birch Cliff, Highland Creek, Wexford, Willowdale, Don Mills, York Mills, Bayview Village, Bathurst Manor, Lawrence Manor) |
| `/realtors/` | Listing-prep, move-out and between-tenant cleaning for realtors, landlords and property managers, with a quote form |
| `/gift/` | Gift a clean: gift card request form (pay by e-Transfer, never expires) |
| `/guides/` | Five helpful articles: Toronto cleaning prices, move-out checklist, deep vs regular, preparing for a cleaner, how often to clean |
| `/vision/` | Our vision: Mann's note, what we believe, always/never promises, the road ahead, hours given back, work with us |
| `/review/` | Review form to text clients after each clean (no rewards for reviews: Google and the Competition Bureau forbid undisclosed incentives). Hidden from search engines. |
| `/privacy/` | Privacy Policy (PIPEDA) |
| `/policies/` | Service Policies: booking, cancellation, payment, re-clean, gift cards, damage, keys, pets, safety |

Each page has its own title, description, social-share card and structured data (HouseCleaningService, WebSite, Service, FAQ, Article, breadcrumbs) and is listed in `sitemap.xml`. The review page and the 404 page are marked `noindex`.

## Changing things

All settings are in `js/config.js`. Prices and contact details update on every page right away. Run `node tools/build.mjs` afterwards so search engines see the changes too.

- **Prices, offers, contact details, hours, FAQs, reviews:** edit `js/config.js`.
- **Founding spots left:** after each new founding household books, add 1 to `offers.founding.claimed`. The site shows "X of 50 founding spots left". Set `offers.founding.active` to `false` when they're all taken.
- **Live booking calendar (Cal.com):** see [Booking calendar](#booking-calendar-calcom) below. Until `booking.calLink` is set, bookings are requests you confirm by text.
- **Next opening:** the site shows the next day you can be booked. `booking.leadDays` is how many days' notice you need (1 = tomorrow). Add any day you're full or away to `booking.blockedDates` as `"YYYY-MM-DD"`; the booking calendar and "Next opening" both skip it.
- **Mailing address:** paste one into `business.mailingAddress` (a PO box or mailbox service is fine) and run the build. Canada's anti-spam law (CASL) needs it in every business email and text, and Ontario's Consumer Protection Act needs it shown when customers book online. It then appears in the footer, the policies, the booking page and every confirmation email.
- **Referral credit:** the amount is `offers.referral`; the terms are in the "Referral credit" section of the Service Policies (`tools/build.mjs`).
- **WhatsApp:** `business.whatsapp` is the WhatsApp number (digits only, with the 1). Leave it `""` to hide every WhatsApp button.
- **Confirmation emails:** customers who give an email get an automatic confirmation from FormSubmit. The wording is in `emails` (booking, bookingCal, quote, gift). Booking emails are the customer's written copy of the agreement (Ontario's Consumer Protection Act), so keep the itemized price, the change terms and the link to the policies in them. `emails.footer` is added to every email with who we are and how to stop emails, as CASL requires.
- **Gift a clean:** amounts and wording are in `offers.gift`. The home-page banner only shows in `bannerMonths` (November and December).
- **Neighbourhood pages:** each one is an entry in `neighbourhoods`. Keep every fact true and local. Run the build to add or change one.
- **Guides:** the articles are in `tools/guides.mjs`. Prices inside them come from `js/config.js`.
- **Adding a service or area, or changing page wording:** edit `js/config.js` or `tools/build.mjs`, then run `node tools/build.mjs` to regenerate the pages.
- **Trust badges** (insured, eco-friendly, police-checked) are off. Switch each on in `badges` only once it's true and documented.
- **Service area:** postal-code prefixes for Scarborough and North York are in `serviceArea`. Requests from anywhere else are declined politely.
- **Social icons:** hidden until you paste your Facebook and Instagram profile URLs into `business.facebookUrl` / `business.instagramUrl`. Run the build and the icons appear as links and are added to Google's business data.
- **Hours and arrival windows:** open every day, 9am to 11pm. Change `business.hours`, `openDays`, `opens`/`closes` and `timeSlots` in `js/config.js`, then run the build.
- **Policies:** cancellation notice, late fee, re-clean and damage windows are in `policies`. Have a lawyer review the Privacy Policy and Service Policies.
- **Reviews:** add real reviews to `reviews` in `js/config.js`; a reviews section then appears on the home page.
- **Vision page:** all its wording is in `vision` in `js/config.js`. Every "always" and "never" is a public promise, so keep each one true.
- **The five steps of every visit** (home page, "Our standard") are in `tools/build.mjs`. They are public promises too.
- **Hours given back:** the vision page's one mission number. Update `impact.hoursGivenBack` and `impact.households`. It stays hidden while it's 0.

## Bookings, quotes, gift cards and reviews

Everything is emailed to `nestnrestcleaning@gmail.com` through [FormSubmit](https://formsubmit.co), including "Text me this price" requests from the price box.
After any change of email address, send one test booking and click **Activate** in the FormSubmit email.
If sending fails, the customer gets text, WhatsApp and email buttons with their details filled in.

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

8. In the event's description, paste: *"Your booking is with Nest & Rest Cleaning, owned and operated by Mann Patel, [your mailing address], 647 978 6903, nestnrestcleaning@gmail.com. Nothing to pay until after your clean. Free to change up to 24 hours before; later changes, or if we can't get in, may cost up to 50% of the estimated price. Full terms: nestnrestcleaning.com/policies/"* Cal.com's emails then carry who you are and your terms too.

With the calendar on, block days off in Cal.com or Google Calendar; `booking.blockedDates` then only changes the "Next opening" line.
To go back to booking requests, set `calLink` to `""` and run the build again.

## Texts and emails you send yourself (CASL)

Canada's anti-spam law covers business texts and emails, even ones a customer asked for. Each one must say who you are, how to reach you, and how to opt out, and you must stop within 10 business days of a request. Templates:

- **A price someone asked for:** "Hi Priya, it's Mann from Nest & Rest Cleaning. A deep clean for your 2-bed condo is $285 ($228 for your first visit). Book: nestnrestcleaning.com/book — Mann, Nest & Rest Cleaning, 647 978 6903. Our details: nestnrestcleaning.com/policies/#contact. Reply STOP to opt out."
- **Confirming a booking:** "Hi Priya, it's Mann from Nest & Rest Cleaning. You're booked for Tue Oct 27, 10am: deep clean, about $228, paid after the clean. Free to change up to 24 hours before. Terms: nestnrestcleaning.com/policies/ — Reply STOP to opt out."
- **Asking for a review** (only to people you've cleaned for in the last 2 years): "Hi Priya, it's Mann from Nest & Rest Cleaning. Thank you for having me today! If you have a minute, I'd love your honest review: nestnrestcleaning.com/review/ — 647 978 6903. Reply STOP to opt out."

Keep a note of anyone who opts out and don't message them again. No promotional messages (offers, discounts, "book again") without the person's clear yes first.

## Growth tracking (for ads)

Paste a Google Analytics 4 ID (`G-…`) and/or a Meta Pixel ID into `analytics` in `js/config.js`, and update the Privacy Policy's cookies section at the same time.
The site then reports: book clicks, call, text, WhatsApp and email taps, instant-price use, booking started, and leads (bookings, quotes, gift cards and price requests).

## Brand

- **Logo:** `assets/logo.svg` (horizontal), `logo-stacked.svg`, `logo-mark.svg` and their `-white` versions for dark backgrounds. Traced from the founder reel; the wordmark is Barlow Condensed.
- **Colours:** navy `#0A2D5C`, teal `#2FA4A6`, sky `#6FC3E0`, sand `#EFD9AE` on ivory `#F7F3EA`. All tokens are at the top of `css/site.css`.
- **Fonts:** Barlow Condensed (headlines) and DM Sans (text), self-hosted in `assets/fonts` under the SIL Open Font License.
- **Founder reel:** `assets/video/founder-reel-720.mp4` (720 × 1280, about 2 MB, no sound) with its cover image `founder-reel-poster.webp` / `.jpg`. It opens from the "Watch" buttons on the home and vision pages and only downloads when someone presses play. To swap in a new cut, replace the files under the same names and update the on-screen words in `REEL_TEXT` in `tools/build.mjs`. The website copy is silent because the music's licence for website use isn't confirmed (music from app libraries such as CapCut, Instagram, TikTok or Canva is often licensed only inside that app). Put the sound back only with music you're licensed to use on a website.
- **Room photos** in `assets/photos` are AI-generated illustrations, and the footer says so. Replace them with real photos from your own jobs (with the client's permission) as soon as you have them: same file names, 928 × 1152 px.

## Hosting

Live at https://nestnrestcleaning.com (GitHub Pages, custom domain set by the `CNAME` file).
When you connect a custom domain, update `siteUrl` in `js/config.js` and run `node tools/build.mjs`.
Every push to `main` publishes the site automatically. Watch the "pages build and deployment" run under the repository's Actions tab; the change is live a minute or two after it turns green.

## Files

```
index.html, book/, services/, areas/, realtors/, gift/, guides/, review/, 404.html   generated pages
css/site.css       design system
js/config.js       business settings (edit this)
js/site.js         pricing, booking, forms, WhatsApp, tracking
tools/build.mjs    page generator
tools/guides.mjs   the guide articles
assets/            logo, icons, founder photo and reel, room photos, social-share image, fonts
```
