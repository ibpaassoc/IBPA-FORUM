import type { MailingRecipientGroup } from "@/features/admin/lib/mailing";

/** The slice of a recipient the picker filters on (keeps this module client-safe). */
export type FilterableRecipient = {
  group: MailingRecipientGroup;
  fullName: string;
  email: string;
  registrationState: { key: string } | null;
  completionPercentage: number | null;
  ticket: {
    source: "ADMIN" | "PAID";
    type: "ONE_DAY" | "TWO_DAYS" | null;
    galaOnly: boolean;
  } | null;
};

export type MailingFilters = {
  search: string;
  /** Registration state (applicants/jury) or ticket source (tickets). */
  primary: string;
  /** Completion (applicants) or ticket access type (tickets). */
  secondary: string;
};

export const DEFAULT_MAILING_FILTERS: MailingFilters = {
  search: "",
  primary: "all",
  secondary: "all",
};

export type FilterOption = { value: string; label: string };

export type GroupFilterConfig = {
  primary: { label: string; options: FilterOption[] } | null;
  secondary: { label: string; options: FilterOption[] } | null;
};

const REGISTRATION_FILTER = {
  label: "Регистрация",
  options: [
    { value: "all", label: "Все статусы" },
    { value: "registered", label: "Зарегистрирован" },
    { value: "not-registered", label: "Не зарегистрирован" },
  ],
};

export const GROUP_FILTERS: Record<MailingRecipientGroup, GroupFilterConfig> = {
  APPLICANT: {
    primary: REGISTRATION_FILTER,
    secondary: {
      label: "Заполнение",
      options: [
        { value: "all", label: "Любое" },
        { value: "incomplete", label: "Не завершено" },
        { value: "complete", label: "Заполнено на 100%" },
      ],
    },
  },
  JURY: { primary: REGISTRATION_FILTER, secondary: null },
  TICKET: {
    primary: {
      label: "Источник",
      options: [
        { value: "all", label: "Все билеты" },
        { value: "PAID", label: "Оплаченные" },
        { value: "ADMIN", label: "Выданные админом" },
      ],
    },
    secondary: {
      label: "Доступ",
      options: [
        { value: "all", label: "Любой" },
        { value: "ONE_DAY", label: "1 день" },
        { value: "TWO_DAYS", label: "2 дня" },
        { value: "GALA", label: "Только Gala" },
      ],
    },
  },
};

export function recipientMatches(
  recipient: FilterableRecipient,
  filters: MailingFilters,
) {
  const query = filters.search.trim().toLocaleLowerCase("ru-RU");
  if (
    query &&
    !recipient.fullName.toLocaleLowerCase("ru-RU").includes(query) &&
    !recipient.email.toLocaleLowerCase("ru-RU").includes(query)
  ) {
    return false;
  }

  if (recipient.group === "TICKET") {
    const ticket = recipient.ticket;
    if (filters.primary !== "all" && ticket?.source !== filters.primary) return false;
    if (filters.secondary === "GALA") return Boolean(ticket?.galaOnly);
    if (filters.secondary !== "all") {
      return !ticket?.galaOnly && ticket?.type === filters.secondary;
    }
    return true;
  }

  if (
    filters.primary !== "all" &&
    recipient.registrationState?.key !== filters.primary
  ) {
    return false;
  }

  if (recipient.group === "APPLICANT" && filters.secondary !== "all") {
    const isComplete = (recipient.completionPercentage ?? 0) >= 100;
    return filters.secondary === "complete" ? isComplete : !isComplete;
  }

  return true;
}
