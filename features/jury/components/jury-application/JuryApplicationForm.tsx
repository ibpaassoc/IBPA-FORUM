"use client"

import type { ChangeEvent, FormEvent } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import ExperienceSection from "@/features/jury/components/jury-application/sections/ExperienceSection"
import MaterialsSection from "@/features/jury/components/jury-application/sections/MaterialsSection"
import ProfessionalProfileSection from "@/features/jury/components/jury-application/sections/ProfessionalProfileSection"
import { useLanguage } from "@/lib/i18n/LanguageProvider"
import { FormProgressSidebar } from "@/shared/components/public"

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
  const { language } = useLanguage()
  const formRef = useRef<HTMLFormElement | null>(null)
  const [hasPreviousJudging, setHasPreviousJudging] = useState("no")
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([])
  const [isIbpaMember, setIsIbpaMember] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progressValue, setProgressValue] = useState(0)
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    type: "idle",
    message: "",
  })
  const [summary, setSummary] = useState<SubmissionSummary | null>(null)
  const copy = {
    en: {
      validationError:
        "We could not validate the form. Please review your information and try again.",
      received: "Your jury application has been received for review.",
      submitException:
        "Something went wrong while sending the application. Please try again.",
      fileTooLarge:
        "One or more files exceed the 3 MB limit. Please compress or resize your photo and certifications, then try again.",
      totalTooLarge:
        "The total size of your uploaded files exceeds 4 MB. Please compress or resize them and try again.",
      progressTitle: "Jury Application Progress",
      progressSubtitle: "Track your profile, experience, and required materials.",
      progressLabel: "Completion",
      stepProfile: "Professional profile",
      stepProfileHint: "Identity, location, and title fields",
      stepExperience: "Experience details",
      stepExperienceHint: "Judging history and expertise areas",
      stepMaterials: "Materials and disclosure",
      stepMaterialsHint: "Uploads, bio, and confidentiality",
      summaryTitle: "Application Summary",
      summaryCandidate: "Candidate",
      summaryLocation: "Location",
      summaryExpertise: "Expertise",
      expertiseSelected: "Expertise Selected",
      sending: "Sending Application...",
      submit: "Submit Jury Application",
      completeSuffix: "complete",
    },
    ru: {
      validationError:
        "Не удалось проверить форму. Проверьте данные и попробуйте снова.",
      received: "Ваша заявка в жюри получена и принята на рассмотрение.",
      submitException:
        "Во время отправки заявки произошла ошибка. Попробуйте еще раз.",
      fileTooLarge:
        "Один или несколько файлов превышают лимит 3 МБ. Пожалуйста, сожмите или уменьшите фото и сертификаты.",
      totalTooLarge:
        "Общий размер загруженных файлов превышает 4 МБ. Пожалуйста, сожмите их и попробуйте снова.",
      progressTitle: "Прогресс заявки в жюри",
      progressSubtitle: "Отслеживайте профиль, опыт и обязательные материалы.",
      progressLabel: "Заполнение",
      stepProfile: "Профиль",
      stepProfileHint: "Личные данные, локация и профессиональный статус",
      stepExperience: "Детали опыта",
      stepExperienceHint: "Опыт судейства и области экспертизы",
      stepMaterials: "Материалы и раскрытие",
      stepMaterialsHint: "Файлы, биография и конфиденциальность",
      summaryTitle: "Сводка заявки",
      summaryCandidate: "Кандидат",
      summaryLocation: "Локация",
      summaryExpertise: "Экспертиза",
      expertiseSelected: "Выбрано направлений",
      sending: "Отправка заявки...",
      submit: "Отправить заявку в жюри",
      completeSuffix: "заполнено",
    },
    ua: {
      validationError:
        "Не вдалося перевірити форму. Перевірте дані та спробуйте ще раз.",
      received: "Вашу заявку до журі отримано та передано на розгляд.",
      submitException:
        "Під час надсилання заявки сталася помилка. Спробуйте ще раз.",
      fileTooLarge:
        "Один або кілька файлів перевищують ліміт 3 МБ. Будь ласка, стисніть або зменшіть фото та сертифікати.",
      totalTooLarge:
        "Загальний розмір завантажених файлів перевищує 4 МБ. Будь ласка, стисніть їх і спробуйте ще раз.",
      progressTitle: "Прогрес заявки до журі",
      progressSubtitle: "Відстежуйте профіль, досвід і обов’язкові матеріали.",
      progressLabel: "Заповнення",
      stepProfile: "Профіль",
      stepProfileHint: "Особисті дані, локація та професійний статус",
      stepExperience: "Деталі досвіду",
      stepExperienceHint: "Досвід суддівства та сфери експертизи",
      stepMaterials: "Матеріали та розкриття",
      stepMaterialsHint: "Файли, біографія та конфіденційність",
      summaryTitle: "Підсумок заявки",
      summaryCandidate: "Кандидат",
      summaryLocation: "Локація",
      summaryExpertise: "Експертиза",
      expertiseSelected: "Обрано напрямків",
      sending: "Надсилання заявки...",
      submit: "Надіслати заявку до журі",
      completeSuffix: "заповнено",
    },
  }[language]

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
      "firstName",
      "lastName",
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
    const countryInput = form.elements.namedItem("country") as HTMLInputElement | null
    const countryOtherInput = form.elements.namedItem("countryOther") as HTMLInputElement | null

    const hasCertifications = Boolean(certificationsInput?.files?.length)
    const hasProfilePhoto = Boolean(profilePhotoInput?.files?.length)
    const confidentialityChecked = Boolean(confidentialityInput?.checked)
    const expertiseDone = selectedExpertise.length > 0
    const countryOtherDone =
      countryInput?.value !== "Other" || Boolean(countryOtherInput?.value?.trim())

    const judgingDetailsInput = form.elements.namedItem("previousJudgingDetails") as HTMLInputElement | null
    const conditionalDone =
      hasPreviousJudging === "no" || Boolean(judgingDetailsInput?.value?.trim())

    const totalChecks = 8 + 4 + 5
    const completedChecks =
      filledProfile +
      filledMaterials +
      (hasCertifications ? 1 : 0) +
      (hasProfilePhoto ? 1 : 0) +
      (confidentialityChecked ? 1 : 0) +
      (expertiseDone ? 1 : 0) +
      (countryOtherDone ? 1 : 0) +
      (conditionalDone ? 1 : 0)

    setProgressValue(Math.round((completedChecks / totalChecks) * 100))
  }, [hasPreviousJudging, selectedExpertise.length])

  useEffect(() => {
    updateProgress()
  }, [updateProgress])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget

    if (!form.reportValidity()) {
      return
    }

    const MAX_FILE_BYTES = 3 * 1024 * 1024 // 3 MB per file
    const MAX_TOTAL_BYTES = 4 * 1024 * 1024 // 4 MB total uploads

    const photoInput = form.elements.namedItem("profilePhoto") as HTMLInputElement | null
    const certInput = form.elements.namedItem("certifications") as HTMLInputElement | null
    const allFiles = [
      ...(photoInput?.files ? Array.from(photoInput.files) : []),
      ...(certInput?.files ? Array.from(certInput.files) : []),
    ]

    for (const file of allFiles) {
      if (file.size > MAX_FILE_BYTES) {
        setSubmissionState({ type: "error", message: copy.fileTooLarge })
        return
      }
    }

    const totalSize = allFiles.reduce((sum, f) => sum + f.size, 0)
    if (totalSize > MAX_TOTAL_BYTES) {
      setSubmissionState({ type: "error", message: copy.totalTooLarge })
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

      let data: Record<string, unknown> = {}
      try {
        data = await response.json()
      } catch {
        setSubmissionState({
          type: "error",
          message: response.status === 413 ? copy.fileTooLarge : copy.submitException,
        })
        return
      }

      if (!response.ok) {
        setSubmissionState({
          type: "error",
          message: typeof data.message === "string" ? data.message : copy.validationError,
        })
        return
      }

      setSummary((data.summary as SubmissionSummary) ?? null)
      setSubmissionState({
        type: "success",
        message: typeof data.message === "string" ? data.message : copy.received,
      })

      form.reset()
      setHasPreviousJudging("no")
      setSelectedExpertise([])
      setIsIbpaMember("")
    } catch {
      setSubmissionState({
        type: "error",
        message: copy.submitException,
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
            title={copy.progressTitle}
            subtitle={copy.progressSubtitle}
            progressLabel={copy.progressLabel}
            progressValue={progressValue}
            steps={[
              {
                id: "profile",
                label: copy.stepProfile,
                hint: copy.stepProfileHint,
                complete: progressValue >= 30,
              },
              {
                id: "experience",
                label: copy.stepExperience,
                hint: copy.stepExperienceHint,
                complete: progressValue >= 60,
              },
              {
                id: "materials",
                label: copy.stepMaterials,
                hint: copy.stepMaterialsHint,
                complete: progressValue >= 90,
              },
            ]}
          />
        </div>

        <div className="grid gap-[var(--space-md)] xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
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
              selectedExpertise={selectedExpertise}
              onPreviousJudgingChange={setHasPreviousJudging}
              onExpertiseChange={handleExpertiseChange}
              isIbpaMember={isIbpaMember}
              onIbpaMemberChange={setIsIbpaMember}
            />
            <MaterialsSection />

            {submissionState.message ? (
              <div
                className={`rounded-sm border px-(--space-sm) py-(--space-sm) text-sm leading-[1.65] ${
                  submissionState.type === "success"
                    ? "border-(--color-hover-accent) bg-[rgba(185,217,235,0.26)] text-(--color-ink)"
                    : "border-(--color-hover-accent) bg-[rgba(185,217,235,0.26)] text-(--color-ink)"
                }`}
                aria-live="polite"
              >
                {submissionState.message}
              </div>
            ) : null}

            {summary ? (
              <div className="rounded-sm border border-(--border-default) bg-(--color-white) p-(--space-md)">
                <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.18em] text-(--color-hover-accent)">
                  {copy.summaryTitle}
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-(--color-hover-accent)">
                      {copy.summaryCandidate}
                    </p>
                    <p className="mt-(--space-xs) text-sm font-medium text-(--color-ink)">{summary.name}</p>
                  </div>
                  <div>
                    <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-(--color-hover-accent)">
                      {copy.summaryLocation}
                    </p>
                    <p className="mt-(--space-xs) text-sm font-medium text-(--color-ink)">
                      {summary.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-(--color-hover-accent)">
                      {copy.summaryExpertise}
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
                  <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.18em] text-(--color-hover-accent)">
                    {copy.expertiseSelected}
                  </p>
                  <p className="mt-(--space-xs) text-sm text-(--color-ink-soft)">
                    {selectedExpertise.length} | {progressValue}% {copy.completeSuffix}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ibpa-button ibpa-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? copy.sending : copy.submit}
                </button>
              </div>
            </div>
          </div>
        </form>

          <FormProgressSidebar
            className="hidden xl:block"
            title={copy.progressTitle}
            subtitle={copy.progressSubtitle}
            progressLabel={copy.progressLabel}
            progressValue={progressValue}
            steps={[
              {
                id: "profile",
                label: copy.stepProfile,
                hint: copy.stepProfileHint,
                complete: progressValue >= 30,
              },
              {
                id: "experience",
                label: copy.stepExperience,
                hint: copy.stepExperienceHint,
                complete: progressValue >= 60,
              },
              {
                id: "materials",
                label: copy.stepMaterials,
                hint: copy.stepMaterialsHint,
                complete: progressValue >= 90,
              },
            ]}
          />
        </div>
      </div>
    </section>
  )
}
