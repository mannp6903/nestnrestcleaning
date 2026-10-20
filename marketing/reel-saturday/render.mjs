// Renders reel.html to video, one exact frame at a time, then muxes the soundtrack.
//   NODE_PATH="$(npm root -g)" node render.mjs                 full render -> nest-and-rest-saturday-reel.mp4 (+ -sfx-only.mp4)
//   NODE_PATH="$(npm root -g)" node render.mjs --stills 0,2.5,7.4   PNG stills -> build/still-<t>.png
//   NODE_PATH="$(npm root -g)" node render.mjs --cover 10.5      cover frame -> cover.png
// Needs Playwright (with Chromium) and ffmpeg on PATH. Run `python3 audio.py` first for sound.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = dirname(fileURLToPath(import.meta.url));
const build = join(here, 'build');
mkdirSync(build, { recursive: true });

const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };

const browser = await chromium.launch({
  args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text', '--allow-file-access-from-files'],
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(join(here, 'reel.html')).href + '?render=1');
await page.evaluate(() => window.__ready);
const { fps, duration } = await page.evaluate(() => ({ fps: window.TL.fps, duration: window.TL.duration }));

const shoot = async t => { await page.evaluate(x => window.__seek(x), t); return page.screenshot({ type: 'png' }); };

if (flag('--stills')) {
  for (const t of flag('--stills').split(',').map(Number)) {
    const out = join(build, `still-${t.toFixed(2)}.png`);
    writeFileSync(out, await shoot(t));
    console.log(out);
  }
} else if (flag('--cover')) {
  writeFileSync(join(here, 'cover.png'), await shoot(Number(flag('--cover'))));
  console.log(join(here, 'cover.png'));
} else {
  const frames = Math.round(fps * duration);
  const silent = join(build, 'picture.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-maxrate', '10M', '-bufsize', '20M', '-tune', 'film', '-pix_fmt', 'yuv420p',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const started = Date.now();
  for (let f = 0; f < frames; f++) {
    const buf = await shoot(f / fps);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 30 === 0) process.stdout.write(`\rframe ${f}/${frames}  ${((Date.now() - started) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exited ' + c)))));
  console.log(`\npicture: ${silent}`);

  // The soundtracks are already loudness-matched (audio.py), so this only encodes them: AAC 48 kHz, as Instagram expects.
  const mux = (audio, out) => new Promise((res, rej) => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, '-i', audio,
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-ar', '48000', '-c:a', 'aac', '-b:a', '256k',
    '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' }).on('close', c => (c === 0 ? res() : rej(new Error('mux failed')))));
  const cuts = [['soundtrack.wav', 'nest-and-rest-saturday-reel.mp4'], ['soundtrack-sfx-only.wav', 'nest-and-rest-saturday-reel-sfx-only.mp4']];
  if (!existsSync(join(build, cuts[0][0]))) console.log('No build/soundtrack.wav yet: run `python3 audio.py`, then render again to add sound.');
  for (const [audio, out] of cuts) {
    if (!existsSync(join(build, audio))) continue;
    await mux(join(build, audio), join(here, out));
    console.log(`reel: ${join(here, out)}`);
  }
}
await browser.close();
