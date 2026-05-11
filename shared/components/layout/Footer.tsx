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
    <footer className="w-full border-t border-(--border-default) bg-(--color-blue-wash) py-(--space-xl) pb-(--space-lg) text-(--color-ink-soft)">
      <div className="mx-auto max-w-(--content-width) px-(--page-gutter)">
        <div className="grid grid-cols-1 gap-(--space-lg) border-b border-border-footer pb-(--space-lg) md:grid-cols-2 xl:grid-cols-[1.45fr_1fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/logo_black.png"
                alt="IBPA Logo"
                width={320}
                height={80}
                className="h-14 w-auto object-contain"
              />
            </Link>

            <p className="mt-(--space-md) text-[clamp(0.875rem,1.5vw,1rem)] leading-[1.7] text-(--color-ink-soft)">
              Celebrating excellence in the global beauty industry and
              recognizing professionals shaping the future of beauty.
            </p>

            <div className="mt-(--space-md) flex flex-wrap gap-3">
              <JuryMenu className="ibpa-button-ghost" />
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
              <h4 className="mb-(--space-sm) font-(--font-sans) text-[0.72rem] font-medium uppercase tracking-[0.18em] text-(--color-title-accent)">
                {column.title}
              </h4>
              <div className="flex flex-col gap-(--space-sm)">
                {column.links.map((link) =>
                  link.href.startsWith("mailto:") ? (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-sm text-(--color-ink-soft) transition hover:text-(--color-hover)"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-sm text-(--color-ink-soft) transition hover:text-(--color-hover)"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          ))}

          <div>
            <h4 className="mb-(--space-sm) font-(--font-sans) text-[0.72rem] uppercase tracking-[0.18em] text-(--color-title-accent)">
              Contact
            </h4>
            <a
              href="mailto:info@ibpa-awards.com"
              className="text-sm text-(--color-ink-soft) transition hover:text-(--color-hover)"
            >
              info@ibpa-awards.com
            </a>
          </div>
        </div>

        <div className="mt-(--space-md) flex flex-col gap-(--space-sm) text-[0.75rem] text-(--color-ink-muted) sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 IBPA Beauty Awards. All rights reserved.</p>
          <p className="script-accent text-[1.4rem]">Open to global participants.</p>
        </div>
      </div>
    </footer>
  );
}
