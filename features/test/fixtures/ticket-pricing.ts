import type { TicketPriceConfig } from "@/features/tickets/lib/pricing";

export const TEST_TICKET_PRICING: TicketPriceConfig = {
  ticketAmountsCents: {
    ONE_DAY: { ibpa: 29_500, standard: 39_500 },
    TWO_DAYS: { ibpa: 59_500, standard: 69_500 },
  },
  galaDinnerCents: 15_000,
};
