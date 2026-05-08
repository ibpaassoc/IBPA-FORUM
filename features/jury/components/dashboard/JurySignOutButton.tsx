"use client";

import { signOut } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { AdminToolbarButton } from "@/shared/components/admin/AdminDashboard";

export default function JurySignOutButton() {
  const { t } = useLanguage();

  return (
    <AdminToolbarButton
      onClick={() => void signOut({ callbackUrl: "/jury/login" })}
      variant="secondary"
    >
      {t.juryDashboard.signOut}
    </AdminToolbarButton>
  );
}
