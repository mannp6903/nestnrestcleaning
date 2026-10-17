# Nest & Rest Cleaning website

Mobile-first booking website for Nest & Rest Cleaning (Scarborough, serving the GTA).
Plain HTML, CSS and JavaScript. No build step, no monthly platform fee.

## What's on the site

- **Booking wizard (the main goal):** service → home size and add-ons → frequency, day and arrival window → address → review and send. The price updates live as the customer goes. Their progress is saved on their phone if they leave halfway.
- **Instant estimate:** prices come from `js/config.js` (base price + per bedroom + per bathroom × home type, plus add-ons, travel fee and discounts).
- **Offers:** Founding Client 20% off the first clean, recurring discounts (weekly 15%, every 2 weeks 10%, every 4 weeks 5%), $25 refer-a-friend, $15 off for an honest review.
- **Service-area checker:** postal code lookup (M1 = home turf, all M = Toronto, listed L codes = extended GTA with travel fee).
- **Honest review system:** no fake testimonials. Customers submit reviews through the site, you verify them, then add them to `reviews` in `js/config.js`. A Google review button appears once you add your link.
- **Trust strip** under the headline: satisfaction re-clean guarantee, price before you book, open Saturdays, house shoes indoors. Insurance, eco-product and police-check badges are built in but switched off: turn each on in `badges` in `js/config.js` only once it's true.
- **Room-by-room checklist:** what Regular, Deep and Move-out cleans cover in each room (`checklist` in `js/config.js`).
- **Small office cleaning:** quote-only service with its own request form (`office` in `js/config.js`).
- **Trust content:** "The first minute at your door" (your Threshold Ritual from the uniform guide), founder note, promises, FAQ.
- **Always-there contact:** sticky bottom bar on phones with Call, Text and Book.
- **SEO basics:** page title and description, LocalBusiness structured data, sitemap, robots.txt, social preview image.

## Change prices, offers or contact details

Edit **`js/config.js`** only. Every price, discount, time slot, open day, postal code and contact detail lives there.

## How booking requests reach you

Requests are emailed to `mannp6903@gmail.com` through [FormSubmit](https://formsubmit.co) (free, no account).

1. After the site is live, make one test booking yourself.
2. FormSubmit emails you an **Activate** link. Click it once. From then on every booking arrives as an email.
3. If sending ever fails, the customer is shown buttons to text or email the booking to you, with all details filled in.

To stop using FormSubmit, set `delivery.provider` to `"none"` in `js/config.js`.

## Put it online for free (GitHub Pages)

1. Push this repository to GitHub (`mannp6903/nestandrestcleaning`).
2. On GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root**.
3. The site appears at `https://mannp6903.github.io/nestandrestcleaning/` within a minute or two.
4. Custom domain: buy `nestandrestcleaning.com` (or similar), add it under **Settings → Pages → Custom domain**, and point the DNS records as GitHub shows.

Netlify or Cloudflare Pages also work: drag this folder onto their dashboard.

If your domain is not `nestandrestcleaning.com`, replace it in `index.html` (canonical and og tags), `robots.txt` and `sitemap.xml`.

## Before launch: decisions only you can make

These are reasonable defaults for a new GTA cleaning business. Confirm or change them:

- Starting prices and add-on prices (`services`, `addons` in `js/config.js`).
- Founding offer size and number of spots.
- Policies shown on the site: 24-hour re-clean guarantee, pay after the clean (e-Transfer, card, cash), free changes up to 24 hours ahead, you bring supplies.
- Hours (Mon to Sat, 8am to 6pm) and arrival windows.
- The founder note in `index.html` ("Hi, I'm Mann").
- HST: `taxRate` is 0 while you're a small supplier (under $30,000 in 12 months). Set it to `0.13` once you register.

Recommended next steps: create a free Google Business Profile (biggest source of local customers), get liability insurance and mention it on the site, and add your Google review link to `business.googleReviewUrl`.

## Files

```
index.html          page content
css/styles.css      design (brand colours: Ink Navy, Linen Stone, Badge Ivory, Leaf Green)
js/config.js        business settings: edit this one
js/app.js           booking, pricing and page behaviour
assets/             logo (from the master file), icons
```
