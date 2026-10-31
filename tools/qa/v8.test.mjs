// v8 (a tighter site): the desktop hero as one composition, a shorter home page, a change request form on the help
// page, and the same words everywhere ("Request a clean"; the re-clean guarantee's hours are for reporting what was missed).
import fs from "node:fs";
import path from "node:path";
import { test, assert, newPage, mockDelivery, ROOT } from "./lib.mjs";
import { loadScript } from "./gas-fakes.mjs";

const PAGES = [...fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8").matchAll(/<loc>[^<]*?nestnrestcleaning\.com([^<]*)<\/loc>/g)].map((m) => m[1] || "/");

export default async function () {
  test("desktop hero: headline, landmark art, main button and price box all on the first screen", async ({ browser, url }) => {
    for (const [width, height] of [[1440, 900], [1280, 800]]) {
      const p = await newPage(browser, { width, height });
      await p.goto(url + "/");
      const b = await p.evaluate(() => {
        const r = (s) => { const e = document.querySelector(s).getBoundingClientRect(); return { top: Math.round(e.top), bottom: Math.round(e.bottom) }; };
        return { h1: r(".hero-home h1"), art: r(".hero-scene svg"), cta: r(".hero-cta .btn-primary"), go: r(".hero-home [data-p-go]"), box: r(".hero-home .pricer") };
      });
      for (const k of ["h1", "art", "cta", "go"]) assert(b[k].top >= 0 && b[k].bottom <= height, `${width}x${height}: ${k} should be on the first screen: ${JSON.stringify(b)}`);
      // One composition: the art's foot sits level with the price box's (within 80px), not a screen below it.
      assert(Math.abs(b.art.bottom - b.box.bottom) <= 80, `${width}x${height}: the art and the price box should end together: ${JSON.stringify(b)}`);
      await p.context().close();
    }
  });

  test("the home page stays short: no more than 10 desktop screens, 16.5 phone screens", async ({ browser, url }) => {
    for (const [width, height, max, mobile] of [[1440, 900, 10, false], [390, 844, 16.5, true]]) {
      const p = await newPage(browser, { width, height, isMobile: mobile });
      await p.goto(url + "/");
      const screens = (await p.evaluate(() => document.documentElement.scrollHeight)) / height;
      assert(screens <= max, `${width}px: the home page is ${screens.toFixed(1)} screens tall (budget ${max})`);
      await p.context().close();
    }
  });

  test("help page: a change request with the reference, the change and one way to reply", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844, isMobile: true });
    await p.goto(url + "/help/");
    assert(await p.locator('#manage a[href^="mailto:"]').count() >= 2, "email stays as another way to change or cancel");
    assert(await p.isVisible("#c-phone") && !(await p.isVisible("#c-email")), "Text is the default reply, so the mobile number is asked for");
    await p.click("[data-change-form] button[type=submit]");
    const errs = await p.$$eval("[data-change-form] .invalid", (es) => es.map((e) => e.id));
    assert(JSON.stringify(errs) === JSON.stringify(["c-ref", "c-name", "c-change", "c-phone"]) && await p.evaluate(() => document.activeElement.id) === "c-ref",
      "an empty form points at each missing answer, starting with the reference: " + errs);
    await p.fill("#c-ref", "nr-7k2p"); await p.fill("#c-name", "Rowan Sample");
    await p.click('[data-change-form] label:has(input[value="Change the day or time"])');
    await p.fill("#c-change", "Move it to Saturday afternoon");
    await p.fill("#c-phone", "647 555 0188");
    await p.click("[data-change-form] button[type=submit]");
    await p.waitForSelector("[data-change-done]:not([hidden])");
    const sent = p.posts.at(-1) || {};
    assert(sent["Booking reference"] === "NR-7K2P" && sent.Request === "Change the day or time" && sent["Requested change"] === "Move it to Saturday afternoon" &&
      sent["Reply by"] === "Text" && sent.Phone === "647 555 0188" && !("Email" in sent) && /NR-7K2P/.test(sent._subject), "sent: " + JSON.stringify(sent));
    const done = (await p.textContent("[data-change-done]")).replace(/\s+/g, " ");
    assert(/not changed yet/.test(done) && /Your booking stays as it is until Mann confirms the change with you\./.test(done) && /by text/.test(done), "the confirmation says nothing has changed yet: " + done);
    await p.context().close();
  });

  test("help page: reply by email asks for the email only; a cancel needs no note; a failed send offers email", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/help/");
    await p.click('[data-change-form] label:has(input[value="Email"])');
    assert(await p.isVisible("#c-email") && !(await p.isVisible("#c-phone")), "Email shows the email field instead of the mobile");
    await p.click('[data-change-form] label:has(input[value="Cancel"])');
    await p.fill("#c-ref", "7K2P"); await p.fill("#c-name", "Rowan Sample"); await p.fill("#c-email", "rowan@example.com");
    mockDelivery(p, "neterr");
    await p.click("[data-change-form] button[type=submit]");
    await p.waitForSelector("[data-c-error]:not([hidden]) a[href^='mailto:']");
    const href = await p.getAttribute("[data-c-error] a", "href");
    assert(/NR-7K2P/.test(decodeURIComponent(href)) && /Please cancel this booking/.test(decodeURIComponent(href)), "the email fallback carries the request: " + href);
    assert(!(await p.isVisible("[data-change-done]")), "nothing says sent when it wasn't");
    mockDelivery(p, "ok");
    await p.click("[data-change-form] button[type=submit]");
    await p.waitForSelector("[data-change-done]:not([hidden])");
    const sent = p.posts.at(-1) || {};
    assert(sent.Request === "Cancel" && sent.Email === "rowan@example.com" && sent._replyto === "rowan@example.com" && !("Phone" in sent), "sent: " + JSON.stringify(sent));
    assert(p.errors.length === 0, "no script errors: " + p.errors.join("; "));
  });

  test("the sheet saves change requests in their own tab", async () => {
    const g = loadScript(); g.ctx.setup();
    const ok = g.ctx.handleRequest_({ form: "change", reference: "NR-CH01", attempt: "changeattempt00001", honey: "", email: "",
      fields: { "Booking reference": "NR-7K2P", Request: "Cancel", "Requested change": "Please cancel this booking.", Name: "Rowan", "Reply by": "Text", Phone: "647 555 0188" } });
    assert(ok.ok === true, "saved: " + JSON.stringify(ok));
    const row = g.sheet("Changes").rows[0];
    assert(row && row["Booking reference"] === "NR-7K2P" && row.Status === "Received", "row: " + JSON.stringify(row));
    const no = g.ctx.handleRequest_({ form: "change", reference: "NR-CH02", attempt: "changeattempt00002", honey: "", email: "", fields: { "Booking reference": "NR-7K2P", Name: "Rowan", "Requested change": "x" } });
    assert(no.ok === false, "a change request with no way to reply is refused");
  });

  test("one vocabulary: Request a clean, and the guarantee's hours are for reporting", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    await p.fill("#pc-home", "M1B 2K3"); await p.press("#pc-home", "Enter");
    assert((await p.textContent("#pc-home ~ [data-pc-result] a.btn, [data-pc-form] [data-pc-result] a.btn")).trim() === "Request a clean", "in-area postal check says Request a clean");
    assert((await p.textContent("#rooms .section-head .muted")).trim() === "Choose a service and room to see what we clean.", "room explorer introduction");
    const bad = [];
    for (const pg of PAGES) {
      await p.goto(url + pg);
      const text = await p.evaluate(() => document.body.innerText);
      if (/Book now/i.test(text)) bad.push(`${pg}: "Book now"`);
      // Every sentence that puts the re-clean and its time window together says the hours are for reporting.
      const sentences = text.split(/\n+/).flatMap((line) => line.split(/(?<=[.!?])\s+/));
      for (const s of sentences.filter((x) => /re-?clean/i.test(x) && /within \d+ hours/.test(x))) {
        if (!/report/i.test(s)) bad.push(`${pg}: "${s.slice(0, 90)}"`);
      }
    }
    assert(!bad.length, bad.join("; "));
  });
}
