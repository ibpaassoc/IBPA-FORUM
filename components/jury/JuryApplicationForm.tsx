"use client"

import type { ChangeEvent, FormEvent, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react"
import { useState } from "react"
import { categories } from "@/data/home"

const membershipLevels = [
  "Trainer",
  "Coach",
  "Educator",
  "Master",
  "Director",
  "Other",
]

const inputClassName =
  "w-full rounded-2xl border border-white/12 bg-white/4 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#d6a63a] focus:bg-white/6"

const textareaClassName =
  "min-h-[132px] w-full rounded-2xl border border-white/12 bg-white/4 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#d6a63a] focus:bg-white/6"

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

function FieldShell({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <label className="text-sm font-medium text-white">{label}</label>
        {required ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d6a63a]">
            Required
          </span>
        ) : null}
      </div>
      {children}
      {hint ? <p className="mt-2 text-xs leading-5 text-white/45">{hint}</p> : null}
    </div>
  )
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
}) {
  const { label, hint, required, className, ...rest } = props

  return (
    <FieldShell label={label} hint={hint} required={required}>
      <input className={className ?? inputClassName} required={required} {...rest} />
    </FieldShell>
  )
}

function TextareaField(props: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  hint?: string
}) {
  const { label, hint, required, className, ...rest } = props

  return (
    <FieldShell label={label} hint={hint} required={required}>
      <textarea
        className={className ?? textareaClassName}
        required={required}
        {...rest}
      />
    </FieldShell>
  )
}

function SidebarCard({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string
  title: string
  text: string
}) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/3 p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d6a63a]">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/65">{text}</p>
    </div>
  )
}

export default function JuryApplicationForm() {
  const [membershipStatus, setMembershipStatus] = useState("member")
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
      setMembershipStatus("member")
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
    <section id="jury-application-form" className="border-b border-white/10 bg-[#050505]">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="mb-8 max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d6a63a]">
            Application Form
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Complete your official jury application
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/70">
            Submit your professional profile, areas of expertise, certifications,
            biography, and ethics declaration. Required materials are marked and
            will help the IBPA team evaluate your candidacy.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[1.4rem] border border-white/12 bg-white/3 p-6 md:p-8"
          >
            <div className="space-y-10">
              <div className="border-b border-white/10 pb-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d6a63a]">
                  Professional Profile
                </p>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <TextInput
                    label="Full Legal Name"
                    name="fullName"
                    placeholder="Exactly as it should appear on official documents"
                    required
                  />

                  <TextInput
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                  />

                  <TextInput
                    label="Phone / WhatsApp"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    required
                  />

                  <TextInput
                    label="Country"
                    name="country"
                    placeholder="United States"
                    required
                  />

                  <TextInput
                    label="City"
                    name="city"
                    placeholder="Los Angeles"
                    required
                  />

                  <TextInput
                    label="Professional Title"
                    name="professionalTitle"
                    placeholder="PMU Artist & Educator"
                    required
                  />

                  <TextInput
                    label="Years of Professional Experience"
                    name="yearsExperience"
                    type="number"
                    min={5}
                    placeholder="5"
                    hint="A minimum of 5 years is required for the jury panel."
                    required
                  />

                  <TextInput
                    label="Current Employer / Affiliation"
                    name="employerAffiliation"
                    placeholder="Salon, academy, clinic, organization, or brand"
                    required
                  />
                </div>
              </div>

              <div className="border-b border-white/10 pb-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d6a63a]">
                  Membership & Experience
                </p>

                <div className="mt-5 space-y-5">
                  <FieldShell
                    label="IBPA Membership Status"
                    hint="Membership is not required, but it can strengthen the application."
                    required
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { value: "member", label: "Member" },
                        { value: "not-yet", label: "Not yet" },
                      ].map((item) => (
                        <label
                          key={item.value}
                          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/12 bg-white/4 px-4 py-3 text-sm text-white transition hover:border-[#d6a63a]"
                        >
                          <input
                            type="radio"
                            name="membershipStatus"
                            value={item.value}
                            checked={membershipStatus === item.value}
                            onChange={() => setMembershipStatus(item.value)}
                            className="h-4 w-4 accent-[#d6a63a]"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </FieldShell>

                  {membershipStatus === "member" ? (
                    <FieldShell
                      label="IBPA Membership Level"
                      hint="Shown only when the applicant is already an IBPA member."
                    >
                      <select
                        name="membershipLevel"
                        defaultValue=""
                        className={inputClassName}
                      >
                        <option value="" className="bg-[#101010] text-white">
                          Select membership level
                        </option>
                        {membershipLevels.map((level) => (
                          <option
                            key={level}
                            value={level}
                            className="bg-[#101010] text-white"
                          >
                            {level}
                          </option>
                        ))}
                      </select>
                    </FieldShell>
                  ) : null}

                  <FieldShell
                    label="Previous Judging Experience"
                    hint="If yes, tell us where, when, and in what format you served."
                    required
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { value: "yes", label: "Yes" },
                        { value: "no", label: "No" },
                      ].map((item) => (
                        <label
                          key={item.value}
                          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/12 bg-white/4 px-4 py-3 text-sm text-white transition hover:border-[#d6a63a]"
                        >
                          <input
                            type="radio"
                            name="previousJudgingExperience"
                            value={item.value}
                            checked={hasPreviousJudging === item.value}
                            onChange={() => setHasPreviousJudging(item.value)}
                            className="h-4 w-4 accent-[#d6a63a]"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </FieldShell>

                  {hasPreviousJudging === "yes" ? (
                    <TextareaField
                      label="Judging Experience Details"
                      name="previousJudgingDetails"
                      placeholder="Describe the championship, event, year, and judging format."
                      required
                    />
                  ) : null}

                  <FieldShell
                    label="Are you a past IBPA Championship winner?"
                    hint="If yes, include the year of your title."
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { value: "yes", label: "Yes" },
                        { value: "no", label: "No" },
                      ].map((item) => (
                        <label
                          key={item.value}
                          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/12 bg-white/4 px-4 py-3 text-sm text-white transition hover:border-[#d6a63a]"
                        >
                          <input
                            type="radio"
                            name="pastWinner"
                            value={item.value}
                            checked={isPastWinner === item.value}
                            onChange={() => setIsPastWinner(item.value)}
                            className="h-4 w-4 accent-[#d6a63a]"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </FieldShell>

                  {isPastWinner === "yes" ? (
                    <TextInput
                      label="Winning Year"
                      name="pastWinnerYear"
                      type="number"
                      min={2000}
                      max={2035}
                      placeholder="2025"
                    />
                  ) : null}

                  <FieldShell
                    label="Areas of Expertise"
                    hint="Choose every category you are qualified to evaluate."
                    required
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {categories.map((category) => (
                        <label
                          key={category}
                          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/12 bg-white/4 px-4 py-3 text-sm text-white transition hover:border-[#d6a63a]"
                        >
                          <input
                            type="checkbox"
                            name="expertise"
                            value={category}
                            checked={selectedExpertise.includes(category)}
                            onChange={handleExpertiseChange}
                            className="h-4 w-4 rounded accent-[#d6a63a]"
                          />
                          <span>{category}</span>
                        </label>
                      ))}
                    </div>
                  </FieldShell>
                </div>
              </div>

              <div className="border-b border-white/10 pb-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d6a63a]">
                  Materials & Disclosure
                </p>

                <div className="mt-5 space-y-5">
                  <FieldShell
                    label="Professional Certifications"
                    hint="Upload up to 5 PDF or image files."
                    required
                  >
                    <input
                      type="file"
                      name="certifications"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      required
                      className="block w-full rounded-2xl border border-dashed border-white/14 bg-white/4 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-[#d6a63a] file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.16em] file:text-black"
                    />
                  </FieldShell>

                  <TextareaField
                    label="Professional Bio"
                    name="professionalBio"
                    placeholder="Share your background, achievements, and role in the industry. This bio can be published on the jury page if approved."
                    maxLength={2200}
                    hint="Target length: up to 300 words."
                    required
                  />

                  <FieldShell
                    label="Profile Photo"
                    hint="Upload one professional JPG or PNG image for your jury profile."
                    required
                  >
                    <input
                      type="file"
                      name="profilePhoto"
                      accept=".jpg,.jpeg,.png"
                      required
                      className="block w-full rounded-2xl border border-dashed border-white/14 bg-white/4 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-[#d6a63a] file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.16em] file:text-black"
                    />
                  </FieldShell>

                  <TextInput
                    label="Professional Website / LinkedIn"
                    name="professionalWebsite"
                    type="url"
                    placeholder="https://"
                  />

                  <TextareaField
                    label="Conflict of Interest Disclosure"
                    name="conflictDisclosure"
                    placeholder="Disclose any relationships with nominees, schools, salons, brands, or other participants."
                    required
                  />

                  <TextareaField
                    label="Why do you want to serve as a judge?"
                    name="motivation"
                    placeholder="Describe what you would bring to the IBPA jury panel and why the role matters to you."
                    maxLength={1500}
                    hint="Target length: up to 200 words."
                    required
                  />

                  <label className="flex items-start gap-3 rounded-2xl border border-white/12 bg-white/4 px-4 py-4 text-sm text-white">
                    <input
                      type="checkbox"
                      name="confidentialityAgreement"
                      value="yes"
                      required
                      className="mt-1 h-4 w-4 rounded accent-[#d6a63a]"
                    />
                    <span className="leading-6 text-white/85">
                      I agree to keep all jury deliberations, candidate information,
                      and judging materials confidential.
                    </span>
                  </label>
                </div>
              </div>

              {submissionState.message ? (
                <div
                  className={`rounded-2xl border px-4 py-4 text-sm leading-6 ${
                    submissionState.type === "success"
                      ? "border-[#d6a63a]/35 bg-[#d6a63a]/10 text-white"
                      : "border-[#a64b4b]/45 bg-[#4d1d1d]/35 text-white"
                  }`}
                  aria-live="polite"
                >
                  {submissionState.message}
                </div>
              ) : null}

              {summary ? (
                <div className="rounded-2xl border border-white/12 bg-black/20 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d6a63a]">
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

              <div className="flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
                <p className="max-w-xl text-sm leading-6 text-white/55">
                  By submitting, you confirm that the information provided is
                  accurate and suitable for professional review by the IBPA team.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-full bg-[#d6a63a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Sending Application..." : "Submit Jury Application"}
                </button>
              </div>
            </div>
          </form>

          <div className="space-y-4">
            <SidebarCard
              eyebrow="Checklist"
              title="What to prepare"
              text="Have your certifications, professional bio, profile photo, expertise categories, and conflict disclosure ready before submitting."
            />

            <SidebarCard
              eyebrow="Publication"
              title="What appears on the jury page"
              text="If approved and paid, your full name, professional title, profile photo, bio, and approved expertise areas can be published publicly."
            />

            <SidebarCard
              eyebrow="After Approval"
              title="Documents judges receive"
              text="Approved and paid judges receive an official invitation, jury certificate, appreciation letter, contribution letter, and public jury listing."
            />

            <div className="rounded-2xl border border-white/12 bg-[linear-gradient(to_right,rgba(214,166,58,0.10),rgba(255,255,255,0.02))] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d6a63a]">
                Live Snapshot
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                    Expertise Areas
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {selectedExpertise.length}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                    Membership
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {membershipStatus === "member" ? "Member" : "Not Yet"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                    Review Time
                  </p>
                  <p className="mt-2 text-2xl font-semibold">14 Days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
