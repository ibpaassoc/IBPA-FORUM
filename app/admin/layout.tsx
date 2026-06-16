import type { ReactNode } from "react";
import AdminSidebar from "@/features/admin/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F7FB] font-[var(--font-inter)]">
      <div className="mx-auto flex w-full max-w-[1400px] items-start gap-6 px-4 py-6 md:px-6 lg:py-8">
        <AdminSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
