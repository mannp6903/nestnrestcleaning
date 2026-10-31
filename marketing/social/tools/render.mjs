// Renders every slide and story in posts.mjs to JPG with Playwright, in the Nest & Rest brand.
// Usage (from the repo root):
//   node marketing/social/tools/render.mjs              every post, into marketing/social/<MONTH>/feed and /story
//   node marketing/social/tools/render.mjs p02-diwali   one post
//   node marketing/social/tools/render.mjs --reels      the 9:16 frames for the ready-made Reels (then run mkreel.py)
// Fonts: Barlow Condensed (tools/fonts, SIL OFL) for headlines; Plus Jakarta Sans and DM Sans from assets/fonts.
import fs from "fs";
import os from "os";
import path from "path";
import { createRequire } from "module";
import { posts, bonus } from "./posts.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = path.dirname(new URL(import.meta.url).pathname);   // marketing/social/tools
const REPO = path.resolve(ROOT, "../../..");
const MONTH = "2026-11";
const OUT = path.resolve(ROOT, "..", MONTH);
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "nr-social-"));
fs.mkdirSync(path.join(OUT, "feed"), { recursive: true });
fs.mkdirSync(path.join(OUT, "story"), { recursive: true });
fs.mkdirSync(path.join(TMP, "html"), { recursive: true });
const A = (f) => `file://${REPO}/assets/${f}`;
const SITE = "nestnrestcleaning.com";

/* ---------- Art ---------- */
const CHECK = `<svg class="ck" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="24"/><path d="M14 24.5l6.5 6.5L34 17.5" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ARROW = `<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function diya(x, y, s = 1, id = "d") {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="150" cy="-92" r="190" fill="url(#glow)"/>
    <path d="M-124 -18 C -116 58, 112 64, 124 -18 C 146 -22, 166 -34, 184 -54 C 154 -44, 132 -38, 118 -36 C 40 -26, -40 -26, -118 -36 C -126 -34, -128 -26, -124 -18 Z" fill="#D9B67A"/>
    <path d="M-124 -18 C -116 58, 112 64, 124 -18 C 60 -4, -60 -4, -124 -18 Z" fill="#EFD9AE"/>
    <ellipse cx="-2" cy="-28" rx="118" ry="14" fill="#8A6420" opacity=".55"/>
    <g fill="#0A2D5C">${[-80, -40, 0, 40, 80].map((cx) => `<circle cx="${cx}" cy="${14 + Math.abs(cx) * -0.06}" r="7"/>`).join("")}</g>
    <g fill="#23898B">${[-60, -20, 20, 60].map((cx) => `<circle cx="${cx}" cy="${30 - Math.abs(cx) * 0.1}" r="5"/>`).join("")}</g>
    <path d="M168 -196 C 140 -140, 132 -100, 168 -60 C 204 -100, 196 -140, 168 -196 Z" fill="url(#flame)"/>
    <path d="M168 -136 C 156 -110, 154 -90, 168 -70 C 182 -90, 180 -110, 168 -136 Z" fill="#FFF8E6"/>
  </g>`;
}
const DIYA_DEFS = `<defs>
  <radialGradient id="glow"><stop offset="0" stop-color="#F6D58E" stop-opacity=".55"/><stop offset=".45" stop-color="#EFD9AE" stop-opacity=".18"/><stop offset="1" stop-color="#EFD9AE" stop-opacity="0"/></radialGradient>
  <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3C969"/><stop offset=".55" stop-color="#E9A23B"/><stop offset="1" stop-color="#D9822B"/></linearGradient>
</defs>`;
const diyas = (w, h) => `<svg class="diyas" viewBox="0 0 ${w} ${h}" aria-hidden="true">${DIYA_DEFS}
  ${diya(w * 0.2, h * 0.78, 0.82)}${diya(w * 0.5, h * 0.7, 1.05)}${diya(w * 0.8, h * 0.78, 0.82)}
  ${Array.from({ length: 26 }, (_, i) => { const r = (i * 97) % 100 / 100, q = (i * 53) % 100 / 100; return `<circle cx="${(r * w).toFixed(0)}" cy="${(h * 0.08 + q * h * 0.4).toFixed(0)}" r="${(1.5 + (i % 4)).toFixed(1)}" fill="#EFD9AE" opacity="${(0.25 + (i % 5) * 0.12).toFixed(2)}"/>`; }).join("")}
</svg>`;

function flake(x, y, r, o = 0.5, sw = 4) {
  const arms = [0, 60, 120, 180, 240, 300].map((a) => `<g transform="rotate(${a})"><path d="M0 0V${-r}M0 ${-r * 0.55}l${-r * 0.22} ${-r * 0.22}M0 ${-r * 0.55}l${r * 0.22} ${-r * 0.22}M0 ${-r * 0.8}l${-r * 0.14} ${-r * 0.14}M0 ${-r * 0.8}l${r * 0.14} ${-r * 0.14}"/></g>`).join("");
  return `<g transform="translate(${x} ${y})" fill="none" stroke="#F7F3EA" stroke-width="${sw}" stroke-linecap="round" opacity="${o}">${arms}</g>`;
}
const snow = (w, h) => `<svg class="art-svg" viewBox="0 0 ${w} ${h}" aria-hidden="true">
  ${flake(w * 0.78, h * 0.42, 150, 0.9, 7)}${flake(w * 0.36, h * 0.72, 70, 0.55, 5)}${flake(w * 0.12, h * 0.3, 44, 0.35, 4)}${flake(w * 0.6, h * 0.58, 32, 0.3, 3.5)}
  ${Array.from({ length: 40 }, (_, i) => `<circle cx="${((i * 71) % 100) / 100 * w}" cy="${((i * 37) % 100) / 100 * h}" r="${2 + (i % 3)}" fill="#F7F3EA" opacity="${0.15 + (i % 4) * 0.1}"/>`).join("")}
</svg>`;

const clock = (s) => `<svg class="art-svg" viewBox="0 0 400 400" width="${s}" height="${s}" aria-hidden="true">
  <circle cx="200" cy="200" r="170" fill="none" stroke="#F7F3EA" stroke-opacity=".25" stroke-width="10"/>
  ${Array.from({ length: 12 }, (_, i) => `<line x1="200" y1="44" x2="200" y2="${i % 3 ? 62 : 74}" stroke="#F7F3EA" stroke-opacity=".6" stroke-width="${i % 3 ? 5 : 8}" stroke-linecap="round" transform="rotate(${i * 30} 200 200)"/>`).join("")}
  <path d="M ${200 + 140 * Math.cos((-90 - 30) * Math.PI / 180)} ${200 + 140 * Math.sin((-90 - 30) * Math.PI / 180)} A 140 140 0 0 1 ${200 + 140 * Math.cos((-90 + 120) * Math.PI / 180)} ${200 + 140 * Math.sin((-90 + 120) * Math.PI / 180)}" fill="none" stroke="#6FD0CD" stroke-width="22" stroke-linecap="round"/>
  <line x1="200" y1="200" x2="200" y2="96" stroke="#F7F3EA" stroke-width="12" stroke-linecap="round" transform="rotate(-30 200 200)"/>
  <line x1="200" y1="200" x2="200" y2="70" stroke="#EFD9AE" stroke-width="8" stroke-linecap="round"/>
  <circle cx="200" cy="200" r="16" fill="#F7F3EA"/>
</svg>`;

const tag = (s) => `<svg class="art-svg" viewBox="0 0 420 300" width="${s}" aria-hidden="true">
  <g transform="rotate(-8 210 150)">
    <path d="M40 60h250l90 90-90 90H40a20 20 0 0 1-20-20V80a20 20 0 0 1 20-20z" fill="#EFD9AE"/>
    <circle cx="300" cy="150" r="20" fill="#0A2D5C"/>
    <path d="M320 150 C 360 150, 380 110, 410 90" fill="none" stroke="#EFD9AE" stroke-width="6" stroke-linecap="round"/>
    <text x="60" y="140" font-family="Barlow Condensed" font-weight="800" font-size="58" fill="#0A2D5C">SAME PRICE</text>
    <text x="60" y="200" font-family="Barlow Condensed" font-weight="800" font-size="58" fill="#23898B">EVERY DAY</text>
  </g>
</svg>`;

const ICONS = {
  bath: `<svg viewBox="0 0 96 96" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 50h76v6a20 20 0 0 1-20 20H30a20 20 0 0 1-20-20z"/><path d="M22 50V24a9 9 0 0 1 18 0v2"/><path d="M28 76l-4 8M68 76l4 8"/><circle cx="58" cy="36" r="4"/><circle cx="70" cy="28" r="3"/><circle cx="68" cy="42" r="2.5"/></g></svg>`,
  pan: `<svg viewBox="0 0 96 96" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="54" r="26"/><circle cx="40" cy="54" r="15" opacity=".45"/><path d="M64 42l24-14"/><path d="M34 18c-3-4 3-6 0-10M46 18c-3-4 3-6 0-10"/></g></svg>`,
  mop: `<svg viewBox="0 0 96 96" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M64 8L44 60"/><path d="M28 60h32l6 10H22z"/><path d="M26 70l-4 16M34 70l-2 16M44 70v16M54 70l2 16M62 70l4 16"/></g></svg>`,
  sparkle: `<svg viewBox="0 0 96 96" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"><path d="M40 12c3 18 10 25 28 28-18 3-25 10-28 28-3-18-10-25-28-28 18-3 25-10 28-28z"/><path d="M74 58c1.5 8 4.5 11 12 12-7.5 1-10.5 4-12 12-1.5-8-4.5-11-12-12 7.5-1 10.5-4 12-12z"/></g></svg>`
};

/* ---------- Base CSS ---------- */
const BASE = `
@font-face{font-family:"Barlow Condensed";font-weight:600;src:url("${ROOT}/fonts/barlow-condensed-600.woff2") format("woff2")}
@font-face{font-family:"Barlow Condensed";font-weight:700;src:url("${ROOT}/fonts/barlow-condensed-700.woff2") format("woff2")}
@font-face{font-family:"Barlow Condensed";font-weight:800;src:url("${ROOT}/fonts/barlow-condensed-800.woff2") format("woff2")}
@font-face{font-family:"Jakarta";font-weight:200 800;src:url("${REPO}/assets/fonts/plus-jakarta-sans.woff2") format("woff2")}
@font-face{font-family:"DM";font-weight:100 1000;src:url("${REPO}/assets/fonts/dm-sans.woff2") format("woff2")}
:root{--navy:#0A2D5C;--navy2:#13407A;--navy3:#071E3F;--teal:#2FA4A6;--tealdeep:#23898B;--tealink:#1A7476;--teallight:#6FD0CD;--sky:#6FC3E0;--skysoft:#E4F3F8;--sand:#EFD9AE;--sandsoft:#F8EEDA;--ivory:#F7F3EA;--tint:#F0EADC;--muted:#4B5E74;--onnavy:#F7F3EA;--onnavy2:#B4C4D6}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:DM,sans-serif;-webkit-font-smoothing:antialiased}
.frame{position:relative;width:1080px;height:1350px;overflow:hidden;padding:84px 84px 0;display:flex;flex-direction:column}
.frame.story{height:1920px;padding:230px 92px 0}
.tone-ivory{background:var(--ivory);color:var(--navy)}
.tone-navy{background:var(--navy);color:var(--onnavy)}
.tone-sand{background:var(--sand);color:var(--navy)}
.tone-white{background:#fff;color:var(--navy)}
.top{display:flex;justify-content:space-between;align-items:center;min-height:44px}
.kicker{font:700 29px/1.2 DM;letter-spacing:.09em;text-transform:uppercase;color:var(--tealink)}
.tone-navy .kicker{color:var(--teallight)}
.tone-sand .kicker{color:#155F61}
.count{font:700 25px/1 DM;letter-spacing:.04em;padding:10px 18px;border-radius:99px;border:2px solid currentColor;opacity:.55}
.h{font-family:"Barlow Condensed";font-weight:800;text-transform:uppercase;line-height:.93;letter-spacing:.002em;font-size:132px;margin-top:34px}
.h em{font-style:normal;color:var(--tealdeep)}
.tone-navy .h em{color:var(--teallight)}
.tone-sand .h em{color:#155F61}
.h2{font-family:Jakarta;font-weight:800;font-size:84px;line-height:1.04;letter-spacing:-.02em;margin-top:26px}
.sub{font:500 38px/1.36 DM;color:var(--muted);margin-top:30px;max-width:900px}
.tone-navy .sub{color:var(--onnavy2)}
.tone-sand .sub{color:#2E4560}
.footer{position:absolute;left:84px;right:84px;bottom:62px;display:flex;justify-content:space-between;align-items:center}
.footer img{height:60px;display:block}
.footer .url{font:700 27px/1 DM;letter-spacing:.01em}
.story .footer{bottom:250px;left:92px;right:92px}
.swipe{position:absolute;right:84px;bottom:170px;display:inline-flex;align-items:center;gap:12px;font:700 30px/1 DM;padding:20px 30px;border-radius:99px;background:var(--navy);color:var(--ivory)}
.tone-navy .swipe{background:var(--ivory);color:var(--navy)}
/* lists */
.items{list-style:none;margin-top:44px;display:flex;flex-direction:column}
.items li{display:flex;align-items:center;gap:26px;font:500 42px/1.25 DM;padding:24px 0;border-top:2px solid rgba(10,45,92,.1)}
.items.big li{font-size:48px;padding:36px 0;gap:30px}
.items li:last-child{border-bottom:2px solid rgba(10,45,92,.1)}
.tone-navy .items li{border-color:rgba(247,243,234,.16)}
.ck{width:46px;height:46px;flex:none;fill:var(--teal)}
.num{width:58px;height:58px;flex:none;border-radius:50%;background:var(--navy);color:var(--ivory);display:grid;place-items:center;font:800 31px/1 Jakarta}
.tone-navy .num{background:var(--teallight);color:var(--navy)}
.note{margin-top:36px;padding:26px 30px;border-radius:20px;background:var(--sandsoft);font:600 33px/1.35 DM;color:var(--navy)}
.tone-navy .note{background:rgba(247,243,234,.08);color:var(--onnavy)}
.tone-sand .note{background:rgba(255,255,255,.55)}
.from{position:absolute;right:84px;bottom:160px;text-align:right}
.from small{display:block;font:600 27px/1.2 DM;opacity:.75}
.from b{display:block;font:800 104px/1 Jakarta;letter-spacing:-.03em}
.from span{display:block;font:500 27px/1.2 DM;opacity:.75;margin-top:6px}
/* cta */
.t-cta .h{font-size:150px}
.pricebox{margin-top:44px;padding:34px 36px;border-radius:24px;background:rgba(247,243,234,.08);border:2px solid rgba(247,243,234,.18)}
.pricebox .pl{font:600 32px/1.2 DM;color:var(--onnavy2)}
.pricebox .pv{display:flex;align-items:baseline;gap:22px;margin-top:12px}
.pricebox s{font:600 52px/1 Jakarta;color:var(--onnavy2)}
.pricebox b{font:800 112px/1 Jakarta;letter-spacing:-.03em;color:var(--sand)}
.pricebox .pn{font:500 28px/1.3 DM;color:var(--onnavy2);margin-top:10px}
.lines{margin-top:36px;display:flex;flex-direction:column;gap:18px}
.lines p{font:500 36px/1.38 DM;color:var(--onnavy2)}
.lines p:first-child{color:var(--onnavy)}
.urlpill{position:absolute;left:84px;bottom:170px;display:inline-flex;align-items:center;gap:16px;padding:24px 36px;border-radius:99px;background:var(--ivory);color:var(--navy);font:800 38px/1 Jakarta;letter-spacing:-.01em}
.story .urlpill{left:92px;bottom:360px}
/* founder */
.photo{position:absolute;left:0;right:0;top:0;height:770px;background:url("${A("founder-mann-patel.jpg")}") center 28%/cover}
.photo::after{content:"";position:absolute;inset:auto 0 0 0;height:220px;background:linear-gradient(to bottom,rgba(247,243,234,0),var(--ivory))}
.chips{display:flex;flex-wrap:wrap;gap:14px;margin-top:30px}
.chips span{font:700 28px/1 DM;padding:16px 22px;border-radius:99px;background:#fff;border:2px solid rgba(10,45,92,.12)}
/* step */
.bignum{font-family:"Barlow Condensed";font-weight:800;font-size:520px;line-height:.8;color:var(--tealdeep);margin-top:40px;letter-spacing:-.02em}
.t-step .h{font-size:120px;margin-top:40px}
/* poll */
.grid{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:50px}
.opt{background:#fff;border-radius:28px;padding:34px 32px 36px;border:2px solid rgba(10,45,92,.1);display:flex;flex-direction:column;gap:22px;min-height:270px}
.opt .row{display:flex;justify-content:space-between;align-items:center}
.opt .letter{width:76px;height:76px;border-radius:50%;background:var(--navy);color:var(--ivory);display:grid;place-items:center;font:800 42px/1 Jakarta}
.opt svg{width:96px;height:96px;color:var(--tealdeep)}
.opt .lab{font:700 42px/1.12 Jakarta;letter-spacing:-.01em}
/* gift */
.gcard{position:relative;margin:56px auto 0;width:760px;height:440px;border-radius:34px;background:linear-gradient(135deg,#0A2D5C 0%,#13407A 100%);transform:rotate(-4deg);box-shadow:0 40px 80px rgba(10,45,92,.28);overflow:hidden;color:var(--ivory)}
.gcard .rib{position:absolute;top:0;bottom:0;left:590px;width:46px;background:var(--teal)}
.gcard .rib2{position:absolute;left:0;right:0;top:300px;height:46px;background:var(--teal)}
.gcard img{position:absolute;left:44px;top:44px;height:66px}
.gcard .gl{position:absolute;left:46px;bottom:56px;font:700 30px/1 DM;letter-spacing:.1em;text-transform:uppercase;color:var(--teallight)}
.gcard .ga{position:absolute;left:44px;top:170px;font:800 120px/1 Jakarta;letter-spacing:-.03em;color:var(--sand)}
.bow{position:absolute;left:613px;top:150px;transform:translate(-50%,-50%)}
.amts{display:flex;gap:16px;justify-content:center;margin-top:60px}
.amts span{font:800 40px/1 Jakarta;padding:20px 26px;border-radius:18px;background:#fff;color:var(--navy)}
.glines{text-align:center;margin-top:30px;font:600 33px/1.45 DM;color:#2E4560}
/* timeline */
.tl{list-style:none;margin-top:46px;position:relative}
.tl::before{content:"";position:absolute;left:23px;top:24px;bottom:60px;border-left:4px dashed var(--teal)}
.tl li{position:relative;padding-left:84px;padding-bottom:28px}
.tl li::before{content:"";position:absolute;left:8px;top:14px;width:34px;height:34px;border-radius:50%;background:var(--teal);box-shadow:0 0 0 8px var(--ivory)}
.tone-navy .tl li::before{box-shadow:0 0 0 8px var(--navy)}
.tl time{font:800 66px/1 "Barlow Condensed";color:var(--tealdeep);letter-spacing:.01em}
.tl h3{font:800 46px/1.1 Jakarta;letter-spacing:-.01em;margin-top:6px}
.tl p{font:500 32px/1.36 DM;color:var(--muted);margin-top:8px;max-width:820px}
/* prices */
.prices{list-style:none;margin-top:40px}
.prices li{display:flex;justify-content:space-between;align-items:center;gap:30px;padding:26px 0;border-top:2px solid rgba(10,45,92,.1)}
.prices li:last-child{border-bottom:2px solid rgba(10,45,92,.1)}
.prices b{display:block;font:800 40px/1.1 Jakarta;letter-spacing:-.01em}
.prices span{display:block;font:500 29px/1.3 DM;color:var(--muted);margin-top:6px}
.prices em{font:800 74px/1 Jakarta;font-style:normal;letter-spacing:-.03em;color:var(--navy);flex:none}
/* art blocks */
.art{position:absolute;left:0;right:0;bottom:0}
.art-svg{display:block}
.diyas{position:absolute;left:0;right:0;bottom:150px;width:100%;height:520px}
.lmwrap{position:absolute;left:0;right:0;bottom:0;height:360px}
.lmwrap svg{width:100%;height:100%}
.vs{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:56px}
.vs div{border-radius:28px;padding:34px 34px;min-height:270px;display:flex;flex-direction:column;justify-content:space-between}
.vs .r{background:#fff;border:2px solid rgba(10,45,92,.1)}
.vs .d{background:var(--navy);color:var(--ivory)}
.vs h4{font:800 50px/1 "Barlow Condensed";text-transform:uppercase;letter-spacing:.02em}
.vs p{font:500 30px/1.3 DM;opacity:.8;margin-top:12px}
.vs b{font:800 76px/1 Jakarta;letter-spacing:-.03em}
.vs small{font:600 26px/1 DM;opacity:.7;display:block;margin-bottom:8px}
.vs-story div{min-height:330px}.vs-story b{font-size:92px}
.mark{position:absolute;right:-120px;bottom:120px;width:640px;opacity:.10}
`;

const esc = (s) => String(s);
const footer = (tone, url = true) => `<div class="footer"><img src="${A(tone === "navy" ? "logo-white.svg" : "logo.svg")}" alt="">${url ? `<span class="url">${SITE}</span>` : ""}</div>`;
const top = (kicker, i, n) => `<div class="top"><span class="kicker">${kicker || ""}</span>${n > 1 ? `<span class="count">${i}/${n}</span>` : ""}</div>`;

function feedSlide(s, i, n, post) {
  const tone = s.tone || ({ founder: "ivory", diwali: "navy", cta: "navy", poll: "ivory", gift: "sand", timeline: "ivory", step: "ivory", prices: "ivory" }[s.t]) || "ivory";
  let body = "";
  switch (s.t) {
    case "founder":
      body = `<div class="photo"></div><div style="margin-top:640px;position:relative">
        <div class="kicker">${s.kicker}</div>
        <div class="h fit" data-max="260" style="font-size:150px;margin-top:18px">${s.h}</div>
        <div class="h2" style="margin-top:8px;font-size:66px">${s.sub}</div>
        <div class="chips">${s.chips.map((c) => `<span>${c}</span>`).join("")}</div></div>`;
      break;
    case "diwali":
      body = `${top(s.kicker, i, n)}<div class="h fit" data-max="400" style="font-size:140px">${s.h}</div><div class="sub" style="max-width:860px">${s.sub}</div>${diyas(1080, 520)}${s.swipe ? `<span class="swipe" style="bottom:auto;top:84px;display:none"></span>` : ""}`;
      break;
    case "cover":
      body = `${top(s.kicker, i, n)}<div class="h fit" data-max="${s.art === "split" ? 300 : 470}">${s.h}</div><div class="sub">${s.sub}</div>${coverArt(s.art)}${s.swipe && s.art !== "split" ? `<span class="swipe">Swipe ${ARROW}</span>` : ""}`;
      break;
    case "list":
    case "numbered":
      body = `${top(s.kicker, i, n)}<div class="${s.t === "numbered" && s.h.length > 30 ? "h fit" : "h2"}" ${s.t === "numbered" && s.h.length > 30 ? 'data-max="260" style="font-size:118px"' : ""}>${s.h}</div>
        <ul class="items${s.big ? " big" : ""}">${s.items.map((it, k) => `<li>${s.t === "numbered" ? `<span class="num">${(s.start || 1) + k}</span>` : CHECK}<span>${it}</span></li>`).join("")}</ul>
        ${s.note ? `<div class="note" style="margin-top:auto;margin-bottom:${s.price ? 330 : 170}px">${s.note}</div>` : ""}
        ${s.price ? `<div class="from"><small>${s.price.label}</small><b>${s.price.amount}</b><span>${s.price.note}</span></div>` : ""}`;
      break;
    case "statement":
      body = `${top(s.kicker, i, n)}<div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding-bottom:220px"><div class="h fit" data-max="560" style="font-size:140px;margin-top:0">${s.h}</div><div class="sub" style="font-size:42px">${s.sub}</div></div>`;
      break;
    case "step":
      body = `${top("The Nest &amp; Rest standard", i, n)}<div class="bignum">${s.num}</div><div class="h fit" data-max="250">${s.h}</div><div class="sub" style="font-size:42px">${s.sub}</div>`;
      break;
    case "cta":
      body = `${top(s.kicker, i, n)}<div class="h fit" data-max="${s.price ? 300 : 430}">${s.h}</div>
        ${s.price ? `<div class="pricebox"><div class="pl">${s.price.label}</div><div class="pv"><s>${s.price.was}</s><b>${s.price.now}</b></div><div class="pn">${s.price.note}</div></div>` : ""}
        <div class="lines">${s.lines.map((l) => `<p>${l}</p>`).join("")}</div>
        <span class="urlpill">${s.url || SITE} ${ARROW}</span>`;
      break;
    case "poll":
      body = `${top(s.kicker, i, n)}<div class="h fit" data-max="270" style="font-size:120px">${s.h}</div>
        <div class="grid">${s.options.map(([l, lab, ic]) => `<div class="opt"><div class="row"><span class="letter">${l}</span>${ICONS[ic]}</div><div class="lab">${lab}</div></div>`).join("")}</div>
        <div class="note" style="text-align:center;background:var(--navy);color:var(--ivory);font-size:36px">${s.note}</div>`;
      break;
    case "gift":
      body = `${top(s.kicker, i, n)}<div class="h fit" data-max="270" style="font-size:132px">${s.h}</div>
        <div class="gcard"><img src="${A("logo-white.svg")}" alt=""><div class="ga">$150</div><div class="gl">Gift card · never expires</div><div class="rib"></div>
        <svg class="bow" width="150" height="110" viewBox="0 0 150 110"><path d="M75 55C50 20 10 15 12 40s40 25 63 15zM75 55c25-35 65-40 63-15s-40 25-63 15z" fill="#EFD9AE"/><circle cx="75" cy="55" r="14" fill="#D9B67A"/></svg></div>
        <div class="amts">${s.amounts.map((a) => `<span>${a}</span>`).join("")}</div>
        <div class="glines">${s.lines.join("<br>")}</div>`;
      break;
    case "timeline":
      body = `${top(s.kicker, i, n)}<ol class="tl">${s.items.map(([t, h, p]) => `<li><time>${t}</time><h3>${h}</h3><p>${p}</p></li>`).join("")}</ol>${s.note ? `<div class="note" style="margin-top:auto;margin-bottom:170px">${s.note}</div>` : ""}`;
      break;
    case "prices":
      body = `${top(s.kicker, i, n)}<div class="h2">${s.h}</div><ul class="prices">${s.rows.map(([b, sp, p]) => `<li><div><b>${b}</b><span>${sp}</span></div><em>${p}</em></li>`).join("")}</ul><div class="note">${s.note}</div>`;
      break;
  }
  return `<div class="frame tone-${tone} t-${s.t}">${body}${s.t === "cta" ? `<img class="mark" src="${A("logo-mark-white.svg")}" alt="" style="opacity:.07;bottom:170px;right:-150px;width:600px">` : ""}${footer(tone, s.t !== "cta")}</div>`;
}

function coverArt(kind) {
  switch (kind) {
    case "split":
      return `<div class="vs"><div class="r"><div><h4>Regular</h4><p>The reset that keeps a lived-in home easy.</p></div><div><small>From</small><b>$145</b></div></div><div class="d"><div><h4>Deep</h4><p>Everything in regular, plus the build-up.</p></div><div><small>From</small><b>$235</b></div></div></div>`;
    case "snow":
      return `<div class="art" style="top:640px;bottom:150px">${snow(1080, 560)}</div>`;
    case "house":
      return `<img class="mark" src="${A("logo-mark-white.svg")}" alt="">`;
    case "clock":
      return `<div style="position:absolute;right:70px;bottom:250px">${clock(400)}</div>`;
    case "tag":
      return `<div style="position:absolute;left:84px;bottom:260px">${tag(560)}</div>`;
    default:
      return "";
  }
}

function storySlide(s, post) {
  const tone = s.t === "diwali" || s.t === "snow" || s.t === "statement" || s.t === "timeline" ? "navy" : s.t === "gift" ? "sand" : "ivory";
  let body = "";
  switch (s.t) {
    case "founder":
      body = `<div class="photo" style="height:1020px;background-position:center 22%"></div>
        <div style="margin-top:700px;position:relative"><div class="h fit" data-max="200" style="font-size:170px">${s.h}</div>
        <div class="h2" style="font-size:72px;margin-top:10px">${s.sub}</div>
        <div class="sub" style="font-size:36px;margin-top:26px">${s.line}</div>
        <div class="note" style="background:var(--navy);color:var(--ivory);font-size:34px;margin-top:30px">${s.offer}</div></div>`;
      break;
    case "diwali":
      body = `<div class="kicker">${s.kicker}</div><div class="h fit" data-max="520" style="font-size:${s.greeting ? 230 : 170}px">${s.h}</div>
        ${s.sub ? `<div class="sub" style="font-size:42px">${s.sub}</div>` : ""}
        ${s.offer ? `<div class="note" style="margin-top:40px;font-size:38px;background:var(--sand);color:var(--navy)">${s.offer}</div>` : ""}
        <div class="sub" style="font-size:36px;margin-top:26px;color:var(--teallight)">${s.line}</div>
        <div style="position:relative;margin:auto -92px 340px;height:540px">${diyas(1080, 500).replace('<svg class="diyas"', '<svg style="width:100%;height:100%;display:block"')}</div>`;
      break;
    case "hook":
      body = `<div class="kicker" style="opacity:.0">.</div><div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding-bottom:420px">
        <div class="h fit" data-max="800" style="font-size:210px">${s.h}</div><div class="h2" style="font-size:64px;color:var(--tealdeep);margin-top:40px">${s.line}</div></div>`;
      break;
    case "versus":
      body = `<div class="h" style="font-size:180px;margin-top:10px">${s.h}</div>${coverArt("split").replace('class="vs"', 'class="vs vs-story" style="margin-top:70px"')}<div class="sub" style="font-size:38px;margin-top:44px">${s.sub}</div>`;
      break;
    case "snow":
      body = `<div class="art" style="top:1010px;bottom:340px">${snow(1080, 570)}</div><div class="h fit" data-max="520" style="font-size:200px;margin-top:40px">${s.h}</div><div class="sub" style="font-size:46px">${s.sub}</div>`;
      break;
    case "poll":
      body = `<div class="h fit" data-max="380" style="font-size:170px;margin-top:20px">${s.h}</div><div class="grid" style="margin-top:60px">${s.options.map(([l, lab, ic]) => `<div class="opt" style="min-height:300px"><div class="row"><span class="letter">${l}</span>${ICONS[ic]}</div><div class="lab">${lab}</div></div>`).join("")}</div>
        <div class="note" style="margin-top:40px;text-align:center;border:3px dashed rgba(10,45,92,.25);background:transparent;color:var(--muted)">${s.line}</div>`;
      break;
    case "list":
      body = `<div class="h" style="font-size:190px;margin-top:20px">${s.h}</div><ul class="items" style="margin-top:50px">${s.items.map((it, k) => `<li style="font-size:46px;padding:30px 0"><span class="num" style="width:70px;height:70px;font-size:36px">${k + 1}</span><span>${it}</span></li>`).join("")}</ul><div class="note" style="margin-top:40px;font-size:38px;background:var(--navy);color:var(--ivory)">${s.line}</div>`;
      break;
    case "gift":
      body = `<div class="h fit" data-max="420" style="font-size:180px;margin-top:20px">${s.h}</div>
        <div class="gcard" style="margin-top:90px"><img src="${A("logo-white.svg")}" alt=""><div class="ga">$150</div><div class="gl">Gift card · never expires</div><div class="rib"></div>
        <svg class="bow" width="150" height="110" viewBox="0 0 150 110"><path d="M75 55C50 20 10 15 12 40s40 25 63 15zM75 55c25-35 65-40 63-15s-40 25-63 15z" fill="#EFD9AE"/><circle cx="75" cy="55" r="14" fill="#D9B67A"/></svg></div>
        <div class="amts" style="margin-top:90px">${s.amounts.map((a) => `<span style="font-size:46px">${a}</span>`).join("")}</div><div class="glines" style="font-size:38px;margin-top:40px">${s.line}</div>`;
      break;
    case "timeline":
      body = `<div class="h" style="font-size:170px;margin-top:10px">${s.h}</div><ol class="tl tl-story" style="margin-top:56px">${s.items.map(([t, h]) => `<li style="padding-bottom:34px"><time style="font-size:84px;color:var(--teallight)">${t}</time><h3 style="font-size:52px;color:var(--ivory)">${h}</h3></li>`).join("")}</ol><div class="sub" style="font-size:36px;margin-top:10px">${s.line}</div>`;
      break;
    case "statement":
      body = `<div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding-bottom:520px"><div class="h fit" data-max="760" style="font-size:230px">${s.h}</div><div class="sub" style="font-size:50px">${s.sub}</div><div class="sub" style="font-size:40px;color:var(--teallight);margin-top:40px">${s.line}</div></div>`;
      break;
  }
  const tl = s.t === "timeline" ? "" : "";
  return `<div class="frame story tone-${tone} s-${s.t}">${body}${tl}${footer(tone)}</div>`;
}

// Shrink any .fit headline until it fits its data-max height.
const FIT = `<script>
document.fonts.ready.then(()=>{document.querySelectorAll('.fit').forEach(el=>{const max=+el.dataset.max;let fs=parseFloat(getComputedStyle(el).fontSize);while(el.offsetHeight>max&&fs>48){fs-=3;el.style.fontSize=fs+'px'}});document.body.dataset.ready=1});
</script>`;
const page = (inner) => `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}</style></head><body>${inner}${FIT}</body></html>`;

/* ---------- Reel frames (9:16) ---------- */
const REELS = {
  "p03-six-spots": { tone: "ivory", frames: [
    { hook: true, h: "6 spots your weekly clean <em>skips.</em>", sub: "Number 6 is in every bathroom." },
    { num: 1, h: "Tops of door frames", sub: "Dust settles where nobody looks." },
    { num: 2, h: "Switches and door handles", sub: "The most-touched spots in your home." },
    { num: 3, h: "Baseboards behind doors", sub: "The door hides them every day." },
    { num: 4, h: "Vents and window sills", sub: "Dust and grit collect in the slats." },
    { num: 5, h: "Under and behind the couch", sub: "Out of sight, never out of dust." },
    { num: 6, h: "Tap bases and fixtures", sub: "Limescale builds where the tap meets the counter." },
    { end: true, h: "All six, in every <em>deep clean.</em>", sub: "First visit: 20% off for our first 50 households.", url: true } ] },
  "p07-five-things": { tone: "navy", frames: [
    { hook: true, h: "Five things happen at <em>every visit.</em>", sub: "Same order, every home, every time." },
    { num: 1, h: "Introduced by name", sub: "You'll know who's coming before I arrive." },
    { num: 2, h: "Street shoes off, house shoes on", sub: "Your floors only meet clean soles." },
    { num: 3, h: "Your priorities first", sub: "A quick word on what matters most today." },
    { num: 4, h: "Separate cloths for kitchen and bath", sub: "What cleans a bathroom never touches your kitchen." },
    { num: 5, h: "A final check before I leave", sub: "Every room, against the checklist." },
    { end: true, h: "Missed something? I come back, <em>free.</em>", sub: "Report it within 24 hours of your clean.", url: true } ] }
};
function reelFrame(f, tone) {
  const body = f.num
    ? `<div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding-bottom:380px"><div class="bignum" style="font-size:600px;margin:0;${tone === "navy" ? "color:var(--teallight)" : ""}">${f.num}</div><div class="h fit" data-max="420" style="font-size:150px;margin-top:30px">${f.h}</div><div class="sub" style="font-size:48px">${f.sub}</div></div>`
    : `<div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding-bottom:420px"><div class="h fit" data-max="720" style="font-size:210px;margin:0">${f.h}</div><div class="sub" style="font-size:52px;margin-top:40px">${f.sub}</div>${f.url ? `<span class="urlpill" style="position:static;margin-top:60px;align-self:flex-start;font-size:44px;${tone === "ivory" ? "background:var(--navy);color:var(--ivory)" : ""}">${SITE} ${ARROW}</span>` : ""}</div>`;
  return `<div class="frame story tone-${tone}">${body}${footer(tone)}</div>`;
}
if (process.argv.includes("--reels")) {
  const browser = await chromium.launch();
  const pg = await (await browser.newContext()).newPage();
  await pg.setViewportSize({ width: 1080, height: 1920 });
  for (const [id, r] of Object.entries(REELS)) {
    const dir = path.join(TMP, "reels", id); fs.mkdirSync(dir, { recursive: true });
    for (let i = 0; i < r.frames.length; i++) {
      const hp = path.join(dir, `f${i}.html`);
      fs.writeFileSync(hp, page(reelFrame(r.frames[i], r.tone)));
      await pg.goto("file://" + hp); await pg.waitForSelector("body[data-ready]"); await pg.waitForTimeout(60);
      await pg.screenshot({ path: path.join(dir, `f${i}.png`) });
    }
    console.log("reel frames", id, r.frames.length, "in", dir);
  }
  await browser.close();
  process.exit(0);
}

/* ---------- Render ---------- */
const only = process.argv.slice(2);
const browser = await chromium.launch();
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
const pg = await ctx.newPage();
const manifest = [];
async function shot(html, file, w, h) {
  const hp = path.join(TMP, "html", path.basename(file).replace(/\.jpg$/, ".html"));
  fs.writeFileSync(hp, page(html));
  await pg.setViewportSize({ width: w, height: h });
  await pg.goto("file://" + hp);
  await pg.waitForSelector("body[data-ready]");
  await pg.waitForTimeout(80);
  // Report overflow: any element (other than art) that pokes outside the frame or under the footer.
  const issues = await pg.evaluate(() => {
    const out = [], fr = document.querySelector(".frame").getBoundingClientRect(), foot = document.querySelector(".footer").getBoundingClientRect();
    document.querySelectorAll(".frame > *:not(.footer):not(.art):not(.diyas):not(.photo):not(.mark):not(.swipe):not(.urlpill):not(.from):not(div[style*='position:absolute'])").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom > foot.top - 10 && r.height > 0) out.push(el.className + " bottom " + Math.round(r.bottom) + " > footer " + Math.round(foot.top));
      if (r.right > fr.right + 1) out.push(el.className + " overflows right");
    });
    return out;
  });
  await pg.screenshot({ path: file, type: "jpeg", quality: 90 });
  if (issues.length) console.log("  ! " + path.basename(file) + ": " + issues.join("; "));
}
for (const post of posts) {
  if (only.length && !only.includes(post.id)) continue;
  const files = [];
  for (let i = 0; i < post.slides.length; i++) {
    const f = path.join(OUT, "feed", `${post.id}-${i + 1}.jpg`);
    await shot(feedSlide(post.slides[i], i + 1, post.slides.length, post), f, 1080, 1350);
    files.push(f);
  }
  const sf = path.join(OUT, "story", `${post.id}-story.jpg`);
  await shot(storySlide(post.story, post), sf, 1080, 1920);
  manifest.push({ id: post.id, feed: files.map((f) => path.basename(f)), story: path.basename(sf) });
  console.log("rendered", post.id, files.length, "+ story");
}
if (!only.length || only.includes(bonus.id)) {
  const sf = path.join(OUT, "story", `${bonus.id}-story.jpg`);
  await shot(storySlide(bonus.story, bonus), sf, 1080, 1920);
  console.log("rendered", bonus.id);
}
await browser.close();
