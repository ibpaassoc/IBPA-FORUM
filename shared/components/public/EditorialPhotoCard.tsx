import clsx from "clsx";
import SafeImage from "./SafeImage";

type EditorialPhotoCardProps = {
  src: string;
  alt: string;
  fallbackSrc?: string;
  fallbackSrcs?: string[];
  eyebrow?: string;
  title?: string;
  description?: string;
  aspect?: "portrait" | "landscape" | "square";
  overlay?: "none" | "soft" | "medium";
  align?: "left" | "right";
  objectPosition?: string;
  mobileObjectPosition?: string;
  className?: string;
  priority?: boolean;
};

const aspectClassMap = {
  portrait: "aspect-[4/5]",
  landscape: "aspect-[16/9]",
  square: "aspect-square",
};

export default function EditorialPhotoCard({
  src,
  alt,
  fallbackSrc,
  fallbackSrcs,
  eyebrow,
  title,
  description,
  aspect = "portrait",
  overlay = "soft",
  align = "left",
  objectPosition,
  mobileObjectPosition,
  className,
  priority,
}: EditorialPhotoCardProps) {
  const overlayClass =
    overlay === "none"
      ? "bg-transparent"
      : overlay === "medium"
        ? "bg-[rgba(15,24,32,0.36)]"
        : "bg-[rgba(15,24,32,0.24)]";

  return (
    <article className={clsx("group page-card h-fit rounded-(--radius-lg)", className)}>
      <div className={clsx("relative overflow-hidden rounded-[inherit]", aspectClassMap[aspect])}>
        <SafeImage
          src={src}
          fallbackSrc={fallbackSrc}
          fallbackSrcs={fallbackSrcs}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          objectPosition={objectPosition}
          mobileObjectPosition={mobileObjectPosition}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className={clsx("pointer-events-none absolute inset-0 transition duration-300", overlayClass)} />
        {(eyebrow || title || description) && (
          <div
            className={clsx(
              "absolute inset-x-0 bottom-0 p-(--space-md) text-white",
              align === "right" && "text-right"
            )}
          >
            {eyebrow ? (
              <p className="text-[0.66rem] uppercase tracking-[0.2em] text-(--color-blue-soft)">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h3 className="mt-2 text-2xl leading-tight">{title}</h3> : null}
            {description ? <p className="mt-2 text-sm leading-6 text-white/90">{description}</p> : null}
          </div>
        )}
      </div>
    </article>
  );
}
