export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-yellow-600 mt-24">
      <div className="max-w-7xl mx-auto px-8 py-12">

        <div className="flex justify-between items-center">

          <div className="text-yellow-500 tracking-widest text-lg">
            IBPA BEAUTY CHAMPIONSHIP
          </div>

          <div className="flex gap-8 text-sm uppercase">
            <a className="hover:text-yellow-500 transition" href="/privacy">
              Privacy
            </a>
            <a className="hover:text-yellow-500 transition" href="/terms">
              Terms
            </a>
            <a className="hover:text-yellow-500 transition" href="/contact">
              Contact
            </a>
          </div>

        </div>

        <div className="mt-10 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} IBPA Beauty Championship. All rights reserved.
        </div>

      </div>
    </footer>
  )
}
