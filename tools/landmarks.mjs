// Original landmark artwork for Nest & Rest, drawn as inline SVG so it's ours, tiny, and follows the light and dark themes
// (every colour is a --lm-* token in css/site.css). It's an illustrated montage, not one real viewpoint, laid out west to east:
// North York Centre's towers and Mel Lastman Square's reflecting pool and fountains, a street of homes, then the
// Scarborough Bluffs above Lake Ontario with the marina at Bluffer's Park. Cues checked against the City of Toronto's
// Mel Lastman Square page (reflecting pool, fountains, amphitheatre) and Destination Toronto's Scarborough page (cliffs,
// beach, marina) on 31 October 2026. Nothing here suggests an affiliation with those places.

// A small seeded random, so the drawing varies naturally but is the same on every build.
function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; }
const r1 = (n) => Math.round(n * 10) / 10;

const tree = (x, y, r, tone = 1) => `<rect class="lm-trunk" x="${r1(x - 1.6)}" y="${r1(y)}" width="3.2" height="${r1(r * 1.25)}"/><circle class="lm-tree${tone === 2 ? "-2" : ""}" cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}"/>`;

// North York Centre: towers along Yonge Street with stepped tops (windows are dashed strokes), the civic centre's
// glass front, a plaza and the reflecting pool at Mel Lastman Square with fountain jets. x0..x0+w, ground at gy.
function northYork(x0, w, gy, seed = 7, tall = 1) {
  const rand = rng(seed);
  const n = Math.max(5, Math.round(w / 52));
  const step = w / n;
  let out = "";
  for (let i = 0; i < n; i++) {
    const tw = step * (0.62 + rand() * 0.22), x = x0 + i * step + (step - tw) / 2;
    const top = gy - (gy * 0.42 + rand() * gy * 0.42) * (i % 2 ? 0.86 : 1) * tall;
    const cls = ["lm-tower", "lm-tower-2", "lm-tower-3"][(i + Math.floor(rand() * 2)) % 3];
    out += `<path class="${cls}" d="M${r1(x)} ${r1(gy)}V${r1(top + 10)}h${r1(tw * 0.18)}V${r1(top)}h${r1(tw * 0.64)}v10h${r1(tw * 0.18)}V${r1(gy)}z"/>`;
    if (i % 3 === 1) out += `<path class="lm-mast" d="M${r1(x + tw / 2)} ${r1(top)}v-12"/>`;
    const cols = Math.max(2, Math.floor((tw - 8) / 8));
    out += `<path class="lm-win" d="${Array.from({ length: cols }, (_, c) => `M${r1(x + 6 + c * ((tw - 12) / (cols - 1)))} ${r1(top + 18)}V${r1(gy - 30)}`).join("")}"/>`;
  }
  // The civic centre in front, with its glass atrium; the plaza and reflecting pool before it.
  const cx = x0 + w * 0.22, cw = w * 0.5;
  out += `<rect class="lm-civic" x="${r1(cx)}" y="${r1(gy - 42)}" width="${r1(cw)}" height="42"/>`;
  out += `<path class="lm-glass" d="M${r1(cx + cw * 0.28)} ${r1(gy - 42)}h${r1(cw * 0.44)}v42h-${r1(cw * 0.44)}z"/>`;
  out += `<path class="lm-mullion" d="${Array.from({ length: 5 }, (_, i) => `M${r1(cx + cw * 0.28 + (i + 1) * cw * 0.44 / 6)} ${r1(gy - 42)}v42`).join("")}"/>`;
  out += `<path class="lm-plaza" d="M${r1(x0 - 10)} ${gy}h${r1(w + 20)}v14H${r1(x0 - 10)}z"/>`;
  const px = x0 + w * 0.26, pw = w * 0.42;
  out += `<rect class="lm-pool" x="${r1(px)}" y="${gy + 3}" width="${r1(pw)}" height="9" rx="4.5"/>`;
  out += `<path class="lm-jet" d="${[0.18, 0.38, 0.58, 0.78].map((f) => `M${r1(px + pw * f - 4)} ${gy + 5}q4 -${12 + (f * 10 % 6)} 8 0`).join("")}"/>`;
  out += tree(x0 + 4, gy + 2, 11) + tree(x0 + w * 0.14, gy + 4, 9, 2) + tree(x0 + w * 0.8, gy + 2, 12, 2) + tree(x0 + w * 0.95, gy + 4, 10);
  return out;
}

// A street of homes: bungalows, a semi and a townhouse row, with trees, on a gentle rise. x0..x0+w, ground at gy.
function homes(x0, w, gy) {
  const house = (x, hw, h, roof = "lm-roof", wall = "lm-house") => {
    const top = gy - h;
    return `<rect class="${wall}" x="${r1(x)}" y="${r1(top)}" width="${r1(hw)}" height="${r1(h)}"/><path class="${roof}" d="M${r1(x - 5)} ${r1(top + 1)}L${r1(x + hw / 2)} ${r1(top - h * 0.5)}L${r1(x + hw + 5)} ${r1(top + 1)}Z"/>` +
      `<rect class="lm-window" x="${r1(x + hw * 0.16)}" y="${r1(top + h * 0.28)}" width="${r1(hw * 0.24)}" height="${r1(h * 0.26)}"/><rect class="lm-door" x="${r1(x + hw * 0.6)}" y="${r1(top + h * 0.44)}" width="${r1(hw * 0.2)}" height="${r1(h * 0.56)}"/>`;
  };
  const row = (x, n, uw, h) => Array.from({ length: n }, (_, i) => `<rect class="${i % 2 ? "lm-house-2" : "lm-house"}" x="${r1(x + i * uw)}" y="${r1(gy - h)}" width="${r1(uw)}" height="${r1(h)}"/><rect class="lm-window" x="${r1(x + i * uw + uw * 0.24)}" y="${r1(gy - h + 9)}" width="${r1(uw * 0.52)}" height="${r1(h * 0.22)}"/><rect class="lm-door" x="${r1(x + i * uw + uw * 0.36)}" y="${r1(gy - h * 0.42)}" width="${r1(uw * 0.28)}" height="${r1(h * 0.42)}"/>`).join("") +
    `<path class="lm-roof" d="M${r1(x - 4)} ${r1(gy - h)}h${r1(n * uw + 8)}l-8 -13H${r1(x + 4)}z"/>`;
  const u = w / 460;
  return tree(x0 + 16 * u, gy - 22, 15) + house(x0 + 40 * u, 66 * u, 40) + tree(x0 + 128 * u, gy - 14, 11, 2) +
    house(x0 + 152 * u, 58 * u, 36, "lm-roof-2", "lm-house-2") + row(x0 + 236 * u, 4, 30 * u, 48) + tree(x0 + 378 * u, gy - 20, 14) + house(x0 + 400 * u, 46 * u, 32);
}

// The Scarborough Bluffs: pale cliffs that rise to a high crest, cut by gullies, under a line of trees, with the beach,
// the lake and the marina at Bluffer's Park below. x0..x0+w; crest peaks at peakY; the beach meets the lake at gy.
function bluffs(x0, w, peakY, gy, seed = 3) {
  const rand = rng(seed);
  const crest = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24, x = x0 + t * w;
    // Rises out of the land on the left, highest about a third of the way, easing down to the right.
    const mound = peakY + (gy - 40 - peakY) * 0.55 * Math.pow(Math.abs(t - 0.38) / 0.62, 1.4);
    const ramp = Math.min(1, t / 0.18), ease = ramp * ramp * (3 - 2 * ramp);
    const y = (gy - 4) - ((gy - 4) - mound) * ease + (ease > 0.5 ? Math.sin(i * 1.7) * 3 + rand() * 4 : 0);
    crest.push([x, Math.min(gy - 4, y)]);
  }
  const edge = crest.map(([x, y], i) => (i ? "L" : "M") + r1(x) + " " + r1(y)).join("");
  let out = `<path class="lm-cliff" d="${edge}L${r1(x0 + w)} ${gy}L${r1(x0)} ${gy}Z"/>`;
  // Gullies and ridges: long narrow wedges from just under the crest towards the beach.
  let g = "", lt = "";
  for (let i = 1; i < 48; i++) {
    // Twice as many candidates as crest points, half of them skipped, so the gullies fall irregularly.
    const t = i / 48, j = Math.min(23, Math.floor(t * 24)), f = t * 24 - j;
    const x = crest[j][0] + (crest[j + 1][0] - crest[j][0]) * f, y = crest[j][1] + (crest[j + 1][1] - crest[j][1]) * f;
    if (gy - y < 34 || rand() < 0.45) continue;
    const len = (gy - y) * (0.4 + rand() * 0.5), gw = 4 + rand() * 9;
    g += `M${r1(x - gw / 2)} ${r1(y + 7)}L${r1(x + rand() * 6 - 3)} ${r1(y + len)}L${r1(x + gw / 2)} ${r1(y + 9)}Z`;
    if (rand() < 0.22) lt += `M${r1(x + 6)} ${r1(y + 14)}l3 ${r1(len * 0.55)}h4l-2 -${r1(len * 0.55)}z`;
  }
  out += `<path class="lm-cliff-shade" d="${g}"/><path class="lm-cliff-light" d="${lt}"/>`;
  // Trees along the crest.
  out += crest.slice(1, -1).map(([x, y], i) => `<circle class="lm-tree${i % 3 === 1 ? "-2" : ""}" cx="${r1(x)}" cy="${r1(y - 4)}" r="${r1(9 + rand() * 6)}"/>`).join("");
  // Beach, lake and marina.
  out += `<path class="lm-beach" d="M${r1(x0)} ${gy - 2}C${r1(x0 + w * 0.3)} ${gy - 8} ${r1(x0 + w * 0.7)} ${gy - 10} ${r1(x0 + w)} ${gy - 12}V${gy + 4}H${r1(x0)}z"/>`;
  out += `<path class="lm-water" d="M${r1(x0 + 10)} ${gy + 2}C${r1(x0 + w * 0.4)} ${gy - 2} ${r1(x0 + w * 0.7)} ${gy - 4} ${r1(x0 + w + 2)} ${gy - 6}V240H${r1(x0 + 10)}z"/>`;
  out += `<path class="lm-ripple" d="M${r1(x0 + w * 0.12)} ${gy + 14}h${r1(w * 0.12)}M${r1(x0 + w * 0.34)} ${gy + 24}h${r1(w * 0.16)}M${r1(x0 + w * 0.56)} ${gy + 12}h${r1(w * 0.1)}"/>`;
  const mx = x0 + w * 0.72;
  out += `<path class="lm-hull" d="M${r1(mx)} ${gy + 10}h26l-4 6h-18zM${r1(mx + 34)} ${gy + 14}h22l-4 5h-15zM${r1(mx + 64)} ${gy + 9}h20l-3 5h-14z"/><path class="lm-mast" d="M${r1(mx + 12)} ${gy + 10}v-22M${r1(mx + 45)} ${gy + 14}v-18M${r1(mx + 73)} ${gy + 9}v-19"/>`;
  return out;
}

// The CN Tower, small and faint behind the hills: Toronto context only, not a service area.
const cnTower = (x, base, s = 1) => `<g class="lm-far" transform="translate(${x} ${base}) scale(${s})"><path d="M-3 0L-1.4 -128h2.8L3 0zM-9 -86h18l-3 9H-6zM-4.5 -110h9l-1.5 5h-6zM-0.6 -128V-158h1.2V-128z"/></g>`;

// label null: decorative, for art inside a link whose text already names the place.
const svg = (w, h, label, body, cls) => `<svg class="lm ${cls}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMax slice" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'} focusable="false">${body}</svg>`;
const hills = (w, y) => `<path class="lm-hill" d="M0 ${y}C${w * 0.15} ${y - 14} ${w * 0.3} ${y - 4} ${w * 0.45} ${y - 10}S${w * 0.75} ${y - 18} ${w} ${y - 8}V240H0z"/>`;

export const LANDMARK_ALT = {
  hero: "Illustration of North York Centre's towers and the reflecting pool at Mel Lastman Square, a street of homes, and the Scarborough Bluffs above Lake Ontario.",
  scarborough: "Illustration of the Scarborough Bluffs and the marina at Bluffer's Park on Lake Ontario.",
  "north-york": "Illustration of North York Centre's towers and the reflecting pool and fountains at Mel Lastman Square."
};

// The home hero's panorama for computers: the full montage along the hero's lower edge.
export function heroWide() {
  const gy = 212;
  return svg(1440, 240, LANDMARK_ALT.hero,
    hills(1440, 200) + cnTower(612, 200, 0.95) +
    `<path class="lm-grass" d="M0 ${gy}C200 ${gy - 6} 420 ${gy - 2} 620 ${gy - 6}S900 ${gy - 8} 1010 ${gy - 4}V240H0z"/>` +
    northYork(40, 430, gy) + homes(520, 430, gy - 4) + bluffs(960, 480, 62, gy, 3), "lm-wide");
}

// Phones: a tighter arrangement of the two districts side by side, not the wide panorama squeezed.
export function heroNarrow() {
  // Drawn in the same 240-high space, then shifted up 90 so the ground sits on the bottom edge of a 480 x 150 picture.
  const gy = 212;
  return svg(480, 150, LANDMARK_ALT.hero,
    `<g transform="translate(0 -90)">` + hills(480, 196) + `<path class="lm-grass" d="M0 ${gy}C120 ${gy - 6} 200 ${gy - 2} 260 ${gy - 4}V240H0z"/>` + northYork(14, 210, gy, 11, 0.6) + bluffs(240, 240, 132, gy, 5) + `</g>`, "lm-narrow");
}

// District artwork: area cards on the home page (decorative inside their links) and the district pages' heroes.
export function districtScene(slug, { decorative = false } = {}) {
  const gy = 204, label = (k) => (decorative ? null : LANDMARK_ALT[k]);
  if (slug === "scarborough") return svg(480, 240, label("scarborough"), hills(480, 196) + bluffs(-10, 500, 54, gy, 9), "lm-district");
  if (slug === "north-york") return svg(480, 240, label("north-york"), hills(480, 190) + `<path class="lm-grass" d="M0 ${gy}h480V240H0z"/>` + northYork(30, 420, gy, 21), "lm-district");
  return "";
}
