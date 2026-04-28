"use client";

import { useState } from "react";
import BlockAFields from "@/features/applications/components/application-form/blocks/BlockAFields";
import BlockBRenderer from "@/features/applications/components/application-form/blocks/BlockBRenderer";
import FormSection from "@/features/applications/components/application-form/FormSection";
import { getVisibleCategoryFields, validateApplicationValues } from "@/features/applications/schemas/category-field-validation";
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
    "categoryId",
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

  function handleChange(name: string, value: string | string[]) {
    setValues((current) => {
      const next: ApplicationValues = {
        ...current,
        [name]: value,
      };

      if (name === "categoryId") {
        next.awardId = "";
      }

      return next;
    });

    setErrors((current) => {
      const next = { ...current };
      delete next[name];

      if (name === "categoryId") {
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
        message:
          "Please review the highlighted fields before submitting your championship entry.",
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
      const data = (await response.json()) as {
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
            "We could not submit the application. Please try again.",
        });
        return;
      }

      setSubmissionState({
        type: "success",
        message:
          data.message ??
          "Redirecting to secure Stripe Checkout.",
      });

      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      }
    } catch {
      setSubmissionState({
        type: "error",
        message:
          "Something went wrong during submission. Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <FormSection
          eyebrow="Block A"
          title="Professional Profile & Eligibility"
          description="Complete the shared championship application section before moving into the category-specific evaluation materials."
        >
          <BlockAFields
            values={values}
            errors={errors}
            categories={categories}
            onChange={handleChange}
            onFilesChange={handleFilesChange}
          />
        </FormSection>

        <FormSection
          eyebrow="Block B"
          title="Category-Specific Championship Materials"
          description="Block B changes based on the category you select."
        >
          <div className="transition-all duration-300 ease-out">
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

        <section className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-6">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
                Application Progress
              </p>
              <p className="mt-3 text-sm text-[#efe6d0]">
                {completedRequiredCount} of {requiredFieldKeys.length} required items complete
              </p>
            </div>

            <div className="w-full max-w-sm">
              <div className="h-2 rounded-full bg-white/8">
                <div
                  className="h-2 rounded-full bg-[linear-gradient(90deg,#b68a1f,#d8c27a,#f0dfa4)] transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {submissionState.message ? (
            <div
              className={`mt-5 rounded-[1.4rem] border px-4 py-4 text-sm leading-7 ${
                submissionState.type === "success"
                  ? "border-[#d8c27a]/28 bg-[#d8c27a]/10 text-white"
                  : "border-[#8a3f3f]/55 bg-[#35191a]/70 text-white"
              }`}
              aria-live="polite"
            >
              {submissionState.message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#d8c27a] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e5d28f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting Application..." : "Submit Championship Application"}
          </button>
        </section>
      </div>
    </form>
  );
}
