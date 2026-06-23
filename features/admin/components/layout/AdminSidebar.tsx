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
            className="rounded-[18px] border border-[var(--color-blue-soft)] bg-[linear-gradient(135deg,rgba(185,217,235,0.4),rgba(255,255,255,0.82))] p-4 text-[var(--color-ink)] shadow-[0_18px_44px_rgba(114,160,193,0.16)] backdrop-blur-xl"
          >
            <p
              className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-blue)]"
              style={{ fontFamily: "var(--font-ui-family)" }}
            >
              IBPA Admin
            </p>
            <p
              className="mt-1.5 text-[1.05rem] font-light leading-tight text-[var(--color-ink)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Admin dashboard
            </p>
          </div>

          {/* Nav card */}
          <div className="rounded-[18px] border border-[var(--border-default)] bg-white/84 p-2 shadow-[0_18px_44px_rgba(3,2,19,0.06)] backdrop-blur-xl">
            <nav className="flex flex-col gap-0.5">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex min-h-[42px] items-center gap-3 rounded-[10px] px-3 text-[0.8rem] transition-all duration-150 ${
                      active
                        ? "bg-[var(--color-blue-wash)] text-[var(--color-ink)]"
                        : "text-[var(--color-ink-soft)] hover:bg-[var(--surface-tint)] hover:text-[var(--color-ink)]"
                    }`}
                    style={{ fontFamily: "var(--font-ui-family)" }}
                  >
                    <Icon
                      aria-hidden
                      size={16}
                      strokeWidth={1.8}
                      className={active ? "text-[var(--color-blue)]" : "text-[var(--color-ink-muted)]"}
                    />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-2 border-t border-[var(--border-soft)] pt-2">
              <form action={logoutAdminAction}>
                <button
                  type="submit"
                  className="flex min-h-[42px] w-full items-center gap-3 rounded-[10px] px-3 text-[0.8rem] text-[var(--color-ink-soft)] transition-all duration-150 hover:bg-red-50 hover:text-red-600"
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
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border-default)] bg-white/92 shadow-[0_-12px_32px_rgba(3,2,19,0.06)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1 px-2 py-2">
          {navItems.map(({ href, shortLabel, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-[10px] px-1 text-center text-[0.62rem] transition-all duration-150 ${
                  active ? "bg-[var(--color-blue-wash)] text-[var(--color-ink)]" : "text-[var(--color-ink-soft)]"
                }`}
                style={{ fontFamily: "var(--font-ui-family)" }}
              >
                <Icon
                  aria-hidden
                  size={18}
                  strokeWidth={active ? 2 : 1.7}
                  className={active ? "text-[var(--color-blue)]" : ""}
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
