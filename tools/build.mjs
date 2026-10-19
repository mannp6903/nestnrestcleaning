// Generates every page of the site from js/config.js and the templates below.
// Usage: node tools/build.mjs            -> writes the site into the repo root
//        node tools/build.mjs --preview DIR -> writes a preview copy (artifact-friendly links)
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const PREVIEW_DIR = args[0] === "--preview" ? path.resolve(args[1]) : null;
const OUT = PREVIEW_DIR || ROOT;

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "js/config.js"), "utf8"), sandbox);
const C = sandbox.window.NR_CONFIG;
const B = C.business;
const SITE = C.siteUrl.replace(/\/$/, "");
const YEAR = new Date().getFullYear();

/* ---------- helpers ---------- */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => "$" + Math.round(n).toLocaleString("en-CA");
const roundTo = (n, s) => Math.round(n / s) * s;
const svcKeys = Object.keys(C.services);
const quoteKeys = Object.keys(C.quoteServices);
const allServices = [...svcKeys.map((k) => ({ key: k, ...C.services[k], quote: false })), ...quoteKeys.map((k) => ({ key: k, ...C.quoteServices[k], quote: true }))];

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

const ICONS = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="i-phone" viewBox="0 0 24 24"><path d="M6.6 3.5h2.6l1.4 4-2 1.4a11 11 0 0 0 6.5 6.5l1.4-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>
<symbol id="i-sms" viewBox="0 0 24 24"><path d="M4 5.5h16v10.5H9.5L5 20v-4H4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>
<symbol id="i-mail" viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-back" viewBox="0 0 24 24"><path d="M20 12H5M10.5 6.5 5 12l5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
<symbol id="i-minus" viewBox="0 0 24 24"><path d="M5 12h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
<symbol id="i-star" viewBox="0 0 24 24"><path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.5-4.2 6.1-.8Z"/></symbol>
<symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3.5 5 6v5.5c0 4.2 3 7.8 7 9 4-1.2 7-4.8 7-9V6Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m9 12 2 2 4-4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-card" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 10h18M6.5 14.5h4" stroke="currentColor" stroke-width="1.6"/></symbol>
<symbol id="i-cal" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 9.5h17M8 3v4M16 3v4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
<symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>
<symbol id="i-leaf" viewBox="0 0 24 24"><path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15M5 19l7-7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.8" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4.5 20.5c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
<symbol id="i-facebook" viewBox="0 0 24 24"><path d="M13.6 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21z"/></symbol>
<symbol id="i-instagram" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="4.8" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3.9" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.2" cy="6.8" r="1.1"/></symbol>
<symbol id="i-menu" viewBox="0 0 24 24"><path d="M3 8h18M3 16h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
<symbol id="i-close" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
<symbol id="i-chev" viewBox="0 0 24 24"><path d="m7 9.5 5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</defs></svg>`;

/* ---------- shared fragments ---------- */
function header(L, opts = {}) {
  if (opts.minimal) {
    return `<header class="site-header minimal">
  <div class="wrap header-row">
    <a class="brand" href="${L("")}" aria-label="${esc(B.name)}, home"><img src="${L("assets/logo.png")}" alt="${esc(B.name)}" width="900" height="195"></a>
    <a class="header-help" data-tel href="tel:${B.phone}"><span>Questions?</span> <strong data-phone-text>${esc(B.phoneDisplay)}</strong></a>
  </div>
</header>`;
  }
  return `<header class="site-header">
  <div class="wrap header-row">
    <a class="brand" href="${L("")}" aria-label="${esc(B.name)}, home"><img src="${L("assets/logo.png")}" alt="${esc(B.name)}" width="900" height="195"></a>
    <nav class="nav-desktop" aria-label="Main">
      <a href="${L("#services")}">Services</a>
      <a href="${L("#standard")}">Our standard</a>
      <a href="${L("#areas")}">Areas</a>
      <a href="${L("#faq")}">FAQ</a>
    </nav>
    <div class="header-actions">
      <a class="header-phone" data-tel href="tel:${B.phone}"><svg class="ic" aria-hidden="true"><use href="#i-phone"/></svg><span data-phone-text>${esc(B.phoneDisplay)}</span></a>
      <a class="btn btn-primary btn-sm" href="${L("book/")}" data-track="book_click">Book</a>
      <button class="menu-btn" type="button" aria-controls="menu" aria-expanded="false" aria-label="Open menu"><svg class="ic"><use href="#i-menu"/></svg></button>
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
        <li><a href="${L("#standard")}">Our standard</a></li>
        <li><a href="${L("#areas")}">Areas we serve</a></li>
        <li><a href="${L("#faq")}">Questions</a></li>
        <li><a href="${L("review/")}">Leave a review</a></li>
      </ul>
      <div class="menu-cta">
        <a class="btn btn-primary btn-block" href="${L("book/")}">Book your clean</a>
        <a class="btn btn-ghost btn-block" data-tel href="tel:${B.phone}">Call or text ${esc(B.phoneDisplay)}</a>
      </div>
      ${socialLinks("social-menu")}
    </div>
  </div>
`;
}

function socialLinks(cls = "") {
  return `<div class="social ${cls}">
    <a class="social-link" data-social="facebook" aria-label="${esc(B.name)} on Facebook" aria-disabled="true"><svg class="ic" aria-hidden="true"><use href="#i-facebook"/></svg></a>
    <a class="social-link" data-social="instagram" aria-label="${esc(B.name)} on Instagram" aria-disabled="true"><svg class="ic" aria-hidden="true"><use href="#i-instagram"/></svg></a>
  </div>`;
}

function footer(L) {
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div class="footer-brand">
        <img src="${L("assets/badge.png")}" alt="${esc(B.name)}" width="720" height="201">
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
        </div>
        <div>
          <p class="label">Contact</p>
          <ul>
            <li><a data-tel href="tel:${B.phone}" data-phone-text>${esc(B.phoneDisplay)}</a></li>
            <li><a data-mailto href="mailto:${B.email}" data-email-text>${esc(B.email)}</a></li>
            <li><span data-hours>${esc(B.hours)}</span></li>
            <li><span>${esc(B.areaLabel)}</span></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© <span data-year>${YEAR}</span> ${esc(B.name)}, ${esc(B.base)}, Ontario.</p>
      <ul class="legal">
        <li><a href="${L("privacy/")}">Privacy Policy</a></li>
        <li><a href="${L("policies/")}">Service Policies</a></li>
        <li><a href="${L("review/")}">Leave a review</a></li>
      </ul>
    </div>
  </div>
</footer>`;
}

function actionBar(L) {
  return `<div class="action-bar" data-action-bar>
  <a class="ab-link" data-tel href="tel:${B.phone}" data-track="call_click"><svg class="ic" aria-hidden="true"><use href="#i-phone"/></svg><span>Call</span></a>
  <a class="ab-link" data-sms href="sms:${B.phone}" data-track="text_click"><svg class="ic" aria-hidden="true"><use href="#i-sms"/></svg><span>Text</span></a>
  <a class="btn btn-primary ab-book" href="${L("book/")}" data-track="book_click">Book your clean</a>
</div>`;
}

function pricer(L, defaultKey = "regular", heading = "Your price, in seconds") {
  const p = price(defaultKey, 1, 1);
  return `<form class="pricer" data-pricer data-default-service="${defaultKey}" novalidate>
  <div class="pricer-head">
    <p class="pricer-title">${esc(heading)}</p>
    <p class="pricer-offer" data-offer-note hidden></p>
  </div>
  <div class="field">
    <label for="p-service">Service</label>
    <div class="select-wrap"><select id="p-service" data-p-service>
      ${svcKeys.map((k) => `<option value="${k}"${k === defaultKey ? " selected" : ""}>${esc(C.services[k].name)}</option>`).join("")}
    </select><svg class="ic" aria-hidden="true"><use href="#i-chev"/></svg></div>
  </div>
  <div class="field">
    <label for="p-home">Type of home</label>
    <div class="select-wrap"><select id="p-home" data-p-home>
      ${Object.keys(C.homeTypes).map((k) => `<option value="${k}">${esc(C.homeTypes[k].label)}</option>`).join("")}
    </select><svg class="ic" aria-hidden="true"><use href="#i-chev"/></svg></div>
  </div>
  <div class="pricer-row">
    ${stepper("p-beds", "Bedrooms", 1, "data-p-beds")}
    ${stepper("p-baths", "Bathrooms", 1, "data-p-baths")}
  </div>
  <div class="pricer-result" aria-live="polite">
    <p class="pricer-amount" data-p-amount>${money(p)}</p>
    <p class="pricer-meta" data-p-meta>Estimate · about ${hours(defaultKey, 1, 1)} hours on site</p>
  </div>
  <a class="btn btn-primary btn-block" href="${L("book/")}" data-p-go data-track="pricer_continue">Choose your time <svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></a>
  <p class="pricer-fine">No payment to book · Free re-clean guarantee</p>
</form>`;
}

function stepper(id, label, value, attr) {
  return `<div class="stepper" ${attr}>
      <span class="stepper-label" id="${id}-label">${label}</span>
      <div class="stepper-ctl">
        <button type="button" data-dec aria-label="Fewer ${label.toLowerCase()}"><svg class="ic"><use href="#i-minus"/></svg></button>
        <output id="${id}" aria-labelledby="${id}-label" aria-live="polite">${value}</output>
        <button type="button" data-inc aria-label="More ${label.toLowerCase()}"><svg class="ic"><use href="#i-plus"/></svg></button>
      </div>
    </div>`;
}

function assurances() {
  const items = [
    ["i-shield", "Free re-clean within 24 hours"],
    ["i-card", "Pay after your clean"],
    ["i-cal", "Saturday appointments"],
    ["i-pin", "Scarborough & North York"]
  ];
  return `<ul class="assure" data-assure>${items.map(([i, t]) => `<li><svg class="ic" aria-hidden="true"><use href="#${i}"/></svg>${esc(t)}</li>`).join("")}</ul>`;
}

function faqBlock(tag, title = "Questions, answered.") {
  const list = C.faqs.filter((f) => f.on.includes(tag));
  if (!list.length) return { html: "", schema: null };
  const html = `<section class="section faq-section" id="faq">
  <div class="wrap split">
    <div class="split-head">
      <p class="label">Questions</p>
      <h2>${esc(title)}</h2>
      <p class="muted">Anything else? Call or text <a data-tel href="tel:${B.phone}" data-phone-text>${esc(B.phoneDisplay)}</a>.</p>
    </div>
    <div class="faq">
      ${list.map((f) => `<details><summary><span>${esc(f.q)}</span><svg class="ic" aria-hidden="true"><use href="#i-plus"/></svg></summary><p>${esc(f.a)}</p></details>`).join("")}
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
      <a class="btn btn-ghost-light" data-tel href="tel:${B.phone}">Call or text ${esc(B.phoneDisplay)}</a>
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

function businessSchema() {
  return {
    "@context": "https://schema.org", "@type": "LocalBusiness", "@id": SITE + "/#business",
    name: B.name, slogan: B.tagline, url: SITE + "/", logo: SITE + "/assets/logo.png", image: SITE + "/assets/icon-512.png",
    telephone: B.phone, email: B.email, priceRange: "$$",
    founder: { "@type": "Person", name: B.owner, jobTitle: "Founder & Owner", image: SITE + "/assets/founder-mann-patel.jpg" },
    address: { "@type": "PostalAddress", addressLocality: "Toronto", addressRegion: B.region, addressCountry: "CA" },
    areaServed: C.areas.map((a) => ({ "@type": "Place", name: a.name + ", Toronto, ON" })),
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "08:00", closes: "18:00" }],
    ...([B.facebookUrl, B.instagramUrl].filter(Boolean).length ? { sameAs: [B.facebookUrl, B.instagramUrl].filter(Boolean) } : {}),
    makesOffer: allServices.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.name, url: SITE + "/services/" + s.slug + "/" } }))
  };
}

/* ---------- page shell ---------- */
function page({ depth, pathOut, title, description, body, schemas = [], pageType, minimal = false, noBar = false }) {
  const L = linker(depth);
  const canonical = SITE + "/" + pathOut.replace(/index\.html$/, "");
  const ld = schemas.filter(Boolean).map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n");
  const headInner = `<title>${esc(title)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#F7F4EE">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(B.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}/assets/og-image.png">
<link rel="icon" type="image/png" sizes="48x48" href="${L("assets/favicon-48.png")}">
<link rel="apple-touch-icon" href="${L("assets/apple-touch-icon.png")}">
<link rel="preload" href="${L("assets/fonts/montserrat.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${L("assets/fonts/dm-sans.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${L("css/site.css")}">
${ld}`;
  const bodyInner = `${ICONS}
<a class="skip" href="#main">Skip to content</a>
${header(L, { minimal })}
<main id="main">
${body(L)}
</main>
${minimal ? "" : footer(L)}
${noBar ? "" : actionBar(L)}
<div class="toast" data-toast role="status" aria-live="polite" hidden></div>
<script src="${L("js/config.js")}"></script>
${PREVIEW_DIR ? "<script>window.NR_CONFIG.preview = true;</script>" : ""}
<script src="${L("js/site.js")}"></script>`;
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

/* ---------- home ---------- */
const urls = [];
const homeFaq = faqBlock("home", "Questions, answered.");
const example = { beds: 2, baths: 1 };
const examplePrice = price("regular", example.beds, example.baths);

urls.push(page({
  depth: 0, pathOut: "index.html", pageType: "home",
  title: `Home Cleaning in Scarborough & North York from ${money(C.services.regular.base)} | ${B.name}`,
  description: "Meticulous home cleaning in Scarborough and North York, Toronto. See your exact price in seconds, book online in two minutes, pay after your clean.",
  schemas: [businessSchema(), homeFaq.schema],
  body: (L) => `
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <h1><span class="h1-kicker">Home cleaning in Scarborough &amp; North York</span>We clean.<br><span class="h1-line2">You rest.</span></h1>
      <p class="lede">Meticulous home cleaning by a uniformed team that changes into house shoes at your door. See your exact price in seconds, choose a time, and come home to it done.</p>
      <p class="hero-talk">Prefer to talk? <a data-tel href="tel:${B.phone}">Call or text <span data-phone-text>${esc(B.phoneDisplay)}</span></a></p>
    </div>
    <div class="hero-pricer">${pricer(L)}</div>
  </div>
  <div class="wrap">${assurances()}</div>
</section>

<section class="section" id="services">
  <div class="wrap">
    <div class="section-head">
      <p class="label">Services</p>
      <h2>Choose the care your home needs.</h2>
    </div>
    <ul class="svc-list">
      ${allServices.map((s) => `<li>
        <a class="svc-row" href="${L("services/" + s.slug + "/")}">
          <span class="svc-name">${esc(s.name)}${s.tag ? `<small>${esc(s.tag)}</small>` : ""}</span>
          <span class="svc-desc">${esc(s.short)}</span>
          <span class="svc-price">${s.quote ? "By quote" : `From <b data-from="${s.key}">${money(s.base)}</b>`}</span>
          <svg class="ic svc-arrow" aria-hidden="true"><use href="#i-arrow"/></svg>
        </a>
      </li>`).join("")}
    </ul>
  </div>
</section>

<section class="section standard" id="standard">
  <div class="wrap">
    <div class="standard-head">
      <p class="label label-light">The Nest &amp; Rest standard</p>
      <h2>Five things happen at your door. Every visit.</h2>
      <p>You should never wonder who is in your home, or what they carried in with them. So every visit begins and ends the same way.</p>
    </div>
    <div class="standard-grid">
      <ol class="ritual">
        <li><h3>Ring once, introduce by name</h3><p>You'll know who is coming before we arrive.</p></li>
        <li><h3>Coat onto our own hanger</h3><p>It hangs on our kit, never in your closet.</p></li>
        <li><h3>Street shoes off, house shoes on</h3><p>Your floors only ever meet clean soles.</p></li>
        <li><h3>Apron tied, gloves on</h3><p>One apron for kitchens, one for baths. Never both in one room.</p></li>
        <li><h3>Leave in reverse</h3><p>Gloves off, apron folded, shoes bagged. Nothing left behind.</p></li>
      </ol>
      <div class="wardrobe">
        <figure><img src="${L("assets/ill-coat.png")}" alt="Navy arrival coat with logo badge" width="520" height="520" loading="lazy"><figcaption>The arrival coat</figcaption></figure>
        <figure><img src="${L("assets/ill-shoe.png")}" alt="Black indoor-only house shoe" width="520" height="520" loading="lazy"><figcaption>Indoor-only house shoes</figcaption></figure>
        <figure><img src="${L("assets/ill-apron.png")}" alt="Stone canvas utility apron" width="520" height="520" loading="lazy"><figcaption>Kitchen and bath aprons</figcaption></figure>
        <figure><img src="${L("assets/ill-kit.png")}" alt="Threshold kit: shoe bag, hanger and glove case" width="520" height="520" loading="lazy"><figcaption>The threshold kit</figcaption></figure>
      </div>
    </div>
  </div>
</section>

<section class="section" id="how">
  <div class="wrap">
    <div class="section-head">
      <p class="label">Booking</p>
      <h2>Booked in two minutes. Confirmed by text.</h2>
    </div>
    <ol class="steps-3">
      <li><h3>See your price</h3><p>Your exact price from your home size and the extras you choose. No estimate visit needed.</p></li>
      <li><h3>Choose a time</h3><p>Pick a day and an arrival window, Monday to Saturday.</p></li>
      <li><h3>We confirm</h3><p>${esc(B.ownerFirstName)} confirms by text <span data-reply>${esc(B.replyPromise)}</span>. You pay after the clean.</p></li>
    </ol>
    <div class="center-cta"><a class="btn btn-primary" href="${L("book/")}" data-track="book_click">Book your clean</a></div>
  </div>
</section>

<section class="section plans" id="plans">
  <div class="wrap">
    <div class="section-head">
      <p class="label">Regular care</p>
      <h2>Set it once. Stay ahead.</h2>
      <p class="muted">Recurring visits cost less and keep your home consistently right. Pause or change anytime with 24 hours' notice.</p>
    </div>
    <div class="plan-grid" data-plans data-beds="${example.beds}" data-baths="${example.baths}">
      ${Object.keys(C.frequencies).map((k) => {
        const f = C.frequencies[k];
        return `<div class="plan${f.recommended ? " plan-rec" : ""}" data-plan="${k}">
          ${f.recommended ? '<p class="plan-flag">Recommended</p>' : ""}
          <p class="plan-name">${esc(f.label)}</p>
          <p class="plan-price"><b data-plan-price>${money(examplePrice * (1 - f.discount / 100))}</b><span>per visit</span></p>
          <p class="plan-save">${f.discount ? `Save ${f.discount}%` : "No commitment"}</p>
        </div>`;
      }).join("")}
    </div>
    <p class="fine">Example prices for a ${example.beds}-bedroom, ${example.baths}-bathroom condo, regular clean.</p>
  </div>
</section>

<section class="section founder" id="founder">
  <div class="wrap founder-grid">
    <div class="founder-photo">
      <picture>
        <source type="image/webp" srcset="${L("assets/founder-mann-patel-600.webp")} 600w, ${L("assets/founder-mann-patel.webp")} 848w" sizes="(min-width: 960px) 440px, 82vw">
        <img src="${L("assets/founder-mann-patel.jpg")}" srcset="${L("assets/founder-mann-patel-600.jpg")} 600w, ${L("assets/founder-mann-patel.jpg")} 848w" sizes="(min-width: 960px) 440px, 82vw" alt="${esc(B.owner)}, founder of ${esc(B.name)}" width="848" height="1060" loading="lazy" decoding="async">
      </picture>
    </div>
    <div class="founder-body">
    <figure class="founder-quote">
      <p class="label">From our founder</p>
      <blockquote>
        <p>“Home should be where you rest, not where the chores wait. I'm building Nest &amp; Rest to give that time back to families across Scarborough and North York, one home at a time.</p>
        <p class="founder-promise">Every clean carries my name. If anything isn't right, tell me, and I'll come back and make it right.”</p>
      </blockquote>
      <figcaption><strong data-owner>${esc(B.owner)}</strong><span>Founder &amp; Owner</span></figcaption>
    </figure>
    <div class="founding" data-founding hidden>
      <p class="label">Founding households</p>
      <p class="founding-big"><span data-founding-pct>20</span>% off</p>
      <p data-founding-text>${esc(C.offers.founding.text)}</p>
      <a class="btn btn-primary" href="${L("book/")}" data-track="book_click">Claim your first visit</a>
    </div>
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
      <form class="pc-check" data-pc-form novalidate>
        <label for="pc-home">Check your postal code</label>
        <div class="pc-row"><input id="pc-home" name="pc" autocomplete="postal-code" placeholder="M1B 2K3" maxlength="7"><button class="btn btn-primary" type="submit">Check</button></div>
        <p class="pc-result" data-pc-result aria-live="polite"></p>
      </form>
    </div>
    <ul class="area-list">
      ${C.areas.map((a) => `<li><a href="${L("areas/" + a.slug + "/")}"><span>${esc(a.name)}</span><small>${a.neighbourhoods.length} neighbourhoods</small><svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></a></li>`).join("")}
    </ul>
  </div>
</section>

${homeFaq.html}
${finalCta(L)}
`
}));

/* ---------- booking ---------- */
urls.push(page({
  depth: 1, pathOut: "book/index.html", pageType: "book", minimal: true, noBar: true,
  title: `Book a Clean | ${B.name}`,
  description: "Book your home cleaning online in about two minutes. See your exact price, choose a day and arrival window, and pay after the clean.",
  body: (L) => `
<section class="book">
  <div class="wrap">
    <div class="book-head">
      <h1>Book your clean</h1>
      <ol class="progress" data-progress aria-label="Booking steps">
        <li data-dot="1"><span>Your home</span></li>
        <li data-dot="2"><span>Plan &amp; time</span></li>
        <li data-dot="3"><span>Your details</span></li>
      </ol>
    </div>
    <div class="booker">
      <div class="booker-main">
        <form id="booking-form" class="booking-form" novalidate>
          <fieldset class="step" data-step="1">
            <legend>Your home</legend>
            <div class="field"><label for="f-postal">Postal code of the home</label><input id="f-postal" name="postal" autocomplete="postal-code" autocapitalize="characters" maxlength="7" placeholder="M1B 2K3" required><small class="pc-result" data-pc-booking aria-live="polite"></small></div>
            <div class="field"><span class="field-label" id="svc-label">Service</span>
              <div class="choice-grid" role="radiogroup" aria-labelledby="svc-label">
                ${svcKeys.map((k) => { const s = C.services[k]; return `<label class="choice"><input type="radio" name="service" value="${k}"><span class="choice-body"><strong>${esc(s.name)}</strong><span class="choice-from">from <b data-from="${k}">${money(s.base)}</b></span><span class="choice-desc">${esc(s.short)}</span></span></label>`; }).join("")}
              </div>
              <p class="field-note">Larger home or an office? <a href="${L("services/residence-care/")}">Residence Care</a> and <a href="${L("services/office-cleaning/")}">office cleaning</a> are by quote.</p>
            </div>
            <div class="field"><span class="field-label" id="home-label">Type of home</span>
              <div class="seg" role="radiogroup" aria-labelledby="home-label">
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
          </fieldset>

          <fieldset class="step" data-step="2" hidden>
            <legend>Plan &amp; time</legend>
            <div class="field" data-freq-field><span class="field-label" id="freq-label">How often</span>
              <div class="freq-grid" role="radiogroup" aria-labelledby="freq-label">
                ${Object.keys(C.frequencies).map((k) => { const f = C.frequencies[k]; return `<label class="choice"><input type="radio" name="freq" value="${k}"><span class="choice-body"><strong>${esc(f.label)}</strong><span class="choice-desc">${f.discount ? `Save ${f.discount}%` : "No commitment"}</span></span></label>`; }).join("")}
              </div>
            </div>
            <div class="field"><span class="field-label" id="date-label">Day</span>
              <div class="date-strip" role="radiogroup" aria-labelledby="date-label" data-dates></div>
              <label class="check"><input type="checkbox" id="flex-date" data-flex> I'm flexible: offer me the earliest opening</label>
            </div>
            <div class="field"><span class="field-label" id="slot-label">Arrival window</span>
              <div class="seg" role="radiogroup" aria-labelledby="slot-label">
                ${C.timeSlots.map((t) => `<label><input type="radio" name="slot" value="${t.id}"><span>${esc(t.label)}<small>${esc(t.time)}</small></span></label>`).join("")}
              </div>
            </div>
          </fieldset>

          <fieldset class="step" data-step="3" hidden>
            <legend>Your details</legend>
            <p class="field-note">All fields are required unless marked optional.</p>
            <div class="form-grid">
              <div class="field"><label for="f-name">Full name</label><input id="f-name" name="name" autocomplete="name" required></div>
              <div class="field"><label for="f-phone">Mobile</label><input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="647 555 0123" required></div>
              <div class="field span-2"><label for="f-email">Email <span class="opt">for your confirmation</span></label><input id="f-email" name="email" type="email" inputmode="email" autocomplete="email"></div>
              <div class="field span-2"><label for="f-address">Street address and unit</label><input id="f-address" name="address" autocomplete="street-address" required></div>
              <div class="field span-2"><label for="f-access">Getting in</label><div class="select-wrap"><select id="f-access" name="access"><option>I'll be home</option><option>Concierge or front desk</option><option>Lockbox or key code</option><option>Let's discuss</option></select><svg class="ic" aria-hidden="true"><use href="#i-chev"/></svg></div></div>
              <div class="field span-2"><span class="field-label" id="pets-label">Pets</span>
                <div class="seg" role="radiogroup" aria-labelledby="pets-label">
                  <label><input type="radio" name="pets" value="No pets" checked><span>No pets</span></label>
                  <label><input type="radio" name="pets" value="Dog"><span>Dog</span></label>
                  <label><input type="radio" name="pets" value="Cat or other"><span>Cat / other</span></label>
                </div>
              </div>
              <div class="field span-2"><label for="f-notes">Notes <span class="opt">optional</span></label><textarea id="f-notes" name="notes" rows="3" placeholder="Parking, rooms to focus on, products to avoid"></textarea><small class="field-hint">Please don't type door or lockbox codes here. We'll ask for them by text once your booking is confirmed.</small></div>
              <div class="field span-2"><span class="field-label" id="pref-label">Confirm by</span>
                <div class="seg" role="radiogroup" aria-labelledby="pref-label">
                  <label><input type="radio" name="contactPref" value="Text" checked><span>Text</span></label>
                  <label><input type="radio" name="contactPref" value="Call"><span>Call</span></label>
                  <label><input type="radio" name="contactPref" value="Email"><span>Email</span></label>
                </div>
              </div>
              <label class="check span-2 consent"><input type="checkbox" id="f-consent"> I understand this is a booking request. ${esc(B.name)} will confirm the time and final price with me before the clean.</label>
              <p class="field-note span-2">Free to reschedule or cancel up to ${C.policies.cancelNoticeHours} hours before your arrival window. Nothing to pay until after your clean.</p>
              <p class="privacy-note span-2">We use your details only to arrange and deliver your clean. Your request is sent through FormSubmit to our Google email inbox, which may store data outside Canada. See our <a href="${L("privacy/")}">Privacy Policy</a> and <a href="${L("policies/")}">Service Policies</a>.</p>
              <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
            </div>
            <p class="form-error" data-form-error role="alert" hidden></p>
          </fieldset>

          <div class="step-nav">
            <button type="button" class="btn btn-ghost" data-prev hidden><svg class="ic" aria-hidden="true"><use href="#i-back"/></svg> Back</button>
            <button type="button" class="btn btn-primary btn-grow" data-next>Continue <svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></button>
            <button type="submit" class="btn btn-primary btn-grow" data-submit hidden>Request booking</button>
          </div>
        </form>

        <div class="done" data-done hidden tabindex="-1">
          <p class="label">Request received</p>
          <h2 data-done-title>Thank you.</h2>
          <p data-done-text></p>
          <p class="ref">Reference <strong data-ref></strong></p>
          <dl class="done-list" data-done-list></dl>
          <div class="done-actions">
            <button type="button" class="btn btn-primary" data-ics><svg class="ic" aria-hidden="true"><use href="#i-cal"/></svg> Add to calendar</button>
            <a class="btn btn-ghost" data-sms-booking href="#"><svg class="ic" aria-hidden="true"><use href="#i-sms"/></svg> Text us these details</a>
          </div>
          <div class="done-refer">
            <p><strong>Know someone who'd love this?</strong> When a friend books their first clean, you both get $<span data-referral>${C.offers.referral}</span> off.</p>
            <button type="button" class="btn btn-ghost btn-sm" data-share>Share ${esc(B.name)}</button>
          </div>
        </div>
      </div>

      <aside class="summary" data-summary aria-live="polite">
        <button type="button" class="summary-toggle" data-summary-toggle aria-expanded="false">
          <span class="sum-label" data-sum-label>Your estimate</span>
          <span class="sum-total" data-total>${money(price("regular", 1, 1))}</span>
          <svg class="ic" aria-hidden="true"><use href="#i-chev"/></svg>
        </button>
        <div class="summary-body">
          <dl class="sum-lines" data-lines></dl>
          <p class="sum-fine" data-fine>No payment now. You pay after the clean.</p>
        </div>
      </aside>
    </div>
  </div>
</section>`
}));

/* ---------- service pages ---------- */
function checklistFor(s) {
  const col = s.checklistColumn;
  const rooms = C.checklist.filter((r) => !s.rooms || s.rooms.includes(r.room));
  return rooms.map((r) => {
    const tasks = r.tasks.filter((t) => t[col]);
    if (!tasks.length) return "";
    return `<div class="incl-room"><h3>${esc(r.room)}</h3><ul>${tasks.map((t) => `<li class="${t[col] === "add" ? "is-add" : ""}">${t[col] === "add" ? '<span class="add-tag">Extra</span>' : '<svg class="ic" aria-hidden="true"><use href="#i-check"/></svg>'}<span>${esc(t[0])}</span></li>`).join("")}</ul></div>`;
  }).join("");
}

for (const k of svcKeys) {
  const s = C.services[k];
  const trail = [["Home", ""], [s.name, "services/" + s.slug + "/"]];
  const fq = faqBlock(k);
  const others = allServices.filter((o) => o.key !== k);
  const included = (C.includedAddons[k] || []);
  urls.push(page({
    depth: 2, pathOut: `services/${s.slug}/index.html`, pageType: "service",
    title: `${s.name} in Scarborough & North York | ${B.name}`,
    description: `${s.name} from ${money(s.base)} in Scarborough and North York, Toronto. ${s.short} See your exact price and book online in two minutes.`,
    schemas: [
      { "@context": "https://schema.org", "@type": "Service", name: s.name, serviceType: s.name, description: s.intro, provider: { "@id": SITE + "/#business" }, areaServed: C.areas.map((a) => ({ "@type": "Place", name: a.name + ", Toronto, ON" })), offers: { "@type": "Offer", priceCurrency: C.currency, price: s.base, description: "Starting price for a 1-bedroom, 1-bathroom home" } },
      crumbSchema(trail), fq.schema
    ],
    body: (L) => `
<section class="hero hero-sub">
  <div class="wrap">${breadcrumbs(L, trail)}</div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="label">${s.tag ? esc(s.tag) : "Service"}</p>
      <h1 class="h1-sub">${esc(s.name)}</h1>
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

<section class="section section-stone">
  <div class="wrap split">
    <div class="split-head">
      <p class="label">Ideal for</p>
      <h2>Who books ${esc(s.menuName.toLowerCase())}.</h2>
      <ul class="ticks">${s.idealFor.map((i) => `<li><svg class="ic" aria-hidden="true"><use href="#i-check"/></svg>${esc(i)}</li>`).join("")}</ul>
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
    <ul class="svc-list svc-list-compact">
      ${others.map((o) => `<li><a class="svc-row" href="${L("services/" + o.slug + "/")}"><span class="svc-name">${esc(o.name)}</span><span class="svc-desc">${esc(o.short)}</span><span class="svc-price">${o.quote ? "By quote" : `From <b data-from="${o.key}">${money(o.base)}</b>`}</span><svg class="ic svc-arrow" aria-hidden="true"><use href="#i-arrow"/></svg></a></li>`).join("")}
    </ul>
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
  const field = (f) => {
    const span = f.span === 2 ? " span-2" : "";
    if (f.type === "select") return `<div class="field${span}"><label for="q-${f.id}">${esc(f.label)}</label><div class="select-wrap"><select id="q-${f.id}" name="${esc(f.label)}">${f.options.map((o) => `<option>${esc(o)}</option>`).join("")}</select><svg class="ic" aria-hidden="true"><use href="#i-chev"/></svg></div></div>`;
    return `<div class="field${span}"><label for="q-${f.id}">${esc(f.label)}</label><input id="q-${f.id}" name="${esc(f.label)}"${f.required ? " required data-required" : ""}></div>`;
  };
  urls.push(page({
    depth: 2, pathOut: `services/${q.slug}/index.html`, pageType: "quote",
    title: `${q.name} in Scarborough & North York | ${B.name}`,
    description: `${q.name} in Scarborough and North York, Toronto. ${q.short} Request a free quote online.`,
    schemas: [
      { "@context": "https://schema.org", "@type": "Service", name: q.name, serviceType: q.name, description: q.intro, provider: { "@id": SITE + "/#business" }, areaServed: C.areas.map((a) => ({ "@type": "Place", name: a.name + ", Toronto, ON" })) },
      crumbSchema(trail), fq.schema
    ],
    body: (L) => `
<section class="hero hero-sub">
  <div class="wrap">${breadcrumbs(L, trail)}</div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="label">By quote</p>
      <h1 class="h1-sub">${esc(q.name)}</h1>
      <p class="lede">${esc(q.intro)}</p>
      <ul class="ticks">${q.includes.map((i) => `<li><svg class="ic" aria-hidden="true"><use href="#i-check"/></svg>${esc(i)}</li>`).join("")}</ul>
    </div>
    <div class="hero-pricer">
      <form class="quote-form" data-quote-form data-quote-name="${esc(q.name)}" data-reply-time="${esc(q.replyPromise)}" novalidate>
        <p class="pricer-title">Request a free quote</p>
        <p class="field-note">All fields are required unless marked optional.</p>
        <div class="form-grid">
          <div class="field"><label for="q-name">Your name</label><input id="q-name" name="Name" autocomplete="name" required data-required></div>
          <div class="field"><label for="q-phone">Phone</label><input id="q-phone" name="Phone" type="tel" inputmode="tel" autocomplete="tel" required data-phone></div>
          <div class="field span-2"><label for="q-email">Email <span class="opt">optional</span></label><input id="q-email" name="Email" type="email" inputmode="email" autocomplete="email" data-email></div>
          ${q.fields.map(field).join("")}
          <div class="field"><label for="q-postal">Postal code</label><input id="q-postal" name="Postal code" autocomplete="postal-code" autocapitalize="characters" maxlength="7" placeholder="M1B 2K3" required data-postal></div>
          <div class="field span-2"><label for="q-notes">Anything else? <span class="opt">optional</span></label><textarea id="q-notes" name="Notes" rows="3"></textarea></div>
          <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        </div>
        <p class="form-error" data-q-error role="alert" hidden></p>
        <button type="submit" class="btn btn-primary btn-block">Request a free quote</button>
        <p class="pricer-fine">Reply ${esc(q.replyPromise)} · No obligation</p>
        <p class="privacy-note">We use your details only to prepare your quote. Your request is sent through FormSubmit to our Google email inbox, which may store data outside Canada. See our <a href="${L("privacy/")}">Privacy Policy</a>.</p>
      </form>
      <div class="quote-done" data-quote-done hidden tabindex="-1"><p class="label">Request received</p><h2 data-qd-title>Thank you.</h2><p data-qd-text></p></div>
    </div>
  </div>
</section>
${fq.html}
${finalCta(L, "Prefer to talk it through?", "Call or text and we'll answer your questions directly.")}`
  }));
}

/* ---------- area pages ---------- */
for (const a of C.areas) {
  const trail = [["Home", ""], [a.name, "areas/" + a.slug + "/"]];
  const fq = faqBlock("area", `Cleaning in ${a.name}: questions.`);
  urls.push(page({
    depth: 2, pathOut: `areas/${a.slug}/index.html`, pageType: "area",
    title: `House Cleaning in ${a.name}, Toronto | ${B.name}`,
    description: `House cleaning in ${a.name}: ${a.neighbourhoods.slice(0, 4).join(", ")} and more. See your exact price in seconds, book online in two minutes, pay after your clean.`,
    schemas: [crumbSchema(trail), fq.schema, { "@context": "https://schema.org", "@type": "Service", name: `House cleaning in ${a.name}`, serviceType: "House cleaning", provider: { "@id": SITE + "/#business" }, areaServed: { "@type": "Place", name: a.name + ", Toronto, ON" } }],
    body: (L) => `
<section class="hero hero-sub">
  <div class="wrap">${breadcrumbs(L, trail)}</div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="label">Service area</p>
      <h1 class="h1-sub">House cleaning in ${esc(a.name)}.</h1>
      <p class="lede">${esc(a.intro)}</p>
    </div>
    <div class="hero-pricer">${pricer(L, "regular", "Your price in " + a.name)}</div>
  </div>
</section>

<section class="section section-stone">
  <div class="wrap split">
    <div class="split-head">
      <p class="label">Neighbourhoods</p>
      <h2>Where we clean in ${esc(a.name)}.</h2>
      <form class="pc-check" data-pc-form novalidate>
        <label for="pc-area">Check your postal code</label>
        <div class="pc-row"><input id="pc-area" name="pc" autocomplete="postal-code" placeholder="M1B 2K3" maxlength="7"><button class="btn btn-primary" type="submit">Check</button></div>
        <p class="pc-result" data-pc-result aria-live="polite"></p>
      </form>
    </div>
    <ul class="hood-list">${a.neighbourhoods.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><p class="label">Services</p><h2>Every service, in ${esc(a.name)}.</h2></div>
    <ul class="svc-list">
      ${allServices.map((s) => `<li><a class="svc-row" href="${L("services/" + s.slug + "/")}"><span class="svc-name">${esc(s.name)}</span><span class="svc-desc">${esc(s.short)}</span><span class="svc-price">${s.quote ? "By quote" : `From <b data-from="${s.key}">${money(s.base)}</b>`}</span><svg class="ic svc-arrow" aria-hidden="true"><use href="#i-arrow"/></svg></a></li>`).join("")}
    </ul>
  </div>
</section>

<section class="section section-stone">
  <div class="wrap split">
    <div class="split-head">
      <p class="label">The standard</p>
      <h2>The same careful visit, in every home.</h2>
      <p class="muted">Uniformed, introduced by name, house shoes on at your door. Every visit starts and ends the same way.</p>
      <a class="text-link" href="${L("#standard")}">See our standard <svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></a>
    </div>
    <ul class="area-list">
      ${C.areas.filter((o) => o.slug !== a.slug).map((o) => `<li><a href="${L("areas/" + o.slug + "/")}"><span>Also in ${esc(o.name)}</span><small>${o.neighbourhoods.length} neighbourhoods</small><svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></a></li>`).join("")}
    </ul>
  </div>
</section>
${fq.html}
${finalCta(L, `Book your ${a.name} clean.`)}`
  }));
}

/* ---------- review page ---------- */
urls.push(page({
  depth: 1, pathOut: "review/index.html", pageType: "review",
  title: `Leave a Review | ${B.name}`,
  description: `Tell us how your clean with ${B.name} went.`,
  body: (L) => `
<section class="section review-page">
  <div class="wrap narrow">
    <p class="label">Your review</p>
    <h1 class="h1-sub">How did we do?</h1>
    <p class="lede">Your honest feedback helps us improve and helps neighbours choose with confidence. It takes about a minute.</p>
    <form class="review-form" data-review-form novalidate>
      <fieldset class="stars-field"><legend>Your rating</legend>
        <div class="stars-input">
          ${[5, 4, 3, 2, 1].map((n) => `<input type="radio" id="r${n}" name="rating" value="${n}"><label for="r${n}"><svg class="ic" aria-hidden="true"><use href="#i-star"/></svg><span class="sr-only">${n} star${n > 1 ? "s" : ""}</span></label>`).join("")}
        </div>
      </fieldset>
      <div class="form-grid">
        <div class="field"><label for="rv-name">First name and last initial</label><input id="rv-name" name="name" autocomplete="name" placeholder="e.g. Priya S."></div>
        <div class="field"><label for="rv-area">Neighbourhood <span class="opt">optional</span></label><input id="rv-area" name="area" placeholder="e.g. Agincourt"></div>
        <div class="field span-2"><label for="rv-service">Service</label><div class="select-wrap"><select id="rv-service" name="service">${allServices.map((s) => `<option>${esc(s.name)}</option>`).join("")}</select><svg class="ic" aria-hidden="true"><use href="#i-chev"/></svg></div></div>
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
}));

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
    <p class="label">Last updated ${esc(P.effectiveDate)}</p>
    <h1 class="h1-sub">${esc(h1)}</h1>
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
    { id: "who", h: "Who we are", html: () => `<p>${esc(B.name)} is a home cleaning business owned and operated by ${esc(B.owner)} in ${esc(B.base)}, Ontario. ${esc(B.owner)} is responsible for how we handle personal information and is our privacy contact. You can reach us at ${contactLine}. Our mailing address is available on request.</p>` },
    { id: "collect", h: "What we collect", html: () => `
      <div class="table-scroll"><table>
        <thead><tr><th scope="col">When</th><th scope="col">What we collect</th></tr></thead>
        <tbody>
          <tr><td>You request a booking</td><td>Name, mobile number, email (optional), street address and postal code, home type and size, extras, preferred day and arrival window, how we get in (for example a lockbox or concierge), pets, notes, and how you'd like us to confirm.</td></tr>
          <tr><td>You request a quote</td><td>Name, phone, email (optional), postal code, details about the space, and any notes you add.</td></tr>
          <tr><td>You leave a review</td><td>Rating, first name and last initial, neighbourhood (optional), the service, your review, and the phone or email you booked with so we can match it to your visit.</td></tr>
          <tr><td>You call, text or email us</td><td>Your number or address and what you tell us.</td></tr>
          <tr><td>You pay</td><td>Payment records such as the amount, date and method. We do not store full card numbers.</td></tr>
          <tr><td>You visit the website</td><td>Technical information your browser sends, such as your IP address and browser type, which our website host receives to deliver the site.</td></tr>
        </tbody>
      </table></div>
      <p>We only collect what we need to arrange and deliver your clean. Please don't send us sensitive information we haven't asked for, such as health or financial details.</p>` },
    { id: "use", h: "How we use it", html: () => `<ul>
      <li>To schedule, confirm and deliver your cleaning, and to get into your home as you've arranged.</li>
      <li>To contact you about your booking, quote, a change of plans or a problem with a visit.</li>
      <li>To prepare quotes, keep payment and tax records, and meet our legal obligations.</li>
      <li>To publish your review on our website, using only your first name, last initial, neighbourhood and review, if you've sent us one.</li>
      <li>To improve our service, for example by learning which services clients book.</li>
    </ul><p>We do not sell or rent your personal information, and we don't use it for any purpose not listed here without asking you first.</p>` },
    { id: "consent", h: "Your consent", html: () => `<p>When you send us a booking request, quote request or review, you agree to us using your information for the purposes above. You can withdraw your consent at any time by contacting us, subject to legal or contractual limits. If you do, we may not be able to provide some services.</p>
      <p>We send you messages about your booking or quote, and occasionally ask for a review after a clean. We won't send you promotional emails or texts without your consent, and every message we send will tell you how to opt out. If you ask us to stop, we'll stop within 10 business days, as Canada's Anti-Spam Legislation (CASL) requires.</p>` },
    { id: "sharing", h: "Who we share it with", html: () => `<p>We share personal information only with service providers who help us run the business, and only what they need:</p>
      <ul>
        <li><strong>GitHub</strong> (GitHub, Inc.) hosts this website and keeps standard server logs, including IP addresses, for security.</li>
        <li><strong>Google</strong> provides our email service, where booking, quote and review messages are stored.</li>
        <li><strong>FormSubmit</strong> (formsubmit.co) delivers the website's booking, quote and review forms to our email inbox.</li>
        <li><strong>Your bank or card payment provider</strong> processes payments you make by Interac e-Transfer or card.</li>
      </ul>
      <p>We may also disclose information if the law requires it, for example in response to a valid court order.</p>` },
    { id: "abroad", h: "Storage outside Canada", html: () => `<p>Some of our service providers store or process information outside Canada, including in the United States. While it is there, it is subject to the laws of that country and may be accessed by its courts, law enforcement and national security authorities. We choose established providers and share only what each one needs.</p>` },
    { id: "keep", h: "How long we keep it", html: () => `<ul>
      <li><strong>Access codes and key instructions:</strong> deleted within ${P.accessCodeDeleteDays} days of your last scheduled visit, or sooner if you ask.</li>
      <li><strong>Client and booking records:</strong> kept while you're a client, then for as long as tax law requires (generally six years for financial records).</li>
      <li><strong>Quote requests that don't become bookings:</strong> deleted within 12 months.</li>
      <li><strong>Reviews:</strong> kept while published. Ask us and we'll remove yours.</li>
    </ul>` },
    { id: "safeguards", h: "How we protect it", html: () => `<p>Only the people who need your information to serve you can see it. We protect our email and business accounts with strong passwords and two-step verification, keep access codes separate from other records, and delete information we no longer need. No method of transmission or storage is completely secure, but we work to protect your information.</p>
      <p>If a breach of our safeguards creates a real risk of significant harm to you, we will notify you and the Office of the Privacy Commissioner of Canada as the law requires.</p>` },
    { id: "access", h: "Door and lockbox codes", html: () => `<p>Codes and keys give access to your home, so we treat them with extra care. We don't ask for them on the website. We ask by text or phone only after your booking is confirmed, keep them separate from your name and address, never write them on keys, and delete them within ${P.accessCodeDeleteDays} days of your last scheduled visit. We recommend changing your code from time to time, and after you stop using our service.</p>` },
    { id: "cookies", h: "Cookies and your browser", html: () => `<p>We don't use advertising cookies or tracking pixels. When you start a booking, the details you enter are saved in your own browser so you don't lose them if you leave the page. They stay on your device and are sent to us only when you submit the request. You can clear them at any time through your browser settings.</p>
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
  description: `Booking, pricing, payment, cancellation and satisfaction policies for ${B.name}.`,
  intro: `Clear terms, so there are no surprises. These apply to every clean we do. If anything here is unclear, call or text ${esc(B.phoneDisplay)}.`,
  sections: [
    { id: "area", h: "Where we clean", html: () => `<p>We clean homes and small offices in Scarborough and North York, Toronto. We confirm your postal code before every booking.</p>` },
    { id: "booking", h: "Booking and confirmation", html: () => `<p>A booking made on the website is a request. It's confirmed once we've contacted you by text, call or email and agreed a day and arrival window. We usually reply ${esc(B.replyPromise)}.</p>` },
    { id: "pricing", h: "Prices and estimates", html: () => `<p>The price shown on the website is an estimate based on what you tell us: the service, home type, bedrooms, bathrooms and extras. If your home needs much more or less time than expected, we'll tell you and agree the price with you before we start, never after. Prices are in Canadian dollars.</p>
      ${C.offers.founding.active ? `<p>Founding household offer: ${esc(C.offers.founding.text)} The discount applies to the first visit only and can't be combined with other discounts.</p>` : ""}
      <p>Recurring plans (weekly, every 2 weeks or every 4 weeks) receive the discount shown when you book. You can pause or change your plan with ${P.cancelNoticeHours} hours' notice.</p>` },
    { id: "payment", h: "Payment", html: () => `<p>There's no deposit to book. You pay after your clean by Interac e-Transfer, credit or debit card, or cash.</p>` },
    { id: "changes", h: "Rescheduling and cancellation", html: () => `<p>You can reschedule or cancel at no charge with at least ${P.cancelNoticeHours} hours' notice before your arrival window. With less notice, or if we can't get into your home at the agreed time, a late-cancellation fee of ${esc(P.lateCancelFee)} may apply. We'll always tell you before charging it.</p>
      <p>If we ever need to reschedule because of illness or severe weather, we'll tell you as early as possible and offer the next available time.</p>` },
    { id: "guarantee", h: "Our re-clean guarantee", html: () => `<p>If something isn't right, tell us within ${P.recleanWindowHours} hours of your clean, with photos if you can. We'll come back and re-clean those areas at no charge. If a re-clean doesn't put it right, contact ${esc(B.ownerFirstName)} and we'll agree a fair solution together.</p>` },
    { id: "damage", h: "Breakage and damage", html: () => `<p>We take great care in your home. If something is damaged during a clean, we'll tell you the same day. If you notice something after we leave, please tell us within ${P.damageReportHours} hours, with photos, and we'll work with you on a fair repair or replacement. Please let us know in advance about fragile, valuable or sentimental items you'd rather we didn't handle.</p>` },
    { id: "access", h: "Keys, codes and access", html: () => `<p>If you won't be home, a lockbox, key code or concierge works best. We never copy keys or write codes on them, and we delete access codes within ${P.accessCodeDeleteDays} days of your last scheduled visit. We recommend changing codes from time to time.</p>` },
    { id: "pets", h: "Pets", html: () => `<p>Pets are welcome. Please tell us about them when you book, and keep any anxious or protective pets in a separate room while we work.</p>` },
    { id: "safety", h: "Safety", html: () => `<p>We bring our own supplies and equipment. For everyone's safety, we may decline or stop work in unsafe conditions, such as biohazards, pest infestations, mould, or anything that requires climbing higher than a two-step ladder or moving heavy furniture. We'll always explain why and agree next steps with you.</p>` },
    { id: "contact", h: "Contact", html: () => `<p>Questions about these policies? Contact ${esc(B.owner)} at ${contactLine}. See also our <a href="${linker(1)("privacy/")}">Privacy Policy</a>.</p>` }
  ]
});

/* ---------- 404 ---------- */
if (!PREVIEW_DIR) {
  // 404 is served from any depth, so it uses absolute links built from siteUrl's path.
  const basePath = new URL(SITE + "/").pathname;
  const L404 = (p = "") => basePath + p;
  fs.writeFileSync(path.join(OUT, "404.html"), `<!doctype html>
<html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found | ${esc(B.name)}</title>
<link rel="stylesheet" href="${L404("css/site.css")}"></head>
<body data-page="404"><main class="section"><div class="wrap narrow">
<a class="brand" href="${L404()}"><img src="${L404("assets/logo.png")}" alt="${esc(B.name)}" width="900" height="195" style="height:40px;width:auto"></a>
<h1 class="h1-sub" style="margin-top:48px">This page has moved.</h1>
<p class="lede">Everything you need is a tap away.</p>
<p class="cta-row" style="margin-top:24px"><a class="btn btn-primary" href="${L404("book/")}">Book a clean</a> <a class="btn btn-ghost" href="${L404()}">Go to the home page</a></p>
</div></main></body></html>
`);
}

/* ---------- sitemap + robots ---------- */
if (!PREVIEW_DIR) {
  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
  fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
}

console.log(`Built ${urls.length} pages into ${OUT}`);
