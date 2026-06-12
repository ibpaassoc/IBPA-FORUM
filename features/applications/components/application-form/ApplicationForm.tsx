"use client";

import { useState } from "react";
import {
  Award,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileCheck,
  Layers,
  Send,
  User,
} from "lucide-react";
import BlockBRenderer from "@/features/applications/components/application-form/blocks/BlockBRenderer";
import StepBar, { type StepDef } from "@/features/applications/components/application-form/StepBar";
import { SelectField, TextField } from "@/features/applications/components/application-form/fields/FormControls";
import UploadField from "@/features/applications/components/application-form/fields/UploadField";
import { getVisibleCategoryFields, validateApplicationValues } from "@/features/applications/schemas/category-field-validation";
import { countryOptions } from "@/features/applications/config/countries";
import { heardAboutOptions } from "@/features/applications/config/application-timeline";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type {
  ApplicationValues,
  CategoryOption,
  ValidationErrors,
} from "@/features/applications/types/application.types";

const STEPS: StepDef[] = [
  { id: "category", label: "Category", icon: Layers },
  { id: "contact", label: "Contact", icon: User },
  { id: "profile", label: "Profile", icon: BadgeCheck },
  { id: "credentials", label: "Credentials", icon: FileCheck },
  { id: "details", label: "Details", icon: ClipboardList },
  { id: "motivation", label: "Motivation", icon: Award },
  { id: "confirm", label: "Confirm", icon: Send },
];

function isFieldComplete(value: ApplicationValues[string]) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return false;
}

export default function ApplyForm({ categories }: { categories: CategoryOption[] }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<ApplicationValues>({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<{ type: "idle" | "success" | "error"; message: string }>({ type: "idle", message: "" });
  const { language, t } = useLanguage();

  const selectedCategory = categories.find((c) => c.id === String(values.categoryId ?? ""));
  const localizedCategoryBySlug = new Map(
    t.categoriesPage.directions.map((c) => [c.slug, c])
  );
  const selectedLocalizedCategory = selectedCategory
    ? localizedCategoryBySlug.get(selectedCategory.slug)
    : undefined;
  const visibleCategoryFields = getVisibleCategoryFields(selectedCategory?.slug ?? null, values);

  const copy = {
    en: {
      steps: [
        { title: "Select Your Category", desc: "Choose the category and nomination that best fits your specialization." },
        { title: "Contact Details", desc: "Use the contact information that should receive review updates." },
        { title: "Professional Profile", desc: "Tell us about your professional background and experience." },
        { title: "Credentials", desc: "Upload your professional license or certification for verification." },
        { title: "Category Details", desc: "Complete the category-specific requirements for your nomination." },
        { title: "Motivation & Links", desc: "Share your online presence and how you found the award." },
        { title: "Review & Submit", desc: "Review your application before final submission." },
      ],
      back: "Back",
      continue: "Continue",
      submit: "Submit Application",
      submitting: "Submitting…",
      category: "Category",
      selectCategory: "Select category",
      nomination: "Nomination",
      selectNomination: "Select nomination",
      selectCategoryFirst: "Select category first",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      phone: "Phone / WhatsApp",
      country: "Country of Residence",
      selectCountry: "Select country",
      city: "City",
      stateProvince: "State / Province",
      countryOther: "Country (Other)",
      professionalTitle: "Professional Title",
      professionalTitlePh: "Master Stylist, Educator, Clinic Founder…",
      yearsExperience: "Years of Experience",
      yearsExperienceHint: "Minimum 2 years required.",
      licenseCertification: "Professional License / Certification",
      licenseCertificationHint: "Upload PDF, JPG, or PNG. Max 5 MB. Large images are auto-compressed.",
      website: "Professional Website",
      social: "Instagram / Social Media",
      reviews: "Client Reviews Link",
      heardAbout: "How did you hear about us?",
      selectOption: "Select an option",
      heardAboutOther: "Please specify",
      heardAboutLabels: { instagram: "Instagram", facebook: "Facebook", email: "Email newsletter", referral: "Friend or colleague", google: "Google search", event: "Event / expo", other: "Other" },
      confirmTitle: "Application Summary",
      confirmNote: "Please review the details below before submitting. Once submitted, your entry will be sent to the IBPA jury for evaluation.",
      confirmReady: "Ready to submit",
      errorValidation: "Please fill all required fields before continuing.",
      submitError: "Submission failed. Please try again.",
      submitException: "Something went wrong. Please try again.",
      redirecting: "Redirecting to payment…",
    },
    ru: {
      steps: [
        { title: "Выбор категории", desc: "Выберите категорию и номинацию, соответствующие вашей специализации." },
        { title: "Контактные данные", desc: "Укажите контактную информацию для получения обновлений." },
        { title: "Профессиональный профиль", desc: "Расскажите о своём профессиональном опыте." },
        { title: "Документы", desc: "Загрузите профессиональную лицензию или сертификат." },
        { title: "Детали категории", desc: "Заполните требования по выбранной категории и номинации." },
        { title: "Мотивация и ссылки", desc: "Поделитесь вашим онлайн-присутствием и расскажите, как вы узнали о премии." },
        { title: "Проверка и отправка", desc: "Проверьте заявку перед финальной отправкой." },
      ],
      back: "Назад",
      continue: "Продолжить",
      submit: "Отправить заявку",
      submitting: "Отправка…",
      category: "Категория",
      selectCategory: "Выберите категорию",
      nomination: "Номинация",
      selectNomination: "Выберите номинацию",
      selectCategoryFirst: "Сначала выберите категорию",
      firstName: "Имя",
      lastName: "Фамилия",
      email: "Email",
      phone: "Телефон / WhatsApp",
      country: "Страна проживания",
      selectCountry: "Выберите страну",
      city: "Город",
      stateProvince: "Штат / Регион",
      countryOther: "Страна (другое)",
      professionalTitle: "Профессиональный статус",
      professionalTitlePh: "Мастер-стилист, преподаватель, владелец студии…",
      yearsExperience: "Стаж работы",
      yearsExperienceHint: "Необходимо минимум 2 года.",
      licenseCertification: "Лицензия / Сертификат",
      licenseCertificationHint: "Загрузите PDF, JPG или PNG. Макс. 5 МБ.",
      website: "Профессиональный сайт",
      social: "Instagram / Соцсети",
      reviews: "Ссылка на отзывы клиентов",
      heardAbout: "Откуда вы узнали о нас?",
      selectOption: "Выберите вариант",
      heardAboutOther: "Уточните",
      heardAboutLabels: { instagram: "Instagram", facebook: "Facebook", email: "Email-рассылка", referral: "Друг или коллега", google: "Поиск Google", event: "Событие / выставка", other: "Другое" },
      confirmTitle: "Сводка заявки",
      confirmNote: "Проверьте данные перед отправкой. После отправки ваша заявка будет передана жюри IBPA.",
      confirmReady: "Готово к отправке",
      errorValidation: "Заполните все обязательные поля перед продолжением.",
      submitError: "Ошибка отправки. Попробуйте снова.",
      submitException: "Что-то пошло не так. Попробуйте снова.",
      redirecting: "Переход к оплате…",
    },
    ua: {
      steps: [
        { title: "Вибір категорії", desc: "Оберіть категорію та номінацію, що відповідає вашій спеціалізації." },
        { title: "Контактні дані", desc: "Вкажіть контактну інформацію для отримання оновлень." },
        { title: "Професійний профіль", desc: "Розкажіть про свій професійний досвід." },
        { title: "Документи", desc: "Завантажте професійну ліцензію або сертифікат." },
        { title: "Деталі категорії", desc: "Заповніть вимоги за обраною категорією та номінацією." },
        { title: "Мотивація та посилання", desc: "Поділіться своєю онлайн-присутністю та розкажіть, як ви дізналися про премію." },
        { title: "Перевірка та відправка", desc: "Перевірте заявку перед фінальним надсиланням." },
      ],
      back: "Назад",
      continue: "Продовжити",
      submit: "Надіслати заявку",
      submitting: "Надсилання…",
      category: "Категорія",
      selectCategory: "Оберіть категорію",
      nomination: "Номінація",
      selectNomination: "Оберіть номінацію",
      selectCategoryFirst: "Спочатку оберіть категорію",
      firstName: "Ім'я",
      lastName: "Прізвище",
      email: "Email",
      phone: "Телефон / WhatsApp",
      country: "Країна проживання",
      selectCountry: "Оберіть країну",
      city: "Місто",
      stateProvince: "Штат / Регіон",
      countryOther: "Країна (інше)",
      professionalTitle: "Професійний статус",
      professionalTitlePh: "Майстер-стиліст, викладач, власник студії…",
      yearsExperience: "Стаж роботи",
      yearsExperienceHint: "Потрібно щонайменше 2 роки.",
      licenseCertification: "Ліцензія / Сертифікат",
      licenseCertificationHint: "Завантажте PDF, JPG або PNG. Макс. 5 МБ.",
      website: "Професійний сайт",
      social: "Instagram / Соцмережі",
      reviews: "Посилання на відгуки клієнтів",
      heardAbout: "Звідки ви дізналися про нас?",
      selectOption: "Оберіть варіант",
      heardAboutOther: "Уточніть",
      heardAboutLabels: { instagram: "Instagram", facebook: "Facebook", email: "Email-розсилка", referral: "Друг або колега", google: "Пошук Google", event: "Подія / виставка", other: "Інше" },
      confirmTitle: "Підсумок заявки",
      confirmNote: "Перевірте дані перед надсиланням. Після надсилання вашу заявку буде передано журі IBPA.",
      confirmReady: "Готово до надсилання",
      errorValidation: "Заповніть усі обов'язкові поля перед продовженням.",
      submitError: "Помилка надсилання. Спробуйте ще раз.",
      submitException: "Щось пішло не так. Спробуйте ще раз.",
      redirecting: "Перехід до оплати…",
    },
  }[language];

  function handleChange(name: string, value: string | string[]) {
    setValues((cur) => {
      const next = { ...cur, [name]: value };
      if (name === "categoryId") next.awardId = "";
      if (name === "country" && value !== "Other") next.countryOther = "";
      return next;
    });
    setErrors((cur) => {
      const next = { ...cur };
      delete next[name];
      if (name === "categoryId") delete next.awardId;
      return next;
    });
  }

  function handleFilesChange(name: string, files: File[]) {
    setValues((cur) => ({ ...cur, [name]: files }));
    setErrors((cur) => { const next = { ...cur }; delete next[name]; return next; });
  }

  function validateStep(s: number): ValidationErrors {
    const e: ValidationErrors = {};
    const req = (key: string, val?: ApplicationValues[string]) => {
      if (!isFieldComplete(val ?? values[key])) e[key] = "Required";
    };

    if (s === 0) { req("categoryId"); req("awardId"); }
    if (s === 1) {
      req("firstName"); req("lastName"); req("email"); req("phone"); req("country"); req("city");
      if (String(values.country ?? "") === "Other") req("countryOther");
      if (String(values.country ?? "") === "USA") req("stateProvince");
    }
    if (s === 2) { req("professionalTitle"); req("yearsExperience"); }
    if (s === 3) { req("licenseCertification"); }
    if (s === 4) {
      for (const field of visibleCategoryFields.filter((f) => f.required)) req(field.key);
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
    const validation = validateApplicationValues({ values, categories });
    if (!validation.success) {
      setErrors(validation.errors);
      setSubmissionState({ type: "error", message: copy.errorValidation });
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      for (const [key, raw] of Object.entries(values)) {
        if (!raw) continue;
        if (Array.isArray(raw)) { for (const item of raw) formData.append(key, item); continue; }
        formData.append(key, String(raw));
      }
      const res = await fetch("/api/applications", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({})) as { message?: string; checkoutUrl?: string; fieldErrors?: ValidationErrors };
      if (!res.ok) {
        setErrors(data.fieldErrors ?? {});
        setSubmissionState({ type: "error", message: data.message ?? copy.submitError });
        return;
      }
      setSubmissionState({ type: "success", message: data.message ?? copy.redirecting });
      if (data.checkoutUrl) window.location.assign(data.checkoutUrl);
    } catch {
      setSubmissionState({ type: "error", message: copy.submitException });
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentStepInfo = copy.steps[step];

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
              <SelectField
                label={copy.category} name="categoryId" value={String(values.categoryId ?? "")}
                required placeholder={copy.selectCategory}
                options={categories.map((c) => ({ label: localizedCategoryBySlug.get(c.slug)?.title ?? c.name, value: c.id }))}
                error={errors.categoryId} onChange={handleChange}
              />
              <SelectField
                label={copy.nomination} name="awardId" value={String(values.awardId ?? "")}
                required disabled={!selectedCategory}
                placeholder={selectedCategory ? copy.selectNomination : copy.selectCategoryFirst}
                options={selectedCategory?.awards.map((a, i) => ({ label: selectedLocalizedCategory?.nominations[i] ?? a.name, value: a.id })) ?? []}
                error={errors.awardId} onChange={handleChange}
              />
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-6 md:grid-cols-2">
              <TextField label={copy.firstName} name="firstName" value={String(values.firstName ?? "")} required placeholder="As shown on official documents" error={errors.firstName} onChange={handleChange} />
              <TextField label={copy.lastName} name="lastName" value={String(values.lastName ?? "")} required placeholder="As shown on official documents" error={errors.lastName} onChange={handleChange} />
              <TextField label={copy.email} name="email" type="email" value={String(values.email ?? "")} required placeholder="name@example.com" error={errors.email} onChange={handleChange} />
              <TextField label={copy.phone} name="phone" type="tel" value={String(values.phone ?? "")} required placeholder="+1 (555) 123-4567" error={errors.phone} onChange={handleChange} />
              <SelectField label={copy.country} name="country" value={String(values.country ?? "")} required placeholder={copy.selectCountry} options={countryOptions} error={errors.country} onChange={handleChange} />
              {String(values.country ?? "") === "Other" && (
                <TextField label={copy.countryOther} name="countryOther" value={String(values.countryOther ?? "")} required placeholder="Enter your country" error={errors.countryOther} onChange={handleChange} />
              )}
              {String(values.country ?? "") === "USA" && (
                <TextField label={copy.stateProvince} name="stateProvince" value={String(values.stateProvince ?? "")} required placeholder="California" error={errors.stateProvince} onChange={handleChange} />
              )}
              <TextField label={copy.city} name="city" value={String(values.city ?? "")} required placeholder="Los Angeles" error={errors.city} onChange={handleChange} />
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-6 md:grid-cols-2">
              <TextField label={copy.professionalTitle} name="professionalTitle" value={String(values.professionalTitle ?? "")} required placeholder={copy.professionalTitlePh} error={errors.professionalTitle} onChange={handleChange} />
              <TextField label={copy.yearsExperience} name="yearsExperience" type="number" min={2} value={String(values.yearsExperience ?? "")} required placeholder="2" description={copy.yearsExperienceHint} error={errors.yearsExperience} onChange={handleChange} />
            </div>
          )}

          {step === 3 && (
            <div>
              <UploadField
                label={copy.licenseCertification} name="licenseCertification"
                files={Array.isArray(values.licenseCertification) ? values.licenseCertification.filter((f): f is File => f instanceof File) : []}
                required multiple={false} accept={["image/jpeg", "image/png", "application/pdf"]}
                description={copy.licenseCertificationHint} error={errors.licenseCertification} onChange={handleFilesChange}
              />
            </div>
          )}

          {step === 4 && (
            <BlockBRenderer
              categorySlug={selectedCategory?.slug ?? null}
              categoryName={selectedCategory?.name}
              values={values} errors={errors} onChange={handleChange} onFilesChange={handleFilesChange}
            />
          )}

          {step === 5 && (
            <div className="grid gap-6 md:grid-cols-2">
              <TextField label={copy.website} name="websiteUrl" type="url" value={String(values.websiteUrl ?? "")} placeholder="https://" error={errors.websiteUrl} onChange={handleChange} />
              <TextField label={copy.social} name="socialUrl" type="url" value={String(values.socialUrl ?? "")} placeholder="https://instagram.com/yourprofile" error={errors.socialUrl} onChange={handleChange} />
              <TextField label={copy.reviews} name="reviewsUrl" type="url" value={String(values.reviewsUrl ?? "")} placeholder="https://" error={errors.reviewsUrl} onChange={handleChange} />
              <SelectField
                label={copy.heardAbout} name="heardAbout" value={String(values.heardAbout ?? "")}
                placeholder={copy.selectOption}
                options={heardAboutOptions.map((o) => ({ ...o, label: copy.heardAboutLabels[o.value as keyof typeof copy.heardAboutLabels] ?? o.label }))}
                error={errors.heardAbout} onChange={handleChange}
              />
              {String(values.heardAbout ?? "") === "other" && (
                <TextField label={copy.heardAboutOther} name="heardAboutOther" value={String(values.heardAboutOther ?? "")} placeholder="Tell us the source" error={errors.heardAboutOther} onChange={handleChange} />
              )}
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
                    { label: "Category", value: selectedCategory?.name ?? "—" },
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
        <div className="mt-10 flex items-center justify-between pt-8 border-t border-black/6">
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
