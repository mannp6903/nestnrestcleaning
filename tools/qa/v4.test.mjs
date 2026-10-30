// The v4 rules (docs/superpowers/specs/2026-10-29-website-redesign-v4-design.md): scope stated in full, errors beside
// their field, tabular money, one table at a time on phones, aligned panels, one action vocabulary, a 12px floor.
import { test, assert, newPage, loadConfig } from "./lib.mjs";
import { toDetails, fillDetails } from "./booking.test.mjs";

const C = loadConfig();
const JAKARTA = /^"?Plus Jakarta Sans"?/;

export default async function () {
  test("service pages say what's included, what's extra and what isn't", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    for (const key of Object.keys(C.services)) {
      const s = C.services[key], col = s.checklistColumn;
      const tasks = C.checklist.filter((r) => !s.rooms || s.rooms.includes(r.room)).flatMap((r) => r.tasks);
      // v5.1: extras are counted one per extra (a row with two extras counts two), plus extras tied to no task under Whole home.
      const linked = (t) => Math.max(1, C.addons.filter((a) => a.task === t[0]).length);
      const free = C.checklist.some((r) => r.room === "Whole home" && (!s.rooms || s.rooms.includes(r.room))) ? C.addons.filter((a) => !a.task).length : 0;
      const want = { yes: tasks.filter((t) => t[col] === "yes").length, add: tasks.filter((t) => t[col] === "add").reduce((n, t) => n + linked(t), 0) + free, none: tasks.filter((t) => !t[col]).map((t) => t[0]) };
      await p.goto(url + "/services/" + s.slug + "/");
      const got = await p.evaluate(() => ({
        none: [...document.querySelectorAll("#included li[data-not-included]")].map((li) => li.querySelector("span").textContent.trim()),
        sum: [...document.querySelectorAll("#included .scope-sum b")].map((b) => +b.textContent)
      }));
      assert(JSON.stringify(got.none.sort()) === JSON.stringify(want.none.slice().sort()), `${s.slug}: not-included tasks should be ${want.none.join(", ")}, got ${got.none.join(", ")}`);
      assert(JSON.stringify(got.sum) === JSON.stringify([want.yes, want.add, want.none.length]), `${s.slug}: summary should read ${[want.yes, want.add, want.none.length]}, got ${got.sum}`);
    }
    await p.goto(url + "/services/regular-home-cleaning/");
    const more = await p.$eval("#included .scope-more a", (a) => a.getAttribute("href"));
    assert(more.includes("deep-cleaning"), "regular cleaning should point to Deep Cleaning as the next step up, got " + more);
  });

  test("step 2 errors sit beside the choice, not in a toast", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844, isMobile: true });
    await p.goto(url + "/book/?s=regular&h=condo&bd=2&ba=1");
    await p.fill("#f-postal", "M2N 5W9");
    await p.click("[data-next]");
    await p.click("[data-next]");
    const day = await p.evaluate(() => {
      const a = document.activeElement, id = a.getAttribute("aria-describedby"), msg = id && document.getElementById(id);
      return { name: a.name, text: msg && !msg.hidden ? msg.textContent.trim() : "", toast: !document.querySelector("[data-toast]").hidden };
    });
    assert(day.name === "date" && /preferred day/.test(day.text) && !day.toast, "missing day: focus on a day, described by an inline error, no toast: " + JSON.stringify(day));
    await p.click("label.date-chip >> nth=1");
    assert(await p.isHidden("#err-date"), "the day error should clear once a day is chosen");
    await p.click("[data-next]");
    const slot = await p.evaluate(() => { const a = document.activeElement, id = a.getAttribute("aria-describedby"); return { name: a.name, text: id ? document.getElementById(id).textContent : "" }; });
    assert(slot.name === "slot" && /arrival window/.test(slot.text), "missing window: focus on a window, described by an inline error: " + JSON.stringify(slot));
    await p.click('label.slot[data-slot="morning"]');
    assert(await p.isHidden("#err-slot"), "the window error should clear once a window is chosen");
  });

  test("money uses tabular figures in the headline face", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    const check = async (sel) => {
      const s = await p.$eval(sel, (e) => ({ ff: getComputedStyle(e).fontFamily, num: getComputedStyle(e).fontVariantNumeric }));
      assert(JAKARTA.test(s.ff) && /tabular-nums/.test(s.num), `${sel}: ${JSON.stringify(s)}`);
    };
    await p.goto(url + "/");
    await check("[data-p-amount]");
    await check(".svc-price b");
    await p.goto(url + "/book/");
    for (const sel of ["[data-total]", ".extra-price", ".sum-lines dd", ".choice-from b"]) await check(sel);
  });

  test("the done screen drops the earliest-day line", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844 });
    await toDetails(p, url);
    await fillDetails(p);
    await p.click("[data-submit]");
    await p.waitForSelector("[data-done]:not([hidden])");
    assert(await p.isHidden(".book-sub"), "\"Earliest day to request\" shouldn't stay above a sent request");
    const title = (await p.textContent("[data-done-title]")).trim();
    assert(title === "Thank you, Priya.", "done title: " + title);
  });

  test("pricing shows one table at a time, at every width", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844, isMobile: true });
    await p.goto(url + "/pricing/");
    const shown = () => p.$$eval(".price-card", (cs) => cs.filter((c) => c.offsetParent).map((c) => c.id));
    const tabs = await p.$$eval('.price-tabs [role="tab"]', (ts) => ts.map((t) => [t.textContent, t.getAttribute("aria-selected"), t.getAttribute("aria-controls")]));
    assert(tabs.length === Object.keys(C.services).length && tabs[0][1] === "true", "one tab per instant-price service, the first selected: " + JSON.stringify(tabs));
    assert(JSON.stringify(await shown()) === '["prices-regular"]', "only the selected table shows: " + await shown());
    await p.focus('.price-tabs [aria-selected="true"]');
    await p.keyboard.press("ArrowRight");
    assert(JSON.stringify(await shown()) === '["prices-deep"]' && (await p.evaluate(() => document.activeElement.textContent)) === "Deep", "ArrowRight moves to Deep");
    await p.keyboard.press("End");
    assert((await shown())[0] === "prices-detail", "End moves to the last table");
    await p.goto(url + "/pricing/#prices-move");
    assert(JSON.stringify(await shown()) === '["prices-move"]', "a link to #prices-move opens that table: " + await shown());
    // v5: computers get the tabs too, so the page doesn't stack four long tables.
    await p.setViewportSize({ width: 1280, height: 900 });
    await p.waitForTimeout(100);
    assert(JSON.stringify(await shown()) === '["prices-move"]' && await p.isVisible(".price-tabs"), "computers see one table, with the tabs: " + await shown());
  });

  test("navy panels line up with the page", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    const x = await p.evaluate(() => {
      const l = (s) => Math.round(document.querySelector(s).getBoundingClientRect().left);
      return { std: l("section.standard"), cta: l(".final-cta .final-inner"), stdText: l("section.standard h2"), ctaText: l(".final-cta h2"), page: l("#services h2") };
    });
    assert(x.std === x.cta, "both navy panels should share an edge: " + JSON.stringify(x));
    assert(x.stdText === x.page && x.ctaText === x.page, "text inside the panels should line up with the page's: " + JSON.stringify(x));
  });

  test("headline full stops sit close, and the words don't change", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    const r = await p.$$eval("main h1, main h2", (hs) => hs.filter((h) => /\.$/.test(h.textContent.trim())).map((h) => ({ t: h.textContent.trim(), stop: !!(h.querySelector(".stop:last-child") || [...h.querySelectorAll(".stop")].pop()) })));
    assert(r.length >= 6 && r.every((h) => h.stop), "every heading's closing stop should be in .stop: " + JSON.stringify(r.filter((h) => !h.stop)));
    const h2 = (await p.textContent("#services h2")).trim();
    assert(h2 === "Choose the care your home needs.", "heading text is unchanged: " + h2);
  });

  test("links into booking use one vocabulary", async ({ browser, url }) => {
    // v5: the words match the stage. Into the form, "Request a clean" ("Request" where space is short); from a price, the day comes next;
    // from a plan, its name (docs/superpowers/specs/2026-10-30-website-v5-design.md).
    const ok = ["Request a clean", "Choose a preferred day", "Request", "Request again", ...Object.values(C.frequencies).map((f) => "Choose " + f.label.toLowerCase())];
    const p = await newPage(browser, { width: 390, height: 844, isMobile: true });
    const bad = [];
    for (const path of ["/", "/pricing/", "/services/deep-cleaning/", "/areas/scarborough/"]) {
      for (const width of [390, 1440]) {
        await p.setViewportSize({ width, height: 900 });
        await p.goto(url + path);
        const labels = await p.$$eval('a[href*="book/"]', (as) => as.filter((a) => a.getClientRects().length).map((a) => [...a.childNodes].filter((n) => n.nodeType === 3 || (n.nodeType === 1 && getComputedStyle(n).display !== "none" && n.tagName !== "svg")).map((n) => n.textContent).join("").replace(/\s+/g, " ").trim()));
        bad.push(...labels.filter((t) => !ok.includes(t)).map((t) => `${path}@${width} "${t}"`));
      }
    }
    assert(!bad.length, "unexpected booking labels: " + [...new Set(bad)].join("; "));
  });

  test("the phone menu leads with Request a clean, fully in view", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844 });
    for (const y of [0, 600]) {
      await p.goto(url + "/");
      await p.evaluate((v) => window.scrollTo(0, v), y);
      await p.click(".menu-btn");
      const r = await p.evaluate(() => {
        const first = document.querySelector("#menu a"), b = first.getBoundingClientRect(), hit = document.elementFromPoint(b.left + b.width / 2, b.top + 4);
        return { text: first.textContent.trim(), clear: !!(hit && first.contains(hit)), groups: [...document.querySelectorAll("#menu .label")].map((l) => l.textContent.trim()) };
      });
      assert(r.text === "Request a clean" && r.clear, `scrolled ${y}px: the menu should open with Request a clean in full view: ` + JSON.stringify(r));
      assert(JSON.stringify(r.groups) === '["Services","Plan your clean","About us"]', "menu groups: " + r.groups);
    }
  });

  test("the desktop nav shows where you are", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    const current = async () => p.$$eval(".nav-desktop a.is-current", (as) => as.map((a) => a.textContent.trim() + (a.getAttribute("aria-current") ? ":" + a.getAttribute("aria-current") : "")));
    await p.goto(url + "/pricing/");
    assert(JSON.stringify(await current()) === '["Pricing:page"]', "pricing: " + await current());
    await p.goto(url + "/services/deep-cleaning/");
    assert(JSON.stringify(await current()) === '["Services"]', "a service page marks Services without aria-current: " + await current());
    await p.goto(url + "/");
    assert((await current()).length === 0, "the home page marks nothing");
  });

  test("pricing says which clean fits which situation", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844 });
    await p.goto(url + "/pricing/");
    const rows = await p.$$eval("#which .chooser a", (as) => as.map((a) => [a.getAttribute("href"), a.querySelector("strong").textContent.trim(), (a.querySelector("[data-from]") || {}).textContent || "quote"]));
    assert(rows.length === 5, "five situations, got " + rows.length);
    for (const [href, name, from] of rows) {
      const s = Object.values(C.services).concat(Object.values(C.quoteServices)).find((x) => x.name === name);
      assert(s && href.includes(s.slug), `${name} should link to its page, got ${href}`);
      if (C.services[Object.keys(C.services).find((k) => C.services[k] === s)]) assert(from === "$" + s.base, `${name} should say from $${s.base}, got ${from}`);
    }
  });

  test("inner price boxes carry Mann's confirmation; the home one doesn't repeat it", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    for (const path of ["/pricing/", "/services/deep-cleaning/", "/areas/scarborough/", "/areas/north-york/willowdale/"]) {
      await p.goto(url + path);
      const t = (await p.textContent("[data-pricer] .pricer-owner")).replace(/\s+/g, " ").trim();
      assert(/confirms your day, time and final price/.test(t), `${path}: ${t}`);
    }
    await p.goto(url + "/");
    assert(await p.locator("[data-pricer] .pricer-owner").count() === 0 && await p.isVisible(".hero-owner"), "home keeps its hero owner line only");
  });

  test("booking says when the price box filled things in", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844 });
    await p.goto(url + "/book/?s=deep&h=house&bd=3&ba=2");
    assert(await p.isVisible("[data-picked]"), "arriving from a price box shows its choices in a card");
    await p.goto(url + "/book/");
    assert(await p.isHidden("[data-picked]") && await p.isVisible("[data-home-fields]"), "arriving directly shows the full choices");
  });

  test("headings never hyphenate", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    const bad = [];
    for (const path of ["/", "/pricing/", "/services/deep-cleaning/", "/book/"]) {
      await p.goto(url + path);
      bad.push(...(await p.$$eval("h1, h2, h3", (hs) => hs.filter((h) => getComputedStyle(h).hyphens === "auto").map((h) => h.textContent.trim().slice(0, 30)))).map((t) => path + " " + t));
    }
    assert(!bad.length, "headings with automatic hyphenation (e.g. \"hap-pen\"): " + bad.slice(0, 4).join("; "));
  });

  test("no text smaller than 12px on phones", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 360, height: 800, isMobile: true });
    const bad = [];
    for (const path of ["/", "/pricing/", "/book/", "/services/deep-cleaning/", "/areas/scarborough/"]) {
      await p.goto(url + path);
      const found = await p.evaluate(() => {
        const out = [], w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) {
          const el = w.currentNode.parentElement, t = w.currentNode.textContent.trim();
          if (!t || !el.getClientRects().length || el.closest(".sr-only, .cmp-long, [hidden]")) continue;
          const fs = parseFloat(getComputedStyle(el).fontSize);
          if (fs < 11.9) out.push(fs.toFixed(1) + "px " + t.slice(0, 20));
        }
        return out;
      });
      bad.push(...found.map((f) => path + " " + f));
    }
    assert(!bad.length, "text under 12px: " + bad.slice(0, 6).join("; "));
  });
}
