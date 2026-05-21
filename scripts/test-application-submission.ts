type CategoryOption = {
  id: string;
  slug: string;
  name: string;
  awards: Array<{ id: string; name: string }>;
};

const baseUrl = process.env.TEST_APP_URL ?? "http://localhost:3000";

function makeFile(name: string, type: string) {
  return new File([new Uint8Array([1, 2, 3, 4])], name, { type });
}

async function main() {
  const categoriesResponse = await fetch(`${baseUrl}/api/categories`);
  if (!categoriesResponse.ok) {
    throw new Error(`Failed to load categories: ${categoriesResponse.status}`);
  }

  const categories = (await categoriesResponse.json()) as CategoryOption[];
  const category =
    categories.find((item) => item.slug === "body-wellness") ?? categories[0];
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
  formData.set("heardAbout", "email");
  formData.set("licenseCertification", makeFile("license.pdf", "application/pdf"));
  formData.set("portfolioMediaFiles", makeFile("portfolio.pdf", "application/pdf"));
  formData.append("beforeAfterPhotos", makeFile("before.jpg", "image/jpeg"));
  formData.append("beforeAfterPhotos", makeFile("after.jpg", "image/jpeg"));
  formData.set(
    "statementOfAchievements",
    "This smoke test validates the application submission flow."
  );
  formData.set(
    "treatmentEffectivenessMeasurement",
    "Results are measured with before-and-after photos and client records."
  );
  formData.set(
    "sterilizationProtocol",
    "Tools and surfaces are disinfected before and after each appointment."
  );

  const response = await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    body: formData,
  });
  const body = await response.json().catch(() => ({}));

  console.log(JSON.stringify({ status: response.status, body }, null, 2));

  if (!response.ok) {
    throw new Error("Application submission smoke test failed.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
