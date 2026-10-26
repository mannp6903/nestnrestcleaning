// google.js against a stand-in for Google Sheets that follows Google's documented behaviour, including the parts
// that bite: Range.insertCheckboxes() sets every cell to false, and a new tab has 1000 rows that getRange can't go past.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { clock } from "./load.mjs";
import * as R from "./fixtures/requests.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

class FakeSheet {
  constructor(name) { this.name = name; this.cells = []; this.maxRows = 1000; this.maxCols = 26; this.validation = {}; }
  getName() { return this.name; }
  getMaxRows() { return this.maxRows; }
  getLastRow() { for (let r = this.cells.length; r > 0; r--) if ((this.cells[r - 1] || []).some((v) => v !== "" && v != null)) return r; return 0; }
  getRange(row, col, rows = 1, cols = 1) {
    if (row < 1 || col < 1 || row + rows - 1 > this.maxRows || col + cols - 1 > this.maxCols) throw new Error("The coordinates of the range are outside the dimensions of the sheet.");
    return new FakeRange(this, row, col, rows, cols);
  }
  get(r, c) { return ((this.cells[r - 1] || [])[c - 1]) ?? ""; }
  set(r, c, v) { (this.cells[r - 1] = this.cells[r - 1] || [])[c - 1] = v; }
  appendRow(values) { const row = this.getLastRow() + 1; if (row > this.maxRows) this.maxRows = row; values.forEach((v, i) => this.set(row, i + 1, v)); return this; }
  insertRowsAfter(after, n) { this.cells.splice(after, 0, ...Array.from({ length: n }, () => [])); this.maxRows += n; return this; }
  deleteRows(start, n) { this.cells.splice(start - 1, n); this.maxRows -= n; }
  hideColumns() {} hideSheet() {} setFrozenRows() {} setColumnWidth() {}
}

class FakeRange {
  constructor(sheet, row, col, rows, cols) { Object.assign(this, { sheet, row, col, rows, cols }); }
  each(fn) { for (let r = 0; r < this.rows; r++) for (let c = 0; c < this.cols; c++) fn(this.row + r, this.col + c, r, c); }
  setValues(v) { if (v.length !== this.rows || v.some((x) => x.length !== this.cols)) throw new Error("The number of rows or columns in the data does not match the range."); this.each((r, c, i, j) => this.sheet.set(r, c, v[i][j])); return this; }
  getValues() { const out = []; this.each((r, c, i) => { (out[i] = out[i] || []).push(this.sheet.get(r, c)); }); return out; }
  setValue(v) { this.each((r, c) => this.sheet.set(r, c, v)); return this; }
  getValue() { return this.sheet.get(this.row, this.col); }
  clearContent() { this.each((r, c) => this.sheet.set(r, c, "")); return this; }
  // Google: "Inserts checkboxes into each cell in the range ... Sets the value of all cells in the range to false."
  insertCheckboxes() { this.each((r, c) => { this.sheet.set(r, c, false); this.sheet.validation[r + ":" + c] = "checkbox"; }); return this; }
  setDataValidation(rule) { this.each((r, c) => { this.sheet.validation[r + ":" + c] = rule.kind; }); return this; }
  setNumberFormat() { return this; }
  setFontWeight() { return this; }
}

function fakeGoogle() {
  const sheets = {}, props = { SHEET_ID: "sheet1" };
  const book = {
    getId: () => "sheet1",
    getSheetByName: (n) => sheets[n] || null,
    insertSheet: (n) => (sheets[n] = new FakeSheet(n))
  };
  Object.assign(globalThis, {
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => props[k] ?? null, setProperty: (k, v) => { props[k] = String(v); } }) },
    SpreadsheetApp: {
      openById: () => book,
      newDataValidation: () => { const b = { kind: "", requireCheckbox() { b.kind = "checkbox"; return b; }, requireValueInList() { b.kind = "list"; return b; }, build() { return { kind: b.kind }; } }; return b; }
    },
    Session: { getEffectiveUser: () => ({ getEmail: () => "nestnrestcleaning@gmail.com" }) }
  });
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, "automation/src/google.js"), "utf8"), { filename: "google.js" });
  const env = makeGoogleEnv();
  env.sheet.setup(CLIENT_HEADERS, defaultSettingsRows(new Date("2026-10-26T12:00:00Z"), clock));
  return { env, sheets };
}

const now = new Date("2026-10-26T18:32:00Z");
const leadRow = (patch = {}) => leadToRow(Object.assign(leadFromIncoming(incomingRecord(R.booking, now, { messageId: "m1", threadId: "t1" }), clock), patch), now, clock);

test("an opted-out tick survives saving the rows again", () => {
  const { env } = fakeGoogle();
  env.sheet.writeLeadRows([leadRow({ optedOut: true }), leadRow({ ref: "NR-ZZZZ" })]);
  env.sheet.writeLeadRows(env.sheet.readLeadRows());
  const rows = env.sheet.readLeadRows();
  assert.equal(rows[0][11], true);
  assert.equal(rows[1][11], false);
  assert.equal(rowToLead(rows[0]).optedOut, true);
});

test("Automation on is ticked straight after install", () => {
  const { env } = fakeGoogle();
  const on = env.sheet.readSettingsRows().find((r) => r[0] === "Automation on");
  assert.equal(on[1], true);
  assert.equal(parseSettings(env.sheet.readSettingsRows(), clock).on, true);
});

test("the Clients tab grows past its first 1000 rows", () => {
  const { env } = fakeGoogle();
  const rows = Array.from({ length: 1005 }, (_, i) => leadRow({ ref: "NR-" + String(i).padStart(4, "0") }));
  env.sheet.writeLeadRows(rows);
  assert.equal(env.sheet.readLeadRows().length, 1005);
});

test("the Log grows and is trimmed instead of failing", () => {
  const { env, sheets } = fakeGoogle();
  for (let i = 0; i < 30; i++) env.sheet.appendLog(Array.from({ length: 100 }, (_, j) => ["2026-10-26 14:32", "", "entry " + (i * 100 + j)]));
  const log = sheets.Log;
  assert.ok(log.getLastRow() <= 2501, String(log.getLastRow()));
  assert.equal(log.get(log.getLastRow(), 3), "entry 2999");
});

test("calendar events carry their title and when they were made", () => {
  const { env } = fakeGoogle();
  const start = new Date("2026-11-02T15:00:00Z"), made = new Date("2026-10-26T18:36:00Z");
  globalThis.CalendarApp = { getDefaultCalendar: () => ({ getEvents: () => [{
    getId: () => "e1", getStartTime: () => start, getEndTime: () => start, getDescription: () => "Booking NR-AB12", getTitle: () => "Home clean between Mann and Priya",
    getDateCreated: () => made, getGuestList: () => [{ getEmail: () => "priya@example.com" }]
  }] }) };
  const [e] = env.calendar.events(new Date(0), new Date());
  assert.equal(e.title, "Home clean between Mann and Priya");
  assert.equal(e.created, made);
  assert.deepEqual(e.guests, ["priya@example.com"]);
});

test("reply search covers only the given clients, in all mail, a few at a time", () => {
  const { env } = fakeGoogle();
  const queries = [], mine = "nestnrestcleaning@gmail.com", since = new Date("2026-10-25T00:00:00Z");
  const msg = (from, date) => ({ getFrom: () => from, getDate: () => new Date(date), isDraft: () => false, getPlainBody: () => "Thanks!" });
  globalThis.GmailApp = { search: (q) => { queries.push(q); return q.includes("priya@example.com") ? [{ getId: () => "th1", getMessages: () => [msg("Priya <priya@example.com>", "2026-10-26T00:00:00Z"), msg(mine, "2026-10-26T01:00:00Z"), msg("Priya <priya@example.com>", "2026-10-24T00:00:00Z")] }] : []; } };
  globalThis.MailApp = { getRemainingDailyQuota: () => 87 };
  const emails = ["priya@example.com", ...Array.from({ length: 24 }, (_, i) => "c" + i + "@example.com")];
  const found = env.gmail.findClientMessages(since, emails);
  assert.equal(queries.length, 2);
  assert.ok(queries.every((q) => q.startsWith("newer_than:3d -from:me from:(") && !q.includes("in:inbox")));
  assert.ok(queries[0].includes("from:(priya@example.com OR c0@example.com"));
  assert.deepEqual(found.map((m) => m.from), ["Priya <priya@example.com>"]);
  assert.equal(env.gmail.remainingQuota(), 87);
});

test("anything that looks like a formula is saved as plain text", () => {
  const { env, sheets } = fakeGoogle();
  env.sheet.writeLeadRows([leadRow({ name: '=IMPORTXML("https://evil.example","//a")', phone: "+1 647 555 0123" })]);
  const row = sheets.Clients.cells[1];
  assert.equal(row[4], `'=IMPORTXML("https://evil.example","//a")`);
  assert.equal(row[6], "'+1 647 555 0123");
  assert.ok(row[16].startsWith("{"));
  env.sheet.appendLog([["2026-10-26 14:32", "-x", '@SUM(A1) =HYPERLINK("https://evil.example")']]);
  const log = sheets.Log.cells[sheets.Log.getLastRow() - 1];
  assert.equal(log[1], "'-x");
  assert.equal(log[2], `'@SUM(A1) =HYPERLINK("https://evil.example")`);
  env.sheet.writeSettingValue("Last error", "=1+1");
  assert.equal(env.sheet.readSettingsRows().find((r) => r[0] === "Last error")[1], "'=1+1");
});
