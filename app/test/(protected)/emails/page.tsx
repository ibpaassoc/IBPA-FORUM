import { CheckCircle2, ChevronDown, FileText, Mail, Send, XCircle } from "lucide-react";
import { EMAIL_TEST_CATALOG } from "@/features/test/server/email-catalog";
import { runWithDataScope } from "@/features/test/server/data-scope";
import { prisma } from "@/shared/lib/prisma";
import { TestSubmitButton } from "@/features/test/components/TestSubmitButton";
import { sendTestEmailAction, sendTestEmailSequenceAction } from "./actions";
import {
  DashboardHeader,
  DashboardSection,
  EmptyState,
  GlassCard,
  StatusBadge,
} from "@/features/test/components/TestDashboardUI";
import { dashboardInputClass, dashboardTextareaClass } from "@/features/test/components/test-console-styles";

export default async function TestEmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; template?: string; sequence?: string; delivered?: string }>;
}) {
  const [query, logs] = await Promise.all([
    searchParams,
    runWithDataScope({ dataScope: "TEST" }, () => prisma.emailDeliveryLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 })),
  ]);
  const defaultRecipient = process.env.TEST_EMAIL_RECIPIENT ?? "";
  const categories = ["applicant", "jury", "tickets", "authentication", "payment", "other"] as const;
  return (
    <div className="space-y-8">
      <DashboardHeader
        label="Templates and delivery logs"
        title="Emails"
      />
      {query.sent ? (
        <div role="status" className={`rounded-[18px] border px-5 py-4 text-sm ${query.sent === "1" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-red-400/20 bg-red-400/10 text-red-300"}`}>
          {query.sent === "1" ? `${query.template} sent successfully.` : `${query.template} failed. See the complete log below.`}
        </div>
      ) : null}
      {query.sequence ? <div role="status" className="rounded-[18px] border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-zinc-300">Sequence complete: {query.delivered}/{query.sequence} delivered.</div> : null}

      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-center gap-3"><Send aria-hidden className="text-zinc-400" size={18} /><h2 className="font-sans text-xl font-semibold tracking-[-0.025em] text-white">Send sequence</h2></div>
        <form action={sendTestEmailSequenceAction} className="mt-5 space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Test recipient<input type="email" name="recipient" defaultValue={defaultRecipient} required className={`${dashboardInputClass} mt-2`} /></label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {EMAIL_TEST_CATALOG.map((entry) => <label key={entry.id} className="flex items-center gap-3 rounded-[15px] border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-zinc-300"><input type="checkbox" name="templateIds" value={entry.id} /> {entry.name}</label>)}
          </div>
          <TestSubmitButton idle="Run selected sequence" pending="Sending sequence…" />
        </form>
      </GlassCard>

      {categories.map((category) => {
        const entries = EMAIL_TEST_CATALOG.filter((entry) => entry.category === category);
        if (!entries.length) return null;
        return (
          <DashboardSection key={category} title={`${category[0].toUpperCase()}${category.slice(1)} emails`} eyebrow={`${entries.length} real template${entries.length === 1 ? "" : "s"}`}>
            <div className="grid gap-4 xl:grid-cols-2">
              {entries.map((entry) => {
                const preview = entry.preview(entry.defaultInputs);
                return (
                  <GlassCard key={entry.id} className="group flex h-full flex-col p-0" hover>
                    <div className="border-b border-white/[0.08] p-5 sm:p-6">
                      <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-[14px] border border-white/[0.1] bg-white/[0.06] text-zinc-300">
                          <FileText aria-hidden size={17} strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h2 className="font-sans text-lg font-semibold tracking-[-0.025em] text-white">{entry.name}</h2>
                            <StatusBadge tone="blue">{entry.id}</StatusBadge>
                          </div>
                          <p className="mt-1 text-xs text-zinc-500">{entry.requiredInputs.length} input{entry.requiredInputs.length === 1 ? "" : "s"} · ready to test</p>
                        </div>
                      </div>
                      <div className="mt-5 rounded-[16px] border border-white/[0.08] bg-black/20 px-4 py-3">
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">Subject</p>
                        <p className="mt-1 break-words text-sm font-semibold leading-6 text-zinc-100">[TEST] {preview.subject}</p>
                      </div>
                    </div>
                    <details className="group/preview border-b border-white/[0.08]">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-300 sm:px-6 [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center gap-2"><ChevronDown aria-hidden size={15} className="transition group-open/preview:rotate-180" /> Inputs and preview</span>
                        <span className="text-[0.6rem] text-zinc-600">Open</span>
                      </summary>
                      <div className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
                        <div className="space-y-2 rounded-[14px] border border-white/[0.07] bg-white/[0.025] p-3">{entry.requiredInputs.map((field) => <p key={field.name} className="text-xs leading-5"><strong className="text-zinc-300">{field.name}</strong> <span className="text-zinc-500">({field.type}) — {field.description}</span></p>)}</div>
                        <iframe title={`${entry.name} preview`} srcDoc={preview.html} className="block h-80 w-full rounded-xl border border-white/[0.1] bg-white" sandbox="" />
                      </div>
                    </details>
                    <form action={sendTestEmailAction} className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
                      <input type="hidden" name="templateId" value={entry.id} />
                      <div className="grid gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                        <label className="block min-w-0 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-zinc-500">Test recipient<input type="email" name="recipient" required defaultValue={defaultRecipient} className={`${dashboardInputClass} mt-2`} /></label>
                        <label className="block min-w-0 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-zinc-500">Inputs JSON<textarea name="inputs" required defaultValue={JSON.stringify(entry.defaultInputs, null, 2)} className={`${dashboardTextareaClass} mt-2 min-h-32 resize-y font-mono text-xs leading-5`} /></label>
                      </div>
                      <div className="mt-auto flex justify-end pt-1"><TestSubmitButton idle="Send this email" pending="Sending…" /></div>
                    </form>
                  </GlassCard>
                );
              })}
            </div>
          </DashboardSection>
        );
      })}

      <DashboardSection title="Delivery log" eyebrow="Latest 50 attempts">
        {logs.length === 0 ? <EmptyState icon={<Mail size={20} />} title="No test emails" /> : (
          <div className="grid gap-3">
            {logs.map((log) => (
              <GlassCard key={log.id} className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">{log.delivered ? <CheckCircle2 aria-hidden size={17} className="text-emerald-600" /> : <XCircle aria-hidden size={17} className="text-red-600" />}<p className="truncate text-sm font-semibold">{log.subject}</p></div>
                    <p className="mt-2 text-xs text-zinc-500">Sent to: {log.recipient || "not sent"} · Intended: {log.intendedRecipient || "not configured"}</p>
                    <p className="mt-1 text-xs text-zinc-500">Template: {log.templateType} · Provider ID: {log.providerId ?? "none"} · {log.createdAt.toLocaleString()}</p>
                  </div>
                  <StatusBadge tone={log.delivered ? "green" : "red"}>{log.delivered ? "success" : "failed"}</StatusBadge>
                </div>
                {log.errorMessage || log.providerResponse ? <details className="mt-3 rounded-xl bg-slate-950 p-3 text-xs text-slate-100"><summary className="cursor-pointer font-semibold">Complete result</summary><pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{JSON.stringify({ code: log.errorCode, error: log.errorMessage, provider: log.providerResponse }, null, 2)}</pre></details> : null}
              </GlassCard>
            ))}
          </div>
        )}
      </DashboardSection>
    </div>
  );
}
