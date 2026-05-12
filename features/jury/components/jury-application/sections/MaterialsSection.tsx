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
          <label className="flex cursor-pointer flex-col rounded-[var(--radius-sm)] border-[1.5px] border-dashed border-(--border-default) bg-(--surface) p-(--space-md) transition hover:border-(--color-hover) hover:bg-(--surface-tint)">
            <span className="text-sm font-medium text-(--color-ink)">Upload certification files</span>
            <span className="mt-1 text-xs leading-5 text-(--color-ink-soft)">
              JPG, PNG, or PDF. Up to 5 files.
            </span>
            <input
              type="file"
              name="certifications"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              required
              className="mt-3 block w-full text-sm text-(--color-ink) file:mr-(--space-sm) file:rounded-full file:border-0 file:bg-(--color-hover) file:px-(--space-sm) file:py-(--space-xs) file:text-xs file:font-medium file:uppercase file:tracking-[0.16em] file:text-white"
            />
          </label>
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
          <label className="flex cursor-pointer flex-col rounded-[var(--radius-sm)] border-[1.5px] border-dashed border-(--border-default) bg-(--surface) p-(--space-md) transition hover:border-(--color-hover) hover:bg-(--surface-tint)">
            <span className="text-sm font-medium text-(--color-ink)">Upload profile image</span>
            <span className="mt-1 text-xs leading-5 text-(--color-ink-soft)">
              Use a clear professional portrait in JPG or PNG.
            </span>
            <input
              type="file"
              name="profilePhoto"
              accept=".jpg,.jpeg,.png"
              required
              className="mt-3 block w-full text-sm text-(--color-ink) file:mr-(--space-sm) file:rounded-full file:border-0 file:bg-(--color-hover) file:px-(--space-sm) file:py-(--space-xs) file:text-xs file:font-medium file:uppercase file:tracking-[0.16em] file:text-white"
            />
          </label>
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
