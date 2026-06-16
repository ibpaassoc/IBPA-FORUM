"use client";

import { ChoiceGroupField, SelectField, TextField, TextareaField } from "@/features/applications/components/application-form/fields/FormControls";
import UploadField from "@/features/applications/components/application-form/fields/UploadField";
import { getFieldVisibility } from "@/features/applications/schemas/category-field-validation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type {
  ApplicationValues,
  ApplyFieldConfig,
  ValidationErrors,
} from "@/features/applications/types/application.types";

const fieldPlaceholders: Record<
  string,
  { en: string; ru: string; ua: string }
> = {
  statementOfAchievements: {
    en: "List all your professional credentials: whether you are a judge, media publications about you, awards, achievements, championship participation, publications, certificates, and any other professional merits.",
    ru: "Укажите все ваши профессиональные регалии: являетесь ли вы судьёй, есть ли о вас статьи, награды, достижения, участие в чемпионатах, публикации, сертификаты и любые другие профессиональные заслуги.",
    ua: "Вкажіть усі ваші професійні регалії: чи є ви суддею, чи є про вас статті, нагороди, досягнення, участь у чемпіонатах, публікації, сертифікати та будь-які інші професійні заслуги.",
  },
  signatureTechnique: {
    en: "Describe all techniques you work with, your experience, specialization, signature techniques, and the areas in which you have studied or taught.",
    ru: "Укажите все техники, в которых вы работаете, ваш опыт, специализацию, авторские техники, а также направления, в которых вы обучались или преподаёте.",
    ua: "Вкажіть усі техніки, з якими ви працюєте, ваш досвід, спеціалізацію, авторські техніки, а також напрями, у яких ви навчалися або викладали.",
  },
  sterilizationProtocol: {
    en: "Briefly describe how you follow sterilization, disinfection, and hygiene rules in your workspace: tool processing, use of disposable materials, sanitary standards, and keeping the workplace clean.",
    ru: "Кратко опишите, как вы соблюдаете правила стерилизации, дезинфекции и гигиены в вашем кабинете: обработку инструментов, использование одноразовых материалов, санитарные нормы и поддержание чистоты рабочего места.",
    ua: "Коротко опишіть, як ви дотримуєтеся правил стерилізації, дезінфекції та гігієни у вашому кабінеті: обробку інструментів, використання одноразових матеріалів, санітарні норми та підтримання чистоти робочого місця.",
  },
};

export default function BlockBRenderer({
  fields,
  title,
  values,
  errors,
  onChange,
  onFilesChange,
}: {
  fields: ApplyFieldConfig[];
  title?: string;
  values: ApplicationValues;
  errors: ValidationErrors;
  onChange: (name: string, value: string | string[]) => void;
  onFilesChange: (name: string, files: File[]) => void;
}) {
  const { language } = useLanguage();
  const copy = {
    en: {
      empty:
        "Choose a category in Block A to unlock the category-specific nomination requirements in Block B.",
      tailoredFor: "Block B is tailored for",
      thisCategory: "this category",
      complete:
        "Complete every required item to submit a review-ready application.",
    },
    ru: {
      empty:
        "Выберите категорию в блоке A, чтобы открыть требования по выбранной категории и номинации в блоке B.",
      tailoredFor: "Блок B настроен для",
      thisCategory: "этой категории",
      complete:
        "Заполните все обязательные пункты, чтобы отправить заявку на оценивание.",
    },
    ua: {
      empty:
        "Оберіть категорію у блоці A, щоб відкрити вимоги за вибраною категорією та номінацією у блоці B.",
      tailoredFor: "Блок B налаштований для",
      thisCategory: "цієї категорії",
      complete:
        "Заповніть усі обов'язкові пункти, щоб надіслати заявку на оцінювання.",
    },
  }[language];

  if (fields.length === 0) {
    return (
      <div className="rounded-[1.6rem] border border-dashed border-(--border-default) bg-(--color-white) p-6 text-sm leading-7 text-(--color-ink-soft)">
        {copy.empty}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-black/8 bg-white px-5 py-4 text-sm text-(--color-ink) shadow-[0_16px_36px_rgba(3,2,19,0.04)]">
        {copy.tailoredFor}{" "}
        <strong>{title ?? copy.thisCategory}</strong>. {copy.complete}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {fields
          .filter((field) => getFieldVisibility(field, values))
          .map((field) => {
          const fullWidth =
            field.type === "textarea" || field.type === "file" || field.type === "checkbox-group";
          const wrapperClassName = fullWidth ? "md:col-span-2" : "";
          const localizedPlaceholder = fieldPlaceholders[field.key]?.[language];

          if (field.type === "textarea") {
            return (
              <div key={field.key} className={wrapperClassName}>
                <TextareaField
                  label={field.label}
                  name={field.key}
                  value={String(values[field.key] ?? "")}
                  rows={field.rows}
                  placeholder={localizedPlaceholder ?? field.placeholder}
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
                  maxFiles={field.maxFiles}
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
