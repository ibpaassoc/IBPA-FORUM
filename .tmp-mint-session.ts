import { encode } from "next-auth/jwt";
import { prisma } from "@/shared/lib/prisma";

async function main() {
  const account = await prisma.account.findUnique({
    where: { email: "im061056@gmail.com" },
    include: { applicantProfile: { select: { id: true } } },
  });
  if (!account) throw new Error("account not found");
  const token = await encode({
    token: {
      accountId: account.id,
      email: account.email,
      role: "applicant",
      applicantProfileId: account.applicantProfile?.id ?? null,
      sub: account.id,
    },
    secret: process.env.NEXTAUTH_SECRET ?? "beauty-web-dev-jury-auth-secret",
  });
  console.log(token);
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
