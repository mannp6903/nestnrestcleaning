// The published site config that the Google script reads its wording and facts from.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { buildSiteConfig, buildAutomation } from "../../tools/automation.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function loadConfig() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "js/config.js"), "utf8"), sandbox);
  return JSON.parse(JSON.stringify(sandbox.window.NR_CONFIG));
}

test("links point at the live site", () => {
  const site = buildSiteConfig(loadConfig());
  assert.equal(site.links.review, "https://nestnrestcleaning.com/review/");
  assert.equal(site.links.policies, "https://nestnrestcleaning.com/policies/");
  assert.equal(site.links.book, "https://nestnrestcleaning.com/book/");
});

test("the calendar link is cleaned the same way the booking page cleans it", () => {
  const C = loadConfig();
  C.booking.calLink = "";
  assert.equal(buildSiteConfig(C).links.calendar, "");
  C.booking.calLink = "https://cal.com/nr/home-clean/";
  assert.equal(buildSiteConfig(C).links.calendar, "https://cal.com/nr/home-clean");
  C.automation.walkthroughLink = "nr/walkthrough";
  assert.equal(buildSiteConfig(C).links.walkthrough, "https://cal.com/nr/walkthrough");
});

test("business details, contact line and reply promises", () => {
  const site = buildSiteConfig(loadConfig());
  assert.equal(site.referral, "$25");
  assert.equal(site.business.contact, "Email nestnrestcleaning@gmail.com");
  assert.equal(site.business.email, "nestnrestcleaning@gmail.com");
  assert.equal(site.business.areaLabel, "Scarborough & North York");
  assert.ok(site.replyPromises.includes("within 2 hours during business hours"));
  assert.ok(site.replyPromises.includes("within one business day"));
});

test("the footer is filled in", () => {
  const site = buildSiteConfig(loadConfig());
  assert.ok(site.footer.startsWith("This email is from Nest & Rest Cleaning, owned and operated by Mann Patel."), site.footer);
  assert.ok(!site.footer.includes("{"));
});

test("confirmation wording and subjects are carried over", () => {
  const C = loadConfig();
  const site = buildSiteConfig(C);
  assert.equal(site.emails.booking, C.emails.booking);
  assert.ok(site.emails.subjects.booking.includes("{ref}"));
  assert.equal(site.automation.senderName, "Mann Patel, Nest & Rest Cleaning");
});

test("services, quote services, extras and FAQs", () => {
  const site = buildSiteConfig(loadConfig());
  const names = Object.fromEntries(site.services.map((s) => [s.key, s.name]));
  assert.equal(names.regular, "Regular Home Cleaning");
  assert.ok(names.deep && names.move && names.detail);
  assert.ok(site.quoteServices.some((q) => q.name === "Residence Care" && q.includes.length > 0));
  assert.ok(site.extras.includes("Inside oven"));
  assert.ok(site.faqs.length > 10);
  assert.ok(site.faqs.every((f) => f.q && f.a));
});

test("the whole config fits in one Sheet cell", () => {
  assert.ok(JSON.stringify(buildSiteConfig(loadConfig())).length < 45000);
});

test("buildAutomation writes site-config.json", () => {
  const C = loadConfig();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nr-auto-"));
  buildAutomation(C, dir);
  const written = JSON.parse(fs.readFileSync(path.join(dir, "automation/site-config.json"), "utf8"));
  assert.equal(written.version, buildSiteConfig(C).version);
  assert.match(written.version, /^[0-9a-f]{8}$/);
});
