// Tablets and Claude's preview panel (600–959px): layouts that fit a phone or a computer can squeeze in between.
import { test, assert, newPage } from "./lib.mjs";

const perRow = (p, sel) => p.$$eval(sel, (els) => { const tops = els.map((e) => Math.round(e.getBoundingClientRect().top)); return tops.filter((t) => t === tops[0]).length; });

export default async function () {
  test("hero promises stack on tablets and sit side by side on computers", async ({ browser, url }) => {
    for (const [width, want] of [[700, 1], [1440, 2]]) {
      const p = await newPage(browser, { width, height: 900 });
      await p.goto(url + "/");
      const n = await perRow(p, ".hero-facts li");
      assert(n === want, `${width}px: expected ${want} promises per row, got ${n}`);
      await p.context().close();
    }
  });

  // v9: the five steps of every visit live on the vision page, five across on computers, one under another on phones.
  test("the standard's five steps fit every width", async ({ browser, url }) => {
    for (const [width, want] of [[390, 1], [1440, 5]]) {
      const p = await newPage(browser, { width, height: 900 });
      await p.goto(url + "/vision/");
      assert(await p.locator("#standard .steps-5 > li").count() === 5, "five steps");
      const n = await perRow(p, "#standard .steps-5 > li");
      assert(n === want, `${width}px: expected ${want} step(s) per row, got ${n}`);
      assert(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, `${width}px: the page scrolls sideways`);
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
