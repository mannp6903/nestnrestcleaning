# Operations stack hooks: design

Date: 2 November 2026. Owner: Mann Patel. Source: "Open-source operations stack for a cleaning company" (2 November 2026), recommended starter stack.

## Purpose

Prepare the website and a setup guide for six self-hosted tools, without changing the live site until Mann switches each one on:

| Tool | Job | Website change |
|---|---|---|
| Easy!Appointments | Customers pick a confirmed time; syncs Google Calendar; emails confirmations | Booking calendar option, beside Cal.com |
| n8n | Receives the website's forms and connects the other tools | New form delivery option |
| Invoice Ninja | Invoices, Stripe card payments, phone app | None (n8n drives it) |
| SMS Gateway for Android | Reminder and review texts from Mann's phone | None (n8n drives it) |
| Chatwoot | Website chat (and optionally WhatsApp) in one inbox and phone app | Chat widget |
| listmonk | Seasonal offers to clients who opted in | Offers checkbox on the booking form |

Success:

- With every new setting blank (today's `js/config.js`), every page builds the same as now apart from the `?v=` version tags, and every existing check passes, including `tools/qa/perf.mjs`.
- With `booking.calLink` set, the booking page, privacy policy and Service Policies read word for word as they do today.
- Each new setting, once filled in, switches on its piece and the privacy wording that describes it; each has its own checks in `tools/qa/stack.test.mjs`.
- `docs/ops-stack-setup.md` takes Mann from an empty server to a working stack, in order.

## Owner decisions (2 November 2026)

- Scope: a setup guide plus off-by-default website settings, committed to the working branch.
- Easy!Appointments works like the Cal.com option: details first, then a confirmed time on the embedded calendar.
- One live-calendar mode with a provider table, not a second parallel switch. `calLink` keeps working.
- Chat on every page except `/book/`.
- Offers sign-up: an unticked checkbox on the booking form only.
- Design parts 1–3 below were approved in chat, as written there.

## Out of scope

- Renting, installing or running any server, and any real address, token or password in the repository.
- Importable n8n workflow files. The guide gives node-by-node recipes instead, because workflows can't be run and tested here.
- Website changes for Invoice Ninja or SMS Gateway, and SMS replies flowing into Chatwoot.
- A footer newsletter sign-up.
- Any change to how the Cal.com option behaves.

---

## Part 1: settings and the booking calendar

### New settings in `js/config.js`

```js
booking: {
  leadDays: 1,
  blockedDates: [],
  calLink: "",                  // Cal.com, unchanged
  easyAppointments: {           // fill url to use Easy!Appointments instead of Cal.com
    url: "",                    // the booking page, e.g. "https://book.nestnrestcleaning.com"
    provider: "",               // Mann's provider ID in Easy!Appointments (optional)
    services: []                // one per clean length, shortest first: [{ upToHours: 3, id: 1 }, { upToHours: 5, id: 2 }, { upToHours: 8, id: 3 }]
  }
},
server: { name: "", location: "" }  // where Mann's own server runs, e.g. "DigitalOcean", "Toronto, Canada"
```

The calendar in use is whichever one is filled in. There is no separate switch.

### One live-calendar mode

`tools/build.mjs` and `js/site.js` replace the yes/no `CAL` flag with a calendar object, or `null` when neither calendar is set. Everything that depends only on "is there a live calendar" (the steps, `ACT` button words, FAQs marked `requestsOnly`, the booking summary, the day-and-window step being removed) stays shared and unchanged.

Everything that names the provider reads it from one table:

| Key | Cal.com (today's wording, unchanged) | Easy!Appointments |
|---|---|---|
| `bookNote` (booking-form notice) | "the time you pick is booked on Cal.com, our booking calendar" | "the time you pick is booked on our own booking calendar (Easy!Appointments, on our server in {server.location})" |
| `confirm` (calendar step, How to book, Service Policies) | "Cal.com emails you the confirmation" / "with links to reschedule or cancel" | "the calendar shows your confirmation and emails it to you, with a link to reschedule or cancel" |
| `emailNote` (`{calendarNote}` in `emails.bookingCal`) | "Cal.com emails that confirmation separately, with links to reschedule or cancel." | "Our booking calendar emails that confirmation separately, with a link to reschedule or cancel." |
| `privacy` (Who we share it with) | today's Cal.com entry | "Easy!Appointments, our booking calendar, runs on our own server. When you pick a time, it receives your name, email, phone number, address and the service, and emails your confirmation." |
| `cookies` | today's Cal.com sentence | none: the calendar is on our own server and the policy says so in the server entry |
| `abroad` (counts toward "may store data outside Canada") | yes | no; the server entry states its location instead |

`emails.bookingCal` in `js/config.js` replaces its fixed Cal.com sentence with `{calendarNote}`. With `calLink` set, the email text is unchanged.

### The Easy!Appointments step

After the customer's details are sent (a real send, not the preview), the last step shows an embedded frame of `easyAppointments.url` with these URL parameters, which Easy!Appointments reads (verified in its `assets/js/pages/booking.js`):

| Parameter | Value |
|---|---|
| `service` | the `id` of the first entry in `services` whose `upToHours` is at least the estimate's hours |
| `provider` | `easyAppointments.provider`, only when set |
| `first_name`, `last_name` | the name field, split at the first space; with one word, `first_name` only |
| `email` | when given |
| `phone` | the mobile number as entered |
| `address`, `zip` | street address and postal code |

- **Wording on the step:** "Your details are in (reference NR-XXXX). Pick a time below and it's confirmed straight away. The calendar shows your confirmation and emails it to you, with a link to reschedule or cancel."
- **Why no done screen:** Easy!Appointments shows its own confirmation inside the frame. It redirects there and doesn't tell the host page, so the site can't detect a finished booking. The step itself is the end of the flow.
- **Too long for every band:** if the estimate is longer than the largest `upToHours`, the frame isn't shown. The customer gets today's request done screen: "Request received", Mann confirms.
- **Doesn't load:** if the frame hasn't fired `load` after 10 seconds, the same fallback as Cal.com appears: "open it in a new tab below, or Mann will text you". The new-tab link always carries the same address.
- **Frame:** titled "Booking calendar", 1,000px tall. Below 600px wide it is 85% of the screen's height and scrolls inside.
- **Analytics:** one event, `calendar_shown` (service and value only, like today's events). The frame's address, which holds personal details, never reaches analytics.

---

## Part 2: forms to n8n, offers checkbox, chat

### Forms to n8n

```js
delivery: { provider: "webhook", endpoint: "https://n8n.nestnrestcleaning.com/webhook/forms" }
```

- **Which forms:** all six (booking, quote, gift, review, price text, change), as the sheet does today.
- **Request body:** the same body the sheet gets (`form`, `reference`, `attempt`, `honey`, `email`, `fields`, with `_`-prefixed keys left out of `fields`). It is sent as `Content-Type: application/json`. n8n webhooks answer the browser's preflight and set CORS headers (verified in n8n's `webhook-request-handler.ts`).
- **Receipt text:** when the customer gave an email, the body also carries `receipt`, the customer email text the site already composes from `emails` with the CASL footer. n8n sends Mann's wording unchanged.
- **When it counts as sent:** only on HTTP 2xx with JSON `{ "ok": true, "reference": "<string>" }` (from an n8n "Respond to Webhook" node). The returned reference is the one shown.
- **Failures and retries:** an empty, non-JSON, `ok` not true, HTTP error or network reply shows today's failure message and never "received". Retries reuse the reference and attempt.

### Offers checkbox

```js
newsletter: { optIn: false }   // true adds the box to the booking form; needs business.mailingAddress and server
```

- **The box:** unticked, under the email field on "Your details". Its label: "Email me seasonal offers from Nest & Rest. Unsubscribe any time."
- **Ticked with no email:** an error beside the box, using the existing step-error pattern: "Add your email to get offers, or untick the box."
- **In the request:** a field `Offers emails`, with the value `Yes (ticked: "Email me seasonal offers from Nest & Rest. Unsubscribe any time.")` or `No`. It travels with every delivery option. If the sheet script drops unknown fields, it gets the new column.
- **In the final review:** a line saying whether offers emails were asked for.
- **Listmonk:** n8n adds people who ticked the box to a double-opt-in list (guide, step 7).

### Chat (Chatwoot)

```js
chat: { baseUrl: "", websiteToken: "" }   // both set, then run the build
```

- **Build marker:** the build adds `data-chat` to `<body>` on every page except `/book/` when both are set. `js/site.js` loads the widget only where that marker is and the settings are present, so the privacy policy always describes the chat before it can run. The preview build never loads it.
- **Loading:** after the window `load` event, in an idle callback (or 3 seconds where idle callbacks aren't available). It sets `window.chatwootSettings`, adds `<baseUrl>/packs/js/sdk.js`, then calls `chatwootSDK.run({ websiteToken, baseUrl })` (verified in Chatwoot's widget test page).
- **Computers** (wherever the action bar is hidden): Chatwoot's standard bubble.
- **Phones** (wherever `.action-bar` shows): `hideMessageBubble: true`. A "Chat" button in the action bar, built hidden, is shown once the SDK has loaded. It calls `window.$chatwoot.toggle("open")` (verified in Chatwoot's `sdk.js`). If the script fails, the button stays hidden.

---

## Part 3: privacy wording, checks and the guide

### Privacy and policy wording

Each piece adds wording only while it's on:

- **Booking-form notice, and `SENT_VIA` on the other forms:**
  - With `webhook`: "Your request goes to our own server ({server.name}, {server.location}), where our automation tool n8n saves it and forwards it to our Gmail inbox (Google), which may store data outside Canada."
  - With Easy!Appointments, the provider's `bookNote` is joined on.
  - FormSubmit and sheet wording is unchanged.
  - Rule for "may store data outside Canada": the clause covers only the third-party services named in the sentence (FormSubmit, Google, Cal.com). Pieces on Mann's own server state the server's location instead. With Cal.com set, the sentence is today's, word for word.
- **Privacy policy, "Who we share it with":**
  - **Server:** "{server.name} hosts our own server in {server.location}, which runs the tools named below."
  - **n8n:** "n8n, our automation tool, on that server, receives the website's forms, saves each request and forwards it to our Gmail inbox. If you give your email address, it sends you a receipt that only confirms your request arrived."
  - **Easy!Appointments:** as in the Part 1 table.
  - **Chatwoot:** "If you use the chat, your messages and anything you type in it go to Chatwoot, our chat tool, on that server."
  - **listmonk:** "If you tick the offers box, your name and email go to listmonk, our mailing list, on that server. We send offers only after you confirm by email, and every email has an unsubscribe link."
- **Privacy policy, "What we collect":**
  - A row: "You chat with us: your messages, and your name or email if you give them."
  - The booking row adds "whether you'd like offers emails" when the box is on.
- **Privacy policy, "Cookies":** with chat on, "The chat sets cookies whose names start with "cw_" so your conversation carries across pages, kept for up to a year."
- **Service Policies and How to book:** the calendar's name and confirmation wording come from the provider table.

### Build stops

The build stops with a plain message, like today's checklist check, when:

- `calLink` and `easyAppointments.url` are both set;
- `easyAppointments.url` doesn't start with `https://`;
- `easyAppointments.url` is set and `services` is empty, has an entry without a whole-number `id`, or has `upToHours` not strictly increasing;
- `delivery.provider` is `"webhook"` and `endpoint` doesn't start with `https://`;
- only one of `chat.baseUrl` and `chat.websiteToken` is set, or `baseUrl` doesn't start with `https://`;
- `newsletter.optIn` is true and `business.mailingAddress` is blank (CASL);
- any of `webhook`, Easy!Appointments, chat or `newsletter.optIn` is on and `server.name` or `server.location` is blank.

### Checks

- **No change with settings blank:** build before and after; every built page is identical apart from `?v=` tags.
- **Cal.com unchanged:** build with `calLink` set before and after; `book/`, `privacy/` and `policies/` are identical apart from `?v=` tags.
- **New file `tools/qa/stack.test.mjs`:**
  - It builds into a temporary folder through a new `--out DIR` build option (a normal, non-preview build), with build-time overrides from a new `NR_CONFIG_PATCH` environment variable (JavaScript applied to the settings after `js/config.js`). Runtime settings use the existing `withConfig` helper.
  - **n8n:**
    - JSON body and headers, and the `receipt` text;
    - success shows the returned reference;
    - `notok`, `badjson`, `http500` and `neterr` never show received;
    - retries reuse reference and attempt; a double submit sends once;
    - the preflight is answered.
  - **Offers box:**
    - absent by default; unticked when on;
    - the error when ticked without email;
    - the `Offers emails` field and the review line.
  - **Easy!Appointments:**
    - the frame address (band, provider, name split, prefill);
    - no done screen; the step's wording;
    - the too-long fallback; the 10-second fallback with the new-tab link;
    - privacy, policies and email wording;
    - analytics never sees the frame address.
  - **Chat:**
    - the SDK is requested only after `load` and never on `/book/`;
    - bubble settings on computers, the action-bar button on phones;
    - no button when the SDK fails;
    - privacy and cookie wording.
  - **Build stops:** each rule above, with its message.
- **Full run:** the full existing suite (`node tools/qa/run.mjs`) and `node tools/qa/perf.mjs` pass with today's settings.

### Setup guide: `docs/ops-stack-setup.md`

Written for Mann, in the order he'd do things, with links to each project's own install docs rather than copied commands that go stale:

1. **Server and addresses:** a small server (a Canadian region suggested), web addresses `book.`, `n8n.`, `invoice.`, `chat.` and `mail.` under nestnrestcleaning.com, HTTPS, nightly backups.
2. **Easy!Appointments:** one service per clean length (matching `services`), Mann as provider with working hours, Google Calendar sync, outgoing email, and a webhook to n8n for new and changed appointments.
3. **Invoice Ninja:** company details, HST off until registered, Stripe for cards, the phone app, an API token for n8n.
4. **SMS Gateway for Android:** the app on the business phone, cloud or private server mode, send-rate limits, and the CASL identification line in every text.
5. **n8n**, as node-by-node recipes:
   - **website forms:** webhook → drop repeats by `attempt` → reply `{ ok, reference }` → forward to Gmail → send `receipt` → create or find the client in Invoice Ninja → add to listmonk when `Offers emails` is Yes;
   - **new booking from Easy!Appointments:** confirmation text;
   - **daily:** reminder texts for tomorrow's cleans;
   - **after a clean:** the `/review/` link by text.
6. **Chatwoot:** website inbox and token, the WhatsApp channel (optional), the phone app.
7. **listmonk:** a double-opt-in list, the CASL footer with the mailing address, and an API user for n8n.
8. **Switching the website on:** fill `server`, then `delivery`, `booking.easyAppointments`, `chat` and `newsletter` in that order. After each, run `node tools/build.mjs` and the checks, and send one test booking.
9. **Keeping it safe:** updates, backups, and re-reading the privacy policy after each change.

`README.md` gets short entries for the new settings and a link to the guide.

## Files

| File | Change |
|---|---|
| `js/config.js` | New settings and comments; `{calendarNote}` in `emails.bookingCal` |
| `tools/build.mjs` | Calendar provider table and object, build stops, `webhook`/server/chat/listmonk wording, offers box, chat marker and action-bar button, `--out` and `NR_CONFIG_PATCH` |
| `js/site.js` (and `js/site.min.js` via the build) | Calendar provider branch with the Easy!Appointments frame, `webhook` sending, offers field and error, chat loader |
| `css/site.css` (and `css/site.min.css`) | Calendar frame, chat button |
| `tools/qa/stack.test.mjs`, `tools/qa/lib.mjs` | New checks; local stand-ins for n8n, Easy!Appointments and the Chatwoot SDK |
| `tools/sheet/Code.gs` | Only if it drops unknown fields: the `Offers emails` column |
| `docs/ops-stack-setup.md` | New guide |
| `README.md` | Pointers to the new settings and the guide |
