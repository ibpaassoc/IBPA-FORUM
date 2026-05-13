"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function RetryCheckoutButton({
  applicationId,
}: {
  applicationId: string;
}) {
  const { language } = useLanguage();
  const copy = {
    en: {
      retryError: "We could not restart Stripe Checkout right now.",
      opening: "Opening Checkout...",
      retry: "Retry Secure Payment",
    },
    ru: {
      retryError: "Сейчас не удалось перезапустить Stripe Checkout.",
      opening: "Открываем Checkout...",
      retry: "Повторить защищенную оплату",
    },
    ua: {
      retryError: "Зараз не вдалося перезапустити Stripe Checkout.",
      opening: "Відкриваємо Checkout...",
      retry: "Повторити захищену оплату",
    },
  }[language];

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
          data.message ?? copy.retryError
        );
        return;
      }

      window.location.assign(data.checkoutUrl);
    } catch {
      setError(copy.retryError);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-[var(--admin-danger-border)] bg-[var(--admin-danger-soft)] px-4 py-4 text-sm text-[var(--admin-danger)]">
          {error}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleRetry}
        disabled={isLoading}
        className="ibpa-button ibpa-button-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? copy.opening : copy.retry}
      </button>
    </div>
  );
}
