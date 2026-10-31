// Nest & Rest Cleaning: 10 posts for November 2026 (Instagram, Facebook, WhatsApp).
// One source of truth: the renderer draws the images from `slides`/`story`, and the posting kit and
// content calendar print the copy. Every price, offer and promise here is from js/config.js (pricingVersion 2026-10-28).

export const SITE = "nestnrestcleaning.com";

export const posts = [
  {
    n: 1, id: "p01-meet-mann", date: "2026-11-01", day: "Sun Nov 1", time: "7:00 pm",
    theme: "People", format: "Reel (you on camera) + photo post", pin: true,
    title: "Meet the person who'll clean your home",
    why: "Faces beat logos for trust, and a new local business grows first through the people who already know you. This is the post you pin to the top of your profile and send to everyone on WhatsApp.",
    signal: "Sends and shares from people who know you",
    slides: [
      { t: "founder", kicker: "Scarborough & North York", h: "Hi, I'm Mann.", sub: "I clean every home myself.",
        chips: ["Price before you book", "Pay after the clean", "Free re-clean"],
        alt: "Mann Patel, owner of Nest & Rest Cleaning, smiling outdoors. Text: Hi, I'm Mann. I clean every home myself." }
    ],
    story: { t: "founder", h: "Hi, I'm Mann.", sub: "I clean every home myself.", line: "Scarborough & North York · 7 days · 9am to 11pm", offer: "20% off your first visit · our first 50 households" },
    ig: `I'm Mann, and I'm the person who'll be cleaning your home.

I started Nest & Rest in Scarborough because the usual trade feels backwards to me. Saturday goes to the bathrooms and the floors, and rest waits until the list is done. Often, it never is.

So I take the list off your hands. Here's what you can count on:
✓ Your price before you book
✓ Nothing to pay until the clean is done
✓ Street shoes off, house shoes on, at your door
✓ Anything missed? Tell me within 24 hours and I'll come back and re-clean it, free

I clean across Scarborough and North York, 7 days a week, 9am to 11pm. Evenings included.

Our first 50 households get 20% off their first visit. See your price at nestnrestcleaning.com (link in bio).

Know someone in Scarborough or North York who'd love their Saturday back? Send this to them. It helps a new local business more than you'd think.`,
    tags: "#Scarborough #NorthYork #TorontoSmallBusiness #HouseCleaning #TorontoHomes",
    fb: `Hi neighbours 👋 I'm Mann, and I've just started Nest & Rest Cleaning here in Scarborough.

I clean every home myself, across Scarborough and North York, 7 days a week from 9am to 11pm.

A few promises I hold myself to:
• You see your price before you book
• You pay after the clean, never a deposit
• House shoes on at your door, so your floors only meet clean soles
• If anything's missed, tell me within 24 hours and I'll come back and fix it, free

Our first 50 households get 20% off their first visit. See your price here: https://nestnrestcleaning.com

If this could help someone you know, a share means a lot. Thank you.
— Mann`,
    fbTags: "#Scarborough #NorthYork",
    waStatus: "I've started my own home cleaning business in Scarborough & North York 🙏 A share would mean a lot → nestnrestcleaning.com",
    waMsg: `Hi! It's Mann. Some news: I've started Nest & Rest Cleaning, a home cleaning business in Scarborough and North York.

I clean every home myself, 7 days a week until 11pm, and you pay after the clean.

If you know anyone who'd like a hand (busy parents, someone moving, an Airbnb host), could you forward this to them? My first 50 households get 20% off their first visit: nestnrestcleaning.com

Thank you, it means a lot.
— Mann`,
    reel: {
      length: "25 to 30 seconds", audio: "Your own voice, with a soft track from Instagram's audio library under it at low volume. Turn on auto-captions.",
      shots: [
        { at: "0:00–0:03", shot: "Close-up at a front door: you swap street shoes for house shoes.", text: "The person who'll clean your home? Me.", vo: "If you book Nest & Rest, I'm the one who shows up. Every time." },
        { at: "0:03–0:08", shot: "You, face to camera, near a window (natural light).", text: "Mann · Scarborough", vo: "I'm Mann. I started Nest & Rest so families here could get their weekends back." },
        { at: "0:08–0:18", shot: "Quick cuts: the price box on your phone, two colours of cloths (kitchen and bath), your checklist.", text: "Price before you book · Pay after · House shoes · Free re-clean", vo: "You see your price before you book. You pay after it's done. House shoes, never street shoes. And if I miss anything, I come back and fix it, free." },
        { at: "0:18–0:24", shot: "Walking up to a building in the evening, kit in hand.", text: "Scarborough & North York · 7 days · until 11pm", vo: "I clean across Scarborough and North York, seven days a week, until 11pm." },
        { at: "0:24–0:30", shot: "End on the Story image from this post (hold 2 seconds).", text: "20% off your first visit · first 50 households", vo: "My first 50 households get 20% off. The link's in my bio." }
      ]
    },
    steps: ["Pin this post to the top of your profile (and the Reel, once it's up).", "Location tag: Scarborough, Ontario.", "Send the WhatsApp message to friends and family one by one (not a group), so it reads as personal.", "On Facebook, share the post from your personal profile too, with one line in your own words."]
  },

  {
    n: 2, id: "p02-diwali", date: "2026-11-02", day: "Mon Nov 2", time: "12:00 pm",
    theme: "Offer", format: "Carousel · 5 slides",
    title: "Diwali is Sunday: let the deep clean be my job",
    why: "Diwali is Sunday, November 8 (Dhanteras is Friday the 6th), and the pre-Diwali deep clean is a tradition in many Scarborough and North York homes. This is the most timely, most shareable post of the month, so it goes out first.",
    signal: "Saves and sends between family members planning Diwali",
    slides: [
      { t: "diwali", kicker: "Diwali is Sunday, Nov 8", h: "Let the deep<br>clean be<br><em>my job.</em>", sub: "Pre-Diwali deep cleans across Scarborough & North York. Evenings until 11pm.", swipe: true,
        alt: "Three lit diyas on a navy background. Text: Diwali is Sunday, November 8. Let the deep clean be my job." },
      { t: "list", tone: "ivory", kicker: "Room by room · 1 of 3", h: "The kitchen", items: ["Stovetop degreased", "Microwave inside and out", "Cabinet fronts wiped", "Counters and backsplash", "Sink and taps shined", "Floors vacuumed and mopped"], note: "Inside the oven or fridge: +$40 each.",
        alt: "What a deep clean covers in the kitchen: stovetop, microwave, cabinet fronts, counters, sink, floors. Inside the oven or fridge is $40 each." },
      { t: "list", tone: "ivory", kicker: "Room by room · 2 of 3", h: "Where guests sit", items: ["Décor and shelves dusted", "Baseboards and door frames", "Switches and door handles", "Window sills and vents", "Under and behind what can be moved", "Floors vacuumed and mopped"], note: "Tell me which room matters most. Your priorities come first.",
        alt: "What a deep clean covers in living areas: dusting, baseboards, door frames, switches, handles, sills, vents, under furniture, floors." },
      { t: "list", tone: "ivory", kicker: "Room by room · 3 of 3", h: "Bathrooms", items: ["Build-up off tile and grout", "Fixtures descaled", "Tub, shower and glass", "Toilet inside and out", "Mirrors polished", "Floors washed"], note: "Guests always notice the bathroom.",
        alt: "What a deep clean covers in bathrooms: tile and grout, fixtures descaled, tub and shower, toilet, mirrors, floors." },
      { t: "cta", kicker: "Book before Diwali", h: "Request by <em>Wednesday.</em>", price: { label: "Deep clean · 2-bedroom condo", was: "$285", now: "$228", note: "first visit · 20% off for our first 50 households" }, lines: ["No deposit. You pay after the clean.", "I reply within 2 hours during business hours."],
        alt: "Deep clean of a 2-bedroom condo: $285, or $228 for a first visit. Request by Wednesday. nestnrestcleaning.com" }
    ],
    story: { t: "diwali", kicker: "Diwali is Sunday", h: "Let the deep<br>clean be<br><em>my job.</em>", offer: "2-bed condo deep clean: $228 first visit", line: "Evenings until 11pm · Scarborough & North York" },
    ig: `Diwali is this Sunday, and in a lot of homes the deep clean comes first: a clean, bright home to welcome family, friends and the new year. 🪔

If your list is getting long, I can take some of it off your hands. Swipe for the room-by-room deep clean I'd do before Diwali.

→ Kitchen: stovetop degreased, microwave inside and out, cabinet fronts, sink shined
→ Where guests sit: baseboards, door frames, switches and handles, under and behind what can be moved
→ Bathrooms: build-up off tile and grout, fixtures descaled, mirrors polished
→ Inside the oven or fridge: +$40 each

A 2-bedroom condo deep clean is $285, or $228 for your first visit (20% off for our first 50 households). Evenings until 11pm, 7 days a week.

Request by Wednesday and I'll tell you within 2 hours (during business hours) whether I can fit you in before Sunday. nestnrestcleaning.com

Wishing you and your family a bright Diwali.`,
    tags: "#Diwali2026 #DiwaliCleaning #Scarborough #NorthYork #TorontoDiwali",
    fb: `Diwali is this Sunday 🪔 If the pre-Diwali deep clean is still on your list, I can help.

I'm taking pre-Diwali deep cleans this week across Scarborough and North York, evenings included until 11pm. Swipe to see exactly what I clean, room by room.

A 2-bedroom condo is $285, or $228 for a first visit (20% off for our first 50 households). No deposit, you pay after.

Request by Wednesday and I'll tell you within 2 hours whether I can fit you in before Sunday: https://nestnrestcleaning.com/book/

Happy Diwali in advance to everyone celebrating.
— Mann`,
    fbTags: "#Diwali2026 #Scarborough",
    waStatus: "Diwali deep clean before Sunday? 🪔 Evenings until 11pm, 20% off a first visit → nestnrestcleaning.com",
    waMsg: `Hi! It's Mann from Nest & Rest Cleaning. With Diwali on Sunday, I'm taking a few pre-Diwali deep cleans this week across Scarborough and North York, evenings included until 11pm.

A 2-bed condo is $228 for a first visit (20% off). If you or your family would like a hand, just reply here, or see your price at nestnrestcleaning.com

Happy Diwali in advance 🪔
— Mann
(Reply STOP and I won't send offers again.)`,
    steps: ["Post at noon so it's seen at lunch and again in the evening.", "Share to your Story with a link sticker to nestnrestcleaning.com/book/.", "WhatsApp: post the Story image as your Status today and Thursday.", "Only promise days you can actually fit in. It's one of you: say no kindly once you're full."]
  },

  {
    n: 3, id: "p03-six-spots", date: "2026-11-04", day: "Wed Nov 4", time: "6:00 pm",
    theme: "Useful", format: "Reel (film on a job) + single image",
    title: "6 spots your weekly clean skips",
    why: "Quick, satisfying cleaning clips are the most-shared format in the category, and 'send this to the person who says they already cleaned' turns viewers into senders. Sends to non-followers are what push a Reel to new people.",
    signal: "Sends (DM shares) and watch time",
    slides: [
      { t: "numbered", tone: "ivory", kicker: "Save this for cleaning day", h: "6 spots your weekly clean <em>skips.</em>", items: ["Tops of door frames", "Light switches and door handles", "Baseboards behind doors", "Vents and window sills", "Under and behind the couch", "Tap bases and fixtures"], note: "All six are in every deep clean I do.",
        alt: "List: 6 spots your weekly clean skips. Tops of door frames, light switches and door handles, baseboards behind doors, vents and window sills, under and behind the couch, tap bases and fixtures." }
    ],
    story: { t: "hook", kicker: "Reel cover", h: "6 spots your weekly clean <em>skips.</em>", line: "Number 6 is in every bathroom." },
    ig: `Your home can look clean and still have these six hiding in plain sight:

1. Tops of door frames
2. Light switches and door handles
3. Baseboards behind doors
4. Vents and window sills
5. Under and behind the couch
6. Tap bases and fixtures (hello, limescale)

Save this for your next cleaning day. And send it to whoever in your house says "I already cleaned." 😄

All six are part of every deep clean I do across Scarborough and North York. First visit? 20% off for our first 50 households. nestnrestcleaning.com`,
    tags: "#CleaningTips #DeepCleaning #CleaningMotivation #Scarborough #NorthYork",
    fb: `Your home can look clean and still have these six hiding in plain sight 👀

1. Tops of door frames
2. Light switches and door handles
3. Baseboards behind doors
4. Vents and window sills
5. Under and behind the couch
6. Tap bases and fixtures

Which one did you forget last time? Be honest 😄

All six are in every deep clean I do across Scarborough and North York: https://nestnrestcleaning.com/services/deep-cleaning/`,
    fbTags: "#CleaningTips",
    waStatus: "6 spots most weekly cleans skip. How many does your home have? 👀",
    waMsg: null,
    reel: {
      length: "15 to 25 seconds", audio: "A trending sound from Instagram's audio library (business accounts: use a track marked available for commercial use). No voice needed; the text carries it.",
      shots: [
        { at: "0:00–0:02", shot: "Finger swipe along the top of a door frame, dust on the fingertip. Tight close-up.", text: "6 spots your weekly clean skips", vo: "" },
        { at: "0:02–0:05", shot: "1. Wipe the door frame top: one pass, clean stripe.", text: "1. Tops of door frames", vo: "" },
        { at: "0:05–0:08", shot: "2. Cloth over a light switch, then a door handle.", text: "2. Switches and handles", vo: "" },
        { at: "0:08–0:11", shot: "3. Open a bathroom door; wipe the baseboard behind it.", text: "3. Baseboards behind doors", vo: "" },
        { at: "0:11–0:14", shot: "4. Brush along a vent and a window sill.", text: "4. Vents and sills", vo: "" },
        { at: "0:14–0:17", shot: "5. Lift the couch skirt; vacuum underneath.", text: "5. Under the couch", vo: "" },
        { at: "0:17–0:21", shot: "6. Limescale at a tap base, then the shine after descaling.", text: "6. Tap bases and fixtures", vo: "" },
        { at: "0:21–0:24", shot: "Wide shot of the finished room. Hold.", text: "All six, in every deep clean · nestnrestcleaning.com", vo: "" }
      ]
    },
    steps: ["Film only with the client's okay, and keep anything personal out of frame (photos, mail, house numbers, windows with a view of the street).", "If Trial Reels is available on your account, post it as a Trial Reel first to test it with non-followers.", "Use the 9:16 image as the Reel cover; the single image works as a backup post if you can't film this week.", "Reply to every comment in the first hour: it keeps the post in front of people."]
  },

  {
    n: 4, id: "p04-deep-vs-regular", date: "2026-11-06", day: "Fri Nov 6", time: "12:00 pm",
    theme: "Useful", format: "Carousel · 5 slides",
    title: "Deep clean or regular clean? The honest difference",
    why: "It's the question every first-time customer has, and a clear answer people save is the first step to booking. It also shows your prices openly, which most Toronto cleaners don't do in posts.",
    signal: "Saves, and DMs asking which one they need",
    slides: [
      { t: "cover", tone: "ivory", kicker: "Before you book", h: "Deep clean or regular clean?", sub: "Here's the honest difference, room by room.", swipe: true, art: "split",
        alt: "Title slide: Deep clean or regular clean? Here's the honest difference." },
      { t: "list", tone: "ivory", kicker: "Regular clean", h: "Keeps a lived-in home easy.", items: ["Kitchen counters, sink and stovetop", "Toilet, tub, shower and glass", "Mirrors polished", "Surfaces and décor dusted", "Beds made", "Floors vacuumed and mopped"], price: { label: "From", amount: "$145", note: "1-bedroom condo" },
        alt: "Regular clean includes kitchen, bathrooms, mirrors, dusting, beds made and floors. From $145 for a 1-bedroom condo." },
      { t: "list", tone: "navy", kicker: "Deep clean", h: "Everything above, plus the build-up.", items: ["Baseboards and door frames", "Tile and grout build-up", "Fixtures descaled", "Microwave and cabinet fronts", "Switches and door handles", "Under and behind what can be moved"], price: { label: "From", amount: "$235", note: "1-bedroom condo" },
        alt: "Deep clean adds baseboards, door frames, grout, descaled fixtures, microwave, cabinet fronts, switches, handles, and under furniture. From $235 for a 1-bedroom condo." },
      { t: "statement", tone: "sand", kicker: "My rule of thumb", h: "No professional clean in the last few months? <em>Start deep.</em>", sub: "Then a regular plan keeps it there. Every 2 weeks saves 15% on each visit.",
        alt: "Rule of thumb: if your home hasn't had a professional clean in the last few months, start with a deep clean, then a regular plan. Every 2 weeks saves 15%." },
      { t: "cta", kicker: "Still not sure?", h: "Ask me. I'll tell you <em>honestly.</em>", lines: ["Send me your home size and I'll say which clean you need, even if it's the cheaper one.", "First visit: 20% off for our first 50 households."],
        alt: "Still not sure? Send Mann your home size and he'll tell you honestly which clean you need. nestnrestcleaning.com" }
    ],
    story: { t: "versus", h: "Deep or regular?", line: "Regular from $145 · Deep from $235", sub: "1-bedroom condo prices · see yours at nestnrestcleaning.com" },
    ig: `Deep clean or regular clean? Here's the honest difference.

Regular: the reset that keeps a lived-in home easy. Kitchen, bathrooms, dusting, beds and floors, done the same careful way every visit. From $145 for a 1-bedroom condo.

Deep: everything in a regular clean, plus the build-up. Baseboards, door frames, grout, fixtures, vents, switches, and under and behind what can be moved. From $235 for a 1-bedroom condo.

My rule of thumb: if your home hasn't had a professional clean in the last few months, start with a deep clean. Then a regular plan keeps it there, and every 2 weeks saves 15%.

Save this for later. And if you're not sure which one you need, send me a message with your home size. I'll tell you honestly, even if the answer is the cheaper one.`,
    tags: "#HouseCleaning #DeepCleaning #CleaningTips #Scarborough #NorthYork",
    fb: `Deep clean or regular clean? It's the most common question I get, so here's the honest difference 👇

Regular (from $145 for a 1-bedroom condo): kitchen, bathrooms, dusting, beds and floors, the same careful way every visit.

Deep (from $235 for a 1-bedroom condo): all of that, plus baseboards, door frames, grout, fixtures, vents, switches, and under and behind what can be moved.

No professional clean in the last few months? Start with a deep clean, then a regular plan keeps it there (every 2 weeks saves 15%).

Not sure? Message me your home size and I'll tell you which one you need. Prices for every home size: https://nestnrestcleaning.com/pricing/`,
    fbTags: "#Scarborough #NorthYork",
    waStatus: "Deep clean or regular clean? Regular from $145, deep from $235 (1-bed condo). Not sure which? Message me 🙂",
    waMsg: null,
    steps: ["Swipe check: slide 1 must make sense on its own, because Instagram re-shows carousels from slide 2 to people who skipped them.", "Answer every 'which do I need?' DM with a real recommendation and their price.", "Facebook: post the carousel as a multi-photo post, not an album."]
  },

  {
    n: 5, id: "p05-salt-season", date: "2026-11-10", day: "Tue Nov 10", time: "7:00 pm",
    theme: "Useful", format: "Carousel · 5 slides",
    title: "Toronto salt season: protect your floors",
    why: "Toronto usually sees its first snow in early to mid November, and every home with a front door has this problem. It's local, useful and saveable, and it ends on a promise only you make: house shoes at every visit.",
    signal: "Saves and local shares",
    slides: [
      { t: "cover", tone: "navy", kicker: "Toronto winter guide", h: "Salt season is here. <em>Your floors feel it first.</em>", sub: "Simple habits that save your floors this winter.", swipe: true, art: "snow",
        alt: "Snowflakes on navy. Text: Salt season is here. Your floors feel it first." },
      { t: "statement", tone: "ivory", kicker: "Why it matters", h: "Road salt scratches like <em>fine sandpaper.</em>", sub: "Underfoot, the grit wears down your floor's finish, and the white film it leaves dulls the shine.",
        alt: "Why it matters: road salt grit scratches floors like fine sandpaper, and the white film dulls them." },
      { t: "list", big: true, tone: "ivory", kicker: "Habit 1 · stop it at the door", h: "Catch it before it's inside.", items: ["A scraper mat outside the door", "An absorbent mat just inside", "A boot tray for wet boots"], note: "Wet boots stay on the tray, never on the floor.",
        alt: "Stop it at the door: a scraper mat outside, an absorbent mat inside, a boot tray for wet boots." },
      { t: "numbered", big: true, tone: "ivory", kicker: "Habits 2 to 5 · clean it right", h: "Damp, not wet.", items: ["Sweep or vacuum the grit first", "Well-wrung microfibre mop", "A pH-neutral floor cleaner", "Dry the floor right after"], note: "Check your floor's care guide before using vinegar on hardwood.", start: 2,
        alt: "Clean it the right way: sweep or vacuum first, use a well-wrung microfibre mop and a pH-neutral cleaner, then dry the floor. Check your floor's care guide before using vinegar on hardwood." },
      { t: "cta", kicker: "Why I wear house shoes", h: "Your floors only meet <em>clean soles.</em>", lines: ["Street shoes carry grit and salt. I change into indoor-only shoes at your door, at every visit.", "Scarborough & North York, 7 days a week."],
        alt: "Why Mann wears house shoes: street shoes carry grit and salt, so he changes into indoor-only shoes at your door. nestnrestcleaning.com" }
    ],
    story: { t: "snow", h: "Salt season is here.", sub: "Simple habits that save your floors this winter. New post →", line: "@ Nest & Rest Cleaning" },
    ig: `Toronto salt season is here, and your floors feel it first.

Road salt is gritty. Underfoot, it scratches like fine sandpaper, and the white film it leaves dulls your floors. A few habits go a long way:

1. Stop it at the door: a scraper mat outside, an absorbent mat inside, and a boot tray for wet boots.
2. Sweep or vacuum the grit before you mop, so you're not dragging it around.
3. Damp, not wet: a well-wrung microfibre mop and a pH-neutral floor cleaner.
4. Dry the floor right after.
5. Check your floor's care guide before trying vinegar on hardwood. Some finishes don't like it.

This is also why I wear house shoes. Street shoes carry grit and salt, so I change into indoor-only shoes at your door. Your floors only meet clean soles.

Save this for the first slushy week. ❄️`,
    tags: "#TorontoWinter #Scarborough #NorthYork #CleaningTips #TorontoHomes",
    fb: `Salt season is here ❄️ Here's how to keep it from wrecking your floors:

1. A scraper mat outside, an absorbent mat inside, and a boot tray
2. Sweep or vacuum the grit before you mop
3. Damp, not wet: a well-wrung microfibre mop and a pH-neutral cleaner
4. Dry the floor right after
5. Check your floor's care guide before using vinegar on hardwood

And it's why I change into house shoes at every door. Street shoes carry salt; your floors should only meet clean soles.

Save this one for the first slushy week. Anything you'd add?`,
    fbTags: "#TorontoWinter",
    waStatus: "Salt season tip: sweep the grit BEFORE you mop, or you're just sanding your floors ❄️",
    waMsg: null,
    steps: ["If the first real snow lands earlier, post this the same day: it's most useful (and most shared) when people are staring at the slush on their mat.", "Facebook: this kind of practical post is ideal for local community groups that allow tips. Read each group's rules first and post the tips, not an ad.", "Story: add a Quiz sticker: 'Should you mop or sweep salt first?'"]
  },

  {
    n: 6, id: "p06-which-chore", date: "2026-11-12", day: "Thu Nov 12", time: "12:00 pm",
    theme: "Engagement", format: "Single image + Story poll",
    title: "Which chore would you hand over first?",
    why: "One-letter answers are the easiest comment there is, and comments tell both algorithms that real people care. The answers also tell you which service to talk about next.",
    signal: "Comments and Story poll taps",
    slides: [
      { t: "poll", tone: "ivory", kicker: "Quick question", h: "Which chore would you hand over <em>first?</em>", options: [["A", "Bathrooms", "bath"], ["B", "Kitchen", "pan"], ["C", "Floors", "mop"], ["D", "Dusting (all of it)", "sparkle"]], note: "Comment a letter.",
        alt: "Poll: which chore would you hand over first? A bathrooms, B kitchen, C floors, D dusting." }
    ],
    story: { t: "poll", h: "Which chore goes <em>first?</em>", options: [["A", "Bathrooms", "bath"], ["B", "Kitchen", "pan"], ["C", "Floors", "mop"], ["D", "Dusting", "sparkle"]], line: "Add a Poll sticker here" },
    ig: `Quick question for Scarborough and North York: if you could hand over one chore forever, which one goes first?

A. Bathrooms
B. Kitchen
C. Floors
D. Dusting (all of it)

Comment a letter. I'm genuinely curious, and I'll share what wins in my Stories.`,
    tags: "#Scarborough #NorthYork #TorontoHomes #CleaningLife #HouseCleaning",
    fb: `Settle this for me 😄 If you could hand over ONE chore forever, which one goes first?

A. Bathrooms
B. Kitchen
C. Floors
D. Dusting (all of it)

Comment a letter 👇`,
    fbTags: "",
    waStatus: "If you could give away ONE chore forever: A Bathrooms, B Kitchen, C Floors, D Dusting? Reply with a letter 😄",
    waMsg: null,
    steps: ["No selling in this one: the caption is just the question.", "Reply to every comment with a real sentence, not just an emoji: replies count as conversation.", "Post the Story version with Instagram's Poll sticker (A/B, then C/D), and share the results in 2 days.", "Whatever wins becomes a future post: 'You said bathrooms. Here's how I do one in 30 minutes.'"]
  },

  {
    n: 7, id: "p07-five-things", date: "2026-11-16", day: "Mon Nov 16", time: "9:00 am",
    theme: "Proof", format: "Carousel · 7 slides",
    title: "Five things happen at every visit",
    why: "Before someone hands you their keys, they need to picture you in their home. Your published standard is your strongest proof until reviews come in, and it's something big companies can't say: the owner does every visit.",
    signal: "Saves, profile visits and website taps",
    slides: [
      { t: "cover", tone: "navy", kicker: "The Nest & Rest standard", h: "Five things happen at <em>every visit.</em>", sub: "Same order, every home, every time.", swipe: true, art: "house",
        alt: "Title slide: The Nest & Rest standard. Five things happen at every visit." },
      { t: "step", tone: "ivory", num: "1", h: "Introduced by name.", sub: "You'll know who's coming before I arrive. Right now, that's always me.", alt: "Step 1: Introduced by name. You'll know who's coming before Mann arrives." },
      { t: "step", tone: "ivory", num: "2", h: "Street shoes off, house shoes on.", sub: "Your floors only ever meet clean soles.", alt: "Step 2: Street shoes off, house shoes on." },
      { t: "step", tone: "ivory", num: "3", h: "Your priorities first.", sub: "A quick word on what matters most today.", alt: "Step 3: Your priorities first. A quick word on what matters most today." },
      { t: "step", tone: "ivory", num: "4", h: "Separate cloths for kitchen and bath.", sub: "What cleans a bathroom never touches your kitchen.", alt: "Step 4: Separate cloths for kitchen and bath." },
      { t: "step", tone: "ivory", num: "5", h: "A final check before I leave.", sub: "Every room, checked against the checklist.", alt: "Step 5: A final check before Mann leaves, every room against the checklist." },
      { t: "cta", kicker: "And if something's missed", h: "I come back and fix it, <em>free.</em>", lines: ["Report anything missed within 24 hours of your clean and I'll come back and re-clean those areas.", "No deposit. You pay after the clean."],
        alt: "Guarantee: report anything missed within 24 hours and Mann comes back to re-clean it, free. nestnrestcleaning.com" }
    ],
    story: { t: "list", h: "Every visit:", items: ["Introduced by name", "House shoes on", "Your priorities first", "Separate kitchen and bath cloths", "A final check"], line: "Missed something? I come back, free." },
    ig: `Trust is earned at the door. So every visit starts and ends the same way:

1. Introduced by name. You'll know who's coming before I arrive (right now, that's always me).
2. Street shoes off, house shoes on. Your floors only ever meet clean soles.
3. Your priorities first. A quick word on what matters most today.
4. Separate cloths for kitchen and bath. What cleans a bathroom never touches your kitchen.
5. A final check before I leave. Every room, against the checklist.

And if anything's not right, report it within 24 hours and I'll come back and re-clean those areas, free.

Small promises, kept every visit. That's the whole idea. nestnrestcleaning.com`,
    tags: "#Scarborough #NorthYork #HouseCleaning #TorontoSmallBusiness #CleanHome",
    fb: `Letting someone into your home is a big deal. So here's exactly what happens every time I come in:

1. You'll know who's coming before I arrive (right now, always me)
2. Street shoes off, house shoes on
3. A quick word on what matters most to you today
4. Separate cloths for kitchen and bath, always
5. A final check of every room before I leave

And if I miss anything, tell me within 24 hours and I'll come back and fix it, free.

See the full checklist: https://nestnrestcleaning.com/#standard`,
    fbTags: "#Scarborough #NorthYork",
    waStatus: "Every visit: introduced by name, house shoes on, your priorities first, separate kitchen and bath cloths, a final check. And a free re-clean if anything's missed.",
    waMsg: null,
    steps: ["Monday morning is when people plan their week: good time for a trust post.", "Story: share slide 7 with a link sticker to nestnrestcleaning.com/book/.", "When you have real photos of you at work (house shoes at a door, your two cloth colours), swap them into slides 2 and 4. Real photos always beat graphics."]
  },

  {
    n: 8, id: "p08-gift-a-clean", date: "2026-11-18", day: "Wed Nov 18", time: "12:00 pm",
    theme: "Offer", format: "Single image + Story",
    title: "Gift a clean this holiday season",
    why: "Gift-buying starts now, and a cleaning gift card solves the hardest people on the list: new parents, someone who just moved, the person who does everything. The person who books is often not the person who gets cleaned, so shares do the selling.",
    signal: "Sends and tags ('this is for you, Mom')",
    slides: [
      { t: "gift", tone: "sand", kicker: "Holiday gifts", h: "Give someone <em>a few hours back.</em>", amounts: ["$100", "$150", "$200", "$250"], lines: ["Never expires · works for any service", "For homes in Scarborough & North York"],
        alt: "A navy Nest & Rest gift card. Text: Give someone a few hours back. Gift cards of $100, $150, $200 or $250. Never expires, works for any service." }
    ],
    story: { t: "gift", h: "Give someone <em>a few hours back.</em>", amounts: ["$100", "$150", "$200", "$250"], line: "Never expires · nestnrestcleaning.com/gift" },
    ig: `The hardest people to buy for usually want the same thing: a few hours back.

Gift a clean this holiday season:
🎁 $100, $150, $200 or $250
🎁 Never expires, works for any service
🎁 For a home in Scarborough or North York
🎁 Pay by Interac e-Transfer, and the gift card is emailed once it's paid

Think new parents, someone who just moved, your mom who does everything, or a friend who's had a year.

Send this to the person in your family who's in charge of gifts. 😉 nestnrestcleaning.com/gift`,
    tags: "#GiftIdeas #HolidayGifts #ShopLocalToronto #Scarborough #NorthYork",
    fb: `Stuck on what to get someone this year? 🎁

A Nest & Rest gift card gives them a few hours back: $100, $150, $200 or $250. It never expires and works for any service, for homes in Scarborough and North York.

Great for new parents, someone who just moved, or the person in your family who does everything.

Order here (pay by Interac e-Transfer, and the card is emailed once it's paid): https://nestnrestcleaning.com/gift/

Tag the person who's in charge of gifts in your family 😉`,
    fbTags: "#ShopLocalToronto",
    waStatus: "Stuck on a gift? Give someone a few hours back 🎁 Cleaning gift cards from $100, never expire → nestnrestcleaning.com/gift",
    waMsg: `Hi! It's Mann from Nest & Rest Cleaning. If you're thinking about holiday gifts: I now do cleaning gift cards ($100 to $250) for homes in Scarborough and North York. They never expire and work for any service. Lovely for new parents or anyone who just moved: nestnrestcleaning.com/gift
(Reply STOP and I won't send offers again.)`,
    steps: ["Post again as a Story on Black Friday weekend and in mid-December: gift posts keep working all season.", "Facebook: boost this one post later, if you ever want to try ads (target parents 30 to 60 in Scarborough and North York, small daily budget).", "Never say 'limited' or 'selling fast': the cards aren't, so don't."]
  },

  {
    n: 9, id: "p09-airbnb-turnovers", date: "2026-11-20", day: "Fri Nov 20", time: "12:00 pm",
    theme: "Offer", format: "Carousel · 4 slides",
    title: "11am checkout, 4pm check-in: what happens in between",
    why: "Hosts book turnovers every week, so one host can be worth dozens of cleans a year. A clear timeline answers their real question (can you fit between guests?) and hosts share good cleaners with other hosts.",
    signal: "Saves and shares among hosts; host form requests",
    slides: [
      { t: "cover", tone: "navy", kicker: "For Airbnb hosts", h: "11am checkout. 4pm check-in. <em>Here's what happens in between.</em>", sub: "Same-day turnovers in Scarborough & North York.", swipe: true, art: "clock",
        alt: "Title slide for Airbnb hosts: 11am checkout, 4pm check-in. Here's what happens in between." },
      { t: "timeline", tone: "ivory", kicker: "A same-day turnover", items: [["11:00", "Guests check out", "I plan my day around your checkout times or your listing's calendar."], ["11:15", "I let myself in", "With your lockbox or door code. I delete codes within 7 days of your last scheduled clean."], ["11:30", "The full reset", "Kitchen, bathroom, floors and everything guests touch. Beds made."], ["4:00", "Next guests arrive", "To a space that's reset and ready."]], note: "Times are an example. I plan around yours.",
        alt: "Turnover timeline: 11am guests check out, 11:15 Mann lets himself in, 11:30 the full reset, 4pm next guests arrive." },
      { t: "list", big: true, tone: "ivory", kicker: "Why hosts book me", h: "One person. Every turnover.", items: ["The same person every time: me", "7 days a week, until 11pm", "Pay after each turnover, no deposit", "A receipt for each property", "Missed something? I come back, free"],
        alt: "Why hosts book Mann: the same person every time, 7 days a week until 11pm, pay after each turnover, a receipt per property, a free re-clean." },
      { t: "cta", kicker: "Quoted per unit", h: "Tell me about your <em>listing.</em>", lines: ["It takes about two minutes: your units, your checkout and check-in times, and how often you host.", "On the site, tap Airbnb turnovers. I reply within 2 hours during business hours."],
        alt: "Turnovers are quoted per unit. Tell Mann about your listing at nestnrestcleaning.com, under Airbnb turnovers." }
    ],
    story: { t: "timeline", h: "Checkout to check-in.", items: [["11:00", "Guests out"], ["11:15", "I let myself in"], ["11:30", "Full reset"], ["4:00", "Next guests in"]], line: "Airbnb turnovers · Scarborough & North York" },
    ig: `Hosts in Scarborough and North York: 11am checkout, 4pm check-in. Here's what happens in between.

11:00 Guests check out. I've planned my day around your calendar.
11:15 I let myself in with your lockbox or door code. I delete codes within 7 days of your last scheduled clean.
11:30 The full reset: kitchen, bathroom, floors, everything guests touch, beds made.
4:00 Next guests arrive to a space that's ready.

Why hosts book me:
→ The same person every turnover: me
→ 7 days a week, until 11pm
→ Pay after each turnover, no deposit, and a receipt for each property
→ Anything missed? Report it within 24 hours and I come back, free

Turnovers are quoted per unit. Tell me about your listing (it takes about two minutes): nestnrestcleaning.com/services/airbnb-cleaning

The times above are an example. I plan around your real ones.`,
    tags: "#AirbnbHost #AirbnbToronto #ShortTermRental #Scarborough #NorthYork",
    fb: `Airbnb hosts in Scarborough and North York 👋

Same-day turnovers, checkout to check-in, 7 days a week until 11pm, done by the same person every time (me).

• I plan around your checkout and check-in times
• Lockbox or door code; I delete codes within 7 days of your last scheduled clean
• Pay after each turnover, with a receipt for each property
• Missed something? Report it within 24 hours and I come back, free

Quoted per unit. Tell me about your listing: https://nestnrestcleaning.com/services/airbnb-cleaning/

Know a host? Tag them, it really helps.`,
    fbTags: "#AirbnbHost #Scarborough",
    waStatus: "Airbnb hosts: same-day turnovers in Scarborough & North York, 7 days until 11pm. Know a host? Forward this 🙏",
    waMsg: `Hi! It's Mann from Nest & Rest Cleaning. I've started doing same-day Airbnb turnovers in Scarborough and North York, 7 days a week until 11pm, same person every time (me). If you host, or know someone who does, here's the 2-minute form: nestnrestcleaning.com/services/airbnb-cleaning
(Reply STOP and I won't send offers again.)`,
    reel: {
      length: "15 to 20 seconds (optional)", audio: "Trending upbeat sound; on-screen times do the talking.",
      shots: [
        { at: "0:00–0:03", shot: "Phone screen: a checkout time on a calendar. Or a door with a lockbox.", text: "11am checkout. 4pm check-in.", vo: "" },
        { at: "0:03–0:12", shot: "Fast cuts on a real turnover (with the host's okay): bed stripped, bed made, bathroom wiped, kitchen counter, floor.", text: "11:15 in · 11:30 full reset", vo: "" },
        { at: "0:12–0:16", shot: "The finished room, wide, hold 2 seconds.", text: "Ready for the next guests", vo: "" },
        { at: "0:16–0:19", shot: "End card (Story image).", text: "Airbnb turnovers · Scarborough & North York", vo: "" }
      ]
    },
    steps: ["Facebook: Toronto host groups are where hosts ask for cleaners. Join two or three, read the rules, and answer 'looking for a cleaner' posts with a helpful reply, not a pasted ad.", "Never film anything that identifies a listing's address.", "Once you set turnover prices in js/config.js, update slide 4 with them: prices convert hosts faster than 'quoted per unit'."]
  },

  {
    n: 10, id: "p10-no-black-friday", date: "2026-11-27", day: "Fri Nov 27", time: "9:00 am",
    theme: "Offer", format: "Carousel · 4 slides",
    title: "No Black Friday sale. Just honest prices.",
    why: "On a day when every feed is shouting 70% off, a calm 'no sale, here are my real prices' stands out, and it's true to your promise of a price before you book. It also puts your standing offers in front of people who are in a buying mood.",
    signal: "Shares, saves and price-box visits",
    slides: [
      { t: "cover", tone: "navy", kicker: "Black Friday", h: "No Black Friday sale <em>here.</em>", sub: "Just the same honest price, every day.", swipe: true, art: "tag",
        alt: "Title slide: No Black Friday sale here. Just the same honest price, every day." },
      { t: "prices", tone: "ivory", kicker: "Real prices, real homes", h: "What a clean costs.", rows: [["Regular clean", "1-bedroom condo", "$145"], ["Regular, every 2 weeks", "2-bedroom condo, per visit", "$149"], ["Deep clean", "2-bedroom condo", "$285"], ["Move-out clean", "1-bedroom condo, fridge and oven included", "$250"]], note: "Supplies included. No HST charged.<br>Nothing to pay until the clean is done.",
        alt: "Price examples: regular clean 1-bedroom condo $145; regular every 2 weeks 2-bedroom condo $149 per visit; deep clean 2-bedroom condo $285; move-out clean 1-bedroom condo $250 with fridge and oven." },
      { t: "list", tone: "sand", kicker: "The only offers I run right now", h: "No countdowns. No fine print.", items: ["20% off your first visit, for our first 50 households", "$25 off your next clean when a friend you refer books their first", "Gift cards that never expire"],
        alt: "The only offers right now: 20% off a first visit for the first 50 households, $25 off when a friend you refer books, gift cards that never expire." },
      { t: "cta", kicker: "Your price before you book", h: "See yours in a <em>few taps.</em>", lines: ["Pick your home and your clean, and the price shows before you share any details.", "Nothing to pay until the clean is done."],
        alt: "See your price before you book at nestnrestcleaning.com. Nothing to pay until the clean is done." }
    ],
    story: { t: "statement", h: "No Black Friday sale <em>here.</em>", sub: "Just the same honest price, every day.", line: "See yours at nestnrestcleaning.com" },
    ig: `No Black Friday sale here. Just the same honest price, every day.

Real examples from my price list:
• Regular clean, 1-bedroom condo: $145
• Regular clean, 2-bedroom condo, every 2 weeks: $149 a visit
• Deep clean, 2-bedroom condo: $285 ($228 for a first visit)
• Move-out clean, 1-bedroom condo: $250, fridge and oven included

Supplies included. No HST charged. No deposit: you pay after the clean.

The only offers I run right now:
→ 20% off your first visit, for our first 50 households
→ $25 off your next clean when a friend you refer books their first one
→ Gift cards that never expire

See your exact price before you book: nestnrestcleaning.com`,
    tags: "#BlackFriday #ShopLocalToronto #Scarborough #NorthYork #HouseCleaning",
    fb: `No Black Friday sale here 🙂 Just the same honest price, every day.

• Regular clean, 1-bedroom condo: $145
• Regular, 2-bedroom condo, every 2 weeks: $149 a visit
• Deep clean, 2-bedroom condo: $285 ($228 for a first visit)
• Move-out clean, 1-bedroom condo: $250, fridge and oven included

Supplies included, no HST charged, and you pay after the clean.

Right now: 20% off a first visit for our first 50 households, $25 off your next clean when a friend you refer books, and gift cards that never expire.

See your exact price: https://nestnrestcleaning.com/pricing/`,
    fbTags: "#ShopLocalToronto",
    waStatus: "No Black Friday sale here 🙂 Same honest price every day. See yours → nestnrestcleaning.com",
    waMsg: `Hi! It's Mann from Nest & Rest Cleaning. No Black Friday sale from me, just a reminder that if a friend you refer books their first clean, you get $25 off your next one. And gift cards (never expire) are here: nestnrestcleaning.com/gift
(Reply STOP and I won't send offers again.)`,
    steps: ["Before posting, check js/config.js: if you've switched on HST or changed prices, update slide 2 and the caption.", "Post early (9am): Black Friday feeds get noisier by the hour.", "Send the WhatsApp message only to past customers who've said yes to hearing from you."]
  }
];

// Bonus: a greeting with no selling, for WhatsApp Status and Instagram/Facebook Stories.
export const bonus = {
  id: "bonus-happy-diwali", date: "2026-11-08", day: "Sun Nov 8", time: "9:00 am",
  title: "Happy Diwali (Status and Stories only)",
  story: { t: "diwali", kicker: "Sunday, November 8", h: "Happy <em>Diwali.</em>", sub: "From my home to yours. May the year ahead be bright, calm and restful.", line: "— Mann, Nest & Rest Cleaning", greeting: true },
  waStatus: "Happy Diwali from my home to yours 🪔 — Mann",
  why: "Festival greetings are among the most-viewed WhatsApp Statuses. No offer, no link: just warmth. It keeps you in mind for the people who saw Monday's post."
};

export const voice = {
  owner: "Mann Patel", built: "2026-10-31", sources: "Website copy written in Mann's voice (vision letter, FAQs, host page) and the README message templates",
  greeting: "\"Hi Priya, it's Mann from Nest & Rest Cleaning.\" First name, then who he is.",
  signoff: "\"— Mann\" in messages; \"Mann, Nest & Rest Cleaning\" where the business needs naming.",
  sentences: "Short to medium, about 12 words. Plain words. One idea per sentence.",
  contractions: "Yes: I'll, you'll, it's, don't, I'd.",
  exclamations: "Rare. Warmth comes from the words, not the punctuation.",
  callsIt: "a clean, your clean, a deep clean, a regular plan, turnovers, the standard, founding households, request a clean",
  phrases: ["We clean. You rest.", "Home is for rest.", "the same careful way every visit", "your price before you book", "nothing to pay until the clean is done", "I clean every home myself", "Saturday goes to the bathrooms and the floors"],
  never: ["best in Toronto, #1, top-rated (no reviews yet to back it)", "insured, bonded, eco-friendly, background-checked (not true yet: the site keeps these off until they are)", "limited time, selling fast, spots filling up", "Most popular (unless booking records show it)", "Exciting news, thrilled to announce, solutions, hassle-free", "before-and-after photos that aren't from your own jobs, or reviews you didn't receive"]
};
