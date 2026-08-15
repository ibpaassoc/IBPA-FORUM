type JuryAccountSetupInput = {
  hasJuryProfile: boolean;
  accountStatus: "INVITED" | "ACTIVE" | "DISABLED";
  passwordHash: string | null;
};

export type JuryAccountSetupState =
  | "eligible"
  | "registered"
  | "disabled"
  | "unavailable";

export function getJuryAccountSetupState({
  hasJuryProfile,
  accountStatus,
  passwordHash,
}: JuryAccountSetupInput): JuryAccountSetupState {
  if (accountStatus === "DISABLED") return "disabled";
  if (passwordHash) return "registered";
  if (!hasJuryProfile) return "unavailable";
  return "eligible";
}
