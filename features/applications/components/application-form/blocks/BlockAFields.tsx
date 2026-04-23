"use client";

import { heardAboutOptions } from "@/features/applications/config/application-timeline";
import { countryOptions } from "@/features/applications/config/countries";
import { SelectField, TextField } from "@/features/applications/components/application-form/fields/FormControls";
import UploadField from "@/features/applications/components/application-form/fields/UploadField";
import type {
  ApplicationValues,
  CategoryOption,
  ValidationErrors,
} from "@/features/applications/types/application.types";

export default function BlockAFields({
  values,
  errors,
  categories,
  onChange,
  onFilesChange,
}: {
  values: ApplicationValues;
  errors: ValidationErrors;
  categories: CategoryOption[];
  onChange: (name: string, value: string | string[]) => void;
  onFilesChange: (name: string, files: File[]) => void;
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
