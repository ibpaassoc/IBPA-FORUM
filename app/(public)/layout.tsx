import type { ReactNode } from "react";
import Footer from "@/shared/components/layout/Footer";
import Header from "@/shared/components/layout/Header";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <div className="min-h-screen w-full overflow-x-clip overflow-y-visible">
        {children}
      </div>
      <Footer />
    </>
  );
}
