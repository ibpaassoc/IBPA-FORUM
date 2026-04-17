import Image from "next/image";
import Link from "next/link";

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
    <footer className="w-full px-3 pb-3 pt-6 text-white sm:px-5 sm:pb-5">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] border border-[#d8c27a]/16 bg-[linear-gradient(135deg,rgba(16,16,18,0.96),rgba(10,19,36,0.94)_52%,rgba(23,25,29,0.94))] shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(216,194,122,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_24%)]" />

        <div className="relative px-5 py-10 sm:px-7 lg:px-8 lg:py-12">
          <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-10 md:grid-cols-2 xl:grid-cols-[1.45fr_1fr_1fr_1fr_1fr]">
            <div className="max-w-sm">
              <Link href="/" className="inline-flex items-center">
                <Image
                  src="/logo.svg"
                  alt="IBPA Logo"
                  width={220}
                  height={80}
                  className="h-14 w-auto object-contain"
                />
              </Link>

              <p className="mt-6 text-sm leading-8 text-[#d9d4ca]">
                Celebrating excellence in the global beauty industry and
                recognizing professionals shaping the future of beauty.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/apply/jury"
                  className="inline-flex items-center justify-center rounded-full border border-[#d8c27a]/35 bg-white/5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8] transition hover:border-[#d8c27a] hover:bg-white/8 hover:text-[#d8c27a]"
                >
                  Apply as Jury
                </Link>
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
      </div>
    </footer>
  );
}
