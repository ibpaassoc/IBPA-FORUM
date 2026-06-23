import type {
  Application,
  ApplicationAnswer,
  ApplicationFile,
  Award,
  Category,
  NominationApplication,
  NominationAnswer,
  NominationFile,
} from "@prisma/client";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Files,
  Globe,
  Layers3,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ReceiptText,
  SearchCheck,
  XCircle,
  UserRound,
} from "lucide-react";
import { updateParticipantApplicationStatus } from "@/features/admin/actions/participant.actions";
import { formatAdminDate } from "@/features/admin/server/view-models";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import {
  DashboardAccentBlock,
  DashboardBadge,
  DashboardCard,
  DashboardDetailCard,
  DashboardPageHeader,
  DashboardPanel,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  dashboardSelectClass,
} from "@/shared/components/admin/DashboardUI";

type NominationDetail = NominationApplication & {
  award: Award;
  category: Category;
  answers: NominationAnswer[];
  files: NominationFile[];
};

type ParticipantApplicationDetail = Application & {
  category: Category;
  award: Award;
  answers: ApplicationAnswer[];
  files: ApplicationFile[];
  nominationApplications: NominationDetail[];
};

type SelectedAwardSummary = {
  categoryId: string;
  categoryName: string;
  awardId: string;
  awardName: string;
};

function formatAnswerValue(answer: {
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueJson: unknown;
}) {
  if (answer.valueText) return answer.valueText;
  if (answer.valueNumber !== null) return String(answer.valueNumber);
  if (answer.valueBoolean !== null) return answer.valueBoolean ? "Yes" : "No";
  if (Array.isArray(answer.valueJson)) return answer.valueJson.join(", ");
  if (answer.valueJson && typeof answer.valueJson === "object") {
    return JSON.stringify(answer.valueJson, null, 2);
  }
  return "Not provided";
}

function formatLegacyFieldLabel(fieldKey: string) {
  return fieldKey
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (value) => value.toUpperCase());
}

function parseSelectedAwards(valueJson: unknown): SelectedAwardSummary[] {
  if (!Array.isArray(valueJson)) {
    return [];
  }

  return valueJson.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as Record<string, unknown>;
    const categoryId = typeof record.categoryId === "string" ? record.categoryId : "";
    const categoryName = typeof record.categoryName === "string" ? record.categoryName : "";
    const awardId = typeof record.awardId === "string" ? record.awardId : "";
    const awardName = typeof record.awardName === "string" ? record.awardName : "";

    if (!categoryId || !categoryName || !awardId || !awardName) {
      return [];
    }

    return [{ categoryId, categoryName, awardId, awardName }];
  });
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function applicationStatusBadge(status: Application["status"]) {
  switch (status) {
    case "APPROVED":
      return <DashboardBadge tone="green">Approved</DashboardBadge>;
    case "SUBMITTED":
      return <DashboardBadge tone="blue">Submitted</DashboardBadge>;
    case "UNDER_REVIEW":
      return <DashboardBadge tone="blue">Under review</DashboardBadge>;
    case "PAYMENT_PENDING":
      return <DashboardBadge tone="amber">Payment pending</DashboardBadge>;
    case "REJECTED":
      return <DashboardBadge tone="red">Rejected</DashboardBadge>;
    default:
      return <DashboardBadge tone="neutral">{status}</DashboardBadge>;
  }
}

function paymentStatusBadge(status: Application["paymentStatus"]) {
  switch (status) {
    case "PAID":
      return <DashboardBadge tone="green">Paid</DashboardBadge>;
    case "PENDING":
      return <DashboardBadge tone="amber">Awaiting payment</DashboardBadge>;
    case "FAILED":
      return <DashboardBadge tone="red">Payment failed</DashboardBadge>;
    case "EXPIRED":
      return <DashboardBadge tone="neutral">Expired</DashboardBadge>;
    case "REFUNDED":
      return <DashboardBadge tone="blue">Refunded</DashboardBadge>;
    default:
      return <DashboardBadge tone="neutral">{status}</DashboardBadge>;
  }
}

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: typeof UserRound;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-[#1673A5]">
      <Icon aria-hidden size={16} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{children}</p>
    </div>
  );
}

function FileLink({
  href,
  name,
  sizeBytes,
}: {
  href: string;
  name: string;
  sizeBytes: number;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-white px-3 py-3 text-sm text-[#0A0A0A] transition hover:border-[#7DC8EE] hover:bg-[#EAF6FF]/45"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#EAF6FF] text-[#1673A5]">
          <Files aria-hidden size={15} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-[#0A0A0A]">{name}</p>
          <p className="text-xs text-black/45">{(sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
      <ExternalLink
        aria-hidden
        size={15}
        className="shrink-0 text-black/35 transition group-hover:text-[#1673A5]"
      />
    </a>
  );
}

const statusActionTone = {
  primary: "border-[#6b8a9f] bg-[#7a98af] text-white hover:bg-[#6b8a9f]",
  blue: "border-[#7DC8EE] bg-[#EAF6FF] text-[#0A0A0A] hover:bg-[#DFF2FF]",
  neutral: "border-black/10 bg-white text-[#0A0A0A] hover:border-[#7DC8EE] hover:bg-[#EAF6FF]",
  danger: "border-red-200 bg-white text-red-700 hover:bg-red-50",
};

function StatusActionButton({
  applicationId,
  status,
  active,
  tone = "neutral",
  children,
}: {
  applicationId: string;
  status: Application["status"];
  active: boolean;
  tone?: keyof typeof statusActionTone;
  children: ReactNode;
}) {
  return (
    <form action={updateParticipantApplicationStatus}>
      <input type="hidden" name="id" value={applicationId} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        disabled={active}
        className={`inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition disabled:cursor-default disabled:opacity-45 ${statusActionTone[tone]}`}
      >
        {children}
      </button>
    </form>
  );
}

function EmptyInline({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-black/15 bg-[#FAFAFA] px-4 py-4 text-sm text-black/50">
      {children}
    </div>
  );
}

function NominationBlockB({
  nomination,
  index,
}: {
  nomination: NominationDetail;
  index: number;
}) {
  const fields = categoryFieldConfigs[nomination.category.slug] ?? [];
  const answerMap = new Map(nomination.answers.map((answer) => [answer.fieldKey, answer]));
  const fileMap = new Map<string, NominationFile[]>();

  for (const file of nomination.files) {
    const group = fileMap.get(file.fieldKey) ?? [];
    group.push(file);
    fileMap.set(file.fieldKey, group);
  }

  const textFields = fields.filter((field) => field.type !== "file");
  const fileFields = fields.filter((field) => field.type === "file");
  const hasTextAnswers = textFields.some((field) => answerMap.get(field.key));

  return (
    <section id={`nomination-${nomination.awardId}`} className="scroll-mt-24">
      <DashboardCard className="p-0">
        <div className="border-b border-black/10 p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1673A5]">
                Nomination {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-2xl font-semibold normal-case tracking-[-0.02em] text-[#0A0A0A]">
                {nomination.award.name}
              </h3>
              <p className="mt-1 text-sm text-black/55">{nomination.category.name}</p>
            </div>
            <DashboardBadge tone="blue">Evidence set</DashboardBadge>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:p-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45">
              Answers
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {textFields.map((field) => {
                const answer = answerMap.get(field.key);
                if (!answer) return null;
                return (
                  <DashboardDetailCard
                    key={field.key}
                    label={field.label}
                    value={formatAnswerValue(answer)}
                  />
                );
              })}
            </div>
            {!hasTextAnswers ? (
              <div className="mt-3">
                <EmptyInline>No text answers were saved for this nomination.</EmptyInline>
              </div>
            ) : null}
          </div>

          <DashboardPanel>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45">
              Files
            </p>
            <div className="mt-3 flex flex-col gap-4">
              {fileFields.map((field) => {
                const files = fileMap.get(field.key) ?? [];

                return (
                  <div key={field.key}>
                    <p className="text-sm font-semibold text-[#0A0A0A]">{field.label}</p>
                    <div className="mt-2 flex flex-col gap-2">
                      {files.map((file) => (
                        <FileLink
                          key={file.id}
                          href={`/api/admin/nomination-files/${file.id}`}
                          name={file.fileName}
                          sizeBytes={file.fileSize}
                        />
                      ))}
                      {files.length === 0 ? <EmptyInline>No files uploaded.</EmptyInline> : null}
                    </div>
                  </div>
                );
              })}
              {fileFields.length === 0 ? <EmptyInline>No file fields configured.</EmptyInline> : null}
            </div>
          </DashboardPanel>
        </div>
      </DashboardCard>
    </section>
  );
}

function AlertMessage({ tone, children }: { tone: "error" | "notice"; children: string }) {
  const cls =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-[#7DC8EE] bg-[#EAF6FF] text-[#0A0A0A]";
  return <div className={`rounded-lg border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}

export default function ApplicationDetailPage({
  application,
  error,
  notice,
}: {
  application: ParticipantApplicationDetail;
  error?: string;
  notice?: string;
}) {
  const answerMap = new Map(application.answers.map((answer) => [answer.fieldKey, answer]));
  const selectedAwards = parseSelectedAwards(answerMap.get("selectedAwards")?.valueJson);
  const fileMap = new Map<string, ApplicationFile[]>();

  for (const file of application.files) {
    const group = fileMap.get(file.fieldKey) ?? [];
    group.push(file);
    fileMap.set(file.fieldKey, group);
  }

  const categoryFields = categoryFieldConfigs[application.category.slug] ?? [];
  const categoryFieldKeySet = new Set(categoryFields.map((field) => field.key));
  const categoryFileKeySet = new Set(
    categoryFields.filter((field) => field.type === "file").map((field) => field.key)
  );

  const hasNominationData = application.nominationApplications.some(
    (nomination) => nomination.answers.length > 0 || nomination.files.length > 0
  );
  const nominationOrder = new Map(selectedAwards.map((item, index) => [item.awardId, index]));
  const orderedNominations = [...application.nominationApplications].sort((left, right) => {
    const leftOrder = nominationOrder.get(left.awardId) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = nominationOrder.get(right.awardId) ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.createdAt.getTime() - right.createdAt.getTime();
  });
  const nominationSummaries =
    selectedAwards.length > 0
      ? selectedAwards
      : orderedNominations.map((nomination) => ({
          categoryId: nomination.categoryId,
          categoryName: nomination.category.name,
          awardId: nomination.awardId,
          awardName: nomination.award.name,
        }));
  const categorySummary = [...new Set(nominationSummaries.map((item) => item.categoryName))].join(", ");
  const nominationSummaryLabel =
    nominationSummaries.length <= 1
      ? nominationSummaries[0]?.awardName ?? application.award.name
      : `${nominationSummaries.length} nominations selected`;

  const legacyAnswerEntries = !hasNominationData
    ? application.answers.filter(
        (answer) =>
          answer.fieldKey !== "heardAboutOther" &&
          answer.fieldKey !== "licenseCertification" &&
          answer.fieldKey !== "selectedAwards" &&
          categoryFieldKeySet.has(answer.fieldKey)
      )
    : [];
  const legacyFileEntries = !hasNominationData
    ? [...fileMap.entries()].filter(
        ([key]) => key !== "licenseCertification" && categoryFileKeySet.has(key)
      )
    : [];

  const licenseFiles = fileMap.get("licenseCertification") ?? [];

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label="Application review"
        title={application.fullName}
        description={nominationSummaryLabel}
        actions={
          <>
            <DashboardSecondaryBtn href="/admin/applications">
              <ArrowLeft aria-hidden size={15} />
              Back
            </DashboardSecondaryBtn>
            <DashboardSecondaryBtn href={`/admin/applications/${application.id}/edit`}>
              <Pencil aria-hidden size={15} />
              Edit application
            </DashboardSecondaryBtn>
          </>
        }
      />

      {error ? <AlertMessage tone="error">{error}</AlertMessage> : null}
      {notice ? <AlertMessage tone="notice">{notice}</AlertMessage> : null}

      <DashboardCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {applicationStatusBadge(application.status)}
            {paymentStatusBadge(application.paymentStatus)}
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-black/55">
            <span className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-[#FAFAFA] px-2.5 py-1">
              <Mail aria-hidden size={13} />
              {application.email}
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-[#FAFAFA] px-2.5 py-1">
              <Phone aria-hidden size={13} />
              {application.phone}
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-[#FAFAFA] px-2.5 py-1">
              <MapPin aria-hidden size={13} />
              {application.city}, {application.country}
            </span>
          </div>
        </div>
      </DashboardCard>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-5">
          <section id="profile" className="scroll-mt-24">
            <DashboardCard className="p-0">
              <div className="border-b border-black/10 p-4 md:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1673A5]">
                  Applicant
                </p>
                <h2 className="mt-2 text-2xl font-semibold normal-case tracking-[-0.02em] text-[#0A0A0A]">
                  Profile and eligibility
                </h2>
              </div>

              <div className="flex flex-col gap-6 p-4 md:p-5">
                <div>
                  <SectionLabel icon={UserRound}>Identity</SectionLabel>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <DashboardDetailCard label="Full legal name" value={application.fullName} />
                    <DashboardDetailCard label="Email address" value={application.email} />
                    <DashboardDetailCard label="Phone / WhatsApp" value={application.phone} />
                    <DashboardDetailCard label="Country / City" value={`${application.country}, ${application.city}`} />
                    <DashboardDetailCard label="State / Province" value={application.stateProvince || "Not required"} />
                    <DashboardDetailCard
                      label="Heard about us"
                      value={
                        answerMap.get("heardAboutOther")?.valueText
                          ? `${application.heardAbout || "Other"}: ${answerMap.get("heardAboutOther")?.valueText}`
                          : application.heardAbout || "Not provided"
                      }
                    />
                  </div>
                </div>

                <div>
                  <SectionLabel icon={BriefcaseBusiness}>Professional</SectionLabel>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <DashboardDetailCard label="Professional title" value={application.professionalTitle} />
                    <DashboardDetailCard label="Years of experience" value={String(application.yearsExperience)} />
                    <DashboardDetailCard label="Category scope" value={categorySummary || application.category.name} />
                    <DashboardDetailCard label="Nomination path" value={nominationSummaryLabel} />
                    <DashboardDetailCard label="IBPA membership no." value={application.membershipNumber || "Not provided"} />
                    <DashboardDetailCard label="Membership level" value={application.membershipLevel || "Not available"} />
                  </div>
                </div>

                <div>
                  <SectionLabel icon={Globe}>Online presence</SectionLabel>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <DashboardDetailCard label="Website" value={application.websiteUrl || "Not provided"} />
                    <DashboardDetailCard label="Instagram / Social" value={application.socialUrl || "Not provided"} />
                    <DashboardDetailCard label="Client reviews" value={application.reviewsUrl || "Not provided"} />
                    <DashboardDetailCard label="Payment total" value={formatAmount(application.amount, application.currency)} />
                  </div>
                </div>
              </div>
            </DashboardCard>
          </section>

          {hasNominationData ? (
            orderedNominations.map((nomination, index) => (
              <NominationBlockB key={nomination.id} nomination={nomination} index={index} />
            ))
          ) : (
            <DashboardCard>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1673A5]">
                Legacy nomination answers
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {legacyAnswerEntries.map((answer) => (
                  <DashboardDetailCard
                    key={answer.id}
                    label={formatLegacyFieldLabel(answer.fieldKey)}
                    value={formatAnswerValue(answer)}
                  />
                ))}
              </div>
              {legacyAnswerEntries.length === 0 ? (
                <div className="mt-3">
                  <EmptyInline>No Block B answers were recorded for this application.</EmptyInline>
                </div>
              ) : null}
            </DashboardCard>
          )}
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-5 xl:self-start">
          <DashboardAccentBlock>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">
              Overview
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-md border border-white/30 bg-white/20 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
                  Nominations
                </p>
                <p className="mt-2 text-2xl font-semibold">{nominationSummaries.length}</p>
              </div>
              <div className="rounded-md border border-white/30 bg-white/20 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
                  Fee
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatAmount(application.amount, application.currency)}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-white">
              <Clock3 aria-hidden size={15} />
              Created {formatAdminDate(application.createdAt)}
            </div>
          </DashboardAccentBlock>

          <DashboardCard>
            <div className="flex items-center gap-2 text-[#1673A5]">
              <SearchCheck aria-hidden size={16} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Decision</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {applicationStatusBadge(application.status)}
              {paymentStatusBadge(application.paymentStatus)}
            </div>

            <div className="mt-4 border-t border-black/[0.06] pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/40">
                Change status
              </p>
              <form action={updateParticipantApplicationStatus} className="mt-2 flex flex-col gap-2">
                <input type="hidden" name="id" value={application.id} />
                <select
                  name="status"
                  defaultValue={application.status}
                  className={dashboardSelectClass}
                >
                  <option value="PAYMENT_PENDING">Payment pending</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <DashboardSecondaryBtn type="submit" className="w-full">
                  Apply status
                </DashboardSecondaryBtn>
              </form>
            </div>

            <div className="mt-4 grid gap-2 border-t border-black/[0.06] pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/40">
                Quick actions
              </p>
              <StatusActionButton
                applicationId={application.id}
                status="APPROVED"
                active={application.status === "APPROVED"}
                tone="primary"
              >
                <CheckCircle2 aria-hidden size={15} />
                Approve
              </StatusActionButton>
              <StatusActionButton
                applicationId={application.id}
                status="REJECTED"
                active={application.status === "REJECTED"}
                tone="danger"
              >
                <XCircle aria-hidden size={15} />
                Reject
              </StatusActionButton>
            </div>
          </DashboardCard>

          <DashboardCard>
            <div className="flex items-center gap-2 text-[#1673A5]">
              <Layers3 aria-hidden size={16} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Review map</p>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <a
                href="#profile"
                className="rounded-lg border border-black/10 bg-[#FAFAFA] px-3 py-3 text-sm font-semibold text-[#0A0A0A] transition hover:border-[#7DC8EE] hover:bg-[#EAF6FF]"
              >
                Applicant profile
              </a>
              {nominationSummaries.map((nomination, index) => (
                <a
                  key={nomination.awardId}
                  href={`#nomination-${nomination.awardId}`}
                  className="rounded-lg border border-black/10 bg-white px-3 py-3 text-sm transition hover:border-[#7DC8EE] hover:bg-[#EAF6FF]/45"
                >
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45">
                    Nomination {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block font-semibold text-[#0A0A0A]">
                    {nomination.awardName}
                  </span>
                  <span className="mt-0.5 block text-xs text-black/50">
                    {nomination.categoryName}
                  </span>
                </a>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard>
            <div className="flex items-center gap-2 text-[#1673A5]">
              <ReceiptText aria-hidden size={16} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Shared files</p>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A]">
                  Professional license / Certification
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {licenseFiles.map((file) => (
                    <FileLink
                      key={file.id}
                      href={`/api/admin/application-files/${file.id}`}
                      name={file.fileName}
                      sizeBytes={file.fileSize}
                    />
                  ))}
                  {licenseFiles.length === 0 ? <EmptyInline>No license file uploaded.</EmptyInline> : null}
                </div>
              </div>

              {legacyFileEntries.map(([key, files]) => (
                <div key={key}>
                  <p className="text-sm font-semibold text-[#0A0A0A]">
                    {formatLegacyFieldLabel(key)} (Legacy)
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    {files.map((file) => (
                      <FileLink
                        key={file.id}
                        href={`/api/admin/application-files/${file.id}`}
                        name={file.fileName}
                        sizeBytes={file.fileSize}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </aside>
      </div>
    </div>
  );
}
