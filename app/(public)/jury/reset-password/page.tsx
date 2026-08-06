import { redirect } from "next/navigation";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  redirect(`/account/reset-password?role=jury${token ? `&token=${encodeURIComponent(token)}` : ""}`);
}
