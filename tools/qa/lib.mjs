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
  return page;
}
export function mockDelivery(page, mode) { page.deliveryMode = mode; }
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
  const [hi, lo] = [lum(f), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export const tests = [];
export function test(name, fn) { tests.push({ name, fn }); }
export function assert(cond, message) { if (!cond) throw new Error(message); }
