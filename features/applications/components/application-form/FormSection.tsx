import type { ReactNode } from "react";

export default function FormSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-sm md:p-7">
      <div className="border-b border-white/10 pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#d9d4ca]">
          {description}
        </p>
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}
