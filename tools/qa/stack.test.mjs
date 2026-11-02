// Builds of the site with other settings patched in (node tools/build.mjs --out DIR, with NR_CONFIG_PATCH set), served from a temp folder.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { test, assert, startServer, loadConfig, ROOT } from "./lib.mjs";

const BUILD = path.join(ROOT, "tools/build.mjs");

const runBuild = (dir, patch) => execFileSync(process.execPath, [BUILD, "--out", dir], { env: { ...process.env, NR_CONFIG_PATCH: patch }, stdio: "pipe" });

// Builds the site into a temp folder with `patch` (JavaScript) run right after js/config.js, and serves it.
// close() stops the server and deletes the folder.
async function buildWith(patch) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nr-stack-"));
  try {
    runBuild(dir, patch);
  } catch (e) {
    fs.rmSync(dir, { recursive: true, force: true });
    throw e;
  }
  const server = await startServer(dir);
  return { dir, url: server.url, close: async () => { await server.close(); fs.rmSync(dir, { recursive: true, force: true }); } };
}

// The build's error text when `patch` makes it fail, or "" when the build succeeds.
function buildError(patch) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nr-stack-"));
  try {
    runBuild(dir, patch);
    return "";
  } catch (e) {
    return String(e.stderr || "") || e.message;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Settings that name the server the tools run on. Several checks need them so the "server" stop doesn't hide the one under test.
const SERVER = 'window.NR_CONFIG.server = { name: "TestHost", location: "Toronto, Canada" };';
// [patch, the message the build must stop with]
const STOPS = [
  [SERVER + 'window.NR_CONFIG.booking.calLink = "x/y"; window.NR_CONFIG.booking.easyAppointments = { url: "https://book.example.test", services: [{ upToHours: 3, id: 1 }] };', "Fill in only one booking calendar"],
  [SERVER + 'window.NR_CONFIG.booking.easyAppointments = { url: "http://book.example.test", services: [{ upToHours: 3, id: 1 }] };', "booking.easyAppointments.url in js/config.js must start with https://"],
  [SERVER + 'window.NR_CONFIG.booking.easyAppointments = { url: "https://book.example.test", services: [] };', "booking.easyAppointments.services in js/config.js needs one entry per clean length"],
  [SERVER + 'window.NR_CONFIG.booking.easyAppointments = { url: "https://book.example.test", services: [{ upToHours: 5, id: 1 }, { upToHours: 3, id: 2 }] };', "booking.easyAppointments.services in js/config.js needs one entry per clean length"],
  [SERVER + 'window.NR_CONFIG.booking.easyAppointments = { url: "https://book.example.test", services: [{ upToHours: 3, id: "a" }] };', "booking.easyAppointments.services in js/config.js needs one entry per clean length"],
  [SERVER + 'window.NR_CONFIG.delivery = { provider: "webhook", endpoint: "http://n8n.example.test/webhook/forms" };', "delivery.endpoint in js/config.js must start with https://"],
  [SERVER + 'window.NR_CONFIG.chat = { baseUrl: "https://chat.example.test", websiteToken: "" };', "Fill in both chat.baseUrl and chat.websiteToken"],
  [SERVER + 'window.NR_CONFIG.newsletter = { optIn: true };', "newsletter.optIn needs business.mailingAddress"],
  ['window.NR_CONFIG.delivery = { provider: "webhook", endpoint: "https://n8n.example.test/webhook/forms" };', "Fill in server.name and server.location"]
];

export default async function () {
  test("a patched build carries the patch into its pages and its config", async () => {
    const b = await buildWith('window.NR_CONFIG.business.hours = "Every day, 8am to 8pm";');
    try {
      assert(fs.readFileSync(path.join(b.dir, "index.html"), "utf8").includes("Every day, 8am to 8pm"), "page");
      assert(fs.readFileSync(path.join(b.dir, "js/config.js"), "utf8").includes("8am to 8pm"), "config copy");
      assert(!fs.readFileSync(path.join(b.dir, "index.html"), "utf8").includes("window.NR_CONFIG.preview"), "not a preview");
    } finally { await b.close(); }
  });

  test("buildError is empty for a good patch and carries the message of a bad one", async () => {
    assert(buildError('window.NR_CONFIG.business.hours = "Every day";') === "", "a good patch builds");
    const err = buildError('throw new Error("patch refused");');
    assert(err.includes("patch refused"), "error text: " + err);
  });

  test("each unsafe setting stops the build with its message", async () => {
    for (const [patch, msg] of STOPS) assert(buildError(patch).includes(msg), "expected: " + msg + "\npatch: " + patch);
    assert(buildError(SERVER) === "", "a server alone builds");
  });

  test("today's settings switch nothing on", async ({ browser, url }) => {
    const C = loadConfig();
    assert(!C.booking.easyAppointments.url && !C.chat.baseUrl && !C.newsletter.optIn && C.delivery.provider !== "webhook", "all off");
    for (const f of ["index.html", "book/index.html", "privacy/index.html", "policies/index.html"]) {
      const h = fs.readFileSync(path.join(ROOT, f), "utf8");
      assert(!/data-chat|f-offers|Easy!Appointments|n8n|listmonk|Chatwoot/.test(h), f + " mentions a tool that's off");
    }
  });
}
