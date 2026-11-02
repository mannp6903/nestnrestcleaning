# Setting up your own operations stack

This guide takes you from an empty server to six working tools that sit behind nestnrestcleaning.com:

| Tool | What it does for you | Website setting |
|---|---|---|
| Easy!Appointments | Customers pick a confirmed time on a calendar inside the booking page. It syncs with Google Calendar and emails the confirmation | `booking.easyAppointments` |
| n8n | Catches the website's forms and connects the other tools | `delivery` |
| Invoice Ninja | Invoices, card payments through Stripe, a phone app | none (n8n drives it) |
| SMS Gateway for Android | Reminder and review texts sent from your business phone | none (n8n drives it) |
| Chatwoot | Website chat in one inbox, with a phone app | `chat` |
| listmonk | Seasonal offers, only to clients who ticked the box and confirmed | `newsletter` |

Apart from SMS Gateway, which runs on your phone, they all run on one small server you rent. The `server` setting tells the privacy policy where that server is.

Nothing on the live website changes until section 8. Today the new settings (`server`, `booking.easyAppointments`, `chat` and `newsletter`) are blank or off in `js/config.js`, and `delivery` still sends forms to FormSubmit. The site builds exactly as it does now until you change one of them. The sections are in the order you would normally do them, but see "What depends on what" first.

## What depends on what

- **The server comes first (section 1).** Every tool except SMS Gateway, which runs on your phone, installs on it.
- **n8n's "Website forms" recipe (section 5, Recipe 1) is the heart of it.** On its own it gives you a saved record of every request that doesn't depend on email. It needs only the server, n8n and your Gmail login. You can switch it on (section 8, `server` then `delivery`) before anything else is set up.
- **Easy!Appointments (2), chat (6) and offers emails (7) can follow in any order,** each with its own switch-on step in section 8.
- **Where one part needs another:**
  - Recipe 1's Invoice Ninja step (step 8) needs section 3's API token. Skip it for now and come back to it after section 3.
  - Recipe 1's listmonk step (step 9) needs section 7's list ID and API user. Skip it for now and come back to it after section 7.
  - Section 2's webhook step (step 10) needs the address from section 5, Recipe 2. Leave it until you reach that recipe.
  - Recipes 2, 3 and 4 send texts, so do section 4 (SMS Gateway) before them.
- **A suggested starting point:** section 1, then install n8n and build Recipe 1 without its Invoice Ninja and listmonk steps, then switch on `server` and `delivery` in section 8. After that, take the other tools one at a time, finishing each tool's section and its switch-on step before you start the next.

## Before you start

- **Install steps live in each tool's own guide.** This guide links to them and tells you what to choose, instead of copying commands that go out of date. Where it says "follow their guide", their page is the truth. If a step gets stuck, send Claude the page and what you see.
- **What you'll need:**
  - The login for wherever the web addresses of nestnrestcleaning.com are managed (your domain's DNS settings).
  - A card for the hosting company.
  - The Google account that owns nestnrestcleaning@gmail.com, for Gmail and Google Calendar.
  - A Stripe account, for card payments.
  - An Android phone (Android 5.0 or later) to be the business phone for texts.
  - A password manager, or somewhere equally safe, for every password and token below.
- **What goes in the website, and what never does.** `js/config.js` is sent to every visitor's browser, so anyone can read it. Only web addresses, service numbers and Chatwoot's website token go in it. The token is meant to be seen: it is how a visitor's browser connects to your chat, and it is not a password. Every password, API token and key stays inside the tool that uses it (for n8n, in its Credentials), and never goes in the website's files or in a message you send around.

## 1. Server and addresses

You rent one small server, give it five web addresses and make sure it is backed up.

1. **Rent the server.**
   - Choose a hosting company and rent one small server (sometimes called a VPS). Pick a Canadian region if the company has one, such as Toronto. The privacy policy will tell customers where it is.
   - Pick a size that suits five tools running together. Each tool's guide says what it needs. Easy!Appointments' [installation guide](https://github.com/alextselegidis/easyappointments/blob/main/docs/installation-guide.md) lists its needs under "What You Need".
   - Write down two things: the company's name and the city. They become `server.name` and `server.location` in section 8.
2. **Install Docker** on it, following Docker's own instructions for your server's system. Easy!Appointments, n8n, listmonk and Invoice Ninja all document installing with Docker, which keeps them tidy and separate.
3. **Create five web addresses.** In your domain's DNS settings, add one record for each address below, pointing at your server's address (your hosting company shows it).

   | Address | Tool |
   |---|---|
   | `book.nestnrestcleaning.com` | Easy!Appointments |
   | `n8n.nestnrestcleaning.com` | n8n |
   | `invoice.nestnrestcleaning.com` | Invoice Ninja |
   | `chat.nestnrestcleaning.com` | Chatwoot |
   | `mail.nestnrestcleaning.com` | listmonk |

   Leave the records that make nestnrestcleaning.com itself work as they are. The `mail.` address is where listmonk's confirm and unsubscribe pages live. It does not receive email.
4. **Put every address behind HTTPS** (the padlock). The website's settings for the booking calendar, form delivery and chat must start with `https://`, and the build stops if one doesn't. Use the same method for all five addresses so the certificates renew in one place. Each tool's guide says how to sit behind a reverse proxy. Easy!Appointments' guide has a "Behind a Reverse Proxy" section about a setting called `PROXY_IPS`.
5. **Turn on backups.**
   - Switch on the hosting company's automatic backups, nightly if they offer it.
   - Also keep a second copy of each tool's database somewhere other than this server.
   - Once, restore a backup somewhere to prove it works.
6. **Lock it down.** Turn on two-step verification for the hosting account and for every tool that offers it. Use a long, different password for each. The privacy policy tells customers you protect business accounts with strong passwords and two-step verification, so keep that true.

## 2. Easy!Appointments

This is the calendar customers see as the last step of booking. Their details reach you first, so you still get the lead if they leave. Then the calendar opens with their name, email, phone and address filled in, and the time they pick is confirmed straight away.

Easy!Appointments is the self-hosted alternative to Cal.com. Cal.com's own code has been closed since mid-April 2026. The open-source copy is [Cal.diy](https://github.com/calcom/cal.diy), whose README recommends it only for personal, non-production use. The site's existing `booking.calLink` option still works with Cal.com's hosted service. You fill in only one calendar, never both.

1. **Install it** at `book.nestnrestcleaning.com`, version 1.6.1 or newer.
   - Follow the [installation guide](https://github.com/alextselegidis/easyappointments/blob/main/docs/installation-guide.md) and the [Docker guide](https://github.com/alextselegidis/easyappointments/blob/main/docs/docker.md). The project is at [github.com/alextselegidis/easyappointments](https://github.com/alextselegidis/easyappointments).
   - Version 1.6.1 fixed showing the booking page inside other websites. Webhooks arrived in 1.5.0, and their secret token header in 1.5.1.
2. **Let it show inside your website.** The web server in front of Easy!Appointments must not send an `X-Frame-Options: DENY` or `X-Frame-Options: SAMEORIGIN` header, and must not send a `Content-Security-Policy` with a `frame-ancestors` that leaves out `https://nestnrestcleaning.com`. If the calendar doesn't appear inside the booking page later, check this first. A refused frame can still count as loaded, so the site's 10-second "open it in a new tab" message may not appear.
3. **Set up your business.** Sign in as the admin and open **Settings**.
   - **General Settings:** fill in Company Name, Company Email and Company Link (`https://nestnrestcleaning.com`). Set Default Timezone to Toronto.
   - **Business Logic:**
     - The working plan is the default for every provider. Set every day, 9am to 11pm, to match `opens`, `closes` and `openDays` in `js/config.js`.
     - Under "Allow Rescheduling/Cancellation Before", set Timeout (Minutes) to 1440, which is 24 hours. Easy!Appointments describes it as the time before which customers can book or re-arrange appointments. It matches your 24 hours' notice for free changes and is close to `booking.leadDays` (1 day). If you change `leadDays`, change this to match.
     - Set "Future Booking Limit" to 21 days, to match `daysAhead` in `js/config.js`.
   - **Booking Settings:** show the first name, last name, email, phone number, address and zip code fields, because the website fills these in. Turn on Customer Notifications. Easy!Appointments describes it as emailing the customer when their appointment's schedule changes.
   - **Legal Contents:** leave Data Retention Days at 0 (no automatic deletion) unless you've decided otherwise. The privacy policy says booking records are kept while someone is a client, then for as long as tax law requires.
4. **Make one service for each clean length.** Open **Services** and add services such as "Home clean, up to 3 hours", "up to 5 hours" and "up to 8 hours".
   - Set each one's **Duration (Minutes)** to match its length, and don't enter a price that could differ from your website's estimate.
   - The website picks the first service whose `upToHours` is at least the estimate's hours.
   - Set the **last** service's length to the longest clean that fits your working day (9am to 11pm is 14 hours, so no more than that). Any estimate longer than that is automatically sent to you as a request, with no calendar. The customer sees "Request received" and you arrange the time yourself.
   - The lengths 3, 5 and 8 hours are examples only. Use the lengths you want.
   - Test each service in step 6. If one shows no free times, make that service shorter.
5. **Add yourself as the provider.** Open **Providers**, add yourself, attach every service and check your working hours. Set your time zone to Toronto.
6. **Write down the numbers.** The website needs each service's number (its ID) for `services`, and your provider ID for `provider`.
   - To check a service, open `https://book.nestnrestcleaning.com/?service=1` in a browser. The page should open with that service chosen and show free times. Try 2, 3 and so on, and match them to your services.
   - Check your provider the same way with `?provider=1`.
   - If the page doesn't preselect them, you can read the numbers yourself once n8n is running (section 5). Make a one-box workflow with an **HTTP Request** box that does a GET to `https://book.nestnrestcleaning.com/index.php/api/v1/services` (and `/providers`) using the Easy!Appointments credential (the API token from step 11), then click **Execute step**. Easy!Appointments' [REST API page](https://github.com/alextselegidis/easyappointments/blob/main/docs/rest-api.md) lists both. Or ask Claude how to do it, without sharing your API token with it.
7. **Connect Google Calendar.** Follow the [Google Calendar page](https://github.com/alextselegidis/easyappointments/blob/main/docs/google-calendar-sync.md). In short: create a Google Cloud project and an OAuth client, type its details under **Settings, Integrations, Google Calendar**, then open **Calendar**, choose yourself and click **Enable Sync**. Each provider can link one Google calendar.
8. **Set up outgoing email**, so customers get their confirmation with the link to reschedule or cancel.
   - Easy!Appointments sends email using the file `application/config/email.php` on the server. By default it uses the server's own mail. The file has commented-out lines for an SMTP login (host, user, password, security and port) and for the From name and address. Fill them in using the details your email provider gives you for sending mail.
   - Set the From name to Nest & Rest Cleaning.
   - Step 9 tests it. Check your spam folder too.
9. **Test it.** Book a time yourself on `https://book.nestnrestcleaning.com`, using your own email.
   - Check the booking appears in your Google Calendar and the confirmation email arrives.
   - Open the link in that email to cancel the test booking.
10. **Webhook to n8n.** Leave this step until section 5, Recipe 2. It needs the address and secret token that recipe sets up, and the recipe tells you what to type here.
11. **Create an API token for n8n.** Open **Settings, Integrations, API** and set an API Token. n8n uses it as a bearer token to read appointments and customers. Keep it in n8n's Credentials only.

Before you switch the calendar on in section 8, read the Google Analytics note there.

## 3. Invoice Ninja

Invoice Ninja sends invoices and takes card payments. n8n creates your clients in it, and you use its phone app day to day.

1. **Install it.** Its README at [github.com/invoiceninja/invoiceninja](https://github.com/invoiceninja/invoiceninja) lists the ways to self-host (a server or virtual machine, Docker, Cloudron, Softaculous, Elestio and YunoHost) and links to its install guide. Choose the Docker option on your server, at `invoice.nestnrestcleaning.com`, and follow the guide the README points to.
2. **Know the terms.** The README says Invoice Ninja is released under the Elastic License (ELv2), and that a white-label licence removes its branding from client-facing screens. The README lists it at $40 a year. Check Invoice Ninja's own page for the current price before you decide.
3. **Enter your company details.** Use the company name, your name as owner, your email and your mailing address (the same one as `business.mailingAddress`), and add your logo from the `assets/` folder, in whichever format Invoice Ninja accepts.
4. **Leave HST off until you're registered.** The website charges no HST while `taxRate` is 0. Set up no tax rate in Invoice Ninja either. When you register, change both on the same day: `taxRate` to 0.13 in `js/config.js`, and the tax rate in Invoice Ninja.
5. **Connect Stripe for cards.** Stripe is the payment gateway the README recommends. Follow Invoice Ninja's instructions for adding Stripe, and make one small test payment before any customer sees a payment button. The website already tells customers they can pay by Interac e-Transfer, card or cash, after the clean.
6. **Install the phone app.** The README links the iPhone, Android and F-Droid versions. Follow Invoice Ninja's instructions for connecting the app to your own server.
7. **Create an API token** in Invoice Ninja's settings, following its documentation. n8n's "Invoice Ninja API" credential asks for the web address of your Invoice Ninja and this token. Put the token into n8n and nowhere else.

## 4. SMS Gateway for Android

This turns your business phone into the sender of reminder and review texts. The texts go from the phone's own number and SIM, so they use whatever texting your phone plan has.

1. **Pick the phone.** Customers will see this phone's number and can reply to it. The website keeps your personal number private today (`business.phone` is blank). If you want to keep it that way, use a separate business SIM. Keep the phone charged and connected.
2. **Install the app.** It needs Android 5.0 or later. The project's [README](https://github.com/capcom6/android-sms-gateway) links the app files on its Releases page. Follow it.
3. **Choose how n8n reaches the phone.**
   - **Local mode** sends to `http://<phone-ip>:8080/message` and only works if n8n can reach the phone's address on your own network. A server in a data centre usually can't.
   - **Cloud mode** sends to `https://api.sms-gate.app/3rdparty/v1/message`, so it works from your server. In cloud mode your texts travel through the SMS Gateway project's cloud service before they reach your phone. Today's privacy policy doesn't describe that, so if you choose cloud mode, tell Claude so the policy can be checked.
   - The README also describes a private server you can run yourself, for more privacy. It gives no setup steps for it, only a link to the project's own Private Server docs, which you would follow.
4. **Turn the mode on in the app and read off the login.** The app shows the username and password (Basic auth) for the mode you chose. In n8n, create a "Basic Auth" credential with them.
5. **Set the send rate limit.** The app can restrict how many messages it sends in a period, to avoid your phone company throttling you. The README advises against batch sending, so n8n sends reminders one at a time with a short pause between them (section 5).
6. **What n8n sends.** For each text, n8n makes a POST to the address for your mode, using that Basic auth login, with this body:
   `{ "textMessage": { "text": "..." }, "phoneNumbers": ["+1..."] }`
7. **Write every text to meet CASL.** Canada's anti-spam law covers business texts, even ones a customer asked for. Each text must say who you are, how to reach you and how to opt out. Use the three templates in the "Texts and emails you send yourself (CASL)" section of the [README](../README.md#texts-and-emails-you-send-yourself-casl). They carry the name, a link to your details and "Reply STOP to opt out".
   - Replies come to the phone's own messages, not into n8n or Chatwoot. Read them, and when someone opts out, note it and don't text them again.
   - Send review texts only to people you've cleaned for in the last two years, with no reward for a review.

## 5. n8n

n8n is the hub. You build workflows by joining boxes (n8n calls them nodes). This guide gives recipes box by box, not importable files, because a workflow can only be tested on your own n8n. The box names below are n8n's own.

1. **Install it** at `n8n.nestnrestcleaning.com`. The README at [github.com/n8n-io/n8n](https://github.com/n8n-io/n8n) has a Quick Start that links to n8n's Docker instructions. To look around on a computer, this starts n8n and forgets everything when you stop it:

   `docker run -it --rm -p 5678:5678 docker.n8n.io/n8nio/n8n`

   For the real thing on your server, follow n8n's Docker instructions. The README's own version of this command adds a volume (a saved folder), so your workflows survive restarts and updates.
2. **Tell n8n its public address and time zone.**
   - Set its public webhook address to `https://n8n.nestnrestcleaning.com` (the setting is `N8N_WEBHOOK_URL`; older versions call it `WEBHOOK_URL`). Otherwise the addresses it shows you will be wrong.
   - Set the time zone (`GENERIC_TIMEZONE`) to `America/Toronto`, so daily schedules run on Toronto time.
3. **Create the credentials.** In n8n's Credentials, add one for each of: Gmail (follow n8n's Gmail instructions), Invoice Ninja (address and API token from section 3), Easy!Appointments (a Bearer token, the API Token from section 2), SMS Gateway (Basic auth from section 4) and listmonk (Basic auth, section 7).
4. **Decide how long n8n keeps old runs.** n8n's run history holds what customers typed. By default it clears old runs by itself. The age is set by `EXECUTIONS_DATA_MAX_AGE` (in hours), so check its value in n8n's docs and tell Claude the number if you want the privacy policy to say it.
5. **Tell yourself when a workflow fails.** Make a small workflow starting with an Error Trigger that emails you, and choose it as the Error Workflow in each workflow's settings.
6. **Switching a workflow on.** n8n's Webhook node shows a Test URL and a Production URL. The Test URL works only while you click "Listen for test event". Real traffic uses the Production URL, which works only once the workflow is switched on (the Publish button, or Active in older versions).

### Recipe 1: Website forms

This is the workflow behind `delivery.endpoint`. The site sends every form to it: booking, quote, gift, review, pricetext and change.

What arrives in the Webhook box (in the box's data, as `body`):

| Field | What it is |
|---|---|
| `form` | `booking`, `quote`, `gift`, `review`, `pricetext` or `change` |
| `reference` | The request's reference, such as NR-XXXX |
| `attempt` | An id for this submission. A retry reuses it and `reference` |
| `honey` | A hidden spam trap. Real people leave it empty |
| `email` | The customer's email, or empty |
| `fields` | The labelled answers (`Name`, `Phone`, `Address`, `Postal code`, `Service` and so on) |
| `receipt` | The customer's receipt email text, only when they gave an email |

When the offers box is on, `fields` also has `Offers emails`. Its value is `Yes (ticked: "...")` or `No`.

Build it in this order. The first box is called **Webhook**, which is n8n's own name for it. If you rename it, use the new name wherever `Webhook` appears in an expression below.

**One rule for every box after the Webhook box.** From step 3 on, the data passing along the workflow is a saved row or the result of the box before it, not the request. So every box from step 3 on takes its values (`reference`, `attempt`, `email`, `fields`, `receipt` and `Offers emails`) from the Webhook box. Drag each value in from the Webhook box's output and n8n writes the expression for you, which looks like `{{ $('Webhook').item.json.body.reference }}`. Don't type `{{ $json.body.reference }}` into a box that comes after the save step: it would read the wrong data.

1. **Webhook.** Set HTTP Method to POST and Path to `forms`. Under Respond, choose "Using 'Respond to Webhook' Node". The Production URL ends in `/webhook/forms`, and it is the value for `delivery.endpoint`. n8n's webhooks answer the browser's preflight check themselves, so you add nothing for it.
2. **If `honey` is not empty,** it's a bot. Reply with the same body as in step 5 so the bot sees "success", then stop. Save and send nothing.
3. **Data table, Row, Get** (a data table is n8n's built-in saved table). Make a table named `requests` with columns `attempt`, `reference`, `form`, `email`, `details` and `received`, then look for a row whose `attempt` is this request's `attempt` (from the Webhook box). In the box's Settings, switch on "Always Output Data", so the workflow carries on when no row is found. Follow it with an **If** box that checks whether a row came back.
   - If a row came back, this is a repeat. The same request arrives more than once when a customer retries. Add a **Respond to Webhook** box on this branch with the body `{ "ok": true, "reference": "{{ $json.reference }}" }`, where `reference` is the saved row's reference, and stop. A repeat gets the reference saved for that attempt.
   - If no row came back, carry on.
4. **Data table, Row, Insert.** Save `attempt`, `reference`, `form`, `email`, the whole `fields` as text, and the date, all taken from the Webhook box. This is the saved record, and from here on the request is safe.
5. **Respond to Webhook.** Respond With JSON, and the body:
   `{ "ok": true, "reference": "{{ $('Webhook').item.json.body.reference }}" }`
   - Match `Webhook` to your first box's actual name.
   - The site counts a form as sent only when it gets a success reply (HTTP 2xx) with `ok` true and a reference. Anything else (an empty reply, text that isn't JSON, `ok` not true, an error) makes the site show "we couldn't confirm", and the customer can try again.
6. **Gmail, Send a message** to nestnrestcleaning@gmail.com. Take the form and reference from the Webhook box. Make the subject say the form and reference (for example "New booking NR-XXXX"), and list each label and answer from the Webhook box's `fields` on its own line, so it reads like the old emails.
7. **If `receipt` is not empty and `email` is a real address,** use **Gmail, Send a message** to that address. Take `email` and `receipt` from the Webhook box. Subject: "We got your request (reference NR-XXXX)". The message is the `receipt` text, unchanged and as plain text. It already carries the CASL footer.
   - Limit receipts the way the Google Sheet script does: at most one an hour to an address and 50 a day, using a second data table. This stops anyone using your server to flood an inbox.
8. **Invoice Ninja, Client, Create** for bookings. Skip this step until you've done section 3, then come back to it. First use **Get Many** to look for the same email, and create the client only if there's none. The customer's email is the Webhook box's top-level `email`, not something inside `fields`. Take the name, phone and address from the Webhook box's `fields`.
9. **If `Offers emails` starts with `Yes`,** add them to listmonk. Skip this step until you've done section 7, then come back to it. Use an **HTTP Request** box: POST to `https://mail.nestnrestcleaning.com/api/subscribers`, Basic auth with the listmonk credential, and this body:
   `{ "email": "<the email>", "name": "<the name>", "status": "enabled", "lists": [LIST-ID], "preconfirm_subscriptions": false }`
   - Take the email from the Webhook box's top-level `email`, and the name from its `fields`. `Offers emails` is also in `fields`.
   - `lists` is the number of your double opt-in list (section 7).
   - Keep `preconfirm_subscriptions` as `false`. If it's `true`, listmonk skips the confirmation email, and under CASL you may email only people who ticked the box and confirmed.

### Recipe 2: New booking from Easy!Appointments

This sends the confirmation text.

1. **Webhook.** POST, Path `booking-new`, Respond "Immediately". Under Authentication choose Header Auth and create a credential with the name `X-EA-Token` and, as its value, a long random secret that you make up now. Keep that secret in your password manager. Copy this box's Production URL.
2. **Add the webhook in Easy!Appointments.** This is the step section 2 asked you to leave until now.
   - Open **Settings, Integrations, Webhooks** and click **Add**.
   - Give it a name, such as "n8n new bookings". Paste the Production URL into the URL box.
   - Leave the Secret Header as `X-EA-Token` and type your secret into Secret Token.
   - Turn on the **Appointment Save** and **Appointment Delete** switches, leave **Verify SSL** on, and save.
   - Easy!Appointments then sends a POST with a JSON body holding `action` and `payload`, with your secret in that header.
3. **Send one test booking** and look at the run in n8n's Executions list. That shows you the fields the webhook really sends. Use the appointment's id to ask Easy!Appointments for the full record (next step), rather than relying on what the webhook includes.
4. **HTTP Request** GET `https://book.nestnrestcleaning.com/index.php/api/v1/appointments/<id>` with the Bearer token. Each appointment has `start`, `end`, `serviceId`, `customerId` and more. Then GET `/customers/<customerId>` for the name and phone.
5. **Send the text.** Make it from the README's "Confirming a booking" template (with its CASL wording), then POST it to SMS Gateway as in section 4. To turn "647 555 0123" into "+16475550123", use an expression like `{{ '+1' + $json.phone.replace(/\D/g, '').slice(-10) }}`, with the name of the phone field n8n shows for the customer.
6. **Handle repeats.** The webhook fires on every save, including changes. If you only want a text for new bookings, keep a data table of appointment ids already texted and skip those.

### Recipe 3: Daily reminders for tomorrow's cleans

1. **Schedule Trigger.** Every day at a time you choose, in Toronto time.
2. **HTTP Request** GET `https://book.nestnrestcleaning.com/index.php/api/v1/appointments` with the Bearer token. Results come in pages of 20 by default. The [REST API page](https://github.com/alextselegidis/easyappointments/blob/main/docs/rest-api.md) explains paging and searching.
3. **Keep only appointments whose `start` is tomorrow.** Cancelled appointments are removed from the schedule, so they won't be in the list.
4. **Loop Over Items** with a batch size of 1, so texts go one at a time. For each: GET the customer, send the reminder text as in Recipe 2, then add a **Wait** box. Start with a pause of about 30 seconds.

### Recipe 4: After a clean, the review link

1. Same shape as Recipe 3, but run in the evening and keep appointments whose `end` was today.
2. Send the README's "Asking for a review" template, which links to `nestnrestcleaning.com/review/`.
3. Switch the SMS box off while you check the list that would be texted. Switch it on once the list looks right.

## 6. Chatwoot

Chatwoot gives you website chat in one inbox, with a phone app. On the website, chat shows on every page except `/book/`. On a computer it's Chatwoot's usual bubble. On a phone, a "Chat" button joins the bar at the bottom of the screen.

1. **Install it** at `chat.nestnrestcleaning.com`. The README at [github.com/chatwoot/chatwoot](https://github.com/chatwoot/chatwoot) has a Deployment section pointing to Chatwoot's deployment pages and its environment variables. Follow them, and create your admin account.
2. **Add a website inbox.** In Chatwoot, add an inbox of type Website. Use nestnrestcleaning.com as the website. Chatwoot then gives you a **website token**.
3. **Keep the two values for `js/config.js`:**
   - `baseUrl`: `https://chat.nestnrestcleaning.com`
   - `websiteToken`: the token Chatwoot gave you.
   - To check the address, open `https://chat.nestnrestcleaning.com/packs/js/sdk.js` in a browser. The website loads Chatwoot's chat script from there, so you should see script text, not an error.
4. **Install the Chatwoot phone app** so you hear about new messages. Follow Chatwoot's help pages, linked from its README, for using the app with your own server.
5. **WhatsApp is optional.** Chatwoot can also bring WhatsApp into the same inbox. The website doesn't need it. Follow Chatwoot's own WhatsApp instructions if you want it, and tell Claude, so the privacy policy can be checked.
6. **Decide how long to keep chat conversations before you switch chat on.** The privacy policy has no line saying how long they are kept. Choose a period yourself, and ask Claude to add it to the policy. No period is chosen for you.
7. **What the privacy policy will say about chat:** that messages go to Chatwoot on your own server, and that the chat sets cookies whose names start with `cw_`, kept for up to a year.

## 7. listmonk

listmonk sends seasonal offers, only to people who ticked an unticked box on the booking form and then confirmed by email.

1. **Install it** at `mail.nestnrestcleaning.com`. Follow its [install page](https://github.com/knadh/listmonk/blob/master/docs/docs/content/installation.md) and the project at [github.com/knadh/listmonk](https://github.com/knadh/listmonk). The Docker option uses the image `listmonk/listmonk:latest`, which listens on port 9000. On first visit, create the Super Admin user.
2. **Fill in Settings.**
   - **General:** set Root URL to `https://mail.nestnrestcleaning.com` (no slash at the end), so confirm and unsubscribe links point to the right place. Set the 'From' address.
   - **SMTP:** enter the outgoing email details from your email provider, and send a test.
3. **Make the list.**
   - Add a list named "Seasonal offers". For **Opt-in**, choose **Double opt-in**. listmonk then emails each new subscriber to confirm, and sends campaigns on a double opt-in list only to confirmed subscribers.
   - Make its type **Private**, so it doesn't appear on public sign-up pages.
   - Write down the list's ID. n8n uses it in `lists`.
4. **Add your details to every offers email (the campaign template).** In listmonk, open **Campaigns, Templates** and edit your campaign template so its footer names Nest & Rest Cleaning and Mann Patel, shows your mailing address (the same one as `business.mailingAddress`), and includes the unsubscribe link. On listmonk's [templating page](https://github.com/knadh/listmonk/blob/master/docs/docs/content/templating.md) the unsubscribe link is `{{ UnsubscribeURL }}`.
5. **The confirmation email is a system template: ask Claude for help with this step.**
   - The email people get after ticking the box, asking them to confirm, is one of listmonk's "system templates". It is not edited in listmonk's admin screens. Its [System templates](https://github.com/knadh/listmonk/blob/master/docs/docs/content/templating.md#system-templates) section says you change it by copying listmonk's `static` folder and starting listmonk with the `--static-dir` flag. The email's file is `subscriber-optin.html`.
   - Until you do, listmonk uses its built-in wording. Don't switch the offers box on (section 8) until you've seen that email and it names Nest & Rest Cleaning and shows your mailing address, because every email must say who you are. Ask Claude to walk you through it, as the steps depend on how you installed listmonk.
6. **Create an API user for n8n.** Open **Admin, Users** and add an API user, with a role (**Admin, User roles**) that lets it add subscribers. Copy the token into n8n's listmonk credential. n8n logs in with Basic auth as `api_user:token`. The API is described on listmonk's [subscribers page](https://github.com/knadh/listmonk/blob/master/docs/docs/content/apis/subscribers.md).
7. **Keep to CASL.**
   - Send offers only to people who ticked the box and confirmed. Never import old customers.
   - Every offers email must say who you are, show your mailing address and have an unsubscribe link.
   - Stop emailing anyone who asks, within 10 business days, even if they ask by reply instead of the link.

## 8. Switching the website on

Each piece can be switched on as soon as its own section is done. You don't have to finish them all first. Fill in the settings one piece at a time, in this order: `server`, then `delivery`, then `booking.easyAppointments`, then `chat`, then `newsletter`.

After each piece:

1. Run `node tools/build.mjs`, then `node tools/qa/run.mjs` (the checks need what the README's "Checking the site" section describes).
2. Commit and push. The site is live a minute or two later (see Hosting in the README). Or send the new settings to Claude and ask it to do this.
3. Send one test booking on the live site, using your own email.

If a piece misbehaves, put its setting back to blank (see "Switching a piece off" below) and rebuild.

### The settings, with example values

In `js/config.js`, with your own values in place of these examples:

```js
server: {
  name: "YOUR-HOSTING-COMPANY",
  location: "Toronto, Canada"
},

delivery: {
  provider: "webhook",
  endpoint: "https://n8n.nestnrestcleaning.com/webhook/forms"
},

booking: {
  leadDays: 1,
  blockedDates: [],
  calLink: "",
  easyAppointments: {
    url: "https://book.nestnrestcleaning.com",
    provider: "1",                // example only: your own provider ID
    services: [{ upToHours: 3, id: 1 }, { upToHours: 5, id: 2 }, { upToHours: 8, id: 3 }]   // example only: your own lengths and service numbers
  }
},

chat: {
  baseUrl: "https://chat.nestnrestcleaning.com",
  websiteToken: "YOUR-WEBSITE-TOKEN"
},

newsletter: {
  optIn: true
},
```

- **`server`:** who runs the server and where, from section 1. The privacy policy says it. Fill both before you switch on any of the other four pieces.
- **`delivery`:** before you change it, copy the lines you have now (`provider: "formsubmit"` and its `endpoint`) somewhere, so you can go back. The endpoint is the Production URL from Recipe 1, and the "Website forms" workflow must be switched on first.
- **`booking.easyAppointments`:** `calLink` must be `""`. `provider` is your provider ID in Easy!Appointments (see its [REST API page](https://github.com/alextselegidis/easyappointments/blob/main/docs/rest-api.md) and section 2, step 6). It is optional: leave it `""` and the calendar chooses. `services` has one entry per clean length, shortest first, each with that service's number. The last `upToHours` is the longest clean that fits your working day. A longer estimate is sent to you as a request, with no calendar, and you arrange the time yourself (section 2, step 4). The values in the example above, including the lengths 3, 5 and 8, are examples only.
- **`chat`:** both values or neither. Decide how long chat conversations are kept first (section 6, step 6).
- **`newsletter`:** also fill in `business.mailingAddress`, a PO box or mailbox service is fine. Check listmonk's confirmation email first (section 7, step 5).

### Before the calendar: Google Analytics and the new-tab link

Do this **before** you switch the calendar on. The calendar's "Open the calendar in a new tab" link carries the customer's name, email, phone and address, so the calendar can be pre-filled. If Google Analytics 4's Enhanced measurement has **Outbound clicks** switched on, a click on that link would send those details to Google. Open the Enhanced measurement settings of your web data stream in Google Analytics, and turn Outbound clicks off.

### What to check after each piece

- **After `delivery`:** the customer sees "Request received" with the same reference. A row appears in your `requests` data table. The request arrives in Gmail, and a receipt arrives at your own email.
- **After the calendar:** the calendar appears inside the last step of booking, with your details filled in. Pick a time, check the confirmation email and your Google Calendar, check the text arrives, then cancel from the email. If no calendar appears, check section 2, step 2 first.
- **After `chat`:** on a computer, the bubble appears a moment after the page loads, and a message arrives in Chatwoot. On a phone, a "Chat" button appears in the bottom bar. There's no chat on `/book/`.
- **After `newsletter`:** the booking form has an unticked "Email me seasonal offers" box. Tick it with your own email, and a confirmation email arrives from listmonk. Until you click it, you're unconfirmed. Leave it unticked and nothing is added. Ticking it without an email asks you to add one.

### If the build stops

A typo can stop the build with one of these messages. Nothing is published until you fix it.

| The build says | Fix |
|---|---|
| Fill in only one booking calendar in js/config.js: booking.calLink (Cal.com) or booking.easyAppointments.url (Easy!Appointments), not both. | Blank one of them. |
| booking.easyAppointments.url in js/config.js must start with https://. | Use the full web address, with `https://`. |
| booking.easyAppointments.services in js/config.js needs one entry per clean length, shortest first, each with a whole-number id, e.g. [{ upToHours: 3, id: 1 }, { upToHours: 5, id: 2 }]. | List the lengths shortest first, each `id` a plain number. |
| delivery.endpoint in js/config.js must start with https:// when delivery.provider is "webhook". | Use the Production URL from n8n, starting `https://`. |
| Fill in both chat.baseUrl and chat.websiteToken in js/config.js (baseUrl starting with https://), or leave both empty. | Fill both, or blank both. |
| newsletter.optIn needs business.mailingAddress in js/config.js: Canada's anti-spam law (CASL) needs it in every offers email. | Fill in `business.mailingAddress`. |
| Fill in server.name and server.location in js/config.js: the privacy policy says where your own server runs. | Fill in `server`. |

### Switching a piece off

- **Forms:** set `delivery` back to `{ provider: "formsubmit", endpoint: "<the address you saved>" }`.
- **Calendar:** set `booking.easyAppointments.url` to `""`. The site goes back to booking requests, or to Cal.com if `calLink` is set.
- **Chat:** set `chat.baseUrl` and `chat.websiteToken` to `""`.
- **Offers box:** set `newsletter.optIn` to `false`.

Then run `node tools/build.mjs`, commit and push. The privacy wording follows each setting, so it comes off with the piece.

## 9. Keeping it safe

- **Updates.**
  - Update one tool at a time, and send a test booking afterwards. Watch each project's releases page for security fixes.
  - Easy!Appointments' [update guide](https://github.com/alextselegidis/easyappointments/blob/main/docs/update-guide.md) says to back up the database and files first and keep your `config.php`. Do the same for every tool.
- **Backups.** Check now and then that the nightly backups are still running, and that you've kept a copy off the server.
- **Read the privacy policy again after each change.**
  - Open `/privacy/` and `/policies/` on the live site. They name the server, n8n, Easy!Appointments, Chatwoot and listmonk, each only while it's on.
  - They don't name Invoice Ninja or SMS Gateway. Tell Claude when you start using them with customers' details, so the wording can be checked.
  - Tell Claude too if you decide how long chat conversations or n8n's run history are kept.
- **Opt-outs.** Keep a note of anyone who opts out of texts, and don't message them again. listmonk handles email unsubscribes, but you handle anyone who replies asking to stop.
- **Passwords.** Every tool has its own strong password and, where offered, two-step verification. Keep them in your password manager, and never in `js/config.js`.
- **Failures.** The Error Workflow email from section 5 tells you when something breaks. If n8n is down, the customer sees the "we couldn't confirm" message and can try again, so a request is never wrongly shown as received.
