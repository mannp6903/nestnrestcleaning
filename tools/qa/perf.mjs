// Lab speed check for five page types on a slow phone (not real-visitor data).
// Mobile 390x844, 150ms latency, 1.6 Mbps down / 750 kbps up, CPU 4x slower, cold cache, median of three runs.
// Usage: node tools/qa/perf.mjs   (exits 1 if a median LCP is over 2.2s or a CLS over 0.05)
import { chromium, startServer } from "./lib.mjs";

const PAGES = { Home: "/", Service: "/services/deep-cleaning/", Pricing: "/pricing/", Area: "/areas/north-york/", Booking: "/book/" };
const median = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
const server = await startServer();
const browser = await chromium.launch();
let bad = 0;
for (const [name, path] of Object.entries(PAGES)) {
  const lcp = [], cls = [];
  let element = "";
  for (let run = 0; run < 3; run++) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    await p.route(/googletagmanager|google-analytics/, (r) => r.abort());
    const cdp = await ctx.newCDPSession(p);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await p.addInitScript(() => {
      window.__lcp = 0; window.__cls = 0; window.__el = "";
      new PerformanceObserver((l) => { const e = l.getEntries().pop(); window.__lcp = e.startTime; window.__el = e.element ? e.element.tagName + "." + e.element.className : ""; }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    });
    await p.goto(server.url + path, { waitUntil: "load" });
    await p.waitForTimeout(2500);
    const r = await p.evaluate(() => ({ lcp: window.__lcp, cls: window.__cls, el: window.__el }));
    lcp.push(r.lcp); cls.push(r.cls); element = r.el;
    await ctx.close();
  }
  const l = median(lcp) / 1000, c = median(cls);
  if (l > 2.2 || c > 0.05) bad++;
  console.log(`${name.padEnd(8)} LCP ${l.toFixed(2)}s  CLS ${c.toFixed(3)}  largest element: ${element}${l > 2.2 || c > 0.05 ? "  <- over budget" : ""}`);
}
await browser.close();
await server.close();
process.exit(bad ? 1 : 0);
