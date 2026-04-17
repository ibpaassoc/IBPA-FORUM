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
    <footer className="w-full border-t border-white/10 bg-[linear-gradient(180deg,#03143b,#041a46_55%,#061e4f)] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(216,194,122,0.1),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-8 md:p-10">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
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

              <p className="mt-6 text-sm leading-8 text-white/75">
                Celebrating excellence in the global beauty industry and
                recognizing professionals shaping the future of beauty.
              </p>
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
                        className="text-sm text-white/75 transition hover:text-[#d8c27a]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="text-sm text-white/75 transition hover:text-[#d8c27a]"
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
                className="text-sm text-white/75 transition hover:text-[#d8c27a]"
              >
                info@ibpa-awards.com
              </a>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <p>Copyright 2026 IBPA Beauty Awards. All rights reserved.</p>
            <p>Open to global participants.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
