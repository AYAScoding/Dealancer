import { expect, test } from "@playwright/test";

const category = { id: 1, name: "Development" };
const job = {
  id: 14,
  title: "Build a thoughtful portfolio website",
  description:
    "Create a responsive portfolio with accessible navigation and a clear editorial layout.",
  client: "Alex Morgan",
  client_id: "client-1",
  categories: [category],
  skills_required: [{ id: 1, name: "React", category }],
  budget_type: "FIXED",
  budget_min: "1200",
  budget_max: "2400",
  status: "OPEN",
  deadline: "2026-12-10",
  created_at: "2026-10-30T10:00:00Z",
  bid_count: 1,
};
const bid = {
  id: 4,
  job: 14,
  job_title: job.title,
  freelancer: "Jordan Lee",
  freelancer_id: "freelancer-1",
  cover_letter:
    "I can deliver a responsive, accessible portfolio with clear milestones.",
  proposed_amount: "1800",
  estimated_days: 12,
  status: "PENDING",
};

async function fixture(page, role = "FREELANCER", options = {}) {
  let currentJob = { ...job, bids: role === "CLIENT" ? [{ ...bid }] : [] };
  let contracts = options.contracts
    ? [
        {
          id: 2,
          job: 14,
          job_title: job.title,
          job_status: "IN_PROGRESS",
          client: "Alex Morgan",
          freelancer: "Jordan Lee",
          amount: "1800",
          status: "ACTIVE",
          estimated_days: 12,
          bid_cover_letter: bid.cover_letter,
        },
      ]
    : [];
  await page.addInitScript(() =>
    localStorage.setItem("accessToken", "test-only-token"),
  );
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace("/api", "");
    let data;
    if (path === "/auth/me/")
      data = {
        id: role === "CLIENT" ? "client-1" : "freelancer-1",
        first_name: "Alex",
        last_name: "Morgan",
        role,
        is_profile_complete: true,
      };
    else if (path === "/auth/me/profile/")
      data = {
        company_name: "Studio North",
        industry: "Design",
        website: "https://example.com",
        bio: "Independent product developer.",
        hourly_rate: "60",
        skills: [{ id: 1, name: "React", category }],
        categories: [category],
        availability: true,
      };
    else if (path === "/jobs/" || path === "/jobs/my_jobs/")
      data = options.empty ? [] : [currentJob];
    else if (path === "/jobs/14/") data = currentJob;
    else if (path === "/bids/4/accept/") {
      currentJob = {
        ...currentJob,
        status: "IN_PROGRESS",
        bids: [{ ...bid, status: "ACCEPTED" }],
      };
      if (options.hireError)
        return route.fulfill({
          status: 500,
          json: { detail: "Notification failed after commit" },
        });
      data = currentJob.bids[0];
    } else if (path === "/bids/" && route.request().method() === "POST") {
      data = { ...bid, ...route.request().postDataJSON() };
      currentJob = { ...currentJob, bids: [data] };
    } else if (path === "/bids/") data = options.empty ? [] : [bid];
    else if (path === "/contracts/2/complete/") {
      contracts = [
        { ...contracts[0], status: "COMPLETED", job_status: "COMPLETED" },
      ];
      data = contracts[0];
    } else if (path === "/contracts/") data = contracts;
    else if (path === "/categories/") data = [category];
    else if (path === "/skills/") data = [{ id: 1, name: "React", category }];
    else
      return route.fulfill({
        status: 404,
        json: { detail: `Unmocked route ${path}` },
      });
    return route.fulfill({ json: data });
  });
}

async function noOverflow(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}

test("landing and login work at desktop and mobile sizes", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Dealancer", exact: true }),
  ).toBeVisible();
  expect(
    await page
      .locator(".hero > img")
      .evaluate((img) => img.complete && img.naturalWidth > 0),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/landing-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page);
  await page.screenshot({
    path: "test-results/landing-mobile.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Log in", exact: true }).click();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await noOverflow(page);
});

test("marketplace search, filters, proposal, and keyboard dismissal", async ({
  page,
}) => {
  await fixture(page);
  await page.goto("/jobs");
  await expect(page.getByRole("heading", { name: job.title })).toBeVisible();
  await page.getByLabel("Search jobs by title or category").fill("not found");
  await expect(page.getByText("No matching opportunities")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.getByLabel("Budget type").selectOption("HOURLY");
  await expect(page.getByText("No matching opportunities")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.screenshot({
    path: "test-results/marketplace-desktop.png",
    fullPage: true,
  });
  await page.getByRole("heading", { name: job.title }).click();
  await page.getByRole("button", { name: "Submit a proposal" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Submit a proposal" }).click();
  await page.getByLabel("Proposed amount ($)").fill("1800");
  await page.getByLabel("Estimated delivery (days)").fill("12");
  await page.getByLabel("Cover letter").fill(bid.cover_letter);
  await page.getByRole("button", { name: "Send proposal" }).click();
  await expect(
    page.getByText("Your proposal was submitted successfully."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your proposal", exact: true }),
  ).toBeVisible();
});

test("client hiring reconciles a post-commit API failure", async ({ page }) => {
  await fixture(page, "CLIENT", { hireError: true });
  await page.goto("/jobs/14");
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await page.getByRole("button", { name: "Confirm & hire freelancer" }).click();
  await expect(
    page.getByText(
      "Freelancer hired. Your contract is ready in your workspace.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByText("accepted", { exact: true })).toBeVisible();
});

test("real dashboard values and contract completion", async ({ page }) => {
  await fixture(page, "CLIENT", { contracts: true });
  await page.goto("/client/dashboard");
  await expect(page.getByRole("heading", { name: job.title })).toBeVisible();
  await expect(page.locator(".stat-value")).toHaveText(["1", "1", "1", "0"]);
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Contracts 1" }).click();
  await page.getByRole("button", { name: new RegExp(job.title) }).click();
  await page.getByRole("button", { name: "Mark completed" }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(
    page.getByRole("dialog").getByText("completed", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".stat-value")).toHaveText(["0", "1", "0", "1"]);
});

test("mobile navigation, dark theme, profile, and job form", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await fixture(page, "CLIENT");
  await page.goto("/client/dashboard");
  await expect(page.getByRole("heading", { name: job.title })).toBeVisible();
  await noOverflow(page);
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.screenshot({
    path: "test-results/dashboard-mobile-dark.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "My profile" }).first().click();
  await expect(page.getByPlaceholder("Google Inc.")).toBeVisible();
  await noOverflow(page);
  await page.goto("/client/jobs/new");
  await expect(page.locator("input").first()).toBeVisible();
  await noOverflow(page);
  await page.screenshot({
    path: "test-results/job-form-mobile-dark.png",
    fullPage: true,
  });
});

test("empty dashboard does not invent activity", async ({ page }) => {
  await fixture(page, "FREELANCER", { empty: true });
  await page.goto("/freelancer/dashboard");
  await expect(page.locator(".stat-value")).toHaveText(["0", "0", "0", "0"]);
  await expect(page.getByText("No proposals yet")).toBeVisible();
});

test("small mobile and tablet layouts respect reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 768, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Dealancer", exact: true }),
    ).toBeVisible();
    await noOverflow(page);
  }
  await fixture(page);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/jobs");
  await expect(page.getByRole("heading", { name: job.title })).toBeVisible();
  await noOverflow(page);
  await page.getByRole("heading", { name: job.title }).click();
  await noOverflow(page);
  await page.getByRole("button", { name: "Submit a proposal" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await noOverflow(page);
  await page.screenshot({
    path: "test-results/proposal-mobile.png",
    fullPage: true,
  });
});

test("API failures show an error rather than an empty marketplace", async ({
  page,
}) => {
  await fixture(page);
  await page.route("**/api/jobs/?*", (route) =>
    route.fulfill({
      status: 503,
      json: { detail: "Service temporarily unavailable" },
    }),
  );
  await page.goto("/jobs");
  await expect(page.getByRole("alert")).toContainText(
    "Service temporarily unavailable",
  );
  await expect(page.getByText("No matching opportunities")).not.toBeVisible();
});
