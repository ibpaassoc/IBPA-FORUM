"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
import { formatStripeAmount } from "@/features/pricing/types";
import { useStripePricing } from "@/features/pricing/useStripePricing";
import { ticketTranslations, type TicketTranslation } from "@/features/tickets/copy";
import {
  columnVariants,
  controlSpring,
  EASE_IN,
  EASE_OUT,
  formVariants,
  riseVariants,
  selectionSpring,
  swapVariants,
} from "@/features/tickets/motion";
import { applyDiscountToCents } from "@/features/tickets/types";
import { useTicketDiscount } from "@/features/tickets/useEarlyBird";
import { useSpecialPacket } from "@/features/tickets/useSpecialPacket";
import { validateInstagramInput } from "@/features/tickets/lib/instagram";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LandingPrimaryButton, LandingSecondaryButton } from "@/shared/components/public";

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
  "w-full rounded-[16px] border border-[var(--border-default)] bg-white/72 px-3.5 py-2.5 text-[0.82rem] text-[var(--color-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] placeholder:text-[var(--color-ink)]/35 outline-none transition focus:border-[var(--color-blue)]/55 focus:bg-white/90 focus:ring-4 focus:ring-[var(--color-blue)]/10 disabled:cursor-not-allowed disabled:opacity-50";
const inputError = "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-red-100";
const labelBase = "mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.13em] text-[#10182a]/55";
const errorText = "mt-1 text-[0.7rem] text-red-600";

function moneyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
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
    <div className="mb-2 flex items-center gap-2 text-[#10182a]">
      <span className="text-[#72a0c1]">{icon}</span>
      <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.17em]">{children}</h3>
    </div>
  );
}

/**
 * Vertical reveal driven by the `.ticket-reveal` grid-track transition (see
 * globals.css). Content stays mounted, so it never has to be re-measured and
 * never squashes on the way out; `inert` keeps the collapsed copy out of the
 * tab order and the accessibility tree.
 */
function Reveal({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div className="ticket-reveal" data-open={open}>
      <div inert={!open}>{children}</div>
    </div>
  );
}

/**
 * Holds on to the last value the caller had. A row whose data vanishes at the
 * instant it starts collapsing — a promo discount, a server error — would
 * otherwise blank out and then shrink, which reads as a glitch rather than a
 * transition.
 */
function useRetained<T extends string | number>(value: T | null | undefined): T | null {
  // Adjusting state during render (React's documented pattern for deriving
  // from a changed value). Safe to compare with !== because T is primitive,
  // so this settles after one extra render.
  const [retained, setRetained] = useState<T | null>(value ?? null);

  if (value !== null && value !== undefined && value !== retained) {
    setRetained(value);
  }

  return value ?? retained;
}

/**
 * Crossfades a value that changes in place — a price, a status line, a button
 * label. `popLayout` pulls the outgoing copy out of flow so the two never
 * stack and shove the surrounding layout.
 */
function SwapValue({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <span className={clsx("relative inline-block", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="block"
          variants={swapVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children ?? value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function TicketForm() {
  const { language, t } = useLanguage();
  const copy = ticketTranslations[language].form;
  const promoText = t.promo;
  const reducedMotion = useReducedMotion();
  const { ticketDiscount, discount } = useTicketDiscount();
  const specialPacket = useSpecialPacket();
  const { pricing, loading: pricingLoading } = useStripePricing();
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

  const selectedStripePrice =
    type === "ONE_DAY"
      ? isIbpaMember
        ? pricing?.forumTickets.ibpaMembers.oneDay
        : pricing?.forumTickets.standard.oneDay
      : type === "TWO_DAYS"
        ? isIbpaMember
          ? pricing?.forumTickets.ibpaMembers.twoDays
          : pricing?.forumTickets.standard.twoDays
        : isSpecialPacket
          ? isIbpaMember
            ? pricing?.forumTickets.specialPacket.ibpaMembers
            : pricing?.forumTickets.specialPacket.standard
          : null;
  const galaStripePrice = pricing?.forumTickets.galaDinner ?? null;
  const rawTicketPrice = formatStripeAmount(selectedStripePrice ?? null);
  const galaPrice = formatStripeAmount(galaStripePrice);
  const rawTicketCents = selectedStripePrice?.amountCents ?? 0;
  const rawGalaCents = !isSpecialPacket && galaDinner ? galaStripePrice?.amountCents ?? 0 : 0;
  const automaticDiscountStacks = ticketDiscount.kind === "permanent30";
  const automaticTicketCents = !isSpecialPacket && discount && automaticDiscountStacks
    ? applyDiscountToCents(rawTicketCents, discount)
    : rawTicketCents;
  const activePromoPreview = !isSpecialPacket && promoPreview &&
    promoPreview.originalAmountCents === automaticTicketCents &&
    promoPreview.galaDinnerAmountCents === rawGalaCents
      ? promoPreview
      : null;
  const discountedTicketCents = !isSpecialPacket && discount && !activePromoPreview
    ? applyDiscountToCents(rawTicketCents, discount)
    : null;
  const discountedTicketPrice = discountedTicketCents === null
    ? null
    : formatStripeAmount({ amountCents: discountedTicketCents, currency: selectedStripePrice?.currency ?? "usd" });
  const totalCents = isSpecialPacket
    ? rawTicketCents
    : activePromoPreview
      ? activePromoPreview.finalAmountCents
      : (discountedTicketCents ?? rawTicketCents) + rawGalaCents;
  const totalPrice = formatStripeAmount({ amountCents: totalCents, currency: selectedStripePrice?.currency ?? galaStripePrice?.currency ?? "usd" });
  const discountName = ticketDiscount.kind === "permanent30" ? copy.discount.permanent : copy.discount.earlyBird;
  // Both survive their own row collapsing (see useRetained).
  const retainedPromoDiscountCents = useRetained(activePromoPreview?.discountAmountCents);
  const retainedServerError = useRetained(serverError);
  const promoHint = isSpecialPacket
    ? copy.promo.fixed
    : activePromoPreview
      ? promoText.promoCodeApplied
      : promoError || copy.promo.eligible;

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
    if (!selectedStripePrice) {
      setServerError(copy.errors.generic);
      return;
    }
    if (data.type === "SPECIAL_PACKET" && !specialPacket.enabled) {
      setServerError(copy.errors.specialComingSoon);
      return;
    }
    if (isIbpaMember && certStatus === "invalid") {
      setServerError(copy.errors.certInvalid);
      return;
    }
    if (isIbpaMember && certStatus === "checking") {
      setServerError(copy.errors.certChecking);
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
          setServerError(copy.errors.generic);
        }
        return;
      }
      if (json.checkoutUrl) window.location.assign(json.checkoutUrl);
    } catch {
      setServerError(copy.errors.network);
    } finally {
      setSubmitting(false);
    }
  };

  const packages = [
    {
      value: "ONE_DAY" as const,
      title: copy.package.oneDay,
      subtitle: copy.package.oneDaySubtitle,
      price: isIbpaMember ? pricing?.forumTickets.ibpaMembers.oneDay : pricing?.forumTickets.standard.oneDay,
      icon: CalendarDays,
    },
    {
      value: "TWO_DAYS" as const,
      title: copy.package.twoDays,
      subtitle: copy.package.twoDaysSubtitle,
      price: isIbpaMember ? pricing?.forumTickets.ibpaMembers.twoDays : pricing?.forumTickets.standard.twoDays,
      icon: CalendarDays,
    },
    {
      value: "SPECIAL_PACKET" as const,
      title: copy.package.special,
      subtitle: copy.package.specialSubtitle,
      price: isIbpaMember ? pricing?.forumTickets.specialPacket.ibpaMembers : pricing?.forumTickets.specialPacket.standard,
      icon: Star,
      disabled: !specialPacket.enabled,
    },
  ];

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-3 font-[var(--font-ui-family)]"
      initial="hidden"
      animate="visible"
      variants={formVariants}
    >
      {discount ? (
        <motion.div variants={riseVariants} className="flex items-center gap-3 rounded-[18px] border border-[var(--color-blue)]/35 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(185,217,235,0.3))] px-4 py-2 shadow-[0_14px_34px_rgba(114,160,193,0.1)]">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-[#2773c8]">
            <Tag size={15} />
          </span>
          <p className="text-[0.72rem] leading-[1.15rem] text-[#10182a]/70">
            <strong className="text-[#10182a]">{discountName} {copy.discount.pricing}</strong> — {discount.type === "percent" ? `${discount.value}%` : `$${discount.value / 100}`} {copy.discount.suffix}
          </p>
        </motion.div>
      ) : null}

      {/* Two columns on large screens so the whole form fits without scrolling the modal:
          what you are buying on the left, who is coming and what it costs on the right. */}
      <motion.div variants={columnVariants} className="grid gap-3 lg:grid-cols-12 lg:items-start">
      <motion.div variants={columnVariants} className="space-y-3 lg:col-span-7">

      <motion.section variants={riseVariants}>
        <SectionTitle icon={<Sparkles size={15} />}>{copy.package.title}</SectionTitle>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {packages.map((option) => {
            const selected = type === option.value;
            const unavailable = !option.price;
            const disabled = option.disabled || unavailable;
            const OptionIcon = option.icon;
            const typeRegistration = register("type", { required: copy.package.required });
            const priceLabel = pricingLoading ? "…" : formatStripeAmount(option.price ?? null);
            return (
              <motion.label
                key={option.value}
                // `isolate` gives the selection highlight below a stacking
                // context of its own to sit in, behind the card's content but
                // in front of the card's own background.
                className={clsx(
                  "relative isolate flex min-h-[132px] flex-col rounded-[18px] border p-3 transition-colors duration-300",
                  disabled
                    ? "cursor-not-allowed border-[#d7dee4] bg-[#f1f3f5] text-[#10182a]/35 grayscale"
                    : "cursor-pointer border-[#cfe0eb] bg-white/74 hover:border-[#72a0c1] hover:bg-white"
                )}
                whileHover={disabled || reducedMotion ? undefined : { y: -3 }}
                whileTap={disabled || reducedMotion ? undefined : { scale: 0.985 }}
                transition={controlSpring}
              >
                {/* One shared highlight for all three cards, so selecting a
                    different package slides the blue surface across instead of
                    repainting two cards at once. */}
                {selected && !disabled ? (
                  <motion.span
                    aria-hidden
                    layoutId="ticket-package-selection"
                    // -inset-px so the highlight covers the card's own 1px
                    // border rather than drawing a second one inside it.
                    className="pointer-events-none absolute -inset-px -z-10 rounded-[19px] border border-[#2773c8] bg-[#f3f8ff] shadow-[0_12px_28px_rgba(39,115,200,0.13)]"
                    transition={selectionSpring}
                  />
                ) : null}
                {option.value === "SPECIAL_PACKET" ? (
                  <span className={clsx(
                    "absolute right-3 top-3 rounded-full px-2 py-1 text-[0.54rem] font-bold uppercase tracking-[0.1em]",
                    disabled ? "bg-[#d9dde1] text-[#10182a]/50" : "bg-[#dceeff] text-[#1766bd]"
                  )}>
                    {option.disabled ? copy.package.comingSoon : copy.package.bestValue}
                  </span>
                ) : null}
                <input
                  type="radio"
                  value={option.value}
                  disabled={disabled}
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
                <span className="mb-2 flex size-8 items-center justify-center rounded-full bg-[#eaf4fb] text-[#2773c8]">
                  <OptionIcon size={17} />
                </span>
                <span className="font-[var(--font-title-family)] text-[1.2rem] font-light leading-none text-[#10182a]">{option.title}</span>
                <span className="mt-1 text-[0.7rem] leading-4 text-[#10182a]/55">{option.subtitle}</span>
                {option.value === "SPECIAL_PACKET" ? (
                  <span className="mt-1 text-[0.66rem] leading-4 text-[#2773c8]">{copy.package.specialTickets}</span>
                ) : null}
                <SwapValue
                  value={priceLabel}
                  className="mt-auto pt-2.5 font-[var(--font-title-family)] text-[1.25rem] font-light text-[#10182a]"
                />
                <span className={clsx(
                  "pointer-events-none absolute bottom-3 right-3 grid size-4 place-items-center rounded-full border transition-colors duration-300",
                  selected && !disabled ? "border-[#2773c8]" : "border-[#8ca2b2]"
                )}>
                  <motion.span
                    aria-hidden
                    className="size-2 rounded-full bg-[#2773c8]"
                    initial={false}
                    animate={{ scale: selected && !disabled ? 1 : 0 }}
                    transition={controlSpring}
                  />
                </span>
              </motion.label>
            );
          })}
        </div>
        {errors.type ? <p className={errorText}>{errors.type.message}</p> : null}
      </motion.section>

      <motion.section variants={riseVariants} className="premium-glass flex items-center justify-between gap-4 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#eaf4fb] text-[#2773c8]">
            <Gift size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#10182a]">{copy.gala.title}</p>
            <p className="mt-0.5 text-[0.66rem] leading-4 text-[#10182a]/50">{copy.gala.description} · {galaPrice} {copy.gala.perPerson}</p>
          </div>
        </div>
        {/* "wait" rather than a crossfade: the two controls are different
            widths, and overlapping them would jog the row. */}
        <AnimatePresence mode="wait" initial={false}>
          {isSpecialPacket ? (
            <motion.span
              key="gala-included"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-[12px] border border-[#9bc8ee] bg-[#f1f8ff] px-3 py-2 text-[0.66rem] font-semibold text-[#2773c8]"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.2, ease: EASE_OUT } }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.12, ease: EASE_IN } }}
            >
              <LockKeyhole size={13} /> {copy.gala.included}
            </motion.span>
          ) : (
            <motion.label
              key="gala-toggle"
              className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-[0.72rem] font-semibold text-[#10182a]"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.2, ease: EASE_OUT } }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.12, ease: EASE_IN } }}
            >
              <input type="checkbox" disabled={!galaStripePrice} className="peer sr-only" {...register("galaDinner")} />
              <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-full border border-[rgba(114,160,193,0.34)] bg-white/90 text-transparent transition duration-300 peer-checked:border-[var(--color-blue)]/50 peer-checked:bg-[var(--color-blue-wash)] peer-checked:text-[#356f98] peer-focus-visible:ring-4 peer-focus-visible:ring-[var(--color-blue)]/20">
                <Check size={13} strokeWidth={2.6} />
              </span>
              {copy.gala.add}
            </motion.label>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Panel 2 only exists for the Special Packet, and it has to unmount so
          react-hook-form stops validating its fields. The surrounding grid
          keeps both tracks at all times and animates between them, so panel 1
          narrows in step with panel 2 unfolding rather than snapping. */}
      <motion.div
        variants={riseVariants}
        className="ticket-attendee-grid"
        data-second={isSpecialPacket}
      >
        <AttendeePanel
          number={isSpecialPacket ? 1 : undefined}
          register={register}
          errors={errors}
          copy={copy}
        />
        <div className="ticket-attendee-slot">
          <AnimatePresence initial={false}>
            {isSpecialPacket ? (
              <motion.div
                key="second-attendee"
                // Held back until the column has most of its width, so the
                // panel is never seen mid-squash.
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE_OUT, delay: 0.16 } }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.16, ease: EASE_IN } }}
                className="lg:min-w-[16rem]"
              >
                <SecondAttendeePanel register={register} errors={errors.secondAttendee} copy={copy} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>

      </motion.div>
      {/* Right column. */}
      <motion.div variants={columnVariants} className="space-y-3 lg:col-span-5">

      <motion.div variants={riseVariants} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <section className="premium-glass p-3.5">
          <SectionTitle icon={<UsersRound size={15} />}>{copy.membership.title}</SectionTitle>
          <label className={clsx("flex cursor-pointer items-start gap-3 rounded-[18px] border p-3 transition", isIbpaMember ? "border-[var(--color-blue)]/45 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(185,217,235,0.36))] shadow-[0_14px_34px_rgba(114,160,193,0.12)]" : "border-[var(--border-default)] bg-white/72")}>
            <input type="checkbox" className="peer sr-only" {...register("isIbpaMember")} />
            <span aria-hidden="true" className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.32)] bg-white/90 text-transparent transition peer-checked:border-[var(--color-blue)]/45 peer-checked:bg-[var(--color-blue-wash)] peer-checked:text-[#356f98] peer-focus-visible:ring-4 peer-focus-visible:ring-[var(--color-blue)]/20">
              <Check size={15} strokeWidth={3} />
            </span>
            <span>
              <span className="block text-[0.78rem] font-semibold text-[#10182a]">{copy.membership.memberLabel}</span>
              <span className="mt-0.5 block text-[0.68rem] leading-4 text-[#10182a]/50">{copy.membership.memberHint}</span>
            </span>
          </label>
          <Reveal open={isIbpaMember}>
            <div className="pt-3">
              <label className={labelBase} htmlFor="tf-cert">{copy.membership.certLabel} *</label>
              <input
                id="tf-cert"
                className={clsx(inputBase, errors.ibpaCertNumber && inputError)}
                placeholder="CERT-20240124-A00A"
                {...register("ibpaCertNumber", {
                  validate: (value) => !isIbpaMember || value.trim().length > 0 || copy.membership.certRequired,
                })}
              />
              {visibleCertStatus !== "idle" ? (
                <p className={clsx("mt-1 text-[0.7rem]", visibleCertStatus === "valid" ? "text-emerald-700" : visibleCertStatus === "invalid" ? "text-red-600" : "text-[#2773c8]")}>
                  <SwapValue value={visibleCertStatus}>
                    {visibleCertStatus === "checking" ? copy.membership.checking : visibleCertStatus === "valid" ? copy.membership.valid : visibleCertStatus === "invalid" ? copy.membership.invalid : copy.membership.error}
                  </SwapValue>
                </p>
              ) : errors.ibpaCertNumber ? <p className={errorText}>{errors.ibpaCertNumber.message}</p> : null}
            </div>
          </Reveal>
        </section>

        <section className="premium-glass p-3.5">
          <SectionTitle icon={<Tag size={15} />}>{promoText.promoCode}</SectionTitle>
          {/* Stacked: the column is too narrow for the input and the button side by side. */}
          <div className="flex flex-col gap-2">
            <input
              value={promoInput}
              disabled={isSpecialPacket}
              onChange={(event) => {
                setPromoInput(event.target.value);
                setPromoPreview(null);
                setPromoError("");
              }}
              className={inputBase}
              placeholder={isSpecialPacket ? copy.promo.unavailable : copy.promo.enter}
              autoCapitalize="characters"
            />
            <LandingSecondaryButton
              disabled={isSpecialPacket || promoPending || !promoInput.trim() || !type}
              onClick={() => void applyPromoCode()}
              className="min-h-0 w-full shrink-0 px-4 py-2.5 text-[0.66rem]"
            >
              {promoPending ? promoText.applying : promoText.apply}
            </LandingSecondaryButton>
          </div>
          <p className={clsx("mt-2 text-[0.68rem] leading-4 transition-colors duration-300", activePromoPreview ? "text-emerald-700" : promoError ? "text-red-600" : "text-[#10182a]/48")}>
            <SwapValue value={promoHint} />
          </p>
        </section>
      </motion.div>

      {/* The summary and every optional line in it stay mounted and collapse
          through `Reveal`, so a package change resizes the panel continuously
          instead of popping rows in and out under the total. */}
      {/* Spacing sits inside the reveal (see .ticket-reveal in globals.css):
          a collapsed reveal has to leave no gap behind it. */}
      <Reveal open={Boolean(type)}>
        <section className="premium-glass mb-3 p-3.5">
          <SectionTitle icon={<ReceiptText size={15} />}>{copy.summary.title}</SectionTitle>
          <div className="flex flex-col text-[0.76rem]">
            <div className="flex items-start justify-between gap-4 py-[3px]">
              <span className="text-[#10182a]/62">
                <SwapValue value={isSpecialPacket ? "special" : type === "ONE_DAY" ? "oneDay" : "twoDays"}>
                  {isSpecialPacket ? copy.summary.special : type === "ONE_DAY" ? copy.summary.oneDay : copy.summary.twoDays}
                </SwapValue>
                {isIbpaMember ? <span className="ml-2 text-[#2773c8]">{copy.summary.member}</span> : null}
              </span>
              <span className="text-right font-semibold text-[#10182a]">
                <SwapValue value={`${rawTicketPrice}/${discountedTicketPrice ?? ""}`}>
                  {discountedTicketPrice ? <><span className="mr-2 text-[#10182a]/35 line-through">{rawTicketPrice}</span>{discountedTicketPrice}</> : rawTicketPrice}
                </SwapValue>
              </span>
            </div>
            <Reveal open={Boolean(activePromoPreview)}>
              <div className="flex justify-between py-[3px] text-emerald-700"><span>{copy.summary.promoDiscount}</span><span>-{moneyFromCents(retainedPromoDiscountCents ?? 0)}</span></div>
            </Reveal>
            <Reveal open={!isSpecialPacket && galaDinner}>
              <div className="flex justify-between py-[3px] text-[#10182a]/62"><span>{copy.summary.gala}</span><span>{galaPrice}</span></div>
            </Reveal>
            <Reveal open={isSpecialPacket}>
              <div className="flex items-start gap-2 rounded-[12px] bg-[#eef7ff] px-3 py-2 text-[0.68rem] leading-5 text-[#1766bd]">
                <Check size={14} className="mt-0.5 shrink-0" /> {copy.summary.specialIncludes}
              </div>
            </Reveal>
            <div className="mt-2 flex justify-between border-t border-[#dbe7ee] pt-2 font-[var(--font-title-family)] text-[1.18rem] text-[#10182a]">
              <span>{copy.summary.total}</span>
              <SwapValue value={totalPrice} />
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal open={Boolean(serverError)}>
        <p role="alert" className="mb-3 rounded-[13px] border border-red-200 bg-red-50 px-4 py-3 text-[0.78rem] text-red-700">{retainedServerError}</p>
      </Reveal>

      <motion.div variants={riseVariants}>
      <LandingPrimaryButton
        type="submit"
        disabled={submitting || visibleCertStatus === "checking" || !type || !selectedStripePrice}
        className="w-full"
      >
        <SwapValue value={submitting ? "submitting" : visibleCertStatus === "checking" ? "verifying" : "idle"}>
          {submitting ? copy.actions.creatingCheckout : visibleCertStatus === "checking" ? copy.actions.verifyingCertificate : copy.actions.continuePayment}
        </SwapValue>
      </LandingPrimaryButton>
      <p className="mt-1.5 flex items-center justify-center gap-1.5 text-[0.64rem] text-[#10182a]/42"><LockKeyhole size={11} /> {copy.actions.secureCheckout}</p>
      </motion.div>

      </motion.div>
      </motion.div>
    </motion.form>
  );
}

type Register = ReturnType<typeof useForm<FormValues>>["register"];

function AttendeePanel({
  number,
  register,
  errors,
  copy,
}: {
  number?: number;
  register: Register;
  errors: ReturnType<typeof useForm<FormValues>>["formState"]["errors"];
  copy: TicketTranslation["form"];
}) {
  return (
    <section className="premium-glass p-3.5">
      <SectionTitle icon={<UserRound size={15} />}>{number ? `${copy.attendee.title} ${number}` : copy.attendee.information}</SectionTitle>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <Field label={copy.attendee.firstName} error={errors.firstName?.message}><input className={clsx(inputBase, errors.firstName && inputError)} autoComplete="given-name" {...register("firstName", { required: copy.attendee.firstNameRequired })} /></Field>
        <Field label={copy.attendee.lastName} error={errors.lastName?.message}><input className={clsx(inputBase, errors.lastName && inputError)} autoComplete="family-name" {...register("lastName", { required: copy.attendee.lastNameRequired })} /></Field>
        <Field label={copy.attendee.email} error={errors.email?.message}><input type="email" className={clsx(inputBase, errors.email && inputError)} autoComplete="email" {...register("email", { required: copy.attendee.emailRequired, pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: copy.attendee.emailInvalid } })} /></Field>
        <Field label={copy.attendee.phone} error={errors.phone?.message}><input type="tel" className={clsx(inputBase, errors.phone && inputError)} autoComplete="tel" {...register("phone", { required: copy.attendee.phoneRequired })} /></Field>
        <div className="sm:col-span-2"><Field label={copy.attendee.instagram} error={errors.instagram?.message}><input className={clsx(inputBase, errors.instagram && inputError)} placeholder={copy.attendee.instagramPlaceholder} {...register("instagram", { required: copy.attendee.instagramRequired, validate: (value) => validateInstagramInput(value) ? copy.attendee.instagramInvalid : true })} /></Field></div>
      </div>
    </section>
  );
}

function SecondAttendeePanel({ register, errors, copy }: { register: Register; errors: ReturnType<typeof useForm<FormValues>>["formState"]["errors"]["secondAttendee"]; copy: TicketTranslation["form"] }) {
  return (
    <section className="premium-glass border-[var(--color-blue)]/45 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(185,217,235,0.25))] p-3.5">
      <SectionTitle icon={<UserRound size={15} />}>{copy.attendee.title} 2</SectionTitle>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <Field label={copy.attendee.firstName} error={errors?.firstName?.message}><input className={clsx(inputBase, errors?.firstName && inputError)} autoComplete="off" {...register("secondAttendee.firstName", { required: copy.attendee.firstNameRequired })} /></Field>
        <Field label={copy.attendee.lastName} error={errors?.lastName?.message}><input className={clsx(inputBase, errors?.lastName && inputError)} autoComplete="off" {...register("secondAttendee.lastName", { required: copy.attendee.lastNameRequired })} /></Field>
        <Field label={copy.attendee.email} error={errors?.email?.message}><input type="email" className={clsx(inputBase, errors?.email && inputError)} autoComplete="off" {...register("secondAttendee.email", { required: copy.attendee.emailRequired, pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: copy.attendee.emailInvalid } })} /></Field>
        <Field label={copy.attendee.phone} error={errors?.phone?.message}><input type="tel" className={clsx(inputBase, errors?.phone && inputError)} autoComplete="off" {...register("secondAttendee.phone", { required: copy.attendee.phoneRequired })} /></Field>
        <div className="sm:col-span-2"><Field label={copy.attendee.instagram} error={errors?.instagram?.message}><input className={clsx(inputBase, errors?.instagram && inputError)} placeholder={copy.attendee.instagramPlaceholder} autoComplete="off" {...register("secondAttendee.instagram", { required: copy.attendee.instagramRequired, validate: (value) => validateInstagramInput(value) ? copy.attendee.instagramInvalid : true })} /></Field></div>
      </div>
      <p className="mt-3 flex items-start gap-1.5 text-[0.67rem] leading-5 text-[#1766bd]"><Info size={13} className="mt-0.5 shrink-0" /> {copy.attendee.secondHint}</p>
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label><span className={labelBase}>{label} *</span>{children}{error ? <span className={errorText}>{error}</span> : null}</label>;
}
