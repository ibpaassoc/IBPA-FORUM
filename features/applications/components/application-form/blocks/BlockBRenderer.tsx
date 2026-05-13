"use client";

import { ChoiceGroupField, SelectField, TextField, TextareaField } from "@/features/applications/components/application-form/fields/FormControls";
import UploadField from "@/features/applications/components/application-form/fields/UploadField";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { getFieldVisibility } from "@/features/applications/schemas/category-field-validation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { ApplicationValues, ValidationErrors } from "@/features/applications/types/application.types";

export default function BlockBRenderer({
  categorySlug,
  categoryName,
  values,
  errors,
  onChange,
  onFilesChange,
}: {
  categorySlug: string | null;
  categoryName?: string;
  values: ApplicationValues;
  errors: ValidationErrors;
  onChange: (name: string, value: string | string[]) => void;
  onFilesChange: (name: string, files: File[]) => void;
}) {
  const { language } = useLanguage();
  const copy = {
    en: {
      empty:
        "Choose a direction in Block A to unlock the direction-specific nomination requirements in Block B.",
      tailoredFor: "Block B is tailored for",
      thisDirection: "this direction",
      complete:
        "Complete every required item to submit a review-ready application.",
    },
    ru: {
      empty:
        "Выберите направление в блоке A, чтобы открыть требования по выбранному направлению и номинации в блоке B.",
      tailoredFor: "Блок B настроен для",
      thisDirection: "этого направления",
      complete:
        "Заполните все обязательные пункты, чтобы отправить заявку на оценивание.",
    },
    ua: {
      empty:
        "Оберіть напрямок у блоці A, щоб відкрити вимоги за вибраним напрямком і номінацією в блоці B.",
      tailoredFor: "Блок B налаштований для",
      thisDirection: "цього напрямку",
      complete:
        "Заповніть усі обов'язкові пункти, щоб надіслати заявку на оцінювання.",
    },
  }[language];

  if (!categorySlug) {
    return (
      <div className="rounded-[1.6rem] border border-dashed border-(--border-default) bg-(--color-white) p-6 text-sm leading-7 text-(--color-ink-soft)">
        {copy.empty}
      </div>
    );
  }

  const fields = (categoryFieldConfigs[categorySlug] ?? []).filter((field) =>
    getFieldVisibility(field, values)
  );

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-[rgba(185,217,235,0.36)] bg-[linear-gradient(135deg,rgba(185,217,235,0.18),rgba(255,255,255,0.7))] px-4 py-4 text-sm text-(--color-ink)">
        {copy.tailoredFor}{" "}
        <strong>{categoryName ?? copy.thisDirection}</strong>. {copy.complete}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {fields.map((field) => {
          const fullWidth =
            field.type === "textarea" || field.type === "file" || field.type === "checkbox-group";
          const wrapperClassName = fullWidth ? "md:col-span-2" : "";

          if (field.type === "textarea") {
            return (
              <div key={field.key} className={wrapperClassName}>
                <TextareaField
                  label={field.label}
                  name={field.key}
                  value={String(values[field.key] ?? "")}
                  rows={field.rows}
                  required={field.required}
                  description={field.description}
                  error={errors[field.key]}
                  onChange={onChange}
                />
              </div>
            );
          }

          if (field.type === "select") {
            return (
              <div key={field.key} className={wrapperClassName}>
                <SelectField
                  label={field.label}
                  name={field.key}
                  value={String(values[field.key] ?? "")}
                  options={field.options ?? []}
                  required={field.required}
                  description={field.description}
                  error={errors[field.key]}
                  onChange={onChange}
                />
              </div>
            );
          }

          if (field.type === "radio" || field.type === "checkbox-group") {
            return (
              <div key={field.key} className={wrapperClassName}>
                <ChoiceGroupField
                  label={field.label}
                  name={field.key}
                  value={
                    field.type === "checkbox-group"
                      ? (Array.isArray(values[field.key])
                          ? (values[field.key] as string[])
                          : [])
                      : String(values[field.key] ?? "")
                  }
                  options={field.options ?? []}
                  required={field.required}
                  description={field.description}
                  error={errors[field.key]}
                  multiple={field.type === "checkbox-group"}
                  onChange={onChange}
                />
              </div>
            );
          }

          if (field.type === "file") {
            const rawFileValue = values[field.key];
            const fileList = Array.isArray(rawFileValue)
              ? rawFileValue.filter(
                  (item): item is File => item instanceof File
                )
              : [];

            return (
              <div key={field.key} className="md:col-span-2">
                <UploadField
                  label={field.label}
                  name={field.key}
                  files={fileList}
                  required={field.required}
                  multiple={(field.maxFiles ?? 1) > 1}
                  accept={field.accept}
                  description={field.description}
                  error={errors[field.key]}
                  onChange={onFilesChange}
                />
              </div>
            );
          }

          return (
            <div key={field.key} className={wrapperClassName}>
              <TextField
                label={field.label}
                name={field.key}
                type={field.type === "number" ? "number" : field.type}
                value={String(values[field.key] ?? "")}
                required={field.required}
                description={field.description}
                error={errors[field.key]}
                min={field.min}
                max={field.max}
                onChange={onChange}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
