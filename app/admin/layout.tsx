import type { ReactNode } from "react";
import AdminSidebar from "@/features/admin/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white font-[var(--font-inter)] text-[#0A0A0A]">
      <div className="mx-auto flex w-full max-w-[1440px] items-start gap-5 px-4 py-5 md:px-6 lg:py-7">
        <AdminSidebar />
        <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>
      </div>
    </div>
  );
}
