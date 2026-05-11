"use client"

import type { ChangeEvent, FormEvent } from "react"
import { useState } from "react"
import ExperienceSection from "@/features/jury/components/jury-application/sections/ExperienceSection"
import MaterialsSection from "@/features/jury/components/jury-application/sections/MaterialsSection"
import ProfessionalProfileSection from "@/features/jury/components/jury-application/sections/ProfessionalProfileSection"

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
  const [hasPreviousJudging, setHasPreviousJudging] = useState("no")
  const [isPastWinner, setIsPastWinner] = useState("no")
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      <div className="mx-auto max-w-5xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-(--radius) border border-(--border-default) bg-(--color-off-white) p-(--space-lg) shadow-(--shadow-lg)"
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
                    ? "border-(--color-hover) bg-[rgba(185,217,235,0.26)] text-(--color-navy)"
                    : "border-(--color-hover) bg-[rgba(185,217,235,0.26)] text-(--color-navy)"
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
                    <p className="mt-(--space-xs) text-sm font-medium text-(--color-navy)">{summary.name}</p>
                  </div>
                  <div>
                    <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-(--color-hover)">
                      Location
                    </p>
                    <p className="mt-(--space-xs) text-sm font-medium text-(--color-navy)">
                      {summary.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-(--color-hover)">
                      Expertise
                    </p>
                    <p className="mt-(--space-xs) text-sm font-medium text-(--color-navy)">
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
                  <p className="mt-(--space-xs) text-sm text-(--color-steel)">
                    {selectedExpertise.length}
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
      </div>
    </section>
  )
}
