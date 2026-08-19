"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { adminT, formatAdminDate } from "@/lib/i18n/admin";
import AccountStatusBadge from "@/features/admin/components/badges/AccountStatusBadge";
import ApplicationStatusBadge from "@/features/admin/components/badges/ApplicationStatusBadge";
import ApprovedCategoriesPicker from "@/features/admin/components/jury-applications/ApprovedCategoriesPicker";
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
} from "@/shared/components/admin/DashboardUI";

type JuryStatus = "SUBMITTED" | "ADDITIONAL_INFO_REQUIRED" | "APPROVED" | "REJECTED" | "PAID";
type PaymentStatus =
  | "PENDING"
  | "PARTIALLY_PAID"
  | "PAST_DUE"
  | "PAID"
  | "FAILED"
  | "EXPIRED"
  | "REFUNDED";

type JuryRow = {
  id: string;
  fullName: string;
  email: string;
  city: string;
  country: string;
  professionalTitle: string;
  expertiseAreas: string[];
  approvedCategories: string[];
  ibpaNumber: string | null;
  status: JuryStatus;
  accountStatus: "INVITED" | "ACTIVE" | "DISABLED";
  paymentStatus: PaymentStatus;
  createdAt: Date;
  submittedAt: Date | null;
  paidAt: Date | null;
};

export default function JuryApplicationListPage({
  applications,
  totalCount,
  pendingCount,
  approvedCount,
  activeJudgeCount,
}: {
  applications: JuryRow[];
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  activeJudgeCount: number;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [area, setArea] = useState("");
  const [payment, setPayment] = useState("");
  const [sort, setSort] = useState("");

  const areas = useMemo(
    () => [...new Set(applications.flatMap((app) => app.expertiseAreas))].sort(),
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
  const accountStatusesPresent = useMemo(
    () => [...new Set(applications.map((app) => app.accountStatus))],
    [applications],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = applications.filter((app) => {
      if (status && app.status !== status) return false;
      if (accountStatus && app.accountStatus !== accountStatus) return false;
      if (area && !app.expertiseAreas.includes(area)) return false;
      if (payment && app.paymentStatus !== payment) return false;
      if (q) {
        const haystack = `${app.fullName} ${app.email} ${app.ibpaNumber ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    const activity = (row: JuryRow) => (row.submittedAt ?? row.createdAt).getTime();
    if (sort === "oldest") return [...list].sort((a, b) => activity(a) - activity(b));
    if (sort === "name") return [...list].sort((a, b) => a.fullName.localeCompare(b.fullName));
    return [...list].sort((a, b) => activity(b) - activity(a));
  }, [applications, search, status, accountStatus, area, payment, sort]);

  const selects: FilterSelect[] = [
    {
      key: "status",
      label: adminT.filters.allStatuses,
      value: status,
      options: [
        { value: "", label: adminT.filters.all },
        ...statusesPresent.map((value) => ({ value, label: adminT.statuses[value] })),
      ],
    },
    {
      key: "accountStatus",
      label: adminT.filters.allAccountStatuses,
      value: accountStatus,
      options: [
        { value: "", label: adminT.filters.allAccountStatuses },
        ...accountStatusesPresent.map((value) => ({ value, label: adminT.statuses[value] })),
      ],
    },
    {
      key: "area",
      label: adminT.filters.allAreas,
      value: area,
      options: [
        { value: "", label: adminT.filters.allAreas },
        ...areas.map((value) => ({ value, label: value })),
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
    else if (key === "accountStatus") setAccountStatus(value);
    else if (key === "area") setArea(value);
    else if (key === "payment") setPayment(value);
    else if (key === "sort") setSort(value);
  }

  function clearAll() {
    setSearch("");
    setStatus("");
    setAccountStatus("");
    setArea("");
    setPayment("");
    setSort("");
  }

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader label={adminT.jury.label} title={adminT.jury.title} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-[1.1fr_repeat(3,minmax(0,0.75fr))]">
        <DashboardAccentBlock>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
            {adminT.jury.totalCandidates}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{totalCount}</p>
        </DashboardAccentBlock>
        <DashboardMetricTile label={adminT.jury.pendingReview} value={pendingCount} accent="amber" />
        <DashboardMetricTile label={adminT.jury.approved} value={approvedCount} accent="blue" />
        <DashboardMetricTile label={adminT.jury.activeJudges} value={activeJudgeCount} accent="green" />
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
            icon={<Users size={22} />}
            title={adminT.jury.emptyTitle}
            description={adminT.jury.emptyText}
          />
        </DashboardCard>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((app) => (
            <article
              key={app.id}
              role="link"
              tabIndex={0}
              aria-label={`Открыть заявку ${app.fullName}`}
              onClick={() => router.push(`/admin/jury-applications/${app.id}`)}
              onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
                if (
                  event.target === event.currentTarget &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  event.preventDefault();
                  router.push(`/admin/jury-applications/${app.id}`);
                }
              }}
              className="group block cursor-pointer rounded-[28px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.24)]"
            >
              <DashboardCard className="!overflow-visible p-0 transition hover:border-[rgba(114,160,193,0.34)] hover:shadow-[0_24px_64px_rgba(114,160,193,0.16)]">
                <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)_170px] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <ApplicationStatusBadge status={app.status} />
                      <AccountStatusBadge status={app.accountStatus} />
                    </div>
                    <h2 className="mt-3 font-[var(--font-title-family)] text-[1.55rem] font-light tracking-[-0.025em] text-[var(--color-ink)] transition group-hover:text-[var(--color-blue)]">
                      {app.fullName}
                    </h2>
                    <p className="mt-1 truncate text-sm text-[var(--color-ink-soft)]">{app.email}</p>
                    <p className="mt-3 inline-flex items-center gap-2 rounded-[18px] border border-[rgba(37,42,45,0.08)] bg-white/62 px-2.5 py-1 text-xs text-[var(--color-ink-soft)]">
                      <MapPin aria-hidden size={13} />
                      {app.city}, {app.country}
                    </p>
                  </div>

                  <DashboardPanel className="overflow-visible">
                    <p className="text-sm font-medium text-[var(--color-ink)]">{app.professionalTitle}</p>
                    <ApprovedCategoriesPicker
                      applicationId={app.id}
                      expertiseAreas={app.expertiseAreas}
                      approvedCategories={app.approvedCategories}
                      className="mt-3"
                    />
                  </DashboardPanel>

                  <div className="flex items-center justify-between gap-3 rounded-[22px] border border-[rgba(37,42,45,0.08)] bg-white p-4 transition group-hover:border-[rgba(114,160,193,0.34)] lg:flex-col lg:items-start">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                        {adminT.jury.lastActivity}
                      </p>
                      <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                        {formatAdminDate(app.paidAt ?? app.submittedAt)}
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
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
