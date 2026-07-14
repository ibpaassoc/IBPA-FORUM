import { Skeleton } from "@/shared/components/admin/DashboardUI";

export default function NominationReviewLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5">
      <Skeleton className="h-56 rounded-[30px]" />
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-72 rounded-[28px]" />
          <Skeleton className="h-72 rounded-[28px]" />
        </div>
        <Skeleton className="h-[26rem] rounded-[30px]" />
      </div>
    </div>
  );
}
