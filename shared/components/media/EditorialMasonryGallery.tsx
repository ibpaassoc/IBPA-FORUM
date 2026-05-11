import type { ReactNode } from "react";
import clsx from "clsx";
import EditorialImageCard from "@/shared/components/media/EditorialImageCard";

type GalleryItem = {
  src: string;
  alt: string;
  title?: string;
  eyebrow?: string;
  text?: string;
  aspectClassName?: string;
  className?: string;
  objectPosition?: string;
  sizes?: string;
  preload?: boolean;
  tone?: "light" | "dark";
  children?: ReactNode;
};

export default function EditorialMasonryGallery({
  label,
  title,
  text,
  items,
}: {
  label: string;
  title: string;
  text?: string;
  items: GalleryItem[];
}) {
  return (
    <section className="bg-(--color-white)">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] page-section-pad">
        <div className="max-w-3xl">
          <p className="page-eyebrow">{label}</p>
          <h2 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.8rem,3.5vw,3rem)] font-light leading-[1.1] text-(--color-ink)">
            {title}
          </h2>
          {text ? (
            <p className="mt-[var(--space-sm)] max-w-2xl text-sm leading-[1.7] text-(--color-ink-soft)">
              {text}
            </p>
          ) : null}
        </div>

        <div className="mt-[var(--space-xl)] grid grid-flow-dense gap-[var(--space-md)] md:grid-cols-12">
          {items.map((item, index) => {
            const spanClasses =
              index % 5 === 0
                ? "md:col-span-7"
                : index % 5 === 1
                  ? "md:col-span-5 md:row-span-2"
                  : index % 5 === 2
                    ? "md:col-span-4"
                    : index % 5 === 3
                      ? "md:col-span-4"
                      : "md:col-span-4";

            return (
              <EditorialImageCard
                key={`${item.src}-${index}`}
                src={item.src}
                alt={item.alt}
                title={item.title}
                eyebrow={item.eyebrow}
                text={item.text}
                className={clsx(spanClasses, item.className)}
                aspectClassName={item.aspectClassName}
                objectPosition={item.objectPosition}
                sizes={item.sizes}
                preload={item.preload}
                tone={item.tone}
              >
                {item.children}
              </EditorialImageCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
