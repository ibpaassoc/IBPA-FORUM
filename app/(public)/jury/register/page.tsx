import AuthShell from "@/features/auth/components/AuthShell";
import RegisterForm from "@/features/auth/components/RegisterForm";

export default async function JuryRegisterPage() {
  return (
    <AuthShell
      eyebrow="Jury Register"
      title="Create your private IBPA jury access"
      description="Create an email and password to enter the site. Registration signs you in immediately and redirects you to the main homepage."
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
        Jury Register
      </p>
      <h2 className="mt-4 text-2xl font-semibold">Create your account</h2>
      <p className="mt-3 text-sm leading-6 text-[#d9d4ca]/85">
        Use your email address and create a password to begin.
      </p>
      <RegisterForm />
    </AuthShell>
  );
}
