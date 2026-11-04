# GEO / AEO Playbook for a Toronto Residential Cleaning Business (Nest & Rest Cleaning, Scarborough + North York), as of November 2026

Research notes. Today's date is 2026-11-04. **How these notes were checked:** direct page fetches were blocked in this session (brightlocal.com, searchengineland.com, ahrefs.com, whitespark.ca all failed DNS in the sandbox), so every finding below comes from web-search result summaries of the cited pages. Treat exact figures as "reported by", and re-check the primary page before quoting a number publicly. Where a figure comes from a secondary write-up and not from the original publisher, it is marked *(secondary)*.

**Evidence labels used throughout:**
- **[DOC]**: platform documentation or an official company announcement (Google, Microsoft, OpenAI, Anthropic, Perplexity, Apple, Chrome).
- **[STUDY]**: a data study. Vendor-run studies are marked "vendor".
- **[SURVEY]**: a consumer or practitioner survey.
- **[NEWS]**: a press report.
- **[OPINION]**: a practitioner's claim or advice without published data.

---

## 1. How do Google AI Overviews / AI Mode, ChatGPT search, Perplexity, Gemini, Copilot and Siri choose local businesses and sources, and what data do they draw on?

### Takeaway
Classic local search signals are the base layer. Google says its AI features run on its core Search ranking systems, and its AI calling agent picks businesses "based on traditional local search rankings." Beyond that, each engine leans on a different data source:
- **Google AI Overviews, AI Mode and Gemini:** Google Business Profile, reviews and the business's own website.
- **ChatGPT:** Bing's web index plus licensed Yelp data, since July 2026.
- **Perplexity:** mostly Yelp.
- **Copilot:** Bing and Bing Places.
- **Siri and Apple Maps:** Apple Business listings plus Yelp ratings.

Third-party "best of" lists, directories and review platforms (HomeStars in Canada) dominate "who is the best cleaner in X" style answers. Results are highly volatile: only about 20-33% of results repeat between identical searches.

### Cited Findings

**Adoption and consumer behaviour**
- [SURVEY] BrightLocal's Local Consumer Review Survey 2026 (1,002 US adults, published Feb 11, 2026) found 45% of consumers now use ChatGPT or other AI tools for local business recommendations, up from 6% the year before. That makes AI the third most-used source after Google and Facebook. — [BrightLocal LCRS 2026](https://www.brightlocal.com/research/local-consumer-review-survey/); [PinMeTo summary](https://www.pinmeto.com/news/brightlocal-local-consumer-review-survey-2026/)
- [SURVEY] In the same survey, Google's share as a review-discovery source was reported at 71%, down from 83% *(secondary)*. — [PinMeTo](https://www.pinmeto.com/news/brightlocal-local-consumer-review-survey-2026/)

**Volatility and consistency**
- [STUDY, vendor] BrightLocal studied about 200,000 localized searches across ChatGPT, Google AI Mode and AI Overviews, covering about 1,300 business locations. Average overlap between result sets on repeat searches was only 20-33%: ChatGPT 23%, AI Mode 21%, AI Overviews 33%. — [BrightLocal local AI visibility study](https://www.brightlocal.com/research/local-ai-visibility-study/)
- A separate summary of the same study reports two other figures *(secondary)*:
  - AI Overviews kept recommending a given business about 58% of the time on repeat attempts.
  - Overlap across different points in the same town was 47.4% for AI Overviews and 36.2% for ChatGPT.
  These are different metrics from the 20-33% repeat overlap; I could not reconcile them without the full page. — [BrightLocal study, via search summary](https://www.brightlocal.com/research/local-ai-visibility-study/)

**What gets cited for local queries**
- [STUDY, vendor] Secondary summaries of BrightLocal's 2026 figures report the following *(secondary, unverified against BrightLocal)*:
  - Yelp appeared as a source in 80% of ChatGPT's local-business answers.
  - About 93% of domains cited for local businesses were individual business websites.
  - Google Business Profile accounted for 28.5% of AI citations for local businesses across AI Overviews, AI Mode and ChatGPT.

  — [Elev8 Operations](https://www.elev8operations.com/guides/ai-search-statistics-for-local-businesses-2026); [BCC Interactive](https://www.bccinteractive.com/blog/local-ai-search-statistics/)
- [STUDY, vendor, older (2024-25)] An earlier BrightLocal breakdown put ChatGPT Search's local sources at 58% business websites, 27% business mentions and 15% online directories. Treat it as an earlier snapshot. — [BCC Interactive summary](https://www.bccinteractive.com/blog/local-ai-search-statistics/)

**Google: official position**
- [DOC] Google's May 2026 guide, "Optimizing your website for generative AI features on Google Search," says:
  - AI Overviews and AI Mode are rooted in Google's core Search ranking and quality systems, so SEO best practices still apply.
  - Coverage describes the guide as calling AEO/GEO "still SEO."
  - For local businesses, it points to Google Business Profile and Merchant Center feeds.

  — [Search Engine Journal](https://www.searchenginejournal.com/googles-new-ai-search-guide-calls-aeo-and-geo-still-seo/575026/); [Semrush](https://www.semrush.com/blog/google-publishes-generative-ai-search-guide/); [WordStream](https://www.wordstream.com/blog/google-ai-search-guidelines)
- One source dates a related "AI features and your website" Search Central page to May 2025. Both documents probably exist; I could not confirm their exact titles and dates. — [RiZen Metrics](https://www.rizenmetrics.com/google-ai-features-and-your-website-what-site-owners-actually-need-to-know-in-2026/)
- [DOC] Google has added a Search Console control over inclusion in generative AI features. Sites that opt out "will not receive traffic or impressions from our generative AI features" *(secondary wording)*. — [Google blog: New controls for website owners](https://blog.google/products-and-platforms/products/search/new-controls-website-owners/); [RiZen Metrics](https://www.rizenmetrics.com/google-ai-features-and-your-website-what-site-owners-actually-need-to-know-in-2026/)
- [DOC/NEWS] For Google's AI calling of local businesses ("Let Google Call"), a Google spokesperson said the AI decides which businesses to contact "based on traditional local search rankings." Only businesses that appear for the query and match the user's criteria are called. — [Search Engine Journal](https://www.searchenginejournal.com/google-search-can-now-call-local-businesses-using-ai)

**Google AI Mode versus the Local Pack**
- [STUDY, vendor] The Local SEO Data "AI Mode vs Local Pack" study (June 2026) ran 1,120 queries across 7 verticals and 13 US cities:
  - AI Mode and the Local Pack overlapped 71.5% (95% CI 69.2-73.8%), so 28.5% of Local Pack businesses were missing from AI Mode.
  - Top-3 overlap was only 48%.
  - AI Mode surfaced 999 businesses that never appeared in the Local Pack.
  - AI Mode results shift day to day.

  — [PRWeb release](https://www.prweb.com/releases/local-seo-data-study-finds-28-5-of-local-pack-businesses-are-invisible-in-google-ai-mode-302796340.html); [CitedCo](https://citedco.ai/google-ai-mode-local-search-local-pack-gap/)
- [STUDY, vendor] A February 2026 SE Ranking analysis found that 36.1% of the Google-owned links cited by AI Mode went to Business Profiles *(secondary)*. — [CitedCo](https://citedco.ai/google-ai-mode-local-search-local-pack-gap/)
- [STUDY, vendor, older] Whitespark found AI Overviews on about 68% of local business-type queries. This is 2025 data and measures AI Overviews, not AI Mode. — [Whitespark](https://whitespark.ca/blog/case-study-the-prevalence-of-ai-overviews-in-local-search/)

**ChatGPT**
- [OPINION/STUDY, vendor] Sources agree ChatGPT does not query Google Business Profile or Bing Places directly. One vendor says it runs a real-time Bing search, scans roughly the top 20-30 results and applies its own selection. — [TSEG](https://www.tseg.com/how-chatgpt-ranks-local-businesses-using-bing-and-what-that-means-for-your-firms-clients/); [Local Falcon](https://www.localfalcon.com/blog/chatgpt-local-search-data-sources-where-does-business-info-come-from); [Surface Local](https://www.surfacelocal.com/blog/how-chatgpt-finds-local-businesses)
- [STUDY, contested] The widely repeated claim that "Foursquare supplies about 70% of ChatGPT local data" traces back to a May 2025 test of 50 prompts in 5 Spanish cities. A later 2,880-prompt test found Foursquare in 0.00% of citations and business cards. Treat the claim as weak. — [Pleiades Consultancy (pro-Foursquare claim)](https://www.pleiadesconsultancy.com/blog/foursquare-chatgpt-connection); counter-analysis summarised via [Driven Metrics](https://driven-metrics.com/chatgpt-local-business-recommendation-rate-2026/)
- [NEWS] On July 23, 2026, Axios reported that Yelp is licensing reviews, photos and business information to OpenAI for ChatGPT local answers:
  - Coverage puts the scope at about 330 million reviews and more than 8 million listings.
  - Yelp branding and links are expected to appear when ChatGPT uses Yelp content.
  - The deal is non-exclusive.
  - A "Request a Quote" feature has been announced but not shipped.
  - One test found Yelp in the business-card grounding of 95.83% of runs.

  — [Axios](https://axios.com/2026/07/23/yelp-reviews-chatgpt-geo-partnership); [TechWyse](https://www.techwyse.com/news/platform-updates/yelp-openai-licensing-deal-chatgpt-local-reviews); [MarTech](https://martech.org/yelp-brings-reviews-and-local-leads-to-chatgpt/)
- Earlier disclosure dates for the Yelp deal (February or April 2026) conflict across sources. — [MarTech](https://martech.org/yelp-brings-reviews-and-local-leads-to-chatgpt/)

**Perplexity, Copilot and Gemini**
- [STUDY, vendor, older (May 2024)] SOCi found that all of Perplexity's local results except "hotels near me" came from Yelp. Local-result quality scores were Gemini 88.7, Bing/Copilot 81.7 and Perplexity 74.2. — [SOCi](https://www.soci.ai/blog/local-search-performance-gen-ai/)
- [STUDY, vendor] Two more recent studies point the same way:
  - An analysis based on AirOps data (about Q4 2025) gave Yelp a 62.1% citation share on Perplexity, a 4.9x lead over the next source.
  - Local Dominator's analysis of 267,280 AI citations ranks Yelp as the top local data source.

  — [PPC Land](https://ppc.land/yelp-gets-3-4x-more-ai-citations-than-any-rival-in-new-local-search-data/); [Local Dominator](https://localdominator.co/case-study/ai-local-seo-citations-report/)
- [OPINION] Copilot's local data is described as coming from Bing Places, with Bing cross-checking name, address and phone against mentions across the web. — [Jumpstart GEO](https://www.jumpstartgeo.com/newsroom/how-ai-engines-find-local-businesses); [SOCi](https://www.soci.ai/insights/genai-local-search-citations/)
- [STUDY, vendor] Steady Demand analysed 14,472 local AI citations across 50 metros (early 2026). Business websites supplied 59.9% of Gemini's local citations, Reddit 13.7% and local-service directories 10.3%. — [Steady Demand](https://www.steadydemand.com/ai-citation-ledger/); [mshahid](https://www.mshahid.com/blog/ai-citations-local-search-2026)

**Brand signals (practitioner survey and correlation studies)**
- [SURVEY, practitioner] Whitespark's 2026 Local Search Ranking Factors added "AI search visibility" as a new scoring area (47 experts, 187 factors). Summaries say three of the top five AI-visibility factors are citation or mention based:
  - inclusion in "best of" lists,
  - unstructured blog and news mentions,
  - overall mention volume.

  These are expert opinions, not measured effects. — [Whitespark LSRF 2026](https://whitespark.ca/local-search-ranking-factors/); [Reputation.com](https://reputation.com/resources/articles/whitespark-2026-three-insights-every-brand-should-know); [SEO Madman](https://seomadman.com/reports/whitespark-local-ranking-factors-2026)
- [STUDY, vendor] Ahrefs' 75,000-brand study found:
  - Branded web mentions correlate 0.664 with AI Overview brand visibility; backlinks correlate about 0.218.
  - Brands in the top quartile for mentions averaged 169 AI Overview mentions, versus 14 for the next quartile.
  - A follow-up across ChatGPT, AI Mode and AI Overviews found YouTube mentions correlated about 0.737.

  These are correlations, and the sample skewed toward sites with DR above 40. — [Ahrefs](https://ahrefs.com/blog/ai-overview-brand-correlation/); [LSEO summary](https://lseo.com/mention-engine/resources/articles/what-ahrefs-75000-brand-study-says-about-web-mentions-and-ai-visibility/)

**Effect on clicks**
- [STUDY] Seer Interactive's September 2025 update found:
  - Organic CTR on informational queries with an AI Overview was 0.61%, versus 1.62% without one.
  - Brands cited inside the AI Overview earned 35% more organic clicks and 91% more paid clicks than uncited brands.
  - The 2026 update (53 brands, 5.47M queries, Jan 2025 to Feb 2026) shows CTR on AI Overview queries bottoming in December 2025 and partly rebounding by February 2026.

  — [Seer, Sep 2025](https://www.seerinteractive.com/insights/aio-impact-on-google-ctr-september-2025-update); [Seer, 2026 update](https://www.seerinteractive.com/insights/aio-impact-on-google-ctr-2026-update)

**Toronto and Canada**
- [STUDY, small, vendor] Canada Create compared 200 Toronto local-service searches with New York:
  - 53.5% of Toronto searches showed an AI Overview; "near me" searches triggered one only 6 times out of 26.
  - The Local Pack appeared on 77% of searches.
  - For "who is the best" Toronto questions, 8 of 10 answers cited a ranking, directory or marketplace site, and only 3 of 10 cited a local business's own website.
  - Canadian sources such as Canada.ca and Ontario.ca appeared in Toronto answers.

  — [Canada Create](https://canadacreate.com/ai-overviews-2026-toronto-new-york/)
- [STUDY, vendor] A US and Canada study of 9,434 home-services answers found that 84% of ChatGPT answers with citations cited at least one directory, review platform or "best of" list *(secondary snippet; Canada split unclear)*. — [OpenLens](https://openlens.com/blog/en/ai-visibility-1000-hvac-plumbing-2026)
- [DOC/NEWS] Availability in Canada:
  - AI Overviews launched in Canada in October 2024 (English).
  - AI Mode has been available in English since August 21, 2025.
  - English ads began showing in AI Mode in Canada on October 28, 2026.
  - French-language support in Canada is reported inconsistently and remains unclear.

  — [Falia](https://falia.co/en/insights/paid-advertising/google-ads-ai-mode-canada-october-2026/); [Arfadia](https://www.arfadia.com/blog/why-google-ai-overviews-dont-speak-french-canada/)

**Apple, Siri and Apple Maps**
- [DOC/NEWS] Apple Business, which merged Business Connect, Business Essentials and Business Manager, was announced in March 2026 and launched globally on April 14, 2026. One listing feeds Apple Maps, Siri, Spotlight, Wallet, CarPlay and more. — [AdaTek Agency](https://adatekagency.com/blog/apple-business-connect-now-apple-business/); [TryMaas](https://www.trymaas.com/blog/apple-business-connect-apple-maps-marketers-2026/)
- [DOC/NEWS] Apple introduced "Siri AI," built with Google's Gemini models, at WWDC 2026. It shipped with iOS 27 (reported Sept 14, 2026) as an English beta. — [Wikipedia: Siri](https://en.wikipedia.org/wiki/Siri); [GMB API news](https://gmbapi.com/news/apple-maps-wwdc-2026-local-seo/)
- [NEWS] Apple Maps ads rolled out in the US and Canada in summer 2026 (August per one source). Businesses must claim their location to use them. — [GMB API news](https://gmbapi.com/news/apple-maps-wwdc-2026-local-seo/); [TryMaas](https://www.trymaas.com/blog/apple-business-connect-apple-maps-marketers-2026/)
- [STUDY, small] In 149 Apple Maps salon results read on Oct 5, 2026, 102 displayed Yelp's rating. — [GeoScout](https://geoscout.pro/en/blog/apple-intelligence-siri-geo)

### Inferences
- **Priority order for Nest & Rest:**
  1. Google Business Profile and Google reviews. These feed AI Overviews, AI Mode, Gemini, Ask Maps and the AI calling agent, and Google is still the largest discovery channel.
  2. The website itself. Business sites are the single largest citation domain, and ChatGPT reaches them through Bing.
  3. Yelp. It feeds ChatGPT (licensed), Perplexity and Apple Maps ratings.
  4. Bing Places and Bing Webmaster Tools, for Copilot and ChatGPT's Bing grounding.
  5. Apple Business.
  6. HomeStars, the Canadian review marketplace (see Q5).
  7. Third-party "best cleaners in Scarborough / North York / Toronto" lists and local press.
- Classic local SEO and GEO are not separate projects. Google says the AI layers sit on the same ranking systems, and Google's own agent selects businesses by local rank. The redesign must keep and extend classic on-page local SEO.
- Because results repeat only 20-33% of the time, "rank #1 in ChatGPT" is not a stable target. Aim to be present across many prompt variants and sources, which is share of voice, not a fixed position.
- For "best house cleaner in Scarborough" prompts, AI answers mostly cite lists and directories. Getting onto those lists, and onto HomeStars and Yelp with strong recent reviews, probably matters as much as on-site content for recommendation queries. On-site content matters most for informational and price queries such as "how much does a deep clean cost in Toronto."

### Gaps
- No official OpenAI documentation found on how ChatGPT selects local businesses, or which map/places provider powers ChatGPT business cards in Canada.
- No primary data on whether the Yelp-OpenAI deal applies to Canadian listings.
- No cleaning-specific or Toronto-specific large-sample study of AI local citations. The Canada Create study is small (200 searches).
- Couldn't verify BrightLocal's primary pages (fetch blocked). Secondary figures (80% Yelp, 93% business websites, 28.5% GBP) need checking.
- Gemini app local sourcing beyond "Google properties" is not documented in what I found.

---

## 2. Which on-site content structures get extracted and cited, and what should a cleaning business's pages look like?

### Takeaway
The evidence favours four things:
- Putting the answer near the top of the page and under question-style headings (about 44-55% of citations come from the first 30% of a page).
- Self-contained blocks a model can lift whole.
- Concrete statistics, quotes and cited sources (the GEO paper reports 30-40% relative visibility gains on its metric).
- Genuinely fresh content.

Google says no special "AI writing style" or chunking is needed. The best tactic is clear, specific, people-first pages with real numbers (CAD prices, hours, inclusions) in plain HTML.

### Cited Findings

**The GEO paper**
- [STUDY, academic, 2023/2024, still the main academic reference] Aggarwal et al., "GEO: Generative Engine Optimization" (Princeton and IIT Delhi; KDD 2024) found:
  - "Cite Sources," "Quotation Addition" and "Statistics Addition" gave the best results, a 30-40% relative improvement on the Position-Adjusted Word Count metric. The headline "up to 40%" is a best case on that specific metric, not a general visibility rate.
  - Quotation Addition worked best in the "People & Society" and "Explanation" domains.

  — [arXiv 2311.09735](https://arxiv.org/pdf/2311.09735); [Wikipedia: GEO](https://en.wikipedia.org/wiki/Generative_engine_optimization)

**Where on the page citations come from**
- [STUDY] Kevin Indig's Growth Memo, "The science of how AI pays attention" (Feb 2026, 18,012 verified ChatGPT citations), found:
  - 44.2% of citations came from the first 30% of a page's text, 31.1% from the middle and 24.7% from the final third (a "ski ramp" shape).
  - Cited content was twice as likely to contain a question mark.
  - 78.4% of citations tied to a question came from headings.

  — [ALM Corp summary](https://almcorp.com/blog/chatgpt-citations-study-44-percent-first-third-content/); [Practical Ecommerce](https://www.practicalecommerce.com/studies-reveal-ai-citation-clues)
- [STUDY, small] CXL's study of 100 Google AI Overview citations found 55% of cited passages within the first 30% of the source page. — [CXL](https://cxl.com/blog/google-ai-overview-citation-sources/)
- [STUDY] A separate study found 74.8% of AI Mode and Gemini citations in the first half of the page and 46.1% in the first 30%. — [Practical Ecommerce](https://www.practicalecommerce.com/studies-reveal-ai-citation-clues)

**Platform guidance on structure**
- [DOC] Microsoft's October 2025 Bing blog post, "Optimizing Your Content for Inclusion in AI Search Answers" (Krishna Madhavan), recommends:
  - clear headings that reflect specific questions or topics,
  - block-level structure so assistants can lift complete ideas,
  - FAQ formats, schema, and being properly indexed in Bing.

  Bing also rewrote its Webmaster Guidelines to cover Copilot grounding and citations. — [Search Engine Journal](https://www.searchenginejournal.com/microsoft-explains-how-to-optimize-content-for-ai-search-visibility/577161); [SEJ: Bing adds GEO to guidelines](https://www.searchenginejournal.com/bing-adds-geo-to-official-guidelines-expands-ai-abuse-definitions/)
- [DOC] Google's 2026 guide says you do not need to "chop your pages into tiny pieces" or rewrite content in a special style for AI. — [RiZen Metrics summary](https://www.rizenmetrics.com/google-ai-features-and-your-website-what-site-owners-actually-need-to-know-in-2026/); [SEJ](https://www.searchenginejournal.com/googles-new-ai-search-guide-calls-aeo-and-geo-still-seo/575026/)

**Freshness**
- [STUDY, vendor] Ahrefs' freshness study (about 17M citations, July 2025) found:
  - URLs cited by AI assistants averaged 1,064 days old, versus 1,432 for organic results (25.7% fresher).
  - Measured by last-update date, the gap was smaller: 909 versus 1,047 days (13.1%).
  - Google AI Overviews was the exception, citing content about 16 days older than organic on average.

  — [Ahrefs](https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content); [Foundation Inc](https://foundationinc.co/lab/vol-251/)
- [DOC/OPINION] Google's John Mueller has cautioned against changing dates without real content changes. — [MadX](https://www.madx.digital/learn/content-freshness-seo); [Ahrefs freshness summary](https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content)

**Price and availability data**
- [DOC/NEWS] Google's AI calling feature exists to get pricing and availability from local businesses on the user's behalf. Price and availability are exactly the facts agents are sent to collect. — [Search Engine Journal](https://www.searchenginejournal.com/google-search-can-now-call-local-businesses-using-ai); [PYMNTS](https://www.pymnts.com/news/artificial-intelligence/2025/google-adds-ai-powered-local-business-calling-search)
- [OPINION] Since Q&A was removed, Google's Ask Maps generates answers about a business from its Business Profile, reviews, photos and website content. Practitioners therefore advise keeping the website FAQ and the profile consistent. — [Slashpost](https://slashpost.ai/blogs/google-business-profile/google-business-profile-qa-removed-2026); [hairyLemon](https://www.hairylemon.co.nz/insights/google-business-profile-2026)

### Inferences

**Pattern A: the answer-first block (use on every service, area and guide page).** An H2 phrased as the real question, followed by a 40-70 word self-contained answer that contains the number, then supporting detail. Example:

> **How much does a deep clean cost in Scarborough?**
> A deep clean of a 2-bedroom condo in Scarborough typically costs CA$X-CA$Y with Nest & Rest (about Z hours for a two-person team), including baseboards, inside appliances on request, and limescale removal. Houses with 3+ bedrooms usually run CA$A-CA$B. Prices last reviewed: [Month 2026].

Then add:
- a table by home size and service,
- a short "What changes the price" list,
- a "What's included / not included" checklist,
- a link to the booking form.

Use the owner's real figures; do not publish placeholder numbers.

**Pattern B: tables and lists for comparison intents.** "Deep vs regular clean," "move-out checklist" and "how often to clean" should each contain:
- a comparison table with real rows (tasks, time, price, frequency),
- an ordered checklist.

These are the most extractable formats, and the existing guides already cover these intents.

**Pattern C: original data, the GEO-paper "statistics" lever.** Publish first-party numbers no one else has, for example:
- average hours by unit type across N jobs in 2025-26,
- the share of move-out cleans that needed oven degreasing,
- typical Toronto condo versus Scarborough detached house timings.

Original statistics are the thing models can only get from this site, and both the GEO paper and practitioner research reward them.

**Pattern D: quotable owner expertise.** Give each guide a named owner byline, a one-line credential ("cleaning homes in Scarborough since 20XX, N homes cleaned"), and one or two short, quotable owner tips in first person. This applies the "quotation addition" lever and strengthens E-E-A-T-style trust signals.

**Pattern E: visible freshness.** Show "Last updated" and "Prices reviewed" dates in the HTML, keep `dateModified` in the JSON-LD in sync with them, and only change either date when the content actually changes. A quarterly price review is a natural cadence.

**Pattern F: local specificity without doorway risk.** Each neighbourhood page should carry facts unique to that place. Examples:
- housing stock (high-rise condos near Scarborough Town Centre versus detached homes in the Bluffs),
- parking and building access and concierge notes,
- typical job types there,
- a real review from a customer in that neighbourhood,
- local landmarks only where they are relevant to the service.

**Other recommendations**
- Put every price, service area, hour and policy in the first screen of text, not only in images, animations or JS widgets. Front-loading matters (44-55% of citations come from the top 30%).
- Cover Canadian specifics models look for: prices in CAD, HST treatment (included or extra), Ontario and Toronto context, and condo-building rules (elevator booking for move-outs).

### Gaps
- No controlled study found that isolates "price transparency" as a citation factor. The inference rests on agent behaviour and query intent.
- Found no 2025-26 primary source quantifying E-E-A-T/author-byline effects on AI citations specifically.
- The GEO paper's keyword-stuffing result and per-domain tables were not verified in this session (PDF not fetched).

---

## 3. Structured data in 2026: which types and properties matter, what are the restrictions, and does schema measurably affect AI citations?

### Takeaway
Keep accurate, complete JSON-LD (HouseCleaningService, Service and Offer, areaServed, hours, sameAs, founder), because it supports entity understanding, Google and Bing local features, and future agent use. But the best 2026 evidence (Ahrefs, controlled) shows adding schema does not measurably lift AI citations, and Google says no special markup is needed for AI features.

Rich-result realities for 2026:
- FAQ rich results are gone (May 2026).
- HowTo has been gone since 2023.
- Book Actions was retired in 2025.
- Self-serving LocalBusiness review stars have not shown since 2019.

### Cited Findings

**Does schema lift AI citations?**
- [STUDY, controlled, vendor] Ahrefs (May 2026) tracked 1,885 pages that added JSON-LD between August 2025 and March 2026, against about 4,000 control pages. It found "no major uplift in citations on any platform":
  - AI Overview citations fell 4.6% relative to controls (statistically significant, but not confidently attributable to schema).
  - AI Mode rose about 2.4% and ChatGPT about 2.2% (within noise).
  - Limitation: all pages already had 100+ AI Overview citations, so the study tests amplification, not discovery.

  — [Ahrefs](https://ahrefs.com/blog/schema-ai-citations/); [SE Roundtable](https://www.seroundtable.com/study-schema-citations-study-41311.html)
- [STUDY, correlational, secondary] About 65% of AI Mode citations and 71% of ChatGPT citations carry schema. Commentators attribute this to those pages already ranking well. — [AuthorityTech summary](https://authoritytech.io/blog/schema-markup-structured-data-ai-search-citations-impact-2026)
- [OPINION, unverified] The claim that "no major LLM parses JSON-LD at fetch time" is unverified. — [AuthorityTech](https://authoritytech.io/curated/schema-markup-ai-citations-ahrefs-study-2026)

**Platform positions**
- [DOC] Google's May 2026 AI guide states structured data is not required for generative AI features and there is no special schema.org markup to add. Standard markup still matters for rich results. — [Semrush](https://www.semrush.com/blog/google-publishes-generative-ai-search-guide/); [DemandSphere](https://www.demandsphere.com/blog/google-ai-optimization-guide-ai-search-is-still-search/); [CXL](https://cxl.com/blog/google-ai-search-optimization-guide/)
- [DOC] Microsoft's AI-answers guidance mentions schema markup and FAQ formats among its recommendations. — [Search Engine World](https://www.searchengineworld.com/microsoft-shares-exact-signals-ai-uses-to-choose-content-for-search-answers); [LLMrefs](https://llmrefs.com/blog/microsoft-ai-content-optimization-guide)

**FAQ and HowTo**
- [DOC] Google stopped showing FAQ rich results on May 7, 2026:
  - The FAQ search appearance, report and Rich Results Test support were dropped in June 2026.
  - The Search Console API data was scheduled for removal in August 2026.
  - FAQPage remains a valid schema.org type, and Google says it continues to parse the markup for understanding.

  — [SEJ: Google Drops FAQ Rich Results](https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/); [Search Engine Land](https://searchengineland.com/google-to-no-longer-support-faq-rich-results-476957); [inblog](https://inblog.ai/blog/google-faq-schema-rich-result-deprecation)
- [DOC, older (Aug-Sep 2023), still holds and superseded for FAQ] In August 2023 Google restricted FAQ rich results to authoritative government and health sites and deprecated HowTo rich results (mobile in August 2023, desktop in September 2023). — [inblog](https://inblog.ai/blog/google-faq-schema-rich-result-deprecation); [Relevant Audience](https://www.relevantaudience.com/seo/google-removes-structured-data-2025-guide-for-websites/)

**Other retired features**
- [DOC] On June 12, 2025, Google announced it was phasing out seven structured-data features: Book Actions, Course Info, Claim Review, Estimated Salary, Learning Video, Special Announcement and Vehicle Listing. Search Console support for six of them (all except Book Actions) was removed in September 2025. Use outside Google Search is unaffected. — [Google Search Central blog](https://developers.google.com/search/blog/2025/06/simplifying-search-results); [PPC Land](https://ppc.land/google-deprecates-seven-structured-data-types-to-simplify-search-results/)

**Review stars**
- [DOC, 2019, still holds] Google's September 16, 2019 change: self-serving reviews are not eligible for review snippets. A self-serving review is one about entity A placed on A's own site, whether in markup or through an embedded third-party widget, and the rule covers both Review and AggregateRating on LocalBusiness and Organization. There is no manual action for this and no need to remove the markup; the stars simply don't show. — [Google Search Central blog 2019](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful?authuser=1); [Webmasters blog](https://webmasters.googleblog.com/2019/09/making-review-rich-results-more-helpful.html)

**LocalBusiness properties**
- [DOC, secondary] For Google's LocalBusiness rich results, the core required properties are name and address (PostalAddress). Recommended properties include telephone, url, openingHoursSpecification, geo, image, aggregateRating and priceRange (under 100 characters). One source says address or geo is acceptable. — [Yoast](https://yoast.com/local-business-listings/); [Kortix claude-seo skill](https://kortix.com/marketplace/AgricIDaniel--claude-seo/seo-local)
- [DOC/OPINION] Google's John Mueller reportedly said it is "perfectly fine" to use valid schema.org properties that aren't listed in Google's docs, such as areaServed, hasOfferCatalog and founder. This attribution comes from a search summary, and the exact source page is uncertain. — [SEJ](https://www.searchenginejournal.com/google-follow-our-structured-data-requirements-to-ensure-rich-result-eligibility/329679/)
- [STUDY, unverified secondary] A claim that Product or Review schema with real data is cited more than generic Article or Organization markup could not be traced to a study. — [Dotin Academy](https://dotinacademy.com/does-schema-markup-help-ai-citations/)

### Inferences

**Treat schema as accuracy and entity plumbing, not a ranking hack.** Its value for Nest & Rest:
1. It makes facts unambiguous to Google and Bing: one canonical @id, the service area, prices in CAD and hours.
2. It keeps the site consistent with GBP, Bing Places and Apple Business.
3. It is cheap insurance for agentic use later.

**Recommended 2026 JSON-LD graph** (one `@graph` on every page, with the business node defined once and referenced by `@id`):
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HouseCleaningService",
      "@id": "https://example.ca/#business",
      "name": "Nest & Rest Cleaning",
      "url": "https://example.ca/",
      "telephone": "+1-416-XXX-XXXX",
      "email": "hello@example.ca",
      "address": {"@type": "PostalAddress", "addressLocality": "Toronto", "addressRegion": "ON", "postalCode": "M1X XXX", "addressCountry": "CA"},
      "geo": {"@type": "GeoCoordinates", "latitude": 43.77, "longitude": -79.25},
      "areaServed": [
        {"@type": "Place", "name": "Scarborough, Toronto, ON"},
        {"@type": "Place", "name": "North York, Toronto, ON"}
      ],
      "openingHoursSpecification": [{"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "opens": "08:00", "closes": "18:00"}],
      "priceRange": "CA$120–CA$450",
      "currenciesAccepted": "CAD",
      "paymentAccepted": "Credit card, Interac e-Transfer",
      "founder": {"@type": "Person", "@id": "https://example.ca/about/#owner", "name": "[Owner name]", "jobTitle": "Owner & lead cleaner"},
      "sameAs": ["[GBP/Maps URL]", "[Yelp URL]", "[HomeStars URL]", "[Facebook]", "[Instagram]", "[Bing Places/Apple Maps URL if public]"],
      "hasMap": "[Google Maps CID URL]",
      "hasOfferCatalog": {"@type": "OfferCatalog", "name": "Cleaning services", "itemListElement": [
        {"@type": "Offer", "itemOffered": {"@id": "https://example.ca/services/deep-cleaning/#service"},
         "priceSpecification": {"@type": "PriceSpecification", "minPrice": 0, "maxPrice": 0, "priceCurrency": "CAD"}}
      ]},
      "potentialAction": {"@type": "ReserveAction", "target": {"@type": "EntryPoint", "urlTemplate": "https://example.ca/book/", "actionPlatform": ["https://schema.org/DesktopWebPlatform","https://schema.org/MobileWebPlatform"]}, "result": {"@type": "Reservation", "name": "Cleaning appointment"}}
    },
    {
      "@type": "Service",
      "@id": "https://example.ca/services/deep-cleaning/#service",
      "serviceType": "Deep cleaning",
      "provider": {"@id": "https://example.ca/#business"},
      "areaServed": [{"@type": "Place", "name": "Scarborough, Toronto, ON"}],
      "offers": {"@type": "Offer", "priceCurrency": "CAD", "priceSpecification": {"@type": "UnitPriceSpecification", "price": 0, "priceCurrency": "CAD", "unitCode": "HUR"}}
    }
  ]
}
```
- **Placeholders:** the zeros and `[ ]` values are placeholders, to be replaced with real figures only.
- **Service-area business address:** for a service-area business that hides its street address on GBP, it is reasonable to publish only locality, region and postal code in schema, so the schema doesn't conflict with the hidden GBP address. This is an inference; Google's requirement wording couldn't be verified.
- **ReserveAction:** keep it as a semantic hint pointing at the booking URL. Expect no Google rich feature from it: Book Actions was retired in June 2025.

**What to keep, change or drop**
- **FAQPage:** keep it where real Q&A exists on the page (still parsed, harmless, still useful to Bing and other engines). Stop expecting FAQ rich results.
- **HowTo:** drop it or treat it as optional. It has had no Google display since 2023.
- **AggregateRating/Review of the business itself:** it won't earn stars (self-serving rule). If used, it must match real, visible reviews. A better approach is to render real review text in the HTML with a source link (Google, Yelp, HomeStars).
- **Article on guides:** keep it, with `author` as a Person (the owner, linked to an About page), plus `datePublished` and `dateModified` that match the visible dates.
- **BreadcrumbList and WebSite:** keep both.
- **Rendering:** JSON-LD must be in the server-rendered HTML, not injected client-side. AI crawlers don't execute JS (see Q6).

### Gaps
- Could not fetch Google's current LocalBusiness doc page to confirm 2026 wording on service-area business address handling, and whether areaServed is now documented.
- No evidence on whether ChatGPT, Perplexity or Claude read JSON-LD when fetching a page. The Ahrefs study measured outcomes, not mechanism.
- No study on schema's effect for small local sites with near-zero baseline citations. Ahrefs' sample was already highly cited.

---

## 4. llms.txt, robots.txt and AI-crawler policy: what to allow for visibility versus training, and what blocking does

### Takeaway
- **llms.txt:** adoption is growing (about 10% of domains), but there is no evidence it affects citations, crawlers rarely request it, and Google says it isn't needed. It is optional and harmless, so it is low priority.
- **robots.txt:** the real lever. Each vendor separates search or answer bots from training bots:
  - OpenAI: OAI-SearchBot versus GPTBot.
  - Anthropic: Claude-SearchBot versus ClaudeBot.
  - Perplexity: PerplexityBot, which is not used for training.
  - Google: Googlebot versus Google-Extended.
  - Apple: Applebot versus Applebot-Extended.

  Blocking a search bot removes you from that engine's answers. For a local business that wants recommendations, allow every search and user-fetch agent, and almost certainly the training agents too.

### Cited Findings

**llms.txt**
- [STUDY, vendor] An SE Ranking study (May 2026, about 300,000 domains) found:
  - 10.13% of domains had an llms.txt, up from 0.4% in April 2025.
  - There was no statistically significant correlation between having llms.txt and how often a domain is cited in AI answers.

  — [PPC Land](https://ppc.land/llms-txt-adoption-rises-8-8x-but-97-of-files-get-zero-ai-requests/); [GEOly](https://www.geoly.ai/blog/does-llms-txt-work)
- [STUDY, vendor] Ahrefs reportedly found that 97% of llms.txt files received zero requests across 137,210 domains (May 2026, unconfirmed against Ahrefs). Limy logged 500M+ AI bot visits over 90 days, and only 408 of them targeted llms.txt. A contrary claim says Profound saw Microsoft and OpenAI crawlers fetching llms.txt and llms-full.txt; it is unverified. — [PPC Land](https://ppc.land/llms-txt-adoption-rises-8-8x-but-97-of-files-get-zero-ai-requests/); [Limy](https://limy.ai/blog/llms-txt-in-2026-the-full-guide); [DerivaTex](https://derivatex.agency/blog/llms-txt-guide/)
- [DOC] Google's AI guide says you don't need llms.txt for Google Search. Google's crawler may discover the file but treats it like any other text file. — [Semrush](https://www.semrush.com/blog/google-publishes-generative-ai-search-guide/); [RiZen Metrics](https://www.rizenmetrics.com/google-ai-features-and-your-website-what-site-owners-actually-need-to-know-in-2026/)

**OpenAI**
- [DOC] OpenAI's crawler documentation:
  - GPTBot crawls content that may be used to train foundation models.
  - OAI-SearchBot surfaces sites in ChatGPT search. Sites opted out of OAI-SearchBot will not be shown in ChatGPT search answers, though they may still appear as navigational links.
  - ChatGPT-User handles user-initiated actions, and robots.txt "may not apply."
  - Each setting is independent, and OpenAI publishes IP ranges for each bot.

  — [OpenAI: Overview of crawlers](https://developers.openai.com/api/docs/bots); [PPC Land on doc revision](https://ppc.land/openai-revises-chatgpt-crawler-documentation-with-significant-policy-changes/)
- [OPINION] It can take about 24 hours for ChatGPT search to reflect a robots.txt change. This comes from a third-party guide, not OpenAI. — [iCODA](https://icoda.io/blog/gptbot-guide/)

**Anthropic**
- [DOC, via SEJ] Anthropic runs three bots, each with its own robots.txt token, and all three respect robots.txt:
  - ClaudeBot: training.
  - Claude-User: user-requested fetches.
  - Claude-SearchBot: search indexing.

  Blocking one does not block the others, and Anthropic warns that blocking Claude-SearchBot may reduce visibility and accuracy in user search results. The old tokens Claude-Web and anthropic-ai are deprecated. — [Search Engine Journal](https://www.searchenginejournal.com/anthropics-claude-bots-make-robots-txt-decisions-more-granular/568253/); [ALM Corp](https://almcorp.com/blog/anthropic-claude-bots-robots-txt-strategy/)

**Perplexity**
- [DOC] Perplexity's crawler documentation lists two agents and publishes IP lists for both:
  - PerplexityBot builds the search index. Perplexity recommends allowing it, and third parties say it honors robots.txt.
  - Perplexity-User handles user-triggered fetches and generally ignores robots.txt.
  - Neither is used for model training.

  Perplexity has been accused of using undeclared crawlers. — [Perplexity docs](https://docs.perplexity.ai/docs/resources/perplexity-crawlers.md); [Otterly reference](https://help.otterly.ai/ai-crawlers)

**Google and Apple training tokens**
- [DOC/secondary] Google-Extended controls use of content for Gemini model training and for grounding in the Gemini apps (and Vertex AI). It does not remove a site from Search or AI Overviews; AI Overviews and AI Mode have their own Search Console control. Google says sites that allow Google-Extended are eligible to appear, with clicks, in Gemini's answers. — [PPC Land: Explaining Google-Extended](https://ppc.land/google-extended/); [HeyBuffy](https://heybuffy.com/blog/google-ai-control-levers-compared); [AICrawlerCheck](https://aicrawlercheck.com/blog/google-extended-vs-googlebot)
- [NEWS, very recent, verify] On October 30 (2026), OpenAI, Google, Microsoft and Anthropic backed a shared robots.txt policy token, `__usage_ai-training`, for opting out of AI training. Google will treat an opt-out with this token as a Google-Extended disallow, which also removes Gemini Apps and Vertex grounding, but not AI Overviews. — [PPC Land](https://ppc.land/google-microsoft-openai-and-anthropic-back-one-ai-training-opt-out/); [fireup.pro](https://fireup.pro/news/ai-training-opt-out-robots-txt)
- [DOC, older, verify] Applebot-Extended opts content out of Apple AI training (Apple Intelligence). Disallowing it does not remove the site from Apple's search results. — [Fastly](https://www.fastly.com/blog/teach-your-robots-txt-a-new-trick-for-ai)

**Bing and Copilot**
- [DOC] Bing's updated Webmaster Guidelines treat "grounding results and citations" in Copilot as eligibility outcomes, and explain how NOARCHIVE, NOCACHE and NOSNIPPET separately affect Copilot answers. — [SEJ](https://www.searchenginejournal.com/bing-adds-geo-to-official-guidelines-expands-ai-abuse-definitions/)

### Inferences

**Recommended policy for Nest & Rest (maximise visibility):**
- Allow every search and user agent: Googlebot, Bingbot, Applebot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot and Perplexity-User.
- Also allow Google-Extended. Blocking it (or using the new shared training opt-out) costs eligibility for clickable Gemini-app answers.
- For a small service business, training opt-outs (GPTBot, ClaudeBot, Applebot-Extended) bring almost no benefit. Being in training data plausibly helps models "know" the brand and its service area. That last point is an inference with no direct evidence. Default: allow, unless the owner has a values objection.
- Do not use `nosnippet` or `max-snippet:0` on money pages. Preview controls limit what Google and Bing can quote in AI answers.

**Example robots.txt** (a group with multiple User-agent lines is valid robots.txt syntax):
```
User-agent: *
Allow: /
Disallow: /book/confirm/   # (example: private/transactional URLs only)

# Answer/search engines and user-triggered fetchers: always allow
User-agent: Googlebot
User-agent: Bingbot
User-agent: Applebot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
Allow: /

# Training / model-grounding tokens: allowed by default (owner's choice)
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: Applebot-Extended
Allow: /

Sitemap: https://[domain]/sitemap.xml
```

**Other steps**
- Check the host or CDN bot-management settings, since a WAF "block AI bots" toggle overrides robots.txt intent. In server logs, verify bots by their published IP ranges.
- llms.txt: optional. If added, it should be a short, accurate Markdown summary of services, areas, prices and key URLs that costs nothing to maintain. Do not expect any measurable effect, and do not let it diverge from the site.

### Gaps
- Could not confirm Apple's current Applebot-Extended documentation (2026) or whether Siri AI (Gemini-built) uses any additional crawler.
- No data on whether allowing training crawlers improves later brand recall in model answers for small businesses.
- The shared `__usage_ai-training` token is days old. Implementation details and crawler support are unverified.

---

## 5. Off-site entity signals for Toronto: Google Business Profile, reviews, HomeStars, Yelp, Nextdoor, Reddit, directories, NAP and Wikidata

### Takeaway
Off-site signals probably decide whether AI recommends a local cleaner more than on-site work does:
- a complete, active Google Business Profile with a steady flow of recent, detailed reviews (consumers now expect reviews from the last 3 months and 4.5+ stars),
- presence and reviews on Yelp (now licensed into ChatGPT) and HomeStars (Canada's home-services review platform, heavily cited by non-ChatGPT assistants),
- Bing Places and Apple Business listings,
- mentions in "best cleaners in Toronto / Scarborough" lists and local press.

Reddit's share of citations is highly volatile and small for local queries. No evidence was found that Wikidata matters for small businesses.

### Cited Findings

**Google Business Profile changes**
- [NEWS/OPINION] Google shut the Business Profile Q&A API on November 3, 2025 and phased Q&A out of profiles. It was replaced by Ask Maps, a Gemini assistant in Maps that generates answers from the profile, reviews, photos and website. Ask Maps launched March 12, 2026, initially in the US and India. Owners cannot edit the generated answers. No confirmed ranking effect. — [hairyLemon](https://www.hairylemon.co.nz/insights/google-business-profile-2026); [Slashpost](https://slashpost.ai/blogs/google-business-profile/google-business-profile-qa-removed-2026); [RankLocalToday](https://ranklocaltoday.com/blog/google-business-profile-qa-discontinued-ask-maps)
- [NEWS] On April 16, 2026, Google deployed Gemini-powered enforcement and pre-publication scam detection on Business Profiles. AI-generated review replies were reported in testing. — [hairyLemon](https://www.hairylemon.co.nz/insights/google-business-profile-2026)
- [STUDY, vendor] Whitespark's Q3 2026 roundup cites a study of 1.4M+ profiles in which keywords in the business title correlated with 2x to 5x more top-3 Local Pack rankings. — [Whitespark Q3 2026](https://whitespark.ca/blog/22-local-seo-developments-you-need-to-know-about-from-q3-2026/)
- [SURVEY, practitioner] Secondary summaries of Whitespark's 2026 local pack weights give roughly GBP 32%, reviews 20%, on-page 15%, behavioural 9%, links 8%, citations 6%, personalization 6% and social 4%. Other summaries give different numbers. — [W3 Marketing Hub](https://w3marketinghub.com/seo/local-seo-ranking/); [Whitespark LSRF](https://whitespark.ca/local-search-ranking-factors/)

**Reviews**
- [SURVEY] BrightLocal LCRS 2026 (US) *(mostly via secondary summaries)*:
  - 97% read reviews, and 41% always do (up from 29%).
  - 74% look for reviews from the last 3 months, and 32% want reviews from the last two weeks.
  - 31% will only use businesses rated 4.5 stars or higher (up from 17%).
  - 59% want 20-99 reviews before trusting a rating.
  - 80% are more likely to use a business that replies to all reviews, but 50% are put off by generic replies.

  — [BrightLocal LCRS 2026](https://www.brightlocal.com/research/local-consumer-review-survey/); [PinMeTo](https://www.pinmeto.com/news/brightlocal-local-consumer-review-survey-2026/); [TapReview](https://www.usetapreview.com/blog/brightlocal-2026-consumer-review-survey-star-ratings)
- [OPINION] Review sentiment patterns, not only star averages, shape how AI summarises a brand, and recency matters. — [Reputation.com](https://reputation.com/resources/articles/whitespark-2026-three-insights-every-brand-should-know)

**Yelp**
- [NEWS/STUDY] Yelp is licensed to ChatGPT (July 2026), is the dominant Perplexity local source, and supplies the rating shown in most Apple Maps results sampled. — See Q1: [Axios](https://axios.com/2026/07/23/yelp-reviews-chatgpt-geo-partnership); [PPC Land](https://ppc.land/yelp-gets-3-4x-more-ai-citations-than-any-rival-in-new-local-search-data/); [GeoScout](https://geoscout.pro/en/blog/apple-intelligence-siri-geo)

**HomeStars and Canadian marketplaces**
- [OPINION/STUDY, small, vendor] A Canadian contractor-SEO guide calls HomeStars the dominant Canadian home-services review platform (500k+ homeowners monthly, per company data) and a primary source for AI answers about Canadian contractors. In an Ottawa plumber case:
  - HomeStars and Reddit had 109 citations each, versus Yelp 4, BBB 7, Angi 2 and Houzz 1.
  - HomeStars was cited by every tracked assistant except ChatGPT.

  — [Northline Systems](https://northlinesystems.ca/resources/why-contractors-need-ai-search-visibility); [Northline: SEO for contractors Canada](https://northlinesystems.ca/resources/seo-for-contractors-canada-guide)
- [STUDY, vendor] A Canadian AI search benchmark found ChatGPT returns national marketplaces such as HomeStars and RenovationFind for home-renovation help. — [Parabolic Studio](https://www.parabolicstudio.ca/blog/canadian-ai-search-visibility-benchmark)

**Directories, "best of" lists and Reddit**
- [STUDY, small] Toronto "who is the best" questions: 8 of 10 AI answers cited a ranking, directory or marketplace site, and only 3 of 10 cited a business's own site. — [Canada Create](https://canadacreate.com/ai-overviews-2026-toronto-new-york/)
- [SURVEY, practitioner] Whitespark 2026's top AI-visibility factors are "best of" list inclusions, unstructured news and blog mentions, and mention volume. — [Reputation.com](https://reputation.com/resources/articles/whitespark-2026-three-insights-every-brand-should-know)
- [STUDY, vendor] Reddit's share of local AI citations is volatile and conflicting:
  - Steady Demand: 13.7% of Gemini local citations (early 2026), falling to 1.7% by September 2026, and effectively zero in ChatGPT.
  - Cairrot (1.5M responses): Reddit was 0.93% of ChatGPT local-prompt citations, 2.51% of Gemini's and 3.17% of Perplexity's.
  - Semrush: Reddit's ChatGPT share fell from 60% to 10% in six weeks.
  - Whitespark (Q2 2025, Houston plumber hybrid queries): 60% of citations went to third-party publishers including Reddit, Quora, Thumbtack, HomeGuide and Yelp.

  — [Steady Demand](https://www.steadydemand.com/ai-citation-ledger/); [Cairrot](https://cairrot.com/blog/reddit-marketing-ai-llm-visibility-data-statistics/); [Jarred Smith](https://www.jarredsmith.com/blog/reddit-ai-visibility); [MediaPost](https://www.mediapost.com/publications/article/413077/reddit-emerges-as-highly-cited-source-in-ai-engine.html)

**Brand mentions**
- [STUDY, vendor] Branded web mentions are the top correlate of AI Overview visibility (0.664), well ahead of backlinks. — [Ahrefs](https://ahrefs.com/blog/ai-overview-brand-correlation/)

**Bing Places, Apple Business and Local Services Ads**
- [OPINION] Copilot uses Bing Places and cross-checks NAP across the web. Apple Business feeds Siri and Maps. — [Jumpstart GEO](https://www.jumpstartgeo.com/newsroom/how-ai-engines-find-local-businesses); [AdaTek](https://adatekagency.com/blog/apple-business-connect-now-apple-business/)
- [OPINION/secondary] Google Local Services Ads are available in Canada for house cleaning. Sources say 15-17 eligible home-service categories, and Google does not publish Canadian lead prices. Third-party estimates for cleaning leads run about CA$20-50 (one guide) and $25-60 (Edmonton, another). — [Playbook Digital](https://playbookdigital.ca/google-local-services-ads-canada/); [YEG Web Solutions](https://yegwebsolutions.ca/insights/local-services-ads-canada-guide); [Debut Marketing](https://debutmarketing.ca/google-local-services-ads-canada)

### Inferences

**Off-site checklist (in priority order)**
1. **Google Business Profile.**
   - Primary category "House cleaning service" plus relevant secondaries.
   - Service-area set to Scarborough and North York neighbourhoods.
   - Services listed with prices.
   - Fresh photos (team, before and after).
   - Weekly posts.
   - Booking or appointment link to the site's booking page.
   - Hours.

   Keep the GBP business name as the real business name. Whitespark's title-keyword correlation is real, but adding keywords that aren't part of the legal or brand name violates Google's guidelines and risks suspension.
2. **Review engine.** Ask after every clean and aim for a steady weekly flow, not bursts. Prompt customers to mention the service type and neighbourhood (for example, "move-out clean in Agincourt"), because that text is what AI summarises. Reply to every review personally, without templates.
3. **Yelp** (claim, complete, gather reviews) and **HomeStars** (claim, get verified, gather reviews). These are the two third-party platforms with documented AI-citation weight for this market.
4. **Bing Places** (it can import from GBP) and **Apple Business**. Both are free; Apple Maps ads became available in Canada in 2026.
5. **Consistent NAP and description everywhere:** GBP, Bing, Apple, Yelp, HomeStars, Facebook, Instagram, Nextdoor, BBB, YellowPages.ca and 411.ca. Add every profile URL to the site's `sameAs`.
6. **"Best of" and press.** Pitch Toronto "best cleaning services" roundup sites and local outlets (community newspapers, Scarborough and North York blogs). Contribute owner-quoted tips to local media, for example on move-out season around May and June and on condo turnover. This is where the mention-volume and "best of" signals come from.
7. **Reddit and Nextdoor.** Participate authentically: answer cleaning questions as the owner, with disclosure, and never astroturf. Treat this as low and unpredictable AI value, but useful word of mouth.
8. **Wikidata.** Skip it. A small cleaning business almost certainly fails notability. That is an inference; the sources here said nothing either way.
9. **LSA (Google Screened/Guaranteed)** is a paid option that also builds a Google-verified review base. Decide on it with the booking/pricing research.

### Gaps
- No data found on Nextdoor's role in AI citations, or on YellowPages.ca, 411.ca or BBB citation weight in Canadian AI answers.
- HomeStars evidence is from small, vendor-run samples (an Ottawa plumber case). No cleaning-specific data.
- HomeStars' ownership and its relationship with Angi's ChatGPT app could not be confirmed in this session.
- Ask Maps availability in Canada is unconfirmed (US and India first).

---

## 6. Technical: rendering, heavy animation and JS, Core Web Vitals, crawl speed, internal linking, location pages and doorway risk

### Takeaway
This is the hard constraint for an animated redesign. The major AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot) do not execute JavaScript. Only Googlebot (and therefore Gemini) and Applebot render. Every word, price, heading, link and JSON-LD block must be in the server-delivered HTML. Animation must be a progressive enhancement layered on content that already exists.

Core Web Vitals (LCP under 2.5s, INP under 200ms, CLS under 0.1 at the 75th percentile) are a tiebreaker-level ranking signal, but heavy animation JS is the usual cause of poor INP.

City and neighbourhood pages are fine if each has unique, useful substance. Thin or near-duplicate pages risk the doorway and scaled-content policies.

### Cited Findings

**AI crawlers and JavaScript**
- [STUDY] Vercel and MERJ, "The rise of the AI crawler" (Dec 17, 2024, older but the main dataset; no contrary data found):
  - None of the major AI crawlers render JavaScript. Named crawlers: OAI-SearchBot, ChatGPT-User, GPTBot, ClaudeBot, PerplexityBot, Meta-ExternalAgent, Bytespider.
  - Gemini uses Googlebot's infrastructure and renders JS. Applebot also renders.
  - GPTBot fetched JS files in 11.5% of requests and ClaudeBot in 23.84%, but neither executed them.
  - ChatGPT spent 34.82% of fetches on 404s and Claude 34.16%.
  - Monthly volume: GPTBot about 569M requests and Claude about 370M, versus Googlebot about 4.5B.
  - Recommendation: server-side render critical content.

  — [Vercel](https://vercel.com/blog/the-rise-of-the-ai-crawler?ref=t01.li); [Averi](https://www.averi.ai/blog/javascript-rendering-gap-ai-crawlers)
- [OPINION] Googlebot renders in two phases, initial HTML then deferred JS rendering, which can lag. — [Averi](https://www.averi.ai/blog/javascript-rendering-gap-ai-crawlers)

**Google and Bing technical guidance**
- [DOC] Google's 2026 AI guide covers crawlability, clear technical structure, page experience and avoiding duplicate content as the technical basics for AI-feature eligibility *(secondary)*. — [RiZen Metrics](https://www.rizenmetrics.com/google-ai-features-and-your-website-what-site-owners-actually-need-to-know-in-2026/); [CXL](https://cxl.com/blog/google-ai-search-optimization-guide/)
- [DOC] Microsoft says IndexNow keeps content fresh across search and AI experiences by notifying engines of adds, updates and removals. It recommends Bing Webmaster Tools verification and a sitemap. — [Bing Webmaster blog](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview); [eSEOspace](https://eseospace.com/blog/bing-webmaster-tools-indexnow-ai-search/)

**Core Web Vitals**
- [DOC, secondary] The 2026 thresholds are unchanged: LCP under 2.5s, INP under 200ms (200-500ms needs improvement, over 500ms poor) and CLS under 0.1, all at the 75th percentile of real Chrome users.
  - INP replaced FID in March 2024 and covers every interaction.
  - Main-thread tasks over 50ms block the next paint; heavy JS is the main INP risk.
  - CWV act as a tiebreaker.

  — [Prooflytics](https://prooflytics.io/blog/core-web-vitals-thresholds-2026-lcp-inp-cls); [Rankato](https://rankato.com/blog/core-web-vitals-2026-inp-guide); [NitroPack](https://nitropack.io/blog/most-important-core-web-vitals-metrics/)

**Location pages and doorway risk**
- [DOC/OPINION] Google's doorway-abuse policy targets pages made to rank for similar queries that funnel to less useful intermediate pages. Google publishes no allowed page count or uniqueness percentage; the test is value, not volume. Pages for real service locations with local proof (jobs, reviews, staff) are generally defensible. Thin duplicates should be consolidated or redirected. — [Rickety Roo](https://ricketyroo.com/blog/location-page-spam/); [Splinter Net Marketing](https://splinternetmarketing.com/digital-strategy/city-pages-doorway-risk-and-site-reputation-abuse-in-2026/); [Fun Systems](https://funsystems.io/blog/are-city-pages-doorway-pages/)
- [STUDY, case reports, secondary] Sterling Sky case studies, as relayed by others:
  - 200+ AI-generated service-area pages barely moved traffic and didn't move rankings.
  - A business received a manual action for thin service-area pages.
  - 35 service-area pages at about 84% content match still drove significant traffic and conversions. Similarity alone isn't fatal; usefulness is.

  — [AgentSite](https://agentsite.ai/blog/are-service-area-pages-doorway-pages); [Townsmith](https://townsmithwp.com/guides/doorway-pages/)
- [NEWS/OPINION] Google's June 2026 spam update is described as enforcing existing policies, with no new rules. Home-services sites with templated city pages were a stated concern. — [Digital Shift Media](https://digitalshiftmedia.com/search-intelligence/google-june-2026-spam-update-home-services/)

### Inferences

**Motion versus machine-readability: build rules for the redesign**
1. **Server-rendered or static HTML first.** Every page must make full sense with JS disabled. Test with `curl` or "View Source", not DevTools. If the redesign uses a framework, use static generation or SSR. Never use client-only rendering for content routes.
2. **Never put content inside canvas, WebGL, Lottie or video.** Prices, headings, service lists, neighbourhood names and reviews must be real DOM text. Decorative motion can use canvas, SVG or Lottie as long as it carries no unique information.
3. **Hidden is acceptable, absent is not.** Tabs, accordions and scroll-reveal content must exist in the initial HTML. Animate opacity and transform; do not inject content on scroll. Avoid starting text at `opacity:0` with no CSS fallback: if JS fails, the text stays invisible to users, and to Googlebot screenshots.
4. **Animate only transform and opacity** (compositor-only). Prefer CSS and scroll-driven animations or the Web Animations API over heavy JS libraries. Load any animation library deferred, after LCP. Break long tasks to protect INP under 200ms.
5. **No preloaders or intro screens** that delay LCP. The LCP element should be a static heading or optimised image. Reserve space for animated elements so CLS stays under 0.1.
6. **Respect `prefers-reduced-motion`** with a static variant. This also gives a natural "content-only" baseline to test against.
7. **Give links real `<a href>` elements** (crawlable internal links). Avoid JS-only click handlers for navigation. AI crawlers waste about 34% of fetches on 404s, so keep URLs stable and 301 any changed URLs from the current site.
8. **Put JSON-LD inline in the HTML `<head>` or body**, not injected by a tag manager.
9. **Internal linking.** Link each guide's answer blocks to the matching service and area pages and to the booking page. Each district hub (Scarborough, North York) links to its neighbourhood pages and back. Keep the sitemap with accurate `lastmod`, and ping IndexNow on content changes.

**Location pages**
- Keep the current 2 district and 12 neighbourhood pages only if each gets unique, verifiable substance: local job examples, a neighbourhood-specific review, housing-type notes, access and parking notes, and real travel or availability details.
- Otherwise, merge weak neighbourhood pages into the district hub as sections, with 301 redirects.
- Don't scale up to dozens of near-identical pages, and don't AI-generate them.

### Gaps
- No 2025-26 replication of Vercel/MERJ. OpenAI's or Anthropic's search agents could have added rendering since; I found no documentation either way.
- No data on AI crawler timeouts or page-speed thresholds; I found no study on whether slow TTFB reduces AI citation.
- No study specific to animation libraries (GSAP, Lottie, scroll-driven CSS) and AI crawl outcomes.
- Google's current doorway-policy wording and the Sterling Sky originals were not fetched.

---

## 7. Agentic search: how AI agents find and book local services in 2026, and what makes a site "agent-ready"

### Takeaway
Agentic booking is real but mostly US-only and partner-mediated in 2026:
- **Google AI Mode** books through platforms such as Booksy, Fresha and Vagaro, and can call businesses for pricing and availability, US-only.
- **ChatGPT** routes home-services jobs through marketplace apps (Thumbtack since October 2025, Angi since about March 2026), with Yelp "Request a Quote" announced.
- **Chrome** is trialling WebMCP so sites can expose booking actions directly.

For a Toronto cleaner today, being agent-ready means:
- clear CAD prices and inclusions in HTML,
- a simple, labelled, no-JS-required booking form or a reputable booking platform,
- a phone line that answers,
- accurate GBP, Yelp and HomeStars listings.

Leave WebMCP and agent protocols as a watch item.

### Cited Findings

**Google**
- [DOC] Google AI Mode agentic booking:
  - It started in Search Labs, covering restaurants, event tickets and local appointments (wellness and beauty). Agentic booking for event tickets and local appointments was then made available to all US Labs users.
  - At I/O 2026, Google said it is expanding agentic booking to "local experiences and services." For some categories, users can ask Google to call businesses for them; this was to roll out to everyone in the US in summer 2026.
  - Bookings complete on partner sites such as Booksy, Fresha and Vagaro.

  — [Google: Search I/O 2026](https://blog.google/products-and-platforms/products/search/search-io-2026/); [Google: AI Mode agentic and personalized](https://blog.google/products-and-platforms/products/search/ai-mode-agentic-personalized/); [SEJ: agentic booking in Labs](https://www.searchenginejournal.com/google-ai-mode-starts-rolling-out-agentic-booking-in-labs/559973/)
- [OPINION] Other sources say the call-on-your-behalf feature covers home repair, beauty and pet care. Full nationwide rollout as of November 2026 is unconfirmed. — [Ignite Visibility](https://ignitevisibility.com/google-agentic-ai/); [Digital Media Cube](https://digitalmediacube.com/agentic-search-ai-booking-appointments/)
- [DOC/NEWS] "Let Google Call" (July 2025) checks prices and availability and can make appointments. It selects businesses by traditional local rankings, and businesses can opt out in Business Profile settings. It is US-only (excluding some states). As of a September 2026 report, Gemini's calling works only with US numbers, and Google has announced no Canadian date. — [SEJ](https://www.searchenginejournal.com/google-search-can-now-call-local-businesses-using-ai); [MobileSyrup](https://mobilesyrup.com/2025/07/16/google-ai-calling-feature-not-canada/); [iPhone in Canada, Sep 2026](https://www.iphoneincanada.ca/2026/09/24/gemini-can-now-make-phone-calls-for-you-canada-has-to-wait/)
- [DOC] Google's Universal Commerce Protocol (UCP) checkout in AI Mode and Gemini is expanding to Canadian shoppers, with Lululemon, Shopify, Shoppers Drug Mart and Simons as launch partners. It covers products (Merchant Center), not local services. Google says hotel booking and food delivery verticals are coming; nothing ties UCP to local-service booking. — [Google Canada blog](https://blog.google/intl/en-ca/products/explore-get-answers/a-new-way-to-shop-introducing-a-more-intuitive-agentic-shopping-experience-for-consumers-and-retailers-in-canada/); [Merchant Center Help](https://support.google.com/merchants/answer/16837055?hl=en); [Google Developers: UCP](https://developers.google.com/merchant/ucp)

**ChatGPT and marketplaces**
- [NEWS] Thumbtack partnered with OpenAI (announced October 6, 2025) to power home services in ChatGPT, with example prompts such as finding a top-rated house cleaner. One report says an earlier Operator-based version was limited to US ChatGPT Pro users. — [Business Wire via Morningstar](https://www.morningstar.com/news/business-wire/20251006760229/thumbtack-partners-with-openai-to-power-home-services-in-chatgpt); [TradesmenUp](https://blog.tradesmenup.com/p/thumbtack-openai-bringing-home-service-booking-into-chatgpt)
- [NEWS] Angi launched a home-services app in ChatGPT around March 2026 and is piloting OpenAI's "Sponsored Agents." Angi also has an app in Gemini and an upcoming Alexa+ integration. — [Angi announcement](https://www.angi.com/articles/chatgpt-marketplace-announcement.htm); [Angi Sponsored Agents](https://www.angi.com/articles/chatgpt-pilot-marketplace-announcement.htm); [Roofing Contractor](https://www.roofingcontractor.com/articles/101994-angi-launches-home-services-app-in-chatgpt)
- [DOC] OpenAI's Agentic Commerce Protocol (ACP) is an open standard connecting merchants to ChatGPT, focused on product checkout. ChatGPT apps run on the MCP-based Apps SDK. — [OpenAI: Agentic Commerce](https://developers.openai.com/commerce); [awesome-chatgpt-apps directory](https://github.com/rdmgator12/awesome-chatgpt-apps)
- [NEWS] Yelp's "Request a Quote" in ChatGPT was announced but not shipped as of the reports. — [MarTech](https://martech.org/yelp-brings-reviews-and-local-leads-to-chatgpt/)

**Browser-level agent actions**
- [DOC] WebMCP (Chrome) lets a site declare actions for agents: each tool has a name, a description and a JSON schema. The documented example is booking (`bookSlot` with date, time and contact). There are two APIs:
  - a Declarative API built on HTML forms,
  - an Imperative API in JS.

  Status: early preview in Chrome 146 (February 2026); origin trial from Chrome 149 to 156, announced at I/O 2026. It is a W3C Draft Community Group Report (February 10, 2026) and not yet production-stable. — [Chrome: WebMCP early preview](https://developer.chrome.com/blog/webmcp-epp); [Chrome docs: agents](https://developer.chrome.com/docs/ai/agents?authuser=395139540); [DataCamp tutorial](https://www.datacamp.com/tutorial/webmcp-tutorial)

**Structured data and booking**
- [DOC] Google retired Book Actions structured-data support in Google Search (June 2025). — [Google Search Central blog](https://developers.google.com/search/blog/2025/06/simplifying-search-results)

### Inferences

**Agent-ready checklist (for the booking/UX research to reconcile)**
1. A **prices page with explicit CAD numbers** in HTML tables (by service and home size, hourly rate, minimums, HST, add-ons), plus a clear **inclusions/exclusions list** and a **cancellation and rescheduling policy**. These are the facts agents (and Google's calling agent, if it reaches Canada) are sent to collect.
2. A **booking flow that works as a plain HTML `<form>`**: labelled inputs (service, home size, postal code, date and time window, contact) with server-side handling and a confirmation page. This is accessible, works for browser agents (ChatGPT agent, Gemini in Chrome) today, and is the input the WebMCP Declarative API is designed to annotate later. Avoid multi-step JS-only widgets, CAPTCHAs on first step, or iframes from obscure tools that agents can't operate.
3. **Postal-code service-area check in text**, for example "We serve M1B-M1X (Scarborough) and M2H-M2R, M3A-M3N (North York)", so agents can resolve "do you serve my address?" without a widget. Verify the FSA list with the owner.
4. **Phone and SMS that answer**, with hours stated. Google's AI calling selects by local rank and asks about price and availability. It is US-only today; Canadian rollout is unannounced but plausible.
5. **Booking link on GBP** pointing to the site's booking page. If the owner adopts a scheduling platform, prefer one with Google booking integration. This needs checking in the booking research, since Google's documented partners skew to beauty and wellness.
6. **Marketplace presence:** HomeStars and Yelp as the Canadian-relevant layers. Thumbtack and Angi's ChatGPT apps are US-centric, and their Canadian reach is unverified.
7. **Keep `ReserveAction` in schema** pointing to the booking URL (cheap, semantically correct), with no expectation of Google features.
8. **Watch items:** WebMCP origin trial (Chrome 149+), Yelp Request-a-Quote in ChatGPT, Google agentic booking for home services reaching Canada, and UCP expanding to services. Revisit quarterly; don't build for them now.

### Gaps
- No confirmation of whether any agentic booking feature (Google, ChatGPT or Perplexity) works for Canadian home services as of November 2026.
- No documentation found on Perplexity's local booking features in 2026.
- No evidence on how browser agents (ChatGPT agent/Operator, Gemini in Chrome) handle specific booking widgets. This needs hands-on testing.
- NLWeb (Microsoft) status not found.

---

## 8. Measurement: tracking AI referrals in GA4, AI visibility tools, and realistic expectations for a small local business

### Takeaway
Use the free first-party reports first:
- GA4, with its native "AI Assistant" channel (from May 2026) plus a custom regex channel group that also catches Perplexity, Claude and others.
- Google Search Console's new Generative AI performance report (June 2026; impressions for AI Overviews and AI Mode).
- Bing Webmaster Tools' AI Performance report (February 2026; Copilot citations and grounding queries).
- Google Business Profile Performance (calls, website clicks, directions).

Add a monthly manual prompt panel, or a low-cost tracker. Expect small, noisy AI referral numbers: results repeat only 20-33% of the time, and many AI-driven leads arrive as calls or GBP actions, not website sessions. A "How did you hear about us?" field with AI options is essential.

### Cited Findings

**Google Analytics and Search Console**
- [DOC, secondary] GA4 added an "AI Assistant" default channel on May 13, 2026. Recognised sources reportedly include ChatGPT, Gemini, DeepSeek, Copilot and Grok. It excludes Perplexity and any session without a referrer. — [Nice Looking Data](https://www.nicelookingdata.com/blog/ga4-ai-traffic-chatgpt-referrals); [Comet](https://comet.rocks/blog/how-to-track-ai-referral-traffic-ga4); [Nadia Mohamed](https://nadiamohamed.me/insights/track-ai-referral-traffic/)
- [OPINION] To set up a custom channel group: Admin → Data settings → Channel groups, with a source regex such as `chatgpt\.com|chat\.openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com` (optionally grok, deepseek, meta.ai). Place it above "Referral", because GA4 assigns sessions to the first matching channel. Don't anchor the regex with `^https://`, because session source is a bare hostname. — [Rankshift](https://www.rankshift.ai/blog/how-to-track-chatgpt-referrals-in-ga4/); [GetSpotted](https://getspotted.ai/blog/track-ai-referral-traffic-ga4); [DarwinApps](https://www.darwinapps.com/blog/how-to-track-chatgpt-gemini-and-perplexity-referral-traffic-in-ga4-and-crm/)
- [DOC] Google launched "Search Generative AI performance reports" in Search Console (Google blog, June 2026; reported launch June 3):
  - It is in beta, under Performance → Generative AI features.
  - It covers AI Overviews and AI Mode.
  - It reportedly shows impressions, pages, countries and devices, but not clicks or queries.
  - AI-feature clicks and impressions remain blended into the main web Performance totals.
  - It is reported as rolled out worldwide.

  — [Google Search Central blog](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports); [PPC Land](https://ppc.land/google-finally-gives-search-console-its-own-generative-ai-visibility-reports/); [Pasquale Pillitteri](https://pasqualepillitteri.it/en/news/4116/search-console-generative-ai-report-ai-overviews-ai-mode)

**Bing Webmaster Tools**
- [DOC] The Bing Webmaster Tools "AI Performance" report entered public preview in February 2026 (announced around Feb 10):
  - It shows citations in Copilot, Bing AI summaries and select partners, with total citations, cited pages and sample grounding queries.
  - It doesn't measure rankings or clicks.

  — [Bing Webmaster blog](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview); [SEJ](https://www.searchenginejournal.com/bing-webmaster-tools-adds-ai-citation-performance-data/566874/); [CXL](https://cxl.com/blog/bing-ai-visibility-tracking-webmaster-tools/)

**Third-party trackers**
- [OPINION] Tools named for small teams include Semrush AI Visibility Toolkit, Otterly AI, Peec AI and SE Ranking, plus BrightLocal for citations and NAP. Practitioners recommend starting with free manual prompt checks, and say monthly cadence is enough because weekly checks add noise. — [Destinali](https://destinali.com/ai-search/best-tools-for-tracking-your-local-business-visibility-in-ai-search-results); [Scalenut](https://scalenut.com/blogs/top-geo-tools-for-small-businesses); [Mean CEO blog](https://blog.mean.ceo/?p=2528)

**Measurement noise**
- [STUDY] Measurement noise is large: AI local results repeat only 20-33% of the time (BrightLocal). Academic work on statistical frameworks for AI-visibility measurement has emerged in 2026. — [BrightLocal](https://www.brightlocal.com/research/local-ai-visibility-study/); [arXiv 2603.08924](https://arxiv.org/pdf/2603.08924)

**Click expectations**
- [STUDY] Click expectations from Seer:
  - AI Overviews cut organic CTR sharply (0.61% versus 1.62% on informational queries, September 2025).
  - Being cited partly offsets the loss (+35% organic clicks versus uncited brands).
  - Even after the 2026 rebound, cited brands still trail queries with no AI Overview.

  — [Seer](https://www.seerinteractive.com/insights/aio-impact-on-google-ctr-september-2025-update); [Seer 2026](https://www.seerinteractive.com/insights/aio-impact-on-google-ctr-2026-update)

### Inferences

**Measurement plan for Nest & Rest (low cost)**
1. **GA4.** Keep the native AI Assistant channel. Add a custom "AI Assistants (all)" channel above Referral using the regex above, extended with `perplexity`, `claude`, `meta.ai`, `grok`, `deepseek` and `you.com`. Track `generate_lead` and `book` conversions by channel. Landing pages from AI referrals show which pages get cited.
2. **Search Console.** Monitor the Generative AI report monthly (impressions by page), alongside the queries in the standard report that map to the guides ("deep cleaning cost Toronto").
3. **Bing Webmaster Tools.** Verify the site, submit the sitemap, enable IndexNow and read AI Performance. Its grounding queries show the phrasings Copilot uses, which informs headings.
4. **GBP Performance.** Track calls, website clicks, direction requests and bookings. This is where most AI Overview, AI Mode and Ask Maps influence will show up for a service-area business.
5. **First-party attribution.** Add a booking-form field, "How did you find us?", with options for Google search, Google Maps, ChatGPT, other AI assistant, HomeStars, Yelp, referral and other. Ask phone leads the same question. Use a call-tracking number on the site only if it doesn't break NAP consistency: keep the main number on GBP and in schema.
6. **Manual prompt panel (monthly).** Keep a fixed list of about 20 prompts, for example:
   - "best house cleaner in Scarborough"
   - "move-out cleaning North York price"
   - "how much does a deep clean cost in Toronto"
   - "cleaning service near Agincourt"
   - "who does condo cleaning in North York"

   Run them in ChatGPT, Google AI Mode, Gemini, Perplexity, Copilot and Siri where possible, logged out, with a Toronto location. Record mention yes/no, position, cited sources and accuracy of facts (prices, areas). Run each prompt 2-3 times because of the roughly 20-33% repeat overlap. Fix factual errors at the source (GBP, Yelp, HomeStars, site).
7. **Paid tracker.** Optional, after 3-6 months, if the manual panel shows movement: Otterly, Peec or the Semrush or SE Ranking AI modules at their smallest tier.

**Realistic expectations**
- AI referral sessions will likely be single or low double digits per month at first. The bigger effects are indirect: GBP calls, recommendation mentions, and the trust signal when a prospect checks reviews.
- Success looks like:
  - being named in AI answers for district-level "best/price" prompts,
  - prices and areas quoted correctly,
  - review count and recency competitive with the top 3 local cleaners.

  It does not look like a traffic spike.
- Because Google ads now appear in AI Mode in Canada (English, since October 28, 2026) and Apple Maps ads launched in Canada, paid options exist to complement organic efforts. Evaluate them separately.

### Gaps
- No primary confirmation of the GA4 AI Assistant channel's exact source list (secondary blogs only).
- Unverified whether ChatGPT still appends `utm_source=chatgpt.com` to outbound citation links. None of the results covered it; check live in GA4's source/medium report.
- No benchmark found for AI referral share of traffic, or lead volume, for small local service businesses in Canada.
- Local Falcon's AI-visibility features and Profound pricing were not found in the results.
