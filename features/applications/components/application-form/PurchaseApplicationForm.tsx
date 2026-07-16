"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  ClipboardCheck,
  CreditCard,
  FileText,
  ListChecks,
  MapPin,
  PenLine,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import NominationCategoryAccordion from "@/features/applications/components/nomination-selection/NominationCategoryAccordion";
import { presentNominationCategories } from "@/features/applications/components/nomination-selection/nomination-presentation";
import {
  SelectField,
  TextField,
} from "@/features/applications/components/application-form/fields/FormControls";
import StepBar from "@/features/applications/components/application-form/StepBar";
import { computeApplicantNominationPrice } from "@/features/applications/lib/pricing";
import { countryOptions } from "@/features/applications/config/countries";
import type { CategoryOption } from "@/features/applications/types/application.types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { translations } from "@/lib/i18n/translations";
import { legalContent } from "@/shared/components/layout/legal-content";
import {
  ButtonLayers,
  LANDING_PRIMARY_BTN_CLASS,
  LandingPrimaryButton,
  LandingSecondaryButton,
} from "@/shared/components/public";

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
const STEP_LOCATION = 2;
const STEP_PROFESSIONAL = 3;
const STEP_REVIEW = 4;
const STEP_PAYMENT = 5;
const MAX_NOMINATIONS = 5;

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
];

const LOCATION_REQUIRED: Array<keyof FormValues> = [
  "country",
  "city",
];

const PROFESSIONAL_REQUIRED: Array<keyof FormValues> = [
  "professionalTitle",
  "yearsExperience",
];

const copy = {
  en: {
    steps: {
      nominations: "Nominations",
      personal: "Personal info",
      location: "Location",
      professional: "Professional info",
      review: "Review",
      payment: "Payment",
    },
    eyebrow: "IBPA Beauty Award 2026",
    title: "Choose nominations to participate",
    introLead: "Choose one or more",
    introRest: " nominations, provide your details, confirm the mandatory terms, and pay securely.",
    introAfter: "After payment, the forms will become available to complete in your personal account.",
    personal: "Personal information",
    nameContact: "Name and contact",
    location: "Location",
    professionalInfo: "Professional information",
    reviewTitle: "Review your application",
    paymentTitle: "Agreements & payment",
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
    pay: "Pay",
    checkoutPending: "Creating checkout...",
    submissionError: "Could not create checkout. Please review the form and try again.",
    required: "Required",
    notProvided: "Not provided",
    nominationsWord: "nominations",
    nominationsFew: "nominations",
    nominationWord: "nomination",
    selectedWord: "selected",
    details: "View details",
    close: "Close",
    agreementsCopy: {
      rules: {
        label: "Competition rules",
        title: "Competition rules",
        body:
          "Participants submit an application and competition materials through an online form. Entries are evaluated by an international panel of judges.",
      },
      privacy: {
        label: "Privacy notice",
        title: "Privacy notice",
        body:
          "We may collect contact information, account details, and application-related information required to evaluate participation in award programs.",
      },
      payment: {
        label: "Payment terms",
        title: "Payment terms",
        body:
          "Participation and jury fees are processed through secure payment providers. Fees, eligibility requirements, and timelines are shown in relevant application flows.",
      },
      refund: {
        label: "Refund notice",
        title: "Refund notice",
        body:
          "No. The registration fee is non-refundable after the application has been submitted.",
      },
    },
  },
  ru: {
    steps: {
      nominations: "Номинации",
      personal: "Личные данные",
      location: "Локация",
      professional: "Проф. информация",
      review: "Проверка",
      payment: "Оплата",
    },
    eyebrow: "IBPA Beauty Award 2026",
    title: "Выберите номинации для участия",
    introLead: "Выберите одну или несколько",
    introRest: " номинаций, укажите свои данные, подтвердите обязательные условия и оплатите безопасно.",
    introAfter: "После оплаты в вашем личном кабинете станут доступны анкеты для заполнения.",
    personal: "Личные данные",
    nameContact: "Имя и контакты",
    location: "Локация",
    professionalInfo: "Профессиональная информация",
    reviewTitle: "Проверьте заявку",
    paymentTitle: "Согласия и оплата",
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
    pay: "Оплатить",
    checkoutPending: "Создаем оплату...",
    submissionError: "Не удалось создать оплату. Проверьте форму и попробуйте еще раз.",
    required: "Обязательно",
    notProvided: "Не указано",
    nominationsWord: "номинаций",
    nominationsFew: "номинации",
    nominationWord: "номинация",
    selectedWord: "выбрано",
    details: "Подробнее",
    close: "Закрыть",
    agreementsCopy: {
      rules: {
        label: "Правила конкурса",
        title: "Правила конкурса",
        body:
          "Участники подают заявку и конкурсные материалы через онлайн-форму. Оценка работ проводится международной коллегией судей.",
      },
      privacy: {
        label: "Уведомление о приватности",
        title: "Уведомление о приватности",
        body:
          "Мы можем собирать контактные данные, данные аккаунта и информацию по заявкам, необходимую для участия в программах премии.",
      },
      payment: {
        label: "Условия оплаты",
        title: "Условия оплаты",
        body:
          "Оплата участия и регистрационных взносов жюри проводится через защищённых платёжных провайдеров. Условия и сроки оплаты указываются в соответствующих формах.",
      },
      refund: {
        label: "Условия возврата",
        title: "Условия возврата",
        body:
          "Нет. Регистрационный взнос является невозвратным после подачи заявки.",
      },
    },
  },
  ua: {
    steps: {
      nominations: "Номінації",
      personal: "Особисті дані",
      location: "Локація",
      professional: "Проф. інформація",
      review: "Перевірка",
      payment: "Оплата",
    },
    eyebrow: "IBPA Beauty Award 2026",
    title: "Оберіть номінації для участі",
    introLead: "Оберіть одну або кілька",
    introRest: " номінацій, укажіть свої дані, підтвердьте обов'язкові умови та сплатіть безпечно.",
    introAfter: "Після оплати у вашому особистому кабінеті стануть доступні анкети для заповнення.",
    personal: "Особисті дані",
    nameContact: "Ім'я та контакти",
    location: "Локація",
    professionalInfo: "Професійна інформація",
    reviewTitle: "Перевірте заявку",
    paymentTitle: "Згоди та оплата",
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
    pay: "Сплатити",
    checkoutPending: "Створюємо оплату...",
    submissionError: "Не вдалося створити оплату. Перевірте форму та спробуйте ще раз.",
    required: "Обов'язково",
    notProvided: "Не вказано",
    nominationsWord: "номінацій",
    nominationsFew: "номінації",
    nominationWord: "номінація",
    selectedWord: "обрано",
    details: "Докладніше",
    close: "Закрити",
    agreementsCopy: {
      rules: {
        label: "Правила конкурсу",
        title: "Правила конкурсу",
        body:
          "Учасники подають заявку та конкурсні матеріали через онлайн-форму. Оцінювання робіт проводить міжнародна колегія суддів.",
      },
      privacy: {
        label: "Повідомлення про приватність",
        title: "Повідомлення про приватність",
        body:
          "Ми можемо збирати контактні дані, дані акаунта та інформацію із заявок, необхідну для участі у програмах премії.",
      },
      payment: {
        label: "Умови оплати",
        title: "Умови оплати",
        body:
          "Оплати за участь і реєстраційні внески журі обробляються через захищених платіжних провайдерів. Умови та строки оплат вказуються у відповідних формах.",
      },
      refund: {
        label: "Умови повернення",
        title: "Умови повернення",
        body:
          "Ні. Реєстраційний внесок є неповоротним після подачі заявки.",
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
      furthestStep?: number;
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

function findRequestedNomination(categories: CategoryOption[], nominationId: string | null) {
  if (!nominationId) return null;

  for (const category of categories) {
    const award = category.awards.find((candidate) => candidate.id === nominationId);
    if (award) return { category, award };
  }

  return null;
}

/**
 * Public Apply flow as six horizontal steps: nominations, personal details,
 * location, professional details, review, and payment. All state lives here, so
 * moving between steps never loses selections or entered data, and the
 * whole flow persists to sessionStorage. Pricing shown client-side uses
 * the same shared helper as the server, and the final amount is always
 * recalculated server-side at checkout creation.
 */
export default function PurchaseApplicationForm({ categories }: { categories: CategoryOption[] }) {
  const { language, t: sharedT } = useLanguage();
  const searchParams = useSearchParams();
  const t = copy[language] ?? copy.en;
  const promoText = sharedT.promo;
  const reducedMotion = useReducedMotion();
  const nominationParam = searchParams.get("nomination")?.trim() || null;
  const requestedNomination = findRequestedNomination(categories, nominationParam);
  const requestedAwardId = requestedNomination?.award.id ?? null;
  const requestedCategoryId = requestedNomination?.category.id ?? null;
  const initialSelectedAwardIds = requestedAwardId ? [requestedAwardId] : [];
  const presentedCategories = useMemo(
    () =>
      presentNominationCategories(
        categories,
        translations.en.categoriesPage.directions,
        sharedT.categoriesPage.directions,
      ),
    [categories, sharedT.categoriesPage.directions],
  );
  const [values, setValues] = useState<FormValues>(initialValues);
  const [selectedAwardIds, setSelectedAwardIds] = useState<string[]>(initialSelectedAwardIds);
  const [step, setStep] = useState<number>(STEP_NOMINATIONS);
  const [furthestStep, setFurthestStep] = useState<number>(STEP_NOMINATIONS);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(
    requestedNomination?.category.id ?? categories[0]?.id ?? null,
  );
  const [focusAwardId, setFocusAwardId] = useState<string | null>(requestedNomination?.award.id ?? null);
  const handledNominationParam = useRef(nominationParam);
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
  const selectedAwards = presentedCategories.flatMap((category) =>
    category.awards
      .filter((award) => selectedAwardIds.includes(award.id))
      .map((award) => ({
        ...award,
        name: award.displayName,
        category: { ...category, name: category.displayName },
      }))
  );
  const count = selectedAwardIds.length;
  const finalAmountCents = promoPreview?.finalAmountCents ?? pricing.amountCents;
  const localizedPackageLabel = count >= 5
    ? `5+ ${t.nominationsWord}`
    : `${count} ${count === 1 ? t.nominationWord : count >= 2 && count <= 4 ? t.nominationsFew : t.nominationsWord}`;

  const personalComplete = PERSONAL_REQUIRED.every((key) => String(values[key]).trim() !== "");
  const locationComplete = LOCATION_REQUIRED.every((key) => String(values[key]).trim() !== "") &&
    (values.country !== "Other" || values.countryOther.trim() !== "") &&
    (values.country !== "USA" || values.stateProvince.trim() !== "");
  const professionalComplete = PROFESSIONAL_REQUIRED.every((key) => String(values[key]).trim() !== "");
  const dataUnlockedStep = count === 0
    ? STEP_NOMINATIONS
    : !personalComplete
      ? STEP_PERSONAL
      : !locationComplete
        ? STEP_LOCATION
        : !professionalComplete
          ? STEP_PROFESSIONAL
          : STEP_PAYMENT;
  const maxUnlockedStep = Math.min(furthestStep, dataUnlockedStep);

  const steps = [
    { id: "nominations", label: t.steps.nominations, icon: ListChecks },
    { id: "personal", label: t.steps.personal, icon: UserRound },
    { id: "location", label: t.steps.location, icon: MapPin },
    { id: "professional", label: t.steps.professional, icon: BriefcaseBusiness },
    { id: "review", label: t.steps.review, icon: ClipboardCheck },
    { id: "payment", label: t.steps.payment, icon: CreditCard },
  ];

  const siteLegal = legalContent[language] ?? legalContent.en;
  const agreementDetails: Record<keyof typeof t.agreementsCopy, Array<{ heading: string; body: string }>> = {
    rules: [siteLegal.terms.sections[1], siteLegal.terms.sections[3]],
    privacy: siteLegal.privacy.sections,
    payment: [siteLegal.terms.sections[2], siteLegal.privacy.sections[2]],
    refund: [],
  };

  useEffect(() => {
    const restored = restoreState();
    if (!restored) return;

    const frame = window.requestAnimationFrame(() => {
      const restoredIds = restored.selectedAwardIds ?? [];
      const mergedIds =
        requestedAwardId &&
        !restoredIds.includes(requestedAwardId) &&
        restoredIds.length < MAX_NOMINATIONS
          ? [...restoredIds, requestedAwardId]
          : restoredIds;
      const savedStep = requestedAwardId ? STEP_NOMINATIONS : restored.step ?? STEP_NOMINATIONS;
      const safeStep =
        savedStep > STEP_NOMINATIONS && mergedIds.length === 0
          ? STEP_NOMINATIONS
          : Math.min(Math.max(savedStep, STEP_NOMINATIONS), STEP_PAYMENT);

      setValues({ ...initialValues, ...restored.values });
      setSelectedAwardIds(mergedIds);
      setStep(safeStep);
      setFurthestStep(
        Math.min(
          Math.max(
            restored.furthestStep ?? restored.step ?? STEP_NOMINATIONS,
            STEP_NOMINATIONS,
          ),
          STEP_PAYMENT,
        ),
      );
    });

    return () => window.cancelAnimationFrame(frame);
  }, [requestedAwardId]);

  useEffect(() => {
    if (handledNominationParam.current === nominationParam) return;
    handledNominationParam.current = nominationParam;

    const frame = window.requestAnimationFrame(() => {
      if (!requestedAwardId || !requestedCategoryId) {
        setFocusAwardId(null);
        return;
      }

      setSelectedAwardIds((current) => {
        if (current.includes(requestedAwardId) || current.length >= MAX_NOMINATIONS) {
          return current;
        }
        return [...current, requestedAwardId];
      });
      setOpenCategoryId(requestedCategoryId);
      setFocusAwardId(requestedAwardId);
      setStep(STEP_NOMINATIONS);
      setFieldErrors((current) => ({ ...current, selectedAwardIds: "" }));
      setSubmitError("");
      setPromoPreview(null);
      setPromoError("");
    });

    return () => window.cancelAnimationFrame(frame);
  }, [nominationParam, requestedAwardId, requestedCategoryId]);

  useEffect(() => {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        values,
        selectedAwardIds,
        step,
        furthestStep,
        savedAt: Date.now(),
      })
    );
  }, [values, selectedAwardIds, step, furthestStep]);

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
      setPromoPreview(null);
      setPromoError("");
    }
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  }

  function setBool(name: keyof FormValues, value: boolean) {
    if (name === "isIbpaMember") {
      setCertState("idle");
      setPromoPreview(null);
      setPromoError("");
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

  function goToStep(next: number) {
    setStep(next);
    setSubmitError("");
    document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function advanceToStep(next: number) {
    setFurthestStep((current) => Math.max(current, next));
    goToStep(next);
  }

  function continueFromNominations() {
    if (count === 0) {
      setFieldErrors((current) => ({ ...current, selectedAwardIds: t.selectAtLeastOne }));
      return;
    }
    advanceToStep(STEP_PERSONAL);
  }

  function validateFields(fields: Array<keyof FormValues>) {
    const errors: Record<string, string> = {};
    for (const key of fields) {
      if (String(values[key]).trim() === "") errors[key] = t.required;
    }
    return errors;
  }

  function continueFromPersonal() {
    const errors = validateFields(PERSONAL_REQUIRED);
    if (Object.keys(errors).length > 0) {
      setFieldErrors((current) => ({ ...current, ...errors }));
      return;
    }
    advanceToStep(STEP_LOCATION);
  }

  function continueFromLocation() {
    const errors = validateFields(LOCATION_REQUIRED);
    if (values.country === "Other" && values.countryOther.trim() === "") {
      errors.countryOther = t.required;
    }
    if (values.country === "USA" && values.stateProvince.trim() === "") {
      errors.stateProvince = t.required;
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors((current) => ({ ...current, ...errors }));
      return;
    }
    advanceToStep(STEP_PROFESSIONAL);
  }

  function continueFromProfessional() {
    const errors = validateFields(PROFESSIONAL_REQUIRED);
    if (Object.keys(errors).length > 0) {
      setFieldErrors((current) => ({ ...current, ...errors }));
      return;
    }
    advanceToStep(STEP_REVIEW);
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
    if (step !== STEP_PAYMENT) return;
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
        } else if (errorKeys.some((key) => PERSONAL_REQUIRED.includes(key as keyof FormValues))) {
          setStep(STEP_PERSONAL);
        } else if (errorKeys.some((key) => LOCATION_REQUIRED.includes(key as keyof FormValues))) {
          setStep(STEP_LOCATION);
        } else if (errorKeys.some((key) => PROFESSIONAL_REQUIRED.includes(key as keyof FormValues))) {
          setStep(STEP_PROFESSIONAL);
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

  const editChipClass =
    "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[rgba(114,160,193,0.24)] bg-white/78 px-3.5 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-soft)] transition hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.25)]";

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-6xl flex-col gap-6">
      <section className="premium-glass relative overflow-hidden px-5 py-8 text-center sm:px-10 sm:py-11">
        <div className="pointer-events-none absolute -left-16 -top-20 size-56 rounded-full bg-[var(--color-blue-light)]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 size-64 rounded-full bg-[var(--color-blue-wash)]/80 blur-3xl" />
        <div className="relative">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">{t.eyebrow}</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-[var(--font-title-family)] text-[clamp(2.25rem,5vw,4rem)] font-medium leading-[0.96] tracking-[-0.05em] text-[var(--color-ink)]">{t.title}</h2>
          <p className="mx-auto mt-6 max-w-3xl text-[0.95rem] leading-7 text-[var(--color-ink-soft)] sm:text-base">
            <strong className="font-semibold text-[var(--color-ink)]">{t.introLead}</strong>{t.introRest}
            <br className="hidden sm:block" />{" "}
            <strong className="font-semibold text-[var(--color-ink)]">{t.introAfter}</strong>
          </p>
        </div>
      </section>

      <StepBar
        steps={steps}
        current={step}
        maxUnlockedStep={maxUnlockedStep}
        onStepChange={goToStep}
      />

      {step === STEP_NOMINATIONS ? (
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-col gap-4">
          {fieldErrors.selectedAwardIds ? (
            <p role="alert" className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {fieldErrors.selectedAwardIds}
            </p>
          ) : null}

          <NominationCategoryAccordion
            categories={presentedCategories}
            openCategoryId={openCategoryId}
            onOpenCategoryChange={setOpenCategoryId}
            selectedAwardIds={selectedAwardIds}
            onAwardToggle={toggleAward}
            focusAwardId={focusAwardId}
            copy={{
              nominationSingular: t.nominationWord,
              nominationPlural: t.nominationsWord,
              selected: t.selectedWord,
            }}
          />

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
            <LandingPrimaryButton onClick={continueFromNominations}>{t.continue}</LandingPrimaryButton>
          </div>
        </motion.div>
      ) : null}

      {step === STEP_PERSONAL ? (
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
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

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <LandingSecondaryButton onClick={() => goToStep(STEP_NOMINATIONS)}><ArrowLeft aria-hidden size={14} /> {t.back}</LandingSecondaryButton>
            <LandingPrimaryButton onClick={continueFromPersonal}>{t.continue}</LandingPrimaryButton>
          </div>
        </motion.div>
      ) : null}

      {step === STEP_LOCATION ? (
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
          <section className="premium-glass p-5 sm:p-7">
            <h3 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">{t.location}</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <SelectField label={t.country} name="country" value={values.country} options={countryOptions} placeholder={t.selectCountry} required error={fieldErrors.country} onChange={setField} />
              {values.country === "Other" ? <TextField label={t.countryOther} name="countryOther" value={values.countryOther} required error={fieldErrors.countryOther} onChange={setField} /> : <TextField label={t.stateProvince} name="stateProvince" value={values.stateProvince} error={fieldErrors.stateProvince} onChange={setField} />}
              <TextField label={t.city} name="city" value={values.city} required error={fieldErrors.city} onChange={setField} />
            </div>
          </section>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <LandingSecondaryButton onClick={() => goToStep(STEP_PERSONAL)}><ArrowLeft aria-hidden size={14} /> {t.back}</LandingSecondaryButton>
            <LandingPrimaryButton onClick={continueFromLocation}>{t.continue}</LandingPrimaryButton>
          </div>
        </motion.div>
      ) : null}

      {step === STEP_PROFESSIONAL ? (
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
          <section className="premium-glass p-5 sm:p-7">
            <h3 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">{t.professionalInfo}</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <TextField label={t.professionalTitle} name="professionalTitle" value={values.professionalTitle} required error={fieldErrors.professionalTitle} onChange={setField} />
              <TextField label={t.yearsExperience} name="yearsExperience" type="number" min={2} value={values.yearsExperience} required error={fieldErrors.yearsExperience} onChange={setField} />
              <TextField label={t.instagram} name="websiteUrl" type="url" value={values.websiteUrl} onChange={setField} />
              <TextField label={t.social} name="socialUrl" type="url" value={values.socialUrl} onChange={setField} />
              <TextField label={t.reviews} name="reviewsUrl" type="url" value={values.reviewsUrl} onChange={setField} />
            </div>
          </section>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <LandingSecondaryButton onClick={() => goToStep(STEP_LOCATION)}><ArrowLeft aria-hidden size={14} /> {t.back}</LandingSecondaryButton>
            <LandingPrimaryButton onClick={continueFromProfessional}>{t.continue}</LandingPrimaryButton>
          </div>
        </motion.div>
      ) : null}
      {step === STEP_REVIEW ? (
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
          <section className="premium-glass p-5 sm:p-7">
            <h3 className="font-[var(--font-title-family)] text-3xl font-light text-[var(--color-ink)]">{t.reviewTitle}</h3>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="rounded-[24px] border border-[rgba(114,160,193,0.16)] bg-white/72 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-[var(--font-title-family)] text-xl font-light text-[var(--color-ink)]">{t.personal}</h4>
                  <button type="button" onClick={() => goToStep(STEP_PERSONAL)} className={editChipClass}><PenLine aria-hidden size={12} /> {t.edit}</button>
                </div>
                <div className="mt-4 grid gap-2.5">
                  <SummaryFact label={t.firstName + " / " + t.lastName} value={(values.firstName + " " + values.lastName).trim() || t.notProvided} />
                  <SummaryFact label={t.email} value={values.email || t.notProvided} />
                  <SummaryFact label={t.phone} value={values.phone || t.notProvided} />
                </div>
              </div>
              <div className="rounded-[24px] border border-[rgba(114,160,193,0.16)] bg-white/72 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-[var(--font-title-family)] text-xl font-light text-[var(--color-ink)]">{t.location}</h4>
                  <button type="button" onClick={() => goToStep(STEP_LOCATION)} className={editChipClass}><PenLine aria-hidden size={12} /> {t.edit}</button>
                </div>
                <div className="mt-4 grid gap-2.5">
                  <SummaryFact label={t.country} value={values.country === "Other" ? values.countryOther || t.notProvided : values.country || t.notProvided} />
                  <SummaryFact label={t.stateProvince} value={values.stateProvince || t.notProvided} />
                  <SummaryFact label={t.city} value={values.city || t.notProvided} />
                </div>
              </div>
              <div className="rounded-[24px] border border-[rgba(114,160,193,0.16)] bg-white/72 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-[var(--font-title-family)] text-xl font-light text-[var(--color-ink)]">{t.professionalInfo}</h4>
                  <button type="button" onClick={() => goToStep(STEP_PROFESSIONAL)} className={editChipClass}><PenLine aria-hidden size={12} /> {t.edit}</button>
                </div>
                <div className="mt-4 grid gap-2.5">
                  <SummaryFact label={t.professionalTitle} value={values.professionalTitle || t.notProvided} />
                  <SummaryFact label={t.yearsExperience} value={values.yearsExperience || t.notProvided} />
                  <SummaryFact label={t.social} value={values.socialUrl || values.websiteUrl || t.notProvided} />
                </div>
              </div>
            </div>
          </section>

          <section className="premium-glass p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">{t.nominations}</h3>
              <button type="button" onClick={() => goToStep(STEP_NOMINATIONS)} className={editChipClass}><PenLine aria-hidden size={12} /> {t.edit}</button>
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {selectedAwards.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 rounded-[18px] border border-[rgba(114,160,193,0.16)] bg-white/78 px-3.5 py-2.5">
                  <span className="min-w-0">
                    <span className="block break-words text-sm font-medium leading-snug text-[var(--color-ink)]">{item.name}</span>
                    <span className="text-xs text-[var(--color-ink-soft)]">{item.category.name}</span>
                  </span>
                  <button type="button" disabled={submitting} onClick={() => toggleAward(item.id)} aria-label={[t.edit, item.name].join(" ")} className="flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-soft)] transition hover:bg-[var(--color-blue-wash)] hover:text-[#4d88b2] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.25)] disabled:opacity-50"><X aria-hidden size={14} /></button>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <LandingSecondaryButton onClick={() => goToStep(STEP_PROFESSIONAL)}><ArrowLeft aria-hidden size={14} /> {t.back}</LandingSecondaryButton>
            <LandingPrimaryButton onClick={() => advanceToStep(STEP_PAYMENT)}>{t.continue}</LandingPrimaryButton>
          </div>
        </motion.div>
      ) : null}

      {step === STEP_PAYMENT ? (
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
          <h3 className="px-1 font-[var(--font-title-family)] text-3xl font-light text-[var(--color-ink)]">{t.paymentTitle}</h3>
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex min-w-0 flex-col gap-5">
              <section className="premium-glass p-5 sm:p-6">
                <h3 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">{t.agreements}</h3>
                {fieldErrors.agreements ? <p role="alert" className="mt-3 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{fieldErrors.agreements}</p> : null}
                <div className="mt-4 grid gap-3">
                  {agreementEntries.map(([key, item]) => {
                    const fieldName = key === "rules" ? "rulesAccepted" : key === "privacy" ? "privacyAccepted" : key === "payment" ? "paymentTermsAccepted" : "refundNoticeAccepted";
                    const accepted = Boolean(values[fieldName]);
                    return (
                      <div key={key} className={accepted ? "rounded-[24px] border border-[var(--color-blue)]/45 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(185,217,235,0.3))] p-4 shadow-[0_14px_34px_rgba(114,160,193,0.12)] transition" : "rounded-[24px] border border-[var(--border-default)] bg-white/72 p-4 transition"}>
                        <label className="flex cursor-pointer items-start gap-3">
                          <input type="checkbox" checked={accepted} onChange={(event) => setBool(fieldName, event.target.checked)} className="sr-only" />
                          <span aria-hidden className={accepted ? "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-blue)]/50 bg-[var(--color-blue-wash)] text-[#356f98] transition" : "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.34)] bg-white/90 text-transparent transition"}><Check size={13} strokeWidth={3} /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-[var(--color-ink)]">{item.label} <span className="text-[var(--color-blue)]">*</span></span>
                            <span className="mt-1 block text-[0.78rem] leading-6 text-[var(--color-ink-soft)]">{item.body}</span>
                          </span>
                        </label>
                        <button type="button" onClick={() => setOpenAgreement(key)} className="mt-3 ml-9 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#4d88b2] underline decoration-[var(--color-blue)]/25 underline-offset-4">{t.details}</button>
                      </div>
                    );
                  })}
                </div>
              </section>
              <LandingSecondaryButton onClick={() => goToStep(STEP_REVIEW)} className="self-start"><ArrowLeft aria-hidden size={14} /> {t.back}</LandingSecondaryButton>
            </div>

            <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
              <section className="premium-glass p-5">
                <h3 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">{t.membership}</h3>
                <label className={values.isIbpaMember ? "mt-4 flex cursor-pointer items-center gap-3 rounded-[22px] border border-[var(--color-blue)]/45 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(185,217,235,0.36))] p-4 shadow-[0_14px_34px_rgba(114,160,193,0.12)] transition" : "mt-4 flex cursor-pointer items-center gap-3 rounded-[22px] border border-[var(--border-default)] bg-white/72 p-4 transition"}>
                  <input type="checkbox" checked={values.isIbpaMember} onChange={(event) => setBool("isIbpaMember", event.target.checked)} className="sr-only" />
                  <span aria-hidden className={values.isIbpaMember ? "flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-blue)]/45 bg-[var(--color-blue-wash)] text-[#356f98] transition" : "flex size-8 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.32)] bg-white/90 text-transparent transition"}><Check size={15} strokeWidth={3} /></span>
                  <span className="text-sm font-medium text-[var(--color-ink)]">{t.memberLabel}</span>
                </label>
                {values.isIbpaMember ? (
                  <div className="mt-4">
                    <TextField label={t.certNumber} name="ibpaMemberNumber" value={values.ibpaMemberNumber} required error={fieldErrors.ibpaMemberNumber} onChange={setField} />
                    <p className="mt-2 flex items-start gap-2 text-[0.78rem] leading-5 text-[var(--color-ink-soft)]">
                      {certState === "valid" ? <BadgeCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" /> : <AlertCircle size={16} className="mt-0.5 shrink-0 text-[var(--color-blue)]" />}
                      {certState === "checking" ? t.certChecking : certState === "valid" ? t.certValid : certState === "invalid" ? t.certInvalid : certState === "error" ? t.certError : t.standardRate}
                    </p>
                  </div>
                ) : null}
              </section>

              <section className="premium-glass p-5 sm:p-6">
                <div className="flex items-center gap-3 text-[var(--color-blue)]"><ShoppingCart size={18} /><p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em]">{t.summary}</p></div>
                <dl className="mt-5 space-y-2.5 text-[0.86rem]">
                  <div className="flex items-center justify-between gap-3"><dt className="text-[var(--color-ink-soft)]">{t.nominations}</dt><dd className="font-semibold text-[var(--color-ink)]">{count}</dd></div>
                  <div className="flex items-center justify-between gap-3"><dt className="text-[var(--color-ink-soft)]">{t.rateLabel}</dt><dd className="font-semibold text-[var(--color-ink)]">{verifiedMember ? t.memberRate : t.standardRate}</dd></div>
                  <div className="flex items-center justify-between gap-3"><dt className="text-[var(--color-ink-soft)]">{t.packageLabel}</dt><dd className="font-semibold text-[var(--color-ink)]">{count > 0 ? localizedPackageLabel : "—"}</dd></div>
                </dl>
                <div className="mt-4 border-t border-[rgba(114,160,193,0.18)] pt-4">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">{promoText.promoCode}</span>
                    <span className="mt-2 flex gap-2">
                      <input type="text" value={promoInput} onChange={(event) => { setPromoInput(event.target.value); setPromoPreview(null); setPromoError(""); }} className="h-11 min-w-0 flex-1 rounded-[18px] border border-[rgba(114,160,193,0.22)] bg-white/74 px-4 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-blue)] focus:ring-4 focus:ring-[rgba(114,160,193,0.16)]" autoCapitalize="characters" autoCorrect="off" spellCheck={false} />
                      <button type="button" disabled={promoPending || !promoInput.trim() || count === 0} onClick={() => void applyPromoCode()} className="inline-flex min-h-11 items-center justify-center rounded-[18px] border border-[rgba(114,160,193,0.24)] bg-white/78 px-4 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#4d88b2] transition hover:bg-[var(--color-blue-wash)] disabled:cursor-not-allowed disabled:opacity-50">{promoPending ? promoText.applying : promoText.apply}</button>
                    </span>
                  </label>
                  {promoPreview ? <p className="mt-2 text-[0.76rem] text-emerald-700">{promoText.promoCodeApplied}</p> : promoError ? <p className="mt-2 text-[0.76rem] text-red-700">{promoError}</p> : null}
                </div>
                <div className="mt-4 border-t border-[rgba(114,160,193,0.18)] pt-4">
                  {promoPreview ? (
                    <dl className="mb-3 space-y-2 text-[0.82rem]">
                      <div className="flex items-center justify-between gap-3"><dt className="text-[var(--color-ink-soft)]">{promoText.originalPrice}</dt><dd className="font-semibold text-[var(--color-ink)]">{money(promoPreview.originalAmountCents)}</dd></div>
                      <div className="flex items-center justify-between gap-3 text-emerald-700"><dt>{promoText.discount} {promoPreview.discountPercent}%</dt><dd className="font-semibold">-{money(promoPreview.discountAmountCents)}</dd></div>
                    </dl>
                  ) : null}
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">{promoPreview ? promoText.finalTotal : t.totalLabel}</p>
                  <p className="mt-1 font-[var(--font-title-family)] text-4xl font-light text-[var(--color-ink)]">{count > 0 ? money(finalAmountCents) : "$0"}</p>
                  {verifiedMember ? <p className="mt-2 flex items-center gap-1.5 text-[0.74rem] text-emerald-700"><BadgeCheck aria-hidden size={13} /> {t.certValid}</p> : null}
                </div>
                {submitError ? <p role="alert" className="mt-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p> : null}
                <button type="submit" disabled={submitting} className={[LANDING_PRIMARY_BTN_CLASS, "mt-5 w-full", submitting ? "cursor-not-allowed opacity-60" : ""].join(" ")}>
                  <ButtonLayers />
                  <ShieldCheck aria-hidden size={17} className="relative z-10 text-[#4d88b2]" />
                  <span className="relative z-10">{submitting ? t.checkoutPending : t.pay}</span>
                </button>
              </section>
            </aside>
          </div>
        </motion.div>
      ) : null}

      {openAgreement ? (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[rgba(114,160,193,0.22)] px-4 py-6 backdrop-blur-md" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="agreement-title"
            className="max-h-full w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/80 bg-white/96 p-6 shadow-[0_30px_90px_rgba(114,160,193,0.24)] backdrop-blur-2xl"
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
                aria-label={t.close}
              >
                <X size={17} />
              </button>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
              {t.agreementsCopy[openAgreement].body}
            </p>
            {agreementDetails[openAgreement].length > 0 ? (
              <div className="mt-5 grid gap-3">
                {agreementDetails[openAgreement].map((section) => (
                  <section key={section.heading} className="rounded-[20px] border border-[rgba(114,160,193,0.16)] bg-[var(--color-blue-wash)]/35 p-4">
                    <h4 className="text-sm font-semibold text-[var(--color-ink)]">{section.heading}</h4>
                    <p className="mt-1.5 text-[0.82rem] leading-6 text-[var(--color-ink-soft)]">{section.body}</p>
                  </section>
                ))}
              </div>
            ) : null}
            <LandingPrimaryButton onClick={() => setOpenAgreement(null)} className="mt-6 w-full">{t.close}</LandingPrimaryButton>
          </div>
        </div>
      ) : null}
    </form>
  );
}
