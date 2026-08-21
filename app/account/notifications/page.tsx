import { redirect } from "next/navigation";
import { requireAccount } from "@/features/account/server/accounts";

export default async function AccountNotificationsIndexPage() {
  const account = await requireAccount();
  redirect(
    account.role === "JURY"
      ? "/account/jury/notifications"
      : "/account/applicant/notifications",
  );
}
