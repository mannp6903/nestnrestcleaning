// The v3 homepage (docs/superpowers/specs/2026-10-29-website-redesign-v3-design.md, section 5): one main action, photo service cards, quote paths, calmer bands.
import { test, assert, newPage, loadConfig } from "./lib.mjs";

const C = loadConfig();
const HOME_SERVICES = ["regular", "deep", "move", "detail"];

export default async function () {
  test("hero has one main action and no decorative photo", async ({ browser, url }) => {
    for (const width of [1440, 390]) {
      const p = await newPage(browser, { width, height: 900 });
      await p.goto(url + "/");
      const primary = await p.$$eval(".hero-cta .btn-primary", (as) => as.map((a) => a.textContent.trim()));
      assert(primary.length === 1 && primary[0].startsWith("Request a clean"), `${width}px: the hero should have one main action, Request a clean, got ${JSON.stringify(primary)}`);
      const how = await p.$$eval(".hero-cta .text-link", (as) => as.map((a) => [a.textContent.trim(), a.getAttribute("href")]));
      assert(how.length === 1 && how[0][0] === "How it works" && how[0][1].endsWith("#how"), `${width}px: How it works should be a text link to #how, got ${JSON.stringify(how)}`);
      const imgs = await p.$$eval(".hero-home img", (is) => is.map((i) => i.getAttribute("src")));
      assert(imgs.length === 1 && /avatar/.test(imgs[0]), `${width}px: the owner's photo should be the hero's only image, got ${imgs.join(", ")}`);
      // v4: the h1 itself says what and where, then the slogan.
      const h1 = (await p.textContent(".hero-home h1")).replace(/\s+/g, " ").trim();
      assert(h1 === "House cleaning in Scarborough & North York We clean. You rest.", "hero h1 is: " + h1);
      await p.context().close();
    }
  });

  test("home services: four photo cards with who they're for, price and two next steps", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    const cards = await p.$$eval("#services .svc-feature > li.svc-feature-card", (ls) => ls.map((l) => {
      const img = l.querySelector("img"), book = l.querySelector("a.btn-primary"), more = l.querySelector("a.text-link");
      return {
        img: img && { lazy: img.loading === "lazy", w: img.getAttribute("width"), h: img.getAttribute("height"), alt: img.alt },
        name: (l.querySelector("h3") || {}).textContent, best: (l.querySelector(".svc-best") || {}).textContent, price: (l.querySelector(".svc-price") || {}).textContent,
        book: book && [book.textContent.trim(), book.getAttribute("href")], more: more && [more.textContent.trim(), more.getAttribute("href")]
      };
    }));
    assert(cards.length === 4, "expected four service cards, found " + cards.length);
    cards.forEach((c, i) => {
      const s = C.services[HOME_SERVICES[i]];
      assert(c.name && c.name.trim() === s.name, `card ${i + 1} should be ${s.name}, got ${c.name}`);
      assert(c.img && c.img.lazy && c.img.w && c.img.h && c.img.alt, `${s.name}: the photo should be lazy with a width, height and alt text, got ${JSON.stringify(c.img)}`);
      assert(c.best && c.best.trim() === "Best for: " + s.idealFor[0], `${s.name}: expected "Best for: ${s.idealFor[0]}", got ${c.best}`);
      assert(c.price && c.price.includes("$" + s.base), `${s.name}: the price should show $${s.base}, got ${c.price}`);
      assert(c.book && c.book[0] === "Request" && c.book[1].endsWith("book/?s=" + HOME_SERVICES[i]), `${s.name}: Request should go to book/?s=${HOME_SERVICES[i]}, got ${JSON.stringify(c.book)}`);
      assert(c.more && c.more[0] === "What's included" && c.more[1].endsWith("services/" + s.slug + "/#included"), `${s.name}: What's included should go to the service page, got ${JSON.stringify(c.more)}`);
    });
    await p.context().close();
    for (const [width, want] of [[1440, 4], [1024, 4], [768, 2], [390, 1]]) {
      const q = await newPage(browser, { width, height: 900 });
      await q.goto(url + "/");
      const r = await q.evaluate(() => {
        const tops = [...document.querySelectorAll(".svc-feature-card")].map((l) => Math.round(l.getBoundingClientRect().top));
        return { perRow: tops.filter((t) => t === tops[0]).length, wide: document.documentElement.scrollWidth - innerWidth };
      });
      assert(r.perRow === want, `${width}px: expected ${want} card(s) per row, got ${r.perRow}`);
      assert(r.wide <= 0, `${width}px: the page scrolls sideways by ${r.wide}px`);
      await q.context().close();
    }
  });

  // On phones the photos are 88px squares, so even a 3x screen should get the 600px file, not the 928px one.
  test("phone service thumbnails load the small photo", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844, isMobile: true });
    await p.goto(url + "/");
    await p.$$eval(".svc-feature-card img", (is) => is.forEach((i) => { i.loading = "eager"; }));
    await p.waitForFunction(() => [...document.querySelectorAll(".svc-feature-card img")].every((i) => i.complete && i.currentSrc));
    const srcs = await p.$$eval(".svc-feature-card img", (is) => is.map((i) => i.currentSrc.split("/").pop()));
    assert(srcs.length === 4 && srcs.every((s) => /-600\./.test(s)), "phone thumbnails should use the 600px photos, got " + srcs.join(", "));
  });

  test("not a regular home? links the quote services and realtors", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    const text = await p.textContent("#services .svc-paths");
    assert(text.includes("Not a regular home?"), "the quote-path row should ask Not a regular home?");
    const hrefs = await p.$$eval("#services .svc-paths a", (as) => as.map((a) => a.getAttribute("href")));
    for (const want of ["services/residence-care/", "services/office-cleaning/", "realtors/"]) {
      assert(hrefs.some((h) => h.endsWith(want)), `missing a link to ${want}: ${hrefs.join(", ")}`);
    }
  });

  test("the founding offer appears in the price box and service prices, not as a separate panel", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    assert(await p.locator(".founding").count() === 0, "the separate founding panel should be gone from the home page");
    assert(await p.locator(".hero-home .pricer-deal").count() === 1 && await p.isVisible(".hero-home .pricer-deal"), "the price box should still show the offer, as one line under the price");
    assert(await p.locator(".hero-home .pricer-offer").count() === 0, "the offer shouldn't also sit in a separate box in the price box");
    const firsts = await p.$$eval("#services .svc-first", (ss) => ss.map((s) => s.textContent.trim()));
    assert(firsts.length === 4 && firsts.every((t) => /^\$\d+ first visit$/.test(t)), "each service price should show its first-visit price, got " + JSON.stringify(firsts));
  });

  test("plans are one strip", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    assert(await p.locator("#plans .plan-strip").count() === 1, "expected one plan strip");
    const strip = await p.$eval("#plans .plan-strip", (e) => { const s = getComputedStyle(e); return { radius: s.borderTopLeftRadius, border: s.borderTopWidth }; });
    assert(strip.radius === "14px" && strip.border === "1px", "the strip should be one bordered 14px box, got " + JSON.stringify(strip));
    const cells = await p.$$eval("#plans .plan-strip > .plan", (ps) => ps.map((e) => { const s = getComputedStyle(e); return { radius: s.borderTopLeftRadius, border: s.borderTopWidth, top: Math.round(e.getBoundingClientRect().top) }; }));
    assert(cells.length === 4, "expected four plans, found " + cells.length);
    assert(cells.every((c) => c.radius === "0px" && c.border === "0px"), "plan cells shouldn't be cards of their own, got " + JSON.stringify(cells[0]));
    assert(new Set(cells.map((c) => c.top)).size === 1, "the four plans should sit in one row on desktop");
    const flags = await p.$$eval("#plans .plan-flag", (fs) => fs.map((f) => f.textContent.trim()));
    assert(flags.length === 1 && flags[0] === "Most popular", "one plan should be flagged Most popular, got " + JSON.stringify(flags));
  });

  test("the standard band has no card inside it", async ({ browser, url }) => {
    for (const [width, side] of [[1440, "borderLeftWidth"], [390, "borderTopWidth"]]) {
      const p = await newPage(browser, { width, height: 900 });
      await p.goto(url + "/");
      assert(await p.locator(".standard img").count() === 0, `${width}px: the standard band shouldn't hold a photo`);
      const g = await p.$eval(".standard .standard-guarantee", (e) => { const s = getComputedStyle(e); return { bg: s.backgroundColor, shadow: s.boxShadow, title: (e.querySelector("#guarantee-title") || {}).textContent, left: s.borderLeftWidth, top: s.borderTopWidth }; });
      assert(g.bg === "rgba(0, 0, 0, 0)" && g.shadow === "none", `${width}px: the guarantee should sit on the band, not in a card: ${JSON.stringify(g)}`);
      assert(g.title && g.title.startsWith("Not quite right?"), `${width}px: the guarantee heading is missing`);
      assert((side === "borderLeftWidth" ? g.left : g.top) === "1px", `${width}px: the guarantee should sit beside a rule (${side}), got ${JSON.stringify(g)}`);
      await p.context().close();
    }
  });

  test("steps are a row, not cards", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    const steps = await p.$$eval("#how ol.steps-3 > li", (ls) => ls.map((l) => { const s = getComputedStyle(l); return { shadow: s.boxShadow, bg: s.backgroundColor, border: s.borderTopWidth, top: Math.round(l.getBoundingClientRect().top) }; }));
    assert(steps.length === 3, "expected three steps, found " + steps.length);
    assert(steps.every((s) => s.shadow === "none" && s.bg === "rgba(0, 0, 0, 0)" && s.border === "0px"), "steps should be plain columns, got " + JSON.stringify(steps[0]));
    assert(new Set(steps.map((s) => s.top)).size === 1, "the three steps should share a row on desktop");
    const rule = await p.$eval("#how ol.steps-3", (e) => getComputedStyle(e).borderTopWidth);
    assert(rule === "1px", "a hairline should sit above the steps, got " + rule);
  });
}
