"use server";

import { redirect } from "next/navigation";
import { loginAdmin, logoutAdmin } from "@/shared/lib/admin-auth";

export type AdminLoginState = {
  error?: string;
};

export async function loginAdminAction(
  _previousState: AdminLoginState | undefined,
  formData: FormData
) {
  const password = String(formData.get("password") ?? "").trim();
  const isAuthenticated = await loginAdmin(password);

  if (!isAuthenticated) {
    return {
      error: "Incorrect password. Please try again.",
    };
  }

  redirect("/admin/applications");
}

export async function logoutAdminAction() {
  await logoutAdmin();
  redirect("/admin");
}
