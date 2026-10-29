// The redesign's rules (docs/superpowers/specs/2026-10-28-modern-redesign-design.md): type, surfaces, components, hero.
import { test, assert, newPage } from "./lib.mjs";

const JAKARTA = /^"?Plus Jakarta Sans"?/;
const px = (v) => Math.round(parseFloat(v));

export default async function () {
  test("fonts load from the new file", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    const requested = [];
    p.on("request", (r) => requested.push(r.url()));
    await p.goto(url + "/");
    const loaded = await p.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts].some((f) => f.family.replace(/"/g, "") === "Plus Jakarta Sans" && f.status === "loaded");
    });
    assert(loaded, "Plus Jakarta Sans should be loaded on the home page");
    const fam = await p.$eval("h1", (h) => getComputedStyle(h).fontFamily);
    assert(JAKARTA.test(fam), "h1 should use Plus Jakarta Sans, got " + fam);
    const barlow = requested.filter((u) => /barlow/i.test(u));
    assert(!barlow.length, "Barlow Condensed is still requested: " + barlow.join(", "));
  });

  test("headings, labels, buttons and links are sentence case", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    const sel = "h1, h2, h3, .label, .kicker, .btn, .text-link, .step legend, .choice-body strong, .svc-card h3, .price-card h3";
    const bad = [];
    for (const path of ["/", "/pricing/", "/book/"]) {
      await p.goto(url + path);
      const found = await p.$$eval(sel, (els) => els.filter((e) => getComputedStyle(e).textTransform === "uppercase").map((e) => e.tagName.toLowerCase() + "." + e.className + ": " + e.textContent.trim().slice(0, 30)));
      bad.push(...found.map((f) => path + " " + f));
    }
    assert(!bad.length, bad.length + " uppercase element(s), e.g. " + bad.slice(0, 4).join("; "));
  });

  test("type scale", async ({ browser, url }) => {
    const check = async (width, path, selector, want, weight) => {
      const p = await newPage(browser, { width, height: 900 });
      await p.goto(url + path);
      const s = await p.$eval(selector, (e) => ({ size: getComputedStyle(e).fontSize, weight: getComputedStyle(e).fontWeight }));
      await p.context().close();
      assert(px(s.size) === want, `${path} ${selector} at ${width}px should be ${want}px, got ${s.size}`);
      if (weight) assert(s.weight === String(weight), `${path} ${selector} weight should be ${weight}, got ${s.weight}`);
    };
    await check(1440, "/", "h1", 76, 800);
    await check(1440, "/pricing/", "h1", 60);
    await check(1440, "/", "#services h2", 46, 800);
    await check(390, "/", "h1", 48);
    await check(390, "/pricing/", "h1", 40);
    await check(390, "/", "#services h2", 32);
  });

  test("404 page uses the new type", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/404.html");
    const fam = await p.$eval("h1", (h) => getComputedStyle(h).fontFamily);
    assert(JAKARTA.test(fam), "404 h1 should use Plus Jakarta Sans, got " + fam);
  });
}
