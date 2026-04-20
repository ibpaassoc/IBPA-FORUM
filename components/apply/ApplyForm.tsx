"use client";

import { useState } from "react";
import FormSection from "@/components/apply/FormSection";
import BlockAFields from "@/components/apply/BlockAFields";
import BlockBRenderer from "@/components/apply/BlockBRenderer";
import { getVisibleCategoryFields, validateApplicationValues } from "@/lib/apply/categorySchemas";
import { applicationTimeline } from "@/lib/apply/catalog";
import type {
  ApplicationValues,
  CategoryOption,
  MembershipValidationResult,
  ValidationErrors,
} from "@/lib/apply/types";

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
  const [membership, setMembership] = useState<MembershipValidationResult | null>(null);
  const [isValidatingMembership, setIsValidatingMembership] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    type: "idle",
    message: "",
  });

  const selectedCategory = categories.find(
    (category) => category.id === String(values.categoryId ?? "")
  );
  const selectedAward = selectedCategory?.awards.find(
    (award) => award.id === String(values.awardId ?? "")
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
    "membershipNumber",
    "licenseCertification",
    "categoryId",
    "awardId",
    ...visibleCategoryFields.filter((field) => field.required).map((field) => field.key),
  ];
  const completedRequiredCount = requiredFieldKeys.filter((fieldKey) => {
    if (fieldKey === "membershipNumber") {
      return Boolean(membership?.membershipLevel) && Boolean(membership?.qualified);
    }

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

      if (name === "membershipNumber") {
        setMembership(null);
        next.membershipLevel = "";
      }

      return next;
    });

    setErrors((current) => {
      const next = { ...current };
      delete next[name];

      if (name === "categoryId") {
        delete next.awardId;
      }

      if (name === "membershipNumber") {
        delete next.membershipNumber;
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

  async function validateMembership() {
    const membershipNumber = String(values.membershipNumber ?? "").trim();

    if (!membershipNumber) {
      setErrors((current) => ({
        ...current,
        membershipNumber: "IBPA Membership Number is required.",
      }));
      return null;
    }

    setIsValidatingMembership(true);
    try {
      const response = await fetch("/api/membership/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ membershipNumber }),
      });

      const data = (await response.json()) as MembershipValidationResult;
      setMembership(data);
      setValues((current) => ({
        ...current,
        membershipLevel: data.membershipLevel ?? "",
      }));

      setErrors((current) => {
        const next = { ...current };
        if (data.membershipLevel && data.qualified) {
          delete next.membershipNumber;
        } else if (data.message) {
          next.membershipNumber = data.message;
        }
        return next;
      });

      return data;
    } catch {
      setErrors((current) => ({
        ...current,
        membershipNumber: "Unable to validate membership right now.",
      }));
      return null;
    } finally {
      setIsValidatingMembership(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionState({ type: "idle", message: "" });

    let currentMembership = membership;
    if (!currentMembership || currentMembership.membershipNumber !== values.membershipNumber) {
      currentMembership = await validateMembership();
    }

    const validation = validateApplicationValues({
      values,
      categories,
      membership: currentMembership,
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

      if (membership?.membershipLevel) {
        formData.set("membershipLevel", membership.membershipLevel);
      }

      const response = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        message?: string;
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
          "Your application has been submitted successfully.",
      });
      setValues({});
      setErrors({});
      setMembership(null);
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
      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
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
            description="Block B changes based on the category you select. Each field is tailored to the judging criteria for that discipline."
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
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.8rem] border border-[#d8c27a]/18 bg-[linear-gradient(145deg,rgba(24,24,27,0.95),rgba(19,22,29,0.92)_60%,rgba(41,34,25,0.88))] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.25)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
              Submission Readiness
            </p>
            <div className="mt-4 h-2 rounded-full bg-white/8">
              <div
                className="h-2 rounded-full bg-[linear-gradient(90deg,#b68a1f,#d8c27a,#f0dfa4)] transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-[#efe6d0]">
              {completedRequiredCount} of {requiredFieldKeys.length} required items complete
            </p>

            <div className="mt-6 space-y-4">
              {[
                ["Entry Fee", applicationTimeline.feeLabel],
                ["Membership", membership?.membershipLevel ?? "Pending validation"],
                ["Category", selectedCategory?.name ?? "Not selected"],
                ["Specific Award", selectedAward?.name ?? "Not selected"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3"
                >
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/42">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
              Important Notes
            </p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-[#d9d4ca]">
              <p>Each category is a separate submission and billed separately.</p>
              <p>
                Membership must validate at <strong>{applicationTimeline.membershipMinimum}</strong> or
                higher before submission is unlocked.
              </p>
              <p>
                Your uploaded files are stored with structured metadata for later
                review in the admin panel.
              </p>
            </div>
          </div>

          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
              Submission Footer
            </p>
            <p className="mt-4 text-sm leading-7 text-[#d9d4ca]">
              By submitting, you confirm that the information, files, and claims
              provided are accurate, professionally obtained, and suitable for
              IBPA championship review.
            </p>

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
              disabled={isSubmitting || isValidatingMembership}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#d8c27a] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e5d28f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting Application..." : "Submit Championship Application"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
