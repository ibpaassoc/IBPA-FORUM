"use client";

export default function SidebarCard({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-(--color-title-accent)">
        {eyebrow}
      </p>
      <h3 className="mt-3 font-(--font-display) text-xl font-light">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/72">{text}</p>
    </div>
  );
}
