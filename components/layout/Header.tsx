export default function Header() {
  return (
    <header className="w-full bg-background-header border-b border-border-main">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-6">

        {/* Logo */}
        <div className="text-primary text-2xl tracking-[0.25em] ">
          IBPA
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-10 text-[14px] uppercase tracking-[0.08em] ">

          <a
            href="/"
            className="text-text-main hover:text-primary transition"
          >
            Home
          </a>

          <a
            href="/categories"
            className="text-text-main hover:text-primary transition"
          >
            Categories
          </a>

          <a
            href="/jury"
            className="text-text-main hover:text-primary transition"
          >
            Jury
          </a>

          <a
            href="/grand-prix"
            className="text-text-main hover:text-primary transition"
          >
            Grand Prix
          </a>

        </nav>

        {/* Apply Button */}
        <a
          href="/apply"
          className="bg-primary text-white px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-[0.05em] hover:bg-primary-hover transition "
        >
          Apply Now
        </a>

      </div>
    </header>
  )
}
