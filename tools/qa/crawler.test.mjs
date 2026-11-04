// What a crawler that doesn't run JavaScript sees: the HTML exactly as built. Most AI crawlers (GPTBot, OAI-SearchBot,
// ClaudeBot, PerplexityBot) read pages this way, so the business, its prices, the answers and the guarantee must all be in
// the HTML itself, and must match js/config.js.
import fs from "node:fs";
import path from "node:path";
import { test, assert, newPage, ROOT, loadConfig } from "./lib.mjs";
import { fillDetails, toDetails } from "./booking.test.mjs";

const PAGES = [...fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8").matchAll(/<loc>[^<]*?nestnrestcleaning\.com([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
const read = (pg) => fs.readFileSync(path.join(ROOT, pg.replace(/^\//, ""), "index.html"), "utf8");
const ld = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
// The words on the page, as a crawler reads them: no scripts, no tags, entities decoded.
const words = (html) => html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
const mainWords = (html) => words((html.match(/<main id="main">([\s\S]*)<\/main>/) || [, html])[1]);
// The price rule, as tools/build.mjs and js/site.js apply it.
const priceOf = (C, k, bd, ba, h = "condo") => {
  const s = C.services[k], b = k === "detail" ? 1 : bd;
  return Math.round((s.base + Math.max(0, b - 1) * s.perBed + Math.max(0, ba - 1) * s.perBath) * C.homeTypes[h].factor / 5) * 5;
};
const money = (n) => "$" + Math.round(n).toLocaleString("en-CA");

export default async function () {
  const C = loadConfig();
  const SITE = C.siteUrl;
  const B = C.business;
  const GUARANTEE = C.policies.guarantee.replace(/\{hours\}/g, C.policies.recleanWindowHours);
  const services = (C.services && Object.keys(C.services)) || [];

  test("every page carries the same business, as a house cleaning service, in its HTML", async () => {
    const profiles = ["googleBusinessUrl", "facebookUrl", "instagramUrl", "yelpUrl", "homestarsUrl"].map((k) => B[k]).filter(Boolean);
    let first = null;
    for (const pg of PAGES) {
      const nodes = ld(read(pg));
      const biz = nodes[0];
      assert(biz && biz["@type"] === "HouseCleaningService" && biz["@id"] === SITE + "/#business", `${pg}: the business should come first: ${JSON.stringify(biz).slice(0, 120)}`);
      const { review, ...facts } = biz;
      if (pg !== "/") assert(!review, `${pg}: reviews belong on the home page only, where they're shown`);
      first = first || JSON.stringify(facts);
      assert(JSON.stringify(facts) === first, `${pg}: the business reads differently here`);
      assert(JSON.stringify(biz.sameAs || []) === JSON.stringify(profiles), `${pg}: sameAs should be every profile in js/config.js: ${JSON.stringify(biz.sameAs)}`);
      assert(biz.potentialAction && biz.potentialAction["@type"] === "ReserveAction" && biz.potentialAction.target.urlTemplate === SITE + "/book/", `${pg}: a ReserveAction to /book/`);
      // Every reference to the business resolves on the same page.
      const refs = JSON.stringify(nodes).match(/"@id":"[^"]*#business"/g) || [];
      assert(refs.length >= 1 && refs.every((r) => r === `"@id":"${SITE}/#business"`), `${pg}: business references: ${refs.join(", ")}`);
    }
  });

  test("the price list in the business data is the price on each service page", async () => {
    const biz = ld(read("/"))[0];
    const list = biz.hasOfferCatalog.itemListElement;
    const all = [...services.map((k) => C.services[k]), ...Object.values(C.quoteServices)];
    assert(list.length === all.length, `the catalogue should list every service: ${list.length} of ${all.length}`);
    for (const k of services) {
      const s = C.services[k];
      const offer = list.find((o) => o.itemOffered.url === `${SITE}/services/${s.slug}/`);
      assert(offer && offer.price === s.base && offer.priceCurrency === C.currency && offer.priceSpecification.minPrice === s.base, `${k}: catalogue price ${offer && offer.price}, config ${s.base}`);
      const html = read(`/services/${s.slug}/`);
      assert(html.includes(`data-from="${k}">${money(s.base)}<`), `${k}: the page's "from" price should be ${money(s.base)} in the HTML`);
      const node = ld(html).find((n) => n["@type"] === "Service");
      assert(node["@id"] === offer.itemOffered["@id"] && node.offers.price === s.base, `${k}: the page's Service should be the catalogue's, at the same price`);
    }
    for (const q of Object.values(C.quoteServices)) {
      const offer = list.find((o) => o.itemOffered.url === `${SITE}/services/${q.slug}/`);
      const set = q.host ? (q.prices.find((x) => x.price != null) || {}).price : null;
      assert(offer && (set != null ? offer.price === set : offer.price === undefined), `${q.slug}: a quoted service has no price until one is set`);
    }
  });

  test("service, area and price pages open with a question and its answer, in the HTML", async () => {
    const pages = [
      ...services.map((k) => [`/services/${C.services[k].slug}/`, priceOf(C, k, 1, 1)]),
      ...C.areas.map((a) => [`/areas/${a.slug}/`, priceOf(C, "regular", 1, 1)]),
      ...C.neighbourhoods.map((h) => [`/areas/${h.district}/${h.slug}/`, priceOf(C, "regular", 1, 1)]),
      ["/pricing/", priceOf(C, "regular", 1, 1)]
    ];
    const reviewed = C.pricingVersion;
    for (const [pg, from] of pages) {
      const html = read(pg);
      const block = (html.match(/<section class="section answer"[\s\S]*?<\/section>/) || [])[0];
      assert(block, `${pg}: no answer block`);
      const q = words((block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || "");
      const a = words((block.match(/<p class="answer-text">([\s\S]*?)<\/p>/) || [])[1] || "");
      assert(/^How much does .+\?$/.test(q), `${pg}: the heading should be the question: "${q}"`);
      assert(a.includes(money(from)) && a.includes(B.name) && /you pay after the clean/.test(a), `${pg}: the answer should name the price, the business and payment: "${a}"`);
      assert(block.includes(`<time datetime="${reviewed}">`), `${pg}: "Prices reviewed" should be the pricingVersion date`);
      // Near the top: most quoted passages come from the first third of a page.
      const all = mainWords(html), at = all.indexOf(q);
      assert(at > -1 && at / all.length < 0.34, `${pg}: the answer should sit in the first third of the page (at ${Math.round(at / all.length * 100)}%)`);
    }
    // Guides: the answer comes before the article.
    for (const pg of PAGES.filter((x) => /^\/guides\/.+\//.test(x))) {
      const html = read(pg);
      const i = html.indexOf('class="article-answer"'), body = html.indexOf('class="article-body"');
      assert(i > -1 && i < body, `${pg}: the answer should open the article`);
    }
    const guide = read("/guides/house-cleaning-cost-toronto/");
    assert(words(guide).includes("House cleaning prices in Scarborough & North York (2026)") && guide.includes(`Prices reviewed <time datetime="${reviewed}">`), "the price guide is dated and names the districts");
  });

  test("the guarantee is one sentence, word for word, wherever it's promised in full", async () => {
    assert(/\{guarantee\}/.test(C.emails.booking) && /\{guarantee\}/.test(C.emails.bookingCal), "both booking emails carry {guarantee}");
    const full = [...services.map((k) => `/services/${C.services[k].slug}/`), `/services/${C.quoteServices.airbnb.slug}/`, "/policies/", "/help/", "/"];
    for (const pg of full) assert(words(read(pg)).includes(GUARANTEE), `${pg}: should carry the guarantee word for word`);
    // Anywhere the re-clean's window is stated, it's the configured window and one of the two wordings.
    const label = `Free re-clean if reported within ${C.policies.recleanWindowHours} hours`;
    const bad = [];
    for (const pg of PAGES) {
      for (const s of words(read(pg)).split(/(?<=[.!?])\s+/)) {
        if (!/re-?clean/i.test(s)) continue;
        const h = s.match(/within (\d+) hours/);
        if (h && +h[1] !== C.policies.recleanWindowHours) bad.push(`${pg}: ${s}`);
        if (h && !s.includes(GUARANTEE) && !s.includes(label)) bad.push(`${pg}: another wording: "${s.slice(0, 100)}"`);
      }
    }
    assert(!bad.length, bad.join("; "));
  });

  test("the booking review, the done screen and the email carry the guarantee word for word", async ({ browser, url }) => {
    const p = await newPage(browser);
    await toDetails(p, url);
    await fillDetails(p);
    await p.fill("#f-email", "priya@example.com");
    await p.press("#f-email", "Tab");
    const review = (await p.textContent("[data-review] [data-review-guarantee]")).trim();
    assert(review === "Our guarantee. " + GUARANTEE, "review: " + review);
    await p.click("[data-submit]");
    await p.waitForSelector("[data-done]:not([hidden])");
    const done = await p.$$eval("[data-done-list] > div", (ds) => ds.map((d) => [d.querySelector("dt").textContent.trim(), d.querySelector("dd").textContent.trim()]));
    assert(done.some(([k, v]) => k === "Guarantee" && v === GUARANTEE), "done: " + JSON.stringify(done));
    const email = p.posts.at(-1)._autoresponse || "";
    assert(email.includes(GUARANTEE) && !email.includes("{guarantee}"), "email: " + email);
  });
}
