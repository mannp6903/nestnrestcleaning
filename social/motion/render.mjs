// Renders the scenes in motion.html to MP4 (H.264, 30 fps) and cover PNGs.
//   node social/motion/render.mjs                 all five videos + covers
//   node social/motion/render.mjs v2 v4           only those
//   node social/motion/render.mjs --stills v1:0.5,2.2 v3:1.9 --out DIR   still frames for review
// Needs Playwright (Chromium) and ffmpeg with libx264.
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); }

const FPS = 30;
const names = {
  v1: "01-is-your-screen-dirty",
  v2: "02-you-vs-us",
  v3: "03-shoes-off",
  v4: "04-only-50",
  v5: "05-price-in-seconds"
};
const coverAt = { v1: 0.95, v2: 7.4, v3: 2.5, v4: 2.3, v5: 4.9 };

const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const outDir = outIdx > -1 ? args.splice(outIdx, 2)[1] : here;
const stills = args[0] === "--stills" ? args.slice(1) : null;
const ids = stills ? [] : (args.length ? args : Object.keys(names));
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto("file://" + join(here, "motion.html"));
await page.evaluate(() => window.ready);
const durations = await page.evaluate(() => window.durations());
const clip = { x: 0, y: 0, width: 1080, height: 1920 };

if (stills) {
  for (const spec of stills) {
    const [id, times] = spec.split(":");
    for (const t of times.split(",").map(Number)) {
      await page.evaluate(([id, t]) => window.seek(id, t, Math.round(t * 30)), [id, t]);
      const file = join(outDir, `${id}-${t.toFixed(2)}.png`);
      await page.screenshot({ path: file, clip });
      console.log(file);
    }
  }
}

for (const id of ids) {
  const frames = Math.round(durations[id] * FPS);
  const out = join(outDir, names[id] + ".mp4");
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) => ff.on("close", c => c === 0 ? res() : rej(new Error("ffmpeg exited " + c))));
  for (let f = 0; f < frames; f++) {
    await page.evaluate(([id, t, f]) => window.seek(id, t, f), [id, f / FPS, f]);
    const buf = await page.screenshot({ clip, type: "jpeg", quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
  }
  ff.stdin.end();
  await done;
  await page.evaluate(([id, t]) => window.seek(id, t, 0), [id, coverAt[id]]);
  await page.screenshot({ path: join(outDir, names[id] + "-cover.png"), clip });
  console.log(out);
}
await browser.close();
