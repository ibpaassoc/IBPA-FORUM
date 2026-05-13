"use client";

import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { IconBadge, PageHero, PageSection } from "@/shared/components/public";

export default function PaymentSuccessCard({ sessionId }: { sessionId?: string }) {
  const { language } = useLanguage();
  const copy = {
    en: {
      eyebrow: "Payment Return",
      title: "Your payment is being confirmed",
      description:
        "Stripe has returned you to the IBPA application site. Your participant application becomes complete only after our webhook confirms the payment successfully.",
      status: "Participant Application Status",
      completeWithSession:
        "Your Stripe Checkout session completed successfully. We are now waiting for Stripe to deliver the webhook that marks your application as paid and submitted.",
      completeNoSession:
        "If you recently completed payment, please allow a moment for the Stripe webhook to finalize your application.",
      finalNote:
        "Once confirmed, we will email you to confirm that payment was received, your application is complete, and it will be reviewed by the judges and admin team.",
    },
    ru: {
      eyebrow: "Возврат после оплаты",
      title: "Оплата подтверждается",
      description:
        "Stripe вернул вас на сайт заявок IBPA. Заявка участника считается завершенной только после подтверждения оплаты вебхуком.",
      status: "Статус заявки участника",
      completeWithSession:
        "Сессия Stripe Checkout успешно завершена. Сейчас мы ожидаем вебхук Stripe, который отметит вашу заявку как оплаченную и отправленную.",
      completeNoSession:
        "Если вы только что завершили оплату, подождите немного, пока вебхук Stripe завершит обработку заявки.",
      finalNote:
        "После подтверждения мы отправим письмо о получении оплаты, завершении заявки и ее передаче на рассмотрение жюри и администраторов.",
    },
    ua: {
      eyebrow: "Повернення після оплати",
      title: "Оплату підтверджують",
      description:
        "Stripe повернув вас на сайт заявок IBPA. Заявка учасника вважається завершеною лише після підтвердження оплати вебхуком.",
      status: "Статус заявки учасника",
      completeWithSession:
        "Сесію Stripe Checkout успішно завершено. Зараз ми очікуємо вебхук Stripe, який позначить вашу заявку як оплачену та надіслану.",
      completeNoSession:
        "Якщо ви щойно завершили оплату, зачекайте трохи, доки вебхук Stripe завершить обробку заявки.",
      finalNote:
        "Після підтвердження ми надішлемо лист про отримання оплати, завершення заявки та передачу її на розгляд журі й адміністраторів.",
    },
  }[language];

  return (
    <main className="page-shell">
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <PageSection className="pb-20">
        <div className="page-card mx-auto flex max-w-3xl flex-col items-center rounded-(--radius-lg) p-8 text-center">
          <IconBadge icon={CheckCircle2} size={28} />
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-hover)]">
            {copy.status}
          </p>
          <p className="mt-5 text-base leading-8 text-[var(--color-ink-soft)]">
            {sessionId
              ? copy.completeWithSession
              : copy.completeNoSession}
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            {copy.finalNote}
          </p>
        </div>
      </PageSection>
    </main>
  );
}
