"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BadgeCheck, Check, FileText, ShieldCheck, ShoppingCart, X } from "lucide-react";
import {
  SelectField,
  TextField,
} from "@/features/applications/components/application-form/fields/FormControls";
import { computeApplicantNominationPrice } from "@/features/applications/lib/pricing";
import { countryOptions } from "@/features/applications/config/countries";
import type { CategoryOption } from "@/features/applications/types/application.types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  countryOther: string;
  stateProvince: string;
  city: string;
  professionalTitle: string;
  yearsExperience: string;
  websiteUrl: string;
  socialUrl: string;
  reviewsUrl: string;
  isIbpaMember: boolean;
  ibpaMemberNumber: string;
  rulesAccepted: boolean;
  privacyAccepted: boolean;
  paymentTermsAccepted: boolean;
  refundNoticeAccepted: boolean;
};

type CertState = "idle" | "checking" | "valid" | "invalid" | "error";

const STORAGE_KEY = "ibpa-apply-purchase-v1";

const initialValues: FormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  countryOther: "",
  stateProvince: "",
  city: "",
  professionalTitle: "",
  yearsExperience: "",
  websiteUrl: "",
  socialUrl: "",
  reviewsUrl: "",
  isIbpaMember: false,
  ibpaMemberNumber: "",
  rulesAccepted: false,
  privacyAccepted: false,
  paymentTermsAccepted: false,
  refundNoticeAccepted: false,
};

const copy = {
  en: {
    eyebrow: "Applicant checkout",
    title: "Buy nominations first. Complete entries from your account.",
    intro:
      "Choose one or more nominations, confirm the required notices, and pay securely. After payment, your applicant account will hold every purchased nomination.",
    personal: "Personal information",
    membership: "IBPA membership",
    nominations: "Nominations",
    agreements: "Agreements",
    summary: "Order summary",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone / WhatsApp",
    country: "Country of residence",
    countryOther: "Country (other)",
    stateProvince: "State / Province",
    city: "City",
    professionalTitle: "Professional title",
    yearsExperience: "Years of experience",
    instagram: "Instagram",
    social: "Social media",
    reviews: "Client reviews link",
    selectCountry: "Select country",
    memberLabel: "I am a verified IBPA member",
    certNumber: "IBPA membership number",
    certValid: "Verified member rate will apply.",
    certInvalid: "We could not verify this number. Standard rate will apply.",
    certChecking: "Verifying membership...",
    certError: "Membership verification is temporarily unavailable. Standard rate will apply.",
    selected: "Selected",
    selectedEmpty: "No nominations selected yet.",
    alreadyOwn: "You already have this nomination.",
    memberRate: "Member rate",
    standardRate: "Standard rate",
    checkout: "Continue to secure checkout",
    checkoutPending: "Creating checkout...",
    submissionError: "Could not create checkout. Please review the form and try again.",
    required: "Required",
    agreementsCopy: {
      rules: {
        label: "Competition rules",
        title: "Competition rules",
        body:
          "I understand that each purchased nomination is final, must be completed from the applicant account, and must be submitted before the application deadline to be visible to judges.",
      },
      privacy: {
        label: "Privacy notice",
        title: "Privacy notice",
        body:
          "IBPA uses applicant information to manage accounts, payments, nomination review, communication, event operations, and legally required records.",
      },
      payment: {
        label: "Payment terms",
        title: "Payment terms",
        body:
          "Stripe securely processes the payment. Nominations are created only after Stripe confirms successful payment through the verified webhook.",
      },
      refund: {
        label: "Refund notice",
        title: "Refund notice",
        body:
          "Nomination selections cannot be exchanged after payment. Refund eligibility follows the published IBPA refund policy and payment terms.",
      },
    },
  },
  ru: {
    eyebrow: "Оплата участника",
    title: "Сначала купите номинации. Заявки заполняются в аккаунте.",
    intro:
      "Выберите одну или несколько номинаций, подтвердите обязательные условия и оплатите безопасно. После оплаты все номинации появятся в аккаунте участника.",
    personal: "Личные данные",
    membership: "Членство IBPA",
    nominations: "Номинации",
    agreements: "Согласия",
    summary: "Сумма заказа",
    firstName: "Имя",
    lastName: "Фамилия",
    email: "Email",
    phone: "Телефон / WhatsApp",
    country: "Страна проживания",
    countryOther: "Страна (другое)",
    stateProvince: "Штат / регион",
    city: "Город",
    professionalTitle: "Профессиональный статус",
    yearsExperience: "Стаж работы",
    instagram: "Instagram",
    social: "Соцсети",
    reviews: "Ссылка на отзывы клиентов",
    selectCountry: "Выберите страну",
    memberLabel: "Я являюсь подтвержденным участником IBPA",
    certNumber: "Номер участника IBPA",
    certValid: "Будет применен тариф участника.",
    certInvalid: "Номер не удалось подтвердить. Будет применен стандартный тариф.",
    certChecking: "Проверяем членство...",
    certError: "Проверка временно недоступна. Будет применен стандартный тариф.",
    selected: "Выбрано",
    selectedEmpty: "Номинации пока не выбраны.",
    alreadyOwn: "Эта номинация уже есть у вас.",
    memberRate: "Тариф участника",
    standardRate: "Стандартный тариф",
    checkout: "Перейти к безопасной оплате",
    checkoutPending: "Создаем оплату...",
    submissionError: "Не удалось создать оплату. Проверьте форму и попробуйте еще раз.",
    required: "Обязательно",
    agreementsCopy: {
      rules: {
        label: "Правила конкурса",
        title: "Правила конкурса",
        body:
          "Я понимаю, что выбранные после оплаты номинации окончательные, заполняются в аккаунте участника и должны быть отправлены до дедлайна, чтобы их увидело жюри.",
      },
      privacy: {
        label: "Уведомление о приватности",
        title: "Уведомление о приватности",
        body:
          "IBPA использует данные участника для аккаунта, оплат, оценки номинаций, коммуникации, организации события и обязательных записей.",
      },
      payment: {
        label: "Условия оплаты",
        title: "Условия оплаты",
        body:
          "Оплата безопасно проходит через Stripe. Номинации создаются только после подтверждения успешной оплаты через проверенный webhook Stripe.",
      },
      refund: {
        label: "Условия возврата",
        title: "Условия возврата",
        body:
          "Выбранные номинации нельзя заменить после оплаты. Возможность возврата определяется опубликованной политикой IBPA и условиями оплаты.",
      },
    },
  },
  ua: {
    eyebrow: "Оплата учасника",
    title: "Спочатку придбайте номінації. Заявки заповнюються в акаунті.",
    intro:
      "Оберіть одну або кілька номінацій, підтвердьте обов'язкові умови та сплатіть безпечно. Після оплати всі номінації з'являться в акаунті учасника.",
    personal: "Особисті дані",
    membership: "Членство IBPA",
    nominations: "Номінації",
    agreements: "Згоди",
    summary: "Підсумок замовлення",
    firstName: "Ім'я",
    lastName: "Прізвище",
    email: "Email",
    phone: "Телефон / WhatsApp",
    country: "Країна проживання",
    countryOther: "Країна (інше)",
    stateProvince: "Штат / регіон",
    city: "Місто",
    professionalTitle: "Професійний статус",
    yearsExperience: "Стаж роботи",
    instagram: "Instagram",
    social: "Соцмережі",
    reviews: "Посилання на відгуки клієнтів",
    selectCountry: "Оберіть країну",
    memberLabel: "Я є підтвердженим учасником IBPA",
    certNumber: "Номер учасника IBPA",
    certValid: "Буде застосовано тариф учасника.",
    certInvalid: "Номер не вдалося підтвердити. Буде застосовано стандартний тариф.",
    certChecking: "Перевіряємо членство...",
    certError: "Перевірка тимчасово недоступна. Буде застосовано стандартний тариф.",
    selected: "Обрано",
    selectedEmpty: "Номінації ще не обрано.",
    alreadyOwn: "Ця номінація вже є у вас.",
    memberRate: "Тариф учасника",
    standardRate: "Стандартний тариф",
    checkout: "Перейти до безпечної оплати",
    checkoutPending: "Створюємо оплату...",
    submissionError: "Не вдалося створити оплату. Перевірте форму та спробуйте ще раз.",
    required: "Обов'язково",
    agreementsCopy: {
      rules: {
        label: "Правила конкурсу",
        title: "Правила конкурсу",
        body:
          "Я розумію, що вибрані після оплати номінації остаточні, заповнюються в акаунті учасника та мають бути надіслані до дедлайну, щоб їх побачило журі.",
      },
      privacy: {
        label: "Повідомлення про приватність",
        title: "Повідомлення про приватність",
        body:
          "IBPA використовує дані учасника для акаунта, оплат, оцінювання номінацій, комунікації, організації події та обов'язкових записів.",
      },
      payment: {
        label: "Умови оплати",
        title: "Умови оплати",
        body:
          "Оплата безпечно проходить через Stripe. Номінації створюються лише після підтвердження успішної оплати через перевірений webhook Stripe.",
      },
      refund: {
        label: "Умови повернення",
        title: "Умови повернення",
        body:
          "Вибрані номінації не можна замінити після оплати. Можливість повернення визначається опублікованою політикою IBPA та умовами оплати.",
      },
    },
  },
} as const;

function restoreState() {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "null") as {
      values?: Partial<FormValues>;
      selectedAwardIds?: string[];
    } | null;
    return parsed;
  } catch {
    return null;
  }
}

function money(amount: number) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export default function PurchaseApplicationForm({ categories }: { categories: CategoryOption[] }) {
  const { language } = useLanguage();
  const t = copy[language] ?? copy.en;
  const restored = useMemo(() => restoreState(), []);
  const [values, setValues] = useState<FormValues>({ ...initialValues, ...restored?.values });
  const [selectedAwardIds, setSelectedAwardIds] = useState<string[]>(restored?.selectedAwardIds ?? []);
  const [certState, setCertState] = useState<CertState>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [openAgreement, setOpenAgreement] = useState<keyof typeof t.agreementsCopy | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const verifiedMember = values.isIbpaMember && certState === "valid";
  const pricing = computeApplicantNominationPrice({
    nominationCount: Math.max(1, selectedAwardIds.length),
    isIbpaMember: verifiedMember,
  });
  const selectedAwards = categories.flatMap((category) =>
    category.awards
      .filter((award) => selectedAwardIds.includes(award.id))
      .map((award) => ({ ...award, category }))
  );

  useEffect(() => {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        values,
        selectedAwardIds,
        savedAt: Date.now(),
      })
    );
  }, [values, selectedAwardIds]);

  useEffect(() => {
    if (!values.isIbpaMember || !values.ibpaMemberNumber.trim()) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setCertState("checking");
      try {
        const response = await fetch("/api/membership/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ membershipNumber: values.ibpaMemberNumber }),
          signal: controller.signal,
        });
        const payload = (await response.json()) as { qualified?: boolean };
        setCertState(response.ok && payload.qualified ? "valid" : "invalid");
      } catch {
        if (!controller.signal.aborted) setCertState("error");
      }
    }, 500);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [values.ibpaMemberNumber, values.isIbpaMember]);

  function setField(name: string, value: string) {
    if (name === "ibpaMemberNumber") {
      setCertState("idle");
    }
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  }

  function setBool(name: keyof FormValues, value: boolean) {
    if (name === "isIbpaMember") {
      setCertState("idle");
    }
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  }

  function toggleAward(awardId: string) {
    setSelectedAwardIds((current) =>
      current.includes(awardId)
        ? current.filter((id) => id !== awardId)
        : [...current, awardId]
    );
    setFieldErrors((current) => ({ ...current, selectedAwardIds: "" }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setFieldErrors({});

    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      formData.set(key, typeof value === "boolean" ? String(value) : value);
    }
    formData.set("locale", language);
    for (const awardId of selectedAwardIds) {
      formData.append("selectedAwardIds", awardId);
    }

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        checkoutUrl?: string;
        message?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!response.ok || !payload.checkoutUrl) {
        setFieldErrors(payload.fieldErrors ?? {});
        setSubmitError(payload.message ?? t.submissionError);
        return;
      }

      window.location.assign(payload.checkoutUrl);
    } catch {
      setSubmitError(t.submissionError);
    } finally {
      setSubmitting(false);
    }
  }

  const agreementEntries = Object.entries(t.agreementsCopy) as Array<
    [keyof typeof t.agreementsCopy, { label: string; title: string; body: string }]
  >;

  return (
    <form onSubmit={handleSubmit} className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-6">
        <section className="premium-glass p-5 sm:p-7">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-blue)]">
            {t.eyebrow}
          </p>
          <h2 className="mt-3 font-[var(--font-title-family)] text-3xl font-light leading-tight text-[var(--color-ink)] sm:text-4xl">
            {t.title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-ink-soft)]">
            {t.intro}
          </p>
        </section>

        <section className="premium-glass p-5 sm:p-7">
          <h3 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
            {t.personal}
          </h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TextField label={t.firstName} name="firstName" value={values.firstName} required error={fieldErrors.firstName} onChange={setField} />
            <TextField label={t.lastName} name="lastName" value={values.lastName} required error={fieldErrors.lastName} onChange={setField} />
            <TextField label={t.email} name="email" type="email" value={values.email} required error={fieldErrors.email} onChange={setField} />
            <TextField label={t.phone} name="phone" type="tel" value={values.phone} required error={fieldErrors.phone} onChange={setField} />
            <SelectField
              label={t.country}
              name="country"
              value={values.country}
              options={countryOptions}
              placeholder={t.selectCountry}
              required
              error={fieldErrors.country}
              onChange={setField}
            />
            {values.country === "Other" ? (
              <TextField label={t.countryOther} name="countryOther" value={values.countryOther} required error={fieldErrors.countryOther} onChange={setField} />
            ) : (
              <TextField label={t.stateProvince} name="stateProvince" value={values.stateProvince} error={fieldErrors.stateProvince} onChange={setField} />
            )}
            <TextField label={t.city} name="city" value={values.city} required error={fieldErrors.city} onChange={setField} />
            <TextField label={t.professionalTitle} name="professionalTitle" value={values.professionalTitle} required error={fieldErrors.professionalTitle} onChange={setField} />
            <TextField label={t.yearsExperience} name="yearsExperience" type="number" min={2} value={values.yearsExperience} required error={fieldErrors.yearsExperience} onChange={setField} />
            <TextField label={t.instagram} name="websiteUrl" type="url" value={values.websiteUrl} onChange={setField} />
            <TextField label={t.social} name="socialUrl" type="url" value={values.socialUrl} onChange={setField} />
            <TextField label={t.reviews} name="reviewsUrl" type="url" value={values.reviewsUrl} onChange={setField} />
          </div>
        </section>

        <section className="premium-glass p-5 sm:p-7">
          <h3 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
            {t.membership}
          </h3>
          <label className="mt-5 flex items-start gap-3 rounded-[24px] border border-[var(--border-default)] bg-white/80 p-4 text-sm text-[var(--color-ink)]">
            <input
              type="checkbox"
              checked={values.isIbpaMember}
              onChange={(event) => setBool("isIbpaMember", event.target.checked)}
              className="mt-1 size-4 accent-[var(--color-blue)]"
            />
            <span>{t.memberLabel}</span>
          </label>
          {values.isIbpaMember ? (
            <div className="mt-4">
              <TextField label={t.certNumber} name="ibpaMemberNumber" value={values.ibpaMemberNumber} required onChange={setField} />
              <p className="mt-2 flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
                {certState === "valid" ? <BadgeCheck size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-[var(--color-blue)]" />}
                {certState === "checking"
                  ? t.certChecking
                  : certState === "valid"
                    ? t.certValid
                    : certState === "invalid"
                      ? t.certInvalid
                      : certState === "error"
                        ? t.certError
                        : t.standardRate}
              </p>
            </div>
          ) : null}
        </section>

        <section className="premium-glass p-5 sm:p-7">
          <h3 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
            {t.nominations}
          </h3>
          {fieldErrors.selectedAwardIds ? (
            <p className="mt-3 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {fieldErrors.selectedAwardIds}
            </p>
          ) : null}
          <div className="mt-5 grid gap-4">
            {categories.map((category) => (
              <div key={category.id} className="rounded-[26px] border border-[var(--border-default)] bg-white/78 p-4">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">
                  {category.name}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {category.awards.map((award) => {
                    const selected = selectedAwardIds.includes(award.id);
                    return (
                      <button
                        key={award.id}
                        type="button"
                        onClick={() => toggleAward(award.id)}
                        className={`flex min-h-12 items-center justify-between gap-3 rounded-[18px] border px-3 py-2 text-left text-sm transition ${
                          selected
                            ? "border-[var(--color-blue)] bg-[var(--color-blue-wash)] text-[var(--color-ink)]"
                            : "border-[rgba(37,42,45,0.08)] bg-white text-[var(--color-ink-soft)] hover:border-[var(--color-blue)]/40"
                        }`}
                      >
                        <span>{award.name}</span>
                        {selected ? <Check size={16} className="shrink-0 text-[var(--color-blue)]" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="premium-glass p-5 sm:p-7">
          <h3 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
            {t.agreements}
          </h3>
          {fieldErrors.agreements ? (
            <p className="mt-3 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {fieldErrors.agreements}
            </p>
          ) : null}
          <div className="mt-5 grid gap-3">
            {agreementEntries.map(([key, item]) => {
              const fieldName =
                key === "rules"
                  ? "rulesAccepted"
                  : key === "privacy"
                    ? "privacyAccepted"
                    : key === "payment"
                      ? "paymentTermsAccepted"
                      : "refundNoticeAccepted";
              return (
                <label key={key} className="flex items-start gap-3 rounded-[22px] border border-[var(--border-default)] bg-white/78 p-4 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(values[fieldName])}
                    onChange={(event) => setBool(fieldName, event.target.checked)}
                    className="mt-1 size-4 accent-[var(--color-blue)]"
                  />
                  <span className="flex-1 text-[var(--color-ink)]">
                    {item.label} <span className="text-[var(--color-blue)]">*</span>
                    <button
                      type="button"
                      onClick={() => setOpenAgreement(key)}
                      className="ml-2 font-semibold text-[var(--color-blue)] underline decoration-[var(--color-blue)]/30 underline-offset-4"
                    >
                      {t.required}
                    </button>
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <section className="premium-glass p-5 sm:p-6">
          <div className="flex items-center gap-3 text-[var(--color-blue)]">
            <ShoppingCart size={18} />
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em]">{t.summary}</p>
          </div>
          <div className="mt-5 rounded-[24px] border border-[var(--border-default)] bg-white/82 p-4">
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              {t.selected}: {selectedAwardIds.length}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {selectedAwards.length === 0 ? (
                <p className="text-sm text-[var(--color-ink-soft)]">{t.selectedEmpty}</p>
              ) : (
                selectedAwards.map((item) => (
                  <div key={item.id} className="rounded-[16px] bg-[var(--surface-tint)] px-3 py-2">
                    <p className="text-sm font-medium text-[var(--color-ink)]">{item.name}</p>
                    <p className="text-xs text-[var(--color-ink-soft)]">{item.category.name}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mt-4 rounded-[24px] border border-[var(--border-default)] bg-white/82 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
              {verifiedMember ? t.memberRate : t.standardRate}
            </p>
            <p className="mt-2 font-[var(--font-title-family)] text-4xl font-light text-[var(--color-ink)]">
              {selectedAwardIds.length > 0 ? money(pricing.amountCents) : "$0"}
            </p>
          </div>
          {submitError ? (
            <p className="mt-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShieldCheck size={17} />
            {submitting ? t.checkoutPending : t.checkout}
          </button>
        </section>
      </aside>

      {openAgreement ? (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/45 px-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="agreement-title"
            className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.24)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex size-11 items-center justify-center rounded-[18px] bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
                  <FileText size={18} />
                </div>
                <h3 id="agreement-title" className="mt-4 font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
                  {t.agreementsCopy[openAgreement].title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenAgreement(null)}
                className="flex size-10 items-center justify-center rounded-full border border-[var(--border-default)] text-[var(--color-ink-soft)]"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
              {t.agreementsCopy[openAgreement].body}
            </p>
            <button
              type="button"
              onClick={() => setOpenAgreement(null)}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white"
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
