import { test, expect } from "@playwright/test";

test("slug inexistente mostra link inválido, não crash", async ({ page }) => {
  await page.goto("/onboarding/does-not-exist");
  await expect(page.getByRole("heading", { name: "Link inválido" })).toBeVisible();
});

test("admin sem sessão é redirecionado para login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});
