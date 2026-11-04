// The redesign's rules (docs/superpowers/specs/2026-10-28-modern-redesign-design.md): type, surfaces, components, hero.
import { test, assert, newPage, contrast, contrastProblems, loadConfig } from "./lib.mjs";

const C = loadConfig();

// Phase 2 type: headings in the soft serif (Fraunces), the interface and text in Figtree.
const SERIF = /^"?Fraunces"?/;
const SANS = /^"?Figtree"?/;
const px = (v) => Math.round(parseFloat(v));

export default async function () {
  test("fonts load from the new files", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    const requested = [];
    p.on("request", (r) => requested.push(r.url()));
    await p.goto(url + "/");
    const loaded = await p.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/"/g, ""));
    });
    assert(loaded.includes("Fraunces") && loaded.includes("Figtree"), "Fraunces and Figtree should be loaded on the home page: " + loaded);
    const fam = (sel) => p.$eval(sel, (e) => getComputedStyle(e).fontFamily);
    // The slogan says the idea: "We clean." in the crisp sans, "You rest." in the soft serif.
    assert(SANS.test(await fam(".hero-home .hero-title .display")) && SERIF.test(await fam(".hero-home .accent")), "We clean. / You rest.: " + await fam(".hero-home .hero-title .display") + " / " + await fam(".hero-home .accent"));
    assert(SERIF.test(await fam("main h2")) && SANS.test(await fam("body")) && SANS.test(await fam(".btn")), "headings serif, text and buttons sans");
    const old = requested.filter((u) => /barlow|jakarta|dm-sans/i.test(u));
    assert(!old.length, "an old font is still requested: " + old.join(", "));
    // The font budget: both files together stay well under 150 KB.
    const fs = await import("node:fs"), path = await import("node:path"), { ROOT } = await import("./lib.mjs");
    const bytes = ["fraunces-soft.woff2", "figtree.woff2"].reduce((t, f) => t + fs.statSync(path.join(ROOT, "assets/fonts", f)).size, 0);
    assert(bytes < 150 * 1024, "fonts are " + Math.round(bytes / 1024) + " KB");
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
    // v4 (docs/superpowers/specs/2026-10-29-website-redesign-v4-design.md): calm headings on a smaller scale.
    // v9: the home slogan is larger, on its navy hero (84px on a computer); everything else keeps the v4 scale.
    // Phase 2: serif headings at 600; the slogan's "We clean." is the crisp sans at 800.
    await check(1440, "/", ".hero-title .display", 84, 800);
    await check(1440, "/pricing/", "h1", 56, 600);
    await check(1440, "/", "#services h2", 40, 600);
    await check(390, "/", ".hero-title .display", 44);
    await check(390, "/pricing/", "h1", 36);
    await check(390, "/", "#services h2", 28);
  });

  test("white pages with ivory sections", async ({ browser, url }) => {
    for (const [theme, page] of [["light", "rgb(255, 255, 255)"], ["dark", "rgb(14, 26, 43)"]]) {
      const p = await newPage(browser, { width: 1440, height: 900, theme });
      await p.goto(url + "/");
      const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
      assert(bg === page, `${theme}: page background should be ${page}, got ${bg}`);
      if (theme === "light") {
        const tint = await p.$eval(".section-tint", (e) => getComputedStyle(e).backgroundColor);
        assert(tint === "rgb(247, 243, 234)", "sections alternate in ivory, got " + tint);
      }
      await p.context().close();
    }
  });

  // v3 (docs/superpowers/specs/2026-10-29-website-redesign-v3-design.md): pill buttons stay; cards, panels and fields get calmer corners and no shadow.
  test("pill buttons and v3 surfaces", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    const box = (sel) => p.$eval(sel, (e) => { const s = getComputedStyle(e), r = e.getBoundingClientRect(); return { radius: parseFloat(s.borderTopLeftRadius), shadow: s.boxShadow, h: r.height, w: r.width }; });
    await p.goto(url + "/");
    const primary = await box(".hero-cta .btn-primary");
    assert(primary.radius >= 26 && Math.abs(primary.h - 52) <= 1, "primary button should be a 52px pill, got " + JSON.stringify(primary));
    const small = await box("#services .btn-sm");
    assert(Math.abs(small.h - 44) <= 1 && small.radius >= 22, "small button should be a 44px pill, got " + JSON.stringify(small));
    assert((await box(".hero-home .pricer")).radius === 14, "the price box should have a 14px radius");
    const contact = await box(".contact-card");
    assert(contact.radius === 20 && contact.shadow === "none" && contact.w < 1440, "the contact card should be a flat 20px panel inside the page, got " + JSON.stringify(contact));
    assert((await box(".hero-home .pricer select")).radius === 12, "fields should have a 12px radius");
    // v6, v9: the postal check is one pill, field and button together (in Contact now).
    assert((await box(".contact .pc-row")).radius >= 26, "the postal check should be a pill");
    const home = await box(".svc-card-home");
    assert(home.radius === 14 && home.shadow === "none", "home service cards should be flat with a 14px radius, got " + JSON.stringify(home));
    await p.goto(url + "/pricing/");
    const panel = await box(".final-cta .final-inner");
    assert(panel.radius === 20 && panel.w < 1440, "the closing navy panel should be a 20px panel inside the page, got " + JSON.stringify(panel));
    await p.goto(url + "/services/deep-cleaning/");
    const card = await box(".svc-card");
    assert(card.radius === 14 && card.shadow === "none", "service cards should be flat with a 14px radius, got " + JSON.stringify(card));
    await p.goto(url + "/pricing/");
    const price = await box(".price-card");
    assert(price.radius === 14 && price.shadow === "none", "price cards should be flat with a 14px radius, got " + JSON.stringify(price));
    await p.goto(url + "/book/");
    assert((await box(".choice-body")).radius === 12, "booking choices should have a 12px radius");
  });

  // v3: an outlined button is only for navy bands and the phone menu; elsewhere a second action is a text link.
  test("secondary actions on light pages are text links", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    const bad = [];
    for (const path of ["/", "/pricing/", "/help/", "/services/deep-cleaning/", "/gift/", "/realtors/", "/vision/", "/guides/house-cleaning-cost-toronto/", "/404.html"]) {
      await p.goto(url + path);
      const found = await p.$$eval(".btn-ghost", (bs) => bs.filter((b) => b.getClientRects().length && !b.closest(".final-cta, .standard, .vow, #menu, .book")).map((b) => b.textContent.trim().slice(0, 30)));
      bad.push(...found.map((t) => `${path} "${t}"`));
    }
    assert(!bad.length, "outlined buttons on light pages: " + bad.join("; "));
  });

  test("every icon points at a symbol on its page", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    const bad = [];
    for (const path of ["/", "/pricing/", "/help/", "/book/", "/guides/house-cleaning-cost-toronto/", "/404.html"]) {
      await p.goto(url + path);
      const missing = await p.$$eval("use", (us) => [...new Set(us.map((u) => u.getAttribute("href")).filter((h) => h && h.startsWith("#") && !document.querySelector(h)))]);
      bad.push(...missing.map((h) => path + " " + h));
    }
    assert(!bad.length, "icons with no symbol: " + bad.join(", "));
  });

  test("vision page boxes are flat", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/vision/");
    const look = (sel) => p.$eval(sel, (e) => { const s = getComputedStyle(e); return { radius: s.borderTopLeftRadius, shadow: s.boxShadow }; });
    const m = await look(".measure"), c = await look(".chapters li");
    assert(m.radius === "14px" && m.shadow === "none", "the hours box should be a flat 14px card, got " + JSON.stringify(m));
    assert(c.radius === "14px", "chapter cards should use the 14px card radius, got " + JSON.stringify(c));
  });

  test("eyebrows are plain text", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    const bad = [];
    let seen = 0;
    for (const path of ["/", "/pricing/", "/services/deep-cleaning/", "/book/"]) {
      await p.goto(url + path);
      const found = await p.$$eval(".label, .kicker", (els) => els.filter((e) => e.getClientRects().length && getComputedStyle(e).visibility !== "hidden").map((e) => {
        const c = getComputedStyle(e);
        return { text: e.textContent.trim().slice(0, 24), bg: c.backgroundColor, dot: getComputedStyle(e, "::before").content, fam: c.fontFamily, size: parseFloat(c.fontSize), weight: c.fontWeight };
      }));
      seen += found.length;
      for (const f of found) {
        const why = [];
        if (f.bg !== "rgba(0, 0, 0, 0)") why.push("background " + f.bg);
        if (f.dot !== "none") why.push("a ::before dot");
        if (!SANS.test(f.fam)) why.push("font " + f.fam);
        if (f.size < 13 || f.size > 14.5) why.push(f.size + "px");
        if (f.weight !== "700") why.push("weight " + f.weight);
        if (why.length) bad.push(`${path} "${f.text}": ${why.join(", ")}`);
      }
    }
    assert(seen > 8, "expected eyebrows on these pages, found " + seen);
    assert(!bad.length, bad.length + " eyebrow(s) still styled as pills, e.g. " + bad.slice(0, 4).join("; "));
  });

  // Text colour against the first solid background behind it, for every text element on a page.

  test("contrast helper measures known pairs", async () => {
    const near = (a, b) => Math.abs(a - b) < 0.02;
    assert(near(contrast("#8994A3", "#FFFFFF"), 3.08), "#8994A3 on white should be 3.08:1, got " + contrast("#8994A3", "#FFFFFF"));
    assert(near(contrast("rgb(75, 94, 116)", "rgb(255, 255, 255)"), 6.66), "#4B5E74 on white should be 6.66:1, got " + contrast("rgb(75, 94, 116)", "rgb(255, 255, 255)"));
    assert(near(contrast("rgba(10, 45, 92, 0)", "#FFFFFF"), 1), "a fully transparent colour has no contrast");
  });

  test("contrast holds in both themes", async ({ browser, url }) => {
    const bad = [];
    for (const theme of ["light", "dark"]) {
      const p = await newPage(browser, { width: 1440, height: 900, theme });
      for (const path of ["/", "/pricing/", "/book/", "/help/", "/services/airbnb-cleaning/"]) {
        await p.goto(url + path);
        await p.evaluate(() => document.getAnimations().forEach((a) => a.finish()));
        for (const t of await contrastProblems(p)) {
          const r = contrast(t.fg, t.bg);
          assert(Number.isFinite(r), `couldn't measure ${t.fg} on ${t.bg}`);
          if (r < t.min) bad.push(`${theme} ${path} ${t.tag} "${t.text}" ${r.toFixed(2)}:1`);
        }
      }
      await p.context().close();
    }
    assert(!bad.length, bad.length + " low-contrast text item(s): " + [...new Set(bad)].slice(0, 8).join("; "));
  });

  test("labels on navy stay readable", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    const bad = [];
    for (const [path, scope] of [["/vision/", ".standard .label"], ["/", ".footer-cols .label"]]) {
      await p.goto(url + path);
      const items = await contrastProblems(p, scope.split(" ")[0]);
      for (const t of items.filter((x) => x.tag.startsWith("p.label"))) {
        const r = contrast(t.fg, t.bg);
        assert(Number.isFinite(r), `couldn't measure ${t.fg} on ${t.bg}`);
        if (r < 4.5) bad.push(`${scope} "${t.text}" ${r.toFixed(2)}:1`);
      }
      assert(items.some((x) => x.tag.startsWith("p.label")), "no label found in " + scope);
    }
    assert(!bad.length, bad.join("; "));
  });

  test("cards stay still on hover", async ({ browser, url }) => {
    for (const motion of ["no-preference", "reduce"]) {
      const p = await newPage(browser, { width: 1440, height: 900, reducedMotion: motion });
      await p.goto(url + "/services/deep-cleaning/");
      const look = () => p.$eval(".svc-card", (e) => ({ t: getComputedStyle(e).transform, border: getComputedStyle(e).borderTopColor }));
      const before = await look();
      await p.hover(".svc-card h3");
      await p.waitForTimeout(350);
      const after = await look();
      assert(after.t === "none", `${motion}: cards shouldn't move on hover, got ${after.t}`);
      if (motion === "no-preference") assert(after.border !== before.border, "the card border should darken on hover, stayed " + after.border);
      await p.context().close();
    }
  });

  test("hero copy and actions", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    const lede = (await p.textContent(".hero-home .lede")).trim();
    // v6: Mann introduces himself in the first person. v9: with the starting price; paying after the clean is in the promises under it.
    assert(lede === "Hi, I'm Mann. I clean every home myself, so your weekends are for living, not scrubbing. Prices from $" + C.services.regular.base + ".", "hero subheading is: " + lede);
    const links = await p.$$eval(".hero-cta a", (as) => as.map((a) => [a.textContent.trim(), a.getAttribute("href")]));
    assert(links.some(([t, h]) => t.startsWith("Request a clean") && h.endsWith("book/")), "hero needs Request a clean -> book/: " + JSON.stringify(links));
    assert(links.some(([t, h]) => t.startsWith("How it works") && h.endsWith("#how")), "hero needs How it works -> #how: " + JSON.stringify(links));
  });

  test("price box on the first phone screen", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844 });
    await p.goto(url + "/");
    const b = await p.locator(".hero-home [data-pricer]").boundingBox();
    assert(b && b.y < 844, "the price box should start on the first phone screen, starts at " + (b && b.y));
  });

  // v9: the promises sit in the hero, under its buttons, instead of a strip of their own.
  test("hero promises", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    const items = await p.$$eval(".hero-home .hero-facts li", (ls) => ls.map((l) => l.textContent.trim()));
    assert(items.length === 3 && items[0] === "No deposit. Pay after your clean" && items.some((t) => /^Free re-clean if reported within \d+ hours$/.test(t)), "the hero should hold the three promises: " + JSON.stringify(items));
    assert(await p.locator("[data-assure]").count() === 1 && await p.locator(".hero-home [data-assure]").count() === 1, "the [data-assure] hook should appear exactly once, in the hero");
    assert(await p.locator(".trust-strip").count() === 0, "no separate trust strip");
  });

  test("section heads are left-aligned", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    const bad = [];
    for (const path of ["/", "/pricing/", "/services/deep-cleaning/"]) {
      await p.goto(url + path);
      const heads = await p.$$eval(".section-head", (els) => els.filter((e) => e.getClientRects().length).map((e) => ({ h: (e.querySelector("h2") || e).textContent.trim().slice(0, 30), a: getComputedStyle(e).textAlign })));
      bad.push(...heads.filter((x) => x.a !== "start" && x.a !== "left").map((x) => `${path} "${x.h}" ${x.a}`));
    }
    assert(!bad.length, "section heads should be left-aligned: " + bad.join("; "));
  });

  test("realtor jobs sit four to a row on wide screens", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/realtors/");
    const four = await p.$$eval(".svc-grid-4 > li", (ls) => ls.map((l) => Math.round(l.getBoundingClientRect().top)));
    assert(new Set(four).size === 1, "the four realtor jobs should share a row, tops: " + four.join(", "));
  });

  test("heroes are plain", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    for (const path of ["/pricing/", "/services/deep-cleaning/", "/areas/north-york/willowdale/", "/help/"]) {
      await p.goto(url + path);
      const r = await p.$eval(".hero", (e) => ({ bg: getComputedStyle(e).backgroundImage, h1: getComputedStyle(e.querySelector("h1")).fontFamily }));
      assert(r.bg === "none", `${path} hero should have a plain background, got ${r.bg.slice(0, 40)}`);
      assert(SERIF.test(r.h1), `${path} h1 should use Fraunces, got ${r.h1}`);
    }
    // v9: the one exception is the home hero, the site's front door: navy night over the landmark art.
    await p.goto(url + "/");
    const home = await p.$eval(".hero-home", (e) => ({ color: getComputedStyle(e).backgroundColor, h1: getComputedStyle(e.querySelector("h1")).fontFamily, art: !!e.querySelector(".hero-scene svg") }));
    assert(home.color === "rgb(10, 45, 92)" && home.art && SERIF.test(home.h1), "the home hero is navy with its art: " + JSON.stringify(home));
  });

  test("FAQ is one list with dividers", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    const list = await p.$eval("#faq .faq-list", (e) => getComputedStyle(e).borderTopWidth);
    assert(list === "1px", "the FAQ list should open with a 1px rule, got " + list);
    const items = await p.$$eval("#faq .faq-list > details", (ds) => ds.map((d) => { const s = getComputedStyle(d); return { radius: s.borderTopLeftRadius, bg: s.backgroundColor, top: s.borderTopWidth, bottom: s.borderBottomWidth, shadow: s.boxShadow }; }));
    assert(items.length >= 4, "expected the home questions, found " + items.length);
    const bad = items.filter((i) => i.radius !== "0px" || i.bg !== "rgba(0, 0, 0, 0)" || i.top !== "0px" || i.bottom !== "1px" || i.shadow !== "none");
    assert(!bad.length, "each question should be a plain row with a rule under it, got " + JSON.stringify(bad[0]));
  });

  test("comparison keeps its first column in view", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844 });
    await p.goto(url + "/pricing/#compare");
    const r = await p.$eval(".compare tbody tr:not(.cmp-room) th", (e) => ({ pos: getComputedStyle(e).position, left: getComputedStyle(e).left, bg: getComputedStyle(e).backgroundColor }));
    assert(r.pos === "sticky" && r.left === "0px", "task names should stay in view when the table scrolls sideways: " + JSON.stringify(r));
    assert(r.bg !== "rgba(0, 0, 0, 0)", "a sticky column needs a solid background so cells don't show through");
  });

  test("booking keeps its look and its hooks", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/book/");
    const fam = (sel) => p.$eval(sel, (e) => getComputedStyle(e).fontFamily);
    for (const [sel, want] of [[".progress li", SANS], [".choice-body strong", SANS], [".extra-name", SANS], [".step-nav [data-next]", SANS]]) {
      const f = await fam(sel);
      assert(want.test(f), `${sel} font is ${f}`);
    }
    for (const sel of [".choice-body", ".extra", ".seg", ".compare-box"]) {
      const r = await p.$eval(sel, (e) => parseFloat(getComputedStyle(e).borderTopLeftRadius));
      assert(r >= 12, `${sel} should have at least a 12px radius, got ${r}`);
    }
    assert(await p.$eval("[data-summary]", (e) => getComputedStyle(e).borderTopLeftRadius) === "20px", "the price summary should be a 20px card");
    const hooks = ["#booking-form", "[data-next]", "[data-prev]", "[data-submit]", "[data-summary]", "[data-lines]", "[data-total]", "[data-review]", "[data-addons]", "[data-dates]", "[data-scope-note]", "[data-slot-note]", "[data-quote-route]", "[data-done]"];
    const missing = [];
    for (const h of hooks) if (!(await p.$(h))) missing.push(h);
    assert(!missing.length, "booking hooks missing: " + missing.join(", "));
  });

  // One hue per service (lake, dusk, dawn, sky): each icon is in its service's hue and readable on its tile, and a service
  // page's eyebrow in that hue is readable on the page, in both themes.
  test("each service has its own hue, readable in both themes", async ({ browser, url }) => {
    const keys = Object.keys(C.services);
    for (const theme of ["light", "dark"]) {
      const p = await newPage(browser, { width: 1440, height: 900, theme });
      await p.goto(url + "/");
      const tiles = await p.$$eval(".svc-card-home .svc-ico", (es) => es.map((e) => ({ cls: e.className, fg: getComputedStyle(e).color, bg: getComputedStyle(e).backgroundColor })));
      assert(tiles.length === 4 && new Set(tiles.map((t) => t.bg)).size === 4, `${theme}: four services, four tile colours: ${JSON.stringify(tiles)}`);
      for (const t of tiles) assert(contrast(t.fg, t.bg) >= 4.5, `${theme} ${t.cls}: icon ${t.fg} on ${t.bg} is ${contrast(t.fg, t.bg).toFixed(2)}:1`);
      for (const k of keys.filter((k) => C.services[k].tag)) {
        await p.goto(url + "/services/" + C.services[k].slug + "/");
        const r = await p.$eval(".hero-sub .kicker", (e) => ({ fg: getComputedStyle(e).color, bg: getComputedStyle(document.body).backgroundColor }));
        assert(contrast(r.fg, r.bg) >= 4.5, `${theme} ${k}: eyebrow ${r.fg} on ${r.bg} is ${contrast(r.fg, r.bg).toFixed(2)}:1`);
      }
      await p.context().close();
    }
  });

  test("404 page uses the new type", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/404.html");
    const fam = await p.$eval("h1", (h) => getComputedStyle(h).fontFamily);
    assert(SERIF.test(fam), "404 h1 should use Fraunces, got " + fam);
  });
}
