/* Checks Claude's personal paragraph before it goes in an email. Prices, dates, times, links, contact details and
   promises come only from the fixed wording, so a paragraph that mentions any of them is thrown away. */

var GUARD_MAX_WORDS = 90;
var GUARD_RULES = [
  [/\$/, "a price ($)"],
  [/%/, "a percent"],
  [/\b\d{1,2}(:\d{2})?\s?(am|pm|a\.m\.|p\.m\.)/i, "a time"],
  [/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?\b/i, "a day of the week"],
  [/\b(january|february|march|april|june|july|august|september|october|november|december)\b|\bmay\s+\d/i, "a month"],
  [/[^\s@]+@[^\s@]+\.[^\s@]+/, "an email address"],
  [/https?:\/\/|www\.|\b[\w-]+\.(com|ca|co|org|net|io)\b/i, "a link"],
  [/\d{3}[\s.)-]*\d{3}[\s.-]?\d{4}/, "a phone number"],
  [/\b(discount|coupon|promo|credit|refund|guarantee)/i, "a promise word"]
];

function checkParagraph(text) {
  var t = String(text || "").trim(), reasons = [];
  if (!t) return { ok: false, reasons: ["it was empty"] };
  if (t.split(/\s+/).length > GUARD_MAX_WORDS) reasons.push("over " + GUARD_MAX_WORDS + " words");
  GUARD_RULES.forEach(function (r) { if (r[0].test(t)) reasons.push("it mentioned " + r[1]); });
  return { ok: reasons.length === 0, reasons: reasons };
}
