// Writes marketing/social/content-calendar.md and voice-profile.md from posts.mjs.
// Usage (from the repo root): node marketing/social/tools/calendar.mjs
import fs from "fs";
import path from "path";
import { posts, bonus, voice } from "./posts.mjs";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SOCIAL = path.resolve(ROOT, "..");
const MONTH = "2026-11";
const HOME = "artifact https://claude.ai/artifact/WyXRjo4i2pckkon5B3j2Zv";
const strip = (s) => String(s).replace(/<br>/g, " ").replace(/<[^>]+>/g, "");
const fence = (s) => "```\n" + s + "\n```";
const asset = (p) => (p.format.startsWith("Carousel") ? `Carousel ${p.slides.length} × 1080×1350` : p.format.includes("Reel") ? "Reel 9:16 + 1080×1350 image" : "1080×1350 image") + " + 1080×1920 Story/Status";

const rows = [];
for (const p of posts) {
  rows.push(`| ${p.day}, ${p.time} | Instagram feed | Text and images ready | ${p.theme} | ${asset(p)} | ${p.title} | drafted |`);
  rows.push(`| ${p.day} | Facebook | Repurpose of post ${p.n} | ${p.theme} | same images | own caption, 1–2 hashtags | drafted |`);
  rows.push(`| ${p.day} | WhatsApp Status${p.waMsg ? " + message" : ""} | Repurpose of post ${p.n} | ${p.theme} | Story image | short line${p.waMsg ? "; message only to people who said yes" : ""} | drafted |`);
  if (p.n === 4) rows.push(`| ${bonus.day}, ${bonus.time} | Stories + WhatsApp Status | Text and image ready | Bonus | 1080×1920 | ${bonus.title} | drafted |`);
}

const sections = posts.map((p) => `## ${p.n}. ${p.title}

**${p.day} · ${p.time}** · ${p.theme} · ${p.format}${p.pin ? " · pin to profile" : ""}

${p.why}

Aims for: ${p.signal}.

Images (in \`${MONTH}/\`): ${p.slides.map((_, i) => `\`feed/${p.id}-${i + 1}.jpg\``).join(", ")}, \`story/${p.id}-story.jpg\`${fs.existsSync(path.join(SOCIAL, MONTH, "reels", `${p.id}-reel.mp4`)) ? `, \`reels/${p.id}-reel.mp4\`` : ""}

### Instagram
${fence(p.ig + "\n\n" + p.tags)}

### Facebook
${fence(p.fb + (p.fbTags ? "\n\n" + p.fbTags : ""))}

### WhatsApp
Status: ${fence(p.waStatus)}
${p.waMsg ? `Message (only to people who've said yes to hearing from you):\n${fence(p.waMsg)}\n` : ""}
${p.reel ? `### Reel script (${p.reel.length})

${p.reel.audio}

| Time | What to film | Text on screen | What to say |
|---|---|---|---|
${p.reel.shots.map((s) => `| ${s.at} | ${s.shot} | ${s.text} | ${s.vo || ""} |`).join("\n")}
` : ""}
### Alt text
${p.slides.map((s, i) => `${i + 1}. ${s.alt}`).join("\n")}

### Posting notes
${p.steps.map((s) => `- ${s}`).join("\n")}
`).join("\n");

const md = `# Content calendar

Home: ${HOME}

The working record for Nest & Rest's social posts. The posting kit (the link above) shows the same posts with their images and copy buttons. To extend the calendar, add posts to \`tools/posts.mjs\`, then run the tools below; don't start a new calendar.

**Status on ${"2026-10-31"}:** 10 posts and 1 bonus drafted for November 1–27, 2026. Nothing is scheduled or published; Mann posts each one himself.
Published since last run: none (first run). Still scheduled: none. Gap starting: November 28, 2026.

Prices, offers and promises match \`js/config.js\` (pricingVersion 2026-10-28). If prices, HST or offers change, update posts 2, 4 and 10 before they go out, then re-render.

## Calendar

| Date | Channel | Path | Theme | Asset type | Angle | Status |
|---|---|---|---|---|---|---|
${rows.join("\n")}

Theme mix: Useful 3 (posts 3, 4, 5), Proof 1 (7), Offer 4 (2, 8, 9, 10), People 1 (1), Engagement 1 (6), plus a no-offer Diwali greeting.
Remembrance Day (Nov 11) has no post on purpose.

## Bonus: ${bonus.title}

**${bonus.day} · ${bonus.time}** · \`story/${bonus.id}-story.jpg\`

${bonus.why}

${fence(bonus.waStatus)}

${sections}
## Tools

From the repo root (needs Playwright with Chromium, and ffmpeg for the Reels):

\`\`\`
node marketing/social/tools/render.mjs                 # every image into marketing/social/${MONTH}/
node marketing/social/tools/render.mjs p02-diwali      # one post
node marketing/social/tools/render.mjs --reels         # Reel frames; then for each folder it prints:
python3 marketing/social/tools/mkreel.py <frames dir> marketing/social/${MONTH}/reels/<post id>-reel.mp4
node marketing/social/tools/calendar.mjs               # rewrites this file and voice-profile.md
\`\`\`
`;
fs.writeFileSync(path.join(SOCIAL, "content-calendar.md"), md);

const vp = `# Voice profile: ${voice.owner}, Nest & Rest Cleaning

Built: ${voice.built} · Sources: ${voice.sources}
Updated: ${voice.built}: initial. Confirm or correct it, and every future caption follows.

| Trait | How Mann writes |
|---|---|
| Greeting | ${voice.greeting} |
| Sign-off | ${voice.signoff} |
| Sentences | ${voice.sentences} |
| Contractions | ${voice.contractions} |
| Exclamations | ${voice.exclamations} |
| Calls it | ${voice.callsIt} |
| Formality | First names, no titles. Warm and plain, like talking to a neighbour. |

## Characteristic phrases
${voice.phrases.map((p) => `- "${p}"`).join("\n")}

## Never uses
${voice.never.map((n) => `- ${n}`).join("\n")}

## Sample, verbatim (from the site's message templates)
> Hi Priya, it's Mann from Nest & Rest Cleaning. Thank you for having me today! If you have a minute, I'd love your honest review.
`;
fs.writeFileSync(path.join(SOCIAL, "voice-profile.md"), vp);
console.log("wrote content-calendar.md and voice-profile.md", (md.length / 1024).toFixed(0) + "KB");
