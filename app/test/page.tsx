"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHero, PageShell } from "@/components/layout/PageShell";
import { PageCard, PageSection } from "@/components/layout/PageShell";

export default function TestPage() {
  const [applications, setApplications] = useState<unknown[]>([]);

  async function fetchApplications() {
    const response = await fetch("/api/applications");
    const data = await response.json();

    console.log("Applications:", data);
    setApplications(data);
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Test Workspace"
        title="Internal application endpoint testing."
        description="This utility route stays functional for development, but now inherits the same premium styling language as the public-facing pages."
      />

      <PageSection className="flex justify-center">
        <PageCard className="w-full max-w-3xl space-y-6">
          <h2 className="text-center text-2xl font-semibold text-white">
            Application API Test
          </h2>
          <p className="text-center text-sm leading-7 text-[#d9d4ca]">
            Participant submissions now require the full multipart form flow at{" "}
            <Link href="/apply" className="text-[#d8c27a] hover:text-[#f0dfa4]">
              /apply
            </Link>
            . This internal page remains useful for listing saved applications
            during development.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
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
