"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Ticket,
  UserRound,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  Drawer,
  FloatingActionButton,
  IconButton,
} from "@/shared/components/admin/DashboardUI";

const navItemDefs = [
  { href: "/account/applicant", key: "overview", shortKey: "overviewShort", icon: LayoutDashboard },
  { href: "/account/applicant/nominations", key: "nominations", shortKey: "nominationsShort", icon: FileText },
  { href: "/account/applicant/tickets", key: "tickets", shortKey: "ticketsShort", icon: Ticket },
  { href: "/account/applicant/profile", key: "profile", shortKey: "profileShort", icon: UserRound },
  { href: "/account/applicant/settings", key: "settings", shortKey: "settingsShort", icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/account/applicant") return pathname === href;
  if (href === "/account/applicant/nominations") {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      pathname === "/account/applicant/add-nomination"
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SignOutButton({ compact = false, label }: { compact?: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/account/login" })}
      className="flex min-h-11 w-full items-center justify-center gap-3 rounded-[18px] border border-transparent px-3 text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-soft)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
    >
      <LogOut aria-hidden size={16} strokeWidth={1.8} />
      {compact ? null : <span>{label}</span>}
    </button>
  );
}

export default function ApplicantSidebar({
  applicantName,
  email,
}: {
  applicantName: string;
  email: string;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { t } = useLanguage();
  const nav = t.account.nav;

  const navItems = navItemDefs.map((item) => ({
    href: item.href,
    label: nav[item.key],
    icon: item.icon,
  }));

  return (
    <>
      <aside
        className={`hidden shrink-0 transition-[width] duration-300 lg:block ${
          collapsed ? "w-[96px]" : "w-[260px]"
        }`}
      >
        <div className="sticky top-6 flex max-h-[calc(100vh-3rem)] flex-col gap-3">
          <div className="flex min-h-[calc(100vh-3rem)] flex-col rounded-[34px] border border-[rgba(114,160,193,0.2)] bg-white/76 p-3 shadow-[0_28px_90px_rgba(37,42,45,0.09)] backdrop-blur-2xl">
            <div
              className={`flex items-center gap-2 rounded-[26px] bg-[linear-gradient(135deg,rgba(185,217,235,0.34),rgba(255,255,255,0.78))] p-3 ${
                collapsed ? "justify-center" : "justify-between"
              }`}
            >
              {!collapsed && (
                <Link href="/account/applicant" className="min-w-0">
                  <p className="font-[var(--font-title-family)] text-[1.85rem] font-light leading-none tracking-[-0.04em] text-[var(--color-ink)]">
                    IBPA
                  </p>
                  <p className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-soft)]">
                    {nav.brand}
                  </p>
                </Link>
              )}
              <IconButton
                label={collapsed ? nav.expandSidebar : nav.collapseSidebar}
                icon={collapsed ? PanelLeftOpen : PanelLeftClose}
                onClick={() => setCollapsed((value) => !value)}
                className="size-9 shrink-0"
              />
            </div>

            <nav className="mt-3 flex flex-col gap-1" aria-label={nav.navAria}>
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

            <div className="mt-auto border-t border-[rgba(37,42,45,0.08)] pt-3">
              <div
                className={`flex items-center gap-3 rounded-[20px] px-2 py-2 ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-wash)] font-[var(--font-title-family)] text-base text-[var(--color-blue)] shadow-sm">
                  {applicantName.slice(0, 1).toUpperCase()}
                </div>
                {!collapsed ? (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
                      {applicantName}
                    </p>
                    <p className="truncate text-[0.72rem] text-[var(--color-ink-soft)]">{email}</p>
                  </div>
                ) : null}
              </div>
              <SignOutButton compact={collapsed} label={nav.signOut} />
            </div>
          </div>
        </div>
      </aside>

      <FloatingActionButton
        label={nav.openMenu}
        icon={MoreHorizontal}
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden"
        side="left"
      />

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} title={nav.drawerTitle}>
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-[24px] bg-[linear-gradient(135deg,rgba(185,217,235,0.32),rgba(255,255,255,0.86))] p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/78 font-[var(--font-title-family)] text-lg text-[var(--color-blue)] shadow-sm">
              {applicantName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-[var(--font-title-family)] text-xl font-light text-[var(--color-ink)]">
                {applicantName}
              </p>
              <p className="truncate text-xs text-[var(--color-ink-soft)]">{email}</p>
            </div>
          </div>
          <nav className="grid gap-2" aria-label={nav.drawerAria}>
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
          <SignOutButton label={nav.signOut} />
        </div>
      </Drawer>
    </>
  );
}
