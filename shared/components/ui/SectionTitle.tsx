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
      <p className="text-xs uppercase tracking-[0.32em] text-[#d8c27a]">
        {label}
      </p>
      <h2 className="mt-4 text-3xl font-semibold text-white md:text-5xl">
        {title}
      </h2>
    </div>
  );
}
