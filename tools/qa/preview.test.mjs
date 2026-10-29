// The preview copy (node tools/build.mjs --preview DIR) must carry the site's current stylesheet, scripts and images.
// Otherwise Claude's preview shows the new pages with old styles.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { test, assert, ROOT } from "./lib.mjs";

export default async function () {
  test("the preview copy carries the current stylesheet, scripts and images", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nr-preview-"));
    try {
      // A stylesheet left over from an earlier preview must be replaced, not kept.
      fs.mkdirSync(path.join(dir, "css"));
      fs.writeFileSync(path.join(dir, "css/site.css"), "/* an older stylesheet */");
      execFileSync(process.execPath, [path.join(ROOT, "tools/build.mjs"), "--preview", dir], { stdio: "pipe" });
      // The compact copies the pages load must match a fresh build of the readable files, so a forgotten rebuild fails here.
      const files = ["css/site.css", "css/site.min.css", "js/site.js", "js/site.min.js", "js/config.js", "site.webmanifest", "assets/logo.svg", "assets/fonts/dm-sans.woff2",
        ...fs.readdirSync(path.join(ROOT, "assets/photos")).map((f) => "assets/photos/" + f)];
      const same = (f) => fs.existsSync(path.join(dir, f)) && fs.readFileSync(path.join(dir, f)).equals(fs.readFileSync(path.join(ROOT, f)));
      const bad = files.filter((f) => !same(f));
      assert(!bad.length, "the preview copy is missing or has an old copy of: " + bad.join(", "));
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
}
