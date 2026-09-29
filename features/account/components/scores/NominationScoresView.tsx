"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Crown, FileText, MessageSquareText } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { getApplicantNominationScores } from "@/features/account/server/nomination-scores";

gsap.registerPlugin(useGSAP);

type ScoreData = Awaited<ReturnType<typeof getApplicantNominationScores>>;
type Language = "en" | "ru" | "ua";

const copy = {
  en: {
    back: "Back to my nominations", details: "Nomination details", scores: "Scores & feedback",
    finalScore: "Final score", position: "Position in this award", place: "place",
    evaluated: "Evaluated by", judges: "judges", evaluation: "Judges’ evaluation",
    evaluationDescription: "Individual scores and comments from the judges who reviewed your nomination.",
    criteria: "Scores by criterion", comments: "Judge’s comments", noComments: "No written comments were provided.",
    pendingTitle: "Scores have not been released yet", pendingText: "You can view each judge’s scores and feedback here once the results are published.",
    noReviews: "No submitted evaluations are available for this nomination.",
    noRank: "Position pending", noScore: "Score pending", judge: "Judge", outOf: "out of",
  },
  ru: {
    back: "К моим номинациям", details: "Данные номинации", scores: "Оценки и отзывы",
    finalScore: "Итоговый балл", position: "Место в этой награде", place: "место",
    evaluated: "Оценили", judges: "судей", evaluation: "Оценки жюри",
    evaluationDescription: "Баллы и комментарии каждого члена жюри, оценившего вашу номинацию.",
    criteria: "Баллы по критериям", comments: "Комментарий судьи", noComments: "Судья не оставил комментарий.",
    pendingTitle: "Оценки пока не опубликованы", pendingText: "После публикации результатов здесь появятся баллы и отзывы каждого судьи.",
    noReviews: "Для этой номинации пока нет завершённых оценок.",
    noRank: "Место ещё не определено", noScore: "Оценка ожидается", judge: "Судья", outOf: "из",
  },
  ua: {
    back: "До моїх номінацій", details: "Дані номінації", scores: "Оцінки та відгуки",
    finalScore: "Підсумковий бал", position: "Місце в цій нагороді", place: "місце",
    evaluated: "Оцінили", judges: "суддів", evaluation: "Оцінки журі",
    evaluationDescription: "Бали та коментарі кожного члена журі, який оцінив вашу номінацію.",
    criteria: "Бали за критеріями", comments: "Коментар судді", noComments: "Суддя не залишив коментар.",
    pendingTitle: "Оцінки ще не опубліковано", pendingText: "Після публікації результатів тут з’являться бали та відгуки кожного судді.",
    noReviews: "Для цієї номінації ще немає завершених оцінок.",
    noRank: "Місце ще не визначено", noScore: "Оцінка очікується", judge: "Суддя", outOf: "з",
  },
} as const;

const criterionCopy: Record<Language, Record<string, string>> = {
  en: {},
  ru: {
    professionalQualification: "Профессиональная квалификация",
    professionalAchievements: "Достижения и признание",
    portfolioQuality: "Качество портфолио и материалов",
    professionalDevelopment: "Деятельность и развитие",
    industryContribution: "Вклад в развитие индустрии",
    professionalStandards: "Профессиональные стандарты",
    ibpaLevelAlignment: "Соответствие уровню IBPA",
  },
  ua: {
    professionalQualification: "Професійна кваліфікація",
    professionalAchievements: "Досягнення та визнання",
    portfolioQuality: "Якість портфоліо та матеріалів",
    professionalDevelopment: "Діяльність і розвиток",
    industryContribution: "Внесок у розвиток індустрії",
    professionalStandards: "Професійні стандарти",
    ibpaLevelAlignment: "Відповідність рівню IBPA",
  },
};

const linkFocus = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.28)]";

function formatScore(value: number, language: Language) {
  return new Intl.NumberFormat(language === "ua" ? "uk" : language, {
    minimumFractionDigits: 1, maximumFractionDigits: 1,
  }).format(value);
}

export default function NominationScoresView({ data, language }: { data: ScoreData; language: Language }) {
  const root = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const c = copy[language] ?? copy.en;
  const detailHref = `/account/applicant/nominations/${data.id}`;

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from("[data-score-reveal]", {
      opacity: 0, y: 14, duration: 0.48, ease: "power2.out", stagger: 0.07,
      clearProps: "all",
    });
  }, { scope: root });

  return (
    <div ref={root} className="mx-auto w-full max-w-[1180px] pb-8">
      <header data-score-reveal>
        <Link href="/account/applicant/nominations" className={`inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-[0.78rem] text-[var(--color-ink-soft)] transition hover:text-[var(--color-blue)] ${linkFocus}`}>
          <ArrowLeft aria-hidden size={16} /> {c.back}
        </Link>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#356f98]">{data.categoryName}</p>
            <h1 className="mt-2 font-[var(--font-title-family)] text-[clamp(2rem,2.4vw,2.65rem)] font-light leading-[1.08] tracking-[-0.025em] text-[var(--color-ink)]">{data.awardName}</h1>
            <p className="mt-3 text-[0.77rem] text-[var(--color-ink-soft)]">
              {new Intl.DateTimeFormat(language === "ua" ? "uk" : language, { day: "numeric", month: "long", year: "numeric" }).format(new Date(data.updatedAt))}
            </p>
          </div>
          <span className="inline-flex min-h-8 items-center rounded-full border border-[rgba(37,42,45,0.13)] bg-white/80 px-4 text-[0.63rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">{t.account.statuses[data.status] ?? data.status.replaceAll("_", " ")}</span>
        </div>
      </header>

      <nav data-score-reveal aria-label={c.details} className="mt-7 flex gap-1 border-b border-[rgba(114,160,193,0.18)] pb-2">
        <Link href={detailHref} className={`inline-flex min-h-11 items-center gap-2 rounded-[13px] px-4 text-[0.8rem] text-[var(--color-ink-soft)] transition hover:bg-white/80 hover:text-[var(--color-ink)] ${linkFocus}`}>
          <FileText aria-hidden size={15} /> {c.details}
        </Link>
        <span aria-current="page" className="inline-flex min-h-11 items-center gap-2 rounded-[13px] bg-[var(--color-blue-wash)] px-4 text-[0.8rem] font-semibold text-[#356f98]">
          <MessageSquareText aria-hidden size={15} /> {c.scores}
        </span>
      </nav>

      {!data.released ? (
        <section data-score-reveal className="mt-6 rounded-[26px] border border-[rgba(114,160,193,0.2)] bg-white/78 px-6 py-12 text-center shadow-[0_18px_54px_rgba(37,42,45,0.05)] sm:px-10">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[#356f98]"><MessageSquareText aria-hidden size={22} /></div>
          <h2 className="mt-5 font-[var(--font-title-family)] text-[clamp(1.55rem,3vw,2rem)] text-[var(--color-ink)]">{c.pendingTitle}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-[var(--color-ink-soft)]">{c.pendingText}</p>
        </section>
      ) : (
        <>
          <section data-score-reveal aria-label={c.finalScore} className="mt-6 grid gap-0 overflow-hidden rounded-[25px] border border-[rgba(114,160,193,0.19)] bg-white/78 shadow-[0_18px_54px_rgba(37,42,45,0.05)] md:grid-cols-[1fr_1fr]">
            <div className="flex flex-wrap items-end gap-x-7 gap-y-3 p-5 sm:p-6">
              <div>
                <p className="text-[0.77rem] text-[var(--color-ink-soft)]">{c.finalScore}</p>
                <p className="mt-1 font-[var(--font-title-family)] text-[clamp(2.8rem,4vw,3.5rem)] leading-none tracking-[-0.055em] text-[var(--color-ink)]">
                  {data.average === null ? "—" : formatScore(data.average, language)}<span className="ml-2 font-[var(--font-ui-family)] text-[1rem] tracking-normal text-[var(--color-ink-soft)]">/ {data.maximumTotal}</span>
                </p>
              </div>
              {data.rank !== null ? <span className="mb-1 inline-flex min-h-9 items-center gap-2 rounded-full bg-[linear-gradient(110deg,#dfc08a,#c9a369)] px-4 text-[0.75rem] font-semibold text-white shadow-[0_8px_22px_rgba(150,109,58,0.18)]"><Crown aria-hidden size={14} /> {data.rank} {c.place}</span> : null}
            </div>
            <div className="border-t border-[rgba(114,160,193,0.16)] p-5 sm:p-6 md:border-l md:border-t-0">
              <p className="text-[0.77rem] text-[var(--color-ink-soft)]">{c.evaluated}</p>
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <p className="font-[var(--font-title-family)] text-[1.45rem] text-[var(--color-ink)]">{data.reviews.length} / {data.assignedJudgeCount} {c.judges}</p>
                <p className="text-[0.74rem] font-semibold text-[var(--color-ink-soft)]">{c.position}: {data.rank === null ? c.noRank : `${data.rank} ${c.place}`}</p>
              </div>
              <div role="progressbar" aria-label={c.evaluated} aria-valuenow={data.reviews.length} aria-valuemin={0} aria-valuemax={Math.max(data.assignedJudgeCount, 1)} className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--color-blue-wash)]"><div className="h-full rounded-full bg-[var(--color-blue)]" style={{ width: `${data.assignedJudgeCount ? data.reviews.length / data.assignedJudgeCount * 100 : 0}%` }} /></div>
            </div>
          </section>

          <section className="mt-8" aria-labelledby="judges-evaluation-heading">
            <div data-score-reveal>
              <h2 id="judges-evaluation-heading" className="font-[var(--font-title-family)] text-[clamp(1.55rem,2.5vw,2rem)] leading-tight text-[var(--color-ink)]">{c.evaluation}</h2>
              <p className="mt-1 text-[0.83rem] leading-6 text-[var(--color-ink-soft)]">{c.evaluationDescription}</p>
            </div>
            {data.reviews.length === 0 ? (
              <p data-score-reveal className="mt-5 rounded-[20px] border border-[rgba(114,160,193,0.2)] bg-white/80 p-6 text-sm text-[var(--color-ink-soft)]">{c.noReviews}</p>
            ) : (
              <div className="mt-5 space-y-2.5">
                {data.reviews.map((review, index) => (
                  <details key={review.id} data-score-reveal open={index === 0} className="group overflow-hidden rounded-[21px] border border-[rgba(114,160,193,0.18)] bg-white/78 shadow-[0_12px_38px_rgba(37,42,45,0.045)] open:bg-white/90">
                    <summary className={`flex min-h-[70px] cursor-pointer list-none items-center gap-4 px-4 py-3 marker:hidden hover:bg-[var(--color-blue-wash)]/40 sm:px-5 [&::-webkit-details-marker]:hidden ${linkFocus}`}>
                      <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.18)] bg-[linear-gradient(145deg,#e8f3f9,#fff)] font-[var(--font-title-family)] text-[1rem] text-[#356f98]">{review.judgeName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate font-[var(--font-title-family)] text-[1.08rem] text-[var(--color-ink)]">{review.judgeName}</span><span className="block text-[0.72rem] text-[var(--color-ink-soft)]">{c.judge}</span></span>
                      <span className="shrink-0 font-[var(--font-title-family)] text-[1.4rem] text-[var(--color-ink)]">{formatScore(review.total, language)}<span className="ml-1 font-[var(--font-ui-family)] text-[0.78rem] text-[var(--color-ink-soft)]">/ {data.maximumTotal}</span></span>
                      <ChevronDown aria-hidden size={18} className="ml-1 shrink-0 text-[#356f98] transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-[rgba(114,160,193,0.11)] px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
                      <h3 className="font-[var(--font-title-family)] text-[1.05rem] text-[var(--color-ink)]">{c.criteria}</h3>
                      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 xl:grid-cols-7">
                        {data.criteria.map((criterion) => {
                          const value = review.scores[criterion.key];
                          return <div key={criterion.key} className="min-w-0 border-[rgba(114,160,193,0.13)] pr-3 sm:border-l sm:pl-3 sm:first:border-l-0 sm:first:pl-0">
                            <p className="min-h-[2.75rem] text-[0.72rem] leading-[1.35] text-[var(--color-ink-soft)]">{criterionCopy[language]?.[criterion.key] ?? criterion.label}</p>
                            <p className="mt-2 font-[var(--font-title-family)] text-[1.12rem] text-[var(--color-ink)]">{value ?? "—"} <span className="text-[0.8rem] text-[var(--color-ink-soft)]">/ {criterion.maxScore}</span></p>
                            <div className="mt-1 h-1 overflow-hidden rounded-full bg-[var(--color-blue-wash)]"><div className="h-full rounded-full bg-[var(--color-blue)]" style={{ width: `${value === null ? 0 : Math.max(0, Math.min(100, value / criterion.maxScore * 100))}%` }} /></div>
                          </div>;
                        })}
                      </div>
                      <h3 className="mt-6 font-[var(--font-title-family)] text-[1.05rem] text-[var(--color-ink)]">{c.comments}</h3>
                      <blockquote className="mt-2 rounded-[14px] bg-[var(--color-blue-wash)]/60 px-4 py-3 text-[0.84rem] leading-7 text-[var(--color-ink-soft)] whitespace-pre-wrap">{review.comments || c.noComments}</blockquote>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
