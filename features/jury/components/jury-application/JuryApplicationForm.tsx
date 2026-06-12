"use client";

import { useState } from "react";
import {
  Award,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileCheck,
  Send,
  Shield,
  User,
} from "lucide-react";
import UploadField from "@/features/applications/components/application-form/fields/UploadField";
import StepBar, { type StepDef } from "@/features/applications/components/application-form/StepBar";
import { SelectField, TextField, TextareaField, ChoiceGroupField } from "@/features/applications/components/application-form/fields/FormControls";
import { countryOptions } from "@/features/applications/config/countries";
import { categories as expertiseCategories } from "@/data/home";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

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
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      certificationsHint: "Upload up to 5 PDF or image files. Max 3 MB each.",
      profilePhoto: "Profile Photo",
      profilePhotoHint: "Upload one professional JPG or PNG image for your jury profile. Max 3 MB.",
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
      certificationsHint: "Загрузите до 5 файлов PDF или изображений. Макс. 3 МБ каждый.",
      profilePhoto: "Фото профиля",
      profilePhotoHint: "Загрузите одно профессиональное фото JPG или PNG. Макс. 3 МБ.",
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
      certificationsHint: "Завантажте до 5 файлів PDF або зображень. Макс. 3 МБ кожен.",
      profilePhoto: "Фото профілю",
      profilePhotoHint: "Завантажте одне фото JPG або PNG. Макс. 3 МБ.",
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
    },
  }[language];

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

  function advance() {
    const e = validateStep(step);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      for (const [key, raw] of Object.entries(values)) {
        if (!raw) continue;
        if (Array.isArray(raw)) {
          for (const item of raw) {
            if (item instanceof File) formData.append(key, item);
            else formData.append(key, String(item));
          }
          continue;
        }
        formData.append(key, String(raw));
      }
      const res = await fetch("/api/jury", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({})) as { message?: string };
      if (!res.ok) {
        setSubmissionState({ type: "error", message: data.message ?? copy.submitError });
        return;
      }
      setSubmissionState({ type: "success", message: data.message ?? copy.received });
    } catch {
      setSubmissionState({ type: "error", message: copy.submitError });
    } finally {
      setIsSubmitting(false);
    }
  }

  const country = String(values.country ?? "");
  const prevJudging = String(values.previousJudgingExperience ?? "");
  const ibpaMember = String(values.ibpaAssociationMember ?? "");

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      {/* Step bar — top nav */}
      <StepBar steps={STEPS} current={step} />

      {/* Form card */}
      <div className="mx-auto max-w-4xl rounded-[40px] border border-slate-100 bg-[#F1F3F5] p-8 shadow-xl md:p-14">
        {/* Step heading */}
        <div className="mb-10">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[var(--color-hover-accent)]">
            {STEPS[step].label} — {step + 1} / {STEPS.length}
          </p>
          <h2 className="mt-2 font-[var(--font-ui-family)] text-[2rem] font-black uppercase leading-none tracking-[-0.02em] text-[var(--color-ink)] md:text-[2.5rem]">
            {currentStepInfo.title}
          </h2>
          <p className="mt-2 font-[var(--font-accent-family)] text-[1rem] italic leading-[1.6] text-[var(--color-ink-soft)]">
            {currentStepInfo.desc}
          </p>
        </div>

        {/* Step content */}
        <div className="min-h-[300px]">
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
                required multiple accept={["image/jpeg", "image/png", "application/pdf"]}
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
                <label className={`flex cursor-pointer items-start gap-3 rounded-[14px] border-2 px-5 py-4 transition-all duration-200 ${isFieldFilled(values.confidentialityAgreement) ? "border-[var(--color-hover-accent)] bg-[rgba(114,160,193,0.08)]" : "border-transparent bg-[var(--surface-muted)] hover:border-[var(--color-hover-accent)]/30 hover:bg-white"}`}>
                  <input
                    type="checkbox"
                    checked={isFieldFilled(values.confidentialityAgreement)}
                    onChange={(e) => handleChange("confidentialityAgreement", e.target.checked ? "yes" : "")}
                    className="mt-0.5 h-4 w-4 rounded accent-[var(--color-hover-accent)]"
                  />
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
              <div className="rounded-[24px] bg-white/80 p-6 border border-slate-100 shadow-sm">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[var(--color-hover-accent)]">{copy.confirmTitle}</p>
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
        </div>

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between border-t border-black/6 pt-8">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-white px-6 py-3 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)] shadow-sm transition hover:border-[var(--color-ink)] hover:shadow-md disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft size={14} /> {copy.back}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={advance}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-8 py-3 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-white shadow-lg transition hover:bg-[var(--color-ink)]/90 hover:shadow-xl"
            >
              {copy.continue} <ChevronRight size={14} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-8 py-3 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-white shadow-lg transition hover:bg-[var(--color-ink)]/90 disabled:opacity-60"
            >
              {isSubmitting ? copy.submitting : copy.submit} <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
