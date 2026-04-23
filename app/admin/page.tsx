import { redirect } from "next/navigation";
import AdminLoginPage from "@/features/admin/components/auth/AdminLoginPage";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";

export default async function AdminPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/applications");
  }

  return <AdminLoginPage />;
}
