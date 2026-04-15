const benefits = [
  "Official invitation to serve on the IBPA Beauty Championship jury panel.",
  "Personalized Jury Certificate for the championship year.",
  "Official letter of appreciation from the IBPA President.",
  "Professional contribution letter recognizing service to the beauty industry.",
  "Public jury profile on the /jury page with photo and biography.",
]

export default function JuryBenefits() {
  return (
    <section className="border-b border-black/10 bg-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:px-10 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#b48a2c]">
            Benefits
          </p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            What approved judges receive
          </h2>
          <p className="mt-6 text-base leading-8 text-black/70">
            Approved and confirmed judges receive official documentation and recognition
            from IBPA, as well as a permanent public profile on the championship jury page.
          </p>
        </div>

        <div className="space-y-4">
          {benefits.map((benefit, index) => (
            <div
              key={benefit}
              className="flex gap-4 rounded-3xl border border-black/10 bg-[#faf8f3] p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#b48a2c] text-sm font-semibold text-white">
                {index + 1}
              </div>
              <p className="text-base leading-7 text-black/80">{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
