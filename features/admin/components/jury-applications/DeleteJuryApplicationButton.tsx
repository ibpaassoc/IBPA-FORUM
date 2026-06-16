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
        className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-600 transition hover:border-red-300 hover:bg-red-50"
      >
        Delete Application
      </button>
    </form>
  );
}
