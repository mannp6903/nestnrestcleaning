# Nest & Rest Cleaning website

A premium, mobile-first website for Nest & Rest Cleaning (Scarborough, serving the GTA).
It's built to turn visitors into booked clients and to rank on Google for local searches.

## Pages

| Page | Purpose |
|---|---|
| `/` | Home: instant price, services, the Nest & Rest standard and guarantee, plans, founder, areas, FAQ |
| `/pricing/` | Every price by home size and type, plan discounts, extras, a room-by-room comparison of regular, deep and move-out cleaning, pricing FAQ |
| `/book/` | Focused 3-step booking: your home → plan & time → your details |
| `/services/<service>/` | One page per service (regular, deep, move-in/out, kitchen & bath, residence care, office), each with its own price table |
| `/areas/<area>/` | Scarborough and North York, the only two areas served, with their neighbourhoods and postal codes |
| `/vision/` | Our vision: Mann's note, what we believe, always/never promises, the road ahead, hours given back, work with us |
| `/review/` | Review form to text clients after each clean (no rewards for reviews: Google and the Competition Bureau forbid undisclosed incentives). Hidden from search engines. |
| `/privacy/` | Privacy Policy (PIPEDA) |
| `/policies/` | Service Policies: booking, cancellation, payment, re-clean, damage, keys, pets, safety |

Each page has its own title, description, social-share card and structured data (LocalBusiness, WebSite, Service, FAQ, breadcrumbs) and is listed in `sitemap.xml`. The review page and the 404 page are marked `noindex`.

## Changing things

- **Prices, offers, contact details, hours, FAQs, reviews:** edit `js/config.js`. Prices and contact details update on every page right away, including the price tables. Run the build afterwards anyway so search engines see the new prices too.
- **Adding a service or area, or changing page wording:** edit `js/config.js` or `tools/build.mjs`, then run `node tools/build.mjs` to regenerate the pages.
- **Trust badges** (insured, eco-friendly, police-checked) are off. Switch each on in `badges` only once it's true and documented.
- **Service area:** postal-code prefixes for Scarborough and North York are in `serviceArea`. Requests from anywhere else are declined politely.
- **Social icons:** paste your Facebook and Instagram profile URLs into `business.facebookUrl` / `business.instagramUrl` and run the build; the icons become links and are added to Google's business data.
- **Policies:** cancellation notice, late fee, re-clean and damage windows are in `policies`. Have a lawyer review the Privacy Policy and Service Policies.
- **Reviews:** add real reviews to `reviews` in `js/config.js`; a reviews section then appears on the home page.
- **Vision page:** all its wording is in `vision` in `js/config.js`; run the build after editing. Every "always" and "never" is a public promise, so keep each one true.
- **The five steps of every visit** (home page, "Our standard") are in `tools/build.mjs`. They are public promises too: keep each one true.
- **Hours given back:** the vision page's one mission number. Update `impact.hoursGivenBack` (total hours on site across completed cleans) and `impact.households` in `js/config.js`. It stays hidden while it's 0.

## Bookings, quotes and reviews

Everything is emailed to `nestnrestcleaning@gmail.com` through [FormSubmit](https://formsubmit.co).
After any change of email address, send one test booking and click **Activate** in the FormSubmit email.
If sending fails, the customer gets text and email buttons with their details filled in.

## Growth tracking (for ads)

Paste a Google Analytics 4 ID (`G-…`) and/or a Meta Pixel ID into `analytics` in `js/config.js`.
The site then reports: book clicks, call and text taps, instant-price use, booking started, and leads (bookings and quote requests).

## Hosting

Live at https://nestnrestcleaning.com (GitHub Pages, custom domain set by the `CNAME` file).
When you connect a custom domain, update `siteUrl` in `js/config.js` and run `node tools/build.mjs`.
Every push to `main` publishes the site automatically. Watch the "pages build and deployment" run under the repository's Actions tab; the change is live a minute or two after it turns green.

## Files

```
index.html, book/, services/, areas/, review/, 404.html   generated pages
css/site.css       design system (fonts self-hosted in assets/fonts, SIL Open Font License)
js/config.js       business settings (edit this)
js/site.js         pricing, booking, forms, tracking
tools/build.mjs    page generator
assets/            logo, founder photo, social-share image, icons
```
