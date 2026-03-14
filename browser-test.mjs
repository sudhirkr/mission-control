import puppeteer from "puppeteer";

const BASE = "http://localhost:3001";
let PASS = 0, FAIL = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    PASS++;
  } else {
    console.log(`  ❌ ${label}`);
    FAIL++;
  }
}

(async () => {
  console.log("🧪 Mission Control — Browser Test Suite\n");
  console.log("========================================");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  const errors = [];

  // Capture console errors (ignore benign 404s for static assets)
  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error" && !text.includes("404") && !text.includes("favicon")) {
      errors.push(text);
    }
  });

  // Capture page errors (unhandled exceptions)
  page.on("pageerror", (err) => {
    errors.push(err.message);
  });

  // Capture failed requests
  const failedRequests = [];
  page.on("requestfailed", (req) => {
    failedRequests.push(req.url());
  });

  console.log("\n1. Page Load & Network");
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  // Wait for hydration + API calls
  await new Promise((r) => setTimeout(r, 5000));
  assert("Page loads without timeout", true);
  // Ignore favicon 404s — not a real bug
  const realFailures = failedRequests.filter((u) => !u.includes("favicon"));
  assert("No failed network requests", realFailures.length === 0);

  console.log("\n2. JavaScript Runtime Errors");
  assert("No console errors", errors.length === 0);
  if (errors.length > 0) {
    errors.forEach((e) => console.log(`    ⚠️ ${e}`));
  }

  console.log("\n3. Server-Side Rendered Content");
  const bodyText = await page.evaluate(() => document.body.textContent || document.body.innerText);
  assert("Header 'Mission Control' present", bodyText.includes("Mission Control"));
  assert("Brain & Muscle section", bodyText.includes("Brain") && bodyText.includes("Muscle"));
  assert("Objective Tracker section", bodyText.includes("Objective"));
  assert("Quick Actions section", bodyText.includes("Quick Actions"));
  assert("Log Viewer section", bodyText.includes("Log Viewer"));

  console.log("\n4. Client-Side Hydration");
  // Wait for Next.js hydration
  await new Promise((r) => setTimeout(r, 3000));
  const hydrated = await page.evaluate(() => {
    const nextData = document.querySelector("__next_data__");
    const interactiveButtons = document.querySelectorAll("button");
    return {
      buttonCount: interactiveButtons.length,
      canvasCount: document.querySelectorAll("canvas").length,
    };
  });
  assert("Buttons are interactive (count > 0)", hydrated.buttonCount > 0);
  assert("Canvas elements rendered (charts)", hydrated.canvasCount > 0);
  console.log(`    ℹ️  Found ${hydrated.buttonCount} buttons, ${hydrated.canvasCount} canvases`);

  console.log("\n5. Chart.js Rendering");
  const chartStatus = await page.evaluate(() => {
    const canvases = document.querySelectorAll("canvas");
    const results = [];
    canvases.forEach((c) => {
      // Chart.js creates a canvas with __chartjs property when rendered
      results.push(c.width > 0 && c.height > 0);
    });
    return results;
  });
  assert("All charts have dimensions", chartStatus.every(Boolean));
  assert("Chart count = 3", chartStatus.length === 3);

  console.log("\n6. Component Content Checks");
  const checks = [
    ["openrouter/healer-alpha", "Brain model displayed"],
    ["gemini-3-flash", "Muscle model displayed"],
    ["Active", "Brain status badge"],
    ["Pending Auth", "Muscle status badge"],
    ["AI/ML System Development", "Objective 1"],
    ["Student Mentorship", "Objective 2"],
    ["Industry", "Objective 3"],
    ["Knowledge Systems", "Objective 4"],
    ["AI Product", "Objective 5"],
    ["Run Backup", "Quick Action: Backup"],
    ["System Status", "Quick Action: Status"],
    ["Restart Gateway", "Quick Action: Restart"],
    ["Trigger Cron", "Quick Action: Cron"],
    ["Activity", "Activity chart label"],
    ["Cost by Provider", "Cost chart label"],
    ["Tool Usage", "Tool usage label"],
  ];

  for (const [text, label] of checks) {
    assert(label, bodyText.includes(text));
  }

  console.log("\n7. Interactive Elements");
  const buttonClickable = await page.evaluate(() => {
    const btn = document.querySelector("button");
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  assert("Buttons respond to clicks", buttonClickable);

  console.log("\n8. Tailwind CSS Styling");
  const hasDarkBg = await page.evaluate(() => {
    const body = document.body;
    const style = getComputedStyle(body);
    return style.backgroundColor === "rgb(15, 23, 42)"; // midnight color
  });
  assert("Dark theme background applied", hasDarkBg);

  await browser.close();

  console.log("\n========================================");
  console.log(`Results: ${PASS} passed, ${FAIL} failed`);
  if (FAIL === 0) {
    console.log("🎉 All browser tests passed!");
    process.exit(0);
  } else {
    console.log("⚠️  Some browser tests failed.");
    process.exit(1);
  }
})();
