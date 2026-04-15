const requirements = [
  "Minimum 5 years of professional experience in the beauty industry.",
  "Strong professional background in one or more championship categories.",
  "Professional certifications and supporting documents are required.",
  "Applicants must disclose any conflict of interest with possible nominees.",
  "Jury applicants submit their application free of charge.",
  "The $250 jury registration fee is paid only after approval.",
]

export default function JuryRequirements() {
  return (
    <section id="requirements" className="border-b border-black/10 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#b48a2c]">
            Requirements
          </p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Who can apply to become a judge
          </h2>
          <p className="mt-6 text-base leading-8 text-black/70">
            The jury panel is formed from experienced professionals with recognized expertise,
            ethical standards, and the ability to evaluate submissions fairly and confidentially.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {requirements.map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-black/10 bg-[#faf8f3] p-6"
            >
              <p className="text-base leading-7 text-black/80">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
