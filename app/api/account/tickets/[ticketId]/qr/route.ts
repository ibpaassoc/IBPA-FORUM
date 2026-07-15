import { NextResponse } from "next/server";
import { requireAccount } from "@/features/account/server/accounts";
import { generateTicketQRBuffer } from "@/features/tickets/server/ticket-qr";
import { prisma } from "@/shared/lib/prisma";

function safeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "ticket";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const account = await requireAccount();
  const { ticketId } = await params;
  const ownershipFilters = [
    { accountId: account.id },
    { email: account.email },
    ...(account.applicantProfile ? [{ applicantProfileId: account.applicantProfile.id }] : []),
  ];

  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      OR: ownershipFilters,
    },
    select: {
      fullName: true,
      qrCredentials: {
        where: { status: "ACTIVE" },
        orderBy: { generatedAt: "desc" },
        take: 1,
        select: { token: true },
      },
    },
  });

  const token = ticket?.qrCredentials[0]?.token;
  if (!ticket || !token) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = await generateTicketQRBuffer(token);
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="ibpa-forum-${safeSlug(ticket.fullName)}-qr.png"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
