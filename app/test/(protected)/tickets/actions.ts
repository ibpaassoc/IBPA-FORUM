"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTestSession } from "@/features/test/server/auth";
import { runWithDataScope } from "@/features/test/server/data-scope";
import { completeTestTicketPayment, createTestTicketScenario } from "@/features/test/server/ticket-scenarios";
import { prisma } from "@/shared/lib/prisma";
import {
  regenerateAndSendTicketQr,
  regenerateTicketQr,
  sendCurrentTicketQr,
  updateAdminTicket,
} from "@/features/tickets/server/ticket-admin-service";

export async function createTestTicketAction(formData: FormData) {
  await requireTestSession();
  const discount = Number(formData.get("discountPercent"));
  const result = await createTestTicketScenario({
    type: formData.get("type") === "ONE_DAY" ? "ONE_DAY" : "TWO_DAYS",
    galaDinner: formData.get("galaDinner") === "on",
    isIbpaMember: formData.get("isIbpaMember") === "on",
    discountPercent: discount === 30 || discount === 40 ? discount : 0,
    paid: formData.get("paid") === "on",
  });
  redirect(`/test/tickets?created=${result.ticketId}`);
}
export async function completeTestTicketPaymentAction(formData: FormData) {
  await requireTestSession();
  await completeTestTicketPayment(String(formData.get("ticketId") ?? ""));
  revalidatePath("/test/tickets");
}

export async function testTicketQrAction(formData: FormData) {
  await requireTestSession();
  const ticketId = String(formData.get("ticketId") ?? "");
  const mode = String(formData.get("mode") ?? "");
  const recipient = String(formData.get("recipient") ?? "").trim();
  await runWithDataScope({ dataScope: "TEST", testEmailRecipient: recipient || undefined }, async () => {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new Error("Only a test-scoped ticket can be changed here.");
    if (mode === "replace") await regenerateTicketQr(ticket.id, "test-system");
    else if (mode === "replace-send") await regenerateAndSendTicketQr(ticket.id, "test-system");
    else if (mode === "resend") await sendCurrentTicketQr(ticket.id, { adminId: "test-system" });
    else throw new Error("Unknown QR test action.");
  });
  revalidatePath("/test/tickets");
}
export async function updateTestTicketAction(formData: FormData) {
  await requireTestSession();
  const ticketId = String(formData.get("ticketId") ?? "");
  await runWithDataScope({ dataScope: "TEST" }, async () => {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new Error("Only a test-scoped ticket can be updated here.");
    const result = await updateAdminTicket({
      ticketId,
      updatedAt: ticket.updatedAt.toISOString(),
      fullName: String(formData.get("fullName") ?? ticket.fullName),
      email: String(formData.get("email") ?? ticket.email),
      phone: String(formData.get("phone") ?? ticket.phone),
      instagram: String(formData.get("instagram") ?? ticket.instagram ?? ""),
      type: formData.get("type") === "ONE_DAY" ? "ONE_DAY" : "TWO_DAYS",
      galaDinner: formData.get("galaDinner") === "on",
    }, { adminId: "test-system" });
    if (!result.ok) throw new Error(result.message);
  });
  revalidatePath("/test/tickets");
}
