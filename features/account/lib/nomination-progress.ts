import { getFieldVisibility } from "@/features/applications/schemas/category-field-validation";
import { isApplicationFileRef } from "@/features/applications/lib/file-ref";
import type {
  ApplicationValues,
  ApplyFieldConfig,
} from "@/features/applications/types/application.types";

export type NominationProgress = {
  /** Required fields that are currently visible for the entered values. */
  requiredTotal: number;
  /** Visible required fields that still have no value / no file. */
  missingRequired: ApplyFieldConfig[];
  /** 0–100, based on completed visible required fields. */
  percentage: number;
  /** Files (new or already uploaded) attached across all file fields. */
  uploadedFileCount: number;
};

function hasValue(field: ApplyFieldConfig, values: ApplicationValues) {
  const value = values[field.key];
  if (field.type === "file") {
    return Array.isArray(value)
      ? value.some((item) => item instanceof File || isApplicationFileRef(item))
      : false;
  }
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(String(value ?? "").trim());
}

/**
 * Real completion progress for a nomination application, shared by the review
 * page header/summary. Mirrors the server-side dashboard calculation: only
 * required fields count, and hidden conditional fields are ignored.
 */
export function computeNominationProgress(
  fields: ApplyFieldConfig[],
  values: ApplicationValues,
): NominationProgress {
  const visibleFields = fields.filter((field) => getFieldVisibility(field, values));
  const requiredFields = visibleFields.filter((field) => field.required);
  const missingRequired = requiredFields.filter((field) => !hasValue(field, values));

  const uploadedFileCount = visibleFields
    .filter((field) => field.type === "file")
    .reduce((count, field) => {
      const value = values[field.key];
      if (!Array.isArray(value)) return count;
      return (
        count +
        value.filter((item) => item instanceof File || isApplicationFileRef(item)).length
      );
    }, 0);

  const percentage =
    requiredFields.length === 0
      ? 100
      : Math.round(
          ((requiredFields.length - missingRequired.length) / requiredFields.length) * 100,
        );

  return {
    requiredTotal: requiredFields.length,
    missingRequired,
    percentage,
    uploadedFileCount,
  };
}
