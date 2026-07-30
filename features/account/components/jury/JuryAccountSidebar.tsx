"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import {
  Drawer,
  FloatingActionButton,
  IconButton,
} from "@/shared/components/admin/DashboardUI";

const navItems = [
  { href: "/account/jury", label: "Overview", shortLabel: "Overview", icon: LayoutDashboard },
  { href: "/account/jury/nominations", label: "Nominations", shortLabel: "Queue", icon: ClipboardList },
  { href: "/account/jury/completed", label: "Completed", shortLabel: "Done", icon: CheckCircle2 },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/account/jury") return pathname === href;
  if (href === "/account/jury/nominations") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href;
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

export default function JuryAccountSidebar({
  juryName,
  email,
  approvedCategories,
}: {
  juryName: string;
  email: string;
  approvedCategories: string[];
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const initial = juryName.slice(0, 1).toUpperCase();

  return (
    <>
      <aside className={`hidden shrink-0 transition-[width] duration-300 lg:block ${collapsed ? "w-[96px]" : "w-[264px]"}`}>
        <div className="sticky top-6 flex min-h-[calc(100vh-3rem)] flex-col rounded-[34px] border border-[rgba(114,160,193,0.2)] bg-white/78 p-3 shadow-[0_28px_90px_rgba(37,42,45,0.09)] backdrop-blur-2xl">
          <div className={`flex items-center gap-2 rounded-[26px] border border-white/70 bg-[rgba(185,217,235,0.22)] p-3 ${collapsed ? "justify-center" : "justify-between"}`}>
            {collapsed ? null : (
              <Link href="/account/jury" className="min-w-0">
                <p className="font-[var(--font-title-family)] text-[1.85rem] font-light leading-none tracking-[-0.04em] text-[var(--color-ink)]">IBPA</p>
                <p className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-soft)]">Jury account</p>
              </Link>
            )}
            <IconButton
              label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              icon={collapsed ? PanelLeftOpen : PanelLeftClose}
              onClick={() => setCollapsed((value) => !value)}
              className="size-9 shrink-0"
            />
          </div>

          <nav className="mt-3 flex flex-col gap-1" aria-label="Jury account navigation">
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
                  {collapsed ? null : <span className="truncate">{label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-[rgba(37,42,45,0.08)] pt-3">
            <div className={`flex items-center gap-3 rounded-[20px] px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-wash)] font-[var(--font-title-family)] text-base text-[var(--color-blue)] shadow-sm">{initial}</div>
              {collapsed ? null : (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-ink)]">{juryName}</p>
                  <p className="truncate text-[0.72rem] text-[var(--color-ink-soft)]">{email}</p>
                </div>
              )}
            </div>
            <SignOutButton compact={collapsed} />
          </div>
        </div>
      </aside>

      <FloatingActionButton label="Open jury menu" icon={MoreHorizontal} onClick={() => setDrawerOpen(true)} className="lg:hidden" side="left" />

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} title="Jury account">
        <div className="space-y-4">
          <div className="rounded-[24px] border border-white/70 bg-[rgba(185,217,235,0.24)] p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/80 font-[var(--font-title-family)] text-lg text-[var(--color-blue)] shadow-sm">{initial}</div>
              <div className="min-w-0">
                <p className="truncate font-[var(--font-title-family)] text-xl font-light text-[var(--color-ink)]">{juryName}</p>
                <p className="truncate text-xs text-[var(--color-ink-soft)]">{email}</p>
              </div>
            </div>
            {approvedCategories.length > 0 ? (
              <div className="mt-3">
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
                  Approved categories
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {approvedCategories.map((category) => <span key={category} className="rounded-full border border-[rgba(114,160,193,0.22)] bg-white/72 px-2.5 py-1 text-[0.62rem] font-semibold text-[var(--color-ink-soft)]">{category}</span>)}
                </div>
              </div>
            ) : null}
          </div>
          <nav className="grid gap-2" aria-label="Jury mobile navigation">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link key={href} href={href} onClick={() => setDrawerOpen(false)} className={`flex min-h-12 items-center gap-3 rounded-[18px] px-4 text-sm font-semibold transition ${active ? "bg-[var(--color-blue)] text-white" : "bg-white/72 text-[var(--color-ink)] hover:bg-[var(--color-blue-wash)]"}`}>
                  <Icon aria-hidden size={17} />{label}
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
