import type { ReactNode } from "react";
import { ArrowLeft, ExternalLink, Files, Globe, Layers3, UserRound } from "lucide-react";
import JuryScoreForm from "@/features/admin/components/jury-applications/JuryScoreForm";
import type { JuryNominationScoringRecord } from "@/features/admin/server/jury";
import {
  DashboardCard,
  DashboardChip,
  DashboardDetailCard,
  DashboardPageHeader,
  DashboardPanel,
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
  if (answer.valueJson && typeof answer.valueJson === "object") {
    return JSON.stringify(answer.valueJson, null, 2);
  }
  return "Not provided";
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
  const answerMap = new Map(nomination.answers.map((answer) => [answer.fieldKey, answer]));
  const fileMap = new Map<string, typeof nomination.files>();

  for (const file of nomination.files) {
    const group = fileMap.get(file.fieldKey) ?? [];
    group.push(file);
    fileMap.set(file.fieldKey, group);
  }

  const fileFields = categoryFields.filter((field) => field.type === "file");
  const textFields = categoryFields.filter((field) => field.type !== "file");
  const currentIndex = nomination.peerNominations.findIndex((item) => item.id === nomination.id);

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label="Nomination review"
        title={nomination.award.name}
        description={`${nomination.category.name} / ${nomination.applicant.fullName}`}
        actions={
          <DashboardSecondaryBtn href="/account/jury">
            <ArrowLeft aria-hidden size={15} />
            Back
          </DashboardSecondaryBtn>
        }
      />

      <DashboardCard>
        <div className="grid gap-3 md:grid-cols-2">
          <DashboardDetailCard label="Applicant full name" value={nomination.applicant.fullName} />
          <DashboardDetailCard label="Instagram" value={nomination.applicant.instagram || "Not provided"} />
        </div>
      </DashboardCard>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-5">
          <DashboardCard className="p-0">
            <div className="border-b border-[rgba(37,42,45,0.08)] p-4 md:p-5">
              <div className="flex flex-wrap gap-2">
                <DashboardChip>{nomination.category.name}</DashboardChip>
                <DashboardChip>
                  {currentIndex >= 0 ? `${currentIndex + 1} of ${nomination.peerNominations.length}` : "Nomination"}
                </DashboardChip>
              </div>
              <h2 className="mt-2 font-[var(--font-title-family)] text-2xl font-light tracking-[-0.025em] text-[var(--color-ink)]">
                {nomination.award.name}
              </h2>
            </div>

            <div className="grid gap-4 p-4 md:p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
              <div>
                <div className="flex items-center gap-2 text-[var(--color-blue)]">
                  <UserRound aria-hidden size={16} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Answers</p>
                </div>
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
                {!textFields.some((field) => answerMap.get(field.key)) ? (
                  <div className="mt-3">
                    <EmptyInline>No text answers were saved for this nomination.</EmptyInline>
                  </div>
                ) : null}
              </div>

              <DashboardPanel>
                <div className="flex items-center gap-2 text-[var(--color-blue)]">
                  <Globe aria-hidden size={16} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Files</p>
                </div>
                <div className="mt-3 flex flex-col gap-4">
                  {fileFields.map((field) => {
                    const files = fileMap.get(field.key) ?? [];
                    return (
                      <div key={field.key}>
                        <p className="text-sm font-medium text-[var(--color-ink)]">{field.label}</p>
                        <div className="mt-2 flex flex-col gap-2">
                          {files.map((file) => (
                            <FileLink
                              key={file.id}
                              href={`/api/jury/nomination-files/${file.id}`}
                              name={file.displayFileName || file.fileName}
                              sizeBytes={file.fileSize}
                            />
                          ))}
                          {files.length === 0 ? <EmptyInline>No files uploaded.</EmptyInline> : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DashboardPanel>
            </div>
          </DashboardCard>
        </div>

        <aside className="order-first flex flex-col gap-4 xl:order-none xl:sticky xl:top-5 xl:self-start">
          <JuryScoreForm nominationApplicationId={nomination.id} initialScore={score} />

          <DashboardCard>
            <div className="flex items-center gap-2 text-[var(--color-blue)]">
              <Layers3 aria-hidden size={16} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Applicant nominations</p>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {nomination.peerNominations.map((item, index) => {
                const active = item.id === nomination.id;

                return (
                  <div
                    key={item.id}
                    className={`rounded-[22px] border px-3 py-3 ${
                      active ? "border-[rgba(114,160,193,0.34)] bg-[var(--color-blue-wash)]" : "border-[rgba(37,42,45,0.08)] bg-white"
                    }`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                      Nomination {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--color-ink)]">{item.award.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">{item.category.name}</p>
                    {active ? (
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-blue)]">
                        Current
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </DashboardCard>
        </aside>
      </div>
    </div>
  );
}
