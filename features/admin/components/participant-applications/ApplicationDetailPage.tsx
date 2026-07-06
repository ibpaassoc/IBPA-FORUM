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
import PaymentStatusBadge from "@/features/admin/components/badges/PaymentStatusBadge";
import ReviewWorkspace, { type ReviewTab } from "@/features/admin/components/review/ReviewWorkspace";
import {
  MobileActionBar,
  ReviewActionPanel,
  ReviewSummaryCard,
} from "@/features/admin/components/review/ReviewPrimitives";
import { adminT, formatAdminDate, formatAdminMoney } from "@/lib/i18n/admin";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import {
  DashboardCard,
  DashboardDetailCard,
  DashboardSecondaryBtn,
} from "@/shared/components/admin/DashboardUI";
import IbpaDropdown from "@/shared/components/admin/IbpaDropdown";

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
  if (answer.valueBoolean !== null) return answer.valueBoolean ? adminT.common.yes : adminT.common.no;
  if (Array.isArray(answer.valueJson)) return answer.valueJson.join(", ");
  if (answer.valueJson && typeof answer.valueJson === "object") {
    return JSON.stringify(answer.valueJson, null, 2);
  }
  return adminT.common.notProvided;
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
  return formatAdminMoney(amount, currency, 0);
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
        {files.length === 0 ? <EmptyInline>{adminT.detail.noFiles}</EmptyInline> : null}
      </div>
    </div>
  );
}

const statusActionTone = {
  primary:
    "border-[rgba(255,255,255,0.35)] bg-[var(--color-blue)]/92 text-white shadow-[0_12px_28px_rgba(114,160,193,0.3)] backdrop-blur-xl hover:bg-[#4d86ad]",
  neutral:
    "border-[rgba(114,160,193,0.2)] bg-white/78 text-[var(--color-ink)] shadow-[0_10px_24px_rgba(37,42,45,0.05)] backdrop-blur-xl hover:border-[rgba(114,160,193,0.34)] hover:bg-[var(--color-blue-wash)]",
  danger:
    "border-red-200 bg-white/82 text-red-700 shadow-[0_10px_24px_rgba(153,27,27,0.06)] backdrop-blur-xl hover:bg-red-50",
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
        className={`inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)] disabled:cursor-default disabled:opacity-45 disabled:hover:translate-y-0 ${statusActionTone[tone]}`}
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
      : `${adminT.detail.nominationsSelected} ${nominationSummaries.length}`;

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
          {adminT.detail.identity}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <DashboardDetailCard label={adminT.detail.fullLegalName} value={application.fullName} />
          <DashboardDetailCard label={adminT.detail.email} value={application.email} />
          <DashboardDetailCard label={adminT.detail.phoneWhatsapp} value={application.phone} />
          <DashboardDetailCard label={adminT.detail.countryCity} value={`${application.country}, ${application.city}`} />
          <DashboardDetailCard label={adminT.detail.stateProvince} value={application.stateProvince || adminT.common.notRequired} />
          <DashboardDetailCard
            label={adminT.detail.heardAbout}
            value={
              answerMap.get("heardAboutOther")?.valueText
                ? `${application.heardAbout || adminT.detail.heardAboutOther}: ${answerMap.get("heardAboutOther")?.valueText}`
                : application.heardAbout || adminT.common.notProvided
            }
          />
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
          {adminT.detail.professional}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <DashboardDetailCard label={adminT.detail.professionalTitle} value={application.professionalTitle} />
          <DashboardDetailCard label={adminT.detail.yearsExperience} value={String(application.yearsExperience)} />
          <DashboardDetailCard label={adminT.detail.categoryScope} value={categorySummary || application.category.name} />
          <DashboardDetailCard label={adminT.detail.nominationPath} value={nominationSummaryLabel} />
          <DashboardDetailCard label={adminT.detail.membershipNumber} value={application.membershipNumber || adminT.common.notProvided} />
          <DashboardDetailCard label={adminT.detail.membershipLevel} value={application.membershipLevel || adminT.common.notProvided} />
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
          {adminT.detail.onlinePresence}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <DashboardDetailCard label="Instagram" value={application.websiteUrl || "Not provided"} />
          <DashboardDetailCard label="Social media" value={application.socialUrl || "Not provided"} />
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
                    {adminT.detail.nomination} {String(index + 1).padStart(2, "0")}
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
                  <EmptyInline>{adminT.detail.noTextAnswers}</EmptyInline>
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
            <EmptyInline>{adminT.detail.noAnswers}</EmptyInline>
          )}
        </DashboardCard>
      )}
    </div>
  );

  const documents = (
    <div className="flex flex-col gap-4">
      <DashboardCard>
        <FileGroup
          label={adminT.detail.licenseCertification}
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
                    <EmptyInline>{adminT.detail.noFileFields}</EmptyInline>
                  )}
                </div>
              </DashboardCard>
            );
          })
        : legacyFileEntries.map(([key, files]) => (
            <DashboardCard key={key}>
              <FileGroup
                label={`${formatLegacyFieldLabel(key)} (${adminT.detail.legacy})`}
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
          <p className="font-[var(--font-title-family)] text-xl font-light text-[var(--color-ink)]">{adminT.detail.judgeScoring}</p>
          <p className="text-sm text-[var(--color-ink-soft)]">{adminT.detail.judgeScoringText}</p>
        </div>
      </div>
      <DashboardSecondaryBtn href={`/admin/scoring/${application.id}`}>
        {adminT.detail.openScoreAudit}
      </DashboardSecondaryBtn>
    </DashboardCard>
  );

  const history = (
    <DashboardCard>
      <div className="grid gap-3 sm:grid-cols-2">
        <DashboardDetailCard label={adminT.detail.created} value={formatAdminDate(application.createdAt)} />
        <DashboardDetailCard label={adminT.detail.lastUpdated} value={formatAdminDate(application.updatedAt)} />
        <DashboardDetailCard label={adminT.detail.paymentStatus} value={<PaymentStatusBadge status={application.paymentStatus} />} />
      </div>
    </DashboardCard>
  );

  const tabs: ReviewTab[] = [
    { key: "overview", label: adminT.detail.tabs.overview, icon: <UserRound aria-hidden size={15} />, content: overview },
    { key: "submission", label: adminT.detail.tabs.submission, icon: <ClipboardList aria-hidden size={15} />, content: submission },
    { key: "documents", label: adminT.detail.tabs.documents, icon: <FileText aria-hidden size={15} />, content: documents },
    { key: "scores", label: adminT.detail.tabs.scores, icon: <Star aria-hidden size={15} />, content: scores },
    { key: "history", label: adminT.detail.tabs.history, icon: <CalendarClock aria-hidden size={15} />, content: history },
  ];

  // ── Sticky decision panel ────────────────────────────────────────────────
  const aside = (
    <ReviewActionPanel title={adminT.detail.decision}>
      <div className="flex flex-wrap gap-2">
        <PaymentStatusBadge status={application.paymentStatus} />
      </div>

      <div className="mt-4 grid gap-2">
        <StatusActionButton applicationId={application.id} status="APPROVED" active={application.status === "APPROVED"} tone="primary">
          <CheckCircle2 aria-hidden size={15} />
          {adminT.detail.approve}
        </StatusActionButton>
        <StatusActionButton applicationId={application.id} status="UNDER_REVIEW" active={application.status === "UNDER_REVIEW"}>
          <Layers3 aria-hidden size={15} />
          {adminT.detail.markUnderReview}
        </StatusActionButton>
        <StatusActionButton applicationId={application.id} status="REJECTED" active={application.status === "REJECTED"} tone="danger">
          <XCircle aria-hidden size={15} />
          {adminT.detail.reject}
        </StatusActionButton>
      </div>

      <div className="mt-4 border-t border-[rgba(37,42,45,0.06)] pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
          {adminT.detail.setStatus}
        </p>
        <form action={updateParticipantApplicationStatus} className="mt-2 flex flex-col gap-2">
          <input type="hidden" name="id" value={application.id} />
          <IbpaDropdown
            name="status"
            defaultValue={application.status}
            ariaLabel={adminT.detail.setStatus}
            options={[
              { value: "PAYMENT_PENDING", label: adminT.statuses.PAYMENT_PENDING },
              { value: "SUBMITTED", label: adminT.statuses.SUBMITTED },
              { value: "UNDER_REVIEW", label: adminT.statuses.UNDER_REVIEW },
              { value: "APPROVED", label: adminT.statuses.APPROVED },
              { value: "REJECTED", label: adminT.statuses.REJECTED },
            ]}
          />
          <DashboardSecondaryBtn type="submit" className="w-full">
            {adminT.detail.applyStatus}
          </DashboardSecondaryBtn>
        </form>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-[rgba(37,42,45,0.06)] pt-4 text-sm text-[var(--color-ink-soft)]">
        <ReceiptText aria-hidden size={15} />
        {adminT.detail.fee} {formatAmount(application.amount, application.currency)}
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
        {adminT.detail.approve}
      </StatusActionButton>
      <StatusActionButton
        applicationId={application.id}
        status="REJECTED"
        active={application.status === "REJECTED"}
        tone="danger"
        className="flex-1"
      >
        <XCircle aria-hidden size={15} />
        {adminT.detail.reject}
      </StatusActionButton>
    </MobileActionBar>
  );

  const summary = (
    <ReviewSummaryCard
      name={application.fullName}
      subtitle={nominationSummaryLabel}
      badges={
        <>
          <PaymentStatusBadge status={application.paymentStatus} />
        </>
      }
      meta={[
        { icon: <Mail aria-hidden size={13} />, label: application.email },
        { icon: <Phone aria-hidden size={13} />, label: application.phone },
        { icon: <MapPin aria-hidden size={13} />, label: `${application.city}, ${application.country}` },
        { icon: <CalendarClock aria-hidden size={13} />, label: formatAdminDate(application.createdAt) },
      ]}
      actions={
        <>
          <DashboardSecondaryBtn href="/admin/applications">
            <ArrowLeft aria-hidden size={15} />
            {adminT.common.back}
          </DashboardSecondaryBtn>
          <DashboardSecondaryBtn href={`/admin/applications/${application.id}/edit`}>
            <Pencil aria-hidden size={15} />
            {adminT.common.edit}
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
