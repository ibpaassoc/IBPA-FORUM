import type {
  Application,
  ApplicationAnswer,
  ApplicationFile,
  Award,
  Category,
} from "@prisma/client";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { logoutAdminAction } from "@/features/admin/actions/auth.actions";
import { updateParticipantApplicationStatus } from "@/features/admin/actions/participant.actions";
import { formatAdminDate } from "@/features/admin/server/view-models";
import {
  AdminDashboardShell,
  AdminDetailCard,
  AdminHeroCard,
  AdminToolbarButton,
} from "@/shared/components/admin/AdminDashboard";

type ParticipantApplicationDetail = Application & {
  category: Category;
  award: Award;
  answers: ApplicationAnswer[];
  files: ApplicationFile[];
};

const statusOptions = [
  "PAYMENT_PENDING",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
] as const;

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return <AdminDetailCard label={label} value={value} />;
}

function formatAnswerValue(answer: {
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueJson: unknown;
}) {
  if (answer.valueText) {
    return answer.valueText;
  }

  if (answer.valueNumber !== null) {
    return String(answer.valueNumber);
  }

  if (answer.valueBoolean !== null) {
    return answer.valueBoolean ? "Yes" : "No";
  }

  if (Array.isArray(answer.valueJson)) {
    return answer.valueJson.join(", ");
  }

  if (answer.valueJson && typeof answer.valueJson === "object") {
    return JSON.stringify(answer.valueJson, null, 2);
  }

  return "Not provided";
}

export default function ApplicationDetailPage({
  application,
}: {
  application: ParticipantApplicationDetail;
}) {
  const categoryFields = categoryFieldConfigs[application.category.slug] ?? [];
  const answerMap = new Map(application.answers.map((answer) => [answer.fieldKey, answer]));
  const fileMap = new Map<string, typeof application.files>();

  for (const file of application.files) {
    const group = fileMap.get(file.fieldKey) ?? [];
    group.push(file);
    fileMap.set(file.fieldKey, group);
  }

  return (
    <AdminDashboardShell>
      <AdminHeroCard
        eyebrow="Participant Admin"
        title={application.fullName}
        subtitle={`${application.category.name} / ${application.award.name}`}
        actions={
          <>
            <AdminToolbarButton href="/admin/applications">Back to List</AdminToolbarButton>
            <AdminToolbarButton href="/admin/jury-applications">Jury Dashboard</AdminToolbarButton>
            <AdminToolbarButton href="/admin/scoring">Scoring Dashboard</AdminToolbarButton>
            <form action={logoutAdminAction}>
              <AdminToolbarButton type="submit">Log Out</AdminToolbarButton>
            </form>
          </>
        }
      />

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="admin-card rounded-3xl p-6">
              <p className="admin-eyebrow">
                Block A
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <DetailItem label="Full Legal Name" value={application.fullName} />
                <DetailItem label="Email Address" value={application.email} />
                <DetailItem label="Phone / WhatsApp" value={application.phone} />
                <DetailItem
                  label="Country / City"
                  value={`${application.country}, ${application.city}`}
                />
                <DetailItem
                  label="State / Province"
                  value={application.stateProvince || "Not required / not provided"}
                />
                <DetailItem
                  label="Professional Title"
                  value={application.professionalTitle}
                />
                <DetailItem
                  label="Years of Experience"
                  value={String(application.yearsExperience)}
                />
                <DetailItem
                  label="IBPA Membership Number"
                  value={application.membershipNumber || "Not provided"}
                />
                <DetailItem
                  label="Membership Level"
                  value={application.membershipLevel || "Not available"}
                />
                <DetailItem label="Category" value={application.category.name} />
                <DetailItem label="Specific Award" value={application.award.name} />
                <DetailItem
                  label="Professional Website"
                  value={application.websiteUrl || "Not provided"}
                />
                <DetailItem
                  label="Instagram / Social"
                  value={application.socialUrl || "Not provided"}
                />
                <DetailItem
                  label="Client Reviews"
                  value={application.reviewsUrl || "Not provided"}
                />
                <DetailItem
                  label="How They Heard About Us"
                  value={
                    answerMap.get("heardAboutOther")?.valueText
                      ? `${application.heardAbout || "Other"}: ${answerMap.get("heardAboutOther")?.valueText}`
                      : application.heardAbout || "Not provided"
                  }
                />
              </div>
            </section>

            <section className="admin-card rounded-3xl p-6">
              <p className="admin-eyebrow">
                Block B Answers
              </p>
              <div className="mt-5 space-y-4">
                {categoryFields
                  .filter((field) => field.type !== "file")
                  .map((field) => {
                    const answer = answerMap.get(field.key);

                    if (!answer) {
                      return null;
                    }

                    return (
                      <DetailItem
                        key={field.key}
                        label={field.label}
                        value={formatAnswerValue(answer)}
                      />
                    );
                  })}

                {categoryFields.every(
                  (field) => field.type === "file" || !answerMap.get(field.key)
                ) ? (
                  <p className="admin-muted text-sm">
                    No text-based Block B answers were saved for this application.
                  </p>
                ) : null}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="admin-card rounded-3xl p-6">
              <p className="admin-eyebrow">
                Review Status
              </p>

              <form
                action={updateParticipantApplicationStatus}
                className="mt-5 space-y-5"
              >
                <input type="hidden" name="id" value={application.id} />

                <div>
                  <label
                    htmlFor="status"
                    className="admin-label mb-2 block text-sm font-semibold"
                  >
                    Application status
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={application.status}
                    className="admin-field w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                  >
                    {statusOptions.map((status) => (
                      <option
                        key={status}
                        value={status}
                        className="bg-white text-(--admin-ink)"
                      >
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="admin-action-primary inline-flex items-center justify-center rounded-full px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition"
                >
                  Save Status
                </button>
              </form>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <DetailItem
                  label="Payment Status"
                  value={application.paymentStatus.replaceAll("_", " ")}
                />
                <DetailItem
                  label="Amount"
                  value={`${(application.amount / 100).toFixed(2)} ${application.currency.toUpperCase()}`}
                />
                <DetailItem
                  label="Checkout Session"
                  value={application.stripeCheckoutSessionId || "Not set"}
                />
                <DetailItem
                  label="Payment Intent"
                  value={application.stripePaymentIntentId || "Not set"}
                />
                <DetailItem
                  label="Paid At"
                  value={formatAdminDate(application.paidAt)}
                />
                <DetailItem
                  label="Submitted"
                  value={formatAdminDate(application.submittedAt)}
                />
                <DetailItem
                  label="Updated"
                  value={formatAdminDate(application.updatedAt)}
                />
              </div>
            </section>

            <section className="admin-card rounded-3xl p-6">
              <p className="admin-eyebrow">
                Uploaded Files
              </p>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm font-semibold text-(--admin-ink)">
                    Professional License / Certification
                  </p>
                  <div className="mt-3 space-y-3">
                    {(fileMap.get("licenseCertification") ?? []).map((file) => (
                      <a
                        key={file.id}
                        href={`/api/admin/application-files/${file.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-detail-card flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition hover:border-(--admin-gold)"
                      >
                        <span>{file.fileName}</span>
                        <span className="admin-muted text-xs">
                          {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                {categoryFields
                  .filter((field) => field.type === "file")
                  .map((field) => {
                    const files = fileMap.get(field.key) ?? [];

                    return (
                      <div key={field.key}>
                        <p className="text-sm font-semibold text-(--admin-ink)">{field.label}</p>
                        <div className="mt-3 space-y-3">
                          {files.map((file) => (
                            <a
                              key={file.id}
                              href={`/api/admin/application-files/${file.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="admin-detail-card flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition hover:border-(--admin-gold)"
                            >
                              <span>{file.fileName}</span>
                              <span className="admin-muted text-xs">
                                {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </a>
                          ))}
                          {files.length === 0 ? (
                            <p className="admin-muted text-sm">
                              No files uploaded for this field.
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
          </div>
        </div>
    </AdminDashboardShell>
  );
}
