import { DashboardCard, LoadingState } from "@/shared/components/admin/DashboardUI";

export default function AdminScoringLoading() {
  return (
    <DashboardCard className="min-h-[28rem]">
      <LoadingState label="Загрузка оценивания…" />
    </DashboardCard>
  );
}
