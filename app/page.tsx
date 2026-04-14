import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between bg-white px-16 py-32 dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>

          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black px-5 text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-300 md:w-40"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert-0"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>

          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/10 px-5 transition-colors hover:border-transparent hover:bg-black/5 dark:border-white/20 dark:hover:bg-zinc-900 md:w-40"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
       const categories = [
  "Hair",
  "Nail",
  "Brow",
  "Lash",
  "Skin & Cosmetology",
  "Facial Treatments",
  "Makeup Artistry",
  "Permanent Makeup",
  "Body & Wellness",
  "Education",
  "Salon",
  "Brand",
];

const highlights = [
  {
    title: "12 Championship Categories",
    text: "Focused professional categories with detailed application flows and category-specific requirements.",
  },
  {
    title: "Professional Membership Required",
    text: "Applicants must hold IBPA Trainer / Coach level membership or higher to participate.",
  },
  {
    title: "Transparent Fee Structure",
    text: "$50 per participant category. Jury candidates apply first and pay $250 only after approval.",
  },
  {
    title: "Grand Prix Recognition",
    text: "Awarded only in years when at least 5 categories produce winners, preserving prestige and competitiveness.",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose Your Category",
    text: "Select one of 12 professional categories and the specific award inside that category.",
  },
  {
    number: "02",
    title: "Verify Membership",
    text: "Enter your IBPA Membership Number. Only Trainer / Coach level or higher can continue.",
  },
  {
    number: "03",
    title: "Complete Your Entry",
    text: "Fill in Block A, then upload the category-specific Block B materials for your discipline.",
  },
  {
    number: "04",
    title: "Submit & Pay",
    text: "Submit your application and pay the category entry fee through Stripe Checkout in USD.",
  },
  {
    number: "05",
    title: "Jury Evaluation",
    text: "Applications move into the official judging period before the annual championship ceremony.",
  },
];

const faqItems = [
  {
    q: "How much does it cost to apply?",
    a: "Participant applications cost $50 per category. Each category is a separate submission and separate fee.",
  },
  {
    q: "Do members get free category entry?",
    a: "No. Membership and championship participation are separate. Even eligible members still pay per category.",
  },
  {
    q: "Can anyone apply to become a judge?",
    a: "Professionals may apply through the jury application form. The $250 fee is charged only after IBPA approves the candidate.",
  },
  {
    q: "How does Grand Prix work?",
    a: "You do not apply directly. The full jury selects the Grand Prix recipient from category winners in years with at least 5 active winning categories.",
  },
];

function getTimeLeft(targetDate: string) {
  const target = new Date(targetDate).getTime();
  const now = new Date().getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function CountdownCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-[#d8c27a]/35 bg-white/5 px-5 py-4 text-center backdrop-blur-sm">
      <div className="text-3xl font-semibold text-white md:text-4xl">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.28em] text-[#d8c27a]">{label}</div>
    </div>
  );
}

export default function HomePage() {
  const timeLeft = getTimeLeft("2026-07-31T23:59:00-04:00");

  return (
    <main className="bg-[#0f0f10] text-[#f5f1e8]">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(216,194,122,0.22),transparent_38%)]" />
        <div className="mx-auto flex max-w-7xl flex-col gap-16 px-6 py-20 md:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:py-28">
          <div className="relative z-10 max-w-3xl">
            <p className="mb-5 text-xs uppercase tracking-[0.32em] text-[#d8c27a]">
              IBPA Beauty Championship 2026
            </p>

            <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white md:text-6xl">
              Recognizing excellence across beauty, education, wellness, and brand innovation.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[#d9d4ca] md:text-lg">
              A premium championship experience for licensed professionals, educators, salons,
              and brands. Apply in your category, submit your portfolio, and be reviewed by the
              official IBPA jury panel.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/apply"
                className="rounded-full bg-[#d8c27a] px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] transition hover:opacity-90"
              >
                Apply Now
              </a>
              <a
                href="/categories"
                className="rounded-full border border-white/20 px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
              >
                Explore Categories
              </a>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
              <CountdownCard value={timeLeft.days} label="Days" />
              <CountdownCard value={timeLeft.hours} label="Hours" />
              <CountdownCard value={timeLeft.minutes} label="Minutes" />
              <CountdownCard value={timeLeft.seconds} label="Seconds" />
            </div>

            <p className="mt-5 text-sm text-[#beb8aa]">
              Application deadline: July 31, 2026 • Judging: August 5 – August 20, 2026 • Ceremony:
              September 4–5, 2026
            </p>
          </div>

          <div className="relative z-10 grid w-full max-w-xl grid-cols-2 gap-4 lg:justify-end">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-[#d8c27a]">Entry Fee</p>
              <p className="mt-4 text-4xl font-semibold text-white">$50</p>
              <p className="mt-3 text-sm leading-7 text-[#d9d4ca]">Per category application. Each category is submitted and paid separately.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-[#d8c27a]">Judge Fee</p>
              <p className="mt-4 text-4xl font-semibold text-white">$250</p>
              <p className="mt-3 text-sm leading-7 text-[#d9d4ca]">Charged only after jury approval. Application review comes first.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-[#d8c27a]">Membership</p>
              <p className="mt-4 text-2xl font-semibold text-white">Trainer / Coach+</p>
              <p className="mt-3 text-sm leading-7 text-[#d9d4ca]">Only eligible membership levels can submit championship applications.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-[#d8c27a]">Grand Prix</p>
              <p className="mt-4 text-2xl font-semibold text-white">5+ Active Categories</p>
              <p className="mt-3 text-sm leading-7 text-[#d9d4ca]">Awarded only if at least five categories produce winners in the current year.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.32em] text-[#d8c27a]">Why Participate</p>
          <h2 className="mt-4 text-3xl font-semibold text-white md:text-5xl">
            Built for serious professionals and premium industry recognition.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-[#171718] p-7 transition hover:-translate-y-1 hover:border-[#d8c27a]/40"
            >
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[#c8c2b5]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#141415]">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.32em] text-[#d8c27a]">Categories</p>
              <h2 className="mt-4 text-3xl font-semibold text-white md:text-5xl">
                12 championship paths for today’s beauty industry.
              </h2>
            </div>
            <a
              href="/categories"
              className="text-sm uppercase tracking-[0.16em] text-[#d8c27a] transition hover:text-white"
            >
              View all categories →
            </a>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category, index) => (
              <a
                key={category}
                href="/categories"
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-[#d8c27a]/45 hover:bg-white/[0.07]"
              >
                <div className="text-sm text-[#8b8578]">{String(index + 1).padStart(2, "0")}</div>
                <div className="mt-3 text-lg font-medium text-white group-hover:text-[#f0e0a6]">{category}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.32em] text-[#d8c27a]">Process</p>
          <h2 className="mt-4 text-3xl font-semibold text-white md:text-5xl">How the championship works</h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          {steps.map((step) => (
            <div key={step.number} className="rounded-3xl border border-white/10 bg-[#171718] p-6">
              <div className="text-sm tracking-[0.25em] text-[#d8c27a]">{step.number}</div>
              <h3 className="mt-4 text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[#c8c2b5]">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#141415]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:px-10 lg:grid-cols-2 lg:px-12">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-xs uppercase tracking-[0.32em] text-[#d8c27a]">Grand Prix</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Prestige protected by category diversity</h2>
            <p className="mt-5 text-sm leading-8 text-[#d9d4ca]">
              The Grand Prix is not a direct application. It is selected by the full jury panel from
              category winners only in years where at least 5 categories produce award recipients.
            </p>
            <p className="mt-4 text-sm leading-8 text-[#d9d4ca]">
              This keeps the title meaningful, competitive, and representative of a strong championship year.
            </p>
            <a
              href="/grand-prix"
              className="mt-8 inline-block rounded-full border border-[#d8c27a]/50 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#d8c27a] transition hover:bg-[#d8c27a] hover:text-[#111111]"
            >
              Learn About Grand Prix
            </a>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-xs uppercase tracking-[0.32em] text-[#d8c27a]">Jury</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Apply to become an official IBPA judge</h2>
            <p className="mt-5 text-sm leading-8 text-[#d9d4ca]">
              Jury candidates submit a professional application first. Approved experts then receive a
              Stripe payment link for the official $250 registration fee.
            </p>
            <p className="mt-4 text-sm leading-8 text-[#d9d4ca]">
              After payment, judges receive confirmation, official documents, and a public profile on the jury page.
            </p>
            <a
              href="/jury"
              className="mt-8 inline-block rounded-full bg-[#d8c27a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] transition hover:opacity-90"
            >
              Apply as Judge
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.32em] text-[#d8c27a]">Questions</p>
          <h2 className="mt-4 text-3xl font-semibold text-white md:text-5xl">Frequently asked questions</h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {faqItems.map((item) => (
            <div key={item.q} className="rounded-3xl border border-white/10 bg-[#171718] p-7">
              <h3 className="text-xl font-semibold text-white">{item.q}</h3>
              <p className="mt-4 text-sm leading-7 text-[#c8c2b5]">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-[linear-gradient(180deg,#141415_0%,#0f0f10_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center md:px-10 lg:px-12">
          <p className="text-xs uppercase tracking-[0.32em] text-[#d8c27a]">Ready to participate?</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold text-white md:text-5xl">
            Start your IBPA Beauty Championship application today.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#d9d4ca]">
            Build your professional case, upload your portfolio, and compete for one of the industry’s premier recognitions.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/apply"
              className="rounded-full bg-[#d8c27a] px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] transition hover:opacity-90"
            >
              Apply Now
            </a>
            <a
              href="/jury"
              className="rounded-full border border-white/20 px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
            >
              Become a Judge
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
     Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
