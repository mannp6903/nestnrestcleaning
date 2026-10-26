/* Checks Claude's personal paragraph before it goes in an email. Prices, dates, times, links, contact details and
   promises come only from the fixed wording, so a paragraph that mentions any of them is thrown away. */

var GUARD_MAX_WORDS = 90;
// Anything a mail app might turn into a link: web addresses, bare domains like bit.ly/x, and markup.
var LINK_PATTERN = /https?:|www\.|[<>]|\b[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)*\.[a-z]{2,}\b/i;
var PHONE_PATTERN = /\d{3}[\s.)-]*\d{3}[\s.-]?\d{4}/;
var GUARD_RULES = [
  [/\$/, "a price ($)"],
  [/%/, "a percent"],
  [/\b\d{1,2}(:\d{2})?\s?(am|pm|a\.m\.|p\.m\.)/i, "a time"],
  [/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?\b/i, "a day of the week"],
  [/\b(january|february|march|april|june|july|august|september|october|november|december)\b|\bmay\s+\d/i, "a month"],
  [/[^\s@]+@[^\s@]+\.[^\s@]+/, "an email address"],
  [LINK_PATTERN, "a link"],
  [PHONE_PATTERN, "a phone number"],
  [/\b(discount|coupon|promo|credit|refund|guarantee)/i, "a promise word"],
  [/\b(tomorrow|tonight|weekend|next week|this (morning|afternoon|evening))\b/i, "a day"],
  // Claims the business doesn't make (js/config.js badges are off). Saying them would be misleading advertising.
  [/\b(insur\w*|bonded|licen[cs]ed|certified|accredited|vetted|background[- ]?check\w*|police[- ]?check\w*|eco[- ]?friendly|non[- ]?toxic|organic|chemical[- ]?free|hypoallergenic|award)/i, "a claim we don't make"]
];

function looksLikeLink(text) { return LINK_PATTERN.test(String(text || "")); }

function checkParagraph(text) {
  var t = String(text || "").trim(), reasons = [];
  if (!t) return { ok: false, reasons: ["it was empty"] };
  if (t.split(/\s+/).length > GUARD_MAX_WORDS) reasons.push("over " + GUARD_MAX_WORDS + " words");
  GUARD_RULES.forEach(function (r) { if (r[0].test(t)) reasons.push("it mentioned " + r[1]); });
  return { ok: reasons.length === 0, reasons: reasons };
}
