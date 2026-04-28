import JuryAuthShell from "@/features/jury/components/auth/JuryAuthShell";
import JuryLoginForm from "@/features/jury/components/auth/JuryLoginForm";

export default function JuryLoginPageContent({
  searchParams,
}: {
  searchParams?: {
    email?: string;
    notice?: string;
  };
}) {
  return (
    <JuryAuthShell
      eyebrow="Jury Login"
      title="Access your jury dashboard"
      description="Log in with the email and password created after your jury payment was confirmed. Jury access is limited to the categories you applied to review."
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
        Sign In
      </p>
      <h2 className="mt-4 text-2xl font-semibold">Jury account login</h2>
      <p className="mt-3 text-sm leading-6 text-[#d9d4ca]/85">
        Enter your registered jury credentials to open the review workspace.
      </p>

      <JuryLoginForm
        defaultEmail={searchParams?.email?.trim().toLowerCase()}
        notice={searchParams?.notice}
      />
    </JuryAuthShell>
  );
}
