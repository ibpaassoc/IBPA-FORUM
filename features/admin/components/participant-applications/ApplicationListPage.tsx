"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Layers3, Lock, MailPlus, MapPin } from "lucide-react";
import {
  bulkResendApplicantRegistrationLinksAction,
  closeApplicantApplicationsAction,
} from "@/features/admin/actions/applicant.actions";
import { adminT, formatAdminDate } from "@/lib/i18n/admin";
import ApplicationStatusBadge from "@/features/admin/components/badges/ApplicationStatusBadge";
import ApplicationFilters, {
  type FilterSelect,
} from "@/features/admin/components/review/ApplicationFilters";
import {
  DashboardAccentBlock,
  DashboardCard,
  DashboardEmptyState,
  DashboardMetricTile,
  DashboardPageHeader,
  DashboardPanel,
  DashboardSecondaryBtn,
} from "@/shared/components/admin/DashboardUI";

type ApplicationRow = {
  id: string;
  fullName: string;
  email: string;
  city: string;
  country: string;
  membershipNumber: string | null;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  category: { name: string };
  award: { name: string };
  registrationEligible: boolean;
  setupEmailNeedsAttention: boolean;
  nominationApplications: Array<{
    id: string;
    category: { name: string };
    award: { name: string };
  }>;
};

export default function ApplicationListPage({
  applications,
  totals,
}: {
  applications: ApplicationRow[];
  totals: {
    total: number;
    paymentPending: number;
    submitted: number;
    underReview: number;
    approved: number;
  };
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [payment, setPayment] = useState("");
  const [sort, setSort] = useState("");

  const categories = useMemo(
    () => [...new Set(applications.map((app) => app.category.name))].sort(),
    [applications],
  );
  const statusesPresent = useMemo(
    () => [...new Set(applications.map((app) => app.status))],
    [applications],
  );
  const paymentsPresent = useMemo(
    () => [...new Set(applications.map((app) => app.paymentStatus))],
    [applications],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = applications.filter((app) => {
      if (status && app.status !== status) return false;
      if (
        category &&
        app.category.name !== category &&
        !app.nominationApplications.some((nomination) => nomination.category.name === category)
      ) {
        return false;
      }
      if (payment && app.paymentStatus !== payment) return false;
      if (q) {
        const haystack = `${app.fullName} ${app.email} ${app.membershipNumber ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    if (sort === "oldest") {
      return [...list].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
    if (sort === "name") {
      return [...list].sort((a, b) => a.fullName.localeCompare(b.fullName));
    }
    return [...list].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [applications, search, status, category, payment, sort]);

  const selects: FilterSelect[] = [
    {
      key: "status",
      label: adminT.filters.allStatuses,
      value: status,
      variant: "segmented",
      options: [
        { value: "", label: adminT.filters.all },
        ...statusesPresent.map((value) => ({ value, label: adminT.statuses[value] })),
      ],
    },
    {
      key: "category",
      label: adminT.filters.allCategories,
      value: category,
      options: [
        { value: "", label: adminT.filters.allCategories },
        ...categories.map((value) => ({ value, label: value })),
      ],
    },
    {
      key: "payment",
      label: adminT.filters.allPayments,
      value: payment,
      options: [
        { value: "", label: adminT.filters.allPayments },
        ...paymentsPresent.map((value) => ({ value, label: adminT.statuses[value] })),
      ],
    },
    {
      key: "sort",
      label: adminT.filters.sortLabel,
      value: sort,
      options: [
        { value: "", label: adminT.filters.sortNewest },
        { value: "oldest", label: adminT.filters.sortOldest },
        { value: "name", label: adminT.filters.sortName },
      ],
    },
  ];

  function handleSelect(key: string, value: string) {
    if (key === "status") setStatus(value);
    else if (key === "category") setCategory(value);
    else if (key === "payment") setPayment(value);
    else if (key === "sort") setSort(value);
  }

  function clearAll() {
    setSearch("");
    setStatus("");
    setCategory("");
    setPayment("");
    setSort("");
  }

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label={adminT.applications.label}
        title={adminT.applications.title}
        actions={
          <>
            <form
              action={closeApplicantApplicationsAction}
              onSubmit={(event) => {
                if (!window.confirm(adminT.applications.closeAllConfirm)) event.preventDefault();
              }}
            >
              <DashboardSecondaryBtn type="submit">
                <Lock aria-hidden size={15} />
                {adminT.applications.closeAll}
              </DashboardSecondaryBtn>
            </form>
            <form
              id="bulk-registration-resend"
              action={bulkResendApplicantRegistrationLinksAction}
              onSubmit={(event) => {
                if (!window.confirm("Отправить выбранным участникам новые ссылки регистрации?")) {
                  event.preventDefault();
                }
              }}
            >
              <DashboardSecondaryBtn type="submit">
                <MailPlus aria-hidden size={15} />
                Регистрация
              </DashboardSecondaryBtn>
            </form>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-[1.1fr_repeat(4,minmax(0,0.75fr))]">
        <DashboardAccentBlock>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
            {adminT.common.total}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{totals.total}</p>
        </DashboardAccentBlock>
        <DashboardMetricTile label={adminT.applications.paymentPending} value={totals.paymentPending} accent="amber" />
        <DashboardMetricTile label={adminT.applications.submitted} value={totals.submitted} accent="blue" />
        <DashboardMetricTile label={adminT.applications.underReview} value={totals.underReview} accent="blue" />
        <DashboardMetricTile label={adminT.applications.approved} value={totals.approved} accent="green" />
      </div>

      <ApplicationFilters
        search={search}
        onSearchChange={setSearch}
        selects={selects}
        onSelectChange={handleSelect}
        onClearAll={clearAll}
      />

      {filtered.length === 0 ? (
        <DashboardCard>
          <DashboardEmptyState
            icon={<FileText size={22} />}
            title={adminT.applications.emptyTitle}
            description={adminT.applications.emptyText}
          />
        </DashboardCard>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((app) => {
            const nominations =
              app.nominationApplications.length > 0
                ? app.nominationApplications
                : [{ id: app.id, category: app.category, award: app.award }];
            const previewNominations = nominations.slice(0, 3);
            const remainingNominationCount = nominations.length - previewNominations.length;

            return (
              <div key={app.id} className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-stretch">
                <label className="flex min-h-16 items-center justify-center rounded-[22px] border border-[rgba(37,42,45,0.08)] bg-white/70 px-4 shadow-[0_12px_30px_rgba(37,42,45,0.04)]">
                  <span className="sr-only">Выбрать для повторной отправки регистрации</span>
                  <input
                    form="bulk-registration-resend"
                    type="checkbox"
                    name="profileIds"
                    value={app.id}
                    disabled={!app.registrationEligible}
                    className="size-4 rounded border-[rgba(114,160,193,0.35)] text-[var(--color-blue)] disabled:opacity-35"
                  />
                </label>
                <Link href={`/admin/applications/${app.id}`} className="group block min-w-0">
                  <DashboardCard className="p-0 transition hover:border-[rgba(114,160,193,0.34)] hover:shadow-[0_24px_64px_rgba(114,160,193,0.16)]">
                    <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.8fr)_minmax(180px,0.45fr)] lg:items-stretch">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <ApplicationStatusBadge status={app.status} />
                          {app.registrationEligible ? (
                            <span className="rounded-full border border-[rgba(114,160,193,0.22)] bg-[var(--color-blue-wash)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#356f98]">
                              Нужно зарегистрировать
                            </span>
                          ) : null}
                          {app.setupEmailNeedsAttention ? (
                            <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-red-700">
                              Email ошибка
                            </span>
                          ) : null}
                        </div>
                        <h2 className="mt-3 font-[var(--font-title-family)] text-[1.55rem] font-light tracking-[-0.025em] text-[var(--color-ink)]">
                          {app.fullName}
                        </h2>
                        <p className="mt-1 truncate text-sm text-[var(--color-ink-soft)]">{app.email}</p>
                        <p className="mt-3 inline-flex items-center gap-2 rounded-[18px] border border-[rgba(37,42,45,0.08)] bg-white/62 px-2.5 py-1 text-xs text-[var(--color-ink-soft)]">
                          <MapPin aria-hidden size={13} />
                          {[app.city, app.country].filter(Boolean).join(", ") || adminT.common.notProvided}
                        </p>
                      </div>

                      <DashboardPanel className="flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-[var(--color-blue)]">
                            <Layers3 aria-hidden size={16} />
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{adminT.applications.nominations}</p>
                          </div>
                          <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                            {adminT.applications.selectedCount} {nominations.length}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {previewNominations.map((nomination) => (
                            <span
                              key={nomination.id}
                              className="rounded-[18px] border border-[rgba(37,42,45,0.08)] bg-white px-2 py-1 text-xs font-medium text-[var(--color-ink-soft)]"
                            >
                              {nomination.award.name}
                            </span>
                          ))}
                          {remainingNominationCount > 0 ? (
                            <span className="rounded-[18px] border border-[rgba(114,160,193,0.34)] bg-[var(--color-blue-wash)] px-2 py-1 text-xs font-semibold text-[var(--color-ink)]">
                              +{remainingNominationCount}
                            </span>
                          ) : null}
                        </div>
                      </DashboardPanel>

                      <div className="flex items-center justify-between gap-3 rounded-[22px] border border-[rgba(37,42,45,0.08)] bg-white p-4 lg:flex-col lg:items-start">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                            {adminT.applications.createdDate}
                          </p>
                          <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                            {formatAdminDate(app.createdAt)}
                          </p>
                        </div>
                        <ArrowRight
                          aria-hidden
                          size={17}
                          className="text-[var(--color-ink-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-blue)]"
                        />
                      </div>
                    </div>
                  </DashboardCard>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
