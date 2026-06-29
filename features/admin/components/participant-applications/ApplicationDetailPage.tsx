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
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  Files,
  Layers3,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ReceiptText,
  Star,
  UserRound,
  XCircle,
} from "lucide-react";
import { updateParticipantApplicationStatus } from "@/features/admin/actions/participant.actions";
import ApplicationStatusBadge from "@/features/admin/components/badges/ApplicationStatusBadge";
import PaymentStatusBadge from "@/features/admin/components/badges/PaymentStatusBadge";
import ReviewWorkspace, { type ReviewTab } from "@/features/admin/components/review/ReviewWorkspace";
import {
  MobileActionBar,
  ReviewActionPanel,
  ReviewSummaryCard,
} from "@/features/admin/components/review/ReviewPrimitives";
import { formatAdminDate } from "@/features/admin/server/view-models";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import {
  DashboardCard,
  DashboardDetailCard,
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

function FileLink({ href, name, sizeBytes }: { href: string; name: string; sizeBytes: number }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between gap-3 rounded-[22px] border border-[rgba(37,42,45,0.08)] bg-white px-3 py-3 text-sm text-[var(--color-ink)] transition hover:border-[rgba(114,160,193,0.34)] hover:bg-[var(--color-blue-wash)]/60"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[18px] bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
          <Files aria-hidden size={15} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-[var(--color-ink)]">{name}</p>
          <p className="text-xs text-[var(--color-ink-muted)]">{(sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
      <ExternalLink
        aria-hidden
        size={15}
        className="shrink-0 text-[var(--color-ink-muted)] transition group-hover:text-[var(--color-blue)]"
      />
    </a>
  );
}

function EmptyInline({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[22px] border border-dashed border-[rgba(37,42,45,0.14)] bg-white/62 px-4 py-4 text-sm text-[var(--color-ink-soft)]">
      {children}
    </div>
  );
}

function FileGroup({
  label,
  files,
  apiPath,
}: {
  label: string;
  files: Array<{ id: string; fileName: string; fileSize: number }>;
  apiPath: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-[var(--color-ink)]">{label}</p>
      <div className="mt-2 flex flex-col gap-2">
        {files.map((file) => (
          <FileLink key={file.id} href={`${apiPath}/${file.id}`} name={file.fileName} sizeBytes={file.fileSize} />
        ))}
        {files.length === 0 ? <EmptyInline>No files uploaded.</EmptyInline> : null}
      </div>
    </div>
  );
}

const statusActionTone = {
  primary:
    "border-[var(--color-blue)] bg-[var(--color-blue)] text-white hover:bg-[#4d86ad]",
  neutral:
    "border-[rgba(37,42,45,0.08)] bg-white text-[var(--color-ink)] hover:border-[rgba(114,160,193,0.34)] hover:bg-[var(--color-blue-wash)]",
  danger: "border-red-200 bg-white text-red-700 hover:bg-red-50",
};

function StatusActionButton({
  applicationId,
  status,
  active,
  tone = "neutral",
  className,
  children,
}: {
  applicationId: string;
  status: Application["status"];
  active?: boolean;
  tone?: keyof typeof statusActionTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <form action={updateParticipantApplicationStatus} className={className}>
      <input type="hidden" name="id" value={applicationId} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        disabled={active}
        className={`inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[18px] border px-3 py-2 text-sm font-semibold transition disabled:cursor-default disabled:opacity-45 ${statusActionTone[tone]}`}
      >
        {children}
      </button>
    </form>
  );
}

function AlertMessage({ tone, children }: { tone: "error" | "notice"; children: string }) {
  const cls =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-[rgba(114,160,193,0.34)] bg-[var(--color-blue-wash)] text-[var(--color-ink)]";
  return <div className={`rounded-[22px] border px-4 py-3 text-sm ${cls}`}>{children}</div>;
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
    categoryFields.filter((field) => field.type === "file").map((field) => field.key),
  );

  const hasNominationData = application.nominationApplications.some(
    (nomination) => nomination.answers.length > 0 || nomination.files.length > 0,
  );
  const nominationOrder = new Map(selectedAwards.map((item, index) => [item.awardId, index]));
  const orderedNominations = [...application.nominationApplications].sort((left, right) => {
    const leftOrder = nominationOrder.get(left.awardId) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = nominationOrder.get(right.awardId) ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
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
          categoryFieldKeySet.has(answer.fieldKey),
      )
    : [];
  const legacyFileEntries = !hasNominationData
    ? [...fileMap.entries()].filter(([key]) => key !== "licenseCertification" && categoryFileKeySet.has(key))
    : [];

  const licenseFiles = fileMap.get("licenseCertification") ?? [];

  // ── Tab content ─────────────────────────────────────────────────────────
  const overview = (
    <DashboardCard className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
          Identity
        </p>
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
          Professional
        </p>
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
          Online presence
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <DashboardDetailCard label="Website" value={application.websiteUrl || "Not provided"} />
          <DashboardDetailCard label="Instagram / Social" value={application.socialUrl || "Not provided"} />
          <DashboardDetailCard label="Client reviews" value={application.reviewsUrl || "Not provided"} />
          <DashboardDetailCard label="Payment total" value={formatAmount(application.amount, application.currency)} />
        </div>
      </div>
    </DashboardCard>
  );

  const submission = (
    <div className="flex flex-col gap-4">
      {hasNominationData ? (
        orderedNominations.map((nomination, index) => {
          const fields = categoryFieldConfigs[nomination.category.slug] ?? [];
          const nomAnswerMap = new Map(nomination.answers.map((answer) => [answer.fieldKey, answer]));
          const textFields = fields.filter((field) => field.type !== "file");
          const hasTextAnswers = textFields.some((field) => nomAnswerMap.get(field.key));
          return (
            <DashboardCard key={nomination.id} className="p-0">
              <div className="flex items-center justify-between gap-3 border-b border-[rgba(37,42,45,0.08)] p-4 md:p-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)]">
                    Nomination {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 font-[var(--font-title-family)] text-2xl font-light tracking-[-0.025em] text-[var(--color-ink)]">
                    {nomination.award.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-[var(--color-ink-soft)]">{nomination.category.name}</p>
                </div>
              </div>
              <div className="p-4 md:p-5">
                {hasTextAnswers ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {textFields.map((field) => {
                      const answer = nomAnswerMap.get(field.key);
                      if (!answer) return null;
                      return (
                        <DashboardDetailCard key={field.key} label={field.label} value={formatAnswerValue(answer)} />
                      );
                    })}
                  </div>
                ) : (
                  <EmptyInline>No text answers were saved for this nomination.</EmptyInline>
                )}
              </div>
            </DashboardCard>
          );
        })
      ) : (
        <DashboardCard>
          {legacyAnswerEntries.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {legacyAnswerEntries.map((answer) => (
                <DashboardDetailCard
                  key={answer.id}
                  label={formatLegacyFieldLabel(answer.fieldKey)}
                  value={formatAnswerValue(answer)}
                />
              ))}
            </div>
          ) : (
            <EmptyInline>No submission answers were recorded for this application.</EmptyInline>
          )}
        </DashboardCard>
      )}
    </div>
  );

  const documents = (
    <div className="flex flex-col gap-4">
      <DashboardCard>
        <FileGroup
          label="Professional license / Certification"
          files={licenseFiles}
          apiPath="/api/admin/application-files"
        />
      </DashboardCard>

      {hasNominationData
        ? orderedNominations.map((nomination) => {
            const fields = categoryFieldConfigs[nomination.category.slug] ?? [];
            const fileFields = fields.filter((field) => field.type === "file");
            const nomFileMap = new Map<string, NominationFile[]>();
            for (const file of nomination.files) {
              const group = nomFileMap.get(file.fieldKey) ?? [];
              group.push(file);
              nomFileMap.set(file.fieldKey, group);
            }
            return (
              <DashboardCard key={nomination.id} className="p-0">
                <div className="border-b border-[rgba(37,42,45,0.08)] p-4 md:p-5">
                  <h3 className="font-[var(--font-title-family)] text-xl font-light tracking-[-0.02em] text-[var(--color-ink)]">
                    {nomination.award.name}
                  </h3>
                </div>
                <div className="flex flex-col gap-4 p-4 md:p-5">
                  {fileFields.length > 0 ? (
                    fileFields.map((field) => (
                      <FileGroup
                        key={field.key}
                        label={field.label}
                        files={nomFileMap.get(field.key) ?? []}
                        apiPath="/api/admin/nomination-files"
                      />
                    ))
                  ) : (
                    <EmptyInline>No file fields configured.</EmptyInline>
                  )}
                </div>
              </DashboardCard>
            );
          })
        : legacyFileEntries.map(([key, files]) => (
            <DashboardCard key={key}>
              <FileGroup
                label={`${formatLegacyFieldLabel(key)} (Legacy)`}
                files={files}
                apiPath="/api/admin/application-files"
              />
            </DashboardCard>
          ))}
    </div>
  );

  const scores = (
    <DashboardCard className="flex flex-col items-start gap-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
          <Star aria-hidden size={18} />
        </span>
        <div>
          <p className="font-[var(--font-title-family)] text-xl font-light text-[var(--color-ink)]">Judge scoring</p>
          <p className="text-sm text-[var(--color-ink-soft)]">Coverage, averages, and rank for this nomination.</p>
        </div>
      </div>
      <DashboardSecondaryBtn href={`/admin/scoring/${application.id}`}>
        Open score audit
      </DashboardSecondaryBtn>
    </DashboardCard>
  );

  const history = (
    <DashboardCard>
      <div className="grid gap-3 sm:grid-cols-2">
        <DashboardDetailCard label="Created" value={formatAdminDate(application.createdAt)} />
        <DashboardDetailCard label="Last updated" value={formatAdminDate(application.updatedAt)} />
        <DashboardDetailCard label="Application status" value={<ApplicationStatusBadge status={application.status} />} />
        <DashboardDetailCard label="Payment status" value={<PaymentStatusBadge status={application.paymentStatus} />} />
      </div>
    </DashboardCard>
  );

  const tabs: ReviewTab[] = [
    { key: "overview", label: "Overview", icon: UserRound, content: overview },
    { key: "submission", label: "Submission", icon: ClipboardList, content: submission },
    { key: "documents", label: "Documents", icon: FileText, content: documents },
    { key: "scores", label: "Scores", icon: Star, content: scores },
    { key: "history", label: "History", icon: CalendarClock, content: history },
  ];

  // ── Sticky decision panel ────────────────────────────────────────────────
  const aside = (
    <ReviewActionPanel title="Decision">
      <div className="flex flex-wrap gap-2">
        <ApplicationStatusBadge status={application.status} />
        <PaymentStatusBadge status={application.paymentStatus} />
      </div>

      <div className="mt-4 grid gap-2">
        <StatusActionButton applicationId={application.id} status="APPROVED" active={application.status === "APPROVED"} tone="primary">
          <CheckCircle2 aria-hidden size={15} />
          Approve
        </StatusActionButton>
        <StatusActionButton applicationId={application.id} status="UNDER_REVIEW" active={application.status === "UNDER_REVIEW"}>
          <Layers3 aria-hidden size={15} />
          Mark under review
        </StatusActionButton>
        <StatusActionButton applicationId={application.id} status="REJECTED" active={application.status === "REJECTED"} tone="danger">
          <XCircle aria-hidden size={15} />
          Reject
        </StatusActionButton>
      </div>

      <div className="mt-4 border-t border-[rgba(37,42,45,0.06)] pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
          Set status
        </p>
        <form action={updateParticipantApplicationStatus} className="mt-2 flex flex-col gap-2">
          <input type="hidden" name="id" value={application.id} />
          <select name="status" defaultValue={application.status} className={dashboardSelectClass}>
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

      <div className="mt-4 flex items-center gap-2 border-t border-[rgba(37,42,45,0.06)] pt-4 text-sm text-[var(--color-ink-soft)]">
        <ReceiptText aria-hidden size={15} />
        Fee {formatAmount(application.amount, application.currency)}
      </div>
    </ReviewActionPanel>
  );

  const mobileBar = (
    <MobileActionBar>
      <StatusActionButton
        applicationId={application.id}
        status="APPROVED"
        active={application.status === "APPROVED"}
        tone="primary"
        className="flex-1"
      >
        <CheckCircle2 aria-hidden size={15} />
        Approve
      </StatusActionButton>
      <StatusActionButton
        applicationId={application.id}
        status="REJECTED"
        active={application.status === "REJECTED"}
        tone="danger"
        className="flex-1"
      >
        <XCircle aria-hidden size={15} />
        Reject
      </StatusActionButton>
    </MobileActionBar>
  );

  const summary = (
    <ReviewSummaryCard
      name={application.fullName}
      subtitle={nominationSummaryLabel}
      badges={
        <>
          <ApplicationStatusBadge status={application.status} />
          <PaymentStatusBadge status={application.paymentStatus} />
        </>
      }
      meta={[
        { icon: Mail, label: application.email },
        { icon: Phone, label: application.phone },
        { icon: MapPin, label: `${application.city}, ${application.country}` },
        { icon: CalendarClock, label: formatAdminDate(application.createdAt) },
      ]}
      actions={
        <>
          <DashboardSecondaryBtn href="/admin/applications">
            <ArrowLeft aria-hidden size={15} />
            Back
          </DashboardSecondaryBtn>
          <DashboardSecondaryBtn href={`/admin/applications/${application.id}/edit`}>
            <Pencil aria-hidden size={15} />
            Edit
          </DashboardSecondaryBtn>
        </>
      }
    />
  );

  return (
    <ReviewWorkspace
      summary={summary}
      alerts={
        error || notice ? (
          <div className="flex flex-col gap-2">
            {error ? <AlertMessage tone="error">{error}</AlertMessage> : null}
            {notice ? <AlertMessage tone="notice">{notice}</AlertMessage> : null}
          </div>
        ) : null
      }
      tabs={tabs}
      aside={aside}
      mobileBar={mobileBar}
    />
  );
}
