"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Star,
  Ticket,
  LayoutGrid,
  FileText,
  LogOut,
} from "lucide-react";
import { logoutAdminAction } from "@/features/admin/actions/auth.actions";

const navItems = [
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/jury-applications", label: "Jury", icon: Users },
  { href: "/admin/scoring", label: "Scoring", icon: Star },
  { href: "/admin/tickets", label: "Tickets & Check-in", icon: Ticket },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin/applications") return pathname.startsWith("/admin/applications");
  if (href === "/admin/jury-applications") return pathname.startsWith("/admin/jury-applications");
  if (href === "/admin/scoring") return pathname.startsWith("/admin/scoring");
  if (href === "/admin/tickets") return pathname.startsWith("/admin/tickets");
  return false;
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:shrink-0">
        <div className="sticky top-6 flex flex-col gap-3">
          {/* Brand card */}
          <div className="rounded-[22px] bg-[#10203B] p-5 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50">
              IBPA Admin
            </p>
            <p className="mt-1.5 text-base font-semibold">Dashboard</p>
          </div>

          {/* Nav */}
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-3 shadow-[0_12px_34px_rgba(15,23,42,0.06)]">
            <nav className="space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-[#10203B] text-white shadow-[0_10px_24px_rgba(16,32,59,0.16)]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-[#10203B]"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={active ? "text-white" : "text-[#4C7D9D]"}
                      strokeWidth={1.8}
                    />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 border-t border-slate-100 pt-3">
              <form action={logoutAdminAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut size={16} strokeWidth={1.8} />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom nav ────────────────────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-2 py-3 text-center transition-colors ${
                  active ? "text-[#10203B]" : "text-slate-400 hover:text-[#4C7D9D]"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2 : 1.8}
                  className={active ? "text-[#10203B]" : ""}
                />
                <span className="text-[10px] font-semibold leading-none">
                  {label.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
