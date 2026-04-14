export default function Footer() {
  return (
    <footer className="bg-background-footer text-white mt-24">

      <div className="max-w-7xl mx-auto px-8 py-16">

        {/* Top Grid */}
        <div className="grid md:grid-cols-4 gap-12">

          {/* Brand */}
          <div>
            <div className="text-primary text-xl tracking-[0.25em] mb-6 ">
              IBPA BEAUTY AWARDS
            </div>

            <p className="text-text-muted text-sm leading-relaxed ">
              Celebrating excellence in the global beauty industry and recognizing
              professionals shaping the future of beauty.
            </p>

            <div className="mt-6 text-text-muted text-sm ">
              info@ibpa-awards.com
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-primary uppercase text-sm tracking-[0.15em] mb-4 ">
              About
            </h3>

            <ul className="space-y-2 text-sm ">
              <li>
                <a className="text-text-muted hover:text-white transition" href="#">
                  About Awards
                </a>
              </li>
              <li>
                <a className="text-text-muted hover:text-white transition" href="#">
                  How It Works
                </a>
              </li>
              <li>
                <a className="text-text-muted hover:text-white transition" href="#">
                  Timeline
                </a>
              </li>
              <li>
                <a className="text-text-muted hover:text-white transition" href="#">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Awards */}
          <div>
            <h3 className="text-primary uppercase text-sm tracking-[0.15em] mb-4 ">
              Awards
            </h3>

            <ul className="space-y-2 text-sm ">
              <li>
                <a className="text-text-muted hover:text-white transition" href="#">
                  Categories
                </a>
              </li>
              <li>
                <a className="text-text-muted hover:text-white transition" href="#">
                  Jury
                </a>
              </li>
              <li>
                <a className="text-text-muted hover:text-white transition" href="#">
                  Judging Process
                </a>
              </li>
              <li>
                <a className="text-text-muted hover:text-white transition" href="#">
                  Past Winners
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-primary uppercase text-sm tracking-[0.15em] mb-4 ">
              Resources
            </h3>

            <ul className="space-y-2 text-sm ">
              <li>
                <a className="text-text-muted hover:text-white transition" href="#">
                  Media Centre
                </a>
              </li>
              <li>
                <a className="text-text-muted hover:text-white transition" href="#">
                  Contact
                </a>
              </li>
              <li>
                <a className="text-text-muted hover:text-white transition" href="#">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a className="text-text-muted hover:text-white transition" href="#">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-border-footer mt-16 pt-6 flex flex-col md:flex-row justify-between text-sm text-text-muted ">

          <div>
            © {new Date().getFullYear()} IBPA Beauty Awards. All rights reserved.
          </div>

          <div className="mt-4 md:mt-0">
            Open to global participants
          </div>

        </div>

      </div>

    </footer>
  )
}
