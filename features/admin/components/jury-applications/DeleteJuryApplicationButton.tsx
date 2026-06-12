"use client";

import { deleteJuryApplicationAction } from "@/features/admin/actions/jury.actions";

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
      <button
        type="submit"
        className="admin-alert-danger inline-flex items-center justify-center rounded-full px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition"
      >
        Delete Application
      </button>
    </form>
  );
}
