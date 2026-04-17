import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { PageShell } from "@/components/layout/PageShell";

export default async function AdminPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/jury-applications");
  }

  return (
    <PageShell className="px-6 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="page-panel rounded-3xl p-8 md:p-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d8c27a]">
              Admin Access
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              Review jury applications in one private workspace.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#d9d4ca] sm:text-base">
              Sign in to access the same premium site language, tuned for internal
              review, file inspection, and decision tracking.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                "Private review access",
                "Fast candidate scanning",
                "Status and notes management",
              ].map((item) => (
                <div key={item} className="page-card rounded-2xl bg-white/[0.045] p-4">
                  <p className="text-sm font-medium text-[#f1ecde]">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="page-card rounded-3xl p-8 md:p-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
              Sign In
            </p>
            <h2 className="mt-4 text-2xl font-semibold">Admin login</h2>
            <p className="mt-3 text-sm leading-6 text-[#d9d4ca]/85">
              Enter the admin password to access the jury applications dashboard.
            </p>

            <AdminLoginForm />
          </section>
        </div>
      </div>
    </PageShell>
  );
}
