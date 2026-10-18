/*
  Nest & Rest Cleaning: site settings.
  Prices, services, offers, areas, FAQs and contact details all live here.
  Prices, offers and contact details update on every page as soon as this file is saved.
  New pages (a new service or area) need a rebuild: run `node tools/build.mjs`.
*/
window.NR_CONFIG = {
  siteUrl: "https://mannp6903.github.io/nestandrestcleaning",

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
    reviewThanks: 15,
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
      short: "For larger homes and fine finishes: a walkthrough, a written care plan, the same team each visit.",
      intro: "For homes over about 3,000 square feet, or homes with natural stone, marble, hardwood and glass that need the right product on the right surface. We start with a walkthrough, write a room-by-room care plan, and keep the same team on your home whenever possible.",
      includes: [
        "In-person walkthrough before the first visit",
        "Written room-by-room care plan",
        "Surface-appropriate products for stone, marble, wood and glass",
        "The same team each visit whenever possible",
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

  /* Postal-code coverage (first 3 characters). */
  serviceArea: {
    home: { prefixes: ["M1"], label: "Scarborough", note: "Home turf. No travel fee." },
    city: { prefixes: ["M"], label: "Toronto", note: "Covered across the city." },
    extended: {
      label: "Greater Toronto Area",
      travelFee: 15,
      prefixes: [
        "L1S", "L1T", "L1Z", "L1V", "L1W", "L1X", "L1Y", "L1M", "L1N", "L1P", "L1R",
        "L3P", "L3R", "L3S", "L3T", "L6B", "L6C", "L6E", "L6G",
        "L4B", "L4C", "L4E", "L4S", "L4H", "L4J", "L4K", "L4L", "L6A",
        "L4T", "L4V", "L4W", "L4X", "L4Y", "L4Z", "L5A", "L5B", "L5C", "L5E", "L5G",
        "L5H", "L5J", "L5K", "L5L", "L5M", "L5N", "L5R", "L5V", "L5W"
      ]
    }
  },

  /* Area pages, one per entry. */
  areas: [
    { slug: "scarborough", name: "Scarborough", zone: "home",
      neighbourhoods: ["Agincourt", "Malvern", "Wexford", "Highland Creek", "Guildwood", "Scarborough Village", "Birch Cliff", "Cliffside", "L'Amoreaux", "Morningside", "Woburn", "Bendale", "Clairlea", "Milliken", "Rouge"],
      intro: "Scarborough is home. We're based here, so Scarborough homes get the most availability and never pay a travel fee." },
    { slug: "north-york", name: "North York", zone: "city",
      neighbourhoods: ["Willowdale", "Don Mills", "York Mills", "Bayview Village", "Newtonbrook", "Bathurst Manor", "Downsview", "Parkwoods", "Flemingdon Park", "Hillcrest Village"],
      intro: "From Willowdale condos to family homes in Don Mills and York Mills, we clean across North York with no travel fee." },
    { slug: "east-york", name: "East York", zone: "city",
      neighbourhoods: ["Leaside", "Thorncliffe Park", "Pape Village", "Woodbine Heights", "Topham Park", "O'Connor–Parkview"],
      intro: "Leaside, Thorncliffe and the streets between: East York is a short drive from our Scarborough base, with no travel fee." },
    { slug: "toronto", name: "Downtown & Midtown Toronto", zone: "city",
      neighbourhoods: ["The Beaches", "Leslieville", "Riverdale", "The Annex", "Yorkville", "Rosedale", "Davisville", "Liberty Village", "CityPlace", "St. Lawrence"],
      intro: "Downtown condos and midtown homes, booked online in two minutes. Tell us about concierge, parking and buzzer codes when you book." },
    { slug: "markham", name: "Markham", zone: "extended",
      neighbourhoods: ["Unionville", "Markham Village", "Cornell", "Cathedraltown", "Berczy Village", "Milliken Mills", "Wismer", "Greensborough"],
      intro: "We cover Markham from Milliken Mills to Cornell. A small travel fee applies, shown in your price before you book." },
    { slug: "pickering", name: "Pickering", zone: "extended",
      neighbourhoods: ["Bay Ridges", "Amberlea", "Liverpool", "Rougemount", "Duffin Heights", "Brock Ridge", "Highbush", "Rosebank"],
      intro: "Just across the Rouge from Scarborough, Pickering homes are an easy visit for us. A small travel fee applies, shown before you book." },
    { slug: "ajax", name: "Ajax", zone: "extended",
      neighbourhoods: ["Pickering Village", "Nottingham", "Riverside", "Southwood", "Central East", "Northeast Ajax"],
      intro: "We clean homes across Ajax, from the lakeshore to the north end. A small travel fee applies, shown before you book." }
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
    { q: "Is there a travel fee?", a: "Not in Toronto. Homes in the extended GTA (Markham, Pickering, Ajax and nearby) have a small travel fee, shown in your price before you book.", on: ["area"] }
  ],

  /* Real reviews only. Add them as they come in:
     { name: "Priya S.", area: "Agincourt", rating: 5, service: "Deep Cleaning", text: "..." } */
  reviews: []
};
