# Personal email automation

A small Google program (an Apps Script) that lives in a Google Sheet in the nestnrestcleaning@gmail.com account. Once it's set up:

- **The website's forms send to it** instead of FormSubmit. You still get an email for every booking, quote, gift card, review and "Text me this price" request, and clients still get their confirmation email, now sent from nestnrestcleaning@gmail.com.
- **Every booking and quote client gets a personal email from you:**
  - a reply to their booking request;
  - a short personal note confirming the day and time, once you've put the clean on your Google Calendar;
  - a reminder at 6pm the day before;
  - one review request after their first clean;
  - for quotes, a reply and one follow-up.
- **Claude writes one short paragraph** in each personal note and quote reply, answering what the client wrote in their notes. Everything else (prices, times, links, terms) is your own wording from `js/config.js`.
- **For the first two weeks, every personal email waits in Gmail as a draft** for you to read and send. After that, routine ones send themselves. Quote replies, and anything marked **Needs you**, always wait for you.

The design is in `docs/superpowers/specs/2026-10-26-email-automation-design.md`.

## What it costs

| | Cost |
|---|---|
| Google Apps Script, Gmail, Sheets, Calendar | Free |
| Claude API, for the personal paragraph | About 3 cents per client (about $1.50 for 50 clients a month) |

## Setup (about 30 minutes, once)

0. **Add your mailing address.** Put it in `business.mailingAddress` in `js/config.js` (a PO box or mailbox service is fine). Canada's anti-spam law (CASL) requires it in every business email. Until it's set, the script won't send any personal email on its own: everything waits as a draft, and **Last error** in Settings says why.

1. **Use your Google Calendar for confirmed cleans.** Bookings on the website are requests. When you've agreed a day and time with a client:
   - add the clean to the Google Calendar of nestnrestcleaning@gmail.com, at the arrival time;
   - add the client's email address as a guest (Google offers to email them the invitation, which is fine);
   - for a quote walkthrough, put the word "walkthrough" in the title, so the script doesn't treat it as a clean.

   The script then sends the personal note, the reminder and the review request from your calendar.

2. **Get a Claude API key.** This is separate from any Claude subscription.
   - Go to console.anthropic.com and sign up with any email (the business email is a good choice).
   - Add about $5 of credit under Billing.
   - Set a monthly limit, for example $10, under Limits.
   - Create an API key and keep it handy.

3. **Publish the website.** Run `node tools/build.mjs` and publish, so the script can read `automation/site-config.json` from the live site. The forms keep using FormSubmit for now.

4. **Make the Sheet and paste in the script.** Signed in to Google as **nestnrestcleaning@gmail.com**:
   1. Create a blank Google Sheet named **Nest & Rest clients**.
   2. Choose **Extensions → Apps Script**.
   3. Delete the starter code, and paste in the whole of `automation/nest-rest-automation.gs`. Click **Save**.
   4. Click the gear icon (**Project Settings**). Under **Script Properties**, add a property named `ANTHROPIC_API_KEY` whose value is your Claude API key.

5. **Install.**
   1. Go back to the Sheet and reload the page. A **Nest & Rest** menu appears.
   2. Choose **Nest & Rest → Install / repair**.
   3. Approve Google's permission screens. Google may warn that the app isn't verified: choose **Advanced → Go to (project name)**. It's your own script.
   4. Install sets up the tabs, the Gmail labels and a 5-minute timer.

6. **Deploy the web app** (this is what the website's forms send to).
   1. In Apps Script, choose **Deploy → New deployment**.
   2. Click the gear icon next to "Select type", and choose **Web app**.
   3. Set **Execute as: Me** and **Who has access: Anyone**, then click **Deploy**.
   4. Copy the **Web app URL**. It looks like `https://script.google.com/macros/s/…/exec`.
   5. Open that URL in a browser. You should see "Nest & Rest Cleaning forms: working."

7. **Switch the website's forms over.**
   1. In `js/config.js`, set `delivery` to `{ provider: "google", endpoint: "<the web app URL>" }`.
   2. Run `node tools/build.mjs`. The privacy notes and Privacy Policy update to match.
   3. Publish.

8. **Test it.** On the live site, using a personal email address:
   - **A test booking:**
     - you get the new-booking email;
     - your test address gets the confirmation;
     - within 5 minutes, a row appears in the **Clients** tab.
   - **A "Booking request reply" draft** appears in Gmail within 5 minutes.
   - **Put the test clean on your Google Calendar** with your test address as a guest: within 5 minutes, a "Personal note" draft appears.
   - **A test quote and a gift card request:** check the same emails arrive.
   - **In Settings:** **Automation on** is ticked.
   - **Opted out:** tick it on your test row, wait 10 minutes, and check it's still ticked.
   - **Phone notifications:** the new-booking email now comes from your own address. Check your phone told you about it. If it didn't, set the Gmail app's notifications for this account to **All**.
   - **If the site shows "email us instead":** set `delivery.provider` back to `"formsubmit"`, publish, and look at the **Log** tab.

## Day to day

- **Drafts:** personal emails waiting for you are in Gmail **Drafts**, labelled **Nest auto/draft ready**. Edit if you like, then send. If you delete one, that email is skipped.
- **Needs you:** the **Needs you** column (and the Gmail label **Nest auto/needs you**) says why something needs you. For example:
  - the client replied;
  - Claude wasn't sure how to answer their notes;
  - something failed.

  Deal with it, then clear the cell.
- **Opted out:** tick it for anyone who asks not to be emailed. Replies saying "unsubscribe" or "stop" tick it automatically.
- **Settings tab:**
  - **Automation on:** untick to pause all personal emails. Requests and confirmations keep working.
  - **Auto-send starts:** the date routine emails start sending themselves. Until then, everything is a draft.
  - **One row per email type:** **Off**, **Draft** (always wait for you) or **Auto**.
  - **Timings:** the quote follow-up and the reminder and review times.
  - **Last run and Last error:** show that it's working.
- **Log tab:** anything that went wrong or was refused, newest at the bottom.
- **Limits:**
  - The script takes up to 60 form requests a day, and 3 an hour from one email address. Beyond that, the website shows the "email us instead" button.
  - A free Gmail account sends to about 100 people a day. When fewer than 15 are left, confirmations pause and personal emails wait as drafts, so your new-request emails keep coming.

## Keeping it legal and private

- **"Confirmation not sent" at the top of a new-request email:** that client didn't get their written copy of the booking. Ontario's Consumer Protection Act expects them to have one, so reply with the details yourself.
- **Keep the Sheet and its Apps Script project private.** They hold client details and your Claude key. Don't share them with edit access.
- **Old requests:** the script removes requests that never became bookings from the Sheet after 12 months, as your Privacy Policy promises. Opt-out records stay, so those clients are never emailed again. Gmail keeps your new-request emails, so delete old ones too (search Gmail for `older_than:1y subject:"New quote request"`).
- **Door and lockbox codes:** if a client emails you one, delete it within 7 days of their last visit, as your Privacy Policy promises. The script never asks for codes by email, and strips long numbers from notes before Claude sees them.
- **Claude's paragraph:** read the drafts during the first two weeks. The paragraph is checked before use, and is thrown out (the email then waits for you) if it mentions:
  - a price, a date, a link or contact details;
  - promises like discounts or refunds;
  - claims your business doesn't make, such as insurance, background checks or eco-friendly products.
- **Out-of-date drafts:** if a booking is cancelled, delete its waiting draft.
- **Get advice:** have a lawyer look over your Privacy Policy and Service Policies, as the main README already suggests.

## Changing the wording

All the wording is in `js/config.js`:
- `automation` holds the personal emails;
- `emails` holds the confirmations and the footer.

After a change, run `node tools/build.mjs` and publish. The script picks up the new wording within 6 hours.

## Updating the script

When `automation/nest-rest-automation.gs` changes:
1. Paste the new file over the old one in Apps Script, and save.
2. Choose **Deploy → Manage deployments**, click the pencil, set **Version: New version**, and click **Deploy**.

The web app URL stays the same.

## Stopping it

- **To pause the personal emails,** choose **Nest & Rest → Pause everything** in the Sheet. New requests and confirmations keep working.
- **To stop using the script for the website's forms,** set `delivery.provider` back to `"formsubmit"` in `js/config.js`, then build and publish.

## For developers

- The source is in `automation/src/`, and Apps Script runs it all in one shared scope. `google.js` is the only part that touches Google.
- `node tools/build.mjs` joins the source into `automation/nest-rest-automation.gs`, and writes `automation/site-config.json`.
- Run the tests with `node --test automation/test/*.test.mjs`. The browser test of the website's forms runs where Playwright is installed.
