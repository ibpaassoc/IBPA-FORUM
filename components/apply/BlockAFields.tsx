"use client";

import { countryOptions } from "@/lib/apply/countries";
import { heardAboutOptions } from "@/lib/apply/catalog";
import { SelectField, TextField } from "@/components/apply/fields/FormControls";
import UploadField from "@/components/apply/UploadField";
import type {
  ApplicationValues,
  CategoryOption,
  MembershipValidationResult,
  ValidationErrors,
} from "@/lib/apply/types";

export default function BlockAFields({
  values,
  errors,
  categories,
  membership,
  isValidatingMembership,
  onChange,
  onFilesChange,
  onValidateMembership,
}: {
  values: ApplicationValues;
  errors: ValidationErrors;
  categories: CategoryOption[];
  membership: MembershipValidationResult | null;
  isValidatingMembership: boolean;
  onChange: (name: string, value: string | string[]) => void;
  onFilesChange: (name: string, files: File[]) => void;
  onValidateMembership: () => void;
}) {
  const selectedCategory = categories.find(
    (category) => category.id === String(values.categoryId ?? "")
  );

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <TextField
        label="Full Legal Name"
        name="fullName"
        value={String(values.fullName ?? "")}
        required
        placeholder="Exactly as it should appear on official documents"
        error={errors.fullName}
        onChange={onChange}
      />

      <TextField
        label="Email Address"
        name="email"
        type="email"
        value={String(values.email ?? "")}
        required
        placeholder="name@example.com"
        error={errors.email}
        onChange={onChange}
      />

      <TextField
        label="Phone / WhatsApp"
        name="phone"
        type="tel"
        value={String(values.phone ?? "")}
        required
        placeholder="+1 (555) 123-4567"
        error={errors.phone}
        onChange={onChange}
      />

      <SelectField
        label="Country of Residence"
        name="country"
        value={String(values.country ?? "")}
        required
        placeholder="Select country"
        options={countryOptions}
        error={errors.country}
        onChange={onChange}
      />

      {String(values.country ?? "") === "USA" ? (
        <TextField
          label="State / Province"
          name="stateProvince"
          value={String(values.stateProvince ?? "")}
          required
          placeholder="California"
          error={errors.stateProvince}
          onChange={onChange}
        />
      ) : null}

      <TextField
        label="City"
        name="city"
        value={String(values.city ?? "")}
        required
        placeholder="Los Angeles"
        error={errors.city}
        onChange={onChange}
      />

      <TextField
        label="Professional Title"
        name="professionalTitle"
        value={String(values.professionalTitle ?? "")}
        required
        placeholder="Master Stylist, Educator, Clinic Founder..."
        error={errors.professionalTitle}
        onChange={onChange}
      />

      <TextField
        label="Years of Professional Experience"
        name="yearsExperience"
        type="number"
        min={2}
        value={String(values.yearsExperience ?? "")}
        required
        placeholder="2"
        error={errors.yearsExperience}
        description="A minimum of 2 years is required."
        onChange={onChange}
      />

      <div className="md:col-span-2">
        <div className="grid gap-4 rounded-[1.6rem] border border-[#d8c27a]/18 bg-[linear-gradient(135deg,rgba(216,194,122,0.09),rgba(255,255,255,0.03))] p-4 md:grid-cols-[1.2fr_0.8fr_auto] md:items-end">
          <TextField
            label="IBPA Membership Number"
            name="membershipNumber"
            value={String(values.membershipNumber ?? "")}
            required
            placeholder="Example: IBPA-12345 or TRN-2048"
            error={errors.membershipNumber}
            description="Validation runs against a swappable server-side membership service."
            onChange={onChange}
          />

          <TextField
            label="Membership Level"
            name="membershipLevel"
            value={membership?.membershipLevel ?? ""}
            readOnly
            placeholder="Auto-filled after validation"
            description="Read-only result from membership validation."
            onChange={onChange}
          />

          <button
            type="button"
            onClick={onValidateMembership}
            disabled={isValidatingMembership || !String(values.membershipNumber ?? "").trim()}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#d8c27a] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e5d28f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isValidatingMembership ? "Validating..." : "Validate"}
          </button>
        </div>

        {membership ? (
          <div
            className={`mt-3 rounded-[1.4rem] border px-4 py-4 text-sm leading-7 ${
              membership.qualified
                ? "border-[#d8c27a]/28 bg-[#d8c27a]/10 text-[#f3ecda]"
                : "border-[#8a3f3f]/55 bg-[#35191a]/70 text-white"
            }`}
          >
            {membership.qualified ? (
              <p>
                Membership validated at <strong>{membership.membershipLevel}</strong>.
                You meet the championship entry requirement.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="whitespace-pre-line">
                  {membership.message ??
                    "Your current membership level does not qualify for Championship participation.\n\nUpgrade to Trainer / Coach or higher at ibpa-usa.org to apply."}
                </p>
                <a
                  href="https://ibpa-usa.org"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-[#d8c27a]/35 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f6e7b4] transition hover:border-[#d8c27a] hover:text-white"
                >
                  Upgrade Membership
                </a>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="md:col-span-2">
        <UploadField
          label="Professional License / Certification"
          name="licenseCertification"
          files={
            Array.isArray(values.licenseCertification)
              ? values.licenseCertification.filter(
                  (item): item is File => item instanceof File
                )
              : []
          }
          required
          multiple={false}
          accept={["image/jpeg", "image/png", "application/pdf"]}
          description="Upload PDF, JPG, or PNG. Maximum 5MB."
          error={errors.licenseCertification}
          onChange={onFilesChange}
        />
      </div>

      <SelectField
        label="Award Category"
        name="categoryId"
        value={String(values.categoryId ?? "")}
        required
        placeholder="Select category"
        options={categories.map((category) => ({
          label: category.name,
          value: category.id,
        }))}
        error={errors.categoryId}
        onChange={onChange}
      />

      <SelectField
        label="Specific Award (within category)"
        name="awardId"
        value={String(values.awardId ?? "")}
        required
        disabled={!selectedCategory}
        placeholder={
          selectedCategory ? "Select specific award" : "Select category first"
        }
        options={
          selectedCategory?.awards.map((award) => ({
            label: award.name,
            value: award.id,
          })) ?? []
        }
        error={errors.awardId}
        onChange={onChange}
      />

      <TextField
        label="Professional Website"
        name="websiteUrl"
        type="url"
        value={String(values.websiteUrl ?? "")}
        placeholder="https://"
        error={errors.websiteUrl}
        onChange={onChange}
      />

      <TextField
        label="Instagram / Social Media"
        name="socialUrl"
        type="url"
        value={String(values.socialUrl ?? "")}
        placeholder="https://instagram.com/yourprofile"
        error={errors.socialUrl}
        onChange={onChange}
      />

      <TextField
        label="Client Reviews — Google / Yelp Link"
        name="reviewsUrl"
        type="url"
        value={String(values.reviewsUrl ?? "")}
        placeholder="https://"
        error={errors.reviewsUrl}
        onChange={onChange}
      />

      <SelectField
        label="How did you hear about us?"
        name="heardAbout"
        value={String(values.heardAbout ?? "")}
        placeholder="Select an option"
        options={heardAboutOptions}
        error={errors.heardAbout}
        onChange={onChange}
      />

      {String(values.heardAbout ?? "") === "other" ? (
        <TextField
          label="How did you hear about us? (Other)"
          name="heardAboutOther"
          value={String(values.heardAboutOther ?? "")}
          placeholder="Tell us the source"
          error={errors.heardAboutOther}
          onChange={onChange}
        />
      ) : null}
    </div>
  );
}
