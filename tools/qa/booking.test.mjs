// The booking form's behaviour: one scope rule, honest request status, private drafts, dates, screening, focus.
import { test, assert, newPage, mockDelivery, loadConfig, openSection, editHome } from "./lib.mjs";

const total = async (p) => (await p.textContent("[data-total]")).trim();
const extra = (id) => `label.extra[data-addon="${id}"]`;
export async function fillDetails(p, name = "Priya Sample") {
  await p.fill("#f-name", name);
  await p.fill("#f-phone", "647 555 0123");
  await p.fill("#f-address", "1 Example St, Unit 1");
}
// From the price-box link to the details step, with a preferred day and window chosen.
export async function toDetails(p, url, query = "?s=regular&h=condo&bd=2&ba=1") {
  await p.goto(url + "/book/" + query);
  await p.fill("#f-postal", "M2N 5W9");
  await p.click("[data-next]");
  await p.click("label.date-chip >> nth=1");
  await p.click('label.slot[data-slot="evening"]');
  await p.click('label.choice:has(input[value="biweekly"])');
  await p.click("[data-next]");
}

export default async function () {
  test("move-out never charges for included extras", async ({ browser, url }) => {
    const p = await newPage(browser);
    await p.goto(url + "/book/?s=deep&h=house&bd=3&ba=2");
    await p.fill("#f-postal", "M1P 1A1");
    await openSection(p, "extras");
    await p.click(extra("oven"));
    await p.click(extra("pets"));
    assert(await total(p) === "$408", "deep 3/2 house + oven + pets should be $408, got " + await total(p));
    await p.click(extra("laundry"));
    assert(await total(p) === "$428", "adding laundry should give $428, got " + await total(p));
    await editHome(p);
    await p.check('input[name="service"][value="move"]', { force: true });
    assert(await total(p) === "$392", "move-out should be $392, got " + await total(p));
    const walls = await p.$eval(extra("walls"), (el) => [el.className, el.querySelector("input").disabled, el.querySelector("input").checked, el.querySelector("[data-addon-price]").textContent]);
    assert(walls[0].includes("is-included") && walls[1] && walls[2] && walls[3] === "Included", "walls should be included for move-out: " + walls.join(" | "));
    const laundry = await p.$eval(extra("laundry"), (el) => [el.className, el.querySelector("[data-addon-price]").textContent]);
    assert(laundry[0].includes("is-none") && laundry[1] === "Not offered", "laundry should be not offered for move-out: " + laundry.join(" | "));
    await p.click(extra("walls"), { force: true });
    assert(await total(p) === "$392", "clicking an included extra must not change the total");
    assert((await p.textContent("[data-scope-note]")).includes("Laundry, wash and fold isn't part of"), "the removal should be announced");
    await p.check('input[name="service"][value="deep"]', { force: true });
    assert(!(await p.$eval(extra("laundry") + " input", (i) => i.checked)), "laundry must not silently come back");
  });

  test("stale draft is normalized", async ({ browser, url }) => {
    const p = await newPage(browser);
    await p.goto(url + "/");
    await p.evaluate(() => localStorage.setItem("nr-quote-v1", JSON.stringify({ state: { service: "move", homeType: "house", beds: 3, baths: 2, addons: ["walls", "laundry", "pets"], checks: [], freq: "weekly" }, at: Date.now() })));
    await p.goto(url + "/book/");
    await p.fill("#f-postal", "M1P 1A1");
    assert(await total(p) === "$392", "a stale move-out draft should total $392, got " + await total(p));
    assert((await p.textContent("[data-scope-note]")).includes("Wall spot cleaning is included"), "the stale extra should be explained");
  });

  test("old personal draft is migrated and deleted", async ({ browser, url }) => {
    const p = await newPage(browser);
    await p.goto(url + "/");
    await p.evaluate(() => { localStorage.removeItem("nr-quote-v1"); localStorage.setItem("nr-booking-v2", JSON.stringify({ state: { service: "regular", homeType: "condo", beds: 2, baths: 1, addons: [] }, fields: { "f-name": "Test Person", "f-phone": "6475550123" }, at: Date.now() })); });
    await p.goto(url + "/book/");
    const keys = await p.evaluate(() => Object.keys(localStorage).filter((k) => k !== "nr-theme"));
    assert(JSON.stringify(keys) === '["nr-quote-v1"]', "only the home-choices draft should remain, got " + JSON.stringify(keys));
    assert(await p.inputValue("#f-name") === "", "the old draft's name must not be restored");
  });

  let refs = [];
  test("request is only 'sent' on explicit success", async ({ browser, url }) => {
    const p = await newPage(browser);
    await toDetails(p, url);
    await fillDetails(p);
    for (const mode of ["empty200", "badjson", "falsy", "neterr"]) {
      mockDelivery(p, mode);
      await p.click("[data-submit]");
      await p.waitForSelector("[data-form-error]:not([hidden])");
      await p.waitForTimeout(100);
      assert(await p.isHidden("[data-done]"), `mode ${mode} must not show the done screen`);
    }
    mockDelivery(p, "ok");
    await p.click("[data-submit]");
    await p.waitForSelector("[data-done]:not([hidden])");
    assert((await p.textContent("[data-done-label]")).includes("not confirmed yet"), "done screen should say not confirmed yet");
    refs = p.posts.map((x) => x && x.Reference);
  });

  test("retries keep one reference", async () => {
    assert(refs.length === 5, "expected 5 attempts from the previous test, got " + refs.length);
    const distinct = [...new Set(refs)];
    assert(distinct.length === 1 && /^NR-[A-Z0-9]{4}$/.test(distinct[0]), "all attempts should share one reference: " + distinct.join(", "));
  });

  test("personal details stay in the tab and clear after sending", async ({ browser, url }) => {
    const p = await newPage(browser);
    await toDetails(p, url);
    await fillDetails(p, "Unique Tabname");
    await p.waitForTimeout(500);
    assert(!(await p.evaluate(() => JSON.stringify(localStorage))).includes("Tabname"), "the name must never reach localStorage");
    assert((await p.evaluate(() => JSON.stringify(sessionStorage))).includes("Tabname"), "the name should be kept for this tab");
    await p.click("[data-submit]");
    await p.waitForSelector("[data-done]:not([hidden])");
    assert(await p.evaluate(() => sessionStorage.length) === 0, "tab storage should be empty after sending");
  });

  test("review edit returns to the step with choices kept", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844 });
    await toDetails(p, url);
    await fillDetails(p);
    await openSection(p, "visit");
    await p.fill("#f-notes", "Focus on the kitchen");
    const date = await p.$eval("[data-dates] input:checked", (i) => i.value);
    await p.click('[data-review] button[data-edit-step="2"] >> nth=0');
    assert(await p.isVisible('.step[data-step="2"]'), "Edit should open step 2");
    assert(await p.$eval('input[name="freq"]:checked', (i) => i.value) === "biweekly", "plan should be kept");
    assert(await p.$eval("[data-dates] input:checked", (i) => i.value) === date, "day should be kept");
    await p.click("[data-next]");
    assert(await p.inputValue("#f-name") === "Priya Sample", "name should be kept");
  });

  test("Toronto dates on a Vancouver device", async ({ browser, url }) => {
    const C = loadConfig();
    const p = await newPage(browser, { timezoneId: "America/Vancouver" });
    await p.goto(url + "/book/?s=regular");
    await p.fill("#f-postal", "M2N 5W9");
    await p.click("[data-next]");
    const first = await p.$eval("[data-dates] input", (i) => i.value);
    const t = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()).split("-").map(Number);
    let d = new Date(Date.UTC(t[0], t[1] - 1, t[2] + (C.booking.leadDays ?? 1)));
    const iso = (x) => x.toISOString().slice(0, 10);
    while (!C.openDays.includes(d.getUTCDay()) || (C.booking.blockedDates || []).includes(iso(d))) d = new Date(d.getTime() + 86400000);
    assert(first === iso(d), `first requestable day should be ${iso(d)} (Toronto), got ${first}`);
  });

  test("long cleans can't pick late windows", async ({ browser, url }) => {
    const p = await newPage(browser);
    await p.goto(url + "/book/?s=deep&h=house&bd=3&ba=2");
    await p.fill("#f-postal", "M1P 1A1");
    await openSection(p, "extras");
    await p.click(extra("oven"));
    await p.click(extra("pets"));
    await p.click("[data-next]");
    const state = await p.$$eval("label.slot", (ls) => Object.fromEntries(ls.map((l) => [l.getAttribute("data-slot"), l.querySelector("input").disabled])));
    assert(state.afternoon && state.evening, "afternoon and evening must be off for a 7.5-hour clean: " + JSON.stringify(state));
    assert(!state.morning && !state.midday && !state.any, "morning, midday and any time must stay on: " + JSON.stringify(state));
  });

  test("large homes go to a quote with details carried", async ({ browser, url }) => {
    const p = await newPage(browser);
    await p.goto(url + "/book/?s=deep&h=house&bd=3&ba=2");
    await p.fill("#f-postal", "M1P 1A1");
    await openSection(p, "checks");
    await p.click('label.check:has(input[value="large"])');
    assert(await p.isVisible("[data-quote-route]"), "the quote route should appear");
    await p.click("[data-next]");
    assert(await p.isVisible('.step[data-step="1"]'), "Continue must be blocked for a large home");
    await p.click("[data-quote-link]");
    await p.waitForLoadState();
    assert(new URL(p.url()).pathname === "/services/residence-care/", "should land on Residence Care, got " + p.url());
    assert(new URL(p.url()).search === "?from=booking", "only from=booking in the address, got " + p.url());
    assert((await p.inputValue("#q-notes")).startsWith("From the booking form: Deep Cleaning"), "home details should be carried into the notes");
  });

  test("focused controls are never under the sticky bars", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 700 });
    await p.goto(url + "/book/?s=move&h=condo&bd=2&ba=1");
    // A smooth page scroll keeps moving after focus lands, past the point where the guard in js/site.js checks,
    // so a control can end up under the Continue bar (about 1 Tab walk in 4 did).
    assert(await p.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === "auto", "the booking page must not smooth-scroll focus changes");
    const hidden = [];
    const walk = async (label, n) => {
      for (let i = 0; i < n; i++) {
        await p.keyboard.press("Tab");
        await p.waitForTimeout(40);
        const r = await p.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body || el.closest(".step-nav, .summary")) return null;
          const target = el.matches("input[type=radio], input[type=checkbox]") && el.closest("label") ? el.closest("label") : el;
          const box = target.getBoundingClientRect();
          const covered = [".step-nav", ".summary"].map((s) => document.querySelector(s)).filter((x) => x && !x.hidden && getComputedStyle(x).position === "sticky")
            .map((x) => x.getBoundingClientRect()).some((c) => c.top < box.bottom - 2 && c.bottom > box.top + 2);
          return covered ? (el.id || el.name || el.textContent.trim().slice(0, 30)) : null;
        });
        if (r) hidden.push(label + ": " + r);
      }
    };
    await p.fill("#f-postal", "M2N 5W9");
    await p.focus("#f-postal");
    await walk("step 1", 40);
    await p.click("[data-next]");
    await walk("step 2", 35);
    await p.click("label.date-chip >> nth=1");
    await p.click('label.slot[data-slot="midday"]');
    await p.click("[data-next]");
    await walk("step 3", 45);
    assert(!hidden.length, "focused controls under a sticky bar: " + hidden.join("; "));
  });

  // The value shown for one row of Check your clean.
  const reviewValue = (p, label) => p.$$eval("[data-review] dl > div", (ds, label) => {
    const d = ds.find((x) => x.querySelector("dt").textContent.trim() === label);
    return d ? d.querySelector("dd").textContent : null;
  }, label);

  test("final check shows pets and notes", async ({ browser, url }) => {
    const p = await newPage(browser);
    await toDetails(p, url);
    await fillDetails(p);
    await openSection(p, "visit");
    await p.click('label:has(input[name="pets"][value="Dog"])');
    await p.fill("#f-notes", "<b>Ring twice</b>");
    await p.press("#f-notes", "Tab");
    assert(await reviewValue(p, "Visit") === "I'll be home · Dog · Our products", "visit row: " + await reviewValue(p, "Visit"));
    assert(await reviewValue(p, "Notes") === "<b>Ring twice</b>", "notes row: " + await reviewValue(p, "Notes"));
    assert(await p.$("[data-review] b") === null, "notes must show as text, not HTML");
  });

  test("long notes are shortened at a word", async ({ browser, url }) => {
    const p = await newPage(browser);
    await toDetails(p, url);
    await fillDetails(p);
    const notes = Array(60).fill("kitchen").join(" ");
    await openSection(p, "visit");
    await p.fill("#f-notes", notes);
    await p.press("#f-notes", "Tab");
    const v = await reviewValue(p, "Notes");
    assert(v.endsWith("…") && v.length <= 201, "shortened notes: " + v.length + " " + v.slice(-20));
    const kept = v.slice(0, -1);
    assert(notes.startsWith(kept) && notes[kept.length] === " ", "cut must fall between words: …" + kept.slice(-12));
  });

  test("visit and notes edit buttons focus their controls", async ({ browser, url }) => {
    const p = await newPage(browser);
    await toDetails(p, url);
    await fillDetails(p);
    await openSection(p, "visit");
    await p.click('label:has(input[name="pets"][value="Dog"])');
    await p.fill("#f-notes", "Ring twice");
    await p.press("#f-notes", "Tab");
    // Folded again, Edit still lands on the control: the section opens first.
    await p.click('details[data-section="visit"] > summary');
    assert(await p.isHidden("#f-notes"), "visit preferences should fold away");
    await p.click('[data-review] button[data-edit-focus="#f-access"]');
    assert(await p.evaluate(() => document.activeElement.id) === "f-access" && await p.isVisible('input[name="pets"][value="Dog"]:checked + span'), "Visit edit opens the preferences on Getting in, with Dog still chosen");
    await p.click('[data-review] button[data-edit-focus="#f-notes"]');
    assert(await p.evaluate(() => document.activeElement.id) === "f-notes", "notes edit focus");
  });
}
