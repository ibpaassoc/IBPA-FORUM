const paymentStatusStyles = {
  PENDING: "bg-white/8 text-white/85 border-white/12",
  PAID: "bg-[#1b4d34]/45 text-[#9fe0b4] border-[#3e8f62]/45",
  FAILED: "bg-[#5c2323]/45 text-[#f1aaaa] border-[#9d4a4a]/45",
  EXPIRED: "bg-[#523b19]/45 text-[#f3cb8a] border-[#9e7a43]/45",
  REFUNDED: "bg-[#2c3d5a]/45 text-[#bfd7ff] border-[#5577a8]/45",
} as const;

export default function PaymentStatusBadge({
  status,
}: {
  status: keyof typeof paymentStatusStyles;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${paymentStatusStyles[status]}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
