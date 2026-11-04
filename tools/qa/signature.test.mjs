// Phase 3's signature moments (docs/redesign-blueprint-2026-11.md): the slogan's exhale, night to dawn on the home hero,
// the price box's "build your clean" house and the page transitions. Each one moves only when motion is welcome, and none
// hides words.
import fs from "node:fs";
import path from "node:path";
import { test, assert, newPage, ROOT } from "./lib.mjs";

const PAGES = [...fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8").matchAll(/<loc>[^<]*?nestnrestcleaning\.com([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
const read = (pg) => fs.readFileSync(path.join(ROOT, pg.replace(/^\//, ""), "index.html"), "utf8");

export default async function () {
  test("the slogan is on screen from the first frame, and \"You rest.\" exhales once", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/", { waitUntil: "domcontentloaded" });
    const first = await p.$eval(".hero-home .accent", (e) => {
      const s = getComputedStyle(e), a = e.getAnimations().map((x) => ({ name: x.animationName, iterations: x.effect.getTiming().iterations }));
      return { opacity: s.opacity, visibility: s.visibility, animations: a };
    });
    assert(first.opacity === "1" && first.visibility === "visible", "the words should be visible at once: " + JSON.stringify(first));
    assert(first.animations.some((a) => a.name === "nr-exhale" && a.iterations === 1), "one exhale: " + JSON.stringify(first.animations));
    await p.evaluate(() => document.getAnimations().forEach((a) => a.finish()));
    assert(await p.$eval(".hero-home .accent", (e) => getComputedStyle(e).fontWeight) === "500", "it rests at 500");
    const calm = await newPage(browser, { width: 1440, height: 900, reducedMotion: "reduce" });
    await calm.goto(url + "/");
    assert(await calm.$eval(".hero-home .accent", (e) => e.getAnimations().length) === 0, "no exhale under reduced motion");
  });

  test("night to dawn: the hero's lights go out as it scrolls away, and stay on under reduced motion", async ({ browser, url }) => {
    const lit = (p) => p.$$eval(".hero-home .lm-wide .lm-lit-0, .hero-home .lm-wide .lm-lit-1, .hero-home .lm-wide .lm-lit-2", (es) => es.map((e) => +getComputedStyle(e).opacity));
    const p = await newPage(browser, { width: 1280, height: 900 });
    await p.goto(url + "/");
    const night = await lit(p);
    assert(night.length >= 12 && night.every((o) => o > 0.8), "lit at night: " + night.join(","));
    await p.evaluate(() => window.scrollTo(0, 700));
    await p.waitForTimeout(300);
    const dawn = await lit(p);
    assert(dawn.every((o) => o < 0.3), "out by dawn: " + dawn.join(","));
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(300);
    assert((await lit(p)).every((o) => o > 0.8), "and back on when scrolling back up");
    const calm = await newPage(browser, { width: 1280, height: 900, reducedMotion: "reduce" });
    await calm.goto(url + "/");
    await calm.evaluate(() => window.scrollTo(0, 700));
    await calm.waitForTimeout(300);
    assert((await lit(calm)).every((o) => o > 0.8), "reduced motion: the hero stays at night");
  });

  test("the price box's house fills with the home it describes", async ({ browser, url }) => {
    // Built into every price box, right before any script runs.
    for (const pg of PAGES) {
      const html = read(pg);
      const boxes = (html.match(/data-pricer/g) || []).length, houses = (html.match(/data-house /g) || []).length;
      assert(boxes === houses, `${pg}: ${boxes} price boxes, ${houses} houses`);
    }
    const p = await newPage(browser, { width: 1280, height: 900 });
    await p.goto(url + "/services/deep-cleaning/");
    const state = () => p.$eval("[data-pricer] [data-house]", (h) => ({
      hue: h.getAttribute("class"), home: h.dataset.home,
      beds: h.querySelectorAll("[data-bed].is-on").length, out: h.querySelectorAll("[data-bed].is-out").length,
      baths: h.querySelectorAll("[data-bath].is-on").length, more: h.querySelector("[data-more-beds]").textContent,
      pets: h.querySelector("[data-house-pets]").classList.contains("is-on")
    }));
    let s = await state();
    assert(s.hue === "house hue-deep" && s.home === "condo" && s.beds === 1 && s.baths === 1 && !s.pets, "start: " + JSON.stringify(s));
    await p.click("[data-pricer] [data-p-beds] [data-inc]");
    await p.click("[data-pricer] [data-p-beds] [data-inc]");
    await p.click("[data-pricer] [data-p-baths] [data-inc]");
    await p.selectOption("[data-p-home]", "house");
    await p.click("[data-p-addon=pets]");
    s = await state();
    assert(s.beds === 3 && s.baths === 2 && s.home === "house" && s.pets, "3 bed, 2 bath house with pets: " + JSON.stringify(s));
    await p.selectOption("[data-p-service]", "detail");
    s = await state();
    assert(s.hue === "house hue-detail" && s.beds === 0 && s.out === 6 && s.baths === 2, "kitchen and bath: bedrooms aren't part of it: " + JSON.stringify(s));
    await p.selectOption("[data-p-service]", "move");
    for (let i = 0; i < 5; i++) await p.click("[data-pricer] [data-p-beds] [data-inc]");
    s = await state();
    assert(s.beds === 6 && s.more === "+2", "eight bedrooms: six slots and +2: " + JSON.stringify(s));
  });

  test("page transitions: opt-in under motion only, unique names, and a card's title matches its page's heading", async () => {
    const css = fs.readFileSync(path.join(ROOT, "css/site.css"), "utf8");
    assert(/@media \(prefers-reduced-motion: no-preference\) \{\s*@view-transition \{ navigation: auto; \}/.test(css), "@view-transition only when motion is welcome");
    for (const pg of PAGES) {
      const names = [...read(pg).matchAll(/view-transition-name: ([\w-]+)/g)].map((m) => m[1]);
      assert(new Set(names).size === names.length, `${pg}: a view-transition name is used twice: ${names.join(", ")}`);
    }
    const home = read("/");
    const cfg = { window: {} };
    (await import("node:vm")).runInNewContext(fs.readFileSync(path.join(ROOT, "js/config.js"), "utf8"), cfg);
    for (const [k, s] of Object.entries(cfg.window.NR_CONFIG.services)) {
      assert(home.includes(`view-transition-name: svc-${k}`), `home card for ${k}`);
      assert(new RegExp(`<h1[^>]*view-transition-name: svc-${k}`).test(read(`/services/${s.slug}/`)), `${k}: its page heading carries the same name`);
    }
  });
}
