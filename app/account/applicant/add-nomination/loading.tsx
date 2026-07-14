import { Skeleton } from "@/shared/components/admin/DashboardUI";

export default function AddNominationLoading() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-11 w-48 rounded-full" />
      <div>
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="mt-3 h-14 w-72 rounded-[20px]" />
      </div>
      <Skeleton className="mx-auto h-20 w-full max-w-5xl rounded-[40px]" />
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[172px] rounded-[26px]" />
        ))}
      </div>
    </div>
  );
}
