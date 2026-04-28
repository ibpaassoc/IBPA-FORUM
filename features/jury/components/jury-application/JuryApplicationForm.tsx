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
          className="rounded-[1.4rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm md:p-8"
        >
          <div className="space-y-10">
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
                className={`rounded-2xl border px-4 py-4 text-sm leading-6 ${
                  submissionState.type === "success"
                    ? "border-[#d8c27a]/35 bg-[#d8c27a]/10 text-white"
                    : "border-[#a64b4b]/45 bg-[#4d1d1d]/35 text-white"
                }`}
                aria-live="polite"
              >
                {submissionState.message}
              </div>
            ) : null}

            {summary ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
                  Application Summary
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                      Candidate
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">{summary.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                      Location
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      {summary.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                      Expertise
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      {summary.expertise.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
                    Expertise Selected
                  </p>
                  <p className="mt-2 text-sm text-[#efe6d0]">{selectedExpertise.length}</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-full bg-[#d8c27a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
