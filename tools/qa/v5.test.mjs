// The v5 rules (docs/superpowers/specs/2026-10-30-website-v5-design.md): plans you can choose, prices that say what
// they're for, a shorter booking form, paged dates, a scannable pricing page, words that match the stage, service pages
// that lead with what's covered, and a full phone booking at 360, 390 and 430px.
import { test, assert, newPage, mockDelivery, loadConfig, openSection, contrast, contrastProblems } from "./lib.mjs";

const C = loadConfig();
const PLANS = Object.keys(C.frequencies);
const sideways = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
// The element that would receive a tap at the middle of this one: covered means a sticky bar is in the way.
const covered = (p, sel) => p.$eval(sel, (el) => {
  const r = el.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return !(hit && (el === hit || el.contains(hit) || hit.contains(el) || (el.closest("label") && el.closest("label").contains(hit))));
});

export default async function () {
  test("each plan can be chosen, and booking opens with it selected", async ({ browser, url }) => {
    for (const width of [390, 1440]) {
      const p = await newPage(browser, { width, height: 900 });
      for (const path of ["/", "/pricing/"]) {
        await p.goto(url + path);
        const links = await p.$$eval("[data-plans] .plan", (ps) => ps.map((pl) => { const a = pl.querySelector("a.plan-go"); return [pl.getAttribute("data-plan"), a && a.textContent.trim(), a && a.getAttribute("href")]; }));
        assert(links.length === PLANS.length, `${path}@${width}: one Choose button per plan: ${JSON.stringify(links)}`);
        for (const [k, text, href] of links) {
          assert(text === "Choose " + C.frequencies[k].label.toLowerCase(), `${path}@${width}: ${k} button reads "${text}"`);
          assert(/book\/(index\.html)?\?s=regular&f=/.test(href) && href.endsWith("f=" + k), `${path}@${width}: ${k} links to ${href}`);
        }
        const above = await p.evaluate(() => { const f = document.querySelector(".plan-for"), s = document.querySelector(".plan-strip"); return f && s && f.getBoundingClientRect().bottom <= s.getBoundingClientRect().top; });
        assert(above, `${path}@${width}: the home the plans are priced for sits above them`);
      }
      await p.context().close();
    }
    const p = await newPage(browser, { width: 390, height: 844 });
    await p.goto(url + "/");
    await p.click('.plan[data-plan="biweekly"] .plan-go');
    await p.waitForSelector("#booking-form");
    assert(await p.isVisible("[data-plan-note]") && /Every 2 weeks/.test(await p.textContent("[data-plan-note]")), "the plan note says which plan was chosen");
    await p.fill("#f-postal", "M2N 5W9");
    await p.click("[data-next]");
    assert(await p.$eval('input[name="freq"]:checked', (i) => i.value) === "biweekly", "Every 2 weeks arrives selected on step 2");
    const later = await p.$$eval("[data-lines] dt", (ds) => ds.map((d) => d.textContent.trim()));
    assert(later.some((t) => t === "Then every 2 weeks"), "the estimate shows the later-visit price: " + later.join(" | "));
  });

  test("every price says what it's for", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/");
    const line = () => p.$eval("[data-p-for]", (e) => e.textContent.trim());
    const order = await p.evaluate(() => { const f = document.querySelector("[data-p-for]"), a = document.querySelector(".pricer-amount"); return f.getBoundingClientRect().bottom <= a.getBoundingClientRect().top + 1; });
    assert(order, "the configuration sits above the price");
    assert(await line() === "Regular Cleaning · 1-bedroom, 1-bathroom condo", "default: " + await line());
    await p.selectOption("[data-p-service]", "deep");
    await p.selectOption("[data-p-home]", "house");
    await p.click("[data-p-beds] [data-inc]");
    assert(await line() === "Deep Cleaning · 2-bedroom, 1-bathroom house", "after changes: " + await line());
    await p.selectOption("[data-p-service]", "detail");
    assert(await line() === "Kitchen & Bath Detailing · kitchen and 1 bathroom, house", "detailing: " + await line());
    const plansFor = (await p.textContent(".plan-for")).replace(/\s+/g, " ").trim();
    assert(plansFor === "Prices shown for: Regular Cleaning · 2-bedroom, 1-bathroom condo", "plans: " + plansFor);
  });

  test("from a price box, the home is one card with Edit", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844 });
    await p.goto(url + "/book/?s=deep&h=house&bd=3&ba=2");
    assert(await p.isVisible("[data-picked]") && await p.isHidden("[data-home-fields]"), "the card replaces the full choices");
    const card = (await p.textContent("[data-picked]")).replace(/\s+/g, " ");
    assert(card.includes("Deep Cleaning") && card.includes("House · 3 bed, 2 bath"), "card: " + card);
    await p.focus("[data-picked-edit]");
    await p.keyboard.press("Enter");
    assert(await p.isVisible("[data-home-fields]") && await p.isHidden("[data-picked]"), "Edit opens the full choices");
    assert(await p.evaluate(() => document.activeElement.name + ":" + document.activeElement.value) === "service:deep", "focus lands on the chosen service");
    // Edit from the review reaches it too, when the card is showing.
    await p.goto(url + "/book/?s=regular&h=condo&bd=2&ba=1");
    await p.fill("#f-postal", "M2N 5W9");
    await p.click("[data-next]");
    await p.click("label.date-chip >> nth=1");
    await p.click('label.slot[data-slot="morning"]');
    await p.click("[data-next]");
    await p.click('[data-review] button[data-edit-focus*="service"]');
    assert(await p.isVisible("[data-home-fields]") && await p.evaluate(() => document.activeElement.name) === "service", "Edit service opens the choices and focuses the service");
  });

  test("folded sections say what's chosen, and open from the keyboard", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844 });
    await p.goto(url + "/book/?s=regular&h=condo&bd=2&ba=1");
    const status = (n) => p.$eval(`[data-section-status="${n}"]`, (e) => e.textContent.trim());
    assert(await status("extras") === "None added" && await status("checks") === "None", "empty sections say so");
    assert(await p.$$eval("details[data-section]", (ds) => ds.every((d) => !d.open)), "sections start folded");
    await p.focus('details[data-section="extras"] > summary');
    await p.keyboard.press("Enter");
    assert(await p.$eval('details[data-section="extras"]', (d) => d.open), "Enter on the summary opens Extras");
    await p.click('label.extra[data-addon="oven"]');
    await p.click('label.extra[data-addon="windows"]');
    await p.click('details[data-section="extras"] > summary');
    const want = ["oven", "windows"].map((id) => C.addons.find((a) => a.id === id));
    assert(await status("extras") === `${want[0].name} · ${want[1].name} · +$${want[0].price + want[1].price}`, "extras status: " + await status("extras"));
    assert(await p.isVisible(`[data-section-status="extras"]`), "what's chosen stays in view with the section folded");
    // Move-out includes some extras: the folded section says so (a fresh start, without the extras saved above).
    await p.evaluate(() => localStorage.removeItem("nr-quote-v1"));
    await p.goto(url + "/book/?s=move&h=condo&bd=2&ba=1");
    assert(/included in Move-In \/ Move-Out/.test(await status("extras")), "move-out says what's included: " + await status("extras"));
    // Step 3: visit preferences.
    await p.goto(url + "/book/?s=regular&h=condo&bd=2&ba=1");
    await p.fill("#f-postal", "M2N 5W9");
    await p.click("[data-next]");
    await p.click("label.date-chip >> nth=1");
    await p.click('label.slot[data-slot="morning"]');
    await p.click("[data-next]");
    assert(await status("visit") === "I'll be home · No pets · Our products", "default visit status: " + await status("visit"));
    await openSection(p, "visit");
    await p.click('label:has(input[name="pets"][value="Dog"])');
    await p.fill("#f-notes", "Ring twice");
    assert(await status("visit") === "I'll be home · Dog · Our products · Notes added", "visit status: " + await status("visit"));
    // An invalid referral name opens its section and takes focus there.
    await openSection(p, "referral");
    await p.fill("#f-referrer", "Sam");
    await p.click('details[data-section="referral"] > summary');
    await p.fill("#f-name", "Priya Sample");
    await p.fill("#f-phone", "647 555 0123");
    await p.fill("#f-address", "1 Example St");
    await p.click("[data-submit]");
    assert(await p.evaluate(() => document.activeElement.id) === "f-referrer" && await p.$eval('details[data-section="referral"]', (d) => d.open), "the referral error unfolds its section");
  });

  test("the date strip pages with Earlier and Later, and says what's in view", async ({ browser, url }) => {
    for (const width of [360, 1440]) {
      const p = await newPage(browser, { width, height: 900 });
      await p.goto(url + "/book/?s=regular&h=condo&bd=1&ba=1");
      await p.fill("#f-postal", "M2N 5W9");
      await p.click("[data-next]");
      const view = () => p.evaluate(() => {
        const box = document.querySelector("[data-dates]"), x = box.scrollLeft, w = box.clientWidth;
        const seen = [...box.querySelectorAll(".date-chip")].filter((c) => c.offsetLeft >= x - 2 && c.offsetLeft + c.offsetWidth <= x + w + 2).map((c) => c.querySelector("input").value);
        return { seen, range: document.querySelector("[data-date-range]").textContent, prev: document.querySelector('[data-date-step="-1"]').disabled, next: document.querySelector('[data-date-step="1"]').disabled };
      });
      const a = await view();
      assert(a.seen.length >= 3 && a.prev && !a.next && /–/.test(a.range), `${width}px: at the start, Earlier is off and a range shows: ` + JSON.stringify(a));
      await p.focus('[data-date-step="1"]');
      await p.keyboard.press("Enter");
      await p.waitForTimeout(700);
      const b = await view();
      assert(b.seen[0] > a.seen[a.seen.length - 1] && !b.prev && b.range !== a.range, `${width}px: Later shows the next dates and updates the range: ` + JSON.stringify(b));
      await p.click('[data-date-step="-1"]');
      await p.waitForTimeout(700);
      const c = await view();
      assert(c.seen[c.seen.length - 1] < b.seen[0], `${width}px: Earlier goes back: ` + JSON.stringify(c));
      await p.context().close();
    }
  });

  test("action words match the stage", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844 });
    await p.goto(url + "/");
    assert((await p.textContent("[data-p-go]")).trim() === "Choose a preferred day", "price box: " + await p.textContent("[data-p-go]"));
    await p.click("[data-p-go]");
    await p.waitForSelector("#booking-form");
    assert((await p.textContent("h1")).trim() === "Request a clean", "booking title");
    const next = async () => (await p.textContent("[data-next]")).trim();
    assert(await next() === "Choose a preferred day", "step 1 continue: " + await next());
    await p.fill("#f-postal", "M2N 5W9");
    await p.click("[data-next]");
    assert(await next() === "Add your details", "step 2 continue: " + await next());
    await p.click("label.date-chip >> nth=1");
    await p.click('label.slot[data-slot="any"]');
    await p.click("[data-next]");
    assert((await p.textContent("[data-submit]")).trim() === "Send cleaning request", "final send: " + await p.textContent("[data-submit]"));
    assert(await p.$eval("[data-prev]", (b) => b.textContent.trim()) === "Back", "Back keeps its name for screen readers on phones");
  });

  test("pricing: jump links, and the comparison folds", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    await p.goto(url + "/pricing/");
    const jumps = await p.$$eval(".jump a", (as) => as.map((a) => [a.textContent.trim(), a.getAttribute("href"), !!document.querySelector(a.getAttribute("href"))]));
    assert(JSON.stringify(jumps.map((j) => j[0])) === '["Estimate","Prices","Plans","Extras","Compare"]', "jump links: " + JSON.stringify(jumps));
    assert(jumps.every((j) => j[2]), "every jump link lands somewhere: " + JSON.stringify(jumps));
    assert(!(await p.$eval("[data-compare]", (d) => d.open)), "the comparison starts folded");
    await p.click('.jump a[href="#compare"]');
    assert(await p.$eval("[data-compare]", (d) => d.open), "Compare opens it");
    await p.goto(url + "/pricing/#compare");
    assert(await p.$eval("[data-compare]", (d) => d.open), "a link to #compare opens it");
  });

  test("service pages lead with what every visit covers", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 1440, height: 900 });
    for (const key of Object.keys(C.services)) {
      const s = C.services[key], col = s.checklistColumn;
      await p.goto(url + "/services/" + s.slug + "/");
      const rooms = await p.$$eval("#included .incl-room", (rs) => rs.map((r) => ({
        first: r.children[1] && r.children[1].className,
        yes: r.querySelectorAll(".incl-yes li").length,
        extras: [...r.querySelectorAll(".incl-more li.is-add")].map((li) => [li.querySelector("span").textContent, (li.querySelector("b") || {}).textContent || ""])
      })));
      assert(rooms.every((r) => r.first === "incl-yes" && r.yes > 0), `${s.slug}: each room starts with what's covered: ` + JSON.stringify(rooms));
      for (const [task, price] of rooms.flatMap((r) => r.extras)) {
        const a = C.addons.find((x) => x.task === task);
        assert(!a || price === "+$" + a.price, `${s.slug}: ${task} should show +$${a && a.price}, got ${price}`);
      }
      const main = (await p.textContent("#included .scope-main")).trim();
      const n = C.checklist.filter((r) => !s.rooms || s.rooms.includes(r.room)).flatMap((r) => r.tasks).filter((t) => t[col] === "yes").length;
      assert(main === `${n} tasks in every visit`, `${s.slug}: lead line: ${main}`);
    }
  });

  test("type: card titles 20-22px, supporting text 14px or more, badges about 13.5px", async ({ browser, url }) => {
    const bad = [];
    for (const width of [390, 1440]) {
      const p = await newPage(browser, { width, height: 900 });
      const size = async (sel) => p.$$eval(sel, (es) => es.filter((e) => e.getClientRects().length).map((e) => parseFloat(getComputedStyle(e).fontSize)));
      const check = async (path, sel, lo, hi) => {
        await p.goto(url + path);
        const got = await size(sel);
        if (!got.length) bad.push(`${path}@${width} ${sel}: not found`);
        got.filter((f) => f < lo - 0.1 || f > hi + 0.1).forEach((f) => bad.push(`${path}@${width} ${sel}: ${f}px`));
      };
      await check("/", ".svc-feature-card h3", 20, 22);
      await check("/services/regular-home-cleaning/", ".svc-card h3", 20, 22);
      await check("/services/regular-home-cleaning/", ".incl-room h3", 20, 22);
      await check("/pricing/", ".price-card.is-active h3", 20, 22);
      await check("/", ".plan-price span", 14, 16);
      await check("/", ".pricer-meta", 14, 16);
      await check("/pricing/", ".extras-list small", 14, 16);
      await check("/book/", ".extra-limit", 14, 16);
      await check("/book/", ".field-hint", 14, 16);
      await check("/pricing/", ".compare .add-tag", 13, 14);
      await check("/", ".plan-flag", 13, 14);
      await check("/pricing/", ".price-table td", 17, 17);
      await check("/book/", ".choice-from b", 17, 17);
      await p.context().close();
    }
    assert(!bad.length, bad.join("; "));
  });

  test("folded and new parts keep their contrast in both themes", async ({ browser, url }) => {
    const bad = [];
    for (const theme of ["light", "dark"]) {
      const p = await newPage(browser, { width: 1440, height: 900, theme });
      const scan = async (where, scope) => {
        await p.evaluate(() => document.getAnimations().forEach((a) => a.finish()));
        for (const t of await contrastProblems(p, scope)) { const r = contrast(t.fg, t.bg); if (!(r >= t.min)) bad.push(`${theme} ${where} ${t.tag} "${t.text}" ${r.toFixed(2)}:1`); }
      };
      await p.goto(url + "/book/?s=move&h=condo&bd=2&ba=1&f=biweekly");
      await p.$$eval("details[data-section]", (ds) => ds.forEach((d) => { d.open = true; }));
      await p.click('label.check:has(input[value="halfbath"])');
      await scan("book step 1", "#booking-form");
      await p.goto(url + "/book/?s=regular&h=condo&bd=2&ba=1&f=weekly");
      await scan("book plan note", "#booking-form");
      await p.fill("#f-postal", "M2N 5W9");
      await p.click("[data-next]");
      await scan("book step 2", "#booking-form");
      await p.click("label.date-chip >> nth=1");
      await p.click('label.slot[data-slot="morning"]');
      await p.click("[data-next]");
      await p.$$eval("details[data-section]", (ds) => ds.forEach((d) => { d.open = true; }));
      await scan("book step 3", "#booking-form");
      await p.goto(url + "/services/regular-home-cleaning/");
      await scan("service scope", "#included");
      await p.goto(url + "/pricing/#compare");
      await scan("pricing", "main");
      await p.context().close();
    }
    assert(!bad.length, bad.length + " low-contrast item(s): " + [...new Set(bad)].slice(0, 8).join("; "));
  });

  // The review's bar for 90+: a complete booking on a phone at three common widths, every control reachable above the
  // sticky bars, no sideways scroll, an honest failure, and success only on an explicit yes.
  test("a full phone booking works at 360, 390 and 430px", async ({ browser, url }) => {
    for (const width of [360, 390, 430]) {
      const p = await newPage(browser, { width, height: 780, isMobile: true });
      const problems = [];
      const tap = async (sel, label = sel) => {
        await p.locator(sel).first().scrollIntoViewIfNeeded();
        if (await covered(p, sel)) problems.push(`${label} is under a sticky bar`);
        await p.locator(sel).first().click();
      };
      const flat = async (where) => { const o = await sideways(p); if (o > 0) problems.push(`${where}: scrolls sideways by ${o}px`); };
      await p.goto(url + "/");
      await flat("home");
      await tap("[data-p-beds] [data-inc]", "price box bedrooms");
      await tap("[data-p-go]", "Choose a preferred day");
      await p.waitForSelector("#booking-form");
      await flat("step 1");
      await p.fill("#f-postal", "M1B 2K3");
      await tap('details[data-section="extras"] > summary', "Extras");
      await tap('label.extra[data-addon="fridge"]', "an extra");
      await flat("step 1 open");
      await tap("[data-next]", "Choose a preferred day (step 1)");
      await tap('[data-date-step="1"]', "Later dates");
      await p.waitForTimeout(600);
      await tap("label.date-chip:not(.is-disabled) >> nth=4", "a date");
      await tap('label.slot[data-slot="midday"]', "a window");
      await flat("step 2");
      await tap("[data-next]", "Add your details");
      await p.fill("#f-name", "Priya Sample");
      await p.fill("#f-phone", "647 555 0123");
      await p.fill("#f-address", "1 Example St, Unit 1");
      await tap('details[data-section="visit"] > summary', "Visit preferences");
      await tap('label:has(input[name="products"][value="Fragrance-free"])', "a product choice");
      await flat("step 3");
      // A failed send says so and offers the request by email; it never shows the done screen.
      mockDelivery(p, "neterr");
      await tap("[data-submit]", "Send cleaning request");
      await p.waitForSelector("[data-form-error]:not([hidden])");
      const err = await p.$eval("[data-form-error]", (e) => ({ text: e.textContent, mail: !!e.querySelector('a[href^="mailto:"]') }));
      if (!/couldn't confirm/.test(err.text) || !err.mail) problems.push("the failure message: " + JSON.stringify(err));
      if (await p.isVisible("[data-done]")) problems.push("a failed send showed the done screen");
      mockDelivery(p, "ok");
      await tap("[data-submit]", "Send cleaning request (retry)");
      await p.waitForSelector("[data-done]:not([hidden])");
      const done = (await p.textContent("[data-done]")).replace(/\s+/g, " ");
      if (!/Request received · not confirmed yet/.test(done) || !/Fragrance-free|Inside fridge/i.test(JSON.stringify(p.posts.at(-1)))) problems.push("done screen or request content: " + done.slice(0, 80));
      if (new Set(p.posts.map((x) => x && x.Reference)).size !== 1) problems.push("the retry changed the reference");
      await flat("done");
      for (const e of p.errors) problems.push("page error: " + e);
      assert(!problems.length, `${width}px: ` + problems.join("; "));
      await p.context().close();
    }
  });
}
