import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border-main bg-[#03143b] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <a href="/" className="inline-flex items-center">
              <Image
                src="/logo.png"
                alt="IBPA Logo"
                width={220}
                height={80}
                className="h-14 w-auto object-contain"
              />
            </a>

            <p className="mt-6 text-sm leading-8 text-white/75">
              Celebrating excellence in the global beauty industry and
              recognizing professionals shaping the future of beauty.
            </p>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-yellow-500">
              About
            </h4>
            <div className="flex flex-col gap-4">
              <a href="#" className="text-sm text-white/75 transition hover:text-yellow-500">
                About Awards
              </a>
              <a href="#" className="text-sm text-white/75 transition hover:text-yellow-500">
                How It Works
              </a>
              <a href="#" className="text-sm text-white/75 transition hover:text-yellow-500">
                Timeline
              </a>
              <a href="#" className="text-sm text-white/75 transition hover:text-yellow-500">
                FAQ
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-yellow-500">
              Awards
            </h4>
            <div className="flex flex-col gap-4">
              <a href="#" className="text-sm text-white/75 transition hover:text-yellow-500">
                Categories
              </a>
              <a href="#" className="text-sm text-white/75 transition hover:text-yellow-500">
                Jury
              </a>
              <a href="#" className="text-sm text-white/75 transition hover:text-yellow-500">
                Judging Process
              </a>
              <a href="#" className="text-sm text-white/75 transition hover:text-yellow-500">
                Past Winners
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-yellow-500">
              Resources
            </h4>
            <div className="flex flex-col gap-4">
              <a href="#" className="text-sm text-white/75 transition hover:text-yellow-500">
                Media Centre
              </a>
              <a href="#" className="text-sm text-white/75 transition hover:text-yellow-500">
                Contact
              </a>
              <a href="#" className="text-sm text-white/75 transition hover:text-yellow-500">
                Terms & Conditions
              </a>
              <a href="#" className="text-sm text-white/75 transition hover:text-yellow-500">
                Privacy Policy
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-yellow-500">
              Contact
            </h4>
            <a
              href="mailto:info@ibpa-awards.com"
              className="text-sm text-white/75 transition hover:text-yellow-500"
            >
              info@ibpa-awards.com
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 IBPA Beauty Awards. All rights reserved.</p>
          <p>Open to global participants.</p>
        </div>
      </div>
    </footer>
  );
}
