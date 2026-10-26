// Loads automation/src into this test process the way Apps Script runs it: every file in one shared global scope.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { SRC_FILES, buildSiteConfig } from "../../tools/automation.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function loadAutomation() {
  globalThis.SITE_CONFIG_URL = "https://nestnrestcleaning.com/automation/site-config.json";
  for (const f of SRC_FILES) {
    if (f === "google.js") continue;
    const file = path.join(ROOT, "automation/src", f);
    if (fs.existsSync(file)) vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file });
  }
}

const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", weekday: "short", hourCycle: "h23" });
const DAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
// Toronto wall-clock parts of a date, as the Apps Script adapter gets them from Utilities.formatDate.
export function torontoParts(date) {
  const p = Object.fromEntries(fmt.formatToParts(date).map((x) => [x.type, x.value]));
  return { year: +p.year, month: +p.month, day: +p.day, hour: +p.hour, minute: +p.minute, weekday: DAYS[p.weekday] };
}

export function loadConfig() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "js/config.js"), "utf8"), sandbox);
  return JSON.parse(JSON.stringify(sandbox.window.NR_CONFIG));
}

loadAutomation();
export const C = loadConfig();
export const site = buildSiteConfig(C);
export const clock = typeof globalThis.makeClock === "function" ? globalThis.makeClock(torontoParts) : null;
