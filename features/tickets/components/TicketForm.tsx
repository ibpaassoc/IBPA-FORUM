"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import clsx from "clsx";
import {
  CalendarDays,
  Check,
  Gift,
  Info,
  LockKeyhole,
  ReceiptText,
  Sparkles,
  Star,
  Tag,
  UserRound,
  UsersRound,
} from "lucide-react";
import { PRICING } from "@/data/pricing";
import { applyDiscountToCents, applyDiscountToPrice } from "@/features/tickets/types";
import { useTicketDiscount } from "@/features/tickets/useEarlyBird";
import { useSpecialPacket } from "@/features/tickets/useSpecialPacket";
import { validateInstagramInput } from "@/features/tickets/lib/instagram";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type TicketSelection = "ONE_DAY" | "TWO_DAYS" | "SPECIAL_PACKET" | "";

type AttendeeValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  instagram: string;
};

type FormValues = AttendeeValues & {
  type: TicketSelection;
  galaDinner: boolean;
  isIbpaMember: boolean;
  ibpaCertNumber: string;
  secondAttendee: AttendeeValues;
};

type CertStatus = "idle" | "checking" | "valid" | "invalid" | "error";

type PromoPreview = {
  keyword: string;
  discountPercent: number;
  originalAmountCents: number;
  discountAmountCents: number;
  discountedAmountCents: number;
  galaDinnerAmountCents: number;
  finalAmountCents: number;
};

type TicketPromoValidationResult =
  | { ok: true; promo: PromoPreview }
  | { ok: false; errorCode?: string };

const PROMO_REVALIDATION_INTERVAL_MS = 5_000;
const attendeeDefaults: AttendeeValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  instagram: "",
};

const inputBase =
  "w-full rounded-[13px] border border-[#cfe0eb] bg-white/80 px-3.5 py-2.5 text-[0.82rem] text-[#10182a] placeholder:text-[#10182a]/35 outline-none transition focus:border-[#72a0c1] focus:ring-2 focus:ring-[#72a0c1]/15 disabled:cursor-not-allowed disabled:opacity-50";
const inputError = "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-red-100";
const labelBase = "mb-1.5 block text-[0.66rem] font-semibold uppercase tracking-[0.13em] text-[#10182a]/55";
const errorText = "mt-1 text-[0.7rem] text-red-600";

function priceToNumber(value: string) {
  return Number.parseFloat(value.replace(/[^0-9.]/g, ""));
}

function moneyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

async function requestTicketPromoPreview({
  promoCode,
  ticketType,
  isIbpaMember,
  galaDinner,
}: {
  promoCode: string;
  ticketType: "ONE_DAY" | "TWO_DAYS";
  isIbpaMember: boolean;
  galaDinner: boolean;
}): Promise<TicketPromoValidationResult> {
  try {
    const response = await fetch("/api/promo-codes/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        promoCode,
        paymentFlow: "TICKETS",
        ticketType,
        isIbpaMember,
        galaDinner,
      }),
    });
    const payload = (await response.json()) as {
      ok?: boolean;
      errorCode?: string;
      promo?: PromoPreview;
    };
    return response.ok && payload.ok && payload.promo
      ? { ok: true, promo: payload.promo }
      : { ok: false, errorCode: payload.errorCode };
  } catch {
    return { ok: false };
  }
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-[#10182a]">
      <span className="text-[#72a0c1]">{icon}</span>
      <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.17em]">{children}</h3>
    </div>
  );
}

export default function TicketForm() {
  const { t } = useLanguage();
  const promoText = t.promo;
  const { ticketDiscount, discount } = useTicketDiscount();
  const specialPacket = useSpecialPacket();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [certStatus, setCertStatus] = useState<CertStatus>("idle");
  const [promoInput, setPromoInput] = useState("");
  const [promoPreview, setPromoPreview] = useState<PromoPreview | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoPending, setPromoPending] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      ...attendeeDefaults,
      type: "",
      galaDinner: false,
      isIbpaMember: false,
      ibpaCertNumber: "",
      secondAttendee: attendeeDefaults,
    },
  });

  const [type, galaDinner, isIbpaMember, ibpaCertNumber] = useWatch({
    control,
    name: ["type", "galaDinner", "isIbpaMember", "ibpaCertNumber"],
  });
  const isSpecialPacket = type === "SPECIAL_PACKET";

  useEffect(() => {
    if (!isIbpaMember) return;
    const cert = ibpaCertNumber.trim();
    if (!cert) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setCertStatus("checking");
      try {
        const response = await fetch(`/api/tickets/verify-cert?certNumber=${encodeURIComponent(cert)}`);
        const payload = (await response.json()) as { valid: boolean };
        setCertStatus(response.status === 503 ? "error" : payload.valid ? "valid" : "invalid");
      } catch {
        setCertStatus("error");
      }
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [ibpaCertNumber, isIbpaMember]);
  const visibleCertStatus = !isIbpaMember || !ibpaCertNumber.trim() ? "idle" : certStatus;

  const rawTicketPrice =
    type === "ONE_DAY"
      ? isIbpaMember
        ? PRICING.forumTickets.ibpaMembers.oneDay
        : PRICING.forumTickets.standard.oneDay
      : type === "TWO_DAYS"
        ? isIbpaMember
          ? PRICING.forumTickets.ibpaMembers.twoDays
          : PRICING.forumTickets.standard.twoDays
        : isSpecialPacket
          ? isIbpaMember
            ? specialPacket.memberPrice
            : specialPacket.standardPrice
          : null;
  const galaPrice = PRICING.forumTickets.standard.galaDinner;
  const rawTicketCents = rawTicketPrice ? Math.round(priceToNumber(rawTicketPrice) * 100) : 0;
  const rawGalaCents = !isSpecialPacket && galaDinner ? Math.round(priceToNumber(galaPrice) * 100) : 0;
  const automaticDiscountStacks = ticketDiscount.kind === "permanent30";
  const automaticTicketCents = !isSpecialPacket && discount && automaticDiscountStacks
    ? applyDiscountToCents(rawTicketCents, discount)
    : rawTicketCents;
  const activePromoPreview = !isSpecialPacket && promoPreview &&
    promoPreview.originalAmountCents === automaticTicketCents &&
    promoPreview.galaDinnerAmountCents === rawGalaCents
      ? promoPreview
      : null;
  const discountedTicketPrice = !isSpecialPacket && rawTicketPrice && !activePromoPreview
    ? applyDiscountToPrice(rawTicketPrice, discount)
    : null;
  const totalCents = isSpecialPacket
    ? rawTicketCents
    : activePromoPreview
      ? activePromoPreview.finalAmountCents
      : Math.round(((discountedTicketPrice ? priceToNumber(discountedTicketPrice) : rawTicketCents / 100) + rawGalaCents / 100) * 100);
  const discountName = ticketDiscount.kind === "permanent30" ? "Permanent 30" : "Early Bird";

  const promoMessage = useCallback((errorCode?: string) => {
    if (errorCode === "DISABLED") return promoText.promoCodeDisabled;
    if (errorCode === "WRONG_FLOW") return promoText.wrongFlow;
    return promoText.invalidPromoCode;
  }, [promoText]);

  async function applyPromoCode() {
    if (type !== "ONE_DAY" && type !== "TWO_DAYS") return;
    const code = promoInput.trim();
    if (!code || promoPending) return;
    setPromoPending(true);
    setPromoError("");
    setPromoPreview(null);
    const result = await requestTicketPromoPreview({
      promoCode: code,
      ticketType: type,
      isIbpaMember,
      galaDinner,
    });
    if (result.ok) setPromoPreview(result.promo);
    else setPromoError(promoMessage(result.errorCode));
    setPromoPending(false);
  }

  useEffect(() => {
    if (!promoPreview || (type !== "ONE_DAY" && type !== "TWO_DAYS")) return;
    let active = true;
    const revalidate = async () => {
      const result = await requestTicketPromoPreview({
        promoCode: promoInput.trim(),
        ticketType: type,
        isIbpaMember,
        galaDinner,
      });
      if (!active) return;
      if (result.ok) {
        setPromoPreview(result.promo);
        setPromoError("");
      } else {
        setPromoPreview(null);
        setPromoError(promoMessage(result.errorCode));
      }
    };
    const interval = window.setInterval(() => void revalidate(), PROMO_REVALIDATION_INTERVAL_MS);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [galaDinner, isIbpaMember, promoInput, promoMessage, promoPreview, type]);

  const onSubmit = async (data: FormValues) => {
    if (!data.type) return;
    if (data.type === "SPECIAL_PACKET" && !specialPacket.enabled) {
      setServerError("The Special Packet is coming soon.");
      return;
    }
    if (isIbpaMember && certStatus === "invalid") {
      setServerError("Your IBPA certificate number could not be verified.");
      return;
    }
    if (isIbpaMember && certStatus === "checking") {
      setServerError("Please wait while we verify your certificate number.");
      return;
    }
    if (!isSpecialPacket && promoInput.trim() && !activePromoPreview) {
      setPromoError(promoText.invalidPromoCode);
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      const payload = {
        ...data,
        galaDinner: data.type === "SPECIAL_PACKET" ? true : data.galaDinner,
        promoCode: data.type === "SPECIAL_PACKET" ? "" : activePromoPreview ? promoInput : "",
      };
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await response.json()) as { checkoutUrl?: string; errorCode?: string; message?: string };
      if (!response.ok) {
        if (json.errorCode?.startsWith("PROMO_")) {
          setPromoPreview(null);
          setPromoError(promoMessage(json.errorCode.slice(6)));
        } else {
          setServerError(json.message ?? "Something went wrong. Please try again.");
        }
        return;
      }
      if (json.checkoutUrl) window.location.assign(json.checkoutUrl);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const packages = [
    {
      value: "ONE_DAY" as const,
      title: "1 Day",
      subtitle: "Single day access",
      price: isIbpaMember ? PRICING.forumTickets.ibpaMembers.oneDay : PRICING.forumTickets.standard.oneDay,
      icon: CalendarDays,
    },
    {
      value: "TWO_DAYS" as const,
      title: "2 Days",
      subtitle: "Full forum access",
      price: isIbpaMember ? PRICING.forumTickets.ibpaMembers.twoDays : PRICING.forumTickets.standard.twoDays,
      icon: CalendarDays,
    },
    {
      value: "SPECIAL_PACKET" as const,
      title: "Special Packet",
      subtitle: "2 days + Gala Dinner",
      price: isIbpaMember ? specialPacket.memberPrice : specialPacket.standardPrice,
      icon: Star,
      disabled: !specialPacket.enabled,
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 font-[var(--font-ui-family)]">
      {discount ? (
        <div className="flex items-center gap-3 rounded-[16px] border border-[#b9d9eb] bg-[#edf7fc]/80 px-4 py-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-[#2773c8]">
            <Tag size={17} />
          </span>
          <p className="text-[0.76rem] leading-5 text-[#10182a]/70">
            <strong className="text-[#10182a]">{discountName} Pricing</strong> — {discount.type === "percent" ? `${discount.value}%` : `$${discount.value / 100}`} off forum passes. Gala Dinner and Special Packet excluded.
          </p>
        </div>
      ) : null}

      <section>
        <SectionTitle icon={<Sparkles size={15} />}>Choose your package</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          {packages.map((option) => {
            const selected = type === option.value;
            const OptionIcon = option.icon;
            const typeRegistration = register("type", { required: "Please select a ticket package." });
            return (
              <label
                key={option.value}
                className={clsx(
                  "relative flex min-h-[172px] flex-col rounded-[18px] border p-4 transition",
                  option.disabled
                    ? "cursor-not-allowed border-[#d7dee4] bg-[#f1f3f5] text-[#10182a]/35 grayscale"
                    : selected
                      ? "cursor-pointer border-[#2773c8] bg-[#f3f8ff] shadow-[0_12px_28px_rgba(39,115,200,0.13)]"
                      : "cursor-pointer border-[#cfe0eb] bg-white/74 hover:border-[#72a0c1] hover:bg-white"
                )}
              >
                {option.value === "SPECIAL_PACKET" ? (
                  <span className={clsx(
                    "absolute right-3 top-3 rounded-full px-2 py-1 text-[0.54rem] font-bold uppercase tracking-[0.1em]",
                    option.disabled ? "bg-[#d9dde1] text-[#10182a]/50" : "bg-[#dceeff] text-[#1766bd]"
                  )}>
                    {option.disabled ? "Coming Soon" : "Best Value"}
                  </span>
                ) : null}
                <input
                  type="radio"
                  value={option.value}
                  disabled={option.disabled}
                  className="sr-only"
                  {...typeRegistration}
                  onChange={(event) => {
                    void typeRegistration.onChange(event);
                    if (option.value === "SPECIAL_PACKET") {
                      setValue("galaDinner", true);
                      setPromoInput("");
                      setPromoPreview(null);
                      setPromoError("");
                    }
                  }}
                />
                <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-[#eaf4fb] text-[#2773c8]">
                  <OptionIcon size={20} />
                </span>
                <span className="font-[var(--font-title-family)] text-[1.35rem] font-light leading-none text-[#10182a]">{option.title}</span>
                <span className="mt-1 text-[0.72rem] text-[#10182a]/55">{option.subtitle}</span>
                {option.value === "SPECIAL_PACKET" ? (
                  <span className="mt-1 text-[0.68rem] text-[#2773c8]">2 separate tickets · 2 people</span>
                ) : null}
                <span className="mt-auto pt-4 font-[var(--font-title-family)] text-[1.35rem] font-light text-[#10182a]">{option.price}</span>
                <span className={clsx(
                  "absolute bottom-4 right-4 size-4 rounded-full border",
                  selected ? "border-[#2773c8] bg-[#2773c8] shadow-[inset_0_0_0_3px_white]" : "border-[#8ca2b2]"
                )} />
              </label>
            );
          })}
        </div>
        {errors.type ? <p className={errorText}>{errors.type.message}</p> : null}
      </section>

      <section className="flex items-center justify-between gap-4 rounded-[17px] border border-[#d7e7f1] bg-white/58 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eaf4fb] text-[#2773c8]">
            <Gift size={18} />
          </span>
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#10182a]">Add-on: Gala Dinner</p>
            <p className="mt-0.5 text-[0.68rem] text-[#10182a]/50">Evening Gala Dinner on Day 1 · {galaPrice} per person</p>
          </div>
        </div>
        {isSpecialPacket ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[12px] border border-[#9bc8ee] bg-[#f1f8ff] px-3 py-2 text-[0.66rem] font-semibold text-[#2773c8]">
            <LockKeyhole size={13} /> Included
          </span>
        ) : (
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-[0.72rem] font-semibold text-[#10182a]">
            <input type="checkbox" className="peer sr-only" {...register("galaDinner")} />
            <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-[7px] border border-[#a9c7db] bg-white text-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition peer-checked:border-[#2773c8] peer-checked:bg-[#2773c8] peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-[#72a0c1]/20">
              <Check size={13} strokeWidth={2.6} />
            </span>
            Add
          </label>
        )}
      </section>

      <div className={clsx("grid gap-4", isSpecialPacket && "xl:grid-cols-2")}>
        <AttendeePanel
          number={isSpecialPacket ? 1 : undefined}
          register={register}
          errors={errors}
        />
        {isSpecialPacket ? (
          <SecondAttendeePanel register={register} errors={errors.secondAttendee} />
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[18px] border border-[#d7e7f1] bg-white/58 p-4">
          <SectionTitle icon={<UsersRound size={15} />}>Membership</SectionTitle>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" className="peer sr-only" {...register("isIbpaMember")} />
            <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[7px] border border-[#a9c7db] bg-white text-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition peer-checked:border-[#2773c8] peer-checked:bg-[#2773c8] peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-[#72a0c1]/20">
              <Check size={13} strokeWidth={2.6} />
            </span>
            <span>
              <span className="block text-[0.8rem] font-semibold text-[#10182a]">I am an IBPA Member</span>
              <span className="mt-0.5 block text-[0.7rem] text-[#10182a]/50">Member pricing applies to the complete order.</span>
            </span>
          </label>
          {isIbpaMember ? (
            <div className="mt-3">
              <label className={labelBase} htmlFor="tf-cert">IBPA CERT Number *</label>
              <input
                id="tf-cert"
                className={clsx(inputBase, errors.ibpaCertNumber && inputError)}
                placeholder="CERT-20240124-A00A"
                {...register("ibpaCertNumber", {
                  validate: (value) => !isIbpaMember || value.trim().length > 0 || "CERT number is required.",
                })}
              />
              {visibleCertStatus !== "idle" ? (
                <p className={clsx("mt-1 text-[0.7rem]", visibleCertStatus === "valid" ? "text-emerald-700" : visibleCertStatus === "invalid" ? "text-red-600" : "text-[#2773c8]")}>
                  {visibleCertStatus === "checking" ? "Verifying…" : visibleCertStatus === "valid" ? "Valid IBPA member certificate" : visibleCertStatus === "invalid" ? "Certificate not found or expired" : "Could not verify right now"}
                </p>
              ) : errors.ibpaCertNumber ? <p className={errorText}>{errors.ibpaCertNumber.message}</p> : null}
            </div>
          ) : null}
        </section>

        <section className="rounded-[18px] border border-[#d7e7f1] bg-white/58 p-4">
          <SectionTitle icon={<Tag size={15} />}>Promo Code</SectionTitle>
          <div className="flex gap-2">
            <input
              value={promoInput}
              disabled={isSpecialPacket}
              onChange={(event) => {
                setPromoInput(event.target.value);
                setPromoPreview(null);
                setPromoError("");
              }}
              className={inputBase}
              placeholder={isSpecialPacket ? "Not available for this package" : "Enter code"}
              autoCapitalize="characters"
            />
            <button
              type="button"
              disabled={isSpecialPacket || promoPending || !promoInput.trim() || !type}
              onClick={() => void applyPromoCode()}
              className="rounded-[13px] border border-[#8fc0eb] bg-[#f2f8ff] px-4 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#1766bd] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {promoPending ? promoText.applying : promoText.apply}
            </button>
          </div>
          <p className={clsx("mt-2 text-[0.7rem]", activePromoPreview ? "text-emerald-700" : promoError ? "text-red-600" : "text-[#10182a]/48")}>
            {isSpecialPacket
              ? "Special Packet pricing is fixed and excludes all sales and coupons."
              : activePromoPreview
                ? promoText.promoCodeApplied
                : promoError || "Promo codes apply to eligible forum passes only."}
          </p>
        </section>
      </div>

      {type ? (
        <section className="rounded-[18px] border border-[#cbdfea] bg-white/72 p-4">
          <SectionTitle icon={<ReceiptText size={15} />}>Order Summary</SectionTitle>
          <div className="space-y-2 text-[0.78rem]">
            <div className="flex items-start justify-between gap-4">
              <span className="text-[#10182a]/62">
                {isSpecialPacket ? "Special Packet (2 separate tickets)" : type === "ONE_DAY" ? "1-Day Forum Pass" : "2-Day Forum Pass"}
                {isIbpaMember ? <span className="ml-2 text-[#2773c8]">Member</span> : null}
              </span>
              <span className="text-right font-semibold text-[#10182a]">
                {discountedTicketPrice ? <><span className="mr-2 text-[#10182a]/35 line-through">{rawTicketPrice}</span>{discountedTicketPrice}</> : rawTicketPrice}
              </span>
            </div>
            {activePromoPreview ? (
              <div className="flex justify-between text-emerald-700"><span>Promo discount</span><span>-{moneyFromCents(activePromoPreview.discountAmountCents)}</span></div>
            ) : null}
            {!isSpecialPacket && galaDinner ? (
              <div className="flex justify-between text-[#10182a]/62"><span>Gala Dinner add-on</span><span>{galaPrice}</span></div>
            ) : null}
            {isSpecialPacket ? (
              <div className="flex items-start gap-2 rounded-[12px] bg-[#eef7ff] px-3 py-2 text-[0.68rem] leading-5 text-[#1766bd]">
                <Check size={14} className="mt-0.5 shrink-0" /> Includes 2-day Forum access and Gala Dinner for both attendees. Fixed price; no discounts apply.
              </div>
            ) : null}
            <div className="flex justify-between border-t border-[#dbe7ee] pt-2 font-[var(--font-title-family)] text-[1.18rem] text-[#10182a]">
              <span>Total</span><span>{moneyFromCents(totalCents)}</span>
            </div>
          </div>
        </section>
      ) : null}

      {serverError ? (
        <p role="alert" className="rounded-[13px] border border-red-200 bg-red-50 px-4 py-3 text-[0.78rem] text-red-700">{serverError}</p>
      ) : null}

      <button
        type="submit"
        disabled={submitting || visibleCertStatus === "checking" || !type}
        className="flex min-h-13 w-full items-center justify-center gap-3 rounded-full bg-[linear-gradient(180deg,#4696e9,#1269c8)] px-6 text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-white shadow-[0_14px_34px_rgba(18,105,200,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Creating your checkout…" : visibleCertStatus === "checking" ? "Verifying certificate…" : "Continue to Payment"}
        <span aria-hidden>→</span>
      </button>
      <p className="flex items-center justify-center gap-1.5 text-[0.66rem] text-[#10182a]/42"><LockKeyhole size={11} /> Secure checkout powered by Stripe</p>
    </form>
  );
}

type Register = ReturnType<typeof useForm<FormValues>>["register"];

function AttendeePanel({
  number,
  register,
  errors,
}: {
  number?: number;
  register: Register;
  errors: ReturnType<typeof useForm<FormValues>>["formState"]["errors"];
}) {
  return (
    <section className="rounded-[18px] border border-[#d7e7f1] bg-white/58 p-4">
      <SectionTitle icon={<UserRound size={15} />}>Attendee {number ?? "Information"}</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="First Name" error={errors.firstName?.message}><input className={clsx(inputBase, errors.firstName && inputError)} autoComplete="given-name" {...register("firstName", { required: "First name is required." })} /></Field>
        <Field label="Last Name" error={errors.lastName?.message}><input className={clsx(inputBase, errors.lastName && inputError)} autoComplete="family-name" {...register("lastName", { required: "Last name is required." })} /></Field>
        <Field label="Email" error={errors.email?.message}><input type="email" className={clsx(inputBase, errors.email && inputError)} autoComplete="email" {...register("email", { required: "Email is required.", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email." } })} /></Field>
        <Field label="Phone Number" error={errors.phone?.message}><input type="tel" className={clsx(inputBase, errors.phone && inputError)} autoComplete="tel" {...register("phone", { required: "Phone number is required." })} /></Field>
        <div className="sm:col-span-2"><Field label="Instagram" error={errors.instagram?.message}><input className={clsx(inputBase, errors.instagram && inputError)} placeholder="@username or instagram.com/username" {...register("instagram", { required: "Instagram is required.", validate: (value) => validateInstagramInput(value) ?? true })} /></Field></div>
      </div>
    </section>
  );
}

function SecondAttendeePanel({ register, errors }: { register: Register; errors: ReturnType<typeof useForm<FormValues>>["formState"]["errors"]["secondAttendee"] }) {
  return (
    <section className="rounded-[18px] border border-[#9bc8ee] bg-[#f5faff]/82 p-4">
      <SectionTitle icon={<UserRound size={15} />}>Attendee 2</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="First Name" error={errors?.firstName?.message}><input className={clsx(inputBase, errors?.firstName && inputError)} autoComplete="off" {...register("secondAttendee.firstName", { required: "First name is required." })} /></Field>
        <Field label="Last Name" error={errors?.lastName?.message}><input className={clsx(inputBase, errors?.lastName && inputError)} autoComplete="off" {...register("secondAttendee.lastName", { required: "Last name is required." })} /></Field>
        <Field label="Email" error={errors?.email?.message}><input type="email" className={clsx(inputBase, errors?.email && inputError)} autoComplete="off" {...register("secondAttendee.email", { required: "Email is required.", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email." } })} /></Field>
        <Field label="Phone Number" error={errors?.phone?.message}><input type="tel" className={clsx(inputBase, errors?.phone && inputError)} autoComplete="off" {...register("secondAttendee.phone", { required: "Phone number is required." })} /></Field>
        <div className="sm:col-span-2"><Field label="Instagram" error={errors?.instagram?.message}><input className={clsx(inputBase, errors?.instagram && inputError)} placeholder="@username or instagram.com/username" autoComplete="off" {...register("secondAttendee.instagram", { required: "Instagram is required.", validate: (value) => validateInstagramInput(value) ?? true })} /></Field></div>
      </div>
      <p className="mt-3 flex items-start gap-1.5 text-[0.67rem] leading-5 text-[#1766bd]"><Info size={13} className="mt-0.5 shrink-0" /> Each attendee receives a separate ticket email and QR code. Both email addresses may be the same.</p>
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label><span className={labelBase}>{label} *</span>{children}{error ? <span className={errorText}>{error}</span> : null}</label>;
}
