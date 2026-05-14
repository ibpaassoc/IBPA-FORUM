import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Marck_Script, Lora, Raleway, Bodoni_Moda } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Footer from "@/shared/components/layout/Footer";
import Header from "@/shared/components/layout/Header";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { languages, type Language } from "@/lib/i18n/translations";

export const metadata: Metadata = {
  title: "IBPA Beauty Award 2026",
  description: "Official IBPA website",
  icons: {
    icon: "/logo.svg", // or "/favicon.ico"
  },
};

export const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
});

export const lora = Lora({
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
  variable: "--font-body",
});

export const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-accent",
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
      className={`${cormorant.variable} ${lora.variable} ${raleway.variable} ${bodoniModa.variable}`}
    >
      <body>
        <LanguageProvider initialLanguage={initialLanguage}>
          <Header />
          <div className="min-h-screen">
            {children}
          </div>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}
