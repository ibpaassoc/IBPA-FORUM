import {
  getFieldVisibility,
  validateNominationBlockB,
} from "@/features/applications/schemas/category-field-validation";
import { isApplicationFileRef } from "@/features/applications/lib/file-ref";
import type {
  ApplicationValues,
  ApplyFieldConfig,
} from "@/features/applications/types/application.types";

export type NominationIssue = {
  field: ApplyFieldConfig;
  message: string;
};

export type NominationProgress = {
  /** Required fields that are currently visible for the entered values. */
  requiredTotal: number;
  /** Visible required fields that still have no value / no file. */
  missingRequired: ApplyFieldConfig[];
  /**
   * Everything that blocks a submission, carrying the exact message the submit
   * endpoint would return. Includes rules a presence check cannot see — file
   * count minimums, word caps, URL format, number ranges.
   */
  issues: NominationIssue[];
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
 * page header/summary. `issues` is produced by the same validator the submit
 * endpoint runs, so a nomination the panel reports as complete is one the
 * endpoint accepts.
 */
export function computeNominationProgress(
  categorySlug: string,
  fields: ApplyFieldConfig[],
  values: ApplicationValues,
): NominationProgress {
  const visibleFields = fields.filter((field) => getFieldVisibility(field, values));
  const requiredFields = visibleFields.filter((field) => field.required);
  const missingRequired = requiredFields.filter((field) => !hasValue(field, values));

  const errors = validateNominationBlockB(categorySlug, values);
  // Report issues in form order so the list matches the sections on screen.
  const issues: NominationIssue[] = fields
    .filter((field) => field.key in errors)
    .map((field) => ({ field, message: errors[field.key] }));
  const knownKeys = new Set(issues.map((issue) => issue.field.key));
  for (const [key, message] of Object.entries(errors)) {
    if (knownKeys.has(key)) continue;
    issues.push({ field: { key, label: key, type: "text" }, message });
  }

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
      ? issues.length === 0
        ? 100
        : 0
      : Math.round(
          ((requiredFields.length - missingRequired.length) / requiredFields.length) * 100,
        );

  return {
    requiredTotal: requiredFields.length,
    missingRequired,
    issues,
    // A nomination with every required field filled but a rule still failing is
    // not finished; keep the bar short of 100 so it never contradicts the list.
    percentage: percentage === 100 && issues.length > 0 ? 99 : percentage,
    uploadedFileCount,
  };
}
