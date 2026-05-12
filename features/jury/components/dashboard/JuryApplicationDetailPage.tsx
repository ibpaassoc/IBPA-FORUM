import type { ApplicationAnswer, ApplicationFile } from "@prisma/client";
import { formatAdminDate } from "@/features/admin/server/view-models";
import JurySignOutButton from "@/features/jury/components/dashboard/JurySignOutButton";
import JuryScoreForm from "@/features/admin/components/jury-applications/JuryScoreForm";
import type { JuryScoringApplicationRecord } from "@/features/admin/server/jury";
import {
  AdminDashboardShell,
  AdminDetailCard,
  AdminHeroCard,
  AdminSection,
  AdminToolbarButton,
} from "@/shared/components/admin/AdminDashboard";

type JuryApplicationDetail = JuryScoringApplicationRecord & {
  answers: ApplicationAnswer[];
  files: ApplicationFile[];
};

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

export default function JuryApplicationDetailPage({
  application,
  categoryFields,
  score,
}: {
  application: JuryApplicationDetail;
  categoryFields: Array<{
    key: string;
    label: string;
    type: string;
  }>;
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
        eyebrow="Jury Review"
        title={application.fullName}
        subtitle={`${application.category.name} / ${application.award.name}`}
        actions={
          <>
            <AdminToolbarButton href="/jury/dashboard">Back to Dashboard</AdminToolbarButton>
            <JurySignOutButton />
          </>
        }
      />

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <AdminSection eyebrow="Block A">
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
                <DetailItem label="Direction" value={application.category.name} />
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
            </AdminSection>

            <AdminSection eyebrow="Block B Answers">
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
            </AdminSection>
          </div>

          <div className="space-y-6">
            <JuryScoreForm applicationId={application.id} initialScore={score} />

            <AdminSection eyebrow="Uploaded Files">
              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm font-semibold text-(--admin-ink)">
                    Professional License / Certification
                  </p>
                  <div className="mt-3 space-y-3">
                    {(fileMap.get("licenseCertification") ?? []).map((file) => (
                      <a
                        key={file.id}
                        href={`/api/jury/application-files/${file.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-detail-card flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition hover:border-(--admin-blue)"
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
                              href={`/api/jury/application-files/${file.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="admin-detail-card flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition hover:border-(--admin-blue)"
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
            </AdminSection>
          </div>
        </div>
    </AdminDashboardShell>
  );
}
