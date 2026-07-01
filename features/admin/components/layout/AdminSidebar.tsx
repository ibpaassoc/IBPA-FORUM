"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  ScanLine,
  Star,
  Ticket,
  Users,
} from "lucide-react";
import { useState } from "react";
import { logoutAdminAction } from "@/features/admin/actions/auth.actions";
import { adminT } from "@/lib/i18n/admin";
import {
  Drawer,
  FloatingActionButton,
  IconButton,
  MobileBottomNavigation,
} from "@/shared/components/admin/DashboardUI";

const navItems = [
  { href: "/admin", ...adminT.nav.overview, icon: LayoutDashboard },
  { href: "/admin/applications", ...adminT.nav.applications, icon: FileText },
  { href: "/admin/jury-applications", ...adminT.nav.jury, icon: Users },
  { href: "/admin/scoring", ...adminT.nav.scoring, icon: Star },
  { href: "/admin/tickets", ...adminT.nav.tickets, icon: Ticket },
  { href: "/admin/scanner", ...adminT.nav.scanner, icon: ScanLine },
  { href: "/admin/google-sheets", ...adminT.nav.sheets, icon: FileSpreadsheet },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={logoutAdminAction}>
      <button
        type="submit"
        className="flex min-h-11 w-full items-center justify-center gap-3 rounded-[18px] border border-transparent px-3 text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-soft)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
      >
        <LogOut aria-hidden size={16} strokeWidth={1.8} />
        {compact ? null : <span>{adminT.nav.signOut}</span>}
      </button>
    </form>
  );
}

// Review detail routes own the mobile bottom area with their own sticky action
// bar, so the global bottom nav + FAB are hidden there to avoid overlap.
function isReviewDetailRoute(pathname: string) {
  return /^\/admin\/(applications|jury-applications)\/[^/]+$/.test(pathname);
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hideMobileChrome = isReviewDetailRoute(pathname);

  const mobileItems = navItems.map((item) => ({
    href: item.href,
    label: item.short,
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
            <div className={`flex items-center gap-2 rounded-[26px] bg-[linear-gradient(135deg,rgba(185,217,235,0.34),rgba(255,255,255,0.78))] p-3 ${collapsed ? "justify-center" : "justify-between"}`}>
              {!collapsed && (
                <Link href="/admin" className="min-w-0">
                  <p className="font-[var(--font-title-family)] text-[1.85rem] font-light leading-none tracking-[-0.04em] text-[var(--color-ink)]">
                    IBPA
                  </p>
                  <p className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-soft)]">
                    {adminT.nav.brandSub}
                  </p>
                </Link>
              )}
              <IconButton
                label={collapsed ? adminT.nav.expand : adminT.nav.collapse}
                icon={collapsed ? PanelLeftOpen : PanelLeftClose}
                onClick={() => setCollapsed((value) => !value)}
                className="size-9 shrink-0"
              />
            </div>

            <nav className="mt-3 flex flex-col gap-1" aria-label="Admin navigation">
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
              <div
                className={`mb-2 flex items-center gap-3 rounded-[22px] bg-white/58 p-3 ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-wash)] font-[var(--font-title-family)] text-lg text-[var(--color-blue)]">
                  A
                </div>
                {!collapsed ? (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--color-ink)]">{adminT.nav.adminDesk}</p>
                    <p className="text-xs text-[var(--color-ink-soft)]">IBPA 2026</p>
                  </div>
                ) : null}
              </div>
              <SignOutButton compact={collapsed} />
            </div>
          </div>
        </div>
      </aside>

      {!hideMobileChrome ? (
        <>
          <MobileBottomNavigation items={mobileItems} />
          <FloatingActionButton
            label={adminT.nav.openMenu}
            icon={MoreHorizontal}
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden"
          />
        </>
      ) : null}

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} title={adminT.nav.drawerTitle}>
        <div className="space-y-4">
          <div className="rounded-[24px] bg-[linear-gradient(135deg,rgba(185,217,235,0.32),rgba(255,255,255,0.86))] p-4">
            <p className="font-[var(--font-accent-family)] text-lg italic text-[var(--color-blue)]">
              {adminT.nav.drawerBrand}
            </p>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
              {adminT.nav.drawerText}
            </p>
          </div>
          <nav className="grid gap-2" aria-label="Admin drawer navigation">
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
