/* Nest & Rest Cleaning: every website form, saved to this Google Sheet.
   Paste this whole file into the sheet's Extensions > Apps Script, run setup once, then deploy it as a web app.
   Step-by-step: docs/google-sheet-setup.md in the website's repository.
   The website sends one JSON request per attempt: { form, reference, attempt, honey, email, fields }.
   The answer is { ok: true, reference, duplicate } once the row is saved, or { ok: false, error }. */

var TABS = { booking: "Bookings", quote: "Quotes", gift: "Gifts", review: "Reviews", pricetext: "Price texts" };

// The Status dropdown for each tab. New rows start as "Received".
var STATUSES = {
  "Bookings": ["Received", "Confirmed", "Other time offered", "Declined", "Cancelled", "Done"],
  "Quotes": ["Received", "Quoted", "Won", "Lost"],
  "Gifts": ["Received", "Paid", "Sent", "Redeemed"],
  "Reviews": ["Received", "Published", "Not published"],
  "Price texts": ["Received", "Texted"]
};

// Columns for Mann to fill in himself, right after Status.
var OWNER_COLUMNS = { "Bookings": ["Confirmed time", "Final price"] };

var SYSTEM_COLUMNS = ["Attempt", "Alert email", "Receipt email"];

// The labels each website form sends today, so a new sheet starts with tidy columns. Any other label gets a column of its own at the end.
var KNOWN_FIELDS = {
  booking: ["Service", "Home", "Home notes", "Extras", "Included in this service", "Plan", "Preferred day", "Preferred arrival window",
    "Estimate, first visit", "Estimate, repeat visits", "HST", "Price to confirm", "Estimated time", "Pricing version",
    "Name", "Phone", "Email", "Address", "Postal code", "Getting in", "Pets", "Products", "Referred by", "Notes", "Confirm by"],
  quote: ["Service", "Name", "Phone", "Email", "Postal code", "Notes"],
  gift: ["Amount", "Send", "Your name", "Your phone", "Email", "Gift for", "Their postal code", "Their email", "Message"],
  review: ["Rating", "Name", "Neighbourhood", "Service", "Review", "Booked with"],
  pricetext: ["Text this price to", "Quote", "Estimated time", "Page"]
};

// What each form must include. phoneOrEmail: that field or the customer's email will do.
var REQUIRED = {
  booking: { all: ["Name", "Phone", "Address", "Postal code"] },
  quote: { all: ["Name"], phoneOrEmail: "Phone" },
  gift: { all: ["Your name"], phoneOrEmail: "Your phone" },
  review: { all: ["Name", "Rating"] },
  pricetext: { all: ["Text this price to"] }
};

// Headers the script fills itself. A form field with one of these names is saved as "Form <name>" instead.
var RESERVED = ["Reference", "Received", "Status", "Confirmed time", "Final price", "Email", "Attempt", "Alert email", "Receipt email"];

// Receipts to customers. The wording is fixed: only the reference is filled in, so nobody can use the
// website's forms to send their own words from Mann's Gmail.
var RECEIPTS = {
  booking: { subject: "We got your request {ref}", line: "We got your request {ref}. It's not confirmed yet. Mann will reply within 2 hours during business hours to agree your time and final price." },
  quote: { subject: "We got your quote request {ref}", line: "We got your quote request {ref}. Mann will reply within one business day." },
  gift: { subject: "We got your gift card request {ref}", line: "We got your gift card request {ref}. Mann will text you within 2 hours during business hours to confirm and send an Interac e-Transfer request." }
};
var ALERT_SUBJECTS = { booking: "New booking request", quote: "New quote request", gift: "New gift card request", review: "New review", pricetext: "New price text request" };
var DEFAULT_OWNER = "nestnrestcleaning@gmail.com";
var MAX_TRIES = 5;
var RECEIPTS_PER_DAY = 50;

var TZ = "America/Toronto";
var MAX_BODY = 20000;
var MAX_VALUE = 2000;
var REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function now_() { return new Date(); }

function doPost(e) {
  var body = null;
  try { body = JSON.parse(e && e.postData ? e.postData.contents : ""); } catch (err) { body = null; }
  var result = body && typeof body === "object" ? handleRequest_(body) : { ok: false, error: "Unreadable request" };
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

// Run once from the Apps Script editor: creates the tabs, headers, Status dropdowns and the two timers. Safe to run again.
function setup() {
  Object.keys(TABS).forEach(function (form) { ensureTab_(form); });
  var have = ScriptApp.getProjectTriggers().map(function (t) { return t.getHandlerFunction(); });
  if (have.indexOf("retryEmails") === -1) ScriptApp.newTrigger("retryEmails").timeBased().everyMinutes(15).create();
  if (have.indexOf("morningReminder") === -1) ScriptApp.newTrigger("morningReminder").timeBased().atHour(9).everyDays(1).inTimezone(TZ).create();
}

function handleRequest_(body) {
  if (JSON.stringify(body).length > MAX_BODY) return { ok: false, error: "Too large" };
  var form = String(body.form || "");
  if (!Object.prototype.hasOwnProperty.call(TABS, form)) return { ok: false, error: "Unknown form" };
  var attempt = String(body.attempt || "");
  if (!/^[A-Za-z0-9]{16,40}$/.test(attempt)) return { ok: false, error: "Missing attempt" };
  // A bot filled the hidden field: answer as usual, save nothing.
  if (body.honey) return { ok: true, reference: String(body.reference || ""), duplicate: false };

  var fields = cleanFields_(body.fields);
  var email = String(body.email || "").trim().slice(0, 254);
  var missing = missingFields_(form, fields, email);
  if (missing.length) return { ok: false, error: "Missing: " + missing.join(", ") };

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  var saved;
  try {
    var sheet = ensureTab_(form);
    var lastRow = sheet.getLastRow();
    var head = headerMap_(sheet);
    var refs = columnValues_(sheet, head["Reference"], lastRow);
    var attempts = columnValues_(sheet, head["Attempt"], lastRow);
    var seen = attempts.indexOf(attempt);
    if (seen > -1) return { ok: true, reference: refs[seen], duplicate: true };

    var ref = /^(NR|GIFT)-[A-Z0-9]{4}$/.test(String(body.reference || "")) ? String(body.reference) : newRef_("NR");
    while (refs.indexOf(ref) > -1) ref = newRef_(ref.split("-")[0]);

    var values = { "Reference": ref, "Received": Utilities.formatDate(now_(), TZ, "yyyy-MM-dd HH:mm"), "Status": "Received", "Email": email, "Attempt": attempt,
      "Alert email": "Pending", "Receipt email": "Pending" };
    Object.keys(fields).forEach(function (label) { values[RESERVED.indexOf(label) > -1 ? "Form " + label : label] = fields[label]; });
    head = addMissingHeaders_(sheet, head, Object.keys(values));
    var width = sheet.getLastColumn();
    var row = [];
    for (var c = 1; c <= width; c++) row.push("");
    Object.keys(values).forEach(function (h) { row[head[h] - 1] = safe_(values[h]); });
    // Plain text, so Sheets keeps "$140.00", phone numbers and times exactly as sent.
    sheet.getRange(lastRow + 1, 1, 1, width).setNumberFormat("@").setValues([row]);
    saved = { row: lastRow + 1, reference: ref };
    // Emails go out under the same lock, so the 15-minute retry can never send one twice. A failed email
    // never undoes the saved row: it is marked "Not sent" and retried.
    try { sendEmails_(TABS[form], saved.row); } catch (err) { /* the row is saved; retryEmails picks up anything Pending */ }
  } finally {
    lock.releaseLock();
  }
  return { ok: true, reference: saved.reference, duplicate: false };
}

// Sends whatever this row still needs: Mann's alert, and the customer's receipt where one applies.
// Each email column reads Sent, Not sent (will retry, tries: N), Failed (gave up after 5 tries), Not needed or Not needed (limit).
function sendEmails_(tabName, rowNumber) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(tabName);
  var head = headerMap_(sheet);
  var width = sheet.getLastColumn();
  var line = sheet.getRange(rowNumber, 1, 1, width).getValues()[0];
  var get = function (h) { return head[h] ? unsafe_(line[head[h] - 1]) : ""; };
  var set = function (h, v) { sheet.getRange(rowNumber, head[h], 1, 1).setValue(v); };
  var form = formForTab_(tabName);
  var ref = get("Reference");
  var email = get("Email");
  var hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

  var alertState = get("Alert email");
  if (needsSending_(alertState)) {
    var skip = ["Status", "Attempt", "Alert email", "Receipt email"].concat(OWNER_COLUMNS[tabName] || []);
    var lines = Object.keys(head).sort(function (a, b) { return head[a] - head[b]; })
      .filter(function (h) { return skip.indexOf(h) === -1 && get(h) !== ""; })
      .map(function (h) { return h + ": " + get(h); });
    var alert = { to: ownerEmail_(), subject: ALERT_SUBJECTS[form] + " " + ref, body: lines.join("\n") + "\n\nOpen the sheet: " + SpreadsheetApp.getActive().getUrl() };
    if (hasEmail) alert.replyTo = email;
    set("Alert email", trySend_(alert, alertState));
  }

  var receiptState = get("Receipt email");
  if (receiptState === "Pending") {
    if (!RECEIPTS[form] || !hasEmail) receiptState = "Not needed";
    else if (!receiptAllowed_(email)) receiptState = "Not needed (limit)";
    else receiptState = "Due";
  }
  if (receiptState === "Due" || /^Not sent/.test(receiptState)) {
    var r = RECEIPTS[form];
    receiptState = trySend_({ to: email, subject: r.subject.replace("{ref}", ref), body: r.line.replace("{ref}", ref) + "\n\nNest & Rest Cleaning" }, receiptState);
  }
  set("Receipt email", receiptState);
}

// Only rows this script wrote are emailed: a row Mann types in by hand has blank email columns and is left alone.
function needsSending_(state) { return state === "Pending" || /^Not sent/.test(state); }

// "Sent", or the next "Not sent" / "Failed" state counting this try.
function trySend_(message, previous) {
  var m = /tries: (\d+)/.exec(String(previous || ""));
  var tries = (m ? +m[1] : 0) + 1;
  try {
    MailApp.sendEmail(message);
    return "Sent";
  } catch (err) {
    return tries >= MAX_TRIES ? "Failed (gave up after " + MAX_TRIES + " tries)" : "Not sent (will retry, tries: " + tries + ")";
  }
}

// At most one receipt per address per hour, and RECEIPTS_PER_DAY a day, so the forms can't be used to flood someone's inbox.
function receiptAllowed_(email) {
  var props = PropertiesService.getScriptProperties();
  var now = now_().getTime();
  var key = "receipt:" + email.toLowerCase();
  var last = +(props.getProperty(key) || 0);
  if (last && now - last < 60 * 60 * 1000) return false;
  var dayKey = "receipts:" + Utilities.formatDate(now_(), TZ, "yyyy-MM-dd");
  var count = +(props.getProperty(dayKey) || 0);
  if (count >= RECEIPTS_PER_DAY) return false;
  props.setProperty(key, String(now));
  props.setProperty(dayKey, String(count + 1));
  return true;
}

// Every 15 minutes: retries emails that didn't go out.
function retryEmails() {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    Object.keys(TABS).forEach(function (form) {
      var sheet = SpreadsheetApp.getActive().getSheetByName(TABS[form]);
      if (!sheet) return;
      var head = headerMap_(sheet), lastRow = sheet.getLastRow();
      var alerts = columnValues_(sheet, head["Alert email"], lastRow), receipts = columnValues_(sheet, head["Receipt email"], lastRow);
      for (var i = 0; i < Math.max(alerts.length, receipts.length); i++) {
        if (needsSending_(alerts[i] || "") || needsSending_(receipts[i] || "")) sendEmails_(TABS[form], i + 2);
      }
    });
  } finally {
    lock.releaseLock();
  }
}

// Every morning at 9: one email to Mann if a booking or quote has waited over 2 hours, or an email gave up.
function morningReminder() {
  var cutoff = Utilities.formatDate(new Date(now_().getTime() - 2 * 60 * 60 * 1000), TZ, "yyyy-MM-dd HH:mm");
  var lines = [];
  Object.keys(TABS).forEach(function (form) {
    var name = TABS[form];
    var sheet = SpreadsheetApp.getActive().getSheetByName(name);
    if (!sheet) return;
    var head = headerMap_(sheet), lastRow = sheet.getLastRow();
    var col = function (h) { return columnValues_(sheet, head[h], lastRow); };
    var refs = col("Reference"), received = col("Received"), status = col("Status"), alerts = col("Alert email"), receipts = col("Receipt email");
    refs.forEach(function (ref, i) {
      var when = /^\d{4}-\d\d-\d\d \d\d:\d\d/.test(received[i]) ? received[i].slice(0, 16) : received[i];
      if ((form === "booking" || form === "quote") && status[i] === "Received" && when < cutoff) lines.push(name + " · " + ref + " · received " + when);
      if (/^Failed/.test(alerts[i] || "") || /^Failed/.test(receipts[i] || "")) lines.push(name + " · " + ref + " · an email couldn't be sent");
    });
  });
  tidyReceiptLimits_();
  if (!lines.length) return;
  MailApp.sendEmail({ to: ownerEmail_(), subject: "Waiting for your reply: " + lines.length,
    body: lines.join("\n") + "\n\nOpen the sheet: " + SpreadsheetApp.getActive().getUrl() });
}

// Drops receipt-limit notes older than a day.
function tidyReceiptLimits_() {
  var props = PropertiesService.getScriptProperties();
  var now = now_().getTime(), today = "receipts:" + Utilities.formatDate(now_(), TZ, "yyyy-MM-dd");
  props.getKeys().forEach(function (k) {
    if ((k.indexOf("receipt:") === 0 && now - +props.getProperty(k) > 24 * 60 * 60 * 1000) || (k.indexOf("receipts:") === 0 && k !== today)) props.deleteProperty(k);
  });
}

function ownerEmail_() { return PropertiesService.getScriptProperties().getProperty("OWNER_EMAIL") || DEFAULT_OWNER; }

function formForTab_(tabName) {
  return Object.keys(TABS).filter(function (f) { return TABS[f] === tabName; })[0];
}

// A cell's value as the customer sent it (the apostrophe that kept a formula as text is dropped).
function unsafe_(v) {
  v = String(v === null || v === undefined ? "" : v);
  return /^'[=+\-@]/.test(v) ? v.slice(1) : v;
}

// The tab for a form, created with its headers and Status dropdown if it isn't there yet.
function ensureTab_(form) {
  var name = TABS[form];
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  var wanted = ["Reference", "Received", "Status"].concat(OWNER_COLUMNS[name] || [], KNOWN_FIELDS[form], SYSTEM_COLUMNS);
  if (sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, wanted.length).setValues([wanted]).setFontWeight("bold");
    sheet.setFrozenRows(1);
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(STATUSES[name], true).build();
    sheet.getRange(2, 3, 999, 1).setDataValidation(rule);
  } else {
    addMissingHeaders_(sheet, headerMap_(sheet), wanted);
  }
  return sheet;
}

// { header: column number } from row 1. Columns are found by name, so Mann can move them.
function headerMap_(sheet) {
  var width = sheet.getLastColumn();
  var map = {};
  if (!width) return map;
  sheet.getRange(1, 1, 1, width).getValues()[0].forEach(function (h, i) {
    h = String(h).trim();
    if (h && !map[h]) map[h] = i + 1;
  });
  return map;
}

function addMissingHeaders_(sheet, head, names) {
  var add = names.filter(function (n) { return !head[n]; });
  if (!add.length) return head;
  var start = sheet.getLastColumn() + 1;
  sheet.getRange(1, start, 1, add.length).setValues([add]).setFontWeight("bold");
  add.forEach(function (n, i) { head[n] = start + i; });
  return head;
}

function columnValues_(sheet, col, lastRow) {
  if (!col || lastRow < 2) return [];
  return sheet.getRange(2, col, lastRow - 1, 1).getValues().map(function (r) { return String(r[0]); });
}

function cleanFields_(fields) {
  var out = {};
  if (!fields || typeof fields !== "object") return out;
  Object.keys(fields).forEach(function (k) {
    var label = String(k).trim().slice(0, 100);
    if (!label) return;
    var v = fields[k];
    out[label] = String(v === null || v === undefined ? "" : v).slice(0, MAX_VALUE);
  });
  return out;
}

function missingFields_(form, fields, email) {
  var rule = REQUIRED[form];
  var blank = function (v) { v = String(v || "").trim(); return !v || v === "—"; };
  var missing = rule.all.filter(function (label) { return blank(fields[label]); });
  if (rule.phoneOrEmail && blank(fields[rule.phoneOrEmail]) && blank(email)) missing.push(rule.phoneOrEmail + " or email");
  return missing;
}

// A value that Sheets would read as a formula is kept as text.
function safe_(v) {
  v = String(v === null || v === undefined ? "" : v);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function newRef_(prefix) {
  var s = "";
  for (var i = 0; i < 4; i++) s += REF_ALPHABET.charAt(Math.floor(Math.random() * REF_ALPHABET.length));
  return prefix + "-" + s;
}
