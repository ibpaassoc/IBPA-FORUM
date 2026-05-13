import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

type IconBadgeProps = {
  icon: LucideIcon;
  size?: 20 | 24 | 28;
  className?: string;
};

export default function IconBadge({ icon: Icon, size = 24, className }: IconBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center rounded-full border border-(--border-soft) bg-(--surface-tint) text-(--color-hover) transition-all duration-300",
        size === 20 ? "h-10 w-10" : size === 24 ? "h-11 w-11" : "h-12 w-12",
        className
      )}
    >
      <Icon size={size} strokeWidth={1.5} aria-hidden />
    </span>
  );
}
