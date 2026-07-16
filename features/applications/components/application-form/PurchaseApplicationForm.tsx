"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileText,
  ListChecks,
  PenLine,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import {
  SelectField,
  TextField,
} from "@/features/applications/components/application-form/fields/FormControls";
import StepBar from "@/features/applications/components/application-form/StepBar";
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

type PromoPreview = {
  keyword: string;
  discountPercent: number;
  originalAmountCents: number;
  discountAmountCents: number;
  finalAmountCents: number;
};

const STORAGE_KEY = "ibpa-apply-purchase-v1";

const STEP_NOMINATIONS = 0;
const STEP_PERSONAL = 1;
const STEP_REVIEW = 2;

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

const PERSONAL_REQUIRED: Array<keyof FormValues> = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "country",
  "city",
  "professionalTitle",
  "yearsExperience",
];

const copy = {
  en: {
    steps: {
      nominations: "Nominations",
      personal: "Personal info",
      review: "Review & pay",
    },
    eyebrow: "Applicant checkout",
    title: "Buy nominations first. Complete entries from your account.",
    intro:
      "Choose one or more nominations, add your details, confirm the required notices, and pay securely. After payment, your applicant account will hold every purchased nomination.",
    personal: "Personal information",
    nameContact: "Name and contact",
    location: "Location",
    professionalInfo: "Professional information",
    membership: "IBPA membership",
    nominations: "Nominations",
    agreements: "Agreements",
    summary: "Order summary",
    applicantInfo: "Applicant information",
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
    selectAtLeastOne: "Select at least one nomination to continue.",
    memberRate: "Member rate",
    standardRate: "Standard rate",
    packageLabel: "Package",
    rateLabel: "Rate",
    totalLabel: "Total",
    continue: "Continue",
    back: "Back",
    edit: "Edit",
    checkout: "Continue to secure checkout",
    checkoutPending: "Creating checkout...",
    submissionError: "Could not create checkout. Please review the form and try again.",
    required: "Required",
    notProvided: "Not provided",
    nominationsWord: "nominations",
    nominationWord: "nomination",
    selectedWord: "selected",
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
    steps: {
      nominations: "Номинации",
      personal: "Личные данные",
      review: "Проверка и оплата",
    },
    eyebrow: "Оплата участника",
    title: "Сначала купите номинации. Заявки заполняются в аккаунте.",
    intro:
      "Выберите одну или несколько номинаций, укажите свои данные, подтвердите обязательные условия и оплатите безопасно. После оплаты все номинации появятся в аккаунте участника.",
    personal: "Личные данные",
    nameContact: "Имя и контакты",
    location: "Локация",
    professionalInfo: "Профессиональная информация",
    membership: "Членство IBPA",
    nominations: "Номинации",
    agreements: "Согласия",
    summary: "Сумма заказа",
    applicantInfo: "Данные участника",
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
    selectAtLeastOne: "Выберите хотя бы одну номинацию, чтобы продолжить.",
    memberRate: "Тариф участника",
    standardRate: "Стандартный тариф",
    packageLabel: "Пакет",
    rateLabel: "Тариф",
    totalLabel: "Итого",
    continue: "Продолжить",
    back: "Назад",
    edit: "Изменить",
    checkout: "Перейти к безопасной оплате",
    checkoutPending: "Создаем оплату...",
    submissionError: "Не удалось создать оплату. Проверьте форму и попробуйте еще раз.",
    required: "Обязательно",
    notProvided: "Не указано",
    nominationsWord: "номинаций",
    nominationWord: "номинация",
    selectedWord: "выбрано",
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
    steps: {
      nominations: "Номінації",
      personal: "Особисті дані",
      review: "Перевірка та оплата",
    },
    eyebrow: "Оплата учасника",
    title: "Спочатку придбайте номінації. Заявки заповнюються в акаунті.",
    intro:
      "Оберіть одну або кілька номінацій, додайте свої дані, підтвердьте обов'язкові умови та сплатіть безпечно. Після оплати всі номінації з'являться в акаунті учасника.",
    personal: "Особисті дані",
    nameContact: "Ім'я та контакти",
    location: "Локація",
    professionalInfo: "Професійна інформація",
    membership: "Членство IBPA",
    nominations: "Номінації",
    agreements: "Згоди",
    summary: "Підсумок замовлення",
    applicantInfo: "Дані учасника",
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
    selectAtLeastOne: "Оберіть принаймні одну номінацію, щоб продовжити.",
    memberRate: "Тариф учасника",
    standardRate: "Стандартний тариф",
    packageLabel: "Пакет",
    rateLabel: "Тариф",
    totalLabel: "Разом",
    continue: "Продовжити",
    back: "Назад",
    edit: "Змінити",
    checkout: "Перейти до безпечної оплати",
    checkoutPending: "Створюємо оплату...",
    submissionError: "Не вдалося створити оплату. Перевірте форму та спробуйте ще раз.",
    required: "Обов'язково",
    notProvided: "Не вказано",
    nominationsWord: "номінацій",
    nominationWord: "номінація",
    selectedWord: "обрано",
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
      step?: number;
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

function promoErrorMessage(
  promoText: ReturnType<typeof useLanguage>["t"]["promo"],
  errorCode?: string
) {
  if (errorCode === "DISABLED") return promoText.promoCodeDisabled;
  if (errorCode === "WRONG_FLOW") return promoText.wrongFlow;
  return promoText.invalidPromoCode;
}

function SummaryFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[18px] border border-[rgba(37,42,45,0.07)] bg-white/70 px-3.5 py-2.5">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm text-[var(--color-ink)]">{value}</p>
    </div>
  );
}

/**
 * Public Apply flow as three horizontal steps: Select Nominations →
 * Personal Information → Review and Payment. All state lives here, so
 * moving between steps never loses selections or entered data, and the
 * whole flow persists to sessionStorage. Pricing shown client-side uses
 * the same shared helper as the server, and the final amount is always
 * recalculated server-side at checkout creation.
 */
export default function PurchaseApplicationForm({ categories }: { categories: CategoryOption[] }) {
  const { language, t: sharedT } = useLanguage();
  const t = copy[language] ?? copy.en;
  const promoText = sharedT.promo;
  const restored = useMemo(() => restoreState(), []);
  const [values, setValues] = useState<FormValues>({ ...initialValues, ...restored?.values });
  const [selectedAwardIds, setSelectedAwardIds] = useState<string[]>(restored?.selectedAwardIds ?? []);
  const [step, setStep] = useState<number>(() => {
    const saved = restored?.step ?? STEP_NOMINATIONS;
    if (saved > STEP_NOMINATIONS && (restored?.selectedAwardIds?.length ?? 0) === 0) {
      return STEP_NOMINATIONS;
    }
    return Math.min(Math.max(saved, STEP_NOMINATIONS), STEP_REVIEW);
  });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(categories.slice(0, 1).map((category) => category.id)),
  );
  const [certState, setCertState] = useState<CertState>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [openAgreement, setOpenAgreement] = useState<keyof typeof t.agreementsCopy | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promoPreview, setPromoPreview] = useState<PromoPreview | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoPending, setPromoPending] = useState(false);

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
  const count = selectedAwardIds.length;
  const finalAmountCents = promoPreview?.finalAmountCents ?? pricing.amountCents;

  const personalComplete = PERSONAL_REQUIRED.every((key) => String(values[key]).trim() !== "") &&
    (values.country !== "Other" || values.countryOther.trim() !== "");
  const maxUnlockedStep = count === 0 ? STEP_NOMINATIONS : personalComplete ? STEP_REVIEW : STEP_PERSONAL;

  const steps = [
    { id: "nominations", label: t.steps.nominations, icon: ListChecks },
    { id: "personal", label: t.steps.personal, icon: UserRound },
    { id: "review", label: t.steps.review, icon: ClipboardCheck },
  ];

  useEffect(() => {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        values,
        selectedAwardIds,
        step,
        savedAt: Date.now(),
      })
    );
  }, [values, selectedAwardIds, step]);

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
    setPromoPreview(null);
    setPromoError("");
  }

  function toggleCategory(categoryId: string) {
    setExpandedCategories((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  function goToStep(next: number) {
    setStep(next);
    setSubmitError("");
    document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function continueFromNominations() {
    if (count === 0) {
      setFieldErrors((current) => ({ ...current, selectedAwardIds: t.selectAtLeastOne }));
      return;
    }
    goToStep(STEP_PERSONAL);
  }

  function continueFromPersonal() {
    const errors: Record<string, string> = {};
    for (const key of PERSONAL_REQUIRED) {
      if (String(values[key]).trim() === "") errors[key] = t.required;
    }
    if (values.country === "Other" && values.countryOther.trim() === "") {
      errors.countryOther = t.required;
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors((current) => ({ ...current, ...errors }));
      return;
    }
    goToStep(STEP_REVIEW);
  }

  async function applyPromoCode() {
    const code = promoInput.trim();
    setPromoError("");
    setPromoPreview(null);
    if (!code || count === 0) {
      setPromoError(promoText.invalidPromoCode);
      return;
    }
    setPromoPending(true);
    try {
      const response = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoCode: code,
          paymentFlow: "APPLICATIONS",
          amountCents: pricing.amountCents,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        errorCode?: string;
        promo?: PromoPreview;
      };
      if (!response.ok || !payload.ok || !payload.promo) {
        setPromoError(promoErrorMessage(promoText, payload.errorCode));
        return;
      }
      setPromoPreview(payload.promo);
    } catch {
      setPromoError(promoText.invalidPromoCode);
    } finally {
      setPromoPending(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step !== STEP_REVIEW) return;
    setSubmitting(true);
    setSubmitError("");
    setFieldErrors({});

    if (promoInput.trim() && !promoPreview) {
      setPromoError(promoText.invalidPromoCode);
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      formData.set(key, typeof value === "boolean" ? String(value) : value);
    }
    formData.set("locale", language);
    for (const awardId of selectedAwardIds) {
      formData.append("selectedAwardIds", awardId);
    }
    if (promoPreview) {
      formData.set("promoCode", promoInput);
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
        const errors = payload.fieldErrors ?? {};
        setFieldErrors(errors);
        setSubmitError(payload.message ?? t.submissionError);
        // Send the user back to the step that owns the first invalid field.
        const errorKeys = Object.keys(errors);
        if (errorKeys.includes("selectedAwardIds")) {
          setStep(STEP_NOMINATIONS);
        } else if (errorKeys.some((key) => key in initialValues && !key.endsWith("Accepted"))) {
          setStep(STEP_PERSONAL);
        }
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

  const primaryButtonClass =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[rgba(255,255,255,0.35)] bg-[var(--color-blue)]/92 px-6 py-3 text-[0.74rem] font-semibold uppercase leading-none tracking-[0.1em] text-white shadow-[0_16px_38px_rgba(114,160,193,0.34)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[#4d86ad] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.35)] disabled:cursor-not-allowed disabled:opacity-55";
  const secondaryButtonClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.24)] bg-white/78 px-5 py-2.5 text-[0.72rem] font-semibold uppercase leading-none tracking-[0.1em] text-[var(--color-ink)] shadow-[0_12px_28px_rgba(37,42,45,0.055)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.25)]";
  const editChipClass =
    "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[rgba(114,160,193,0.24)] bg-white/78 px-3.5 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-soft)] transition hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.25)]";

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-6xl flex-col gap-6">
      <section className="premium-glass p-5 text-center sm:p-7">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-blue)]">
          {t.eyebrow}
        </p>
        <h2 className="mx-auto mt-3 max-w-3xl font-[var(--font-title-family)] text-3xl font-light leading-tight text-[var(--color-ink)] sm:text-4xl">
          {t.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--color-ink-soft)]">
          {t.intro}
        </p>
      </section>

      <StepBar
        steps={steps}
        current={step}
        maxUnlockedStep={maxUnlockedStep}
        onStepChange={goToStep}
      />

      {/* ── Step 1: Select Nominations ─────────────────────────────────── */}
      {step === STEP_NOMINATIONS ? (
        <div className="flex flex-col gap-4">
          {fieldErrors.selectedAwardIds ? (
            <p role="alert" className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {fieldErrors.selectedAwardIds}
            </p>
          ) : null}

          {categories.map((category) => {
            const expanded = expandedCategories.has(category.id);
            const selectedInCategory = category.awards.filter((award) =>
              selectedAwardIds.includes(award.id),
            ).length;
            return (
              <section key={category.id} className="premium-glass overflow-hidden">
                <h3>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => toggleCategory(category.id)}
                    className="flex min-h-16 w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-[var(--color-blue-wash)]/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[rgba(114,160,193,0.3)]"
                  >
                    <span className="min-w-0">
                      <span className="block font-[var(--font-title-family)] text-[1.3rem] font-light leading-tight text-[var(--color-ink)]">
                        {category.name}
                      </span>
                      <span className="mt-1 block text-[0.76rem] text-[var(--color-ink-soft)]">
                        {category.awards.length} {t.nominationsWord}
                        {selectedInCategory > 0 ? (
                          <span className="ml-2 font-semibold text-[#356f98]">
                            · {selectedInCategory} {t.selectedWord}
                          </span>
                        ) : null}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      {selectedInCategory > 0 ? (
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-[var(--color-blue)] text-[0.68rem] font-bold text-white shadow-[0_8px_18px_rgba(114,160,193,0.3)]">
                          {selectedInCategory}
                        </span>
                      ) : null}
                      <ChevronDown
                        aria-hidden
                        size={18}
                        className={`shrink-0 text-[var(--color-ink-soft)] transition-transform duration-300 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
                      />
                    </span>
                  </button>
                </h3>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                    expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="grid gap-2.5 px-5 pb-5 [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]">
                      {category.awards.map((award) => {
                        const selected = selectedAwardIds.includes(award.id);
                        return (
                          <button
                            key={award.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => toggleAward(award.id)}
                            className={`relative flex min-h-[72px] items-start justify-between gap-3 rounded-[20px] border p-4 text-left backdrop-blur-xl transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)] ${
                              selected
                                ? "border-[var(--color-blue)]/60 bg-[linear-gradient(150deg,rgba(255,255,255,0.92),rgba(185,217,235,0.4))] text-[var(--color-ink)] shadow-[0_16px_40px_rgba(114,160,193,0.16),inset_0_1px_0_rgba(255,255,255,0.9)]"
                                : "border-[rgba(114,160,193,0.2)] bg-white/74 text-[var(--color-ink-soft)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:-translate-y-px hover:border-[var(--color-blue)]/45 hover:bg-[var(--color-blue-wash)]/70 hover:text-[var(--color-ink)]"
                            }`}
                          >
                            <span className="min-w-0 break-words pr-1 text-sm leading-snug">
                              {award.name}
                            </span>
                            <span
                              aria-hidden
                              className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition duration-200 ${
                                selected
                                  ? "border-[var(--color-blue)] bg-[var(--color-blue)] text-white shadow-[0_8px_18px_rgba(114,160,193,0.35)]"
                                  : "border-[rgba(114,160,193,0.35)] bg-white/80 text-transparent"
                              }`}
                            >
                              <Check size={13} strokeWidth={3} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}

          {/* Compact sticky selection summary */}
          <div className="sticky bottom-3 z-20 flex flex-col gap-3 rounded-[24px] border border-[rgba(114,160,193,0.24)] bg-white/88 p-4 shadow-[0_18px_54px_rgba(37,42,45,0.12)] backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--color-ink-soft)]" aria-live="polite">
              {count === 0 ? (
                t.selectedEmpty
              ) : (
                <>
                  <span className="font-semibold text-[var(--color-ink)]">
                    {t.selected}: {count}
                  </span>{" "}
                  · {verifiedMember ? t.memberRate : t.standardRate} ·{" "}
                  <span className="font-semibold text-[var(--color-ink)]">
                    {money(finalAmountCents)}
                  </span>
                </>
              )}
            </p>
            <button type="button" onClick={continueFromNominations} className={primaryButtonClass}>
              {t.continue} <ArrowRight aria-hidden size={15} />
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Step 2: Personal Information ───────────────────────────────── */}
      {step === STEP_PERSONAL ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[rgba(114,160,193,0.2)] bg-white/72 px-4 py-3 backdrop-blur-xl">
            <p className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
              <ShoppingCart aria-hidden size={15} className="text-[var(--color-blue)]" />
              {t.selected}: <span className="font-semibold text-[var(--color-ink)]">{count}</span> ·{" "}
              <span className="font-semibold text-[var(--color-ink)]">{money(pricing.amountCents)}</span>
            </p>
            <button
              type="button"
              onClick={() => goToStep(STEP_NOMINATIONS)}
              className={editChipClass}
            >
              <PenLine aria-hidden size={12} /> {t.edit}
            </button>
          </div>

          <section className="premium-glass p-5 sm:p-7">
            <h3 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
              {t.nameContact}
            </h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <TextField label={t.firstName} name="firstName" value={values.firstName} required error={fieldErrors.firstName} onChange={setField} />
              <TextField label={t.lastName} name="lastName" value={values.lastName} required error={fieldErrors.lastName} onChange={setField} />
              <TextField label={t.email} name="email" type="email" value={values.email} required error={fieldErrors.email} onChange={setField} />
              <TextField label={t.phone} name="phone" type="tel" value={values.phone} required error={fieldErrors.phone} onChange={setField} />
            </div>
          </section>

          <section className="premium-glass p-5 sm:p-7">
            <h3 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
              {t.location}
            </h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
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
            </div>
          </section>

          <section className="premium-glass p-5 sm:p-7">
            <h3 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
              {t.professionalInfo}
            </h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
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

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => goToStep(STEP_NOMINATIONS)} className={secondaryButtonClass}>
              <ArrowLeft aria-hidden size={14} /> {t.back}
            </button>
            <button type="button" onClick={continueFromPersonal} className={primaryButtonClass}>
              {t.continue} <ArrowRight aria-hidden size={15} />
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Step 3: Review and Payment ─────────────────────────────────── */}
      {step === STEP_REVIEW ? (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <section className="premium-glass p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
                  {t.applicantInfo}
                </h3>
                <button type="button" onClick={() => goToStep(STEP_PERSONAL)} className={editChipClass}>
                  <PenLine aria-hidden size={12} /> {t.edit}
                </button>
              </div>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                <SummaryFact label={`${t.firstName} / ${t.lastName}`} value={`${values.firstName} ${values.lastName}`.trim() || t.notProvided} />
                <SummaryFact label={t.email} value={values.email || t.notProvided} />
                <SummaryFact label={t.phone} value={values.phone || t.notProvided} />
                <SummaryFact
                  label={t.country}
                  value={
                    values.country === "Other"
                      ? values.countryOther || t.notProvided
                      : [values.city, values.country].filter(Boolean).join(", ") || t.notProvided
                  }
                />
                <SummaryFact label={t.professionalTitle} value={values.professionalTitle || t.notProvided} />
                <SummaryFact label={t.yearsExperience} value={values.yearsExperience || t.notProvided} />
              </div>
            </section>

            <section className="premium-glass p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
                  {t.nominations}
                </h3>
                <button type="button" onClick={() => goToStep(STEP_NOMINATIONS)} className={editChipClass}>
                  <PenLine aria-hidden size={12} /> {t.edit}
                </button>
              </div>
              <ul className="mt-4 grid gap-2">
                {selectedAwards.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-[18px] border border-[rgba(114,160,193,0.16)] bg-white/78 px-3.5 py-2.5"
                  >
                    <span className="min-w-0">
                      <span className="block break-words text-sm font-medium leading-snug text-[var(--color-ink)]">
                        {item.name}
                      </span>
                      <span className="text-xs text-[var(--color-ink-soft)]">{item.category.name}</span>
                    </span>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => toggleAward(item.id)}
                      aria-label={`${t.edit} ${item.name}`}
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-soft)] transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.25)] disabled:opacity-50"
                    >
                      <X aria-hidden size={14} />
                    </button>
                  </li>
                ))}
                {selectedAwards.length === 0 ? (
                  <li className="rounded-[18px] border border-dashed border-[rgba(114,160,193,0.3)] px-4 py-4 text-sm text-[var(--color-ink-soft)]">
                    {t.selectedEmpty}
                  </li>
                ) : null}
              </ul>
            </section>

            <section className="premium-glass p-5 sm:p-6">
              <h3 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
                {t.agreements}
              </h3>
              {fieldErrors.agreements ? (
                <p role="alert" className="mt-3 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {fieldErrors.agreements}
                </p>
              ) : null}
              <div className="mt-4 grid gap-3">
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

            <div>
              <button type="button" onClick={() => goToStep(STEP_PERSONAL)} className={secondaryButtonClass}>
                <ArrowLeft aria-hidden size={14} /> {t.back}
              </button>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <section className="premium-glass p-5 sm:p-6">
              <div className="flex items-center gap-3 text-[var(--color-blue)]">
                <ShoppingCart size={18} />
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em]">{t.summary}</p>
              </div>
              <dl className="mt-5 space-y-2.5 text-[0.86rem]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--color-ink-soft)]">{t.nominations}</dt>
                  <dd className="font-semibold text-[var(--color-ink)]">{count}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--color-ink-soft)]">{t.rateLabel}</dt>
                  <dd className="font-semibold text-[var(--color-ink)]">
                    {verifiedMember ? t.memberRate : t.standardRate}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--color-ink-soft)]">{t.packageLabel}</dt>
                  <dd className="font-semibold text-[var(--color-ink)]">
                    {count > 0 ? pricing.unitLabel : "—"}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 border-t border-[rgba(114,160,193,0.18)] pt-4">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                    {promoText.promoCode}
                  </span>
                  <span className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(event) => {
                        setPromoInput(event.target.value);
                        setPromoPreview(null);
                        setPromoError("");
                      }}
                      className="h-11 min-w-0 flex-1 rounded-[18px] border border-[rgba(114,160,193,0.22)] bg-white/74 px-4 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-blue)] focus:ring-4 focus:ring-[rgba(114,160,193,0.16)]"
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                    <button
                      type="button"
                      disabled={promoPending || !promoInput.trim() || count === 0}
                      onClick={() => void applyPromoCode()}
                      className="inline-flex min-h-11 items-center justify-center rounded-[18px] border border-[rgba(114,160,193,0.24)] bg-white/78 px-4 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-blue)] transition hover:bg-[var(--color-blue-wash)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {promoPending ? promoText.applying : promoText.apply}
                    </button>
                  </span>
                </label>
                {promoPreview ? (
                  <p className="mt-2 text-[0.76rem] text-emerald-700">
                    {promoText.promoCodeApplied}
                  </p>
                ) : promoError ? (
                  <p className="mt-2 text-[0.76rem] text-red-700">{promoError}</p>
                ) : null}
              </div>

              <div className="mt-4 border-t border-[rgba(114,160,193,0.18)] pt-4">
                {promoPreview ? (
                  <dl className="mb-3 space-y-2 text-[0.82rem]">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[var(--color-ink-soft)]">{promoText.originalPrice}</dt>
                      <dd className="font-semibold text-[var(--color-ink)]">
                        {money(promoPreview.originalAmountCents)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-emerald-700">
                      <dt>{promoText.discount} {promoPreview.discountPercent}%</dt>
                      <dd className="font-semibold">-{money(promoPreview.discountAmountCents)}</dd>
                    </div>
                  </dl>
                ) : null}
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                  {promoPreview ? promoText.finalTotal : t.totalLabel}
                </p>
                <p className="mt-1 font-[var(--font-title-family)] text-4xl font-light text-[var(--color-ink)]">
                  {count > 0 ? money(finalAmountCents) : "$0"}
                </p>
                {verifiedMember ? (
                  <p className="mt-2 flex items-center gap-1.5 text-[0.74rem] text-emerald-700">
                    <BadgeCheck aria-hidden size={13} /> {t.certValid}
                  </p>
                ) : null}
              </div>
              {submitError ? (
                <p role="alert" className="mt-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className={`mt-5 w-full ${primaryButtonClass}`}
              >
                <ShieldCheck size={17} />
                {submitting ? t.checkoutPending : t.checkout}
              </button>
            </section>
          </aside>
        </div>
      ) : null}

      {openAgreement ? (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[rgba(3,2,19,0.3)] px-4 backdrop-blur-sm" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="agreement-title"
            className="w-full max-w-xl rounded-[28px] border border-[rgba(114,160,193,0.22)] bg-white/96 p-6 shadow-[0_30px_90px_rgba(3,2,19,0.2)] backdrop-blur-2xl"
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
                className="flex size-10 items-center justify-center rounded-full border border-[var(--border-default)] text-[var(--color-ink-soft)] transition hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.25)]"
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
              className={`mt-6 w-full ${primaryButtonClass}`}
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
