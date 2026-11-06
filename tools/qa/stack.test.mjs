// Builds of the site with other settings patched in (node tools/build.mjs --out DIR, with NR_CONFIG_PATCH set), served from a temp folder.
import fs from "node:fs";
import path from "node:path";
import { test, assert, loadConfig, newPage, withConfig, buildWith, buildError, ROOT, built } from "./lib.mjs";
import { toDetails, fillDetails } from "./booking.test.mjs";

// Settings that name the server the tools run on. Several checks need them so the "server" stop doesn't hide the one under test.
const SERVER = 'window.NR_CONFIG.server = { name: "TestHost", location: "Toronto, Canada" };';
// The website's forms posting JSON to the n8n webhook (answered locally by the mock in lib.mjs).
const HOOK = SERVER + 'window.NR_CONFIG.delivery = { provider: "webhook", endpoint: "https://n8n.example.test/webhook/forms" };';
// [patch, the message the build must stop with]
const STOPS = [
  [SERVER + 'window.NR_CONFIG.booking.calLink = "x/y"; window.NR_CONFIG.booking.easyAppointments = { url: "https://book.example.test", services: [{ upToHours: 3, id: 1 }] };', "Fill in only one booking calendar"],
  [SERVER + 'window.NR_CONFIG.booking.easyAppointments = { url: "http://book.example.test", services: [{ upToHours: 3, id: 1 }] };', "booking.easyAppointments.url in js/config.js must start with https://"],
  [SERVER + 'window.NR_CONFIG.booking.easyAppointments = { url: "https://book.example.test", services: [] };', "booking.easyAppointments.services in js/config.js needs one entry per clean length"],
  [SERVER + 'window.NR_CONFIG.booking.easyAppointments = { url: "https://book.example.test", services: [{ upToHours: 5, id: 1 }, { upToHours: 3, id: 2 }] };', "booking.easyAppointments.services in js/config.js needs one entry per clean length"],
  [SERVER + 'window.NR_CONFIG.booking.easyAppointments = { url: "https://book.example.test", services: [{ upToHours: 3, id: "a" }] };', "booking.easyAppointments.services in js/config.js needs one entry per clean length"],
  [SERVER + 'window.NR_CONFIG.delivery = { provider: "webhook", endpoint: "http://n8n.example.test/webhook/forms" };', "delivery.endpoint in js/config.js must start with https://"],
  [SERVER + 'window.NR_CONFIG.chat = { baseUrl: "https://chat.example.test", websiteToken: "" };', "Fill in both chat.baseUrl and chat.websiteToken"],
  [SERVER + 'window.NR_CONFIG.newsletter = { optIn: true };', "newsletter.optIn needs business.mailingAddress"],
  ['window.NR_CONFIG.delivery = { provider: "webhook", endpoint: "https://n8n.example.test/webhook/forms" };', "Fill in server.name and server.location"],
  ['window.NR_CONFIG.delivery = { provider: "n8n", endpoint: "https://n8n.example.test/webhook/forms" };', 'delivery.provider in js/config.js must be "formsubmit", "sheet", "webhook" or "none".']
];

// Easy!Appointments as the live calendar (book.example.test is answered locally by lib.mjs).
const EA_CFG = (services) => SERVER + `window.NR_CONFIG.booking.easyAppointments = { url: "https://book.example.test/index.php?lang=en", provider: "2", services: ${JSON.stringify(services)} };`;
// The hours the booking form estimates for a condo with these bedrooms and bathrooms and no extras (the build's formula; a condo's factor is 1).
const hoursFor = (C, key, bd, ba) => { const s = C.services[key]; return Math.max(1.5, Math.round((s.hours + (bd - 1) * 0.5 + (ba - 1) * 0.5) / 0.5) * 0.5); };
// A booking sent from the details step. mode is how the calendar server answers, set before the send: "ok" or "hang".
async function eaBooking(browser, b, name = "José María O'Neil", mode = "ok") {
  const p = await newPage(browser); p.eaMode = mode;
  await p.goto(b.url + "/book/?s=regular&h=condo&bd=2&ba=1");
  await p.fill("#f-postal", "M2N 5W9"); await p.click("[data-next]"); await fillDetails(p, name); await p.fill("#f-email", "p@example.com");
  await p.click("[data-submit]"); return p;
}

// The offers checkbox is built only with newsletter.optIn, and the build needs a mailing address for it (CASL).
const NEWS_CFG = SERVER + 'window.NR_CONFIG.business.mailingAddress = "PO Box 1, Toronto, ON M1B 0A1"; window.NR_CONFIG.newsletter = { optIn: true };';
const OFFERS_LABEL = "Email me seasonal offers from Nest & Rest. Unsubscribe any time.";
// From the price-box link to the details step, with the name, mobile and address filled in, on a page that may already have sent a booking.
async function newsDetails(p, b) {
  await p.goto(b.url + "/book/?s=regular&h=condo&bd=2&ba=1"); await p.fill("#f-postal", "M2N 5W9"); await p.click("[data-next]");
  await p.click("label.date-chip >> nth=1"); await p.click('label.slot[data-slot="evening"]'); await p.click("[data-next]"); await fillDetails(p);
}
// The value shown for one row of Check your clean, or null when there is no such row.
const reviewRow = (p, label) => p.$$eval("[data-review] dl > div", (ds, label) => {
  const d = ds.find((x) => x.querySelector("dt").textContent.trim() === label);
  return d ? d.querySelector("dd").textContent : null;
}, label);

// Chatwoot chat on chat.example.test (its script is answered locally by lib.mjs).
const CHAT_CFG = SERVER + 'window.NR_CONFIG.chat = { baseUrl: "https://chat.example.test", websiteToken: "tok123" };';

export default async function () {
  test("a patched build carries the patch into its pages and its config", async () => {
    const b = await buildWith('window.NR_CONFIG.business.hours = "Every day, 8am to 8pm";');
    try {
      assert(fs.readFileSync(path.join(b.dir, "index.html"), "utf8").includes("Every day, 8am to 8pm"), "page");
      assert(fs.readFileSync(path.join(b.dir, "js/config.js"), "utf8").includes("8am to 8pm"), "config copy");
      assert(!fs.readFileSync(path.join(b.dir, "index.html"), "utf8").includes("window.NR_CONFIG.preview"), "not a preview");
    } finally { await b.close(); }
  });

  test("buildError is empty for a good patch and carries the message of a bad one", async () => {
    assert(buildError('window.NR_CONFIG.business.hours = "Every day";') === "", "a good patch builds");
    const err = buildError('throw new Error("patch refused");');
    assert(err.includes("patch refused"), "error text: " + err);
  });

  test("each unsafe setting stops the build with its message", async () => {
    for (const [patch, msg] of STOPS) assert(buildError(patch).includes(msg), "expected: " + msg + "\npatch: " + patch);
    assert(buildError(SERVER) === "", "a server alone builds");
  });

  test("n8n gets JSON and its reference is shown", async ({ browser, url }) => {
    const p = await newPage(browser); await withConfig(p, HOOK); p.hookMode = "clash";
    await toDetails(p, url); await fillDetails(p); await p.fill("#f-email", "p@example.com");
    await p.click("[data-submit]"); await p.waitForSelector("[data-done]:not([hidden])");
    const req = p.hookRequests.find((r) => r.method === "POST"), body = p.hookPosts.at(-1);
    assert(req.headers["content-type"] === "application/json", "json");
    assert(body.form === "booking" && /^NR-[A-Z0-9]{4}$/.test(body.reference) && body.email === "p@example.com", "payload");
    assert(!("receipt" in body) && !Object.keys(body.fields).some((k) => k[0] === "_"), "no receipt text, no _ fields");
    assert((await p.textContent("[data-ref]")).trim() === "NR-ZZ99", "returned reference shown");
  });

  test("n8n failures never show received, and retries keep the reference", async ({ browser, url }) => {
    const p = await newPage(browser); await withConfig(p, HOOK);
    await toDetails(p, url); await fillDetails(p);
    for (const mode of ["noref", "notok", "badjson", "http500", "neterr"]) {
      p.hookMode = mode; await p.click("[data-submit]");
      await p.waitForSelector("[data-form-error]:not([hidden])"); await p.waitForTimeout(100);
      assert(await p.isHidden("[data-done]"), mode + " showed done");
    }
    p.hookMode = "ok"; await p.click("[data-submit]"); await p.waitForSelector("[data-done]:not([hidden])");
    const posts = p.hookPosts;
    assert(posts.length === 6 && new Set(posts.map((x) => x.reference)).size === 1 && new Set(posts.map((x) => x.attempt)).size === 1, "one reference and attempt");
  });

  test("double submit sends one n8n request", async ({ browser, url }) => {
    const p = await newPage(browser); await withConfig(p, HOOK);
    await toDetails(p, url); await fillDetails(p);
    await p.evaluate(() => { const f = document.querySelector("#booking-form"); f.requestSubmit(); f.requestSubmit(); });
    await p.waitForSelector("[data-done]:not([hidden])");
    await p.waitForTimeout(200);
    assert(p.hookPosts.length === 1, "posts: " + p.hookPosts.length);
  });

  test("n8n wording on the forms and in the privacy policy", async () => {
    const b = await buildWith(HOOK);
    try {
      const book = fs.readFileSync(path.join(b.dir, "book/index.html"), "utf8"), priv = fs.readFileSync(path.join(b.dir, "privacy/index.html"), "utf8");
      assert(book.includes("Your request goes to our own server (TestHost, Toronto, Canada), where our automation tool n8n saves it and forwards it to our Gmail inbox (Google), which may store data outside Canada."), "booking note");
      assert(fs.readFileSync(path.join(b.dir, "gift/index.html"), "utf8").includes("where our automation tool n8n saves it"), "SENT_VIA");
      assert(priv.includes("<strong>TestHost</strong> hosts our own server in Toronto, Canada") && priv.includes("<strong>n8n</strong>") && !priv.includes("FormSubmit"), "privacy");
    } finally { await b.close(); }
  });

  test("Cal.com wording is unchanged, email included", async ({ browser }) => {
    const txt = loadConfig().emails.bookingCal;
    assert(txt.includes("{calendarNote}") && !txt.includes("Cal.com"), "config uses the slot");
    const b = await buildWith('window.NR_CONFIG.booking.calLink = "nestandrest/home-clean";');
    try {
      const book = fs.readFileSync(path.join(b.dir, "book/index.html"), "utf8");
      assert(book.includes("Your request is sent through FormSubmit to our Google email inbox, and the time you pick is booked on Cal.com, our booking calendar. Both may store data outside Canada."), "Cal.com booking note");
      const q = await newPage(browser); await q.goto(b.url + "/book/?s=regular&h=condo&bd=2&ba=1");
      await q.fill("#f-postal", "M2N 5W9"); await q.click("[data-next]"); await fillDetails(q); await q.fill("#f-email", "p@example.com");
      await q.click("[data-submit]"); await q.waitForSelector("[data-cal-step]:not([hidden])");
      assert(q.posts.at(-1)._autoresponse.includes("pick it on our calendar, and Cal.com emails that confirmation separately, with links to reschedule or cancel. Haven't picked"), "Cal email text");
      assert(q.posts.at(-1)._subject.startsWith("New booking NR-") && q.posts.at(-1)["Preferred day"] === "Picking a time on the calendar" && q.posts.at(-1).Status.startsWith("Details sent;"), "Cal.com is still sent as a booking");
    } finally { await b.close(); }
  });

  test("Easy!Appointments opens on the right band, filled in", async ({ browser }) => {
    const H = hoursFor(loadConfig(), "regular", 2, 1);
    const b = await buildWith(EA_CFG([{ upToHours: H - 1, id: 10 }, { upToHours: H, id: 11 }, { upToHours: H + 3, id: 12 }]));
    try {
      const p = await eaBooking(browser, b); await p.waitForSelector("[data-cal-step]:not([hidden]) iframe");
      const src = new URL(await p.getAttribute("[data-cal-embed] iframe", "src")), q = src.searchParams;
      assert(src.search.startsWith("?lang=en&") && q.get("service") === "11" && q.get("provider") === "2", "joined with &, boundary band");
      assert(q.get("first_name") === "José" && q.get("last_name") === "María O'Neil" && q.get("email") === "p@example.com", "names");
      assert(q.get("address") === "1 Example St, Unit 1" && q.get("zip") === "M2N 5W9" && q.get("phone") === "647 555 0123", "prefill");
      assert(await p.getAttribute("[data-cal-link]", "href") === src.href && (await p.textContent("[data-cal-ref]")).trim() === p.posts.at(-1).Reference, "link and reference");
      assert(await p.isHidden("[data-done]") && (await p.getAttribute("[data-cal-embed] iframe", "title")) === "Booking calendar", "no done screen, titled frame");
      await p.waitForTimeout(300);
      assert(p.eaUrls.length === 1 && p.eaUrls[0] === src.href && await p.isHidden("[data-cal-fail]"), "the frame loaded the calendar address and no fallback shows");
      assert((await p.textContent(".book-head h1")).trim() === "Almost booked", "heading");
      const post = p.posts.at(-1);
      assert(post._subject.startsWith("New booking ") && !post._subject.startsWith("New booking request ") && post["Preferred day"] === "Picking a time on the calendar", "calendar subject and day: " + post._subject);
      assert(post.Status === "Details sent; the customer picks a time on the calendar next" && post._autoresponse.includes("pick it on our calendar"), "calendar status and email");
    } finally { await b.close(); }
  });

  test("an address with a trailing slash and a stray space gets one ?, and a clean link in the email", async ({ browser }) => {
    const b = await buildWith(SERVER + 'window.NR_CONFIG.booking.easyAppointments = { url: "https://book.example.test/ ", services: [{ upToHours: 12, id: 41 }] };');
    try {
      const p = await eaBooking(browser, b, "Cher"); await p.waitForSelector("[data-cal-step]:not([hidden]) iframe");
      const href = await p.getAttribute("[data-cal-embed] iframe", "src"), q = new URL(href).searchParams;
      assert(href.startsWith("https://book.example.test/?service=41&first_name=Cher&") && href.split("?").length === 2, "one ?, no space: " + href);
      assert(!q.has("provider") && !q.has("last_name"), "no empty provider or last name");
      assert(p.posts.at(-1)._autoresponse.includes("Pick one here: https://book.example.test/ There's nothing"), "email link");
    } finally { await b.close(); }
  });

  test("an estimate longer than every band gets the request screen, and is sent as a request", async ({ browser }) => {
    const b = await buildWith(EA_CFG([{ upToHours: 1, id: 31 }]));
    try {
      const p = await eaBooking(browser, b); await p.waitForSelector("[data-done]:not([hidden])"); assert(!(await p.$("[data-cal-embed] iframe")), "no frame");
      const rows = await p.$$eval("[data-done-list] > div", (ds) => ds.map((d) => [d.querySelector("dt").textContent.trim(), d.querySelector("dd").textContent.trim()]));
      assert(rows.find((r) => r[0] === "You asked for")?.[1] === "Mann arranges a time with you", "You asked for: " + JSON.stringify(rows));
      assert(rows.every((r) => r[1]), "an empty row: " + JSON.stringify(rows));
      const post = p.posts.at(-1);
      assert(post._subject.startsWith("New booking request "), "subject: " + post._subject);
      assert(post.Status === "Request: not confirmed until Mann agrees the day, window and price" && post["Preferred day"] === "Mann arranges a time with you" && post["Preferred arrival window"] === "", "fields: " + post.Status + " | " + post["Preferred day"]);
      assert(post._autoresponse.includes("will confirm your day and arrival window") && !post._autoresponse.includes("pick it on our calendar"), "email: " + post._autoresponse);
      assert(post._autoresponse.includes("Mann arranges a time with you; estimate"), "email summary: " + post._autoresponse);
    } finally { await b.close(); }
  });

  test("an estimate longer than every band: the text-us message is a request too", async ({ browser }) => {
    const b = await buildWith(EA_CFG([{ upToHours: 1, id: 31 }]) + 'window.NR_CONFIG.business.phone = "+14165550100"; window.NR_CONFIG.business.phoneDisplay = "416 555 0100";');
    try {
      const p = await eaBooking(browser, b); await p.waitForSelector("[data-done]:not([hidden])");
      const body = decodeURIComponent((await p.getAttribute("[data-sms-booking]", "href")).split("body=")[1]);
      assert(body.startsWith("Booking request NR-") && body.includes("\nWhen: Mann arranges a time with you\n"), "text: " + body);
    } finally { await b.close(); }
  });

  test("a calendar that doesn't load offers the new tab after 10 seconds", async ({ browser }) => {
    const b = await buildWith(EA_CFG([{ upToHours: 12, id: 41 }]));
    try {
      const p = await eaBooking(browser, b, undefined, "hang");
      await p.waitForSelector("[data-cal-fail]:not([hidden])", { timeout: 15000 });
      assert(/book\.example\.test/.test(await p.getAttribute("[data-cal-link]", "href")), "new-tab link");
    } finally { await b.close(); }
  });

  test("Easy!Appointments wording everywhere, and no Cal.com", async () => {
    const b = await buildWith(EA_CFG([{ upToHours: 12, id: 41 }]));
    try {
      const read = (f) => fs.readFileSync(path.join(b.dir, f), "utf8");
      assert(read("book/index.html").includes("which may store data outside Canada, and the time you pick is booked on our own booking calendar (Easy!Appointments, on our server in Toronto, Canada)."), "booking note");
      assert(read("privacy/index.html").includes("<strong>Easy!Appointments</strong>, our booking calendar") && read("policies/index.html").includes("our booking calendar emails you a confirmation with a link to reschedule or cancel"), "privacy and policies");
      assert(read("privacy/index.html").includes("sets two cookies of its own (ea_session, kept for up to a week, and csrf_cookie)"), "calendar cookies");
      for (const f of ["book/index.html", "privacy/index.html", "policies/index.html", "help/index.html", "index.html"]) assert(!read(f).includes("Cal.com"), f + " names Cal.com");
    } finally { await b.close(); }
  });

  test("analytics never sees the calendar address or what was typed", async ({ browser }) => {
    const b = await buildWith(EA_CFG([{ upToHours: 12, id: 41 }]));
    try {
      const p = await eaBooking(browser, b); await p.waitForSelector("[data-cal-step]:not([hidden]) iframe");
      const blob = await p.evaluate(() => JSON.stringify((window.dataLayer || []).map((a) => Array.from(a))));
      assert(blob.includes('"calendar_shown"'), "calendar_shown is sent");
      const leaks = ["book.example.test", "first_name", "José", "O'Neil"].filter((x) => blob.includes(x));
      assert(!leaks.length, "reached analytics: " + leaks.join(", "));
    } finally { await b.close(); }
  });

  test("offers box: unticked, needs an email, and travels with the request", async ({ browser }) => {
    const b = await buildWith(NEWS_CFG);
    try {
      const p = await newPage(browser); await newsDetails(p, b);
      assert(!(await p.isChecked("#f-offers")) && await p.getAttribute("#f-offers", "autocomplete") === "off", "unticked by default, and a browser can't restore a tick");
      assert((await p.textContent('label.check:has(#f-offers) span')).trim() === OFFERS_LABEL, "label wording");
      assert(await reviewRow(p, "Offers emails") === "No", "review says No: " + await reviewRow(p, "Offers emails"));
      await p.check("#f-offers"); assert(await reviewRow(p, "Offers emails") === "Yes, by email", "review says Yes: " + await reviewRow(p, "Offers emails"));
      await p.click("[data-submit]");
      assert((await p.textContent("#err-f-offers")).trim() === "Add your email to get offers, or untick the box." && p.posts.length === 0, "needs email");
      assert(await p.getAttribute("#f-offers", "aria-invalid") === "true" && await p.getAttribute("#f-offers", "aria-describedby") === "err-f-offers", "error is announced");
      assert(await p.$eval("label.check:has(#f-offers)", (l) => l.nextElementSibling && l.nextElementSibling.id) === "err-f-offers", "error sits after the label");
      assert(await p.evaluate(() => document.activeElement.id) === "f-offers", "focus goes to the box");
      await p.uncheck("#f-offers");
      assert(await p.isHidden("#err-f-offers") && await p.getAttribute("#f-offers", "aria-invalid") === null, "unticking clears the error");
      await p.check("#f-offers"); await p.click("[data-submit]"); assert(await p.isVisible("#err-f-offers"), "error again");
      await p.fill("#f-email", "p@example.com"); assert(await p.isHidden("#err-f-offers"), "adding the email clears the error");
      await p.fill("#f-email", ""); await p.click("[data-submit]"); assert(await p.isVisible("#err-f-offers") && p.posts.length === 0, "still needs the email");
      await p.reload(); await p.click("[data-next]"); await p.click("[data-next]");
      assert(await p.isVisible("#f-offers") && await p.isChecked("#f-offers"), "kept in this tab");
      await p.fill("#f-email", "p@example.com"); await p.click("[data-submit]"); await p.waitForSelector("[data-done]:not([hidden])");
      assert(p.posts.at(-1)["Offers emails"] === 'Yes (ticked: "' + OFFERS_LABEL + '")', "consent record: " + p.posts.at(-1)["Offers emails"]);
      await newsDetails(p, b); assert(!(await p.isChecked("#f-offers")), "cleared after sending, in the same page");
      await p.click("[data-submit]"); await p.waitForSelector("[data-done]:not([hidden])");
      assert(p.posts.at(-1)["Offers emails"] === "No" && p.posts.length === 2, "No when unticked");
      const priv = fs.readFileSync(path.join(b.dir, "privacy/index.html"), "utf8");
      assert(priv.includes("<strong>listmonk</strong>: if you tick the offers box, your name and email go to listmonk, our mailing list, on our own server. We send offers only after you confirm by email, and every email has an unsubscribe link.") && priv.includes("whether you'd like offers emails, and how you'd like us to confirm"), "privacy");
      assert(priv.includes("<li>To email you seasonal offers, only if you ticked the offers box when you booked and then confirmed by email. Every offers email has an unsubscribe link.</li>\n    </ul><p>We do not sell or rent"), "privacy: how we use it");
      assert(priv.includes("<li><strong>Offers mailing list:</strong> kept until you unsubscribe or ask us to remove you.</li>\n    </ul>"), "privacy: how long we keep it");
      assert(priv.includes("every message we send will tell you how to opt out. If you tick the offers box when you book, we email you a link to confirm, and send offers only once you've confirmed. If you ask us to stop,"), "privacy: your consent");
    } finally { await b.close(); }
  });

  test("clearing the saved details unticks the offers box and its error", async ({ browser }) => {
    const b = await buildWith(NEWS_CFG);
    try {
      const p = await newPage(browser); await newsDetails(p, b);
      await p.check("#f-offers"); await p.click("[data-submit]"); assert(await p.isVisible("#err-f-offers"), "error shown");
      await p.click("[data-clear-details]");
      assert(!(await p.isChecked("#f-offers")) && await p.isHidden("#err-f-offers"), "box and error cleared");
    } finally { await b.close(); }
  });

  test("no offers field without the box", async ({ browser, url }) => {
    const p = await newPage(browser);
    await toDetails(p, url); await fillDetails(p); await p.fill("#f-email", "p@example.com");
    assert(!(await p.$("#f-offers")) && await reviewRow(p, "Offers emails") === null, "no box, no review row");
    await p.click("[data-submit]"); await p.waitForSelector("[data-done]:not([hidden])");
    assert(!("Offers emails" in p.posts.at(-1)), "no Offers emails key: " + Object.keys(p.posts.at(-1)).join(", "));
    const priv = fs.readFileSync(built("privacy/index.html"), "utf8");
    assert(!/Offers mailing list|seasonal offers|offers emails|listmonk/i.test(priv), "the privacy policy mentions offers emails with the box off");
  });

  test("chat loads after the page, never on booking; phones get the bar button", async ({ browser }) => {
    const b = await buildWith(CHAT_CFG);
    try {
      const ph = await newPage(browser, { width: 390, height: 844, isMobile: true }); await ph.goto(b.url + "/");
      await ph.waitForSelector("[data-chat-open]:not([hidden])", { timeout: 8000 });
      const st = await ph.evaluate(() => ({ ready: window.__cwReady, hide: window.chatwootSettings.hideMessageBubble, run: window.__cwRun }));
      assert(st.ready === "complete" && st.hide === true && st.run.websiteToken === "tok123" && st.run.baseUrl === "https://chat.example.test", JSON.stringify(st));
      await ph.click("[data-chat-open]"); assert(await ph.evaluate(() => window.__cwToggle) === "open", "opens");
      const pc = await newPage(browser); await pc.goto(b.url + "/"); await pc.waitForFunction(() => window.__cwRun, null, { timeout: 8000 });
      assert(await pc.evaluate(() => window.chatwootSettings.hideMessageBubble) === false, "computers keep the bubble");
      const bk = await newPage(browser); await bk.goto(b.url + "/book/"); await bk.waitForTimeout(4500);
      assert(bk.chatRequests.length === 0, "nothing on /book/");
    } finally { await b.close(); }
  });

  test("no chat button when the widget fails", async ({ browser }) => {
    const b = await buildWith(CHAT_CFG);
    try {
      const p = await newPage(browser, { width: 390, height: 844, isMobile: true }); p.chatMode = "fail"; await p.goto(b.url + "/"); await p.waitForTimeout(4500);
      assert(p.chatRequests.length === 1 && await p.isHidden("[data-chat-open]"), "stays hidden");
    } finally { await b.close(); }
  });

  test("the Chat button leaves room for Call, Text and WhatsApp on a phone", async ({ browser }) => {
    const b = await buildWith(CHAT_CFG + 'window.NR_CONFIG.business.phone = "+14165550100"; window.NR_CONFIG.business.phoneDisplay = "416 555 0100"; window.NR_CONFIG.business.whatsapp = "14165550100";');
    try {
      for (const w of [390, 360]) {
        const p = await newPage(browser, { width: w, height: 800, isMobile: true }); await p.goto(b.url + "/"); await p.waitForSelector("[data-chat-open]:not([hidden])", { timeout: 8000 });
        const r = await p.$$eval("[data-action-bar] > *", (els) => els.filter((e) => getComputedStyle(e).display !== "none").map((e) => { const s = e.classList.contains("ab-book") ? e : e.querySelector("span"), q = s.getBoundingClientRect(); return [q.left, q.right]; }));
        assert(r.length === 5 && r.every((x, i) => i === 0 || x[0] >= r[i - 1][1]), w + "px: the bar's labels run into each other " + JSON.stringify(r));
        assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), w + "px: the page scrolls sideways");
      }
    } finally { await b.close(); }
  });

  test("chat in the privacy policy", async () => {
    const b = await buildWith(CHAT_CFG);
    try {
      const read = (f) => fs.readFileSync(path.join(b.dir, f), "utf8");
      const priv = read("privacy/index.html");
      assert(priv.includes("<tr><td>You chat with us</td><td>Your messages, and your name or email if you give them.</td></tr>"), "collect row");
      assert(priv.includes("<li><strong>Chatwoot</strong>: if you use the chat, your messages and anything you type in it go to Chatwoot, our chat tool, on our own server. When a page with the chat opens, Chatwoot also receives the technical details your browser sends, such as your IP address, and keeps an anonymous visitor record.</li>"), "sharing bullet");
      assert(priv.includes('<p>The chat sets cookies whose names start with "cw_" so your conversation carries across pages, kept for up to a year.</p>'), "cookie sentence");
      assert(priv.includes("<strong>TestHost</strong> hosts our own server in Toronto, Canada"), "server line");
      assert(priv.indexOf("You chat with us") > priv.indexOf("You call, text, WhatsApp or email us") && priv.indexOf("You chat with us") < priv.indexOf("You ask about working with us"), "row sits after the call row");
      assert(/<body data-page="home"[^>]* data-chat>/.test(read("index.html")) && /<body data-page="legal"[^>]* data-chat>/.test(priv), "pages carry the marker");
      assert(!read("book/index.html").includes("data-chat"), "booking page has no marker and no Chat button");
      assert(read("index.html").includes('<button type="button" class="ab-link ab-chat" data-chat-open hidden>') && read("index.html").includes('id="i-chat"'), "bar button and icon");
    } finally { await b.close(); }
  });

  test("today's settings switch nothing on", async ({ browser, url }) => {
    const C = loadConfig();
    assert(!C.booking.easyAppointments.url && !C.chat.baseUrl && !C.newsletter.optIn && C.delivery.provider !== "webhook", "all off");
    for (const f of ["index.html", "book/index.html", "privacy/index.html", "policies/index.html"]) {
      const h = fs.readFileSync(built(f), "utf8");
      assert(!/data-chat|f-offers|Easy!Appointments|n8n|listmonk|Chatwoot/.test(h), f + " mentions a tool that's off");
    }
  });
}
