"use client";

import { countryOptions } from "@/features/applications/config/countries";
import FieldShell, { inputClassName } from "@/features/jury/components/jury-application/fields/FieldShell";
import TextInput from "@/features/jury/components/jury-application/fields/TextInput";

export default function ProfessionalProfileSection() {
  return (
    <div className="border-b border-[var(--border-default)] pb-[var(--space-lg)]">
      <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.2em] text-[var(--color-hover)]">
        Professional Profile
      </p>
      <div className="mt-[var(--space-md)] grid gap-[var(--space-md)] md:grid-cols-2">
        <TextInput
          label="Full Legal Name"
          name="fullName"
          placeholder="Exactly as it should appear on official documents"
          required
        />

        <TextInput
          label="Email Address"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
        />

        <TextInput
          label="Phone / WhatsApp"
          name="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          required
        />

        <FieldShell label="Country" required>
          <select
            name="country"
            defaultValue=""
            required
            className={inputClassName}
          >
            <option value="" className="bg-[var(--color-white)] text-[var(--color-ink)]">
              Select country
            </option>
            {countryOptions.map((country) => (
              <option
                key={country.value}
                value={country.value}
                className="bg-[var(--color-white)] text-[var(--color-ink)]"
              >
                {country.label}
              </option>
            ))}
          </select>
        </FieldShell>

        <TextInput
          label="City"
          name="city"
          placeholder="Los Angeles"
          required
        />

        <TextInput
          label="Professional Title"
          name="professionalTitle"
          placeholder="PMU Artist & Educator"
          required
        />

        <TextInput
          label="Years of Professional Experience"
          name="yearsExperience"
          type="number"
          min={5}
          placeholder="5"
          hint="A minimum of 5 years is required for the jury panel."
          required
        />

        <TextInput
          label="Current Employer / Affiliation"
          name="employerAffiliation"
          placeholder="Salon, academy, clinic, organization, or brand"
          required
        />
      </div>
    </div>
  );
}
