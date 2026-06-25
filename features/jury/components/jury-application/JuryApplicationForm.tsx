"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { upload } from "@vercel/blob/client";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Check,
  ChevronLeft,
  ClipboardList,
  FileCheck,
  Send,
  Shield,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import UploadField from "@/features/applications/components/application-form/fields/UploadField";
import { SelectField, TextField, TextareaField, ChoiceGroupField } from "@/features/applications/components/application-form/fields/FormControls";
import { countryOptions } from "@/features/applications/config/countries";
import { categories as expertiseCategories } from "@/data/home";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type StepDef = { id: string; label: string; icon: typeof User };

const heroPrimaryButtonClass =
  "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border border-white/10 bg-gradient-to-r from-[#050505] via-[#111111] to-[#050505] px-8 py-4 font-[var(--font-ui-family)] text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.24)] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:border-[#7a98af]/55 hover:shadow-[0_14px_40px_rgba(122,152,175,0.16)] disabled:pointer-events-none disabled:opacity-55";

const heroSecondaryButtonClass =
  "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border border-[var(--color-blue)]/16 bg-white/72 px-7 py-4 font-[var(--font-ui-family)] text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink)] shadow-[0_8px_28px_rgba(42,66,82,0.07)] backdrop-blur-xl transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:border-[var(--color-blue)]/34 hover:bg-white hover:shadow-[0_12px_36px_rgba(122,152,175,0.12)] disabled:pointer-events-none disabled:opacity-35";

function HeroButtonInner({ children, arrow = true }: { children: ReactNode; arrow?: boolean }) {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#7a98af]/10 opacity-60 transition-opacity duration-200 group-hover:opacity-90" />
      <span className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[#b9d9eb]/0 to-transparent transition-all duration-200 group-hover:inset-x-5 group-hover:via-[#b9d9eb]/55" />
      <span className="relative z-10">{children}</span>
      {arrow ? (
        <ArrowRight
          size={16}
          className="relative z-10 text-[#b9d9eb] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-white"
        />
      ) : null}
    </>
  );
}

const STEPS: StepDef[] = [
  { id: "contact", label: "Contact", icon: User },
  { id: "profile", label: "Profile", icon: BadgeCheck },
  { id: "experience", label: "Experience", icon: ClipboardList },
  { id: "credentials", label: "Credentials", icon: FileCheck },
  { id: "materials", label: "Materials", icon: Award },
  { id: "motivation", label: "Motivation", icon: Shield },
  { id: "confirm", label: "Confirm", icon: Send },
];

type FormValues = Record<string, string | string[] | File[]>;

function isFieldFilled(value: FormValues[string] | undefined) {
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  return String(value).trim().length > 0;
}

export default function JuryApplicationForm() {
  const { language } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [stepDirection, setStepDirection] = useState<1 | -1>(1);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submissionState, setSubmissionState] = useState<{ type: "idle" | "success" | "error"; message: string }>({ type: "idle", message: "" });

  const copy = {
    en: {
      steps: [
        { title: "Contact Details", desc: "Use the contact information that should receive review updates." },
        { title: "Professional Profile", desc: "Share your professional title, experience, and current affiliation." },
        { title: "Judging Experience", desc: "Describe your previous judging experience and areas of expertise." },
        { title: "Credentials", desc: "Upload your professional certifications and a profile photo." },
        { title: "Bio & Disclosure", desc: "Share your professional bio, website, and any conflict of interest." },
        { title: "Motivation & Agreement", desc: "Tell us why you want to serve as a judge and agree to confidentiality." },
        { title: "Review & Submit", desc: "Review your application before final submission." },
      ],
      back: "Back",
      continue: "Continue",
      submit: "Submit Application",
      submitting: "Submitting…",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      phone: "Phone / WhatsApp",
      country: "Country",
      selectCountry: "Select country",
      city: "City",
      countryOther: "Country (Other)",
      stateProvince: "State / Province",
      professionalTitle: "Professional Title",
      professionalTitlePh: "PMU Artist & Educator",
      yearsExperience: "Years of Professional Experience",
      yearsExperienceHint: "A minimum of 5 years is required for the jury panel.",
      employer: "Current Employer / Affiliation",
      employerPh: "Salon, academy, clinic, organization, or brand",
      previousJudging: "Previous Judging Experience",
      previousJudgingHint: "If yes, tell us where, when, and in what format you served.",
      yes: "Yes",
      no: "No",
      judgingDetails: "Judging Experience Details",
      judgingDetailsPh: "Describe the award, event, year, and judging format.",
      expertise: "Areas of Expertise",
      expertiseHint: "Choose every category you are qualified to evaluate.",
      ibpaMember: "Are you an accredited IBPA member?",
      ibpaNumber: "IBPA ID",
      ibpaNumberPh: "e.g. CERT-2026-XXXXX",
      ibpaNumberHint: "Enter the certificate ID of an accredited IBPA member.",
      certifications: "Professional Certifications",
      certificationsHint: "Upload up to 10 PDF or image files.",
      profilePhoto: "Profile Photo",
      profilePhotoHint: "Upload one professional JPG or PNG image for your jury profile.",
      bio: "Professional Bio",
      bioPh: "Share your background, achievements, and role in the industry. This bio can be published on the jury page if approved.",
      bioHint: "Target length: up to 300 words.",
      website: "Professional Website / LinkedIn",
      conflict: "Conflict of Interest Disclosure",
      conflictPh: "Disclose any relationships with nominees, schools, salons, brands, or other participants.",
      motivation: "Why do you want to serve as a judge?",
      motivationPh: "Describe what you would bring to the IBPA jury panel and why the role matters to you.",
      motivationHint: "Target length: up to 200 words.",
      confidentiality: "I agree to keep all jury deliberations, candidate information, and judging materials strictly confidential.",
      confirmTitle: "Application Summary",
      confirmNote: "Please review the details below. Once submitted, your jury application will be forwarded to the IBPA committee.",
      received: "Your jury application has been received for review.",
      submitError: "Something went wrong. Please try again.",
      uploading: "Uploading files…",
    },
    ru: {
      steps: [
        { title: "Контактные данные", desc: "Укажите контактную информацию для получения обновлений." },
        { title: "Профессиональный профиль", desc: "Укажите профессиональный статус, стаж и текущую аффилиацию." },
        { title: "Опыт судейства", desc: "Опишите предыдущий опыт судейства и области экспертизы." },
        { title: "Документы", desc: "Загрузите профессиональные сертификаты и фото профиля." },
        { title: "Биография и раскрытие", desc: "Поделитесь биографией, сайтом и данными о конфликтах интересов." },
        { title: "Мотивация и соглашение", desc: "Расскажите, почему вы хотите быть судьей, и подтвердите конфиденциальность." },
        { title: "Проверка и отправка", desc: "Проверьте заявку перед финальной отправкой." },
      ],
      back: "Назад",
      continue: "Продолжить",
      submit: "Отправить заявку",
      submitting: "Отправка…",
      firstName: "Имя",
      lastName: "Фамилия",
      email: "Email",
      phone: "Телефон / WhatsApp",
      country: "Страна",
      selectCountry: "Выберите страну",
      city: "Город",
      countryOther: "Страна (другое)",
      stateProvince: "Штат / Регион",
      professionalTitle: "Профессиональный статус",
      professionalTitlePh: "PMU-мастер и преподаватель",
      yearsExperience: "Стаж профессиональной работы",
      yearsExperienceHint: "Для состава жюри требуется минимум 5 лет опыта.",
      employer: "Текущее место работы / аффилиация",
      employerPh: "Салон, академия, клиника, организация или бренд",
      previousJudging: "Опыт судейства",
      previousJudgingHint: "Если да, укажите где, когда и в каком формате вы судили.",
      yes: "Да",
      no: "Нет",
      judgingDetails: "Детали опыта судейства",
      judgingDetailsPh: "Опишите премию, событие, год и формат судейства.",
      expertise: "Области экспертизы",
      expertiseHint: "Выберите все категории, которые вы можете оценивать.",
      ibpaMember: "Являетесь ли вы аккредитованным участником IBPA?",
      ibpaNumber: "ID IBPA",
      ibpaNumberPh: "Пример: CERT-2026-XXXXX",
      ibpaNumberHint: "Введите ID сертификата аккредитованного участника IBPA.",
      certifications: "Профессиональные сертификаты",
      certificationsHint: "Загрузите до 10 файлов PDF или изображений.",
      profilePhoto: "Фото профиля",
      profilePhotoHint: "Загрузите одно профессиональное фото JPG или PNG.",
      bio: "Профессиональная биография",
      bioPh: "Опишите ваш опыт, достижения и роль в индустрии. Биография может быть опубликована после одобрения.",
      bioHint: "Рекомендуемый объем: до 300 слов.",
      website: "Профессиональный сайт / LinkedIn",
      conflict: "Раскрытие конфликта интересов",
      conflictPh: "Укажите любые связи с номинантами, школами, салонами, брендами или участниками.",
      motivation: "Почему вы хотите быть судьей?",
      motivationPh: "Опишите, какой вклад вы можете внести в состав жюри IBPA.",
      motivationHint: "Рекомендуемый объем: до 200 слов.",
      confidentiality: "Я соглашаюсь сохранять конфиденциальность всех обсуждений жюри, информации о кандидатах и материалов оценивания.",
      confirmTitle: "Сводка заявки",
      confirmNote: "Проверьте данные. После отправки ваша заявка будет передана комитету IBPA.",
      received: "Ваша заявка в жюри получена и принята на рассмотрение.",
      submitError: "Что-то пошло не так. Попробуйте снова.",
      uploading: "Загрузка файлов…",
    },
    ua: {
      steps: [
        { title: "Контактні дані", desc: "Вкажіть контактну інформацію для отримання оновлень." },
        { title: "Професійний профіль", desc: "Вкажіть статус, стаж та поточну афіліацію." },
        { title: "Досвід суддівства", desc: "Опишіть попередній досвід суддівства та сфери експертизи." },
        { title: "Документи", desc: "Завантажте сертифікати та фото профілю." },
        { title: "Біографія та розкриття", desc: "Поділіться біографією, сайтом і даними про конфлікти інтересів." },
        { title: "Мотивація та угода", desc: "Розкажіть, чому хочете бути суддею, та підтвердьте конфіденційність." },
        { title: "Перевірка та надсилання", desc: "Перевірте заявку перед фінальним надсиланням." },
      ],
      back: "Назад",
      continue: "Продовжити",
      submit: "Надіслати заявку",
      submitting: "Надсилання…",
      firstName: "Ім'я",
      lastName: "Прізвище",
      email: "Email",
      phone: "Телефон / WhatsApp",
      country: "Країна",
      selectCountry: "Оберіть країну",
      city: "Місто",
      countryOther: "Країна (інше)",
      stateProvince: "Штат / Регіон",
      professionalTitle: "Професійний статус",
      professionalTitlePh: "PMU-майстер і викладач",
      yearsExperience: "Стаж професійної роботи",
      yearsExperienceHint: "Для складу журі потрібно щонайменше 5 років досвіду.",
      employer: "Поточне місце роботи / афіліація",
      employerPh: "Салон, академія, клініка, організація або бренд",
      previousJudging: "Досвід суддівства",
      previousJudgingHint: "Якщо так, вкажіть де, коли і в якому форматі ви судили.",
      yes: "Так",
      no: "Ні",
      judgingDetails: "Деталі досвіду суддівства",
      judgingDetailsPh: "Опишіть премію, подію, рік і формат суддівства.",
      expertise: "Сфери експертизи",
      expertiseHint: "Оберіть усі категорії, які ви можете оцінювати.",
      ibpaMember: "Чи є ви акредитованим учасником IBPA?",
      ibpaNumber: "ID IBPA",
      ibpaNumberPh: "Приклад: CERT-2026-XXXXX",
      ibpaNumberHint: "Введіть ID сертифіката акредитованого учасника IBPA.",
      certifications: "Професійні сертифікати",
      certificationsHint: "Завантажте до 10 файлів PDF або зображень.",
      profilePhoto: "Фото профілю",
      profilePhotoHint: "Завантажте одне фото JPG або PNG.",
      bio: "Професійна біографія",
      bioPh: "Опишіть ваш досвід, досягнення та роль в індустрії. Може бути опублікована після схвалення.",
      bioHint: "Рекомендований обсяг: до 300 слів.",
      website: "Професійний сайт / LinkedIn",
      conflict: "Розкриття конфлікту інтересів",
      conflictPh: "Вкажіть будь-які зв'язки з номінантами, школами, салонами, брендами або учасниками.",
      motivation: "Чому ви хочете бути суддею?",
      motivationPh: "Опишіть, який внесок ви можете зробити до складу журі IBPA.",
      motivationHint: "Рекомендований обсяг: до 200 слів.",
      confidentiality: "Я погоджуюся зберігати конфіденційність усіх обговорень журі, інформації про кандидатів і матеріалів оцінювання.",
      confirmTitle: "Підсумок заявки",
      confirmNote: "Перевірте дані. Після надсилання вашу заявку буде передано комітету IBPA.",
      received: "Вашу заявку до журі отримано та передано на розгляд.",
      submitError: "Щось пішло не так. Спробуйте ще раз.",
      uploading: "Завантаження файлів…",
    },
  }[language];
  const stepContentVariants = {
    enter: (direction: 1 | -1) => ({
      x: direction > 0 ? 16 : -16,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 1 | -1) => ({
      x: direction > 0 ? -16 : 16,
      opacity: 0,
    }),
  } as const;

  const currentStepInfo = copy.steps[step];

  function handleChange(name: string, value: string | string[]) {
    setValues((cur) => {
      const next = { ...cur, [name]: value };
      if (name === "country" && value !== "Other") delete next.countryOther;
      if (name === "country" && value !== "USA") delete next.stateProvince;
      if (name === "previousJudgingExperience" && value === "no") delete next.previousJudgingDetails;
      if (name === "ibpaAssociationMember" && value === "no") delete next.ibpaNumber;
      return next;
    });
    setErrors((cur) => { const next = { ...cur }; delete next[name]; return next; });
  }

  function handleFilesChange(name: string, files: File[]) {
    setValues((cur) => ({ ...cur, [name]: files }));
    setErrors((cur) => { const next = { ...cur }; delete next[name]; return next; });
  }

  function validateStep(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    const req = (key: string) => { if (!isFieldFilled(values[key])) e[key] = "Required"; };

    if (s === 0) {
      req("firstName"); req("lastName"); req("email"); req("phone"); req("country"); req("city");
      if (String(values.country ?? "") === "Other") req("countryOther");
      if (String(values.country ?? "") === "USA") req("stateProvince");
    }
    if (s === 1) {
      req("professionalTitle"); req("yearsExperience"); req("employerAffiliation");
    }
    if (s === 2) {
      req("previousJudgingExperience");
      req("expertise");
      if (String(values.previousJudgingExperience ?? "") === "yes") req("previousJudgingDetails");
      if (String(values.ibpaAssociationMember ?? "") === "yes") req("ibpaNumber");
    }
    if (s === 3) {
      req("certifications");
      req("profilePhoto");
    }
    if (s === 4) {
      req("professionalBio");
      req("conflictDisclosure");
    }
    if (s === 5) {
      req("motivation");
      if (!isFieldFilled(values.confidentialityAgreement)) e.confidentialityAgreement = "You must agree to continue";
    }
    return e;
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function advance() {
    const e = validateStep(step);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setStepDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    scrollToForm();
  }

  function back() {
    setStepDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
    scrollToForm();
  }

  function sanitizeBlobName(name: string) {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const uploadSessionId = crypto.randomUUID();

      // Upload files directly to Vercel Blob from the browser.
      setIsUploading(true);
      const profilePhotoFile = (values.profilePhoto as File[] | undefined)?.[0];
      const certFiles = (values.certifications as File[] | undefined ?? []).filter(
        (f): f is File => f instanceof File
      );

      const [profilePhotoResult, ...certResults] = await Promise.all([
        profilePhotoFile
          ? upload(
              `jury/${uploadSessionId}/profilePhoto-1-${sanitizeBlobName(profilePhotoFile.name)}`,
              profilePhotoFile,
              { access: "private", handleUploadUrl: "/api/jury/upload", multipart: true }
            )
          : null,
        ...certFiles.map((file, i) =>
          upload(
            `jury/${uploadSessionId}/certifications-${i + 1}-${sanitizeBlobName(file.name)}`,
            file,
            { access: "private", handleUploadUrl: "/api/jury/upload", multipart: true }
          )
        ),
      ]);
      setIsUploading(false);

      // Build FormData: text fields only, plus blob metadata.
      const formData = new FormData();
      for (const [key, raw] of Object.entries(values)) {
        if (!raw || key === "profilePhoto" || key === "certifications") continue;
        if (Array.isArray(raw)) {
          for (const item of raw) {
            if (!(item instanceof File)) formData.append(key, String(item));
          }
          continue;
        }
        formData.append(key, String(raw));
      }

      if (profilePhotoResult && profilePhotoFile) {
        formData.append(
          "profilePhotoBlob",
          JSON.stringify({
            fileName: profilePhotoFile.name,
            mimeType: profilePhotoFile.type || "image/jpeg",
            fileSize: profilePhotoFile.size,
            storageKey: profilePhotoResult.pathname,
          })
        );
      }

      certFiles.forEach((file, i) => {
        const result = certResults[i];
        if (result) {
          formData.append(
            "certificationsBlob",
            JSON.stringify({
              fileName: file.name,
              mimeType: file.type || "application/pdf",
              fileSize: file.size,
              storageKey: result.pathname,
            })
          );
        }
      });

      const res = await fetch("/api/jury", { method: "POST", body: formData });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setSubmissionState({ type: "error", message: data.message ?? copy.submitError });
        return;
      }
      setSubmissionState({ type: "success", message: data.message ?? copy.received });
    } catch {
      setIsUploading(false);
      setSubmissionState({ type: "error", message: copy.submitError });
    } finally {
      setIsSubmitting(false);
    }
  }

  const country = String(values.country ?? "");
  const prevJudging = String(values.previousJudgingExperience ?? "");
  const ibpaMember = String(values.ibpaAssociationMember ?? "");

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 pb-12">
      <nav
        aria-label="Jury application steps"
        className="mx-auto w-full max-w-5xl rounded-full border border-[var(--color-blue)]/18 bg-white/86 px-4 py-4 shadow-[0_18px_55px_rgba(42,66,82,0.07)] backdrop-blur-xl sm:px-6"
      >
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === step;
            const isComplete = index < step;
            const currentStepValid = Object.keys(validateStep(step)).length === 0;
            const canNavigate =
              index === step ||
              index < step ||
              (currentStepValid &&
                Array.from({ length: index }).every(
                  (_, stepIndex) => Object.keys(validateStep(stepIndex)).length === 0
                ));

            return (
              <div key={item.id} className="flex min-w-0 items-center">
                <button
                  type="button"
                  disabled={!canNavigate}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`${item.label} step`}
                  title={item.label}
                  onClick={() => {
                    if (index === step || !canNavigate) return;
                    setStepDirection(index > step ? 1 : -1);
                    setErrors({});
                    setStep(index);
                    scrollToForm();
                  }}
                  className={`group flex min-w-[58px] flex-col items-center justify-start gap-2 rounded-[1.35rem] px-1 py-1.5 text-center transition duration-200 sm:min-w-[70px] ${
                    canNavigate ? "cursor-pointer" : "cursor-not-allowed opacity-55"
                  }`}
                >
                  <span
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition duration-200 sm:h-11 sm:w-11 ${
                      isActive
                        ? "border-[var(--color-blue)]/65 bg-white text-[var(--color-blue)] shadow-[0_8px_22px_rgba(114,160,193,0.14)]"
                        : isComplete
                          ? "border-[var(--color-blue)]/24 bg-[var(--color-blue-wash)] text-[var(--color-blue)] group-hover:border-[var(--color-blue)]/38 group-hover:bg-white"
                          : canNavigate
                            ? "border-transparent bg-[var(--color-off-white)] text-[var(--color-ink-soft)] group-hover:border-[var(--color-blue)]/28 group-hover:bg-[rgba(185,217,235,0.2)] group-hover:text-[var(--color-blue)]"
                            : "border-transparent bg-[var(--color-off-white)] text-[var(--color-ink)]/24"
                    }`}
                  >
                    {isComplete ? (
                      <Check size={15} strokeWidth={2.15} />
                    ) : (
                      <Icon size={15} strokeWidth={1.55} />
                    )}
                  </span>

                  <span
                    className={`hidden text-[0.55rem] font-bold uppercase leading-none tracking-[0.18em] sm:block ${
                      isActive
                        ? "text-[var(--color-ink)]"
                        : isComplete
                          ? "text-[var(--color-blue)]"
                          : "text-[var(--color-ink-soft)]/70"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>

                {index < STEPS.length - 1 ? (
                  <span
                    aria-hidden
                    className={`mx-1 hidden h-px w-4 shrink-0 sm:block md:w-5 ${
                      index < step
                        ? "bg-[var(--color-blue)]/24"
                        : "bg-[var(--color-blue)]/10"
                    }`}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="mx-auto max-w-4xl rounded-2xl border border-white/70 bg-white/72 p-5 shadow-[0_20px_64px_rgba(42,66,82,0.1)] backdrop-blur-xl sm:rounded-[32px] sm:p-8 md:rounded-[40px] md:p-14">
        <div className="mb-10">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[var(--color-hover-accent)]">
            {STEPS[step].label} — {step + 1} / {STEPS.length}
          </p>
          <h2 className="mt-2 font-[var(--font-title-family)] text-[clamp(1.8rem,3.5vw,2.6rem)] font-light leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)]">
            {currentStepInfo.title}
          </h2>
          <p className="mt-2 font-[var(--font-accent-family)] text-[1rem] italic leading-[1.6] text-[var(--color-ink-soft)]">
            {currentStepInfo.desc}
          </p>
        </div>

        {/* Step content */}
        <div className="min-h-[300px] overflow-x-hidden overflow-y-visible">
          <AnimatePresence initial={false} custom={stepDirection} mode="wait">
            <motion.div
              key={step}
              custom={stepDirection}
              variants={stepContentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10"
            >
          {step === 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              <TextField label={copy.firstName} name="firstName" value={String(values.firstName ?? "")} required placeholder="As shown on official documents" error={errors.firstName} onChange={handleChange} />
              <TextField label={copy.lastName} name="lastName" value={String(values.lastName ?? "")} required placeholder="As shown on official documents" error={errors.lastName} onChange={handleChange} />
              <TextField label={copy.email} name="email" type="email" value={String(values.email ?? "")} required placeholder="name@example.com" error={errors.email} onChange={handleChange} />
              <TextField label={copy.phone} name="phone" type="tel" value={String(values.phone ?? "")} required placeholder="+1 (555) 000-0000" error={errors.phone} onChange={handleChange} />
              <SelectField label={copy.country} name="country" value={country} required placeholder={copy.selectCountry} options={countryOptions} error={errors.country} onChange={handleChange} />
              {country === "Other" && (
                <TextField label={copy.countryOther} name="countryOther" value={String(values.countryOther ?? "")} required placeholder="Enter your country" error={errors.countryOther} onChange={handleChange} />
              )}
              {country === "USA" && (
                <TextField label={copy.stateProvince} name="stateProvince" value={String(values.stateProvince ?? "")} required placeholder="California" error={errors.stateProvince} onChange={handleChange} />
              )}
              <TextField label={copy.city} name="city" value={String(values.city ?? "")} required placeholder="Los Angeles" error={errors.city} onChange={handleChange} />
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-6 md:grid-cols-2">
              <TextField label={copy.professionalTitle} name="professionalTitle" value={String(values.professionalTitle ?? "")} required placeholder={copy.professionalTitlePh} error={errors.professionalTitle} onChange={handleChange} />
              <TextField label={copy.yearsExperience} name="yearsExperience" type="number" min={5} value={String(values.yearsExperience ?? "")} required placeholder="5" description={copy.yearsExperienceHint} error={errors.yearsExperience} onChange={handleChange} />
              <TextField label={copy.employer} name="employerAffiliation" value={String(values.employerAffiliation ?? "")} required placeholder={copy.employerPh} error={errors.employerAffiliation} onChange={handleChange} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <ChoiceGroupField
                label={copy.previousJudging} name="previousJudgingExperience"
                value={prevJudging} required
                description={copy.previousJudgingHint}
                options={[{ label: copy.yes, value: "yes" }, { label: copy.no, value: "no" }]}
                error={errors.previousJudgingExperience} onChange={handleChange}
              />
              {prevJudging === "yes" && (
                <TextareaField label={copy.judgingDetails} name="previousJudgingDetails" value={String(values.previousJudgingDetails ?? "")} required placeholder={copy.judgingDetailsPh} error={errors.previousJudgingDetails} onChange={handleChange} />
              )}
              <ChoiceGroupField
                label={copy.expertise} name="expertise"
                value={Array.isArray(values.expertise) ? values.expertise.filter((v): v is string => typeof v === "string") : []}
                required multiple description={copy.expertiseHint}
                options={expertiseCategories.map((c) => ({ label: c, value: c }))}
                error={errors.expertise} onChange={handleChange}
              />
              <ChoiceGroupField
                label={copy.ibpaMember} name="ibpaAssociationMember"
                value={ibpaMember}
                options={[{ label: copy.yes, value: "yes" }, { label: copy.no, value: "no" }]}
                error={errors.ibpaAssociationMember} onChange={handleChange}
              />
              {ibpaMember === "yes" && (
                <TextField label={copy.ibpaNumber} name="ibpaNumber" value={String(values.ibpaNumber ?? "")} required placeholder={copy.ibpaNumberPh} description={copy.ibpaNumberHint} error={errors.ibpaNumber} onChange={handleChange} />
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <UploadField
                label={copy.certifications} name="certifications"
                files={Array.isArray(values.certifications) ? values.certifications.filter((f): f is File => f instanceof File) : []}
                required multiple maxFiles={10} accept={["image/jpeg", "image/png", "application/pdf"]}
                description={copy.certificationsHint} error={errors.certifications} onChange={handleFilesChange}
              />
              <UploadField
                label={copy.profilePhoto} name="profilePhoto"
                files={Array.isArray(values.profilePhoto) ? values.profilePhoto.filter((f): f is File => f instanceof File) : []}
                required multiple={false} accept={["image/jpeg", "image/png"]}
                description={copy.profilePhotoHint} error={errors.profilePhoto} onChange={handleFilesChange}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <TextareaField label={copy.bio} name="professionalBio" value={String(values.professionalBio ?? "")} required placeholder={copy.bioPh} description={copy.bioHint} rows={6} error={errors.professionalBio} onChange={handleChange} />
              <TextField label={copy.website} name="professionalWebsite" type="url" value={String(values.professionalWebsite ?? "")} placeholder="https://" error={errors.professionalWebsite} onChange={handleChange} />
              <TextareaField label={copy.conflict} name="conflictDisclosure" value={String(values.conflictDisclosure ?? "")} required placeholder={copy.conflictPh} rows={4} error={errors.conflictDisclosure} onChange={handleChange} />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <TextareaField label={copy.motivation} name="motivation" value={String(values.motivation ?? "")} required placeholder={copy.motivationPh} description={copy.motivationHint} rows={6} error={errors.motivation} onChange={handleChange} />
              <div>
                <label
                  className={`group flex cursor-pointer items-start gap-4 rounded-[1.5rem] border p-4 transition-all duration-200 ${
                    isFieldFilled(values.confidentialityAgreement)
                      ? "border-[var(--color-blue)]/45 bg-[var(--color-blue-wash)] shadow-[0_12px_30px_rgba(114,160,193,0.1)]"
                      : "border-[var(--border-default)] bg-white/70 hover:border-[var(--color-blue)]/35 hover:bg-[rgba(185,217,235,0.16)]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isFieldFilled(values.confidentialityAgreement)}
                    onChange={(e) => handleChange("confidentialityAgreement", e.target.checked ? "yes" : "")}
                    className="sr-only"
                  />
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                      isFieldFilled(values.confidentialityAgreement)
                        ? "border-[var(--color-blue)] bg-[var(--color-blue)] text-white"
                        : "border-[var(--border-default)] bg-white text-transparent group-hover:border-[var(--color-blue)]/60 group-hover:bg-[var(--color-blue-wash)]"
                    }`}
                  >
                    <Check size={14} strokeWidth={2.4} />
                  </span>
                  <span className="text-[0.93rem] leading-[1.6] text-[var(--color-ink-soft)]">{copy.confidentiality}</span>
                </label>
                {errors.confidentialityAgreement && (
                  <p className="mt-2 text-[0.72rem] text-red-500">{errors.confidentialityAgreement}</p>
                )}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-5">
              <div className="rounded-[2rem] border border-[var(--color-blue)]/12 bg-white/78 p-6 shadow-[0_18px_55px_rgba(42,66,82,0.07)] backdrop-blur-xl">
                <p className="page-eyebrow">{copy.confirmTitle}</p>
                <p className="mt-2 text-[0.9rem] leading-[1.7] text-[var(--color-ink-soft)]">{copy.confirmNote}</p>
                <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {[
                    { label: "Name", value: `${values.firstName ?? ""} ${values.lastName ?? ""}`.trim() },
                    { label: "Email", value: String(values.email ?? "") },
                    { label: "Country", value: String(values.country ?? "") },
                    { label: "Title", value: String(values.professionalTitle ?? "") },
                    { label: "Experience", value: `${String(values.yearsExperience ?? "")} years` },
                  ].map((row) => (
                    <div key={row.label}>
                      <dt className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--color-ink)]/40">{row.label}</dt>
                      <dd className="mt-1 text-[0.95rem] font-semibold text-[var(--color-ink)]">{row.value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {submissionState.message ? (
                <div className={`rounded-[16px] border px-5 py-4 text-sm ${submissionState.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`} aria-live="polite">
                  {submissionState.message}
                </div>
              ) : null}
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-10 flex flex-col gap-4 border-t border-[var(--color-blue)]/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className={heroSecondaryButtonClass}
          >
            <ChevronLeft size={15} className="relative z-10 transition duration-200 group-hover:-translate-x-0.5" />
            <span className="relative z-10">{copy.back}</span>
          </button>

          {step < STEPS.length - 1 ? (
            <button
              key="continue"
              type="button"
              onClick={advance}
              className={heroPrimaryButtonClass}
            >
              <HeroButtonInner>{copy.continue}</HeroButtonInner>
            </button>
          ) : (
            <button
              key="submit"
              type="submit"
              disabled={isSubmitting}
              className={heroPrimaryButtonClass}
            >
              <HeroButtonInner>{isUploading ? copy.uploading : isSubmitting ? copy.submitting : copy.submit}</HeroButtonInner>
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
