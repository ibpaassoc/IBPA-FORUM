import { requireApplicantAccount } from "@/features/account/server/accounts";
import { formatDateLabel } from "@/features/account/components/nomination-presentation";
import ApplicantProfileContent from "@/features/account/components/profile/ApplicantProfileContent";
import { getServerLanguage } from "@/lib/i18n/server";

export default async function ApplicantProfilePage() {
  const [{ account, applicantProfile }, language] = await Promise.all([
    requireApplicantAccount(),
    getServerLanguage(),
  ]);

  return (
    <ApplicantProfileContent
      email={account.email}
      values={{
        fullName: applicantProfile.fullName,
        phone: applicantProfile.phone ?? "",
        professionalTitle: applicantProfile.professionalTitle ?? "",
        yearsExperience:
          applicantProfile.yearsExperience === null ? "" : String(applicantProfile.yearsExperience),
        country: applicantProfile.country ?? "",
        stateProvince: applicantProfile.stateProvince ?? "",
        city: applicantProfile.city ?? "",
        websiteUrl: applicantProfile.websiteUrl ?? "",
        socialUrl: applicantProfile.socialUrl ?? "",
        reviewsUrl: applicantProfile.reviewsUrl ?? "",
      }}
      membershipNumber={applicantProfile.membershipNumber ?? ""}
      membershipLevel={applicantProfile.membershipLevel ?? ""}
      membershipVerifiedLabel={
        applicantProfile.membershipVerifiedAt
          ? formatDateLabel(applicantProfile.membershipVerifiedAt, language)
          : ""
      }
      isVerifiedMember={Boolean(
        applicantProfile.membershipNumber && applicantProfile.membershipLevel,
      )}
    />
  );
}
