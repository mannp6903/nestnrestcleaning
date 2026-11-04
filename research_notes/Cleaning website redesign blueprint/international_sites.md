# International cleaning websites (UK, Europe, Australia/NZ, Middle East, Asia): analysis and rubric scores

## Which international cleaning sites are strongest on each rubric dimension, and why?

### Takeaway
I could not inspect the live sites. In this session the network policy blocked every candidate domain (Playwright, curl and WebFetch all failed), and the web-search budget shared by all agents ran out after four searches. So nothing in this file comes from live inspection in November 2026: no hero copy, section order, booking steps, JSON-LD, fonts or motion libraries. The scores below are provisional. They come from my training knowledge, which runs to mid-2026, and must be re-checked before the final top-10 is chosen. The verified findings are few: India's instant-help apps (Snabbit, Pronto, Urban Company Insta Help), Whizz (Australia) and CaSy (Japan) exist and are current, and a search turned up no Awwwards-recognised cleaning site.

### Cited Findings
**How the research went (verified in this session)**
- Every site below failed at the network level: the egress proxy refused them (HTTP 403 on CONNECT) and WebFetch could not resolve them ("outside the session's allowed network domains"). The failed hosts were www.fantasticservices.com, housekeep.com, www.helpling.de, www.helpling.co.uk, batmaid.ch, www.justlife.com, www.urbancompany.com, www.absolutedomestics.com.au, www.jimscleaning.com.au, www.whizz.com.au, www.sendhelper.com, casy.co.jp, www.happy-bears.com, miso.kr, www.wecasa.fr, www.hemfrid.se, www.withpronto.com, www.snabbit.com, www.matic.ae, www.fantasticcleaners.com.au, happyhelper.dk and www.clintu.es. The WebSearch budget (200 calls per turn, shared by all agents) ran out after four searches. These are tool results from this session, so there is no URL to cite.
- A Playwright scanner is ready to run once those hosts are allowed. It records the hero (H1, subhead, CTAs, inputs, media), H2 section order, JSON-LD @types, microdata, loaded font faces, computed H1/body type, background and button colours, motion libraries (GSAP/ScrollTrigger, Lenis, Lottie, Rive, Swiper, Webflow, Framer, AOS, Next/Nuxt), sticky mobile CTAs, horizontal overflow on mobile, /llms.txt and /robots.txt, and desktop, full-page and iPhone-13 screenshots. Script: `/tmp/claude-0/-home-user-nestnrestcleaning/67aecbd2-25bd-57d0-a71b-323079773156/scratchpad/intl_sites/scan.js`. Site list: `/tmp/claude-0/-home-user-nestnrestcleaning/67aecbd2-25bd-57d0-a71b-323079773156/scratchpad/intl_sites/sites1.json`. Run it with `node scan.js sites1.json`.

**Sites confirmed as existing and current (search evidence)**
- **Whizz (Australia, whizz.com.au).** An on-demand cleaner marketplace that started in Sydney and raised money for a national expansion, with Melbourne next — [Dynamic Business](https://www.dynamicbusiness.com.au/entrepreneur-profile/entrepreneur-cleans-up-well-with-whizz.html); [iTWire](https://itwire.com/your-it-news/apps/whizz-cleans-up-with-$2-million-to-fund-national-expansion). It still has an App Store listing — [App Store AU](https://apps.apple.com/au/app/whizz/id965950683) — and a Trustpilot profile with at least some strongly negative reviews — [Trustpilot](https://ch.trustpilot.com/review/whizz.com.au). It now calls itself "Australia's largest network of professional cleaners and removalists" (company self-description, surfaced via search; not independently verified) — [Oneflare listing](https://oneflare.com.au/b/whizz).
- **"Whizz" is not a UK cleaning brand.** The Whizz the brief mentions is Australian. A separate "Whizz UAE" app does car cleaning — [App Store](https://apps.apple.com/ee/app/whizz-uae/id6742111194).
- **Old UK on-demand cleaning entrants are probably defunct.** Bizzby's UK launch coverage dates from 2016 — [Cleaning Show / cleaningmag](https://cleaningmag.com/news/on-demand-services-app-launches-across-the-uk). Cleanzy, an "AI-powered housekeeping platform", launched in London in 2019 with 150 cleaners — [Silicon Canals](https://siliconcanals.com/ai-powered-housekeeping-platform-cleanzy-launches-in-the-uk/). Neither is confirmed current.
- **Snabbit (India).** Founded in 2024 by ex-Zepto executive Aayush Agarwal. It sends vetted cleaners, cooks and dishwashers within 10–15 minutes — [TechCrunch, Apr 2026](https://techcrunch.com/2026/04/25/indias-snabbit-seeks-fresh-funding-at-a-400m-valuation-sources-say/). Sources disagree on its valuation: TechCrunch says it was seeking about $400M; Dealroom lists a $56M round in April 2026 at $350M — [Dealroom](https://dealroom.co/companies/snabbit/). Its app listing claims "4 Lakh+ families" across Mumbai, Delhi NCR, Bangalore and Pune (third-party tracker; treat with caution) — [AppGoblin](https://appgoblin.info/apps/com.snabbit.customer).
- **Pronto (India, withpronto.com).** Offers instant or scheduled house help and says instant help "will reach you within 15 minutes". The site claims "trusted by 500,000+ homes · 15 cities live" — [Pronto](https://www.withpronto.com/). Other coverage describes a 10-minute model — [YourStory, Nov 2025](https://yourstory.com/2025/11/prontos-10-minute-model-redefining-domestic-help-in-urban-india). The promised arrival time therefore varies by source.
- **Urban Company (India) has launched "Insta Help"** to compete with Snabbit and Pronto in 15-minute house help — [Business Today, May 2026](https://www.businesstoday.in/latest/corporate/story/are-snabbit-urban-company-and-pronto-fighting-indias-next-app-war-531140-2026-05-12). One headline reports that the three together logged more than 3 lakh (300,000) bookings in August — [TechStory](https://techstory.in/house-help-in-15-minutes-urban-company-snabbit-and-pronto-clock-over-3-lakh-bookings-in-august/). Business Today also notes that about 98% of India's home-services market is still offline.
- **CaSy (Japan, casy.co.jp).** A listed company (TSE 9215) offering home-help services, cleaning and cooking included, in 10 prefectures. Customers book through an app or the website and are matched with workers it calls "casts" — [EDINET filing text FY2024](https://edinetdb.jp/company/E37432/text?fy=2024); [app-liv](https://app-liv.jp/1909033/). Sales for the year ending November 2025 were ¥1,922M, up from ¥1,761M — [gurafu.net](https://gurafu.net/jpn/casy). Its "No. 1" ranking dates from a 2019 Nikkei DUAL survey, so it is not current.

### Inferences
**Provisional per-site records and scores.** These come from my training knowledge (to mid-2026), not from the live sites in November 2026. Confidence is H, M or L. Dimensions 6 (motion/typography/craft) and 8 (AEO/GEO) need DOM inspection, so they are marked "?". Totals cover dimensions 1–5 and 7 only, out of 30. Do not use them for the final ranking until the scanner has run.

| # | Site (country) | 1 Brand | 2 Hero | 3 Booking | 4 Service info | 5 Trust | 6 Craft | 7 Mobile | 8 AEO | Partial /30 | Conf. |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Urban Company (India; also UAE, Singapore, Saudi Arabia) | 4 | 3 | 5 | 5 | 5 | ? | 5 | ? | 27 | M |
| 2 | Justlife, formerly Justmop (UAE) | 3 | 3 | 5 | 4 | 4 | ? | 5 | ? | 24 | M/L |
| 3 | Hemfrid (Sweden) | 4 | 4 | 4 | 4 | 4 | ? | 4 | ? | 24 | L |
| 4 | Wecasa (France) | 4 | 4 | 4 | 3 | 4 | ? | 5 | ? | 24 | L |
| 5 | Batmaid (Switzerland) | 4 | 4 | 4 | 3 | 4 | ? | 4 | ? | 23 | L/M |
| 6 | Housekeep (UK) | 3 | 4 | 4 | 4 | 4 | ? | 4 | ? | 23 | L/M |
| 7 | Fantastic Services (UK; also Australia) | 3 | 3 | 4 | 4 | 4 | ? | 4 | ? | 22 | L/M |
| 8 | Helpling (Germany) | 3 | 4 | 4 | 3 | 3 | ? | 4 | ? | 21 | L |
| 9 | Snabbit / Pronto (India) | ? | ? | 5 (verified model) | ? | ? | ? | 5 (app-first) | ? | n/a | M on booking only |
| 10 | Jim's Cleaning (Australia, franchise) | 2 | 2 | 2 | 2 | 3 | ? | 3 | ? | 14 | L/M |
| 11 | Whizz (Australia) | ? | ? | 4 | ? | 2–3 (mixed Trustpilot) | ? | 4 (app) | ? | n/a | L |
| 12 | Absolute Domestics (Australia) | ? | ? | ? | ? | ? | ? | ? | ? | n/a | Not enough knowledge to score |
| 13 | Sendhelper (Singapore) | ? | ? | ? | ? | ? | ? | ? | ? | n/a | Not enough knowledge to score |
| 14 | CaSy (Japan) / Miso (South Korea) / Bears (Japan) | ? | ? | ? | ? | ? | ? | ? | ? | n/a | Not enough knowledge to score |

**One-line rationale per site (unverified training knowledge; confirm each point)**
- **Urban Company.** Its web and app present cleaning as fixed-price packages that you add to a cart, with inclusions and exclusions, add-ons, a star rating with booking counts on each service, and slot picking. In this sample it is the clearest pricing and service information, but the hero is a service grid with a city picker rather than a persuasive headline. The 2020 rebrand from UrbanClap and the 2025 stock-market listing are from training knowledge and should be confirmed.
- **Justlife.** Its booking is app-like. As I recall it, you set hours, number of cleaners and whether materials are included, then choose frequency, pick a named cleaner from rated profiles and a specific start time. That combination is rare in North America.
- **Batmaid.** Booking starts from a postcode and quotes an hourly price instantly. Its trust story is legal compliance: Batmaid handles the paperwork, social contributions and insurance for domestic workers. The brand rests on a bat mascot; my memory of a purple palette is low confidence.
- **Housekeep.** Booking is postcode-first, with an instant price by hours and frequency. It manages cover when your usual cleaner is away and, as I recall, charges after the clean. Its trust comes from managed quality rather than a marketplace.
- **Fantastic Services.** A multi-service UK brand (cleaning, end of tenancy, gardening, pest control, handyman, removals). It has an app (as I recall, named GoFantastic) and a paid membership ("Fantastic Club") that lowers prices across services. The very broad service catalogue dilutes the brand.
- **Helpling.** A marketplace founded in Berlin in 2014. Booking runs postcode, then hours, then frequency, then date; in some markets you can see or choose a cleaner. The design is competent but generic.
- **Wecasa.** An at-home services app (cleaning alongside beauty and massage). As I recall, its cleaning prices are shown after France's 50% tax credit, with "avance immédiate" so the discount applies at payment. The flow is strongly app-like.
- **Hemfrid.** A premium Swedish home-cleaning brand. Prices are quoted after the RUT deduction (Sweden's 50% tax relief on household services), and it promises the same cleaner each time. The branding is restrained and Scandinavian.
- **Snabbit / Pronto.** House help in 10–15 minutes (verified above) is the most radical booking model found. It depends on a dense standby workforce, so it is not something an owner-operator can replicate.
- **Jim's Cleaning.** A typical franchise site: phone number and quote form, with franchisee-dependent pages. It is a useful counter-example.

**Strongest per dimension (provisional, low–medium confidence)**
- Brand: Hemfrid, Batmaid and Wecasa.
- Hero: postcode-first heroes (Housekeep, Batmaid, Helpling).
- Booking: Urban Company and Justlife; Snabbit and Pronto for speed.
- Service information: Urban Company.
- Trust: Urban Company (ratings with counts per service) and Batmaid (compliance).
- Mobile: the app-first players (Urban Company, Justlife, Wecasa).
- Craft and AEO/GEO: unknown.

### Gaps
- None of the hero copy, section order, booking steps and fields, typefaces, colour values, motion libraries, JSON-LD types or llms.txt files for these sites could be checked. Live inspection is required, and the scanner above is ready.
- I could not confirm whether these sites were redesigned or shut down in 2025–26: Helpling UK, Batmaid's markets outside Switzerland, Absolute Domestics, Sendhelper, Miso, Bears and Matic.
- I did not search Australian/New Zealand or UK boutique, premium or eco independents with unusually good design. Nothing was found before the search budget ran out, so the international list leans towards large platforms.
- To unblock this work, the user must allow the hosts listed in the first finding under Network access in the cloud environment settings (steps: https://code.claude.com/docs/en/cloud-environments#network-access), and/or send a follow-up message so that the web-search budget resets.

## What booking innovations (instant pricing by hours or rooms, cleaner selection, subscriptions, app-like flows, slot pickers) stand out?

### Takeaway
The one booking innovation verified in this session is India's "house help in 10–15 minutes" model (Snabbit, Pronto, Urban Company Insta Help). My unverified training knowledge points to these other patterns that are rare in North America: hours × cleaners × materials pricing (Justlife), choosing a named cleaner (Justlife, Helpling, Whizz), paying after the clean (Housekeep), paid memberships that cut prices (Fantastic Club), services sold as packages in a cart (Urban Company) and prices shown net of subsidy (Wecasa, Hemfrid).

### Cited Findings
- Snabbit promises vetted domestic help within 10–15 minutes — [TechCrunch](https://techcrunch.com/2026/04/25/indias-snabbit-seeks-fresh-funding-at-a-400m-valuation-sources-say/).
- Pronto offers instant or scheduled help, with instant help arriving "within 15 minutes" — [Pronto](https://www.withpronto.com/). Other coverage says 10 minutes — [YourStory](https://yourstory.com/2025/11/prontos-10-minute-model-redefining-domestic-help-in-urban-india).
- Urban Company's Insta Help competes in the same instant category — [Business Today](https://www.businesstoday.in/latest/corporate/story/are-snabbit-urban-company-and-pronto-fighting-indias-next-app-war-531140-2026-05-12). The three platforms reportedly logged more than 300,000 bookings in August — [TechStory](https://techstory.in/house-help-in-15-minutes-urban-company-snabbit-and-pronto-clock-over-3-lakh-bookings-in-august/).
- Coverage of how instant home-services apps affect workers' wages also exists, a reputational angle worth noting — [The Week, May 2026](https://www.theweek.in/news/biz-tech/2026/05/04/instant-home-services-india.html).
- CaSy's booking runs through its app or website and matches customers with workers ("casts") — [EDINET FY2024](https://edinetdb.jp/company/E37432/text?fy=2024).

### Inferences
**Booking ideas Nest & Rest could adapt.** These are drawn from unverified recollection of the sites and adapted to an owner-operated business.
- **Pricing builder with live total.** Inputs are home size (bedrooms and bathrooms), frequency (weekly, biweekly, monthly or one-time), extras (inside oven, fridge, windows, laundry) and a materials toggle. Justlife's hours × cleaners × materials model becomes "team size" (solo or two-person) for residence-care homes, with the price updating as each choice changes.
- **Arrival-window slot picker.** Show real arrival windows (for example 8–10 or 10–12) rather than a "request a date" form, as Housekeep and Urban Company do.
- **"Your cleaner" continuity promise instead of a cleaner marketplace.** Owner-operated means the same small team every time; frame it the way Hemfrid frames its same-cleaner promise.
- **Pay after the clean, card on file.** Following Housekeep, this lowers the risk of a first booking.
- **Membership or subscription pricing.** Following Fantastic Club, recurring clients could get locked rates, priority slots and add-on discounts. Gift cards could sit alongside it.
- **Package cards per service.** Following Urban Company, each service (deep, move-in/move-out, Airbnb turnover, realtor clean) gets a fixed-price package with explicit "included / not included" lists and add-ons.
- **Fast-turnaround slots.** A scaled-down version of instant help: "next-day" or "same-day turnover" slots for Airbnb hosts and realtors, priced as a premium. True 15-minute dispatch is not feasible for an owner-operator.
- **Show the real price.** Wecasa and Hemfrid show the post-subsidy figure. Canada has no equivalent household-services tax credit to my knowledge, so the transferable lesson is to always show the final, all-in price.

### Gaps
- I could not check any step-by-step booking flow in this session: field counts, whether an account is required, when payment is taken, or whether the price appears instantly.
- I could not confirm whether Housekeep still charges after the clean, whether Fantastic Club still exists, how Justlife handles the choice of cleaner, or how Wecasa applies the avance-immédiate tax credit.

## How do the best international sites describe services and present pricing and guarantees?

### Takeaway
I could not verify service-page structure, pricing tables or guarantee wording live. Training knowledge points to three dominant models: hourly rates with a recommended number of hours (Housekeep, Helpling, Batmaid, Justlife), fixed-price packages with explicit inclusions and exclusions (Urban Company) and subsidy-net prices (Hemfrid, Wecasa). The clearest guarantees are about operations (cover cleaners, re-cleans) and compliance (Batmaid), not generic satisfaction promises.

### Cited Findings
- Pronto's site makes scale claims on the page ("trusted by 500,000+ homes · 15 cities live") as social proof — [Pronto](https://www.withpronto.com/).
- CaSy's history uses a third-party ranking (first place in a 2019 Nikkei DUAL comparison) as a trust claim, which shows how long such badges stay in use — [search summary of CaSy sources](https://edinetdb.jp/company/E37432/text?fy=2023).
- Whizz's Trustpilot profile includes very negative reviews. Marketplace models expose their brand to inconsistent cleaner quality — [Trustpilot](https://ch.trustpilot.com/review/whizz.com.au).

### Inferences
- An owner-operated business can turn the marketplace weakness into a strength. Consistent quality from the same team, with the owner accountable, is a guarantee that large platforms cannot credibly make. A named re-clean guarantee (for example "we'll come back within 24 hours") turns it into an operational promise.
- For AEO/GEO, fixed-price packages with "what's included" lists (in the Urban Company style) suit AI answers well: they give self-contained, quotable facts such as "a 2-bed move-out clean includes X and costs from $Y". Confirm against the GEO researcher's findings.

### Gaps
- No verified pricing (£, €, AED, ₹, A$, S$, ¥) or guarantee wording for any site.
- No verified check of whether these sites use comparison tables, room-by-room checklists or FAQ schema.

## Which sites have genuinely distinctive branding, typography or motion?

### Takeaway
I could not verify any site's typefaces, palette or motion (GSAP, Lenis, Lottie, Rive, Webflow) live. A search of Awwwards found no award-recognised cleaning site; the nearest was a UK pest-control site. Design-led, motion-rich cleaning websites look rare internationally as well, which suggests open space for a distinctive Nest & Rest site.

### Cited Findings
- The only Awwwards result close to the category was Pest Stop Boys, a pest-control service in the South of England: Site of the Day on 23 February 2020, score 7.33 — [Awwwards](https://awwwards.com/sites/pest-stop-boys). It is a home-services brand, not a cleaner.
- The search found no Awwwards-recognised cleaning company site. The nearest "award" for a cleaning-sector site was a 2016 WebAward to Spartan Chemical, a maker of cleaning products — [CleanLink](https://www.cleanlink.com/news/article.aspx?id=20071).

### Inferences
- Large international platforms optimise for conversion and app downloads over artful motion. Their strengths are flow design (Urban Company, Justlife) and brand systems (Batmaid's mascot, Hemfrid's restraint), not scroll-driven animation.
- The "very unique, heavily animated" ambition should take motion and typography from design-led sites outside cleaning, which the design-led researcher is covering, and take booking and service-information patterns from the platforms above.

### Gaps
- No font or library detection, colour extraction or screenshots for any site. The scanner records all of these once the hosts are allowed.
- Not searched: Dribbble/Behance case studies, agency portfolios, CSS Design Awards or Webflow showcase entries for international cleaning brands. The search budget ran out first.
