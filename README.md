# Nest & Rest Cleaning website

A premium, mobile-first website for Nest & Rest Cleaning (Scarborough, serving the GTA).
It's built to turn visitors into booked clients and to rank on Google for local searches.

## Pages

| Page | Purpose |
|---|---|
| `/` | Home: instant price, services, the Nest & Rest standard, plans, founder, areas, FAQ |
| `/book/` | Focused 3-step booking: your home → plan & time → your details |
| `/services/<service>/` | One page per service (regular, deep, move-in/out, kitchen & bath, residence care, office) |
| `/areas/<area>/` | Scarborough and North York, the only two areas served |
| `/review/` | Review form to text clients after each clean (no rewards for reviews: Google and the Competition Bureau forbid undisclosed incentives) |
| `/privacy/` | Privacy Policy (PIPEDA) |
| `/policies/` | Service Policies: booking, cancellation, payment, re-clean, damage, keys, pets, safety |

Each page has its own title, description, structured data (LocalBusiness, Service, FAQ, breadcrumbs) and is listed in `sitemap.xml`.

## Changing things

- **Prices, offers, contact details, hours, FAQs, reviews:** edit `js/config.js`. Prices and contact details update on every page right away.
- **Adding a service or area, or changing page wording:** edit `js/config.js` or `tools/build.mjs`, then run `node tools/build.mjs` to regenerate the pages.
- **Trust badges** (insured, eco-friendly, police-checked) are off. Switch each on in `badges` only once it's true and documented.
- **Service area:** postal-code prefixes for Scarborough and North York are in `serviceArea`. Requests from anywhere else are declined politely.
- **Social icons:** paste your Facebook and Instagram profile URLs into `business.facebookUrl` / `business.instagramUrl` and run the build; the icons become links and are added to Google's business data.
- **Policies:** cancellation notice, late fee, re-clean and damage windows are in `policies`. Have a lawyer review the Privacy Policy and Service Policies.
- **Reviews:** add real reviews to `reviews` in `js/config.js`; a reviews section then appears on the home page.

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

## Files

```
index.html, book/, services/, areas/, review/, 404.html   generated pages
css/site.css       design system (fonts self-hosted in assets/fonts, SIL Open Font License)
js/config.js       business settings (edit this)
js/site.js         pricing, booking, forms, tracking
tools/build.mjs    page generator
assets/            logo, brand illustrations from the uniform guide, icons
```
