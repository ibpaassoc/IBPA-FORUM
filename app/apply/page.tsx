"use client";

import { useState } from "react";

export default function ApplyPage() {
  const [applications, setApplications] = useState<any[]>([]);

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
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl space-y-6">

        <h1 className="text-2xl font-semibold text-black text-center">
          Application API Test
        </h1>

        <div className="flex gap-4 justify-center">
          <button
            onClick={testCreateApplication}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition"
          >
            Create Test Application
          </button>

          <button
            onClick={fetchApplications}
            className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 transition"
          >
            Get Applications
          </button>
        </div>

        <div className="bg-gray-100 text-black p-4 rounded text-sm max-h-64 overflow-auto">
          <pre>{JSON.stringify(applications, null, 2)}</pre>
        </div>

      </div>
    </main>
  );
}
