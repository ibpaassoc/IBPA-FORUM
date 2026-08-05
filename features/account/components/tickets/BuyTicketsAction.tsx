"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Ticket } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PremiumButton, SecondaryButton } from "@/shared/components/admin/DashboardUI";

// Same purchase flow the public site uses, loaded only when the applicant asks
// for it so the tickets page stays light.
const TicketModal = dynamic(() => import("@/features/tickets/components/TicketModal"), {
  ssr: false,
  loading: () => null,
});

export default function BuyTicketsAction({
  variant = "primary",
}: {
  variant?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const Button = variant === "secondary" ? SecondaryButton : PremiumButton;

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Ticket size={16} /> {t.account.tickets.buyTickets}
      </Button>
      {open ? <TicketModal isOpen={open} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
