"use client";

import { useState, type ReactNode } from "react";
import TicketModal from "./TicketModal";

type Props = {
  className?: string;
  children: ReactNode;
};

export default function BuyTicketsButton({ className, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" className={className} onClick={() => setIsOpen(true)}>
        {children}
      </button>
      <TicketModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
