import { BadgeCheck } from "lucide-react";

const advantages = [
  "Образовательные вебинары и профессиональные материалы",
  "Скидки на мероприятия, премии и проекты ассоциации",
  "Доступ к закрытому профессиональному сообществу",
  "Возможности для публикаций, выступлений и продвижения",
  "Участие в международных форумах, премиях и бизнес-мероприятиях",
  "Профиль в каталоге ассоциации",
  "Сертификат участника IBPA",
  "Партнерские программы, специальные предложения и другие привилегии",
];

export default function AssociationAdvantages() {
  return (
    <section className="relative overflow-hidden bg-[#f7fbfd] py-20 md:py-28">
      <div className="absolute left-[-12%] top-10 h-96 w-96 rounded-full bg-[#b9d9eb]/35 blur-3xl" />

      <div className="page-section relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="page-eyebrow">Преимущества участия</p>
          <h2 className="mt-4 font-(--font-display) text-[clamp(2.5rem,5vw,5.4rem)] leading-[0.95] tracking-[-0.055em] text-[#111827]">
            Больше доверия, связей и профессионального роста.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#536776]">
            Участие в IBPA помогает усиливать личный бренд, расширять
            профессиональные возможности и быть частью международного
            beauty-сообщества.
          </p>
        </div>

        <div className="grid gap-3">
          {advantages.map((item, index) => (
            <div
              key={item}
              className="flex gap-4 rounded-[28px] border border-white/70 bg-white/68 p-5 shadow-[0_18px_55px_rgba(114,160,193,0.12)] backdrop-blur-2xl"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1f5876] text-white">
                <BadgeCheck size={18} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#72a0c1]">
                  0{index + 1}
                </p>
                <p className="mt-1 text-lg font-medium leading-snug text-[#17212b]">
                  {item}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
