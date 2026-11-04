# North American Cleaning Websites: Benchmark, Scores and Toronto Competitor Scan (Nov 2026)

> **How this was researched, and what that limits.** The session's network policy blocked every target host. Playwright (Chromium) and WebFetch both failed for mollymaid.com, merrymaids.com, maids.com, maidpro.com, twomaids.com, homeaglow.com, handy.com, maidily.com, tidy.com, sparklymaidnyc.com, aspenclean.com, myclean.com, hellamaid.ca, mopify.com, mollymaid.ca, cleanproper.ca, maid4condos.com, maidsailors.com and getspruce.com, with the errors `ERR_TUNNEL_CONNECTION_FAILED` / proxy `403` / `ENOTFOUND`. The roundup sites webcitz.com and dorik.com were blocked too. Everything below comes from **search-index extracts** (WebSearch, mostly restricted to each company's own domain) of the cited pages. As a result:
> - Facts about copy, pricing, booking steps, guarantees, page types and location pages are **sourced**, but they come from indexed snapshots that may be weeks or months old.
> - **Typography, colour, motion libraries, JSON-LD, llms.txt and mobile behaviour could NOT be inspected.** Those fields are marked **NV (not verified)**. Rubric dimensions 1 (visual), 6 (motion/type/craft) and 7 (mobile) are left unscored, not guessed.
> - No screenshots were captured. A ready-to-run crawler (hero text, h2 order, JSON-LD types, loaded fonts, GSAP/Lenis/Lottie/Rive/Webflow/Framer detection, llms.txt/robots, desktop and mobile screenshots) is saved at `/tmp/claude-0/-home-user-nestnrestcleaning/67aecbd2-25bd-57d0-a71b-323079773156/scratchpad/na_sites/scripts/crawl.js`. Usage: `node crawl.js <outdir> <url...>`. It can be re-run once these hosts are allowed in the environment's network settings.
> - Platform guesses based on URL structure are labelled "inferred".

## Which North American cleaning sites are the strongest on each rubric dimension, and why?

### Takeaway
On the dimensions I could verify (hero offer, booking, service and pricing info, trust, AEO/GEO), the strongest North American sites are booking-first independents and marketplaces, not the national franchises. The leaders are **Hellamaid** (Toronto), **Maid Marines** and **Maid Sailors** (NYC), **Homeaglow** (US marketplace) and **Sparkly Maid NYC**, with AspenClean as the strongest Canadian eco-brand. The franchises (Molly Maid, Merry Maids, The Maids, MaidPro) win on trust and named cleaning systems but lose badly on booking, because they still funnel visitors to "free in-home estimate" forms. Visual and motion craft could not be verified for any site, so the final top-10 visual ranking still needs a live render pass.

### Cited Findings

**Scoring key.** Each verifiable dimension is scored 1–5: (2) Hero, (3) Booking/quote, (4) Service info, (5) Trust, (8) AEO/GEO. Dimensions (1) Visual distinctiveness, (6) Motion/typography/craft and (7) Mobile = **NV**. Totals are out of **25** (the five verifiable dimensions). "Hero" is scored from hero copy, CTA and offer evidence only, not from imagery.

#### Group A: National brands and marketplaces

**1. Molly Maid (US: mollymaid.com; Canada: mollymaid.ca)**
- Who: franchise maid service brand. The US and Canadian sites are separate. The Toronto site claims more than 25 years in Toronto and calls itself the "number one residential maid service" — [mollymaid.ca](https://mollymaid.ca/?p=5029)
- Hero (US homepage, from a snapshot about 248 days old): "Call for a Free Estimate!" followed by "Request a free estimate now!". A "Find a Molly Maid Near Me" block has a ZIP/postal-code field, and a toll-free number (800) 665-5962 is shown. **No price in the hero** — [mollymaid.com](https://www.mollymaid.com/)
- Booking: estimate request only. Local pages use a "Request a Free Quote" button — [Molly Maid Chicago](https://www.mollymaid.com/locations/illinois/chicago/). When a ZIP has no franchise, visitors hit a "no locations found" dead end — [Molly Maid Tri-Valley contact](https://mollymaid.com/tri-valley/about-us/contact-us). In Canada the offer is a free in-home estimate walkthrough that promises "transparent pricing" — [mollymaid.ca in-home estimates](https://mollymaid.ca/in-home-estimates/)
- Trust: 100% satisfaction guarantee — [Toronto North](https://mollymaid.ca/locations/on/toronto-north/), [one-time cleaning](https://mollymaid.ca/one-time-cleaning/). Staff described as "professionally trained, bonded and insured" — [North York](https://mollymaid.ca/locations/on/north-york/)
- AEO/GEO: neighbourhood sub-pages under Toronto North (York Mills, Yonge & Lawrence, York Heights) — [York Mills](https://mollymaid.ca/locations/on/toronto-north/york-mills/), [Yonge and Lawrence](https://mollymaid.ca/locations/on/toronto-north/yonge-and-lawrence/). **No dedicated Scarborough page** turned up; only a "Scarborough West" entry in the directory — [all locations](https://mollymaid.ca/all-locations/). The North York page lists a (905) number — [North York](https://mollymaid.ca/locations/on/north-york/). WordPress inferred from `?p=` URLs.
- Typography/colour/motion/mobile/JSON-LD: NV.
- Award context (UK sister brand, outside North America): Molly Maid UK won "Best Website" at the Franchise Marketing Awards — [mollymaid.co.uk](https://mollymaid.co.uk/news/molly-maid-awarded-best-website-accolade)
- **Scores:** Hero 2 (phone and estimate CTA, no price) · Booking 2 (estimate form or in-home visit) · Service 3 · Trust 4 · AEO/GEO 3 (deep franchise location tree, but a Scarborough gap) → **14/25**

**2. Merry Maids (merrymaids.com; merrymaids.ca)**
- Who: franchise brand. Scarborough office at 515 Milner Ave, Unit 2, claiming more than 45 years of experience — [Merry Maids Scarborough](https://merrymaids.ca/home-cleaners-scarborough-on)
- Hero: homepage not captured (NV). Location pages lead with free estimates: "free in-home or virtual estimates" — [McKinney](https://merrymaids.com/home-cleaners-mckinney-tx); "free, no-obligation estimate" — [Dayton](https://merrymaids.com/home-cleaners-dayton-oh)
- Service info: a dedicated "Our Cleaning Process" page — [merrymaids.com/our-process](https://merrymaids.com/our-process). Pricing factors are spelled out (home size, room count, condition, service type, frequency, add-ons), but no prices are given — [Columbus](https://www.merrymaids.com/columbus/cleaning-services/)
- Trust: 100% Satisfaction Guarantee with a return visit — [Dayton](https://merrymaids.com/home-cleaners-dayton-oh); "contact us within 24 hours so we can make it right" — [Centertown](https://merrymaids.com/home-cleaners-centertown-mo); cleaners "insured and bonded", background-checked — [Melbourne FL](https://merrymaids.com/home-cleaners-melbourne-fl)
- AEO/GEO: programmatic `/home-cleaners-{city}-{state}` pages — [example](https://merrymaids.com/home-cleaners-ann-arbor-mi). JSON-LD NV.
- Roundup mention: Webcitz lists Merry Maids among 2026's best cleaning sites for "conversion and visual credibility" (the article itself could not be opened) — [Webcitz](https://www.webcitz.com/blog/best-cleaning-websites/)
- **Scores:** Hero 2 (low confidence, homepage not seen) · Booking 2 · Service 3 · Trust 4 · AEO/GEO 3 → **14/25**

**3. The Maids (maids.com)**
- Who: franchise brand with GTA pages for Scarborough, Scarborough–West Hill and North York — [Scarborough](https://www.maids.com/on/scarborough/), [Scarborough West Hill](https://www.maids.com/on/scarborough-west-hill/). North York office at 2005 Sheppard Ave E, Suite 100 — [maids.com](https://www.maids.com/?p=15019)
- Hero: homepage title "Professional House Cleaning & Maid Services". Copy says you can "get a free quote and book your service online 24/7" — [maids.com](https://www.maids.com/). Exact H1 NV.
- Service info: a named proprietary system, the "22-Step Healthy Touch Deep Cleaning System", covering kitchens, bathrooms, floors, living areas and high-touch surfaces. HEPA backpack vacuums "remove up to 99% of dust, allergens" — [services](https://www.maids.com/services/). The deep-clean page is organised room by room — [deep cleaning](https://www.maids.com/services/deep-cleaning-services/). No prices; "cost depends on your specific needs, the size of your home" — [Arizona](https://www.maids.com/arizona-cleaning/)
- Trust: 24-hour 100% satisfaction guarantee with a free re-clean, plus EPA-approved disinfectants — [Scarborough](https://www.maids.com/on/scarborough/). The Toronto page is described as "hand-selected and certified by Mr. Clean®" (search extract, unverified wording) — [The Maids Toronto](https://www.maids.com/on/toronto)
- AEO/GEO: franchise location pages plus a blog — [blog example](https://www.maids.com/blog/your-lazy-day-guide-to-cleaning/). WordPress inferred from `?p=` URLs. JSON-LD NV.
- **Scores:** Hero 2 · Booking 3 (online booking claimed, no instant price seen) · Service 4 (named 22-step system, room by room) · Trust 4 · AEO/GEO 3 → **16/25**

**4. MaidPro (maidpro.com)**
- Who: franchise brand.
- Hero/booking: location `/estimate` pages promise "a free, no-pressure quote" — [MaidPro Los Angeles](https://www.maidpro.com/dtla/estimate). The generic estimate page's title is literally **"MaidPro [location-city]"**, an unfilled template token. That is a visible SEO and quality defect — [maidpro.com/estimate](https://www.maidpro.com/estimate/estimate)
- Service info: "49-Point Checklist" and "PRO Promise". Schedules run "from weekly to seasonal. No contracts" — [cleaning schedules](https://www.maidpro.com/services/cleaning-schedules)
- No details found on form fields, prices or booking steps.
- **Scores:** Hero 2 (low confidence) · Booking 2 · Service 4 (named 49-point checklist) · Trust 3 · AEO/GEO 3 (unfilled token hurts) → **14/25**

**5. Homeaglow (homeaglow.com)** — venture-style US cleaning marketplace
- Hero/offer: the homepage pushes a membership offer: "$19 for your first month, then $59/mo". A free first 3-hour clean requires an active membership, and cancelling before 6 paid months means the first clean is charged at full price — [homeaglow.com](https://www.homeaglow.com/). Visitors enter a ZIP code to check coverage ("50+ major US cities") — [try.homeaglow.com](https://try.homeaglow.com/). Ad landing pages run "$19" and "$0" variants — [$19 deal](https://try.homeaglow.com/deal?adgroupid=1338108056197335&msclkid=%7Bmsclkid%7D), [$0 deal](https://try.homeaglow.com/deal/fcf?amp=)
- Booking: search by address, date, start time and number of hours, then review cleaner profiles (pets, special tasks). Many cleaners approve requests before the booking is confirmed — [How do I book](https://www.homeaglow.com/help/3). Later member cleans start at $18/hour — [pricing](https://www.homeaglow.com/pricing). An older blog gives a $49/month fee, which conflicts with $59 — [blog](https://blog.homeaglow.com/content/homeaglow-cost)
- Trust: background checks, and cleaners must keep high ratings. The page claims "4.8 from 4,849 ratings" and, elsewhere, "500,000+ 5-star reviews". These figures conflict — [Is Homeaglow legit?](https://www.homeaglow.com/is-legit). Homeaglow does not provide insurance itself — [help/136](https://www.homeaglow.com/help/136). "Even when your cleaning is free, we still pay your cleaner their full hourly rate" — [help/182](https://www.homeaglow.com/help/182)
- AEO/GEO (the strongest of any site checked): a brand-query answer page (**/is-legit**), competitor comparison pages (**/vs/the-maids**: "The Maids Cleaning Service Reviews — Try Homeaglow Instead") — [vs The Maids](https://www.homeaglow.com/vs/the-maids). Also a cost explainer hub — [hub cost](https://www.homeaglow.com/hub/content/homeaglow-cost), a numbered Q&A help centre, programmatic city×service pages — [Buffalo moving cleaning](https://www.homeaglow.com/us/ny/buffalo/moving-cleaning/) — and gift cards — [gift cards](https://www.homeaglow.com/hub/gift-cards)
- **Scores:** Hero 4 (price-led offer + ZIP) · Booking 4 (self-serve, but cleaner approval adds latency) · Service 3 (membership terms are complex and conflicting) · Trust 3 · AEO/GEO 5 → **19/25**

**6. Handy (handy.com)** — marketplace, owned by ANGI Homeservices since 2018 — [IBJ](https://www.ibj.com/articles/70878-angi-homeservices-buying-handy-in-effort-to-dominate-home-renovations)
- Hero: "book in 60 seconds" with "top-rated local professionals" — [handy.com](https://www.handy.com/); "about 60 seconds to enter your details" — [Chicago](https://www.handy.com/services/home-cleaning/chicago)
- Status: the indexed homepage says booking on Handy.com "is no longer available" and sends users to the app — [handy.com](https://www.handy.com/), [app page](https://www.handy.com/app). That page's metadata was flagged as old, so this is **unconfirmed**. Angi began rebranding Handy as "Angi Services" in 2023 — [Wikipedia](https://en.wikipedia.org/wiki/Handy_(company))
- Trust: "Handy Happiness Guarantee", valid only when you book and pay through the platform — [handy.com](https://www.handy.com/)
- AEO/GEO: huge programmatic service×city and "near me" pages, including Toronto sub-areas — [Toronto York](https://www.handy.com/cleaning-services/toronto/york), [near me](https://www.handy.com/services/home-cleaning/near-me), plus a checklist page — [cleaning checklist](https://www.handy.com/cleaningchecklist)
- **Scores:** Hero 3 · Booking 3 (web booking status unclear) · Service 3 · Trust 3 · AEO/GEO 3 → **15/25**

**7. TIDY (tidy.com)** — US cleaning and property-ops platform
- Hero/title: "House Cleaning Service from $55" — [tidy.com house cleaning](https://www.tidy.com/services/house-cleaning)
- Booking: address → home size → preferences → date/time, "under 2 minutes". The total is shown before booking and no subscription is required — [house cleaning](https://www.tidy.com/services/house-cleaning). If no one is free today, the next available slot is shown — [same-day](https://www.tidy.com/services/same-day-cleaning)
- Positioning: "TIDY is a technology platform, not a cleaning company". You can request the same pro every visit or bring your own cleaner — [TIDY for homes](https://go.tidy.com/tidy-for-homes). It also sells property-management services — [services](https://www.tidy.com/services)
- AEO/GEO: programmatic `/locations/{city-state}/house-cleaning` pages — [Atlanta](https://www.tidy.com/locations/atlanta-ga/house-cleaning)
- **Scores:** Hero 4 (price in title) · Booking 4 · Service 3 · Trust 2 (vetting is set by the user, platform disclaimer) · AEO/GEO 4 → **17/25**

**Candidates checked but not usable:**
- **Two Maids**: two domain-restricted searches returned nothing (see Gaps).
- **Maidily** is **cleaning-business software**, not a cleaning company. It has a free plan (10 jobs/month), "Start" at $29/month and a $113/month tier — [Maidily pricing](https://www.maidily.com/pricing/), [maidily.com](https://www.maidily.com/). Its new "Maidily Sites" feature pulls services, prices and the booking page straight from the account — [What's New Sept 2026](https://www.maidily.com/whats-new/september-2026/). Its demo template shows the generic pattern Nest & Rest should avoid looking like: "Premium Residential Cleaning Service", a /book page, a /checklist page and "pay after cleaning" — [Maid to Glow template](https://maidtoglow-template.maidily.com/), [template checklist](https://maidtoglow-template.maidily.com/checklist)

#### Group B: Design-led and independent operators

**8. Maid Marines (maidmarines.com)** — NYC (and Philadelphia per Yelp) independent
- Hero/title: "Cleaning Services NYC — Flat-Rate Pricing, W-2 Cleaners". The value proposition sits in the page title — [maidmarines.com](https://maidmarines.com/cleaning-services-nyc)
- Booking: about 60 seconds, with steps for date, time, apartment size and price — [Manhattan](https://maidmarines.com/manhattan). Colorlib calls it a **Webflow** build with a "30-second booking flow" and neighbourhood-specific pages; this conflicts with the company's own "60 seconds" — [Colorlib](https://colorlib.com/wp/cleaning-company-websites/)
- Pricing: flat rate by bedrooms, bathrooms and square footage, "not your zip code" — [Bronx](https://maidmarines.com/bronx). Recurring discounts: 20% weekly, 15% bi-weekly, 10% monthly — [Flatlands](https://maidmarines.com/brooklyn/flatlands)
- Trust: "Everyone on our team is a W-2 employee, not an independent contractor… we carry full liability insurance… we can guarantee their work" — [Queens](https://maidmarines.com/queens). Yelp: 291 reviews (NYC listing, updated August 2026) — [Yelp](https://www.yelp.com/biz/maid-marines-cleaning-service-new-york-2)
- AEO/GEO: a borough → neighbourhood URL hierarchy (/brooklyn/flatlands, /brooklyn/sea-gate, /queens/bayswater) — [Sea Gate](https://maidmarines.com/brooklyn/sea-gate). Answer-first claims ("flat rate based on bedrooms and bathrooms. Not your zip code.") are easy for AI engines to quote.
- **Scores:** Hero 3 (content-only) · Booking 5 · Service 4 · Trust 4 (employment model used as proof) · AEO/GEO 4 → **20/25**

**9. Maid Sailors (maidsailors.com)** — NYC independent
- Hero/title: "Top-Rated Maid Services and Cleaning Company in NYC". The main page cites 700+ Google reviews — [maidsailors.com](https://maidsailors.com/)
- Booking: instant price from bedroom and bathroom count — [Manhattan](https://maidsailors.com/manhattan-house-cleaning-service/); ZIP plus apartment details — [Downtown](https://maidsailors.com/ny/downtown-manhattan-house-cleaning-service/). Then pick a service, add extras, see the price, choose a date and time; "booking takes just 60 seconds". Same-day slots are offered when open — [maidsailors.com](https://maidsailors.com/)
- Service/pricing: flat-rate and hourly options. Standard, deep, move-out, office and custom cleans. Recurring 20% weekly / 15% bi-weekly / 10% monthly, no contract. Available 7 days a week, 8am–10pm — [maidsailors.com](https://maidsailors.com/), [deep cleaning](https://maidsailors.com/services/deep-cleaning/). Neighbourhood titles carry prices ("Hudson Heights Maid Service For $90") — [Hudson Heights](https://maidsailors.com/ny/hudson-heights-house-cleaning-service/)
- Trust: free re-clean, bonded and insured, supplies included — [maidsailors.com](https://maidsailors.com/)
- Quality problems: neighbourhood pages say 400+ reviews while the homepage says 700+, and the Herald Square page mentions "Newark clients", a copy-paste error — [Herald Square](https://maidsailors.com/ny/herald-square-house-cleaning-service/)
- **Scores:** Hero 3 · Booking 5 · Service 4 · Trust 4 · AEO/GEO 3 (scale undermined by inconsistency) → **19/25**

**10. Sparkly Maid NYC (sparklymaidnyc.com)** — NYC independent
- Hero: homepage title "Cleaning Services NYC". The homepage shows **4.9 stars from 470+ Google reviews** and says every cleaner is "vetted, background checked and insured" — [sparklymaidnyc.com](https://www.sparklymaidnyc.com/)
- Pricing (a dated September 2026 price guide): standard clean $170 studio/1-bed, $220 2-bed, $270 3-bed. Deep clean is a flat +$75 ($245–$345). Add-ons such as inside oven or fridge are $60 each — [2026 NYC price guide](https://www.sparklymaidnyc.com/blog/apartment-cleaning-cost-nyc). Commercial move-out: $80/hr, 3-hour minimum — [move-out](https://www.sparklymaidnyc.com/move-out-cleaning). Older neighbourhood pages show conflicting prices — [Marble Hill](https://www.sparklymaidnyc.com/cleaning-services-marble-hill), [Meatpacking](https://www.sparklymaidnyc.com/cleaning-services-meatpacking-district)
- Booking: online booking shows available dates and times and sends reminders. Same-day service available — [one-time cleaning](https://www.sparklymaidnyc.com/one-time-cleaning)
- Trust: the same cleaner for recurring clients "whenever possible" — [homepage](https://www.sparklymaidnyc.com/). Guarantee windows are inconsistent: 48 hours — [Manhattan](https://www.sparklymaidnyc.com/manhattan); 72 hours — [apartment cleaning](https://www.sparklymaidnyc.com/apartment-cleaning). The Mount Vernon page contradicts the same-cleaner policy — [Mount Vernon](https://www.sparklymaidnyc.com/mount-vernon-1)
- AEO/GEO: a dated price guide, plus a self-published "Which NYC cleaning services have the highest customer ratings in 2025?" listicle aimed at AI and listicle queries — [blog](https://www.sparklymaidnyc.com/blog/which-nyc-cleaning-services-have-the-highest-customer-ratings-in-2025). Dozens of neighbourhood pages, and an adjacent service (home organization) — [organization](https://www.sparklymaidnyc.com/home-organization-services). Inferred Squarespace from the " — Brand" title pattern and the "-1" duplicate slug; not verified.
- **Scores:** Hero 3 · Booking 3 · Service 4 · Trust 4 · AEO/GEO 4 → **18/25**

**11. AspenClean (aspenclean.com)** — Vancouver-founded eco cleaning and products brand, now in the GTA
- Who: green cleaning service plus its own product line (e-commerce) — [cleaning kit](https://aspenclean.com/products/natural-whole-house-cleaning-kit-with-microfiber-cloths-and-superscrub). North York office at 801 York Mills Rd, claiming 10+ years of trust — [North York](https://aspenclean.com/pages/house-cleaning-maid-services-north-york). One page says it has been perfecting green cleaning "since 2004" — [why AspenClean](https://aspenclean.com/pages/why-aspen-clean-services). Shopify inferred from the `/pages/`, `/products/`, `/blogs/` URL structure.
- Booking/pricing: enter a postal code for an immediate online estimate. Billing is time-based: "the exact amount of time our teams clean your home, rounded to the nearest five minutes". Phone 1-855-925-9900 — [prices](https://aspenclean.com/pages/house-cleaning-prices). Same-day bookings may carry a surcharge — [Etobicoke](https://aspenclean.com/en-ca/pages/etobicoke-house-cleaning-maid-services)
- Trust: products are Ecocert certified with an EWG "A" rating. Supplies, including HEPA vacuums, are included — [Toronto](https://aspenclean.com/pages/toronto-house-cleaning-maid-services), [Vancouver](https://aspenclean.com/pages/vancouver-house-cleaning-maid-services). Issues reported within 24 hours are re-done free — [Markham](https://aspenclean.com/pages/markham-house-cleaning-maid-services). Cleaners are insured and bonded and rewarded via a "Pay for Performance Program" — [blog](https://aspenclean.com/blogs/cleaning-tips/5-things-to-look-for-when-looking-for-the-best-cleaning-service). Testimonials show first names or initials only.
- AEO/GEO: city pages across the GTA and BC (North York, Etobicoke, Thornhill, Markham, Richmond, Coquitlam) — [Thornhill](https://aspenclean.com/pages/thornhill-house-cleaning-maid-services)
- **Scores:** Hero 3 · Booking 4 · Service 4 · Trust 4 · AEO/GEO 3 → **18/25**

#### Group C: Toronto/GTA competitors (see the next sections for pricing detail)

**12. Hellamaid (hellamaid.ca)** — high-volume Toronto and Ontario operator. It ranked first in the generic "house cleaning service Toronto" search — [search result page](https://hellamaid.ca/toronto-housekeeping-services/)
- Hero: Instant Quote and upfront online pricing. CTAs "See My Price & Book" and "Call (647) 499-6243". A promo code (FALL10, 10% off) appeared on the site — [Toronto](https://hellamaid.ca/house-cleaning-service-toronto/)
- Booking: enter city, bedrooms, bathrooms and cleaning type, and the "exact price is shown before you book" — [cleaning service](https://hellamaid.ca/cleaning-service/). Then add extras (fridge, oven, cabinets) and pick a date and time. The card is pre-authorised at booking and "only processed after your cleaning has been completed". Free reschedule or cancel with 24 hours' notice; a $45 late fee inside 24 hours — [FAQ](https://hellamaid.ca/frequently-asked-questions/). A guide page is titled "Book a Cleaning with Hellamaid in 60 Seconds!" — [guide](https://hellamaid.ca/cleaning-guide/how-to-find-the-best-professional-house-cleaning-services-in-ontario/)
- Services: regular (weekly, bi-weekly, monthly), deep, move, condo, seniors, green, post-reno and spring pages — [recurring](https://hellamaid.ca/weekly-bi-weekly-monthly-cleaning-services/), [seniors](https://hellamaid.ca/cleaning-services-for-seniors/), [green](https://hellamaid.ca/green-and-eco-friendly-cleaning-service/), [post-reno](https://hellamaid.ca/post-renovation-cleaning/)
- Trust: 4.9 Google rating, "400+ reviews". The page's structured data reads "4.9 ★ · 428 Google Reviews" — [Toronto](https://hellamaid.ca/house-cleaning-service-toronto/). The reviews page gives a *different* aggregate (4.8, 4,000 reviews) — [reviews](https://hellamaid.ca/reviews/). An older New Toronto page shows 4.4/89 and $55/hr — [New Toronto](https://hellamaid.ca/house-cleaning-service-etobicoke/new-toronto/). Cleaners described as insured, trained and background-checked; satisfaction guarantee; supplies included — [North York](https://www.hellamaid.ca/house-cleaning-service-north-york/)
- AEO/GEO: neighbourhood pages (e.g. Downsview) — [Downsview](https://hellamaid.ca/house-cleaning-service-north-york/downsview). Titles include "(with Price)". A "House Cleaning Rates in Ontario: 2026 Price Guide" — [price guide](https://hellamaid.ca/cleaning-guide/house-cleaners-charge-per-hour-in-ontario-factors-and-costs/). Rating markup is present. WordPress inferred from `?p=` URLs.
- **Scores:** Hero 4 · Booking 5 · Service 5 · Trust 4 (conflicting aggregates) · AEO/GEO 4 (rich but inconsistent data) → **22/25**

**13. Clean Proper (cleanproper.ca)** — Toronto and GTA "healthy-home cleaning" company — [about](https://cleanproper.ca/about/)
- Hero/home: homepage title "House Cleaning in Toronto & the GTA". Cites "4.9 rating from 227 reviews on Google". Three steps: "Request a quote — Tell us about your home in under a minute. No obligation, no pushy sales" → confirm (a cleaner is matched with a time) → enjoy — [cleanproper.ca](https://cleanproper.ca/)
- Booking: quote-first ("Get a Free Cleaning Quote"), no instant price — [quote page](https://cleanproper.ca/book-cleaning-now). Pricing depends on size, condition and frequency — [FAQ](https://cleanproper.ca/faq/)
- Services: books "by session rather than a fixed checklist" — [services](https://cleanproper.ca/services/). The deep-clean page lists tasks: inside appliances, grout, baseboards, vents — [deep cleaning](https://cleanproper.ca/services/deep-cleaning/). Also post-reno — [post-reno](https://cleanproper.ca/services/post-renovation-cleaning/) — and commercial — [commercial](https://cleanproper.ca/commercial/)
- Trust: $2,000,000 liability insurance, background-checked and trained cleaners, a consistent cleaner "where possible" — [FAQ](https://cleanproper.ca/faq/). The service agreement is public: supplies and eco products included, HST extra, $75 fee under 24 hours' notice, 50% under 2 hours — [service agreement](https://cleanproper.ca/service-agreement/). Has a Trustpilot profile — [Trustpilot](https://ca.trustpilot.com/review/cleanproper.ca)
- AEO/GEO: deep location tree, e.g. North York → Willowdale and Toronto → Midtown — [Willowdale](https://cleanproper.ca/locations/north-york/willowdale/), [Midtown](https://cleanproper.ca/locations/toronto/midtown-toronto/). Hyper-local copy, such as Etobicoke's lakeside towers with "concierge and fob systems… share your building's check-in details once" — [Etobicoke](https://cleanproper.ca/locations/etobicoke/)
- **Scores:** Hero 3 · Booking 3 · Service 3 · Trust 4 · AEO/GEO 4 → **17/25**

**14. Maid4Condos (maid4condos.com)** — Toronto condo specialist
- Pricing and packages: Basic from $119.99, Basic Plus $149.99, Deep $169.99, Move-in/out $249.99 — [basic](https://www.maid4condos.com/cleaning-types/basic-clean/), [basic plus](https://www.maid4condos.com/cleaning-types/basic-plus/), [deep](https://www.maid4condos.com/cleaning-types/deep-clean/), [move](https://www.maid4condos.com/cleaning-types/move-inout-clean/). Older pages conflict: $89 basic and $129 deep in a 2022 post — [2022 post](https://www.maid4condos.com/maid4condos-torontos-most-trusted-premiere-condo-cleaners/); $70–119 in the promotion archive — [promotions](https://www.maid4condos.com/category/promotion/)
- Booking: an online calculator by bedrooms, bathrooms and square footage gives a quote "on the spot" — [deep](https://www.maid4condos.com/cleaning-types/deep-clean/). "Autopilot" gives up to 20% off for weekly or bi-weekly — [frequency](https://www.maid4condos.com/frequency-cleaning/). Phone (647) 822-0601.
- WordPress inferred (`/wordpress/careers/`) — [careers](https://www.maid4condos.com/wordpress/careers/)
- **Scores:** Hero 3 · Booking 4 · Service 4 (tiered packages) · Trust 2 (only self-claims surfaced) · AEO/GEO 3 (stale prices compete with current ones) → **16/25**

**15. Mopify (mopify.com)** — Toronto-born hourly cleaning marketplace
- Title: "Mopify: a modern approach to house cleaning." — [pricing](https://mopify.com/pricing)
- Pricing: $39/hr + tax monthly, $37/hr weekly or bi-weekly, $50/hr one-time, with a surcharge if Mopify brings supplies — [pricing](https://mopify.com/pricing). The city page says "rates start at $38/hr" but also shows a $30/$25/$27.50 block with a footnote "price dependent upon your city's rates". An old roundup quotes $31/hr — [Toronto](https://mopify.com/cities/toronto), [Mastermaid roundup](https://mastermaid.ca/top-residential-cleaning-services-toronto/)
- Booking/payment: billed hourly to the nearest 15 minutes for actual time worked, and not until the work is complete; "connected with one of our trusted and vetted Toronto cleaners" — [Toronto](https://mopify.com/cities/toronto). Serves Toronto, Peel and York.
- **Scores:** Hero 3 · Booking 4 · Service 3 · Trust 2 · AEO/GEO 2 (conflicting rates on one page) → **14/25**

**16. Custom Maids Toronto (custommaidstoronto.com)** — long-running GTA operator
- Positioning: in business "since 1978". One dedicated cleaner returns every visit — [Scarborough](https://www.custommaidstoronto.com/cleaning-service-scarborough). Cleaners are employed directly, screened, bonded, and covered by liability insurance and WSIB — [home](https://www.custommaidstoronto.com/)
- Pricing (HST-inclusive rate card by size and hours): condos from $180 (3 hours) up to $360; houses up to 1,600 sq ft from $240 (4 hours) up to $480 (8 hours, over 3,000 sq ft); move-in/out $240–$600; deep clean by personalised quote — [services & costs](https://www.custommaidstoronto.com/services-costs). The Scarborough page shows lower figures ($150 small condo, $200 standard house), which conflict — [Scarborough](https://www.custommaidstoronto.com/cleaning-service-scarborough)
- AEO/GEO: "How Much Do Cleaning Services Cost in Toronto? 2026 Price Guide" ($40–$90 per cleaner-hour market range) — [price guide](https://www.custommaidstoronto.com/post/how-much-do-cleaning-services-cost-in-toronto-2026-price-guide). Airbnb page — [Airbnb](https://www.custommaidstoronto.com/airbnb-cleaning-services). Area pages (Scarborough, Etobicoke). Wix weakly inferred from the `/post/` blog path.
- **Scores:** Hero 2 (low confidence) · Booking 2 (no instant booking found) · Service 4 · Trust 4 · AEO/GEO 4 → **16/25**

#### Score summary (verifiable dimensions only; Visual, Motion/Type and Mobile = NV for all)

| Rank | Site | Group | Hero | Booking | Service info | Trust | AEO/GEO | Total /25 |
|---|---|---|---|---|---|---|---|---|
| 1 | Hellamaid | C (Toronto) | 4 | 5 | 5 | 4 | 4 | **22** |
| 2 | Maid Marines | B (NYC) | 3 | 5 | 4 | 4 | 4 | **20** |
| 3 | Homeaglow | A (marketplace) | 4 | 4 | 3 | 3 | 5 | **19** |
| 3 | Maid Sailors | B (NYC) | 3 | 5 | 4 | 4 | 3 | **19** |
| 5 | Sparkly Maid NYC | B (NYC) | 3 | 3 | 4 | 4 | 4 | **18** |
| 5 | AspenClean | B (Vancouver/GTA) | 3 | 4 | 4 | 4 | 3 | **18** |
| 7 | TIDY | A (platform) | 4 | 4 | 3 | 2 | 4 | **17** |
| 7 | Clean Proper | C (Toronto) | 3 | 3 | 3 | 4 | 4 | **17** |
| 9 | The Maids | A (franchise) | 2 | 3 | 4 | 4 | 3 | **16** |
| 9 | Maid4Condos | C (Toronto) | 3 | 4 | 4 | 2 | 3 | **16** |
| 9 | Custom Maids | C (Toronto) | 2 | 2 | 4 | 4 | 4 | **16** |
| 12 | Handy | A (marketplace) | 3 | 3 | 3 | 3 | 3 | **15** |
| 13 | Molly Maid | A (franchise) | 2 | 2 | 3 | 4 | 3 | **14** |
| 13 | Merry Maids | A (franchise) | 2 | 2 | 3 | 4 | 3 | **14** |
| 13 | MaidPro | A (franchise) | 2 | 2 | 4 | 3 | 3 | **14** |
| 13 | Mopify | C (Toronto) | 3 | 4 | 3 | 2 | 2 | **14** |

**Dimension leaders (verifiable):**
- **Booking:** Hellamaid, Maid Marines, Maid Sailors (instant price from bedrooms and bathrooms, then date and time).
- **Service info:** Hellamaid (public hourly, package and extras pricing); The Maids and MaidPro (named systems).
- **Trust:** franchises plus Maid Marines (W-2 employees) and Custom Maids (since 1978, one dedicated cleaner, WSIB).
- **AEO/GEO:** Homeaglow (/is-legit, /vs/ comparison pages, help-centre Q&A).

**What the design roundups said** (articles could not be opened; search extracts only):
- The Cleaning Authority uses a homepage video background of real employees cleaning — [Webcitz](https://www.webcitz.com/blog/best-cleaning-websites/)
- Before/after galleries are the most compelling proof of quality (example: Streamline Services). Karen's Green Cleaning uses a spa-inspired palette. Lemon House and Maid Marines are one-page booking-first sites — [Colorlib](https://colorlib.com/wp/cleaning-company-websites/)
- Herb'n Living uses muted earth tones and botanical imagery — [Comradeweb](https://comradeweb.com/blog/best-cleaning-websites/)
- Alpine Maids shows its hiring and training process — [Dorik](https://dorik.com/blog/cleaning-services-website-examples)
- Awwwards' "cleaning" tag shows mainly a template nominee (Sept 5, 2023), not real operators — [Awwwards](https://www.awwwards.com/sites/cleaning). In other words, there is no Awwwards-recognised North American cleaning operator site to benchmark against.

### Inferences

**Ranked shortlist: the 5 strongest North American sites, with borrowable patterns** (patterns only, not their branding, copy or artwork; ranking is provisional until a visual and motion pass):
1. **Hellamaid (Toronto)**: the local benchmark to beat.
   - Price-in-hero CTA ("see my price") leading straight into a bedrooms/bathrooms/type calculator.
   - A public extras price list (inside fridge, oven, cabinets).
   - **Card pre-authorised, charged after the clean.** This lowers first-booking risk.
   - A clear 24-hour change policy with a modest late fee.
   - A dated annual "price guide" page that AI engines can cite.
   - Neighbourhood pages with prices in the title.
   - *Do better than them on:* one consistent rating figure everywhere, prices that include tax, and craft.
2. **Maid Marines (NYC)**:
   - Put the differentiator in the title tag and H1 (flat rate + employed cleaners). For Nest & Rest the equivalent is "owner-operated, same cleaner, flat price".
   - State pricing logic as one quotable sentence ("priced by bedrooms and bathrooms, not postcode").
   - Publish the recurring discount ladder (20/15/10).
   - Use a borough → neighbourhood URL hierarchy (for Toronto: Scarborough → Agincourt, Malvern, Guildwood…; North York → Willowdale, Don Mills, Bayview Village…).
   - Booking in about 60 seconds.
3. **Homeaglow (US)**:
   - AEO architecture: an "is it legit / is it worth it" answer page, comparison pages ("Nest & Rest vs a franchise" / "vs a marketplace"), a numbered Q&A help centre, and a cost explainer.
   - A gift-card hub page.
   - Avoid the confusing membership fine print and conflicting review counts, which hurt trust.
4. **Maid Sailors (NYC)**:
   - Two entry modes into one calculator (bedrooms/bathrooms *or* postcode + home details).
   - Hours of availability and same-day availability stated up front.
   - Supplies-included and free re-clean claims grouped together.
   - Lesson from their mistakes: templated neighbourhood pages with copy-paste errors ("Newark clients") and mismatched review counts are a liability. Write each local page by hand.
5. **Sparkly Maid NYC**:
   - A simple, memorable flat price ladder by bedroom count, plus one flat deep-clean upcharge and flat add-ons.
   - A dated price guide ("accurate as of September 2026").
   - The review count prominent on the homepage.
   - A same-cleaner promise for recurring clients.
   - Lesson: keep the guarantee window identical on every page (they vary between 48 and 72 hours).
- *Alternate:* **AspenClean** for a Canadian eco-premium brand: certified-product proof (Ecocert/EWG), "billed to the nearest 5 minutes" honesty, and postal-code-first estimates.

**Cross-cutting inferences:**
- Franchise sites (Molly Maid, Merry Maids, MaidPro) still route visitors to in-home or virtual estimates. That leaves room for a premium independent to win on immediacy without giving up trust.
- Several leaders publish *dated* price guides (Hellamaid, Sparkly Maid, Custom Maids). This looks like a deliberate GEO tactic: AI answers to "how much does house cleaning cost in Toronto" need a citable, current number.
- Data inconsistency is the most common weakness across sites (review counts, guarantee windows, stale prices). For AEO this is a real risk, because AI engines can quote the stale figure.

### Gaps
- **Visual distinctiveness, typography (typefaces), colour palettes, motion libraries (GSAP/Lenis/Lottie/Rive/Framer/Webflow IX), mobile behaviour, JSON-LD types and llms.txt presence could not be checked for any site.** Live access was denied by the session's network policy (listed above). The only structured-data evidence is the Hellamaid rating markup noted in search extracts. To complete rubric dimensions 1, 6 and 7, allow the hosts and re-run `/tmp/claude-0/-home-user-nestnrestcleaning/67aecbd2-25bd-57d0-a71b-323079773156/scratchpad/na_sites/scripts/crawl.js`.
- Exact H1/subhead text and homepage section order were not available for most sites. Search extracts give page titles and CTAs, not full DOM order.
- Two Maids, MyClean and Spruce (getspruce.com) returned no usable data. Two Maids' "pay for performance" model could not be documented.
- Whether Handy.com still allows web booking (versus app-only under Angi Services) is unconfirmed.
- No redesign or shutdown dates could be confirmed for any site. The Molly Maid US snapshot was about 248 days old.

## What hero patterns and booking flows convert best in this category (instant pricing, ZIP/postal-code-first, 60-second booking)?

### Takeaway
The category has three hero/booking archetypes:
- **(a) price-calculator-first:** bedrooms/bathrooms → instant price → date and time → card held, charged after (Hellamaid, Maid Sailors, Maid Marines, Maid4Condos, TIDY);
- **(b) postcode-first:** coverage check or estimate (Molly Maid locator, Homeaglow, AspenClean);
- **(c) estimate-request:** franchises.

"60 seconds" or "under 2 minutes" is now table stakes as a claim. I found **no reliable published conversion data** comparing these patterns, so any statement about what converts best is an inference from what the market leaders converge on.

### Cited Findings
- Bedrooms/bathrooms → exact price before booking, then extras and date/time; card pre-authorised, charged after completion — [Hellamaid cleaning service](https://hellamaid.ca/cleaning-service/), [Hellamaid FAQ](https://hellamaid.ca/frequently-asked-questions/)
- Enter bedrooms/bathrooms for a price (Manhattan) or ZIP + apartment details (Downtown); pick service → extras → price → date/time; "booking takes just 60 seconds"; same-day when available — [Maid Sailors Manhattan](https://maidsailors.com/manhattan-house-cleaning-service/), [Maid Sailors Downtown](https://maidsailors.com/ny/downtown-manhattan-house-cleaning-service/), [Maid Sailors](https://maidsailors.com/)
- Date, time, apartment size, price; "about 60 seconds" — [Maid Marines Manhattan](https://maidmarines.com/manhattan). Colorlib reports a "30-second booking flow" on the Webflow build, which conflicts with the company's own figure — [Colorlib](https://colorlib.com/wp/cleaning-company-websites/)
- Address → home size → preferences → date/time, "under 2 minutes", total before booking, no subscription; next available slot shown when no one is free today — [TIDY](https://www.tidy.com/services/house-cleaning), [TIDY same-day](https://www.tidy.com/services/same-day-cleaning)
- Postal code → "immediate estimate"; billed to the nearest 5 minutes of actual time — [AspenClean prices](https://aspenclean.com/pages/house-cleaning-prices). Mopify bills to the nearest 15 minutes, after completion — [Mopify Toronto](https://mopify.com/cities/toronto)
- ZIP coverage check → address/date/time/hours → choose a cleaner profile → the cleaner approves the request — [Homeaglow booking help](https://www.homeaglow.com/help/3), [try.homeaglow.com](https://try.homeaglow.com/)
- Price-led acquisition offers: "$19 first month then $59/mo" membership; ad variants at "$19" and "$0" — [Homeaglow](https://www.homeaglow.com/), [$0 deal](https://try.homeaglow.com/deal/fcf?amp=)
- Franchise heroes: "Call for a Free Estimate!", "Request a free estimate now!", "Find a Molly Maid Near Me" ZIP field — [Molly Maid](https://www.mollymaid.com/); "free in-home or virtual estimates" — [Merry Maids McKinney](https://merrymaids.com/home-cleaners-mckinney-tx); in-home estimate walkthrough — [Molly Maid Canada](https://mollymaid.ca/in-home-estimates/)
- Quote-first local alternative: "Tell us about your home in under a minute. No obligation, no pushy sales", then matching to a cleaner and time — [Clean Proper](https://cleanproper.ca/)
- "Book in 60 seconds" as a hero promise — [Handy](https://www.handy.com/); "Book a Cleaning with Hellamaid in 60 Seconds!" — [Hellamaid guide](https://hellamaid.ca/cleaning-guide/how-to-find-the-best-professional-house-cleaning-services-in-ontario/)
- "Pay after cleaning" is offered even in generic booking-software templates — [Maidily template](https://maidtoglow-template.maidily.com/)
- Video hero of real employees cleaning, cited as a credibility device — [Webcitz](https://www.webcitz.com/blog/best-cleaning-websites/)

### Inferences
- The best-performing independents converge on: price visible or one click away in the hero → 2–4 inputs (bedrooms, bathrooms, type, optional postcode) → instant price → extras → slot picker → card held, charged after. For Nest & Rest, a **postcode check that confirms Scarborough/North York coverage inside the calculator** (rather than as a gate) combines the trust of archetype (b) with the speed of archetype (a).
- "Pay after the clean" plus "free changes up to 24 hours" is a low-cost risk reverser that local leaders already use. Matching it is necessary, and it is not a differentiator on its own.
- Because "60 seconds" is a common claim, Nest & Rest's differentiator needs to sit elsewhere: owner-operated, same cleaner, HST-inclusive total, and a visible scope checklist at the price step.
- Marketplace patterns (choosing a cleaner, cleaner approval before confirmation) add latency and uncertainty. An owner-operated business can promise *instant confirmation with a named owner/cleaner*, which marketplaces structurally cannot.

### Gaps
- No primary conversion-rate data (A/B tests or benchmarks) was found for instant-price vs quote-form vs postcode-first flows in residential cleaning.
- Number of fields, account creation requirements and slot-picker UI could not be verified by walking through any live flow (hosts blocked). Whether accounts are required is unknown for all sites except Homeaglow (membership) and TIDY (platform).

## How do the best sites present service scope and pricing?

### Takeaway
Leaders use one of three pricing presentations:
- **flat ladders by bedroom count with flat add-ons** (Sparkly Maid, Maid Marines, Maid Sailors, Maid4Condos);
- **transparent hourly pricing with minimums** (Hellamaid $59/cleaner-hr, Mopify, AspenClean time-billing);
- **an HST-inclusive rate card by home size and hours** (Custom Maids).

Franchises substitute **named process systems** (The Maids' 22-Step, MaidPro's 49-Point) for prices. Explicit room-by-room scope tables with comparisons were rarely visible in the evidence. Clean Proper explicitly has *no* fixed checklist.

### Cited Findings
- Flat ladder: $170 studio/1-bed, $220 2-bed, $270 3-bed; deep +$75; add-ons $60; "accurate as of September 2026" — [Sparkly Maid NYC price guide](https://www.sparklymaidnyc.com/blog/apartment-cleaning-cost-nyc)
- Flat rate by bedrooms, bathrooms and square footage, "not your zip code"; recurring 20/15/10% — [Maid Marines Bronx](https://maidmarines.com/bronx), [Maid Marines Flatlands](https://maidmarines.com/brooklyn/flatlands)
- Tiered named packages (Basic $119.99 / Basic Plus $149.99 / Deep $169.99 / Move $249.99) — [Maid4Condos basic](https://www.maid4condos.com/cleaning-types/basic-clean/), [basic plus](https://www.maid4condos.com/cleaning-types/basic-plus/), [deep](https://www.maid4condos.com/cleaning-types/deep-clean/), [move](https://www.maid4condos.com/cleaning-types/move-inout-clean/)
- Hourly plus packages: $59/cleaner/hr with a 3-hour minimum and 1–4 cleaners; package base $99 + home adjustments + 13% HST; deep +$99, move +$159 — [Hellamaid Toronto](https://hellamaid.ca/house-cleaning-service-toronto/). Extras: fridge +$29, oven +$29, cabinets +$39 — [Hellamaid recurring](https://hellamaid.ca/weekly-bi-weekly-monthly-cleaning-services/)
- HST-inclusive rate card by size and hours (condo $180/3h … house $480/8h; move $240–$600) — [Custom Maids services & costs](https://www.custommaidstoronto.com/services-costs)
- Hourly by frequency: $37–$50/hr + tax; supplies surcharge — [Mopify pricing](https://mopify.com/pricing)
- Time-based billing to the nearest 5 minutes — [AspenClean prices](https://aspenclean.com/pages/house-cleaning-prices)
- Named systems instead of prices: "22-Step Healthy Touch Deep Cleaning System", room-by-room deep-clean description, HEPA claim — [The Maids services](https://www.maids.com/services/), [The Maids deep cleaning](https://www.maids.com/services/deep-cleaning-services/); "49-Point Checklist" + "PRO Promise" — [MaidPro LA](https://www.maidpro.com/dtla/estimate); "Our Cleaning Process" page — [Merry Maids](https://merrymaids.com/our-process)
- Pricing factors listed instead of prices (size, rooms, condition, service type, frequency, add-ons) — [Merry Maids Columbus](https://www.merrymaids.com/columbus/cleaning-services/)
- No fixed checklist; "we book by session… prioritise what matters most to you"; the deep-clean page lists task examples — [Clean Proper services](https://cleanproper.ca/services/), [Clean Proper deep](https://cleanproper.ca/services/deep-cleaning/)
- Checklist pages as standalone assets — [Handy cleaning checklist](https://www.handy.com/cleaningchecklist), [Maidily template checklist](https://maidtoglow-template.maidily.com/checklist)
- Dated price guides used as content: Ontario 2026 — [Hellamaid](https://hellamaid.ca/cleaning-guide/house-cleaners-charge-per-hour-in-ontario-factors-and-costs/); Toronto 2026 ($40–$90 per cleaner-hour range) — [Custom Maids](https://www.custommaidstoronto.com/post/how-much-do-cleaning-services-cost-in-toronto-2026-price-guide); NYC 2026 — [Sparkly Maid](https://www.sparklymaidnyc.com/blog/apartment-cleaning-cost-nyc)
- Cost explainer and comparison pages — [Homeaglow cost](https://www.homeaglow.com/hub/content/homeaglow-cost), [Homeaglow vs The Maids](https://www.homeaglow.com/vs/the-maids)
- Public terms page (supplies included, HST extra, cancellation fees) — [Clean Proper service agreement](https://cleanproper.ca/service-agreement/)

### Inferences
- The strongest presentation for Nest & Rest's service mix:
  - a **flat "from" ladder by home size** (studio/1-bed condo → 4+ bed house, where "Residence Care" is the large-home tier);
  - **one flat upcharge each** for deep and move-in/out;
  - **a short flat-priced add-on list**;
  - **HST-inclusive totals** (only Custom Maids does this locally);
  - **a room-by-room scope matrix comparing Regular / Deep / Move** (no local competitor surfaced one).
- Pair the ladder with a dated "Scarborough & North York cleaning prices (2026)" guide page and a consistent `priceRange`/`Offer` schema, so AI engines quote the current number rather than a stale one.
- Named systems (22-Step, 49-Point) show that a *branded* scope device builds perceived rigour. An owner-operated equivalent could be a named, published checklist.

### Gaps
- No site's checklist or comparison-table *layout* (accordion, tabs, interactive room map) could be seen, because pages were not rendered.
- Whether any competitor uses Offer/PriceSpecification/FAQPage schema could not be checked.

## What do Toronto/GTA competitors charge and claim, and where are they weak?

### Takeaway
Toronto pricing clusters at roughly **$37–$59 per cleaner-hour** (before HST), or **about $120–$280 for a 1-bedroom standard or deep clean**. HST-inclusive house cleans run **$240–$480** (Custom Maids). Hellamaid dominates search and booking UX. Clean Proper leads on neighbourhood depth and terms transparency. Custom Maids owns "same dedicated cleaner since 1978". The franchises (Molly Maid, The Maids, Merry Maids, The Cleaning Authority) hold Scarborough and North York addresses but rely on estimate forms. Common weaknesses: inconsistent or stale prices and review counts, quote-only flows, generic WordPress/template craft, thin Scarborough-specific content, and no visible room-by-room scope.

### Cited Findings
**Prices and claims**
- **Hellamaid**: $59/cleaner/hr, 3-hour minimum; packages from a $99 base + adjustments + 13% HST (e.g. from $188 before HST for a 1-bed/1-bath); deep +$99; move +$159; 4.9 Google 400+ — [Hellamaid Toronto](https://hellamaid.ca/house-cleaning-service-toronto/). 1-bed standard "from $178 + tax", deep "from $277", "final price confirmed at checkout" (search extract across booking pages) — [Hellamaid deep](https://hellamaid.ca/deep-cleaning/). $45 late-change fee inside 24 hours — [FAQ](https://hellamaid.ca/frequently-asked-questions/)
- **Clean Proper**: custom quotes only; $2M liability; 4.9 from 227 Google reviews; $75 / 50% cancellation fees — [home](https://cleanproper.ca/), [FAQ](https://cleanproper.ca/faq/), [agreement](https://cleanproper.ca/service-agreement/)
- **Maid4Condos**: $119.99–$249.99 package starting prices; up to 20% off recurring — [frequency](https://www.maid4condos.com/frequency-cleaning/), [move](https://www.maid4condos.com/cleaning-types/move-inout-clean/)
- **Mopify**: $37–$50/hr + tax; billed after, per 15 minutes — [pricing](https://mopify.com/pricing), [Toronto](https://mopify.com/cities/toronto)
- **Custom Maids**: HST-inclusive, from $180 (condo, 3h) and $240 (house, 4h); since 1978; one dedicated cleaner; employed, bonded, WSIB — [services & costs](https://www.custommaidstoronto.com/services-costs), [Scarborough](https://www.custommaidstoronto.com/cleaning-service-scarborough)
- **AspenClean**: postal-code estimate; time-billed; Ecocert/EWG; North York office, 801 York Mills Rd — [prices](https://aspenclean.com/pages/house-cleaning-prices), [North York](https://aspenclean.com/pages/house-cleaning-maid-services-north-york)
- **Franchises in the trade area**:
  - The Maids: Scarborough and Scarborough–West Hill pages, 24-hour re-clean guarantee — [The Maids Scarborough](https://www.maids.com/on/scarborough/)
  - Merry Maids of Scarborough: 515 Milner Ave — [Merry Maids Scarborough](https://merrymaids.ca/home-cleaners-scarborough-on)
  - The Cleaning Authority: Scarborough office at 151 Nashdene Rd — [The Cleaning Authority](https://www.thecleaningauthority.ca/markham/)
  - Molly Maid: North York and Toronto North pages; no Scarborough page found — [Molly Maid North York](https://mollymaid.ca/locations/on/north-york/), [all locations](https://mollymaid.ca/all-locations/)
- **Other Scarborough players**:
  - Hire A Maid: Canadian-owned since 2008, WSIB-covered staff — [Hire A Maid Scarborough](https://hireamaid.ca/toronto/house-cleaning-company/scarborough/)
  - PureMaids: open 7 days, 8am–9pm — [PureMaids Scarborough](https://puremaids.ca/locations/scarborough-housekeeping)
  - Budget Maid — [Budget Maid](https://budgetmaid.ca/)
- **HomeStars**: Toronto cleaning listings show "Best of Awards 2026" badges, e.g. Squeaky Cleaning and Maple Leaf Residential Cleaners. No official 2026 "Best of the Best" Toronto house-cleaning winner list was found — [HomeStars Toronto cleaning](https://www.homestars.com/cleaning/cleaning-company-pros/toronto?page=2)

**Weaknesses (sourced)**
- Hellamaid: conflicting rating aggregates (4.9/428 vs 4.8/4,000) and stale neighbourhood pages ($55/hr, 4.4/89) — [reviews](https://hellamaid.ca/reviews/), [New Toronto](https://hellamaid.ca/house-cleaning-service-etobicoke/new-toronto/)
- Maid4Condos: current pages ($119.99) compete with old ones ($89; $70–119) — [2022 post](https://www.maid4condos.com/maid4condos-torontos-most-trusted-premiere-condo-cleaners/), [promotions](https://www.maid4condos.com/category/promotion/)
- Mopify: the same city page advertises "$38/hr" and a $25–$30 block; third parties still cite $31 — [Toronto](https://mopify.com/cities/toronto), [Mastermaid](https://mastermaid.ca/top-residential-cleaning-services-toronto/)
- Custom Maids: Scarborough page prices ($150/$200) conflict with the rate card ($180/$240) — [Scarborough](https://www.custommaidstoronto.com/cleaning-service-scarborough), [services & costs](https://www.custommaidstoronto.com/services-costs)
- Clean Proper: no instant price and no fixed checklist — [services](https://cleanproper.ca/services/), [quote](https://cleanproper.ca/book-cleaning-now)
- Molly Maid Canada: North York page shows a (905) number; no Scarborough page — [North York](https://mollymaid.ca/locations/on/north-york/)

### Inferences
**Toronto competitive gap: what no local competitor does well that Nest & Rest could own**
1. **Premium craft plus instant price.** Hellamaid has the instant price but a high-volume, multi-city WordPress feel (inferred). Clean Proper has a calmer "healthy-home" voice but makes you request a quote. No one combines a distinctive, animated, editorial brand with a 60-second, HST-inclusive instant price.
2. **Owner-operated, same-cleaner trust told visually.** Only Custom Maids states a one-dedicated-cleaner model; Clean Proper offers it "where possible". A named owner and team with faces, plus "the same cleaner every visit" as a hero-level promise, is open ground.
3. **Scarborough depth.** Molly Maid has no Scarborough page. Franchises run thin franchise pages. Hellamaid's depth is in North York and Etobicoke. Hand-written neighbourhood pages that mention local housing types (Agincourt and Malvern townhomes, Guildwood and Scarborough Bluffs detached homes, condo towers near Scarborough Town Centre and North York Centre, with concierge/fob details as Clean Proper does for Etobicoke) are unclaimed territory.
4. **Room-by-room scope comparison.** No local competitor surfaced an interactive Regular / Deep / Move / Kitchen & Bath scope matrix. Clean Proper explicitly avoids checklists.
5. **One consistent source of truth for AEO.** Every local competitor shows conflicting prices or review counts across pages. Nest & Rest can own AI-answer accuracy:
   - one dated price page;
   - identical review count and guarantee wording everywhere;
   - an FAQ phrased the way people ask AI assistants;
   - comparison pages ("owner-operated vs franchise vs marketplace" — Homeaglow's /vs/ pattern used honestly).
6. **Niche B2B landing pages.** Only Custom Maids surfaced an Airbnb page, and no realtor/landlord-specific or gift-card page turned up for Toronto independents. Homeaglow has a gift-card hub — [Homeaglow gift cards](https://www.homeaglow.com/hub/gift-cards). Nest & Rest's Airbnb turnover, realtor/landlord clean, office and gift-card offers could each get a dedicated, schema-marked landing page.
7. **HST-inclusive totals.** Only Custom Maids publishes tax-inclusive prices. Most others quote "+ tax/HST". Showing the final number is a simple, ownable trust signal.

### Gaps
- Google Maps and local-pack rankings for "cleaning service Scarborough" and "North York cleaners" could not be observed directly. The search tool is US-based and returned HomeStars directory pages for Scarborough queries, so actual Toronto organic and map rankings are unverified.
- HomeStars and Google review counts for Clean Proper, Maid4Condos, Mopify and Custom Maids were not independently verified (only self-reported figures were found).
- Toronto competitor typography, motion, mobile UX and schema were not inspected (hosts blocked).
- Not checked: Toronto Shine Cleaning, Tootsweet Cleaning, Squeaky Cleaning, Maret's Cleaning and PureMaids (named in results but not profiled).
