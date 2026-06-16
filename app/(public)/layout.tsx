import type { ReactNode } from "react";
import Footer from "@/shared/components/layout/Footer";
import Header from "@/shared/components/layout/Header";
import PageTransitionWrapper from "@/shared/components/layout/PageTransitionWrapper";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <PageTransitionWrapper>{children}</PageTransitionWrapper>
      <Footer />
    </>
  );
}
