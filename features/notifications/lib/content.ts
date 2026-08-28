import { z } from "zod";
import type { Language } from "@/lib/i18n/translations";

const localizedCopySchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  description: z.string(),
  actionLabel: z.string().min(1),
  consentLabel: z.string().min(1).optional(),
});

const copySchema = z.object({
  en: localizedCopySchema,
  ru: localizedCopySchema,
  ua: localizedCopySchema,
});

const baseSchema = z.object({
  schemaVersion: z.literal(1),
  copy: copySchema,
});

export const juryGalaNotificationContentSchema = baseSchema.extend({
  kind: z.literal("JURY_GALA"),
  state: z.object({
    status: z.enum(["PENDING", "ACCEPTED"]),
    acceptedAt: z.string().datetime().nullable(),
    ticketId: z.string().nullable(),
    emailDelivery: z.enum(["NOT_SENT", "SENT", "FAILED"]),
    emailError: z.string().nullable(),
  }),
});

export const specialOfferNotificationContentSchema = baseSchema.extend({
  kind: z.literal("SPECIAL_OFFER_2_DAYS"),
  state: z.object({
    status: z.enum(["AVAILABLE", "CHECKOUT_CREATED", "PURCHASED"]),
    checkoutCreatedAt: z.string().datetime().nullable(),
    purchasedAt: z.string().datetime().nullable(),
    ticketId: z.string().nullable(),
    paymentId: z.string().nullable(),
  }),
});

const manualActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("LINK"),
    url: z.string().min(1),
  }),
  z.object({ type: z.literal("TICKET_MODAL") }),
]);

export const manualNotificationContentSchema = baseSchema.extend({
  kind: z.literal("MANUAL"),
  action: manualActionSchema,
  templateId: z.enum(["FORUM_INVITE", "GALA_INFO"]).optional(),
});

export const notificationContentSchema = z.discriminatedUnion("kind", [
  juryGalaNotificationContentSchema,
  specialOfferNotificationContentSchema,
  manualNotificationContentSchema,
]);

export type NotificationContent = z.infer<typeof notificationContentSchema>;
export type NotificationKind = NotificationContent["kind"];
export type LocalizedNotificationCopy = z.infer<typeof localizedCopySchema>;
export type AccountNotificationView = {
  id: string;
  accountId: string;
  type: "JURY" | "APPLICANT";
  name: string;
  email: string;
  content: NotificationContent;
  isViewed: boolean;
  dateCreated: Date | string;
  dateViewed: Date | string | null;
};

export function parseNotificationContent(value: unknown) {
  return notificationContentSchema.parse(value);
}

export function notificationCopy(content: NotificationContent, language: Language) {
  return content.copy[language] ?? content.copy.en;
}

export const JURY_GALA_CONTENT: NotificationContent = {
  schemaVersion: 1,
  kind: "JURY_GALA",
  copy: {
    en: {
      title: "Your complimentary Gala Dinner invitation",
      summary: "Active judges can claim one complimentary Gala Dinner ticket.",
      description:
        "Confirm that you would like to attend. We will issue a dedicated Gala Dinner QR code by email. This credential does not include Forum day access.",
      actionLabel: "Claim gala ticket",
      consentLabel: "Yes, I would like my complimentary Gala Dinner ticket.",
    },
    ru: {
      title: "Ваше приглашение на гала-ужин",
      summary: "Активные судьи могут получить один бесплатный билет на гала-ужин.",
      description:
        "Подтвердите участие. Мы отправим отдельный QR-код для гала-ужина по email. Этот пропуск не даёт доступ к дням форума.",
      actionLabel: "Получить билет",
      consentLabel: "Да, я хочу получить бесплатный билет на гала-ужин.",
    },
    ua: {
      title: "Ваше запрошення на гала-вечерю",
      summary: "Активні судді можуть отримати один безкоштовний квиток на гала-вечерю.",
      description:
        "Підтвердьте участь. Ми надішлемо окремий QR-код для гала-вечері на email. Ця перепустка не надає доступу до днів форуму.",
      actionLabel: "Отримати квиток",
      consentLabel: "Так, я хочу отримати безкоштовний квиток на гала-вечерю.",
    },
  },
  state: {
    status: "PENDING",
    acceptedAt: null,
    ticketId: null,
    emailDelivery: "NOT_SENT",
    emailError: null,
  },
};

export const SPECIAL_OFFER_CONTENT: NotificationContent = {
  schemaVersion: 1,
  kind: "SPECIAL_OFFER_2_DAYS",
  copy: {
    en: {
      title: "A private 2-Day Forum offer",
      summary: "Purchase a 2-Day Forum pass at a special account-only price.",
      description:
        "This private offer includes access to both Forum days and does not include the Gala Dinner. Your new QR code will be issued after payment.",
      actionLabel: "Buy 2-day pass",
    },
    ru: {
      title: "Персональное предложение на 2 дня форума",
      summary: "Купите двухдневный пропуск на форум по специальной цене для аккаунта.",
      description:
        "Предложение включает оба дня форума и не включает гала-ужин. Новый QR-код будет выпущен после оплаты.",
      actionLabel: "Купить пропуск",
    },
    ua: {
      title: "Персональна пропозиція на 2 дні форуму",
      summary: "Придбайте дводенну перепустку на форум за спеціальною ціною для акаунта.",
      description:
        "Пропозиція включає обидва дні форуму та не включає гала-вечерю. Новий QR-код буде випущено після оплати.",
      actionLabel: "Придбати перепустку",
    },
  },
  state: {
    status: "AVAILABLE",
    checkoutCreatedAt: null,
    purchasedAt: null,
    ticketId: null,
    paymentId: null,
  },
};
