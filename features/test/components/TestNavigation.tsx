import Link from "next/link";
import { Beaker, FileSearch, Mail, Scale, Ticket, UserRoundPlus } from "lucide-react";

const items = [
  { href: "/test", label: "Dashboard", icon: Beaker },
  { href: "/test/applicant", label: "Applicants", icon: UserRoundPlus },
  { href: "/test/jury", label: "Jury", icon: Scale },
  { href: "/test/emails", label: "Emails", icon: Mail },
  { href: "/test/tickets", label: "Tickets", icon: Ticket },
  { href: "/test/creations", label: "Creations", icon: FileSearch },
];

export function TestNavigation() {
  return (
    <nav aria-label="Test system" className="mb-5 flex gap-2 overflow-x-auto rounded-[24px] border border-[rgba(114,160,193,0.18)] bg-white/70 p-2 shadow-sm backdrop-blur-xl">
      {items.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[18px] px-4 text-xs font-semibold uppercase tracking-[0.09em] text-[var(--color-ink-soft)] transition hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]">
          <Icon aria-hidden size={15} />
          {label}
        </Link>
      ))}
    </nav>
  );
}

