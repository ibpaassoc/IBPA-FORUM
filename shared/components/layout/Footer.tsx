import Image from "next/image";
import Link from "next/link";
import JuryMenu from "@/shared/components/layout/JuryMenu";

const footerColumns = [
  {
    title: "About",
    links: [
      { href: "/", label: "About Awards" },
      { href: "/", label: "How It Works" },
      { href: "/grand-prix", label: "Timeline" },
      { href: "/", label: "FAQ" },
    ],
  },
  {
    title: "Awards",
    links: [
      { href: "/categories", label: "Categories" },
      { href: "/jury", label: "Jury" },
      { href: "/grand-prix", label: "Grand Prix" },
      { href: "/apply", label: "Apply" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/categories", label: "Media Centre" },
      { href: "mailto:info@ibpa-awards.com", label: "Contact" },
      { href: "/", label: "Terms & Conditions" },
      { href: "/", label: "Privacy Policy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--color-navy-deep)] py-[var(--space-xl)] pb-[var(--space-lg)] text-[rgba(255,255,255,0.5)]">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)]">
        <div className="grid grid-cols-1 gap-[var(--space-lg)] border-b border-[rgba(255,255,255,0.08)] pb-[var(--space-lg)] md:grid-cols-2 xl:grid-cols-[1.45fr_1fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/logo_white.png"
                alt="IBPA Logo"
                width={320}
                height={80}
                className="h-14 w-auto object-contain"
              />
            </Link>

            <p className="mt-[var(--space-md)] text-[clamp(0.875rem,1.5vw,1rem)] leading-[1.7] text-[rgba(255,255,255,0.5)]">
              Celebrating excellence in the global beauty industry and
              recognizing professionals shaping the future of beauty.
            </p>

            <div className="mt-[var(--space-md)] flex flex-wrap gap-3">
              <JuryMenu />
              <Link
                href="/apply"
                className="ibpa-button ibpa-button-gold"
              >
                Apply Now
              </Link>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-[var(--space-sm)] font-[var(--font-body)] text-[0.72rem] font-medium uppercase tracking-[0.18em] text-[var(--color-gold)]">
                {column.title}
              </h4>
              <div className="flex flex-col gap-[var(--space-sm)]">
                {column.links.map((link) =>
                  link.href.startsWith("mailto:") ? (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-sm text-[rgba(255,255,255,0.5)] transition hover:text-white"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-sm text-[rgba(255,255,255,0.5)] transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          ))}

          <div>
            <h4 className="mb-[var(--space-sm)] font-[var(--font-body)] text-[0.72rem] font-medium uppercase tracking-[0.18em] text-[var(--color-gold)]">
              Contact
            </h4>
            <a
              href="mailto:info@ibpa-awards.com"
              className="text-sm text-[rgba(255,255,255,0.5)] transition hover:text-white"
            >
              info@ibpa-awards.com
            </a>
          </div>
        </div>

        <div className="mt-[var(--space-md)] flex flex-col gap-[var(--space-sm)] text-[0.75rem] text-[rgba(255,255,255,0.5)] sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 IBPA Beauty Awards. All rights reserved.</p>
          <p className="text-[var(--color-gold)]">Open to global participants.</p>
        </div>
      </div>
    </footer>
  );
}
