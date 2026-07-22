export type FieldOption = {
  label: string;
  value: string;
};

export type FieldCondition = {
  fieldKey: string;
  equals: string;
};

export type ApplyFieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox-group"
  | "file";

export type ApplyFieldConfig = {
  key: string;
  label: string;
  type: ApplyFieldType;
  description?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  options?: FieldOption[];
  min?: number;
  max?: number;
  minFiles?: number;
  maxFiles?: number;
  accept?: string[];
  maxFileSizeMb?: number;
  maxWords?: number;
  visibleWhen?: FieldCondition;
};

export type CategoryCatalogDefinition = {
  slug: string;
  name: string;
  awards: string[];
};

export type CategoryOption = {
  id: string;
  slug: string;
  name: string;
  awards: {
    id: string;
    name: string;
  }[];
};

export type MembershipLevel =
  | "Starter"
  | "Artist"
  | "Trainer"
  | "Coach"
  | "Educator"
  | "Master"
  | "Director";

export type MembershipValidationResult = {
  membershipNumber: string;
  membershipLevel: MembershipLevel | null;
  qualified: boolean;
  message: string | null;
  source: "api" | "stub";
};

/**
 * A file that has already been uploaded to Vercel Blob from the browser.
 * The applicant flow uploads files directly to Blob before the final submit,
 * so the POST /api/applications payload only carries these lightweight
 * references instead of the raw bytes (avoids Vercel's request-body limit).
 * `fileUrl` holds the private Blob pathname (stored on NominationFile.fileUrl).
 */
export type ApplicationFileRef = {
  fieldKey: string;
  fileName: string;
  fileUrl: string;
  /** Authenticated browser URL for an already-saved private file. */
  previewUrl?: string;
  mimeType: string;
  fileSize: number;
};

export type ApplicationValue =
  | string
  | string[]
  | File[]
  | ApplicationFileRef[]
  | null
  | undefined;

export type ApplicationValues = Record<string, ApplicationValue>;

export type ValidationErrors = Record<string, string>;

export type BlockBValuesByNomination = Record<string, ApplicationValues>;

export type UploadedApplicationFile = {
  fieldKey: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
};
