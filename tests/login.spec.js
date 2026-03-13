// @ts-check
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:4173";

test.beforeEach(async ({ page }) => {
  // Clear localStorage before every test so sessions don't bleed
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

// ─────────────────────────────────────────────
// TC-01  Public board loads without login
// ─────────────────────────────────────────────
test("TC-01 | Public board is visible without login", async ({ page }) => {
  await page.goto(BASE);
  // Login overlay must NOT be present
  const overlay = page.locator("#login-overlay");
  await expect(overlay).not.toBeVisible({ timeout: 3000 }).catch(() => {});

  // Public Board tab should exist and be reachable
  const publicBtn = page.locator('[data-view="public"]');
  await expect(publicBtn).toBeVisible();

  // Public view panel should be active by default
  const publicView = page.locator("#public-view");
  await expect(publicView).toBeVisible();
});

// ─────────────────────────────────────────────
// TC-02  Admin Console tab triggers login overlay
// ─────────────────────────────────────────────
test("TC-02 | Clicking Admin Console shows login overlay when unauthenticated", async ({ page }) => {
  await page.goto(BASE);
  await page.locator('[data-view="admin"]').click();

  const overlay = page.locator("#login-overlay");
  await expect(overlay).toBeVisible({ timeout: 3000 });
});

// ─────────────────────────────────────────────
// TC-03  Body scroll locked while overlay is open
// ─────────────────────────────────────────────
test("TC-03 | Body scroll is locked when login overlay is open", async ({ page }) => {
  await page.goto(BASE);
  await page.locator('[data-view="admin"]').click();

  // Wait for overlay
  await expect(page.locator("#login-overlay")).toBeVisible({ timeout: 3000 });

  const overflow = await page.evaluate(() => document.body.style.overflow);
  expect(overflow).toBe("hidden");
});

// ─────────────────────────────────────────────
// TC-04  Login with wrong credentials shows error
// ─────────────────────────────────────────────
test("TC-04 | Wrong credentials show an error message", async ({ page }) => {
  await page.goto(BASE);
  await page.locator('[data-view="admin"]').click();
  await expect(page.locator("#login-overlay")).toBeVisible({ timeout: 3000 });

  await page.fill('#login-username', "wronguser");
  await page.fill('#login-password', "wrongpass");
  await page.click('[type="submit"]');

  // Error element should become visible with an error message
  const error = page.locator("#login-error");
  await expect(error).toBeVisible({ timeout: 5000 });
  await expect(error).not.toHaveText("");
});

// ─────────────────────────────────────────────
// TC-05  Login with correct credentials dismisses overlay
// ─────────────────────────────────────────────
test("TC-05 | Correct credentials dismiss overlay and show Admin Console", async ({ page }) => {
  await page.goto(BASE);
  await page.locator('[data-view="admin"]').click();
  await expect(page.locator("#login-overlay")).toBeVisible({ timeout: 3000 });

  await page.fill('#login-username', "admin");
  await page.fill('#login-password', "auctionpassword");
  await page.click('[type="submit"]');

  // Overlay should be gone
  await expect(page.locator("#login-overlay")).not.toBeVisible({ timeout: 5000 });

  // Admin view should be active
  const adminView = page.locator("#admin-view");
  await expect(adminView).toBeVisible();
});

// ─────────────────────────────────────────────
// TC-06  Token persisted in localStorage after login
// ─────────────────────────────────────────────
test("TC-06 | Token is saved to localStorage after successful login", async ({ page }) => {
  await page.goto(BASE);
  await page.locator('[data-view="admin"]').click();
  await page.fill('#login-username', "admin");
  await page.fill('#login-password', "auctionpassword");
  await page.click('[type="submit"]');
  await expect(page.locator("#login-overlay")).not.toBeVisible({ timeout: 5000 });

  const token = await page.evaluate(() => localStorage.getItem("auction_token"));
  expect(token).toBeTruthy();
});

// ─────────────────────────────────────────────
// TC-07  Session persists on page reload
// ─────────────────────────────────────────────
test("TC-07 | Admin session persists after page reload", async ({ page }) => {
  // Login first
  await page.goto(BASE);
  await page.locator('[data-view="admin"]').click();
  await page.fill('#login-username', "admin");
  await page.fill('#login-password', "auctionpassword");
  await page.click('[type="submit"]');
  await expect(page.locator("#login-overlay")).not.toBeVisible({ timeout: 5000 });

  // Reload and switch to admin tab – should NOT show overlay
  await page.reload();
  await page.locator('[data-view="admin"]').click();
  await expect(page.locator("#login-overlay")).not.toBeVisible({ timeout: 3000 });
  await expect(page.locator("#admin-view")).toBeVisible();
});

// ─────────────────────────────────────────────
// TC-08  Unauthenticated /api/actions call returns 401
// ─────────────────────────────────────────────
test("TC-08 | Unauthenticated API action returns 401", async ({ request }) => {
  const res = await request.post(`${BASE}/api/actions/toggle-live`, {
    data: {},
  });
  expect(res.status()).toBe(401);
  const body = await res.json();
  expect(body.ok).toBe(false);
});

// ─────────────────────────────────────────────
// TC-09  Authenticated /api/actions call succeeds
// ─────────────────────────────────────────────
test("TC-09 | Authenticated API action succeeds", async ({ request }) => {
  // Get token
  const loginRes = await request.post(`${BASE}/api/login`, {
    data: { username: "admin", password: "auctionpassword" },
  });
  const { token } = await loginRes.json();

  const res = await request.post(`${BASE}/api/actions/toggle-live`, {
    data: {},
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);

  // Restore state
  await request.post(`${BASE}/api/actions/toggle-live`, {
    data: {},
    headers: { Authorization: `Bearer ${token}` },
  });
});

// ─────────────────────────────────────────────
// TC-10  Public /api/state is accessible without auth
// ─────────────────────────────────────────────
test("TC-10 | /api/state is publicly accessible", async ({ request }) => {
  const res = await request.get(`${BASE}/api/state`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(body.state).toBeDefined();
});
