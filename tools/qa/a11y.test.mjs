// Bigger text, keyboard-only booking, what screen readers are told, an axe-core scan, and stress cases.
// Real phones, phone keyboards and VoiceOver/TalkBack can't be run here: docs/phone-checklist.md covers those.
import path from "node:path";
import { test, assert, newPage, ROOT, openSection } from "./lib.mjs";

const PAGES = ["/", "/pricing/", "/services/deep-cleaning/", "/areas/north-york/willowdale/", "/help/", "/services/residence-care/", "/gift/", "/services/airbnb-cleaning/"];
const AXE = path.join(ROOT, "tools/qa/vendor/axe.min.js");

// Visits the three booking steps, calling check(label) at each.
async function eachBookingStep(p, url, check) {
  await p.goto(url + "/book/?s=regular&h=condo&bd=2&ba=1");
  await check("book step 1");
  await p.fill("#f-postal", "M2N 5W9");
  await p.click("[data-next]");
  await check("book step 2");
  await p.click("label.date-chip >> nth=1");
  await p.click('label.slot[data-slot="morning"]');
  await p.click("[data-next]");
  await check("book step 3");
}

async function settle(p) {
  await p.evaluate(() => document.getAnimations().forEach((a) => a.finish()));
}

// The focused element shows a focus indicator: on itself, on the card drawn next to a hidden radio or checkbox, or on its label.
const FOCUS_SHOWN = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return { ok: true };
  const shows = (x) => { const c = getComputedStyle(x); return (c.outlineStyle !== "none" && parseFloat(c.outlineWidth) > 0) || c.boxShadow !== "none"; };
  const cands = [el];
  for (let s = el.nextElementSibling; s; s = s.nextElementSibling) cands.push(s);
  if (el.closest("label")) cands.push(el.closest("label"));
  if (el.parentElement) cands.push(el.parentElement);
  // Covered means a sticky bar is what's actually drawn at the element's centre (so a skip link drawn over the header is fine).
  const target = el.matches("input[type=radio], input[type=checkbox]") && el.closest("label") ? el.closest("label") : el;
  const b = target.getBoundingClientRect();
  const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
  const bar = hit && !target.contains(hit) && hit.closest(".step-nav, .summary, .site-header, [data-action-bar]");
  const hidden = !!bar && !bar.contains(el);
  return { ok: cands.some(shows) && !hidden, what: (el.id || el.name || el.tagName) + (hidden ? " (under a sticky bar)" : " (no visible focus)") };
};

// Presses Tab until the focused element matches, checking every stop on the way.
async function tabTo(p, selector, problems, max = 90) {
  for (let i = 0; i < max; i++) {
    await p.keyboard.press("Tab");
    await p.waitForTimeout(30);
    const r = await p.evaluate(FOCUS_SHOWN);
    if (!r.ok) problems.push(r.what);
    if (await p.evaluate((s) => !!document.activeElement && document.activeElement.matches(s), selector)) return;
  }
  throw new Error("couldn't reach " + selector + " with Tab");
}

export default async function () {
  test("pages survive 200% text", async ({ browser, url }) => {
    const bad = [];
    for (const width of [390, 1280]) {
      const p = await newPage(browser, { width, height: 900 });
      // The browser's own text-size setting at 200% (32px instead of 16px), the way people enlarge text.
      await (await p.context().newCDPSession(p)).send("Page.setFontSizes", { fontSizes: { standard: 32, fixed: 26 } });
      const check = async (label) => {
        await p.waitForTimeout(150);
        await settle(p);
        const r = await p.evaluate(() => {
          const out = [];
          if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) out.push("sideways scroll " + document.documentElement.scrollWidth);
          for (const b of document.querySelectorAll("main .btn-primary")) {
            const box = b.getBoundingClientRect();
            if (!box.width || getComputedStyle(b).visibility === "hidden" || b.closest("[hidden]")) continue;
            b.scrollIntoView({ block: "center", behavior: "instant" });
            const c = b.getBoundingClientRect();
            if (c.left < -1 || c.right > window.innerWidth + 1) { out.push("button off screen: " + b.textContent.trim().slice(0, 30)); continue; }
            const hit = document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2);
            if (!hit || !(hit === b || b.contains(hit))) out.push("button covered: " + b.textContent.trim().slice(0, 30));
          }
          // Words must stay inside their button or choice box, not spill over the next one.
          for (const el of document.querySelectorAll("main button, main .btn, .seg span, .choice-body, label.slot span, .freq-grid label, .plan, .trust li > span")) {
            if (!el.getBoundingClientRect().width || el.closest("[hidden]") || !el.textContent.trim()) continue; // icon-only buttons draw their icon inside the button either way
            if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX === "visible") out.push("text spills: " + el.textContent.trim().replace(/\s+/g, " ").slice(0, 30));
          }
          return out;
        });
        r.forEach((x) => bad.push(`${label} @${width}: ${x}`));
      };
      for (const pg of PAGES) { await p.goto(url + pg); await check(pg); }
      await eachBookingStep(p, url, check);
      await p.context().close();
    }
    assert(!bad.length, bad.join("; "));
  });

  test("booking works with the keyboard alone", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844 });
    const problems = [];
    await p.goto(url + "/book/?s=regular&h=condo&bd=2&ba=1");
    await tabTo(p, "#f-postal", problems);
    await p.keyboard.type("M2N 5W9");
    await tabTo(p, "[data-next]", problems);
    await p.keyboard.press("Enter");
    await p.waitForSelector('.step[data-step="2"]:not([hidden])');
    await tabTo(p, "[data-dates] input", problems);
    await p.keyboard.press("ArrowRight");
    await tabTo(p, 'input[name="slot"]', problems);
    await p.keyboard.press("Space");
    await tabTo(p, "[data-next]", problems);
    await p.keyboard.press("Enter");
    await p.waitForSelector('.step[data-step="3"]:not([hidden])');
    await tabTo(p, "#f-name", problems); await p.keyboard.type("Kim Keyboard");
    await tabTo(p, "#f-phone", problems); await p.keyboard.type("647 555 0144");
    await tabTo(p, "#f-address", problems); await p.keyboard.type("2 Example Ave");
    await tabTo(p, "[data-submit]", problems);
    await p.keyboard.press("Enter");
    await p.waitForSelector("[data-done]:not([hidden])");
    assert(!problems.length, "focus problems: " + [...new Set(problems)].join(", "));
  });

  test("menu keeps focus in the header and menu, and Escape returns it", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844 });
    await p.goto(url + "/");
    await p.focus(".menu-btn");
    await p.keyboard.press("Enter");
    assert(await p.isVisible("#menu"), "Enter on the menu button should open the menu");
    assert(await p.getAttribute(".menu-btn", "aria-expanded") === "true", "the button should say the menu is open");
    const escaped = [];
    for (let i = 0; i < 25; i++) {
      await p.keyboard.press("Tab");
      // Focus may pass out to the browser's own controls (body) between laps; it must never land on the page behind the menu.
      const where = await p.evaluate(() => { const a = document.activeElement; return a === document.body || a.closest(".site-header, #menu") ? null : a.tagName.toLowerCase() + "." + a.className + " " + a.textContent.trim().slice(0, 24); });
      if (where) escaped.push(where);
    }
    assert(!escaped.length, "focus left the open menu for: " + [...new Set(escaped)].slice(0, 4).join("; "));
    await p.focus("#menu .menu-list a");
    await p.keyboard.press("Escape");
    assert(!(await p.isVisible("#menu")), "Escape should close the menu");
    assert(await p.evaluate(() => document.activeElement.classList.contains("menu-btn")), "Escape should put focus back on the menu button");
    assert(await p.getAttribute(".menu-btn", "aria-expanded") === "false", "the button should say the menu is closed");
    assert(await p.evaluate(() => !document.querySelector("[inert]")), "nothing should stay inert once the menu closes");
    await p.click(".menu-btn");
    await p.setViewportSize({ width: 1440, height: 900 });
    await p.waitForFunction(() => !document.querySelector("[inert]"));
    assert(await p.getAttribute(".menu-btn", "aria-expanded") === "false", "turning a tablet sideways should close the menu");
  });

  test("prices, totals and errors are announced", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 390, height: 844 });
    await p.goto(url + "/");
    assert(await p.getAttribute("[data-pricer] .pricer-result", "aria-live") === "polite", "the price box result is a polite live region");
    await p.goto(url + "/book/?s=regular&h=condo&bd=2&ba=1");
    assert(await p.$eval("[data-total]", (t) => { const r = t.closest("[aria-live]"); return r && r.getAttribute("aria-live"); }) === "polite", "the booking total is in a polite live region");
    assert(await p.getAttribute("[data-form-error]", "role") === "alert", "the send error is an alert");
    await p.click("[data-next]");
    const err = await p.evaluate(() => {
      const el = document.activeElement, id = el.getAttribute("aria-describedby"), msg = id && document.getElementById(id);
      return { id: el.id, invalid: el.getAttribute("aria-invalid"), text: msg && !msg.hidden ? msg.textContent.trim() : "" };
    });
    assert(err.id === "f-postal" && err.invalid === "true" && err.text.length > 5, "empty postal: " + JSON.stringify(err));
    await p.fill("#f-postal", "M2N 5W9");
    await p.click("[data-next]");
    await p.click("label.date-chip >> nth=1");
    await p.click('label.slot[data-slot="morning"]');
    await p.click("[data-next]");
    await openSection(p, "visit");
    await p.fill("#f-notes", "Ring twice");
    const problems = [];
    await tabTo(p, '[data-review] button[data-edit-focus="#f-notes"]', problems, 120);
    assert(!problems.length, "focus problems on the way to the review: " + problems.join(", "));
  });

  test("no serious accessibility problems", async ({ browser, url }) => {
    const found = [];
    for (const theme of ["light", "dark"]) {
      for (const width of [390, 1280]) {
        const p = await newPage(browser, { width, height: 900, theme });
        const scan = async (label) => {
          await settle(p);
          await p.addScriptTag({ path: AXE });
          const v = await p.evaluate(async () => (await window.axe.run(document, { resultTypes: ["violations"] })).violations
            .filter((x) => x.impact === "serious" || x.impact === "critical").map((x) => x.id + " " + JSON.stringify(x.nodes[0].target) + " (" + x.nodes.length + ")"));
          v.forEach((x) => found.push(`${label} ${theme} @${width}: ${x}`));
        };
        for (const pg of PAGES) { await p.goto(url + pg); await scan(pg); }
        await eachBookingStep(p, url, scan);
        await p.context().close();
      }
    }
    assert(!found.length, found.length + " problems: " + found.join("; "));
  });

  test("big homes and long names stay readable at 360px", async ({ browser, url }) => {
    const p = await newPage(browser, { width: 360, height: 780 });
    await p.goto(url + "/book/?s=deep&h=house&bd=5&ba=4");
    await p.fill("#f-postal", "M1P 1A1");
    await openSection(p, "extras");
    for (const ex of await p.$$("label.extra:not(.is-none):not(.is-included)")) await ex.click();
    await p.click("[data-next]");
    await p.click("label.date-chip >> nth=1");
    const slot = await p.$("label.slot:not(.is-off)");
    if (slot) await slot.click(); else await p.click("label.check:has([data-flex])");
    await p.click("[data-next]");
    await p.fill("#f-name", "Alexandria Konstantinopoulou-Vanderbilt Featherstonehaugh");
    await p.fill("#f-phone", "647 555 0155");
    await p.fill("#f-address", "1234 Sheppard Avenue East, Unit 2207, North Tower, Building B");
    await p.press("#f-address", "Tab");
    await settle(p);
    const r = await p.evaluate(() => {
      const out = [];
      if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) out.push("sideways scroll " + document.documentElement.scrollWidth);
      const t = document.querySelector("[data-total]");
      if (t.scrollWidth > t.clientWidth + 1) out.push("total clipped: " + t.textContent);
      document.querySelectorAll("[data-review] dd").forEach((d) => { if (d.scrollWidth > d.clientWidth + 1) out.push("review row clipped: " + d.textContent.slice(0, 30)); });
      return out;
    });
    assert(!r.length, r.join("; "));
  });
}
