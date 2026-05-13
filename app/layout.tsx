import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Marck_Script } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Footer from "@/shared/components/layout/Footer";
import Header from "@/shared/components/layout/Header";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { languages, type Language } from "@/lib/i18n/translations";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

const marckScript = Marck_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-accent",
});

export const metadata: Metadata = {
  title: "IBPA Beauty Award 2026",
  description: "Official IBPA website",
  icons: {
    icon: "/logo.svg", // or "/favicon.ico"
  },
};

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
      className={`${cormorant.variable} ${inter.variable} ${marckScript.variable}`}
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
