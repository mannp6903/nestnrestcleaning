// Builds the email automation's files from js/config.js and automation/src.
// site-config.json is published with the site; the Google script reads its wording and facts from there.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// The order the source files are joined in for Apps Script, which runs them all in one shared scope.
export const SRC_FILES = ["time.js", "intake.js", "parse.js", "guard.js", "claude.js", "compose.js", "sheet.js", "plan.js", "main.js", "google.js"];

const fillTpl = (t, vals) => String(t || "").replace(/\{(\w+)\}/g, (m, k) => (vals[k] != null ? vals[k] : m));
// The part after cal.com/, cleaned the same way the booking page does it (js/site.js).
const calPath = (link) => String(link || "").trim().replace(/^https?:\/\/(app\.)?cal\.com\//, "").replace(/^\/+|\/+$/g, "");
const calUrl = (link) => (calPath(link) ? "https://cal.com/" + calPath(link) : "");

export function buildSiteConfig(C) {
  const B = C.business, E = C.emails, A = C.automation || {};
  const site = C.siteUrl.replace(/\/$/, "");
  const replyPromises = [...new Set([B.replyPromise, ...Object.values(C.quoteServices).map((q) => q.replyPromise), "within one business day"].filter(Boolean))];
  const seen = new Set();
  const out = {
    business: {
      name: B.name, owner: B.owner, ownerFirstName: B.ownerFirstName, email: B.email, phoneDisplay: B.phoneDisplay,
      areaLabel: C.serviceArea.label, replyPromise: B.replyPromise,
      // How to reach us, worded as in the website's confirmation emails (autoReply in js/site.js).
      contact: B.phone ? (B.whatsapp ? "Call, text or WhatsApp " : "Call or text ") + B.phoneDisplay : "Email " + B.email
    },
    replyPromises,
    links: {
      site, book: site + "/book/", review: site + "/review/", policies: site + "/policies/",
      calendar: calUrl((C.booking || {}).calLink), walkthrough: calUrl(A.walkthroughLink)
    },
    policies: C.policies,
    referral: "$" + C.offers.referral,
    footer: fillTpl(E.footer, { owner: B.owner, address: B.mailingAddress ? ", " + B.mailingAddress : "", phone: B.phoneDisplay, email: B.email, site: site.replace(/^https?:\/\//, "") }),
    emails: { booking: E.booking, bookingCal: E.bookingCal, quote: E.quote, gift: E.gift, subjects: E.subjects },
    automation: A,
    services: Object.entries(C.services).map(([key, s]) => ({ key, name: s.name, intro: s.intro })),
    quoteServices: Object.values(C.quoteServices).map((q) => ({ name: q.name, intro: q.intro, includes: q.includes })),
    extras: C.addons.map((a) => a.name),
    faqs: C.faqs.filter((f) => !seen.has(f.q) && seen.add(f.q)).map((f) => ({ q: f.q, a: f.a }))
  };
  return { version: crypto.createHash("sha1").update(JSON.stringify(out)).digest("hex").slice(0, 8), ...out };
}

export function buildAutomation(C, outDir) {
  const dir = path.join(outDir, "automation");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "site-config.json"), JSON.stringify(buildSiteConfig(C), null, 1) + "\n");
}
