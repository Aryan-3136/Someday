/* Run with: node scripts/verify-browser.cjs (dev server on port 5173). */
const { chromium, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
(async () => {
  const artifactDir = process.env.SOMEDAY_ARTIFACTS || "/tmp/someday-browser";
  fs.mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
    headless: true,
  });
  let checks = 0;
  const errors = [];
  const external = [];
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type())) errors.push(m.text());
  });
  page.on("request", (r) => {
    if (
      !r.url().startsWith("http://127.0.0.1:5173") &&
      !r.url().startsWith("data:")
    )
      external.push(r.url());
  });
  const verify = async (label, fn) => {
    await fn();
    checks++;
    console.log("PASS", label);
  };
  await page.goto("http://127.0.0.1:5173/");
  await verify("redirect, example budget and clamp", async () => {
    await expect(page).toHaveURL(/\/month$/);
    await expect(page.locator(".summary-room strong")).toContainText("2,500");
    await page.getByLabel("Money coming in", { exact: true }).fill("6000");
    await expect(
      page.getByLabel("Your monthly contribution", { exact: true }),
    ).toHaveValue("500");
    await expect(page.getByRole("status").first()).toContainText("reduced");
    await page.getByLabel("Money coming in", { exact: true }).fill("2000");
    await expect(page.getByText(/Going out is/)).toBeVisible();
    await expect(
      page.getByLabel("Your monthly contribution", { exact: true }),
    ).toHaveValue("");
  });
  await verify(
    "blank, zero income, negative validation and example recovery",
    async () => {
      await page
        .getByRole("button", { name: "Start with a blank budget" })
        .click();
      await expect(page.getByText("Start with what you know.")).toBeVisible();
      await page.getByLabel("Money coming in", { exact: true }).fill("-5");
      await expect(
        page.getByText("Enter a whole, positive rupee amount."),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Explore with the example budget" })
        .click();
      await expect(page.locator(".summary-room strong")).toContainText("2,500");
    },
  );
  await verify(
    "future goal, allocations, chart, real-value toggle and disclosures",
    async () => {
      await page.getByRole("link", { name: "Build my future" }).click();
      await expect(page).toHaveURL(/\/future$/);
      await expect(page.locator("h1")).toBeFocused();
      await page.getByRole("button", { name: "₹5 lakh", exact: true }).click();
      await expect(page.getByLabel("Your goal", { exact: true })).toHaveValue(
        "5,00,000",
      );
      await page
        .getByRole("slider", { name: "For accessible emergency savings" })
        .fill("40");
      await expect(
        page.getByRole("slider", { name: "For accessible emergency savings" }),
      ).toHaveAttribute("aria-valuetext", /40%/);
      await page
        .getByRole("slider", { name: "Take a closer look at year" })
        .fill("12");
      const original = await page.locator(".selected-values").innerText();
      await page.getByLabel("Today’s money", { exact: true }).check();
      expect(await page.locator(".selected-values").innerText()).not.toBe(
        original,
      );
      await page
        .getByRole("slider", { name: "Growth-oriented share" })
        .fill("50");
      await page.getByRole("button", { name: "Compare two options" }).click();
      await page.getByLabel("First option").selectOption("3");
      await expect(page.getByRole("table").first()).toContainText("Gold");
      await page
        .getByRole("button", { name: "The options, in plain language" })
        .click();
      await page
        .getByRole("button", { name: "Savings account", exact: true })
        .click();
      await expect(
        page.getByText("A place to keep cash with a bank"),
      ).toBeVisible();
      await page.getByRole("button", { name: "A SIP is a habit" }).click();
      await expect(
        page.getByText("A systematic investment plan (SIP)"),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "What if my income grows?" })
        .click();
      await page
        .getByRole("slider", { name: "Annual contribution step-up" })
        .fill("10");
      await expect(page.getByText("With a 10% annual increase")).toBeVisible();
    },
  );
  await verify(
    "plan saving, dirty state, restore and hard refresh",
    async () => {
      await page.getByRole("link", { name: "See my plan" }).click();
      await page
        .getByRole("button", { name: "Save my plan", exact: true })
        .click();
      await expect(page.locator(".status-badge")).toHaveText("Saved");
      await page
        .getByRole("link", { name: "Edit my month", exact: true })
        .click();
      await page.getByLabel("Money coming in", { exact: true }).fill("9000");
      await expect(page.locator(".status-badge")).toContainText(
        "Unsaved changes",
      );
      await page
        .getByRole("button", { name: "Restore saved copy", exact: true })
        .click();
      await expect(
        page.getByLabel("Money coming in", { exact: true }),
      ).toHaveValue("8,000");
      await page.goto("http://127.0.0.1:5173/plan");
      await page.reload();
      await expect(page.locator(".status-badge")).toHaveText("Saved");
    },
  );
  await verify("downturn paths and behaviours respond", async () => {
    await page
      .getByRole("slider", { name: "Year of the market fall" })
      .fill("3");
    await page.getByLabel("What happens after the fall?").selectOption("weak");
    await expect(page.locator(".path-note")).toContainText("0% for 3 years");
    await page
      .getByRole("slider", { name: "If you choose to withdraw" })
      .fill("40");
    await expect(page.locator(".downturn-table")).toContainText("Withdraw 40%");
    await page
      .getByRole("button", { name: "See all three possible market paths" })
      .click();
    await expect(page.locator(".path-list li")).toHaveCount(3);
  });
  await verify(
    "practice advances and resets without touching saved plan",
    async () => {
      const saved = await page.evaluate(() =>
        localStorage.getItem("someday:v1"),
      );
      await page
        .getByRole("button", { name: "Try it before you live it." })
        .click();
      await page.getByRole("button", { name: "Advance one month" }).click();
      await expect(page.locator(".practice-month")).toContainText("Month 1");
      await page.getByRole("button", { name: "Holdings details" }).click();
      await expect(
        page.getByText("Growth holdings", { exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Reset practice", exact: true })
        .click();
      await expect(page.locator(".practice-month")).toContainText("Month 0");
      expect(
        await page.evaluate(() => localStorage.getItem("someday:v1")),
      ).toBe(saved);
    },
  );
  await verify("check-in, download and print handler", async () => {
    await page.getByRole("button", { name: "Still feels right." }).click();
    await expect(page.getByText(/Last check-in:/)).toBeVisible();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download summary" }).click();
    const file = await download;
    await file.saveAs(path.join(artifactDir, file.suggestedFilename()));
    expect(
      fs.readFileSync(path.join(artifactDir, file.suggestedFilename()), "utf8"),
    ).toContain("ASSUMPTIONS");
    await page.evaluate(() => {
      window.print = () => {
        window.__printed = true;
      };
    });
    await page.getByRole("button", { name: "Print / PDF" }).click();
    expect(await page.evaluate(() => window.__printed)).toBe(true);
  });
  await verify("keyboard dialog, trap, Escape and focus return", async () => {
    const help = page.getByRole("button", {
      name: "A little help",
      exact: true,
    });
    await help.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    const first = page.getByRole("button", { name: "Close dialog" });
    await expect(first).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    expect(
      await page.evaluate(() =>
        document
          .querySelector("[role=dialog]")
          .contains(document.activeElement),
      ),
    ).toBe(true);
    await page.keyboard.press("Tab");
    await expect(first).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(help).toBeFocused();
  });
  await verify(
    "reset cancellation preserves plan; confirmed clear removes only plan",
    async () => {
      await page
        .getByRole("button", { name: "Reset budget", exact: true })
        .click();
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(page.locator(".status-badge")).toHaveText("Saved");
      await page
        .getByRole("button", { name: "Reset budget", exact: true })
        .click();
      await page.getByLabel("Also delete my saved plan").check();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Reset budget" })
        .click();
      await expect(page.locator(".status-badge")).toHaveText("Draft");
      expect(
        await page.evaluate(() => localStorage.getItem("someday:v1")),
      ).toBeNull();
      expect(
        await page.evaluate(() => localStorage.getItem("someday:checkins:v1")),
      ).not.toBeNull();
    },
  );
  await verify("zero-contribution future and plan remain usable", async () => {
    await page.goto("http://127.0.0.1:5173/month");
    await page
      .getByRole("button", { name: "Start with a blank budget" })
      .click();
    await page.getByRole("link", { name: "Build my future" }).click();
    await expect(page.getByText("No rush to make a projection.")).toBeVisible();
    expect(await page.locator("main").innerText()).not.toMatch(/NaN|Infinity/);
    await page.getByRole("link", { name: "See my plan" }).click();
    expect(await page.locator("main").innerText()).not.toMatch(/NaN|Infinity/);
  });
  await verify("Back / Forward and friendly 404", async () => {
    await page.goto("http://127.0.0.1:5173/month");
    await page.getByRole("link", { name: "Build my future" }).click();
    await page.goBack();
    await expect(page).toHaveURL(/\/month$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/future$/);
    await page.goto("http://127.0.0.1:5173/missing");
    await expect(page.locator("h1")).toContainText("your way back.");
    await expect(
      page.getByRole("link", { name: "My month", exact: true }).last(),
    ).toBeVisible();
  });
  await verify("corrupt storage is discarded without a crash", async () => {
    await page.evaluate(() => localStorage.setItem("someday:v1", "{broken"));
    await page.reload();
    await expect(page.getByText(/saved data could not be read/)).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem("someday:v1")),
    ).toBeNull();
  });
  await verify(
    "blocked storage keeps download and print available",
    async () => {
      const blocked = await browser.newContext();
      await blocked.addInitScript(() => {
        Storage.prototype.getItem = () => {
          throw new Error("blocked");
        };
        Storage.prototype.setItem = () => {
          throw new Error("blocked");
        };
        Storage.prototype.removeItem = () => {
          throw new Error("blocked");
        };
      });
      const p = await blocked.newPage();
      await p.goto("http://127.0.0.1:5173/plan");
      await expect(p.getByText(/Browser storage is unavailable/)).toBeVisible();
      await p
        .getByRole("button", { name: "Save my plan", exact: true })
        .click();
      await expect(
        p.getByText(/We couldn’t save|We couldn't save/),
      ).toBeVisible();
      await expect(
        p.getByRole("button", { name: "Download summary" }),
      ).toBeEnabled();
      await expect(
        p.getByRole("button", { name: "Print / PDF" }),
      ).toBeEnabled();
      await blocked.close();
    },
  );
  await verify("keyboard-only route journey and slider arrows", async () => {
    await page.goto("http://127.0.0.1:5173/month");
    const tabTo = async (locator) => {
      for (let i = 0; i < 90; i++) {
        if (await locator.evaluate((el) => el === document.activeElement))
          return;
        await page.keyboard.press("Tab");
      }
      throw new Error("Control could not be reached by Tab");
    };
    await tabTo(
      page.getByRole("slider", { name: "Find your comfortable amount" }),
    );
    const before = +(await page
      .getByRole("slider", { name: "Find your comfortable amount" })
      .inputValue());
    await page.keyboard.press("ArrowLeft");
    expect(
      +(await page
        .getByRole("slider", { name: "Find your comfortable amount" })
        .inputValue()),
    ).toBeLessThan(before);
    await tabTo(page.getByRole("link", { name: "Build my future" }));
    await page.keyboard.press("Enter");
    await expect(page.locator("h1")).toBeFocused();
    await tabTo(page.getByRole("link", { name: "See my plan" }));
    await page.keyboard.press("Enter");
    await expect(page.locator("h1")).toBeFocused();
    await tabTo(
      page.getByRole("button", { name: "Save my plan", exact: true }),
    );
    await page.keyboard.press("Enter");
    await expect(page.locator(".status-badge")).toHaveText("Saved");
    await page.evaluate(() => {
      localStorage.removeItem("someday:v1");
      localStorage.removeItem("someday:checkins:v1");
    });
  });
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["month", "future", "plan"]) {
      await page.goto("http://127.0.0.1:5173/" + route);
      await page.evaluate(() => document.fonts.ready);
      await verify(`${width}px ${route}: no page overflow`, async () =>
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width),
      );
      await page.screenshot({
        path: path.join(artifactDir, `${route}-${width}.png`),
        fullPage: true,
      });
    }
  }
  await verify(
    "no runtime console warnings/errors or external requests",
    async () => {
      expect(errors).toEqual([]);
      expect(external).toEqual([]);
    },
  );
  await browser.close();
  console.log(`${checks} browser checks passed. Screenshots: ${artifactDir}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
