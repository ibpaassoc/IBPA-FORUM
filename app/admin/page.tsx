import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function AdminPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/jury-applications");
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-16 text-white md:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(180,138,44,0.18),transparent_34%),linear-gradient(to_right,#151515,#050505_60%)] p-8 md:p-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d6a63a]">
              Admin Access
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
              Review jury applications in one private workspace
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              This internal page is for IBPA application review. Your boss can sign
              in, open submitted jury applications, inspect uploaded documents, and
              update review status.
            </p>
          </section>

          <section className="rounded-3xl border border-white/12 bg-white/3 p-8 md:p-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d6a63a]">
              Sign In
            </p>
            <h2 className="mt-4 text-2xl font-semibold">Admin login</h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Enter the admin password to open the jury review dashboard.
            </p>

            <AdminLoginForm />
          </section>
        </div>
      </div>
    </main>
  );
}
