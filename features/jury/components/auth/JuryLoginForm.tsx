"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function JuryLoginForm({
  defaultEmail,
  notice,
}: {
  defaultEmail?: string;
  notice?: string;
}) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/jury/dashboard",
    });

    if (!result || result.error) {
      setError("Invalid email or password. Please try again.");
      setIsSubmitting(false);
      return;
    }

    window.location.href = result.url ?? "/jury/dashboard";
  }

  return (
    <form action={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#f1ecde]">
          Jury account email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={defaultEmail ?? ""}
          className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#d9d4ca]/45 focus:border-[#d8c27a] focus:bg-white/[0.07]"
          placeholder="Enter your jury email"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#f1ecde]">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#d9d4ca]/45 focus:border-[#d8c27a] focus:bg-white/[0.07]"
          placeholder="Enter your password"
        />
      </div>

      {notice ? (
        <p className="rounded-2xl border border-[#d8c27a]/35 bg-[#d8c27a]/10 px-4 py-3 text-sm text-white">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-[#a64b4b]/45 bg-[#4d1d1d]/35 px-4 py-3 text-sm text-[#f8efef]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-full bg-[#d8c27a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e2d093] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Opening Dashboard..." : "Log In"}
      </button>

      <p className="text-sm leading-6 text-[#d9d4ca]/85">
        Need to create your jury account?{" "}
        <Link href="/jury/register" className="text-[#d8c27a] hover:text-[#f0e0a6]">
          Register here
        </Link>
        .
      </p>
    </form>
  );
}
