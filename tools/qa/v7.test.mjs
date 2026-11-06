// v7 (local, visual, quick to act on): the landmark artwork, no unconfirmed content on any page, and the home price box and
// booking agreeing with the pricing rules in js/config.js. (v9 took the room explorer and the neighbourhood finder off the
// shorter home page: what each clean includes is on the service and pricing pages, and every neighbourhood on its district page.)
import fs from "node:fs";
import path from "node:path";
import { test, assert, newPage, loadConfig, ROOT, built } from "./lib.mjs";

const C = loadConfig();
const PAGES = [...fs.readFileSync(built("sitemap.xml"), "utf8").matchAll(/<loc>[^<]*?nestnrestcleaning\.com([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
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

  // The home hero's drawn skyline gave way to a photo (November 2026); the district pages keep their landmark art.
  test("landmark art on every district page", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    for (const a of C.areas) {
      await p.goto(url + "/areas/" + a.slug + "/");
      assert(await p.locator(".area-hero-art svg[role=img]").isVisible(), a.name + " page should show its landmark art");
    }
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
