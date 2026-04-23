import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/shared/components/layout/Footer";
import Header from "@/shared/components/layout/Header";

const inter = Inter({ subsets: ["latin"] })

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
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <div className="min-h-screen">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
