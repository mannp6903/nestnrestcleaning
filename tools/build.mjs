// Generates every page of the site from js/config.js, tools/guides.mjs and the templates below.
// Usage: node tools/build.mjs            -> writes the site into the repo root
//        node tools/build.mjs --preview DIR -> writes a preview copy (artifact-friendly links)
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import guideList from "./guides.mjs";

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
const founding = C.offers.founding;
const spotsLeft = founding ? Math.max(0, founding.spots - (founding.claimed || 0)) : 0;
// Live calendar: with a Cal.com link in booking.calLink, booking ends with picking a confirmed time.
const CAL = !!(C.booking && C.booking.calLink);
// The business mailing address (CASL and Ontario's Consumer Protection Act). Shown everywhere once it's set in config.
const ADDR = (B.mailingAddress || "").trim();
const LATE_FEE_LINE = `Later changes, or if we can't get in at the agreed time, may cost ${esc(C.policies.lateCancelFee)}.`;
// The founder reel: 27 seconds, 720 x 1280. To swap it, replace the files under the same names.
const REEL = { src: "assets/video/founder-reel-720.mp4", poster: "assets/video/founder-reel-poster.webp", posterJpg: "assets/video/founder-reel-poster.jpg", length: "0:27", iso: "PT27S", uploaded: "2026-10-24", w: 720, h: 1280 };
// Everything the reel says on screen, for anyone who can't watch it. Keep it word for word with the video.
const REEL_TEXT = [
  "My name is on every clean.",
  "Mann Patel, founder. Scarborough & North York. Confirms bookings by text.",
  "\u201cHome should be where you rest, not where the chores wait.\u201d Mann Patel, founder.",
  "Not quite right? Tell us within 24 hours. We re-clean those areas. Free.",
  "I confirm every booking by text within 2 hours, during business hours.",
  "No deposit. You pay after the clean: Interac e-Transfer, card or cash.",
  "Nest & Rest Cleaning. My name. Every clean. We clean. You rest. 20% off your first visit, first 50 households. Open 7 days, 9am to 11pm. Book at nestnrestcleaning.com. Call or text 647 978 6903."
];
const guides = guideList({ C, B, esc, money, price, listJoin });

function price(key, beds, baths, home = "condo") {
  const s = C.services[key];
  const f = C.homeTypes[home].factor;
  const b = key === "detail" ? 1 : beds;
  return roundTo((s.base + Math.max(0, b - 1) * s.perBed + Math.max(0, baths - 1) * s.perBath) * f, 5);
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
  entryway: "Grey house slippers on a doormat inside a navy front door, on a freshly mopped wooden floor"
};
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
<symbol id="i-play" viewBox="0 0 24 24"><path d="M8.5 5.8v12.4a.8.8 0 0 0 1.2.7l9.6-6.2a.8.8 0 0 0 0-1.4L9.7 5.1a.8.8 0 0 0-1.2.7Z" fill="currentColor"/></symbol>
<symbol id="i-chev" viewBox="0 0 24 24"><path d="m7 9.5 5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</defs></svg>`;
const ic = (id, cls = "ic") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
const SVC_ICON = { regular: "i-sparkle", deep: "i-layers", move: "i-box", detail: "i-drop", residence: "i-gem", office: "i-building" };

/* ---------- shared fragments ---------- */
const logoImg = (L, white = false) => `<img src="${L(white ? "assets/logo-white.svg" : "assets/logo.svg")}" alt="${esc(B.name)}" width="772" height="210">`;

function header(L, opts = {}) {
  if (opts.minimal) {
    return `<header class="site-header minimal">
  <div class="wrap header-row">
    <a class="brand" href="${L("")}" aria-label="${esc(B.name)}, home">${logoImg(L)}</a>
    <a class="header-help" data-tel href="tel:${B.phone}"><span>Questions?</span> <strong data-phone-text>${esc(B.phoneDisplay)}</strong></a>
  </div>
</header>`;
  }
  return `<header class="site-header">
  <div class="wrap header-row">
    <a class="brand" href="${L("")}" aria-label="${esc(B.name)}, home">${logoImg(L)}</a>
    <nav class="nav-desktop" aria-label="Main">
      <a href="${L("#services")}">Services</a>
      <a href="${L("pricing/")}">Pricing</a>
      <a href="${L("#areas")}">Areas</a>
      <a href="${L("guides/")}">Guides</a>
      <a href="${L("vision/")}">Our vision</a>
    </nav>
    <div class="header-actions">
      <a class="header-phone" data-tel href="tel:${B.phone}">${ic("i-phone")}<span data-phone-text>${esc(B.phoneDisplay)}</span></a>
      ${B.whatsapp ? `<a class="header-wa" data-wa href="${esc(waLink(WA_HELLO))}" target="_blank" rel="noopener" aria-label="WhatsApp ${esc(B.ownerFirstName)}" data-track="whatsapp_click">${ic("i-wa")}</a>` : ""}
      <a class="btn btn-primary header-book" href="${L("book/")}" data-track="book_click"><span class="hb-long">Book your clean</span><span class="hb-short">Book now</span></a>
      <button class="menu-btn" type="button" aria-controls="menu" aria-expanded="false" aria-label="Open menu">${ic("i-menu")}</button>
    </div>
  </div>
</header>
<div class="menu" id="menu" hidden>
  <div class="wrap menu-inner">
    <p class="label">Services</p>
    <ul class="menu-list">
      ${allServices.map((s) => `<li><a href="${L("services/" + s.slug + "/")}">${esc(s.menuName)}</a></li>`).join("")}
    </ul>
    <p class="label">More</p>
    <ul class="menu-list menu-list-sm">
      <li><a href="${L("pricing/")}">Pricing</a></li>
      <li><a href="${L("#areas")}">Areas we serve</a></li>
      <li><a href="${L("gift/")}">Gift a clean</a></li>
      <li><a href="${L("realtors/")}">Realtors &amp; property managers</a></li>
      <li><a href="${L("guides/")}">Guides</a></li>
      <li><a href="${L("vision/")}">Our vision</a></li>
      <li><a href="${L("#faq")}">Questions</a></li>
    </ul>
    <div class="menu-cta">
      <a class="btn btn-primary btn-block" href="${L("book/")}">Book your clean</a>
      ${B.whatsapp ? `<a class="btn btn-wa btn-block" data-wa href="${esc(waLink(WA_HELLO))}" target="_blank" rel="noopener">${ic("i-wa")} WhatsApp ${esc(B.ownerFirstName)}</a>` : ""}
      <a class="btn btn-ghost btn-block" data-tel href="tel:${B.phone}">Call or text <span class="nowrap">${esc(B.phoneDisplay)}</span></a>
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
  const msgs = [
    ...(founding && founding.active && spotsLeft > 0 ? [`${founding.percent}% off your first visit, first ${founding.spots} households`] : []),
    ...(A.messages || [])
  ];
  if (!A.active || !msgs.length) return "";
  const key = crypto.createHash("sha1").update(msgs.join("|")).digest("hex").slice(0, 8);
  return `<div class="announce" data-announce data-key="${key}" role="region" aria-label="Announcements">
  <div class="wrap announce-row">
    <p class="announce-msgs" data-announce-msgs>${msgs.map((m, i) => `<span${i ? "" : ' class="is-on"'}>${esc(m)}</span>`).join("")}</p>
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
        <img src="${L("assets/logo-stacked-white.svg")}" alt="${esc(B.name)}" width="488" height="364" loading="lazy" decoding="async">
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
            <li><a data-tel href="tel:${B.phone}" data-phone-text>${esc(B.phoneDisplay)}</a></li>
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
function actionBar(L) {
  return `<nav class="action-bar" aria-label="Quick contact" data-action-bar>
  <a class="ab-link ab-phone" data-tel href="tel:${B.phone}" data-track="call_click">${ic("i-phone")}<span>Call</span></a>
  <a class="ab-link ab-phone" data-sms href="sms:${B.phone}" data-track="text_click">${ic("i-sms")}<span>Text</span></a>
  ${B.whatsapp ? `<a class="ab-link ab-wa" data-wa href="${esc(waLink(WA_HELLO))}" target="_blank" rel="noopener" data-track="whatsapp_click">${ic("i-wa")}<span>WhatsApp</span></a>` : ""}
  <a class="ab-link ab-desk" data-mailto href="mailto:${B.email}" data-track="email_click">${ic("i-mail")}<span>Email</span></a>
  <a class="btn btn-primary ab-book" href="${L("book/")}" data-track="book_click"><span class="ab-long">Book your clean</span><span class="ab-short">Book now</span></a>
</nav>`;
}

function offerNote() {
  if (!founding || !founding.active) return "";
  return `<p class="pricer-offer" data-offer-note><span><strong>${founding.percent}% off</strong> your first visit</span><span class="spots" data-spots>${spotsLeft} of ${founding.spots} founding spots left</span></p>`;
}

function pricer(L, defaultKey = "regular", heading = "Your price, in seconds") {
  const p = price(defaultKey, 1, 1);
  return `<form class="pricer" data-pricer data-default-service="${defaultKey}" novalidate>
  <div class="pricer-head">
    <p class="pricer-title">${esc(heading)}</p>
    ${offerNote()}
    ${ratingPill()}
  </div>
  <div class="pricer-result" aria-live="polite">
    <p class="pricer-amount" data-p-amount>${money(p)}</p>
    <p class="pricer-meta" data-p-meta>Estimate · about ${hours(defaultKey, 1, 1)} hours on site</p>
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
  <a class="btn btn-primary btn-block" href="${L("book/")}" data-p-go data-track="pricer_continue">Choose your time ${ic("i-arrow")}</a>
  <p class="pricer-next">${ic("i-cal")}<span>${CAL ? "Bookings from" : "Next opening:"} <strong data-next-open>tomorrow</strong></span></p>
  <div class="pricer-alt">
    <button type="button" class="link-btn" data-textme-open aria-expanded="false" aria-controls="textme-${defaultKey}">${ic("i-sms")} Text me this price</button>
    ${B.whatsapp ? `<a class="link-btn" data-p-wa href="${esc(waLink(WA_HELLO))}" target="_blank" rel="noopener" data-track="whatsapp_click">${ic("i-wa")} Ask on WhatsApp</a>` : ""}
  </div>
  <div class="textme" id="textme-${defaultKey}" data-textme hidden>
    <label for="tm-phone-${defaultKey}">Your mobile number</label>
    <div class="pc-row"><input id="tm-phone-${defaultKey}" type="tel" inputmode="tel" autocomplete="tel" placeholder="e.g. 647 555 0123" data-textme-phone><button class="btn btn-teal" type="button" data-textme-send>Send</button></div>
    <p class="field-hint" data-textme-note>${esc(B.ownerFirstName)} texts you this price once, ${esc(B.replyPromise)}. No spam.</p>
    <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" data-textme-honey>
  </div>
  <p class="pricer-fine">No payment to book · Free re-clean guarantee</p>
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

function assurances() {
  const items = [
    ["i-shield", "Free re-clean within 24 hours"],
    ["i-card", "No deposit. Pay after your clean"],
    ["i-clock", "Open 7 days, 9am to 11pm"],
    ["i-pin", "Scarborough & North York"]
  ];
  return `<ul class="assure" data-assure>${items.map(([i, t]) => `<li>${ic(i)}<span>${esc(t)}</span></li>`).join("")}</ul>`;
}

function founderPhoto(L, cls = "") {
  return `<div class="founder-photo${cls ? " " + cls : ""}">
      <picture>
        <source type="image/webp" srcset="${L("assets/founder-mann-patel-600.webp")} 600w, ${L("assets/founder-mann-patel.webp")} 848w" sizes="(min-width: 960px) 420px, 86vw">
        <img src="${L("assets/founder-mann-patel.jpg")}" srcset="${L("assets/founder-mann-patel-600.jpg")} 600w, ${L("assets/founder-mann-patel.jpg")} 848w" sizes="(min-width: 960px) 420px, 86vw" alt="${esc(B.owner)}, founder of ${esc(B.name)}" width="848" height="1060" loading="lazy" decoding="async">
      </picture>
      <a class="reel-play" href="${L(REEL.src)}" data-reel-open aria-haspopup="dialog" data-track="video_open">${ic("i-play")}<span>Watch ${esc(B.ownerFirstName)}'s intro <small>${REEL.length}</small></span></a>
    </div>`;
}

// The reel opens in a dialog, so the video only downloads when someone asks for it. Without JavaScript the links open the video file.
function reelDialog(L) {
  return `<dialog class="reel-dialog" data-reel-dialog aria-labelledby="reel-title">
  <div class="reel-box">
    <div class="reel-top">
      <h2 id="reel-title">Meet ${esc(B.ownerFirstName)}</h2>
      <button type="button" class="reel-close" data-reel-close aria-label="Close video">${ic("i-close")}</button>
    </div>
    <video class="reel-video" controls playsinline muted preload="none" data-poster="${L(REEL.poster)}" width="${REEL.w}" height="${REEL.h}" data-reel-video>
      <source src="${L(REEL.src)}" type="video/mp4">
    </video>
    <details class="reel-text">
      <summary>Read what the video says</summary>
      <ul>${REEL_TEXT.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
    </details>
  </div>
</dialog>`;
}

const videoSchema = () => ({
  "@context": "https://schema.org", "@type": "VideoObject",
  name: `Meet ${B.owner}, founder of ${B.name}`,
  description: REEL_TEXT.join(" "),
  thumbnailUrl: [SITE + "/" + REEL.posterJpg],
  uploadDate: REEL.uploaded + "T00:00:00-04:00",
  duration: REEL.iso,
  contentUrl: SITE + "/" + REEL.src
});

function foundingCard(L) {
  if (!founding || !founding.active) return "";
  return `<div class="founding" data-founding>
      <p class="label">Founding households</p>
      <p class="founding-big"><span data-founding-pct>${founding.percent}</span>% off</p>
      <p class="founding-sub">Your first visit</p>
      <p data-founding-text>${esc(founding.text)}</p>
      <p class="spots-bar" data-spots-wrap><span class="spots-track"><span class="spots-fill" data-spots-fill style="width:${Math.round(spotsLeft / founding.spots * 100)}%"></span></span><span data-spots>${spotsLeft} of ${founding.spots} founding spots left</span></p>
      <a class="btn btn-light" href="${L("book/")}" data-track="book_click">Claim your first visit</a>
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

function faqBlock(tag, title = "Questions, answered.", cls = "") {
  const list = C.faqs.filter((f) => f.on.includes(tag));
  if (!list.length) return { html: "", schema: null };
  const html = `<section class="section faq-section${cls ? " " + cls : ""}" id="faq">
  <div class="wrap split">
    <div class="split-head">
      <p class="label">Questions</p>
      <h2>${esc(title)}</h2>
      <p class="muted">Anything else? Call or text <a data-tel href="tel:${B.phone}" data-phone-text>${esc(B.phoneDisplay)}</a>${B.whatsapp ? `, or <a data-wa href="${esc(waLink(WA_HELLO))}" target="_blank" rel="noopener">message on WhatsApp</a>` : ""}.</p>
    </div>
    <div class="faq">
      ${list.map((f) => `<details><summary><span>${esc(f.q)}</span>${ic("i-plus")}</summary><p>${esc(f.a)}</p></details>`).join("")}
    </div>
  </div>
</section>`;
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: list.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return { html, schema };
}

function finalCta(L, title = "Come home to it.", text = "Book in two minutes. No payment until it's done.") {
  return `<section class="final-cta">
  <div class="wrap final-inner">
    <h2>${esc(title)}</h2>
    <p>${esc(text)}</p>
    <div class="cta-row">
      <a class="btn btn-light" href="${L("book/")}" data-track="book_click">Book your clean</a>
      ${B.whatsapp ? `<a class="btn btn-wa" data-wa href="${esc(waLink(WA_HELLO))}" target="_blank" rel="noopener" data-track="whatsapp_click">${ic("i-wa")} WhatsApp</a>` : ""}
      <a class="btn btn-ghost-light" data-tel href="tel:${B.phone}">Call <span class="nowrap">${esc(B.phoneDisplay)}</span></a>
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
    "@context": "https://schema.org", "@type": "HouseCleaningService", "@id": SITE + "/#business",
    name: B.name, slogan: B.tagline, description: "Home cleaning in Scarborough and North York, Toronto: regular, deep, move-in and move-out cleaning with a clear price before you book and payment after the clean.",
    url: SITE + "/", logo: SITE + "/assets/logo.png", image: [SITE + "/assets/og-image.jpg", SITE + "/assets/icon-512.png"],
    telephone: B.phone, email: B.email, priceRange: "$$", currenciesAccepted: C.currency, paymentAccepted: "Cash, Credit Card, Debit Card, Interac e-Transfer",
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
function page({ depth, pathOut, title, description, body, schemas = [], pageType, minimal = false, noBar = false, noindex = false, ogImage = "assets/og-image.jpg" }) {
  const L = linker(depth);
  const canonical = SITE + "/" + pathOut.replace(/index\.html$/, "");
  // Titles end in the short brand name so Google doesn't cut them off.
  const shortTitle = title.replace(" | " + B.name, " | " + BRAND_SHORT);
  const ld = schemas.filter(Boolean).map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n");
  const headInner = `<title>${esc(shortTitle)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ""}<meta name="theme-color" content="#F7F3EA">
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
<link rel="preload" href="${L("assets/fonts/barlow-condensed-800.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${L("assets/fonts/dm-sans.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${L("css/site.css")}?v=${ASSET_V.css}">
${ld}`;
  const bodyInner = `${ICONS}
<a class="skip" href="#main">Skip to content</a>
${minimal ? "" : announceBar()}
${header(L, { minimal })}
<main id="main">
${body(L)}
</main>
${minimal ? "" : footer(L)}
${noBar ? "" : actionBar(L)}
<div class="toast" data-toast role="status" aria-live="polite" hidden></div>
<script${DEFER} src="${L("js/config.js")}?v=${ASSET_V.config}"></script>
${PREVIEW_DIR ? "<script>window.NR_CONFIG.preview = true;</script>" : ""}
<script${DEFER} src="${L("js/site.js")}?v=${ASSET_V.site}"></script>`;
  const isPreviewRoot = PREVIEW_DIR && pathOut === "index.html";
  const html = isPreviewRoot
    ? `${headInner}\n<div class="page" data-page="${pageType}" data-root="${L("")}">${bodyInner}</div>\n`
    : `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${headInner}
</head>
<body data-page="${pageType}" data-root="${L("")}">
${bodyInner}
</body>
</html>
`;
  const file = path.join(OUT, pathOut);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  return canonical;
}

// A quote request card, shared by the quote-only services and the realtors page.
function quoteForm(L, { name, title = "Request a free quote", reply, fields, button = "Request a free quote", note }) {
  const field = (f) => {
    const span = f.span === 2 ? " span-2" : "";
    if (f.type === "select") return `<div class="field${span}"><label for="q-${f.id}">${esc(f.label)}</label><div class="select-wrap"><select id="q-${f.id}" name="${esc(f.label)}">${f.options.map((o) => `<option>${esc(o)}</option>`).join("")}</select>${ic("i-chev")}</div></div>`;
    return `<div class="field${span}"><label for="q-${f.id}">${esc(f.label)}${f.required ? "" : ' <span class="opt">optional</span>'}</label><input id="q-${f.id}" name="${esc(f.label)}"${f.required ? " required data-required" : ""}></div>`;
  };
  return `<form class="quote-form" data-quote-form data-quote-name="${esc(name)}" data-reply-time="${esc(reply)}" novalidate>
        <p class="pricer-title">${esc(title)}</p>
        <p class="field-note">All fields are required unless marked optional.</p>
        <div class="form-grid">
          <div class="field"><label for="q-name">Your name</label><input id="q-name" name="Name" autocomplete="name" required data-required></div>
          <div class="field"><label for="q-phone">Phone</label><input id="q-phone" name="Phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="e.g. 647 555 0123" required data-phone></div>
          <div class="field span-2"><label for="q-email">Email <span class="opt">optional, for your confirmation</span></label><input id="q-email" name="Email" type="email" inputmode="email" autocomplete="email" data-email></div>
          ${fields.map(field).join("")}
          <div class="field"><label for="q-postal">Postal code</label><input id="q-postal" name="Postal code" autocomplete="postal-code" autocapitalize="characters" maxlength="7" placeholder="e.g. M1B 2K3" required data-postal></div>
          <div class="field span-2"><label for="q-notes">Anything else? <span class="opt">optional</span></label><textarea id="q-notes" name="Notes" rows="3"></textarea></div>
          <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        </div>
        <p class="form-error" data-q-error role="alert" hidden></p>
        <button type="submit" class="btn btn-primary btn-block">${esc(button)}</button>
        <p class="pricer-fine">Reply ${esc(reply)} · No obligation</p>
        <p class="privacy-note">${note ? esc(note) + " " : ""}Your request is sent through FormSubmit to our Google email inbox, which may store data outside Canada. See our <a href="${L("privacy/")}">Privacy Policy</a>.</p>
      </form>
      <div class="quote-done" data-quote-done hidden tabindex="-1"><p class="label">Request received</p><h2 data-qd-title>Thank you.</h2><p data-qd-text></p></div>`;
}

function serviceCards(L, list, cls = "") {
  const shop = cls.includes("svc-grid-shop");
  const first = founding && founding.active && spotsLeft > 0 ? (b) => money(b * (1 - founding.percent / 100)) : null;
  return `<ul class="svc-grid${cls ? " " + cls : ""}">
      ${list.map((s) => shop ? `<li>
        <div class="svc-card svc-shop">
          <span class="svc-top"><span class="svc-ico">${ic(SVC_ICON[s.key] || "i-sparkle")}</span>${s.tag ? `<small class="svc-tag">${esc(s.tag)}</small>` : ""}</span>
          <h3><a class="svc-link" href="${L("services/" + s.slug + "/")}">${esc(s.name)}</a></h3>
          <p>${esc(s.short)}</p>
          <p class="svc-foot"><span class="svc-price">${s.quote ? "Free quote" : `From <b data-from="${s.key}">${money(s.base)}</b>${first ? `<span class="svc-first">${first(s.base)} first visit</span>` : ""}`}</span></p>
          <div class="svc-actions">
            ${s.quote
              ? `<a class="btn btn-primary btn-sm" href="${L("services/" + s.slug + "/")}" data-track="quote_click">Get a quote</a>`
              : `<a class="btn btn-primary btn-sm" href="${L("book/")}?s=${s.key}" data-track="book_click">Book now</a>`}
            ${B.whatsapp ? `<a class="btn btn-ghost btn-sm svc-wa" href="${esc(waLink(`Hi ${B.ownerFirstName}, I have a question about ${s.name}.`))}" target="_blank" rel="noopener" data-track="whatsapp_click">${ic("i-wa")} Ask ${esc(B.ownerFirstName)}</a>` : ""}
          </div>
        </div>
      </li>` : `<li>
        <a class="svc-card" href="${L("services/" + s.slug + "/")}">
          <span class="svc-top"><span class="svc-ico">${ic(SVC_ICON[s.key] || "i-sparkle")}</span>${s.tag ? `<small class="svc-tag">${esc(s.tag)}</small>` : ""}</span>
          <h3>${esc(s.name)}</h3>
          <p>${esc(s.short)}</p>
          <span class="svc-foot"><span class="svc-price">${s.quote ? "Free quote" : `From <b data-from="${s.key}">${money(s.base)}</b>`}</span>${ic("i-arrow", "ic svc-arrow")}</span>
        </a>
      </li>`).join("")}
    </ul>`;
}

// On the home page only the neighbourhoods with their own page are listed, plus a link to the rest.
function hoodChips(L, a, short = false) {
  const names = short ? a.neighbourhoods.filter(hoodByName) : a.neighbourhoods;
  const rest = a.neighbourhoods.length - names.length;
  return `<ul class="hood-list">${names.map((n) => { const h = hoodByName(n); return h ? `<li><a href="${L(hoodPath(h))}">${esc(n)}</a></li>` : `<li><span>${esc(n)}</span></li>`; }).join("")}${rest ? `<li><a class="hood-more" href="${L("areas/" + a.slug + "/")}">+ ${rest} more</a></li>` : ""}</ul>`;
}

function postalForm(id) {
  return `<form class="pc-check" data-pc-form novalidate>
        <label for="${id}">Check your postal code</label>
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

/* ---------- home ---------- */
const urls = [];
const homeFaq = faqBlock("home", "Questions, answered.");
const example = { beds: 2, baths: 1 };
const examplePrice = price("regular", example.beds, example.baths);
const gift = C.offers.gift;

function plansGrid() {
  return `<div class="plan-grid" data-plans data-beds="${example.beds}" data-baths="${example.baths}">
      ${Object.keys(C.frequencies).map((k) => {
        const f = C.frequencies[k];
        return `<div class="plan${f.recommended ? " plan-rec" : ""}" data-plan="${k}">
          ${f.recommended ? '<p class="plan-flag">Most popular</p>' : ""}
          <p class="plan-name">${esc(f.label)}</p>
          <p class="plan-price"><b data-plan-price>${money(examplePrice * (1 - f.discount / 100))}</b><span>per visit</span></p>
          <p class="plan-save">${f.discount ? `Save ${f.discount}%` : "No commitment"}</p>
        </div>`;
      }).join("")}
    </div>`;
}

urls.push(page({
  depth: 0, pathOut: "index.html", pageType: "home",
  title: `Home Cleaning in Scarborough & North York | ${B.name}`,
  description: `Careful home cleaning in Scarborough and North York, Toronto, from ${money(C.services.regular.base)}. See your price in seconds, book in two minutes, pay after your clean.`,
  schemas: [businessSchema(), websiteSchema(), homeFaq.schema, videoSchema()],
  body: (L) => `
<section class="hero hero-home">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="kicker">Home cleaning · Scarborough &amp; North York</p>
      <h1 class="display">We clean.<br><span class="accent">You rest.</span></h1>
      <p class="lede">Careful home cleaning by owner ${esc(B.owner)}. Price in seconds, pay after the clean.</p>
      <div class="hero-cta">
        <a class="btn btn-primary" href="${L("book/")}" data-track="book_click">Book your clean ${ic("i-arrow")}</a>
        ${B.whatsapp ? `<a class="btn btn-wa" data-wa href="${esc(waLink(WA_HELLO))}" target="_blank" rel="noopener" data-track="whatsapp_click">${ic("i-wa")} WhatsApp</a>` : ""}
      </div>
    </div>
    <div class="hero-visual">
      ${photo(L, "living-room", { sizes: "(min-width: 960px) 460px, 1px", cls: "hero-photo", eager: false })}
      <div class="hero-pricer">${pricer(L)}</div>
    </div>
    <a class="hero-owner" href="${L(REEL.src)}" data-reel-open aria-haspopup="dialog" data-track="video_open">
      <span class="hero-avatar"><picture><source type="image/webp" srcset="${L("assets/founder-mann-patel-avatar.webp")}"><img src="${L("assets/founder-mann-patel-avatar.jpg")}" alt="" width="76" height="76" decoding="async"></picture><span class="hero-avatar-play">${ic("i-play")}</span></span>
      <span><strong>Cleaned by ${esc(B.owner)}, owner.</strong> Every clean carries my name. <span class="hero-watch">Watch my intro (${REEL.length})</span></span>
    </a>
    ${assurances()}
  </div>
</section>

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
    ${serviceCards(L, allServices, "svc-grid-shop")}
  </div>
</section>

<section class="section section-tint" id="how">
  <div class="wrap">
    <div class="section-head">
      <p class="label">Booking</p>
      <h2>${CAL ? "Booked in two minutes. Confirmed instantly." : "Booked in two minutes. Confirmed by text."}</h2>
    </div>
    <ol class="steps-3">
      <li><h3>See your price</h3><p>From your home's size and the extras you choose. No estimate visit needed.</p></li>
      ${CAL
        ? `<li><h3>Pick a time</h3><p>Choose a real opening on ${esc(B.ownerFirstName)}'s calendar, any day of the week, evenings included.</p></li>
      <li><h3>You're confirmed</h3><p>Your time is confirmed straight away, by email. ${esc(B.ownerFirstName)} also texts you <span data-reply>${esc(B.replyPromise)}</span>. You pay after the clean.</p></li>`
        : `<li><h3>Choose a time</h3><p>Any day of the week, evenings included. Next opening: <strong data-next-open>tomorrow</strong>.</p></li>
      <li><h3>We confirm</h3><p>${esc(B.ownerFirstName)} confirms by text <span data-reply>${esc(B.replyPromise)}</span>, with a confirmation email if you add your address. You pay after the clean.</p></li>`}
    </ol>
    <div class="center-cta"><a class="btn btn-primary" href="${L("book/")}" data-track="book_click">Book your clean</a></div>
  </div>
</section>

<section class="section standard" id="standard">
  <div class="wrap standard-grid">
    <div>
      <div class="standard-head">
        <p class="label label-light">The Nest &amp; Rest standard</p>
        <h2>Five things happen at every visit.</h2>
        <p>You should never wonder who is in your home, or how it's being cleaned. So every visit follows the same five steps.</p>
      </div>
      <ol class="ritual">
        <li><h3>Introduced by name</h3><p>You'll know who is coming before we arrive. We ring once and introduce ourselves at your door.</p></li>
        <li><h3>Street shoes off, house shoes on</h3><p>Your floors only ever meet clean soles.</p></li>
        <li><h3>Your priorities first</h3><p>A quick word on what matters most today, so the time goes where you want it.</p></li>
        <li><h3>Separate cloths for kitchen and bath</h3><p>What cleans a bathroom never touches your kitchen.</p></li>
        <li><h3>A final check before we leave</h3><p>Every room checked against the checklist. Nothing left behind.</p></li>
      </ol>
    </div>
    <div class="standard-side">
      ${photo(L, "entryway", { sizes: "(min-width: 960px) 460px, 92vw", cls: "standard-photo" })}
      <aside class="guarantee" aria-labelledby="guarantee-title">
        <p class="label label-light">Our guarantee</p>
        <p class="guarantee-title" id="guarantee-title">Not quite right? We come back and fix it, free.</p>
        <p>Tell us within ${C.policies.recleanWindowHours} hours of your clean and we'll re-clean those areas at no charge.</p>
        <ul class="ticks">
          <li>${ic("i-check")}No deposit to book</li>
          <li>${ic("i-check")}Your price agreed before we start</li>
          <li>${ic("i-check")}Pay after the clean</li>
        </ul>
        <a class="text-link" href="${L("policies/#guarantee")}">Read our service policies ${ic("i-arrow")}</a>
      </aside>
    </div>
  </div>
</section>

<section class="section" id="plans">
  <div class="wrap plans-grid">
    ${photo(L, "bedroom", { sizes: "(min-width: 960px) 420px, 92vw", cls: "plans-photo" })}
    <div>
      <div class="section-head">
        <p class="label">Regular care</p>
        <h2>Set it once. Stay ahead.</h2>
        <p class="muted">Recurring visits cost less and keep your home consistently right. Pause or change anytime with ${C.policies.cancelNoticeHours} hours' notice.</p>
      </div>
      ${plansGrid()}
      <p class="fine">Example prices for a ${example.beds}-bedroom, ${example.baths}-bathroom condo, regular clean.</p>
    </div>
  </div>
</section>

<section class="section section-tint founder" id="founder">
  <div class="wrap founder-grid">
    ${founderPhoto(L)}
    <div class="founder-body">
      <figure class="founder-quote">
        <p class="label">From our founder</p>
        <blockquote>
          <p>“Home should be where you rest, not where the chores wait. I'm building Nest &amp; Rest to give that time back to families across Scarborough and North York, one home at a time.</p>
          <p class="founder-promise">Every clean carries my name. If anything isn't right, tell me, and I'll come back and make it right.”</p>
        </blockquote>
        <figcaption><strong data-owner>${esc(B.owner)}</strong><span>Founder &amp; Owner</span></figcaption>
      </figure>
      <a class="text-link" href="${L("vision/")}">Read ${esc(B.ownerFirstName)}'s vision ${ic("i-arrow")}</a>
      ${foundingCard(L)}
    </div>
  </div>
</section>

<section class="section reviews" id="reviews" data-reviews hidden>
  <div class="wrap">
    <div class="section-head"><p class="label">Reviews</p><h2 data-reviews-title>What clients say.</h2><p class="muted" data-reviews-sub></p></div>
    <div class="review-grid" data-reviews-list></div>
  </div>
</section>

<section class="section areas" id="areas">
  <div class="wrap split">
    <div class="split-head">
      <p class="label">Service area</p>
      <h2>Scarborough and North York.</h2>
      <p class="muted">We focus on two districts so we can be on time, every time. Check your postal code to confirm we come to you.</p>
      ${postalForm("pc-home")}
    </div>
    <div class="district-cards">
      ${C.areas.map((a) => `<div class="district">
        <a class="district-head" href="${L("areas/" + a.slug + "/")}"><span>${esc(a.name)}</span><small>${a.neighbourhoods.length} neighbourhoods</small>${ic("i-arrow")}</a>
        ${hoodChips(L, a, true)}
      </div>`).join("")}
    </div>
  </div>
</section>

<section class="section section-tint home-guides" id="guides">
  <div class="wrap">
    <div class="section-head section-head-row">
      <div><p class="label">Guides</p><h2>Helpful, before you book.</h2></div>
      <a class="text-link" href="${L("guides/")}">All guides ${ic("i-arrow")}</a>
    </div>
    ${guideCards(L, guides.slice(0, 3))}
  </div>
</section>

${homeFaq.html}
${finalCta(L)}
${reelDialog(L)}
`
}));

/* ---------- booking ---------- */
urls.push(page({
  depth: 1, pathOut: "book/index.html", pageType: "book", minimal: true, noBar: true,
  title: `Book a Clean | ${B.name}`,
  description: "Book your home cleaning online in about two minutes. See your price, choose a day and arrival window, and pay after the clean.",
  body: (L) => {
    const freqField = `<div class="field" data-freq-field><span class="field-label" id="freq-label">How often</span>
              <div class="freq-grid" role="radiogroup" aria-labelledby="freq-label">
                ${Object.keys(C.frequencies).map((k) => { const f = C.frequencies[k]; return `<label class="choice"><input type="radio" name="freq" value="${k}"><span class="choice-body"><strong>${esc(f.label)}</strong><span class="choice-desc">${f.discount ? `Save ${f.discount}%` : "No commitment"}</span></span></label>`; }).join("")}
              </div>
            </div>`;
    return `
<section class="book">
  <noscript><div class="wrap"><p class="form-error">Booking needs JavaScript. Please call or text <a href="tel:${B.phone}">${esc(B.phoneDisplay)}</a> and we'll book you in.</p></div></noscript>
  <div class="wrap">
    <div class="book-head">
      <div>
        <h1>Book your clean</h1>
        <p class="book-sub">${ic("i-cal")} ${CAL ? "Bookings from" : "Next opening:"} <strong data-next-open>tomorrow</strong></p>
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
            <div class="field"><label for="f-postal">Postal code of the home</label><input id="f-postal" name="postal" autocomplete="postal-code" autocapitalize="characters" maxlength="7" placeholder="e.g. M1B 2K3" required><small class="pc-result" data-pc-booking aria-live="polite"></small></div>
            <div class="field"><span class="field-label" id="svc-label">Service</span>
              <div class="choice-grid" role="radiogroup" aria-labelledby="svc-label">
                ${svcKeys.map((k) => { const s = C.services[k]; return `<label class="choice"><input type="radio" name="service" value="${k}"><span class="choice-body"><strong>${esc(s.name)}</strong><span class="choice-from">from <b data-from="${k}">${money(s.base)}</b></span><span class="choice-desc">${esc(s.short)}</span></span></label>`; }).join("")}
              </div>
              <p class="field-note">Larger home or an office? <a href="${L("services/residence-care/")}">Residence Care</a> and <a href="${L("services/office-cleaning/")}">office cleaning</a> are by quote.</p>
            </div>
            <div class="field"><span class="field-label" id="home-label">Type of home</span>
              <div class="seg seg-home" role="radiogroup" aria-labelledby="home-label">
                ${Object.keys(C.homeTypes).map((k) => `<label><input type="radio" name="homeType" value="${k}"><span>${esc(C.homeTypes[k].label)}</span></label>`).join("")}
              </div>
            </div>
            <div class="pricer-row">
              ${stepper("b-beds", "Bedrooms", 1, 'data-counter="beds"')}
              ${stepper("b-baths", "Bathrooms", 1, 'data-counter="baths"')}
            </div>
            <div class="field"><span class="field-label">Extras <span class="opt">optional</span></span>
              <div class="chips">
                ${C.addons.map((a) => `<label class="chip" data-addon="${a.id}"><input type="checkbox" name="addon" value="${a.id}"><span>${esc(a.name)} <b>+${money(a.price)}</b></span></label>`).join("")}
              </div>
            </div>
            ${CAL ? freqField : ""}
          </fieldset>

          ${CAL ? "" : `<fieldset class="step" data-step="2" hidden>
            <legend>Plan &amp; time</legend>
            ${freqField}
            <div class="field"><span class="field-label" id="date-label">Day</span>
              <p class="field-note">Next opening: <strong data-next-open>tomorrow</strong>. Every day of the week, evenings included.</p>
              <div class="date-strip" role="radiogroup" aria-labelledby="date-label" data-dates></div>
              <label class="check"><input type="checkbox" id="flex-date" data-flex> I'm flexible: offer me the earliest opening</label>
            </div>
            <div class="field"><span class="field-label" id="slot-label">Arrival window</span>
              <div class="seg seg-slots" role="radiogroup" aria-labelledby="slot-label">
                ${C.timeSlots.map((t) => `<label><input type="radio" name="slot" value="${t.id}"><span>${esc(t.label)}<small>${esc(t.time)}</small></span></label>`).join("")}
              </div>
            </div>
          </fieldset>`}

          <fieldset class="step" data-step="${CAL ? 2 : 3}" hidden>
            <legend>Your details</legend>
            <p class="field-note">All fields are required unless marked optional.</p>
            <div class="form-grid">
              <div class="field"><label for="f-name">Full name</label><input id="f-name" name="name" autocomplete="name" required></div>
              <div class="field"><label for="f-phone">Mobile</label><input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="e.g. 647 555 0123" required></div>
              <div class="field span-2"><label for="f-email">Email <span class="opt">optional, we'll send your confirmation here</span></label><input id="f-email" name="email" type="email" inputmode="email" autocomplete="email"></div>
              <div class="field span-2"><label for="f-address">Street address and unit</label><input id="f-address" name="address" autocomplete="street-address" required></div>
              <div class="field span-2"><label for="f-access">Getting in</label><div class="select-wrap"><select id="f-access" name="access"><option>I'll be home</option><option>Concierge or front desk</option><option>Lockbox or key code</option><option>Let's discuss</option></select>${ic("i-chev")}</div></div>
              <div class="field span-2"><span class="field-label" id="pets-label">Pets</span>
                <div class="seg" role="radiogroup" aria-labelledby="pets-label">
                  <label><input type="radio" name="pets" value="No pets" checked><span>No pets</span></label>
                  <label><input type="radio" name="pets" value="Dog"><span>Dog</span></label>
                  <label><input type="radio" name="pets" value="Cat or other"><span>Cat / other</span></label>
                </div>
              </div>
              <div class="field span-2"><label for="f-notes">Notes <span class="opt">optional</span></label><textarea id="f-notes" name="notes" rows="3" placeholder="Parking, rooms to focus on, products to avoid"></textarea><small class="field-hint">Please don't type door or lockbox codes here. We'll ask for them by text once your booking is confirmed.</small></div>
              <div class="field span-2"><span class="field-label" id="pref-label">Confirm by</span>
                <div class="seg${B.whatsapp ? " seg-slots" : ""}" role="radiogroup" aria-labelledby="pref-label">
                  <label><input type="radio" name="contactPref" value="Text" checked><span>Text</span></label>
                  ${B.whatsapp ? '<label><input type="radio" name="contactPref" value="WhatsApp"><span>WhatsApp</span></label>' : ""}
                  <label><input type="radio" name="contactPref" value="Call"><span>Call</span></label>
                  <label><input type="radio" name="contactPref" value="Email"><span>Email</span></label>
                </div>
              </div>
              <p class="consent-line span-2">${ic("i-check")}<span>${CAL
                ? `Next, you pick a time on ${esc(B.ownerFirstName)}'s calendar and it's confirmed straight away. Nothing to pay until it's done. Free to change up to ${C.policies.cancelNoticeHours} hours before. ${LATE_FEE_LINE}`
                : `This is a booking request. ${esc(B.ownerFirstName)} confirms the time and final price with you before the clean. Nothing to pay until it's done. Free to change up to ${C.policies.cancelNoticeHours} hours before. ${LATE_FEE_LINE}`}</span></p>
              <p class="privacy-note span-2">Your booking is with ${esc(B.name)}, owned and operated by ${esc(B.owner)}, ${ADDR ? esc(ADDR) : `${esc(B.base)}, Ontario`}. <a data-tel href="tel:${B.phone}">${esc(B.phoneDisplay)}</a> · <a data-mailto href="mailto:${B.email}">${esc(B.email)}</a></p>
              <p class="privacy-note span-2">By sending, you agree to our <a href="${L("policies/")}">Service Policies</a>. We use your details only to arrange your clean. Your request is sent through FormSubmit to our Google email inbox${CAL ? ", and the time you pick is booked on Cal.com, our booking calendar. Both" : ", which"} may store data outside Canada. See our <a href="${L("privacy/")}">Privacy Policy</a>.</p>
              <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
            </div>
            <p class="form-error" data-form-error role="alert" hidden></p>
          </fieldset>

          <div class="step-nav">
            <button type="button" class="btn btn-ghost" data-prev hidden>${ic("i-back")} Back</button>
            <button type="button" class="btn btn-primary btn-grow" data-next>Continue ${ic("i-arrow")}</button>
            <button type="submit" class="btn btn-primary btn-grow" data-submit hidden>${CAL ? `Choose your time ${ic("i-arrow")}` : "Request booking"}</button>
          </div>
        </form>

        ${CAL ? `<div class="cal-step" data-cal-step hidden tabindex="-1">
          <p class="label">Last step</p>
          <h2>Pick your time</h2>
          <p>Your details are in. Choose a time that suits you and it's confirmed straight away, with a confirmation email.</p>
          <div class="cal-embed" data-cal-embed></div>
          <p class="form-error" data-cal-fail role="alert" hidden>The calendar didn't load here. Open it in a new tab below, or ${esc(B.ownerFirstName)} will text you ${esc(B.replyPromise)} to arrange a time.</p>
          <p class="cal-alt"><a class="text-link" data-cal-link href="#" target="_blank" rel="noopener">Open the calendar in a new tab ${ic("i-arrow")}</a></p>
        </div>

        ` : ""}<div class="done" data-done hidden tabindex="-1">
          <p class="label" data-done-label>Request received</p>
          <h2 data-done-title>Thank you.</h2>
          <p data-done-text></p>
          <p class="ref">Reference <strong data-ref></strong></p>
          <dl class="done-list" data-done-list></dl>
          <div class="done-actions">
            <button type="button" class="btn btn-primary" data-ics>${ic("i-cal")} Add to calendar</button>
            ${B.whatsapp ? `<a class="btn btn-wa" data-wa-booking href="#" target="_blank" rel="noopener">${ic("i-wa")} Send on WhatsApp</a>` : ""}
            <a class="btn btn-ghost" data-sms-booking href="#">${ic("i-sms")} Text us these details</a>
          </div>
          <div class="done-refer">
            <p><strong>Know someone who'd love this?</strong> When a friend books their first clean, you both get $<span data-referral>${C.offers.referral}</span> off. <a href="${L("policies/#referral")}">Terms</a></p>
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

/* ---------- service pages ---------- */
const SVC_PHOTO = { regular: "bedroom", deep: "bathroom", move: "entryway", detail: "kitchen", residence: "living-room", office: "kitchen" };
function checklistFor(s) {
  const col = s.checklistColumn;
  const rooms = C.checklist.filter((r) => !s.rooms || s.rooms.includes(r.room));
  return rooms.map((r) => {
    const tasks = r.tasks.filter((t) => t[col]);
    if (!tasks.length) return "";
    return `<div class="incl-room"><h3>${esc(r.room)}</h3><ul>${tasks.map((t) => `<li class="${t[col] === "add" ? "is-add" : ""}">${t[col] === "add" ? '<span class="add-tag">Extra</span>' : ic("i-check")}<span>${esc(t[0])}</span></li>`).join("")}</ul></div>`;
  }).join("");
}

for (const k of svcKeys) {
  const s = C.services[k];
  const trail = [["Home", ""], [s.name, "services/" + s.slug + "/"]];
  const fq = faqBlock(k, undefined, "section-tint");
  const others = allServices.filter((o) => o.key !== k);
  const included = (C.includedAddons[k] || []);
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
      <p class="kicker">${s.tag ? esc(s.tag) : "Service"}</p>
      <h1 class="display display-sub">${esc(s.name)}</h1>
      <p class="lede">${esc(s.intro)}</p>
      <dl class="facts">
        <div><dt>From</dt><dd data-from="${k}">${money(s.base)}</dd></div>
        <div><dt>Time on site</dt><dd>From ${s.hours} hrs</dd></div>
        <div><dt>Payment</dt><dd>After the clean</dd></div>
      </dl>
    </div>
    <div class="hero-pricer">${pricer(L, k, "Price your " + s.menuName.toLowerCase())}</div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><p class="label">What's included</p><h2>Room by room.</h2></div>
    <div class="incl-grid">${checklistFor(s)}</div>
  </div>
</section>

<section class="section section-tint" id="prices">
  <div class="wrap split">
    <div class="split-head">
      <p class="label">Prices</p>
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
      <ul class="price-list">${C.addons.map((a) => `<li><span>${esc(a.name)}</span><b>${included.includes(a.id) ? "Included" : "+" + money(a.price)}</b></li>`).join("")}</ul>
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
${finalCta(L, "Prefer to talk it through?", "Call, text or WhatsApp and we'll answer your questions directly.")}`
  }));
}

/* ---------- pricing ---------- */
{
  const trail = [["Home", ""], ["Pricing", "pricing/"]];
  const fq = faqBlock("pricing", "Pricing questions.", "section-tint");
  const quotes = allServices.filter((s) => s.quote);
  const moveIncl = (C.includedAddons.move || []).map((id) => C.addons.find((a) => a.id === id).name.toLowerCase());
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
      <p class="kicker">Pricing</p>
      <h1 class="display display-sub">House cleaning prices, up front.</h1>
      <p class="lede">Your price is set by the service, the size and type of your home, and any extras you choose. You see it before you book, there's no deposit, and you pay after the clean.</p>
      <dl class="facts">
        <div><dt>Regular</dt><dd>From <span data-from="regular">${money(C.services.regular.base)}</span></dd></div>
        <div><dt>Deep</dt><dd>From <span data-from="deep">${money(C.services.deep.base)}</span></dd></div>
        <div><dt>Move-out</dt><dd>From <span data-from="move">${money(C.services.move.base)}</span></dd></div>
      </dl>
    </div>
    <div class="hero-pricer">${pricer(L, "regular", "Price your home")}</div>
  </div>
</section>

<section class="section" id="by-size">
  <div class="wrap">
    <div class="section-head">
      <p class="label">By home size</p>
      <h2>Find your home. See your price.</h2>
      <p class="muted">Prices for the whole visit in ${C.currency}, with products and equipment included. Studios are priced as 1 bedroom. ${factors.map((h, i) => `${i ? C.homeTypes[h].label.toLowerCase() : C.homeTypes[h].label}s add <span data-factor="${h}">${pct(h)}</span>`).join(" and ")}, for the stairs and extra floor space.</p>
      ${offerNote()}
    </div>
    <div class="price-cards">
      ${svcKeys.map((k) => { const s = C.services[k]; return `<article class="price-card">
        <div class="price-card-head">
          <h3><a href="${L("services/" + s.slug + "/")}">${esc(s.name)}</a></h3>
          <p class="price-card-from">From <b data-from="${k}">${money(s.base)}</b></p>
        </div>
        <p class="muted">${esc(s.short)}</p>
        ${priceTable(k)}
        <div class="price-card-foot">
          <a class="text-link" href="${L("services/" + s.slug + "/")}">What's included ${ic("i-arrow")}</a>
          <a class="btn btn-ghost btn-sm" href="${L("book/")}?s=${k}" data-track="book_click">Book</a>
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
    ${plansGrid()}
    <p class="fine">Example prices for a ${example.beds}-bedroom, ${example.baths}-bathroom condo, regular clean.</p>
  </div>
</section>

<section class="section" id="extras">
  <div class="wrap split">
    <div class="split-head">
      <p class="label">Extras</p>
      <h2>Add only what you need.</h2>
      <p class="muted">Choose extras when you book.${moveIncl.length ? ` These are already included in a move-in or move-out clean: ${listJoin(moveIncl)}.` : ""}</p>
      <p class="label label-sm">Included in every price</p>
      <ul class="ticks">
        <li>${ic("i-check")}Products and equipment</li>
        <li>${ic("i-check")}A free re-clean within ${C.policies.recleanWindowHours} hours if anything isn't right</li>
        <li>${ic("i-check")}No deposit, and payment after the clean</li>
      </ul>
    </div>
    <ul class="price-list">${C.addons.map((a) => `<li><span>${esc(a.name)}</span><b>+${money(a.price)}</b></li>`).join("")}</ul>
  </div>
</section>

<section class="section section-tint" id="compare">
  <div class="wrap">
    <div class="section-head">
      <p class="label">Compare</p>
      <h2>Regular, deep or move-out: what's the difference?</h2>
      <p class="muted">A regular clean keeps a home right. A deep clean adds the detail work that builds up over months. A move-in or move-out clean covers an empty home inside every cabinet, drawer and closet.</p>
    </div>
    ${compareTable()}
  </div>
</section>

<section class="section" id="quotes">
  <div class="wrap">
    <div class="section-head"><p class="label">By quote</p><h2>Larger homes, offices and realtors.</h2><p class="muted">These are priced after a conversation or a walkthrough, so the quote fits the space. Quotes are free.</p></div>
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
      <p class="kicker">Service area</p>
      <h1 class="display display-sub">House cleaning in ${esc(a.name)}.</h1>
      <p class="lede">${esc(a.intro)}</p>
      <dl class="facts">
        <div><dt>From</dt><dd data-from="regular">${money(C.services.regular.base)}</dd></div>
        <div><dt>Open</dt><dd>7 days, 9am to 11pm</dd></div>
        <div><dt>Payment</dt><dd>After the clean</dd></div>
      </dl>
    </div>
    <div class="hero-pricer">${pricer(L, "regular", "Your price in " + a.name)}</div>
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
        <div><dt>Open</dt><dd>7 days, 9am to 11pm</dd></div>
        <div><dt>Payment</dt><dd>After the clean</dd></div>
      </dl>
    </div>
    <div class="hero-pricer">${pricer(L, "regular", "Your price in " + h.name)}</div>
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
          <li>${ic("i-check")}<a href="${L("services/regular-home-cleaning/")}">Regular cleaning</a> every 2 weeks, from ${money(price("regular", 2, 1) * (1 - C.frequencies.biweekly.discount / 100))} for a 2-bedroom condo</li>
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
        <li>${ic("i-check")}Free re-clean within ${C.policies.recleanWindowHours} hours if anything isn't right</li>
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
      <h2>One text, and it's handled.</h2>
      <ol class="steps-3 steps-col">
        <li><h3>Send the address and date</h3><p>By the form, text or WhatsApp. We confirm a time ${esc(B.replyPromise)}.</p></li>
        <li><h3>Leave access</h3><p>Lockbox, concierge or key pickup. Codes are deleted after the clean.</p></li>
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
${finalCta(L, "Next listing coming up?", "Send the address and date. We'll confirm a time by text.")}`
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
        <p class="privacy-note">Your request is sent through FormSubmit to our Google email inbox, which may store data outside Canada. See our <a href="${L("privacy/")}">Privacy Policy</a> and <a href="${L("policies/#gift")}">gift card terms</a>.</p>
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
      crumbSchema(trail),
      videoSchema()
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
        <a class="btn btn-ghost" data-tel href="tel:${B.phone}">Call or text <span data-phone-text>${esc(B.phoneDisplay)}</span></a>
      </div>
    </div>
  </div>
</section>
${founding && founding.active
  ? finalCta(L, "Be a founding household.", `${founding.text} Book in two minutes and pay after it's done.`)
  : finalCta(L)}
${reelDialog(L)}`
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
const contactLine = `<a data-mailto href="mailto:${B.email}">${esc(B.email)}</a> or <a data-tel href="tel:${B.phone}">${esc(B.phoneDisplay)}</a>`;

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
          <tr><td>You request a booking</td><td>Name, mobile number, email (optional), street address and postal code, home type and size, extras, ${CAL ? "the time you pick on our calendar" : "preferred day and arrival window"}, how we get in (for example a lockbox or concierge), pets, notes, and how you'd like us to confirm.</td></tr>
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
      <li>To send you a confirmation email when you give us your email address with a request.</li>
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
        ` : ""}<li><strong>FormSubmit</strong> (formsubmit.co) delivers the website's forms to our email inbox, and sends your confirmation email when you give us your address.</li>
        <li><strong>WhatsApp</strong> (WhatsApp LLC, part of Meta Platforms) delivers and stores messages if you choose to contact us on WhatsApp.</li>
        <li><strong>Your bank or card payment provider</strong> processes payments you make by Interac e-Transfer or card.</li>
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
    { id: "cookies", h: "Cookies and your browser", html: () => `<p>We don't use advertising cookies or tracking pixels. When you start a booking, the details you enter are saved in your own browser so you don't lose them if you leave the page. They stay on your device and are sent to us only when you submit the request. You can clear them at any time through your browser settings.</p>${CAL ? `
      <p>When you pick a time, our booking calendar from Cal.com loads on the page and may use its own cookies to run the calendar. See Cal.com's privacy policy for details.</p>` : ""}
      <p>If we add website analytics or advertising tools in future, we will update this policy first and explain how to opt out.</p>` },
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
  intro: `Clear terms, so there are no surprises. These apply to every clean we do. If anything here is unclear, call, text or WhatsApp ${esc(B.phoneDisplay)}.`,
  sections: [
    { id: "area", h: "Where we clean", html: () => `<p>We clean homes and small offices in Scarborough and North York, Toronto. We confirm your postal code before every booking.</p>` },
    { id: "booking", h: "Booking and confirmation", html: () => CAL
      ? `<p>When you book on the website, you send your details first, then pick a time on our online calendar. The time you pick is confirmed straight away, and our calendar provider, Cal.com, emails you a confirmation with links to reschedule or cancel. We also contact you by text, WhatsApp, call or email, as you prefer, ${esc(B.replyPromise)}. If you don't pick a time, your details reach us as a request and we'll contact you to arrange one.</p>`
      : `<p>A booking made on the website is a request. It's confirmed once we've contacted you by text, WhatsApp, call or email and agreed a day and arrival window. We usually reply ${esc(B.replyPromise)}. If you give us your email address, you also get an automatic email confirming we've received your request.</p>` },
    { id: "pricing", h: "Prices and estimates", html: () => `<p>The price shown on the website is an estimate based on what you tell us: the service, home type, bedrooms, bathrooms and extras. If your home needs much more or less time than expected, we'll tell you and agree the price with you before we start, never after. Prices are in Canadian dollars.</p>
      ${founding && founding.active ? `<p>Founding household offer: ${esc(founding.text)} The discount applies to the first visit only and can't be combined with other discounts.</p>` : ""}
      <p>Recurring plans (weekly, every 2 weeks or every 4 weeks) receive the discount shown when you book. You can pause or change your plan with ${P.cancelNoticeHours} hours' notice.</p>` },
    { id: "payment", h: "Payment", html: () => `<p>There's no deposit to book. You pay after your clean by Interac e-Transfer, credit or debit card, or cash.</p>` },
    { id: "changes", h: "Rescheduling and cancellation", html: () => `<p>You can reschedule or cancel at no charge with at least ${P.cancelNoticeHours} hours' notice before your arrival window. With less notice, or if we can't get into your home at the agreed time, a late-cancellation fee of ${esc(P.lateCancelFee)} may apply. We'll always tell you before charging it.</p>
      <p>If we ever need to reschedule because of illness or severe weather, we'll tell you as early as possible and offer the next available time.</p>` },
    { id: "guarantee", h: "Our re-clean guarantee", html: () => `<p>If something isn't right, tell us within ${P.recleanWindowHours} hours of your clean, with photos if you can. We'll come back and re-clean those areas at no charge. If a re-clean doesn't put it right, contact ${esc(B.ownerFirstName)} and we'll agree a fair solution together.</p>` },
    { id: "gift", h: "Gift cards", html: () => `<p>Gift cards are issued once paid. They never expire, can be used toward any service in our service area, and any balance left after a clean stays on the card.</p>` },
    { id: "referral", h: "Referral credit", html: () => { const r = money(C.offers.referral); return `<p>When someone you refer books their first clean with us, you each get ${r} off:</p>
      <ul>
        <li>Your friend gets ${r} off their first clean. Ask them to put your name in their booking notes.</li>
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
<link rel="stylesheet" href="${L404("css/site.css")}?v=${ASSET_V.css}"></head>
<body data-page="404"><main class="section"><div class="wrap narrow">
<a class="brand" href="${L404()}"><img src="${L404("assets/logo.svg")}" alt="${esc(B.name)}" width="772" height="210" style="height:56px;width:auto"></a>
<h1 class="display display-sub" style="margin-top:48px">This page has moved.</h1>
<p class="lede">Everything you need is a tap away.</p>
<p class="cta-row" style="margin-top:24px"><a class="btn btn-primary" href="${L404("book/")}">Book a clean</a> <a class="btn btn-ghost" href="${L404()}">Go to the home page</a></p>
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

console.log(`Built ${urls.length} pages into ${OUT}`);
