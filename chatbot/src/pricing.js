// The website's price rule, for the chatbot. It is the same arithmetic as the booking form (js/site.js: price, hoursFor,
// addonStatus, quote) on the same settings (knowledge.json, written from js/config.js by tools/build.mjs), so the chatbot
// can only ever quote what the booking form would. tools/qa/chatbot.test.mjs checks it against the built price tables.

const roundTo = (n, step) => Math.round(n / step) * step;
const afterDiscount = (amount, pct) => Math.round(amount * (100 - pct) / 100);
const money = (n) => "$" + Math.round(n).toLocaleString("en-CA");

// Price for one visit, before extras and discounts: base + each extra bedroom + each extra bathroom, times the home type,
// rounded to $5. Kitchen & Bath Detailing is priced by bathrooms only.
export function basePrice(K, service, beds, baths, home) {
  const s = K.services[service], factor = K.homeTypes[home].factor;
  const b = service === "detail" ? 1 : beds;
  return roundTo((s.base + Math.max(0, b - 1) * s.perBed + Math.max(0, baths - 1) * s.perBath) * factor, 5);
}

// Hours on site with one cleaner, as the booking form estimates them.
export function hoursOnSite(K, service, beds, baths, home, extras = []) {
  const s = K.services[service], factor = K.homeTypes[home].factor;
  const b = service === "detail" ? 1 : beds;
  let h = s.hours * factor + (b - 1) * 0.5 + (baths - 1) * (service === "detail" ? 0.75 : 0.5);
  for (const a of extras) h += a.hours || 0;
  return Math.max(1.5, roundTo(h, 0.5));
}

// Whether an extra is included in a service, a paid extra, or not offered with it (the site's checklist rule).
export const extraStatus = (K, service, id) => (K.addons.find((a) => a.id === id) || {}).status?.[service] || "none";

// The link that opens the booking form with this home already filled in (the site's booking-link parameters). The plan is
// always in it, so a plan saved from an earlier visit doesn't change the price the visitor was just given.
export function bookingLink(K, { service, home, bedrooms, bathrooms, extras = [], plan }) {
  const q = new URLSearchParams({ s: service, h: home, bd: String(bedrooms), ba: String(bathrooms) });
  if (extras.length) q.set("x", extras.join(","));
  q.set("f", plan && K.services[service].recurring && K.frequencies[plan] ? plan : "once");
  return `${K.siteUrl}/book/?${q.toString()}`;
}

// A full quote, priced exactly like the booking form: one discount on the first visit (the larger of the founding offer
// and the plan's), the plan's discount on repeat visits, extras only where they're a paid extra for that service.
export function quote(K, input) {
  const service = input.service, home = input.home;
  if (!K.services[service]) return { error: `Unknown service. Choose one of: ${Object.keys(K.services).join(", ")}.` };
  if (!K.homeTypes[home]) return { error: `Unknown home type. Choose one of: ${Object.keys(K.homeTypes).join(", ")}.` };
  const s = K.services[service];
  const beds = service === "detail" ? 1 : Math.min(8, Math.max(1, Math.round(Number(input.bedrooms) || 1)));
  const baths = Math.min(6, Math.max(1, Math.round(Number(input.bathrooms) || 1)));
  const asked = [...new Set(Array.isArray(input.extras) ? input.extras : [])];
  const extras = asked.filter((id) => extraStatus(K, service, id) === "extra").map((id) => K.addons.find((a) => a.id === id));
  const included = asked.filter((id) => extraStatus(K, service, id) === "included").map((id) => K.addons.find((a) => a.id === id).name);
  const notOffered = asked.filter((id) => extraStatus(K, service, id) === "none").map((id) => (K.addons.find((a) => a.id === id) || { name: id }).name);
  const plan = s.recurring && K.frequencies[input.plan] ? input.plan : "once";
  const freq = K.frequencies[plan];
  const base = basePrice(K, service, beds, baths, home);
  const subtotal = base + extras.reduce((t, a) => t + a.price, 0);
  const founding = K.offers.founding && K.offers.founding.active ? K.offers.founding.percent : 0;
  const firstPct = Math.max(founding, freq.discount);
  const first = afterDiscount(subtotal, firstPct);
  const repeat = freq.discount ? afterDiscount(subtotal, freq.discount) : null;
  const hours = hoursOnSite(K, service, beds, baths, home, extras);
  const homeLabel = service === "detail" ? `kitchen and ${baths} bathroom${baths > 1 ? "s" : ""}, ${K.homeTypes[home].short.toLowerCase()}`
    : `${beds}-bedroom, ${baths}-bathroom ${K.homeTypes[home].short.toLowerCase()}`;
  return {
    service: s.name,
    home: homeLabel,
    regular_price: money(subtotal),
    first_visit_price: money(first),
    first_visit_discount: firstPct ? `${firstPct}% off (${founding >= freq.discount && founding ? "founding household offer" : freq.label.toLowerCase() + " plan"})` : "none",
    repeat_visit_price: repeat == null ? null : `${money(repeat)} a visit, ${freq.label.toLowerCase()}`,
    extras_added: extras.map((a) => `${a.name} +${money(a.price)}`),
    extras_already_included: included,
    extras_not_offered_with_this_service: notOffered,
    hours_on_site: hours,
    needs_owner_review: hours > 8,
    tax: K.taxRate ? `Prices are before ${Math.round(K.taxRate * 100)}% HST` : "No HST charged",
    note: `Estimate. ${K.business.ownerFirstName} confirms the final price before the clean. Nothing to pay until after it.`,
    booking_link: bookingLink(K, { service, home, bedrooms: beds, bathrooms: baths, extras: extras.map((a) => a.id), plan })
  };
}

// Whether a postal code is in the service area, by its first three characters (the site's postal check).
export function checkArea(K, postal) {
  const p = String(postal || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!/^[ABCEGHJ-NPRSTVXY]\d[A-Z]/.test(p)) return { valid: false, message: "That doesn't look like a Canadian postal code, like M1B 2K3." };
  const fsa = p.slice(0, 3);
  const district = K.serviceArea.districts.find((d) => d.prefixes.some((x) => fsa.startsWith(x)));
  return district
    ? { valid: true, in_area: true, fsa, district: district.name }
    : { valid: true, in_area: false, fsa, message: `${fsa} is outside ${K.serviceArea.label} for now. They can join the waitlist by email: ${K.business.email}.` };
}
