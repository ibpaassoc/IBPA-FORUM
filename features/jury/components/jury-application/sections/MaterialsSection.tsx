"use client";

import FieldShell from "@/features/jury/components/jury-application/fields/FieldShell";
import TextInput from "@/features/jury/components/jury-application/fields/TextInput";
import TextareaField from "@/features/jury/components/jury-application/fields/TextareaField";

export default function MaterialsSection() {
  return (
    <div className="border-b border-white/10 pb-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
        Materials & Disclosure
      </p>

      <div className="mt-5 space-y-5">
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
            className="block w-full rounded-2xl border border-dashed border-white/14 bg-white/5 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-[#d8c27a] file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.16em] file:text-black"
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
            className="block w-full rounded-2xl border border-dashed border-white/14 bg-white/5 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-[#d8c27a] file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.16em] file:text-black"
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

        <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white">
          <input
            type="checkbox"
            name="confidentialityAgreement"
            value="yes"
            required
            className="mt-1 h-4 w-4 rounded accent-[#d8c27a]"
          />
          <span className="leading-6 text-white/85">
            I agree to keep all jury deliberations, candidate information,
            and judging materials confidential.
          </span>
        </label>
      </div>
    </div>
  );
}
