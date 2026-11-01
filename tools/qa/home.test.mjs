// The home page. v9 (short): a strong hero with one main action, compact service cards with plans, extras and quote paths,
// How to book, questions and Contact. Rules that still hold from earlier versions are kept (docs/superpowers/specs).
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

  // v9: four compact cards, no photos: name, who it's for, the price and two next steps.
  test("home services: four cards with who they're for, price and two next steps", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    const cards = await p.$$eval("#services .svc-cards > li.svc-card-home", (ls) => ls.map((l) => {
      const book = l.querySelector("a.btn-primary"), more = l.querySelector("a.text-link");
      return {
        imgs: l.querySelectorAll("img").length,
        name: (l.querySelector("h3") || {}).textContent, best: (l.querySelector(".svc-best") || {}).textContent, price: (l.querySelector(".svc-price") || {}).textContent,
        book: book && [book.textContent.trim(), book.getAttribute("href")], more: more && [more.textContent.trim(), more.getAttribute("href")]
      };
    }));
    assert(cards.length === 4, "expected four service cards, found " + cards.length);
    cards.forEach((c, i) => {
      const s = C.services[HOME_SERVICES[i]];
      assert(c.name && c.name.trim() === s.name, `card ${i + 1} should be ${s.name}, got ${c.name}`);
      assert(c.imgs === 0, `${s.name}: the cards carry no photos, to keep the page short`);
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
        const tops = [...document.querySelectorAll(".svc-card-home")].map((l) => Math.round(l.getBoundingClientRect().top));
        return { perRow: tops.filter((t) => t === tops[0]).length, wide: document.documentElement.scrollWidth - innerWidth };
      });
      assert(r.perRow === want, `${width}px: expected ${want} card(s) per row, got ${r.perRow}`);
      assert(r.wide <= 0, `${width}px: the page scrolls sideways by ${r.wide}px`);
      await q.context().close();
    }
  });

  test("priced by quote links the quote services and realtors", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    assert((await p.textContent("#services .pf-quote h3")).trim() === "Priced by quote", "the quote row should be called Priced by quote");
    const hrefs = await p.$$eval("#services .pf-quote a", (as) => as.map((a) => a.getAttribute("href")));
    for (const want of ["services/" + C.quoteServices.airbnb.slug + "/", "services/residence-care/", "services/office-cleaning/", "realtors/"]) {
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

  // v9: the plans are a short list beside the extras, each one a way into booking with that plan chosen.
  test("plans: each one opens booking with it chosen, one marked Recommended", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    const plans = Object.keys(C.frequencies).filter((k) => C.frequencies[k].discount);
    const rows = await p.$$eval("#plans li[data-plan]", (ls) => ls.map((l) => { const a = l.querySelector("a"); return [l.getAttribute("data-plan"), a && a.textContent.trim(), a && a.getAttribute("href"), (l.querySelector("b") || {}).textContent, (l.querySelector(".plan-flag") || {}).textContent]; }));
    assert(rows.length === plans.length, "one row per plan with a discount: " + JSON.stringify(rows));
    for (const [k, text, href, off, flag] of rows) {
      const f = C.frequencies[k];
      assert(text === "Choose " + f.label.toLowerCase() && href.endsWith("book/?s=regular&f=" + k), `${k}: ${text} -> ${href}`);
      assert(off === f.discount + "% off", `${k}: says ${off}`);
      assert(!!flag === !!f.recommended && (!flag || flag === "Recommended"), `${k}: flag ${flag}`);
    }
  });

  // v9: How to book is the three steps, then Mann and the booking terms a client asks about. The rest of the old page is gone.
  test("how to book: the steps, who's coming and the booking terms; nothing else from the long page", async ({ browser, url }) => {
    for (const width of [1440, 390]) {
      const p = await newPage(browser, { width, height: 900 });
      await p.goto(url + "/");
      const r = await p.evaluate(() => {
        const how = document.querySelector("#how");
        return { steps: how.querySelectorAll("ol.steps-3 > li").length, photo: !!how.querySelector(".how-meet img"), meet: (how.querySelector(".how-meet h3") || {}).textContent,
          terms: [...how.querySelectorAll(".terms > li h3")].map((h) => h.textContent.trim()), reclean: [...how.querySelectorAll(".terms > li p")].map((x) => x.textContent).find((t) => /re-clean/.test(t)) || "",
          old: [...document.querySelectorAll("#founder, section.standard, #guides, #rooms, #hosts, .trust-strip, .page-scene, .final-cta, .area-cards, [data-hood-finder]")].map((e) => e.id || e.className) };
      });
      assert(r.steps === 3 && r.photo && r.meet === "I clean every home myself.", `${width}px: ${JSON.stringify(r)}`);
      assert(JSON.stringify(r.terms) === JSON.stringify(["Pay after the clean", "Free changes", "Not quite right? Free re-clean", "Supplies included"]), `${width}px: terms ${JSON.stringify(r.terms)}`);
      assert(/^Report anything missed within 24 hours of your clean/.test(r.reclean), `${width}px: the guarantee: ${r.reclean}`);
      assert(!r.old.length, `${width}px: these belong to the old long page: ${r.old.join(", ")}`);
      await p.context().close();
    }
  });

  test("contact: every way to reach us, the areas, the postal check and help with a booking", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    const r = await p.evaluate(() => {
      const c = document.querySelector("#contact");
      return { mail: [...c.querySelectorAll('a[href^="mailto:"]')].map((a) => a.getAttribute("href")), text: c.textContent.replace(/\s+/g, " "),
        areas: [...c.querySelectorAll("#areas a")].map((a) => a.getAttribute("href")), pc: !!c.querySelector("#pc-home"), help: !!c.querySelector('a[href$="help/"]'),
        book: [...c.querySelectorAll("a.btn-primary")].map((a) => a.getAttribute("href")) };
    });
    assert(r.mail.some((h) => h === "mailto:" + C.business.email), "the email address is a link: " + r.mail);
    assert(r.text.includes(C.business.hours) && r.text.includes(C.business.replyPromise), "hours and reply time are stated");
    for (const a of C.areas) assert(r.areas.some((h) => h.endsWith("areas/" + a.slug + "/")), "links to " + a.name + ": " + r.areas);
    assert(r.pc && r.help && r.book.length === 1 && r.book[0].endsWith("book/"), JSON.stringify(r));
    const nav = await p.$$eval(".nav-desktop a", (as) => as.map((a) => [a.textContent.trim(), a.getAttribute("href")]));
    assert(nav.some(([t, h]) => t === "Contact" && h.endsWith("#contact")) && nav.some(([t, h]) => t === "How to book" && h.endsWith("#how")), "the nav names Contact and How to book: " + JSON.stringify(nav));
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
