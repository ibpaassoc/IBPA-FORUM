"use client";

import FieldShell from "@/features/jury/components/jury-application/fields/FieldShell";
import TextInput from "@/features/jury/components/jury-application/fields/TextInput";
import TextareaField from "@/features/jury/components/jury-application/fields/TextareaField";

export default function MaterialsSection() {
  return (
    <div className="border-b border-[var(--border-default)] pb-[var(--space-lg)]">
      <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.2em] text-[var(--color-gold)]">
        Materials & Disclosure
      </p>

      <div className="mt-[var(--space-md)] space-y-[var(--space-md)]">
        <FieldShell
          label="Professional Certifications"
          hint="Upload up to 5 PDF or image files."
          required
        >
          <input
            type="file"
            name="certifications"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            required
            className="block w-full rounded-[var(--radius-sm)] border-[1.5px] border-dashed border-[var(--border-default)] bg-[var(--color-white)] px-[var(--space-sm)] py-[var(--space-sm)] text-sm text-[var(--color-navy)] file:mr-[var(--space-sm)] file:rounded-full file:border-0 file:bg-[var(--color-gold)] file:px-[var(--space-sm)] file:py-[var(--space-xs)] file:text-xs file:font-medium file:uppercase file:tracking-[0.16em] file:text-[var(--color-navy-deep)]"
          />
        </FieldShell>

        <TextareaField
          label="Professional Bio"
          name="professionalBio"
          placeholder="Share your background, achievements, and role in the industry. This bio can be published on the jury page if approved."
          maxLength={2200}
          hint="Target length: up to 300 words."
          required
        />

        <FieldShell
          label="Profile Photo"
          hint="Upload one professional JPG or PNG image for your jury profile."
          required
        >
          <input
            type="file"
            name="profilePhoto"
            accept=".jpg,.jpeg,.png"
            required
            className="block w-full rounded-[var(--radius-sm)] border-[1.5px] border-dashed border-[var(--border-default)] bg-[var(--color-white)] px-[var(--space-sm)] py-[var(--space-sm)] text-sm text-[var(--color-navy)] file:mr-[var(--space-sm)] file:rounded-full file:border-0 file:bg-[var(--color-gold)] file:px-[var(--space-sm)] file:py-[var(--space-xs)] file:text-xs file:font-medium file:uppercase file:tracking-[0.16em] file:text-[var(--color-navy-deep)]"
          />
        </FieldShell>

        <TextInput
          label="Professional Website / LinkedIn"
          name="professionalWebsite"
          type="url"
          placeholder="https://"
        />

        <TextareaField
          label="Conflict of Interest Disclosure"
          name="conflictDisclosure"
          placeholder="Disclose any relationships with nominees, schools, salons, brands, or other participants."
          required
        />

        <TextareaField
          label="Why do you want to serve as a judge?"
          name="motivation"
          placeholder="Describe what you would bring to the IBPA jury panel and why the role matters to you."
          maxLength={1500}
          hint="Target length: up to 200 words."
          required
        />

        <label className="flex items-start gap-3 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--color-white)] px-[var(--space-sm)] py-[var(--space-sm)] text-sm text-[var(--color-navy)]">
          <input
            type="checkbox"
            name="confidentialityAgreement"
            value="yes"
            required
            className="mt-1 h-4 w-4 rounded accent-[var(--color-gold)]"
          />
          <span className="leading-6 text-[var(--color-steel)]">
            I agree to keep all jury deliberations, candidate information,
            and judging materials confidential.
          </span>
        </label>
      </div>
    </div>
  );
}
