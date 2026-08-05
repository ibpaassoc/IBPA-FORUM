"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Beaker, Code2, FileSearch, Mail, Scale, Ticket, UserRoundPlus } from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/test", label: "Dashboard", icon: Beaker },
  { href: "/test/applicant", label: "Applicants", icon: UserRoundPlus },
  { href: "/test/jury", label: "Jury", icon: Scale },
  { href: "/test/dev-accounts", label: "DEV accounts", icon: Code2 },
  { href: "/test/emails", label: "Emails", icon: Mail },
  { href: "/test/tickets", label: "Tickets", icon: Ticket },
  { href: "/test/creations", label: "Creations", icon: FileSearch },
];

export function TestNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Test system" className="sticky top-3 z-40 mb-8 flex gap-1.5 overflow-x-auto rounded-[20px] border border-white/[0.09] bg-[#111216]/80 p-1.5 shadow-[0_18px_48px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/test" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[15px] px-3.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] transition",
              active
                ? "bg-white text-zinc-950 shadow-[0_8px_22px_rgba(255,255,255,0.12)]"
                : "text-zinc-500 hover:bg-white/[0.06] hover:text-white",
            )}
          >
            <Icon aria-hidden size={14} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
