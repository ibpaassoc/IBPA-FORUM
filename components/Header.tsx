export default function Header() {
  return (
    <header className="w-full bg-black text-white border-b border-yellow-600">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">

        {/* Logo */}
        <div className="text-xl tracking-widest font-semibold text-yellow-500">
          IBPA
        </div>

        {/* Navigation */}
        <nav className="flex gap-10 text-sm uppercase tracking-wider">
          <a className="hover:text-yellow-500 transition" href="/">Home</a>
          <a className="hover:text-yellow-500 transition" href="/categories">Categories</a>
          <a className="hover:text-yellow-500 transition" href="/jury">Jury</a>
          <a className="hover:text-yellow-500 transition" href="/grand-prix">Grand Prix</a>
          <a className="hover:text-yellow-500 transition" href="/apply">Apply</a>
        </nav>

        {/* Apply button */}
        <a
          href="/apply"
          className="border border-yellow-500 text-yellow-500 px-4 py-2 text-sm uppercase hover:bg-yellow-500 hover:text-black transition"
        >
          Apply
        </a>

      </div>
    </header>
  )
}
