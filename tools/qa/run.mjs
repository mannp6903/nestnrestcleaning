// Runs every tools/qa/*.test.mjs against the site as it is once open for bookings: a copy built with launch.open: true
// into a temp folder, whatever js/config.js says today (tools/qa/launch.test.mjs checks the "opening soon" version).
// Usage: node tools/qa/run.mjs [filter]   e.g. `node tools/qa/run.mjs booking`
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { chromium, startServer, tests, closeAll, buildOpenCopy } from "./lib.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const filter = process.argv[2] || "";
const files = fs.readdirSync(here).filter((f) => f.endsWith(".test.mjs") && f.includes(filter)).sort();
const site = buildOpenCopy();
process.env.NR_QA_SITE = site.dir;
const server = await startServer(site.dir);
const browser = await chromium.launch();
let failed = 0, passed = 0;
for (const f of files) {
  const before = tests.length;
  const mod = await import(pathToFileURL(path.join(here, f)).href);
  await mod.default({ browser, url: server.url });
  for (const t of tests.slice(before)) {
    const started = Date.now();
    try {
      await t.fn({ browser, url: server.url });
      passed++;
      console.log(`PASS ${f.replace(".test.mjs", "")}: ${t.name} (${((Date.now() - started) / 1000).toFixed(1)}s)`);
    } catch (e) {
      failed++;
      console.log(`FAIL ${f.replace(".test.mjs", "")}: ${t.name}: ${e.message.split("\n")[0]}`);
    } finally {
      await closeAll();
    }
  }
}
await browser.close();
await server.close();
site.remove();
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
