/*
  Nest & Rest Cleaning: site settings.
  Prices, services, offers, areas, FAQs and contact details all live here.
  Prices, offers and contact details update on every page as soon as this file is saved.
  New pages (a new service or area) need a rebuild: run `node tools/build.mjs`.
*/
window.NR_CONFIG = {
  siteUrl: "https://nestnrestcleaning.com",

  business: {
    name: "Nest & Rest Cleaning",
    tagline: "We clean. You rest.",
    owner: "Mann Patel",
    ownerFirstName: "Mann",
    phoneDisplay: "647 978 6903",
    phone: "+16479786903",
    email: "nestnrestcleaning@gmail.com",
    base: "Scarborough, Toronto",
    region: "ON",
    hours: "Monday to Saturday, 8am to 6pm",
    hoursShort: "Mon–Sat, 8–6",
    areaLabel: "Scarborough & North York",
    replyPromise: "within 2 hours during business hours",
    // Paste your Google Business Profile review link here once it exists.
    googleReviewUrl: "",
    instagramUrl: "",
    facebookUrl: ""
  },

  /* Where booking requests, quotes and reviews are delivered.
     "formsubmit" emails each one to the address below through formsubmit.co (free, no account).
     The first request sends a one-time activation email to that inbox: click "Activate". */
  delivery: {
    provider: "formsubmit",
    endpoint: "https://formsubmit.co/ajax/nestnrestcleaning@gmail.com"
  },

  /* Optional tracking for ads and growth. Paste IDs to switch on; leave blank to keep off. */
  analytics: {
    ga4Id: "",        // e.g. "G-XXXXXXXXXX" from Google Analytics
    metaPixelId: ""   // e.g. "123456789012345" from Meta Events Manager
  },

  /* Trust badges. Switch one to true only once it's actually true for your business. */
  badges: {
    insured: false,
    ecoProducts: false,
    backgroundChecked: false
  },

  currency: "CAD",
  // Small suppliers (under $30,000 in 12 months) don't charge HST in Ontario. Set 0.13 once registered.
  taxRate: 0,

  offers: {
    founding: {
      active: true,
      label: "Founding household",
      percent: 20,
      spots: 50,
      text: "Our first 50 households receive 20% off their first visit."
    },
    referral: 25
  },

  homeTypes: {
    condo: { label: "Condo or apartment", factor: 1 },
    town: { label: "Townhouse", factor: 1.1 },
    house: { label: "House", factor: 1.2 }
  },

  /* Instant-price services. Price = base + per extra bedroom + per extra bathroom, × home type.
     The base covers a 1-bedroom (or studio), 1-bathroom home. */
  services: {
    regular: {
      slug: "regular-home-cleaning",
      name: "Regular Home Cleaning",
      menuName: "Regular Cleaning",
      short: "The weekly or fortnightly reset that keeps a lived-in home effortless.",
      base: 110, perBed: 25, perBath: 20, hours: 2,
      recurring: true,
      intro: "A thorough, consistent clean of every room you live in: kitchen, bathrooms, bedrooms and living areas, done the same careful way every visit. Most clients book every two weeks and stop thinking about it.",
      idealFor: ["Busy professionals and families", "Keeping a home guest-ready", "Anyone who would rather spend Saturday elsewhere"],
      checklistColumn: 1
    },
    deep: {
      slug: "deep-cleaning",
      name: "Deep Cleaning",
      menuName: "Deep Cleaning",
      short: "A top-to-bottom reset for build-up, edges and everything in between.",
      base: 199, perBed: 40, perBath: 35, hours: 4,
      recurring: false,
      tag: "Recommended first visit",
      intro: "Everything in a regular clean, plus the detail work that builds up over months: baseboards, door frames, grout, fixtures, vents, and behind and under what can be moved. It is the visit we recommend before starting a regular plan.",
      idealFor: ["A first visit before regular cleaning", "Spring and holiday resets", "Homes that haven't had a professional clean in a while"],
      checklistColumn: 2
    },
    move: {
      slug: "move-in-move-out-cleaning",
      name: "Move-In / Move-Out Cleaning",
      menuName: "Move-In / Move-Out",
      short: "An empty-home clean for keys, deposits and fresh starts.",
      base: 249, perBed: 50, perBath: 40, hours: 5,
      recurring: false,
      tag: "Fridge and oven included",
      intro: "A complete clean of an empty home, inside every cabinet, drawer and closet, with the fridge and oven included. Built for landlord walk-throughs, new owners and the first night in a new place.",
      idealFor: ["Tenants handing back keys", "Buyers before move-in day", "Landlords and property managers between tenants"],
      checklistColumn: 3
    },
    detail: {
      slug: "kitchen-and-bath-detailing",
      name: "Kitchen & Bath Detailing",
      menuName: "Kitchen & Bath Detailing",
      short: "Just the hardest-working rooms, restored properly.",
      base: 139, perBed: 0, perBath: 55, hours: 2.5,
      recurring: false,
      intro: "A focused deep clean of the kitchen and bathrooms only: degreasing, descaling, grout and fixtures. Ideal between regular cleans, or before hosting.",
      idealFor: ["Between regular cleans", "Before hosting family or guests", "Kitchens and baths that need more than a wipe-down"],
      checklistColumn: 2,
      rooms: ["Kitchen", "Bathrooms"]
    }
  },

  /* Quote-only services (no instant price). Each gets its own page and request form. */
  quoteServices: {
    residence: {
      slug: "residence-care",
      name: "Residence Care",
      menuName: "Residence Care",
      short: "For larger homes and fine finishes: a walkthrough, a written care plan, the same cleaner each visit.",
      intro: "For homes over about 3,000 square feet, or homes with natural stone, marble, hardwood and glass that need the right product on the right surface. We start with a walkthrough, write a room-by-room care plan, and keep the same cleaner on your home whenever possible.",
      includes: [
        "In-person walkthrough before the first visit",
        "Written room-by-room care plan",
        "Surface-appropriate products for stone, marble, wood and glass",
        "The same cleaner each visit whenever possible",
        "Flexible scheduling around your household",
        "Discreet, uniformed, house-shoes-only service"
      ],
      fields: [
        { id: "size", label: "Home size", type: "select", options: ["3,000 to 5,000 sq ft", "5,000 to 8,000 sq ft", "Over 8,000 sq ft", "Not sure"] },
        { id: "frequency", label: "How often", type: "select", options: ["Weekly", "Every 2 weeks", "Monthly", "One time to start"] },
        { id: "surfaces", label: "Special surfaces", type: "select", options: ["Natural stone or marble", "Hardwood throughout", "Lots of glass", "A mix of the above", "None in particular"] },
        { id: "walkthrough", label: "Best time for a walkthrough", type: "select", options: ["Weekday morning", "Weekday afternoon", "Saturday", "Flexible"] }
      ],
      replyPromise: "within one business day"
    },
    office: {
      slug: "office-cleaning",
      name: "Small Office Cleaning",
      menuName: "Office Cleaning",
      short: "Offices, clinics, studios and shops, cleaned around your opening hours.",
      intro: "Reliable cleaning for small offices, clinics, studios and shops, scheduled around your opening hours. Free quote, no contract needed to start.",
      includes: [
        "Desks, shelves and electronics dusted",
        "Washrooms cleaned and sanitized",
        "Kitchenette or break room cleaned",
        "High-touch points: handles, switches, phones",
        "Floors vacuumed and mopped",
        "Bins emptied and liners replaced"
      ],
      fields: [
        { id: "business", label: "Business name", type: "text", required: true, span: 2 },
        { id: "type", label: "Type of space", type: "select", options: ["Office", "Clinic or dental office", "Studio or gym", "Retail shop", "Other"] },
        { id: "size", label: "Approximate size", type: "select", options: ["Under 1,000 sq ft", "1,000 to 2,500 sq ft", "2,500 to 5,000 sq ft", "Over 5,000 sq ft"] },
        { id: "washrooms", label: "Washrooms", type: "select", options: ["1", "2", "3", "4 or more"] },
        { id: "frequency", label: "How often", type: "select", options: ["One time", "Weekly", "2 to 3 times a week", "Every weekday", "Every 2 weeks"] },
        { id: "when", label: "Best time to clean", type: "select", options: ["Before we open", "During business hours", "After we close", "Saturdays"] }
      ],
      replyPromise: "within one business day"
    }
  },

  addons: [
    { id: "oven", name: "Inside oven", price: 35, hours: 0.5 },
    { id: "fridge", name: "Inside fridge", price: 35, hours: 0.5 },
    { id: "cabinets", name: "Inside kitchen cabinets", price: 45, hours: 0.75 },
    { id: "windows", name: "Interior windows", price: 40, hours: 0.75 },
    { id: "walls", name: "Wall spot cleaning", price: 25, hours: 0.5 },
    { id: "laundry", name: "Laundry, wash and fold", price: 25, hours: 0.5 },
    { id: "balcony", name: "Balcony or patio", price: 30, hours: 0.5 },
    { id: "pets", name: "Heavy pet hair", price: 20, hours: 0.5 }
  ],
  includedAddons: { move: ["oven", "fridge", "cabinets"] },

  frequencies: {
    once: { label: "One time", discount: 0 },
    biweekly: { label: "Every 2 weeks", discount: 10, recommended: true },
    weekly: { label: "Weekly", discount: 15 },
    monthly: { label: "Every 4 weeks", discount: 5 }
  },

  timeSlots: [
    { id: "morning", label: "Morning", time: "8 to 11am", start: 8 },
    { id: "midday", label: "Midday", time: "11am to 2pm", start: 11 },
    { id: "afternoon", label: "Afternoon", time: "2 to 5pm", start: 14 }
  ],
  openDays: [1, 2, 3, 4, 5, 6],   // 0 = Sunday
  daysAhead: 21,

  /* Where we clean, by postal code (first 3 characters). Requests from anywhere else are declined politely. */
  serviceArea: {
    label: "Scarborough & North York",
    districts: [
      { name: "Scarborough", prefixes: ["M1"] },
      { name: "North York", prefixes: ["M2H", "M2J", "M2K", "M2L", "M2M", "M2N", "M2P", "M2R", "M3A", "M3B", "M3C", "M3H", "M3J", "M3K", "M3L", "M3M", "M3N", "M4A", "M5M", "M6A", "M6B", "M6L", "M9L", "M9M"] }
    ]
  },

  /* Area pages, one per entry. */
  areas: [
    { slug: "scarborough", name: "Scarborough",
      neighbourhoods: ["Agincourt", "Malvern", "Wexford", "Highland Creek", "Guildwood", "Scarborough Village", "Birch Cliff", "Cliffside", "L'Amoreaux", "Morningside", "Woburn", "Bendale", "Clairlea", "Milliken", "Rouge"],
      intro: "Life in Scarborough moves fast. Between the commute, long workdays and full family calendars, cleaning is the job that always slides to the weekend. We're based right here, so our house cleaning in Scarborough comes with our widest choice of days and arrival windows, and a properly cared-for home without giving up your Saturday." },
    { slug: "north-york", name: "North York",
      neighbourhoods: ["Willowdale", "Don Mills", "York Mills", "Bayview Village", "Newtonbrook", "Bathurst Manor", "Downsview", "Parkwoods", "Flemingdon Park", "Hillcrest Village", "Lawrence Manor", "Bedford Park", "Victoria Village"],
      intro: "North York never really slows down. Whether you're in a Willowdale condo, working from home in Don Mills or juggling a full house in York Mills, free time is hard to come by. Our house cleaning in North York runs Monday to Saturday, so your evenings and weekends go back to the things that matter to you." }
  ],

  /* Room-by-room checklist: [task, regular, deep, move] with "yes", "add" (add-on) or "". */
  checklist: [
    { room: "Kitchen", tasks: [
      ["Counters and backsplash wiped", "yes", "yes", "yes"],
      ["Sink and taps cleaned and shined", "yes", "yes", "yes"],
      ["Stovetop degreased", "yes", "yes", "yes"],
      ["Appliance fronts and handles", "yes", "yes", "yes"],
      ["Microwave inside and out", "", "yes", "yes"],
      ["Cabinet fronts wiped", "", "yes", "yes"],
      ["Inside cabinets and drawers", "add", "add", "yes"],
      ["Inside fridge and oven", "add", "add", "yes"],
      ["Floors vacuumed and mopped", "yes", "yes", "yes"]
    ] },
    { room: "Bathrooms", tasks: [
      ["Toilet cleaned inside and out", "yes", "yes", "yes"],
      ["Tub, shower and glass", "yes", "yes", "yes"],
      ["Sink, counter and taps", "yes", "yes", "yes"],
      ["Mirrors polished", "yes", "yes", "yes"],
      ["Build-up removed from tile and grout", "", "yes", "yes"],
      ["Fixtures descaled", "", "yes", "yes"],
      ["Inside vanity and drawers", "", "", "yes"],
      ["Floors washed", "yes", "yes", "yes"]
    ] },
    { room: "Bedrooms & living", tasks: [
      ["Reachable surfaces and décor dusted", "yes", "yes", "yes"],
      ["Beds made", "yes", "yes", ""],
      ["Mirrors and glass", "yes", "yes", "yes"],
      ["Floors vacuumed and mopped", "yes", "yes", "yes"],
      ["Baseboards and door frames", "", "yes", "yes"],
      ["Switches and door handles", "", "yes", "yes"],
      ["Under and behind movable furniture", "", "yes", "yes"],
      ["Window sills and vents", "", "yes", "yes"],
      ["Inside closets", "", "", "yes"]
    ] },
    { room: "Whole home", tasks: [
      ["Bins emptied", "yes", "yes", "yes"],
      ["Entryway and stairs", "yes", "yes", "yes"],
      ["Walls spot-cleaned", "add", "add", "yes"],
      ["Interior windows", "add", "add", "add"],
      ["Laundry, wash and fold", "add", "add", ""],
      ["Balcony or patio", "add", "add", "add"]
    ] }
  ],

  /* FAQs. "on" lists where each appears: home, regular, deep, move, detail, residence, office, area. */
  faqs: [
    { q: "How is my price calculated?", a: "Your price is based on the service, the number of bedrooms and bathrooms, the type of home and any extras you add. You see it before you book. If your home needs much more or less time than expected, we tell you before we start, never after.", on: ["home", "regular", "deep", "move", "detail", "area"] },
    { q: "Do I pay when I book?", a: "No. There's no deposit. You pay after the clean by Interac e-Transfer, credit or debit card, or cash.", on: ["home", "regular", "deep", "move", "detail", "area"] },
    { q: "What if something is missed?", a: "Tell us within 24 hours and we'll come back and re-clean those areas, free of charge.", on: ["home", "regular", "deep", "move", "detail", "residence", "area"] },
    { q: "Do you bring supplies and equipment?", a: "Yes. We bring cloths, mops, a vacuum and our products. If you'd like us to use your own products, or need fragrance-free, add it to your booking notes.", on: ["home", "regular", "deep", "detail", "office"] },
    { q: "Do I need to be home?", a: "No. Many clients leave access with a concierge, lockbox or key code. Choose how we get in when you book and we'll confirm the details by text.", on: ["home", "regular", "deep", "area"] },
    { q: "Can I reschedule or cancel?", a: "Yes. Text us at least 24 hours before your arrival window and there's no charge.", on: ["home", "regular", "deep", "move", "detail", "office", "area"] },
    { q: "Are pets OK?", a: "Absolutely. Tell us about them when you book. For heavy shedding, add the pet hair extra so we schedule enough time.", on: ["home", "regular", "deep"] },
    { q: "Why do you wear house shoes?", a: "Street shoes carry grit and salt, especially in a Toronto winter. We change into indoor-only shoes at your door, so your floors only meet clean soles.", on: ["home", "residence"] },
    { q: "Should I book a deep clean first?", a: "If your home hasn't had a professional clean in the last few months, yes. A deep clean resets the build-up so every regular visit after it stays quick and consistent.", on: ["regular", "deep"] },
    { q: "Is the oven and fridge included in a move-out clean?", a: "Yes. Inside the fridge, oven, cabinets, drawers and closets are all included in a move-in or move-out clean.", on: ["move"] },
    { q: "Does the home need to be empty?", a: "For a move-in or move-out clean, it's best if furniture and boxes are out so we can reach every surface. If some items remain, mention it in your notes.", on: ["move"] },
    { q: "How long does a residence walkthrough take?", a: "Usually 20 to 30 minutes. We walk each room with you, note surfaces and priorities, and send a written care plan and quote afterwards.", on: ["residence"] },
    { q: "Can you clean outside business hours?", a: "Tell us what suits your business in the quote form. We'll confirm the times we can offer in your quote.", on: ["office"] },
    { q: "Do I need a contract?", a: "No contract is needed to start. Most offices begin with a single visit, then choose a schedule.", on: ["office"] },
    { q: "Which areas do you serve?", a: "Scarborough and North York. Enter your postal code on the site to check. If you're just outside these areas, call or text and we'll tell you honestly whether we can help.", on: ["home", "area", "residence", "office"] }
  ],

  /* Service policies shown on the Service Policies page. Confirm these before launch. */
  policies: {
    effectiveDate: "October 18, 2026",
    cancelNoticeHours: 24,
    lateCancelFee: "up to 50% of the estimated price",
    recleanWindowHours: 24,
    damageReportHours: 48,
    accessCodeDeleteDays: 7
  },

  /* Real reviews only. Add them as they come in:
     { name: "Priya S.", area: "Agincourt", rating: 5, service: "Deep Cleaning", text: "..." } */
  reviews: [],

  /* The vision page (/vision/), written in Mann's voice. Edit freely, then run `node tools/build.mjs`.
     Keep every "always" and "never" true: each one is a public promise. */
  vision: {
    headline: "Home is for rest.",
    intro: "Nest & Rest exists to give families in Scarborough and North York their time back, and to set a new standard for the care that comes into your home. Here is what we believe, what we promise, and where we're going.",
    letter: [
      "For most families, a clean home is something you earn on the weekend. Saturday goes to the bathrooms and the floors, and rest waits until the list is done. Often, it never is.",
      "I started Nest & Rest because I think that trade is backwards. Your home should give you rest, not take it away. Every hour spent scrubbing is an hour not spent with your kids, your parents, your friends or yourself.",
      "So I take the list off your hands. I do it the same careful way every visit, so you never have to check, and I hold Nest & Rest to the promises on this page. I would rather grow slowly and keep them than grow quickly and break them.",
      "Today, I clean every home myself. When there are a hundred of us, every clean will still carry my name."
    ],
    beliefs: [
      { title: "Rest is the real product.", text: "Cleaning is how we deliver it. We measure ourselves by the hours a family gets back, not the rooms we finish." },
      { title: "Trust is earned at the door.", text: "Who walks into your home matters as much as what they do there. So every visit begins and ends the same way, and we publish exactly how." },
      { title: "Care is a craft.", text: "Cleaning well is skilled work. The people who do it deserve proper training, the right tools, and to be introduced by name." },
      { title: "Small promises, kept, become a reputation.", text: "Your price before you book. Payment after it's done. Every rating published. Kept every visit, these are worth more than any advertisement." }
    ],
    always: [
      "Your exact price before you book",
      "Nothing to pay until the clean is done",
      "You'll know who is coming, by name",
      "A free re-clean if anything isn't right",
      "Every rating published, not only the good ones"
    ],
    never: [
      "A deposit to hold your booking",
      "A price change after we start",
      "Street shoes on your floors",
      "Keys copied, or codes written on them",
      "A paid, filtered or hidden review"
    ],
    chapters: [
      { when: "Now", title: "Our founding households", text: "I clean every home myself, for the first families in Scarborough and North York to trust Nest & Rest. Their feedback shapes everything: the checklist, the timing, the standard itself." },
      { when: "Next", title: "A team that carries the standard", text: "When I hire, every person will be trained in the standard by me, and you'll see the same familiar face in your home whenever possible." },
      { when: "Then", title: "Toronto's standard for home care", text: "The name families across Toronto trust with their keys. We'll grow one neighbourhood at a time, and only as fast as we can keep every promise on this page." }
    ],
    join: "Right now, I clean every home myself. When Nest & Rest grows, the first people I hire will be people who take pride in careful work. If that's you, introduce yourself now and I'll be in touch when the time comes."
  },

  /* The one number we measure ourselves by. Shown on /vision/ once it's above 0.
     hoursGivenBack: total hours on site across completed cleans. households: homes cleaned so far. */
  impact: {
    hoursGivenBack: 0,
    households: 0
  }
};
