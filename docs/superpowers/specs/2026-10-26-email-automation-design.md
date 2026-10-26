# Personal email automation: design

Date: 2026-10-26
Status: revised (the website's forms now go straight to the Google script, replacing FormSubmit), waiting for review

## Goal

Every client who books a clean or asks for a free quote gets a fast, personal email from Mann. Mann stops writing those emails and their follow-ups by hand. Mann's work per lead drops to a quick read of a draft, and later to nothing at all for routine emails.

### What Mann asked for

- An automatic, personal reply when a client books or asks for a free quote, to save time.
- Built with Google Apps Script and a Google Sheet. No paid automation service.
- **The website's forms send straight to the Google script,** replacing FormSubmit. The forms, prices and booking flow look and work exactly as they do now.
- **Drafts first, then auto-send.** For the first two weeks, every personal email waits in Gmail as a draft. After that, routine ones send on their own. Quote replies, and anything the system isn't sure about, always stay drafts.
- Claude writes **one personal paragraph** that responds to what the client wrote in their notes.
- **Cal.com is switched on** (`booking.calLink` in `js/config.js`), so clients pick a confirmed time themselves and the bookings land in Google Calendar.

### Assumptions (correct these if they're wrong)

- Emails are written as Mann, in the first person, and signed "Mann".
- **The script runs in the nestnrestcleaning@gmail.com Google account.** That account receives the website's forms, sends every email, and owns the Google Calendar that Cal.com writes to.
- Mann creates a second Cal.com event type, "Free walkthrough" (30 minutes), for quote clients.

### What success looks like

- **Instantly:** the client's confirmation email arrives, and Mann gets the new-request email, just as today.
- **Within 10 minutes:** every booking and quote gets its personal email (or draft). The site promises a reply within 2 hours.
- **Under a minute** for Mann to review a draft. After the review period, routine emails need no work at all.
- **No mistakes reach clients.** Nothing goes to anyone who opted out, no email is sent twice, and no AI-written price, discount, date or promise ever goes out.
- **No request is ever lost.** If the script can't take a request, the website shows the client its existing "email us instead" button, with their details filled in.

### Not included (for now)

These are left out on purpose:
- personal emails for gift cards, reviews and "Text me this price" requests (they still reach Mann's inbox, and gift card buyers still get their confirmation);
- texts and WhatsApp;
- designed HTML newsletters;
- payments and invoices;
- more than one staff member.

Each can be added later, using the same parts.

## How the website's forms reach the script

The script is published as a Google **web app**: a private web address that only accepts form requests. `js/config.js` gets `delivery.provider: "google"` and `delivery.endpoint: <that address>`, and every form on the site sends to it. That covers booking, the quote forms, gift cards, reviews and "Text me this price".

**When a request arrives, the script immediately:**
1. **Checks it:**
   - It must be one of the site's five forms, with sensible sizes.
   - The hidden spam trap the forms already have must be empty. If it isn't, the script quietly accepts and drops the request, as FormSubmit does.
   - No more than 30 requests an hour overall, 3 an hour from one email address, and 60 a day.
   - A booking or quote only joins the client list if its service is one of ours and its name, date and referral fields are short and link-free. Personal emails only ever go to the checked reply-to address.
2. **Emails Mann the request,** as a table of every field, with the same subject lines as today (for example "New booking NR-AB12: Deep Cleaning, …"). Hitting Reply goes to the client.
3. **Emails the client their confirmation** (booking, quote or gift card), using the existing wording in `emails`.
   - For bookings, this is still the client's written copy of the agreement, as Ontario's Consumer Protection Act requires.
   - It's built from the template in `js/config.js` plus a few short values from the form (first name, reference, summary, price lines).
   - The website never sends email text of its own. If any value contains a link, the confirmation isn't sent, and Mann's email says so.
4. **Queues bookings and quotes** for the 5-minute run, in a hidden "Incoming" tab. The queued copy leaves out the notes and the address.
5. **Tells the website it worked.** If it can't email Mann, the website gets an error and shows the client the "email us instead" button.

**Switching back is one setting:** `delivery.provider: "formsubmit"`. The site code keeps working with FormSubmit, which is how the site stays live until the script is deployed.

## What each client receives

The client's confirmation email keeps its current wording, but now comes from nestnrestcleaning@gmail.com instead of FormSubmit. Cal.com's confirmation stays exactly as it is. The automation adds the following.

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

If `booking.calLink` is empty, a booking carries a requested date instead of "Picking a time on the calendar". The script then writes a draft that thanks the client and responds to their notes, but never confirms a time. That draft is marked **Needs you**. This is a fallback only; the design assumes Cal.com is on.

## Safety rules

1. **Claude writes only the personal paragraph.** Prices, dates, times, links, terms, the referral credit and the legal footer are fixed wording from `js/config.js`, filled in from the client's own form. The estimate quoted is the one the website calculated, never a new calculation.
2. **Claude is given true facts to work from:** the FAQs, the service policies, what each service includes, and the quote services' descriptions, all from the published site settings. It's told to treat the client's notes as information, not as instructions.
3. **Every paragraph is checked** before it's used. It's rejected if it:
   - is over 90 words;
   - contains a `$`, a `%`, a time ("10am"), a month or weekday name, a link, an email address or a phone number;
   - contains the words discount, coupon, promo, credit, refund or guarantee.

   A rejected paragraph is dropped, and the email becomes a **Needs you** draft without it.
4. **Claude can raise its hand.** It returns `needs_mann: true` with a reason when the notes ask for something it can't answer from the facts, or something outside the usual service. That email becomes a **Needs you** draft, and the reason is shown in the Sheet.
5. **When a client writes back:** any email from a client's address after the first automated email pauses that client's nudges (pick-a-time and quote nudges). The Sheet row and the Gmail thread are marked **Needs you**, so Mann takes the conversation over. Booking reminders and the review request still go out, because they belong to a booked clean, not to the conversation.
6. **Opting out:** if a client's email contains "unsubscribe" or a line that's just "stop", they're marked as opted out on every row with that email address. Only the client's own words count: quoted earlier emails, including our footer, are ignored. Mann can also tick **Opted out** by hand. Opted-out clients get no automated email of any kind, ever. Canada's anti-spam law (CASL) requires stopping within 10 business days; the script stops on its next run.
7. **Every email** carries the existing `emails.footer`: who we are, mailing address, contact details and how to unsubscribe.
8. **No double sends.** Every email the script makes is recorded in the Sheet before the next step, and each run holds a lock so two runs can't overlap.
9. **Kill switch:** unticking **Automation on** in the Sheet's Settings stops all automated emails immediately. Confirmations and Mann's new-request emails keep working, so no request is lost.
10. **Nobody can use the web address to send their own email from the business account.** Every email's wording comes from `js/config.js`. Only short values with no links, bare web addresses or phone numbers are filled in, and the request limits stop floods. Floods matter because a free Gmail account can send only about 100 emails a day. When fewer than 15 sends are left for the day, confirmations pause and personal emails wait as drafts, keeping the rest for Mann's new-request emails.
11. **Nothing sends on its own until the mailing address is set.** CASL requires it in every email; until `business.mailingAddress` is filled in, every personal email waits as a draft and Settings says why.
12. **The paragraph never claims what the business doesn't offer:** insurance, background checks, licences, eco-friendly or non-toxic products. It also never mentions relative days like "tomorrow", and long numbers (usually door codes) are removed from notes before Claude sees them.
13. **Opt-outs stick** across a client's later requests, and an "Opted out" tick Mann makes during a run is kept.
14. **Website text never becomes a live formula in the Sheet:** text starting with `=`, `+`, `-` or `@` is stored as plain text.
15. **Requests that never became bookings leave the Sheet after 12 months,** as the Privacy Policy promises. Opt-out records stay.

## The Google Sheet ("Nest & Rest clients")

Mann creates a blank Google Sheet with this name and opens Apps Script from inside it (Extensions → Apps Script). That ties the script to the Sheet, which is what lets the Sheet show a **Nest & Rest** menu. The Install step then sets up the tabs.

**Clients tab:** one row per request. Columns: received, reference (`NR-XXXX`, or `Q-` plus a timestamp for quotes), type (booking or quote), service, name, email, phone, area, booked time, status, needs-you reason, opted out (checkbox), first clean done (date), review requested (date), last action, and a link to the last automated email.

**Mann can edit two of those columns: "Needs you" and "Opted out".** Clearing "Needs you" tells the script Mann has dealt with it. Every other column is rewritten by the script.

**The Sheet never stores a client's notes or address.** Notes can contain lockbox or door codes, and the Privacy Policy promises to delete those within days. The new-request email to Mann holds the full request, as FormSubmit's email does today. When the script needs the notes to write the personal paragraph, it reads them from that email.

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
- **Auto-send starts:** a date, set to the install date plus 14 days. Before it, every personal email is a draft.
- **One setting per email type:** Off, Draft or Auto. Every type defaults to Auto, except the quote reply, which defaults to Draft. Auto only takes effect after the start date, and never for a **Needs you** email.
- **Timings:**
  - pick-a-time nudge: 3 hours;
  - quote nudge: 2 days, at 10am;
  - reminder: 6pm the day before;
  - review request: 11am the day after.
- **Read-only health cells:** last run, last error.

**Log tab:** one line per error, refused request or skipped action, with the reference and the reason.

**Hidden tabs:** "Incoming" (requests waiting for the next run) and "Config" (the last good copy of the site settings).

A custom **Nest & Rest** menu in the Sheet offers **Run now**, **Pause everything** and **Install / repair**.

## How it's built

### Parts

| Part | What it does | Depends on |
|---|---|---|
| `automation/src/intake.js` | Checks a form request, applies the request limits, and builds Mann's new-request email, the client's confirmation email and the queued Incoming record. | Nothing (pure) |
| `automation/src/parse.js` | Reads the request table in Mann's new-request email, and turns a queued Incoming record into a lead. | Nothing (pure) |
| `automation/src/compose.js` | Builds each personal email (subject plus plain text, with a matching simple HTML version) from config wording, the lead and the optional paragraph. Fails loudly if any `{placeholder}` is left unfilled. | Nothing (pure) |
| `automation/src/guard.js` | The paragraph checks in safety rule 3. | Nothing (pure) |
| `automation/src/time.js` | Toronto dates and times (including the November daylight-saving change) and the "Tuesday, October 27" and "10am" formats. | Nothing (pure; the time-zone lookup is passed in) |
| `automation/src/sheet.js` | Turns leads into Sheet rows and back, reads the Settings tab, and works out each row's status. | Nothing (pure) |
| `automation/src/plan.js` | Given the leads, the calendar events, the client replies, the settings and the current time, decides what's due: which emails to draft or send, and which statuses to change. | Nothing (pure) |
| `automation/src/claude.js` | Builds the Claude request from the lead and the facts, and reads the structured answer. | Nothing (pure; the call goes through `env.http`) |
| `automation/src/main.js` | `receive()` for each form request, `run()` every 5 minutes, and `install()`. | All of the above, through an `env` object |
| `automation/src/google.js` | Connects `env` to Gmail, Calendar, Sheets, the web cache and triggers. Holds `doPost` (the web app), the menu and the entry points. | Apps Script services |
| `js/site.js` | `send()` posts to the Google web app when `delivery.provider` is `"google"`. Each form adds its form name and its confirmation values. | The browser |

The pure parts carry no Google code, so they run in Node for testing. A build step joins every part into a single file, `automation/nest-rest-automation.gs`, which Mann pastes into Apps Script.

### Settings and wording stay in `js/config.js`

- **A new `automation` section in `js/config.js`** holds the wording of every automated email, the walkthrough booking link and the quote reply's next step for each quote form. It sits beside the existing `emails` section, following the same `{placeholder}` style.
- **The confirmation emails keep their wording in `emails`,** with a subject line for each added in `emails.subjects`.
- **A switch, `automation.aiReplies`,** turns the Claude paragraph on or off. The Privacy Policy's Anthropic line appears only while it's on. With it off, emails have no personal paragraph, and an email whose client wrote notes becomes a **Needs you** draft.
- **`node tools/build.mjs` also writes `automation/site-config.json`.** It holds the parts the script needs: business details, the email footer, the confirmation and `automation` wording, FAQs, policies, service descriptions and the Cal.com links. It's published with the site, like `js/config.js` already is.
- **The script fetches that file from the live site at most every 6 hours.** It keeps the last good copy in the Sheet, so a wording change in `js/config.js` reaches the emails without re-pasting the script. If the site can't be reached, the script keeps using its saved copy.
- **Timings and switches live in the Sheet,** not in `js/config.js`, so Mann can change them instantly without a website update.

### Data flow on each 5-minute run

1. **Take new leads** from the Incoming tab, add a Clients row for each, and clear the rows taken.
2. **Find calendar events.** Look in Google Calendar from 2 days ago to 90 days ahead for events whose description contains a known `NR-` reference; Cal.com copies the booking notes, which include it. If there's no reference, match on the guest's email address instead; an event made after a booking request also counts as that request's booking, so a client who trims Cal.com's notes still gets their personal note. Events whose title contains "walkthrough" are quote walkthroughs, not cleans: they get no reminder, and they stop the quote nudge. This gives the booked time, notices cancellations and moves reminders when a clean is rescheduled. Events Mann adds by hand get reminders too, as long as they include the client's reference or email address.
3. **Find client replies and opt-outs.** Search Gmail for messages from known client addresses that arrived after the first automated email.
4. **Plan** (pure), using what was found plus the settings and the current time in America/Toronto.
5. **Do the work.**
   - For each email that needs a paragraph, read the notes from Mann's new-request email, call Claude, then run the checks.
   - Every automated email is its own new email to the client, with a clear subject of its own, such as "Your deep cleaning on Tuesday, October 27" or "See you tomorrow, Priya".
   - Later emails don't reply inside the first one's conversation. Apps Script can only reply to the sender of a message, and in our own conversation the sender is us, so a reply would come back to Mann. Separate reminder and review emails are normal for a business anyway.
   - Emails go out as Draft or Auto, according to the settings.
   - Each email's thread is labelled `Nest auto/draft ready`, `Nest auto/sent` or `Nest auto/needs you`, and the Sheet row is updated.
6. **Notice sent drafts.** If a draft has disappeared and the thread contains a sent message, the email counts as sent, and its follow-up timer starts from then. If the draft was deleted without being sent, it's marked "Skipped" and no follow-up goes out.

Emails are sent from nestnrestcleaning@gmail.com. Personal emails use the sender name "Mann Patel, Nest & Rest Cleaning"; Mann's new-request emails use "Nest & Rest website". All dates and times use `America/Toronto`, whatever the script project's time zone is set to.

### The Claude call

- **Raw HTTPS** from `UrlFetchApp` to the Messages API. Apps Script has no Anthropic SDK.
- **The API key is stored in the script's private Script Properties,** never in the code. The repo is public and the site publishes every file.
- **Model `claude-opus-5-5`, effort `low`,** since this is a short writing task. The answer comes back as structured JSON: `{ paragraph, needs_mann, reason }`.
- **The server-side refusal fallback is switched on.** If the model declines, the API automatically retries on a fallback model.
- **The cost is roughly 3 cents per client.** Only the personal note and the quote reply call Claude, about once per client. The nudges, reminders and review requests use fixed wording and cost nothing. 50 clients a month comes to about $1.50.
- **The API account is separate from Mann's Claude subscription.** It's created at console.anthropic.com with any email address (the business email is a natural fit) and paid for with prepaid credit, starting at about $5. Mann sets a monthly spending limit there, for example $10.
- **Everything else is free:** Google Apps Script, Gmail, Sheets and Calendar on a free Gmail account, Cal.com's free plan, and GitHub Pages. FormSubmit is no longer needed.
- **On any failure** (an HTTP error, a refusal, invalid JSON or a failed check), the email is built without the paragraph, marked **Needs you**, and logged.

### Errors and limits

- Each lead is handled on its own, so one bad lead never stops the others.
- A failed step is retried on the next run. After 3 failures, the lead is marked **Needs you**.
- Google emails Mann automatically if the script itself crashes. The Settings tab shows the last run and the last error.
- **A free Gmail account allows about 100 script-sent emails a day,** and about 90 minutes of script running time a day.
  - Each new client uses about 3 emails on their first day: Mann's new-request email, their confirmation and their personal note.
  - That leaves room for about 30 new clients a day.
  - A 5-minute run with nothing new takes a few seconds.

### Privacy

- **The Privacy Policy and the note under each form** (in `tools/build.mjs`) follow `delivery.provider`:
  - with `"google"`, FormSubmit is removed;
  - Google's line says it provides the email, calendar and spreadsheet, and runs the program that receives the forms and sends confirmations.
- **The Anthropic line** names Anthropic as a service provider that helps draft replies. It appears while `automation.aiReplies` is on.
- **The Sheet stays private in Mann's Drive,** and holds no notes or addresses.
- **What Claude receives:** only the client's first name, the service, the form choices (such as home size, pets and surfaces) and their notes. Never their email address, phone number, address or postal code.
- **No client data is ever committed to the repo.** Test data is made up.

## Setup (for `automation/README.md`)

1. **Switch on Cal.com.** Follow the existing README steps, then add a "Free walkthrough" event (30 minutes) and paste its link into the `automation` settings.
2. **Get a Claude API key.** Sign up at console.anthropic.com (with the business email, or any other), add about $5 of credit, set a monthly spending limit, and create an API key.
3. **Publish the website,** so the script can read `automation/site-config.json`. The forms keep using FormSubmit for now.
4. **Paste in the script.** Signed in as nestnrestcleaning@gmail.com:
   - make a blank Google Sheet named "Nest & Rest clients";
   - open Extensions → Apps Script, and replace the starter code with `automation/nest-rest-automation.gs`;
   - under Project Settings → Script Properties, add `ANTHROPIC_API_KEY`.
5. **Install.** Reload the Sheet, choose **Nest & Rest → Install / repair**, and approve Google's permission screens. Install sets up the tabs, the labels and the 5-minute timer.
6. **Deploy the web app.** In Apps Script, choose Deploy → New deployment → Web app, with "Execute as: Me" and "Who has access: Anyone". Copy the web app URL.
7. **Switch the forms over.** In `js/config.js`, set `delivery.provider` to `"google"` and `delivery.endpoint` to that URL. Run `node tools/build.mjs` and publish.
8. **Test it.** On the live site, with a personal email address, make one test booking, one test quote and one gift card request. Check:
   - Mann's new-request emails;
   - the confirmations;
   - the Sheet rows;
   - the drafts that appear.

**Updating the script later:** paste the new file, then choose Deploy → Manage deployments → Edit → Version: New version → Deploy. The web address stays the same.

## Testing

- **Unit tests** (Node, with `node:test`, under `automation/test/`):
  - `intake`: valid and invalid requests for each form, the spam trap, the request limits, values with links, the confirmation wording for each template, and that a new-request email read back by `parse` gives the same fields;
  - `compose`: every email type has its footer and no unfilled placeholders;
  - `guard`: allowed and rejected paragraphs, including a paragraph from a prompt-injection attempt in the client's notes;
  - `plan` with a fake clock: every timing, opt-outs, replies, cancellations, reschedules, sent and deleted drafts, the auto-send start date, and the kill switch;
  - `main` against an in-memory stand-in for Google: requests in, emails out, runs and installs.
- **A browser test** (Playwright, run against the built site) submits the booking and quote forms with `delivery.provider` set to `"google"` and checks what they send. It runs again with `"formsubmit"` to check nothing changed there.
- **Calendar matching:** one real test booking confirms that Cal.com's Google Calendar event contains the `NR-` reference.
- **The live web address:** the setup's test requests confirm that the browser accepts the Google web app's answer.
- **Live check:** the two-week draft period is the live test. Mann reads every personal email before anything sends on its own.

## Risks and open questions

- **The browser and Google's web app:** forms send as plain text, so the browser doesn't need extra permission first, and Google's answer is readable by the page. This is the usual way websites use Apps Script, and it's confirmed with the setup's test requests. If it ever fails, the client gets the "email us instead" button, and switching back to FormSubmit is one setting.
- **Cal.com's notes:** if they don't appear in the Google Calendar event description, matching falls back to the guest's email address. This is confirmed during the build.
- **Prices in the confirmation** come from the website's own calculation, as they do today. Someone tampering with the page could only change the figures in their own confirmation, and Mann sees the same figures in the new-request email.
- **Three emails at once:** a new booking gets three emails close together (the confirmation, Cal.com's and the personal note). The personal note is kept short so it reads as a human touch, not as noise.
