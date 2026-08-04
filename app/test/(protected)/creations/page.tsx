import Link from "next/link";
import { Database, FileSearch, Trash2 } from "lucide-react";
import { getTestCreationRegistry } from "@/features/test/server/registry";
import { deleteAllTestDataAction, deleteOneTestEntityAction, deleteTestScenarioAction } from "./actions";
import {
  DashboardHeader,
  DashboardSection,
  EmptyState,
  GlassCard,
  NativeConfirmForm,
  StatusBadge,
  dashboardInputClass,
  dashboardSelectClass,
} from "@/features/test/components/TestDashboardUI";

type Search = { q?: string; type?: string; deleted?: string; count?: string; blobs?: string };

export default async function TestCreationsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const [query, registry] = await Promise.all([searchParams, getTestCreationRegistry()]);
  const q = query.q?.trim().toLowerCase() ?? "";
  const activeType = query.type ?? "all";
  const matches = (...values: unknown[]) => !q || values.some((value) => String(value ?? "").toLowerCase().includes(q));
  const groups = [
    { id: "accounts", title: "Accounts", entityType: "account", items: registry.accounts.filter((item) => matches(item.id, item.email, item.applicantProfile?.fullName, item.juryProfile?.fullName)), label: (item: (typeof registry.accounts)[number]) => `${item.email} · ${item.role}`, detail: (item: (typeof registry.accounts)[number]) => `${item.applicantProfile?._count.nominations ?? 0} nominations · ${item.juryProfile?._count.reviews ?? 0} reviews`, href: (item: (typeof registry.accounts)[number]) => item.role === "APPLICANT" ? "/test/applicant" : "/test/jury" },
    { id: "applications", title: "Applicant profiles", items: registry.profiles.filter((item) => matches(item.id, item.fullName, item.account?.email)), label: (item: (typeof registry.profiles)[number]) => `${item.fullName} · ${item.account?.email ?? "missing account"}`, detail: (item: (typeof registry.profiles)[number]) => `${item._count.nominations} nominations · ${item._count.payments} payments${item.account ? "" : " · orphaned"}`, href: () => "/test/applicant" },
    { id: "jury-applications", title: "Jury applications", items: registry.juryApplications.filter((item) => matches(item.id, item.fullName, item.email)), label: (item: (typeof registry.juryApplications)[number]) => `${item.fullName} · ${item.email}`, detail: (item: (typeof registry.juryApplications)[number]) => `${item.status} · ${item._count.files} files`, href: () => "/test/jury" },
    { id: "nominations", title: "Nominations", entityType: "nomination", items: registry.nominations.filter((item) => matches(item.id, item.applicantProfile.fullName, item.category.name, item.award.name)), label: (item: (typeof registry.nominations)[number]) => `${item.applicantProfile.fullName} · ${item.award.name}`, detail: (item: (typeof registry.nominations)[number]) => `${item.status} · ${item._count.answers} answers · ${item._count.files} files · ${item._count.reviews} reviews`, href: () => "/test/applicant" },
    { id: "reviews", title: "Reviews", entityType: "review", items: registry.reviews.filter((item) => matches(item.id, item.juryProfile.fullName, item.nomination.award.name)), label: (item: (typeof registry.reviews)[number]) => `${item.juryProfile.fullName} · ${item.nomination.award.name}`, detail: (item: (typeof registry.reviews)[number]) => `${item.status} · score ${item.totalScore ?? "—"}`, href: () => "/test/jury" },
    { id: "tickets", title: "Tickets", entityType: "ticket", items: registry.tickets.filter((item) => matches(item.id, item.fullName, item.email)), label: (item: (typeof registry.tickets)[number]) => `${item.fullName} · ${item.email}`, detail: (item: (typeof registry.tickets)[number]) => `${item.status} · ${item._count.qrCredentials} QR · ${item._count.activities} activities`, href: () => "/test/tickets" },
    { id: "qr", title: "QR credentials", items: registry.qrCredentials.filter((item) => matches(item.id, item.token, item.ticket.fullName)), label: (item: (typeof registry.qrCredentials)[number]) => `${item.ticket.fullName} · ${item.id}`, detail: (item: (typeof registry.qrCredentials)[number]) => `${item.status} · ${item.generatedAt.toLocaleString()}`, href: () => "/test/tickets" },
    { id: "uploads", title: "Uploads", items: registry.uploads.filter((item) => matches(item.id, item.fileName, item.owner)), label: (item: (typeof registry.uploads)[number]) => `${item.owner} · ${item.fileName}`, detail: (item: (typeof registry.uploads)[number]) => `${item.uploadType} · ${item.mimeType} · ${item.fileSize} bytes`, href: (item: (typeof registry.uploads)[number]) => item.uploadType === "jury" ? "/test/jury" : "/test/applicant" },
    { id: "emails", title: "Emails", entityType: "email", items: registry.emails.filter((item) => matches(item.id, item.subject, item.recipient, item.intendedRecipient)), label: (item: (typeof registry.emails)[number]) => item.subject, detail: (item: (typeof registry.emails)[number]) => `${item.delivered ? "delivered" : "failed"} · ${item.recipient || "no recipient"}`, href: () => "/test/emails" },
    { id: "payments", title: "Payments and other", items: registry.payments.filter((item) => matches(item.id, item.source, item.status, item.stripeSessionId)), label: (item: (typeof registry.payments)[number]) => `${item.source} · ${item.id}`, detail: (item: (typeof registry.payments)[number]) => `${item.status} · $${(item.amount / 100).toFixed(2)} · ${item.provider}`, href: (item: (typeof registry.payments)[number]) => item.source === "TICKET" ? "/test/tickets" : "/test/applicant" },
  ];
  const visibleGroups = groups.filter((group) => (activeType === "all" || group.id === activeType) && group.items.length > 0);
  return (
    <div className="space-y-8">
      <DashboardHeader label="Registry and cleanup" title="Creations" />
      {query.deleted ? <div role="status" className="rounded-[18px] border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-300">Deleted {query.count ?? "0"} {query.deleted === "all" ? "test records" : query.deleted}. Blobs removed: {query.blobs ?? "0"}.</div> : null}
      <GlassCard className="p-4 sm:p-5">
        <form className="grid gap-3 sm:grid-cols-[1fr_14rem_auto]">
          <input type="search" name="q" defaultValue={query.q} placeholder="Search IDs, names, emails, statuses…" className={dashboardInputClass} />
          <select name="type" defaultValue={activeType} className={dashboardSelectClass}><option value="all">All entity types</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}</select>
          <button type="submit" className="rounded-full border border-white bg-white px-5 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-950 hover:bg-zinc-200">Filter</button>
        </form>
      </GlassCard>

      <DashboardSection title="Related scenarios" eyebrow={`${registry.scenarios.length} scenario${registry.scenarios.length === 1 ? "" : "s"}`}>
        {registry.scenarios.length === 0 ? <EmptyState title="No test scenarios" description="Standalone test email logs may still appear in the groups below." /> : <div className="grid gap-3 lg:grid-cols-2">{registry.scenarios.map(({ scenario, preview }) => (
          <GlassCard key={scenario.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-sans text-lg font-semibold tracking-[-0.025em] text-white">{scenario.name}</h2><p className="mt-1 text-xs text-zinc-500">{scenario.kind} · {scenario.createdAt.toLocaleString()}</p></div><StatusBadge tone="blue">{preview.total} records</StatusBadge></div>
            <p className="mt-4 text-sm leading-6 text-zinc-500">{preview.accounts} accounts · {preview.nominations} nominations · {preview.reviews} reviews · {preview.tickets} tickets · {preview.emails} emails</p>
            <NativeConfirmForm action={deleteTestScenarioAction} message={`Delete ${scenario.name} and exactly ${preview.total} related TEST records? This cannot affect production.`} className="mt-4">
              <input type="hidden" name="scenarioId" value={scenario.id} />
              <button type="submit" className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-400/15"><Trash2 aria-hidden size={14} /> Delete scenario</button>
            </NativeConfirmForm>
          </GlassCard>
        ))}</div>}
      </DashboardSection>

      {visibleGroups.length === 0 ? <EmptyState icon={<FileSearch size={20} />} title="No matching test creations" /> : visibleGroups.map((group) => (
        <DashboardSection key={group.id} title={group.title} eyebrow={`${group.items.length} record${group.items.length === 1 ? "" : "s"}`}>
          <div className="grid gap-2">{group.items.map((item) => (
            <GlassCard key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0"><p className="truncate text-sm font-semibold">{group.label(item as never)}</p><p className="mt-1 text-xs text-zinc-500">{group.detail(item as never)}</p><p className="mt-1 truncate font-mono text-[0.65rem] text-zinc-600">{item.id} · scenario {item.testScenarioId ?? "standalone"}</p></div>
              <div className="flex shrink-0 items-center gap-2"><Link href={group.href(item as never)} className="rounded-full border border-white/[0.12] bg-white/[0.055] px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10">Open flow</Link>{group.entityType ? <NativeConfirmForm action={deleteOneTestEntityAction} message={`Delete TEST ${group.entityType} ${item.id}? Database cascades shown in its related scenario will apply.`}><input type="hidden" name="entityType" value={group.entityType} /><input type="hidden" name="entityId" value={item.id} /><button type="submit" className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-400/15">Delete</button></NativeConfirmForm> : null}</div>
            </GlassCard>
          ))}</div>
        </DashboardSection>
      ))}

      <DashboardSection title="Destructive audit" eyebrow="Most recent 25 actions">
        {registry.audits.length === 0 ? <EmptyState title="No cleanup actions" /> : <div className="grid gap-2">{registry.audits.map((audit) => <GlassCard key={audit.id} className="p-4"><p className="text-sm font-semibold">{audit.action} · {audit.targetType}</p><p className="mt-1 text-xs text-zinc-500">{audit.targetId ?? "all test data"} · {audit.createdAt.toLocaleString()}</p><pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-[0.65rem] text-zinc-500">{JSON.stringify(audit.summary)}</pre></GlassCard>)}</div>}
      </DashboardSection>

      <GlassCard className="border-red-400/20 bg-red-400/[0.055] p-5 sm:p-6">
        <div className="flex items-center gap-3 text-red-300"><Database aria-hidden size={20} /><h2 className="font-sans text-xl font-semibold tracking-[-0.025em]">Delete all test data</h2></div>
        <NativeConfirmForm action={deleteAllTestDataAction} message="Permanently delete ALL isolated test records? Production data is checked and excluded." className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input name="confirmation" required placeholder="Type DELETE ALL TEST DATA" className={`${dashboardInputClass} max-w-sm border-red-400/20`} />
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-red-400/20 bg-red-400/15 px-5 text-xs font-semibold uppercase tracking-[0.1em] text-red-200 hover:bg-red-400/20"><Trash2 aria-hidden size={14} /> Delete all test data</button>
        </NativeConfirmForm>
      </GlassCard>
    </div>
  );
}
