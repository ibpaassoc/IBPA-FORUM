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
      {/* Desktop sidebar */}
      <aside className="hidden w-[232px] shrink-0 lg:block">
        <div className="sticky top-5 flex flex-col gap-3">

          {/* Identity card */}
          <div
            className="rounded-[14px] border border-[#5c8aaa] p-4 text-white"
            style={{
              background: "linear-gradient(135deg, #7a98af 0%, #5c8aaa 100%)",
              boxShadow: "0 6px 24px rgba(114,160,193,0.25)",
            }}
          >
            <p
              className="text-[0.65rem] uppercase tracking-[0.18em] text-white/75"
              style={{ fontFamily: "var(--font-ui-family)" }}
            >
              IBPA Admin
            </p>
            <p
              className="mt-1.5 text-[1.05rem] font-light leading-tight text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Admin dashboard
            </p>
          </div>

          {/* Nav card */}
          <div className="rounded-[14px] border border-black/[0.07] bg-white p-2 shadow-[0_4px_20px_rgba(3,2,19,0.05)]">
            <nav className="flex flex-col gap-0.5">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex min-h-[42px] items-center gap-3 rounded-[10px] px-3 text-[0.8rem] transition-all duration-150 ${
                      active
                        ? "bg-[#f2f8fb] text-[#030213]"
                        : "text-black/50 hover:bg-[#f8f8f6] hover:text-[#030213]"
                    }`}
                    style={{ fontFamily: "var(--font-ui-family)" }}
                  >
                    <Icon
                      aria-hidden
                      size={16}
                      strokeWidth={1.8}
                      className={active ? "text-[#72a0c1]" : "text-black/30"}
                    />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-2 border-t border-black/[0.06] pt-2">
              <form action={logoutAdminAction}>
                <button
                  type="submit"
                  className="flex min-h-[42px] w-full items-center gap-3 rounded-[10px] px-3 text-[0.8rem] text-black/40 transition-all duration-150 hover:bg-red-50 hover:text-red-600"
                  style={{ fontFamily: "var(--font-ui-family)" }}
                >
                  <LogOut aria-hidden size={16} strokeWidth={1.8} />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/[0.07] bg-white/96 shadow-[0_-8px_24px_rgba(3,2,19,0.06)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1 px-2 py-2">
          {navItems.map(({ href, shortLabel, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-[10px] px-1 text-center text-[0.62rem] transition-all duration-150 ${
                  active ? "bg-[#f2f8fb] text-[#030213]" : "text-black/40"
                }`}
                style={{ fontFamily: "var(--font-ui-family)" }}
              >
                <Icon
                  aria-hidden
                  size={18}
                  strokeWidth={active ? 2 : 1.7}
                  className={active ? "text-[#72a0c1]" : ""}
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
