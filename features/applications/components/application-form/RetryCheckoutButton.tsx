"use client";

import { useState } from "react";

export default function RetryCheckoutButton({
  applicationId,
}: {
  applicationId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRetry() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ applicationId }),
      });

      const data = (await response.json()) as {
        checkoutUrl?: string;
        message?: string;
      };

      if (!response.ok || !data.checkoutUrl) {
        setError(
          data.message ?? "We could not restart Stripe Checkout right now."
        );
        return;
      }

      window.location.assign(data.checkoutUrl);
    } catch {
      setError("We could not restart Stripe Checkout right now.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-[#8a3f3f]/55 bg-[#35191a]/70 px-4 py-4 text-sm text-white">
          {error}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleRetry}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-full bg-[#d8c27a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e5d28f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Opening Checkout..." : "Retry Secure Payment"}
      </button>
    </div>
  );
}
