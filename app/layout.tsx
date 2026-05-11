import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Marck_Script } from "next/font/google";
import "./globals.css";
import Footer from "@/shared/components/layout/Footer";
import Header from "@/shared/components/layout/Header";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

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
  title: "IBPA Beauty Championship 2026",
  description: "Official IBPA website",
  icons: {
    icon: "/logo.svg", // or "/favicon.ico"
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${marckScript.variable}`}
    >
      <body>
        <LanguageProvider>
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
