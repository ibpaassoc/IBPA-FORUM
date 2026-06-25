import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";

export default function AssociationCTA() {
  return (
    <section className="relative overflow-hidden bg-[#f7fbfd] py-20 md:py-28">
      <div className="page-section">
        <div className="relative overflow-hidden rounded-[44px] border border-white/70 bg-white/70 p-7 shadow-[0_30px_90px_rgba(114,160,193,0.18)] backdrop-blur-2xl md:p-12">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#b9d9eb]/45 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <p className="page-eyebrow">Узнать больше</p>

              <h2 className="mt-4 font-(--font-display) text-[clamp(2.5rem,5vw,5.6rem)] leading-[0.95] tracking-[-0.055em] text-[#111827]">
                Готовы присоединиться к международному сообществу?
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-[#536776]">
                Подробная информация о категориях участия, стоимости,
                преимуществах и условиях вступления доступна на официальном
                сайте IBPA.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/apply"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[#1f5876] px-7 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-[0_22px_50px_rgba(31,88,118,0.25)] transition hover:-translate-y-0.5"
              >
                Подать заявку на вступление
                <ArrowRight className="ml-2 transition group-hover:translate-x-1" size={16} />
              </Link>

              <Link
                href="https://ibpassociation.com"
                target="_blank"
                className="inline-flex items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/65 px-7 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#1f5876] transition hover:bg-white"
              >
                <Globe2 className="mr-2" size={16} />
                Перейти на сайт IBPA
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
