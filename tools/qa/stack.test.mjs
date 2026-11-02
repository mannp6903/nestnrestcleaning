// Builds of the site with other settings patched in (node tools/build.mjs --out DIR, with NR_CONFIG_PATCH set), served from a temp folder.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { test, assert, startServer, ROOT } from "./lib.mjs";

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
}
