"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, CheckSquare, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/jury/dashboard", label: "Review Applications", icon: ClipboardList },
  { href: "/jury/dashboard/scores", label: "Submitted Scores", icon: CheckSquare },
];

function isActive(pathname: string, href: string) {
  if (href === "/jury/dashboard/scores") return pathname === "/jury/dashboard/scores";
  if (href === "/jury/dashboard") return pathname === "/jury/dashboard" || pathname.startsWith("/jury/dashboard/applications");
  return false;
}

export default function JurySidebar({ juryName, expertiseAreas }: { juryName?: string; expertiseAreas?: string[] }) {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:shrink-0">
        <div className="sticky top-6 flex flex-col gap-3">
          {/* Member card */}
          <div className="rounded-[22px] bg-[#10203B] p-5 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50">
              Jury Panel
            </p>
            {juryName ? (
              <p className="mt-1.5 text-base font-semibold">{juryName}</p>
            ) : (
              <p className="mt-1.5 text-base font-semibold">Jury Dashboard</p>
            )}
            {expertiseAreas && expertiseAreas.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {expertiseAreas.slice(0, 3).map((area) => (
                  <span key={area} className="inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                    {area}
                  </span>
                ))}
              </div>
            )}
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
              <button
                type="button"
                onClick={() => void signOut({ callbackUrl: "/jury/login" })}
                className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-700"
              >
                <LogOut size={16} strokeWidth={1.8} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom nav ────────────────────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden">
        <div className="mx-auto grid max-w-sm grid-cols-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-4 py-3 text-center transition-colors ${
                  active ? "text-[#10203B]" : "text-slate-400 hover:text-[#4C7D9D]"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.8} />
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
