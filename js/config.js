/*
  Nest & Rest Cleaning: site settings.
  Everything a business owner normally changes lives in this one file:
  contact details, prices, offers, service area, booking delivery and reviews.
  Edit the values, save, and redeploy. No other file needs to change.
*/
window.NR_CONFIG = {
  business: {
    name: "Nest & Rest Cleaning",
    owner: "Mann Patel",
    ownerFirstName: "Mann",
    phoneDisplay: "+1 647 978 6903",
    phone: "+16479786903",
    email: "nestnrestcleaning@gmail.com",
    base: "Scarborough, Toronto",
    hours: "Mon to Sat, 8am to 6pm",
    replyPromise: "within 2 hours during business hours",
    // Paste your Google Business Profile "Ask for reviews" link here once it exists.
    googleReviewUrl: "",
    instagramUrl: "",
    facebookUrl: ""
  },

  /* Where booking requests and reviews are delivered.
     "formsubmit" emails every request to the address below through formsubmit.co (free, no account).
     The very first request triggers a one-time activation email to that inbox: click "Activate".
     Set provider to "none" to skip the email relay and only offer text / email buttons. */
  delivery: {
    provider: "formsubmit",
    endpoint: "https://formsubmit.co/ajax/nestnrestcleaning@gmail.com"
  },

  /* Extra trust badges. Only switch one to true once it's actually true for your business:
     the badge then appears in the strip under the headline. */
  badges: {
    insured: false,            // you hold business liability insurance
    ecoProducts: false,        // your products are eco-friendly and pet-safe
    backgroundChecked: false   // every cleaner has a police background check
  },

  currency: "CAD",
  // Small suppliers (under $30,000 in 12 months) don't have to charge HST in Ontario.
  // Once you register for HST, set taxRate to 0.13.
  taxRate: 0,

  offers: {
    founding: {
      active: true,
      label: "Founding Client offer",
      percent: 20,
      spots: 50,
      text: "20% off your first clean for our first 50 clients."
    },
    reviewThanks: 15,     // $ off the next clean for an honest review
    referral: 25          // $ credit each for referrer and friend
  },

  /* Pricing model: base + per extra bedroom + per extra bathroom, then a home-type factor.
     The base covers a 1-bedroom (or studio), 1-bathroom home. */
  homeTypes: {
    condo: { label: "Condo or apartment", factor: 1 },
    town: { label: "Townhouse", factor: 1.1 },
    house: { label: "House", factor: 1.2 }
  },

  services: {
    regular: {
      name: "Regular Home Cleaning",
      short: "Keep-it-fresh clean for lived-in homes",
      base: 110, perBed: 25, perBath: 20, hours: 2,
      recurring: true,
      includes: [
        "Dust all reachable surfaces, ledges and décor",
        "Vacuum and mop all floors",
        "Kitchen counters, sink, stovetop and appliance fronts",
        "Bathrooms: toilet, tub or shower, sink, mirrors",
        "Make beds, empty bins, tidy common areas"
      ]
    },
    deep: {
      name: "Deep Cleaning",
      short: "Top-to-bottom reset, ideal for a first visit",
      tag: "Best for a first visit",
      base: 199, perBed: 40, perBath: 35, hours: 4,
      recurring: false,
      includes: [
        "Everything in a regular clean",
        "Baseboards, door frames, switches and handles",
        "Build-up removed from tile, grout and fixtures",
        "Behind and under movable furniture",
        "Cabinet fronts, window sills and vents"
      ]
    },
    move: {
      name: "Move-In / Move-Out",
      short: "Empty-home clean for keys, deposits and fresh starts",
      tag: "Fridge and oven included",
      base: 249, perBed: 50, perBath: 40, hours: 5,
      recurring: false,
      includes: [
        "Deep clean of every room, top to bottom",
        "Inside all cabinets, drawers and closets",
        "Inside fridge and oven included",
        "Walls spot-cleaned, baseboards washed",
        "Ready for the landlord walk-through"
      ]
    },
    detail: {
      name: "Kitchen & Bath Detailing",
      short: "Just the hard-working rooms, done properly",
      tag: "Great between regular cleans",
      base: 139, perBed: 0, perBath: 55, hours: 2.5,
      recurring: false,
      includes: [
        "Degrease backsplash, hood and stovetop",
        "Descale taps, shower glass and fixtures",
        "Scrub tile and grout lines",
        "Sanitize sinks, counters and toilets",
        "Polish appliance fronts and mirrors"
      ]
    }
  },

  addons: [
    { id: "oven", name: "Inside oven", price: 35, hours: 0.5 },
    { id: "fridge", name: "Inside fridge", price: 35, hours: 0.5 },
    { id: "cabinets", name: "Inside kitchen cabinets", price: 45, hours: 0.75 },
    { id: "windows", name: "Interior windows", price: 40, hours: 0.75 },
    { id: "walls", name: "Wall spot cleaning", price: 25, hours: 0.5 },
    { id: "laundry", name: "Laundry, wash and fold (1 load)", price: 25, hours: 0.5 },
    { id: "balcony", name: "Balcony or patio sweep", price: 30, hours: 0.5 },
    { id: "pets", name: "Heavy pet hair", price: 20, hours: 0.5 }
  ],

  frequencies: {
    once: { label: "One time", discount: 0 },
    weekly: { label: "Weekly", discount: 15 },
    biweekly: { label: "Every 2 weeks", discount: 10 },
    monthly: { label: "Every 4 weeks", discount: 5 }
  },

  // Arrival windows and open days (0 = Sunday ... 6 = Saturday).
  timeSlots: [
    { id: "morning", label: "Morning", time: "8 to 11am" },
    { id: "midday", label: "Midday", time: "11am to 2pm" },
    { id: "afternoon", label: "Afternoon", time: "2 to 5pm" }
  ],
  openDays: [1, 2, 3, 4, 5, 6],
  daysAhead: 21,

  /* Service area by postal code prefix (first 3 characters). */
  serviceArea: {
    home: { prefixes: ["M1"], label: "Scarborough", note: "Home turf. No travel fee." },
    city: { prefixes: ["M"], label: "Toronto", note: "Covered across the city." },
    extended: {
      label: "Greater Toronto Area",
      travelFee: 15,
      prefixes: [
        "L1S", "L1T", "L1Z",                                   // Ajax
        "L1V", "L1W", "L1X", "L1Y",                            // Pickering
        "L1M", "L1N", "L1P", "L1R",                            // Whitby
        "L3P", "L3R", "L3S", "L3T", "L6B", "L6C", "L6E", "L6G", // Markham
        "L4B", "L4C", "L4E", "L4S",                            // Richmond Hill
        "L4H", "L4J", "L4K", "L4L", "L6A",                     // Vaughan
        "L4T", "L4V", "L4W", "L4X", "L4Y", "L4Z", "L5A", "L5B", "L5C", "L5E", "L5G",
        "L5H", "L5J", "L5K", "L5L", "L5M", "L5N", "L5R", "L5V", "L5W" // Mississauga
      ]
    },
    areas: ["Scarborough", "North York", "East York", "Old Toronto", "Etobicoke", "York",
            "Markham", "Pickering", "Ajax", "Whitby", "Richmond Hill", "Vaughan", "Mississauga"]
  },

  /* Room-by-room checklist. For each task: [task, regular, deep, move]
     using "yes" (included), "add" (available as an add-on) or "" (not part of that clean). */
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
      ["Balcony or patio sweep", "add", "add", "add"]
    ] }
  ],

  /* Small office cleaning: quote only, no instant price. */
  office: {
    includes: [
      "Desks, shelves and electronics dusted",
      "Washrooms cleaned and sanitized",
      "Kitchenette or break room cleaned",
      "High-touch points: handles, switches, phones",
      "Floors vacuumed and mopped",
      "Bins emptied and liners replaced"
    ],
    types: ["Office", "Clinic or dental office", "Studio or gym", "Retail shop", "Other"],
    sizes: ["Under 1,000 sq ft", "1,000 to 2,500 sq ft", "2,500 to 5,000 sq ft", "Over 5,000 sq ft"],
    frequencies: ["One time", "Weekly", "2 to 3 times a week", "Every weekday", "Every 2 weeks"],
    replyPromise: "within one business day"
  },

  /* Real reviews only. Add them here as they come in, for example:
     { name: "Priya S.", area: "Agincourt", rating: 5, service: "Deep Cleaning", text: "...", date: "2026-11-02" } */
  reviews: []
};
