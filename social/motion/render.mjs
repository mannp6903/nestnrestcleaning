// Renders the scenes in motion.html to finished MP4s with sound, plus cover PNGs.
//   node social/motion/render.mjs                 all five videos
//   node social/motion/render.mjs v2 v4           only those
//   node social/motion/render.mjs --fast v1       quick preview (no motion blur, JPEG frames)
//   node social/motion/render.mjs --stills v1:0.5,2.2 v3:1.9 --out DIR   still frames for review
//
// Quality: lossless PNG frames, 4-sample motion blur (180° shutter), BT.709 colour, H.264 High
// at CRF 14 (about 10–20 Mbps), 30 fps, 1080×1920. Audio: original soundtrack from audio.py,
// -14 LUFS, AAC 320 kbps, 48 kHz stereo.
// Needs Playwright (Chromium), ffmpeg with libx264, and python3 with numpy + scipy.
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); }

const FPS = 30;
const SUB = 4;                 // motion-blur samples per frame
const SHUTTER = 0.5;           // 180° shutter: samples span half a frame
const PARALLEL = 3;
const names = {
  v1: "01-is-your-screen-dirty",
  v2: "02-you-vs-us",
  v3: "03-shoes-off",
  v4: "04-only-50",
  v5: "05-price-in-seconds"
};
const coverAt = { v1: 0.95, v2: 7.4, v3: 2.5, v4: 2.3, v5: 4.9 };

const args = process.argv.slice(2);
const flag = f => { const i = args.indexOf(f); if (i > -1) args.splice(i, 1); return i > -1; };
const fast = flag("--fast");
const outIdx = args.indexOf("--out");
const outDir = outIdx > -1 ? args.splice(outIdx, 2)[1] : here;
const stills = args[0] === "--stills" ? args.slice(1) : null;
const ids = stills ? [] : (args.length ? args : Object.keys(names));
mkdirSync(outDir, { recursive: true });
const work = mkdtempSync(join(tmpdir(), "nr-motion-"));

const run = (cmd, argv, opts = {}) => new Promise((res, rej) => {
  const p = spawn(cmd, argv, { stdio: ["ignore", "inherit", "inherit"], ...opts });
  p.on("close", c => c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`)));
});

const browser = await chromium.launch();
const clip = { x: 0, y: 0, width: 1080, height: 1920 };
async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto("file://" + join(here, "motion.html"));
  await page.evaluate(() => window.ready);
  return page;
}

const first = await openPage();
const durations = await first.evaluate(() => window.durations());

if (stills) {
  for (const spec of stills) {
    const [id, times] = spec.split(":");
    for (const t of times.split(",").map(Number)) {
      await first.evaluate(([id, t]) => window.seek(id, t, Math.round(t * 30)), [id, t]);
      const file = join(outDir, `${id}-${t.toFixed(2)}.png`);
      await first.screenshot({ path: file, clip });
      console.log(file);
    }
  }
}

if (ids.length) {
  // 1. Soundtrack (fast, so it runs first)
  const plan = await first.evaluate(() => window.audioPlan());
  writeFileSync(join(work, "plan.json"), JSON.stringify(plan));
  await run("python3", [join(here, "audio.py"), join(work, "plan.json"), work, ...ids]);

  // 2. Picture, then mux
  async function renderVideo(page, id) {
    const frames = Math.round(durations[id] * FPS);
    const sub = fast ? 1 : SUB;
    const silent = join(work, id + "-video.mp4");
    const vf = [
      ...(sub > 1 ? [`tmix=frames=${sub}:weights=${Array(sub).fill(1).join(" ")}`, `select='eq(mod(n\\,${sub})\\,${sub - 1})'`, `setpts=N/(${FPS}*TB)`] : []),
      "scale=out_color_matrix=bt709:out_range=tv:flags=lanczos+accurate_rnd+full_chroma_int",
      "format=yuv420p"
    ].join(",");
    const ff = spawn("ffmpeg", ["-y", "-loglevel", "error",
      "-f", "image2pipe", "-framerate", String(FPS * sub), "-c:v", fast ? "mjpeg" : "png", "-i", "-",
      "-vf", vf, "-r", String(FPS),
      "-c:v", "libx264", "-preset", fast ? "medium" : "slower", "-crf", fast ? "20" : "14",
      "-profile:v", "high", "-level:v", "4.2", "-g", String(FPS * 2), "-bf", "3",
      "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
      "-movflags", "+faststart", silent], { stdio: ["pipe", "inherit", "inherit"] });
    const done = new Promise((res, rej) => ff.on("close", c => c === 0 ? res() : rej(new Error("ffmpeg exited " + c))));
    for (let f = 0; f < frames; f++) {
      for (let s = 0; s < sub; s++) {
        const t = (f + (sub > 1 ? SHUTTER * s / sub : 0)) / FPS;
        await page.evaluate(([id, t, f]) => window.seek(id, t, f), [id, t, f]);
        const buf = await page.screenshot(fast ? { clip, type: "jpeg", quality: 92 } : { clip, type: "png" });
        if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
      }
    }
    ff.stdin.end();
    await done;
    const out = join(outDir, names[id] + ".mp4");
    await run("ffmpeg", ["-y", "-loglevel", "error", "-i", silent, "-i", join(work, id + ".wav"),
      "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-ac", "2",
      "-shortest", "-movflags", "+faststart", out]);
    await page.evaluate(([id, t]) => window.seek(id, t, 0), [id, coverAt[id]]);
    await page.screenshot({ path: join(outDir, names[id] + "-cover.png"), clip });
    console.log(out);
  }
  const queue = [...ids];
  const pages = [first, ...await Promise.all(Array.from({ length: Math.min(PARALLEL, ids.length) - 1 }, openPage))];
  await Promise.all(pages.map(async page => { while (queue.length) await renderVideo(page, queue.shift()); }));
}
await browser.close();
rmSync(work, { recursive: true, force: true });
