// The booking form's large-home route into the Residence Care quote form, and quote dropdowns with no pre-picked answer.
import { test, assert, newPage } from "./lib.mjs";

const KEY = "nr-quote-handoff";
async function largeMoveOut(p, url) {
  await p.goto(url + "/book/?s=move&h=house&bd=3&ba=2");
  await p.fill("#f-postal", "M1P 1A1");
  await p.click('label.extra[data-addon="pets"]');
  await p.click('label.check:has(input[value="halfbath"])');
  await p.click('label.check:has(input[value="large"])');
}
const fields = (p) => p.evaluate(() => ["#q-postal", "#q-frequency", "#q-notes"].map((s) => document.querySelector(s).value));
const record = (minutesAgo) => ({ at: Date.now() - minutesAgo * 60000, service: "Deep Cleaning", home: "House, 3 bedrooms, 2 bathrooms", checks: ["Over about 3,000 sq ft"], extras: [], often: "One time to start", postal: "M1P 1A1" });

export default async function () {
  test("move-out over 3,000 sq ft carries its details to the quote", async ({ browser, url }) => {
    const p = await newPage(browser);
    await largeMoveOut(p, url);
    await p.click("[data-quote-link]");
    await p.waitForLoadState();
    assert(new URL(p.url()).search === "?from=booking", "address: " + p.url());
    const [postal, often, notes] = await fields(p);
    assert(postal === "M1P 1A1", "postal: " + postal);
    assert(often === "One time to start", "how often: " + often);
    assert(notes.startsWith("From the booking form: Move-In / Move-Out Cleaning") && notes.includes("Half bathrooms (powder rooms)") && notes.includes("Heavy pet hair"), "notes: " + notes);
    assert(await p.evaluate((k) => sessionStorage.getItem(k), KEY) === null, "the handoff is deleted once read");
  });

  test("a direct visit to the quote form starts blank", async ({ browser, url }) => {
    const p = await newPage(browser);
    await p.goto(url + "/");
    await p.evaluate(([k, r]) => sessionStorage.setItem(k, JSON.stringify(r)), [KEY, record(1)]);
    await p.goto(url + "/services/residence-care/");
    assert(JSON.stringify(await fields(p)) === '["","",""]', "direct visit: " + JSON.stringify(await fields(p)));
    await p.evaluate((k) => sessionStorage.removeItem(k), KEY);
    await p.goto(url + "/services/residence-care/?from=booking");
    assert(JSON.stringify(await fields(p)) === '["","",""]', "no handoff: " + JSON.stringify(await fields(p)));
  });

  test("an expired handoff is ignored", async ({ browser, url }) => {
    const p = await newPage(browser);
    await p.goto(url + "/");
    await p.evaluate(([k, r]) => sessionStorage.setItem(k, JSON.stringify(r)), [KEY, record(31)]);
    await p.goto(url + "/services/residence-care/?from=booking");
    assert(JSON.stringify(await fields(p)) === '["","",""]', "expired handoff: " + JSON.stringify(await fields(p)));
    assert(await p.evaluate((k) => sessionStorage.getItem(k), KEY) === null, "an expired handoff is still deleted");
  });

  test("blocked storage leaves the quote form working", async ({ browser, url }) => {
    const p = await newPage(browser);
    await p.context().addInitScript(() => { Object.defineProperty(window, "sessionStorage", { get() { throw new Error("blocked"); } }); });
    await largeMoveOut(p, url);
    await p.click("[data-quote-link]");
    await p.waitForLoadState();
    await p.fill("#q-name", "Quinn Sample"); await p.fill("#q-phone", "647 555 0199"); await p.fill("#q-postal", "M1P 1A1");
    await p.click("[data-quote-form] button[type=submit]");
    await p.waitForSelector("[data-quote-done]:not([hidden])");
    assert(!p.errors.length, "page errors: " + p.errors.join(" | "));
  });

  test("quote dropdowns start on Choose one and send Not chosen", async ({ browser, url }) => {
    const p = await newPage(browser);
    for (const page of ["/services/residence-care/", "/services/office-cleaning/", "/realtors/"]) {
      await p.goto(url + page);
      const sel = await p.$$eval("[data-quote-form] select", (ss) => ss.map((s) => [s.name, s.value, s.options[0].text]));
      assert(sel.length && sel.every(([, v, t]) => v === "" && t === "Choose one"), page + ": " + JSON.stringify(sel));
    }
    await p.goto(url + "/services/residence-care/");
    await p.fill("#q-name", "Quinn Sample"); await p.fill("#q-phone", "647 555 0199"); await p.fill("#q-postal", "M2N 5W9");
    await p.click("[data-quote-form] button[type=submit]");
    await p.waitForSelector("[data-quote-done]:not([hidden])");
    assert(p.posts[0]["How often"] === "Not chosen" && p.posts[0]["Special surfaces"] === "Not chosen", "sent: " + JSON.stringify(p.posts[0]));
  });

  test("no home details in page addresses", async ({ browser, url }) => {
    const p = await newPage(browser);
    await largeMoveOut(p, url);
    const href = await p.getAttribute("[data-quote-link]", "href");
    assert(!/M1P|notes=/.test(href), "quote link: " + href);
    await p.click("[data-quote-link]");
    await p.waitForLoadState();
    assert(!/M1P|notes=/.test(p.url()), "address: " + p.url());
    const layer = await p.evaluate(() => JSON.stringify((window.dataLayer || []).map((a) => Array.from(a))));
    assert(!/M1P|notes=/.test(layer), "analytics: " + layer.slice(0, 200));
  });
}
