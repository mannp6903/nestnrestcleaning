// Stand-ins for the few Google Apps Script services tools/sheet/Code.gs uses, so the script runs in Node.
// loadScript() runs Code.gs in a fresh vm context and returns the context plus handles to inspect it.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { ROOT } from "./lib.mjs";

class FakeRange {
  constructor(sheet, row, col, rows = 1, cols = 1) { Object.assign(this, { sheet, row, col, rows, cols }); }
  getValues() {
    const out = [];
    for (let r = 0; r < this.rows; r++) {
      const src = this.sheet.cells[this.row - 1 + r] || [];
      const line = [];
      for (let c = 0; c < this.cols; c++) { const v = src[this.col - 1 + c]; line.push(v === undefined ? "" : v); }
      out.push(line);
    }
    return out;
  }
  setValues(values) {
    if (values.length !== this.rows || values.some((l) => l.length !== this.cols)) throw new Error("The number of rows or columns in the data does not match the range");
    values.forEach((line, r) => {
      const at = this.row - 1 + r;
      while (this.sheet.cells.length <= at) this.sheet.cells.push([]);
      line.forEach((v, c) => { this.sheet.cells[at][this.col - 1 + c] = v; });
    });
    return this;
  }
  setValue(v) { return this.setValues([[v]]); }
  setFontWeight(w) { this.sheet.bold.push({ row: this.row, weight: w }); return this; }
  setNumberFormat(f) { this.sheet.formats.push({ row: this.row, rows: this.rows, format: f }); return this; }
  setDataValidation(rule) { this.sheet.validations.push({ row: this.row, col: this.col, rows: this.rows, cols: this.cols, rule }); return this; }
}

class FakeSheet {
  constructor(name) { this.name = name; this.cells = []; this.frozen = 0; this.bold = []; this.validations = []; this.formats = []; }
  getName() { return this.name; }
  getLastRow() {
    let n = this.cells.length;
    while (n > 0 && !(this.cells[n - 1] || []).some((v) => v !== "" && v !== undefined)) n--;
    return n;
  }
  getLastColumn() { return this.cells.reduce((m, l) => Math.max(m, l.filter((v) => v !== undefined).length ? l.length : 0), 0); }
  getRange(row, col, rows = 1, cols = 1) {
    if (row < 1 || col < 1 || rows < 1 || cols < 1) throw new Error("Range out of bounds");
    return new FakeRange(this, row, col, rows, cols);
  }
  setFrozenRows(n) { this.frozen = n; }
}

function formatDate(date, tz, fmt) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(date).map((x) => [x.type, x.value]));
  return fmt.replace("yyyy", p.year).replace("MM", p.month).replace("dd", p.day).replace("HH", p.hour).replace("mm", p.minute);
}

export function loadScript({ props = {}, mailFailures = 0, now = new Date("2026-10-29T14:00:00Z") } = {}) {
  const state = { now: new Date(now), mailFailures };
  const sheets = new Map();
  const mails = [];
  const triggers = [];
  const ss = {
    getSheetByName: (n) => sheets.get(n) || null,
    insertSheet: (n) => { if (sheets.has(n)) throw new Error("A sheet with the name " + n + " already exists"); const s = new FakeSheet(n); sheets.set(n, s); return s; },
    getSheets: () => [...sheets.values()],
    getUrl: () => "https://docs.google.com/spreadsheets/d/TEST/edit"
  };
  const store = { ...props };
  const context = {
    SpreadsheetApp: {
      getActive: () => ss,
      newDataValidation: () => {
        const rule = { list: null };
        const b = { requireValueInList(list) { rule.list = list.slice(); return b; }, setAllowInvalid() { return b; }, build() { return rule; } };
        return b;
      }
    },
    LockService: { getScriptLock: () => ({ waitLock() {}, tryLock() { return true; }, releaseLock() {} }) },
    MailApp: {
      sendEmail(msg) {
        if (state.mailFailures > 0) { state.mailFailures--; throw new Error("Service unavailable: Gmail"); }
        mails.push(msg);
      }
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k) => (k in store ? store[k] : null),
        setProperty(k, v) { store[k] = String(v); return this; },
        deleteProperty(k) { delete store[k]; return this; },
        getKeys: () => Object.keys(store)
      })
    },
    Utilities: { formatDate },
    ScriptApp: {
      getProjectTriggers: () => triggers.slice(),
      deleteTrigger: (t) => { const i = triggers.indexOf(t); if (i > -1) triggers.splice(i, 1); },
      newTrigger(fn) {
        const t = { fn, getHandlerFunction: () => fn };
        const b = {
          timeBased() { return b; },
          everyMinutes(n) { t.everyMinutes = n; return b; },
          atHour(h) { t.atHour = h; return b; },
          everyDays(d) { t.everyDays = d; return b; },
          inTimezone(z) { t.timezone = z; return b; },
          create() { triggers.push(t); return t; }
        };
        return b;
      }
    },
    ContentService: {
      MimeType: { JSON: "application/json" },
      createTextOutput(s) { const o = { content: s, mime: null, setMimeType(m) { o.mime = m; return o; }, getContent: () => o.content }; return o; }
    },
    Session: { getScriptTimeZone: () => "America/Toronto" },
    console
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "tools/sheet/Code.gs"), "utf8"), context, { filename: "Code.gs" });
  context.now_ = () => new Date(state.now);
  return {
    ctx: context,
    mails,
    triggers,
    props: store,
    raw: (name) => sheets.get(name),
    setNow: (d) => { state.now = new Date(d); },
    failMail: (n) => { state.mailFailures = n; },
    // A tab as headers plus one object per data row, keyed by header.
    sheet(name) {
      const s = sheets.get(name);
      if (!s) return null;
      const headers = (s.cells[0] || []).map((v) => (v === undefined ? "" : v));
      const rows = s.cells.slice(1, s.getLastRow()).map((line) => Object.fromEntries(headers.map((h, i) => [h, line[i] === undefined ? "" : line[i]])));
      return { headers, rows };
    }
  };
}
