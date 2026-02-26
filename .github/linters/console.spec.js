const { test, expect } = require("@playwright/test");

const URL = process.env.CHECK_URL || "http://127.0.0.1:8080/index.html";

test("no DevTools console/page errors", async ({ page }) => {
  const errors = [];
  const seen = new Set();

  const push = (msg) => {
    if (!seen.has(msg)) {
      seen.add(msg);
      errors.push(msg);
    }
  };

  // JS console errors (what you see in DevTools Console)
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      push(`console.error: ${msg.text()}`);
    }
  });

  // Uncaught exceptions / page crashes
  page.on("pageerror", (err) => {
    push(`pageerror: ${String(err)}`);
  });

  // Network-level failures (DNS, connection refused, etc.)
  page.on("requestfailed", (req) => {
    const f = req.failure();
    push(`requestfailed: ${req.url()} (${f?.errorText || "unknown"})`);
  });

  // HTTP errors that still "succeed" as requests (e.g. 404 favicon.ico)
  page.on("response", async (resp) => {
    const status = resp.status();
    if (status >= 400) {
      const req = resp.request();
      const type = req.resourceType(); // document, script, xhr, fetch, image, etc.
      push(`http ${status}: ${resp.url()} (type=${type})`);
    }
  });

  await page.goto(URL, { waitUntil: "load", timeout: 30000 });

  // Give async fetches a moment to finish + errors to surface
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(500);

  expect(errors, errors.join("\n")).toEqual([]);
});