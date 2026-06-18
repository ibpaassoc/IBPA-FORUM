import JuryScoreForm from "@/features/admin/components/jury-applications/JuryScoreForm";
import type { JuryNominationScoringRecord } from "@/features/admin/server/jury";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ExternalLink,
  Files,
  Globe,
  Layers3,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  DashboardCard,
  DashboardDetailCard,
  DashboardSecondaryBtn,
} from "@/shared/components/admin/DashboardUI";

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

export default function JuryApplicationDetailPage({
  nomination,
  categoryFields,
  score,
}: {
  nomination: JuryNominationScoringRecord;
  categoryFields: Array<{ key: string; label: string; type: string }>;
  score: {
    id: string;
    technical: number | null;
    aesthetic: number | null;
    creativity: number | null;
    impact: number | null;
    presentation: number | null;
    totalScore: number | null;
    comment: string | null;
    status: "DRAFT" | "SUBMITTED" | "REOPENED";
    submittedAt: Date | null;
    updatedAt: Date;
  } | null;
}) {
  const { application } = nomination;
  const appAnswerMap = new Map(application.answers.map((answer) => [answer.fieldKey, answer]));
  const selectedAwards = parseSelectedAwards(appAnswerMap.get("selectedAwards")?.valueJson);
  const appFileMap = new Map<string, typeof application.files>();

  for (const file of application.files) {
    const group = appFileMap.get(file.fieldKey) ?? [];
    group.push(file);
    appFileMap.set(file.fieldKey, group);
  }

  const nomAnswerMap = new Map(nomination.answers.map((answer) => [answer.fieldKey, answer]));
  const nomFileMap = new Map<string, typeof nomination.files>();

  for (const file of nomination.files) {
    const group = nomFileMap.get(file.fieldKey) ?? [];
    group.push(file);
    nomFileMap.set(file.fieldKey, group);
  }

  const nominationOrder = new Map(selectedAwards.map((item, index) => [item.awardId, index]));
  const orderedApplicationNominations = [...application.nominationApplications].sort((left, right) => {
    const leftOrder = nominationOrder.get(left.awardId) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = nominationOrder.get(right.awardId) ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.createdAt.getTime() - right.createdAt.getTime();
  });

  const categoryFieldKeySet = new Set(categoryFields.map((field) => field.key));
  const categoryFileKeySet = new Set(
    categoryFields.filter((field) => field.type === "file").map((field) => field.key)
  );

  const hasNominationAnswers = nomination.answers.length > 0 || nomination.files.length > 0;
  const legacyAppAnswers = !hasNominationAnswers
    ? application.answers.filter(
        (answer) =>
          answer.fieldKey !== "heardAboutOther" &&
          answer.fieldKey !== "licenseCertification" &&
          answer.fieldKey !== "selectedAwards" &&
          categoryFieldKeySet.has(answer.fieldKey)
      )
    : [];
  const legacyAppFileEntries = !hasNominationAnswers
    ? [...appFileMap.entries()].filter(([key]) => categoryFileKeySet.has(key))
    : [];

  const nominationFileFields = categoryFields.filter((field) => field.type === "file");
  const nominationTextFields = categoryFields.filter((field) => field.type !== "file");

  return (
    <div className="space-y-6">
      <DashboardCard className="overflow-hidden border-[#10203B]/10 bg-[radial-gradient(circle_at_top_left,_rgba(76,125,157,0.18),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f5f8fc_55%,#eef3f8_100%)] p-0">
        <div className="grid gap-6 px-6 py-6 md:px-8 md:py-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div>
            <div className="inline-flex rounded-full border border-[#4C7D9D]/20 bg-[#E9F1F8] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4C7D9D]">
              Jury review workspace
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#10203B] md:text-4xl">
              {nomination.award.name}
            </h1>
            <p className="mt-2 text-[15px] leading-7 text-slate-600">{nomination.category.name}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                <ShieldCheck size={13} />
                {application.fullName}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                <Mail size={13} />
                {application.email}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                <MapPin size={13} />
                {application.city}, {application.country}
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[28px] border border-[#10203B]/10 bg-[#10203B] p-5 text-white shadow-[0_18px_50px_rgba(16,32,59,0.16)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
                Review focus
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{application.fullName}</p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Score this nomination with applicant context, evidence files, and category answers
                in one focused workflow.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E9F1F8] text-[#4C7D9D]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#10203B]">Nomination position</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Application-only scope
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm leading-7 text-slate-600">
                  {orderedApplicationNominations.findIndex((item) => item.id === nomination.id) + 1} of{" "}
                  {orderedApplicationNominations.length} nominations in this application.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>

      <div className="flex justify-between">
        <DashboardSecondaryBtn href="/jury/dashboard" className="gap-2">
          <ArrowLeft size={15} />
          Back to review queue
        </DashboardSecondaryBtn>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_380px]">
        <div className="space-y-6">
          <DashboardCard className="overflow-hidden border-slate-200/90 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcfe_60%,#f2f6fb_100%)] p-0">
            <div className="border-b border-slate-200/80 px-5 py-5 md:px-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
                Applicant context
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#10203B]">
                Review-ready profile
              </h2>
            </div>

            <div className="space-y-6 px-5 py-5 md:px-6">
              <div>
                <div className="flex items-center gap-2 text-[#4C7D9D]">
                  <BriefcaseBusiness size={16} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">
                    Applicant details
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <DashboardDetailCard label="Full legal name" value={application.fullName} />
                  <DashboardDetailCard label="Professional title" value={application.professionalTitle} />
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
                  <DashboardDetailCard
                    label="Years of experience"
                    value={String(application.yearsExperience)}
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
                    Public presence
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <DashboardDetailCard label="Website" value={application.websiteUrl || "Not provided"} />
                  <DashboardDetailCard
                    label="Instagram / Social"
                    value={application.socialUrl || "Not provided"}
                  />
                  <DashboardDetailCard
                    label="Client reviews"
                    value={application.reviewsUrl || "Not provided"}
                  />
                  <DashboardDetailCard
                    label="Heard about us"
                    value={
                      appAnswerMap.get("heardAboutOther")?.valueText
                        ? `${application.heardAbout || "Other"}: ${appAnswerMap.get("heardAboutOther")?.valueText}`
                        : application.heardAbout || "Not provided"
                    }
                  />
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard className="overflow-hidden border-slate-200/90 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcfe_60%,#f2f6fb_100%)] p-0">
            <div className="border-b border-slate-200/80 px-5 py-5 md:px-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
                Nomination evidence
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#10203B]">
                {nomination.award.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{nomination.category.name}</p>
            </div>

            <div className="grid gap-5 px-5 py-5 md:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
                  Answers
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {hasNominationAnswers
                    ? nominationTextFields.map((field) => {
                        const answer = nomAnswerMap.get(field.key);
                        if (!answer) return null;
                        return (
                          <DashboardDetailCard
                            key={field.key}
                            label={field.label}
                            value={formatAnswerValue(answer)}
                          />
                        );
                      })
                    : legacyAppAnswers.map((answer) => (
                        <DashboardDetailCard
                          key={answer.id}
                          label={formatLegacyFieldLabel(answer.fieldKey)}
                          value={formatAnswerValue(answer)}
                        />
                      ))}
                </div>
                {(hasNominationAnswers
                  ? nominationTextFields.every((field) => !nomAnswerMap.get(field.key))
                  : legacyAppAnswers.length === 0) ? (
                  <div className="mt-4 rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                    No text-based answers were saved for this nomination.
                  </div>
                ) : null}
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-white/85 p-5 shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
                  Files
                </p>
                <div className="mt-4 space-y-4">
                  {hasNominationAnswers
                    ? nominationFileFields.map((field) => {
                        const files = nomFileMap.get(field.key) ?? [];
                        return (
                          <div key={field.key}>
                            <p className="text-sm font-semibold text-[#10203B]">{field.label}</p>
                            <div className="mt-3 space-y-2">
                              {files.map((file) => (
                                <FileLink
                                  key={file.id}
                                  href={`/api/jury/nomination-files/${file.id}`}
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
                      })
                    : legacyAppFileEntries.map(([key, files]) => (
                        <div key={key}>
                          <p className="text-sm font-semibold text-[#10203B]">
                            {formatLegacyFieldLabel(key)}
                          </p>
                          <div className="mt-3 space-y-2">
                            {files.map((file) => (
                              <FileLink
                                key={file.id}
                                href={`/api/jury/application-files/${file.id}`}
                                name={file.fileName}
                                sizeBytes={file.fileSize}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>

        <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <JuryScoreForm nominationApplicationId={nomination.id} initialScore={score} />

          <DashboardCard className="overflow-hidden border-slate-200/90 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcfe_65%,#f2f6fb_100%)] p-0">
            <div className="border-b border-slate-200/80 px-5 py-5">
              <div className="flex items-center gap-2 text-[#4C7D9D]">
                <Layers3 size={16} />
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">
                  Application nominations
                </p>
              </div>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#10203B]">
                Review map
              </h2>
            </div>

            <div className="space-y-3 px-5 py-5">
              {orderedApplicationNominations.map((item, index) => {
                const active = item.id === nomination.id;

                return (
                  <div
                    key={item.id}
                    className={`rounded-[22px] border px-4 py-4 ${
                      active
                        ? "border-[#4C7D9D]/30 bg-[#E9F1F8]"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4C7D9D]">
                      Nomination {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#10203B]">
                      {item.award.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{item.category.name}</p>
                    {active ? (
                      <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[#4C7D9D]">
                        Current review
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </DashboardCard>

          <DashboardCard className="overflow-hidden border-slate-200/90 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcfe_65%,#f2f6fb_100%)] p-0">
            <div className="border-b border-slate-200/80 px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
                Shared credentials
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#10203B]">
                License and shared files
              </h2>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div>
                <p className="text-sm font-semibold text-[#10203B]">
                  Professional license / Certification
                </p>
                <div className="mt-3 space-y-2">
                  {(appFileMap.get("licenseCertification") ?? []).map((file) => (
                    <FileLink
                      key={file.id}
                      href={`/api/jury/application-files/${file.id}`}
                      name={file.fileName}
                      sizeBytes={file.fileSize}
                    />
                  ))}
                  {(appFileMap.get("licenseCertification") ?? []).length === 0 ? (
                    <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-500">
                      No license file uploaded.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
