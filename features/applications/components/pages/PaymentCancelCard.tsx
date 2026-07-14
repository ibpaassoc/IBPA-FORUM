"use client";

import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { IconBadge, PageHero, PageSection } from "@/shared/components/public";

export default function PaymentCancelCard() {
  const { language } = useLanguage();
  const copy = {
    en: {
      eyebrow: "Payment Canceled",
      title: "Checkout was canceled",
      description:
        "No nomination was purchased, and no applicant account or nomination record was created from this canceled checkout.",
      nextStep: "Next Step",
      body:
        "Return to the application purchase flow to choose nominations again, or sign in if you already have an applicant account.",
      back: "Back to Apply",
      login: "Applicant Login",
    },
    ru: {
      eyebrow: "Оплата отменена",
      title: "Оплата была отменена",
      description:
        "Номинация не была куплена, а аккаунт участника и записи номинаций не создавались из этой отмененной оплаты.",
      nextStep: "Следующий шаг",
      body:
        "Вернитесь к покупке номинаций или войдите в аккаунт, если он у вас уже есть.",
      back: "Вернуться к заявке",
      login: "Вход участника",
    },
    ua: {
      eyebrow: "Оплату скасовано",
      title: "Оплату було скасовано",
      description:
        "Номінацію не було придбано, а акаунт учасника та записи номінацій не створювалися з цієї скасованої оплати.",
      nextStep: "Наступний крок",
      body:
        "Поверніться до купівлі номінацій або увійдіть в акаунт, якщо він у вас уже є.",
      back: "Повернутися до заявки",
      login: "Вхід учасника",
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
        <div className="premium-glass mx-auto flex max-w-3xl flex-col items-center p-8 text-center">
          <IconBadge icon={RefreshCcw} size={28} />
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-hover-accent)]">
            {copy.nextStep}
          </p>
          <p className="mt-5 text-base leading-8 text-[var(--color-ink-soft)]">
            {copy.body}
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/apply" className="ibpa-button ibpa-button-primary">
              {copy.back}
            </Link>
            <Link href="/account/login" className="ibpa-button ibpa-button-ghost">
              {copy.login}
            </Link>
          </div>
        </div>
      </PageSection>
    </main>
  );
}
