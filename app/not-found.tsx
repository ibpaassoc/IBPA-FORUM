"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

<<<<<<< Updated upstream
// Global App Router 404. Rendered for any unmatched route and for every
// notFound() call in the app (e.g. the closed /apply/jury route). It sits inside
// the root layout's LanguageProvider, so it localizes via the same useLanguage()
// system as the rest of the site (EN / RU / UA) with no separate i18n setup.
export default function NotFound() {
  const { t } = useLanguage();
  const router = useRouter();
  const nf = t.notFound;

  return (
    <main className="page-shell flex min-h-screen items-center justify-center p-6">
      <div className="premium-glass w-full max-w-md px-8 py-12 text-center">
        <p className="mb-2 font-[var(--font-title-family)] text-[clamp(4.5rem,13vw,7rem)] font-light leading-none tracking-[-0.04em] text-[var(--color-blue)]">
          404
        </p>
        <h1 className="mb-3 text-[1.6rem] leading-tight [font-family:var(--font-accent-family)] text-[var(--color-ink)]">
          {nf.title}
        </h1>
        <p className="mb-8 text-[0.95rem] leading-relaxed text-[var(--color-ink-soft)]">
          {nf.description}
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="ibpa-button ibpa-button-blue w-full sm:w-auto">
            {nf.backHome}
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="ibpa-button ibpa-button-ghost w-full sm:w-auto"
          >
            {nf.back}
          </button>
=======
// Global App Router 404. Rendered for any unmatched route and every notFound()
// call. Localized via the existing useLanguage() system (it renders inside the
// root layout's LanguageProvider). The glassmorphic treatment layers ambient
// blurred colour orbs behind a frosted card so the backdrop blur has colour to
// refract — matching the site's glass language (see JuryMenu / premium-glass).
export default function NotFound() {
  const { language } = useLanguage();

  const copy = {
    en: {
      title: "Page not found",
      description: "The page you are looking for does not exist or is no longer available.",
      backHome: "Return to homepage",
      back: "Go back",
    },
    ru: {
      title: "Страница не найдена",
      description: "Страница, которую вы ищете, не существует или больше недоступна.",
      backHome: "Вернуться на главную",
      back: "Назад",
    },
    ua: {
      title: "Сторінку не знайдено",
      description: "Сторінка, яку ви шукаєте, не існує або більше недоступна.",
      backHome: "Повернутися на головну",
      back: "Назад",
    },
  }[language];

  const router = useRouter();

  return (
    <main className="page-shell relative isolate flex min-h-screen items-center justify-center overflow-hidden p-6">
      {/* Ambient glass backdrop — colour orbs the frosted card refracts */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(185,217,235,0.6),transparent_66%)]" />
        <div className="absolute -left-28 top-4 h-80 w-80 rounded-full bg-[rgba(114,160,193,0.42)] blur-[90px]" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[rgba(160,205,232,0.5)] blur-[90px]" />
        <div className="absolute right-[24%] -top-8 h-52 w-52 rounded-full bg-[rgba(216,236,248,0.75)] blur-[80px]" />
        <div className="absolute bottom-[14%] left-[10%] h-56 w-56 rounded-full bg-[rgba(114,160,193,0.3)] blur-[80px]" />
        <div className="absolute right-[8%] top-[26%] h-40 w-40 rounded-full bg-[rgba(255,255,255,0.65)] blur-[70px]" />
      </div>

      {/* Frosted glass card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[32px] border border-white/55 bg-white/30 px-8 py-14 text-center shadow-[0_40px_120px_-24px_rgba(114,160,193,0.55)] [backdrop-filter:blur(36px)_saturate(190%)]">
        {/* Layered highlights — top hairline, diagonal sheen, corner glows */}
        <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(158deg,rgba(255,255,255,0.55),rgba(255,255,255,0.06)_42%,rgba(185,217,235,0.14))]" />
        <span className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[rgba(185,217,235,0.35)] blur-3xl" />
        <span className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-[rgba(255,255,255,0.4)] blur-3xl" />
        <span className="pointer-events-none absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-1px_2px_rgba(114,160,193,0.12)]" />

        <div className="relative z-10">
          <p className="mb-1 font-[var(--font-title-family)] text-[clamp(5rem,15vw,8.5rem)] font-light leading-none tracking-[-0.05em]">
            <span className="bg-gradient-to-b from-[var(--color-blue)] via-[#8fb4cf] to-[var(--color-blue-soft)] bg-clip-text text-transparent [text-shadow:0_10px_40px_rgba(114,160,193,0.25)]">
              404
            </span>
          </p>

          <h1 className="mb-3 text-[1.6rem] leading-tight [font-family:var(--font-accent-family)] text-[var(--color-ink)]">
            {copy.title}
          </h1>
          <p className="mx-auto mb-9 max-w-xs text-[0.95rem] leading-relaxed text-[var(--color-ink-soft)]">
            {copy.description}
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/" className="ibpa-button ibpa-button-blue w-full sm:w-auto">
              {copy.backHome}
            </Link>
            <button
              type="button"
              onClick={() => router.back()}
              className="ibpa-button ibpa-button-ghost w-full sm:w-auto"
            >
              {copy.back}
            </button>
          </div>
>>>>>>> Stashed changes
        </div>
      </div>
    </main>
  );
}
