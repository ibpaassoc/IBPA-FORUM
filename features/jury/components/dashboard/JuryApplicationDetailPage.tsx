import JuryScoreForm from "@/features/admin/components/jury-applications/JuryScoreForm";
import type { JuryNominationScoringRecord } from "@/features/admin/server/jury";
import {
  DashboardCard,
  DashboardDetailCard,
  DashboardSecondaryBtn,
} from "@/shared/components/admin/DashboardUI";

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
  if (answer.valueJson && typeof answer.valueJson === "object")
    return JSON.stringify(answer.valueJson, null, 2);
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

  // Block A answers from parent application
  const appAnswerMap = new Map(application.answers.map((a) => [a.fieldKey, a]));
  const appFileMap = new Map<string, typeof application.files>();
  for (const file of application.files) {
    const group = appFileMap.get(file.fieldKey) ?? [];
    group.push(file);
    appFileMap.set(file.fieldKey, group);
  }

  // Block B answers from this nomination
  const nomAnswerMap = new Map(nomination.answers.map((a) => [a.fieldKey, a]));
  const nomFileMap = new Map<string, typeof nomination.files>();
  for (const file of nomination.files) {
    const group = nomFileMap.get(file.fieldKey) ?? [];
    group.push(file);
    nomFileMap.set(file.fieldKey, group);
  }

  const categoryFieldKeySet = new Set(categoryFields.map((f) => f.key));
  const categoryFileKeySet = new Set(
    categoryFields.filter((f) => f.type === "file").map((f) => f.key)
  );

  // Legacy flat answers on the parent application (for old submissions without NominationAnswer)
  const hasNominationAnswers = nomination.answers.length > 0 || nomination.files.length > 0;
  const legacyAppAnswers = !hasNominationAnswers
    ? application.answers.filter(
        (a) =>
          a.fieldKey !== "heardAboutOther" &&
          a.fieldKey !== "licenseCertification" &&
          a.fieldKey !== "selectedAwards" &&
          categoryFieldKeySet.has(a.fieldKey)
      )
    : [];
  const legacyAppFileEntries = !hasNominationAnswers
    ? [...appFileMap.entries()].filter(([key]) => categoryFileKeySet.has(key))
    : [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
            Jury Review
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#10203B]">
            {application.fullName}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {nomination.category.name} / {nomination.award.name}
          </p>
        </div>
        <DashboardSecondaryBtn href="/jury/dashboard">← Back</DashboardSecondaryBtn>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <DashboardCard>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
              Block A — Personal info
            </p>
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
              <DashboardDetailCard label="Professional title" value={application.professionalTitle} />
              <DashboardDetailCard
                label="Years of experience"
                value={String(application.yearsExperience)}
              />
              <DashboardDetailCard
                label="IBPA membership no."
                value={application.membershipNumber || "Not provided"}
              />
              <DashboardDetailCard
                label="Membership level"
                value={application.membershipLevel || "Not available"}
              />
              <DashboardDetailCard label="Category" value={nomination.category.name} />
              <DashboardDetailCard label="Nomination" value={nomination.award.name} />
              <DashboardDetailCard
                label="Website"
                value={application.websiteUrl || "Not provided"}
              />
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
          </DashboardCard>

          <DashboardCard>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
              Block B — Answers
            </p>
            <div className="mt-4 space-y-3">
              {hasNominationAnswers ? (
                <>
                  {categoryFields
                    .filter((f) => f.type !== "file")
                    .map((field) => {
                      const answer = nomAnswerMap.get(field.key);
                      if (!answer) return null;
                      return (
                        <DashboardDetailCard
                          key={field.key}
                          label={field.label}
                          value={formatAnswerValue(answer)}
                        />
                      );
                    })}
                  {categoryFields.every((f) => f.type === "file" || !nomAnswerMap.get(f.key)) && (
                    <p className="text-sm text-slate-400">No text-based Block B answers saved.</p>
                  )}
                </>
              ) : (
                <>
                  {legacyAppAnswers.map((a) => (
                    <DashboardDetailCard
                      key={a.id}
                      label={formatLegacyFieldLabel(a.fieldKey)}
                      value={formatAnswerValue(a)}
                    />
                  ))}
                  {legacyAppAnswers.length === 0 && (
                    <p className="text-sm text-slate-400">No Block B answers recorded.</p>
                  )}
                </>
              )}
            </div>
          </DashboardCard>
        </div>

        <div className="space-y-5">
          <JuryScoreForm nominationApplicationId={nomination.id} initialScore={score} />

          <DashboardCard>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
              Uploaded files
            </p>
            <div className="mt-4 space-y-5">
              <div>
                <p className="mb-2 text-sm font-semibold text-[#10203B]">
                  Professional license / Certification
                </p>
                <div className="space-y-2">
                  {(appFileMap.get("licenseCertification") ?? []).map((f) => (
                    <FileLink
                      key={f.id}
                      href={`/api/jury/application-files/${f.id}`}
                      name={f.fileName}
                      sizeBytes={f.fileSize}
                    />
                  ))}
                  {(appFileMap.get("licenseCertification") ?? []).length === 0 && (
                    <p className="text-sm text-slate-400">No license file uploaded.</p>
                  )}
                </div>
              </div>

              {hasNominationAnswers ? (
                categoryFields
                  .filter((f) => f.type === "file")
                  .map((field) => {
                    const files = nomFileMap.get(field.key) ?? [];
                    return (
                      <div key={field.key}>
                        <p className="mb-2 text-sm font-semibold text-[#10203B]">{field.label}</p>
                        <div className="space-y-2">
                          {files.map((f) => (
                            <FileLink
                              key={f.id}
                              href={`/api/jury/nomination-files/${f.id}`}
                              name={f.fileName}
                              sizeBytes={f.fileSize}
                            />
                          ))}
                          {files.length === 0 && (
                            <p className="text-sm text-slate-400">No files uploaded for this field.</p>
                          )}
                        </div>
                      </div>
                    );
                  })
              ) : (
                legacyAppFileEntries.map(([key, files]) => (
                  <div key={key}>
                    <p className="mb-2 text-sm font-semibold text-[#10203B]">
                      {formatLegacyFieldLabel(key)}
                    </p>
                    <div className="space-y-2">
                      {files.map((f) => (
                        <FileLink
                          key={f.id}
                          href={`/api/jury/application-files/${f.id}`}
                          name={f.fileName}
                          sizeBytes={f.fileSize}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
