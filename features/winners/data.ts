export type Winner = {
  name: string;
  category: string;
  badge?: string;
  image: string;
};

export const winnersByYear: Record<number, Winner[]> = {
  2025: [
    { name: "Tetiana Kysliuk", category: "Brow artist and Lash lamimaker", badge: "1st", image: "/images/winners2025/Tetiana_Kysliuk.jpg" },
    { name: "Anastasiia Sikova", category: "Nail artist and Educator", badge: "2nd", image: "/images/winners2025/Anastasiia_Sikova.jpg" },
    { name: "Masha Pixie", category: "Hairstylist and Mentor", badge: "3rd", image: "/images/winners2025/Masha_Pixie.jpg" },
    { name: "Svetlana Nesterova", category: "Makeup artist known for refined taste and trend vision", image: "/images/winners2025/Svetlana_Nesterova.jpg" },
    { name: "Eleonora Bedyukh", category: "Brow and Lash expert, creator of an innovative approach to color and shape", image: "/images/winners2025/Eleonora_Bedyukh.jpg" },
    { name: "Julia Karpus", category: "Massage therapist integrating aesthetics and Wellness", image: "/images/winners2025/Julia_Karpus.jpg" },
    { name: "Diana Derkach", category: "Cosmetologist specializing in modern therapies and advanced Skincare", image: "/images/winners2025/Diana_Derkach.jpg" },
    { name: "Natalia Yakovleva", category: "Nail master recognized for precision and contemporary design", image: "/images/winners2025/Natalia_Yakovleva.jpg" },
    { name: "Natalia Firsova", category: "Hair extension specialist and creative Stylist", image: "/images/winners2025/Natalia_Firsova.jpg" },
    { name: "Anastasiia Arabadzhy", category: "Nail artist known for elegance and attention to detail", image: "/images/winners2025/Anastasiia_Arabadzhy.jpg" },
    { name: "Anastasia Shevchenko", category: "Brow artist and Lamimaker, emphasizing natural beauty and symmetry", image: "/images/winners2025/Anastasia_Shevchenko.jpg" },
    { name: "Yulia Simonenko", category: "Nail expert, blending technique with artistic expression", image: "/images/winners2025/Yulia_Simonenko.jpg" },
  ],
};

export const winnerYears = Object.keys(winnersByYear).map(Number).sort((a, b) => b - a);
