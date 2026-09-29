"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChartNoAxesCombined, ChevronDown, Crown, LockKeyhole, MessageSquareText } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { getApplicantScorings } from "@/features/account/server/nomination-scores";
import { criterionCopy, type ScoreLanguage } from "@/features/account/components/scores/criterion-copy";

gsap.registerPlugin(useGSAP);

type Scorings = Awaited<ReturnType<typeof getApplicantScorings>>;
type Language = ScoreLanguage;

const copy = {
  en: {
    eyebrow: "Applicant account", title: "Scorings",
    introduction: "Your nomination results in one place. Open a published result to see every judge’s scores and comments.",
    published: "Published results", awaiting: "Awaiting results",
    publishedDescription: "Final scores and positions for your nominations.",
    awaitingDescription: "Judges’ scores appear here after the results are published.",
    finalScore: "Final score", position: "Position", place: "place", evaluations: "judge evaluations",
    viewFeedback: "View judge scores & feedback", pending: "Scores not released yet",
    judge: "Judge", criteria: "Scores by criterion", comments: "Judge’s comments",
    noComments: "No written comments were provided.", noReviews: "No submitted judge evaluations are available.",
    fullPage: "Open full evaluation page",
    pendingDescription: "Scores and position will appear here when results are published.",
    emptyTitle: "No nominations to score yet", emptyDescription: "Your nominations and their results will appear here.",
    viewNominations: "View my nominations", awaitingScore: "Awaiting score",
  },
  ru: {
    eyebrow: "Аккаунт участника", title: "Оценки",
    introduction: "Результаты всех ваших номинаций в одном месте. Откройте опубликованный результат, чтобы увидеть баллы и комментарии каждого судьи.",
    published: "Опубликованные результаты", awaiting: "Ожидают результатов",
    publishedDescription: "Итоговые баллы и места ваших номинаций.",
    awaitingDescription: "Оценки судей появятся здесь после публикации результатов.",
    finalScore: "Итоговый балл", position: "Место", place: "место", evaluations: "оценок судей",
    viewFeedback: "Посмотреть оценки и отзывы судей", pending: "Оценки ещё не опубликованы",
    judge: "Судья", criteria: "Баллы по критериям", comments: "Комментарий судьи",
    noComments: "Судья не оставил комментарий.", noReviews: "Завершённых оценок судей пока нет.",
    fullPage: "Открыть полную страницу оценок",
    pendingDescription: "Баллы и место появятся здесь после публикации результатов.",
    emptyTitle: "Пока нет номинаций", emptyDescription: "Здесь будут отображаться ваши номинации и их результаты.",
    viewNominations: "Мои номинации", awaitingScore: "Ожидается оценка",
  },
  ua: {
    eyebrow: "Акаунт учасника", title: "Оцінки",
    introduction: "Результати всіх ваших номінацій в одному місці. Відкрийте опублікований результат, щоб побачити бали та коментарі кожного судді.",
    published: "Опубліковані результати", awaiting: "Очікують результатів",
    publishedDescription: "Підсумкові бали та місця ваших номінацій.",
    awaitingDescription: "Оцінки журі з’являться тут після публікації результатів.",
    finalScore: "Підсумковий бал", position: "Місце", place: "місце", evaluations: "оцінок журі",
    viewFeedback: "Переглянути оцінки та відгуки журі", pending: "Оцінки ще не опубліковано",
    judge: "Суддя", criteria: "Бали за критеріями", comments: "Коментар судді",
    noComments: "Суддя не залишив коментар.", noReviews: "Завершених оцінок журі поки немає.",
    fullPage: "Відкрити повну сторінку оцінок",
    pendingDescription: "Бали та місце з’являться тут після публікації результатів.",
    emptyTitle: "Поки немає номінацій", emptyDescription: "Тут відображатимуться ваші номінації та їхні результати.",
    viewNominations: "Мої номінації", awaitingScore: "Очікується оцінка",
  },
} as const;

function formatScore(value: number, language: Language) {
  return new Intl.NumberFormat(language === "ua" ? "uk" : language, {
    minimumFractionDigits: 1, maximumFractionDigits: 1,
  }).format(value);
}

export default function ApplicantScoringsView({ data, language }: { data: Scorings; language: Language }) {
  const root = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const c = copy[language] ?? copy.en;
  const published = data.filter((item) => item.released);
  const awaiting = data.filter((item) => !item.released);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from("[data-scoring-reveal]", {
      opacity: 0, y: 12, duration: 0.42, ease: "power2.out", stagger: 0.055,
      clearProps: "all",
    });
  }, { scope: root });

  return (
    <div ref={root} className="mx-auto w-full max-w-[1180px] pb-8">
      <header data-scoring-reveal>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#356f98]">{c.eyebrow}</p>
        <h1 className="mt-2 font-[var(--font-title-family)] text-[clamp(2.4rem,5vw,3.3rem)] font-light leading-none tracking-[-0.035em] text-[var(--color-ink)]">{c.title}</h1>
        <p className="mt-4 max-w-[650px] text-[0.85rem] leading-7 text-[var(--color-ink-soft)]">{c.introduction}</p>
      </header>

      {data.length === 0 ? (
        <div data-scoring-reveal className="mt-8 rounded-[26px] border border-[rgba(114,160,193,0.2)] bg-white/80 px-6 py-14 text-center shadow-[0_18px_54px_rgba(37,42,45,0.05)]">
          <div className="mx-auto flex size-13 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[#356f98]"><ChartNoAxesCombined aria-hidden size={23} /></div>
          <h2 className="mt-5 font-[var(--font-title-family)] text-[1.8rem] text-[var(--color-ink)]">{c.emptyTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">{c.emptyDescription}</p>
          <Link href="/account/applicant/nominations" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-blue)] px-5 text-sm font-semibold text-white transition hover:bg-[#547f9e] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)]">{c.viewNominations} <ArrowRight aria-hidden size={16} /></Link>
        </div>
      ) : (
        <>
          <div data-scoring-reveal className="mt-8 flex flex-wrap gap-2 border-b border-[rgba(114,160,193,0.19)] pb-4 text-[0.78rem] text-[var(--color-ink-soft)]">
            <span className="rounded-full bg-[var(--color-blue-wash)] px-3 py-1.5"><strong className="text-[#356f98]">{published.length}</strong> {c.published.toLowerCase()}</span>
            {awaiting.length > 0 ? <span className="rounded-full bg-white/85 px-3 py-1.5"><strong className="text-[var(--color-ink)]">{awaiting.length}</strong> {c.awaiting.toLowerCase()}</span> : null}
          </div>

          {published.length > 0 ? (
            <section className="mt-7" aria-labelledby="published-scorings-heading">
              <div data-scoring-reveal>
                <h2 id="published-scorings-heading" className="font-[var(--font-title-family)] text-[clamp(1.5rem,2.5vw,1.9rem)] text-[var(--color-ink)]">{c.published}</h2>
                <p className="mt-1 text-[0.8rem] text-[var(--color-ink-soft)]">{c.publishedDescription}</p>
              </div>
              <div className="mt-4 grid gap-3">
                {published.map((item) => (
                  <article key={item.id} data-scoring-reveal className="overflow-hidden rounded-[23px] border border-[rgba(114,160,193,0.21)] bg-white/83 shadow-[0_12px_38px_rgba(37,42,45,0.045)]">
                    <div className="grid lg:grid-cols-[minmax(0,1fr)_auto]">
                      <div className="min-w-0 p-5 sm:p-6">
                        <p className="text-[0.63rem] font-semibold uppercase tracking-[0.18em] text-[#356f98]">{item.categoryName}</p>
                        <h3 className="mt-2 font-[var(--font-title-family)] text-[clamp(1.3rem,2.2vw,1.75rem)] leading-[1.18] text-[var(--color-ink)]">{item.awardName}</h3>
                        <p className="mt-3 text-[0.76rem] text-[var(--color-ink-soft)]">{t.account.statuses[item.status] ?? item.status.replaceAll("_", " ")} · {item.reviewCount} {c.evaluations}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-6 border-t border-[rgba(114,160,193,0.14)] bg-[linear-gradient(120deg,rgba(242,248,251,0.75),rgba(255,255,255,0.6))] px-5 py-5 sm:px-6 lg:min-w-[330px] lg:border-l lg:border-t-0">
                        <div>
                          <p className="text-[0.72rem] text-[var(--color-ink-soft)]">{c.finalScore}</p>
                          <p className="mt-1 font-[var(--font-title-family)] text-[2.3rem] leading-none tracking-[-0.05em] text-[var(--color-ink)]">{item.average === null ? "—" : formatScore(item.average, language)}<span className="ml-1 font-[var(--font-ui-family)] text-[0.78rem] tracking-normal text-[var(--color-ink-soft)]">/ {item.maximumTotal}</span></p>
                        </div>
                        <div className="min-w-[85px]">
                          <p className="text-[0.72rem] text-[var(--color-ink-soft)]">{c.position}</p>
                          {item.rank === null ? <p className="mt-1 text-xs text-[var(--color-ink-soft)]">{c.awaitingScore}</p> : <p className={`mt-1 inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-[0.76rem] font-semibold ${item.rank === 1 ? "bg-[linear-gradient(110deg,#dfc08a,#c9a369)] text-white" : "bg-white text-[#356f98]"}`}>{item.rank === 1 ? <Crown aria-hidden size={14} /> : null}{item.rank} {c.place}</p>}
                        </div>
                      </div>
                    </div>
                    <details className="group border-t border-[rgba(114,160,193,0.14)]">
                      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 text-[0.8rem] font-semibold text-[#356f98] transition hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[rgba(114,160,193,0.3)] sm:px-6 [&::-webkit-details-marker]:hidden">
                        <span className="inline-flex items-center gap-2"><MessageSquareText aria-hidden size={16} />{c.viewFeedback}</span><ChevronDown aria-hidden size={17} className="shrink-0 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="border-t border-[rgba(114,160,193,0.14)] px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                        {item.reviews.length === 0 ? <p className="text-sm text-[var(--color-ink-soft)]">{c.noReviews}</p> : (
                          <div className="grid gap-3">
                            {item.reviews.map((review) => (
                              <div key={review.id} className="rounded-[17px] border border-[rgba(114,160,193,0.17)] bg-white/86 p-4 sm:p-5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div><p className="font-[var(--font-title-family)] text-[1.16rem] text-[var(--color-ink)]">{review.judgeName}</p><p className="text-[0.7rem] text-[var(--color-ink-soft)]">{c.judge}</p></div>
                                  <p className="font-[var(--font-title-family)] text-[1.5rem] text-[var(--color-ink)]">{formatScore(review.total, language)} <span className="font-[var(--font-ui-family)] text-[0.75rem] text-[var(--color-ink-soft)]">/ {item.maximumTotal}</span></p>
                                </div>
                                <h4 className="mt-5 font-[var(--font-title-family)] text-[1rem] text-[var(--color-ink)]">{c.criteria}</h4>
                                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 xl:grid-cols-7">
                                  {item.criteria.map((criterion) => {
                                    const value = review.scores[criterion.key];
                                    return <div key={criterion.key} className="min-w-0 border-[rgba(114,160,193,0.13)] pr-2 sm:border-l sm:pl-3 sm:first:border-l-0 sm:first:pl-0">
                                      <p className="min-h-[2.6rem] text-[0.7rem] leading-[1.35] text-[var(--color-ink-soft)]">{criterionCopy[language]?.[criterion.key] ?? criterion.label}</p>
                                      <p className="mt-2 font-[var(--font-title-family)] text-[1.07rem] text-[var(--color-ink)]">{value ?? "—"} <span className="text-[0.76rem] text-[var(--color-ink-soft)]">/ {criterion.maxScore}</span></p>
                                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-[var(--color-blue-wash)]"><div className="h-full rounded-full bg-[var(--color-blue)]" style={{ width: `${value === null ? 0 : Math.max(0, Math.min(100, value / criterion.maxScore * 100))}%` }} /></div>
                                    </div>;
                                  })}
                                </div>
                                <h4 className="mt-5 font-[var(--font-title-family)] text-[1rem] text-[var(--color-ink)]">{c.comments}</h4>
                                <blockquote className="mt-2 whitespace-pre-wrap rounded-[13px] bg-[var(--color-blue-wash)]/60 px-4 py-3 text-[0.8rem] leading-6 text-[var(--color-ink-soft)]">{review.comments || c.noComments}</blockquote>
                              </div>
                            ))}
                          </div>
                        )}
                        <Link href={`/account/applicant/nominations/${item.id}/scores`} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-[0.76rem] font-semibold text-[#356f98] transition hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)]">{c.fullPage}<ArrowRight aria-hidden size={15} /></Link>
                      </div>
                    </details>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {awaiting.length > 0 ? (
            <section className="mt-9" aria-labelledby="awaiting-scorings-heading">
              <div data-scoring-reveal>
                <h2 id="awaiting-scorings-heading" className="font-[var(--font-title-family)] text-[clamp(1.5rem,2.5vw,1.9rem)] text-[var(--color-ink)]">{c.awaiting}</h2>
                <p className="mt-1 text-[0.8rem] text-[var(--color-ink-soft)]">{c.awaitingDescription}</p>
              </div>
              <div className="mt-4 grid gap-3">
                {awaiting.map((item) => (
                  <article key={item.id} data-scoring-reveal className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-[21px] border border-[rgba(114,160,193,0.18)] bg-white/68 p-5 sm:p-6">
                    <div className="min-w-0">
                      <p className="text-[0.63rem] font-semibold uppercase tracking-[0.18em] text-[#356f98]">{item.categoryName}</p>
                      <h3 className="mt-2 font-[var(--font-title-family)] text-[1.35rem] leading-tight text-[var(--color-ink)]">{item.awardName}</h3>
                      <p className="mt-2 text-[0.76rem] text-[var(--color-ink-soft)]">{c.pendingDescription}</p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(114,160,193,0.2)] bg-white px-3 py-2 text-[0.72rem] text-[var(--color-ink-soft)]"><LockKeyhole aria-hidden size={14} />{c.pending}</span>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
