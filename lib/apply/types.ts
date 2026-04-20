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

export type ApplicationValue =
  | string
  | string[]
  | File[]
  | null
  | undefined;

export type ApplicationValues = Record<string, ApplicationValue>;

export type ValidationErrors = Record<string, string>;

export type UploadedApplicationFile = {
  fieldKey: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
};
