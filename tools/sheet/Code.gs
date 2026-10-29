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

// Run once from the Apps Script editor: creates the tabs, headers and Status dropdowns. Safe to run again.
function setup() {
  Object.keys(TABS).forEach(function (form) { ensureTab_(form); });
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

    var values = { "Reference": ref, "Received": Utilities.formatDate(now_(), TZ, "yyyy-MM-dd HH:mm"), "Status": "Received", "Email": email, "Attempt": attempt };
    Object.keys(fields).forEach(function (label) { values[RESERVED.indexOf(label) > -1 ? "Form " + label : label] = fields[label]; });
    head = addMissingHeaders_(sheet, head, Object.keys(values));
    var width = sheet.getLastColumn();
    var row = [];
    for (var c = 1; c <= width; c++) row.push("");
    Object.keys(values).forEach(function (h) { row[head[h] - 1] = safe_(values[h]); });
    // Plain text, so Sheets keeps "$140.00", phone numbers and times exactly as sent.
    sheet.getRange(lastRow + 1, 1, 1, width).setNumberFormat("@").setValues([row]);
    saved = { row: lastRow + 1, reference: ref };
  } finally {
    lock.releaseLock();
  }
  return { ok: true, reference: saved.reference, duplicate: false };
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
