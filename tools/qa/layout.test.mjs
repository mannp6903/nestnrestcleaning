// Every page at every common width, in both themes: no sideways scrolling, script errors or missing files.
import { test, assert, newPage } from "./lib.mjs";

const PAGES = ["/", "/pricing/", "/services/move-in-move-out-cleaning/", "/services/regular-home-cleaning/",
  "/areas/north-york/", "/areas/north-york/willowdale/", "/help/", "/realtors/", "/privacy/", "/policies/",
  "/services/residence-care/", "/gift/", "/guides/", "/vision/", "/404.html"];
const WIDTHS = [320, 360, 390, 430, 768, 1024, 1440];

export default async function () {
  test("no sideways scroll, page errors or asset 404s", async ({ browser, url }) => {
    const problems = [];
    for (const theme of ["light", "dark"]) {
      for (const width of WIDTHS) {
        const p = await newPage(browser, { width, height: 900, theme });
        p.on("response", (r) => { if (r.url().startsWith(url) && r.status() >= 400) problems.push(`${theme} ${width}px ${r.status()} ${r.url().replace(url, "")}`); });
        const sideways = async (where) => {
          const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          if (over > 0) problems.push(`${theme} ${width}px ${where}: scrolls sideways by ${over}px`);
        };
        for (const path of PAGES) {
          await p.goto(url + path);
          await sideways(path);
        }
        await p.goto(url + "/book/?s=move&h=house&bd=3&ba=2");
        await p.fill("#f-postal", "M1P 1A1");
        await p.click('label.check:has(input[value="halfbath"])');
        await sideways("book step 1");
        await p.click(".compare-box summary");
        await sideways("book compare open");
        await p.click(".compare-box summary");
        await p.click("[data-next]");
        await p.click("label.date-chip >> nth=2");
        await p.click('label.slot[data-slot="morning"]');
        await sideways("book step 2");
        await p.click("[data-next]");
        await p.fill("#f-name", "Priya Sample");
        await p.selectOption("#f-access", "Concierge or front desk");
        await sideways("book step 3");
        for (const e of p.errors) problems.push(`${theme} ${width}px page error: ${e}`);
        await p.context().close();
      }
    }
    assert(!problems.length, problems.length + " problem(s): " + problems.slice(0, 6).join("; "));
  });
}
