"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  BadgeCheck,
  BookOpen,
  Brush,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileCheck,
  Gem,
  GraduationCap,
  HeartHandshake,
  Layers,
  Send,
  ShieldCheck,
  Sparkles,
  SprayCan,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import BlockBRenderer from "@/features/applications/components/application-form/blocks/BlockBRenderer";
import StepBar, {
  type StepDef,
} from "@/features/applications/components/application-form/StepBar";
import {
  SelectField,
  TextField,
} from "@/features/applications/components/application-form/fields/FormControls";
import UploadField from "@/features/applications/components/application-form/fields/UploadField";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { countryOptions } from "@/features/applications/config/countries";
import { heardAboutOptions } from "@/features/applications/config/application-timeline";
import {
  validateApplicationValues,
  validateNominationBlockB,
} from "@/features/applications/schemas/category-field-validation";
import {
  type ApplicationValues,
  type BlockBValuesByNomination,
  type CategoryOption,
  type ValidationErrors,
} from "@/features/applications/types/application.types";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

const HERO_PRIMARY_BUTTON_CLASS =
  "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border border-white/10 bg-gradient-to-r from-[#050505] via-[#111111] to-[#050505] px-8 py-4 font-[var(--font-ui-family)] text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_32px_rgba(0,0,0,0.3)] transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:border-[#7a98af]/60 hover:shadow-[0_16px_44px_rgba(122,152,175,0.16)] disabled:pointer-events-none disabled:opacity-60";

function HeroPrimaryButtonLayers() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#7a98af]/10 opacity-60 transition-opacity duration-200 group-hover:opacity-90" />
      <span className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[#b9d9eb]/0 to-transparent transition duration-200 group-hover:via-[#b9d9eb]/60" />
    </>
  );
}

const NOM_FORM_PREFIX = "__nom__";

// Fixed step index where Block B sections begin (one per selected nomination)
const BLOCK_B_START = 4;

const categoryIconBySlug: Record<string, LucideIcon> = {
  hair: SprayCan,
  nail: Gem,
  brow: Brush,
  lash: Sparkles,
  "skin-cosmetology-facial": HeartHandshake,
  "makeup-artistry": Camera,
  "permanent-makeup": Award,
  "body-wellness-nutrition": Users,
  education: GraduationCap,
  salon: Trophy,
  brand: BookOpen,
};

const MAX_SELECTED_NOMINATIONS = 5;

// Tiered pricing in dollars: index = nomination count (1–5)
const MEMBER_PRICES = [0, 50, 100, 130, 180, 200] as const;
const NON_MEMBER_PRICES = [0, 70, 140, 190, 260, 300] as const;

function getDisplayPrice(count: number, isMember: boolean): number | null {
  if (count === 0) return null;
  const prices = isMember ? MEMBER_PRICES : NON_MEMBER_PRICES;
  return prices[Math.min(count, 5) as 0 | 1 | 2 | 3 | 4 | 5] ?? null;
}

function getSavingsAmount(count: number): number {
  if (count >= 5) return 50;
  if (count >= 3) return 20;
  return 0;
}

type CertStatus = "idle" | "checking" | "valid" | "invalid" | "error";

const CERT_STATUS_CONTENT: Record<
  Exclude<CertStatus, "idle">,
  React.ReactNode
> = {
  checking: (
    <span className="flex items-center gap-1.5 text-[var(--color-ink-soft)]">
      <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
      Verifying…
    </span>
  ),
  valid: (
    <span className="flex items-center gap-1.5 text-emerald-600">
      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      Valid IBPA member certificate
    </span>
  ),
  invalid: (
    <span className="flex items-center gap-1.5 text-red-500">
      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
      Certificate not found
    </span>
  ),
  error: (
    <span className="flex items-center gap-1.5 text-[var(--color-blue)]">
      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      Could not verify – non-member rate applies
    </span>
  ),
};

function CertStatusBadge({ status }: { status: CertStatus }) {
  if (status === "idle") return null;
  return (
    <div className="mt-1.5 text-[0.72rem]">{CERT_STATUS_CONTENT[status]}</div>
  );
}

const categoryCardTransition = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1],
} as const;

function isFieldComplete(value: ApplicationValues[string]) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return false;
}

function getSelectedAwardIds(values: ApplicationValues) {
  return Array.isArray(values.selectedAwardIds)
    ? values.selectedAwardIds.filter(
        (item): item is string => typeof item === "string",
      )
    : [];
}

function splitCategories(categories: CategoryOption[]) {
  return {
    leftCategories: categories.filter((_, index) => index % 2 === 0),
    rightCategories: categories.filter((_, index) => index % 2 === 1),
  };
}

const formCopy = {
  en: {
    steps: [
      {
        title: "Select Your Nominations",
        desc: "",
      },
      {
        title: "Contact Details",
        desc: "Use the contact information that should receive review updates.",
      },
      {
        title: "Professional Profile",
        desc: "Tell us about your professional background and experience.",
      },
      {
        title: "Credentials",
        desc: "Upload your professional license or certification for verification.",
      },
      {
        title: "Category Details",
        desc: "Complete the category-specific requirements for your selected nominations.",
      },
      {
        title: "Motivation & Links",
        desc: "Share your online presence and how you found the award.",
      },
      {
        title: "Review & Submit",
        desc: "Review your application before final submission.",
      },
    ],
    back: "Back",
    continue: "Continue",
    submit: "Submit Application",
    submitting: "Submitting...",
    category: "Category",
    nomination: "Nomination",
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
    professionalTitlePh: "Master Stylist, Educator, Clinic Founder...",
    yearsExperience: "Years of Experience",
    yearsExperienceHint: "Minimum 2 years required.",
    licenseCertification: "Professional License / Certification",
    licenseCertificationHint:
      "Upload PDF, JPG, or PNG. Max 5 MB. Large images are auto-compressed.",
    website: "Professional Website",
    social: "Instagram / Social Media",
    reviews: "Client Reviews Link",
    heardAbout: "How did you hear about us?",
    selectOption: "Select an option",
    heardAboutOther: "Please specify",
    heardAboutLabels: {
      instagram: "Instagram",
      facebook: "Facebook",
      email: "Email newsletter",
      referral: "Friend or colleague",
      google: "Google search",
      event: "Event / expo",
      other: "Other",
    },
    selectUpTo: "Select up to five nominations",
    selectionHint:
      "Your active nomination drives the category-specific requirements in the next steps.",
    selectedTitle: "Selected nominations",
    selectedEmpty: "No nominations selected yet.",
    selectedEmptyHint:
      "Open a category card and click a nomination to add it here.",
    selectionLimitError: "You can select up to five nominations.",
    activeNomination: "Active nomination",
    makeActive: "Set as active",
    remove: "Remove",
    confirmTitle: "Application Summary",
    confirmNote:
      "Please review the details below before submitting. Once submitted, your entry will be sent to the IBPA jury for evaluation.",
    errorValidation: "Please fill all required fields before continuing.",
    submitError: "Submission failed. Please try again.",
    submitException: "Something went wrong. Please try again.",
    redirecting: "Redirecting to payment...",
    nominationCount: "Selected nominations",
    ibpaMembership: "IBPA Membership",
    ibpaMemberLabel: "I am an IBPA Member",
    ibpaMemberSub: "Members receive discounted entry fees",
    ibpaCertNumber: "IBPA CERT Number",
    entryFee: "Entry Fee",
    memberRate: "Member rate",
    standardRate: "Standard rate",
    grandPrixEligible: "Grand Prix eligible",
    selectForPricing: "Select nominations to see pricing",
    savings: "Save",
    certInvalidError:
      "Your IBPA certificate could not be verified. Please check the number or uncheck IBPA Member to proceed at standard rate.",
    certCheckingError: "Please wait while we verify your IBPA certificate.",
  },
  ru: {
    steps: [
      {
        title: "Выбор номинаций",
        desc: "Откройте категорию и выберите до пяти номинаций в одном потоке заявки.",
      },
      {
        title: "Контактные данные",
        desc: "Укажите контакты для получения обновлений по заявке.",
      },
      {
        title: "Профессиональный профиль",
        desc: "Расскажите о вашем профессиональном опыте и специализации.",
      },
      {
        title: "Документы",
        desc: "Загрузите профессиональную лицензию или сертификат для проверки.",
      },
      {
        title: "Детали категории",
        desc: "Заполните требования для активной номинации.",
      },
      {
        title: "Мотивация и ссылки",
        desc: "Укажите онлайн-площадки и как вы узнали о премии.",
      },
      {
        title: "Проверка и отправка",
        desc: "Проверьте заявку перед финальной отправкой.",
      },
    ],
    back: "Назад",
    continue: "Продолжить",
    submit: "Отправить заявку",
    submitting: "Отправка...",
    category: "Категория",
    nomination: "Номинация",
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
    professionalTitlePh: "Мастер-стилист, преподаватель, владелец студии...",
    yearsExperience: "Стаж работы",
    yearsExperienceHint: "Минимум 2 года опыта.",
    licenseCertification: "Лицензия / Сертификат",
    licenseCertificationHint:
      "Загрузите PDF, JPG или PNG. Макс. 5 МБ. Большие изображения сжимаются автоматически.",
    website: "Профессиональный сайт",
    social: "Instagram / Соцсети",
    reviews: "Ссылка на отзывы клиентов",
    heardAbout: "Откуда вы узнали о нас?",
    selectOption: "Выберите вариант",
    heardAboutOther: "Уточните",
    heardAboutLabels: {
      instagram: "Instagram",
      facebook: "Facebook",
      email: "Email-рассылка",
      referral: "Друг или коллега",
      google: "Поиск Google",
      event: "Событие / выставка",
      other: "Другое",
    },
    selectUpTo: "Выберите до пяти номинаций",
    selectionHint:
      "Активная номинация определяет требования блока категории на следующих шагах.",
    selectedTitle: "Выбранные номинации",
    selectedEmpty: "Пока нет выбранных номинаций.",
    selectedEmptyHint:
      "Откройте карточку категории и нажмите на номинацию, чтобы добавить её сюда.",
    selectionLimitError: "Можно выбрать не более пяти номинаций.",
    activeNomination: "Активная номинация",
    makeActive: "Сделать активной",
    remove: "Удалить",
    confirmTitle: "Сводка заявки",
    confirmNote:
      "Проверьте данные перед отправкой. После отправки ваша заявка будет передана жюри IBPA.",
    errorValidation: "Заполните все обязательные поля перед продолжением.",
    submitError: "Не удалось отправить заявку. Попробуйте снова.",
    submitException: "Что-то пошло не так. Попробуйте снова.",
    redirecting: "Переход к оплате...",
    nominationCount: "Выбранные номинации",
    ibpaMembership: "Членство IBPA",
    ibpaMemberLabel: "Я являюсь членом IBPA",
    ibpaMemberSub: "Члены получают сниженные взносы",
    ibpaCertNumber: "CERT-номер IBPA",
    entryFee: "Взнос",
    memberRate: "Тариф участника",
    standardRate: "Стандартный тариф",
    grandPrixEligible: "Участие в Гран-При",
    selectForPricing: "Выберите номинации для расчёта цены",
    savings: "Скидка",
    certInvalidError:
      "Ваш сертификат IBPA не прошёл проверку. Проверьте номер или снимите галочку «Член IBPA» для стандартного тарифа.",
    certCheckingError: "Подождите, идёт проверка вашего сертификата IBPA.",
  },
  ua: {
    steps: [
      {
        title: "Вибір номінацій",
        desc: "Відкрийте категорію та оберіть до п'яти номінацій в одному потоці заявки.",
      },
      {
        title: "Контактні дані",
        desc: "Вкажіть контакти для отримання оновлень щодо заявки.",
      },
      {
        title: "Професійний профіль",
        desc: "Розкажіть про ваш досвід та спеціалізацію.",
      },
      {
        title: "Документи",
        desc: "Завантажте професійну ліцензію або сертифікат для перевірки.",
      },
      {
        title: "Деталі категорії",
        desc: "Заповніть вимоги для активної номінації.",
      },
      {
        title: "Мотивація та посилання",
        desc: "Поділіться онлайн-профілями та як ви дізналися про премію.",
      },
      {
        title: "Перевірка та надсилання",
        desc: "Перевірте заявку перед фінальним надсиланням.",
      },
    ],
    back: "Назад",
    continue: "Продовжити",
    submit: "Надіслати заявку",
    submitting: "Надсилання...",
    category: "Категорія",
    nomination: "Номінація",
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
    professionalTitlePh: "Майстер-стиліст, викладач, власник студії...",
    yearsExperience: "Стаж роботи",
    yearsExperienceHint: "Мінімум 2 роки досвіду.",
    licenseCertification: "Ліцензія / Сертифікат",
    licenseCertificationHint:
      "Завантажте PDF, JPG або PNG. Макс. 5 МБ. Великі зображення стискаються автоматично.",
    website: "Професійний сайт",
    social: "Instagram / Соцмережі",
    reviews: "Посилання на відгуки клієнтів",
    heardAbout: "Звідки ви дізналися про нас?",
    selectOption: "Оберіть варіант",
    heardAboutOther: "Уточніть",
    heardAboutLabels: {
      instagram: "Instagram",
      facebook: "Facebook",
      email: "Email-розсилка",
      referral: "Друг або колега",
      google: "Пошук Google",
      event: "Подія / виставка",
      other: "Інше",
    },
    selectUpTo: "Оберіть до п'яти номінацій",
    selectionHint:
      "Активна номінація визначає вимоги категорії на наступних кроках.",
    selectedTitle: "Обрані номінації",
    selectedEmpty: "Поки що немає обраних номінацій.",
    selectedEmptyHint:
      "Відкрийте картку категорії та натисніть на номінацію, щоб додати її сюди.",
    selectionLimitError: "Можна обрати не більше п'яти номінацій.",
    activeNomination: "Активна номінація",
    makeActive: "Зробити активною",
    remove: "Видалити",
    confirmTitle: "Підсумок заявки",
    confirmNote:
      "Перевірте дані перед надсиланням. Після відправки вашу заявку буде передано журі IBPA.",
    errorValidation: "Заповніть усі обов'язкові поля перед продовженням.",
    submitError: "Не вдалося надіслати заявку. Спробуйте ще раз.",
    submitException: "Щось пішло не так. Спробуйте ще раз.",
    redirecting: "Перехід до оплати...",
    nominationCount: "Обрані номінації",
    ibpaMembership: "Членство IBPA",
    ibpaMemberLabel: "Я є членом IBPA",
    ibpaMemberSub: "Члени отримують знижені внески",
    ibpaCertNumber: "CERT-номер IBPA",
    entryFee: "Внесок",
    memberRate: "Тариф учасника",
    standardRate: "Стандартний тариф",
    grandPrixEligible: "Участь у Гран-Прі",
    selectForPricing: "Оберіть номінації для розрахунку ціни",
    savings: "Знижка",
    certInvalidError:
      "Ваш сертифікат IBPA не пройшов перевірку. Перевірте номер або зніміть позначку «Член IBPA» для стандартного тарифу.",
    certCheckingError: "Зачекайте, йде перевірка вашого сертифіката IBPA.",
  },
} as const;

export default function ApplyForm({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const { language, t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);
  const [stepDirection, setStepDirection] = useState<1 | -1>(1);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(
    categories[0]?.id ?? null,
  );
  const [values, setValues] = useState<ApplicationValues>({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [blockBValues, setBlockBValues] = useState<BlockBValuesByNomination>(
    {},
  );
  const [blockBErrors, setBlockBErrors] = useState<
    Record<string, ValidationErrors>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });
  const [isIbpaMember, setIsIbpaMember] = useState(false);
  const [ibpaMemberNumber, setIbpaMemberNumber] = useState("");
  const [certStatus, setCertStatus] = useState<CertStatus>("idle");
  const certDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copy = formCopy[language] ?? formCopy.en;

  // Cert verification — same pattern as TicketForm
  useEffect(() => {
    if (!isIbpaMember) {
      setCertStatus("idle");
      return;
    }
    const trimmed = ibpaMemberNumber.trim();
    if (!trimmed) {
      setCertStatus("idle");
      return;
    }
    if (certDebounceRef.current) clearTimeout(certDebounceRef.current);
    setCertStatus("checking");
    certDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/tickets/verify-cert?certNumber=${encodeURIComponent(trimmed)}`,
        );
        const data = (await res.json()) as { valid: boolean };
        if (res.status === 503) {
          setCertStatus("error");
        } else {
          setCertStatus(data.valid ? "valid" : "invalid");
        }
      } catch {
        setCertStatus("error");
      }
    }, 600);
    return () => {
      if (certDebounceRef.current) clearTimeout(certDebounceRef.current);
    };
  }, [isIbpaMember, ibpaMemberNumber]);

  // Effective membership: only valid cert counts (error falls back to non-member)
  const effectivelyMember = isIbpaMember && certStatus === "valid";

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

  const localizedCategoryBySlug = useMemo(
    () =>
      new Map(
        t.categoriesPage.directions.map((category) => [
          category.slug,
          category,
        ]),
      ),
    [t.categoriesPage.directions],
  );

  const nominationLookup = useMemo(() => {
    const lookup = new Map<
      string,
      {
        award: CategoryOption["awards"][number];
        category: CategoryOption;
        categoryTitle: string;
        nominationTitle: string;
      }
    >();

    for (const category of categories) {
      const localizedCategory = localizedCategoryBySlug.get(category.slug);

      category.awards.forEach((award, index) => {
        lookup.set(award.id, {
          award,
          category,
          categoryTitle: localizedCategory?.title ?? category.name,
          nominationTitle: localizedCategory?.nominations[index] ?? award.name,
        });
      });
    }

    return lookup;
  }, [categories, localizedCategoryBySlug]);

  const selectedAwardIds = getSelectedAwardIds(values);
  const selectedNominations = selectedAwardIds
    .map((awardId) => nominationLookup.get(awardId))
    .filter(
      (
        item,
      ): item is {
        award: CategoryOption["awards"][number];
        category: CategoryOption;
        categoryTitle: string;
        nominationTitle: string;
      } => Boolean(item),
    );

  // Computed pricing (depends on selectedAwardIds which is above)
  const displayPrice = getDisplayPrice(
    selectedAwardIds.length,
    effectivelyMember,
  );
  const savings = getSavingsAmount(selectedAwardIds.length);

  // Dynamic step boundaries — change when nomination count changes
  const MOTIVATION_STEP =
    BLOCK_B_START + Math.max(1, selectedNominations.length);
  const CONFIRM_STEP = MOTIVATION_STEP + 1;

  useEffect(() => {
    setStep((current) => Math.min(current, CONFIRM_STEP));
    setMaxUnlockedStep((current) => Math.min(current, CONFIRM_STEP));
  }, [CONFIRM_STEP]);

  function handleBlockBChange(
    awardId: string,
    name: string,
    value: string | string[],
  ) {
    setBlockBValues((current) => ({
      ...current,
      [awardId]: { ...(current[awardId] ?? {}), [name]: value },
    }));
    setBlockBErrors((current) => {
      const nomErrors = { ...(current[awardId] ?? {}) };
      delete nomErrors[name];
      return { ...current, [awardId]: nomErrors };
    });
  }

  function handleBlockBFilesChange(
    awardId: string,
    name: string,
    files: File[],
  ) {
    setBlockBValues((current) => ({
      ...current,
      [awardId]: { ...(current[awardId] ?? {}), [name]: files },
    }));
    setBlockBErrors((current) => {
      const nomErrors = { ...(current[awardId] ?? {}) };
      delete nomErrors[name];
      return { ...current, [awardId]: nomErrors };
    });
  }

  const { leftCategories, rightCategories } = useMemo(
    () => splitCategories(categories),
    [categories],
  );

  function updatePrimarySelection(nextSelectedAwardIds: string[]) {
    const nextPrimaryNomination = nextSelectedAwardIds[0]
      ? nominationLookup.get(nextSelectedAwardIds[0])
      : undefined;

    return {
      selectedAwardIds: nextSelectedAwardIds,
      awardId: nextPrimaryNomination?.award.id ?? "",
      categoryId: nextPrimaryNomination?.category.id ?? "",
    };
  }

  function clearSelectionErrors() {
    setErrors((current) => {
      const next = { ...current };
      delete next.selectedAwardIds;
      delete next.awardId;
      delete next.categoryId;
      return next;
    });
  }

  function handleNominationToggle(awardId: string) {
    const exists = selectedAwardIds.includes(awardId);

    if (!exists && selectedAwardIds.length >= MAX_SELECTED_NOMINATIONS) {
      setErrors((current) => ({
        ...current,
        selectedAwardIds: copy.selectionLimitError,
      }));
      return;
    }

    const nomination = nominationLookup.get(awardId);
    if (!nomination) {
      return;
    }

    startTransition(() => {
      setValues((current) => {
        const currentIds = getSelectedAwardIds(current);
        const alreadySelected = currentIds.includes(awardId);
        const nextIds = alreadySelected
          ? currentIds.filter((item) => item !== awardId)
          : [...currentIds, awardId];

        return {
          ...current,
          ...updatePrimarySelection(nextIds),
        };
      });
      setOpenCategoryId(nomination.category.id);
      clearSelectionErrors();
    });
  }

  function handleSelectedNominationRemove(awardId: string) {
    startTransition(() => {
      setValues((current) => {
        const nextIds = getSelectedAwardIds(current).filter(
          (item) => item !== awardId,
        );

        return {
          ...current,
          ...updatePrimarySelection(nextIds),
        };
      });
      clearSelectionErrors();
    });
  }

  function handleChange(name: string, value: string | string[]) {
    setValues((current) => {
      const next = { ...current, [name]: value };

      if (name === "country" && value !== "Other") {
        next.countryOther = "";
      }

      return next;
    });

    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function handleFilesChange(name: string, files: File[]) {
    setValues((current) => ({ ...current, [name]: files }));
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function validateStep(currentStep: number): ValidationErrors {
    const nextErrors: ValidationErrors = {};
    const requireField = (key: string, value?: ApplicationValues[string]) => {
      if (!isFieldComplete(value ?? values[key])) {
        nextErrors[key] = "Required";
      }
    };

    if (currentStep === 0) {
      requireField("selectedAwardIds", selectedAwardIds);
    }

    if (currentStep === 1) {
      requireField("firstName");
      requireField("lastName");
      requireField("email");
      requireField("phone");
      requireField("country");
      requireField("city");

      if (String(values.country ?? "") === "Other") {
        requireField("countryOther");
      }

      if (String(values.country ?? "") === "USA") {
        requireField("stateProvince");
      }
    }

    if (currentStep === 2) {
      requireField("professionalTitle");
      requireField("yearsExperience");
    }

    if (currentStep === 3) {
      requireField("licenseCertification");
    }

    if (currentStep >= BLOCK_B_START && currentStep < MOTIVATION_STEP) {
      const nomIndex = currentStep - BLOCK_B_START;
      const nom = selectedNominations[nomIndex];
      if (nom) {
        const nomErrors = validateNominationBlockB(
          nom.category.slug,
          blockBValues[nom.award.id] ?? {},
        );
        setBlockBErrors((current) => ({
          ...current,
          [nom.award.id]: nomErrors,
        }));
        if (Object.keys(nomErrors).length > 0) {
          nextErrors._blockB =
            "Please complete all required fields for this nomination.";
        }
      }
    }

    return nextErrors;
  }

  function advance() {
    const nextErrors = validateStep(step);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const nextStep = Math.min(step + 1, CONFIRM_STEP);

    setErrors({});
    setMaxUnlockedStep((current) => Math.max(current, nextStep));
    setStepDirection(1);
    setStep(nextStep);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function back() {
    setStepDirection(-1);
    setStep((current) => Math.max(current - 1, 0));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleStepChange(targetStep: number) {
    if (targetStep === step) {
      return;
    }

    if (targetStep <= maxUnlockedStep) {
      setErrors({});
      setStepDirection(targetStep > step ? 1 : -1);
      setStep(targetStep);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (targetStep === step + 1) {
      const nextErrors = validateStep(step);
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return;
      }

      setErrors({});
      setMaxUnlockedStep((current) => Math.max(current, targetStep));
      setStepDirection(1);
      setStep(targetStep);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    // Enter key in any field triggers this — only actually submit on the final step
    if (step < CONFIRM_STEP) {
      advance();
      return;
    }

    // Block submission if cert is invalid or still verifying
    if (isIbpaMember && certStatus === "invalid") {
      setSubmissionState({ type: "error", message: copy.certInvalidError });
      return;
    }
    if (isIbpaMember && certStatus === "checking") {
      setSubmissionState({ type: "error", message: copy.certCheckingError });
      return;
    }

    const validation = validateApplicationValues({
      values,
      blockBValuesByNomination: blockBValues,
      categories,
    });

    if (!validation.success) {
      setErrors(validation.errors);
      setBlockBErrors(validation.blockBErrors);
      setSubmissionState({ type: "error", message: copy.errorValidation });
      return;
    }

    setErrors({});
    setBlockBErrors({});
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Block A values
      for (const [key, rawValue] of Object.entries(values)) {
        if (!rawValue) {
          continue;
        }

        if (Array.isArray(rawValue)) {
          for (const item of rawValue) {
            formData.append(key, item);
          }
          continue;
        }

        formData.append(key, String(rawValue));
      }

      // Per-nomination Block B values (encoded as __nom__<awardId>__<fieldKey>)
      for (const [awardId, nomValues] of Object.entries(blockBValues)) {
        for (const [fieldKey, rawValue] of Object.entries(nomValues)) {
          if (!rawValue) continue;
          const formKey = `${NOM_FORM_PREFIX}${awardId}__${fieldKey}`;
          if (Array.isArray(rawValue)) {
            for (const item of rawValue) {
              formData.append(formKey, item);
            }
          } else {
            formData.append(formKey, String(rawValue));
          }
        }
      }

      // Membership — only send "true" if cert was verified
      formData.append("isIbpaMember", String(effectivelyMember));
      if (effectivelyMember && ibpaMemberNumber.trim()) {
        formData.append("ibpaMemberNumber", ibpaMemberNumber.trim());
      }

      const response = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        checkoutUrl?: string;
        fieldErrors?: ValidationErrors;
        blockBErrors?: Record<string, ValidationErrors>;
      };

      if (!response.ok) {
        setErrors(data.fieldErrors ?? {});
        if (data.blockBErrors) {
          setBlockBErrors(data.blockBErrors);
        }
        setSubmissionState({
          type: "error",
          message: data.message ?? copy.submitError,
        });
        return;
      }

      setSubmissionState({
        type: "success",
        message: data.message ?? copy.redirecting,
      });

      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      }
    } catch {
      setSubmissionState({
        type: "error",
        message: copy.submitException,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderCategoryCard(category: CategoryOption) {
    const localizedCategory = localizedCategoryBySlug.get(category.slug);
    const isOpen = openCategoryId === category.id;
    const selectedCount = category.awards.filter((award) =>
      selectedAwardIds.includes(award.id),
    ).length;
    const Icon = categoryIconBySlug[category.slug] ?? Award;

    return (
      <motion.article
        key={category.id}
        transition={categoryCardTransition}
        whileHover={{ y: -1 }}
        className={`premium-glass ${
          isOpen ? "border-[var(--color-blue)]" : "border-[var(--border-soft)]"
        }`}
      >
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() =>
            setOpenCategoryId((current) =>
              current === category.id ? null : category.id,
            )
          }
          className="flex w-full items-start gap-4 p-5 text-left"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-[var(--color-blue-soft)] bg-[var(--color-blue-wash)] text-[var(--color-ink)]">
            <Icon size={18} strokeWidth={1.6} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block font-[var(--font-display)] text-[1.35rem] leading-[1.05] text-[var(--color-ink)]">
              {localizedCategory?.title ?? category.name}
            </span>
            <span className="mt-2 block text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-soft)]">
              {String(category.awards.length).padStart(2, "0")}{" "}
              {t.categoriesPage.copy.nominationPlural}
            </span>
          </span>

          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition-all ${
              selectedCount > 0
                ? "border-[var(--color-blue)] bg-[var(--color-blue-wash)] text-[var(--color-ink)]"
                : "border-[var(--border-soft)] bg-[var(--surface-tint)] text-[var(--color-ink-soft)]"
            }`}
          >
            {selectedCount}
          </span>
        </button>

        {isOpen ? (
          <div className="overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={categoryCardTransition}
            >
              <div className="border-t border-[var(--border-soft)] px-5 pb-5 pt-4">
                <div className="space-y-2">
                  {category.awards.map((award, index) => {
                    const selected = selectedAwardIds.includes(award.id);
                    const locked =
                      !selected &&
                      selectedAwardIds.length >= MAX_SELECTED_NOMINATIONS;

                    return (
                      <button
                        key={award.id}
                        type="button"
                        disabled={locked}
                        onClick={() => handleNominationToggle(award.id)}
                        className={`flex w-full items-start gap-3 rounded-[20px] border px-4 py-3 text-left transition-all duration-300 ${
                          selected
                            ? "border-[var(--color-blue)] bg-[var(--color-blue-wash)] text-[var(--color-ink)] shadow-[0_18px_36px_rgba(114,160,193,0.16)]"
                            : locked
                              ? "cursor-not-allowed border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--color-ink-soft)] opacity-55"
                              : "border-[var(--border-soft)] bg-[var(--surface-tint)] text-[var(--color-ink)] hover:border-[var(--color-blue)] hover:bg-white"
                        }`}
                      >
                        <span className="min-w-[1.8rem] pt-0.5 text-[0.78rem] font-semibold uppercase tracking-[0.12em]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 text-sm leading-[1.6]">
                          {localizedCategory?.nominations[index] ?? award.name}
                        </span>
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            selected
                              ? "border-[var(--color-blue)] bg-white text-[var(--color-blue)]"
                              : "border-[var(--border-soft)] bg-[var(--surface-tint)]"
                          }`}
                        >
                          {selected ? <Check size={13} /> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </motion.article>
    );
  }

  // Build dynamic step list — one Block B step per selected nomination
  const nomSteps: StepDef[] =
    selectedNominations.length > 0
      ? selectedNominations.map((_, i) => ({
          id: `blockb-${i}`,
          label: `Details ${i + 1}`,
          icon: ClipboardList,
        }))
      : [{ id: "details", label: "Details", icon: ClipboardList }];
  const dynamicSteps: StepDef[] = [
    { id: "category", label: "Category", icon: Layers },
    { id: "contact", label: "Contact", icon: User },
    { id: "profile", label: "Profile", icon: BadgeCheck },
    { id: "credentials", label: "Credentials", icon: FileCheck },
    ...nomSteps,
    { id: "motivation", label: "Motivation", icon: Award },
    { id: "confirm", label: "Confirm", icon: Send },
  ];

  const currentBlockBNom =
    step >= BLOCK_B_START && step < MOTIVATION_STEP
      ? (selectedNominations[step - BLOCK_B_START] ?? null)
      : null;

  const blockBNomIndex = currentBlockBNom ? step - BLOCK_B_START : -1;
  const currentStepInfo: { title: string; desc: string } = currentBlockBNom
    ? {
        title: currentBlockBNom.nominationTitle,
        desc: `Nomination ${blockBNomIndex + 1} of ${selectedNominations.length} · ${currentBlockBNom.categoryTitle}`,
      }
    : step === MOTIVATION_STEP
      ? copy.steps[5]!
      : step >= CONFIRM_STEP
        ? copy.steps[6]!
        : (copy.steps[step] ?? copy.steps[4]!);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 pb-12">
      <StepBar
        steps={dynamicSteps}
        current={step}
        maxUnlockedStep={maxUnlockedStep}
        onStepChange={handleStepChange}
      />

      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-100 bg-[#F1F3F5] p-5 shadow-xl sm:rounded-[32px] sm:p-8 md:rounded-[40px] md:p-10 xl:p-14">
        <div className="mb-10">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[var(--color-ink-soft)]">
            {dynamicSteps[step]?.label} - {step + 1} / {dynamicSteps.length}
          </p>
          <h2 className="mt-2 font-[var(--font-title-family)] text-[clamp(1.8rem,3.5vw,2.6rem)] font-light leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)]">
            {currentStepInfo.title}
          </h2>
          {currentStepInfo.desc ? (
            <p className="mt-3 max-w-3xl text-[1rem] italic leading-[1.7] text-[var(--color-ink-soft)]">
              {currentStepInfo.desc}
            </p>
          ) : null}
        </div>

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
              {step === 0 ? (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.9fr)]">
                  <div>
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-soft)]">
                        {copy.selectUpTo}
                      </p>
                      <span className="rounded-full border border-[var(--color-blue-soft)] bg-white px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)]">
                        {selectedAwardIds.length} / {MAX_SELECTED_NOMINATIONS}
                      </span>
                    </div>

                    {errors.selectedAwardIds ? (
                      <div className="mb-5 rounded-[20px] border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700">
                        {errors.selectedAwardIds}
                      </div>
                    ) : null}

                    <div className="space-y-4 md:hidden">
                      {categories.map(renderCategoryCard)}
                    </div>

                    <div className="hidden gap-4 md:grid md:grid-cols-2">
                      <div className="flex flex-col gap-4">
                        {leftCategories.map(renderCategoryCard)}
                      </div>
                      <div className="flex flex-col gap-4">
                        {rightCategories.map(renderCategoryCard)}
                      </div>
                    </div>
                  </div>

                  <aside className="premium-glass h-fit p-5 xl:sticky xl:top-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-soft)]">
                          {copy.selectedTitle}
                        </p>
                        <p className="mt-2 text-[1.5rem] font-semibold uppercase tracking-[0.02em] text-[var(--color-ink)]">
                          {selectedAwardIds.length}
                        </p>
                      </div>

                      <span className="rounded-full border border-[var(--color-blue-soft)] bg-[var(--color-blue-wash)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
                        {MAX_SELECTED_NOMINATIONS} max
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      {selectedNominations.length === 0 ? (
                        <div className="rounded-[24px] border border-dashed border-[var(--color-blue-soft)] bg-[var(--surface-tint)] px-4 py-6 text-center">
                          <p className="text-sm font-medium text-[var(--color-ink)]">
                            {copy.selectedEmpty}
                          </p>
                        </div>
                      ) : (
                        selectedNominations.map((item) => {
                          return (
                            <div
                              key={item.award.id}
                              className="rounded-[24px] border border-[var(--border-soft)] bg-white/72 px-4 py-4 text-[var(--color-ink)] transition-all duration-300"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
                                    {item.categoryTitle}
                                  </p>
                                  <p className="mt-2 text-sm leading-[1.6]">
                                    {item.nominationTitle}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSelectedNominationRemove(
                                      item.award.id,
                                    )
                                  }
                                  aria-label={`${copy.remove} ${item.nominationTitle}`}
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-soft)] bg-white transition hover:border-[var(--color-blue)]"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* IBPA Membership + Pricing */}
                    <div className="mt-5 space-y-5 border-t border-[var(--border-soft)] pt-5">
                      {/* Membership toggle */}
                      <div>
                        <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[var(--color-ink-soft)]">
                          {copy.ibpaMembership}
                        </p>
                        <label
                          className={`group relative flex cursor-pointer items-start gap-4 overflow-hidden rounded-[1.5rem] border p-4 transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            isIbpaMember
                              ? "border-[var(--color-blue)]/45 bg-[linear-gradient(135deg,rgba(185,217,235,0.48),rgba(255,255,255,0.92))] shadow-[0_18px_44px_rgba(114,160,193,0.18)]"
                              : "border-white/70 bg-white/72 shadow-[0_14px_36px_rgba(42,66,82,0.06)] hover:-translate-y-px hover:border-[var(--color-blue)]/35 hover:bg-white hover:shadow-[0_18px_44px_rgba(114,160,193,0.13)]"
                          }`}
                        >
                          <span className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[var(--color-blue-wash)] opacity-0 blur-xl transition-opacity duration-200 group-hover:opacity-80" />
                          <input
                            type="checkbox"
                            checked={isIbpaMember}
                            onChange={(e) => {
                              setIsIbpaMember(e.target.checked);
                              if (!e.target.checked) {
                                setIbpaMemberNumber("");
                                setCertStatus("idle");
                              }
                            }}
                            className="sr-only"
                          />

                          <span
                            className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition duration-200 ${
                              isIbpaMember
                                ? "scale-105 border-[var(--color-blue)] bg-[var(--color-blue)] text-white shadow-[0_0_0_5px_rgba(185,217,235,0.55)]"
                                : "border-[var(--color-blue)]/20 bg-white text-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] group-hover:scale-105 group-hover:border-[var(--color-blue)]/55 group-hover:bg-[var(--color-blue-wash)] group-hover:text-[var(--color-blue)]"
                            }`}
                          >
                            <Check size={14} strokeWidth={2.4} />
                          </span>

                          <span className="relative z-10 flex flex-col gap-1">
                            <span className="text-[0.9rem] font-semibold text-[var(--color-ink)]">
                              {copy.ibpaMemberLabel}
                            </span>
                            <span className="text-[0.72rem] leading-[1.55] text-[var(--color-ink-soft)]">
                              {copy.ibpaMemberSub}
                            </span>
                          </span>
                        </label>

                        <AnimatePresence initial={false}>
                          {isIbpaMember && (
                            <motion.div
                              key="cert-input"
                              initial={{ opacity: 0, height: 0, y: -4 }}
                              animate={{ opacity: 1, height: "auto", y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -4 }}
                              transition={{
                                duration: 0.24,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3">
                                <p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
                                  {copy.ibpaCertNumber}
                                </p>
                                <input
                                  type="text"
                                  value={ibpaMemberNumber}
                                  onChange={(e) =>
                                    setIbpaMemberNumber(e.target.value)
                                  }
                                  placeholder="CERT-20240124-A00A"
                                  className={`w-full rounded-[14px] border bg-white px-3 py-2.5 text-[0.85rem] text-[var(--color-ink)] placeholder-[var(--color-ink-soft)] outline-none transition focus:ring-2 ${
                                    certStatus === "valid"
                                      ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100"
                                      : certStatus === "invalid"
                                        ? "border-red-300 bg-red-50/40 focus:ring-red-100"
                                        : "border-[var(--border-soft)] focus:border-[var(--color-blue)] focus:ring-[var(--color-blue-soft)]/50"
                                  }`}
                                />
                                <CertStatusBadge status={certStatus} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Entry fee */}
                      <div className="border-t border-[var(--border-soft)] pt-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[var(--color-ink-soft)]">
                            {copy.entryFee}
                          </p>
                          {effectivelyMember ? (
                            <span className="flex items-center gap-1 rounded-full border border-[var(--color-ink)]/15 bg-[var(--surface-tint)] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink)]">
                              <ShieldCheck size={9} strokeWidth={2} />
                              {copy.memberRate}
                            </span>
                          ) : null}
                        </div>

                        {displayPrice !== null ? (
                          <div>
                            <div className="flex items-baseline gap-2">
                              <p className="text-[1.5rem] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
                                ${displayPrice}
                              </p>
                              {savings > 0 && (
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                                  {copy.savings} ${savings}
                                </span>
                              )}
                            </div>
                            {selectedAwardIds.length === 5 && (
                              <p className="mt-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                                {copy.grandPrixEligible}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[0.8rem] italic text-[var(--color-ink-soft)]">
                            {copy.selectForPricing}
                          </p>
                        )}
                      </div>
                    </div>
                  </aside>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <TextField
                    label={copy.firstName}
                    name="firstName"
                    value={String(values.firstName ?? "")}
                    required
                    placeholder="As shown on official documents"
                    error={errors.firstName}
                    onChange={handleChange}
                  />
                  <TextField
                    label={copy.lastName}
                    name="lastName"
                    value={String(values.lastName ?? "")}
                    required
                    placeholder="As shown on official documents"
                    error={errors.lastName}
                    onChange={handleChange}
                  />
                  <TextField
                    label={copy.email}
                    name="email"
                    type="email"
                    value={String(values.email ?? "")}
                    required
                    placeholder="name@example.com"
                    error={errors.email}
                    onChange={handleChange}
                  />
                  <TextField
                    label={copy.phone}
                    name="phone"
                    type="tel"
                    value={String(values.phone ?? "")}
                    required
                    placeholder="+1 (555) 123-4567"
                    error={errors.phone}
                    onChange={handleChange}
                  />
                  <SelectField
                    label={copy.country}
                    name="country"
                    value={String(values.country ?? "")}
                    required
                    placeholder={copy.selectCountry}
                    options={countryOptions}
                    error={errors.country}
                    onChange={handleChange}
                  />
                  {String(values.country ?? "") === "Other" ? (
                    <TextField
                      label={copy.countryOther}
                      name="countryOther"
                      value={String(values.countryOther ?? "")}
                      required
                      placeholder="Enter your country"
                      error={errors.countryOther}
                      onChange={handleChange}
                    />
                  ) : null}
                  {String(values.country ?? "") === "USA" ? (
                    <TextField
                      label={copy.stateProvince}
                      name="stateProvince"
                      value={String(values.stateProvince ?? "")}
                      required
                      placeholder="California"
                      error={errors.stateProvince}
                      onChange={handleChange}
                    />
                  ) : null}
                  <TextField
                    label={copy.city}
                    name="city"
                    value={String(values.city ?? "")}
                    required
                    placeholder="Los Angeles"
                    error={errors.city}
                    onChange={handleChange}
                  />
                </div>
              ) : null}

              {step === 2 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <TextField
                    label={copy.professionalTitle}
                    name="professionalTitle"
                    value={String(values.professionalTitle ?? "")}
                    required
                    placeholder={copy.professionalTitlePh}
                    error={errors.professionalTitle}
                    onChange={handleChange}
                  />
                  <TextField
                    label={copy.yearsExperience}
                    name="yearsExperience"
                    type="number"
                    min={2}
                    value={String(values.yearsExperience ?? "")}
                    required
                    placeholder="2"
                    description={copy.yearsExperienceHint}
                    error={errors.yearsExperience}
                    onChange={handleChange}
                  />
                </div>
              ) : null}

              {step === 3 ? (
                <UploadField
                  label={copy.licenseCertification}
                  name="licenseCertification"
                  files={
                    Array.isArray(values.licenseCertification)
                      ? values.licenseCertification.filter(
                          (file): file is File => file instanceof File,
                        )
                      : []
                  }
                  required
                  multiple={false}
                  accept={["image/jpeg", "image/png", "application/pdf"]}
                  description={copy.licenseCertificationHint}
                  error={errors.licenseCertification}
                  onChange={handleFilesChange}
                />
              ) : null}

              {step >= BLOCK_B_START && step < MOTIVATION_STEP ? (
                <div className="space-y-5">
                  {errors._blockB ? (
                    <div className="rounded-[20px] border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700">
                      {errors._blockB}
                    </div>
                  ) : null}
                  {currentBlockBNom ? (
                    <BlockBRenderer
                      fields={
                        categoryFieldConfigs[currentBlockBNom.category.slug] ??
                        []
                      }
                      values={blockBValues[currentBlockBNom.award.id] ?? {}}
                      errors={blockBErrors[currentBlockBNom.award.id] ?? {}}
                      onChange={(name, value) =>
                        handleBlockBChange(
                          currentBlockBNom.award.id,
                          name,
                          value,
                        )
                      }
                      onFilesChange={(name, files) =>
                        handleBlockBFilesChange(
                          currentBlockBNom.award.id,
                          name,
                          files,
                        )
                      }
                    />
                  ) : (
                    <BlockBRenderer
                      fields={[]}
                      values={{}}
                      errors={{}}
                      onChange={() => undefined}
                      onFilesChange={() => undefined}
                    />
                  )}
                </div>
              ) : null}

              {step === MOTIVATION_STEP ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <TextField
                    label={copy.website}
                    name="websiteUrl"
                    type="url"
                    value={String(values.websiteUrl ?? "")}
                    placeholder="https://"
                    error={errors.websiteUrl}
                    onChange={handleChange}
                  />
                  <TextField
                    label={copy.social}
                    name="socialUrl"
                    type="url"
                    value={String(values.socialUrl ?? "")}
                    placeholder="https://instagram.com/yourprofile"
                    error={errors.socialUrl}
                    onChange={handleChange}
                  />
                  <TextField
                    label={copy.reviews}
                    name="reviewsUrl"
                    type="url"
                    value={String(values.reviewsUrl ?? "")}
                    placeholder="https://"
                    error={errors.reviewsUrl}
                    onChange={handleChange}
                  />
                  <SelectField
                    label={copy.heardAbout}
                    name="heardAbout"
                    value={String(values.heardAbout ?? "")}
                    placeholder={copy.selectOption}
                    options={heardAboutOptions.map((option) => ({
                      ...option,
                      label:
                        copy.heardAboutLabels[
                          option.value as keyof typeof copy.heardAboutLabels
                        ] ?? option.label,
                    }))}
                    error={errors.heardAbout}
                    onChange={handleChange}
                  />
                  {String(values.heardAbout ?? "") === "other" ? (
                    <TextField
                      label={copy.heardAboutOther}
                      name="heardAboutOther"
                      value={String(values.heardAboutOther ?? "")}
                      placeholder="Tell us the source"
                      error={errors.heardAboutOther}
                      onChange={handleChange}
                    />
                  ) : null}
                </div>
              ) : null}

              {step === CONFIRM_STEP ? (
                <div className="space-y-5">
                  <div className="premium-glass rounded-[28px] bg-white/86 p-6">
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[var(--color-ink-soft)]">
                      {copy.confirmTitle}
                    </p>
                    <p className="mt-3 text-[0.92rem] leading-[1.75] text-[var(--color-ink-soft)]">
                      {copy.confirmNote}
                    </p>
                    <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                      {[
                        {
                          label: "Name",
                          value:
                            `${values.firstName ?? ""} ${values.lastName ?? ""}`.trim(),
                        },
                        { label: "Email", value: String(values.email ?? "") },
                        {
                          label: "Country",
                          value: String(values.country ?? ""),
                        },
                        {
                          label: copy.nominationCount,
                          value: `${selectedAwardIds.length}`,
                        },
                        {
                          label: copy.ibpaMembership,
                          value: effectivelyMember
                            ? copy.ibpaMemberLabel
                            : copy.standardRate,
                        },
                        {
                          label: copy.entryFee,
                          value:
                            displayPrice !== null ? `$${displayPrice}` : "—",
                        },
                      ].map((row) => (
                        <div key={row.label}>
                          <dt className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--color-ink)]/40">
                            {row.label}
                          </dt>
                          <dd className="mt-1 text-[0.95rem] font-semibold text-[var(--color-ink)]">
                            {row.value || "-"}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-6 grid gap-3">
                      {selectedNominations.map((item) => (
                        <div
                          key={item.award.id}
                          className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--surface-tint)] px-4 py-3 text-[var(--color-ink)]"
                        >
                          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
                            {item.categoryTitle}
                          </p>
                          <p className="mt-2 text-sm leading-[1.6]">
                            {item.nominationTitle}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {submissionState.message ? (
                    <div
                      className={`rounded-[18px] border px-5 py-4 text-sm ${submissionState.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`}
                      aria-live="polite"
                    >
                      {submissionState.message}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-[var(--border-soft)] pt-8">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-6 py-3 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)] shadow-[0_12px_24px_rgba(3,2,19,0.04)] transition-all duration-300 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft size={14} /> {copy.back}
          </button>

          {step < CONFIRM_STEP ? (
            <button
              type="button"
              onClick={advance}
              className={HERO_PRIMARY_BUTTON_CLASS}
            >
              <HeroPrimaryButtonLayers />
              <span className="relative z-10">{copy.continue}</span>
              <ChevronRight
                size={16}
                className="relative z-10 text-[#b9d9eb] transition duration-200 group-hover:translate-x-0.5 group-hover:text-white"
              />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={HERO_PRIMARY_BUTTON_CLASS}
            >
              <HeroPrimaryButtonLayers />
              <span className="relative z-10">
                {isSubmitting ? copy.submitting : copy.submit}
              </span>
              <ChevronRight
                size={16}
                className="relative z-10 text-[#b9d9eb] transition duration-200 group-hover:translate-x-0.5 group-hover:text-white"
              />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
