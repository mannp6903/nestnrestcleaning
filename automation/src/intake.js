/* Form requests from the website: check them, write Mann's new-request email and the client's confirmation,
   and queue bookings and quotes for the personal emails. Every word a client receives comes from the site's own
   wording; a request only fills in short, link-free values. */

var INTAKE_FORMS = ["booking", "quote", "gift", "review", "textPrice"];
var RATE_LIMITS = { all: 30, perEmail: 3, perEmail6h: 5, perDay: 60 };
// Each form's subject line, as js/site.js writes it. Anything else isn't from our website.
var SUBJECT_PREFIX = { booking: "New booking ", quote: "New quote request: ", gift: "New gift card request ", review: "New review: ", textPrice: "Text this price: " };
var INTAKE_MAX = { fields: 40, value: 2000, subject: 200 };
// The confirmation templates each form may use, and the longest value each may fill in.
var CONFIRM_TEMPLATES = { booking: ["booking"], quote: ["quote"], gift: ["gift"] };
var CONFIRM_MAX = { name: 60, ref: 12, summary: 400, items: 800, reply: 80 };

function checkRequest(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { ok: false, error: "Not a form request" };
  if (INTAKE_FORMS.indexOf(payload._form) === -1) return { ok: false, error: "Unknown form: " + String(payload._form).slice(0, 40) };
  if (typeof payload._subject !== "string" || payload._subject.length > INTAKE_MAX.subject || payload._subject.indexOf(SUBJECT_PREFIX[payload._form]) !== 0 ||
    /[\u0000-\u001f]/.test(payload._subject)) return { ok: false, error: "Missing or unexpected subject" };
  var keys = Object.keys(payload).filter(function (k) { return k.charAt(0) !== "_"; });
  if (keys.length > INTAKE_MAX.fields) return { ok: false, error: "Too many fields" };
  for (var i = 0; i < keys.length; i++) {
    var v = payload[keys[i]];
    if (v != null && typeof v === "object") return { ok: false, error: "Field " + keys[i].slice(0, 40) + " isn't text" };
    if (String(v == null ? "" : v).length > INTAKE_MAX.value) return { ok: false, error: "Field " + keys[i].slice(0, 40) + " is too long" };
  }
  return { ok: true, spam: !!(payload._honey && String(payload._honey).trim()) };
}

function requestFields(payload) {
  var out = {};
  Object.keys(payload).forEach(function (k) {
    if (k.charAt(0) === "_" || payload[k] == null) return;
    out[k] = String(payload[k]).trim();
  });
  return out;
}

function replyToOf(payload) {
  // Strict on purpose: these addresses also go into Gmail searches.
  var e = String(payload._replyto || "").trim();
  return e.length <= 254 && /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(e) ? e : "";
}

function rateLimitKeys(payload, now) {
  var d = new Date(now), pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var hour = d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + pad(d.getUTCHours());
  var keys = ["rl:all:" + hour], email = replyToOf(payload).toLowerCase();
  if (email) keys.push("rl:email:" + email + ":" + hour, "rl:email6h:" + email + ":" + hour.slice(0, 8) + pad(Math.floor(d.getUTCHours() / 6)));
  return keys;
}

// Hourly overall, hourly per address, and per address over six hours, so no one can be sent a stream of confirmations.
function isOverLimit(counts) {
  return (counts[0] || 0) >= RATE_LIMITS.all || (counts[1] || 0) >= RATE_LIMITS.perEmail || (counts[2] || 0) >= RATE_LIMITS.perEmail6h;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Plain paragraphs to simple email HTML: escaped, links clickable, line breaks kept, the footer small and grey.
function emailHtml(paragraphs, footer) {
  var p = function (t) { return escapeHtml(t).replace(/https:\/\/[^\s<]+[^\s<.,;:!?)]/g, function (u) { return '<a href="' + u + '">' + u + "</a>"; }).replace(/\n/g, "<br>"); };
  return paragraphs.map(function (t) { return "<p>" + p(t) + "</p>"; }).join("\n") + (footer ? '\n<p style="color:#666;font-size:12px">' + p(footer) + "</p>" : "");
}

function notificationEmail(payload, site, note) {
  var fields = requestFields(payload), labels = Object.keys(fields);
  var rows = labels.map(function (k) { return '<tr><th align="left" valign="top">' + escapeHtml(k) + "</th><td>" + escapeHtml(fields[k]).replace(/\n/g, "<br>") + "</td></tr>"; });
  var lines = labels.map(function (k) { return k + ": " + fields[k]; });
  return {
    to: site.business.email,
    subject: payload._subject.trim(),
    text: (note ? note + "\n\n" : "") + lines.join("\n"),
    html: (note ? "<p><strong>" + escapeHtml(note) + "</strong></p>\n" : "") + '<table cellpadding="4">' + rows.join("") + "</table>",
    replyTo: replyToOf(payload),
    name: "Nest & Rest website"
  };
}

// Fills {key} from vals and leaves unknown keys as they are, like fillTpl in js/site.js.
function fillTemplate(t, vals) {
  return String(t || "").replace(/\{(\w+)\}/g, function (m, k) { return vals[k] != null ? vals[k] : m; });
}

function confirmationEmail(payload, site) {
  var allowed = CONFIRM_TEMPLATES[payload._form], to = replyToOf(payload);
  if (!allowed || !to) return { email: null, problem: "" };
  var fail = function (why) { return { email: null, problem: "Confirmation not sent: " + why }; };
  var c = payload._confirm;
  if (!c || typeof c !== "object" || !c.vals || typeof c.vals !== "object") return fail("the website didn't include its details.");
  if (allowed.indexOf(c.tpl) === -1) return fail("the website asked for the wrong confirmation.");
  var vals = {};
  for (var k in CONFIRM_MAX) {
    var v = c.vals[k] == null ? "" : String(c.vals[k]).trim();
    if (v.length > CONFIRM_MAX[k]) return fail("the " + k + " was too long.");
    if (looksLikeLink(v) || PHONE_PATTERN.test(v)) return fail("the " + k + " contained a link, markup or a phone number.");
    vals[k] = v;
  }
  var tpl = site.emails[c.tpl];
  if (/\{ref\}/.test(tpl) && !/^(NR|GIFT)-[A-Z0-9]{4}$/.test(vals.ref)) return fail("the reference looked wrong.");
  vals.reply = site.replyPromises.indexOf(vals.reply) > -1 ? vals.reply : site.business.replyPromise;
  vals.contact = site.business.contact;
  vals.notice = site.policies.cancelNoticeHours;
  vals.lateFee = site.policies.lateCancelFee;
  vals.terms = site.links.policies;
  vals.phone = site.business.phoneDisplay;
  var body = fillTemplate(tpl, vals), gap = /\{(\w+)\}/.exec(body);
  if (gap) return fail("the wording has a gap ({" + gap[1] + "}).");
  return {
    email: {
      to: to,
      subject: fillTemplate(site.emails.subjects[c.tpl], { ref: vals.ref }),
      text: body + "\n\n" + site.footer,
      html: emailHtml([body], site.footer),
      replyTo: "",
      name: site.automation.senderName
    },
    problem: ""
  };
}

// Fields from a request that end up in personal emails. Each must be short and link-free, and the service one of ours,
// so the public web address can't be used to send a stranger someone else's words.
var LEAD_TEXT_FIELDS = ["Name", "Referred by", "Date", "Arrival window"];
var LEAD_TEXT_MAX = 80;

function leadProblem(payload, site) {
  if (payload._form !== "booking" && payload._form !== "quote") return "";
  var f = requestFields(payload), why = "";
  var known = site.services.map(function (s) { return s.name; })
    .concat(site.quoteServices.map(function (q) { return q.name; }), Object.keys(site.automation.quoteForms).filter(function (k) { return k !== "default"; }));
  if (known.indexOf(f.Service) === -1) why = "the service wasn't one of ours";
  LEAD_TEXT_FIELDS.forEach(function (k) {
    var v = f[k] || "";
    if (why) return;
    if (v.length > LEAD_TEXT_MAX) why = "the " + k.toLowerCase() + " was too long";
    else if (looksLikeLink(v)) why = "the " + k.toLowerCase() + " contained a link or markup";
  });
  return why ? "Not added to the client list: " + why + "." : "";
}

// Bookings and quotes wait in the Incoming tab for the next run. Notes and the address stay in Mann's email only.
// Personal emails only ever go to the checked reply-to address, which the hourly limits also count.
function incomingRecord(payload, receivedAt, notice) {
  if (payload._form !== "booking" && payload._form !== "quote") return null;
  var fields = requestFields(payload), hasNotes = notesFrom(fields) !== "";
  delete fields.Notes;
  delete fields.Address;
  fields.email = replyToOf(payload);
  return { receivedAt: new Date(receivedAt).toISOString(), form: payload._form, subject: payload._subject.trim(), fields: fields, hasNotes: hasNotes, messageId: notice.messageId, threadId: notice.threadId };
}
