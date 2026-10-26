// The website's forms, in a real browser: what they send to the Google script, and that FormSubmit still works as before.
// Runs against the built site in the repo root (node tools/build.mjs). Skipped where Playwright isn't installed.
import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { site } from "./load.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const GOOGLE = "https://script.google.com/macros/s/TEST/exec";
let playwright = null;
try { playwright = createRequire(import.meta.url)("playwright"); } catch { playwright = null; }

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json" };

function serve() {
  const server = http.createServer((req, res) => {
    let file = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

// Opens a page with outside requests blocked, the form endpoint answered, and (for "google") the config switched over.
async function openPage(browser, base, provider) {
  const page = await browser.newPage();
  const sent = [];
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  const answer = (route) => {
    const req = route.request();
    if (req.method() === "POST") sent.push({ url: req.url(), contentType: req.headers()["content-type"] || "", body: JSON.parse(req.postData()) });
    return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" }, body: '{"success":"true"}' });
  };
  await page.route("https://formsubmit.co/**", answer);
  await page.route("https://script.google.com/**", answer);
  if (provider === "google") {
    await page.route("**/js/config.js*", async (route) => {
      const res = await route.fetch();
      await route.fulfill({ response: res, body: (await res.text()) + `\nwindow.NR_CONFIG.delivery = { provider: "google", endpoint: "${GOOGLE}" };\n` });
    });
  }
  return { page, sent };
}

// What the website really sends must pass the script's own checks, join the client list, and get a confirmation.
function acceptedByScript(body) {
  assert.deepEqual({ ...checkRequest(body) }, { ok: true, spam: false });
  assert.equal(leadProblem(body, site), "");
  const { email, problem } = confirmationEmail(body, site);
  assert.equal(problem, "");
  assert.ok(email && email.to === body._replyto);
}

async function sendQuote(page, base) {
  await page.goto(base + "/services/residence-care/");
  await page.fill("#q-name", "Lee Chen");
  await page.fill("#q-phone", "647 555 0199");
  await page.fill("#q-email", "lee@example.com");
  await page.fill("#q-postal", "M2N 1A1");
  await page.fill("#q-notes", "Marble floors");
  await page.click("[data-quote-form] button[type=submit]");
  await page.waitForSelector("[data-quote-done]:not([hidden])", { timeout: 5000 });
}

test("the website's forms", { skip: !playwright && "Playwright isn't installed" }, async (t) => {
  const server = await serve();
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await playwright.chromium.launch();
  try {
    await t.test("quote form sends to the Google script", async () => {
      const { page, sent } = await openPage(browser, base, "google");
      await sendQuote(page, base);
      assert.equal(sent.length, 1);
      const { url, contentType, body } = sent[0];
      assert.equal(url, GOOGLE);
      assert.match(contentType, /^text\/plain/);
      assert.equal(body._form, "quote");
      assert.deepEqual(body._confirm, { tpl: "quote", vals: { name: "Lee", reply: "within one business day" } });
      assert.equal(body.Name, "Lee Chen");
      assert.equal(body.email, "lee@example.com");
      assert.equal(body._replyto, "lee@example.com");
      assert.equal(body.Service, "Residence Care");
      assert.equal(body.Notes, "Marble floors");
      for (const k of ["_autoresponse", "_template", "_captcha"]) assert.ok(!(k in body), k);
      acceptedByScript(body);
      await page.close();
    });

    await t.test("booking form sends to the Google script", async () => {
      const { page, sent } = await openPage(browser, base, "google");
      await page.goto(base + "/book/");
      await page.fill("#f-postal", "M1B 2K3");
      await page.check("input[name=service][value=deep]", { force: true });
      await page.check("input[name=homeType][value=condo]", { force: true });
      await page.click("[data-next]");
      await page.check("#flex-date", { force: true });
      await page.check("input[name=slot][value=morning]", { force: true });
      await page.click("[data-next]");
      await page.fill("#f-name", "Priya Sharma");
      await page.fill("#f-phone", "647 555 0123");
      await page.fill("#f-email", "priya@example.com");
      await page.fill("#f-address", "12 Example St");
      await page.fill("#f-notes", "The kitchen is the priority");
      await page.click("[data-submit]");
      await page.waitForSelector("[data-done]:not([hidden])", { timeout: 5000 });
      assert.equal(sent.length, 1);
      const { contentType, body } = sent[0];
      assert.match(contentType, /^text\/plain/);
      assert.equal(body._form, "booking");
      assert.equal(body._confirm.tpl, "booking");
      assert.equal(body._confirm.vals.name, "Priya");
      assert.equal(body._confirm.vals.ref, body.Reference);
      assert.match(body.Reference, /^NR-[A-Z2-9]{4}$/);
      assert.ok(body._confirm.vals.items.length > 0 && body._confirm.vals.summary.length > 0);
      assert.equal(body.Notes, "The kitchen is the priority");
      assert.ok(!("_autoresponse" in body));
      acceptedByScript(body);
      await page.close();
    });

    await t.test("gift card form sends to the Google script", async () => {
      const { page, sent } = await openPage(browser, base, "google");
      await page.goto(base + "/gift/");
      await page.fill("#g-name", "Ana Silva");
      await page.fill("#g-phone", "647 555 0144");
      await page.fill("#g-email", "ana@example.com");
      await page.fill("#g-to", "Rosa");
      await page.click("[data-gift-form] button[type=submit]");
      await page.waitForFunction(() => document.querySelector("[data-gift-form]").hidden, null, { timeout: 5000 });
      assert.equal(sent.length, 1);
      const { contentType, body } = sent[0];
      assert.match(contentType, /^text\/plain/);
      assert.equal(body._form, "gift");
      assert.equal(body._confirm.tpl, "gift");
      assert.equal(body._confirm.vals.name, "Ana");
      assert.equal(body._confirm.vals.ref, body.Reference);
      assert.match(body._subject, /^New gift card request GIFT-[A-Z0-9]{4}: \$150$/);
      assert.equal(body._replyto, "ana@example.com");
      assert.ok(!("_autoresponse" in body));
      acceptedByScript(body);
      await page.close();
    });

    await t.test("with FormSubmit, nothing changes", async () => {
      const { page, sent } = await openPage(browser, base, "formsubmit");
      await sendQuote(page, base);
      assert.equal(sent.length, 1);
      const { url, contentType, body } = sent[0];
      assert.match(url, /^https:\/\/formsubmit\.co\//);
      assert.match(contentType, /^application\/json/);
      assert.ok(typeof body._autoresponse === "string" && body._autoresponse.length > 0);
      assert.ok(!("_form" in body) && !("_confirm" in body));
      await page.close();
    });
  } finally {
    await browser.close();
    server.close();
  }
});
