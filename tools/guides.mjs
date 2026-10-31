// The helpful articles at /guides/<slug>/. Prices come from js/config.js, so they stay current after a rebuild.
// Each article: slug, title (for Google), h1, description, kicker, minutes (reading time), photo, body(L) as HTML.
export default function guides({ C, B, esc, money, price, listJoin, afterDiscount, ic }) {
  const R = C.services.regular, D = C.services.deep, M = C.services.move;
  const fr = C.frequencies;
  const planPrice = (k) => money(afterDiscount(price("regular", 2, 1), fr[k].discount));
  const pct = (h) => Math.round((C.homeTypes[h].factor - 1) * 100) + "%";
  const moveTasks = C.checklist.map((r) => ({ room: r.room, tasks: r.tasks.filter((t) => t[3] === "yes").map((t) => t[0]) })).filter((r) => r.tasks.length);
  const deepOnly = C.checklist.flatMap((r) => r.tasks.filter((t) => t[2] === "yes" && t[1] !== "yes").map((t) => t[0]));
  const cta = (L, text = "See your price") => `<p class="article-cta"><a class="btn btn-primary" href="${L("book/")}" data-track="book_click">${esc(text)}</a> <a class="text-link" href="${L("pricing/")}">All prices ${ic("i-arrow")}</a></p>`;
  const ul = (items) => `<ul class="article-list">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

  return [
    {
      slug: "house-cleaning-cost-toronto",
      title: "How Much Does House Cleaning Cost in Toronto? (2026)",
      h1: "How much does house cleaning cost in Toronto?",
      kicker: "Pricing guide",
      minutes: 5,
      photo: "living-room",
      description: `What sets the price of a home clean in Toronto, real example prices for Scarborough and North York, and how to compare quotes fairly.`,
      body: (L) => `
<p class="article-lede">Most Toronto cleaning companies price a visit by the size of the home, the type of clean and how often you book. Here's what moves the number, with our own prices as worked examples, so you can compare any quote with confidence.</p>

<h2>The five things that set the price</h2>
<ol class="article-steps">
  <li><strong>Size.</strong> Bedrooms and bathrooms are the best predictor of time on site. Bathrooms take the longest per square foot, so each extra bathroom adds more than you might expect.</li>
  <li><strong>Type of home.</strong> A townhouse or house has stairs, more floor space and more entrances than a condo with the same bedrooms. We add ${pct("town")} for a townhouse and ${pct("house")} for a house.</li>
  <li><strong>Type of clean.</strong> A regular clean keeps a home right. A deep clean adds the detail work that builds up over months, and a move-out clean covers an empty home inside every cabinet and closet.</li>
  <li><strong>How often.</strong> Regular visits cost less each time, because the home never falls far behind. Our plans save ${fr.monthly.discount}% every 4 weeks, ${fr.biweekly.discount}% every 2 weeks and ${fr.weekly.discount}% weekly.</li>
  <li><strong>Extras.</strong> Inside the oven or fridge, interior windows and laundry are usually priced separately, so you only pay for what you need.</li>
</ol>

<h2>Example prices in Scarborough and North York</h2>
<p>These are our prices for a condo or apartment, products and equipment included. A first visit for a founding household is ${C.offers.founding.percent}% less.</p>
<div class="table-scroll"><table class="price-table">
  <thead><tr><th scope="col">Home</th><th scope="col">Regular</th><th scope="col">Deep</th><th scope="col">Move-out</th></tr></thead>
  <tbody>${[[1, 1], [2, 1], [2, 2], [3, 2]].map(([bd, ba]) => `<tr><th scope="row">${bd} bed, ${ba} bath</th><td data-price="regular:${bd}:${ba}:condo">${money(price("regular", bd, ba))}</td><td data-price="deep:${bd}:${ba}:condo">${money(price("deep", bd, ba))}</td><td data-price="move:${bd}:${ba}:condo">${money(price("move", bd, ba))}</td></tr>`).join("")}</tbody>
</table></div>
<p class="fine">Prices in ${C.currency}. Townhouses add ${pct("town")} and houses ${pct("house")}.</p>

<h2>Hourly or flat price?</h2>
<p>Some companies charge by the hour, others quote a flat price. Hourly can look cheaper until the clean runs long. A flat price, set from your home's size before you book, tells you the total up front. Ours is flat: if your home needs much more or less time than expected, we tell you and agree the price before we start, never after.</p>

<h2>How to compare two quotes fairly</h2>
${ul([
  "<strong>Is tax included?</strong> Many companies quote before 13% HST. Ask whether the number is the final number.",
  "<strong>Are supplies included?</strong> Products, cloths, mops and a vacuum should be part of the price.",
  "<strong>What does the clean include?</strong> Compare the room-by-room list, not just the name of the service.",
  "<strong>Is there a deposit?</strong> And what does it cost to cancel or reschedule?",
  "<strong>What if something is missed?</strong> A free re-clean within a day or two is a good sign."
])}
<p>Our answers: no HST is added today, supplies are included, every service has a <a href="${L("pricing/#compare")}">room-by-room list</a>, there's no deposit, changes are free up to ${C.policies.cancelNoticeHours} hours before, and if we miss a spot, report it within ${C.policies.recleanWindowHours} hours of your clean and we'll re-clean it free.</p>
${cta(L)}`
    },
    {
      slug: "move-out-cleaning-checklist",
      title: "Move-Out Cleaning Checklist for Toronto Renters",
      h1: "Move-out cleaning checklist for Toronto renters",
      kicker: "Checklist",
      minutes: 6,
      photo: "entryway",
      description: "A room-by-room move-out cleaning checklist for Toronto apartments and condos, what Ontario's rules mean for tenants, and when to book.",
      body: (L) => `
<p class="article-lede">Handing back keys goes smoother when the unit is genuinely clean. Here's the full room-by-room list we work through on every move-out clean, plus what's worth knowing about Ontario's rules and the timing on the day.</p>

<h2>What Ontario's rules mean for a move-out clean</h2>
<p>In Ontario, a landlord can't take a damage deposit. The deposits allowed are a rent deposit, usually last month's rent, and a refundable key deposit. Under the <em>Residential Tenancies Act</em>, tenants are responsible for the ordinary cleanliness of the unit, and a clean unit makes the final walk-through and the handover easier for everyone. This is general information, not legal advice. For your own situation, see <a href="https://www.ontario.ca/page/renting-ontario-your-rights" rel="noopener" target="_blank">Renting in Ontario: your rights</a>.</p>

<h2>The room-by-room checklist</h2>
<div class="article-checklist">
${moveTasks.map((r) => `<div class="incl-room"><h3>${esc(r.room)}</h3><ul>${r.tasks.map((t) => `<li><svg class="ic" aria-hidden="true"><use href="#i-check"/></svg><span>${esc(t)}</span></li>`).join("")}</ul></div>`).join("")}
</div>
<p>Inside the fridge, oven, cabinets, drawers and closets are all included in our <a href="${L("services/move-in-move-out-cleaning/")}">move-in and move-out clean</a>, from ${money(M.base)}.</p>

<h2>Timing it on moving day</h2>
${ul([
  "<strong>Clean after the movers, not before.</strong> Book the clean for the afternoon once everything is out, or the day after.",
  "<strong>Keep the power and water on</strong> until the clean is finished. Hot water makes a real difference in kitchens and bathrooms.",
  "<strong>Condo? Tell the concierge.</strong> Some buildings ask for cleaners to be registered. Mention it when you book and we'll handle the check-in.",
  "<strong>Leave a key or code.</strong> You don't need to be there. A lockbox or the concierge works well.",
  "<strong>Take the garbage out.</strong> Leftover furniture, boxes and bulk garbage aren't part of a clean, so arrange removal first."
])}

<h2>Do it yourself, or book it?</h2>
<p>A thorough move-out clean of a two-bedroom apartment takes one person most of a day. If you're also packing, moving and starting somewhere new, that day is often worth more than the cost. Either way, the list above is the standard to aim for.</p>
${cta(L, "Book a move-out clean")}`
    },
    {
      slug: "deep-cleaning-vs-regular-cleaning",
      title: "Deep Cleaning vs Regular Cleaning: What's the Difference?",
      h1: "Deep cleaning vs regular cleaning: what's the difference?",
      kicker: "Explainer",
      minutes: 4,
      photo: "bathroom",
      description: "What a deep clean adds over a regular clean, how long each takes, what they cost in Scarborough and North York, and which one to book.",
      body: (L) => `
<p class="article-lede">A regular clean keeps a home right. A deep clean puts it right first. Here's exactly what the difference is, and how to choose.</p>

<h2>What a regular clean covers</h2>
<p>Every room you live in, the same careful way each visit: counters, sinks and taps, the stovetop and appliance fronts, toilets, tubs and showers, mirrors, dusting, beds made, bins emptied, and floors vacuumed and mopped. A 1-bedroom condo takes about ${R.hours} hours, from ${money(R.base)}.</p>

<h2>What a deep clean adds</h2>
<p>Everything in a regular clean, plus the detail work that builds up over months:</p>
${ul(deepOnly.map(esc))}
<p>Plan on about ${D.hours} hours for a 1-bedroom condo, from ${money(D.base)}.</p>

<h2>Which should you book?</h2>
${ul([
  "<strong>Book a deep clean</strong> if your home hasn't had a professional clean in the last few months, before hosting or a holiday, or as a spring reset.",
  "<strong>Book a regular clean</strong> if your home is already in good shape and you want it to stay that way.",
  "<strong>Starting a regular plan?</strong> Begin with one deep clean. Every regular visit after it is quicker and more consistent, because the build-up is gone."
])}
<p>See the two side by side in our <a href="${L("pricing/#compare")}">room-by-room comparison</a>.</p>
${cta(L)}`
    },
    {
      slug: "how-to-prepare-for-a-house-cleaner",
      title: "How to Prepare for a House Cleaner (and What to Skip)",
      h1: "How to get your home ready for a cleaner",
      kicker: "Tips",
      minutes: 3,
      photo: "kitchen",
      description: "Eight simple ways to get the most out of a home cleaning visit, and the things you don't need to do before the cleaner arrives.",
      body: (L) => `
<p class="article-lede">You don't need to clean before the cleaner comes. But ten minutes of preparation means more of the visit goes into the rooms you care about.</p>

<h2>Eight things that help</h2>
<ol class="article-steps">
  <li><strong>Pick up the clutter.</strong> Clothes, toys and papers off the floors and counters let us reach the surfaces underneath.</li>
  <li><strong>Tell us your priorities.</strong> The kitchen before guests? The bathrooms? We start with a quick word on what matters most today.</li>
  <li><strong>Sort out access.</strong> Home, concierge, lockbox or key code. Choose when you book and we'll confirm by text.</li>
  <li><strong>Mention pets.</strong> Let us know about pets, and keep anxious ones in a quiet room while we work.</li>
  <li><strong>Put away valuables and fragile keepsakes</strong>, or tell us which ones to leave alone.</li>
  <li><strong>Note parking.</strong> Visitor parking, a driveway spot or which buzzer to press saves time at the start. Send door and lockbox codes by text once your booking is confirmed, never in the booking form.</li>
  <li><strong>Empty the dishwasher and sink</strong> if you'd like the counters and sink detailed.</li>
  <li><strong>Add extras when you book</strong>, like inside the oven or fridge, so we schedule enough time.</li>
</ol>

<h2>What you can skip</h2>
${ul([
  "Buying supplies. We bring cloths, mops, a vacuum and our products. Prefer your own products, or need fragrance-free? Just say so in your booking notes.",
  "Pre-cleaning. That's our job.",
  "Being home. You can leave access and come home to it done."
])}
<p>One more thing: we change into indoor-only house shoes at your door, so you don't need to worry about street shoes on your floors.</p>
${cta(L)}`
    },
    {
      slug: "how-often-should-you-clean-your-home",
      title: "How Often Should You Have Your Home Cleaned?",
      h1: "How often should you have your home cleaned?",
      kicker: "Guide",
      minutes: 4,
      photo: "bedroom",
      description: "Weekly, every two weeks or every four weeks: how to choose a home cleaning schedule for your household, with example prices.",
      body: (L) => `
<p class="article-lede">The right schedule depends on who lives in your home and how it's used. Here's a simple way to choose, with what each plan costs for a 2-bedroom, 1-bathroom condo.</p>

<h2>Weekly: ${planPrice("weekly")} a visit</h2>
<p>Best for families with young children, homes with pets that shed, and anyone who wants the home right every single day. The home never falls behind, so every visit is about keeping it fresh. Saves ${fr.weekly.discount}%.</p>

<h2>Every 2 weeks: ${planPrice("biweekly")} a visit</h2>
<p>The one we recommend for most households. Busy couples and small families find it's the point where the home stays consistently clean without cleaning becoming a weekly event. Saves ${fr.biweekly.discount}%.</p>

<h2>Every 4 weeks: ${planPrice("monthly")} a visit</h2>
<p>Good for one or two people who keep up with daily tidying and want a thorough reset each month: bathrooms, kitchen, floors and dusting done properly. Saves ${fr.monthly.discount}%.</p>

<h2>One time: ${money(price("regular", 2, 1))}</h2>
<p>Before guests, after a busy stretch, or to try us out. If it's been a while since your last professional clean, book a <a href="${L("services/deep-cleaning/")}">deep clean</a> first.</p>

<h2>Change it whenever life changes</h2>
<p>Plans aren't contracts. Pause, skip or change your schedule with ${C.policies.cancelNoticeHours} hours' notice, by ${B.phone ? "text or WhatsApp" : "email"}.</p>
${cta(L, "Choose your plan")}`
    }
  ];
}
