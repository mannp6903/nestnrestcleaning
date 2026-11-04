# Listings and reviews checklist

This is phase 1 of [the redesign blueprint](redesign-blueprint-2026-11.md): the part no website change can do for you.
When someone asks ChatGPT, Gemini or Google "who's the best cleaner in Scarborough?", the answer mostly comes from review
sites and business listings, not from cleaners' own websites. The website already says everything clearly. These steps make
sure the rest of the internet says the same thing about Nest & Rest. Work through them in order.

## Say the same thing everywhere

Copy these exactly into every listing, so every site agrees with the website and with each other:

- **Name:** Nest & Rest Cleaning. Don't add words like "Best Toronto Cleaners" to the name: Google can suspend a profile for it.
- **Category:** House cleaning service (on Google: "House cleaning service").
- **Area:** Scarborough and North York, Toronto. Don't show a street address: you go to your clients, so you're a service-area business.
- **Hours:** every day, 9am to 11pm.
- **Website:** https://nestnrestcleaning.com
- **Email:** nestnrestcleaning@gmail.com
- **Prices, where a listing asks:** the same "from" prices as the website's pricing page (regular from $145, deep from $235, move-in/move-out from $250 for a 1-bedroom, 1-bathroom condo). If you change a price in `js/config.js`, change it on the listings too.
- **The guarantee, where a listing asks:** the sentence in `policies.guarantee` in `js/config.js`, word for word.

After each listing goes live, paste its public link into `js/config.js` (the field is named below) and run `node tools/build.mjs`.
The website then tells Google and AI assistants that the listing and the site are the same business.

## 1. Google Business Profile (start this first)

1. Go to business.google.com with nestnrestcleaning@gmail.com and create the profile with the details above.
2. Choose "I deliver goods and services to my customers", add Scarborough and North York as service areas, and hide the address.
3. Add the services from the website with their "from" prices, your opening hours and Mann's photo. Add real job photos as you get them (with each client's permission, nothing that shows the address).
4. Verify it (Google tells you how: usually a video or a postcard).
5. Once verified, paste:
   - the profile's **Share** link into `business.googleBusinessUrl`
   - the **Ask for reviews** link into `business.googleReviewUrl`

## 2. A phone number

The website keeps the number private today (`business.phone` is empty). AI assistants and Google both favour a business people can call.
When you're ready to take calls, put the number on the Google profile and in `business.phoneDisplay` and `business.phone`, then run the build:
every call and text button comes back. Use the same number on every listing.

## 3. Reviews, every week

Reviews are what AI assistants and Google lean on most when they recommend a cleaner, and people look for recent ones.

- After every clean, send the review text in the README ("Asking for a review") with your Google review link. Only to people you've cleaned for.
- Never offer anything for a review, and never post one yourself or ask family to. Canada's Competition Bureau and Google both forbid it.
- Ask clients to mention what you did and where ("deep clean of our condo in Willowdale"). It helps the review answer local questions.
- Reply to every review yourself, good or bad, within a day or two.
- With a client's permission, add the review to `reviews` in `js/config.js`: it then appears on the home page and in its business data.

## 4. The other listings (an hour, once)

Set these up with the same details. Each one is free.

| Listing | Why it matters | Paste its link into |
|---|---|---|
| Yelp (biz.yelp.com) | ChatGPT uses Yelp's reviews and listings for local answers | `business.yelpUrl` |
| HomeStars (homestars.com) | The main Canadian home-services review site; AI assistants cite it | `business.homestarsUrl` |
| Bing Places (bingplaces.com) | Feeds Bing and Microsoft Copilot. It can import your Google profile | (nothing to paste) |
| Apple Business Connect (businessconnect.apple.com) | Feeds Apple Maps and Siri | (nothing to paste) |
| Facebook and Instagram | Your social profiles | `business.facebookUrl`, `business.instagramUrl` |

## 5. Later: get mentioned

Once you have a handful of reviews, ask to be included in local "best house cleaners in Toronto / Scarborough" round-ups and in
neighbourhood newsletters or Facebook groups. Being named on other sites does more for AI answers than links do.

## Check it's working, once a month

- **Google Search Console** (search.google.com/search-console): add the site, then watch which searches and pages bring people.
- **Ask the assistants:** once a month, ask ChatGPT, Gemini and Copilot the same few questions ("house cleaning prices in Scarborough",
  "best cleaner in North York", "deep cleaning cost Willowdale") and note whether Nest & Rest is named, and whether the price it quotes is right.
  Expect nothing for the first months: reviews take time to build up.
