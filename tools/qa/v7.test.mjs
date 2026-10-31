// v7 (local, visual, quick to act on): the landmark artwork, the room explorer, the neighbourhood finder, no unconfirmed
// content on any page, and the home price box and booking agreeing with the pricing rules in js/config.js.
import fs from "node:fs";
import path from "node:path";
import { test, assert, newPage, loadConfig, ROOT } from "./lib.mjs";

const C = loadConfig();
const PAGES = [...fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8").matchAll(/<loc>[^<]*?nestnrestcleaning\.com([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
// The same formula as price() in tools/build.mjs and js/site.js, written out here so a change to either is caught.
const roundTo = (n, s) => Math.round(n / s) * s;
const priceOf = (k, beds, baths, home) => {
  const s = C.services[k];
  return roundTo((s.base + Math.max(0, (k === "detail" ? 1 : beds) - 1) * s.perBed + Math.max(0, baths - 1) * s.perBath) * C.homeTypes[home].factor, 5);
};

export default async function () {
  test("no page shows a placeholder or an empty photo box", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844, isMobile: true });
    const bad = [];
    for (const pg of PAGES) {
      await p.goto(url + pg);
      const text = (await p.evaluate(() => document.querySelector("main").innerText)).replace(/\s+/g, " ");
      const hit = text.match(/\[(PHOTO|PRICE|OFFER|X|to confirm)[^\]]*\]/);
      if (hit) bad.push(`${pg}: ${hit[0]}`);
      if (await p.locator(".shot-ph, .ph").count()) bad.push(`${pg}: a placeholder element`);
    }
    assert(!bad.length, bad.join("; "));
  });

  test("landmark art: named for screen readers, decorative inside links, and a different arrangement on phones", async ({ browser, url }) => {
    for (const width of [390, 1440]) {
      const p = await newPage(browser, { width, height: 900 });
      await p.goto(url + "/");
      const hero = await p.$eval(".hero-scene svg", (s) => ({ role: s.getAttribute("role"), label: s.getAttribute("aria-label") || "", vb: s.getAttribute("viewBox"), shown: !!s.getClientRects().length }));
      assert(hero.shown && hero.role === "img" && /Scarborough Bluffs/.test(hero.label) && /Mel Lastman Square/.test(hero.label), `${width}px hero art: ${JSON.stringify(hero)}`);
      const cards = await p.$$eval(".area-card .area-art svg", (ss) => ss.map((s) => s.getAttribute("aria-hidden")));
      assert(cards.length === 2 && cards.every((v) => v === "true"), "district card art is decorative inside its link");
      const wide = await p.$$eval(".page-scene svg", (ss) => ss.map((s) => !!s.getClientRects().length));
      assert(wide.length === 1 && wide[0] === (width >= 960), `${width}px: the wide panorama shows on computers only`);
      await p.context().close();
    }
    const p = await newPage(browser, { width: 1440, height: 900 });
    for (const a of C.areas) {
      await p.goto(url + "/areas/" + a.slug + "/");
      assert(await p.locator(".area-hero-art svg[role=img]").isVisible(), a.name + " page should show its landmark art");
    }
  });

  test("room explorer: rooms are tabs, the clean switch shows that clean's list, booking follows", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1280, height: 900 });
    await p.goto(url + "/");
    const tabs = p.locator("#rooms [role=tab]");
    assert(await tabs.count() === C.checklist.length, "one tab per room in the checklist");
    await tabs.first().focus();
    await p.keyboard.press("ArrowRight");
    const sel = await p.$$eval("#rooms [role=tab]", (ts) => ts.map((t) => t.getAttribute("aria-selected")));
    assert(sel[1] === "true" && sel.filter((v) => v === "true").length === 1, "ArrowRight selects the next room: " + sel);
    assert(await p.locator(".ex-room.is-active").count() === 1 && await p.isVisible("#" + (await tabs.nth(1).getAttribute("aria-controls"))), "only the chosen room shows");
    await p.click('[data-ex-svc] label:has(input[value="deep"])');
    const room = C.checklist[1], col = C.services.deep.checklistColumn;
    const want = room.tasks.filter((t) => t[col] === "yes").length;
    const shown = await p.$eval(`#${await tabs.nth(1).getAttribute("aria-controls")} [data-ex-for="deep"] .ex-count b`, (b) => +b.textContent);
    assert(shown === want, `deep clean in ${room.room}: ${shown} shown, ${want} in js/config.js`);
    assert(/[?&]s=deep\b/.test(await p.getAttribute("[data-ex-book]", "href")), "the booking button follows the chosen clean");
    await p.context().close();
    // Without JavaScript: every room, the regular clean's list, no tabs.
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const q = await ctx.newPage();
    await q.goto(url + "/");
    assert(await q.locator("#rooms [role=tab]").count() === 0, "no tabs without JavaScript");
    const visible = await q.$$eval(".ex-room", (rs) => rs.filter((r) => r.getClientRects().length).length);
    assert(visible === C.checklist.length && await q.isVisible('.ex-room [data-ex-for="regular"]'), "every room's regular list shows without JavaScript");
    await ctx.close();
  });

  test("neighbourhood finder filters as you type and points to the postal check when nothing matches", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844, isMobile: true });
    await p.goto(url + "/");
    const all = C.areas.reduce((n, a) => n + a.neighbourhoods.length, 0);
    assert(await p.$$eval("[data-hood-finder] .hood-list li", (ls) => ls.length) === all, "every neighbourhood is listed");
    await p.fill("#hood-q", "lamoreaux");
    const shown = await p.$$eval("[data-hood-finder] .hood-list li", (ls) => ls.filter((l) => !l.hidden).map((l) => l.textContent.trim()));
    assert(shown.length === 1 && shown[0] === "L'Amoreaux", "lamoreaux should find L'Amoreaux, got " + shown);
    assert(/1 neighbourhood matches/.test(await p.textContent("[data-hood-count]")), "the match count is announced");
    await p.fill("#hood-q", "Mississauga");
    assert(await p.isVisible("[data-hood-empty]") && await p.getAttribute("[data-hood-empty] a", "href") === "#pc-home", "no match: point to the postal check");
    await p.fill("#hood-q", "");
    assert(await p.$$eval("[data-hood-finder] .hood-list li", (ls) => ls.filter((l) => !l.hidden).length) === all, "clearing shows them all again");
    await p.context().close();
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const q = await ctx.newPage();
    await q.goto(url + "/");
    assert(!(await q.isVisible("[data-hood-search]")), "the search box stays hidden without JavaScript, and the full list shows");
    await ctx.close();
  });

  test("regression: the home price box and booking agree with the pricing rules", async ({ browser, url }) => {
    const f = C.offers.founding;
    for (const [k, home, beds, baths] of [["deep", "town", 2, 1], ["regular", "condo", 3, 2], ["move", "house", 4, 3]]) {
      const p = await newPage(browser, { width: 390, height: 844, isMobile: true });
      await p.goto(url + "/");
      await p.selectOption("[data-pricer] select >> nth=0", k);
      await p.selectOption("[data-pricer] select >> nth=1", home);
      for (let i = 1; i < beds; i++) await p.click("[data-p-beds] [data-inc]");
      for (let i = 1; i < baths; i++) await p.click("[data-p-baths] [data-inc]");
      const regular = priceOf(k, beds, baths, home);
      const first = f && f.active ? Math.round(regular * (100 - f.percent) / 100) : regular;
      const box = (await p.textContent("[data-pricer] .pricer-result")).replace(/\s+/g, " ");
      assert(box.includes("$" + first) && box.includes("$" + regular), `${k} ${home} ${beds}/${baths}: price box "${box.slice(0, 120)}" should show $${first} (regular $${regular})`);
      await p.click("[data-p-go]");
      await p.waitForSelector("#booking-form");
      const total = (await p.textContent(".sum-total")).replace(/\s+/g, "");
      assert(total.includes("$" + first), `${k} ${home} ${beds}/${baths}: booking total ${total} should be $${first}`);
      await p.goBack();
      await p.waitForSelector("[data-pricer]");
      assert((await p.textContent("[data-pricer] .pricer-result")).includes("$" + first), "Back returns to the same price");
      await p.context().close();
    }
  });
}
