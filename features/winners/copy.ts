export const winnersCopy = {
  en: {
    heroEyebrow: "IBPA Beauty Awards / Hall of honour", heroTitle: "Winners", heroIntro: "Meet the artists whose vision and craft shaped the 2026 IBPA Beauty Awards.", explore: "Explore the winners", scroll: "Scroll to discover",
    edition: "The 2026 edition", editionTitleOne: "The names.", editionTitleTwo: "The craft.", editionIntro: "A closer look at the people and the work behind every distinction.", categories: "Categories", awards: "Awards", artists: "Artists", honours: "Honours", viewInstagram: "View on Instagram", portrait: "Portrait of", category: "Category", winner: "Winner", award: "Award", initials: "Portrait coming soon",
    archive: "The 2025 edition", archiveLink: "2025 archive", archiveIntro: "The artists who set the stage. A quieter look back at the previous year.", archiveArtists: "Honoured artists", back: "Back to the forum",
  },
  ru: {
    heroEyebrow: "IBPA Beauty Awards / Галерея победителей", heroTitle: "Победители", heroIntro: "Знакомьтесь с мастерами, чьи талант и работа определили IBPA Beauty Awards 2026.", explore: "Смотреть победителей", scroll: "Листайте дальше",
    edition: "Премия 2026", editionTitleOne: "Имена.", editionTitleTwo: "Мастерство.", editionIntro: "Люди и достижения, стоящие за каждой наградой.", categories: "Категории", awards: "Награды", artists: "Мастера", honours: "Награды", viewInstagram: "Смотреть в Instagram", portrait: "Портрет", category: "Категория", winner: "Победитель", award: "Награда", initials: "Фото скоро появится",
    archive: "Премия 2025", archiveLink: "Архив 2025", archiveIntro: "Мастера, с которых началась эта история. Взгляд на прошлый год.", archiveArtists: "Отмеченные мастера", back: "На главную",
  },
  ua: {
    heroEyebrow: "IBPA Beauty Awards / Галерея переможців", heroTitle: "Переможці", heroIntro: "Знайомтеся з майстрами, чиї талант і праця визначили IBPA Beauty Awards 2026.", explore: "Дивитися переможців", scroll: "Гортайте далі",
    edition: "Премія 2026", editionTitleOne: "Імена.", editionTitleTwo: "Майстерність.", editionIntro: "Люди та досягнення, що стоять за кожною нагородою.", categories: "Категорії", awards: "Нагороди", artists: "Майстри", honours: "Нагороди", viewInstagram: "Дивитися в Instagram", portrait: "Портрет", category: "Категорія", winner: "Переможець", award: "Нагорода", initials: "Фото незабаром з’явиться",
    archive: "Премія 2025", archiveLink: "Архів 2025", archiveIntro: "Майстри, з яких почалася ця історія. Погляд на минулий рік.", archiveArtists: "Відзначені майстри", back: "На головну",
  },
} as const;

export type WinnersCopy = typeof winnersCopy[keyof typeof winnersCopy];
