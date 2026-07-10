/**
 * Verification for closing the public jury-application flow and the global 404.
 *
 * Framework-free checks (the repo has no unit runner): translation presence,
 * static source scans for removed links, the notFound() route, and the closed
 * jury API. UI-render and admin/participant scenarios are covered by the manual
 * checklist in the final report.
 *
 *   npm run test:jury-closure
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { translations } from "@/lib/i18n/translations";

const ROOT = process.cwd();
let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${label}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${label}`);
  }
}

function read(rel: string) {
  return readFileSync(join(ROOT, rel), "utf8");
}

// ── 404 translations (scenarios 12, 13, 14) ──────────────────────────────────
console.log("404 translations");
const expected = {
  en: { title: "Page not found", back: "Return to homepage" },
  ru: { title: "Страница не найдена", back: "Вернуться на главную" },
  ua: { title: "Сторінку не знайдено", back: "Повернутися на головну" },
} as const;
for (const lang of ["en", "ru", "ua"] as const) {
  const nf = translations[lang].notFound;
  assert(nf.title === expected[lang].title, `${lang}: title`);
  assert(nf.backHome === expected[lang].back, `${lang}: homepage button`);
  assert(typeof nf.description === "string" && nf.description.length > 20, `${lang}: description`);
}

// ── Global 404 page exists and uses the shared i18n system (scenario 1) ───────
console.log("global not-found page");
const notFoundSrc = read("app/not-found.tsx");
assert(existsSync(join(ROOT, "app/not-found.tsx")), "app/not-found.tsx exists");
assert(notFoundSrc.includes("useLanguage"), "not-found localizes via useLanguage");
assert(notFoundSrc.includes("t.notFound") || notFoundSrc.includes("nf ="), "not-found reads notFound copy");
assert(notFoundSrc.includes('href="/"'), "not-found links to homepage");

// ── /apply/jury renders the 404 (scenarios 2, 3) ─────────────────────────────
console.log("/apply/jury closed");
const juryPageSrc = read("app/(public)/apply/jury/page.tsx");
assert(juryPageSrc.includes('from "next/navigation"'), "imports next/navigation");
assert(/notFound\(\)/.test(juryPageSrc), "calls notFound()");
assert(!juryPageSrc.includes("JuryApplicationForm"), "no longer renders the jury application form");

// ── Public links/CTAs no longer point to /apply/jury (scenarios 4, 5, 6) ──────
console.log("no /apply/jury links in public UI");
const uiFiles = [
  "shared/components/layout/JuryMenu.tsx", // header desktop + mobile + footer dropdown
  "shared/components/layout/Footer.tsx",
  "features/applications/components/pages/ApplyHero.tsx",
  "features/jury/components/pages/JuryHero.tsx",
  "features/jury/components/pages/JuryCta.tsx",
  "shared/components/public/SiteUnderDevelopmentPage.tsx",
];
for (const file of uiFiles) {
  assert(!read(file).includes("/apply/jury"), `${file} has no /apply/jury link`);
}
// The header "Apply" dropdown still offers participant apply + jury account login.
const juryMenu = read("shared/components/layout/JuryMenu.tsx");
assert(juryMenu.includes('href: "/apply"'), "header still offers participant apply");
assert(juryMenu.includes('href: "/jury/login"'), "header still offers jury account login");

// ── Backend rejects new jury submissions (scenario 8) ────────────────────────
console.log("jury submission backend closed");
const apiSrc = read("app/api/jury/route.ts");
assert(/status:\s*410/.test(apiSrc), "POST /api/jury returns 410 Gone");
assert(!/submitJuryApplication\s*\(/.test(apiSrc), "no longer calls submitJuryApplication()");
assert(!apiSrc.includes('jury/server/commands"'), "no longer imports the jury submit command");

// ── SEO / sitemap (scenario 7) ───────────────────────────────────────────────
console.log("sitemap / discovery");
const sitemapCandidates = ["app/sitemap.ts", "app/sitemap.xml", "public/sitemap.xml"];
const sitemapWithJury = sitemapCandidates.filter(
  (p) => existsSync(join(ROOT, p)) && read(p).includes("/apply/jury")
);
assert(sitemapWithJury.length === 0, "no sitemap lists /apply/jury");

// ── Existing jury/participant surfaces untouched (scenarios 9, 10, 11) ────────
console.log("existing flows preserved");
assert(existsSync(join(ROOT, "app/admin/jury-applications")), "admin jury applications route still present");
assert(existsSync(join(ROOT, "app/jury/dashboard/page.tsx")), "jury dashboard still present");
assert(existsSync(join(ROOT, "app/(public)/jury/login/page.tsx")), "jury login still present");
assert(
  read("app/(public)/apply/page.tsx").includes("notFound") === false,
  "participant /apply route NOT closed"
);
// Other /api/jury/* routes (existing-member flows) remain intact.
for (const p of [
  "app/api/jury/upload/route.ts",
  "app/api/jury/scoring/route.ts",
  "app/api/jury/additional-info/[token]/route.ts",
]) {
  assert(existsSync(join(ROOT, p)), `${p} still present`);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
