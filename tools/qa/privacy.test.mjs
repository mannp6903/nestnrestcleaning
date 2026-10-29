// Analytics events carry categories and amounts only, never what a customer typed.
import { test, assert, newPage } from "./lib.mjs";

export default async function () {
  test("analytics never receives personal data", async ({ browser, url }) => {
    const p = await newPage(browser);
    await p.goto(url + "/book/?s=regular&h=condo&bd=1&ba=1");
    await p.fill("#f-postal", "M1B 2K3");
    await p.click("[data-next]");
    await p.click("[data-next]"); // no day chosen yet: a validation_failed event
    await p.click("[data-flex]");
    await p.click('label.slot[data-slot="any"]');
    await p.click("[data-next]");
    await p.fill("#f-name", "Zed Secretname");
    await p.fill("#f-phone", "416 555 0199");
    await p.fill("#f-email", "zed@example.com");
    await p.fill("#f-address", "99 Hidden Lane");
    await p.fill("#f-notes", "gate code 4321");
    await p.waitForTimeout(1700); // let quote_viewed fire
    await p.click("[data-submit]");
    await p.waitForSelector("[data-done]:not([hidden])");
    const blob = await p.evaluate(() => JSON.stringify((window.dataLayer || []).map((a) => Array.from(a))));
    const leaks = ["Secretname", "555", "zed@", "Hidden", "4321", "M1B", "2K3"].filter((x) => blob.includes(x));
    assert(!leaks.length, "personal data reached analytics: " + leaks.join(", "));
    for (const ev of ["booking_started", "booking_step_completed", "validation_failed", "generate_lead"]) {
      assert(blob.includes(`"${ev}"`), "missing analytics event " + ev);
    }
  });
}
