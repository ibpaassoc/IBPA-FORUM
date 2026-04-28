export type JuryRegistrationState = {
  step: "email" | "password";
  email?: string;
  notice?: string;
  error?: string;
  success?: boolean;
};

export const initialJuryRegistrationState: JuryRegistrationState = {
  step: "email",
};
