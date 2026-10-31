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
    await p.selectOption("#q-units", "2");
    await p.click("[data-q-next]");
    await p.selectOption("#q-times", "11am out, 4pm in");
    await p.click("[data-quote-form] button[type=submit]");
    await p.waitForSelector("[data-quote-done]:not([hidden])");
    const sent = p.posts.at(-1) || {};
    assert(sent["Number of units"] === "2" && sent["Usual checkout and check-in"] === "11am out, 4pm in" && /Airbnb/.test(JSON.stringify(sent)),
      "the request should carry the host's answers and the service, sent: " + JSON.stringify(sent).slice(0, 300));
  });

  test("host form: two short steps with progress, and going back keeps every answer", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844, isMobile: true });
    await p.goto(url + PAGE);
    const state = () => p.evaluate(() => ({
      one: !document.querySelector('[data-q-step="1"]').hidden, two: !document.querySelector('[data-q-step="2"]').hidden,
      next: !document.querySelector("[data-q-next]").hidden, back: !document.querySelector("[data-q-back]").hidden,
      send: !document.querySelector("[data-q-submit]").hidden,
      current: (document.querySelector('[data-q-progress] [aria-current="step"]') || {}).textContent,
      focus: document.activeElement && (document.activeElement.id || document.activeElement.className)
    }));
    let s = await state();
    assert(s.one && !s.two && s.next && !s.back && !s.send && /You and your listing/.test(s.current), "starts on step 1 of 2: " + JSON.stringify(s));
    // Step 1 is contact and property only; turnovers and linens wait for step 2.
    const ids = (n) => p.$$eval(`[data-q-step="${n}"] input:not(.hp), [data-q-step="${n}"] select, [data-q-step="${n}"] textarea`, (es) => es.map((e) => e.id));
    assert(JSON.stringify(await ids(1)) === JSON.stringify(["q-name", "q-phone", "q-email", "q-postal", "q-units", "q-bedrooms"]), "step 1 fields: " + await ids(1));
    assert(JSON.stringify(await ids(2)) === JSON.stringify(["q-turnovers", "q-times", "q-linens", "q-calendar", "q-notes"]), "step 2 fields: " + await ids(2));
    await p.click("[data-q-next]");
    s = await state();
    assert(s.one && !s.two && s.focus === "q-name" && await p.isVisible("[data-q-error]"), "an empty step 1 stays put and points at the name: " + JSON.stringify(s));
    await p.fill("#q-name", "Quinn Sample"); await p.fill("#q-phone", "647 555 0199"); await p.fill("#q-postal", "m2n5w9");
    await p.selectOption("#q-units", "3 to 5"); await p.selectOption("#q-bedrooms", "2");
    await p.press("#q-postal", "Enter");
    s = await state();
    assert(!s.one && s.two && !s.next && s.back && s.send && /Turnovers and linens/.test(s.current) && /q-step-title/.test(s.focus), "Enter moves to step 2: " + JSON.stringify(s));
    assert(p.posts.length === 0, "nothing is sent until step 2");
    await p.selectOption("#q-times", "It varies"); await p.selectOption("#q-linens", "I'd like them washed for me");
    await p.click("[data-q-back]");
    s = await state();
    assert(s.one && !s.two && /q-step-title/.test(s.focus), "Back shows step 1: " + JSON.stringify(s));
    assert(await p.inputValue("#q-name") === "Quinn Sample" && await p.inputValue("#q-units") === "3 to 5", "step 1 answers are kept");
    await p.click("[data-q-next]");
    assert(await p.inputValue("#q-times") === "It varies" && await p.inputValue("#q-linens") === "I'd like them washed for me", "step 2 answers are kept");
    // The browser's Back button returns to step 1 on the same page; Forward goes to step 2 again.
    await p.goBack();
    s = await state();
    assert(p.url().includes(PAGE) && s.one && !s.two, "browser Back returns to step 1, not off the page: " + p.url() + " " + JSON.stringify(s));
    await p.goForward();
    s = await state();
    assert(s.two && !s.one && await p.inputValue("#q-times") === "It varies", "browser Forward returns to step 2 with its answers");
    await p.click("[data-q-submit]");
    await p.waitForSelector("[data-quote-done]:not([hidden])");
    const sent = p.posts.at(-1) || {};
    assert(sent.Name === "Quinn Sample" && sent["Number of units"] === "3 to 5" && sent["Usual checkout and check-in"] === "It varies" && sent.Linens === "I'd like them washed for me",
      "both steps are sent together: " + JSON.stringify(sent).slice(0, 300));
    const stored = JSON.stringify(await p.evaluate(() => ({ ...localStorage, ...sessionStorage })));
    assert(!stored.includes("Quinn") && !stored.includes("647 555"), "no answer is stored in the browser: " + stored.slice(0, 200));
    await p.context().close();
    // Without JavaScript: both steps show, one after the other, with the send button.
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const q = await ctx.newPage();
    await q.goto(url + PAGE);
    assert(await q.isVisible('[data-q-step="1"]') && await q.isVisible('[data-q-step="2"]') && await q.isVisible("[data-q-submit]") && !(await q.isVisible("[data-q-next]")), "no JavaScript: one long form");
    await ctx.close();
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
