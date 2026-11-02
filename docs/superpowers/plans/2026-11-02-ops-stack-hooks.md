# Operations Stack Hooks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Off-by-default website settings for n8n form delivery, an Easy!Appointments booking calendar, a listmonk offers checkbox and the Chatwoot widget, each with matching privacy wording and checks, plus a setup guide.

**Architecture:** Everything is driven by `js/config.js`. `tools/build.mjs` decides markup and legal wording at build time. `js/site.js` decides behaviour at run time, and only acts where the build left a marker, so the privacy text always describes a switched-on tool before it runs. The yes/no Cal.com flag stays as `CAL` for shared behaviour; a new `CALENDAR` provider object supplies everything that names the provider.

**Tech Stack:** Static site, Node build script (no dependencies), ES5 browser script, Playwright checks in `tools/qa`.

**Spec:** `docs/superpowers/specs/2026-11-02-ops-stack-hooks-design.md`

## Global Constraints

- With today's `js/config.js`, every built page is identical to `main` (commit `1cc4fef`) apart from `?v=` tags.
- With `booking.calLink` set, every built page is identical to `main` with the same `calLink`, apart from `?v=` tags.
- `js/site.js`: ES5 only, no template literals, no comment that spans lines. The build's `compactJs` depends on it.
- Never put a real address, token or password in the repository. Tests use `*.example.test` hosts.
- New wording follows the house style: plain words, sentence case, no em dashes in new copy.
- Every new setting is blank or false by default in `js/config.js`, with a comment saying what it does and when to run the build.
- Commit messages end with the two attribution lines from the session (Co-Authored-By and Claude-Session).

## Review Focus

1. **Names with accents, apostrophes or several words** in the Easy!Appointments address must arrive intact. "José María O'Neil" gives `first_name=José` and `last_name=María O'Neil` after decoding (Task 5).
2. **An `easyAppointments.url` that already has a query string or a trailing slash** gets parameters joined with `&`, never a second `?` (Task 5).
3. **An estimate exactly equal to a band's `upToHours`** uses that band, not the next one (Task 5).
4. **An n8n reply of `{ "ok": true }` without a reference** is a failure, never "received" (Task 3).
5. **The offers box** keeps its tick after a reload in the same tab and is cleared once the request is sent, like the other boxes (Task 6).

---

### Task 1: Test builds with patched settings

**Files:**
- Modify: `tools/build.mjs:12-25` (argument parsing, config load), `tools/build.mjs:2549-2552` (asset copy)
- Create: `tools/qa/stack.test.mjs`

**Interfaces:**
- Produces: `node tools/build.mjs --out DIR`, a normal (non-preview) build into DIR. It copies `css`, `js`, `assets` and `site.webmanifest` like `--preview` does. When `NR_CONFIG_PATCH` is set, it appends that JavaScript to `DIR/js/config.js`.
- Produces: environment variable `NR_CONFIG_PATCH`, JavaScript run in the build's config sandbox right after `js/config.js` (for example `window.NR_CONFIG.server = {...};`).
- Produces in `tools/qa/stack.test.mjs`: `async function buildWith(patch) -> { dir, url, close }`, which builds with `--out` into a temp folder and serves it with `startServer(dir)`. `close()` stops the server and removes the folder.
- Produces in `tools/qa/stack.test.mjs`: `function buildError(patch) -> string`, the build's stderr when it fails, or `""` when it succeeds.

- [ ] **Step 1: Write the failing test** in `tools/qa/stack.test.mjs`

```js
test("a patched build carries the patch into its pages and its config", async () => {
  const b = await buildWith('window.NR_CONFIG.business.hours = "Every day, 8am to 8pm";');
  try {
    assert(fs.readFileSync(path.join(b.dir, "index.html"), "utf8").includes("Every day, 8am to 8pm"), "page");
    assert(fs.readFileSync(path.join(b.dir, "js/config.js"), "utf8").includes("8am to 8pm"), "config copy");
    assert(!fs.readFileSync(path.join(b.dir, "index.html"), "utf8").includes("window.NR_CONFIG.preview"), "not a preview");
  } finally { await b.close(); }
});
```

- [ ] **Step 2: Run it and see it fail**

Run: `node tools/build.mjs && node tools/qa/run.mjs stack`. Expected: FAIL, because `--out` is unknown and nothing is written.

- [ ] **Step 3: Implement `--out` and `NR_CONFIG_PATCH`** in `tools/build.mjs`

Use `OUT = PREVIEW_DIR || OUT_DIR || ROOT`. The asset copy runs for `PREVIEW_DIR || OUT_DIR`. 404, sitemap and robots stay as they are for non-preview builds.

- [ ] **Step 4: Run the check and the full suite**

Run: `node tools/build.mjs && node tools/qa/run.mjs`. Expected: all PASS. `git status` shows only `tools/build.mjs` and `tools/qa/stack.test.mjs` changed.

- [ ] **Step 5: Commit** (`Build: --out and NR_CONFIG_PATCH for checks with other settings`)

---

### Task 2: New settings and build stops

**Files:**
- Modify: `js/config.js` (`booking`, new `server`, `chat`, `newsletter`, comment on `delivery`)
- Modify: `tools/build.mjs` (new `checkStack()` near the checklist check, around line 90)
- Test: `tools/qa/stack.test.mjs`

**Interfaces:**
- Produces in `js/config.js`:
  - `booking.easyAppointments = { url: "", provider: "", services: [] }`
  - `server = { name: "", location: "" }`
  - `chat = { baseUrl: "", websiteToken: "" }`
  - `newsletter = { optIn: false }`
  - the `delivery` comment names `provider: "webhook"`.
- Produces in `tools/build.mjs`:
  - `PROVIDER` (string; `process.env.NR_PROVIDER` wins, as `SHEET` does today); `SHEET = PROVIDER === "sheet"`; `WEBHOOK = PROVIDER === "webhook"`
  - `EA_ON = !!(C.booking.easyAppointments || {}).url`
  - `CHAT = !!(C.chat && C.chat.baseUrl && C.chat.websiteToken)`
  - `NEWS = !!(C.newsletter && C.newsletter.optIn)`
  - `SELF = WEBHOOK || EA_ON || CHAT || NEWS`
  - `SRV = esc(C.server.name)`, `LOC = esc(C.server.location)`
  - `checkStack()` throws `Error` with the messages below.

- [ ] **Step 1: Write the failing tests**

```js
const SERVER = 'window.NR_CONFIG.server = { name: "TestHost", location: "Toronto, Canada" };';
const STOPS = [
  [SERVER + 'window.NR_CONFIG.booking.calLink = "x/y"; window.NR_CONFIG.booking.easyAppointments = { url: "https://book.example.test", services: [{ upToHours: 3, id: 1 }] };', "Fill in only one booking calendar"],
  [SERVER + 'window.NR_CONFIG.booking.easyAppointments = { url: "http://book.example.test", services: [{ upToHours: 3, id: 1 }] };', "booking.easyAppointments.url in js/config.js must start with https://"],
  [SERVER + 'window.NR_CONFIG.booking.easyAppointments = { url: "https://book.example.test", services: [] };', "booking.easyAppointments.services in js/config.js needs one entry per clean length"],
  [SERVER + 'window.NR_CONFIG.booking.easyAppointments = { url: "https://book.example.test", services: [{ upToHours: 5, id: 1 }, { upToHours: 3, id: 2 }] };', "booking.easyAppointments.services in js/config.js needs one entry per clean length"],
  [SERVER + 'window.NR_CONFIG.booking.easyAppointments = { url: "https://book.example.test", services: [{ upToHours: 3, id: "a" }] };', "booking.easyAppointments.services in js/config.js needs one entry per clean length"],
  [SERVER + 'window.NR_CONFIG.delivery = { provider: "webhook", endpoint: "http://n8n.example.test/webhook/forms" };', "delivery.endpoint in js/config.js must start with https://"],
  [SERVER + 'window.NR_CONFIG.chat = { baseUrl: "https://chat.example.test", websiteToken: "" };', "Fill in both chat.baseUrl and chat.websiteToken"],
  [SERVER + 'window.NR_CONFIG.newsletter = { optIn: true };', "newsletter.optIn needs business.mailingAddress"],
  ['window.NR_CONFIG.delivery = { provider: "webhook", endpoint: "https://n8n.example.test/webhook/forms" };', "Fill in server.name and server.location"]
];
test("each unsafe setting stops the build with its message", async () => {
  for (const [patch, msg] of STOPS) assert(buildError(patch).includes(msg), "expected: " + msg + "\npatch: " + patch);
  assert(buildError(SERVER) === "", "a server alone builds");
});
test("today's settings switch nothing on", async ({ browser, url }) => {
  const C = loadConfig();
  assert(!C.booking.easyAppointments.url && !C.chat.baseUrl && !C.newsletter.optIn && C.delivery.provider !== "webhook", "all off");
  for (const f of ["index.html", "book/index.html", "privacy/index.html", "policies/index.html"]) {
    const h = fs.readFileSync(path.join(ROOT, f), "utf8");
    assert(!/data-chat|f-offers|Easy!Appointments|n8n|listmonk|Chatwoot/.test(h), f + " mentions a tool that's off");
  }
});
```

- [ ] **Step 2: Run them and see them fail**

Run: `node tools/qa/run.mjs stack`. Expected: the stops test FAILs on the first message. The "nothing on" test FAILs because `C.booking.easyAppointments` is undefined.

- [ ] **Step 3: Add the settings and `checkStack()`** with these exact messages:

```
Fill in only one booking calendar in js/config.js: booking.calLink (Cal.com) or booking.easyAppointments.url (Easy!Appointments), not both.
booking.easyAppointments.url in js/config.js must start with https://.
booking.easyAppointments.services in js/config.js needs one entry per clean length, shortest first, each with a whole-number id, e.g. [{ upToHours: 3, id: 1 }, { upToHours: 5, id: 2 }].
delivery.endpoint in js/config.js must start with https:// when delivery.provider is "webhook".
Fill in both chat.baseUrl and chat.websiteToken in js/config.js (baseUrl starting with https://), or leave both empty.
newsletter.optIn needs business.mailingAddress in js/config.js: Canada's anti-spam law (CASL) needs it in every offers email.
Fill in server.name and server.location in js/config.js: the privacy policy says where your own server runs.
```

The services rule fails when the list is empty, when any `id` is not a whole number (`Number.isInteger`), or when `upToHours` is not a number above the previous one. The `server` rule applies when `SELF` is true.

- [ ] **Step 4: Run the checks**

Run: `node tools/build.mjs && node tools/qa/run.mjs stack`. Expected: PASS.

- [ ] **Step 5: Commit** (`Settings for the operations stack, off by default, with build stops`)

---

### Task 3: Forms to n8n

**Files:**
- Modify: `js/site.js:1396-1430` (`send`, `sendSheet`)
- Modify: `tools/build.mjs:23-27` (`SENT_VIA`), `:1265` (booking privacy note), `:2449-2457` (privacy sharing list)
- Modify: `tools/qa/lib.mjs` (`newPage`, new `routeWebhook`)
- Test: `tools/qa/stack.test.mjs`

**Interfaces:**
- Consumes: `PROVIDER`, `SHEET`, `WEBHOOK`, `SELF`, `SRV`, `LOC` (Task 2).
- Produces in `js/site.js`: `sendRecord(data, form, ids, kind)`, where `kind` is `"sheet"` or `"webhook"`; it replaces `sendSheet`.
  - **Payload:** the sheet's payload. Webhook also adds `receipt: data._autoresponse` when that is set.
  - **Webhook headers:** `Content-Type: application/json` and `Accept: application/json`.
  - **Success:** the sheet's rule (`ok === true` and a non-empty string `reference`).
- Produces in `tools/build.mjs`:
  - `bookingSentNote()`, which returns the booking-page sentence up to "may store data outside Canada." It extends today's inline expression and gets calendar-aware in Task 4.
  - `SERVER_LI`, the server privacy bullet; empty unless `SELF`.
- Produces in `tools/qa/lib.mjs`:
  - `page.hookMode` (default `"ok"`), `page.hookPosts`, `page.hookRequests`.
  - The route for `/n8n\.example\.test/` answers `OPTIONS` with 204 and CORS headers.
  - Modes: `ok`, `clash` (reference `NR-ZZ99`), `noref` (`{"ok":true}`), `notok`, `badjson`, `http500`, `neterr`.

- [ ] **Step 1: Write the failing tests**

```js
const HOOK = SERVER + 'window.NR_CONFIG.delivery = { provider: "webhook", endpoint: "https://n8n.example.test/webhook/forms" };';
test("n8n gets JSON with the receipt and its reference is shown", async ({ browser, url }) => {
  const p = await newPage(browser); await withConfig(p, HOOK); p.hookMode = "clash";
  await toDetails(p, url); await fillDetails(p); await p.fill("#f-email", "p@example.com");
  await p.click("[data-submit]"); await p.waitForSelector("[data-done]:not([hidden])");
  const req = p.hookRequests.find((r) => r.method === "POST"), body = p.hookPosts.at(-1);
  assert(req.headers["content-type"] === "application/json", "json");
  assert(body.form === "booking" && /^NR-[A-Z0-9]{4}$/.test(body.reference) && body.email === "p@example.com", "payload");
  assert(/Nest & Rest Cleaning/.test(body.receipt) && !Object.keys(body.fields).some((k) => k[0] === "_"), "receipt, no _ fields");
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
test("double submit sends one n8n request", async ({ browser, url }) => { /* as delivery.test.mjs "double submit sends one attempt", with HOOK and hookPosts.length === 1 */ });
test("n8n wording on the forms and in the privacy policy", async () => {
  const b = await buildWith(HOOK);
  try {
    const book = fs.readFileSync(path.join(b.dir, "book/index.html"), "utf8"), priv = fs.readFileSync(path.join(b.dir, "privacy/index.html"), "utf8");
    assert(book.includes("Your request goes to our own server (TestHost, Toronto, Canada), where our automation tool n8n saves it and forwards it to our Gmail inbox (Google), which may store data outside Canada."), "booking note");
    assert(fs.readFileSync(path.join(b.dir, "gift/index.html"), "utf8").includes("where our automation tool n8n saves it"), "SENT_VIA");
    assert(priv.includes("<strong>TestHost</strong> hosts our own server in Toronto, Canada") && priv.includes("<strong>n8n</strong>") && !priv.includes("FormSubmit"), "privacy");
  } finally { await b.close(); }
});
```

- [ ] **Step 2: Run them and see them fail**

Run: `node tools/qa/run.mjs stack`. Expected: FAIL (posts go to FormSubmit).

- [ ] **Step 3: Implement**

**`js/site.js`:** `send()` routes `"webhook"` to `sendRecord(…, "webhook")`.

**`tools/build.mjs`:**
- `SENT_VIA` for webhook: `Your request goes to our own server (${SRV}, ${LOC}), where our automation tool n8n saves it and forwards it to our Gmail inbox (Google), which may store data outside Canada.`
- The privacy sharing list becomes three-way: sheet, n8n or FormSubmit. The n8n bullet: `<li><strong>n8n</strong>, our automation tool, on our own server, receives the website's forms, saves each request and forwards it to our Gmail inbox. If you give your email address, it sends you a receipt that only confirms your request arrived. ${esc(B.ownerFirstName)}'s own reply is what confirms a booking.</li>`
- `SERVER_LI` goes right after the Google bullet: `<li><strong>${SRV}</strong> hosts our own server in ${LOC}, which runs the tools named below.</li>`

- [ ] **Step 4: Run the checks**

Run: `node tools/build.mjs && node tools/qa/run.mjs stack && node tools/qa/run.mjs delivery`. Expected: PASS. The sheet tests must still pass through `sendRecord`.

- [ ] **Step 5: Commit** (`Deliver forms to n8n when delivery.provider is "webhook"`)

---

### Task 4: One calendar mode with a provider table

**Files:**
- Modify: `tools/build.mjs:57-58` (`CAL`), `:1265` (via `bookingSentNote()`), `:1278-1285` (calendar step text), `:2310-2314` (help "after" steps), `:2453` and `:2473` (privacy), `:2489-2490` (Service Policies)
- Modify: `js/config.js` (`emails.bookingCal`), `js/site.js:1111-1112` (`_autoresponse` values)
- Test: `tools/qa/stack.test.mjs`

**Interfaces:**
- Produces in `tools/build.mjs`:
  - `CALENDARS.cal` and `CALENDARS.easyappointments`, each `{ bookNote, abroad, step, after, policy, privacy, cookies }`.
  - `CALENDAR = C.booking.calLink ? CALENDARS.cal : EA_ON ? CALENDARS.easyappointments : null`.
  - `CAL = !!CALENDAR`. Every existing `CAL` use stays as it is.
- Produces in `js/site.js` (inside `bindBooking`): `calNote()`, which returns the `{calendarNote}` text, and `calHome()`, which returns the `{calendar}` link.

`CALENDARS.cal` values are today's text, moved and unchanged:

| Key | Value |
|---|---|
| `bookNote` | `the time you pick is booked on Cal.com, our booking calendar` |
| `abroad` | `true` |
| `step` | `Your details are in. Choose a time that suits you and it's confirmed straight away. Cal.com emails you the confirmation.` |
| `after` | `The time you pick on the calendar is confirmed straight away, and Cal.com emails you the confirmation with links to reschedule or cancel.` |
| `policy` | `our calendar provider, Cal.com, emails you a confirmation with links to reschedule or cancel` |
| `privacy` | today's Cal.com `<li>` |
| `cookies` | today's Cal.com `<p>` |

`CALENDARS.easyappointments`:

| Key | Value |
|---|---|
| `bookNote` | `` `the time you pick is booked on our own booking calendar (Easy!Appointments, on our server in ${LOC})` `` |
| `abroad` | `false` |
| `step` | `Your details are in (reference <strong data-cal-ref></strong>). Pick a time below and it's confirmed straight away. The calendar shows your confirmation and emails it to you, with a link to reschedule or cancel.` |
| `after` | `The time you pick on the calendar is confirmed straight away, and the calendar emails you the confirmation with a link to reschedule or cancel.` |
| `policy` | `our booking calendar emails you a confirmation with a link to reschedule or cancel` |
| `privacy` | `<li><strong>Easy!Appointments</strong>, our booking calendar, runs on our own server. When you pick a time, it receives your name, email, phone number, address and the service, and emails your confirmation.</li>` |
| `cookies` | `""` |

**`bookingSentNote()`** joins the delivery destination with the calendar:
- No calendar: `<dest>, which may store data outside Canada.`
- Calendar with `abroad`: `<dest>, and <bookNote>. ${SHEET ? "All" : "Both"} may store data outside Canada.`
- Calendar without `abroad`: `<dest>, which may store data outside Canada, and <bookNote>.`

**Emails.** `emails.bookingCal` reads `…when you pick it on our calendar, and {calendarNote} Haven't picked…`. `calNote()` returns:
- Cal.com: `Cal.com emails that confirmation separately, with links to reschedule or cancel.`
- Easy!Appointments: `our booking calendar emails that confirmation separately, with a link to reschedule or cancel.`

- [ ] **Step 1: Write the failing test**

```js
test("Cal.com wording is unchanged, email included", async ({ browser, url }) => {
  const txt = loadConfig().emails.bookingCal;
  assert(txt.includes("{calendarNote}") && !txt.includes("Cal.com"), "config uses the slot");
  const b = await buildWith('window.NR_CONFIG.booking.calLink = "nestandrest/home-clean";');
  try {
    const q = await newPage(browser); await q.goto(b.url + "/book/?s=regular&h=condo&bd=2&ba=1");
    await q.fill("#f-postal", "M2N 5W9"); await q.click("[data-next]"); await fillDetails(q); await q.fill("#f-email", "p@example.com");
    await q.click("[data-submit]"); await q.waitForSelector("[data-cal-step]:not([hidden])");
    assert(q.posts.at(-1)._autoresponse.includes("pick it on our calendar, and Cal.com emails that confirmation separately, with links to reschedule or cancel. Haven't picked"), "Cal email text");
  } finally { await b.close(); }
});
```

- [ ] **Step 2: Run it and see it fail**

Run: `node tools/qa/run.mjs stack`. Expected: FAIL on "config uses the slot".

- [ ] **Step 3: Implement the table, `bookingSentNote()`, `calNote()` and `calHome()`.** Replace each Cal.com string with its table field.

- [ ] **Step 4: Golden comparison with `main`**

```bash
git worktree add /tmp/nr-base 1cc4fef
sed -i 's/calLink: ""/calLink: "nestandrest\/home-clean"/' /tmp/nr-base/js/config.js
(cd /tmp/nr-base && node tools/build.mjs)
NR_CONFIG_PATCH='window.NR_CONFIG.booking.calLink = "nestandrest/home-clean";' node tools/build.mjs --out /tmp/nr-cal
(cd /tmp/nr-base && git ls-files '*.html') | while read f; do diff -q <(sed -E 's/\?v=[0-9a-f]{8}//g' /tmp/nr-base/$f) <(sed -E 's/\?v=[0-9a-f]{8}//g' /tmp/nr-cal/$f) >/dev/null || echo "DIFF $f"; done
```

Expected: no `DIFF` lines. Then `git -C /tmp/nr-base checkout js/config.js`, and keep the worktree for Task 9.

- [ ] **Step 5: Run the checks and commit**

Run: `node tools/build.mjs && node tools/qa/run.mjs`. Expected: all PASS. Commit message: `One live-calendar mode with a provider table (Cal.com wording unchanged)`.

---

### Task 5: The Easy!Appointments step

**Files:**
- Modify: `tools/build.mjs:1278-1285` (calendar step markup)
- Modify: `js/site.js:487-492` (`CAL` detection), `:1142` (after a send), new `showEaCalendar(info)` next to `showCalendar`
- Modify: `css/site.css` (calendar frame)
- Modify: `tools/qa/lib.mjs` (EA route)
- Test: `tools/qa/stack.test.mjs`

**Interfaces:**
- Consumes: `CALENDAR`, `CALENDARS` (Task 4); `calHome()` (Task 4).
- Produces markup: the step gets `data-cal-provider="cal"` or `data-cal-provider="easyappointments"`, and its paragraph is `CALENDAR.step`.
- Produces in `js/site.js` (inside `bindBooking`):
  - `EA` is true when the step's provider is `easyappointments` and `C.booking.easyAppointments.url` is set.
  - `CAL` is true when the step exists and either `EA` is true or `calPath` is set.
  - `eaService(hours) -> number|null`
  - `eaLink(info, id) -> string`
  - `showEaCalendar(info)`
- Produces in `tools/qa/lib.mjs`: `page.eaMode` (`"ok"` serves a small HTML page; `"hang"` never answers) and `page.eaUrls`, on the route `/book\.example\.test/`.
- Frame CSS: `.cal-embed iframe { width: 100%; height: 1000px; border: 0; }`, and below 600px wide `height: 85vh`.

**Behaviour of `showEaCalendar`:**
- **Band:** `eaService` returns the first band whose `upToHours >= hours`. If there is none, call `showDone(info, false, null)` and stop.
- **Frame:** otherwise build `<iframe title="Booking calendar">`. Set `[data-cal-link]` to the same address, `[data-cal-ref]` to `info.r`, the page heading to "Almost booked", and `markDots(3)`.
- **Fallback:** if the frame hasn't fired `load` within 10 seconds, show `[data-cal-fail]`.
- **Analytics:** `track("calendar_shown", { service, value, currency })`.
- **Address:** `eaLink` adds `service`, `provider` (only if set), `first_name`, `last_name` (only if more than one word), `email` (only if given), `phone`, `address` and `zip`. Each value is encoded with `encodeURIComponent`, and parameters are joined to `url` with `?` or `&`.

- [ ] **Step 1: Write the failing tests**

```js
const EA_CFG = (services) => SERVER + `window.NR_CONFIG.booking.easyAppointments = { url: "https://book.example.test/index.php?lang=en", provider: "2", services: ${JSON.stringify(services)} };`;
const hoursFor = (C, key, bd, ba) => { const s = C.services[key]; return Math.max(1.5, Math.round((s.hours + (bd - 1) * 0.5 + (ba - 1) * 0.5) / 0.5) * 0.5); };
async function eaBooking(browser, b, name = "José María O'Neil") {
  const p = await newPage(browser); await p.goto(b.url + "/book/?s=regular&h=condo&bd=2&ba=1");
  await p.fill("#f-postal", "M2N 5W9"); await p.click("[data-next]"); await fillDetails(p, name); await p.fill("#f-email", "p@example.com");
  await p.click("[data-submit]"); return p;
}
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
  } finally { await b.close(); }
});
test("an estimate longer than every band gets the request screen", async ({ browser }) => {
  const b = await buildWith(EA_CFG([{ upToHours: 1, id: 31 }]));
  try { const p = await eaBooking(browser, b); await p.waitForSelector("[data-done]:not([hidden])"); assert(!(await p.$("[data-cal-embed] iframe")), "no frame"); }
  finally { await b.close(); }
});
test("a calendar that doesn't load offers the new tab after 10 seconds", async ({ browser }) => {
  const b = await buildWith(EA_CFG([{ upToHours: 12, id: 41 }]));
  try {
    const p = await eaBooking(browser, b); p.eaMode = "hang";
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
    for (const f of ["book/index.html", "privacy/index.html", "policies/index.html", "help/index.html", "index.html"]) assert(!read(f).includes("Cal.com"), f + " names Cal.com");
  } finally { await b.close(); }
});
test("analytics never sees the calendar address", async ({ browser }) => { /* with ga4Id stubbed as in privacy.test.mjs, after eaBooking: no collected hit contains "first_name" or "book.example.test" */ });
```

- [ ] **Step 2: Run them and see them fail**

Run: `node tools/qa/run.mjs stack`. Expected: FAIL (no frame).

- [ ] **Step 3: Implement** the markup attribute, the CSS, `eaService`, `eaLink` and `showEaCalendar`. After a send: `if (CAL && !info.skipped) (EA ? showEaCalendar : showCalendar)(info)`.

- [ ] **Step 4: Run the checks**

Run: `node tools/build.mjs && node tools/qa/run.mjs`. Expected: all PASS.

- [ ] **Step 5: Commit** (`Easy!Appointments as the live calendar, filled in from the booking form`)

---

### Task 6: Offers checkbox

**Files:**
- Modify: `tools/build.mjs:1219` (after the email field), `:2426` (privacy "What we collect" booking row), privacy sharing list (listmonk bullet)
- Modify: `js/site.js:485` (`boxIds`), `validate(LAST)` (around line 890), `renderReview` minor rows (around line 690), the booking `send` fields (around line 1130), `fieldError` anchor (line 1367)
- Modify: `css/site.css` (only if the error under a `.check` needs spacing)
- Test: `tools/qa/stack.test.mjs`
- No change: `tools/sheet/Code.gs`. Its `addMissingHeaders_` already adds a column for any new field label.

**Interfaces:**
- Consumes: `NEWS` (Task 2).
- Produces markup (only when `NEWS`): `<div class="field span-2"><label class="check"><input type="checkbox" id="f-offers" name="offers"> <span>Email me seasonal offers from Nest &amp; Rest. Unsubscribe any time.</span></label></div>`
- Produces in `js/site.js`:
  - `"f-offers"` is added to `boxIds`.
  - The `fieldError` anchor also matches `.check`.
  - The request field `"Offers emails"` is sent only when `#f-offers` exists. Its value is `Yes (ticked: "Email me seasonal offers from Nest & Rest. Unsubscribe any time.")` or `No`.
  - Review row: `["Offers emails", checked ? "Yes, by email" : "No", LAST, "#f-offers"]`.
  - Error text: `Add your email to get offers, or untick the box.`
- Privacy:
  - The booking row gains `whether you'd like offers emails, ` before `and how you'd like us to confirm`.
  - The listmonk bullet: `<li><strong>listmonk</strong>: if you tick the offers box, your name and email go to listmonk, our mailing list, on our own server. We send offers only after you confirm by email, and every email has an unsubscribe link.</li>`

- [ ] **Step 1: Write the failing tests**

```js
const NEWS_CFG = SERVER + 'window.NR_CONFIG.business.mailingAddress = "PO Box 1, Toronto, ON M1B 0A1"; window.NR_CONFIG.newsletter = { optIn: true };';
async function newsDetails(browser, b) { const p = await newPage(browser); await p.goto(b.url + "/book/?s=regular&h=condo&bd=2&ba=1"); await p.fill("#f-postal", "M2N 5W9"); await p.click("[data-next]");
  await p.click("label.date-chip >> nth=1"); await p.click('label.slot[data-slot="evening"]'); await p.click("[data-next]"); await fillDetails(p); return p; }
test("offers box: unticked, needs an email, and travels with the request", async ({ browser }) => {
  const b = await buildWith(NEWS_CFG);
  try {
    const p = await newsDetails(browser, b);
    assert(!(await p.isChecked("#f-offers")), "unticked by default");
    await p.check("#f-offers"); await p.click("[data-submit]");
    assert((await p.textContent("#err-f-offers")).trim() === "Add your email to get offers, or untick the box." && p.posts.length === 0, "needs email");
    await p.reload(); assert(await p.isChecked("#f-offers"), "kept in this tab");
    await p.fill("#f-email", "p@example.com"); await p.click("[data-submit]"); await p.waitForSelector("[data-done]:not([hidden])");
    assert(p.posts.at(-1)["Offers emails"] === 'Yes (ticked: "Email me seasonal offers from Nest & Rest. Unsubscribe any time.")', "consent record");
    const q = await newsDetails(browser, b); assert(!(await q.isChecked("#f-offers")), "cleared after sending");
    await q.click("[data-submit]"); await q.waitForSelector("[data-done]:not([hidden])"); assert(q.posts.at(-1)["Offers emails"] === "No", "No when unticked");
    const priv = fs.readFileSync(path.join(b.dir, "privacy/index.html"), "utf8");
    assert(priv.includes("<strong>listmonk</strong>") && priv.includes("whether you'd like offers emails"), "privacy");
  } finally { await b.close(); }
});
test("no offers field without the box", async ({ browser, url }) => { /* root build: toDetails, fillDetails, submit: posts.at(-1) has no "Offers emails" key */ });
```

The review row "Offers emails" shows "Yes, by email" when ticked. Assert it in the first test before sending.

- [ ] **Step 2: Run them and see them fail**

Run: `node tools/qa/run.mjs stack`. Expected: FAIL (no `#f-offers`).

- [ ] **Step 3: Implement** as in Interfaces.

- [ ] **Step 4: Run the checks**

Run: `node tools/build.mjs && node tools/qa/run.mjs`. Expected: all PASS, including `a11y` with the box absent.

- [ ] **Step 5: Commit** (`Offers checkbox on the booking form, for listmonk`)

---

### Task 7: Chat widget

**Files:**
- Modify: `tools/build.mjs`:
  - `ICONS` (new `i-chat` symbol)
  - `actionBar()` (line 363)
  - `page()` (`<body>`, line 693)
  - privacy: a collect row after "You call, text, WhatsApp or email us", a sharing bullet, cookies
- Modify: `js/site.js` (new `initChat()`, called next to `bindBooking()` at line 1977)
- Modify: `css/site.css` (`.ab-chat`, if the bar needs it)
- Modify: `tools/qa/lib.mjs` (Chatwoot SDK route)
- Test: `tools/qa/stack.test.mjs`

**Interfaces:**
- Consumes: `CHAT` (Task 2).
- Produces markup:
  - `<body … data-chat>` on pages where `CHAT && pageType !== "book" && !PREVIEW_DIR`.
  - In the action bar, when `CHAT`: `<button type="button" class="ab-link ab-chat" data-chat-open hidden>${ic("i-chat")}<span>Chat</span></button>`
- Produces in `js/site.js`: `initChat()`.
  - **Returns early** in the preview, without `body[data-chat]`, or without both chat settings.
  - **Timing:** after `load`, it waits for `requestIdleCallback` (timeout 3000) or `setTimeout(…, 3000)`.
  - **Settings:** sets `window.chatwootSettings = { hideMessageBubble: barShown, position: "right", locale: "en" }`, where `barShown` is true when `[data-action-bar]` is displayed.
  - **Script:** adds `<baseUrl>/packs/js/sdk.js`. Its `onload` calls `chatwootSDK.run({ websiteToken, baseUrl })`, then, if `barShown`, unhides `[data-chat-open]`. Clicking the button calls `window.$chatwoot.toggle("open")`.
- Produces in `tools/qa/lib.mjs`:
  - `page.chatMode`: `"ok"` serves a fake SDK that records `window.__cwReady = document.readyState`, the run options and `toggle` calls; `"fail"` aborts.
  - `page.chatRequests`, recorded on the route `/chat\.example\.test\/packs\/js\/sdk\.js/`.
- Privacy:
  - Collect row: `<tr><td>You chat with us</td><td>Your messages, and your name or email if you give them.</td></tr>`
  - Sharing bullet: `<li><strong>Chatwoot</strong>: if you use the chat, your messages and anything you type in it go to Chatwoot, our chat tool, on our own server.</li>`
  - Cookies: `<p>The chat sets cookies whose names start with "cw_" so your conversation carries across pages, kept for up to a year.</p>`

- [ ] **Step 1: Write the failing tests**

```js
const CHAT_CFG = SERVER + 'window.NR_CONFIG.chat = { baseUrl: "https://chat.example.test", websiteToken: "tok123" };';
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
  try { const p = await newPage(browser, { width: 390, height: 844, isMobile: true }); p.chatMode = "fail"; await p.goto(b.url + "/"); await p.waitForTimeout(4500);
    assert(p.chatRequests.length === 1 && await p.isHidden("[data-chat-open]"), "stays hidden"); }
  finally { await b.close(); }
});
test("chat in the privacy policy", async () => { /* buildWith(CHAT_CFG): privacy has the collect row, the Chatwoot bullet and the cw_ cookie sentence; book/index.html has no data-chat */ });
```

- [ ] **Step 2: Run them and see them fail**

Run: `node tools/qa/run.mjs stack`. Expected: FAIL (no `[data-chat-open]`).

- [ ] **Step 3: Implement** as in Interfaces. The `i-chat` symbol is a speech bubble in the sprite's style: 24×24 viewBox, stroke `currentColor`, width 1.7.

- [ ] **Step 4: Run the checks**

Run: `node tools/build.mjs && node tools/qa/run.mjs && node tools/qa/perf.mjs`. Expected: all PASS.

- [ ] **Step 5: Commit** (`Chatwoot chat on every page but booking, with a bar button on phones`)

---

### Task 8: Setup guide and README

**Files:**
- Create: `docs/ops-stack-setup.md`
- Modify: `README.md` (the "Changing things" list and "Still to do" item 3)

**Requirements:**
- **Sections:** the nine sections and their order from the spec's "Setup guide". It is written to Mann in the style of `docs/google-sheet-setup.md`: numbered steps, plain words, what to click and what to copy where.
- **Install steps link to each project's own docs:**
  - Easy!Appointments `docs/installation-guide.md` and `docs/docker.md`
  - n8n's Docker instructions
  - Invoice Ninja's self-host options
  - SMS Gateway's README
  - Chatwoot's deployment docs
  - listmonk's install section

  Copy no long command blocks. Two exceptions, verified on 2 November 2026:
  - `docker run -it --rm -p 5678:5678 docker.n8n.io/n8nio/n8n` (from n8n's README; the guide says to add a volume for real use)
  - listmonk's `listmonk/listmonk:latest` image on port 9000
- **Facts the guide may state.** All were verified on GitHub on 2 November 2026; anything else must be checked against the linked docs before it goes in:
  - **Easy!Appointments booking-link parameters:** `service`, `provider`, `first_name`, `last_name`, `email`, `phone`, `address`, `city`, `zip`.
  - **Easy!Appointments webhooks** (since v1.5.0), with a secret token header defaulting to `X-EA-Token` (since v1.5.1).
  - **Easy!Appointments REST API** at `/index.php/api/v1/`, using an API key from Settings as a bearer token. The customer email has a reschedule-or-cancel link. Embedding on another site is fixed in v1.6.1.
  - **n8n:** the Webhook node's response mode "Using 'Respond to Webhook' Node"; the built-in Invoice Ninja node and trigger; webhooks answer CORS preflights.
  - **SMS Gateway, local mode:** `POST http://<phone-ip>:8080/message`.
  - **SMS Gateway, cloud mode:** `POST https://api.sms-gate.app/3rdparty/v1/message`.
  - **SMS Gateway request:** Basic auth from the app; body `{ "textMessage": { "text": "…" }, "phoneNumbers": ["+1…"] }`. Android 5.0 or later. The README advises against batch sending.
  - **listmonk:** `POST /api/subscribers` with Basic auth `api_user:token` and fields `email`, `name`, `status`, `lists`, `preconfirm_subscriptions`.
  - **Chatwoot:** the website inbox gives the `websiteToken`; the SDK is at `/packs/js/sdk.js`; there is a phone app.
  - **Invoice Ninja:** Stripe is the recommended gateway; there are iOS, Android and F-Droid apps; white-label is $40/yr; license ELv2.
- **The n8n "Website forms" recipe** must reply `{ "ok": true, "reference": "{{ $json.body.reference }}" }` for new attempts, and for repeats the reference saved with that `attempt`.
- **The settings section** shows the exact `js/config.js` blocks from Tasks 2 and 5, with placeholder values (`https://book.nestnrestcleaning.com` and so on), and lists the build stops a typo can trigger.
- **README:** one line per new setting, pointing to the guide. "Still to do" item 3 mentions the guide as one way to get a request record.

- [ ] **Step 1: Write the guide and the README lines.**
- [ ] **Step 2: Check it**

Run: `grep -nE "TODO|TBD|—" docs/ops-stack-setup.md`. Expected: no output.

Then confirm every link resolves: open each with WebFetch, or `curl -sI` where allowed. Any link that can't be confirmed gets "(check this link)" removed and the plain project page used instead.

- [ ] **Step 3: Commit** (`Setup guide for the operations stack`)

---

### Task 9: Whole-branch verification and push

- [ ] **Step 1: Full checks**

Run: `node tools/build.mjs && node tools/qa/run.mjs && node tools/qa/perf.mjs`. Expected: `0 failed`, and perf passes.

- [ ] **Step 2: Today's settings are unchanged against `main`**

Use the Task 4 worktree with its config restored:

```bash
(cd /tmp/nr-base && node tools/build.mjs)
git ls-files '*.html' | while read f; do diff -q <(sed -E 's/\?v=[0-9a-f]{8}//g' /tmp/nr-base/$f) <(sed -E 's/\?v=[0-9a-f]{8}//g' $f) >/dev/null || echo "DIFF $f"; done
```

Expected: no `DIFF` lines. Then run `git worktree remove --force /tmp/nr-base`.

- [ ] **Step 3: Repeat the Task 4 Cal.com comparison.** Expected: no `DIFF` lines.

- [ ] **Step 4: Push**

Run: `git push -u origin claude/jolly-tesla-o00gmy`. Retry up to 4 times on network errors, at 2s, 4s, 8s and 16s.
