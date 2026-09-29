export type ScoreLanguage = "en" | "ru" | "ua";

export const criterionCopy: Record<ScoreLanguage, Record<string, string>> = {
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
