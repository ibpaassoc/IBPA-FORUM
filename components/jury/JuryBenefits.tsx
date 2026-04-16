export default function JuryBenefits() {
  return (
    <section className="border-b border-white/10 bg-[#050505]">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="rounded-[1.25rem] border border-white/12 bg-[linear-gradient(to_right,rgba(214,166,58,0.10),rgba(255,255,255,0.02))] p-6 md:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d6a63a]">
            Benefits
          </p>

          <div className="mt-4 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
                What approved judges receive
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
                After approval and payment, official judges receive formal recognition,
                supporting documents, and public listing as part of the championship jury panel.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Official invitation to serve on the IBPA jury panel.",
                "Personalized jury certificate for the championship year.",
                "Official letter of appreciation from the IBPA President.",
                "Professional contribution letter for industry recognition.",
                "Public jury profile with photo and biography.",
              ].map((item) => (
                <div key={item} className="border-b border-white/10 pb-4">
                  <p className="text-sm leading-6 text-white/85">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
