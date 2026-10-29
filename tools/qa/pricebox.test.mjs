// The price box: while the founding offer runs, the first-visit price is the big number.
import fs from "node:fs";
import path from "node:path";
import { test, assert, newPage, withConfig, ROOT } from "./lib.mjs";

const txt = async (p, sel) => (await p.textContent(sel)).trim();
const AMT = "[data-pricer] [data-p-amount]", UNIT = "[data-pricer] [data-p-unit]", META = "[data-pricer] [data-p-meta]";

export default async function () {
  test("price box leads with the first-visit price", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    assert(await txt(p, AMT) === "$116", "big number: " + await txt(p, AMT));
    assert(await p.isVisible(UNIT) && await txt(p, UNIT) === "first visit", "unit: " + await txt(p, UNIT));
    assert(await txt(p, META) === "Regular price $145 · estimate, about 2 hours on site", "meta: " + await txt(p, META));
    await p.click("[data-pricer] [data-p-beds] [data-inc]");
    assert(await txt(p, AMT) === "$140", "two bedrooms: " + await txt(p, AMT));
    assert((await txt(p, META)).startsWith("Regular price $175 · estimate, about "), "two-bedroom meta: " + await txt(p, META));
  });

  test("price box without the offer shows the regular price", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await withConfig(p, "window.NR_CONFIG.offers.founding.active = false;");
    await p.goto(url + "/");
    assert(await txt(p, AMT) === "$145", "big number: " + await txt(p, AMT));
    assert(await p.isHidden(UNIT), "no 'first visit' without the offer");
    assert((await txt(p, META)).startsWith("Estimate · about 2 hours on site"), "meta: " + await txt(p, META));
  });

  test("built price box matches the script", async () => {
    const html = fs.readFileSync(path.join(ROOT, "pricing/index.html"), "utf8");
    const amount = (/data-p-amount>([^<]+)</.exec(html) || [])[1];
    assert(amount === "$116", "built amount: " + amount);
    assert(html.includes("Regular price $145 · estimate, about 2 hours on site"), "built meta line");
  });
}
