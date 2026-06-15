"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { PRICING } from "@/data/pricing";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: "ONE_DAY" | "TWO_DAYS" | "";
  galaDinner: boolean;
  isIbpaMember: boolean;
  ibpaCertNumber: string;
};

const inputBase =
  "w-full rounded-[12px] border border-[var(--border-default)] bg-white px-4 py-3 text-[0.92rem] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] outline-none transition focus:border-[var(--color-blue)] focus:ring-2 focus:ring-[var(--color-blue)]/20 disabled:cursor-not-allowed disabled:opacity-50";

const inputError =
  "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-red-100";

const labelBase =
  "block text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-soft)] mb-1.5";

const errorText = "mt-1 text-[0.77rem] text-red-600";

function priceStrToNum(str: string) {
  return parseInt(str.replace("$", ""), 10);
}

export default function TicketForm({ onSuccess }: { onSuccess?: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      type: "",
      galaDinner: false,
      isIbpaMember: false,
      ibpaCertNumber: "",
    },
  });

  const type = watch("type");
  const galaDinner = watch("galaDinner");
  const isIbpaMember = watch("isIbpaMember");

  const ticketPriceStr =
    type === "ONE_DAY"
      ? isIbpaMember
        ? PRICING.forumTickets.ibpaMembers.oneDay
        : PRICING.forumTickets.standard.oneDay
      : type === "TWO_DAYS"
        ? isIbpaMember
          ? PRICING.forumTickets.ibpaMembers.twoDays
          : PRICING.forumTickets.standard.twoDays
        : null;

  const galaPrice = PRICING.forumTickets.ibpaMembers.galaDinner;
  const ticketNum = ticketPriceStr ? priceStrToNum(ticketPriceStr) : 0;
  const galaNum = galaDinner ? priceStrToNum(galaPrice) : 0;
  const total = ticketNum + galaNum;

  const onSubmit = async (data: FormValues) => {
    if (!data.type) return;
    setSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok) {
        setServerError(json.message ?? "Something went wrong. Please try again.");
        return;
      }

      window.location.href = json.checkoutUrl;
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Personal info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelBase} htmlFor="tf-firstName">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="tf-firstName"
            type="text"
            autoComplete="given-name"
            placeholder="Jane"
            className={clsx(inputBase, errors.firstName && inputError)}
            {...register("firstName", { required: "First name is required." })}
          />
          {errors.firstName && (
            <p className={errorText}>{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className={labelBase} htmlFor="tf-lastName">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            id="tf-lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Smith"
            className={clsx(inputBase, errors.lastName && inputError)}
            {...register("lastName", { required: "Last name is required." })}
          />
          {errors.lastName && (
            <p className={errorText}>{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Contact */}
      <div>
        <label className={labelBase} htmlFor="tf-email">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="tf-email"
          type="email"
          autoComplete="email"
          placeholder="jane@example.com"
          className={clsx(inputBase, errors.email && inputError)}
          {...register("email", {
            required: "Email is required.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address.",
            },
          })}
        />
        {errors.email && <p className={errorText}>{errors.email.message}</p>}
      </div>

      <div>
        <label className={labelBase} htmlFor="tf-phone">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          id="tf-phone"
          type="tel"
          autoComplete="tel"
          placeholder="+1 (555) 000-0000"
          className={clsx(inputBase, errors.phone && inputError)}
          {...register("phone", { required: "Phone number is required." })}
        />
        {errors.phone && <p className={errorText}>{errors.phone.message}</p>}
      </div>

      {/* Ticket type */}
      <div>
        <p className={labelBase}>
          Ticket Type <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "ONE_DAY", label: "1 Day", sub: "Single day access" },
              { value: "TWO_DAYS", label: "2 Days", sub: "Full forum access" },
            ] as const
          ).map(({ value, label, sub }) => (
            <label
              key={value}
              className={clsx(
                "flex cursor-pointer flex-col gap-1 rounded-[12px] border-2 p-4 transition-all",
                type === value
                  ? "border-[var(--color-blue)] bg-[var(--color-blue-wash)]"
                  : "border-[var(--border-default)] bg-white hover:border-[var(--color-blue-soft)]"
              )}
            >
              <input
                type="radio"
                value={value}
                className="sr-only"
                {...register("type", { required: "Please select a ticket type." })}
              />
              <span className="text-[0.95rem] font-semibold text-[var(--color-ink)]">
                {label}
              </span>
              <span className="text-[0.78rem] text-[var(--color-ink-soft)]">{sub}</span>
            </label>
          ))}
        </div>
        {errors.type && <p className={errorText}>{errors.type.message}</p>}
      </div>

      {/* Add-ons */}
      <div className="space-y-3 rounded-[12px] border border-[var(--border-soft)] bg-[var(--surface-tint)] p-4">
        <p className={labelBase + " mb-3"}>Add-ons</p>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-[var(--border-default)] accent-[var(--color-ink)]"
            {...register("galaDinner")}
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-[0.9rem] font-medium text-[var(--color-ink)]">
              Gala Dinner
            </span>
            <span className="text-[0.78rem] text-[var(--color-ink-soft)]">
              Evening gala dinner on Day 1 — {galaPrice} per person
            </span>
          </span>
        </label>
      </div>

      {/* Membership */}
      <div className="space-y-3 rounded-[12px] border border-[var(--border-soft)] bg-[var(--surface-tint)] p-4">
        <p className={labelBase + " mb-3"}>Membership</p>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-[var(--border-default)] accent-[var(--color-ink)]"
            {...register("isIbpaMember")}
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-[0.9rem] font-medium text-[var(--color-ink)]">
              I am an IBPA Member
            </span>
            <span className="text-[0.78rem] text-[var(--color-ink-soft)]">
              IBPA members receive discounted ticket prices
            </span>
          </span>
        </label>

        {isIbpaMember && (
          <div className="pt-1">
            <label className={labelBase} htmlFor="tf-certNumber">
              IBPA CERT Number <span className="text-red-500">*</span>
            </label>
            <input
              id="tf-certNumber"
              type="text"
              placeholder="e.g. IBPA-2024-00123"
              className={clsx(inputBase, errors.ibpaCertNumber && inputError)}
              {...register("ibpaCertNumber", {
                validate: (value) => {
                  if (isIbpaMember && (!value || !value.trim())) {
                    return "CERT number is required for IBPA members.";
                  }
                  return true;
                },
              })}
            />
            {errors.ibpaCertNumber && (
              <p className={errorText}>{errors.ibpaCertNumber.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Price summary */}
      {type && (
        <div className="rounded-[12px] border border-[var(--border-default)] bg-white px-5 py-4">
          <p className={labelBase + " mb-3"}>Order Summary</p>
          <div className="space-y-2">
            {ticketPriceStr && (
              <div className="flex justify-between text-[0.88rem]">
                <span className="text-[var(--color-ink-soft)]">
                  {type === "ONE_DAY" ? "1-Day Forum Pass" : "2-Day Forum Pass"}
                  {isIbpaMember && (
                    <span className="ml-2 rounded-full bg-[var(--color-blue-wash)] px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-[var(--color-blue)]">
                      Member
                    </span>
                  )}
                </span>
                <span className="font-semibold text-[var(--color-ink)]">{ticketPriceStr}</span>
              </div>
            )}
            {galaDinner && (
              <div className="flex justify-between text-[0.88rem]">
                <span className="text-[var(--color-ink-soft)]">Gala Dinner Add-on</span>
                <span className="font-semibold text-[var(--color-ink)]">{galaPrice}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[var(--border-soft)] pt-2 text-[0.92rem] font-bold text-[var(--color-ink)]">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {serverError && (
        <p className="rounded-[10px] bg-red-50 border border-red-200 px-4 py-3 text-[0.85rem] text-red-700">
          {serverError}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="ibpa-button ibpa-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Creating your checkout…" : "Continue to Payment →"}
      </button>
    </form>
  );
}
