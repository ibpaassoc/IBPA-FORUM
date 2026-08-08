import { requireApplicantAccount } from "@/features/account/server/accounts";
import ApplicantProfileContent from "@/features/account/components/profile/ApplicantProfileContent";

export default async function ApplicantProfilePage() {
  const { account, applicantProfile } = await requireApplicantAccount();

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
      membershipVerifiedLabel=""
      isVerifiedMember={Boolean(
        applicantProfile.membershipNumber && applicantProfile.membershipLevel,
      )}
    />
  );
}
