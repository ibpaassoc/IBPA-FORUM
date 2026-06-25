const steps = [
  {
    title: "Выберите категорию",
    text: "Определите подходящую категорию участия в ассоциации.",
  },
  {
    title: "Заполните заявку",
    text: "Отправьте заявку на вступление через форму сайта.",
  },
  {
    title: "Дождитесь рассмотрения",
    text: "Команда IBPA рассмотрит заявку и подтвердит дальнейшие шаги.",
  },
  {
    title: "Завершите регистрацию",
    text: "После одобрения проведите оплату и получите доступ к преимуществам.",
  },
];

export default function AssociationProcess() {
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="page-section">
        <div className="mx-auto max-w-4xl text-center">
          <p className="page-eyebrow">Как проходит вступление?</p>
          <h2 className="mt-4 font-(--font-display) text-[clamp(2.4rem,5vw,5.2rem)] leading-[0.95] tracking-[-0.055em] text-[#111827]">
            Четкий и понятный процесс вступления.
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-4">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="relative overflow-hidden rounded-[34px] border border-[#b9d9eb]/45 bg-white/70 p-6 shadow-[0_24px_70px_rgba(114,160,193,0.12)] backdrop-blur-2xl"
            >
              <div className="absolute right-4 top-2 font-(--font-display) text-7xl leading-none text-[#b9d9eb]/25">
                {index + 1}
              </div>

              <p className="relative text-xs font-semibold uppercase tracking-[0.22em] text-[#72a0c1]">
                Шаг {index + 1}
              </p>

              <h3 className="relative mt-12 text-xl font-semibold text-[#17212b]">
                {step.title}
              </h3>

              <p className="relative mt-4 text-sm leading-7 text-[#536776]">
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
