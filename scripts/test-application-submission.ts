type CategoryOption = {
  id: string;
  slug: string;
  name: string;
  awards: Array<{ id: string; name: string }>;
};

const baseUrl = process.env.TEST_APP_URL ?? "http://localhost:3000";

async function main() {
  const categoriesResponse = await fetch(`${baseUrl}/api/categories`);
  if (!categoriesResponse.ok) {
    throw new Error(`Failed to load categories: ${categoriesResponse.status}`);
  }

  const categories = (await categoriesResponse.json()) as CategoryOption[];
  const category =
    categories.find((item) => item.slug === "body-wellness-nutrition") ?? categories[0];
  const award = category?.awards[0];

  if (!category || !award) {
    throw new Error("No application category and award are available.");
  }

  const formData = new FormData();
  formData.set("firstName", "Local");
  formData.set("lastName", "Smoke Test");
  formData.set("email", `smoke+${Date.now()}@example.com`);
  formData.set("phone", "555-0100");
  formData.set("country", "Canada");
  formData.set("city", "Toronto");
  formData.set("professionalTitle", "Wellness Specialist");
  formData.set("yearsExperience", "5");
  formData.set("categoryId", category.id);
  formData.set("awardId", award.id);
  formData.append("selectedAwardIds", award.id);
  formData.set("websiteUrl", "https://instagram.com/smoke-test");
  formData.set("socialUrl", "https://instagram.com/smoke-test");
  formData.set("heardAbout", "email");
  formData.set("isIbpaMember", "false");
  formData.set("rulesAccepted", "true");
  formData.set("privacyAccepted", "true");
  formData.set("paymentTermsAccepted", "true");
  formData.set("refundNoticeAccepted", "true");

  const response = await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    body: formData,
  });
  const body = await response.json().catch(() => ({}));

  console.log(JSON.stringify({ status: response.status, body }, null, 2));

  if (!response.ok) {
    throw new Error("Application submission smoke test failed.");
  }

  if (typeof body.checkoutUrl !== "string" || typeof body.paymentId !== "string") {
    throw new Error("Application submission did not return a Stripe checkout target.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
