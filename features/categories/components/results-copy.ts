import type { Language } from "@/lib/i18n/translations";

function slavicCount(count: number, one: string, few: string, many: string) {
  const lastTwo = count % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return many;
  const last = count % 10;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}

export const resultsCopy: Record<Language, {
  eyebrow: string;
  title: string;
  intro: string;
  category: string;
  nomination: string;
  results: string;
  chooseCategory: string;
  chooseNomination: string;
  nominationsCount: (count: number) => string;
  applicantsCount: (count: number) => string;
  place: string;
  applicant: string;
  score: string;
  empty: string;
  emptyHint: string;
  homeTitle: string;
  homeText: string;
  homeButton: string;
}> = {
  en: {
    eyebrow: "Official results", title: "Award results",
    intro: "Explore the released rankings. Choose a category, then a nomination to see each applicant’s position and average jury score.",
    category: "Category", nomination: "Nomination", results: "Results",
    chooseCategory: "Choose a category", chooseNomination: "Choose a nomination",
    nominationsCount: (count) => count === 1 ? "nomination" : "nominations",
    applicantsCount: (count) => count === 1 ? "applicant" : "applicants",
    place: "Place", applicant: "Applicant", score: "Average score",
    empty: "No published results yet", emptyHint: "Rankings will appear here once scores for this nomination are released.",
    homeTitle: "Award results are available", homeText: "Browse published rankings by category and nomination on the Categories page.",
    homeButton: "Explore results",
  },
  ru: {
    eyebrow: "Официальные результаты", title: "Результаты премии",
    intro: "Изучите опубликованный рейтинг: выберите категорию и номинацию, чтобы увидеть места участников и средний балл жюри.",
    category: "Категория", nomination: "Номинация", results: "Результаты",
    chooseCategory: "Выбрать категорию", chooseNomination: "Выбрать номинацию",
    nominationsCount: (count) => slavicCount(count, "номинация", "номинации", "номинаций"),
    applicantsCount: (count) => slavicCount(count, "участник", "участника", "участников"),
    place: "Место", applicant: "Участник", score: "Средний балл",
    empty: "Результаты пока не опубликованы", emptyHint: "Рейтинг появится здесь после публикации оценок этой номинации.",
    homeTitle: "Результаты премии доступны", homeText: "Смотрите опубликованные рейтинги по категориям и номинациям на странице категорий.",
    homeButton: "Смотреть результаты",
  },
  ua: {
    eyebrow: "Офіційні результати", title: "Результати премії",
    intro: "Перегляньте опублікований рейтинг: оберіть категорію та номінацію, щоб побачити місця учасників і середній бал журі.",
    category: "Категорія", nomination: "Номінація", results: "Результати",
    chooseCategory: "Обрати категорію", chooseNomination: "Обрати номінацію",
    nominationsCount: (count) => slavicCount(count, "номінація", "номінації", "номінацій"),
    applicantsCount: (count) => slavicCount(count, "учасник", "учасники", "учасників"),
    place: "Місце", applicant: "Учасник", score: "Середній бал",
    empty: "Результати ще не опубліковані", emptyHint: "Рейтинг з’явиться тут після публікації оцінок цієї номінації.",
    homeTitle: "Результати премії доступні", homeText: "Переглядайте опубліковані рейтинги за категоріями й номінаціями на сторінці категорій.",
    homeButton: "Переглянути результати",
  },
};
