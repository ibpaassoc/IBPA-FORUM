import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, FileText, FolderOpen, Globe2, Layers3, UserRound } from "lucide-react";
import type { JuryNominationReviewRecord } from "@/features/jury/server/reviews";
import JuryReviewScorecard, { type JuryReviewValue } from "@/features/account/components/jury/JuryReviewScorecard";

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

function EmptyValue({ children }: { children: ReactNode }) {
  return <div className="rounded-[20px] border border-dashed border-[rgba(37,42,45,0.14)] bg-white/58 px-4 py-4 text-sm text-[var(--color-ink-soft)]">{children}</div>;
}

function ReviewStatusDot({ status }: { status: JuryNominationReviewRecord["peerNominations"][number]["reviewStatus"] }) {
  const complete = status === "COMPLETED" || status === "LOCKED";
  return <span aria-label={complete ? "Completed" : status === "IN_PROGRESS" ? "In progress" : "Not started"} title={complete ? "Completed" : status === "IN_PROGRESS" ? "In progress" : "Not started"} className={`size-2.5 shrink-0 rounded-full ${complete ? "bg-emerald-500" : status === "IN_PROGRESS" ? "bg-amber-400" : "bg-[rgba(37,42,45,0.24)]"}`} />;
}

export default function JuryNominationReviewPage({
  nomination,
  categoryFields,
  review,
}: {
  nomination: JuryNominationReviewRecord;
  categoryFields: Array<{ key: string; label: string; type: string; description?: string }>;
  review: JuryReviewValue | null;
}) {
  const answerMap = new Map(nomination.answers.map((answer) => [answer.fieldKey, answer]));
  const filesByField = new Map<string, typeof nomination.files>();
  for (const file of nomination.files) {
    const group = filesByField.get(file.fieldKey) ?? [];
    group.push(file);
    filesByField.set(file.fieldKey, group);
  }
  const answerFields = categoryFields.filter((field) => field.type !== "file");
  const fileFields = categoryFields.filter((field) => field.type === "file");

  return (
    <div className="flex flex-col gap-5">
      <header className="rounded-[30px] border border-[rgba(114,160,193,0.2)] bg-white/78 p-5 shadow-[0_22px_68px_rgba(37,42,45,0.075)] backdrop-blur-2xl sm:p-7">
        <Link href="/account/jury/nominations" className="inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-blue)] transition hover:bg-[var(--color-blue-wash)]"><ArrowLeft aria-hidden size={14} />All nominations</Link>
        <div className="mt-3 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[rgba(114,160,193,0.2)] bg-[var(--color-blue-wash)] px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#356f98]">{nomination.category.name}</span>
              <span className="rounded-full border border-[rgba(37,42,45,0.1)] bg-white/82 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-soft)]">Nomination review</span>
            </div>
            <h1 className="mt-3 font-[var(--font-title-family)] text-[clamp(2rem,4.5vw,3.45rem)] font-light leading-[1.04] tracking-[-0.035em] text-[var(--color-ink)]">{nomination.award.name}</h1>
          </div>
          <div className="flex min-w-[260px] items-center gap-3 rounded-[24px] border border-[rgba(37,42,45,0.08)] bg-white/68 p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]"><UserRound aria-hidden size={18} /></div>
            <div className="min-w-0">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-soft)]">Nominee</p>
              <p className="mt-1 truncate font-[var(--font-title-family)] text-lg font-light text-[var(--color-ink)]">{nomination.applicant.fullName}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex min-w-0 flex-col gap-5">
          <section aria-labelledby="submission-heading" className="overflow-hidden rounded-[30px] border border-[rgba(37,42,45,0.08)] bg-white/72 shadow-[0_20px_62px_rgba(37,42,45,0.06)] backdrop-blur-xl">
            <div className="border-b border-[rgba(37,42,45,0.08)] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]"><FileText aria-hidden size={16} /></span>
                <div>
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">Submitted material</p>
                  <h2 id="submission-heading" className="font-[var(--font-title-family)] text-2xl font-light tracking-[-0.025em] text-[var(--color-ink)]">Nomination responses</h2>
                </div>
              </div>
            </div>
            <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2">
              {answerFields.map((field) => {
                const answer = answerMap.get(field.key);
                if (!answer) return null;
                const value = formatAnswerValue(answer);
                const urlValue = field.type === "url" && /^https?:\/\//i.test(value);
                return (
                  <div key={field.key} className={`rounded-[24px] border border-[rgba(37,42,45,0.08)] bg-white/78 p-4 ${field.type === "textarea" ? "md:col-span-2" : ""}`}>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-[var(--color-ink-soft)]">{field.label}</p>
                    {urlValue ? <a href={value} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 break-all text-sm font-medium text-[var(--color-blue)] hover:underline">Open submitted link <ExternalLink aria-hidden size={13} /></a> : <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--color-ink)]">{value}</p>}
                  </div>
                );
              })}
              {!answerFields.some((field) => answerMap.has(field.key)) ? <div className="md:col-span-2"><EmptyValue>No written responses were provided.</EmptyValue></div> : null}
            </div>
          </section>

          <section aria-labelledby="files-heading" className="rounded-[30px] border border-[rgba(37,42,45,0.08)] bg-white/72 p-5 shadow-[0_20px_62px_rgba(37,42,45,0.06)] backdrop-blur-xl sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]"><FolderOpen aria-hidden size={16} /></span>
              <div>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">Evidence</p>
                <h2 id="files-heading" className="font-[var(--font-title-family)] text-2xl font-light tracking-[-0.025em] text-[var(--color-ink)]">Files and portfolio</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {fileFields.map((field) => {
                const files = filesByField.get(field.key) ?? [];
                return (
                  <div key={field.key} className="rounded-[24px] border border-[rgba(37,42,45,0.08)] bg-white/68 p-4">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{field.label}</p>
                    {field.description ? <p className="mt-1 text-xs leading-5 text-[var(--color-ink-soft)]">{field.description}</p> : null}
                    <div className="mt-3 grid gap-2">
                      {files.map((file) => (
                        <a key={file.id} href={`/api/account/jury/nomination-files/${file.id}`} target="_blank" rel="noreferrer" className="group flex min-h-12 items-center justify-between gap-3 rounded-[18px] border border-[rgba(114,160,193,0.18)] bg-white px-3 text-sm text-[var(--color-ink)] transition hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)]">
                          <span className="min-w-0"><span className="block truncate font-medium">{file.displayFileName || file.fileName}</span><span className="text-[0.68rem] text-[var(--color-ink-soft)]">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span></span>
                          <ExternalLink aria-hidden size={14} className="shrink-0 text-[var(--color-blue)]" />
                        </a>
                      ))}
                      {files.length === 0 ? <EmptyValue>No files uploaded.</EmptyValue> : null}
                    </div>
                  </div>
                );
              })}
              {fileFields.length === 0 ? <div className="md:col-span-2"><EmptyValue>This nomination has no file requirements.</EmptyValue></div> : null}
            </div>
          </section>

          {nomination.applicant.website ? (
            <a href={nomination.applicant.website} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 rounded-[26px] border border-[rgba(114,160,193,0.2)] bg-[var(--color-blue-wash)] p-5 text-[var(--color-ink)] transition hover:border-[var(--color-blue)]">
              <span className="flex min-w-0 items-center gap-3"><Globe2 aria-hidden size={18} className="shrink-0 text-[var(--color-blue)]" /><span className="min-w-0"><span className="block text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">Professional link</span><span className="mt-1 block truncate text-sm font-medium">{nomination.applicant.website}</span></span></span>
              <ExternalLink aria-hidden size={15} className="shrink-0 text-[var(--color-blue)]" />
            </a>
          ) : null}
        </div>

        <aside className="order-first flex flex-col gap-4 xl:order-none xl:sticky xl:top-5">
          <JuryReviewScorecard nominationId={nomination.id} initialReview={review} />
          {nomination.peerNominations.length > 1 ? (
            <section className="rounded-[28px] border border-[rgba(37,42,45,0.08)] bg-white/76 p-4 shadow-[0_18px_55px_rgba(37,42,45,0.055)] backdrop-blur-xl">
              <div className="flex items-center gap-2 text-[var(--color-blue)]"><Layers3 aria-hidden size={15} /><h2 className="text-[0.64rem] font-semibold uppercase tracking-[0.15em]">More from this nominee</h2></div>
              <div className="mt-3 grid gap-2">
                {nomination.peerNominations.map((peer) => {
                  const active = peer.id === nomination.id;
                  return active ? (
                    <div key={peer.id} className="flex items-center gap-3 rounded-[20px] border border-[rgba(114,160,193,0.28)] bg-[var(--color-blue-wash)] px-4 py-3"><ReviewStatusDot status={peer.reviewStatus} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[var(--color-ink)]">{peer.award.name}</span><span className="text-xs text-[var(--color-ink-soft)]">Current nomination</span></span></div>
                  ) : (
                    <Link key={peer.id} href={`/account/jury/nominations/${peer.id}`} className="group flex items-center gap-3 rounded-[20px] border border-[rgba(37,42,45,0.08)] bg-white/76 px-4 py-3 transition hover:border-[rgba(114,160,193,0.35)] hover:bg-[var(--color-blue-wash)]"><ReviewStatusDot status={peer.reviewStatus} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[var(--color-ink)]">{peer.award.name}</span><span className="text-xs text-[var(--color-ink-soft)]">{peer.category.name}</span></span><ArrowRight aria-hidden size={14} className="text-[var(--color-blue)] transition group-hover:translate-x-0.5" /></Link>
                  );
                })}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
