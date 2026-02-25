const { test, expect } = require("@playwright/test");

const URL =
  process.env.CHECK_URL || "http://127.0.0.1:8080/index.html";

test("no DevTools console/page errors", async ({ page }) => {
  const errors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`console.error: ${msg.text()}`);
    }
  });

  page.on("pageerror", (err) => {
    errors.push(`pageerror: ${String(err)}`);
  });

  page.on("requestfailed", (req) => {
    const f = req.failure();
    errors.push(
      `requestfailed: ${req.url()} (${f?.errorText || "unknown"})`
    );
  });

  await page.goto(URL, { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(1500);

  expect(errors, errors.join("\n")).toEqual([]);
});