import { test, expect } from "@playwright/test";
test("login and signup have distinct submit actions on mobile", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(
    page.getByRole("button", { name: "Iniciar sesión" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Crear mi cuenta" }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Crear una cuenta nueva" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Crea tu",
  );
  await expect(page.getByLabel("Tu nombre", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Crear mi cuenta" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Iniciar sesión" }),
  ).toHaveCount(0);
});
test("invalid confirmation cannot redirect to another site or expose provider text", async ({
  page,
  baseURL,
}) => {
  await page.goto(
    "/auth/confirm?next=https%3A%2F%2Fexample.com&error_description=private-provider-text",
  );
  await expect(page).toHaveURL(
    `${baseURL}/login?next=%2Fdashboard&confirmation=invalid`,
  );
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "No pudimos completar la confirmación" }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText("private-provider-text");
});
