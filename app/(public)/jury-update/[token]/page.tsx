import { notFound } from "next/navigation";
import { AlertTriangle, ClipboardEdit, MessageSquare } from "lucide-react";
import { prisma } from "@/shared/lib/prisma";
import AdditionalInfoForm from "@/features/jury/components/additional-info/AdditionalInfoForm";

async function getApplicationByToken(token: string) {
  return prisma.juryApplication.findUnique({
    where: { infoRequestToken: token },
    select: {
      id: true,
      fullName: true,
      status: true,
      infoRequestDetails: true,
      professionalBio: true,
      motivation: true,
      conflictDisclosure: true,
      professionalWebsite: true,
    },
  });
}

export default async function JuryUpdatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token) notFound();

  const application = await getApplicationByToken(token);

  if (!application) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 md:py-24">
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-red-200 bg-red-50 px-8 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="text-red-500" size={28} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#1a1a1a]">Link not found</h1>
            <p className="mt-2 text-sm leading-7 text-black/60">
              This link is invalid or has already been used. If you believe this is an error, please contact{" "}
              <a href="mailto:forum-support@ibpassociations.org" className="font-medium text-[#1673A5] hover:underline">
                forum-support@ibpassociations.org
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (application.status !== "ADDITIONAL_INFO_REQUIRED") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 md:py-24">
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-[#7DC8EE] bg-[#EAF6FF]/60 px-8 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-[#EAF6FF]">
            <AlertTriangle className="text-[#1673A5]" size={28} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#1a1a1a]">Link no longer active</h1>
            <p className="mt-2 text-sm leading-7 text-black/60">
              This update link has already been used or is no longer active. If you need to make further changes, please contact{" "}
              <a href="mailto:forum-support@ibpassociations.org" className="font-medium text-[#1673A5] hover:underline">
                forum-support@ibpassociations.org
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 md:py-16">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1673A5]">
          IBPA Beauty Award · Jury Application
        </p>
        <h1 className="mt-3 font-[var(--font-display)] text-3xl font-semibold leading-tight tracking-[-0.02em] text-[#1a1a1a] md:text-4xl">
          Update your application
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-black/60">
          Dear {application.fullName}, the IBPA review committee has requested additional information. Please review the request below and update your application accordingly.
        </p>
      </div>

      <div className="premium-glass mb-8 rounded-2xl bg-[linear-gradient(145deg,rgba(185,217,235,0.28),rgba(255,255,255,0.84))] p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-blue-wash)]">
            <MessageSquare size={15} className="text-[var(--color-blue)]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">
              Message from the review committee
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--color-ink-soft)]">
              {application.infoRequestDetails}
            </p>
          </div>
        </div>
      </div>

      <div className="premium-glass rounded-2xl p-6 md:p-8">
        <div className="mb-7 flex items-center gap-2.5 border-b border-[var(--border-soft)] pb-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#EAF6FF]">
            <ClipboardEdit size={15} className="text-[#1673A5]" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1673A5]">
              Application update
            </p>
            <p className="text-sm font-semibold text-[#1a1a1a]">
              Edit and resubmit your information
            </p>
          </div>
        </div>

        <AdditionalInfoForm
          token={token}
          adminRequest={application.infoRequestDetails ?? ""}
          defaultBio={application.professionalBio}
          defaultMotivation={application.motivation}
          defaultConflictDisclosure={application.conflictDisclosure}
          defaultWebsite={application.professionalWebsite}
        />
      </div>

      <p className="mt-6 text-center text-xs leading-6 text-black/40">
        This page is personal and intended only for {application.fullName}.{" "}
        <a href="mailto:forum-support@ibpassociations.org" className="hover:text-[#1673A5] hover:underline">
          Contact support
        </a>{" "}
        if you need assistance.
      </p>
    </main>
  );
}
