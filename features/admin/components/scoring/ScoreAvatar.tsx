import clsx from "clsx";

/** Инициалы из имени: «Aida Mukanbetova» → «AM». */
function toInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "—";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

/** Круглый аватар с инициалами — для участников и судей в аудите оценок. */
export default function ScoreAvatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.2)] bg-[var(--color-blue-wash)] font-semibold uppercase tracking-[0.04em] text-[#356f98]",
        size === "sm" ? "size-9 text-[0.68rem]" : "size-11 text-[0.78rem]",
        className,
      )}
    >
      {toInitials(name)}
    </span>
  );
}
