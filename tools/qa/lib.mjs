// Shared helpers for the browser checks in tools/qa. Needs Playwright with Chromium.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// An ES import of playwright fails where it is installed globally; require resolves it.
export const { chromium } = createRequire(import.meta.url)("playwright");
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

// The site's own settings, read the same way tools/build.mjs reads them.
export function loadConfig() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "js/config.js"), "utf8"), sandbox);
  return sandbox.window.NR_CONFIG;
}

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".xml": "application/xml",
  ".txt": "text/plain", ".webmanifest": "application/manifest+json", ".ico": "image/x-icon" };

// Serves the built site from disk, like GitHub Pages: /dir/ is /dir/index.html, anything missing is a 404.
export function startServer(root = ROOT) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = path.join(root, p);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end("Not found"); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((r) => server.close(r))
  })));
}

const openContexts = new Set();
// A fresh page in its own context: theme chosen before load, analytics and the calendar blocked,
// and FormSubmit answered locally (page.posts collects every request body; nothing leaves the machine).
export async function newPage(browser, { width = 1280, height = 900, theme = "light", timezoneId, reducedMotion, isMobile } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, ...(timezoneId ? { timezoneId } : {}), ...(reducedMotion ? { reducedMotion } : {}), ...(isMobile ? { isMobile, hasTouch: true, deviceScaleFactor: 3 } : {}) });
  openContexts.add(ctx);
  ctx.on("close", () => openContexts.delete(ctx));
  await ctx.addInitScript((t) => { try { localStorage.setItem("nr-theme", t); } catch (e) { /* storage off */ } }, theme);
  const page = await ctx.newPage();
  page.posts = [];
  page.deliveryMode = "ok";
  page.sheetMode = "ok";
  page.sheetPosts = [];
  page.sheetRequests = [];
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  await page.route(/googletagmanager|google-analytics|cal\.com/, (r) => r.abort());
  await page.route(/formsubmit\.co/, async (r) => {
    try { page.posts.push(JSON.parse(r.request().postData() || "null")); } catch (e) { page.posts.push(null); }
    const mode = page.deliveryMode;
    if (mode === "empty200") return r.fulfill({ status: 200, body: "" });
    if (mode === "badjson") return r.fulfill({ status: 200, body: "<html>ok</html>" });
    if (mode === "falsy") return r.fulfill({ status: 200, contentType: "application/json", body: '{"success":"false","message":"needs activation"}' });
    if (mode === "neterr") return r.abort();
    return r.fulfill({ status: 200, contentType: "application/json", body: '{"success":"true","message":"The form was submitted successfully."}' });
  });
  await routeSheet(page);
  return page;
}
export function mockDelivery(page, mode) { page.deliveryMode = mode; }
// The booking form folds its optional parts (extras, unusual homes, visit preferences, referral) into sections.
// These open one the way a customer does, by its summary.
export async function openSection(page, name) {
  const sel = `details[data-section="${name}"]`;
  if (!(await page.$eval(sel, (d) => d.open))) await page.click(sel + " > summary");
}
// Arriving from a price box, the service and home sit in one card; Edit opens the full choices.
export async function editHome(page) {
  if (await page.isVisible("[data-picked-edit]")) await page.click("[data-picked-edit]");
}
// The Google Sheet script, answered locally (page.sheetPosts collects every request body).
// ok and dup echo the posted reference; clash answers with a different one, as the script does when a reference is taken.
async function routeSheet(page) {
  await page.route(/script\.google\.com/, async (r) => {
    const req = r.request();
    page.sheetRequests.push({ method: req.method(), headers: req.headers() });
    let body = null;
    try { body = JSON.parse(req.postData() || "null"); } catch (e) { /* recorded as null */ }
    page.sheetPosts.push(body);
    const mode = page.sheetMode, cors = { "Access-Control-Allow-Origin": "*" };
    if (mode === "neterr") return r.abort();
    if (mode === "http500") return r.fulfill({ status: 500, headers: cors, body: "Server error" });
    if (mode === "badjson") return r.fulfill({ status: 200, headers: cors, body: "<html>ok</html>" });
    if (mode === "notok") return r.fulfill({ status: 200, headers: cors, contentType: "application/json", body: '{"ok":false,"error":"Missing: Phone"}' });
    const reference = mode === "clash" ? "NR-ZZ99" : body && body.reference;
    return r.fulfill({ status: 200, headers: cors, contentType: "application/json", body: JSON.stringify({ ok: true, reference, duplicate: mode === "dup" }) });
  });
}
// Serves js/config.js with extra lines appended, e.g. to switch the provider or the founding offer for one test.
export async function withConfig(page, js) {
  const src = fs.readFileSync(path.join(ROOT, "js/config.js"), "utf8") + "\n" + js + "\n";
  await page.route(/\/js\/config\.js/, (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: src }));
}
export async function closeAll() { for (const c of [...openContexts]) await c.close().catch(() => {}); }

// WCAG contrast ratio between two CSS colours. A translucent foreground is laid over the background first.
export function contrast(fg, bg) {
  const parse = (c) => {
    c = String(c).trim();
    if (c.startsWith("#")) {
      const h = c.length === 4 ? c.slice(1).split("").map((x) => x + x).join("") : c.slice(1);
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
    }
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) throw new Error("Can't read colour " + c);
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  };
  const b = parse(bg), f0 = parse(fg);
  const f = [0, 1, 2].map((i) => f0[i] * f0[3] + b[i] * (1 - f0[3]));
  const lum = (rgb) => rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((t, v, i) => t + v * [0.2126, 0.7152, 0.0722][i], 0);
  const [hi, lo] = [lum(f), lum(b.slice(0, 3))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Every piece of visible text in scope, with its colour, the solid colour behind it, and the ratio it needs (3:1 when large).
export const contrastProblems = (p, scope = "body") => p.evaluate((scope) => {
  // The colour behind an element: translucent backgrounds laid over the first solid one beneath them.
  const solid = (el) => {
    const layers = [];
    for (; el; el = el.parentElement) {
      const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
      if (!m) continue;
      const [r, g, b, a = 1] = m.map(Number);
      if (a === 0) continue;
      layers.push([r, g, b, a]);
      if (a === 1) break;
    }
    let base = [255, 255, 255];
    for (const [r, g, b, a] of layers.reverse()) base = [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a)];
    return `rgb(${base.map(Math.round).join(", ")})`;
  };
  const out = [];
  document.querySelectorAll(scope + " :is(h1,h2,h3,p,li,a,button,.btn,.label,.kicker,label,dt,dd,.extra-name,.sum-total,summary,small,strong,span)").forEach((el) => {
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    if (!own || r.width < 2 || r.height < 2 || s.visibility === "hidden" || el.closest("[hidden], .sr-only, [aria-hidden=true]") || +s.opacity < 1) return;
    if (el.matches(":disabled, .is-off *") || el.closest(".announce-msgs > span:not(.is-on)")) return;
    const size = parseFloat(s.fontSize), large = size >= 24 || (size >= 18.66 && +s.fontWeight >= 700);
    out.push({ text: el.textContent.trim().slice(0, 28), tag: el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : ""), fg: s.color, bg: solid(el), min: large ? 3 : 4.5 });
  });
  return out;
}, scope);

export const tests = [];
export function test(name, fn) { tests.push({ name, fn }); }
export function assert(cond, message) { if (!cond) throw new Error(message); }
