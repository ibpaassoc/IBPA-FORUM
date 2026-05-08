type SectionTitleProps = {
  label: string;
  title: string;
  className?: string;
};

export default function SectionTitle({
  label,
  title,
  className = "",
}: SectionTitleProps) {
  return (
    <div className={className}>
      <p className="page-eyebrow">
        {label}
      </p>
      <h2 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.8rem,3.5vw,3rem)] font-light leading-[1.15] text-[var(--color-navy)]">
        {title}
      </h2>
    </div>
  );
}
