import { GraduationCap, Landmark, Palette, Sparkles, Store } from "lucide-react";

const items = [
  { title: "Специалисты индустрии красоты", icon: Palette },
  { title: "Преподаватели и тренеры", icon: GraduationCap },
  { title: "Владельцы студий, салонов и академий", icon: Landmark },
  { title: "Бьюти-бренды и компании", icon: Store },
  { title: "Начинающие специалисты и студенты", icon: Sparkles },
];

export default function AssociationWhoCanJoin() {
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="page-section">
        <div className="max-w-3xl">
          <p className="page-eyebrow">Кто может присоединиться?</p>
          <h2 className="mt-4 font-(--font-display) text-[clamp(2.4rem,5vw,5.2rem)] leading-[0.95] tracking-[-0.055em] text-[#111827]">
            IBPA открыта для профессионалов на разных этапах развития.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {items.map(({ title, icon: Icon }) => (
            <article
              key={title}
              className="group rounded-[32px] border border-[#b9d9eb]/45 bg-white/60 p-6 shadow-[0_24px_70px_rgba(114,160,193,0.13)] backdrop-blur-2xl transition hover:-translate-y-1 hover:bg-white"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b9d9eb]/35 text-[#1f5876]">
                <Icon size={22} strokeWidth={1.6} />
              </div>

              <h3 className="mt-7 text-lg font-semibold leading-snug text-[#17212b]">
                {title}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
