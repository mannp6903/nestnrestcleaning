// Opening soon (launch.open: false in js/config.js): the site says Mann is still getting ready, and nothing on it can send
// him a request. Every other check runs on the open site (tools/qa/run.mjs); these build the "opening soon" version on
// purpose, whatever js/config.js says today, so both states stay tested.
import fs from "node:fs";
import path from "node:path";
import { test, assert, newPage, loadConfig, buildWith, buildError, contrast, built } from "./lib.mjs";

const SOON = "window.NR_CONFIG.launch.open = false;";
// Every way a page can send something to Mann: booking, quotes, "Text me this price", gift cards, changes, reviews.
const SENDS = /id="booking-form"|data-quote-form|data-textme[ >]|data-gift-form|data-change-form|data-review-form|data-p-go/;
const pages = (dir) => fs.readFileSync(path.join(dir, "sitemap.xml"), "utf8").match(/<loc>[^<]*<\/loc>/g)
  .map((l) => l.replace(/<\/?loc>/g, "").replace(/^https?:\/\/[^/]+/, "") || "/").concat(["/book/", "/help/", "/review/"]);
const html = (dir, pg) => fs.readFileSync(path.join(dir, pg.replace(/^\//, ""), "index.html"), "utf8");

export default async function () {
  test("opening soon: the home hero says so above the slogan, readable, on phones and computers", async ({ browser }) => {
    const b = await buildWith(SOON);
    const L = loadConfig().launch;
    try {
      for (const [width, height, isMobile] of [[390, 844, true], [1440, 900, false]]) {
        const p = await newPage(browser, { width, height, isMobile, reducedMotion: "reduce" });
        const errors = [];
        p.on("pageerror", (e) => errors.push(e.message));
        await p.goto(b.url + "/");
        const s = await p.$eval(".hero-soon", (el) => {
          const r = el.getBoundingClientRect(), t = document.querySelector(".hero-title").getBoundingClientRect();
          const cs = getComputedStyle(el);
          return { text: el.textContent, top: r.top, bottom: r.bottom, right: r.right, title: t.top, color: cs.color, bg: cs.backgroundColor, w: document.documentElement.scrollWidth };
        });
        assert(s.text.includes(L.badge) && s.text.includes(L.notice), `${width}px: the notice says what js/config.js says: ${s.text}`);
        assert(s.bottom <= s.title && s.top < height && s.bottom < height, `${width}px: the notice is on the first screen, above the slogan`);
        assert(s.right <= width && s.w <= width, `${width}px: nothing runs off the side`);
        // Its panel is translucent: measured over white, the brightest thing the photo could put behind it.
        const [r, g, bl, a = 1] = s.bg.match(/[\d.]+/g).map(Number);
        const overWhite = `rgb(${[r, g, bl].map((v) => Math.round(v * a + 255 * (1 - a))).join(", ")})`;
        const ratio = contrast(s.color, overWhite);
        assert(ratio >= 4.5, `${width}px: the notice reads at ${ratio.toFixed(2)}:1`);
        assert((await p.textContent("[data-announce]")).includes(L.badge), `${width}px: the top bar says it too`);
        assert(!(await p.textContent(".hero-facts")).includes("Open daily"), `${width}px: no "Open daily" before opening`);
        assert(await p.getAttribute(".hero-cta .btn-primary", "href") === "pricing/", `${width}px: the hero's button shows the prices`);
        // The price box still works: it's how people see what to expect.
        const before = await p.textContent("[data-p-amount]");
        await p.click("[data-pricer] [data-p-beds] [data-inc]");
        assert(await p.textContent("[data-p-amount]") !== before, `${width}px: the price box still prices`);
        assert((await p.textContent("[data-p-soon]")).includes("Booking opens soon"), `${width}px: and says booking opens soon`);
        assert(!errors.length, `${width}px: no script errors: ${errors.join("; ")}`);
        await p.context().close();
      }
    } finally { await b.close(); }
  });

  test("opening soon: no page can send a request, and every booking button says so", async ({ browser }) => {
    const b = await buildWith(SOON);
    try {
      const L = loadConfig().launch;
      for (const pg of pages(b.dir)) {
        const h = html(b.dir, pg);
        assert(!SENDS.test(h), `${pg}: has something that sends a request: ${(h.match(SENDS) || [])[0]}`);
        assert(!h.includes('"ReserveAction"'), `${pg}: tells Google it takes bookings`);
        for (const m of h.matchAll(/<a class="btn[^"]*(?:header-book|ab-book|menu-book)[^"]*"[^>]*>([\s\S]*?)<\/a>/g)) {
          assert(m[1].includes(L.badge) && !/Request|Book a clean/.test(m[1]), `${pg}: a booking button says: ${m[1].replace(/<[^>]+>/g, " ")}`);
        }
      }
      const home = html(b.dir, "/");
      assert(!/data-gift-banner/.test(home), "no gift card offer before opening");
      // The booking page explains instead of taking a booking, and every other page's script still runs.
      const p = await newPage(browser, { width: 390, height: 844, isMobile: true });
      const errors = [];
      p.on("pageerror", (e) => errors.push(e.message));
      await p.goto(b.url + "/book/");
      assert((await p.textContent("h1")).includes("Not taking bookings yet"), "the booking page says it plainly");
      assert((await p.textContent(".book-soon")).includes(L.notice), "with the notice");
      assert(await p.getAttribute(".book-soon .btn-primary", "href") === "../pricing/", "and points to the prices");
      for (const pg of ["/services/residence-care/", "/services/airbnb-cleaning/", "/gift/", "/help/", "/review/", "/pricing/", "/areas/scarborough/"]) {
        await p.goto(b.url + pg);
        assert((await p.$$("[data-soon]")).length || pg === "/pricing/" || pg === "/areas/scarborough/", `${pg}: says opening soon where its form was`);
      }
      assert(!errors.length, "no script errors: " + errors.join("; "));
      await p.context().close();
    } finally { await b.close(); }
  });

  test("open for bookings (the checks' site): no trace of opening soon", async () => {
    for (const pg of pages(built())) {
      const h = html(built(), pg);
      assert(!/data-soon|class="soon-badge"|Opening soon/.test(h), `${pg}: still says opening soon`);
    }
    assert(html(built(), "/book/").includes('id="booking-form"'), "the booking form is back");
    assert(/header-book[^>]*>[\s\S]*?Request a clean/.test(html(built(), "/")), "the header says Request a clean");
  });

  test("opening soon: the build asks for a notice, and keeps the chat assistant off", async () => {
    assert(buildError(SOON + ' window.NR_CONFIG.launch.notice = " ";').includes("launch.notice"), "an empty notice is refused");
    assert(buildError(SOON + ' window.NR_CONFIG.assistant.endpoint = "https://assist.example.test/";').includes("stays off while launch.open is false"), "the assistant can't be on before opening");
  });
}
