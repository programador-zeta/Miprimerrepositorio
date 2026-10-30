import { test, expect } from "@playwright/test";
test("mobile home opens the real unclaimed NFC tag", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Tu historia.",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("img", { name: "Somewhere", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "Boceto del Somewhere Tag azul",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ver tag verde" }).click();
  await expect(
    page.getByRole("img", {
      name: "Boceto del Somewhere Tag verde",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Descubre tu Somewhere" }).click();
  await expect(page).toHaveURL(/\/t\/SW0001$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Este tag aún",
  );
  await expect(
    page.getByRole("link", { name: "Activar mi tag" }),
  ).toHaveAttribute("href", "/activate/SW0001");
  await expect(page.locator("body")).not.toContainText("LOCAL-SW-2026");
});
test("unknown tag shows an actual 404", async ({ page }) => {
  const response = await page.goto("/t/NOTFOUND123");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Por aquí",
  );
});
