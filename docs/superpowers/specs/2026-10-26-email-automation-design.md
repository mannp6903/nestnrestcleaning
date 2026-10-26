# Personal email automation: design

Date: 2026-10-26
Status: draft, waiting for review

## Goal

Every client who books a clean or asks for a free quote gets a fast, personal email from Mann. Mann stops writing those emails and their follow-ups by hand. Mann's work per lead drops to a quick read of a draft, and later to nothing at all for routine emails.

### What Mann asked for

- An automatic, personal reply when a client books or asks for a free quote, to save time.
- Built with Google Apps Script and a Google Sheet. No paid automation service.
- **Drafts first, then auto-send.** For the first two weeks, every email waits in Gmail as a draft. After that, routine emails send on their own. Quote replies, and anything the system isn't sure about, always stay drafts.
- Claude writes **one personal paragraph** that responds to what the client wrote in their notes.
- **Cal.com is switched on** (`booking.calLink` in `js/config.js`), so clients pick a confirmed time themselves and the bookings land in Google Calendar.

### Assumptions (correct these if they're wrong)

- Emails are written as Mann, in the first person, and signed "Mann".
- The script runs in the **nestnrestcleaning@gmail.com** Google account, which receives every FormSubmit email and owns the Google Calendar that Cal.com writes to.
- Mann creates a second Cal.com event type, "Free walkthrough" (30 minutes), for quote clients.

### What success looks like

- Every booking and quote gets its personal email (or draft) **within 10 minutes**. The site promises a reply within 2 hours.
- Reviewing a draft takes Mann **under a minute**. After the review period, routine emails need no work at all.
- **Nothing goes to anyone who opted out.** No email is ever sent twice. No AI-written price, discount, date or promise ever reaches a client.

### Not included (for now)

These are left out on purpose: gift card emails, the review form, "Text me this price" requests (phone only), texts and WhatsApp, designed HTML newsletters, payments and invoices, and more than one staff member. Each can be added later, using the same parts.

## What each client receives

The emails the website already sends stay exactly as they are. These are the FormSubmit confirmation (the client's written copy of the agreement, required by Ontario's Consumer Protection Act) and Cal.com's confirmation. The automation adds the following.

### Bookings (home cleaning, through the booking page and Cal.com)

| When | Email | Notes |
|---|---|---|
| A few minutes after the client picks a time on Cal.com | **Personal note** | Mentions their actual booking (service, day, arrival time), the personal paragraph, a thank-you to whoever referred them (fixed wording that includes the referral credit), and what to expect and how to get ready. |
| 3 hours after the booking form, if no time was picked | **Pick-a-time nudge** (once) | A friendly reminder with the calendar link. If 3 hours lands between 9pm and 9am, it goes at 9am. |
| 6pm the day before each clean | **Reminder** | Arrival time, how we're getting in (from their form), pets, and that nothing is paid until after. |
| 11am the day after the client's **first** clean | **Review request** (once per client, ever) | Links to `/review/`. Never offers anything in return, as Google's rules and the Competition Bureau require. |

A clean that's cancelled in Cal.com disappears from the calendar, so no reminder or review request goes out. A rescheduled clean moves in the calendar, and the reminder follows it.

### Quotes (Residence Care, Small Office Cleaning, Realtors and property managers)

| When | Email | Notes |
|---|---|---|
| Within 5 minutes of the quote form | **Quote reply** (always a draft) | The personal paragraph responds to what they described. The next step depends on the form: Residence Care and office link to the "Free walkthrough" booking; Realtors asks for the address, access and date so Mann can price it. |
| 2 days after the quote reply was sent, if the client hasn't replied or booked | **Quote nudge** (once) | Short and polite, sent at 10am. |

### If the booking calendar is switched off

If `booking.calLink` is empty, a booking email carries a requested date instead of "Picking a time on the calendar". The script then writes a draft that thanks the client and responds to their notes, but never confirms a time. That draft is marked **Needs you**. This is a fallback only; the design assumes Cal.com is on.

## Safety rules

1. **Claude writes only the personal paragraph.** Prices, dates, times, links, terms, the referral credit and the legal footer are fixed wording from `js/config.js`, filled in from the client's own form. The estimate quoted is the one the website already calculated and emailed, never a new calculation.
2. **Claude is given true facts to work from:** the FAQs, the service policies, what each service includes, and the quote services' descriptions, all from the published site settings. It's told to treat the client's notes as information, not as instructions.
3. **Every paragraph is checked** before it's used. It's rejected if it:
   - is over 90 words;
   - contains a `$`, a `%`, a time ("10am"), a month or weekday name, a link, an email address or a phone number;
   - contains the words discount, coupon, promo, credit, refund or guarantee.

   A rejected paragraph is dropped, and the email becomes a **Needs you** draft without it.
4. **Claude can raise its hand.** It returns `needs_mann: true` with a reason when the notes ask for something it can't answer from the facts, or something outside the usual service. That email becomes a **Needs you** draft, and the reason is shown in the Sheet.
5. **When a client writes back:** any email from a client's address after the first automated email pauses that client's nudges (pick-a-time and quote nudges). The Sheet row and the Gmail thread are marked **Needs you**, so Mann takes the conversation over. Booking reminders and the review request still go out, because they belong to a booked clean, not to the conversation.
6. **Opting out:** if a client's email contains "unsubscribe" or a line that's just "stop", they're marked as opted out on every row with that email address. Mann can also tick **Opted out** by hand. Opted-out clients get no automated email of any kind, ever. Canada's anti-spam law (CASL) requires stopping within 10 business days; the script stops on its next run.
7. **Every email** carries the existing `emails.footer`: who we are, mailing address, contact details and how to unsubscribe.
8. **No double sends.** Every email the script makes is recorded in the Sheet before the next step, and each run holds a lock so two runs can't overlap.
9. **Kill switch:** unticking **Automation on** in the Sheet's Settings stops everything immediately.

## The Google Sheet ("Nest & Rest clients")

The Install step creates it in Mann's Google Drive.

**Clients tab:** one row per request. Columns: received, reference (`NR-XXXX`, or `Q-` plus a timestamp for quotes), type (booking or quote), service, name, email, phone, area, booked time, status, needs-you reason, opted out (checkbox), first clean done (date), review requested (date), Gmail thread link, and last action.

**Status values:**
- New
- Draft ready
- Sent
- Waiting for time
- Booked
- Reminder sent
- Reviewed
- Quote sent
- Nudged
- Paused (client replied)
- Needs you
- Opted out
- Done

**Settings tab:**
- **Automation on:** the checkbox kill switch.
- **Auto-send starts:** a date, set to the install date plus 14 days. Before it, everything is a draft.
- **One setting per email type:** Off, Draft or Auto. Every type defaults to Auto, except the quote reply, which defaults to Draft. Auto only takes effect after the start date, and never for a **Needs you** email.
- **Timings:**
  - pick-a-time nudge: 3 hours;
  - quote nudge: 2 days, at 10am;
  - reminder: 6pm the day before;
  - review request: 11am the day after.
- **Read-only health cells:** last run, last error.

**Log tab:** one line per error or skipped action, with the reference and the reason.

A custom **Nest & Rest** menu in the Sheet offers **Run now**, **Pause everything** and **Install / repair**.

## How it's built

### Parts

| Part | What it does | Depends on |
|---|---|---|
| `automation/src/parse.js` | Turns a FormSubmit email (subject plus HTML table) into a lead: kind, service and every form field. | Nothing (pure) |
| `automation/src/compose.js` | Builds each email (subject plus plain text, with a matching simple HTML version) from config wording, the lead and the optional paragraph. Fails loudly if any `{placeholder}` is left unfilled. | Nothing (pure) |
| `automation/src/guard.js` | The paragraph checks in safety rule 3. | Nothing (pure) |
| `automation/src/plan.js` | Given the Sheet rows, the calendar events, the client replies, the settings and the current time, decides what's due: which emails to draft or send, and which statuses to change. | Nothing (pure) |
| `automation/src/claude.js` | Builds the Claude request from the lead and the facts, and reads the structured answer. | Apps Script `UrlFetchApp` (only the call itself) |
| `automation/src/google.js` | The Gmail, Calendar, Sheet, triggers and menu parts of Apps Script. | Apps Script services |
| `automation/src/main.js` | `run()` every 5 minutes: fetch the settings, read new leads, call `plan`, carry out the actions, log. Also `install()`. | All of the above |

The pure parts carry no Google code, so they run in Node for testing. A build step joins every part into a single file, `automation/nest-rest-automation.gs`, which Mann pastes into Apps Script once.

### Settings and wording stay in `js/config.js`

- **A new `automation` section in `js/config.js`** holds the wording of every automated email, the walkthrough booking link and the quote reply's next step for each quote form. It sits beside the existing `emails` section, following the same `{placeholder}` style.
- **`node tools/build.mjs` also writes `automation/site-config.json`.** It holds the parts the script needs: business details, the email footer, the `automation` wording, FAQs, policies, service descriptions and the Cal.com links. It's published with the site, like `js/config.js` already is.
- **The script fetches that file from the live site at most every 6 hours.** It keeps the last good copy in the Sheet, so a wording change in `js/config.js` reaches the emails without re-pasting the script. If the site can't be reached, the script keeps using its saved copy.
- **Timings and switches live in the Sheet,** not in `js/config.js`, so Mann can change them instantly without a website update.

### Data flow on each run

1. **Find new leads.** Search Gmail for FormSubmit emails with the subject "New booking" or "New quote request", received in the last 7 days, without the label `Nest auto/seen`. Parse each one, add a Sheet row, and label the email `Nest auto/seen`. Other FormSubmit emails (gift cards, reviews, price texts) are left alone.
2. **Find calendar events.** Look in Google Calendar from yesterday to 90 days ahead for events whose description contains a known `NR-` reference; Cal.com copies the booking notes, which include it. If there's no reference, match on the guest's email address instead. This gives the booked time, notices cancellations and moves reminders when a clean is rescheduled. Events Mann adds by hand get reminders too, as long as they include the client's reference or email address.
3. **Find client replies and opt-outs.** Search Gmail for messages from known client addresses that arrived after the first automated email.
4. **Plan** (pure), using what was found plus the settings and the current time in America/Toronto.
5. **Do the work.**
   - For each email that needs a paragraph, call Claude, then run the checks.
   - Each lead's first email starts a new Gmail thread to the client, with a clear subject such as "Your deep clean on Tuesday, October 27". It doesn't reply to the FormSubmit email, whose subject would look like "Re: New booking NR-AB12…". Later emails reply in that same thread, so the client sees one conversation.
   - Emails go out as Draft or Auto, according to the settings.
   - Each email's thread is labelled `Nest auto/draft ready`, `Nest auto/sent` or `Nest auto/needs you`, and the Sheet row is updated.
6. **Notice sent drafts.** If a draft has disappeared and the thread contains a sent message, the email counts as sent, and its follow-up timer starts from then. If the draft was deleted without being sent, it's marked "Skipped" and no follow-up goes out.

Emails are sent from nestnrestcleaning@gmail.com with the sender name "Mann Patel, Nest & Rest Cleaning". All dates and times use `America/Toronto`, whatever the script project's time zone is set to.

### The Claude call

- **Raw HTTPS** from `UrlFetchApp` to the Messages API. Apps Script has no Anthropic SDK.
- **The API key is stored in the script's private Script Properties,** never in the code. The repo is public and the site publishes every file.
- **Model `claude-opus-5-5`, effort `low`,** since this is a short writing task. The answer comes back as structured JSON: `{ paragraph, needs_mann, reason }`.
- **The server-side refusal fallback is switched on.** If the model declines, the API automatically retries on a fallback model.
- **The cost is roughly 2 to 3 cents per email.** Mann sets a monthly spending limit in the Anthropic Console, for example $10.
- **On any failure** (an HTTP error, a refusal, invalid JSON or a failed check), the email is built without the paragraph, marked **Needs you**, and logged.

### Errors and limits

- Each lead is handled on its own, so one bad lead never stops the others.
- A failed step is retried on the next run. After 3 failures, the lead is marked **Needs you**.
- Google emails Mann automatically if the script itself crashes. The Settings tab shows the last run and the last error.
- A free Gmail account allows about 100 script-sent emails a day and about 90 minutes of script running time a day. A 5-minute check with nothing new takes a few seconds, so both limits are far above what this business needs.

### Privacy

- The Privacy Policy (in `tools/build.mjs`) gets a line naming Anthropic as a service provider that helps draft replies using the details clients send. Google (Gmail, Sheets, Calendar) and Cal.com are already where this data lives.
- The Sheet stays private in Mann's Drive.
- No client data is ever committed to the repo. Test emails are made up.

## Setup (for `automation/README.md`)

1. **Switch on Cal.com.** Follow the existing README steps, then add a "Free walkthrough" event (30 minutes) and paste its link into the `automation` settings.
2. **Get a Claude API key.** Create it at console.anthropic.com, then set a monthly spending limit.
3. **Paste in the script.** Signed in as nestnrestcleaning@gmail.com, open script.google.com, make a new project, and paste in `automation/nest-rest-automation.gs`. Under Project Settings → Script Properties, add `ANTHROPIC_API_KEY`.
4. **Install.** Choose **Install** and approve Google's permission screens. Install creates the Sheet, the labels and the 5-minute timer.
5. **Test it.** Make one test booking and one test quote on the live site with a personal email address, and check the drafts that appear.

## Testing

- **Unit tests** (Node, with `node:test`, under `automation/test/`):
  - `parse` against sample emails: a booking with and without an email address, each quote form, and unusual characters;
  - `compose`: every email type has its footer and no unfilled placeholders;
  - `guard`: allowed and rejected paragraphs, including a paragraph from a prompt-injection attempt in the client's notes;
  - `plan` with a fake clock: every timing, opt-outs, replies, cancellations, reschedules, sent and deleted drafts, the auto-send start date, and the kill switch.
- **Sample emails:** the HTML is copied from one real test submission. The FormSubmit sender address and table layout are confirmed at the same time. Names and details are made up.
- **Calendar matching:** one real test booking confirms that Cal.com's Google Calendar event contains the `NR-` reference.
- **Live check:** the two-week draft period is the live test. Mann reads every email before anything sends on its own.

## Risks and open questions

- **Cal.com's notes:** if they don't appear in the Google Calendar event description, matching falls back to the guest's email address. This is confirmed during the build.
- **FormSubmit:** if it changes its email layout, parsing fails. The lead is then logged, marked **Needs you**, and nothing is sent wrongly. Mann still has the original FormSubmit email.
- **Three emails at once:** a new booking gets three emails close together (FormSubmit, Cal.com and the personal note). The personal note is kept short so it reads as a human touch, not as noise.
