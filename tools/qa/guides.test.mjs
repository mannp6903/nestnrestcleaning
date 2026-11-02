// Guide articles carry the dates set in tools/guides.mjs, never the day the site was built.
import fs from "node:fs";
import path from "node:path";
import { test, assert, ROOT } from "./lib.mjs";

// published and modified for each guide, read from the guide source.
function guideDates() {
  const src = fs.readFileSync(path.join(ROOT, "tools/guides.mjs"), "utf8");
  return src.split(/\bslug: "/).slice(1).map((block) => {
    const head = block.slice(0, 400);
    const pick = (k) => (head.match(new RegExp("\\b" + k + ': "(\\d{4}-\\d{2}-\\d{2})"')) || [])[1];
    return { slug: block.slice(0, block.indexOf('"')), published: pick("published"), modified: pick("modified") };
  });
}

export default async function () {
  test("guide dates come from the guide, not the build day", async () => {
    const guides = guideDates();
    const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
    assert(guides.length === 5, "found " + guides.length + " guides");
    for (const g of guides) {
      assert(g.published, g.slug + " has no published date in tools/guides.mjs");
      const changed = g.modified || g.published;
      assert(changed >= g.published, g.slug + ": modified is before published");
      const html = fs.readFileSync(path.join(ROOT, "guides", g.slug, "index.html"), "utf8");
      const article = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1])).find((s) => s["@type"] === "Article");
      assert(article.datePublished === g.published && article.dateModified === changed, g.slug + ": " + article.datePublished + " / " + article.dateModified);
      const entry = sitemap.match(new RegExp("<loc>[^<]*/guides/" + g.slug + "/</loc><lastmod>([^<]+)</lastmod>"));
      assert(entry && entry[1] === changed, g.slug + " sitemap lastmod: " + (entry && entry[1]));
    }
  });
}
