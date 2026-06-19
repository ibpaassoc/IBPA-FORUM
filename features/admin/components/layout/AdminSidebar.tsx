"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LogOut, Star, Ticket, Users } from "lucide-react";
import { logoutAdminAction } from "@/features/admin/actions/auth.actions";

const navItems = [
  { href: "/admin/applications", label: "Applications", shortLabel: "Apps", icon: FileText },
  { href: "/admin/jury-applications", label: "Jury", shortLabel: "Jury", icon: Users },
  { href: "/admin/scoring", label: "Scoring", shortLabel: "Scores", icon: Star },
  { href: "/admin/tickets", label: "Tickets", shortLabel: "Tickets", icon: Ticket },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-[232px] shrink-0 lg:block">
        <div className="sticky top-5 flex flex-col gap-3">
          <div className="rounded-lg border border-[#6b8a9f] bg-[#7a98af] p-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
              IBPA
            </p>
            <p className="mt-2 text-lg font-semibold leading-tight">Admin dashboard</p>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-2 shadow-[0_18px_50px_rgba(10,10,10,0.06)]">
            <nav className="flex flex-col gap-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${
                      active
                        ? "bg-[#EAF6FF] text-[#0A0A0A]"
                        : "text-black/55 hover:bg-[#FAFAFA] hover:text-[#0A0A0A]"
                    }`}
                  >
                    <Icon
                      aria-hidden
                      size={17}
                      strokeWidth={1.9}
                      className={active ? "text-[#1673A5]" : "text-black/35"}
                    />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-2 border-t border-black/10 pt-2">
              <form action={logoutAdminAction}>
                <button
                  type="submit"
                  className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold text-black/55 transition hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut aria-hidden size={17} strokeWidth={1.9} />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 shadow-[0_-12px_30px_rgba(10,10,10,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1 px-2 py-2">
          {navItems.map(({ href, shortLabel, icon: Icon }) => {
            const active = isActive(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-center text-[11px] font-semibold transition ${
                  active ? "bg-[#EAF6FF] text-[#0A0A0A]" : "text-black/45"
                }`}
              >
                <Icon
                  aria-hidden
                  size={18}
                  strokeWidth={active ? 2 : 1.8}
                  className={active ? "text-[#1673A5]" : ""}
                />
                <span className="truncate">{shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
