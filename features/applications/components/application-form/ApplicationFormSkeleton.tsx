function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-cool)] ${className}`} />;
}

export default function ApplicationFormSkeleton() {
  return (
    <div className="grid gap-[var(--space-md)] xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-[var(--space-md)]">
        <section className="rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--surface)] p-[var(--space-lg)]">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="mt-4 h-8 w-80 max-w-full" />
          <SkeletonBlock className="mt-4 h-5 w-full" />
          <SkeletonBlock className="mt-2 h-5 w-3/4" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-14 w-full" />
            ))}
          </div>
        </section>

        <section className="rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--surface)] p-[var(--space-lg)]">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="mt-4 h-8 w-72 max-w-full" />
          <SkeletonBlock className="mt-4 h-5 w-full" />
          <div className="mt-6 space-y-4">
            <SkeletonBlock className="h-18 w-full" />
            <SkeletonBlock className="h-44 w-full" />
          </div>
        </section>
      </div>

      <section className="hidden rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--surface)] p-[var(--space-md)] xl:block">
        <SkeletonBlock className="h-6 w-48" />
        <SkeletonBlock className="mt-3 h-4 w-56" />
        <SkeletonBlock className="mt-6 h-2 w-full" />
        <div className="mt-5 space-y-3">
          <SkeletonBlock className="h-14 w-full" />
          <SkeletonBlock className="h-14 w-full" />
          <SkeletonBlock className="h-14 w-full" />
        </div>
      </section>
    </div>
  );
}
