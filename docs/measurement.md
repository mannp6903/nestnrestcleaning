# Measuring what brings clients (including AI answers)

Phase 4 of [the redesign blueprint](redesign-blueprint-2026-11.md). People now ask ChatGPT, Gemini and Copilot for a cleaner as
well as Google. Most of those visits don't look like "AI" in analytics, so this uses four simple sources together. Expect very
little from AI in the first months: success is being **named, and quoted correctly**, when someone asks about cleaning prices or
the best cleaner in Scarborough or North York.

## 1. Ask every client: "How did you hear about us?"

The booking form asks it (optional), with the answers in `booking.foundVia` in `js/config.js`. Each request arrives with
**Found us via** in the email (and its own column in the Google Sheet, if that's on). Keep a monthly tally:

| Month | Google search | Google Maps | ChatGPT or another AI | Instagram/Facebook | Friend or neighbour | Flyer | Other | Not said |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

Ask the same question by text when someone books by phone or email, and add them to the tally.

The answer also goes to Google Analytics with each request (`found_via` on the `generate_lead` event: only the answer, never
who gave it). To see it in reports, add it once in Google Analytics: **Admin → Custom definitions → Create custom dimension**,
name "Found via", scope **Event**, event parameter `found_via`.

## 2. Google Analytics: visits from AI assistants

Google Analytics has an **AI Assistant** channel in its default channel group, but it doesn't catch every assistant. Make your own
channel group so every one is counted:

1. **Admin → Data display → Channel groups → Create new channel group**, named "Channels with AI".
2. Add a channel called **AI assistants**, with the condition **Source** matches regex:

   ```
   chatgpt\.com|chat\.openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com|meta\.ai|you\.com|poe\.com
   ```

3. Move it **above Referral** (channels are matched top to bottom), and save.

Then in **Reports → Acquisition → Traffic acquisition**, switch the channel group to "Channels with AI". Look at visits and at
"generate_lead" events (requests sent) from that channel each month.

## 3. Search Console and Bing Webmaster Tools

- **Google Search Console** (search.google.com/search-console): add nestnrestcleaning.com, then submit
  `https://nestnrestcleaning.com/sitemap.xml`. Check the Performance reports monthly, including the report for Google's AI
  features (AI Overviews and AI Mode) where it's shown.
- **Bing Webmaster Tools** (bing.com/webmasters): you can import the site straight from Search Console. Bing's reports feed
  Copilot too; check its AI performance report monthly.

## 4. The monthly prompt panel (20 minutes)

Once a month, ask the same questions in **ChatGPT, Gemini, Copilot and Perplexity**, two or three times each (answers vary from
one try to the next). Use a private or logged-out window where you can, so past chats don't sway the answer. Write down, for
each: is Nest & Rest named (yes/no), where in the list, is the price right, and which page or listing it links to.

1. How much does house cleaning cost in Scarborough?
2. How much does house cleaning cost in North York?
3. How much is a deep clean in Scarborough?
4. Move-out cleaning price in North York
5. Best house cleaners in Scarborough
6. Best cleaning service in North York
7. Who cleans condos in Willowdale?
8. House cleaning in Agincourt
9. Cleaner near Scarborough Town Centre
10. Airbnb turnover cleaning in Toronto, Scarborough or North York
11. Affordable cleaning service in Scarborough that I pay after the clean
12. Cleaner in North York that brings their own supplies
13. Same cleaner every time, Scarborough
14. Is Nest & Rest Cleaning legit?
15. Nest & Rest Cleaning reviews
16. Nest & Rest Cleaning prices
17. Deep cleaning vs regular cleaning, which should I book in Toronto?
18. How often should I get my condo cleaned?
19. Move-out cleaning checklist for Toronto renters
20. Do I need to tip my house cleaner in Toronto?

| Month | Prompt | Assistant | Named? | Position | Price right? | Linked to |
|---|---|---|---|---|---|---|
| | | | | | | |

**What to do with it.** If the price quoted is wrong, the page it links to is the one to fix (every price on the site comes from
`js/config.js`, so it's usually an old listing elsewhere). If you're never named for "best cleaner" questions, that's reviews
and listings, not the website: see [docs/listings-checklist.md](listings-checklist.md).
