import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Lora, Bodoni_Moda } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { languages, type Language } from "@/lib/i18n/translations";

export const metadata: Metadata = {
  title: "IBPA Beauty Award 2026",
  description: "Official IBPA website",
  icons: {
    icon: "/logo.svg",
  },
};

export const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

export const lora = Lora({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-body",
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-accent",
});

export const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

function resolveLanguage(value: string | undefined): Language {
  if (!value) return "en";
  if (languages.includes(value as Language)) {
    return value as Language;
  }

  return "en";
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies();
  const initialLanguage = resolveLanguage(cookieStore.get("ibpa-language")?.value);
  const htmlLanguage = initialLanguage === "ua" ? "uk" : initialLanguage;

  return (
    <html
      lang={htmlLanguage}
      className={`${cormorant.variable} ${inter.variable} ${lora.variable} ${bodoniModa.variable}`}
    >
      <body>
        <LanguageProvider initialLanguage={initialLanguage}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
