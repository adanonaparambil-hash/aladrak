/**
 * Build and serve out/ first, then:
 * node scripts/check-motion.mjs http://localhost:4100 "C:/Program Files/Google/Chrome/Application/chrome.exe"
 * Uses a fresh profile per run. Mobile sizes emulate input/viewport, not Safari.
 */
import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";

const origin = process.argv[2] ?? "http://localhost:4100";
const executablePath = process.argv[3] ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await puppeteer.launch({ executablePath, headless: true });
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function pins(page) {
  return page.evaluate(() => window.__ST.getAll().filter((t) => t.vars.pin).map((t) => ({
    start: t.start,
    end: t.end,
    top: t.pin.parentElement.getBoundingClientRect().top + window.scrollY,
    padding: parseFloat(getComputedStyle(t.pin.parentElement).paddingBottom),
  })));
}

function checkPins(rows, expected) {
  assert.equal(rows.length, expected, "scroll timelines must not be deleted");
  for (const row of rows) {
    assert.ok(Math.abs(row.start - row.top) < 3, `pin start disagrees with layout: ${JSON.stringify(row)}`);
    assert.ok(Math.abs(row.padding - (row.end - row.start)) < 3, "pin must reserve its scroll distance");
  }
}

try {
  for (const mobile of process.argv.includes("--failures-only") ? [] : [false, true]) {
    for (const motion of ["reduce", "no-preference"]) {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.setViewport(mobile
        ? { width: 390, height: 844, isMobile: true, hasTouch: true }
        : { width: 1440, height: 900 });
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: motion }]);
      await page.goto(`${origin}/?diag=1`, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => window.__ST && document.querySelector(".intro-dial"));
      const year = () => page.evaluate(() => [...document.querySelectorAll(".intro-dial span")]
        .filter((el) => /^\d{4}$/.test(el.textContent) && Number(el.style.opacity) > 0)
        .sort((a, b) => Number(b.style.opacity) - Number(a.style.opacity))[0]?.textContent ?? "");
      await delay(2000);
      const first = await year();
      await delay(2200);
      const second = await year();
      assert.ok(first && second && first !== second, `loader count must advance: ${first} -> ${second}`);
      await page.waitForFunction(() => !document.querySelector(".intro-root"), { timeout: 14000 });
      assert.equal(await page.evaluate(() => document.documentElement.classList.contains("is-intro")), false);
      const expected = mobile ? 2 : 4;
      checkPins(await pins(page), expected);

      // Traverse every pin using native scroll, which is the reduced-motion path.
      for (const row of await pins(page)) {
        await page.evaluate((y) => window.scrollTo(0, y), row.start + (row.end - row.start) * 0.5);
        await delay(1100);
        const active = await page.evaluate(() => window.__ST.getAll()
          .filter((t) => t.vars.pin && t.isActive)
          .map((t) => ({ top: t.pin.getBoundingClientRect().top, position: getComputedStyle(t.pin).position })));
        assert.equal(active.length, 1, "only the current section may pin");
        assert.ok(Math.abs(active[0].top) < 3, "active pin must stay at the viewport top");
      }

      const cameraStates = [];
      for (const stop of [0, 3, 6]) {
        await page.evaluate((index) => {
          const t = window.__ST.getAll().find((t) => t.pin?.querySelector("[data-stopcard]"));
          const progress = (t.animation.labels[`stop${index}`] + 1.2) / t.animation.duration();
          window.scrollTo(0, t.start + (t.end - t.start) * progress);
        }, stop);
        await delay(1300);
        const state = await page.evaluate((index) => {
          const cards = [...document.querySelectorAll("[data-stopcard]")];
          const card = cards[index];
          const svg = document.querySelector('svg[aria-label="Al Adrak project locations across Oman"]');
          return {
            opacity: Number(getComputedStyle(card).opacity),
            visibility: getComputedStyle(card).visibility,
            camera: svg.querySelector("g").getAttribute("transform"),
          };
        }, stop);
        assert.ok(state.opacity > 0.9 && state.visibility === "visible", `map stop ${stop} must be readable`);
        cameraStates.push(state.camera);
      }
      assert.equal(new Set(cameraStates).size, 3, "map camera must travel through the regions");

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: motion === "reduce" ? "no-preference" : "reduce" }]);
      await delay(1100);
      checkPins(await pins(page), expected);
      assert.deepEqual(errors, [], "no browser errors");
      console.log(`PASS ${mobile ? "mobile viewport" : "desktop"} / ${motion}: loader, all pins, map stops, preference change`);
      await page.close();
    }
  }

  for (const failure of ["null", "throw", "draw", "ticker"]) {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.evaluateOnNewDocument((mode) => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (...args) {
        if (!this.closest(".intro-root")) return original.apply(this, args);
        if (mode === "null") return null;
        if (mode === "throw") throw new Error("Simulated blocked canvas");
        const context = original.apply(this, args);
        if (mode === "draw" && context) context.clearRect = () => { throw new Error("Simulated drawing failure"); };
        return context;
      };
    }, failure);
    await page.goto(`${origin}/?diag=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.__ST);
    if (failure === "ticker") {
      await page.waitForFunction(() => document.querySelector(".intro-root") &&
        window.__ST.getAll().some((t) => t.animation?.parent));
      const rootId = await page.evaluate(() => {
        let timeline = window.__ST.getAll().find((t) => t.animation?.parent).animation;
        while (timeline.parent) timeline = timeline.parent;
        timeline.pause();
        return timeline.vars.id;
      });
      assert.equal(rootId, "root", "failure test must pause GSAP's global timeline");
    }
    await page.waitForFunction(() => !document.querySelector(".intro-root"), { timeout: 15000 });
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains("is-intro")), false);
    assert.deepEqual(errors, []);
    console.log(`PASS intro failure recovery: ${failure}`);
    await page.close();
  }
} finally {
  await browser.close();
}
