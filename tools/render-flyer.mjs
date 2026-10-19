// Renders marketing/flyer/index.html into print and preview files.
// Usage: node tools/render-flyer.mjs
// Needs Playwright with Chromium (npm i -D playwright, or a global install found through NODE_PATH).
//   nest-and-rest-flyer-print.pdf   8.75 x 11.25 in, 0.125 in bleed: send this to a print shop
//   nest-and-rest-flyer-letter.pdf  8.5 x 11 in, no bleed: for a home or office printer
//   flyer-front.png, flyer-back.png 2550 x 3300 (300 dpi at Letter size): previews, email, social
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "marketing/flyer");
const { chromium } = createRequire(import.meta.url)("playwright");

const TYPES = { ".html": "text/html", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}/marketing/flyer/index.html`;

const browser = await chromium.launch();
async function open(classes, scale = 1) {
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: scale });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate((c) => document.documentElement.classList.add(...c), classes);
  await page.evaluate(() => document.fonts.ready);
  return page;
}

let page = await open(["export"]);
await page.pdf({ path: path.join(OUT, "nest-and-rest-flyer-print.pdf"), width: "8.75in", height: "11.25in", printBackground: true });
page = await open(["export", "trim"]);
await page.pdf({ path: path.join(OUT, "nest-and-rest-flyer-letter.pdf"), width: "8.5in", height: "11in", printBackground: true });

page = await open(["export", "trim"], 300 / 96);
const sheets = await page.$$(".sheet");
await sheets[0].screenshot({ path: path.join(OUT, "flyer-front.png") });
await sheets[1].screenshot({ path: path.join(OUT, "flyer-back.png") });

await browser.close();
server.close();
console.log("Flyer files written to marketing/flyer/");
