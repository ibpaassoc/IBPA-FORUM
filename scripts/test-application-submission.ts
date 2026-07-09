type CategoryOption = {
  id: string;
  slug: string;
  name: string;
  awards: Array<{ id: string; name: string }>;
};

const baseUrl = process.env.TEST_APP_URL ?? "http://localhost:3000";

// Files are uploaded to Vercel Blob from the browser first; the submit endpoint
// only accepts lightweight references. This mirrors that shape with placeholder
// blob pathnames so the smoke test exercises the DB + checkout path without the
// (now-rejected) raw-file payload.
function makeBlobRef(fieldKey: string, name: string, type: string) {
  return JSON.stringify({
    fieldKey,
    fileName: name,
    fileUrl: `applications/smoke-test/${fieldKey}-${name}`,
    mimeType: type,
    fileSize: 4,
  });
}

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

  const nom = (fieldKey: string) => `__nom__${award.id}__${fieldKey}`;
  const nomBlob = (fieldKey: string) => `__nomblob__${award.id}__${fieldKey}`;

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
  formData.set("heardAbout", "email");
  formData.append(
    "licenseCertificationBlob",
    makeBlobRef("licenseCertification", "license.pdf", "application/pdf")
  );

  // Per-nomination Block B references + text (encoded with the __nom__ scheme).
  for (let i = 1; i <= 5; i += 1) {
    formData.append(
      nomBlob("portfolioPhotos"),
      makeBlobRef("portfolioPhotos", `portfolio-${i}.jpg`, "image/jpeg")
    );
  }
  formData.append(
    nomBlob("beforeAfterPhotos"),
    makeBlobRef("beforeAfterPhotos", "before.jpg", "image/jpeg")
  );
  formData.append(
    nomBlob("beforeAfterPhotos"),
    makeBlobRef("beforeAfterPhotos", "after.jpg", "image/jpeg")
  );
  formData.set(
    nom("statementOfAchievements"),
    "This smoke test validates the application submission flow."
  );
  formData.set(
    nom("signatureTechnique"),
    "Technique combinations are selected based on hair, skin type, and long-term client goals."
  );
  formData.set(
    nom("sterilizationProtocol"),
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
