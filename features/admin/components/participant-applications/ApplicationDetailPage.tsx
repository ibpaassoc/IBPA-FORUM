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
import {
  ArrowLeft,
  BriefcaseBusiness,
  Clock3,
  ExternalLink,
  Files,
  Globe,
  Layers3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { formatAdminDate } from "@/features/admin/server/view-models";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import {
  DashboardBadge,
  DashboardCard,
  DashboardDetailCard,
  DashboardSecondaryBtn,
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
      return <DashboardBadge tone="purple">Under review</DashboardBadge>;
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
      className="group flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-[#10203B] transition hover:border-[#4C7D9D]/35 hover:shadow-[0_12px_30px_rgba(16,32,59,0.08)]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E9F1F8] text-[#4C7D9D]">
          <Files size={16} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-[#10203B]">{name}</p>
          <p className="text-xs text-slate-400">{(sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
      <ExternalLink size={15} className="shrink-0 text-slate-400 transition group-hover:text-[#4C7D9D]" />
    </a>
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

  return (
    <section id={`nomination-${nomination.awardId}`} className="scroll-mt-28">
      <DashboardCard className="overflow-hidden border-slate-200/90 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcfe_58%,#f1f6fb_100%)] p-0">
        <div className="border-b border-slate-200/80 px-5 py-5 md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex rounded-full border border-[#4C7D9D]/20 bg-[#E9F1F8] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4C7D9D]">
                Nomination {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#10203B]">
                {nomination.award.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{nomination.category.name}</p>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-white/90 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4C7D9D]">
                Review set
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Responses and upload evidence for this nomination are isolated below.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 px-5 py-5 md:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
                Submission answers
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
              {textFields.every((field) => !answerMap.get(field.key)) ? (
                <div className="mt-4 rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                  No text-based answers were saved for this nomination.
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white/85 p-5 shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
              Supporting files
            </p>
            <div className="mt-4 space-y-4">
              {fileFields.map((field) => {
                const files = fileMap.get(field.key) ?? [];

                return (
                  <div key={field.key}>
                    <p className="text-sm font-semibold text-[#10203B]">{field.label}</p>
                    <div className="mt-3 space-y-2">
                      {files.map((file) => (
                        <FileLink
                          key={file.id}
                          href={`/api/admin/nomination-files/${file.id}`}
                          name={file.fileName}
                          sizeBytes={file.fileSize}
                        />
                      ))}
                      {files.length === 0 ? (
                        <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-500">
                          No files uploaded for this field.
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              {fileFields.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-500">
                  No file requirements are configured for this nomination.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </DashboardCard>
    </section>
  );
}

export default function ApplicationDetailPage({
  application,
}: {
  application: ParticipantApplicationDetail;
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

  return (
    <div className="space-y-6">
      <DashboardCard className="overflow-hidden border-[#10203B]/10 bg-[radial-gradient(circle_at_top_left,_rgba(76,125,157,0.18),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f5f8fc_55%,#eef3f8_100%)] p-0">
        <div className="grid gap-6 px-6 py-6 md:px-8 md:py-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-full border border-[#4C7D9D]/20 bg-[#E9F1F8] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4C7D9D]">
                Participant application
              </div>
              {applicationStatusBadge(application.status)}
              {paymentStatusBadge(application.paymentStatus)}
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#10203B] md:text-4xl">
              {application.fullName}
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-7 text-slate-600">
              {nominationSummaryLabel}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                <Mail size={13} />
                {application.email}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                <Phone size={13} />
                {application.phone}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                <MapPin size={13} />
                {application.city}, {application.country}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {nominationSummaries.map((item, index) => (
                <a
                  key={item.awardId}
                  href={`#nomination-${item.awardId}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-[#4C7D9D]/30 hover:text-[#10203B]"
                >
                  {String(index + 1).padStart(2, "0")} {item.awardName}
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[28px] border border-[#10203B]/10 bg-[#10203B] p-5 text-white shadow-[0_18px_50px_rgba(16,32,59,0.16)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
                Submission overview
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
                    Nominations
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                    {nominationSummaries.length}
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
                    Fee
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                    {formatAmount(application.amount, application.currency)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
                Timeline
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E9F1F8] text-[#4C7D9D]">
                    <Clock3 size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#10203B]">Created</p>
                    <p className="text-sm text-slate-500">{formatAdminDate(application.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E9F1F8] text-[#4C7D9D]">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#10203B]">Current state</p>
                    <p className="text-sm text-slate-500">
                      {application.status.replaceAll("_", " ").toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>

      <div className="flex justify-between">
        <DashboardSecondaryBtn href="/admin/applications" className="gap-2">
          <ArrowLeft size={15} />
          Back to applications
        </DashboardSecondaryBtn>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="space-y-6">
          <DashboardCard className="overflow-hidden border-slate-200/90 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcfe_60%,#f2f6fb_100%)] p-0">
            <div className="border-b border-slate-200/80 px-5 py-5 md:px-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
                Applicant profile
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#10203B]">
                Premium application summary
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                Personal details, professional profile, and digital footprint for this application.
              </p>
            </div>

            <div className="space-y-6 px-5 py-5 md:px-6">
              <div>
                <div className="flex items-center gap-2 text-[#4C7D9D]">
                  <UserRound size={16} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">
                    Identity and contact
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <DashboardDetailCard label="Full legal name" value={application.fullName} />
                  <DashboardDetailCard label="Email address" value={application.email} />
                  <DashboardDetailCard label="Phone / WhatsApp" value={application.phone} />
                  <DashboardDetailCard
                    label="Country / City"
                    value={`${application.country}, ${application.city}`}
                  />
                  <DashboardDetailCard
                    label="State / Province"
                    value={application.stateProvince || "Not required"}
                  />
                  <DashboardDetailCard label="Heard about us" value={
                    answerMap.get("heardAboutOther")?.valueText
                      ? `${application.heardAbout || "Other"}: ${answerMap.get("heardAboutOther")?.valueText}`
                      : application.heardAbout || "Not provided"
                  } />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-[#4C7D9D]">
                  <BriefcaseBusiness size={16} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">
                    Professional profile
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <DashboardDetailCard label="Professional title" value={application.professionalTitle} />
                  <DashboardDetailCard
                    label="Years of experience"
                    value={String(application.yearsExperience)}
                  />
                  <DashboardDetailCard label="Category scope" value={categorySummary || application.category.name} />
                  <DashboardDetailCard label="Nomination path" value={nominationSummaryLabel} />
                  <DashboardDetailCard
                    label="IBPA membership no."
                    value={application.membershipNumber || "Not provided"}
                  />
                  <DashboardDetailCard
                    label="Membership level"
                    value={application.membershipLevel || "Not available"}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-[#4C7D9D]">
                  <Globe size={16} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">
                    Online presence
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <DashboardDetailCard label="Website" value={application.websiteUrl || "Not provided"} />
                  <DashboardDetailCard label="Instagram / Social" value={application.socialUrl || "Not provided"} />
                  <DashboardDetailCard label="Client reviews" value={application.reviewsUrl || "Not provided"} />
                  <DashboardDetailCard
                    label="Payment total"
                    value={formatAmount(application.amount, application.currency)}
                  />
                </div>
              </div>
            </div>
          </DashboardCard>

          {hasNominationData ? (
            orderedNominations.map((nomination, index) => (
              <NominationBlockB key={nomination.id} nomination={nomination} index={index} />
            ))
          ) : (
            <DashboardCard>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
                Legacy nomination answers
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {legacyAnswerEntries.map((answer) => (
                  <DashboardDetailCard
                    key={answer.id}
                    label={formatLegacyFieldLabel(answer.fieldKey)}
                    value={formatAnswerValue(answer)}
                  />
                ))}
              </div>
              {legacyAnswerEntries.length === 0 ? (
                <div className="mt-4 rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                  No Block B answers were recorded for this application.
                </div>
              ) : null}
            </DashboardCard>
          )}
        </div>

        <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <DashboardCard className="overflow-hidden border-slate-200/90 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcfe_65%,#f2f6fb_100%)] p-0">
            <div className="border-b border-slate-200/80 px-5 py-5">
              <div className="flex items-center gap-2 text-[#4C7D9D]">
                <Layers3 size={16} />
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">
                  Nominations
                </p>
              </div>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#10203B]">
                Section map
              </h2>
            </div>
            <div className="space-y-3 px-5 py-5">
              {nominationSummaries.map((nomination, index) => (
                <a
                  key={nomination.awardId}
                  href={`#nomination-${nomination.awardId}`}
                  className="block rounded-[22px] border border-slate-200 bg-white px-4 py-4 transition hover:border-[#4C7D9D]/30 hover:shadow-[0_12px_30px_rgba(16,32,59,0.08)]"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4C7D9D]">
                    Nomination {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#10203B]">
                    {nomination.awardName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{nomination.categoryName}</p>
                </a>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard className="overflow-hidden border-slate-200/90 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcfe_65%,#f2f6fb_100%)] p-0">
            <div className="border-b border-slate-200/80 px-5 py-5">
              <div className="flex items-center gap-2 text-[#4C7D9D]">
                <Sparkles size={16} />
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">
                  Files and evidence
                </p>
              </div>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#10203B]">
                Shared uploads
              </h2>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div>
                <p className="text-sm font-semibold text-[#10203B]">
                  Professional license / Certification
                </p>
                <div className="mt-3 space-y-2">
                  {(fileMap.get("licenseCertification") ?? []).map((file) => (
                    <FileLink
                      key={file.id}
                      href={`/api/admin/application-files/${file.id}`}
                      name={file.fileName}
                      sizeBytes={file.fileSize}
                    />
                  ))}
                  {(fileMap.get("licenseCertification") ?? []).length === 0 ? (
                    <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-500">
                      No license file uploaded.
                    </div>
                  ) : null}
                </div>
              </div>

              {legacyFileEntries.map(([key, files]) => (
                <div key={key}>
                  <p className="text-sm font-semibold text-[#10203B]">
                    {formatLegacyFieldLabel(key)} (Legacy)
                  </p>
                  <div className="mt-3 space-y-2">
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
        </div>
      </div>
    </div>
  );
}
