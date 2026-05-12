"use client"

import type { ChangeEvent, FormEvent } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import ExperienceSection from "@/features/jury/components/jury-application/sections/ExperienceSection"
import MaterialsSection from "@/features/jury/components/jury-application/sections/MaterialsSection"
import ProfessionalProfileSection from "@/features/jury/components/jury-application/sections/ProfessionalProfileSection"
import { FadeUp, FormProgressSidebar } from "@/shared/components/public"

type SubmissionSummary = {
  name: string
  location: string
  expertise: string[]
}

type SubmissionState =
  | {
      type: "idle"
      message: string
    }
  | {
      type: "success" | "error"
      message: string
    }

export default function JuryApplicationForm() {
  const formRef = useRef<HTMLFormElement | null>(null)
  const [hasPreviousJudging, setHasPreviousJudging] = useState("no")
  const [isPastWinner, setIsPastWinner] = useState("no")
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progressValue, setProgressValue] = useState(0)
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    type: "idle",
    message: "",
  })
  const [summary, setSummary] = useState<SubmissionSummary | null>(null)

  const handleExpertiseChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target

    setSelectedExpertise((current) => {
      if (checked) {
        return [...current, value]
      }

      return current.filter((item) => item !== value)
    })
  }

  const updateProgress = useCallback(() => {
    const form = formRef.current
    if (!form) {
      return
    }

    const profileFields = [
      "fullName",
      "email",
      "phone",
      "country",
      "city",
      "professionalTitle",
      "yearsExperience",
      "employerAffiliation",
    ]
    const materialsFields = [
      "professionalBio",
      "conflictDisclosure",
      "motivation",
      "professionalWebsite",
    ]

    const filledProfile = profileFields.filter((name) => {
      const input = form.elements.namedItem(name) as HTMLInputElement | null
      return Boolean(input?.value?.trim())
    }).length

    const filledMaterials = materialsFields.filter((name) => {
      const input = form.elements.namedItem(name) as HTMLInputElement | null
      return Boolean(input?.value?.trim())
    }).length

    const certificationsInput = form.elements.namedItem("certifications") as HTMLInputElement | null
    const profilePhotoInput = form.elements.namedItem("profilePhoto") as HTMLInputElement | null
    const confidentialityInput = form.elements.namedItem("confidentialityAgreement") as HTMLInputElement | null

    const hasCertifications = Boolean(certificationsInput?.files?.length)
    const hasProfilePhoto = Boolean(profilePhotoInput?.files?.length)
    const confidentialityChecked = Boolean(confidentialityInput?.checked)
    const expertiseDone = selectedExpertise.length > 0

    const judgingDetailsInput = form.elements.namedItem("previousJudgingDetails") as HTMLInputElement | null
    const winnerYearInput = form.elements.namedItem("pastWinnerYear") as HTMLInputElement | null
    const conditionalDone =
      (hasPreviousJudging === "no" || Boolean(judgingDetailsInput?.value?.trim())) &&
      (isPastWinner === "no" || Boolean(winnerYearInput?.value?.trim()))

    const totalChecks = 8 + 4 + 5
    const completedChecks =
      filledProfile +
      filledMaterials +
      (hasCertifications ? 1 : 0) +
      (hasProfilePhoto ? 1 : 0) +
      (confidentialityChecked ? 1 : 0) +
      (expertiseDone ? 1 : 0) +
      (conditionalDone ? 1 : 0)

    setProgressValue(Math.round((completedChecks / totalChecks) * 100))
  }, [hasPreviousJudging, isPastWinner, selectedExpertise.length])

  useEffect(() => {
    updateProgress()
  }, [updateProgress])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget

    if (!form.reportValidity()) {
      return
    }

    setIsSubmitting(true)
    setSubmissionState({ type: "idle", message: "" })

    try {
      const formData = new FormData(form)
      const response = await fetch("/api/jury", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmissionState({
          type: "error",
          message:
            data.message ??
            "We could not validate the form. Please review your information and try again.",
        })
        return
      }

      setSummary(data.summary ?? null)
      setSubmissionState({
        type: "success",
        message:
          data.message ??
          "Your jury application has been received for review.",
      })

      form.reset()
      setHasPreviousJudging("no")
      setIsPastWinner("no")
      setSelectedExpertise([])
    } catch {
      setSubmissionState({
        type: "error",
        message:
          "Something went wrong while sending the application. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="jury-application-form">
      <div className="mx-auto max-w-[var(--content-width)]">
        <div className="mb-[var(--space-md)] xl:hidden">
          <FormProgressSidebar
            title="Jury Application Progress"
            subtitle="Track your profile, experience, and required materials."
            progressLabel="Completion"
            progressValue={progressValue}
            steps={[
              {
                id: "profile",
                label: "Professional profile",
                hint: "Identity, location, and title fields",
                complete: progressValue >= 30,
              },
              {
                id: "experience",
                label: "Experience details",
                hint: "Judging history and expertise areas",
                complete: progressValue >= 60,
              },
              {
                id: "materials",
                label: "Materials and disclosure",
                hint: "Uploads, bio, and confidentiality",
                complete: progressValue >= 90,
              },
            ]}
          />
        </div>

        <div className="grid gap-[var(--space-md)] xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <FadeUp>
        <form
          ref={formRef}
          onInput={updateProgress}
          onChange={updateProgress}
          onSubmit={handleSubmit}
          className="rounded-(--radius) border border-(--border-default) bg-(--surface) p-(--space-lg) shadow-(--shadow-lg)"
        >
          <div className="space-y-(--space-lg)">
            <ProfessionalProfileSection />
            <ExperienceSection
              hasPreviousJudging={hasPreviousJudging}
              isPastWinner={isPastWinner}
              selectedExpertise={selectedExpertise}
              onPreviousJudgingChange={setHasPreviousJudging}
              onPastWinnerChange={setIsPastWinner}
              onExpertiseChange={handleExpertiseChange}
            />
            <MaterialsSection />

            {submissionState.message ? (
              <div
                className={`rounded-sm border px-(--space-sm) py-(--space-sm) text-sm leading-[1.65] ${
                  submissionState.type === "success"
                    ? "border-(--color-hover) bg-[rgba(185,217,235,0.26)] text-(--color-ink)"
                    : "border-(--color-hover) bg-[rgba(185,217,235,0.26)] text-(--color-ink)"
                }`}
                aria-live="polite"
              >
                {submissionState.message}
              </div>
            ) : null}

            {summary ? (
              <div className="rounded-sm border border-(--border-default) bg-(--color-white) p-(--space-md)">
                <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.18em] text-(--color-hover)">
                  Application Summary
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-(--color-hover)">
                      Candidate
                    </p>
                    <p className="mt-(--space-xs) text-sm font-medium text-(--color-ink)">{summary.name}</p>
                  </div>
                  <div>
                    <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-(--color-hover)">
                      Location
                    </p>
                    <p className="mt-(--space-xs) text-sm font-medium text-(--color-ink)">
                      {summary.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-(--color-hover)">
                      Expertise
                    </p>
                    <p className="mt-(--space-xs) text-sm font-medium text-(--color-ink)">
                      {summary.expertise.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-(--space-sm) border-t border-(--border-default) pt-(--space-md)">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.18em] text-(--color-hover)">
                    Expertise Selected
                  </p>
                  <p className="mt-(--space-xs) text-sm text-(--color-ink-soft)">
                    {selectedExpertise.length} | {progressValue}% complete
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ibpa-button ibpa-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Sending Application..." : "Submit Jury Application"}
                </button>
              </div>
            </div>
          </div>
        </form>
          </FadeUp>

          <FormProgressSidebar
            className="hidden xl:block"
            title="Jury Application Progress"
            subtitle="Track your profile, experience, and required materials."
            progressLabel="Completion"
            progressValue={progressValue}
            steps={[
              {
                id: "profile",
                label: "Professional profile",
                hint: "Identity, location, and title fields",
                complete: progressValue >= 30,
              },
              {
                id: "experience",
                label: "Experience details",
                hint: "Judging history and expertise areas",
                complete: progressValue >= 60,
              },
              {
                id: "materials",
                label: "Materials and disclosure",
                hint: "Uploads, bio, and confidentiality",
                complete: progressValue >= 90,
              },
            ]}
          />
        </div>
      </div>
    </section>
  )
}
