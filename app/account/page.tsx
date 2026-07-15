import { redirect } from "next/navigation";
import { getAppSession } from "@/auth";
import { getDashboardPathForRole } from "@/features/account/server/accounts";

export default async function AccountIndexPage() {
  const session = await getAppSession();

  if (!session?.user?.role) {
    redirect("/account/login");
  }

  redirect(getDashboardPathForRole(session.user.role));
}
