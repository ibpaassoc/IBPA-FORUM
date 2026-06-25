"use client";

import dynamic from "next/dynamic";
import { useState, type ReactNode } from "react";

const TicketModal = dynamic(() => import("./TicketModal"), {
  ssr: false,
  loading: () => null,
});

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
      {isOpen ? <TicketModal isOpen={isOpen} onClose={() => setIsOpen(false)} /> : null}
    </>
  );
}
