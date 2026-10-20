/**
 * Run against the production export served by scripts/serve-out.mjs:
 * node scripts/check-responsive.mjs http://localhost:4100 [browser-executable]
 */
import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: process.argv[3] ?? "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const origin = process.argv[2] ?? "http://localhost:4100";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sizes = [[320, 568], [390, 844], [768, 1024], [1024, 768], [1552, 888], [1920, 1080], [844, 390]];
const overlaps = (a, b) => a.left < b.right - 1 && a.right > b.left + 1 &&
  a.top < b.bottom - 1 && a.bottom > b.top + 1;

try {
  for (const [width, height] of sizes) {
    for (const motion of ["reduce", "no-preference"]) {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.setViewport({ width, height });
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: motion }]);
      await page.goto(`${origin}/?diag=1`, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => window.__ST && document.querySelector("[data-history-photo]"));
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => !document.querySelector(".intro-root"));
      await page.evaluate(() => {
        const t = window.__ST.getAll().find((t) => t.trigger?.id === "history");
        window.scrollTo(0, t.start + 1);
      });
      await delay(1100);
      const indices = await page.evaluate(() => {
        const stories = [...document.querySelectorAll("[data-history-copy]")];
        const longest = stories.reduce((best, el, i) =>
          el.textContent.length > stories[best].textContent.length ? i : best, 0);
        return [...new Set([0, 2, 8, longest, stories.length - 1])];
      });
      for (const index of indices) {
        await page.evaluate((index) => {
          const t = window.__ST.getAll().find((t) => t.trigger?.id === "history");
          const count = document.querySelectorAll("[data-history-year]").length;
          const progress = Math.max(0.00001, (index * 30) / ((count - 1) * 30 + 40));
          window.scrollTo(0, t.start + (t.end - t.start) * progress);
        }, index);
        await delay(750);
        const geometry = await page.evaluate(() => {
          const rect = (selector) => {
            const r = document.querySelector(selector).getBoundingClientRect();
            return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
          };
          return {
            photo: rect("[data-history-photo]"),
            year: rect('[data-history-year][data-active="true"]'),
            copy: rect(document.querySelector("#history").dataset.wheel === "tall"
              ? "[data-history-portrait-copy]" : '[data-history-copy][data-active="true"]'),
            title: rect("#history h2"),
            launcher: rect("button[data-assistant]"),
          };
        });
        assert.ok(!overlaps(geometry.photo, geometry.year), `${width}x${height} ${motion}: photo overlaps year ${index}`);
        assert.ok(!overlaps(geometry.photo, geometry.copy), `${width}x${height} ${motion}: photo overlaps story ${index}`);
        assert.ok(!overlaps(geometry.photo, geometry.title), "photo must not cover heading");
        assert.ok(!overlaps(geometry.copy, geometry.launcher), "chat launcher must not cover history text");
        for (const [name, r] of Object.entries(geometry)) {
          assert.ok(r.left >= -2 && r.right <= width + 2 && r.top >= 0 && r.bottom <= height + 2,
            `${width}x${height} ${motion}: ${name} is clipped: ${JSON.stringify(r)}`);
        }
      }

      // Check the actual looping animations, including their rendered travel,
      // so the old 0.01ms override cannot pass by merely preserving class names.
      const ticker = await page.evaluate(() => {
        const rows = [...document.querySelectorAll(".animate-marquee,.animate-marquee-rev")];
        rows[0].closest("section").scrollIntoView();
        return rows.map((row) => {
          const cs = getComputedStyle(row);
          return { duration: cs.animationDuration, iterations: cs.animationIterationCount };
        });
      });
      assert.deepEqual(ticker.map((row) => row.duration), ["48s", "56s"]);
      assert.ok(ticker.every((row) => row.iterations === "infinite"));
      const offsets = () => page.evaluate(() => [...document.querySelectorAll(".animate-marquee,.animate-marquee-rev")]
        .map((row) => new DOMMatrixReadOnly(getComputedStyle(row).transform).m41));
      const before = await offsets();
      await delay(250);
      const after = await offsets();
      assert.ok(after.every((x, i) => Math.abs(x - before[i]) > 0.5 && Math.abs(x - before[i]) < 100),
        "ticker must move at a readable speed");

      const sections = await page.evaluate(() => [...document.querySelectorAll("main > section")]
        .map((section) => ({ top: section.getBoundingClientRect().top + scrollY })));
      for (const section of sections) {
        await page.evaluate((top) => window.scrollTo(0, top), section.top);
        await delay(60);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true,
          `${width}x${height}: page has horizontal overflow`);
      }
      assert.deepEqual(errors, [], "no browser errors while traversing sections");
      console.log(`PASS ${width}x${height} ${motion}: history geometry, ticker speed, ${sections.length} section overflow checks`);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
