"use client";

import { useState } from "react";
import { PageCard, PageHero, PageSection, PageShell } from "@/components/layout/PageShell";

export default function ApplyPage() {
  const [applications, setApplications] = useState<unknown[]>([]);

  async function testCreateApplication() {
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: "Ivan Makovetskyi",
        email: "test@test.com",
        phone: "+123456789",
        country: "USA",
        stateProvince: "California",
        city: "Sacramento",
        professionalTitle: "PMU Artist",
        yearsExperience: 3,
        membershipNumber: "IBPA-12345",
        membershipLevel: "Trainer",
        categoryId: "cmo0mcbkz0000okt0vbmd6rzt",
        awardId: "cmo0mcbnz0002okt08ni0xs45"
      }),
    });

    const data = await response.json();
    console.log("Created:", data);
    alert("Application created");
  }

  async function fetchApplications() {
    const response = await fetch("/api/applications");
    const data = await response.json();

    console.log("Applications:", data);
    setApplications(data);
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Applications"
        title="Application workspace in the championship visual style."
        description="This route is still wired as an API test page, but it now matches the rest of the site while you validate application endpoints and payloads."
      />

      <PageSection className="flex justify-center">
        <PageCard className="w-full max-w-3xl space-y-6">
          <h2 className="text-2xl font-semibold text-white text-center">
            Application API Test
          </h2>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={testCreateApplication}
              className="rounded-full bg-[#d8c27a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] hover:opacity-90"
            >
              Create Test Application
            </button>

            <button
              onClick={fetchApplications}
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white hover:border-[#d8c27a] hover:text-[#d8c27a]"
            >
              Get Applications
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-[#f5f1e8]">
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all">
              {JSON.stringify(applications, null, 2)}
            </pre>
          </div>
        </PageCard>
      </PageSection>
    </PageShell>
  );
}
