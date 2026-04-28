import AuthShell from "@/features/auth/components/AuthShell";
import LoginForm from "@/features/auth/components/LoginForm";

export default async function JuryLoginPage() {
  return (
    <AuthShell
      eyebrow="Jury Login"
      title="Access the IBPA jury member experience"
      description="Sign in with your email and password to continue to the main site. Protected pages will send unauthenticated visitors here first."
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
        Jury Login
      </p>
      <h2 className="mt-4 text-2xl font-semibold">Welcome back</h2>
      <p className="mt-3 text-sm leading-6 text-[#d9d4ca]/85">
        Enter your credentials to continue to the IBPA homepage.
      </p>
      <LoginForm />
    </AuthShell>
  );
}
