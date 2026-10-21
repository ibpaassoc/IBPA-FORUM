import { Ticket, UserRoundCheck, Users } from "lucide-react";
import type { MailingRecipientGroup } from "@/features/admin/lib/mailing";

export type RecipientSendState = {
  state: "sent" | "failed" | "skipped" | "duplicate";
  reason?: string;
};

export type RecipientSendStatuses = Record<string, RecipientSendState>;

export const GROUP_META: Record<
  MailingRecipientGroup,
  {
    label: string;
    singular: string;
    description: string;
    icon: typeof Users;
    avatarClass: string;
    emptyText: string;
  }
> = {
  APPLICANT: {
    label: "Заявители",
    singular: "заявитель",
    description: "Средний процент заполнения по всем активным номинациям.",
    icon: UserRoundCheck,
    avatarClass: "bg-[var(--color-blue-wash)] text-[var(--color-blue)]",
    emptyText: "Заявители по заданным условиям не найдены.",
  },
  JURY: {
    label: "Жюри",
    singular: "жюри",
    description: "Только члены жюри с одобренными заявками.",
    icon: Users,
    avatarClass: "bg-violet-50 text-violet-600",
    emptyText: "Члены жюри по заданным условиям не найдены.",
  },
  TICKET: {
    label: "Билеты",
    singular: "билет",
    description: "Оплаченные и выданные администратором билеты форума.",
    icon: Ticket,
    avatarClass: "bg-emerald-50 text-emerald-700",
    emptyText: "Билеты по заданным условиям не найдены.",
  },
};

export const GROUP_ORDER: MailingRecipientGroup[] = ["APPLICANT", "JURY", "TICKET"];

export function recipientInitials(fullName: string) {
  const letters = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("ru-RU") ?? "");
  return letters.join("") || "?";
}
