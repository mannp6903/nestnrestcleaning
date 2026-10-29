// The website's forms talking to the Google Sheet script (answered locally; nothing leaves the machine).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { test, assert, newPage, mockDelivery, withConfig, ROOT } from "./lib.mjs";
import { toDetails, fillDetails } from "./booking.test.mjs";

const SHEET = 'window.NR_CONFIG.delivery = { provider: "sheet", endpoint: "https://script.google.com/macros/s/TEST/exec" };';
const REF = /^(NR|GIFT)-[A-Z0-9]{4}$/;

async function sheetBooking(browser, url, mode = "ok") {
  const p = await newPage(browser);
  await withConfig(p, SHEET);
  p.sheetMode = mode;
  await toDetails(p, url);
  await fillDetails(p);
  return p;
}

export default async function () {
  test("sheet booking shows the reference the sheet returns", async ({ browser, url }) => {
    const p = await sheetBooking(browser, url, "clash");
    await p.click("[data-submit]");
    await p.waitForSelector("[data-done]:not([hidden])");
    assert((await p.textContent("[data-ref]")).trim() === "NR-ZZ99", "shown reference: " + await p.textContent("[data-ref]"));
    assert((await p.textContent("[data-done-label]")).trim() === "Request received · not confirmed yet", "label: " + await p.textContent("[data-done-label]"));
    assert((await p.textContent(".book-head h1")).trim() === "Request received", "heading: " + await p.textContent(".book-head h1"));
  });

  test("sheet failures never show received", async ({ browser, url }) => {
    const p = await sheetBooking(browser, url);
    for (const mode of ["notok", "badjson", "http500", "neterr"]) {
      p.sheetMode = mode;
      await p.click("[data-submit]");
      await p.waitForSelector("[data-form-error]:not([hidden])");
      await p.waitForTimeout(100);
      assert(await p.isHidden("[data-done]"), `mode ${mode} must not show the done screen`);
    }
    assert(p.sheetPosts.length === 4, "one post per try, got " + p.sheetPosts.length);
  });

  test("retries reuse the reference and attempt", async ({ browser, url }) => {
    const p = await sheetBooking(browser, url, "neterr");
    for (const mode of ["neterr", "neterr", "ok"]) {
      p.sheetMode = mode;
      await p.click("[data-submit]");
      await p.waitForTimeout(200);
    }
    await p.waitForSelector("[data-done]:not([hidden])");
    const refs = new Set(p.sheetPosts.map((x) => x.reference)), atts = new Set(p.sheetPosts.map((x) => x.attempt));
    assert(p.sheetPosts.length === 3 && refs.size === 1 && atts.size === 1, "posts: " + JSON.stringify(p.sheetPosts.map((x) => [x.reference, x.attempt])));
    assert(/^[A-Za-z0-9]{20}$/.test([...atts][0]), "attempt format: " + [...atts][0]);
    const first = [...atts][0];
    await toDetails(p, url);
    await fillDetails(p);
    await p.click("[data-submit]");
    await p.waitForSelector("[data-done]:not([hidden])");
    assert(p.sheetPosts.at(-1).attempt !== first, "the next booking is a new attempt");
  });

  test("sheet request is a simple CORS request", async ({ browser, url }) => {
    const p = await sheetBooking(browser, url);
    await p.fill("#f-email", "p@example.com");
    await p.click("[data-submit]");
    await p.waitForSelector("[data-done]:not([hidden])");
    const req = p.sheetRequests[0], body = p.sheetPosts[0];
    assert(req.method === "POST" && req.headers["content-type"] === "text/plain;charset=utf-8", "request: " + JSON.stringify(req));
    const custom = Object.keys(req.headers).filter((h) => !/^(accept|accept-language|content-language|content-type|origin|referer|user-agent|sec-.*)$/.test(h));
    assert(!custom.length, "headers that would force a preflight: " + custom.join(", "));
    assert(body.form === "booking" && REF.test(body.reference) && body.email === "p@example.com" && body.honey === "", "payload: " + JSON.stringify({ ...body, fields: undefined }));
    const bad = Object.keys(body.fields).filter((k) => k[0] === "_" || k === "email" || k === "Reference" || k === "Status");
    assert(!bad.length && body.fields.Name === "Priya Sample" && body.fields.Address === "1 Example St, Unit 1", "fields: " + JSON.stringify(body.fields));
  });

  test("double submit sends one attempt", async ({ browser, url }) => {
    const p = await sheetBooking(browser, url);
    await p.evaluate(() => { const f = document.querySelector("#booking-form"); f.requestSubmit(); f.requestSubmit(); });
    await p.waitForSelector("[data-done]:not([hidden])");
    await p.waitForTimeout(200);
    const atts = new Set(p.sheetPosts.map((x) => x && x.attempt));
    assert(p.sheetPosts.length >= 1 && atts.size === 1, "attempts: " + JSON.stringify([...atts]));
  });

  test("every form sends its form name", async ({ browser, url }) => {
    const p = await newPage(browser);
    await withConfig(p, SHEET);
    await p.goto(url + "/services/residence-care/");
    await p.fill("#q-name", "Quinn Sample"); await p.fill("#q-phone", "647 555 0199"); await p.fill("#q-postal", "M2N 5W9");
    await p.click("[data-quote-form] button[type=submit]");
    await p.waitForSelector("[data-quote-done]:not([hidden])");
    await p.goto(url + "/gift/");
    await p.fill("#g-name", "Gale Sample"); await p.fill("#g-phone", "647 555 0100"); await p.fill("#g-email", "g@example.com"); await p.fill("#g-to", "Pat");
    await p.click("[data-gift-form] button[type=submit]");
    await p.waitForSelector("[data-gift-done]:not([hidden])");
    await p.goto(url + "/review/");
    await p.click('label[for="r5"]'); await p.fill("#rv-name", "Rae S."); await p.fill("#rv-text", "Lovely careful clean, thank you."); await p.fill("#rv-contact", "647 555 0111");
    await p.click("[data-review-form] button[type=submit]");
    await p.waitForSelector("[data-review-done]:not([hidden])");
    await p.goto(url + "/");
    await p.click("[data-textme-open] >> nth=0");
    await p.fill("[data-textme-phone] >> nth=0", "647 555 0122");
    await p.click("[data-textme-send] >> nth=0");
    await p.waitForSelector(".textme.is-sent");
    const forms = p.sheetPosts.map((x) => x.form);
    assert(JSON.stringify(forms) === '["quote","gift","review","pricetext"]', "forms: " + JSON.stringify(forms));
    assert(p.sheetPosts.every((x) => REF.test(x.reference) && /^[A-Za-z0-9]{20}$/.test(x.attempt)), "ids: " + JSON.stringify(p.sheetPosts.map((x) => [x.reference, x.attempt])));
    assert(p.sheetPosts[1].reference.startsWith("GIFT-") && p.sheetPosts[1].email === "g@example.com", "gift ids: " + JSON.stringify(p.sheetPosts[1]));
  });

  test("gift retry keeps its reference", async ({ browser, url }) => {
    const p = await newPage(browser);
    await withConfig(p, SHEET);
    await p.goto(url + "/gift/");
    await p.fill("#g-name", "Gale Sample"); await p.fill("#g-phone", "647 555 0100"); await p.fill("#g-email", "g@example.com"); await p.fill("#g-to", "Pat");
    p.sheetMode = "neterr";
    await p.click("[data-gift-form] button[type=submit]");
    await p.waitForSelector("[data-gift-error]:not([hidden])");
    p.sheetMode = "ok";
    await p.click("[data-gift-form] button[type=submit]");
    await p.waitForSelector("[data-gift-done]:not([hidden])");
    const [a, b] = p.sheetPosts;
    assert(a.reference === b.reference && a.attempt === b.attempt, "gift tries: " + JSON.stringify([a.reference, a.attempt, b.reference, b.attempt]));
    assert((await p.textContent("[data-gd-ref]")).trim() === b.reference, "shown gift reference");
  });

  test("retry message promises matching, not prevention", async ({ browser, url }) => {
    const p = await newPage(browser);
    await toDetails(p, url);
    await fillDetails(p);
    mockDelivery(p, "neterr");
    await p.click("[data-submit]");
    await p.waitForSelector("[data-form-error]:not([hidden])");
    const msg = await p.textContent("[data-form-error]");
    assert(/so if both reach us, Mann will match them up as one request\./.test(msg) && !/can't become two bookings/.test(msg), "message: " + msg);
  });

  test("privacy wording follows the provider", async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "nr-sheet-"));
    try {
      execFileSync(process.execPath, [path.join(ROOT, "tools/build.mjs"), "--preview", tmp], { env: { ...process.env, NR_PROVIDER: "sheet" }, stdio: "ignore" });
      for (const f of ["book/index.html", "gift/index.html", "services/residence-care/index.html"]) {
        const html = fs.readFileSync(path.join(tmp, f), "utf8");
        assert(html.includes("saved to our Google Sheet and emailed to our Gmail inbox (both Google)") && !html.includes("FormSubmit"), f + " should name the sheet, not FormSubmit");
      }
      const privacy = fs.readFileSync(path.join(tmp, "privacy/index.html"), "utf8");
      assert(privacy.includes("Google Sheets and Gmail") && !privacy.includes("FormSubmit"), "the privacy page names the sheet");
      assert(fs.readFileSync(path.join(ROOT, "book/index.html"), "utf8").includes("FormSubmit"), "the site as built today still names FormSubmit");
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
}
