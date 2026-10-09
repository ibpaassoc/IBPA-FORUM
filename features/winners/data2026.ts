export type Winner2026 = {
  name: string;
  image: string | null;
  instagram: string;
  awards: string[];
};

export type WinnerCategory2026 = {
  title: string;
  winners: Winner2026[];
};

const portrait = (file: string | null) => file ? `/images/winners2026/${file}` : null;
const winner = (name: string, file: string | null, instagram: string, ...awards: string[]): Winner2026 => ({
  name, image: portrait(file), instagram: `https://www.instagram.com/${instagram}/`, awards,
});

const huk = () => winner("Anastasiia Huk", "Anastasiia Huk.JPG", "huk_esthetician_",
  "Award Of Excellence In Beauty Brand Development",
  "Award Of Excellence In Professional Beauty Product Development");
const oksana = (award: string) => winner("Oksana Karvehina", "OKSANA KARVEHINA.jpg", "oxyoxy_beauty", award);
const viktoriia = (...awards: string[]) => winner("Viktoriia Tesalova", "Viktoriia Tesalova.JPG", "tesalova_viktoriya_permanent", ...awards);

/** Award titles, winners, and Instagram handles transcribed from the supplied 2026 DOCX. */
export const winnerCategories2026: WinnerCategory2026[] = [
  { title: "Brand", winners: [
    huk(),
    oksana("Innovation In Beauty Award"),
  ] },
  { title: "Education", winners: [
    winner("Anastasiia Huk", "Anastasiia Huk.JPG", "huk_esthetician_", "Award Of Excellence In Online Beauty Education"),
    viktoriia("Award Of Excellence In Professional Beauty Training"),
  ] },
  { title: "Makeup Artistry", winners: [
    winner("Anastasiia Lazarenko", "Anastasia Feshchenko (Lazarenko).jpeg", "anastasia_feshchenko",
      "Award Of Excellence In Bridal Makeup Artistry",
      "Award Of Excellence In Creative Makeup Artistry",
      "Award Of Excellence In Daytime Makeup Artistry",
      "Award Of Excellence In Mature Makeup Artistry"),
  ] },
  { title: "Skin Care, Cosmetology & Facial", winners: [
    winner("Anzhelika Syveniuk", "Anzhelika Syveniuk.JPG", "dr.lika.skin",
      "Award Of Excellence In Acne Treatment",
      "Award Of Excellence In Anti-Aging Facial Treatment",
      "Award Of Excellence In Non-Invasive Rejuvenation"),
  ] },
  { title: "Hair", winners: [
    winner("Olha Kotsiubailo", "Olha Kotsiubailo.jpeg", "olhacolorist", "Award Of Excellence In Hair Color Technique"),
    oksana("Hair Restoration Mastery Award"),
    winner("Liudmila Aksakova", "LIUDMYLA AKSAKOVA.png", "aksakovahair", "Barbering Excellence Award"),
  ] },
  { title: "Body, Wellness & Nutrition", winners: [
    winner("Angelina Davydyan", "Angelina Davidyan.png", "bodysculptorangelina", "Award Of Excellence In Anti-Cellulite Treatment"),
    winner("Olha Isber", "Olha Isber.jpeg", "olga_isber", "Award Of Excellence In Body Transformation"),
    winner("Anastasiia Huk", "Anastasiia Huk.JPG", "huk_esthetician_", "Award Of Excellence In Nutrition & Diet Correction"),
  ] },
  { title: "Permanent Makeup", winners: [
    viktoriia("Award Of Excellence In Camouflage & Correction", "Award Of Excellence In Lips Pmu"),
    winner("Olha Kruhlenko", "Olha Kruhlenko.jpeg", "perfect.style.pmu", "Award Of Excellence In Eyeliner Precision"),
    winner("Anna Matiushina", "Anna Matiushina.png", "anna_matyushina_pm", "Award Of Excellence In Pmu Brows"),
  ] },
  { title: "Lash", winners: [
    winner("Eleonora Bediukh", "Eleonora Bediukh.JPG", "elionora.brows", "Award Of Excellence In Lash Lift"),
    winner("Inna Bahriantseva", "Inna Bahriantseva.jpeg", "eyelash_extension_us",
      "Award Of Excellence In Classic Lash Extension",
      "Award Of Excellence In Creative Lash Extension Design",
      "Award Of Excellence In Volume Lash Extension"),
  ] },
  { title: "Nail", winners: [
    winner("Olena Kolomoiets", "Olena Kolomoiets.jpg", "kolomoiets_nails", "Award Of Excellence In Manicure"),
    winner("Marharyta Kasianenko", "Marharyta Kasianenko.jpeg", "margart_studio", "Award Of Excellence In Nail Extension"),
    winner("Yulia Tur", null, "turnails916", "Award Of Excellence In Podology"),
  ] },
  { title: "Brow", winners: [
    winner("Karolina Amaritsa", "Karolina Amaritsa.jpg", "browsbykarro", "Award Of Excellence In Brow Lamination"),
    winner("Anastasiia Shevchenko", "Anastasiia Chevchenko.PNG", "thebroww.bar", "Award Of Excellence In Brow Styling & Design"),
  ] },
  { title: "Salon", winners: [
    winner("Valeriia Diachuk", "Valeriia Diachuk.png", "sudilovskaya_valeriia",
      "Award For Outstanding Achievement In Beauty Business Development",
      "Award Of Excellence In Beauty Salon Innovation"),
  ] },
];

export const winner2026AwardCount = winnerCategories2026.reduce(
  (count, category) => count + category.winners.reduce((sum, person) => sum + person.awards.length, 0), 0,
);

export const featuredWinners2026 = [0, 2, 3, 6, 7].map((index) => ({
  categoryIndex: index,
  category: winnerCategories2026[index].title,
  winner: winnerCategories2026[index].winners[0],
}));
