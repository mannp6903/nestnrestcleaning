// The redesign's rules (docs/superpowers/specs/2026-10-28-modern-redesign-design.md): type, surfaces, components, hero.
import { test, assert, newPage, contrast } from "./lib.mjs";

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

  test("pill buttons and soft cards", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    const box = (sel) => p.$eval(sel, (e) => { const s = getComputedStyle(e), r = e.getBoundingClientRect(); return { radius: parseFloat(s.borderTopLeftRadius), h: r.height, w: r.width }; });
    await p.goto(url + "/");
    const primary = await box(".hero-cta .btn-primary");
    assert(primary.radius >= 26 && Math.abs(primary.h - 52) <= 1, "primary button should be a 52px pill, got " + JSON.stringify(primary));
    const small = await box("#services .btn-sm");
    assert(Math.abs(small.h - 44) <= 1 && small.radius >= 22, "small button should be a 44px pill, got " + JSON.stringify(small));
    for (const sel of ["#services .svc-card", ".hero-home .pricer", "#faq details"]) {
      const b = await box(sel);
      assert(b.radius === 20, `${sel} should have a 20px radius, got ${b.radius}`);
    }
    for (const sel of ["section.standard", ".final-cta .final-inner"]) {
      const b = await box(sel);
      assert(b.radius === 28, `${sel} should be a rounded 28px panel, got ${b.radius}`);
      assert(b.w < 1440, `${sel} should sit inside the page width, got ${b.w}px wide`);
    }
    assert((await box("#pc-home")).radius === 14, "fields should have a 14px radius");
    assert(Math.round((await box("#services .svc-ico")).w) === 42, "icon chips should be 42px");
    await p.goto(url + "/pricing/");
    assert((await box(".price-card")).radius === 20, "price cards should have a 20px radius");
  });

  test("label pill", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    const s = await p.$eval("#services .label", (e) => { const c = getComputedStyle(e); return { fam: c.fontFamily, size: c.fontSize, bg: c.backgroundColor }; });
    assert(/^"?DM Sans/.test(s.fam), "label should use DM Sans, got " + s.fam);
    assert(s.size === "13px", "label should be 13px, got " + s.size);
    assert(s.bg !== "rgba(0, 0, 0, 0)" && s.bg !== "transparent", "label should be a pill with a background");
  });

  // Text colour against the first solid background behind it, for every text element on a page.
  const contrastProblems = (p, scope = "body") => p.evaluate((scope) => {
    // The colour behind an element: translucent backgrounds laid over the first solid one beneath them.
    const solid = (el) => {
      const layers = [];
      for (; el; el = el.parentElement) {
        const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
        if (!m) continue;
        const [r, g, b, a = 1] = m.map(Number);
        if (a === 0) continue;
        layers.push([r, g, b, a]);
        if (a === 1) break;
      }
      let base = [255, 255, 255];
      for (const [r, g, b, a] of layers.reverse()) base = [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a)];
      return `rgb(${base.map(Math.round).join(", ")})`;
    };
    const out = [];
    document.querySelectorAll(scope + " :is(h1,h2,h3,p,li,a,button,.btn,.label,.kicker,label,dt,dd,.extra-name,.sum-total,summary,small,strong,span)").forEach((el) => {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      const r = el.getBoundingClientRect(), s = getComputedStyle(el);
      if (!own || r.width < 2 || r.height < 2 || s.visibility === "hidden" || el.closest("[hidden], .sr-only, [aria-hidden=true]") || +s.opacity < 1) return;
      if (el.matches(":disabled, .is-off *") || el.closest(".announce-msgs > span:not(.is-on)")) return;
      const size = parseFloat(s.fontSize), large = size >= 24 || (size >= 18.66 && +s.fontWeight >= 700);
      out.push({ text: el.textContent.trim().slice(0, 28), tag: el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : ""), fg: s.color, bg: solid(el), min: large ? 3 : 4.5 });
    });
    return out;
  }, scope);

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
      for (const path of ["/", "/pricing/", "/book/", "/help/"]) {
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
    await p.goto(url + "/");
    const bad = [];
    for (const scope of [".standard .label", ".founding .label", ".footer-cols .label"]) {
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

  test("cards lift on hover, but not with reduced motion", async ({ browser, url }) => {
    for (const [motion, wantLift] of [["no-preference", true], ["reduce", false]]) {
      const p = await newPage(browser, { width: 1440, height: 900, reducedMotion: motion });
      await p.goto(url + "/");
      await p.hover("#services .svc-card h3");
      await p.waitForTimeout(350);
      const t = await p.$eval("#services .svc-card", (e) => getComputedStyle(e).transform);
      assert(wantLift ? t !== "none" : t === "none", `${motion}: card transform should be ${wantLift ? "a lift" : "none"}, got ${t}`);
      await p.context().close();
    }
  });

  test("hero copy and actions", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    const lede = (await p.textContent(".hero-home .lede")).trim();
    assert(lede === "Your weekends are for living, not scrubbing. Mann cleans your home with care, so you come back to calm, and you pay only after the clean.", "hero subheading is: " + lede);
    const links = await p.$$eval(".hero-cta a", (as) => as.map((a) => [a.textContent.trim(), a.getAttribute("href")]));
    assert(links.some(([t, h]) => t.startsWith("Book your clean") && h.endsWith("book/")), "hero needs Book your clean -> book/: " + JSON.stringify(links));
    assert(links.some(([t, h]) => t.startsWith("How it works") && h.endsWith("#how")), "hero needs How it works -> #how: " + JSON.stringify(links));
  });

  test("price box on the first phone screen", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844 });
    await p.goto(url + "/");
    const b = await p.locator(".hero-home [data-pricer]").boundingBox();
    assert(b && b.y < 844, "the price box should start on the first phone screen, starts at " + (b && b.y));
  });

  test("photo behind the price box on desktop only", async ({ browser, url }) => {
    for (const [width, want] of [[1440, true], [390, false]]) {
      const p = await newPage(browser, { width, height: 900 });
      await p.goto(url + "/");
      assert(await p.isVisible(".hero-home .hero-photo") === want, `hero photo at ${width}px should be ${want ? "shown" : "hidden"}`);
      await p.context().close();
    }
  });

  test("trust strip", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    assert(await p.locator(".trust-strip li").count() === 4, "the trust strip should hold the four promises");
    assert(await p.evaluate(() => document.querySelector(".hero-home").nextElementSibling.classList.contains("trust-strip")), "the trust strip should come straight after the hero");
    assert(await p.locator("[data-assure]").count() === 1, "the [data-assure] hook should appear exactly once");
  });

  test("section heads are centred on services and how it works", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    for (const sel of ["#services .section-head", "#how .section-head"]) {
      const a = await p.$eval(sel, (e) => getComputedStyle(e).textAlign);
      assert(a === "center", `${sel} should be centred, got ${a}`);
    }
  });

  test("service cards sit three to a row on desktop", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    const tops = await p.$$eval("#services .svc-grid > li", (ls) => ls.slice(0, 3).map((l) => Math.round(l.getBoundingClientRect().top)));
    assert(new Set(tops).size === 1, "the first three service cards should share a row, tops: " + tops.join(", "));
    await p.goto(url + "/realtors/");
    const four = await p.$$eval(".svc-grid-4 > li", (ls) => ls.map((l) => Math.round(l.getBoundingClientRect().top)));
    assert(new Set(four).size === 1, "the four realtor jobs should share a row, tops: " + four.join(", "));
  });

  test("sub-page heroes match the home hero", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    for (const path of ["/pricing/", "/services/deep-cleaning/", "/areas/north-york/willowdale/", "/help/"]) {
      await p.goto(url + path);
      const r = await p.$eval(".hero-sub", (e) => ({ bg: getComputedStyle(e).backgroundImage, h1: getComputedStyle(e.querySelector("h1")).fontFamily }));
      assert(r.bg.includes("radial-gradient"), `${path} hero should have the soft glow`);
      assert(JAKARTA.test(r.h1), `${path} h1 should use Plus Jakarta Sans, got ${r.h1}`);
    }
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
    for (const [sel, want] of [[".progress li", /^"?DM Sans/], [".choice-body strong", JAKARTA], [".extra-name", /^"?DM Sans/], [".step-nav [data-next]", JAKARTA]]) {
      const f = await fam(sel);
      assert(want.test(f), `${sel} font is ${f}`);
    }
    for (const sel of [".choice-body", ".extra", ".seg", ".compare-box"]) {
      const r = await p.$eval(sel, (e) => parseFloat(getComputedStyle(e).borderTopLeftRadius));
      assert(r >= 14, `${sel} should have at least a 14px radius, got ${r}`);
    }
    assert(await p.$eval("[data-summary]", (e) => getComputedStyle(e).borderTopLeftRadius) === "20px", "the price summary should be a 20px card");
    const hooks = ["#booking-form", "[data-next]", "[data-prev]", "[data-submit]", "[data-summary]", "[data-lines]", "[data-total]", "[data-review]", "[data-addons]", "[data-dates]", "[data-scope-note]", "[data-slot-note]", "[data-quote-route]", "[data-done]"];
    const missing = [];
    for (const h of hooks) if (!(await p.$(h))) missing.push(h);
    assert(!missing.length, "booking hooks missing: " + missing.join(", "));
  });

  test("404 page uses the new type", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/404.html");
    const fam = await p.$eval("h1", (h) => getComputedStyle(h).fontFamily);
    assert(JAKARTA.test(fam), "404 h1 should use Plus Jakarta Sans, got " + fam);
  });
}
