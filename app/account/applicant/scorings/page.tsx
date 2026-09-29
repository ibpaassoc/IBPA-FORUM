import type { Metadata } from "next";
import ApplicantScoringsView from "@/features/account/components/scores/ApplicantScoringsView";
import { getApplicantScorings } from "@/features/account/server/nomination-scores";
import { getServerLanguage } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguage();
  const title = language === "ru" ? "Оценки" : language === "ua" ? "Оцінки" : "Scorings";
  return { title: `${title} | IBPA Beauty Award 2026` };
}

export default async function ApplicantScoringsPage() {
  const [data, language] = await Promise.all([getApplicantScorings(), getServerLanguage()]);
  return <ApplicantScoringsView data={data} language={language} />;
}
