"use client";

import { useState } from "react";
import BlockAFields from "@/features/applications/components/application-form/blocks/BlockAFields";
import BlockBRenderer from "@/features/applications/components/application-form/blocks/BlockBRenderer";
import FormSection from "@/features/applications/components/application-form/FormSection";
import { getVisibleCategoryFields, validateApplicationValues } from "@/features/applications/schemas/direction-field-validation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { FadeUp, FormProgressSidebar } from "@/shared/components/public";
import type {
  ApplicationValues,
  CategoryOption,
  ValidationErrors,
} from "@/features/applications/types/application.types";

type SubmissionState =
  | {
      type: "idle";
      message: string;
    }
  | {
      type: "success" | "error";
      message: string;
    };

function isFieldComplete(value: ApplicationValues[string]) {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return false;
}

export default function ApplyForm({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const [values, setValues] = useState<ApplicationValues>({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    type: "idle",
    message: "",
  });
  const { t } = useLanguage();

  const selectedCategory = categories.find(
    (category) => category.id === String(values.categoryId ?? "")
  );
  const visibleCategoryFields = getVisibleCategoryFields(
    selectedCategory?.slug ?? null,
    values
  );
  const requiredFieldKeys = [
    "fullName",
    "email",
    "phone",
    "country",
    ...(String(values.country ?? "") === "USA" ? ["stateProvince"] : []),
    "city",
    "professionalTitle",
    "yearsExperience",
    "licenseCertification",
    "directionId",
    "awardId",
    ...visibleCategoryFields.filter((field) => field.required).map((field) => field.key),
  ];
  const completedRequiredCount = requiredFieldKeys.filter((fieldKey) => {
    if (fieldKey === "awardId" && !selectedCategory) {
      return false;
    }

    return isFieldComplete(values[fieldKey]);
  }).length;
  const progressPercentage =
    requiredFieldKeys.length === 0
      ? 0
      : Math.round((completedRequiredCount / requiredFieldKeys.length) * 100);
  const profileFieldKeys = [
    "fullName",
    "email",
    "phone",
    "country",
    ...(String(values.country ?? "") === "USA" ? ["stateProvince"] : []),
    "city",
    "professionalTitle",
    "yearsExperience",
    "licenseCertification",
    "directionId",
    "awardId",
  ];
  const profileComplete = profileFieldKeys.every((fieldKey) =>
    isFieldComplete(values[fieldKey])
  );
  const categoryRequiredKeys = visibleCategoryFields
    .filter((field) => field.required)
    .map((field) => field.key);
  const categoryComplete =
    Boolean(selectedCategory) &&
    categoryRequiredKeys.every((fieldKey) => isFieldComplete(values[fieldKey]));
  const readyComplete = progressPercentage >= 100;

  function handleChange(name: string, value: string | string[]) {
    setValues((current) => {
      const next: ApplicationValues = {
        ...current,
        [name]: value,
      };

      if (name === "directionId") {
        next.awardId = "";
      }

      return next;
    });

    setErrors((current) => {
      const next = { ...current };
      delete next[name];

      if (name === "directionId") {
        delete next.awardId;
      }

      return next;
    });
  }

  function handleFilesChange(name: string, files: File[]) {
    setValues((current) => ({
      ...current,
      [name]: files,
    }));

    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionState({ type: "idle", message: "" });

    const validation = validateApplicationValues({
      values,
      categories,
    });

    if (!validation.success) {
      setErrors(validation.errors);
      setSubmissionState({
        type: "error",
        message: t.applyPage.form.validationError,
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      for (const [key, rawValue] of Object.entries(values)) {
        if (!rawValue) {
          continue;
        }

        if (Array.isArray(rawValue)) {
          for (const item of rawValue) {
            formData.append(key, item);
          }
          continue;
        }

        formData.append(key, String(rawValue));
      }

      const response = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch((error) => {
        console.error("Application submission response was not JSON", {
          status: response.status,
          error,
        });
        return {};
      })) as {
        message?: string;
        checkoutUrl?: string;
        fieldErrors?: ValidationErrors;
      };

      if (!response.ok) {
        setErrors(data.fieldErrors ?? {});
        setSubmissionState({
          type: "error",
          message:
            data.message ??
            t.applyPage.form.submitError,
        });
        return;
      }

      setSubmissionState({
        type: "success",
        message: data.message ?? t.applyPage.form.redirecting,
      });

      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      }
    } catch (error) {
      console.error("Application submission request failed", error);
      setSubmissionState({
        type: "error",
        message: t.applyPage.form.submitException,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-[var(--space-md)] xl:hidden">
        <FormProgressSidebar
          title={t.applyPage.form.progress}
          subtitle={`${completedRequiredCount} of ${requiredFieldKeys.length} ${t.applyPage.form.requiredComplete}`}
          progressLabel={t.applyPage.form.progress}
          progressValue={progressPercentage}
          steps={[
            {
              id: "profile",
              label: t.applyPage.form.blockATitle,
              hint: t.applyPage.form.blockADescription,
              complete: profileComplete,
            },
            {
              id: "direction",
              label: t.applyPage.form.blockBTitle,
              hint: t.applyPage.form.blockBDescription,
              complete: categoryComplete,
            },
            {
              id: "submit",
              label: t.applyPage.form.submit,
              hint: t.applyPage.form.redirecting,
              complete: readyComplete,
            },
          ]}
        />
      </div>

      <div className="grid gap-[var(--space-md)] xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="space-y-[var(--space-md)]">
          <FadeUp>
            <FormSection
              eyebrow={t.applyPage.form.blockA}
              title={t.applyPage.form.blockATitle}
              description={t.applyPage.form.blockADescription}
            >
              <BlockAFields
                values={values}
                errors={errors}
                categories={categories}
                onChange={handleChange}
                onFilesChange={handleFilesChange}
              />
            </FormSection>
          </FadeUp>

          <FadeUp delay={0.06}>
            <FormSection
              eyebrow={t.applyPage.form.blockB}
              title={t.applyPage.form.blockBTitle}
              description={t.applyPage.form.blockBDescription}
            >
              <div className="transition-all duration-500 [transition-timing-function:var(--motion-editorial)]">
                <BlockBRenderer
                  categorySlug={selectedCategory?.slug ?? null}
                  categoryName={selectedCategory?.name}
                  values={values}
                  errors={errors}
                  onChange={handleChange}
                  onFilesChange={handleFilesChange}
                />
              </div>
            </FormSection>
          </FadeUp>

          <FadeUp delay={0.1}>
            <section className="rounded-(--radius) border border-(--border-default) bg-(--surface) p-(--space-lg) shadow-(--shadow-lg)">
              <div className="flex flex-col gap-(--space-sm) border-b border-(--border-default) pb-(--space-md) md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.2em] text-(--color-hover)">
                    {t.applyPage.form.progress}
                  </p>
                  <p className="mt-(--space-xs) text-sm text-(--color-ink-soft)">
                    {completedRequiredCount} of {requiredFieldKeys.length}{" "}
                    {t.applyPage.form.requiredComplete}
                  </p>
                </div>

                <div className="w-full max-w-sm">
                  <div className="h-2 rounded-full bg-(--color-mist)">
                    <div
                      className="h-2 rounded-full bg-(--color-hover) transition-all duration-500 [transition-timing-function:var(--motion-editorial)]"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {submissionState.message ? (
                <div
                  className={`mt-5 rounded-[1.4rem] border px-4 py-4 text-sm leading-7 ${
                    submissionState.type === "success"
                      ? "border-(--color-hover) bg-[rgba(185,217,235,0.26)] text-(--color-ink)"
                      : "border-(--color-hover) bg-[rgba(185,217,235,0.26)] text-(--color-ink)"
                  }`}
                  aria-live="polite"
                >
                  {submissionState.message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="ibpa-button ibpa-button-primary mt-(--space-md) w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? t.applyPage.form.submitting : t.applyPage.form.submit}
              </button>
            </section>
          </FadeUp>
        </div>

        <FormProgressSidebar
          className="hidden xl:block"
          title={t.applyPage.form.progress}
          subtitle={`${completedRequiredCount} of ${requiredFieldKeys.length} ${t.applyPage.form.requiredComplete}`}
          progressLabel={t.applyPage.form.progress}
          progressValue={progressPercentage}
          steps={[
            {
              id: "profile",
              label: t.applyPage.form.blockATitle,
              hint: t.applyPage.form.blockADescription,
              complete: profileComplete,
            },
            {
              id: "direction",
              label: t.applyPage.form.blockBTitle,
              hint: t.applyPage.form.blockBDescription,
              complete: categoryComplete,
            },
            {
              id: "submit",
              label: t.applyPage.form.submit,
              hint: t.applyPage.form.redirecting,
              complete: readyComplete,
            },
          ]}
        />
      </div>
    </form>
  );
}
