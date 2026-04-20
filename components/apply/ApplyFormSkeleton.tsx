function SkeletonBlock({
  className,
}: {
  className: string;
}) {
  return <div className={`animate-pulse rounded-2xl bg-white/8 ${className}`} />;
}

export default function ApplyFormSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
      <div className="space-y-6">
        <section className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-sm md:p-7">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="mt-4 h-8 w-80 max-w-full" />
          <SkeletonBlock className="mt-4 h-5 w-full" />
          <SkeletonBlock className="mt-2 h-5 w-4/5" />
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-14 w-full" />
            ))}
          </div>
        </section>

        <section className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-sm md:p-7">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="mt-4 h-8 w-96 max-w-full" />
          <SkeletonBlock className="mt-4 h-5 w-full" />
          <SkeletonBlock className="mt-2 h-5 w-3/4" />
          <div className="mt-6 space-y-4">
            <SkeletonBlock className="h-20 w-full" />
            <SkeletonBlock className="h-44 w-full" />
            <SkeletonBlock className="h-44 w-full" />
          </div>
        </section>
      </div>

      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <section
            key={index}
            className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-6"
          >
            <SkeletonBlock className="h-3 w-36" />
            <SkeletonBlock className="mt-4 h-5 w-full" />
            <SkeletonBlock className="mt-2 h-5 w-5/6" />
            <div className="mt-6 space-y-3">
              <SkeletonBlock className="h-16 w-full" />
              <SkeletonBlock className="h-16 w-full" />
              <SkeletonBlock className="h-16 w-full" />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
