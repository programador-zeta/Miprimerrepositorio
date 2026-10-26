import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
const config = JSON.parse(
  execFileSync(".local-tools/supabase", ["status", "-o", "json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }),
);
const admin = createClient(config.API_URL, config.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const suffix = Date.now().toString(36),
  code = "E2E" + suffix.toUpperCase(),
  email = `e2e-${suffix}@example.test`,
  password = `Test-${suffix}-938A!`;
let userId: string | undefined;
test.beforeAll(async () => {
  const { data, error } = await admin
    .from("tags")
    .select("activation_code")
    .eq("public_code", "SW0001")
    .single();
  expect(error).toBeNull();
  expect(
    (
      await admin
        .from("tags")
        .insert({ public_code: code, activation_code: data!.activation_code })
    ).error,
  ).toBeNull();
});
test.afterAll(async () => {
  await admin.from("tags").delete().eq("public_code", code);
  if (!userId) {
    const { data } = await admin.auth.admin.listUsers();
    userId = data.users.find((u) => u.email === email)?.id;
  }
  if (userId) {
    for (const bucket of ["avatars", "experience-photos"]) {
      const { data: files } = await admin.storage.from(bucket).list(userId);
      if (files?.length)
        await admin.storage
          .from(bucket)
          .remove(files.map((f) => userId + "/" + f.name));
    }
    expect((await admin.auth.admin.deleteUser(userId)).error).toBeNull();
  }
});
test("full Somewhere lifecycle: activation, profile, emergency, private experiences and tag management", async ({
  page,
  browser,
}) => {
  test.setTimeout(60000);
  await page.goto(`/t/${code}`);
  await page.getByRole("link", { name: "Activar mi tag" }).click();
  await expect(page).toHaveURL(/\/login\?next=/);
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Crear mi cuenta" }).click();
  await expect(page).toHaveURL(new RegExp(`/activate/${code}$`));
  await page.getByLabel("Código secreto de activación").fill("incorrect-code");
  await page.getByRole("button", { name: "Activar mi tag" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "No pudimos activar" }),
  ).toBeVisible();
  await page.getByLabel("Código secreto de activación").fill("LOCAL-SW-2026");
  await page.getByRole("button", { name: "Activar mi tag" }).click();
  await expect(page).toHaveURL(/\/dashboard\?activated=1/);
  await expect(page.getByRole("status")).toContainText("ya está activo");
  await expect(page.locator(".dashboard-metrics strong").nth(2)).toHaveText("1");
  await page.getByRole("link", { name: "Tags", exact: true }).click();
  await expect(page.getByText(code, { exact: true })).toBeVisible();
  await page.goto("/dashboard");
  await page.reload();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.getByRole("link", { name: "Perfil", exact: true }).click();
  await page.getByLabel("Nombre", { exact: true }).fill("Mariana Torres");
  await page.getByLabel(/^Nombre de usuario/).fill("traveler_" + suffix);
  await page.getByLabel("Ciudad", { exact: true }).fill("Ciudad de México");
  await page.getByLabel("Bio", { exact: true }).fill("Una historia de prueba.");
  await page
    .getByLabel(/^Foto de perfil/)
    .setInputFiles("public/images/mountains.jpg");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("status")).toContainText("Perfil guardado");
  await page.getByRole("link", { name: "Ver perfil público" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Mariana Torres",
  );
  const photo = page.getByRole("img", { name: "Foto de Mariana Torres" });
  await expect(photo).toBeVisible();
  await expect
    .poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await page.goto("/dashboard/emergency");
  await page
    .getByLabel("Contacto de emergencia", { exact: true })
    .fill("Contacto de prueba");
  await page
    .getByLabel("Teléfono del contacto", { exact: true })
    .fill("+525555555555");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Información de emergencia guardada",
  );
  await page.getByRole("link", { name: "Ver página de emergencia" }).click();
  await expect(
    page.getByRole("link", { name: "Llamar ahora" }),
  ).toHaveAttribute("href", "tel:+525555555555");
  await expect(
    page.getByText("No especificado por el propietario.", { exact: true }),
  ).toHaveCount(3);
  await page.goto("/dashboard/experiences");
  await page
    .getByLabel("Nombre de la experiencia", { exact: true })
    .fill("La primera salida");
  await page.getByLabel("Lugar", { exact: true }).fill("Lugar de prueba");
  await page.getByLabel("Fecha", { exact: true }).fill("2026-01-12");
  await page
    .getByLabel(/^Fotografía/)
    .setInputFiles("public/images/mountains.jpg");
  await page.getByRole("button", { name: "Crear experiencia" }).click();
  await expect(page.getByRole("status")).toContainText("Experiencia guardada");
  const { data: profile } = await admin
    .from("profiles")
    .select("user_id")
    .eq("username", "traveler_" + suffix)
    .single();
  userId = profile!.user_id;
  const { data: experience } = await admin
    .from("experiences")
    .select("id,photo_url")
    .eq("user_id", userId)
    .single();
  const visitor = await browser.newContext();
  const publicPage = await visitor.newPage();
  await publicPage.goto(`/u/traveler_${suffix}/experiences`);
  await expect(
    publicPage.getByRole("heading", { name: "La primera salida" }),
  ).toHaveCount(0);
  const privatePhoto = await visitor.request.get(
    `/media/experience-photos/${experience!.photo_url}`,
  );
  expect(privatePhoto.status()).toBe(404);
  await page.getByRole("link", { name: "Editar", exact: true }).click();
  await expect(page).toHaveURL(/dashboard\/experiences\?id=/);
  await page.getByLabel("Visibilidad", { exact: true }).selectOption("public");
  await page.getByRole("button", { name: "Guardar experiencia" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Experiencia actualizada",
  );
  await publicPage.reload();
  await expect(
    publicPage.getByRole("heading", { name: "La primera salida" }),
  ).toBeVisible();
  expect(
    (
      await visitor.request.get(
        `/media/experience-photos/${experience!.photo_url}`,
      )
    ).status(),
  ).toBe(200);
  await publicPage.getByRole("link", { name: "Ver resumen" }).click();
  await expect(publicPage.locator(".summary-total strong")).toHaveText("1");
  await page.goto("/dashboard/tags");
  await page.getByRole("button", { name: "Deshabilitar tag" }).click();
  await expect(page.getByRole("status")).toContainText("Tag deshabilitado");
  await publicPage.goto(`/t/${code}`);
  await expect(
    publicPage.getByText("Este Somewhere Tag no está disponible.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reactivar tag" }).click();
  await expect(page.getByRole("status")).toContainText("Tag reactivado");
  await publicPage.goto(`/t/${code}`);
  await expect(publicPage).toHaveURL(`/u/traveler_${suffix}`);
  await page.goto("/dashboard/experiences");
  await page.getByText("Eliminar experiencia", { exact: true }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Eliminar definitivamente" }).click();
  await expect(
    page.getByRole("heading", { name: "La primera salida" }),
  ).toHaveCount(0);
  expect(
    (
      await visitor.request.get(
        `/media/experience-photos/${experience!.photo_url}`,
      )
    ).status(),
  ).toBe(404);
  await publicPage.goto(`/u/traveler_${suffix}/summary`);
  await expect(publicPage.locator(".summary-total strong")).toHaveText("0");
  await visitor.close();
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL("/");
  await page.goto("/dashboard");
  await expect(page).toHaveURL("/login");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL("/dashboard");
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL("/");
});
