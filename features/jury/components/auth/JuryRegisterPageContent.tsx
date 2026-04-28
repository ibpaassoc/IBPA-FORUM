import JuryAuthShell from "@/features/jury/components/auth/JuryAuthShell";
import JuryEmailCheckForm from "@/features/jury/components/auth/JuryEmailCheckForm";
import Link from "next/link";

export default function JuryRegisterPageContent({
  searchParams,
}: {
  searchParams?: {
    email?: string;
  };
}) {
  const email = searchParams?.email?.trim().toLowerCase();

  return (
    <JuryAuthShell
      eyebrow="Jury Registration"
      title="Create your private jury review access"
      description="Enter the email used for your jury application and completed payment. Once verified, you can set a password and continue into your jury dashboard."
      footer={
        <p className="text-sm leading-6 text-[#d9d4ca]/85">
          Already have access?{" "}
          <Link href="/jury/login" className="text-[#d8c27a] hover:text-[#f0e0a6]">
            Log in instead
          </Link>
          .
        </p>
      }
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
        Verify Email
      </p>
      <h2 className="mt-4 text-2xl font-semibold">Check jury eligibility</h2>
      <p className="mt-3 text-sm leading-6 text-[#d9d4ca]/85">
        We will confirm that your jury application exists and that payment has been
        completed for this email before opening password setup.
      </p>

      <JuryEmailCheckForm defaultEmail={email} />
    </JuryAuthShell>
  );
}
