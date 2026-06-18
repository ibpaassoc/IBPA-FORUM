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
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import {
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
  if (answer.valueJson && typeof answer.valueJson === "object") return JSON.stringify(answer.valueJson, null, 2);
  return "Not provided";
}

function formatLegacyFieldLabel(fieldKey: string) {
  return fieldKey
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (v) => v.toUpperCase());
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

function FileLink({ href, name, sizeBytes }: { href: string; name: string; sizeBytes: number }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between rounded-[16px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-[#10203B] transition hover:border-[#4C7D9D]/40 hover:bg-white"
    >
      <span>{name}</span>
      <span className="text-xs text-slate-400">{(sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
    </a>
  );
}

function NominationBlockB({ nomination }: { nomination: NominationDetail }) {
  const fields = categoryFieldConfigs[nomination.category.slug] ?? [];
  const answerMap = new Map(nomination.answers.map((a) => [a.fieldKey, a]));
  const fileMap = new Map<string, NominationFile[]>();
  for (const file of nomination.files) {
    const group = fileMap.get(file.fieldKey) ?? [];
    group.push(file);
    fileMap.set(file.fieldKey, group);
  }

  return (
    <DashboardCard>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
        Block B - {nomination.award.name}
      </p>
      <p className="mt-1 text-sm text-slate-500">{nomination.category.name}</p>
      <div className="mt-4 space-y-3">
        {fields.filter((f) => f.type !== "file").map((field) => {
          const answer = answerMap.get(field.key);
          if (!answer) return null;
          return <DashboardDetailCard key={field.key} label={field.label} value={formatAnswerValue(answer)} />;
        })}
        {fields.every((f) => f.type === "file" || !answerMap.get(f.key)) && (
          <p className="text-sm text-slate-400">No text-based Block B answers saved for this nomination.</p>
        )}
        {fields.filter((f) => f.type === "file").map((field) => {
          const files = fileMap.get(field.key) ?? [];
          return (
            <div key={field.key}>
              <p className="text-sm font-semibold text-[#10203B]">{field.label}</p>
              <div className="mt-1 space-y-1">
                {files.map((f) => (
                  <FileLink
                    key={f.id}
                    href={`/api/admin/nomination-files/${f.id}`}
                    name={f.fileName}
                    sizeBytes={f.fileSize}
                  />
                ))}
                {files.length === 0 && <p className="text-sm text-slate-400">No files uploaded.</p>}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}

export default function ApplicationDetailPage({
  application,
}: {
  application: ParticipantApplicationDetail;
}) {
  const answerMap = new Map(application.answers.map((a) => [a.fieldKey, a]));
  const selectedAwards = parseSelectedAwards(answerMap.get("selectedAwards")?.valueJson);
  const fileMap = new Map<string, ApplicationFile[]>();
  for (const file of application.files) {
    const group = fileMap.get(file.fieldKey) ?? [];
    group.push(file);
    fileMap.set(file.fieldKey, group);
  }

  const categoryFields = categoryFieldConfigs[application.category.slug] ?? [];
  const categoryFieldKeySet = new Set(categoryFields.map((f) => f.key));
  const categoryFileKeySet = new Set(categoryFields.filter((f) => f.type === "file").map((f) => f.key));

  // Only show legacy flat Block B if no nominations have Block B data
  const hasNominationData = application.nominationApplications.some(
    (n) => n.answers.length > 0 || n.files.length > 0
  );
  const nominationOrder = new Map(
    selectedAwards.map((item, index) => [item.awardId, index])
  );
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
      : orderedNominations.map((nom) => ({
          categoryId: nom.categoryId,
          categoryName: nom.category.name,
          awardId: nom.awardId,
          awardName: nom.award.name,
        }));
  const categorySummary = [...new Set(nominationSummaries.map((item) => item.categoryName))].join(", ");
  const nominationSummaryLabel =
    nominationSummaries.length <= 1
      ? nominationSummaries[0]?.awardName ?? application.award.name
      : `${nominationSummaries.length} nominations selected`;

  const legacyAnswerEntries = !hasNominationData
    ? application.answers.filter(
        (a) =>
          a.fieldKey !== "heardAboutOther" &&
          a.fieldKey !== "licenseCertification" &&
          a.fieldKey !== "selectedAwards" &&
          categoryFieldKeySet.has(a.fieldKey)
      )
    : [];
  const legacyFileEntries = !hasNominationData
    ? [...fileMap.entries()].filter(([key]) => key !== "licenseCertification" && categoryFileKeySet.has(key))
    : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">Participant</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#10203B]">{application.fullName}</h1>
          <p className="mt-0.5 text-sm text-slate-500">{nominationSummaryLabel}</p>
          {nominationSummaries.length > 1 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {nominationSummaries.map((item) => (
                <span
                  key={item.awardId}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                >
                  {item.awardName}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <DashboardSecondaryBtn href="/admin/applications">← Back to list</DashboardSecondaryBtn>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          {/* Block A */}
          <DashboardCard>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">Block A — Personal info</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <DashboardDetailCard label="Full legal name" value={application.fullName} />
              <DashboardDetailCard label="Email address" value={application.email} />
              <DashboardDetailCard label="Phone / WhatsApp" value={application.phone} />
              <DashboardDetailCard label="Country / City" value={`${application.country}, ${application.city}`} />
              <DashboardDetailCard label="State / Province" value={application.stateProvince || "Not required"} />
              <DashboardDetailCard label="Professional title" value={application.professionalTitle} />
              <DashboardDetailCard label="Years of experience" value={String(application.yearsExperience)} />
              <DashboardDetailCard label="IBPA membership no." value={application.membershipNumber || "Not provided"} />
              <DashboardDetailCard label="Membership level" value={application.membershipLevel || "Not available"} />
              <DashboardDetailCard label="Category" value={categorySummary || application.category.name} />
              <DashboardDetailCard label="Nomination" value={nominationSummaryLabel} />
              <DashboardDetailCard label="Website" value={application.websiteUrl || "Not provided"} />
              <DashboardDetailCard label="Instagram / Social" value={application.socialUrl || "Not provided"} />
              <DashboardDetailCard label="Client reviews" value={application.reviewsUrl || "Not provided"} />
              <DashboardDetailCard
                label="Heard about us"
                value={
                  answerMap.get("heardAboutOther")?.valueText
                    ? `${application.heardAbout || "Other"}: ${answerMap.get("heardAboutOther")?.valueText}`
                    : application.heardAbout || "Not provided"
                }
              />
            </div>
          </DashboardCard>

          {/* Per-nomination Block B sections */}
          {hasNominationData ? (
            orderedNominations.map((nom) => (
              <NominationBlockB key={nom.id} nomination={nom} />
            ))
          ) : (
            <DashboardCard>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">Block B — Answers (Legacy)</p>
              <div className="mt-4 space-y-3">
                {legacyAnswerEntries.map((a) => (
                  <DashboardDetailCard
                    key={a.id}
                    label={formatLegacyFieldLabel(a.fieldKey)}
                    value={formatAnswerValue(a)}
                  />
                ))}
                {legacyAnswerEntries.length === 0 && (
                  <p className="text-sm text-slate-400">No Block B answers recorded.</p>
                )}
              </div>
            </DashboardCard>
          )}
        </div>

        {/* Files */}
        <DashboardCard>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">Uploaded files</p>
          <div className="mt-4 space-y-5">
            {/* License */}
            <div>
              <p className="mb-2 text-sm font-semibold text-[#10203B]">Professional license / Certification</p>
              <div className="space-y-2">
                {(fileMap.get("licenseCertification") ?? []).map((f) => (
                  <FileLink key={f.id} href={`/api/admin/application-files/${f.id}`} name={f.fileName} sizeBytes={f.fileSize} />
                ))}
                {(fileMap.get("licenseCertification") ?? []).length === 0 && (
                  <p className="text-sm text-slate-400">No license file uploaded.</p>
                )}
              </div>
            </div>

            {/* Legacy flat category files */}
            {legacyFileEntries.map(([key, files]) => (
              <div key={key}>
                <p className="mb-2 text-sm font-semibold text-[#10203B]">{formatLegacyFieldLabel(key)} (Legacy)</p>
                <div className="space-y-2">
                  {files.map((f) => (
                    <FileLink key={f.id} href={`/api/admin/application-files/${f.id}`} name={f.fileName} sizeBytes={f.fileSize} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
