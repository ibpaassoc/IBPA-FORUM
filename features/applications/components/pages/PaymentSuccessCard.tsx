"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, Mail, UserRound } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type SuccessSummary = {
  amount: number;
  currency: string;
  status: string;
  fulfilled: boolean;
  paymentReference: string;
  registrationComplete: boolean;
  nominations: Array<{
    id: string;
    categoryName: string;
    awardName: string;
  }>;
} | null;

const copy = {
  en: {
    confirmed: "Payment confirmed",
    processing: "Payment confirmation is processing",
    amount: "Amount paid",
    reference: "Payment reference",
    nominations: "Purchased nominations",
    pendingBody:
      "Stripe confirmed your redirect, and the secure webhook may still be finishing account setup. Refresh this page in a moment if nominations are not listed yet.",
    nextTitle: "Next steps",
    nextNew:
      "A secure registration email is sent after the first successful purchase. Create your password, open the applicant account, complete each nomination, and submit before the deadline. Drafts are not visible to judges.",
    nextExisting:
      "Open your applicant account to complete each purchased nomination. Drafts are not visible to judges, and every nomination must be submitted before applications close.",
    register: "Register applicant account",
    account: "Go to applicant account",
    login: "Applicant login",
  },
  ru: {
    confirmed: "Оплата подтверждена",
    processing: "Подтверждение оплаты обрабатывается",
    amount: "Сумма оплаты",
    reference: "Номер платежа",
    nominations: "Купленные номинации",
    pendingBody:
      "Stripe подтвердил переход, а защищенный webhook может еще завершать настройку аккаунта. Обновите страницу через минуту, если номинации еще не показаны.",
    nextTitle: "Следующие шаги",
    nextNew:
      "После первой успешной оплаты отправляется защищенное письмо для регистрации. Создайте пароль, откройте аккаунт участника, заполните каждую номинацию и отправьте до дедлайна. Черновики не видны жюри.",
    nextExisting:
      "Откройте аккаунт участника, чтобы заполнить каждую купленную номинацию. Черновики не видны жюри, каждую номинацию нужно отправить до закрытия заявок.",
    register: "Зарегистрировать аккаунт",
    account: "Перейти в аккаунт",
    login: "Вход участника",
  },
  ua: {
    confirmed: "Оплату підтверджено",
    processing: "Підтвердження оплати обробляється",
    amount: "Сума оплати",
    reference: "Номер платежу",
    nominations: "Придбані номінації",
    pendingBody:
      "Stripe підтвердив перехід, а захищений webhook може ще завершувати налаштування акаунта. Оновіть сторінку за хвилину, якщо номінації ще не показані.",
    nextTitle: "Наступні кроки",
    nextNew:
      "Після першої успішної оплати надсилається захищений лист для реєстрації. Створіть пароль, відкрийте акаунт учасника, заповніть кожну номінацію та надішліть до дедлайну. Чернетки не видимі журі.",
    nextExisting:
      "Відкрийте акаунт учасника, щоб заповнити кожну придбану номінацію. Чернетки не видимі журі, кожну номінацію потрібно надіслати до закриття заявок.",
    register: "Зареєструвати акаунт",
    account: "Перейти в акаунт",
    login: "Вхід учасника",
  },
} as const;

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export default function PaymentSuccessCard({ summary }: { summary: SuccessSummary }) {
  const { language } = useLanguage();
  const t = copy[language] ?? copy.en;
  const grouped = new Map<string, string[]>();
  for (const nomination of summary?.nominations ?? []) {
    const list = grouped.get(nomination.categoryName) ?? [];
    list.push(nomination.awardName);
    grouped.set(nomination.categoryName, list);
  }

  return (
    <main className="page-shell px-[var(--page-gutter)] pb-20 pt-[calc(var(--site-header-height)+4rem)]">
      <section className="mx-auto max-w-4xl">
        <div className="premium-glass p-6 sm:p-9">
          <div className="flex size-14 items-center justify-center rounded-[22px] bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
            {summary?.fulfilled ? <CheckCircle2 size={26} /> : <Clock3 size={26} />}
          </div>
          <h1 className="mt-5 font-[var(--font-title-family)] text-4xl font-light leading-tight text-[var(--color-ink)] sm:text-5xl">
            {summary?.fulfilled ? t.confirmed : t.processing}
          </h1>
          {!summary?.fulfilled ? (
            <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">{t.pendingBody}</p>
          ) : null}

          {summary ? (
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-[var(--border-default)] bg-white/82 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">{t.amount}</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">{money(summary.amount, summary.currency)}</p>
              </div>
              <div className="rounded-[22px] border border-[var(--border-default)] bg-white/82 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">{t.reference}</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">{summary.paymentReference}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-7 rounded-[24px] border border-[var(--border-default)] bg-white/82 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)]">{t.nominations}</p>
            <div className="mt-4 grid gap-3">
              {Array.from(grouped.entries()).map(([category, awards]) => (
                <div key={category}>
                  <p className="font-semibold text-[var(--color-ink)]">{category}</p>
                  <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{awards.join(", ")}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 rounded-[24px] border border-[var(--border-default)] bg-[var(--color-blue-wash)]/70 p-5">
            <div className="flex items-center gap-2 text-[var(--color-blue)]">
              {summary?.registrationComplete ? <UserRound size={17} /> : <Mail size={17} />}
              <p className="text-xs font-semibold uppercase tracking-[0.14em]">{t.nextTitle}</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
              {summary?.registrationComplete ? t.nextExisting : t.nextNew}
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/account/setup" className="ibpa-button ibpa-button-primary">
              {summary?.registrationComplete ? t.account : t.register}
            </Link>
            <Link href="/account/login" className="ibpa-button ibpa-button-ghost">
              {t.login}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
