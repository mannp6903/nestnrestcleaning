// Generates every page of the site from js/config.js, tools/guides.mjs and the templates below.
// Usage: node tools/build.mjs            -> writes the site into the repo root
//        node tools/build.mjs --preview DIR -> writes a preview copy (artifact-friendly links)
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import guideList from "./guides.mjs";
import { heroWide, heroNarrow, districtScene } from "./landmarks.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const PREVIEW_DIR = args[0] === "--preview" ? path.resolve(args[1]) : null;
const OUT = PREVIEW_DIR || ROOT;

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "js/config.js"), "utf8"), sandbox);
const C = sandbox.window.NR_CONFIG;
const B = C.business;
const SITE = C.siteUrl.replace(/\/$/, "");
const BRAND_SHORT = "Nest & Rest";
// Where form requests go: "formsubmit" (email) or "sheet" (Mann's Google Sheet). NR_PROVIDER overrides it for tests.
const SHEET = (process.env.NR_PROVIDER || (C.delivery || {}).provider) === "sheet";
const SENT_VIA = SHEET
  ? "Your request is saved to our Google Sheet and emailed to our Gmail inbox (both Google), which may store data outside Canada."
  : "Your request is sent through FormSubmit to our Google email inbox, which may store data outside Canada.";
// Scripts are deferred on the live site so they never block the first paint. The preview inlines a flag between them, so it loads them in order instead.
const DEFER = PREVIEW_DIR ? "" : " defer";
const YEAR = new Date().getFullYear();
const TODAY = new Date().toISOString().slice(0, 10);
// Version tags from each file's contents, so browsers fetch the new CSS and JS as soon as a change is published.
const ver = (f) => crypto.createHash("sha1").update(fs.readFileSync(path.join(ROOT, f))).digest("hex").slice(0, 8);
const ASSET_V = { css: ver("css/site.css"), config: ver("js/config.js"), site: ver("js/site.js") };

/* ---------- helpers ---------- */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => "$" + Math.round(n).toLocaleString("en-CA");
// Joins sentences for a meta description, dropping trailing ones that would push it past what Google shows.
const metaDesc = (...parts) => parts.reduce((acc, p) => (acc ? acc + " " + p : p).length <= 160 ? (acc ? acc + " " + p : p) : acc, "");
const listJoin = (a) => a.length > 1 ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : a.join("");
const roundTo = (n, s) => Math.round(n / s) * s;
const svcKeys = Object.keys(C.services);
const quoteKeys = Object.keys(C.quoteServices);
const allServices = [...svcKeys.map((k) => ({ key: k, ...C.services[k], quote: false })), ...quoteKeys.map((k) => ({ key: k, ...C.quoteServices[k], quote: true }))];
const district = (slug) => C.areas.find((a) => a.slug === slug);
const hoodPages = C.neighbourhoods || [];
const hoodBySlug = Object.fromEntries(hoodPages.map((h) => [h.slug, h]));
const hoodPath = (h) => `areas/${h.district}/${h.slug}/`;
const hoodByName = (name) => hoodPages.find((h) => h.name === name);
const waLink = (msg) => B.whatsapp ? `https://wa.me/${B.whatsapp}?text=${encodeURIComponent(msg)}` : "";
const WA_HELLO = `Hi ${B.ownerFirstName}, I'd like to ask about a clean.`;
// Phone number: leave business.phone "" in js/config.js to keep it private. Every call and text link is then left out and email takes its place.
const PHONE = !!B.phone;
const founding = C.offers.founding;
const spotsLeft = founding ? Math.max(0, founding.spots - (founding.claimed || 0)) : 0;
// Live calendar: with a Cal.com link in booking.calLink, booking ends with picking a confirmed time.
const CAL = !!(C.booking && C.booking.calLink);
// Action words, one per stage: every way into the booking form, the price box (a price is calculated, so the day comes next),
// and the final send. Without the calendar a booking is a request Mann confirms, so the words say request.
const ACT = CAL
  ? { book: "Book a clean", short: "Book", again: "Book again", go: "Book this clean", send: "Choose your time", minutes: "Book in two minutes." }
  : { book: "Request a clean", short: "Request", again: "Request again", go: "Choose a preferred day", send: "Send cleaning request", minutes: "Request in two minutes." };
// Google Analytics runs only once analytics.ga4Id is set; the privacy policy describes it from then on.
const GA = !!(C.analytics && C.analytics.ga4Id);
// The business mailing address (CASL and Ontario's Consumer Protection Act). Shown everywhere once it's set in config.
const ADDR = (B.mailingAddress || "").trim();
const LATE_FEE_LINE = `Later changes, or if we can't get in at the agreed time, may cost ${esc(C.policies.lateCancelFee)}.`;
// One rounding rule, the same as js/site.js: a discounted price is rounded to the nearest dollar.
const afterDiscount = (amount, pct) => Math.round(amount * (100 - pct) / 100);
const TAX_TEXT = C.taxRate ? `Prices are before ${Math.round(C.taxRate * 100)}% HST` : "No HST charged";
// The re-clean guarantee: the hours are a window for reporting what was missed, so every mention says so.
const RECLEAN_H = C.policies.recleanWindowHours;
const GUARANTEE_LINE = `Report anything missed within ${RECLEAN_H} hours of your clean and I'll come back and re-clean those areas, free.`;
const SHOW_SPOTS = !!(founding && founding.showSpotsLeft);
// Opening hours for the facts row, from opens and closes: "9am–11pm". The label fits a third of a phone screen.
const clock = (t) => { const [h, m] = t.split(":").map(Number); return (h % 12 || 12) + (m ? ":" + String(m).padStart(2, "0") : "") + (h >= 12 ? "pm" : "am"); };
const OPEN_FACT = `<div><dt>${C.openDays.length === 7 ? "Open daily" : "Open"}</dt><dd>${clock(C.opens)}–${clock(C.closes)}</dd></div>`;
// How long the booking form keeps home choices on a device (the same as DRAFT_DAYS in js/site.js).
const DRAFT_DAYS = 14;
const jobs = C.jobs || [];
// FAQs about booking requests don't apply once the live calendar confirms times instantly.
C.faqs = C.faqs.filter((f) => !(CAL && f.requestsOnly));

/* ---------- scope: one rule for every extra ---------- */
// The checklist row an extra is linked to decides, per service: "included", "extra" (paid) or "none" (not offered).
// js/site.js applies the same rule in the booking form, so a page and the form can never disagree.
const taskRow = (task) => C.checklist.flatMap((r) => r.tasks).find((t) => t[0] === task);
for (const a of C.addons) {
  if (a.task && !taskRow(a.task)) throw new Error(`Extra "${a.id}" points at checklist task "${a.task}", which isn't in the checklist in js/config.js.`);
}
function addonStatus(key, id) {
  const a = C.addons.find((x) => x.id === id), s = C.services[key];
  if (!a || !s || !a.task || !s.checklistColumn) return "extra";
  const v = taskRow(a.task)[s.checklistColumn];
  return v === "yes" ? "included" : v === "add" ? "extra" : "none";
}
const addonsWith = (key, status) => C.addons.filter((a) => addonStatus(key, a.id) === status);
// ic is declared further down; the wrapper only reads it when a guide page is built.
const guides = guideList({ C, B, esc, money, price, listJoin, afterDiscount, ic: (...a) => ic(...a) });

function price(key, beds, baths, home = "condo") {
  const s = C.services[key];
  const f = C.homeTypes[home].factor;
  const b = key === "detail" ? 1 : beds;
  return roundTo((s.base + Math.max(0, b - 1) * s.perBed + Math.max(0, baths - 1) * s.perBath) * f, 5);
}
// What a price is for, said right above it: "Regular Cleaning · 1-bedroom, 1-bathroom condo". js/site.js (priceFor) words it the same way.
function priceFor(key, beds, baths, home = "condo") {
  const h = C.homeTypes[home].short.toLowerCase();
  return C.services[key].menuName + " · " + (key === "detail" ? `kitchen and ${baths} bathroom${baths > 1 ? "s" : ""}, ${h}` : `${beds}-bedroom, ${baths}-bathroom ${h}`);
}
function hours(key, beds, baths) {
  const s = C.services[key];
  const b = key === "detail" ? 1 : beds;
  return Math.max(1.5, roundTo(s.hours + (b - 1) * 0.5 + (baths - 1) * (key === "detail" ? 0.75 : 0.5), 0.5));
}

// Link builder: depth-relative, and explicit index.html in preview mode.
function linker(depth) {
  const up = depth ? "../".repeat(depth) : "";
  return (p = "") => {
    let [pathPart, hash] = p.split("#");
    let href = up + pathPart;
    if (PREVIEW_DIR && (pathPart === "" || pathPart.endsWith("/"))) href += "index.html";
    if (!PREVIEW_DIR && href === "") href = "./";
    return href + (hash ? "#" + hash : "");
  };
}

/* ---------- images ---------- */
// Room photos are AI-generated illustrations (see the footer note), never presented as client homes.
const PHOTOS = {
  "living-room": "A bright, tidy condo living room with a cream sofa, navy and teal cushions and a sunny window",
  kitchen: "A spotless kitchen counter and sink with a folded teal cloth and a glass spray bottle",
  bedroom: "A freshly made bed with white linen, a sand-coloured throw and navy and teal pillows",
  bathroom: "A clean white bathroom with a clear glass shower and folded towels on a wooden stool",
  entryway: "Grey house slippers on a doormat inside a navy front door, on a freshly mopped wooden floor",
  "empty-home": "An empty, freshly cleaned room on move-in day: a bare oak floor, white walls and an empty closet with its doors open",
  // A close-up result, so a deep clean looks different from a regular one. Describe the real photo here once it's in.
  "deep-detail": "A close-up of a degreased stovetop and a spotless tiled backsplash after a deep clean"
};
// A photo is used once all four of its files are in assets/photos (600 and 928 wide, JPEG and WebP).
// Until then a page keeps the photo it had, so a new photo can be dropped in without touching the code.
const hasPhoto = (name) => ["-600.jpg", "-600.webp", "-928.jpg", "-928.webp"].every((x) => fs.existsSync(path.join(ROOT, "assets/photos", name + x)));
function photo(L, name, { sizes = "(min-width: 960px) 520px, 92vw", cls = "", eager = false } = {}) {
  const base = L(`assets/photos/${name}`);
  return `<picture class="photo${cls ? " " + cls : ""}">
      <source type="image/webp" srcset="${base}-600.webp 600w, ${base}-928.webp 928w" sizes="${sizes}">
      <img src="${base}-928.jpg" srcset="${base}-600.jpg 600w, ${base}-928.jpg 928w" sizes="${sizes}" alt="${esc(PHOTOS[name])}" width="928" height="1152"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">
    </picture>`;
}

const ICONS = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="i-phone" viewBox="0 0 24 24"><path d="M6.6 3.5h2.6l1.4 4-2 1.4a11 11 0 0 0 6.5 6.5l1.4-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
<symbol id="i-sms" viewBox="0 0 24 24"><path d="M4 5.5h16v10.5H9.5L5 20v-4H4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
<symbol id="i-wa" viewBox="0 0 24 24"><path d="M12 3.4a8.6 8.6 0 0 0-7.4 13L3.4 20.6l4.3-1.1A8.6 8.6 0 1 0 12 3.4Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9.3 8.3c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5.4.7 1.4 1.9 2.8 2.4.2.1.4 0 .5-.1l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.5 0 .5-.2 1.2-.8 1.5-.6.4-1.5.5-2.6.1-1.4-.5-3-1.7-4-3.2-.8-1.2-1.1-2.3-.7-3.5Z"/></symbol>
<symbol id="i-mail" viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-back" viewBox="0 0 24 24"><path d="M20 12H5M10.5 6.5 5 12l5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-minus" viewBox="0 0 24 24"><path d="M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-star" viewBox="0 0 24 24"><path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.5-4.2 6.1-.8Z"/></symbol>
<symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3.5 5 6v5.5c0 4.2 3 7.8 7 9 4-1.2 7-4.8 7-9V6Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m9 12 2 2 4-4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-card" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3 10h18M6.5 14.5h4" stroke="currentColor" stroke-width="1.7"/></symbol>
<symbol id="i-cal" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 9.5h17M8 3v4M16 3v4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></symbol>
<symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.7"/></symbol>
<symbol id="i-leaf" viewBox="0 0 24 24"><path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15M5 19l7-7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.8" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M4.5 20.5c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></symbol>
<symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-gift" viewBox="0 0 24 24"><rect x="3.5" y="9" width="17" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 13h17M12 9v11M12 9c-1.5-3.5-5.5-4-5.5-1.5S10 9 12 9Zm0 0c1.5-3.5 5.5-4 5.5-1.5S14 9 12 9Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
<symbol id="i-key" viewBox="0 0 24 24"><circle cx="8" cy="15" r="4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m11 12 8.5-8.5M16 7l2.5 2.5M14 9l2 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></symbol>
<symbol id="i-home" viewBox="0 0 24 24"><path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 20v-5h4v5" fill="none" stroke="currentColor" stroke-width="1.7"/></symbol>
<symbol id="i-sparkle" viewBox="0 0 24 24"><path d="M12 3.5c.6 4.2 2.8 6.6 7 7.5-4.2.9-6.4 3.3-7 7.5-.6-4.2-2.8-6.6-7-7.5 4.2-.9 6.4-3.3 7-7.5ZM18.5 3v4M16.5 5h4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/></symbol>
<symbol id="i-layers" viewBox="0 0 24 24"><path d="m12 4 8.5 4.5L12 13 3.5 8.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
<symbol id="i-box" viewBox="0 0 24 24"><path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m3.5 7.5 8.5 4 8.5-4M12 11.5v9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
<symbol id="i-drop" viewBox="0 0 24 24"><path d="M12 3.5s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 14.5a3 3 0 0 0 3 3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></symbol>
<symbol id="i-gem" viewBox="0 0 24 24"><path d="M7 4h10l3.5 5L12 20.5 3.5 9Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M3.5 9h17M9.5 4 8 9l4 11.5L16 9l-1.5-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
<symbol id="i-building" viewBox="0 0 24 24"><path d="M5 20.5V4h9v16.5M14 9h5v11.5M3 20.5h18M8 7.5h3M8 11h3M8 14.5h3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-book" viewBox="0 0 24 24"><path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 6v13.5" fill="none" stroke="currentColor" stroke-width="1.7"/></symbol>
<symbol id="i-facebook" viewBox="0 0 24 24"><path d="M13.6 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21z"/></symbol>
<symbol id="i-instagram" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="4.8" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3.9" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17.2" cy="6.8" r="1.1"/></symbol>
<symbol id="i-menu" viewBox="0 0 24 24"><path d="M3 7.5h18M3 12h18M3 16.5h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-close" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-moon" viewBox="0 0 24 24"><path d="M20.5 14.4A8.5 8.5 0 0 1 9.6 3.5a8.5 8.5 0 1 0 10.9 10.9Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></symbol>
<symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-play" viewBox="0 0 24 24"><path d="M8.5 5.8v12.4a.8.8 0 0 0 1.2.7l9.6-6.2a.8.8 0 0 0 0-1.4L9.7 5.1a.8.8 0 0 0-1.2.7Z" fill="currentColor"/></symbol>
<symbol id="i-camera" viewBox="0 0 24 24"><path d="M4 8h3.5l1.8-2.5h5.4L16.5 8H20v11H4Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="13.2" r="3.4" fill="none" stroke="currentColor" stroke-width="1.7"/></symbol>
<symbol id="i-chev" viewBox="0 0 24 24"><path d="m7 9.5 5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</defs></svg>`;
const ic = (id, cls = "ic") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
const SVC_ICON = { regular: "i-sparkle", deep: "i-layers", move: "i-box", detail: "i-drop", residence: "i-gem", office: "i-building", airbnb: "i-key" };

/* ---------- shared fragments ---------- */
// The header shows the navy logo in light mode and the white one in dark mode (css/site.css swaps them).
// The white logo is lazy: hidden in light mode, it then isn't fetched at all, leaving the first moments to the fonts and the page.
const logoImg = (L) => `<img class="logo-light" src="${L("assets/logo.svg")}" alt="${esc(B.name)}" width="772" height="210"><img class="logo-dark" src="${L("assets/logo-white.svg")}" alt="${esc(B.name)}" width="772" height="210" loading="lazy">`;
const themeBtn = () => `<button type="button" class="theme-btn" data-theme-toggle aria-pressed="false" aria-label="Dark mode">${ic("i-moon", "ic theme-moon")}${ic("i-sun", "ic theme-sun")}</button>`;
// Every visit opens light; a visitor who chose dark gets it back before the page paints, so it never flashes.
const THEME_BOOT = `<script>try{if(localStorage.getItem("nr-theme")==="dark")document.documentElement.setAttribute("data-theme","dark")}catch(e){}</script>`;

// The desktop nav marks the section you're in. Only a link to this very page gets aria-current="page".
const navLink = (href, label, on, isPage) => `<a href="${href}"${on ? ` class="is-current"${isPage ? ' aria-current="page"' : ""}` : ""}>${label}</a>`;
function header(L, opts = {}) {
  if (opts.minimal) {
    return `<header class="site-header minimal">
  <div class="wrap header-row">
    <a class="brand" href="${L("")}" aria-label="${esc(B.name)}, home">${logoImg(L)}</a>
    <div class="header-actions">
      ${PHONE ? `<a class="header-call" data-tel href="tel:${B.phone}">${ic("i-phone")}<span class="sr-only">Call <span data-phone-text>${esc(B.phoneDisplay)}</span></span></a>` : ""}
      ${themeBtn()}
    </div>
  </div>
</header>`;
  }
  return `<header class="site-header">
  <div class="wrap header-row">
    <a class="brand" href="${L("")}" aria-label="${esc(B.name)}, home">${logoImg(L)}</a>
    <nav class="nav-desktop" aria-label="Main">
      ${navLink(L("#services"), "Services", ["service", "quote"].includes(opts.current))}
      ${navLink(L("pricing/"), "Pricing", opts.current === "pricing", true)}
      ${navLink(L("#areas"), "Areas", opts.current === "area")}
      ${navLink(L("services/" + C.quoteServices.airbnb.slug + "/"), "Airbnb hosts", opts.current === "host", true)}
      ${navLink(L("help/"), "Help", opts.current === "help", true)}
    </nav>
    <div class="header-actions">
      ${PHONE ? `<a class="header-phone" data-tel href="tel:${B.phone}">${ic("i-phone")}<span class="sr-only">Call <span data-phone-text>${esc(B.phoneDisplay)}</span></span></a>` : ""}
      ${B.whatsapp ? `<a class="header-wa" data-wa href="${esc(waLink(WA_HELLO))}" target="_blank" rel="noopener" aria-label="WhatsApp ${esc(B.ownerFirstName)}" data-track="whatsapp_click">${ic("i-wa")}</a>` : ""}
      ${themeBtn()}
      <a class="btn btn-primary header-book" href="${L("book/")}" data-track="book_click"><span class="hb-long">${ACT.book}</span><span class="hb-short">${ACT.short}</span></a>
      <button class="menu-btn" type="button" aria-controls="menu" aria-expanded="false" aria-label="Open menu">${ic("i-menu")}</button>
    </div>
  </div>
</header>
<div class="menu" id="menu" hidden>
  <div class="wrap menu-inner">
    <a class="btn btn-primary btn-block menu-book" href="${L("book/")}" data-track="book_click">${ACT.book}</a>
    <p class="label">Services</p>
    <ul class="menu-list">
      ${allServices.map((s) => `<li><a href="${L("services/" + s.slug + "/")}">${esc(s.menuName)}</a></li>`).join("")}
    </ul>
    <p class="label">Plan your clean</p>
    <ul class="menu-list menu-list-sm">
      <li><a href="${L("pricing/")}">Pricing</a></li>
      <li><a href="${L("#how")}">How booking works</a></li>
      <li><a href="${L("#areas")}">Areas we serve</a></li>
      <li><a href="${L("#faq")}">Questions</a></li>
      <li><a href="${L("help/")}">Help &amp; your booking</a></li>
    </ul>
    <p class="label">About us</p>
    <ul class="menu-list menu-list-sm">
      <li><a href="${L("vision/")}">Our vision</a></li>
      <li><a href="${L("guides/")}">Guides</a></li>
      <li><a href="${L("gift/")}">Gift a clean</a></li>
      <li><a href="${L("realtors/")}">Realtors &amp; property managers</a></li>
    </ul>
    <div class="menu-cta">
      ${B.whatsapp ? `<a class="btn btn-wa btn-block" data-wa href="${esc(waLink(WA_HELLO))}" target="_blank" rel="noopener">${ic("i-wa")} WhatsApp ${esc(B.ownerFirstName)}</a>` : ""}
      ${PHONE ? `<a class="btn btn-ghost btn-block" data-tel href="tel:${B.phone}">Call or text <span class="nowrap">${esc(B.phoneDisplay)}</span></a>`
        : `<a class="btn btn-ghost btn-block" data-mailto href="mailto:${B.email}">Email ${esc(B.ownerFirstName)}</a>`}
    </div>
    ${socialLinks("social-menu")}
  </div>
</div>
`;
}

// Only profiles that exist are shown: an icon that goes nowhere looks broken.
function socialLinks(cls = "") {
  const links = [["facebook", B.facebookUrl, "Facebook"], ["instagram", B.instagramUrl, "Instagram"]].filter((x) => x[1]);
  if (!links.length) return "";
  return `<div class="social ${cls}">
    ${links.map(([k, url, label]) => `<a class="social-link" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(B.name)} on ${label}">${ic("i-" + k)}</a>`).join("\n    ")}
  </div>`;
}

// Thin top bar with rotating true messages. Dismissing it is remembered until the messages change.
function announceBar() {
  const A = C.announce || {};
  // Each message is [full, short]: phones under 480px show the short one, so the bar stays on one line.
  const msgs = [
    ...(founding && founding.active && spotsLeft > 0 ? [[`${founding.percent}% off your first visit, first ${founding.spots} households`, `${founding.percent}% off your first visit`]] : []),
    ...(A.messages || []).map((m) => [m, m])
  ];
  if (!A.active || !msgs.length) return "";
  const key = crypto.createHash("sha1").update(msgs.map((m) => m[0]).join("|")).digest("hex").slice(0, 8);
  const msgHtml = ([full, short]) => full === short ? esc(full) : `<span class="am-long">${esc(full)}</span><span class="am-short">${esc(short)}</span>`;
  return `<div class="announce" data-announce data-key="${key}" role="region" aria-label="Announcements">
  <div class="wrap announce-row">
    <p class="announce-msgs" data-announce-msgs>${msgs.map((m, i) => `<span${i ? "" : ' class="is-on"'}>${msgHtml(m)}</span>`).join("")}</p>
    <button type="button" class="announce-close" data-announce-close aria-label="Hide announcements">${ic("i-close")}</button>
  </div>
</div>
<script>try{if(localStorage.getItem("nr-announce")==="${key}")document.querySelector("[data-announce]").hidden=true}catch(e){}</script>`;
}

// The Google rating sits beside the founding offer in every price box, once business.googleRating has real numbers.
function ratingPill() {
  const G = B.googleRating || {};
  if (!(G.count > 0)) return "";
  const inner = `${ic("i-star")}<span><b>${Number(G.rating).toFixed(1)}</b> Google rating · ${G.count} review${G.count === 1 ? "" : "s"}</span>`;
  return B.googleReviewUrl ? `<a class="pricer-rating" href="${esc(B.googleReviewUrl)}" target="_blank" rel="noopener">${inner}</a>` : `<p class="pricer-rating">${inner}</p>`;
}

function footer(L) {
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div class="footer-brand">
        <img src="${L("assets/logo-stacked-white.svg")}" alt="${esc(B.name)}" width="488" height="369" loading="lazy" decoding="async">
        <p class="footer-tag">${esc(B.tagline)}</p>
        ${socialLinks()}
      </div>
      <div class="footer-cols">
        <div>
          <p class="label">Services</p>
          <ul>${allServices.map((s) => `<li><a href="${L("services/" + s.slug + "/")}">${esc(s.menuName)}</a></li>`).join("")}</ul>
        </div>
        <div>
          <p class="label">Areas</p>
          <ul>${C.areas.map((a) => `<li><a href="${L("areas/" + a.slug + "/")}">${esc(a.name)}</a></li>`).join("")}</ul>
          <p class="label label-sm">Company</p>
          <ul>
            <li><a href="${L("pricing/")}">Pricing</a></li>
            <li><a href="${L("help/")}">Help &amp; your booking</a></li>
            <li><a href="${L("gift/")}">Gift a clean</a></li>
            <li><a href="${L("realtors/")}">For realtors</a></li>
            <li><a href="${L("guides/")}">Guides</a></li>
            <li><a href="${L("vision/")}">Our vision</a></li>
            <li><a href="${L("vision/#join")}">Work with us</a></li>
          </ul>
        </div>
        <div>
          <p class="label">Contact</p>
          <ul>
            ${PHONE ? `<li><a data-tel href="tel:${B.phone}" data-phone-text>${esc(B.phoneDisplay)}</a></li>` : ""}
            ${B.whatsapp ? `<li><a data-wa href="${esc(waLink(WA_HELLO))}" target="_blank" rel="noopener">WhatsApp</a></li>` : ""}
            <li><a data-mailto href="mailto:${B.email}" data-email-text>${esc(B.email)}</a></li>
            <li><span data-hours>${esc(B.hours)}</span></li>
            <li><span>${esc(B.areaLabel)}</span></li>
            ${ADDR ? `<li><span>${esc(ADDR)}</span></li>` : ""}
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© <span data-year>${YEAR}</span> ${esc(B.name)}, ${esc(B.base)}, Ontario. Room photos are illustrations, not photos of client homes.</p>
      <ul class="legal">
        <li><a href="${L("privacy/")}">Privacy Policy</a></li>
        <li><a href="${L("policies/")}">Service Policies</a></li>
        <li><a href="${L("review/")}">Leave a review</a></li>
      </ul>
    </div>
  </div>
</footer>`;
}

// Phones get Call and Text; large screens, where sms: links do nothing, get Email instead. WhatsApp works on both.
// While the phone number is private, everyone gets Email.
function actionBar(L) {
  return `<nav class="action-bar" aria-label="Quick contact" data-action-bar>
  ${PHONE ? `<a class="ab-link ab-phone" data-tel href="tel:${B.phone}" data-track="call_click">${ic("i-phone")}<span>Call</span></a>
  <a class="ab-link ab-phone" data-sms href="sms:${B.phone}" data-track="text_click">${ic("i-sms")}<span>Text</span></a>` : ""}
  ${B.whatsapp ? `<a class="ab-link ab-wa" data-wa href="${esc(waLink(WA_HELLO))}" target="_blank" rel="noopener" data-track="whatsapp_click">${ic("i-wa")}<span>WhatsApp</span></a>` : ""}
  <a class="ab-link${PHONE ? " ab-desk" : ""}" data-mailto href="mailto:${B.email}" data-track="email_click">${ic("i-mail")}<span>Email</span></a>
  <a class="btn btn-primary ab-book" href="${L("book/")}" data-track="book_click"><span class="ab-long">${ACT.book}</span><span class="ab-short">${ACT.short}</span></a>
</nav>`;
}

// Inside the price box: one line under the price, so the offer isn't said twice on a phone's first screen.
function offerLine() {
  if (!founding || !founding.active) return "";
  const spots = SHOW_SPOTS ? `${spotsLeft} of ${founding.spots} founding spots left` : `For our first ${founding.spots} households`;
  return `<p class="pricer-deal" data-offer-note><span>${founding.percent}% off your first visit</span> · <span data-spots>${spots}</span></p>`;
}

function offerNote() {
  if (!founding || !founding.active) return "";
  const spots = SHOW_SPOTS ? `${spotsLeft} of ${founding.spots} founding spots left` : `For our first ${founding.spots} households`;
  return `<p class="pricer-offer" data-offer-note><span><strong>${founding.percent}% off</strong> your first visit</span><span class="spots" data-spots>${spots}</span></p>`;
}

// Pricing: how a price is worked out, in four steps, with two examples priced like a booking.
// site.js recomputes the examples from js/config.js (data-ex), as it does the price tables.
const exampleFirstLabel = (fp, rec) => !Math.max(fp, rec) ? "First visit" : fp >= rec && fp > 0 ? `First visit (${fp}% founding discount)` : `First visit (${rec}% plan discount)`;
function priceExample(id, caption, key, beds, baths, home, { freq, addon } = {}) {
  const a = addon && C.addons.find((x) => x.id === addon);
  if (addon && (!a || addonStatus(key, addon) !== "extra")) throw new Error(`price example ${id}: ${addon} isn't a paid extra for ${key}`);
  const fp = founding && founding.active ? founding.percent : 0, rec = freq ? C.frequencies[freq].discount : 0;
  const base = price(key, beds, baths, home), total = base + (a ? a.price : 0);
  const row = (dt, amount, value, cls = "", label = "") => `<div${cls ? ` class="${cls}"` : ""}><dt${label}>${dt}</dt><dd data-amount="${amount}">${money(value)}</dd></div>`;
  return `<figure class="price-example" data-example="${id}" data-ex="${key}:${beds}:${baths}:${home}"${freq ? ` data-ex-freq="${freq}"` : ""}${a ? ` data-ex-addon="${a.id}"` : ""}>
        <figcaption>Example: ${esc(caption)}</figcaption>
        <dl>
          ${a ? row("Base price", "base", base) + row(esc(a.name), "addon", a.price) + row("Total before discount", "total", total)
              : row("Regular price", "base", base)}
          ${row(exampleFirstLabel(fp, rec), "first", afterDiscount(total, Math.max(fp, rec)), "is-key", " data-first-label")}
          ${freq ? row(`Later visits, ${esc(C.frequencies[freq].label.toLowerCase())} (${rec}% off)`, "later", afterDiscount(total, rec)) : ""}
        </dl>
      </figure>`;
}
// "Which clean do I need?": one situation per service, from the lightest clean up. Each line must stay true to the service page.
const CHOOSER = [
  ["regular", "You'd like the home kept right, every week or two"],
  ["deep", "It's your first professional clean, or it's been a few months"],
  ["move", "You're moving out or in, and the home is empty"],
  ["detail", "Only the kitchen and bathrooms need attention"],
  ["residence", "The home is over about 3,000 sq ft, or has stone and fine finishes"]
];
for (const [k] of CHOOSER) if (!C.services[k] && !C.quoteServices[k]) throw new Error(`CHOOSER names "${k}", which isn't a service in js/config.js.`);
function chooser(L) {
  return `<section class="section section-flush" id="which">
  <div class="wrap">
    <div class="section-head"><p class="label">Not sure which?</p><h2>Which clean do I need?</h2></div>
    <ul class="chooser">${CHOOSER.map(([k, when]) => {
      const s = C.services[k] || C.quoteServices[k];
      return `<li><a href="${L("services/" + s.slug + "/")}"><span class="chooser-when">${esc(when)}</span><span class="chooser-what"><strong>${esc(s.name)}</strong><span>${C.services[k] ? `From <b data-from="${k}">${money(s.base)}</b>` : "Free quote"}</span></span>${ic("i-arrow")}</a></li>`;
    }).join("")}</ul>
  </div>
</section>`;
}

function priceExplainer() {
  const plans = Object.values(C.frequencies).filter((f) => f.discount).sort((x, y) => y.discount - x.discount).map((f) => `${f.discount}% ${f.label.toLowerCase()}`);
  const hood = (h) => C.homeTypes[h].label.toLowerCase();
  const bigger = Object.keys(C.homeTypes).filter((h) => C.homeTypes[h].factor > 1);
  return `<section class="section section-tint" id="how-price">
  <div class="wrap">
    <div class="section-head"><p class="label">How pricing works</p><h2>How your price is worked out.</h2></div>
    <div class="price-explain">
      <ol class="price-steps">
        <li><h3>Base price</h3><p>Set by the service and your home's bedrooms and bathrooms.${bigger.length ? ` ${listJoin(bigger.map((h) => `${hood(h)}s add ${Math.round((C.homeTypes[h].factor - 1) * 100)}%`)).replace(/^./, (c) => c.toUpperCase())}, for the stairs and extra floor space.` : ""}</p></li>
        <li><h3>Extras</h3><p>Each extra has its own price, shown before you book. When your service already includes one, it costs nothing.</p></li>
        <li><h3>One discount</h3><p>Regular plans save on every visit: ${listJoin(plans)}.${founding && founding.active ? ` <span data-offer-note>Your first visit gets the ${founding.percent}% founding discount or your plan's discount, whichever is larger. Discounts are never combined.</span>` : ""}</p></li>
        <li><h3>Estimate, then ${esc(B.ownerFirstName)} confirms</h3><p>What you see is an estimate from what you tell us. ${esc(B.ownerFirstName)} confirms the final price with you before the clean, for example for half baths, basements or a larger home. You pay after the clean.</p></li>
      </ol>
      <div class="price-examples">
        ${priceExample("a", `${C.services.regular.name}, 2-bedroom, 1-bathroom condo, ${C.frequencies.biweekly.label.toLowerCase()}`, "regular", 2, 1, "condo", { freq: "biweekly" })}
        ${priceExample("b", `${C.services.deep.name}, 3-bedroom, 2-bathroom house, with the inside of the oven`, "deep", 3, 2, "house", { addon: "oven" })}
        <p class="fine"><span data-tax-note>${TAX_TEXT}</span>. Discounted prices are rounded to the nearest dollar.</p>
      </div>
    </div>
  </div>
</section>`;
}

// owner: true adds Mann's line under the button. The home page already has it in the hero, so it leaves it out.
function pricer(L, defaultKey = "regular", heading = "Your price, in seconds", { owner = false } = {}) {
  const p = price(defaultKey, 1, 1);
  // While the founding offer runs, the first-visit price is the big number and the regular price sits under it.
  const on = !!(founding && founding.active), h = hours(defaultKey, 1, 1);
  return `<form class="pricer" data-pricer data-default-service="${defaultKey}" novalidate>
  <div class="pricer-head">
    <p class="pricer-title">${esc(heading)}</p>
    ${ratingPill()}
  </div>
  <div class="pricer-result" aria-live="polite">
    <p class="pricer-for" data-p-for>${esc(priceFor(defaultKey, 1, 1))}</p>
    <p class="pricer-amount"><span data-p-amount>${money(on ? afterDiscount(p, founding.percent) : p)}</span> <span class="pricer-unit" data-p-unit${on ? "" : " hidden"}>first visit</span></p>
    <p class="pricer-meta" data-p-meta>${on ? `Regular price ${money(p)} · estimate, about ${h} hours on site` : `Estimate · about ${h} hours on site`}</p>
    ${offerLine()}
  </div>
  <div class="field">
    <label for="p-service">Service</label>
    <div class="select-wrap"><select id="p-service" data-p-service>
      ${svcKeys.map((k) => `<option value="${k}"${k === defaultKey ? " selected" : ""}>${esc(C.services[k].menuName)}</option>`).join("")}
    </select>${ic("i-chev")}</div>
  </div>
  <div class="field">
    <label for="p-home">Type of home</label>
    <div class="select-wrap"><select id="p-home" data-p-home>
      ${Object.keys(C.homeTypes).map((k) => `<option value="${k}">${esc(C.homeTypes[k].label)}</option>`).join("")}
    </select>${ic("i-chev")}</div>
  </div>
  <div class="pricer-row">
    ${stepper("p-beds", "Bedrooms", 1, "data-p-beds")}
    ${stepper("p-baths", "Bathrooms", 1, "data-p-baths")}
  </div>
  <a class="btn btn-primary btn-block" href="${L("book/")}" data-p-go data-track="pricer_continue">${ACT.go} ${ic("i-arrow")}</a>
  <p class="pricer-next">${ic("i-cal")}<span>${CAL ? "Bookings from" : "Earliest day to request:"} <strong data-next-open>tomorrow</strong></span></p>
  ${owner ? `<p class="pricer-owner"><picture><source type="image/webp" srcset="${L("assets/founder-mann-patel-avatar.webp")}"><img src="${L("assets/founder-mann-patel-avatar.jpg")}" alt="" width="40" height="40" loading="lazy" decoding="async"></picture><span><strong>${esc(B.owner)}, owner,</strong> ${CAL ? "checks in after you pick a time." : "confirms your day, time and final price."}</span></p>` : ""}
  <div class="pricer-alt">
    <a class="link-btn" data-p-incl href="${L("services/" + C.services[defaultKey].slug + "/")}#included">${ic("i-check")} What's included</a>
    <button type="button" class="link-btn" data-textme-open aria-expanded="false" aria-controls="textme-${defaultKey}">${ic("i-sms")} Text me this price</button>
    ${B.whatsapp ? `<a class="link-btn" data-p-wa href="${esc(waLink(WA_HELLO))}" target="_blank" rel="noopener" data-track="whatsapp_click">${ic("i-wa")} Ask on WhatsApp</a>` : ""}
  </div>
  <div class="textme" id="textme-${defaultKey}" data-textme hidden>
    <label for="tm-phone-${defaultKey}">Your mobile number</label>
    <div class="pc-row"><input id="tm-phone-${defaultKey}" type="tel" inputmode="tel" autocomplete="tel" placeholder="e.g. 647 555 0123" data-textme-phone><button class="btn btn-teal" type="button" data-textme-send>Send</button></div>
    <p class="field-hint" data-textme-note>${esc(B.ownerFirstName)} texts you this price once, ${esc(B.replyPromise)}. No spam.</p>
    <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" data-textme-honey>
  </div>
  <p class="pricer-fine"><span data-tax-note>${TAX_TEXT}</span> · No payment to book · Free re-clean guarantee</p>
</form>`;
}

function stepper(id, label, value, attr) {
  return `<div class="stepper" ${attr}>
      <span class="stepper-label" id="${id}-label">${label}</span>
      <div class="stepper-ctl">
        <button type="button" data-dec aria-label="Fewer ${label.toLowerCase()}">${ic("i-minus")}</button>
        <output id="${id}" aria-labelledby="${id}-label">${value}</output>
        <button type="button" data-inc aria-label="More ${label.toLowerCase()}">${ic("i-plus")}</button>
      </div>
    </div>`;
}

// The four promises, in a strip under the home hero. js/site.js adds any switched-on badges to [data-assure].
function trustStrip() {
  const items = [
    ["i-shield", `Free re-clean if reported within ${RECLEAN_H} hours`],
    ["i-card", "No deposit. Pay after your clean"],
    ["i-clock", "Open 7 days, 9am to 11pm"],
    ["i-pin", "Scarborough & North York"]
  ];
  // The insurance badge waits here until the policy starts (November 2026). To switch it on, move the <li> out of the
  // comment, write its wording from the policy itself, and check the trust strip still lays out (tablet test).
  const insuranceSpot = `<!-- Insurance badge, from November 2026: <li>${ic("i-shield")}<span>[BADGE TEXT FROM YOUR POLICY]</span></li> -->`;
  return `<section class="trust-strip" aria-label="Our promises">
  <div class="wrap"><ul class="trust" data-assure>${items.map(([i, t]) => `<li>${ic(i)}<span>${esc(t)}</span></li>`).join("")}${insuranceSpot}</ul></div>
</section>`;
}

function founderPhoto(L, cls = "") {
  return `<div class="founder-photo${cls ? " " + cls : ""}">
      <picture>
        <source type="image/webp" srcset="${L("assets/founder-mann-patel-600.webp")} 600w, ${L("assets/founder-mann-patel.webp")} 848w" sizes="(min-width: 960px) 420px, 86vw">
        <img src="${L("assets/founder-mann-patel.jpg")}" srcset="${L("assets/founder-mann-patel-600.jpg")} 600w, ${L("assets/founder-mann-patel.jpg")} 848w" sizes="(min-width: 960px) 420px, 86vw" alt="${esc(B.owner)}, founder of ${esc(B.name)}" width="848" height="1060" loading="lazy" decoding="async">
      </picture>
    </div>`;
}


// Same wording as site.js, which refreshes it when config.impact changes.
function impactCaption(im) {
  return "hours given back" + (im.households > 0 ? " to " + im.households.toLocaleString("en-CA") + " household" + (im.households > 1 ? "s" : "") : "") + " so far";
}

// Price grid for one instant-price service: common home sizes down, home types across.
// Cells carry data-price so site.js refreshes them when prices in config.js change.
const PRICE_SIZES = [[1, 1], [2, 1], [2, 2], [3, 2], [3, 3], [4, 3], [5, 4]];
const DETAIL_BATHS = [1, 2, 3, 4];
function priceTable(key) {
  const s = C.services[key];
  const homes = Object.keys(C.homeTypes);
  const rows = key === "detail"
    ? DETAIL_BATHS.map((ba) => [`${ba} bath${ba > 1 ? "s" : ""}`, 1, ba])
    : PRICE_SIZES.map(([bd, ba]) => [`${bd} bed, ${ba} bath`, bd, ba]);
  return `<div class="table-scroll"><table class="price-table">
      <caption class="sr-only">${esc(s.name)} prices by home size and type</caption>
      <thead><tr><th scope="col">${key === "detail" ? "Kitchen +" : "Home size"}</th>${homes.map((h) => `<th scope="col">${esc(C.homeTypes[h].short || C.homeTypes[h].label)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(([label, bd, ba]) => `<tr><th scope="row">${label}</th>${homes.map((h) => `<td data-price="${key}:${bd}:${ba}:${h}">${money(price(key, bd, ba, h))}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>`;
}

// Room-by-room comparison of the three whole-home services, from the checklist in config.js.
function compareTable() {
  const cols = svcKeys.filter((k) => C.services[k].checklistColumn && !C.services[k].rooms);
  const mark = { yes: `${ic("i-check")}<span class="sr-only">Included</span>`, add: '<span class="add-tag">Extra</span>', "": '<span class="cmp-no" aria-hidden="true">–</span><span class="sr-only">Not included</span>' };
  return `<div class="table-scroll"><table class="compare">
      <caption class="sr-only">What each cleaning service includes, room by room</caption>
      <thead><tr><th scope="col"><span class="sr-only">Task</span></th>${cols.map((k) => { const s = C.services[k]; return `<th scope="col">${s.shortName ? `<span class="cmp-short" aria-hidden="true">${esc(s.shortName)}</span><span class="cmp-long">${esc(s.menuName)}</span>` : esc(s.menuName)}</th>`; }).join("")}</tr></thead>
      ${C.checklist.map((r) => `<tbody><tr class="cmp-room"><th scope="colgroup" colspan="${cols.length + 1}">${esc(r.room)}</th></tr>${r.tasks.map((t) => `<tr><th scope="row">${esc(t[0])}</th>${cols.map((k) => `<td>${mark[t[C.services[k].checklistColumn]] ?? mark[""]}</td>`).join("")}</tr>`).join("")}</tbody>`).join("")}
    </table></div>`;
}

// aside: extra HTML under the heading in the side column (the home page puts its guides there).
function faqBlock(tag, title = "Questions, answered.", cls = "", aside = "") {
  const list = C.faqs.filter((f) => f.on.includes(tag));
  if (!list.length) return { html: "", schema: null };
  const html = `<section class="section faq-section${cls ? " " + cls : ""}" id="faq">
  <div class="wrap split">
    <div class="split-head">
      <h2>${esc(title)}</h2>
      <p class="muted">Anything else? ${PHONE ? `Call or text <a data-tel href="tel:${B.phone}" data-phone-text>${esc(B.phoneDisplay)}</a>` : `Email <a data-mailto href="mailto:${B.email}">${esc(B.email)}</a>`}${B.whatsapp ? `, or <a data-wa href="${esc(waLink(WA_HELLO))}" target="_blank" rel="noopener">message on WhatsApp</a>` : ""}.</p>
      ${aside}
    </div>
    <div class="faq-list">
      ${list.map((f) => `<details><summary><span>${esc(f.q)}</span>${ic("i-plus")}</summary><p>${esc(f.a)}</p></details>`).join("")}
    </div>
  </div>
</section>`;
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: list.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return { html, schema };
}

// cta: { href, label, track } replaces the booking button, for pages whose next step is a form of their own.
function finalCta(L, title = "Come home to it.", text = `${ACT.minutes} No payment until it's done.`, cta = null) {
  return `<section class="final-cta">
  <div class="wrap final-inner">
    <h2>${esc(title)}</h2>
    <p>${esc(text)}</p>
    <div class="cta-row">
      ${cta ? `<a class="btn btn-light" href="${cta.href}"${cta.track ? ` data-track="${cta.track}"` : ""}>${esc(cta.label)}</a>` : `<a class="btn btn-light" href="${L("book/")}" data-track="book_click">${ACT.book}</a>`}
      ${B.whatsapp ? `<a class="btn btn-wa" data-wa href="${esc(waLink(WA_HELLO))}" target="_blank" rel="noopener" data-track="whatsapp_click">${ic("i-wa")} WhatsApp</a>` : ""}
      ${PHONE ? `<a class="btn btn-ghost-light" data-tel href="tel:${B.phone}">Call <span class="nowrap">${esc(B.phoneDisplay)}</span></a>`
        : `<a class="btn btn-ghost-light" data-mailto href="mailto:${B.email}" data-track="email_click">Email ${esc(B.ownerFirstName)}</a>`}
    </div>
  </div>
</section>`;
}

function breadcrumbs(L, trail) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${trail.map((t, i) => i < trail.length - 1 ? `<li><a href="${L(t[1])}">${esc(t[0])}</a></li>` : `<li aria-current="page">${esc(t[0])}</li>`).join("")}</ol></nav>`;
}
function crumbSchema(trail) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t[0], item: SITE + "/" + t[1].replace(/#.*/, "") })) };
}

const placeSchema = (a) => ({ "@type": "Place", name: a.name + ", Toronto, ON", ...(a.wiki ? { sameAs: a.wiki } : {}) });

function businessSchema() {
  return {
    "@context": "https://schema.org", "@type": "LocalBusiness", "@id": SITE + "/#business",
    name: B.name, slogan: B.tagline, description: "Home cleaning in Scarborough and North York, Toronto: regular, deep, move-in and move-out cleaning with a clear price before you book and payment after the clean.",
    url: SITE + "/", logo: SITE + "/assets/logo.png", image: [SITE + "/assets/og-image.jpg", SITE + "/assets/icon-512.png"],
    ...(PHONE ? { telephone: B.phone } : {}), email: B.email, priceRange: "$$", currenciesAccepted: C.currency, paymentAccepted: "Cash, Credit Card, Debit Card, Interac e-Transfer",
    founder: { "@type": "Person", name: B.owner, jobTitle: "Founder & Owner", image: SITE + "/assets/founder-mann-patel.jpg" },
    address: { "@type": "PostalAddress", addressLocality: "Toronto", addressRegion: B.region, addressCountry: "CA" },
    areaServed: C.areas.map(placeSchema),
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: C.openDays.map((d) => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d]), opens: C.opens, closes: C.closes }],
    ...([B.facebookUrl, B.instagramUrl].filter(Boolean).length ? { sameAs: [B.facebookUrl, B.instagramUrl].filter(Boolean) } : {}),
    makesOffer: allServices.map((s) => ({
      "@type": "Offer", itemOffered: { "@type": "Service", name: s.name, url: SITE + "/services/" + s.slug + "/" },
      ...(s.quote ? {} : { priceSpecification: { "@type": "PriceSpecification", minPrice: s.base, priceCurrency: C.currency } })
    }))
  };
}
function websiteSchema() {
  return { "@context": "https://schema.org", "@type": "WebSite", "@id": SITE + "/#website", name: B.name, alternateName: "Nest and Rest Cleaning", url: SITE + "/", publisher: { "@id": SITE + "/#business" }, inLanguage: "en-CA" };
}

/* ---------- page shell ---------- */
// A heading's closing full stop goes in .stop, which css/site.css pulls in: the glyph's wide left side-bearing leaves a gap at display sizes.
// Only h1 and h2, and only a stop that ends a line (before <br>, a closing </span> or the end of the heading). The words don't change.
const tidyStops = (html) => html.replace(/<(h[12])(\b[^>]*)>([\s\S]*?)<\/\1>/g, (m, tag, attrs, inner) =>
  `<${tag}${attrs}>${inner.replace(/([^\s.>])\.(?=<br>|<\/span>|$)/g, '$1<span class="stop">.</span>')}</${tag}>`);
function page({ depth, pathOut, title, description, body, schemas = [], pageType, minimal = false, noBar = false, noindex = false, ogImage = "assets/og-image.jpg" }) {
  const L = linker(depth);
  const canonical = SITE + "/" + pathOut.replace(/index\.html$/, "");
  // Titles end in the short brand name so Google doesn't cut them off.
  const shortTitle = title.replace(" | " + B.name, " | " + BRAND_SHORT);
  const ld = schemas.filter(Boolean).map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n");
  const headInner = `${THEME_BOOT}
<title>${esc(shortTitle)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ""}<meta name="theme-color" content="#FFFFFF">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="${pageType === "article" ? "article" : "website"}">
<meta property="og:locale" content="en_CA">
<meta property="og:site_name" content="${esc(B.name)}">
<meta property="og:title" content="${esc(shortTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}/${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(B.name)}: ${esc(B.tagline)} Home cleaning in Scarborough and North York.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(shortTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}/${ogImage}">
<link rel="manifest" href="${L("site.webmanifest")}">
<link rel="icon" type="image/svg+xml" href="${L("assets/logo-mark.svg")}">
<link rel="icon" type="image/png" sizes="48x48" href="${L("assets/favicon-48.png")}">
<link rel="apple-touch-icon" href="${L("assets/apple-touch-icon.png")}">
<link rel="preload" href="${L("assets/fonts/plus-jakarta-sans.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${L("assets/fonts/dm-sans.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${L("css/site.min.css")}?v=${ASSET_V.css}">
${ld}`;
  const bodyInner = `${ICONS}
<a class="skip" href="#main">Skip to content</a>
${minimal ? "" : announceBar()}
${header(L, { minimal, current: pageType })}
<main id="main">
${body(L)}
</main>
${minimal ? "" : footer(L)}
${noBar ? "" : actionBar(L)}
<div class="toast" data-toast role="status" aria-live="polite" hidden></div>
<script${DEFER} src="${L("js/config.js")}?v=${ASSET_V.config}"></script>
${PREVIEW_DIR ? "<script>window.NR_CONFIG.preview = true;</script>" : ""}
<script${DEFER} src="${L("js/site.min.js")}?v=${ASSET_V.site}"></script>`;
  const isPreviewRoot = PREVIEW_DIR && pathOut === "index.html";
  const html = isPreviewRoot
    ? `${headInner}\n<div class="page" data-page="${pageType}" data-root="${depth ? "../".repeat(depth) : "./"}">${bodyInner}</div>\n`
    : `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${headInner}
</head>
<body data-page="${pageType}" data-root="${depth ? "../".repeat(depth) : "./"}">
${bodyInner}
</body>
</html>
`;
  const file = path.join(OUT, pathOut);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, tidyStops(html));
  return canonical;
}

// A quote request card, shared by the quote-only services and the realtors page.
// steps: [first, second] splits it in two, for a form with operational questions (the host form). Fields marked step: 2
// in js/config.js, and the notes, go on the second step; contact details, the postal code and the rest on the first.
// js/site.js shows one step at a time with the progress above them; without JavaScript both steps show, one after the other.
function quoteForm(L, { name, title = "Request a free quote", reply, fields, button = "Request a free quote", note, steps = null }) {
  const field = (f) => {
    const span = f.span === 2 ? " span-2" : "";
    if (f.type === "select") return `<div class="field${span}"><label for="q-${f.id}">${esc(f.label)}</label><div class="select-wrap"><select id="q-${f.id}" name="${esc(f.label)}"><option value="" selected>Choose one</option>${f.options.map((o) => `<option>${esc(o)}</option>`).join("")}</select>${ic("i-chev")}</div></div>`;
    return `<div class="field${span}"><label for="q-${f.id}">${esc(f.label)}${f.required ? "" : ' <span class="opt">optional</span>'}</label><input id="q-${f.id}" name="${esc(f.label)}"${f.required ? " required data-required" : ""}></div>`;
  };
  const contact = `<div class="field"><label for="q-name">Your name</label><input id="q-name" name="Name" autocomplete="name" required data-required></div>
          <div class="field"><label for="q-phone">Phone</label><input id="q-phone" name="Phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="e.g. 647 555 0123" required data-phone></div>
          <div class="field span-2"><label for="q-email">Email <span class="opt">optional, if you'd like replies by email</span></label><input id="q-email" name="Email" type="email" inputmode="email" autocomplete="email" data-email></div>`;
  const postal = `<div class="field"><label for="q-postal">Postal code</label><input id="q-postal" name="Postal code" autocomplete="postal-code" autocapitalize="characters" maxlength="7" placeholder="e.g. M1B 2K3" required data-postal></div>`;
  const notes = `<div class="field span-2"><label for="q-notes">Anything else? <span class="opt">optional</span></label><textarea id="q-notes" name="Notes" rows="3"></textarea></div>`;
  const honey = `<input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">`;
  const body = steps
    ? `<ol class="q-progress" data-q-progress aria-label="Form steps">${steps.map((t, i) => `<li data-q-dot="${i + 1}"${i ? "" : ' aria-current="step"'}><span>${esc(t)}</span></li>`).join("")}</ol>
        <p class="field-note">All fields are required unless marked optional.</p>
        ${steps.map((t, i) => `<fieldset class="q-step" data-q-step="${i + 1}">
          <legend class="q-step-title" tabindex="-1"><span class="q-step-count">Step ${i + 1} of ${steps.length}</span><span class="sr-only">: ${esc(t)}</span></legend>
          <div class="form-grid">
          ${i === 0 ? contact + postal + fields.filter((f) => f.step !== 2).map(field).join("") : fields.filter((f) => f.step === 2).map(field).join("") + notes + honey}
          </div>
        </fieldset>`).join("")}`
    : `<p class="field-note">All fields are required unless marked optional.</p>
        <div class="form-grid">
          ${contact}
          ${fields.map(field).join("")}
          ${postal}
          ${notes}
          ${honey}
        </div>`;
  return `<form class="quote-form${steps ? " quote-steps" : ""}" data-quote-form data-quote-name="${esc(name)}" data-reply-time="${esc(reply)}"${steps ? " data-steps" : ""} novalidate>
        <p class="pricer-title">${esc(title)}</p>
        ${body}
        <p class="form-error" data-q-error role="alert" hidden></p>
        ${steps ? `<div class="q-nav">
          <button type="button" class="btn btn-primary btn-block" data-q-next hidden>Next: ${esc(steps[1].toLowerCase())} ${ic("i-arrow")}</button>
          <button type="button" class="link-btn q-back" data-q-back hidden>${ic("i-back")}<span>Back to ${esc(steps[0].toLowerCase())}</span></button>
          <button type="submit" class="btn btn-primary btn-block" data-q-submit>${esc(button)}</button>
        </div>` : `<button type="submit" class="btn btn-primary btn-block">${esc(button)}</button>`}
        <p class="pricer-fine">Reply ${esc(reply)} · No obligation</p>
        <p class="privacy-note">${note ? esc(note) + " " : ""}${SENT_VIA} See our <a href="${L("privacy/")}">Privacy Policy</a>.</p>
      </form>
      <div class="quote-done" data-quote-done hidden tabindex="-1"><p class="label">Request received</p><h2 data-qd-title>Thank you.</h2><p data-qd-text></p></div>`;
}

function serviceCards(L, list, cls = "") {
  return `<ul class="svc-grid${cls ? " " + cls : ""}">
      ${list.map((s) => `<li>
        <a class="svc-card" href="${L("services/" + s.slug + "/")}">
          <span class="svc-top"><span class="svc-ico">${ic(SVC_ICON[s.key] || "i-sparkle")}</span>${s.tag ? `<small class="svc-tag">${esc(s.tag)}</small>` : ""}</span>
          <h3>${esc(s.name)}</h3>
          <p>${esc(s.short)}</p>
          <span class="svc-foot"><span class="svc-price">${s.host && s.prices[0].price != null ? `From <b>${money(s.prices[0].price)}</b> a turnover` : s.quote ? "Free quote" : `From <b data-from="${s.key}">${money(s.base)}</b>`}</span>${ic("i-arrow", "ic svc-arrow")}</span>
        </a>
      </li>`).join("")}
    </ul>`;
}

// Home: the four bookable services as photo cards, each with who it suits, its price and two next steps.
// Each card's photo should say what's different about that clean. Move-In / Move-Out shows an empty, cleaned home once
// assets/photos/empty-home-* exists, and Deep Cleaning a close-up result once assets/photos/deep-detail-* exists
// (docs/design-notes.md, "Images"). Until then they keep the illustrations they have.
const HOME_PHOTOS = { regular: "living-room", deep: hasPhoto("deep-detail") ? "deep-detail" : "kitchen", move: hasPhoto("empty-home") ? "empty-home" : "entryway", detail: "bathroom" };
function homeServices(L) {
  const first = founding && founding.active && spotsLeft > 0 ? (b) => money(afterDiscount(b, founding.percent)) : null;
  return `<ul class="svc-feature">
      ${Object.keys(HOME_PHOTOS).map((k) => { const s = C.services[k]; return `<li class="svc-feature-card">
        ${photo(L, HOME_PHOTOS[k], { sizes: "(min-width: 64em) 300px, (min-width: 37.5em) 45vw, (min-width: 20em) 88px, 92vw" })}
        <div class="svc-feature-body">
          <h3>${esc(s.name)}</h3>
          <p class="svc-best">Best for: ${esc(s.idealFor[0])}</p>
          <p class="svc-price">From <b data-from="${k}">${money(s.base)}</b>${first ? ` <span class="svc-first">${first(s.base)} first visit</span>` : ""}</p>
          <div class="svc-feature-actions">
            <a class="btn btn-primary btn-sm" href="${L("book/")}?s=${k}" data-track="book_click">${ACT.short}</a>
            <a class="text-link" href="${L("services/" + s.slug + "/#included")}">What's included</a>
          </div>
        </div>
      </li>`; }).join("")}
    </ul>
    ${homePlans(L)}
    <div class="svc-paths">
      <p>Not a regular home?</p>
      <ul>
        <li><a href="${L("services/" + C.quoteServices.airbnb.slug + "/")}"><strong>Airbnb turnovers</strong> <span class="chip-new">New</span>${ic("i-arrow")}<span>Same-day resets between guests</span></a></li>
        <li><a href="${L("services/" + C.quoteServices.residence.slug + "/")}"><strong>${esc(C.quoteServices.residence.name)}</strong>${ic("i-arrow")}<span>Larger homes and fine finishes</span></a></li>
        <li><a href="${L("services/" + C.quoteServices.office.slug + "/")}"><strong>${esc(C.quoteServices.office.name)}</strong>${ic("i-arrow")}<span>Offices, clinics and studios</span></a></li>
        <li><a href="${L("realtors/")}"><strong>For realtors</strong>${ic("i-arrow")}<span>Listings and rentals</span></a></li>
      </ul>
    </div>`;
}

// On the home page only the neighbourhoods with their own page are listed, plus a link to the rest.
function hoodChips(L, a, short = false) {
  const names = short ? a.neighbourhoods.filter(hoodByName) : a.neighbourhoods;
  const rest = a.neighbourhoods.length - names.length;
  return `<ul class="hood-list">${names.map((n) => { const h = hoodByName(n); return h ? `<li><a href="${L(hoodPath(h))}">${esc(n)}</a></li>` : `<li><span>${esc(n)}</span></li>`; }).join("")}${rest ? `<li><a class="hood-more" href="${L("areas/" + a.slug + "/")}">+ ${rest} more</a></li>` : ""}</ul>`;
}

// In the area, the check offers the booking button in the site's own words ("Request a clean"). cta sends it somewhere
// else instead, such as the host form, and fill names a postal-code field on the same page to fill in.
function postalForm(id, label = "Check your postal code", cta = null) {
  const extra = cta ? ` data-pc-href="${esc(cta.href)}" data-pc-label="${esc(cta.label)}"${cta.fill ? ` data-pc-fill="${esc(cta.fill)}"` : ""}` : ` data-pc-label="${esc(ACT.book)}"`;
  return `<form class="pc-check" data-pc-form${extra} novalidate>
        <label for="${id}">${label}</label>
        <div class="pc-row"><input id="${id}" name="pc" autocomplete="postal-code" autocapitalize="characters" placeholder="e.g. M1B 2K3" maxlength="7"><button class="btn btn-primary" type="submit">Check</button></div>
        <p class="pc-result" data-pc-result aria-live="polite"></p>
      </form>`;
}

function guideCards(L, list) {
  return `<ul class="guide-grid">${list.map((g) => `<li><a class="guide-card" href="${L("guides/" + g.slug + "/")}">
        ${photo(L, g.photo, { sizes: "(min-width: 960px) 360px, 92vw", cls: "guide-photo" })}
        <span class="guide-body"><small>${esc(g.kicker)} · ${g.minutes} min read</small><strong>${esc(g.h1)}</strong></span>
      </a></li>`).join("")}</ul>`;
}

// Help page: change or cancel a booking without leaving the site. A request, not a change: the booking stays as it is
// until Mann confirms. Asks only for what's needed to find the booking and reply (no address, no codes).
function changeForm(L) {
  const seg = (name, label, opts) => `<div class="field span-2"><span class="field-label" id="c-${name}-label">${label}</span>
          <div class="seg" role="radiogroup" aria-labelledby="c-${name}-label">
            ${opts.map(([v, t], i) => `<label><input type="radio" name="${name === "what" ? "Request" : "Reply by"}" value="${esc(v)}"${i ? "" : " checked"}><span>${esc(t)}</span></label>`).join("")}
          </div>
        </div>`;
  return `<noscript><p class="form-error">Sending a change here needs JavaScript. Please use the email links instead.</p></noscript>
      <form class="change-form quote-form" data-change-form data-reply-time="${esc(B.replyPromise)}" novalidate>
        <p class="pricer-title">Request a change</p>
        <p class="field-note">All fields are required unless marked optional.</p>
        <div class="form-grid">
          <div class="field"><label for="c-ref">Booking reference</label><input id="c-ref" name="Booking reference" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12" placeholder="e.g. NR-7K2P" data-ref></div>
          <div class="field"><label for="c-name">Your name</label><input id="c-name" name="Name" autocomplete="name" data-required></div>
          ${seg("what", "What would you like to do?", [["Change the day or time", "Change day or time"], ["Change what's cleaned", "Change the clean"], ["Cancel", "Cancel"]])}
          <div class="field span-2"><label for="c-change">The change you'd like</label><textarea id="c-change" name="Requested change" rows="3" maxlength="1000" placeholder="e.g. Move it to Saturday afternoon" data-required></textarea><small class="field-hint">Please don't type door or lockbox codes here.</small></div>
          ${seg("reply", `How should ${esc(B.ownerFirstName)} reply?`, [["Text", "Text"], ["Call", "Call"], ["Email", "Email"]])}
          <div class="field span-2" data-c-phone><label for="c-phone">Mobile</label><input id="c-phone" name="Phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="e.g. 647 555 0123"></div>
          <div class="field span-2" data-c-email><label for="c-email">Email</label><input id="c-email" name="Email" type="email" inputmode="email" autocomplete="email"></div>
          <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        </div>
        <p class="form-error" data-c-error role="alert" hidden></p>
        <button type="submit" class="btn btn-primary btn-block">Send change request</button>
        <p class="consent-line">${ic("i-check")}<span>This is a request. Your booking stays as it is until ${esc(B.ownerFirstName)} confirms the change with you.</span></p>
        <p class="privacy-note">${SENT_VIA} See our <a href="${L("privacy/")}">Privacy Policy</a>.</p>
      </form>
      <div class="quote-done change-done" data-change-done hidden tabindex="-1">
        <p class="label" data-cd-label>Change request received · not changed yet</p>
        <h2 data-cd-title>Thank you.</h2>
        <p data-cd-text></p>
        <dl class="done-list" data-cd-list></dl>
      </div>`;
}

// Home: the newest guides as a short list beside the questions, not a section of their own.
function guideLinks(L) {
  return `<div class="faq-guides">
        <p class="label">Guides</p>
        <ul class="guide-links">${guides.slice(0, 3).map((g) => `<li><a href="${L("guides/" + g.slug + "/")}"><small>${esc(g.kicker)} · ${g.minutes} min read</small><span>${esc(g.h1)}</span></a></li>`).join("")}</ul>
        <a class="text-link" href="${L("guides/")}">All guides ${ic("i-arrow")}</a>
      </div>`;
}

/* ---------- home ---------- */
const urls = [];
const homeFaq = faqBlock("home", "Questions, answered.");
const example = { beds: 2, baths: 1 };
const examplePrice = price("regular", example.beds, example.baths);
const gift = C.offers.gift;

// Plans: the home they're priced for sits above them, and each one is a way into booking with that plan chosen (?f=).
// The plan's name is in the button ("Choose every 2 weeks"), so it reads on its own in a list of links.
function plansGrid(L) {
  return `<p class="plan-for">Prices shown for: <strong>${esc(priceFor("regular", example.beds, example.baths))}</strong></p>
    <div class="plan-strip" data-plans data-beds="${example.beds}" data-baths="${example.baths}">
      ${Object.keys(C.frequencies).map((k) => {
        const f = C.frequencies[k];
        return `<div class="plan${f.recommended ? " plan-rec" : ""}" data-plan="${k}">
          ${f.recommended ? '<p class="plan-flag">Recommended</p>' : ""}
          <p class="plan-name">${esc(f.label)}</p>
          <p class="plan-price"><b data-plan-price>${money(afterDiscount(examplePrice, f.discount))}</b><span>per visit</span></p>
          <p class="plan-save">${f.discount ? `Save ${f.discount}%` : "No commitment"}</p>
          <a class="btn btn-primary btn-sm plan-go" href="${L("book/")}?s=regular&amp;f=${k}" data-track="plan_click">Choose ${esc(f.label.toLowerCase())}</a>
        </div>`;
      }).join("")}
    </div>`;
}

// Home: the plans sit under the service cards (how often comes after which clean), not in a section of their own.
function homePlans(L) {
  return `<div class="home-plans" id="plans">
      <div class="home-plans-head">
        <p class="label">Regular care</p>
        <h3>Set it once. Stay ahead.</h3>
        <p class="muted">Recurring visits cost less and keep your home consistently right. Pause or change anytime with ${C.policies.cancelNoticeHours} hours' notice.</p>
      </div>
      ${plansGrid(L)}
      <p class="fine">Choosing a plan opens the booking form with it selected. Your own home's price is worked out there.</p>
    </div>`;
}

/* v7 home: local, visual and quick to act on. Original landmark artwork (tools/landmarks.mjs) gives the page its place;
   the room explorer and the services explain the clean; nothing unconfirmed is ever shown. Details still to decide live in
   the owner's private handover list, not on the site. */
const DAYS_TEXT = C.openDays.length === 7 ? "7 days a week" : "most days";

// Photos of Mann at work. Drop name-600/928 .jpg and .webp into assets/photos (like the room photos) and the build uses
// them in the founder section; until a photo exists, its slot isn't shown at all.
const MANN_SHOTS = [
  { name: "mann-at-door", caption: "At your door, in house shoes", alt: `${B.ownerFirstName} at a client's door with his kit, changing into house shoes` },
  { name: "mann-kit", caption: "Separate cloths for kitchen and bath", alt: `${B.ownerFirstName}'s kit laid out: colour-coded cloths, caddy and vacuum` },
  { name: "mann-linens", caption: "Beds made, every visit", alt: `${B.ownerFirstName} making a bed` }
];
MANN_SHOTS.forEach((s) => { PHOTOS[s.name] = s.alt; });
function mannAtWork(L) {
  const shots = MANN_SHOTS.filter((s) => hasPhoto(s.name));
  if (!shots.length) return "";
  return `<ul class="mann-shots" aria-label="${esc(B.ownerFirstName)} at work">${shots.map((s) => `<li><figure class="shot">
        ${photo(L, s.name, { sizes: "(min-width: 60em) 300px, 80vw", cls: "shot-photo" })}
        <figcaption>${esc(s.caption)}</figcaption>
      </figure></li>`).join("")}</ul>`;
}

/* Airbnb turnovers: the home page's host section and the host page share these, and both read js/config.js
   (quoteServices.airbnb). Prices, the package and the first-turnover offer appear only once they're filled in there;
   until then turnovers are quoted through the host form. */
const HOST = C.quoteServices.airbnb;
const HOST_PATH = "services/" + HOST.slug + "/";
const HOST_PRICED = HOST.prices.some((p) => p.price != null);

// The turnover, checkout to check-in. The times are an example; every step is something the site already promises.
function turnoverTimeline() {
  const step = (time, title, text) => `<li><time>${time}</time><h3>${title}</h3><p>${text}</p></li>`;
  return `<ol class="turnover">
      ${step("11am", "Guests check out", "Send me your checkout times, or your listing's calendar link, and I plan my day around them.")}
      ${step("11:15am", "I let myself in", `With your lockbox or door code. I delete codes within ${C.policies.accessCodeDeleteDays} days of your last scheduled clean.`)}
      ${step("11:30am", "The full reset", "Kitchen, bathroom, floors and everything guests touch, beds made, done the same careful way every time.")}
      ${step("4pm", "Next guests arrive", "To a space that's reset and ready.")}
    </ol>`;
}

// The host package and the first-turnover offer, each shown only once it's set in js/config.js.
function hostOffers({ perTurnover = true } = {}) {
  const [p1, p2] = HOST.prices;
  const pk = HOST.package || {};
  const cards = [
    perTurnover && p1.price != null ? `<li><p class="ho-label">Per turnover</p><p class="ho-price">${money(p1.price)}</p><p>${esc(p1.size)}.${p2 && p2.price != null ? ` ${money(p2.price)} for ${esc(p2.size.toLowerCase())}.` : ""}</p></li>` : "",
    pk.price != null && pk.turnovers != null ? `<li><p class="ho-label">Host package</p><p class="ho-price">${money(pk.price)} <small>a month</small></p><p>${esc(pk.turnovers)} turnovers a month, and the same person every time: me.</p></li>` : "",
    HOST.firstOffer ? `<li><p class="ho-label">Your first turnover</p><p class="ho-price">${esc(HOST.firstOffer)}</p><p>See the standard before you choose a package.</p></li>` : ""
  ].filter(Boolean);
  return cards.length ? `<ul class="host-offers${cards.length === 2 ? " host-offers-2" : ""}">${cards.join("")}</ul>` : "";
}

function hostsSection(L) {
  return `<section class="section hosts" id="hosts">
  <div class="wrap">
    <div class="section-head">
      <p class="label">For Airbnb and short-term rental hosts</p>
      <h2>Guests out at 11. Ready for 4.</h2>
      <p class="muted">A same-day turnover, start to finish. The times are an example: I plan around your listing's checkout and check-in, ${DAYS_TEXT}, until ${clock(C.closes)}.</p>
    </div>
    ${turnoverTimeline()}
    ${hostOffers()}
    <div class="host-cta">
      <a class="btn btn-primary" href="${L(HOST_PATH)}#host-form" data-track="host_click">${HOST_PRICED ? "Tell me about your listing" : "Get a turnover quote"} ${ic("i-arrow")}</a>
      <a class="text-link" href="${L(HOST_PATH)}">How turnovers work ${ic("i-arrow")}</a>
      ${HOST_PRICED ? "" : `<p class="cta-note">Turnovers are quoted per unit, so the price fits your listing. I reply ${esc(HOST.replyPromise)}.</p>`}
    </div>
  </div>
</section>`;
}

/* Room by room: the same checklist and extras the service pages, pricing and booking use (checklist and addons in
   js/config.js), so the three can never disagree. Without JavaScript every room shows the regular clean, one after another;
   js/site.js turns the rooms into tabs and the clean choice into a switch. */
const EXPLORE = ["regular", "deep", "move"];
const ROOM_PHOTO = { Kitchen: "kitchen", Bathrooms: "bathroom", "Bedrooms & living": "bedroom", "Whole home": "entryway" };
const roomId = (room) => "room-" + room.toLowerCase().replace(/[^a-z]+/g, "-").replace(/-$/, "");
function roomList(k, r) {
  const s = C.services[k], col = s.checklistColumn;
  const by = (v) => r.tasks.filter((t) => (t[col] || "") === v);
  const yes = by("yes"), add = roomExtras(k, r), none = by("");
  return `<div class="ex-list" data-ex-for="${k}"${k === EXPLORE[0] ? "" : " hidden"}>
          <p class="ex-count"><b>${yes.length}</b> included in ${esc(s.name)}</p>
          <ul class="ex-yes">${yes.map((t) => `<li>${ic("i-check")}<span>${esc(t[0])}</span></li>`).join("")}</ul>
          ${add.length ? `<p class="incl-sub">Add as an extra</p><ul class="ex-add">${add.map(([name, p]) => `<li>${ic("i-plus")}<span>${esc(name)}</span>${p != null ? `<b>+${money(p)}</b>` : ""}</li>`).join("")}</ul>` : ""}
          ${none.length ? `<p class="incl-sub">Not part of this clean</p><ul class="ex-none">${none.map((t) => `<li>${ic("i-minus")}<span>${esc(t[0])}</span></li>`).join("")}</ul>` : ""}
        </div>`;
}
function roomExplorer(L) {
  return `<section class="section section-tint explorer" id="rooms" aria-labelledby="rooms-title">
  <div class="wrap">
    <div class="section-head">
      <p class="label">Room by room</p>
      <h2 id="rooms-title">See exactly what's included.</h2>
      <p class="muted">Choose a service and room to see what we clean.</p>
    </div>
    <fieldset class="ex-svc" data-ex-svc>
      <legend class="sr-only">Show what's included in</legend>
      <div class="ex-svc-opts">${EXPLORE.map((k, i) => `<label><input type="radio" name="ex-svc" value="${k}"${i ? "" : " checked"}><span>${esc(C.services[k].menuName)}</span></label>`).join("")}</div>
    </fieldset>
    <div class="ex-rooms" data-explorer>
      ${C.checklist.map((r) => `<div class="ex-room" id="${roomId(r.room)}" data-tab-label="${esc(r.room)}">
        ${photo(L, ROOM_PHOTO[r.room] || "living-room", { sizes: "(min-width: 60em) 420px, 92vw", cls: "ex-photo" })}
        <div class="ex-body">
          <h3 class="ex-room-name">${esc(r.room)}</h3>
          ${EXPLORE.map((k) => roomList(k, r)).join("")}
        </div>
      </div>`).join("")}
    </div>
    <div class="ex-foot">
      <a class="btn btn-primary" href="${L("book/")}?s=${EXPLORE[0]}" data-ex-book data-track="book_click">${ACT.book}</a>
      <a class="text-link" href="${L("pricing/#compare")}">Compare every task side by side ${ic("i-arrow")}</a>
    </div>
    <p class="fine">Room photos are illustrations, not photos of client homes.</p>
  </div>
</section>`;
}

/* Local discovery: the two districts with their landmark art, every neighbourhood in a list that filters as you type,
   and the postal-code check (the 41 postal areas in serviceArea) for anything not listed. */
function areasSection(L) {
  const fsas = (a) => (C.serviceArea.districts.find((d) => d.name === a.name) || { prefixes: [] }).prefixes.length;
  return `<section class="section areas" id="areas" aria-labelledby="areas-title">
  <div class="wrap">
    <div class="section-head">
      <p class="label">Service area</p>
      <h2 id="areas-title">Scarborough and North York.</h2>
      <p class="muted">Two districts, so I can be on time, every time. Your exact address is confirmed when ${esc(B.ownerFirstName)} replies.</p>
    </div>
    <div class="areas-grid">
    <ul class="area-cards">
      ${C.areas.map((a) => `<li><a class="area-card" href="${L("areas/" + a.slug + "/")}">
        <span class="area-art">${districtScene(a.slug, { decorative: true })}</span>
        <span class="area-text"><strong>${esc(a.name)}</strong><small>${a.neighbourhoods.length} neighbourhoods · ${fsas(a)} postal areas</small></span>${ic("i-arrow")}
      </a></li>`).join("")}
    </ul>
    <div class="hood-finder" data-hood-finder>
      <div class="hood-search" data-hood-search hidden>
        <label for="hood-q">Find your neighbourhood</label>
        <input id="hood-q" type="search" autocomplete="off" spellcheck="false" placeholder="e.g. Agincourt or Willowdale" data-hood-q>
        <p class="hood-count" data-hood-count aria-live="polite"></p>
      </div>
      <div class="hood-groups">
        ${C.areas.map((a) => `<div class="hood-group" data-hood-group><h3>${esc(a.name)}</h3>${hoodChips(L, a)}</div>`).join("")}
      </div>
      <p class="hood-empty" data-hood-empty hidden>Not listed? Your street may still be in my area. <a href="#pc-home">Check your postal code</a>.</p>
    </div>
    </div>
  </div>
</section>`;
}

urls.push(page({
  depth: 0, pathOut: "index.html", pageType: "home",
  title: `Home Cleaning in Scarborough & North York | ${B.name}`,
  description: `Careful home cleaning in Scarborough and North York, Toronto, from ${money(C.services.regular.base)}. See your price in seconds, book in two minutes, pay after your clean.`,
  schemas: [businessSchema(), websiteSchema(), homeFaq.schema],
  body: (L) => `
<section class="hero hero-home">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <a class="hero-chip" href="${L(HOST_PATH)}"><span class="chip-new">New</span><span>Airbnb turnovers, ${C.openDays.length === 7 ? "daily" : "most days"} until ${clock(C.closes)}</span>${ic("i-arrow")}</a>
      <h1 class="hero-title"><span class="hero-what">House cleaning in ${esc(B.areaLabel)}</span> <span class="display">We clean.<br> <span class="accent">You rest.</span></span></h1>
      <p class="lede">Hi, I'm ${esc(B.ownerFirstName)}. I clean every home myself, so your weekends are for living, not scrubbing. You pay only after the clean.</p>
      <figure class="hero-scene">${heroNarrow()}<figcaption><span>North York Centre</span><span>Scarborough Bluffs</span></figcaption></figure>
      ${postalForm("pc-home", "Do I come to you? Check your postal code")}
      <div class="hero-cta">
        <a class="btn btn-primary" href="${L("book/")}" data-track="book_click">${ACT.book} ${ic("i-arrow")}</a>
        <a class="text-link" href="${L("#how")}">How it works ${ic("i-arrow")}</a>
        ${B.whatsapp ? `<a class="btn btn-wa" data-wa href="${esc(waLink(WA_HELLO))}" target="_blank" rel="noopener" data-track="whatsapp_click">${ic("i-wa")} WhatsApp</a>` : ""}
        <p class="cta-note">${CAL ? "About two minutes. You pick a confirmed time on the calendar." : `About two minutes. ${esc(B.ownerFirstName)} confirms your day and time.`}</p>
      </div>
    </div>
    <div class="hero-visual">
      <div class="hero-pricer">${pricer(L)}</div>
    </div>
    <p class="hero-owner">
      <span class="hero-avatar"><picture><source type="image/webp" srcset="${L("assets/founder-mann-patel-avatar.webp")}"><img src="${L("assets/founder-mann-patel-avatar.jpg")}" alt="" width="76" height="76" decoding="async"></picture></span>
      <span><strong>Every clean is done by ${esc(B.owner)}, the owner.</strong> The person at your door runs the business.</span>
    </p>
  </div>
</section>
${trustStrip()}

${gift && gift.active ? `<section class="gift-band" data-gift-banner data-months="${gift.bannerMonths.join(",")}" hidden>
  <div class="wrap gift-band-inner">
    <span class="gift-ico">${ic("i-gift")}</span>
    <p><strong>${esc(gift.headline)}</strong> ${esc(gift.text)}</p>
    <a class="btn btn-light btn-sm" href="${L("gift/")}" data-track="gift_click">Gift a clean</a>
  </div>
</section>` : ""}

<section class="section" id="services">
  <div class="wrap">
    <div class="section-head section-head-row">
      <div><p class="label">Services</p><h2>Choose the care your home needs.</h2></div>
      <a class="text-link" href="${L("pricing/")}">See every price ${ic("i-arrow")}</a>
    </div>
    ${homeServices(L)}
  </div>
</section>

${roomExplorer(L)}

<section class="section how" id="how" aria-labelledby="how-title">
  <div class="wrap">
    <div class="section-head section-head-row">
      <div><p class="label">How it works</p><h2 id="how-title">${CAL ? "Booked in two minutes. Confirmed instantly." : `Request in two minutes. ${esc(B.ownerFirstName)} confirms.`}</h2></div>
      <a class="text-link" href="${L("help/")}">What happens after you request ${ic("i-arrow")}</a>
    </div>
    <ol class="steps-3">
      <li><h3>See your price</h3><p>From your home's size and the extras you choose. No contact details and no estimate visit needed.</p></li>
      ${CAL
        ? `<li><h3>Pick a time</h3><p>Choose a real opening on ${esc(B.ownerFirstName)}'s calendar, any day of the week, evenings included.</p></li>
      <li><h3>You're confirmed</h3><p>Your time is confirmed straight away, by email. ${esc(B.ownerFirstName)} also texts you <span data-reply>${esc(B.replyPromise)}</span>. You pay after the clean.</p></li>`
        : `<li><h3>Request your day</h3><p>Pick a preferred day and arrival window, or tell us you're flexible. Requests from <strong data-next-open>tomorrow</strong>, any day of the week.</p></li>
      <li><h3>${esc(B.ownerFirstName)} confirms</h3><p>${esc(B.ownerFirstName)} replies <span data-reply>${esc(B.replyPromise)}</span> to agree your time and final price. Your time is held once it's confirmed. You pay after the clean.</p></li>`}
    </ol>
    <div class="how-trust">
      <div class="how-left">
        <figure class="how-meet" aria-labelledby="meet-title">
          ${founderPhoto(L, "how-photo")}
          <figcaption class="how-meet-body">
            <p class="label">Meet your cleaner</p>
            <h3 id="meet-title">I clean every home myself.</h3>
            <blockquote><p>“I started Nest &amp; Rest to give families their time back and a fresh, healthy home, with the best care and value in every visit.”</p></blockquote>
            <p class="how-name"><strong data-owner>${esc(B.owner)}</strong><span>Founder &amp; Owner</span></p>
            <a class="text-link" href="${L("vision/")}">Read ${esc(B.ownerFirstName)}'s vision ${ic("i-arrow")}</a>
          </figcaption>
        </figure>
        <div class="how-guarantee" id="guarantee">
          <span class="how-guarantee-ico">${ic("i-shield")}</span>
          <div>
            <p class="guarantee-title" id="guarantee-title">Not quite right? I come back and fix it, free.</p>
            <p>${GUARANTEE_LINE}</p>
            <a class="text-link" href="${L("policies/#guarantee")}">Read the service policies ${ic("i-arrow")}</a>
          </div>
        </div>
      </div>
      <div class="standard how-standard" id="standard">
        <p class="label">The Nest &amp; Rest standard</p>
        <h3 class="how-standard-title">Five things happen at every visit.</h3>
        <ol class="ritual">
          <li><h4>Introduced by name</h4><p>You'll know who's coming before I arrive.</p></li>
          <li><h4>Street shoes off, house shoes on</h4><p>Your floors only ever meet clean soles.</p></li>
          <li><h4>Your priorities first</h4><p>A quick word on what matters most today.</p></li>
          <li><h4>Separate cloths for kitchen and bath</h4><p>What cleans a bathroom never touches your kitchen.</p></li>
          <li><h4>A final check before I leave</h4><p>Every room checked against the checklist.</p></li>
        </ol>
      </div>
    </div>
    ${mannAtWork(L)}
    <div class="center-cta"><a class="btn btn-primary" href="${L("book/")}" data-track="book_click">${ACT.book}</a></div>
  </div>
</section>

${hostsSection(L)}

${jobsSection(jobs.slice(0, 3), "Recent cleans.", "")}
<section class="section reviews" id="reviews" data-reviews hidden>
  <div class="wrap">
    <div class="section-head"><p class="label">Reviews</p><h2 data-reviews-title>What clients say.</h2><p class="muted" data-reviews-sub></p></div>
    <div class="review-grid" data-reviews-list></div>
  </div>
</section>

${areasSection(L)}

${faqBlock("home", "Questions, answered.", "", guideLinks(L)).html}
<figure class="page-scene">${heroWide()}<figcaption><span>North York Centre</span><span>Scarborough Bluffs</span></figcaption></figure>
${finalCta(L)}
`
}));

/* ---------- booking ---------- */
urls.push(page({
  depth: 1, pathOut: "book/index.html", pageType: "book", minimal: true, noBar: true,
  title: `${CAL ? "Book" : "Request"} a Clean | ${B.name}`,
  description: CAL
    ? "Book your home cleaning online in about two minutes. See your price, pick a time on our calendar, and pay after the clean."
    : "Request your home cleaning online in about two minutes. See your price, choose a preferred day and arrival window, and pay after the clean.",
  body: (L) => {
    const freqField = `<div class="field" data-freq-field><span class="field-label" id="freq-label">How often</span>
              <div class="freq-grid" role="radiogroup" aria-labelledby="freq-label">
                ${Object.keys(C.frequencies).map((k) => { const f = C.frequencies[k]; return `<label class="choice"><input type="radio" name="freq" value="${k}"><span class="choice-body"><strong>${esc(f.label)}</strong><span class="choice-desc">${f.discount ? `Save ${f.discount}%` : "No commitment"}</span></span></label>`; }).join("")}
              </div>
            </div>`;
    // "Larger home or an office?": the quote services for homes and offices, not the Airbnb host service.
    const quoteNames = quoteKeys.map((k) => C.quoteServices[k]).filter((q) => !q.host);
    // Each Continue says what comes next, so the button matches the step the customer is moving to.
    const NEXT = CAL ? ["Add your details"] : ["Choose a preferred day", "Add your details"];
    // Optional parts fold away under a summary that says what's chosen (js/site.js fills [data-section-status]),
    // so a selected extra or preference is never out of sight.
    const section = (name, title, status, body, cls = "") => `<details class="section-box${cls}" data-section="${name}">
              <summary><span class="sb-title">${title}</span><span class="sb-status" data-section-status="${name}">${status}</span>${ic("i-chev")}</summary>
              <div class="section-body">
                ${body}
              </div>
            </details>`;
    return `
<section class="book">
  <noscript><div class="wrap"><p class="form-error">Booking needs JavaScript. Please ${PHONE ? `call or text <a href="tel:${B.phone}">${esc(B.phoneDisplay)}</a>` : `email <a href="mailto:${B.email}">${esc(B.email)}</a>`} and we'll book you in.</p></div></noscript>
  <div class="wrap">
    <div class="book-head">
      <div>
        <h1>${ACT.book}</h1>
        <p class="book-sub">${ic("i-cal")} <span>${CAL ? "Bookings from" : "Earliest day to request:"} <strong data-next-open>tomorrow</strong>${CAL ? "" : `. ${esc(B.ownerFirstName)} confirms every booking.`}</span></p>
      </div>
      <ol class="progress" data-progress aria-label="Booking steps">
        ${(CAL ? ["Your home", "Your details", "Pick a time"] : ["Your home", "Plan &amp; time", "Your details"]).map((t, i) => `<li data-dot="${i + 1}"><span>${t}</span></li>`).join("\n        ")}
      </ol>
    </div>
    <div class="booker">
      <div class="booker-main">
        <form id="booking-form" class="booking-form" novalidate>
          <fieldset class="step" data-step="1">
            <legend>Your home</legend>
            <p class="prefill-note" data-plan-note hidden>${ic("i-check")}<span data-plan-note-text></span></p>
            <div class="picked" data-picked hidden>
              <div class="picked-body">
                <p class="picked-label">Your clean, from the price box</p>
                <p class="picked-what" data-picked-what></p>
                <p class="picked-home" data-picked-home></p>
              </div>
              <button type="button" class="link-btn" data-picked-edit aria-controls="home-fields" aria-expanded="false">Edit<span class="sr-only"> service and home</span></button>
            </div>
            <div class="field"><label for="f-postal">Postal code of the home</label><input id="f-postal" name="postal" autocomplete="postal-code" autocapitalize="characters" maxlength="7" placeholder="e.g. M1B 2K3" required><small class="pc-result" data-pc-booking aria-live="polite"></small></div>
            <div class="home-fields" id="home-fields" data-home-fields>
            <div class="field"><span class="field-label" id="svc-label">Service</span>
              <div class="choice-grid" role="radiogroup" aria-labelledby="svc-label">
                ${svcKeys.map((k) => { const s = C.services[k]; return `<label class="choice"><input type="radio" name="service" value="${k}"><span class="choice-body"><strong>${esc(s.name)}</strong><span class="choice-from">from <b data-from="${k}">${money(s.base)}</b></span><span class="choice-desc">${esc(s.short)}</span></span></label>`; }).join("")}
              </div>
              <p class="scope-line" data-scope-line></p>
              <details class="compare-box">
                <summary>${ic("i-plus")}<span>Not sure? Compare what each clean includes</span></summary>
                <p class="field-note">Room by room. Extras are added on top at the prices below. Kitchen &amp; Bath Detailing covers the kitchen and bathrooms only, at the deep-clean standard.</p>
                ${compareTable()}
              </details>
              <p class="field-note">Larger home or an office? ${quoteNames.map((q) => `<a href="${L("services/" + q.slug + "/")}">${esc(q.name)}</a>`).join(" and ")} are by quote.</p>
            </div>
            <div class="field"><span class="field-label" id="home-label">Type of home</span>
              <div class="seg seg-home" role="radiogroup" aria-labelledby="home-label">
                ${Object.keys(C.homeTypes).map((k) => `<label><input type="radio" name="homeType" value="${k}"><span>${esc(C.homeTypes[k].label)}</span></label>`).join("")}
              </div>
            </div>
            <div class="field">
              <div class="pricer-row">
                ${stepper("b-beds", "Bedrooms", 1, 'data-counter="beds"')}
                ${stepper("b-baths", "Bathrooms", 1, 'data-counter="baths"')}
              </div>
              <small class="field-hint">A studio counts as 1 bedroom. Count full bathrooms, with a tub or shower.</small>
            </div>
            </div>
            ${(C.homeChecks || []).length ? section("checks", `Anything unusual about your home? <span class="opt">optional</span>`, "None", `<div class="check-list" role="group" aria-label="Anything unusual about your home?" data-checks>
                  ${C.homeChecks.map((c) => `<label class="check"><input type="checkbox" name="check" value="${esc(c.id)}"> <span>${esc(c.label)}</span></label>`).join("")}
                </div>
                <ul class="check-notes" data-check-notes aria-live="polite"></ul>
                <div class="quote-route" data-quote-route hidden>
                  <p><strong>Homes this size are priced by quote.</strong> ${esc(B.ownerFirstName)} starts with a walkthrough and a written care plan, so the price fits the home.</p>
                  <a class="btn btn-teal btn-sm" data-quote-link href="${L("services/residence-care/")}">Get a Residence Care quote ${ic("i-arrow")}</a>
                  <small class="field-hint">Your home details are carried over. Nothing is sent until you send the quote form.</small>
                  <p class="field-error" id="err-quote" data-step-error="quote" hidden></p>
                </div>`) : ""}
            ${section("extras", `Extras <span class="opt">optional</span>`, "None added", `<div class="extras" role="group" aria-label="Extras" data-addons>
                  ${C.addons.map((a) => `<label class="extra" data-addon="${a.id}"><input type="checkbox" name="addon" value="${a.id}"><span class="extra-box" aria-hidden="true">${ic("i-check")}</span><span class="extra-body"><span class="extra-name">${esc(a.name)}</span>${a.limit ? `<small class="extra-limit">${esc(a.limit)}</small>` : ""}</span><b class="extra-price" data-addon-price>+${money(a.price)}</b></label>`).join("")}
                </div>`)}
            <p class="scope-note" data-scope-note role="status"></p>
            ${CAL ? freqField : ""}
          </fieldset>

          ${CAL ? "" : `<fieldset class="step" data-step="2" hidden>
            <legend>Plan &amp; preferred time</legend>
            ${freqField}
            <div class="field"><span class="field-label" id="date-label">Preferred day</span>
              <p class="field-note">Choose your preferred day. ${esc(B.ownerFirstName)} will confirm availability. Requests from <strong data-next-open>tomorrow</strong>, any day of the week.</p>
              <div class="date-nav" data-date-nav hidden>
                <button type="button" class="date-step" data-date-step="-1" aria-controls="date-strip" aria-label="Earlier dates">${ic("i-back")}</button>
                <p class="date-range" data-date-range></p>
                <button type="button" class="date-step" data-date-step="1" aria-controls="date-strip" aria-label="Later dates">${ic("i-arrow")}</button>
              </div>
              <div class="date-strip" id="date-strip" role="radiogroup" aria-labelledby="date-label" data-dates></div>
              <label class="check"><input type="checkbox" id="flex-date" data-flex> <span>I'm flexible. Please offer the earliest suitable appointment.</span></label>
              <p class="field-error" id="err-date" data-step-error="date" hidden></p>
            </div>
            <div class="field"><span class="field-label" id="slot-label">Preferred arrival window</span>
              <p class="field-note">Your clean takes about <strong data-job-hours>2</strong> hours on site after arrival, with ${(C.booking || {}).cleaners > 1 ? `${C.booking.cleaners} cleaners` : "one cleaner"}. Windows too late to finish by ${Number(C.closes.split(":")[0]) > 12 ? Number(C.closes.split(":")[0]) - 12 + "pm" : C.closes} are greyed out.</p>
              <div class="slot-grid" role="radiogroup" aria-labelledby="slot-label">
                ${C.timeSlots.map((t) => `<label class="slot" data-slot="${t.id}"><input type="radio" name="slot" value="${t.id}"><span><strong>${esc(t.label)}</strong><small>${esc(t.time)}</small></span></label>`).join("")}
              </div>
              <p class="field-hint" data-slot-note aria-live="polite"></p>
              <p class="field-error" id="err-slot" data-step-error="slot" hidden></p>
            </div>
            <p class="consent-line">${ic("i-check")}<span>This is a request, not a booked time. Your time is held only after ${esc(B.ownerFirstName)} confirms it with you.</span></p>
          </fieldset>`}

          <fieldset class="step" data-step="${CAL ? 2 : 3}" hidden>
            <legend>Your details</legend>
            <p class="field-note">All fields are required unless marked optional.</p>
            <div class="form-grid">
              <div class="field"><label for="f-name">Full name</label><input id="f-name" name="name" autocomplete="name" required></div>
              <div class="field"><label for="f-phone">Mobile</label><input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="e.g. 647 555 0123" required></div>
              <div class="field span-2"><label for="f-email">Email <span class="opt">optional, if you'd like replies by email</span></label><input id="f-email" name="email" type="email" inputmode="email" autocomplete="email"></div>
              <div class="field span-2"><label for="f-address">Street address and unit</label><input id="f-address" name="address" autocomplete="street-address" required></div>
              <div class="field span-2"><span class="field-label" id="pref-label">Confirm by</span>
                <div class="seg${B.whatsapp ? " seg-4" : ""}" role="radiogroup" aria-labelledby="pref-label">
                  <label><input type="radio" name="contactPref" value="Text" checked><span>Text</span></label>
                  ${B.whatsapp ? '<label><input type="radio" name="contactPref" value="WhatsApp"><span>WhatsApp</span></label>' : ""}
                  <label><input type="radio" name="contactPref" value="Call"><span>Call</span></label>
                  <label><input type="radio" name="contactPref" value="Email"><span>Email</span></label>
                </div>
              </div>
              <div class="span-2 section-stack">
              ${section("visit", "Visit preferences", "I'll be home · No pets · Our products", `<div class="field"><label for="f-access">Getting in</label><div class="select-wrap"><select id="f-access" name="access"><option>I'll be home</option><option>Concierge or front desk</option><option>Lockbox or key code</option><option>Let's discuss</option></select>${ic("i-chev")}</div>
                  <p class="field-hint" data-code-note hidden>No codes here, please. ${esc(B.ownerFirstName)} asks for the code by text once your clean is confirmed.</p>
                </div>
                <div class="field building" data-building hidden>
                  <p class="field-label">Your building <span class="opt">optional, so the visit starts on time</span></p>
                  <div class="field"><label for="f-parking">Parking for the cleaner</label><div class="select-wrap"><select id="f-parking" name="parking"><option>Not sure</option><option>Visitor parking</option><option>Street or paid parking nearby</option><option>No parking: let's discuss</option></select>${ic("i-chev")}</div></div>
                  <label class="check"><input type="checkbox" id="f-elevator" name="elevator"> <span>The service elevator needs booking</span></label>
                  <label class="check"><input type="checkbox" id="f-register" name="register"> <span>Cleaners must be registered with the concierge</span></label>
                </div>
                <div class="field"><span class="field-label" id="pets-label">Pets</span>
                  <div class="seg" role="radiogroup" aria-labelledby="pets-label">
                    <label><input type="radio" name="pets" value="No pets" checked><span>No pets</span></label>
                    <label><input type="radio" name="pets" value="Dog"><span>Dog</span></label>
                    <label><input type="radio" name="pets" value="Cat or other"><span>Cat / other</span></label>
                  </div>
                </div>
                <div class="field"><span class="field-label" id="products-label">Products</span>
                  <div class="seg" role="radiogroup" aria-labelledby="products-label">
                    <label><input type="radio" name="products" value="Our products" checked><span>Our products</span></label>
                    <label><input type="radio" name="products" value="Fragrance-free"><span>Fragrance-free</span></label>
                    <label><input type="radio" name="products" value="Use my products"><span>Use mine</span></label>
                  </div>
                </div>
                <div class="field"><label for="f-notes">Notes <span class="opt">optional</span></label><textarea id="f-notes" name="notes" rows="3" placeholder="Rooms to focus on, things to leave alone"></textarea><small class="field-hint">Please don't type door or lockbox codes here. We'll ask for them by text once your booking is confirmed.</small></div>`)}
              ${section("referral", `Referred by a client? <span class="opt">optional</span>`, "No", `<div class="field"><label for="f-referrer">Their first and last name</label><input id="f-referrer" name="referrer" autocomplete="off" autocapitalize="words" placeholder="First and last name"><small class="field-hint">We'll give them $${C.offers.referral} off their next clean once yours is done and paid.</small></div>`)}
              </div>
              <section class="review span-2" aria-labelledby="review-title">
                <h2 class="review-title" id="review-title">Check your clean</h2>
                <p class="field-note">You can change any detail before sending.</p>
                <div class="review-body" data-review></div>
              </section>
              <p class="consent-line span-2">${ic("i-check")}<span>${CAL
                ? `Next, you pick a time on ${esc(B.ownerFirstName)}'s calendar and it's confirmed straight away. Nothing to pay until it's done. Free to change up to ${C.policies.cancelNoticeHours} hours before. ${LATE_FEE_LINE}`
                : `This is a booking request. Your time is held only after ${esc(B.ownerFirstName)} confirms it with you, along with the final price. Nothing to pay until it's done. Free to change up to ${C.policies.cancelNoticeHours} hours before. ${LATE_FEE_LINE}`}</span></p>
              <p class="privacy-note span-2">Your booking is with ${esc(B.name)}, owned and operated by ${esc(B.owner)}, ${ADDR ? esc(ADDR) : `${esc(B.base)}, Ontario`}. ${PHONE ? `<a data-tel href="tel:${B.phone}">${esc(B.phoneDisplay)}</a> · ` : ""}<a data-mailto href="mailto:${B.email}">${esc(B.email)}</a></p>
              <p class="privacy-note span-2">By sending, you agree to our <a href="${L("policies/")}">Service Policies</a>. We use your details only to arrange your clean. ${SHEET ? "Your request is saved to our Google Sheet and emailed to our Gmail inbox (both Google)" : "Your request is sent through FormSubmit to our Google email inbox"}${CAL ? ", and the time you pick is booked on Cal.com, our booking calendar. " + (SHEET ? "All" : "Both") : ", which"} may store data outside Canada. Your details stay in this browser tab only until you send. See our <a href="${L("privacy/")}">Privacy Policy</a>. <button type="button" class="link-btn link-btn-sm" data-clear-details>Clear my details from this device</button></p>
              <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
            </div>
            <p class="form-error" data-form-error role="alert" hidden></p>
          </fieldset>

          <div class="step-nav">
            <button type="button" class="btn btn-ghost" data-prev hidden>${ic("i-back")}<span class="prev-label">Back</span></button>
            <button type="button" class="btn btn-primary btn-grow" data-next data-next-labels="${esc(JSON.stringify(NEXT))}"><span data-next-label>${NEXT[0]}</span> ${ic("i-arrow")}</button>
            <button type="submit" class="btn btn-primary btn-grow" data-submit hidden>${ACT.send}${CAL ? " " + ic("i-arrow") : ""}</button>
          </div>
        </form>

        ${CAL ? `<div class="cal-step" data-cal-step hidden tabindex="-1">
          <p class="label">Last step</p>
          <h2>Pick your time</h2>
          <p>Your details are in. Choose a time that suits you and it's confirmed straight away. Cal.com emails you the confirmation.</p>
          <div class="cal-embed" data-cal-embed></div>
          <p class="form-error" data-cal-fail role="alert" hidden>The calendar didn't load here. Open it in a new tab below, or ${esc(B.ownerFirstName)} will text you ${esc(B.replyPromise)} to arrange a time.</p>
          <p class="cal-alt"><a class="text-link" data-cal-link href="#" target="_blank" rel="noopener">Open the calendar in a new tab ${ic("i-arrow")}</a></p>
        </div>

        ` : ""}<div class="done" data-done hidden tabindex="-1">
          <p class="label" data-done-label>Request received · not confirmed yet</p>
          <h2 data-done-title>Thank you.</h2>
          <div class="done-from"><picture><source type="image/webp" srcset="${L("assets/founder-mann-patel-avatar.webp")}"><img src="${L("assets/founder-mann-patel-avatar.jpg")}" alt="" width="48" height="48" loading="lazy" decoding="async"></picture><p data-done-text></p></div>
          <p class="ref">Reference <strong data-ref></strong></p>
          <dl class="done-list" data-done-list></dl>
          <div class="done-actions">
            <a class="btn btn-primary" data-change-mail href="mailto:${B.email}">${ic("i-mail")} Email a change</a>
            <button type="button" class="btn btn-ghost" data-ics>${ic("i-cal")} Save the requested time</button>
            ${B.whatsapp ? `<a class="btn btn-wa" data-wa-booking href="#" target="_blank" rel="noopener">${ic("i-wa")} Send on WhatsApp</a>` : ""}
            ${PHONE ? `<a class="btn btn-ghost" data-sms-booking href="#">${ic("i-sms")} Text us these details</a>` : ""}
          </div>
          <p class="field-note">Keep your reference. It's how to change, cancel or ask about this request. <a href="${L("help/")}">Help with your booking</a></p>
          <div class="done-refer">
            <p><strong>Know someone who'd love this?</strong> When a friend books their first clean, you both get $<span data-referral>${C.offers.referral}</span> off. Ask them to give us your first and last name when they book. <a href="${L("policies/#referral")}">Terms</a></p>
            <button type="button" class="btn btn-ghost btn-sm" data-share>Share ${esc(B.name)}</button>
          </div>
        </div>
      </div>

      <aside class="summary" data-summary aria-live="polite">
        <button type="button" class="summary-toggle" data-summary-toggle aria-expanded="false">
          <span class="sum-label" data-sum-label>Your estimate</span>
          <span class="sum-total" data-total>${money(price("regular", 1, 1))}</span>
          ${ic("i-chev")}
        </button>
        <div class="summary-body">
          <dl class="sum-lines" data-lines></dl>
          <p class="sum-fine" data-fine>No payment now. You pay after the clean.</p>
        </div>
      </aside>
    </div>
  </div>
</section>`;
  }
}));

// Extras with what each price covers. With a service key, each line follows that service's scope rule.
function extrasList(key) {
  return `<ul class="price-list extras-list">${C.addons.map((a) => {
    const st = key ? addonStatus(key, a.id) : "extra";
    const tag = st === "included" ? "Included" : st === "none" ? "Not offered" : "+" + money(a.price);
    return `<li class="${st === "extra" ? "" : "is-" + st}"><span><span class="xl-name">${esc(a.name)}</span>${a.limit && st === "extra" ? `<small>${esc(a.limit)}</small>` : ""}</span><b>${tag}</b></li>`;
  }).join("")}</ul>`;
}

/* ---------- service pages ---------- */
// The hero shows the same room as the home page's card for the service; the "Ideal for" section shows a different one.
const SVC_PHOTO = { regular: "bedroom", deep: "bathroom", move: "living-room", detail: "kitchen", residence: "living-room", office: "kitchen" };
// Every task in the service's rooms. What a visit covers leads each room; paid extras (with their prices) and what isn't
// part of this clean follow as supporting lists. The not-included list is what customers most often ask about after
// a visit, so it's listed, not left out.
const scopeTasks = (s) => C.checklist.filter((r) => !s.rooms || s.rooms.includes(r.room)).flatMap((r) => r.tasks);
// The extras listed under a room: one row per extra, each with its own price, so a task with two extras
// ("Inside fridge and oven") never reads as one price for both. Extras tied to no task sit under "Whole home".
function roomExtras(k, r) {
  const col = C.services[k].checklistColumn;
  return r.tasks.filter((t) => t[col] === "add").flatMap((t) => {
    const linked = C.addons.filter((a) => a.task === t[0]);
    return linked.length ? linked.map((a) => [a.name, a.price]) : [[t[0], null]];
  }).concat(r.room === "Whole home" ? C.addons.filter((a) => !a.task && addonStatus(k, a.id) === "extra").map((a) => [a.name, a.price]) : []);
}
function checklistFor(k) {
  const s = C.services[k], col = s.checklistColumn;
  const rooms = C.checklist.filter((r) => !s.rooms || s.rooms.includes(r.room));
  return rooms.map((r) => {
    const by = (v) => r.tasks.filter((t) => (t[col] || "") === v);
    const add = roomExtras(k, r), none = by("");
    const more = [
      add.length ? `<p class="incl-sub">Add as an extra</p><ul>${add.map(([name, p]) => `<li class="is-add">${ic("i-plus")}<span>${esc(name)}</span>${p != null ? `<b>+${money(p)}</b>` : ""}</li>`).join("")}</ul>` : "",
      none.length ? `<p class="incl-sub">Not part of this clean</p><ul>${none.map((t) => `<li class="is-none" data-not-included>${ic("i-minus")}<span>${esc(t[0])}</span></li>`).join("")}</ul>` : ""
    ].filter(Boolean).join("");
    return `<div class="incl-room"><h3>${esc(r.room)}</h3><ul class="incl-yes">${by("yes").map((t) => `<li>${ic("i-check")}<span>${esc(t[0])}</span></li>`).join("")}</ul>${more ? `<div class="incl-more">${more}</div>` : ""}</div>`;
  }).join("");
}
// The count of what's covered leads; extras and exclusions are the supporting line under it.
function scopeSummary(k) {
  const s = C.services[k], col = s.checklistColumn, t = scopeTasks(s);
  const n = (v) => t.filter((x) => (x[col] || "") === v).length;
  const extras = C.checklist.filter((r) => !s.rooms || s.rooms.includes(r.room)).reduce((sum, r) => sum + roomExtras(k, r).length, 0);
  return `<ul class="scope-sum"><li class="scope-main"><b>${n("yes")}</b> tasks in every visit</li>${extras ? `<li><b>${extras}</b> optional extras</li>` : ""}${n("") ? `<li><b>${n("")}</b> not part of this clean, listed under each room</li>` : ""}</ul>`;
}
// Points to the next fuller clean (the smallest step up that covers some of what this one leaves out), when there is one.
function scopeMore(L, k) {
  const s = C.services[k], col = s.checklistColumn, t = scopeTasks(s);
  const none = t.filter((x) => !x[col]);
  const yesIn = (c) => t.filter((x) => x[c] === "yes").length;
  const best = svcKeys.filter((o) => o !== k && !C.services[o].rooms && yesIn(C.services[o].checklistColumn) > yesIn(col))
    .map((o) => ({ o, n: none.filter((x) => x[C.services[o].checklistColumn] === "yes").length, size: yesIn(C.services[o].checklistColumn) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => a.size - b.size)[0];
  if (!none.length || !best || !best.n) return "";
  const o = C.services[best.o];
  const count = best.n === none.length ? (best.n === 1 ? "it" : best.n === 2 ? "both" : "all of them") : `${best.n} of the ${none.length}`;
  return `<div class="scope-more"><p>Need something that isn't part of this clean? ${esc(o.name)} includes ${count}${best.o === "move" ? ", for an empty home" : ""}.</p><a class="text-link" href="${L("services/" + o.slug + "/#included")}">See ${esc(o.menuName)} ${ic("i-arrow")}</a></div>`;
}

for (const k of svcKeys) {
  const s = C.services[k];
  const trail = [["Home", ""], [s.name, "services/" + s.slug + "/"]];
  const fq = faqBlock(k, undefined, "section-tint");
  const others = allServices.filter((o) => o.key !== k);
  urls.push(page({
    depth: 2, pathOut: `services/${s.slug}/index.html`, pageType: "service",
    title: `${s.name} in Scarborough & North York | ${B.name}`,
    description: metaDesc(`${s.name} in Scarborough and North York from ${money(s.base)}.`, s.short, "Price online, pay after the clean."),
    schemas: [
      { "@context": "https://schema.org", "@type": "Service", name: s.name, serviceType: s.name, description: s.intro, provider: { "@id": SITE + "/#business" }, areaServed: C.areas.map(placeSchema), offers: { "@type": "Offer", priceCurrency: C.currency, price: s.base, description: "Starting price for a 1-bedroom, 1-bathroom home" } },
      crumbSchema(trail), fq.schema
    ],
    body: (L) => `
<section class="hero hero-sub">
  <div class="wrap">${breadcrumbs(L, trail)}</div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      ${s.tag ? `<p class="kicker">${esc(s.tag)}</p>` : ""}
      <h1 class="display display-sub">${esc(s.name)}</h1>
      <p class="lede">${esc(s.intro)}</p>
      <dl class="facts">
        <div><dt>From</dt><dd data-from="${k}">${money(s.base)}</dd></div>
        <div><dt>Time on site</dt><dd>From ${s.hours} hrs</dd></div>
        <div><dt>Payment</dt><dd>After the clean</dd></div>
      </dl>
      ${photo(L, HOME_PHOTOS[k], { sizes: "(min-width: 960px) 520px, 92vw", cls: "hero-photo" })}
    </div>
    <div class="hero-pricer">${pricer(L, k, "Price your " + s.menuName.toLowerCase(), { owner: true })}</div>
  </div>
</section>

<section class="section" id="included">
  <div class="wrap">
    <div class="section-head"><p class="label">What's included</p><h2>What every visit covers.</h2><p class="muted">Room by room, what ${esc(s.menuName.toLowerCase())} takes care of each time. Under each room: what you can add, and what isn't part of this clean.${addonsWith(k, "none").length ? ` Not offered with this clean: ${esc(listJoin(addonsWith(k, "none").map((a) => a.name.toLowerCase())))}.` : ""}</p>${scopeSummary(k)}</div>
    <div class="incl-grid">${checklistFor(k)}</div>
    ${scopeMore(L, k)}
  </div>
</section>

<section class="section section-tint" id="prices">
  <div class="wrap split">
    <div class="split-head">
      <h2>${esc(s.menuName)} prices.</h2>
      <p class="muted">${k === "detail" ? "Priced by the number of bathrooms, with the kitchen always included." : "Studios are priced as 1 bedroom."} Products and equipment are included, and extras are added on top. For other sizes, use the price box above.</p>
      <a class="text-link" href="${L("pricing/")}">Compare every price ${ic("i-arrow")}</a>
    </div>
    ${priceTable(k)}
  </div>
</section>

<section class="section">
  <div class="wrap ideal-grid">
    ${photo(L, SVC_PHOTO[k], { sizes: "(min-width: 960px) 380px, 92vw", cls: "ideal-photo" })}
    <div class="split-head">
      <p class="label">Ideal for</p>
      <h2>Who books ${esc(s.menuName.toLowerCase())}.</h2>
      <ul class="ticks">${s.idealFor.map((i) => `<li>${ic("i-check")}${esc(i)}</li>`).join("")}</ul>
    </div>
    <div>
      <p class="label">Extras</p>
      ${extrasList(k)}
    </div>
  </div>
</section>

${fq.html}

<section class="section">
  <div class="wrap">
    <div class="section-head"><p class="label">Also available</p><h2>Other services.</h2></div>
    ${serviceCards(L, others, "svc-grid-compact")}
  </div>
</section>
${finalCta(L)}`
  }));
}

/* ---------- quote pages ---------- */
for (const k of quoteKeys) {
  const q = C.quoteServices[k];
  if (q.host) continue; // the Airbnb host page is built below, with its own sections
  const trail = [["Home", ""], [q.name, "services/" + q.slug + "/"]];
  const fq = faqBlock(k);
  urls.push(page({
    depth: 2, pathOut: `services/${q.slug}/index.html`, pageType: "quote",
    title: `${q.name} in Scarborough & North York | ${B.name}`,
    description: metaDesc(`${q.name} in Scarborough and North York, Toronto.`, q.short, "Request a free quote online."),
    schemas: [
      { "@context": "https://schema.org", "@type": "Service", name: q.name, serviceType: q.name, description: q.intro, provider: { "@id": SITE + "/#business" }, areaServed: C.areas.map(placeSchema) },
      crumbSchema(trail), fq.schema
    ],
    body: (L) => `
<section class="hero hero-sub">
  <div class="wrap">${breadcrumbs(L, trail)}</div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="kicker">By quote</p>
      <h1 class="display display-sub">${esc(q.name)}</h1>
      <p class="lede">${esc(q.intro)}</p>
      <ul class="ticks">${q.includes.map((i) => `<li>${ic("i-check")}${esc(i)}</li>`).join("")}</ul>
      ${photo(L, SVC_PHOTO[k], { sizes: "(min-width: 960px) 520px, 92vw", cls: "quote-photo" })}
    </div>
    <div class="hero-pricer">
      ${quoteForm(L, { name: q.name, reply: q.replyPromise, fields: q.fields })}
    </div>
  </div>
</section>
${fq.html}
${PHONE ? finalCta(L, "Prefer to talk it through?", "Call, text or WhatsApp and we'll answer your questions directly.") : finalCta(L, "Questions first?", "Email us and we'll answer them directly.")}`
  }));
}

/* ---------- Airbnb host page ---------- */
// Hosts get their own page: the turnover, what every turnover covers, prices and the host form.
// Its prices and decisions live in js/config.js (quoteServices.airbnb). Until prices are set, turnovers are quoted through the host form;
// linens, restocking and photo reports appear only once they're decided. What every turnover covers is the regular-clean checklist.
{
  const q = HOST;
  const trail = [["Home", ""], [q.name, HOST_PATH]];
  const fq = faqBlock("airbnb", "Host questions, answered.");
  const from = q.prices[0].price;
  const largest = q.prices[q.prices.length - 1].size.toLowerCase();
  const why = [
    ["i-user", "The same person every time", "Every turnover is done by me, the owner. I get to know your unit, your setup and what your guests need."],
    ["i-clock", `Turnovers until ${clock(C.closes)}, ${DAYS_TEXT}`, "Late checkouts and evening check-ins can still work. Tell me your times and I'll confirm what I can fit in."],
    ["i-key", "Your codes stay private", `I never copy keys or write codes on them, and I delete codes within ${C.policies.accessCodeDeleteDays} days of your last scheduled clean.`],
    ["i-shield", "Not right? I come back", `Report anything missed within ${RECLEAN_H} hours of the turnover and I'll come back and re-clean those areas, free.`]
  ];
  const formCta = { href: "#host-form", label: HOST_PRICED ? "Tell me about your listing" : "Get a turnover quote", track: "host_click" };
  // Only what Mann has decided: each is null in js/config.js until then, and stays off the page.
  const hostTerms = [["Linens", q.linens], ["Restocking", q.restock], ["Photos after each turnover", q.photoReport]].filter(([, d]) => d);
  urls.push(page({
    depth: 2, pathOut: `services/${q.slug}/index.html`, pageType: "host",
    title: `Airbnb Cleaning in Scarborough & North York | ${B.name}`,
    description: metaDesc("Airbnb and short-term rental cleaning in Scarborough and North York, Toronto.", `Same-day turnovers by the owner, ${DAYS_TEXT} until ${clock(C.closes)}.`, "Pay after each clean."),
    schemas: [
      { "@context": "https://schema.org", "@type": "Service", name: q.name, serviceType: "Short-term rental turnover cleaning", description: q.intro, provider: { "@id": SITE + "/#business" }, areaServed: C.areas.map(placeSchema),
        ...(from != null ? { offers: { "@type": "Offer", priceSpecification: { "@type": "PriceSpecification", minPrice: from, priceCurrency: C.currency } } } : {}) },
      crumbSchema(trail), fq.schema
    ],
    body: (L) => `
<section class="hero hero-sub">
  <div class="wrap">${breadcrumbs(L, trail)}</div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="kicker">For Airbnb and short-term rental hosts</p>
      <h1 class="display display-sub">Airbnb cleaning in Scarborough &amp; North York</h1>
      <p class="lede">${esc(q.intro)}</p>
      <dl class="facts">
        <div><dt>Per turnover</dt><dd>${from != null ? "From " + money(from) : "By quote"}</dd></div>
        ${OPEN_FACT}
        <div><dt>Who cleans</dt><dd>The owner</dd></div>
      </dl>
      <nav class="jump" aria-label="On this page">
        <ul>${[["turnover", "The turnover"], ["includes", "What's included"], ["prices", "Pricing"], ["faq", "Questions"]].map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join("")}</ul>
      </nav>
      ${photo(L, hasPhoto("mann-linens") ? "mann-linens" : "bedroom", { sizes: "(min-width: 960px) 520px, 92vw", cls: "quote-photo" })}
    </div>
    <div class="hero-pricer" id="host-form">
      ${quoteForm(L, { name: q.name, title: "Tell me about your listing", reply: q.replyPromise, fields: q.fields, button: "Send my listing details", steps: ["You and your listing", "Turnovers and linens"] })}
    </div>
  </div>
</section>

<section class="section hosts" id="turnover">
  <div class="wrap">
    <div class="section-head">
      <p class="label">A same-day turnover</p>
      <h2>Guests out at 11. Ready for 4.</h2>
      <p class="muted">The times are an example: I plan around your listing's checkout and check-in, ${DAYS_TEXT}, until ${clock(C.closes)}.</p>
    </div>
    ${turnoverTimeline()}
  </div>
</section>

<section class="section" id="includes">
  <div class="wrap">
    <div class="section-head">
      <p class="label">Every turnover</p>
      <h2>What I do between guests.</h2>
      <p class="muted">Each turnover follows my ${esc(C.services.regular.name.toLowerCase())} checklist, room by room, the same careful way every time. Anything your listing needs on top, tell me in the form and I'll include it in your quote.</p>
    </div>
    <ul class="host-rooms">${C.checklist.map((r) => ({ room: r.room, tasks: r.tasks.filter((t) => t[C.services.regular.checklistColumn] === "yes") })).filter((r) => r.tasks.length).map((r) => `<li class="incl-room"><h3>${esc(r.room)}</h3><ul class="ticks">${r.tasks.map((t) => `<li>${ic("i-check")}<span>${esc(t[0])}</span></li>`).join("")}</ul></li>`).join("")}</ul>
    ${hostTerms.length ? `<dl class="host-terms">${hostTerms.map(([t, d]) => `<div><dt>${t}</dt><dd>${esc(d)}</dd></div>`).join("")}</dl>` : ""}
  </div>
</section>

<section class="section section-tint" id="prices">
  <div class="wrap">
    ${HOST_PRICED ? `<div class="section-head">
      <p class="label">Prices</p>
      <h2>One price per turnover.</h2>
      <p class="muted">Supplies and equipment included. ${TAX_TEXT}. No deposit: you pay after each clean, with a receipt for each property.</p>
    </div>
    <ul class="host-sizes">${q.prices.filter((p) => p.price != null).map((p) => `<li><span>${esc(p.size)}</span><b>${money(p.price)}</b></li>`).join("")}</ul>
    <p class="fine">Bigger than ${esc(largest)}, or several units in one building? Tell me about them in the form and I'll quote.</p>
    ${hostOffers({ perTurnover: false })}` : `<div class="section-head">
      <p class="label">Pricing</p>
      <h2>Quoted per unit, so it fits your listing.</h2>
      <p class="muted">Turnover times change with the size of the unit, how many guests stay and how often you host. Tell me about your listing and I'll reply ${esc(q.replyPromise)} with a price for each turnover. No deposit: you pay after each clean, with a receipt for each property. ${TAX_TEXT}.</p>
    </div>
    <a class="btn btn-primary" href="#host-form" data-track="host_click">Get a turnover quote</a>`}
  </div>
</section>

<section class="section" id="why">
  <div class="wrap">
    <div class="section-head"><p class="label">Why hosts book me</p><h2>One cleaner. Every turnover.</h2></div>
    <ul class="why-grid">${why.map(([i, t, d]) => `<li><span class="aud-ico">${ic(i)}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join("")}</ul>
  </div>
</section>

<section class="section section-tint" id="start">
  <div class="wrap">
    <div class="section-head"><p class="label">Getting started</p><h2>Three steps to your first turnover.</h2></div>
    <ol class="steps-3">
      <li><h3>Tell me about your listing</h3><p>Your units, your usual checkout and check-in times, and how often you host. It takes about two minutes.</p></li>
      <li><h3>I send your price</h3><p>I reply <span data-reply>${esc(q.replyPromise)}</span>, with your price and the times I can do.</p></li>
      <li><h3>Your first turnover</h3><p>Send me your checkout times or your calendar link, and I plan each turnover around them.</p></li>
    </ol>
    <div class="host-start">
      ${postalForm("pc-host", "Is your listing in my area? Check its postal code", { href: "#host-form", label: "Tell me about your listing", fill: "q-postal" })}
    </div>
  </div>
</section>

${fq.html}
${finalCta(L, "Ready for your next checkout?", `Tell me about your listing. I reply ${q.replyPromise}.`, formCta)}`
  }));
}

/* ---------- pricing ---------- */
{
  const trail = [["Home", ""], ["Pricing", "pricing/"]];
  const fq = faqBlock("pricing", "Pricing questions.", "section-tint");
  const quotes = allServices.filter((s) => s.quote);
  const moveIncl = addonsWith("move", "included").map((a) => a.name.toLowerCase());
  const moveNone = addonsWith("move", "none").map((a) => a.name.toLowerCase());
  const factors = Object.keys(C.homeTypes).filter((h) => C.homeTypes[h].factor > 1);
  const pct = (h) => Math.round((C.homeTypes[h].factor - 1) * 100) + "%";
  urls.push(page({
    depth: 1, pathOut: "pricing/index.html", pageType: "pricing",
    title: `House Cleaning Prices in Scarborough & North York | ${B.name}`,
    description: metaDesc(`House cleaning prices in Scarborough and North York: regular from ${money(C.services.regular.base)}, deep from ${money(C.services.deep.base)}, move-out from ${money(C.services.move.base)}.`, "No deposit.", "Pay after the clean."),
    schemas: [crumbSchema(trail), fq.schema],
    body: (L) => `
<section class="hero hero-sub">
  <div class="wrap">${breadcrumbs(L, trail)}</div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <h1 class="display display-sub">House cleaning prices, up front.</h1>
      <p class="lede">Your price is set by the service, the size and type of your home, and any extras you choose. You see it before you book, there's no deposit, and you pay after the clean.</p>
      <nav class="jump" aria-label="On this page">
        <ul>${[["estimate", "Estimate"], ["by-size", "Prices"], ["plans", "Plans"], ["extras", "Extras"], ["compare", "Compare"]].map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join("")}</ul>
      </nav>
      <dl class="facts">
        <div><dt>Regular</dt><dd>From <span data-from="regular">${money(C.services.regular.base)}</span></dd></div>
        <div><dt>Deep</dt><dd>From <span data-from="deep">${money(C.services.deep.base)}</span></dd></div>
        <div><dt>Move-out</dt><dd>From <span data-from="move">${money(C.services.move.base)}</span></dd></div>
      </dl>
      ${photo(L, "kitchen", { sizes: "(min-width: 960px) 520px, 92vw", cls: "hero-photo" })}
    </div>
    <div class="hero-pricer" id="estimate">${pricer(L, "regular", "Price your home", { owner: true })}</div>
  </div>
</section>

${chooser(L)}

${priceExplainer()}

<section class="section" id="by-size">
  <div class="wrap">
    <div class="section-head">
      <p class="label">By home size</p>
      <h2>Find your home. See your price.</h2>
      <p class="muted">Prices for the whole visit in ${C.currency}, with products and equipment included. <span data-tax-note>${TAX_TEXT}</span>. Studios are priced as 1 bedroom. Count full bathrooms; half baths, basements and second kitchens are confirmed with you before the clean. Homes over about 3,000 sq ft are by quote. ${factors.map((h, i) => `${i ? C.homeTypes[h].label.toLowerCase() : C.homeTypes[h].label}s add <span data-factor="${h}">${pct(h)}</span>`).join(" and ")}, for the stairs and extra floor space.</p>
      ${offerNote()}
    </div>
    <div class="price-cards">
      ${svcKeys.map((k) => { const s = C.services[k]; return `<article class="price-card" id="prices-${k}" data-tab-label="${esc(s.shortName || s.menuName.replace(/ Detailing$/, ""))}">
        <div class="price-card-head">
          <h3><a href="${L("services/" + s.slug + "/")}">${esc(s.name)}</a></h3>
          <p class="price-card-from">From <b data-from="${k}">${money(s.base)}</b></p>
        </div>
        <p class="muted">${esc(s.short)}</p>
        ${priceTable(k)}
        <div class="price-card-foot">
          <a class="text-link" href="${L("services/" + s.slug + "/")}">What's included ${ic("i-arrow")}</a>
          <a class="btn btn-primary btn-sm" href="${L("book/")}?s=${k}" data-track="book_click">${ACT.short}</a>
        </div>
      </article>`; }).join("\n      ")}
    </div>
  </div>
</section>

<section class="section section-tint" id="plans">
  <div class="wrap">
    <div class="section-head">
      <p class="label">Regular plans</p>
      <h2>Book regular visits. Pay less for each one.</h2>
      <p class="muted">Plans apply to regular cleaning. Pause or change your plan anytime with ${C.policies.cancelNoticeHours} hours' notice.</p>
    </div>
    ${plansGrid(L)}
    <p class="fine">Choosing a plan opens the booking form with it selected, and your own home's price is worked out there. A plan discount and the founding discount aren't combined: your first visit gets the larger one. Discounted prices are rounded to the nearest dollar, and the discount shown is the difference, so every line adds up.</p>
  </div>
</section>

<section class="section" id="extras">
  <div class="wrap split">
    <div class="split-head">
      <p class="label">Extras</p>
      <h2>Add only what you need.</h2>
      <p class="muted">Choose extras when you book. Each price covers what's written under it.${moveIncl.length ? ` Already included in a move-in or move-out clean: ${listJoin(moveIncl)}.` : ""}${moveNone.length ? ` Not part of a move-out clean, because the home is empty: ${listJoin(moveNone)}.` : ""}</p>
      <p class="label label-sm">Included in every price</p>
      <ul class="ticks">
        <li>${ic("i-check")}Products and equipment</li>
        <li>${ic("i-check")}A free re-clean if you report anything missed within ${RECLEAN_H} hours</li>
        <li>${ic("i-check")}No deposit, and payment after the clean</li>
      </ul>
    </div>
    ${extrasList()}
  </div>
</section>

<section class="section section-tint" id="compare">
  <div class="wrap">
    <div class="section-head">
      <p class="label">Compare</p>
      <h2>Regular, deep or move-out: what's the difference?</h2>
      <p class="muted">A regular clean keeps a home right. A deep clean adds the detail work that builds up over months. A move-in or move-out clean covers an empty home inside every cabinet, drawer and closet.</p>
    </div>
    <details class="compare-box compare-fold" data-compare>
      <summary>${ic("i-plus")}<span><span class="if-closed">Show</span><span class="if-open">Hide</span> the room-by-room comparison</span></summary>
      ${compareTable()}
    </details>
  </div>
</section>

<section class="section" id="quotes">
  <div class="wrap">
    <div class="section-head"><p class="label">By quote</p><h2>Larger homes, offices and Airbnbs.</h2><p class="muted">These are priced after a conversation or a walkthrough, so the quote fits the space. Quotes are free.</p></div>
    ${serviceCards(L, quotes, "svc-grid-compact")}
    <p class="fine">Realtor or property manager? See <a href="${L("realtors/")}">cleaning for listings and rentals</a>.</p>
  </div>
</section>
${fq.html}
${finalCta(L, "See your price.", "Book in two minutes. No payment until it's done.")}`
  }));
}

/* ---------- area and neighbourhood pages ---------- */
// Postal codes a page lists, read from serviceArea so the page and the postal-code check always agree.
function postalCodes(a) {
  const d = C.serviceArea.districts.find((x) => x.name === a.name);
  if (!d) return "";
  const whole = d.prefixes.filter((p) => p.length < 3), fsas = d.prefixes.filter((p) => p.length >= 3);
  return `<div class="fsa">
        <p class="label">Postal codes we serve</p>
        ${whole.length ? `<p class="muted">Every postal code starting with ${whole.map(esc).join(" or ")}.</p>` : ""}
        ${fsas.length ? `<ul class="fsa-list">${fsas.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
      </div>`;
}

// Real jobs from config.jobs, shown only once there are some. Never anything that identifies a home.
function jobsSection(list, title, cls = "section-tint") {
  if (!list.length) return "";
  return `<section class="section ${cls}" id="work">
  <div class="wrap">
    <div class="section-head"><p class="label">Real jobs</p><h2>${esc(title)}</h2><p class="muted">Shared with each client's permission. We never show a street, building or unit.</p></div>
    <ul class="job-grid">${list.map((j) => `<li class="job-card"><p class="job-meta">${esc(j.neighbourhood || "")}${j.month ? " · " + esc(j.month) : ""}</p><h3>${esc(j.service)}${j.home ? ", " + esc(j.home) : ""}</h3><p>${esc(j.text)}</p>${j.hours ? `<p class="job-time">${ic("i-clock")}About ${esc(j.hours)} hours on site</p>` : ""}</li>`).join("")}</ul>
  </div>
</section>`;
}
// What to tell us for a condo clean. Built from the booking form's own questions: no building's rules are assumed.
function condoGuide(name) {
  return `<section class="section" id="condo">
  <div class="wrap split">
    <div class="split-head">
      <p class="label">Condo cleans</p>
      <h2>Booking a condo clean in ${esc(name)}.</h2>
      <p class="muted">Most condo delays happen before the door opens. Tell us these when you book, and the visit starts on time.</p>
    </div>
    <ul class="ticks condo-list">
      <li>${ic("i-check")}<span><strong>Concierge or front desk.</strong> Choose it under "Getting in" on the booking form. If your building registers visitors, tick that box and we'll give you the cleaner's name to pass on.</span></li>
      <li>${ic("i-check")}<span><strong>Parking.</strong> Say whether there's visitor parking or paid parking nearby, so no time is lost looking.</span></li>
      <li>${ic("i-check")}<span><strong>Service elevator.</strong> If it has to be booked, tick the box and add the times your building allows in your notes.</span></li>
      <li>${ic("i-check")}<span><strong>Codes and fobs.</strong> Never in the form. ${esc(B.ownerFirstName)} asks for them by text once your clean is confirmed, and deletes codes within ${C.policies.accessCodeDeleteDays} days of your last scheduled clean.</span></li>
    </ul>
  </div>
</section>`;
}

// Desktop heroes on area and neighbourhood pages: one room per district, never the entryway (the "standard" section uses it) or the living room (its window shows downtown).
const AREA_PHOTO = { scarborough: "kitchen", "north-york": "bedroom" };
for (const a of C.areas) {
  const trail = [["Home", ""], [a.name, "areas/" + a.slug + "/"]];
  const fq = faqBlock("area", `Cleaning in ${a.name}: questions.`);
  urls.push(page({
    depth: 2, pathOut: `areas/${a.slug}/index.html`, pageType: "area",
    title: `House Cleaning in ${a.name}, Toronto | ${B.name}`,
    description: metaDesc(`House cleaning in ${a.name}: ${a.neighbourhoods.slice(0, 4).join(", ")} and more.`, "See your price in seconds, book in two minutes, pay after your clean."),
    schemas: [crumbSchema(trail), fq.schema, { "@context": "https://schema.org", "@type": "Service", name: `House cleaning in ${a.name}`, serviceType: "House cleaning", provider: { "@id": SITE + "/#business" }, areaServed: placeSchema(a) }],
    body: (L) => `
<section class="hero hero-sub">
  <div class="wrap">${breadcrumbs(L, trail)}</div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <h1 class="display display-sub">House cleaning in ${esc(a.name)}.</h1>
      <p class="lede">${esc(a.intro)}</p>
      <dl class="facts">
        <div><dt>From</dt><dd data-from="regular">${money(C.services.regular.base)}</dd></div>
        ${OPEN_FACT}
        <div><dt>Payment</dt><dd>After the clean</dd></div>
      </dl>
      ${districtScene(a.slug) ? `<figure class="area-hero-art">${districtScene(a.slug)}</figure>` : photo(L, AREA_PHOTO[a.slug] || "living-room", { sizes: "(min-width: 960px) 520px, 92vw", cls: "hero-photo" })}
    </div>
    <div class="hero-pricer">${pricer(L, "regular", "Your price in " + a.name, { owner: true })}</div>
  </div>
</section>

<section class="section section-tint">
  <div class="wrap split">
    <div class="split-head">
      <p class="label">Neighbourhoods</p>
      <h2>Where we clean in ${esc(a.name)}.</h2>
      ${postalForm("pc-area")}
    </div>
    <div class="hoods">
      ${hoodChips(L, a)}
      ${postalCodes(a)}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head section-head-row"><div><p class="label">Services</p><h2>Every service, in ${esc(a.name)}.</h2></div><a class="text-link" href="${L("pricing/")}">See every price ${ic("i-arrow")}</a></div>
    ${serviceCards(L, allServices, "svc-grid-compact")}
  </div>
</section>

<section class="section section-tint">
  <div class="wrap ideal-grid ideal-2">
    ${photo(L, "entryway", { sizes: "(min-width: 960px) 380px, 92vw", cls: "ideal-photo" })}
    <div class="split-head">
      <p class="label">The standard</p>
      <h2>The same careful visit, in every home.</h2>
      <p class="muted">Introduced by name, house shoes on at the door, and the same room-by-room checklist every time.</p>
      <a class="text-link" href="${L("#standard")}">See our standard ${ic("i-arrow")}</a>
      <ul class="area-list">
        ${C.areas.filter((o) => o.slug !== a.slug).map((o) => `<li><a href="${L("areas/" + o.slug + "/")}"><span>Also in ${esc(o.name)}</span><small>${o.neighbourhoods.length} neighbourhoods</small>${ic("i-arrow")}</a></li>`).join("")}
      </ul>
    </div>
  </div>
</section>
${jobsSection(jobs.filter((j) => j.area === a.slug), `Recent cleans in ${a.name}.`, "")}
${fq.html}
${finalCta(L, `Book your ${a.name} clean.`)}`
  }));
}

for (const h of hoodPages) {
  const a = district(h.district);
  const trail = [["Home", ""], [a.name, "areas/" + a.slug + "/"], [h.name, hoodPath(h)]];
  const fq = faqBlock("area", `Cleaning in ${h.name}: questions.`);
  const near = (h.near || []).map((s) => hoodBySlug[s]).filter(Boolean);
  urls.push(page({
    depth: 3, pathOut: `${hoodPath(h)}index.html`, pageType: "area",
    title: `House Cleaning in ${h.name}, ${a.name} | ${B.name}`,
    description: metaDesc(`House cleaning in ${h.name}, ${a.name} (${h.fsas.join(", ")}), from ${money(C.services.regular.base)}.`, "See your price in seconds, book in two minutes, pay after the clean."),
    schemas: [crumbSchema(trail), fq.schema, { "@context": "https://schema.org", "@type": "Service", name: `House cleaning in ${h.name}`, serviceType: "House cleaning", provider: { "@id": SITE + "/#business" }, areaServed: { "@type": "Place", name: `${h.name}, ${a.name}, Toronto, ON`, containedInPlace: placeSchema(a) } }],
    body: (L) => `
<section class="hero hero-sub">
  <div class="wrap">${breadcrumbs(L, trail)}</div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="kicker">${esc(a.name)} · ${esc(h.fsas.join(", "))}</p>
      <h1 class="display display-sub">House cleaning in ${esc(h.name)}.</h1>
      <p class="lede">${esc(h.intro)}</p>
      <dl class="facts">
        <div><dt>From</dt><dd data-from="regular">${money(C.services.regular.base)}</dd></div>
        ${OPEN_FACT}
        <div><dt>Payment</dt><dd>After the clean</dd></div>
      </dl>
      ${photo(L, AREA_PHOTO[h.district] || "living-room", { sizes: "(min-width: 960px) 520px, 92vw", cls: "hero-photo" })}
    </div>
    <div class="hero-pricer">${pricer(L, "regular", "Your price in " + h.name, { owner: true })}</div>
  </div>
</section>

<section class="section section-tint">
  <div class="wrap split">
    <div class="split-head">
      <p class="label">Homes in ${esc(h.name)}</p>
      <h2>Condos, townhouses and houses.</h2>
      <p class="muted">${esc(h.homes)} Your price adjusts for the type of home: townhouses add ${Math.round((C.homeTypes.town.factor - 1) * 100)}% and houses ${Math.round((C.homeTypes.house.factor - 1) * 100)}%, for the stairs and extra floor space.</p>
      ${postalForm("pc-hood")}
    </div>
    <div class="hoods">
      <div class="fsa">
        <p class="label">Postal codes in ${esc(h.name)}</p>
        <ul class="fsa-list">${h.fsas.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
      </div>
      <div class="fsa">
        <p class="label">Popular here</p>
        <ul class="ticks">
          <li>${ic("i-check")}<a href="${L("services/regular-home-cleaning/")}">Regular cleaning</a> every 2 weeks, from ${money(afterDiscount(price("regular", 2, 1), C.frequencies.biweekly.discount))} for a 2-bedroom condo</li>
          <li>${ic("i-check")}<a href="${L("services/deep-cleaning/")}">A deep clean</a> to start, from ${money(C.services.deep.base)}</li>
          <li>${ic("i-check")}<a href="${L("services/move-in-move-out-cleaning/")}">Move-in and move-out cleans</a>, fridge and oven included</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head section-head-row"><div><p class="label">Services</p><h2>Every service, in ${esc(h.name)}.</h2></div><a class="text-link" href="${L("pricing/")}">See every price ${ic("i-arrow")}</a></div>
    ${serviceCards(L, allServices, "svc-grid-compact")}
  </div>
</section>

${h.condo ? condoGuide(h.name) : ""}
${jobsSection(jobs.filter((j) => j.neighbourhood === h.name), `Recent cleans in ${h.name}.`, h.condo ? "section-tint" : "")}
${near.length ? `<section class="section section-tint">
  <div class="wrap split">
    <div class="split-head">
      <p class="label">Nearby</p>
      <h2>We also clean nearby.</h2>
      <a class="text-link" href="${L("areas/" + a.slug + "/")}">All of ${esc(a.name)} ${ic("i-arrow")}</a>
    </div>
    <ul class="area-list">
      ${near.map((o) => `<li><a href="${L(hoodPath(o))}"><span>${esc(o.name)}</span><small>${esc(o.fsas.join(", "))}</small>${ic("i-arrow")}</a></li>`).join("")}
    </ul>
  </div>
</section>` : ""}
${fq.html}
${finalCta(L, `Book your ${h.name} clean.`)}`
  }));
}

/* ---------- realtors and property managers ---------- */
{
  const trail = [["Home", ""], ["Realtors & property managers", "realtors/"]];
  const fq = faqBlock("realtors", "Questions from realtors.");
  const jobs = [
    ["i-sparkle", "Listing prep", "A deep clean before photos and the first showing, so the home looks its best online and in person.", `From ${money(C.services.deep.base)}`],
    ["i-box", "Move-out and move-in", "An empty-home clean inside every cabinet, drawer and closet, fridge and oven included, before closing or a new tenant.", `From ${money(C.services.move.base)}`],
    ["i-key", "Between tenants", "A quick, reliable turnover for landlords and property managers, booked around the move-out date.", "By quote"],
    ["i-building", "Regular care", "Recurring cleans for furnished rentals, model suites or occupied listings that need to stay show-ready.", "By quote"]
  ];
  urls.push(page({
    depth: 1, pathOut: "realtors/index.html", pageType: "realtors",
    title: `Cleaning for Realtors & Property Managers in Scarborough & North York | ${B.name}`,
    description: metaDesc("Listing-prep, move-out and between-tenant cleaning for realtors, landlords and property managers in Scarborough and North York.", "Lockbox access, 7 days a week, pay after each clean."),
    schemas: [crumbSchema(trail), fq.schema, { "@context": "https://schema.org", "@type": "Service", name: "Cleaning for realtors and property managers", serviceType: "Move-out and listing preparation cleaning", provider: { "@id": SITE + "/#business" }, areaServed: C.areas.map(placeSchema) }],
    body: (L) => `
<section class="hero hero-sub">
  <div class="wrap">${breadcrumbs(L, trail)}</div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="kicker">For realtors, landlords &amp; property managers</p>
      <h1 class="display display-sub">Show-ready, on your schedule.</h1>
      <p class="lede">Listing-prep, move-out and between-tenant cleaning across Scarborough and North York. Lockbox access, seven days a week, evenings included, and a receipt for every property.</p>
      <ul class="ticks">
        <li>${ic("i-check")}Cleaned the day before photos or a showing, whenever possible</li>
        <li>${ic("i-check")}No need to be there: lockbox, concierge or key pickup</li>
        <li>${ic("i-check")}Pay after each clean, with a receipt per property</li>
        <li>${ic("i-check")}A free re-clean if you report anything missed within ${RECLEAN_H} hours</li>
      </ul>
    </div>
    <div class="hero-pricer">
      ${quoteForm(L, {
        name: "Realtors & property managers", title: "Tell us about the property", reply: "within one business day", button: "Request a quote",
        fields: [
          { id: "company", label: "Brokerage or company", type: "text", span: 2 },
          { id: "role", label: "You are a", type: "select", options: ["Realtor", "Property manager", "Landlord", "Other"] },
          { id: "job", label: "Type of clean", type: "select", options: ["Listing prep", "Move-out", "Move-in", "Between tenants", "Regular care", "Not sure"] },
          { id: "home", label: "Type of home", type: "select", options: ["Condo", "Townhouse", "House", "Several properties"] },
          { id: "volume", label: "Properties per month", type: "select", options: ["Just this one", "2 to 5", "6 to 10", "More than 10"] },
          { id: "date", label: "Ideal date", type: "text" }
        ]
      })}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><p class="label">What we do</p><h2>Four jobs, done properly.</h2></div>
    <ul class="svc-grid svc-grid-4">
      ${jobs.map(([i, t, d, p]) => `<li><div class="svc-card svc-card-static"><span class="svc-top"><span class="svc-ico">${ic(i)}</span></span><h3>${esc(t)}</h3><p>${esc(d)}</p><span class="svc-foot"><span class="svc-price">${esc(p)}</span></span></div></li>`).join("")}
    </ul>
  </div>
</section>

<section class="section section-tint">
  <div class="wrap ideal-grid">
    ${photo(L, "kitchen", { sizes: "(min-width: 960px) 380px, 92vw", cls: "ideal-photo" })}
    <div class="split-head">
      <p class="label">How it works</p>
      <h2>One ${PHONE ? "text" : "message"}, and it's handled.</h2>
      <ol class="steps-3 steps-col">
        <li><h3>Send the address and date</h3><p>${PHONE ? "By the form, text or WhatsApp" : "By the form or email"}. We reply within one business day with a price and the times we can offer, and the clean is booked once you agree.</p></li>
        <li><h3>Leave access</h3><p>Lockbox, concierge or key pickup. We ask for codes by text once the clean is confirmed, and delete them within ${C.policies.accessCodeDeleteDays} days of the last scheduled clean.</p></li>
        <li><h3>Get a receipt</h3><p>Pay after the clean by e-Transfer or card, with a receipt for that property.</p></li>
      </ol>
    </div>
    <div>
      <p class="label">Included in every move-out clean</p>
      <ul class="price-list">${C.checklist.flatMap((r) => r.tasks.filter((t) => t[3] === "yes")).slice(0, 9).map((t) => `<li><span>${esc(t[0])}</span><b>${ic("i-check")}</b></li>`).join("")}</ul>
    </div>
  </div>
</section>
${fq.html}
${finalCta(L, "Next listing coming up?", "Send the address and date. We'll reply within one business day.")}`
  }));
}

/* ---------- gift a clean ---------- */
if (gift && gift.active) {
  const trail = [["Home", ""], ["Gift a clean", "gift/"]];
  const fq = faqBlock("gift", "Gift card questions.", "section-tint");
  urls.push(page({
    depth: 1, pathOut: "gift/index.html", pageType: "gift",
    title: `Gift a Home Clean in Scarborough & North York | ${B.name}`,
    description: metaDesc("Give the gift of a clean home. Nest & Rest gift cards for Scarborough and North York never expire and work for any service.", "Emailed to you or to them."),
    schemas: [crumbSchema(trail), fq.schema],
    body: (L) => `
<section class="hero hero-sub">
  <div class="wrap">${breadcrumbs(L, trail)}</div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="kicker">Gift a clean</p>
      <h1 class="display display-sub">Give them a few hours back.</h1>
      <p class="lede">A Nest &amp; Rest gift card is a clean home and a free afternoon, for parents, new parents, friends who just moved, or anyone who deserves a rest.</p>
      <ul class="ticks">
        <li>${ic("i-check")}Never expires, and works for any service</li>
        <li>${ic("i-check")}Emailed to you to print, or to them on the day you choose</li>
        <li>${ic("i-check")}For homes in Scarborough and North York</li>
      </ul>
      ${photo(L, "bedroom", { sizes: "(min-width: 960px) 520px, 92vw", cls: "quote-photo" })}
    </div>
    <div class="hero-pricer">
      <form class="quote-form gift-form" data-gift-form novalidate>
        <p class="pricer-title">Choose a gift</p>
        <div class="field"><span class="field-label" id="gift-amt-label">Gift amount</span>
          <div class="seg seg-amounts" role="radiogroup" aria-labelledby="gift-amt-label">
            ${gift.amounts.map((v, i) => `<label><input type="radio" name="amount" value="${v}"${i === 1 ? " checked" : ""}><span>${money(v)}</span></label>`).join("")}
          </div>
          <p class="field-hint">For reference, a regular clean of a 1-bedroom condo is ${money(price("regular", 1, 1))} and a 2-bedroom is ${money(price("regular", 2, 1))}.</p>
        </div>
        <div class="form-grid">
          <div class="field"><label for="g-name">Your name</label><input id="g-name" name="Your name" autocomplete="name" data-required></div>
          <div class="field"><label for="g-phone">Your mobile</label><input id="g-phone" name="Your phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="e.g. 647 555 0123" data-phone></div>
          <div class="field span-2"><label for="g-email">Your email <span class="opt">for your receipt and the gift card</span></label><input id="g-email" name="Your email" type="email" inputmode="email" autocomplete="email" data-email-required></div>
          <div class="field"><label for="g-to">Gift for</label><input id="g-to" name="Gift for" placeholder="Their name" data-required></div>
          <div class="field"><label for="g-postal">Their postal code <span class="opt">optional</span></label><input id="g-postal" name="Their postal code" autocapitalize="characters" maxlength="7" placeholder="e.g. M2N 5W9" data-postal-optional></div>
          <div class="field span-2"><span class="field-label" id="gift-send-label">Send the gift card</span>
            <div class="seg" role="radiogroup" aria-labelledby="gift-send-label">
              <label><input type="radio" name="send" value="To me, to print or forward" checked><span>To me</span></label>
              <label><input type="radio" name="send" value="To them by email"><span>To them</span></label>
            </div>
          </div>
          <div class="field span-2" data-gift-them hidden><label for="g-their-email">Their email</label><input id="g-their-email" name="Their email" type="email" inputmode="email"></div>
          <div class="field span-2"><label for="g-msg">Your message <span class="opt">optional</span></label><textarea id="g-msg" name="Message" rows="3" placeholder="Happy holidays! Put your feet up."></textarea></div>
          <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        </div>
        <p class="form-error" data-gift-error role="alert" hidden></p>
        <button type="submit" class="btn btn-primary btn-block">Request gift card</button>
        <p class="pricer-fine">Nothing to pay now. We text you to confirm and send an Interac e-Transfer request.</p>
        <p class="privacy-note">${SENT_VIA} See our <a href="${L("privacy/")}">Privacy Policy</a> and <a href="${L("policies/#gift")}">gift card terms</a>.</p>
      </form>
      <div class="quote-done" data-gift-done hidden tabindex="-1"><p class="label">Request received</p><h2 data-gd-title>Thank you.</h2><p data-gd-text></p><p class="ref">Reference <strong data-gd-ref></strong></p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><p class="label">How it works</p><h2>Three steps to a thoughtful gift.</h2></div>
    <ol class="steps-3">
      <li><h3>Choose an amount</h3><p>Pick a value and tell us who it's for. Add a message if you like.</p></li>
      <li><h3>Pay by e-Transfer</h3><p>${esc(B.ownerFirstName)} texts you ${esc(B.replyPromise)} to confirm and send an Interac e-Transfer request.</p></li>
      <li><h3>We send the gift card</h3><p>Emailed to you to print or forward, or straight to them. They book whenever suits them.</p></li>
    </ol>
  </div>
</section>
${fq.html}
${finalCta(L, "Or book a clean for yourself.", "You deserve a rest too. Book in two minutes, pay after it's done.")}`
  }));
}

/* ---------- guides ---------- */
{
  const trail = [["Home", ""], ["Guides", "guides/"]];
  urls.push(page({
    depth: 1, pathOut: "guides/index.html", pageType: "guides",
    title: `Home Cleaning Guides for Toronto | ${B.name}`,
    description: "Practical home cleaning guides for Toronto households: prices, move-out checklists, deep vs regular cleaning, and how often to clean.",
    schemas: [crumbSchema(trail)],
    body: (L) => `
<section class="hero hero-sub">
  <div class="wrap">${breadcrumbs(L, trail)}</div>
  <div class="wrap">
    <div class="hero-copy guides-head">
      <p class="kicker">Guides</p>
      <h1 class="display display-sub">Helpful guides for a cleaner home.</h1>
      <p class="lede">Straight answers to the questions we hear most, from ${esc(B.owner)}.</p>
    </div>
  </div>
</section>
<section class="section section-flush">
  <div class="wrap">${guideCards(L, guides)}</div>
</section>
${finalCta(L)}`
  }));
}

for (const g of guides) {
  const trail = [["Home", ""], ["Guides", "guides/"], [g.h1, "guides/" + g.slug + "/"]];
  const others = guides.filter((o) => o.slug !== g.slug).slice(0, 3);
  urls.push(page({
    depth: 2, pathOut: `guides/${g.slug}/index.html`, pageType: "article",
    title: `${g.title} | ${B.name}`,
    description: g.description,
    schemas: [crumbSchema(trail), {
      "@context": "https://schema.org", "@type": "Article", headline: g.h1, description: g.description,
      image: `${SITE}/assets/photos/${g.photo}-928.jpg`, datePublished: g.published || TODAY, dateModified: TODAY,
      author: { "@type": "Person", name: B.owner, jobTitle: "Founder & Owner" }, publisher: { "@id": SITE + "/#business" },
      mainEntityOfPage: SITE + "/guides/" + g.slug + "/", inLanguage: "en-CA"
    }],
    body: (L) => `
<article class="article">
  <header class="article-head">
    <div class="wrap narrow">
      ${breadcrumbs(L, trail)}
      <p class="kicker">${esc(g.kicker)} · ${g.minutes} min read</p>
      <h1 class="display display-sub">${esc(g.h1)}</h1>
      <p class="byline"><picture><source type="image/webp" srcset="${L("assets/founder-mann-patel-avatar.webp")}"><img src="${L("assets/founder-mann-patel-avatar.jpg")}" alt="" width="44" height="44" decoding="async"></picture><span>By <strong>${esc(B.owner)}</strong>, founder of ${esc(B.name)}</span></p>
    </div>
  </header>
  <div class="wrap narrow">
    ${photo(L, g.photo, { sizes: "(min-width: 820px) 760px, 92vw", cls: "article-photo", eager: true })}
    <div class="article-body">${g.body(L)}</div>
  </div>
</article>
<section class="section section-tint">
  <div class="wrap">
    <div class="section-head"><p class="label">Keep reading</p><h2>More guides.</h2></div>
    ${guideCards(L, others)}
  </div>
</section>
${finalCta(L)}`
  }));
}

/* ---------- vision ---------- */
{
  const V = C.vision;
  const im = C.impact || {};
  const hasImpact = im.hoursGivenBack > 0;
  const nth = ["one", "two", "three", "four", "five", "six"];
  const trail = [["Home", ""], ["Our vision", "vision/"]];
  urls.push(page({
    depth: 1, pathOut: "vision/index.html", pageType: "vision",
    title: `Our Vision | ${B.name}`,
    description: `Why ${B.name} exists, what we believe, the promises we keep every visit, and where we're going. A note from founder ${B.owner}.`,
    schemas: [
      { "@context": "https://schema.org", "@type": "AboutPage", name: `Our vision | ${B.name}`, url: SITE + "/vision/", description: V.intro, about: { "@id": SITE + "/#business" } },
      crumbSchema(trail)
    ],
    body: (L) => `
<section class="hero hero-sub">
  <div class="wrap">${breadcrumbs(L, trail)}</div>
  <div class="wrap">
    <div class="hero-copy vision-head">
      <p class="kicker">Our vision</p>
      <h1 class="display display-sub">${esc(V.headline)}</h1>
      <p class="lede">${esc(V.intro)}</p>
    </div>
  </div>
</section>

<section class="section section-tint" id="letter">
  <div class="wrap founder-grid">
    ${founderPhoto(L)}
    <div class="letter">
      <p class="label">A note from ${esc(B.ownerFirstName)}</p>
      ${V.letter.map((p, i) => `<p${i === V.letter.length - 1 ? ' class="letter-close"' : ""}>${esc(p)}</p>`).join("\n      ")}
      <p class="letter-sign"><strong data-owner>${esc(B.owner)}</strong><span>Founder &amp; Owner</span></p>
    </div>
  </div>
</section>

<section class="section" id="beliefs">
  <div class="wrap">
    <div class="section-head"><p class="label">What we believe</p><h2>The ideas behind every visit.</h2></div>
    <ol class="steps-3 beliefs">
      ${V.beliefs.map((b) => `<li><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p></li>`).join("\n      ")}
    </ol>
    <div class="center-cta"><a class="text-link" href="${L("#standard")}">See the five steps of every visit ${ic("i-arrow")}</a></div>
  </div>
</section>

<section class="section standard vows" id="promises">
  <div class="wrap">
    <div class="standard-head">
      <p class="label label-light">Our promises</p>
      <h2>What you can count on. What we'll never do.</h2>
      <p>A promise only counts if it's kept every time. Hold us to each of these. If we ever fall short, tell ${esc(B.ownerFirstName)} directly.</p>
    </div>
    <div class="vow-grid">
      <div>
        <h3 class="vow-title">Always</h3>
        <ul class="vow-list">${V.always.map((t) => `<li>${ic("i-check")}${esc(t)}</li>`).join("")}</ul>
      </div>
      <div>
        <h3 class="vow-title vow-title-never">Never</h3>
        <ul class="vow-list vow-never">${V.never.map((t) => `<li>${ic("i-close")}${esc(t)}</li>`).join("")}</ul>
      </div>
    </div>
    <div class="center-cta"><a class="text-link" href="${L("policies/")}">Read our Service Policies ${ic("i-arrow")}</a></div>
  </div>
</section>

<section class="section" id="road">
  <div class="wrap">
    <div class="section-head">
      <p class="label">The road ahead</p>
      <h2>Built one home at a time.</h2>
    </div>
    <ol class="chapters">
      ${V.chapters.map((c, i) => `<li${i === 0 ? ' class="is-now"' : ""}><p class="chapter-when">Chapter ${nth[i] || i + 1} · ${esc(c.when)}</p><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></li>`).join("\n      ")}
    </ol>
    <div class="measure">
      <div class="measure-head">
        <p class="label">How we'll measure it</p>
        <h3 class="measure-title">One number matters most: hours given back.</h3>
      </div>
      <div class="impact" data-impact${hasImpact ? "" : " hidden"}>
        <p class="impact-big" data-impact-hours>${hasImpact ? Math.round(im.hoursGivenBack).toLocaleString("en-CA") : "0"}</p>
        <p class="impact-cap" data-impact-cap>${esc(impactCaption(im))}</p>
      </div>
      <p class="impact-empty" data-impact-empty${hasImpact ? " hidden" : ""}>Every hour we spend cleaning is an hour a family gets back. We're counting from our very first clean, and the running total will appear right here.</p>
    </div>
  </div>
</section>

<section class="section section-tint" id="join">
  <div class="wrap split">
    <div class="split-head">
      <p class="label">Work with us</p>
      <h2>Build it with me.</h2>
    </div>
    <div class="join-body">
      <p class="lede">${esc(V.join)}</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="mailto:${B.email}?subject=${encodeURIComponent("Working with " + B.name)}" data-track="join_click">Email ${esc(B.ownerFirstName)}</a>
        ${PHONE ? `<a class="btn btn-ghost" data-tel href="tel:${B.phone}">Call or text <span data-phone-text>${esc(B.phoneDisplay)}</span></a>` : ""}
      </div>
    </div>
  </div>
</section>
${founding && founding.active
  ? finalCta(L, "Be a founding household.", `${founding.text} Book in two minutes and pay after it's done.`)
  : finalCta(L)}`
  }));
}

/* ---------- help ---------- */
// Help with a booking: what happens after a request, and how to change, cancel or book again by reference.
{
  const trail = [["Home", ""], ["Help", "help/"]];
  const fq = faqBlock("help", "Booking questions.");
  const mail = (subject, body) => `mailto:${B.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const P0 = C.policies;
  urls.push(page({
    depth: 1, pathOut: "help/index.html", pageType: "help",
    title: `Help With Your Booking | ${B.name}`,
    description: metaDesc(`What happens after you request a clean with ${B.name}, how to change, cancel or book again, and when ${B.ownerFirstName} replies.`),
    schemas: [crumbSchema(trail), fq.schema],
    body: (L) => `
<section class="hero hero-sub">
  <div class="wrap">${breadcrumbs(L, trail)}</div>
  <div class="wrap">
    <div class="hero-copy guides-head">
      <h1 class="display display-sub">Help with your booking.</h1>
      <p class="lede">What happens after you send a request, how to change or cancel, and how to reach ${esc(B.ownerFirstName)}. Keep your reference handy: it starts with NR-.</p>
    </div>
  </div>
</section>

<section class="section section-flush" id="manage">
  <div class="wrap split">
    <div class="split-head">
      <p class="label">Manage your booking</p>
      <h2>Change, cancel or book again.</h2>
      <p class="muted">Send a change request here with your reference${PHONE ? `, or call or text <a data-tel href="tel:${B.phone}">${esc(B.phoneDisplay)}</a>` : ""}. Changes are free up to ${P0.cancelNoticeHours} hours before your arrival window. ${LATE_FEE_LINE}</p>
      <ul class="help-alt">
        <li><a class="text-link" href="${esc(mail("Change my booking", "Reference: NR-\nWhat I'd like to change: "))}" data-track="manage_change">${ic("i-mail")} Or email a change</a></li>
        <li><a class="text-link" href="${esc(mail("Cancel my booking", "Reference: NR-\n"))}" data-track="manage_cancel">${ic("i-mail")} Or email to cancel</a></li>
        <li><a class="text-link" href="${L("book/")}" data-track="book_click">${ACT.again} ${ic("i-arrow")}</a></li>
      </ul>
      <p class="fine">On the device you booked from, the booking form remembers your home and extras for ${DRAFT_DAYS} days, so booking again takes a moment.</p>
    </div>
    <div class="help-manage">
      ${changeForm(L)}
    </div>
  </div>
</section>

<section class="section section-tint" id="after">
  <div class="wrap">
    <div class="section-head"><p class="label">After you send a request</p><h2>Three steps. You always know which one you're at.</h2></div>
    <ol class="steps-3">
      ${CAL
        ? `<li><h3>Details sent</h3><p>Your details reach ${esc(B.ownerFirstName)} first, with a reference (NR-…), so nothing is lost if the calendar doesn't load.</p></li>
      <li><h3>You pick a time</h3><p>The time you pick on the calendar is confirmed straight away, and Cal.com emails you the confirmation with links to reschedule or cancel.</p></li>
      <li><h3>${esc(B.ownerFirstName)} checks in</h3><p>${esc(B.ownerFirstName)} contacts you ${esc(B.replyPromise)} to go over the details. You pay after the clean.</p></li>`
        : `<li><h3>Request received</h3><p>You get a reference (NR-…). Nothing is booked yet, and nothing is charged.</p></li>
      <li><h3>${esc(B.ownerFirstName)} reviews it</h3><p>${esc(B.ownerFirstName)} checks your home, the time it needs and the day you asked for, then replies ${esc(B.replyPromise)}, by text, call or email as you chose.</p></li>
      <li><h3>Confirmed</h3><p>You agree the day, arrival window and final price. Your time is held from then. You pay after the clean.</p></li>`}
    </ol>
  </div>
</section>

<section class="section" id="reply">
  <div class="wrap split">
    <div class="split-head">
      <p class="label">Reply times</p>
      <h2>When you'll hear back.</h2>
    </div>
    <ul class="ticks help-list">
      <li>${ic("i-clock")}<span><strong>Booking requests:</strong> ${esc(B.replyPromise)} (${esc(B.hours.toLowerCase())}).</span></li>
      <li>${ic("i-clock")}<span><strong>Quotes</strong> for Residence Care, offices, realtors and property managers: within one business day.</span></li>
      <li>${ic("i-shield")}<span><strong>Something not right after a clean?</strong> Report anything missed within ${P0.recleanWindowHours} hours of your clean for a free re-clean, and any damage within ${P0.damageReportHours} hours. <a href="${L("policies/#guarantee")}">How it works</a></span></li>
    </ul>
  </div>
</section>

<section class="section section-tint" id="details">
  <div class="wrap split">
    <div class="split-head">
      <p class="label">Your details</p>
      <h2>Codes, keys and this device.</h2>
    </div>
    <ul class="ticks help-list">
      <li>${ic("i-key")}<span><strong>Door and lockbox codes</strong> never go in a website form. ${esc(B.ownerFirstName)} asks for them by text once your clean is confirmed, and deletes them within ${P0.accessCodeDeleteDays} days of your last scheduled visit.</span></li>
      <li>${ic("i-home")}<span><strong>On this device,</strong> the booking form keeps your contact details only in the open browser tab, and your home choices for ${DRAFT_DAYS} days. <button type="button" class="link-btn" data-clear-details>Clear my details from this device</button></span></li>
    </ul>
  </div>
</section>
${fq.html}
${finalCta(L, "Ready when you are.", "See your price and send a request in two minutes. Nothing to pay until it's done.")}`
  }));
}

/* ---------- review page ---------- */
// Sent to clients after a clean, so it stays out of search results and the sitemap.
page({
  depth: 1, pathOut: "review/index.html", pageType: "review", noindex: true,
  title: `Leave a Review | ${B.name}`,
  description: `Tell us how your clean with ${B.name} went.`,
  body: (L) => `
<section class="section review-page">
  <div class="wrap narrow">
    <p class="kicker">Your review</p>
    <h1 class="display display-sub">How did we do?</h1>
    <p class="lede">Your honest feedback helps us improve and helps neighbours choose with confidence. It takes about a minute.</p>
    <form class="review-form" data-review-form novalidate>
      <fieldset class="stars-field"><legend>Your rating</legend>
        <div class="stars-input">
          ${[5, 4, 3, 2, 1].map((n) => `<input type="radio" id="r${n}" name="rating" value="${n}"><label for="r${n}">${ic("i-star")}<span class="sr-only">${n} star${n > 1 ? "s" : ""}</span></label>`).join("")}
        </div>
      </fieldset>
      <div class="form-grid">
        <div class="field"><label for="rv-name">First name and last initial</label><input id="rv-name" name="name" autocomplete="name" placeholder="e.g. Priya S."></div>
        <div class="field"><label for="rv-area">Neighbourhood <span class="opt">optional</span></label><input id="rv-area" name="area" placeholder="e.g. Agincourt"></div>
        <div class="field span-2"><label for="rv-service">Service</label><div class="select-wrap"><select id="rv-service" name="service">${allServices.map((s) => `<option>${esc(s.name)}</option>`).join("")}</select>${ic("i-chev")}</div></div>
        <div class="field span-2"><label for="rv-text">Your review</label><textarea id="rv-text" name="text" rows="5" placeholder="What stood out? What could be better?"></textarea></div>
        <div class="field span-2"><label for="rv-contact">Phone or email you booked with <span class="opt">so we can match your visit</span></label><input id="rv-contact" name="contact"></div>
        <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      </div>
      <p class="form-error" data-review-error role="alert" hidden></p>
      <button type="submit" class="btn btn-primary btn-block">Send review</button>
      <p class="fine">We publish every rating, not only the good ones, after matching it to a completed visit. We show only your first name, last initial and neighbourhood. See our <a href="${L("privacy/")}">Privacy Policy</a>.</p>
    </form>
    <div class="quote-done" data-review-done hidden tabindex="-1">
      <p class="label">Thank you</p><h2>Review received.</h2>
      <p data-review-done-text>We'll publish it once it's matched to your visit. Thank you for taking the time.</p>
      <a class="btn btn-ghost" data-google-review href="#" target="_blank" rel="noopener" hidden>Also post it on Google</a>
    </div>
  </div>
</section>`
});

/* ---------- legal pages ---------- */
const P = C.policies;
function legalPage({ slug, title, h1, description, intro, sections }) {
  const trail = [["Home", ""], [h1, slug + "/"]];
  urls.push(page({
    depth: 1, pathOut: `${slug}/index.html`, pageType: "legal",
    title: `${title} | ${B.name}`, description,
    schemas: [crumbSchema(trail)],
    body: (L) => `
<section class="section legal-page">
  <div class="wrap narrow">
    ${breadcrumbs(L, trail)}
    <p class="kicker">Last updated ${esc(P.effectiveDate)}</p>
    <h1 class="display display-sub">${esc(h1)}</h1>
    <p class="lede">${intro}</p>
    <nav aria-label="On this page"><ol class="legal-toc">${sections.map((s, i) => `<li><a href="#${s.id}">${i + 1}. ${esc(s.h)}</a></li>`).join("")}</ol></nav>
    <div class="legal-body">
      ${sections.map((s, i) => `<section id="${s.id}" aria-labelledby="${s.id}-h"><h2 id="${s.id}-h">${i + 1}. ${esc(s.h)}</h2>${s.html(L)}</section>`).join("")}
    </div>
  </div>
</section>`
  }));
}
const contactLine = `<a data-mailto href="mailto:${B.email}">${esc(B.email)}</a>${PHONE ? ` or <a data-tel href="tel:${B.phone}">${esc(B.phoneDisplay)}</a>` : ""}`;

legalPage({
  slug: "privacy", title: "Privacy Policy", h1: "Privacy Policy",
  description: `How ${B.name} collects, uses and protects your personal information under Canada's PIPEDA.`,
  intro: `This policy explains what personal information ${esc(B.name)} collects, why, who it is shared with, and the choices you have. We follow Canada's <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA).`,
  sections: [
    { id: "who", h: "Who we are", html: () => `<p>${esc(B.name)} is a home cleaning business owned and operated by ${esc(B.owner)} in ${esc(B.base)}, Ontario. ${esc(B.owner)} is responsible for how we handle personal information and is our privacy contact. You can reach us at ${contactLine}. ${ADDR ? `Our mailing address is ${esc(ADDR)}.` : "Our mailing address is available on request."}</p>` },
    { id: "collect", h: "What we collect", html: () => `
      <div class="table-scroll"><table>
        <thead><tr><th scope="col">When</th><th scope="col">What we collect</th></tr></thead>
        <tbody>
          <tr><td>You request a booking</td><td>Name, mobile number, email (optional), street address and postal code, home type and size, anything unusual about the home you tell us (such as a basement), extras, ${CAL ? "the time you pick on our calendar" : "preferred day and arrival window"}, how we get in (for example a lockbox or concierge) and building details you add (parking, service elevator, visitor registration), pets, product preference, notes, and how you'd like us to confirm.</td></tr>
          <tr><td>You ask us to text you a price</td><td>Your mobile number and the price details you chose.</td></tr>
          <tr><td>You request a quote</td><td>Name, phone, email (optional), postal code, details about the space or property, and any notes you add.</td></tr>
          <tr><td>You request a gift card</td><td>Your name, phone and email, the gift amount, the recipient's name, and optionally their email, postal code and your message.</td></tr>
          <tr><td>You leave a review</td><td>Rating, first name and last initial, neighbourhood (optional), the service, your review, and the phone or email you booked with so we can match it to your visit.</td></tr>
          <tr><td>You call, text, WhatsApp or email us</td><td>Your number or address and what you tell us.</td></tr>
          <tr><td>You ask about working with us</td><td>Your name, contact details and what you tell us about your experience.</td></tr>
          <tr><td>You pay</td><td>Payment records such as the amount, date and method. We do not store full card numbers.</td></tr>
          <tr><td>You visit the website</td><td>Technical information your browser sends, such as your IP address and browser type, which our website host receives to deliver the site.</td></tr>
        </tbody>
      </table></div>
      <p>We only collect what we need to arrange and deliver your clean. Please don't send us sensitive information we haven't asked for, such as health or financial details.</p>` },
    { id: "use", h: "How we use it", html: () => `<ul>
      <li>To schedule, confirm and deliver your cleaning, and to get into your home as you've arranged.</li>
      <li>To contact you about your booking, quote, gift card, a change of plans or a problem with a visit.</li>
      <li>To reply to you about your request by text, call or email, as you choose.</li>
      <li>To prepare quotes, keep payment and tax records, and meet our legal obligations.</li>
      <li>To publish your review on our website, using only your first name, last initial, neighbourhood and review, if you've sent us one.</li>
      <li>To improve our service, for example by learning which services clients book.</li>
      <li>To consider you for work, if you've asked about working with us.</li>
    </ul><p>We do not sell or rent your personal information, and we don't use it for any purpose not listed here without asking you first.</p>` },
    { id: "consent", h: "Your consent", html: () => `<p>When you send us a booking request, price request, quote request, gift card request or review, you agree to us using your information for the purposes above. You can withdraw your consent at any time by contacting us, subject to legal or contractual limits. If you do, we may not be able to provide some services.</p>
      <p>We send you messages about your booking, quote or gift card, and occasionally ask for a review after a clean. When you ask us to text you a price, we text it once. We won't send you promotional emails or texts without your consent, and every message we send will tell you how to opt out. If you ask us to stop, we'll stop within 10 business days, as Canada's Anti-Spam Legislation (CASL) requires.</p>` },
    { id: "sharing", h: "Who we share it with", html: () => `<p>We share personal information only with service providers who help us run the business, and only what they need:</p>
      <ul>
        <li><strong>GitHub</strong> (GitHub, Inc.) hosts this website and keeps standard server logs, including IP addresses, for security.</li>
        <li><strong>Google</strong> provides our email service, where booking, quote, gift card and review messages are stored.</li>
        ${CAL ? `<li><strong>Cal.com</strong> (cal.com) runs our booking calendar. When you pick a time, it receives your name, email, phone number and booking details, and emails your confirmation. It may store data outside Canada.</li>
        ` : ""}${GA ? `<li><strong>Google Analytics</strong> (Google LLC) measures how visitors use this website: the pages viewed, how they arrived (for example from our flyer or business card), the type of device and an approximate location. It doesn't receive anything you type into our forms, and it stores data in the United States.</li>
        ` : ""}${SHEET ? `<li><strong>Google Sheets and Gmail</strong> (Google) store and deliver the website's forms: each request is saved to our Google Sheet and emailed to our Gmail inbox. If you give your email address, you get an automatic receipt that only confirms your request arrived. ${esc(B.ownerFirstName)}'s own reply is what confirms a booking.</li>` : `<li><strong>FormSubmit</strong> (formsubmit.co) delivers the website's forms to our email inbox. If you give your email address, it may also send you an automatic acknowledgement. ${esc(B.ownerFirstName)}'s own reply is what confirms a booking.</li>`}
        ${B.whatsapp ? `<li><strong>WhatsApp</strong> (WhatsApp LLC, part of Meta Platforms) delivers and stores messages if you choose to contact us on WhatsApp.</li>
        ` : ""}<li><strong>Your bank or card payment provider</strong> processes payments you make by Interac e-Transfer or card.</li>
      </ul>
      <p>We may also disclose information if the law requires it, for example in response to a valid court order.</p>` },
    { id: "abroad", h: "Storage outside Canada", html: () => `<p>Some of our service providers store or process information outside Canada, including in the United States. While it is there, it is subject to the laws of that country and may be accessed by its courts, law enforcement and national security authorities. We choose established providers and share only what each one needs.</p>` },
    { id: "keep", h: "How long we keep it", html: () => `<ul>
      <li><strong>Access codes and key instructions:</strong> deleted within ${P.accessCodeDeleteDays} days of your last scheduled visit, or sooner if you ask.</li>
      <li><strong>Client and booking records:</strong> kept while you're a client, then for as long as tax law requires (generally six years for financial records).</li>
      <li><strong>Price and quote requests that don't become bookings:</strong> deleted within 12 months.</li>
      <li><strong>Job enquiries:</strong> deleted within 12 months if we don't hire you, or sooner if you ask.</li>
      <li><strong>Gift card records:</strong> kept until the gift card is used up, then for as long as tax law requires.</li>
      <li><strong>Reviews:</strong> kept while published. Ask us and we'll remove yours.</li>
    </ul>` },
    { id: "safeguards", h: "How we protect it", html: () => `<p>Only the people who need your information to serve you can see it. We protect our email and business accounts with strong passwords and two-step verification, keep access codes separate from other records, and delete information we no longer need. No method of transmission or storage is completely secure, but we work to protect your information.</p>
      <p>If a breach of our safeguards creates a real risk of significant harm to you, we will notify you and the Office of the Privacy Commissioner of Canada as the law requires.</p>` },
    { id: "access", h: "Door and lockbox codes", html: () => `<p>Codes and keys give access to your home, so we treat them with extra care. We don't ask for them on the website. We ask by text or phone only after your booking is confirmed, keep them separate from your name and address, never write them on keys, and delete them within ${P.accessCodeDeleteDays} days of your last scheduled visit. We recommend changing your code from time to time, and after you stop using our service.</p>` },
    { id: "cookies", h: "Cookies and your browser", html: () => `<p>We don't use advertising cookies or tracking pixels.${GA ? ` We use Google Analytics to understand how visitors use the site, and it sets its own cookies in your browser (their names start with "_ga"). We've turned off Google's advertising features for this site. To opt out, block cookies in your browser settings or install Google's opt-out add-on at <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener" target="_blank">tools.google.com/dlpage/gaoptout</a>.` : ""} When you start a booking, your home choices (service, size, extras and plan) are saved in your browser for ${DRAFT_DAYS} days, so you can pick up where you left off or book again. Your personal details (name, contact details, address and notes) are kept only in the open browser tab, and are deleted from it once your request is sent. Nothing is sent to us until you submit the request. You can clear everything at any time with "Clear my details from this device" on the booking form or our <a href="${linker(1)("help/")}">help page</a>.</p>${CAL ? `
      <p>When you pick a time, our booking calendar from Cal.com loads on the page and may use its own cookies to run the calendar. See Cal.com's privacy policy for details.</p>` : ""}
      <p>If we add ${GA ? "advertising tools" : "website analytics or advertising tools"} in future, we will update this policy first and explain how to opt out.</p>` },
    { id: "rights", h: "Your rights", html: () => `<p>You can ask to see the personal information we hold about you, ask how it has been used or shared, and ask us to correct it if it's wrong. Contact us at ${contactLine}. We'll respond within 30 days, and there's no charge.</p>` },
    { id: "children", h: "Children", html: () => `<p>Our services and website are for adults. We don't knowingly collect personal information from children.</p>` },
    { id: "complaints", h: "Questions and complaints", html: () => `<p>If you have a concern about how we handle your information, please contact ${esc(B.owner)} first at ${contactLine}. We'll look into it and reply.</p>
      <p>You can also complain to the Office of the Privacy Commissioner of Canada at <a href="https://www.priv.gc.ca" rel="noopener" target="_blank">priv.gc.ca</a>, by phone at 1-800-282-1376, or by mail at 30 Victoria Street, Gatineau, Quebec K1A 1H3.</p>` },
    { id: "changes", h: "Changes to this policy", html: () => `<p>We'll update this policy when our practices change and show the new effective date at the top of this page.</p>` }
  ]
});

legalPage({
  slug: "policies", title: "Service Policies", h1: "Service Policies",
  description: `Booking, pricing, payment, cancellation, gift card and satisfaction policies for ${B.name}.`,
  intro: `Clear terms, so there are no surprises. These apply to every clean we do. If anything here is unclear, ${PHONE ? `call, text or WhatsApp ${esc(B.phoneDisplay)}` : `email ${esc(B.email)}`}.`,
  sections: [
    { id: "area", h: "Where we clean", html: () => `<p>We clean homes and small offices in Scarborough and North York, Toronto. We confirm your postal code before every booking.</p>` },
    { id: "booking", h: "Booking and confirmation", html: () => CAL
      ? `<p>When you book on the website, you send your details first, then pick a time on our online calendar. The time you pick is confirmed straight away, and our calendar provider, Cal.com, emails you a confirmation with links to reschedule or cancel. We also contact you by text, WhatsApp, call or email, as you prefer, ${esc(B.replyPromise)}. If you don't pick a time, your details reach us as a request and we'll contact you to arrange one.</p>`
      : `<p>A booking made on the website is a request. The day and arrival window you choose are your preference, not a reserved time. Your booking is confirmed once we've contacted you by text, WhatsApp, call or email and agreed the day, arrival window and final price, and your time is held from then. We usually reply ${esc(B.replyPromise)}. Our confirmation message is your written copy of what we agreed.</p>` },
    { id: "pricing", h: "Prices and estimates", html: () => `<p>The price shown on the website is an estimate based on what you tell us: the service, home type, bedrooms, bathrooms and extras. If your home needs much more or less time than expected, we'll tell you and agree the price with you before we start, never after. Prices are in Canadian dollars. ${C.taxRate ? `Prices are before ${Math.round(C.taxRate * 100)}% HST, which is shown as its own line.` : "We don't charge HST."} Discounted prices are rounded to the nearest dollar.</p>
      <p>What's included in each service is listed room by room on its service page. Each extra covers what's written with it on our <a href="${linker(1)("pricing/#extras")}">pricing page</a>, and anything more is agreed with you first. An extra that a service already includes is never charged again.</p>
      ${founding && founding.active ? `<p>Founding household offer: ${esc(founding.text)} The discount applies to the first visit only and can't be combined with other discounts.</p>` : ""}
      <p>Recurring plans (weekly, every 2 weeks or every 4 weeks) receive the discount shown when you book. You can pause or change your plan with ${P.cancelNoticeHours} hours' notice.</p>` },
    { id: "payment", h: "Payment", html: () => `<p>There's no deposit to book. You pay after your clean by Interac e-Transfer, credit or debit card, or cash.</p>` },
    { id: "changes", h: "Rescheduling and cancellation", html: () => `<p>You can reschedule or cancel at no charge with at least ${P.cancelNoticeHours} hours' notice before your arrival window. With less notice, or if we can't get into your home at the agreed time, a late-cancellation fee of ${esc(P.lateCancelFee)} may apply. We'll always tell you before charging it.</p>
      <p>If we ever need to reschedule because of illness or severe weather, we'll tell you as early as possible and offer the next available time.</p>` },
    { id: "guarantee", h: "Our re-clean guarantee", html: () => `<p>If something was missed, report it within ${P.recleanWindowHours} hours of your clean, with photos if you can. We'll come back and re-clean those areas at no charge. If a re-clean doesn't put it right, contact ${esc(B.ownerFirstName)} and we'll agree a fair solution together.</p>` },
    { id: "gift", h: "Gift cards", html: () => `<p>Gift cards are issued once paid. They never expire, can be used toward any service in our service area, and any balance left after a clean stays on the card.</p>` },
    { id: "referral", h: "Referral credit", html: () => { const r = money(C.offers.referral); return `<p>When someone you refer books their first clean with us, you each get ${r} off:</p>
      <ul>
        <li>Your friend gets ${r} off their first clean. When they book, they give us your first and last name in the "Referred by" box on the booking form, or by ${PHONE ? "phone, text or WhatsApp" : "email"}.</li>
        <li>You get ${r} off your next clean, once their first clean is done and paid.</li>
        <li>Their home must be new to ${esc(B.name)} and in our service area. There's one credit for each household you refer.</li>
        ${founding && founding.active ? `<li>Discounts on a first visit aren't combined, so a founding household gets whichever is larger: ${founding.percent}% off or ${r} off. You still get your ${r}.</li>` : ""}
        <li>Credits have no cash value and can't be transferred.</li>
      </ul>`; } },
    { id: "damage", h: "Breakage and damage", html: () => `<p>We take great care in your home. If something is damaged during a clean, we'll tell you the same day. If you notice something after we leave, please tell us within ${P.damageReportHours} hours, with photos, and we'll work with you on a fair repair or replacement. Please let us know in advance about fragile, valuable or sentimental items you'd rather we didn't handle.</p>` },
    { id: "access", h: "Keys, codes and access", html: () => `<p>If you won't be home, a lockbox, key code or concierge works best. We never copy keys or write codes on them, and we delete access codes within ${P.accessCodeDeleteDays} days of your last scheduled visit. We recommend changing codes from time to time.</p>` },
    { id: "pets", h: "Pets", html: () => `<p>Pets are welcome. Please tell us about them when you book, and keep any anxious or protective pets in a separate room while we work.</p>` },
    { id: "safety", h: "Safety", html: () => `<p>We bring our own supplies and equipment. For everyone's safety, we may decline or stop work in unsafe conditions, such as biohazards, pest infestations, mould, or anything that requires climbing higher than a two-step ladder or moving heavy furniture. We'll always explain why and agree next steps with you.</p>` },
    { id: "contact", h: "Contact", html: () => `<p>${esc(B.name)} is owned and operated by ${esc(B.owner)}${ADDR ? `, ${esc(ADDR)}` : `, ${esc(B.base)}, Ontario`}. Questions about these policies? Contact ${esc(B.owner)} at ${contactLine}. See also our <a href="${linker(1)("privacy/")}">Privacy Policy</a>.</p>` }
  ]
});

/* ---------- 404 ---------- */
if (!PREVIEW_DIR) {
  // 404 is served from any depth, so it uses absolute links built from siteUrl's path.
  const basePath = new URL(SITE + "/").pathname;
  const L404 = (p = "") => basePath + p;
  fs.writeFileSync(path.join(OUT, "404.html"), `<!doctype html>
<html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Page not found | ${esc(B.name)}</title>
<link rel="icon" type="image/svg+xml" href="${L404("assets/logo-mark.svg")}">
${THEME_BOOT}
<link rel="stylesheet" href="${L404("css/site.min.css")}?v=${ASSET_V.css}"></head>
<body data-page="404"><main class="section"><div class="wrap narrow">
<a class="brand" href="${L404()}"><img class="logo-light" src="${L404("assets/logo.svg")}" alt="${esc(B.name)}" width="772" height="210" style="height:56px;width:auto"><img class="logo-dark" src="${L404("assets/logo-white.svg")}" alt="${esc(B.name)}" width="772" height="210" style="height:56px;width:auto"></a>
<h1 class="display display-sub" style="margin-top:48px">This page has moved.</h1>
<p class="lede">Everything you need is a tap away.</p>
<p class="cta-row" style="margin-top:24px"><a class="btn btn-primary" href="${L404("book/")}">${ACT.book}</a> <a class="text-link" href="${L404()}">Go to the home page</a></p>
</div></main></body></html>
`);
}

/* ---------- sitemap + robots ---------- */
if (!PREVIEW_DIR) {
  fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod></url>`).join("\n")}
</urlset>
`);
  fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
}

/* ---------- preview: the stylesheet, scripts and images go with the pages ---------- */
if (PREVIEW_DIR) {
  for (const d of ["css", "js", "assets"]) fs.cpSync(path.join(ROOT, d), path.join(OUT, d), { recursive: true });
  fs.copyFileSync(path.join(ROOT, "site.webmanifest"), path.join(OUT, "site.webmanifest"));
}

/* ---------- compact copies: the pages load these, written from the files you edit ---------- */
// css/site.css and js/site.js stay readable with their comments; the pages load css/site.min.css and js/site.min.js.
// No tools needed: comments and spare spaces go, nothing else changes. Always edit the readable files, then run the build.
const compactCss = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{};,])\s*/g, "$1").replace(/:\s+/g, ":").replace(/;}/g, "}").trim() + "\n";
// The script has no template strings or multi-line comments, so whole-line comments and indentation can go safely.
const compactJs = (s) => s.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("//") && !(l.startsWith("/*") && l.endsWith("*/"))).join("\n") + "\n";
fs.writeFileSync(path.join(OUT, "css/site.min.css"), compactCss(fs.readFileSync(path.join(ROOT, "css/site.css"), "utf8")));
fs.writeFileSync(path.join(OUT, "js/site.min.js"), compactJs(fs.readFileSync(path.join(ROOT, "js/site.js"), "utf8")));

console.log(`Built ${urls.length} pages into ${OUT}`);
