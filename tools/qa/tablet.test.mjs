// Tablets and Claude's preview panel (600–959px): layouts that fit a phone or a computer can squeeze in between.
import { test, assert, newPage } from "./lib.mjs";

const perRow = (p, sel) => p.$$eval(sel, (els) => { const tops = els.map((e) => Math.round(e.getBoundingClientRect().top)); return tops.filter((t) => t === tops[0]).length; });

export default async function () {
  test("trust promises sit two by two on tablets, four across on computers", async ({ browser, url }) => {
    for (const [width, want] of [[700, 2], [1440, 4]]) {
      const p = await newPage(browser, { width, height: 900 });
      await p.goto(url + "/");
      const n = await perRow(p, ".trust li");
      assert(n === want, `${width}px: expected ${want} promises per row, got ${n}`);
      await p.context().close();
    }
  });

  test("one rule, not two, above the guarantee", async ({ browser, url }) => {
    for (const [width, want] of [[390, "0px"], [700, "0px"], [1440, "1px"]]) {
      const p = await newPage(browser, { width, height: 900 });
      await p.goto(url + "/");
      const b = await p.$eval(".ritual li:last-child", (e) => getComputedStyle(e).borderBottomWidth);
      assert(b === want, `${width}px: the last standard step's bottom rule should be ${want}, got ${b}`);
      await p.context().close();
    }
  });

  test("the founder photo fits a tablet screen", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 700, height: 900 });
    await p.goto(url + "/");
    const w = await p.$eval(".founder-photo", (e) => e.getBoundingClientRect().width);
    assert(w <= 360, "at 700px the founder photo should be at most 360px wide, got " + Math.round(w));
  });

  test("guide cards aren't squeezed two to a row on tablets", async ({ browser, url }) => {
    for (const [width, want] of [[700, 1], [1024, 3]]) {
      const p = await newPage(browser, { width, height: 900 });
      await p.goto(url + "/guides/");
      const n = await perRow(p, ".guide-grid > li");
      assert(n === want, `${width}px: expected ${want} guide card(s) per row, got ${n}`);
      await p.context().close();
    }
  });

  test("the footer email address stays on one line", async ({ browser, url }) => {
    const bad = [];
    for (const width of [390, 600, 700, 960, 1024, 1200, 1440]) {
      const p = await newPage(browser, { width, height: 900 });
      await p.goto(url + "/");
      // The link is an inline-block, so count the lines of its text, not its box.
      const lines = await p.$eval(".site-footer a[href^='mailto:']", (a) => { const r = document.createRange(); r.selectNodeContents(a); return new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size; });
      if (lines !== 1) bad.push(`${width}px: ${lines} lines`);
      await p.context().close();
    }
    assert(!bad.length, "the email breaks across lines: " + bad.join("; "));
  });
}
