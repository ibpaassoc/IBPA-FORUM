import type { Metadata } from "next";
import { getApplicantNominationScores } from "@/features/account/server/nomination-scores";
import { getServerLanguage } from "@/lib/i18n/server";
import NominationScoresView from "@/features/account/components/scores/NominationScoresView";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguage();
  const title = language === "ru" ? "Оценки и отзывы" : language === "ua" ? "Оцінки та відгуки" : "Scores & feedback";
  return { title: `${title} | IBPA Beauty Award 2026` };
}

export default async function ApplicantNominationScoresPage({ params }: {
  params: Promise<{ nominationId: string }>;
}) {
  const { nominationId } = await params;
  const [data, language] = await Promise.all([
    getApplicantNominationScores(nominationId),
    getServerLanguage(),
  ]);
  return <NominationScoresView data={data} language={language} />;
}
