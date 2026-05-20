import type { ReactNode } from "react";
import clsx from "clsx";
import { ImageContainer } from "@/shared/components/public";

type EditorialImageCardProps = {
  src: string;
  alt: string;
  title?: string;
  eyebrow?: string;
  text?: string;
  children?: ReactNode;
  className?: string;
  imageClassName?: string;
  objectPosition?: string;
  sizes?: string;
  preload?: boolean;
  tone?: "light" | "dark";
  aspectClassName?: string;
  onImageError?: () => void;
  unoptimized?: boolean;
};

function createBlurDataURL(base: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" fill="${base}" />
      <path d="M0 22C7 16 12 14 18 15.5C25 17.5 29 26 38 23C42 21.5 44 18 48 17V32H0V22Z" fill="${accent}" fill-opacity="0.35" />
      <path d="M0 11C6 6 11 5 17 8C24 11.5 30 17 38 15C42 14 45 11 48 9V0H0V11Z" fill="#ffffff" fill-opacity="0.18" />
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function EditorialImageCard({
  src,
  alt,
  title,
  eyebrow,
  text,
  children,
  className,
  imageClassName,
  objectPosition = "center top",
  sizes = "(max-width: 768px) 100vw, 50vw",
  preload,
  tone = "dark",
  aspectClassName = "aspect-[4/5]",
  onImageError,
  unoptimized,
}: EditorialImageCardProps) {
  const blurDataURL =
    tone === "dark"
      ? createBlurDataURL("#c8dcee", "#72a0c1")
      : createBlurDataURL("#f7fbfd", "#b9d9eb");

  return (
    <article
      className={clsx(
        "group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transform-gpu transition duration-500",
        "motion-safe:animate-[fadeUp_0.8s_ease_both]",
        className
      )}
    >
      <div className={clsx("relative overflow-hidden", aspectClassName)}>
        <ImageContainer
          src={src}
          alt={alt}
          fill
          preload={preload}
          unoptimized={unoptimized}
          sizes={sizes}
          placeholder="blur"
          blurDataURL={blurDataURL}
          onError={onImageError}
          className="absolute inset-0"
          imageClassName={clsx(
            "object-cover transition duration-700 ease-out group-hover:scale-[1.04]",
            imageClassName
          )}
          style={{ objectPosition }}
        />
        <div
          className={clsx(
            "absolute inset-0 transition duration-500",
            tone === "dark"
              ? "bg-[rgba(12,16,20,0.24)] group-hover:bg-[rgba(12,16,20,0.32)]"
              : "bg-[rgba(255,255,255,0.2)]"
          )}
        />
      </div>

      {(eyebrow || title || text || children) && (
        <div className="absolute inset-x-0 bottom-0 p-[var(--space-md)] text-white">
          <div className="max-w-[26rem] rounded-[calc(var(--radius)-2px)] border border-white/18 bg-[rgba(12,16,20,0.28)] p-[var(--space-md)] shadow-[0_10px_24px_rgba(12,16,20,0.16)] backdrop-blur-[6px] transition duration-500 group-hover:bg-[rgba(12,16,20,0.38)]">
            {eyebrow ? (
              <p className="text-[0.64rem] font-medium uppercase tracking-[0.24em] text-[var(--color-title-accent)]">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <p className="mt-2 font-[var(--font-display)] text-[clamp(1.2rem,2vw,2rem)] font-light leading-[1.05] text-white">
                {title}
              </p>
            ) : null}
            {text ? (
              <p className="mt-2 max-w-[24rem] text-sm leading-[1.7] text-white/80">
                {text}
              </p>
            ) : null}
            {children ? <div className="mt-3">{children}</div> : null}
          </div>
        </div>
      )}
    </article>
  );
}
