"use client";

import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import RetryCheckoutButton from "@/features/applications/components/application-form/RetryCheckoutButton";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { IconBadge, PageHero, PageSection } from "@/shared/components/public";

export default function PaymentCancelCard({
  applicationId,
}: {
  applicationId?: string;
}) {
  const { language } = useLanguage();
  const copy = {
    en: {
      eyebrow: "Payment Canceled",
      title: "Your application is saved, but not complete yet",
      description:
        "Stripe Checkout was canceled before payment finished. Your participant application has not been finalized and will not be reviewed until payment succeeds.",
      nextStep: "Next Step",
      body:
        "You can return to secure Stripe Checkout using the saved application, or go back to the application page if you need to start over.",
      back: "Back to Application Form",
    },
    ru: {
      eyebrow: "Оплата отменена",
      title: "Ваша заявка сохранена, но еще не завершена",
      description:
        "Stripe Checkout был отменен до завершения оплаты. Заявка участника не финализирована и не попадет на рассмотрение, пока оплата не пройдет успешно.",
      nextStep: "Следующий шаг",
      body:
        "Вы можете вернуться к защищенной оплате Stripe Checkout по сохраненной заявке или вернуться к форме, чтобы начать заново.",
      back: "Вернуться к форме заявки",
    },
    ua: {
      eyebrow: "Оплату скасовано",
      title: "Вашу заявку збережено, але її ще не завершено",
      description:
        "Stripe Checkout було скасовано до завершення оплати. Заявку учасника не фіналізовано, і вона не потрапить на розгляд, доки оплата не буде успішною.",
      nextStep: "Наступний крок",
      body:
        "Ви можете повернутися до захищеної оплати Stripe Checkout за збереженою заявкою або повернутися до форми, щоб почати заново.",
      back: "Повернутися до форми заявки",
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
          <IconBadge icon={RefreshCcw} size={28} />
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-hover-accent)]">
            {copy.nextStep}
          </p>
          <p className="mt-5 text-base leading-8 text-[var(--color-ink-soft)]">
            {copy.body}
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            {applicationId ? <RetryCheckoutButton applicationId={applicationId} /> : null}

            <Link
              href="/apply"
              className="ibpa-button ibpa-button-ghost"
            >
              {copy.back}
            </Link>
          </div>
        </div>
      </PageSection>
    </main>
  );
}
