// Phase 3's signature moments (docs/redesign-blueprint-2026-11.md): the slogan's exhale, the price box's "build your
// clean" house and the page transitions; and since November 2026 the home hero's entrance and its skyline photo. Each one moves only when motion is welcome, and none
// hides words.
import fs from "node:fs";
import path from "node:path";
import { test, assert, newPage, contrast, ROOT, built } from "./lib.mjs";

const PAGES = [...fs.readFileSync(built("sitemap.xml"), "utf8").matchAll(/<loc>[^<]*?nestnrestcleaning\.com([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
const read = (pg) => fs.readFileSync(built(pg.replace(/^\//, ""), "index.html"), "utf8");

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

  test("the home hero pops in: every word painted from the first frame, over within 3s, still under reduced motion", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/", { waitUntil: "domcontentloaded" });
    const first = await p.$$eval(".hero-home .hero-title .w", (ws) => ws.map((w) => ({ text: w.textContent, opacity: +getComputedStyle(w).opacity, n: w.getAnimations().length })));
    assert(first.map((w) => w.text).join(" ") === "We clean. You rest.", "one span per word: " + JSON.stringify(first));
    assert(first.every((w) => w.opacity > 0 && w.n === 1), "each word pops, and is never invisible: " + JSON.stringify(first));
    // The lede is the largest paint on phones: it may move, but never fade.
    const lede = await p.$eval(".hero-home .lede", (e) => e.getAnimations().flatMap((a) => a.effect.getKeyframes().map((k) => Object.keys(k))).flat());
    assert(!lede.includes("opacity"), "the lede never fades: " + lede.join(","));
    const longest = await p.evaluate(() => Math.max(...document.querySelectorAll(".hero-home *").length ? [...document.querySelectorAll(".hero-home *")].flatMap((e) => e.getAnimations().filter((a) => !a.timeline || a.timeline.constructor.name === "DocumentTimeline").map((a) => { const t = a.effect.getComputedTiming(); return (t.delay || 0) + (t.activeDuration || 0); })) : [0]));
    assert(longest <= 2800, "the entrance is over by 2.8s (the button's light sweep included): " + longest);
    assert(await p.$eval(".hero-home .swoosh", (s) => s.getAttribute("aria-hidden") === "true" && !s.textContent.trim()), "the line under rest. is decoration only");
    await p.evaluate(() => document.getAnimations().forEach((a) => { if (a.effect && a.effect.getComputedTiming().iterations !== Infinity) a.finish(); }));
    const end = await p.$$eval(".hero-home .hero-title .w, .hero-home .hero-facts li, .hero-home .hero-cta .btn-primary, .hero-home .hero-owner", (es) => es.map((e) => [getComputedStyle(e).opacity, getComputedStyle(e).transform]));
    assert(end.every(([o, t]) => o === "1" && (t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)")), "everything rests in place: " + JSON.stringify(end));
    assert(await p.$eval(".hero-home .swoosh path", (e) => Math.abs(parseFloat(getComputedStyle(e).strokeDashoffset) || 0) < 0.01), "the line is fully drawn");
    const calm = await newPage(browser, { width: 1440, height: 900, reducedMotion: "reduce" });
    await calm.goto(url + "/");
    assert(await calm.$$eval(".hero-home *", (es) => es.filter((e) => e.getAnimations().length).length) === 0, "nothing moves under reduced motion");
    assert(await calm.$eval(".hero-home .swoosh path", (e) => getComputedStyle(e).strokeDashoffset === "0px" || getComputedStyle(e).strokeDasharray === "none"), "and the line is just there");
  });

  // November 2026: the home hero's drawn skyline gave way to a photo of the skyline at dawn (assets/hero).
  test("the hero photo: the right size for each screen, loaded early on the home page only, and every word readable over it", async ({ browser, url }) => {
    const home = read("/");
    const pre = [...home.matchAll(/<link rel="preload" as="image" type="image\/webp" href="([^"]+)" media="([^"]+)" fetchpriority="high">/g)].map((m) => [m[1].replace(/^.*\//, ""), m[2]]);
    assert(JSON.stringify(pre.map((x) => x[0])) === JSON.stringify(["cn-tower-dawn-600.webp", "cn-tower-dawn-892.webp", "cn-tower-dawn-2560.webp"]), "home preloads one photo per screen size: " + JSON.stringify(pre));
    for (const pg of PAGES.filter((x) => x !== "/")) assert(!read(pg).includes("cn-tower-dawn"), pg + " should not load the home hero's photo");
    for (const f of ["600", "892", "2560"]) for (const ext of ["webp", "jpg"]) assert(fs.existsSync(path.join(ROOT, `assets/hero/cn-tower-dawn-${f}.${ext}`)), `assets/hero/cn-tower-dawn-${f}.${ext} is missing`);
    for (const [width, height, file, mob] of [[390, 844, "600", true], [768, 1024, "892", false], [1440, 900, "2560", false]]) {
      const p = await newPage(browser, { width, height, isMobile: mob, reducedMotion: "reduce" });
      await p.goto(url + "/");
      const bg = await p.$eval(".hero.hero-home", (e) => getComputedStyle(e).backgroundImage);
      assert(bg.includes(`cn-tower-dawn-${file}.webp`), `${width}px should use the ${file} photo: ${bg.slice(0, 160)}`);
      // Contrast against the photo itself: hide the words, read the pixels behind each line (above the phone's action bar),
      // and compare the text colour with the brightest 5% of them.
      const bar = await p.$eval(".action-bar", (e) => getComputedStyle(e).display === "none" ? Infinity : e.getBoundingClientRect().top).catch(() => Infinity);
      const items = await p.$$eval(".hero-home .hero-what, .hero-home .hero-title .w, .hero-home .lede, .hero-home .text-link, .hero-home .hero-facts li span, .hero-home .hero-owner > span:last-child", (es, bar) => es.map((e) => {
        const r = e.getBoundingClientRect(), s = getComputedStyle(e), size = parseFloat(s.fontSize);
        return { text: e.textContent.trim().slice(0, 24), color: s.color, x: r.left, y: r.top, w: r.width, h: r.height, min: size >= 24 || (size >= 18.66 && +s.fontWeight >= 700) ? 3 : 4.5 };
      }).filter((i) => i.w > 2 && i.h > 2 && i.y >= 0 && i.y + i.h <= Math.min(bar, innerHeight)), bar);
      await p.addStyleTag({ content: ".hero-home, .hero-home * { color: transparent !important; text-shadow: none !important; } .hero-home .swoosh, .hero-home .ic, .hero-home .btn, .hero-home picture { visibility: hidden !important; } .hero-home .text-link { border-color: transparent !important; }" });
      const shot = (await p.screenshot()).toString("base64");
      const bgs = await p.evaluate(async ({ shot, items }) => {
        const img = new Image(); img.src = "data:image/png;base64," + shot; await img.decode();
        const c = document.createElement("canvas"); c.width = img.width; c.height = img.height; const g = c.getContext("2d"); g.drawImage(img, 0, 0);
        const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
        const k = img.width / innerWidth; // the screenshot is at the screen's pixel density
        return items.map((it) => {
          const d = g.getImageData(Math.round(it.x * k), Math.round(it.y * k), Math.round(it.w * k), Math.round(it.h * k)).data, px = [];
          for (let i = 0; i < d.length; i += 4) px.push([0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]), d[i], d[i + 1], d[i + 2]]);
          px.sort((a, b) => a[0] - b[0]); const q = px[Math.floor(px.length * 0.95)];
          return `rgb(${q[1]}, ${q[2]}, ${q[3]})`;
        });
      }, { shot, items });
      const bad = items.map((it, i) => ({ ...it, ratio: contrast(it.color, bgs[i]) })).filter((it) => !(it.ratio >= it.min)).map((it) => `"${it.text}" ${it.ratio.toFixed(2)}:1 (needs ${it.min})`);
      assert(items.length >= 8, `${width}px: expected the hero's words to be measured, got ${items.length}`);
      assert(!bad.length, `${width}px: words too faint over the photo: ${bad.join("; ")}`);
      await p.context().close();
    }
  });

  test("below the first screen, cards rise into place as they scroll in: transform only, at rest once in view, still under reduced motion", async ({ browser, url }) => {
    const groups = [".svc-cards > li", ".price-facts > .pf", ".steps-3 > li", ".terms > li", ".faq-list > details", ".contact-card"];
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    // Switched on only once the page has loaded, so the first screen never waits for them.
    await p.waitForFunction(() => document.readyState === "complete");
    await p.waitForFunction(() => document.documentElement.classList.contains("rise-on"));
    for (const sel of groups) {
      const s = await p.$eval(sel, (el) => { const cs = getComputedStyle(el); return { name: cs.animationName, timeline: cs.animationTimeline, top: el.getBoundingClientRect().top }; });
      assert(s.name === "nr-rise" && /view/.test(s.timeline), `${sel}: rises with the scroll: ${JSON.stringify(s)}`);
      assert(s.top > 900, `${sel}: is below the first screen, so nothing on it waits to move`);
    }
    const css = fs.readFileSync(path.join(ROOT, "css/site.css"), "utf8");
    const rise = css.match(/@keyframes nr-rise \{([^}]*\})/)[1];
    assert(/transform/.test(rise) && !/opacity/.test(rise), "the rise moves only, never fades: " + rise);
    // Scrolled into view, every card is at rest; side by side, they arrive a beat apart.
    const top = await p.$eval(".svc-cards", (e) => e.getBoundingClientRect().top + scrollY);
    await p.evaluate((y) => scrollTo(0, y), top - 900 + 120);
    await p.waitForTimeout(200);
    const mid = await p.$$eval(".svc-cards > li", (els) => els.map((e) => new DOMMatrix(getComputedStyle(e).transform).m42));
    assert(mid[0] < mid[mid.length - 1], "entering, the first card is ahead of the last: " + mid.join(", "));
    await p.evaluate((y) => scrollTo(0, y), top - 120);
    await p.waitForTimeout(200);
    const rest = await p.$$eval(".svc-cards > li", (els) => els.map((e) => new DOMMatrix(getComputedStyle(e).transform).m42));
    assert(rest.every((y) => y === 0), "in view, every card is in place: " + rest.join(", "));
    await p.context().close();
    const calm = await newPage(browser, { width: 1440, height: 900, reducedMotion: "reduce" });
    await calm.goto(url + "/");
    await calm.waitForFunction(() => document.documentElement.classList.contains("rise-on"));
    for (const sel of groups) assert(await calm.$eval(sel, (el) => getComputedStyle(el).animationName) === "none", `${sel}: still under reduced motion`);
    await calm.context().close();
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
