# Request record and UX refresh: design

Date: 29 October 2026. Owner: Mann Patel. Source: "Nest & Rest vs Hellamaid: functions, systems and UI/UX recheck" (28 October 2026), issues R01–R07 and tickets 1–3.

## Purpose

Keep the current site and design, and act on the recheck:

1. No request from the website can get lost, and the site never promises more than it can prove (R01, R02).
2. The large-home quote handoff keeps what the customer already told us and stops pre-picking answers for them (R03).
3. The first-visit price is easy to find, the final check shows pets and notes, and the site works on phones, with a keyboard and with a screen reader, as far as automated checks can show (R04, R05, R07).

Success: every test below passes, the owner approves screenshots and a clickable preview, and once the Google Sheet is switched on every form submission appears as exactly one row.

## Owner decisions (29 October 2026)

- Record: a Google Sheet owned by Mann, fed by a Google Apps Script web app. It replaces FormSubmit once switched on (approach A). FormSubmit-plus-copy (B) and a paid form service (C) were rejected.
- All forms go to the sheet: bookings, quote requests, gift requests, reviews and "Text me this price".
- Customers who give an email get an automatic receipt from Mann's Gmail. This applies to bookings, quotes and gift requests, not reviews or price texts.
- Design parts 1–3 below were approved in chat, as written there.

## Out of scope

- Secure "manage my booking" links (R06). These need the sheet running and real repeat customers first.
- Live availability calendar, half-bath or basement pricing, quantities for extras, and a first-three-characters postal check. Each needs pricing or capacity rules from Mann.
- Reviews or work photos. Only real ones, supplied by Mann with permission. None are invented.
- Verifying that events arrive in Google Analytics, which needs Mann's Analytics access. We do check that no personal details reach analytics or page addresses.
- Any visual redesign beyond the price box and the two new review rows.

---

## Part 1: the request record

### Pieces

| Piece | Where | Job |
|---|---|---|
| Apps Script | `tools/sheet/Code.gs` | Receives every form, saves a row, sends the alert and receipt emails, retries failed emails, sends the morning reminder |
| Setup guide | `docs/google-sheet-setup.md` | Plain-language steps for Mann: create the sheet, paste the script, run Setup, deploy, send us the address |
| Site switch | `js/config.js` `delivery` | `provider: "formsubmit"` (today) or `provider: "sheet"` with `endpoint` set to the script's `/exec` address |
| Site sender | `js/site.js` `send()` | Sends to whichever provider is set; only an explicit success counts |

Until Mann deploys the script and its address is in `js/config.js`, the provider stays `formsubmit` and the site behaves as today, apart from the wording changes in Part 2.

### What the site sends (sheet provider)

One POST per attempt, body `Content-Type: text/plain;charset=utf-8` (a "simple" request, so the browser makes no CORS preflight), JSON:

```json
{
  "form": "booking | quote | gift | review | pricetext",
  "reference": "NR-AB12",
  "attempt": "16+ random characters, new per submission, kept across retries of it",
  "honey": "",
  "fields": { "Label": "value" }
}
```

- `fields` holds the same labelled values the form sends to FormSubmit today, without FormSubmit's `_` settings.
- Every form gets a reference and an attempt ID. Bookings and gifts already make a reference. The other forms get one the same way, and it isn't shown on their thank-you messages.
- The reference and attempt ID stay the same across retries of one submission. They are discarded after success, so the next submission is new.

### What the script answers

- Saved: `{ "ok": true, "reference": "NR-AB12", "duplicate": false }`
- Already saved (same attempt ID): `{ "ok": true, "reference": "<the saved row's reference>", "duplicate": true }`. No new row and no new emails.
- Refused: `{ "ok": false, "error": "<short reason>" }`

The site counts a request as received only when the HTTP response is OK, the body is JSON, `ok === true` and `reference` is a non-empty string. Anything else, including a network error, is a failure and gets today's failure handling. The confirmation screen shows the reference the script returned.

### Rules inside the script

- **One at a time.** A script lock wraps the duplicate check and the write, so two simultaneous retries can't both write.
- **Duplicates.** If the attempt ID is already in the tab, return that row's reference.
- **Reference clash.** If the reference is in the tab under a different attempt ID, issue a fresh random reference in the same format and return it.
- **Spam.** If `honey` is non-empty, answer `ok: true` with no row and no email, so bots learn nothing.
- **Validation.**
  - `form` must be one of the five.
  - Bookings need Name, Phone, Address and Postal code.
  - Quotes and gifts need Name and a phone or an email.
  - Reviews need Name and Rating.
  - Price texts need Phone.
  - Values are cut to 2,000 characters; a body over 20 KB is refused.
  - A missing field gives `ok: false` with the field's name.
- **Formula safety.** A value starting with `=`, `+`, `-` or `@` is stored with a leading apostrophe, so the sheet never runs it as a formula.

### The sheet

- **Tabs:** Bookings, Quotes, Gifts, Reviews, Price texts.
- **Column order in each tab:**
  1. Reference, Received (Toronto time), Status.
  2. Bookings only: Confirmed time and Final price, for Mann to fill in.
  3. One column per form field label. A label the sheet hasn't seen before gets a new column at the end, so later form changes never lose data.
  4. Last: Attempt, Alert email, Receipt email.
- **Status dropdown:**
  - Bookings: Received, Confirmed, Other time offered, Declined, Cancelled, Done.
  - Quotes: Received, Quoted, Won, Lost.
  - Gifts: Received, Paid, Sent, Redeemed.
  - Reviews: Received, Published, Not published.
  - Price texts: Received, Texted.
  - New rows start as Received.
- **Layout:** the header row is frozen and bold. Setup creates any missing tabs and headers, and running it again changes nothing that already exists.

### Emails

- **Alert to Mann.**
  - Goes to the `OWNER_EMAIL` script property, by default nestnrestcleaning@gmail.com. Sent for every saved row.
  - Subject: "New booking request NR-AB12", or the matching form name.
  - Body: every field, plus a link to the sheet. Reply-to is the customer's email when given.
- **Receipt to the customer.**
  - Bookings, quotes and gifts only, and only when a valid email was given.
  - The wording is fixed in the script. Only the reference is filled in: no name, note or other submitted text, so nobody can use the form to send their own words through Mann's Gmail.
  - Booking: "We got your request NR-AB12. It's not confirmed yet. Mann will reply within 2 hours during business hours to agree your time and final price."
  - Quote: "We got your quote request NR-AB12. Mann will reply within one business day."
  - Gift: "We got your gift card request NR-AB12. Mann will text you within 2 hours during business hours to confirm and send an Interac e-Transfer request."
- **Receipt limits.** At most one receipt per email address per hour, and at most 50 receipts a day. A receipt over either limit is marked "Not needed (limit)"; the row and Mann's alert are unaffected. This stops the form being used to flood someone's inbox and stays inside Gmail's free sending allowance.
- **Email status.** Each email column reads Sent, Not sent (will retry), Failed (gave up after 5 tries), or Not needed.
- **Retries.** An email failure never undoes the row. A trigger runs every 15 minutes and retries Not sent emails, up to 5 tries.
- **Morning reminder.** Every day at 9am Toronto time, Mann gets one email if any Bookings or Quotes row is still Received more than 2 hours after arriving, or any email has Failed. It lists those rows with links. No email is sent when there's nothing to report.

### Failure on the site

- When the script can't be reached or doesn't confirm, the site keeps today's behaviour. It shows the failure message, links to text or email the request with details filled in, and lets the customer try again.
- A retry reuses the reference and attempt ID.
- The retry sentence becomes: "Or try again: it keeps the same reference, NR-AB12, so if both reach us, Mann will match them up as one request." This is true for both providers.

### Privacy wording

`tools/build.mjs` picks the wording from the provider:

- **formsubmit:** today's text.
- **sheet:** "Your request is saved to our Google Sheet and emailed to our Gmail inbox (both Google), which may store data outside Canada." The Privacy page's FormSubmit entry is replaced by a Google Sheets and Gmail entry, which says the automatic receipt only confirms that the request arrived.

### Testing Part 1

- **Script tests** (`tools/qa/sheet.test.mjs`) load `Code.gs` in Node with stand-ins for SpreadsheetApp, LockService, MailApp, PropertiesService, ContentService, ScriptApp, Session and Utilities. They cover:
  - save;
  - duplicate attempt;
  - reference clash;
  - missing fields;
  - spam trap;
  - formula escape;
  - a new label adding a column;
  - receipts carrying no submitted text, and the one-per-hour and 50-a-day limits;
  - mail failure keeping the row, then the retry sending it;
  - giving up after 5 tries;
  - the morning reminder (sent or silent);
  - Setup run twice.
- **Site tests** answer `script.google.com` locally, the same way FormSubmit is answered today. They cover:
  - success shows the returned reference, including a clash reference;
  - each failure kind never shows "received";
  - retries send the same attempt;
  - the privacy text follows the provider.

---

## Part 2: website changes

### Price box (R04)

On the homepage, pricing, service and area pages:

- **Founding offer on:**
  - The large number is the first-visit price, followed by "first visit".
  - Below it: "Regular price $175 · estimate, about 2 hours on site".
- **Offer off:** the large number is the regular price, with "Estimate · about 2 hours on site".
- The offer pill, links and buttons are unchanged.
- The booking form's own summary is unchanged.

### Check your clean (R05)

- Two new rows, with Edit buttons that open step 3 and focus the matching control:
  - **Pets**, after Getting in. Shows the chosen option; Edit focuses the checked pets option.
  - **Notes**, after Products. Shows the text, or "None"; Edit focuses `#f-notes`.
- Notes show as plain text and never as HTML. Over 200 characters, they are cut at a word and end in "…".
- Neither value goes to analytics.

### Large-home handoff (R03)

- **Leaving the booking form.** The "Get a Residence Care quote" link goes to `services/residence-care/?from=booking`. Before it leaves, the booking form saves this to `sessionStorage` key `nr-quote-handoff`, together with the time:
  - service and home type, with bedrooms and bathrooms;
  - the ticked unusual-home checks;
  - extras;
  - how often;
  - the postal code from step 1.
- **Opening the quote form.** Only when the address has `from=booking` and the saved handoff is under 30 minutes old, the quote form:
  - fills **Postal code**;
  - sets **How often**: one-time, or a non-recurring service, gives "One time to start"; weekly gives "Weekly"; every 2 weeks gives "Every 2 weeks"; every 4 weeks gives "Monthly";
  - writes a **Notes** line starting "From the booking form:" with the service, rooms, ticked checks and extras. The customer can edit it.
- **Clean-up.** The handoff is deleted once read.
- **Never applied:** on a direct visit, on an old handoff, or when storage is blocked. In each case the form opens blank and still works.
- **Nothing in the page address** beyond `from=booking`. The old `?notes=` link is no longer made or read.

### Quote form choices

- Every dropdown in the Residence Care, office and realtor forms starts on "Choose one", with an empty value.
- One left on "Choose one" is sent as "Not chosen".
- Dropdowns stay optional.
- A handoff value, such as How often, replaces "Choose one".

### Wording

- Booking confirmation label: "Request received · not confirmed yet". The page heading becomes "Request received".
- Retry sentence: as in Part 1.

### Testing Part 2

Browser tests for each item:

- **Price box:** offer on and offer off, with the offer switched off by overriding the config in the test.
- **Pets and Notes rows:** HTML in notes shows as text; long notes are shortened; Edit focuses the right control.
- **Handoff:**
  - A move-out of a house over 3,000 sq ft, with half baths and pets, carries the postal code, "One time to start" and the ticks.
  - A direct visit stays blank.
  - An expired handoff is ignored.
  - Blocked storage is harmless.
  - The address contains no details.
- **Dropdowns:** they start on "Choose one", and an untouched one is sent as "Not chosen".
- **Confirmation:** the new label.

---

## Part 3: phone and accessibility checks (R07)

New automated checks, added to `tools/qa`:

- **Bigger text.**
  - Pages: home, pricing, deep cleaning, Willowdale, help and booking steps 1–3.
  - Text at 200%, at 390 px and at 1280 px wide.
  - Pass: no sideways scrolling, and every primary button is visible and clickable.
- **Keyboard only.** A full booking using only Tab, Shift+Tab, Space, arrow keys and Enter, from step 1 through to sending against the local stand-in. Every focused element shows a visible focus indicator, and none sits under the sticky bars. The existing check stays.
- **Announcements.**
  - The price box result and the booking total sit in polite live regions.
  - Each invalid field has `aria-invalid` and an `aria-describedby` pointing at its visible error.
  - The form error box is announced.
  - The new review rows are reachable by Tab.
- **Accessibility scan.**
  - Tool: axe-core 4.10.2, saved in `tools/qa/vendor` with its licence and used only by the tests.
  - Pages: home, pricing, a service page, an area page, help, booking steps 1–3, Residence Care and gift.
  - Both themes, at 390 px and 1280 px.
  - Any serious or critical result fails the check and gets fixed.
- **Stress cases.** A 5-bed, 4-bath house with every extra, plus a 60-character name and address. At 360 px, totals and review rows stay readable with no sideways scroll.
- **Existing checks** stay: six widths, 320 px (the same as 400% zoom), both themes, privacy and booking behaviour.

Not testable here: real phones, phone keyboards and autofill, VoiceOver and TalkBack. `docs/phone-checklist.md` gives Mann a 10-minute checklist for his own phone: book to step 3, Text me this price, the Residence Care handoff, dark mode, and VoiceOver or TalkBack reading the price box and the review.

---

## Global constraints

- Brand, colours, type and layout stay as merged in PR #13, except the price box and review rows above.
- No invented reviews, photos, ratings or people.
- No personal details (name, phone, email, address, postal code, notes, referrer) in analytics payloads or page addresses.
- Every existing test keeps passing. The perf check stays under its limits: LCP 2.2s or less and CLS 0.05 or less.
- `node tools/build.mjs` regenerates every page; generated HTML is committed.
- Before merge: screenshots and a clickable preview for the owner.

## Delivery

One branch, one pull request. Merging is safe before the sheet exists, because the provider stays `formsubmit` until Mann's script address is added. The owner gets the setup guide, the phone checklist and a clickable preview at the end.
