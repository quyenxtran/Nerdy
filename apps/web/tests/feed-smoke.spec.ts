import { expect, test } from "@playwright/test";

test("feed tabs, feedback, debug traces, and share preview stay available", async ({ page, request }) => {
  await page.goto("/app/feed");

  await expect(page.getByRole("heading", { name: /Ranked research/i })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Feed modes" })).toBeVisible();

  await page.getByRole("link", { name: "Graph Nearby" }).click();
  await expect(page).toHaveURL(/mode=graph-nearby/);
  await expect(page.getByText("Graph Nearby").first()).toBeVisible();

  const firstCard = page.locator(".paper-card").first();
  await expect(firstCard.getByText("Why this paper?")).toBeVisible();
  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/api/signals") && response.status() === 201),
    firstCard.getByRole("button", { name: /Show less like this/i }).click()
  ]);
  await expect(firstCard.getByText("Skipped for this session.")).toBeVisible();

  const signals = await request.get("/api/signals");
  await expect(signals).toBeOK();
  await expect(await signals.text()).toContain("paper_skip");

  await page.goto("/app/debug");
  await expect(page.getByRole("heading", { name: /Recommendation trace console/i })).toBeVisible();
  await expect(page.getByText("paper_skip").first()).toBeVisible();

  await page.goto("/share/post-1");
  await expect(page.getByRole("heading")).toContainText("Shape-sensitive molecular descriptors");
});
