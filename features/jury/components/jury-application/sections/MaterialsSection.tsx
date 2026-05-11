"use client";

import FieldShell from "@/features/jury/components/jury-application/fields/FieldShell";
import TextInput from "@/features/jury/components/jury-application/fields/TextInput";
import TextareaField from "@/features/jury/components/jury-application/fields/TextareaField";

export default function MaterialsSection() {
  return (
    <div className="border-b border-(--border-default) pb-(--space-lg)">
      <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.2em] text-(--color-hover)">
        Materials & Disclosure
      </p>

      <div className="mt-(--space-md) space-y-(--space-md)">
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
            className="block w-full rounded-sm border-[1.5px] border-dashed border-(--border-default) bg-(--color-white) px-(--space-sm) py-(--space-sm) text-sm text-(--color-ink) file:mr-(--space-sm) file:rounded-full file:border-0 file:bg-(--color-hover) file:px-(--space-sm) file:py-(--space-xs) file:text-xs file:font-medium file:uppercase file:tracking-[0.16em] file:text-white"
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
            className="block w-full rounded-sm border-[1.5px] border-dashed border-(--border-default) bg-(--color-white) px-(--space-sm) py-(--space-sm) text-sm text-(--color-ink) file:mr-(--space-sm) file:rounded-full file:border-0 file:bg-(--color-hover) file:px-(--space-sm) file:py-(--space-xs) file:text-xs file:font-medium file:uppercase file:tracking-[0.16em] file:text-white"
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

        <label className="flex items-start gap-3 rounded-sm border border-(--border-default) bg-(--color-white) px-(--space-sm) py-(--space-sm) text-sm text-(--color-ink)">
          <input
            type="checkbox"
            name="confidentialityAgreement"
            value="yes"
            required
            className="mt-1 h-4 w-4 rounded accent-(--color-hover)"
          />
          <span className="leading-6 text-(--color-ink-soft)">
            I agree to keep all jury deliberations, candidate information,
            and judging materials confidential.
          </span>
        </label>
      </div>
    </div>
  );
}
