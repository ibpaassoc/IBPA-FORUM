"use client";

import { deleteJuryApplicationAction } from "@/features/admin/actions/jury.actions";
import { DashboardDangerBtn } from "@/shared/components/admin/DashboardUI";

export default function DeleteJuryApplicationButton({
  id,
  fullName,
}: {
  id: string;
  fullName: string;
}) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm(`Permanently delete ${fullName}'s application? This cannot be undone.`)) {
      e.preventDefault();
    }
  }

  return (
    <form action={deleteJuryApplicationAction} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <DashboardDangerBtn type="submit">
        Delete Application
      </DashboardDangerBtn>
    </form>
  );
}
