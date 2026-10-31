// The Airbnb host page (services/airbnb-cleaning/) and the ways into it. Its prices and open decisions live in
// js/config.js (quoteServices.airbnb); anything still null stays off the page: turnovers are quoted through the host form.
import { test, assert, newPage, loadConfig } from "./lib.mjs";

const C = loadConfig();
const H = C.quoteServices.airbnb;
const PAGE = "/services/" + H.slug + "/";

export default async function () {
  test("host page: every section, and the host form sends the listing details", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844, isMobile: true });
    await p.goto(url + PAGE);
    for (const id of ["host-form", "turnover", "includes", "prices", "why", "start", "faq"]) {
      assert(await p.locator("#" + id).count() === 1, "missing section #" + id);
    }
    assert(/Airbnb cleaning in Scarborough & North York/.test(await p.textContent("h1")), "h1: " + (await p.textContent("h1")));
    // Every turnover follows the regular-clean checklist: one card per room that has regular-clean tasks.
    const col = C.services.regular.checklistColumn;
    const want = C.checklist.filter((r) => r.tasks.some((t) => t[col] === "yes")).length;
    const rooms = await p.$$eval(".host-rooms > li", (ls) => ls.length);
    assert(rooms === want, `the checklist should show ${want} rooms, got ${rooms}`);
    await p.fill("#q-name", "Quinn Sample"); await p.fill("#q-phone", "647 555 0199"); await p.fill("#q-postal", "M2N 5W9");
    await p.selectOption("#q-units", "2"); await p.selectOption("#q-times", "11am out, 4pm in");
    await p.click("[data-quote-form] button[type=submit]");
    await p.waitForSelector("[data-quote-done]:not([hidden])");
    const sent = p.posts.at(-1) || {};
    assert(sent["Number of units"] === "2" && sent["Usual checkout and check-in"] === "11am out, 4pm in" && /Airbnb/.test(JSON.stringify(sent)),
      "the request should carry the host's answers and the service, sent: " + JSON.stringify(sent).slice(0, 300));
  });

  test("host page: what isn't decided stays off the page, and turnovers are quoted until prices are set", async ({ browser, url }) => {
    const p = await newPage(browser);
    await p.goto(url + PAGE);
    const text = (await p.textContent("main")).replace(/\s+/g, " ");
    assert(!/\[(PRICE|OFFER|X|PHOTO|to confirm)/.test(text), "no [placeholder] may show on the page");
    const priced = H.prices.some((x) => x.price != null);
    const ld = await p.$$eval('script[type="application/ld+json"]', (ss) => ss.map((s) => s.textContent).join(""));
    if (!priced) {
      assert(/Quoted per unit/.test(text) && /By quote/.test(await p.textContent(".facts")), "without prices the page should say turnovers are quoted per unit");
      assert(!/"offers"/.test(ld), "no price may reach the structured data until one is set");
    }
    for (const [name, v] of [["Linens", H.linens], ["Restocking", H.restock], ["Photos after each turnover", H.photoReport]]) {
      const shown = await p.locator(".host-terms dt", { hasText: name }).count();
      assert(shown === (v ? 1 : 0), `${name} should show only once it's decided in js/config.js`);
    }
  });

  test("host page: an in-area postal check leads to the host form and fills its postal code", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844, isMobile: true });
    await p.goto(url + PAGE);
    await p.fill("#pc-host", "m1b2k3");
    await p.click("#start [data-pc-form] button");
    const a = p.locator("#start [data-pc-result] a.btn");
    assert(await a.getAttribute("href") === "#host-form" && (await a.textContent()).trim() === "Tell me about your listing", "in-area button: " + (await a.getAttribute("href")));
    assert(await p.inputValue("#q-postal") === "M1B 2K3", "the host form's postal code should be filled in, got " + (await p.inputValue("#q-postal")));
    await p.fill("#pc-host", "L3R 0B1");
    await p.click("#start [data-pc-form] button");
    assert(await p.locator('#start [data-pc-result] a[href^="mailto:"]').count() === 1, "out of the area: the waitlist email");
  });

  test("the home page, nav and booking point hosts the right way", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    for (const sel of [".hero-chip", "#services .svc-paths a >> nth=0", "#hosts .host-cta .btn-primary", ".nav-desktop a:has-text('Airbnb hosts')"]) {
      const href = await p.getAttribute(sel, "href");
      assert(href && href.includes(H.slug), `${sel} should link to the host page, got ${href}`);
    }
    await p.goto(url + PAGE);
    assert(await p.getAttribute(".nav-desktop a.is-current", "aria-current") === "page", "the host page's nav link should be current");
    await p.goto(url + "/book/");
    const note = await p.textContent("body");
    assert(/Larger home or an office\? Residence Care and Small Office Cleaning are by quote\./.test(note.replace(/\s+/g, " ")), "the booking note should name only the home and office quote services");
  });
}
