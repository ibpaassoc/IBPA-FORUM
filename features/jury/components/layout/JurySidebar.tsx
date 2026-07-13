"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  ClipboardList,
  LogOut,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  Drawer,
  FloatingActionButton,
  IconButton,
  MobileBottomNavigation,
} from "@/shared/components/admin/DashboardUI";

const navItems = [
  { href: "/account/jury", label: "Review Queue", shortLabel: "Queue", icon: ClipboardList },
  { href: "/jury/dashboard/scores", label: "Scores", shortLabel: "Scores", icon: CheckSquare },
];

function isActive(pathname: string, href: string) {
  if (href === "/jury/dashboard/scores") return pathname === href;
  return pathname === href || pathname.startsWith("/account/jury/nominations");
}

function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/account/login" })}
      className="flex min-h-11 w-full items-center justify-center gap-3 rounded-[18px] border border-transparent px-3 text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-soft)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
    >
      <LogOut aria-hidden size={16} strokeWidth={1.8} />
      {compact ? null : <span>Sign out</span>}
    </button>
  );
}

export default function JurySidebar({
  juryName,
  expertiseAreas,
}: {
  juryName?: string;
  expertiseAreas?: string[];
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mobileItems = navItems.map((item) => ({
    href: item.href,
    label: item.shortLabel,
    icon: item.icon,
    active: isActive(pathname, item.href),
  }));

  return (
    <>
      <aside
        className={`hidden shrink-0 transition-[width] duration-300 lg:block ${
          collapsed ? "w-[96px]" : "w-[260px]"
        }`}
      >
        <div className="sticky top-6 flex max-h-[calc(100vh-3rem)] flex-col gap-3">
          <div className="rounded-[34px] border border-[rgba(114,160,193,0.2)] bg-white/76 p-3 shadow-[0_28px_90px_rgba(37,42,45,0.09)] backdrop-blur-2xl">
            <div className="rounded-[26px] bg-[linear-gradient(135deg,rgba(185,217,235,0.34),rgba(255,255,255,0.78))] p-3">
              <div className="flex items-start justify-between gap-2">
                <Link href="/account/jury" className="min-w-0">
                  <p className="font-[var(--font-title-family)] text-[1.45rem] font-light leading-none tracking-[-0.03em] text-[var(--color-ink)]">
                    IBPA
                  </p>
                  {!collapsed ? (
                    <p className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
                      Jury panel
                    </p>
                  ) : null}
                </Link>
                <IconButton
                  label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  icon={collapsed ? PanelLeftOpen : PanelLeftClose}
                  onClick={() => setCollapsed((value) => !value)}
                  className="size-9 shrink-0"
                />
              </div>

              {!collapsed ? (
                <div className="mt-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/72 font-[var(--font-title-family)] text-lg text-[var(--color-blue)] shadow-sm">
                      {(juryName || "J").slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
                        {juryName || "Jury dashboard"}
                      </p>
                      <p className="font-[var(--font-accent-family)] text-sm italic text-[var(--color-blue)]">
                        Review with excellence.
                      </p>
                    </div>
                  </div>
                  {expertiseAreas && expertiseAreas.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {expertiseAreas.slice(0, 3).map((area) => (
                        <span
                          key={area}
                          className="rounded-full border border-[rgba(114,160,193,0.22)] bg-white/68 px-2.5 py-1 text-[0.62rem] font-semibold text-[var(--color-ink-soft)]"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <nav className="mt-3 flex flex-col gap-1" aria-label="Jury navigation">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);

                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? label : undefined}
                    className={`group flex min-h-12 items-center gap-3 rounded-[20px] px-3 text-[0.86rem] transition ${
                      active
                        ? "bg-[var(--color-blue)] text-white shadow-[0_14px_34px_rgba(114,160,193,0.28)]"
                        : "text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <Icon aria-hidden size={18} strokeWidth={active ? 2 : 1.75} />
                    {!collapsed ? <span className="truncate">{label}</span> : null}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 border-t border-[rgba(37,42,45,0.08)] pt-3">
              <SignOutButton compact={collapsed} />
            </div>
          </div>
        </div>
      </aside>

      <MobileBottomNavigation items={mobileItems} className="max-w-sm sm:left-1/2 sm:right-auto sm:w-full sm:-translate-x-1/2" />
      <FloatingActionButton
        label="Open jury menu"
        icon={MoreHorizontal}
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden"
      />

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} title="Jury Panel">
        <div className="space-y-4">
          <div className="rounded-[24px] bg-[linear-gradient(135deg,rgba(185,217,235,0.32),rgba(255,255,255,0.86))] p-4">
            <p className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
              {juryName || "Jury dashboard"}
            </p>
            {expertiseAreas && expertiseAreas.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {expertiseAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-[rgba(114,160,193,0.22)] bg-white/70 px-2.5 py-1 text-[0.65rem] font-semibold text-[var(--color-ink-soft)]"
                  >
                    {area}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <nav className="grid gap-2" aria-label="Jury drawer navigation">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex min-h-12 items-center justify-between rounded-[18px] px-4 text-sm font-semibold transition ${
                    active
                      ? "bg-[var(--color-blue)] text-white"
                      : "bg-white/72 text-[var(--color-ink)] hover:bg-[var(--color-blue-wash)]"
                  }`}
                >
                  <span className="inline-flex items-center gap-3">
                    <Icon aria-hidden size={17} />
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>
          <SignOutButton />
        </div>
      </Drawer>
    </>
  );
}
