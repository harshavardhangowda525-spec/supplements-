/**
 * End-to-end smoke test of the critical shopping flows (runs against a live server).
 *
 *   npm run build && npm start         # in one terminal
 *   BASE_URL=http://localhost:3000 npm run e2e
 *
 * Requires Playwright (`npm i -D playwright && npx playwright install chromium`).
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium");
  process.exit(1);
}

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const results = [];
async function step(name, fn) {
  try {
    await fn();
    results.push(["PASS", name]);
  } catch (e) {
    results.push(["FAIL", name, e.message.split("\n")[0]]);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await step("Home page renders hero + CTAs", async () => {
  await page.goto(BASE, { waitUntil: "networkidle" });
  assert((await page.title()).includes("Fitzone"), "title missing Fitzone");
  for (const label of ["Shop supplements", "Explore categories", "Get directions"]) {
    assert(await page.getByRole("link", { name: new RegExp(label, "i") }).first().isVisible(), `${label} CTA missing`);
  }
  const dir = await page.getByRole("link", { name: /get directions/i }).first().getAttribute("href");
  assert(dir.startsWith("https://www.google.com/maps/dir/"), "directions link wrong");
});

await step("Floating WhatsApp button uses business number", async () => {
  const href = await page.getByRole("link", { name: /chat with fitzone supplements on whatsapp/i }).getAttribute("href");
  assert(href.startsWith("https://wa.me/919686860337?text="), `bad href ${href}`);
});

await step("Shop filters narrow results via URL", async () => {
  await page.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
  const before = await page.locator("article").count();
  await page.getByText("Creatine", { exact: true }).first().click();
  await page.waitForURL(/category=creatine/);
  await page.waitForTimeout(600);
  const after = await page.locator("article").count();
  assert(after > 0 && after < before, `expected fewer results (${before} → ${after})`);
});

await step("Product page: variant, quantity, add to cart opens drawer", async () => {
  await page.goto(`${BASE}/product/demo-whey-protein-blend`, { waitUntil: "networkidle" });
  await page.getByText("2 kg · Chocolate").first().click();
  await page.getByRole("button", { name: "Increase quantity" }).first().click();
  await page.getByRole("button", { name: /^add to cart$/i }).first().click();
  await page.getByRole("dialog").waitFor({ timeout: 5000 });
  const dialog = page.getByRole("dialog");
  assert(await dialog.getByText("2 kg · Chocolate").isVisible(), "variant not in cart");
  assert((await dialog.getByText("Your cart (2)").count()) === 1, "cart count should be 2");
});

await step("Order-via-WhatsApp prefilled message is correct and encoded", async () => {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  const href = await page.getByRole("link", { name: /order via whatsapp/i }).getAttribute("href");
  const text = new URL(href).searchParams.get("text");
  assert(
    text === "Hello Fitzone Supplements! I'm interested in Demo Whey Protein Blend - 2 kg · Chocolate. Could you please confirm availability and price?",
    `unexpected text: ${text}`,
  );
  assert(!href.includes(" "), "href not encoded");
});

await step("Cart persists across navigation; quantity adjusts; removal works", async () => {
  await page.goto(`${BASE}/cart`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Order summary" }).waitFor();
  assert(await page.getByText("Demo Whey Protein Blend").first().isVisible(), "item missing on cart page");
  await page.getByRole("button", { name: "Increase quantity" }).first().click();
  await page.waitForTimeout(200);
  assert((await page.getByText("₹13,797").count()) > 0, "subtotal should update to 3 × ₹4,599");
});

await step("Cart checkout opens WhatsApp with the cart inquiry", async () => {
  const [popup] = await Promise.all([
    page.waitForEvent("popup", { timeout: 5000 }),
    page.getByRole("button", { name: /send order inquiry on whatsapp/i }).click(),
  ]);
  const url = popup.url();
  await popup.close();
  assert(/wa\.me\/919686860337|api\.whatsapp\.com\/send/.test(url), `unexpected popup url ${url}`);
  const text = decodeURIComponent(url.replace(/\+/g, " "));
  assert(text.includes("Demo Whey Protein Blend - 2 kg · Chocolate × 3"), "cart line missing in message");
});

await step("Removing the last item empties the cart", async () => {
  await page.getByRole("button", { name: /remove demo whey protein blend/i }).click();
  await page.getByText("Your cart is empty").waitFor({ timeout: 5000 });
});

await step("Contact form validates server-side", async () => {
  await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /send inquiry/i }).click();
  await page.getByText(/please check the highlighted fields/i).waitFor({ timeout: 8000 });
});

await step("Admin is protected / shows setup in demo mode", async () => {
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  const body = await page.textContent("body");
  assert(/Demo mode|Sign in/i.test(body), "admin should show setup or login");
});

await step("Unknown routes return the 404 page", async () => {
  const res = await page.goto(`${BASE}/definitely-not-a-page`);
  assert(res.status() === 404, `status ${res.status()}`);
});

await step("SEO files exist", async () => {
  for (const p of ["/robots.txt", "/sitemap.xml", "/opengraph-image"]) {
    const res = await page.request.get(`${BASE}${p}`);
    assert(res.ok(), `${p} → ${res.status()}`);
  }
});

await step("Mobile: hamburger menu opens and navigates", async () => {
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await m.goto(BASE, { waitUntil: "networkidle" });
  await m.getByRole("button", { name: "Open menu" }).click();
  await m.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "About" }).click();
  await m.waitForURL(/\/about/);
  await m.close();
});

await step("No uncaught page errors", async () => {
  assert(errors.length === 0, errors.join(" | "));
});

await browser.close();
for (const [s, n, e] of results) console.log(`${s === "PASS" ? "✔" : "✘"} ${n}${e ? ` — ${e}` : ""}`);
const failed = results.filter((r) => r[0] === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
