"use client";

import { deleteJuryApplicationAction } from "@/features/admin/actions/jury.actions";
import { adminT } from "@/lib/i18n/admin";
import { DashboardDangerBtn } from "@/shared/components/admin/DashboardUI";

export default function DeleteJuryApplicationButton({
  id,
  fullName,
}: {
  id: string;
  fullName: string;
}) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm(adminT.detail.deleteConfirm(fullName))) {
      e.preventDefault();
    }
  }

  return (
    <form action={deleteJuryApplicationAction} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <DashboardDangerBtn type="submit">
        {adminT.detail.deleteApplication}
      </DashboardDangerBtn>
    </form>
  );
}
