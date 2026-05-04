type ScoreStatusBadgeProps = {
  status: "NOT_STARTED" | "DRAFT" | "SUBMITTED" | "REOPENED" | "IN_PROGRESS" | "COMPLETE";
};

const statusStyles: Record<ScoreStatusBadgeProps["status"], string> = {
  NOT_STARTED: "bg-white/5 text-white/65 border-white/10",
  DRAFT: "bg-[#57411d]/35 text-[#f3d695] border-[#b89552]/35",
  SUBMITTED: "bg-[#1b4d34]/45 text-[#9fe0b4] border-[#3e8f62]/45",
  REOPENED: "bg-[#2c3d5a]/45 text-[#bfd7ff] border-[#5577a8]/45",
  IN_PROGRESS: "bg-[#7a5a14]/25 text-[#f1d98a] border-[#d8c27a]/35",
  COMPLETE: "bg-[#1b4d34]/45 text-[#9fe0b4] border-[#3e8f62]/45",
};

export default function ScoreStatusBadge({ status }: ScoreStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusStyles[status]}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
