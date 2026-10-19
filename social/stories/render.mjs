// Renders each story in stories.html to a 1080×1920 PNG in this folder.
// Usage: node social/stories/render.mjs   (needs Playwright with Chromium)
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); }

const names = {
  s01: "01-we-clean-you-rest",
  s02: "02-residence-care",
  s03: "03-street-shoes-stay-at-the-door",
  s04: "04-founding-households-20-off",
  s05: "05-three-promises-kept"
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 2000 }, deviceScaleFactor: 1 });
await page.goto("file://" + join(here, "stories.html"));
await page.evaluate(() => document.fonts.ready);
for (const [id, name] of Object.entries(names)) {
  await page.locator("#" + id).screenshot({ path: join(here, name + ".png") });
  console.log(name + ".png");
}
await browser.close();
