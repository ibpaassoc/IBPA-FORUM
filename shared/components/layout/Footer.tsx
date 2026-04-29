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
    <footer className="w-full border-t border-white/10 bg-[linear-gradient(180deg,#111214,#131416_55%,#161719)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-10 md:grid-cols-2 xl:grid-cols-[1.45fr_1fr_1fr_1fr_1fr]">
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

            <p className="mt-6 text-sm leading-8 text-[#d9d4ca]">
              Celebrating excellence in the global beauty industry and
              recognizing professionals shaping the future of beauty.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <JuryMenu />
              <Link
                href="/apply"
                className="inline-flex items-center justify-center rounded-full bg-[#d8c27a] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#111111] transition hover:opacity-90"
              >
                Apply Now
              </Link>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-[#d8c27a]">
                {column.title}
              </h4>
              <div className="flex flex-col gap-4">
                {column.links.map((link) =>
                  link.href.startsWith("mailto:") ? (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-sm text-white/72 transition hover:text-[#d8c27a]"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-sm text-white/72 transition hover:text-[#d8c27a]"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          ))}

          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-[#d8c27a]">
              Contact
            </h4>
            <a
              href="mailto:info@ibpa-awards.com"
              className="text-sm text-white/72 transition hover:text-[#d8c27a]"
            >
              info@ibpa-awards.com
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 text-sm text-white/56 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 IBPA Beauty Awards. All rights reserved.</p>
          <p>Open to global participants.</p>
        </div>
      </div>
    </footer>
  );
}
