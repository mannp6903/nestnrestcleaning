// The price box: while the founding offer runs, the first-visit price is the big number.
import fs from "node:fs";
import path from "node:path";
import { test, assert, newPage, withConfig, ROOT, openSection } from "./lib.mjs";

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

  // The pricing page's worked examples are built from the same price data the booking form uses, so they can't drift apart.
  test("pricing examples match the booking calculator", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/pricing/");
    const steps = await p.$$eval("#how-price .price-steps > li h3", (hs) => hs.map((h) => h.textContent.trim()));
    assert(JSON.stringify(steps) === JSON.stringify(["Base price", "Extras", "One discount", "Estimate, then Mann confirms"]), "steps: " + JSON.stringify(steps));
    const amounts = (ex) => p.$$eval(`#how-price .price-example[data-example="${ex}"] dd[data-amount]`, (ds) => ds.map((d) => d.textContent.trim()));
    const a = await amounts("a"), b = await amounts("b");
    assert(JSON.stringify(a) === JSON.stringify(["$175", "$140", "$149"]), "example A: " + JSON.stringify(a));
    assert(JSON.stringify(b) === JSON.stringify(["$450", "$40", "$490", "$392"]), "example B: " + JSON.stringify(b));
    const caps = await p.$$eval("#how-price .price-example figcaption", (cs) => cs.map((c) => c.textContent.trim()));
    assert(caps.length === 2 && caps.every((c) => c.startsWith("Example:")), "captions: " + JSON.stringify(caps));

    await p.goto(url + "/book/?s=regular&h=condo&bd=2&ba=1");
    await p.fill("#f-postal", "M2N 5W9");
    await p.click("[data-next]");
    await p.click('label.choice:has(input[value="biweekly"])');
    assert(await txt(p, "[data-total]") === "$140", "booking: regular 2/1 condo, first visit every 2 weeks: " + await txt(p, "[data-total]"));
    const later = await p.$$eval("[data-lines] > div", (ds) => ds.map((d) => [d.querySelector("dt").textContent.trim(), d.querySelector("dd").textContent.trim()]).filter(([t]) => t.startsWith("Then")));
    assert(later.length === 1 && later[0][1].startsWith("$149"), "booking: later visits: " + JSON.stringify(later));

    await p.goto(url + "/book/?s=deep&h=house&bd=3&ba=2");
    await p.fill("#f-postal", "M1P 1A1");
    await openSection(p, "extras");
    await p.click('label.extra[data-addon="oven"]');
    assert(await txt(p, "[data-total]") === "$392", "booking: deep 3/2 house with inside oven: " + await txt(p, "[data-total]"));
  });

  test("pricing examples follow the offer when it's switched off", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await withConfig(p, "window.NR_CONFIG.offers.founding.active = false;");
    await p.goto(url + "/pricing/");
    const rows = (ex) => p.$$eval(`#how-price .price-example[data-example="${ex}"] dl > div`, (ds) => ds.map((d) => [d.querySelector("dt").textContent.trim(), d.querySelector("dd").textContent.trim()]));
    const a = await rows("a"), b = await rows("b");
    assert(JSON.stringify(a[1]) === JSON.stringify(["First visit (15% plan discount)", "$149"]), "example A first visit: " + JSON.stringify(a[1]));
    assert(JSON.stringify(b[3]) === JSON.stringify(["First visit", "$490"]), "example B first visit: " + JSON.stringify(b[3]));
    assert(!(await p.isVisible("#how-price [data-offer-note]")), "the founding sentence should hide with the offer");
  });
}
