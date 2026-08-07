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
import { PRICING } from "@/data/pricing";
import { ticketTranslations, type TicketTranslation } from "@/features/tickets/copy";
import { applyDiscountToCents, applyDiscountToPrice } from "@/features/tickets/types";
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
  "w-full rounded-[18px] border border-[var(--border-default)] bg-white/72 px-4 py-3 text-[0.84rem] text-[var(--color-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] placeholder:text-[var(--color-ink)]/35 outline-none transition focus:border-[var(--color-blue)]/55 focus:bg-white/90 focus:ring-4 focus:ring-[var(--color-blue)]/10 disabled:cursor-not-allowed disabled:opacity-50";
const inputError = "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-red-100";
const labelBase = "mb-1.5 block text-[0.66rem] font-semibold uppercase tracking-[0.13em] text-[#10182a]/55";
const errorText = "mt-1 text-[0.7rem] text-red-600";

function priceToNumber(value: string) {
  return Number.parseFloat(value.replace(/[^0-9.]/g, ""));
}

function moneyFromCents(amountCents: number, language: "en" | "ru" | "ua") {
  return new Intl.NumberFormat(language === "en" ? "en-US" : language === "ru" ? "ru-RU" : "uk-UA", {
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
  const { language, t } = useLanguage();
  const copy = ticketTranslations[language].form;
  const promoText = t.promo;
  const reducedMotion = useReducedMotion();
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
  const discountName = ticketDiscount.kind === "permanent30" ? copy.discount.permanent : copy.discount.earlyBird;

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
      price: isIbpaMember ? PRICING.forumTickets.ibpaMembers.oneDay : PRICING.forumTickets.standard.oneDay,
      icon: CalendarDays,
    },
    {
      value: "TWO_DAYS" as const,
      title: copy.package.twoDays,
      subtitle: copy.package.twoDaysSubtitle,
      price: isIbpaMember ? PRICING.forumTickets.ibpaMembers.twoDays : PRICING.forumTickets.standard.twoDays,
      icon: CalendarDays,
    },
    {
      value: "SPECIAL_PACKET" as const,
      title: copy.package.special,
      subtitle: copy.package.specialSubtitle,
      price: isIbpaMember ? specialPacket.memberPrice : specialPacket.standardPrice,
      icon: Star,
      disabled: !specialPacket.enabled,
    },
  ];

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-4 font-[var(--font-ui-family)]"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: reducedMotion ? { duration: 0 } : { staggerChildren: 0.055, delayChildren: 0.04 },
        },
      }}
    >
      {discount ? (
        <motion.div variants={reducedMotion ? undefined : { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="flex items-center gap-3 rounded-[22px] border border-[var(--color-blue)]/35 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(185,217,235,0.3))] px-4 py-3 shadow-[0_14px_34px_rgba(114,160,193,0.1)]">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-[#2773c8]">
            <Tag size={17} />
          </span>
          <p className="text-[0.76rem] leading-5 text-[#10182a]/70">
            <strong className="text-[#10182a]">{discountName} {copy.discount.pricing}</strong> — {discount.type === "percent" ? `${discount.value}%` : `$${discount.value / 100}`} {copy.discount.suffix}
          </p>
        </motion.div>
      ) : null}

      <motion.section variants={reducedMotion ? undefined : { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
        <SectionTitle icon={<Sparkles size={15} />}>{copy.package.title}</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          {packages.map((option) => {
            const selected = type === option.value;
            const OptionIcon = option.icon;
            const typeRegistration = register("type", { required: copy.package.required });
            return (
              <motion.label
                key={option.value}
                className={clsx(
                  "relative flex min-h-[172px] flex-col rounded-[18px] border p-4 transition",
                  option.disabled
                    ? "cursor-not-allowed border-[#d7dee4] bg-[#f1f3f5] text-[#10182a]/35 grayscale"
                    : selected
                      ? "cursor-pointer border-[#2773c8] bg-[#f3f8ff] shadow-[0_12px_28px_rgba(39,115,200,0.13)]"
                      : "cursor-pointer border-[#cfe0eb] bg-white/74 hover:border-[#72a0c1] hover:bg-white"
                )}
                whileHover={option.disabled || reducedMotion ? undefined : { y: -3 }}
                whileTap={option.disabled || reducedMotion ? undefined : { scale: 0.985 }}
                layout={!reducedMotion}
              >
                {option.value === "SPECIAL_PACKET" ? (
                  <span className={clsx(
                    "absolute right-3 top-3 rounded-full px-2 py-1 text-[0.54rem] font-bold uppercase tracking-[0.1em]",
                    option.disabled ? "bg-[#d9dde1] text-[#10182a]/50" : "bg-[#dceeff] text-[#1766bd]"
                  )}>
                    {option.disabled ? copy.package.comingSoon : copy.package.bestValue}
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
                  <span className="mt-1 text-[0.68rem] text-[#2773c8]">{copy.package.specialTickets}</span>
                ) : null}
                <span className="mt-auto pt-4 font-[var(--font-title-family)] text-[1.35rem] font-light text-[#10182a]">{option.price}</span>
                <span className={clsx(
                  "absolute bottom-4 right-4 size-4 rounded-full border",
                  selected ? "border-[#2773c8] bg-[#2773c8] shadow-[inset_0_0_0_3px_white]" : "border-[#8ca2b2]"
                )} />
              </motion.label>
            );
          })}
        </div>
        {errors.type ? <p className={errorText}>{errors.type.message}</p> : null}
      </motion.section>

      <motion.section variants={reducedMotion ? undefined : { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} className="premium-glass flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eaf4fb] text-[#2773c8]">
            <Gift size={18} />
          </span>
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#10182a]">{copy.gala.title}</p>
            <p className="mt-0.5 text-[0.68rem] text-[#10182a]/50">{copy.gala.description} · {galaPrice} {copy.gala.perPerson}</p>
          </div>
        </div>
        {isSpecialPacket ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[12px] border border-[#9bc8ee] bg-[#f1f8ff] px-3 py-2 text-[0.66rem] font-semibold text-[#2773c8]">
            <LockKeyhole size={13} /> {copy.gala.included}
          </span>
        ) : (
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-[0.72rem] font-semibold text-[#10182a]">
            <input type="checkbox" className="peer sr-only" {...register("galaDinner")} />
            <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-full border border-[rgba(114,160,193,0.34)] bg-white/90 text-transparent transition peer-checked:border-[var(--color-blue)]/50 peer-checked:bg-[var(--color-blue-wash)] peer-checked:text-[#356f98] peer-focus-visible:ring-4 peer-focus-visible:ring-[var(--color-blue)]/20">
              <Check size={13} strokeWidth={2.6} />
            </span>
            {copy.gala.add}
          </label>
        )}
      </motion.section>

      <motion.div variants={reducedMotion ? undefined : { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} className={clsx("grid gap-4", isSpecialPacket && "xl:grid-cols-2")}>
        <AttendeePanel
          number={isSpecialPacket ? 1 : undefined}
          register={register}
          errors={errors}
          copy={copy}
        />
        <AnimatePresence initial={false}>
          {isSpecialPacket ? (
            <motion.div key="second-attendee" initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}>
              <SecondAttendeePanel register={register} errors={errors.secondAttendee} copy={copy} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      <motion.div variants={reducedMotion ? undefined : { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} className="grid gap-4 lg:grid-cols-2">
        <section className="premium-glass p-4">
          <SectionTitle icon={<UsersRound size={15} />}>{copy.membership.title}</SectionTitle>
          <label className={clsx("flex cursor-pointer items-start gap-3 rounded-[22px] border p-4 transition", isIbpaMember ? "border-[var(--color-blue)]/45 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(185,217,235,0.36))] shadow-[0_14px_34px_rgba(114,160,193,0.12)]" : "border-[var(--border-default)] bg-white/72")}>
            <input type="checkbox" className="peer sr-only" {...register("isIbpaMember")} />
            <span aria-hidden="true" className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.32)] bg-white/90 text-transparent transition peer-checked:border-[var(--color-blue)]/45 peer-checked:bg-[var(--color-blue-wash)] peer-checked:text-[#356f98] peer-focus-visible:ring-4 peer-focus-visible:ring-[var(--color-blue)]/20">
              <Check size={15} strokeWidth={3} />
            </span>
            <span>
              <span className="block text-[0.8rem] font-semibold text-[#10182a]">{copy.membership.memberLabel}</span>
              <span className="mt-0.5 block text-[0.7rem] text-[#10182a]/50">{copy.membership.memberHint}</span>
            </span>
          </label>
          <AnimatePresence initial={false}>
            {isIbpaMember ? (
            <motion.div key="member-cert" initial={reducedMotion ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={reducedMotion ? undefined : { opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
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
                  {visibleCertStatus === "checking" ? copy.membership.checking : visibleCertStatus === "valid" ? copy.membership.valid : visibleCertStatus === "invalid" ? copy.membership.invalid : copy.membership.error}
                </p>
              ) : errors.ibpaCertNumber ? <p className={errorText}>{errors.ibpaCertNumber.message}</p> : null}
            </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        <section className="premium-glass p-4">
          <SectionTitle icon={<Tag size={15} />}>{promoText.promoCode}</SectionTitle>
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
              placeholder={isSpecialPacket ? copy.promo.unavailable : copy.promo.enter}
              autoCapitalize="characters"
            />
            <LandingSecondaryButton
              disabled={isSpecialPacket || promoPending || !promoInput.trim() || !type}
              onClick={() => void applyPromoCode()}
              className="min-h-0 shrink-0 px-4 py-2.5 text-[0.66rem]"
            >
              {promoPending ? promoText.applying : promoText.apply}
            </LandingSecondaryButton>
          </div>
          <p className={clsx("mt-2 text-[0.7rem]", activePromoPreview ? "text-emerald-700" : promoError ? "text-red-600" : "text-[#10182a]/48")}>
            {isSpecialPacket
              ? copy.promo.fixed
              : activePromoPreview
                ? promoText.promoCodeApplied
                : promoError || copy.promo.eligible}
          </p>
        </section>
      </motion.div>

      <AnimatePresence initial={false}>
      {type ? (
        <motion.section key="order-summary" initial={reducedMotion ? false : { opacity: 0, y: 12, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={reducedMotion ? undefined : { opacity: 0, y: -8, height: 0 }} className="premium-glass overflow-hidden p-4">
          <SectionTitle icon={<ReceiptText size={15} />}>{copy.summary.title}</SectionTitle>
          <div className="space-y-2 text-[0.78rem]">
            <div className="flex items-start justify-between gap-4">
              <span className="text-[#10182a]/62">
                {isSpecialPacket ? copy.summary.special : type === "ONE_DAY" ? copy.summary.oneDay : copy.summary.twoDays}
                {isIbpaMember ? <span className="ml-2 text-[#2773c8]">{copy.summary.member}</span> : null}
              </span>
              <span className="text-right font-semibold text-[#10182a]">
                {discountedTicketPrice ? <><span className="mr-2 text-[#10182a]/35 line-through">{rawTicketPrice}</span>{discountedTicketPrice}</> : rawTicketPrice}
              </span>
            </div>
            {activePromoPreview ? (
              <div className="flex justify-between text-emerald-700"><span>{copy.summary.promoDiscount}</span><span>-{moneyFromCents(activePromoPreview.discountAmountCents, language)}</span></div>
            ) : null}
            {!isSpecialPacket && galaDinner ? (
              <div className="flex justify-between text-[#10182a]/62"><span>{copy.summary.gala}</span><span>{galaPrice}</span></div>
            ) : null}
            {isSpecialPacket ? (
              <div className="flex items-start gap-2 rounded-[12px] bg-[#eef7ff] px-3 py-2 text-[0.68rem] leading-5 text-[#1766bd]">
                <Check size={14} className="mt-0.5 shrink-0" /> {copy.summary.specialIncludes}
              </div>
            ) : null}
            <div className="flex justify-between border-t border-[#dbe7ee] pt-2 font-[var(--font-title-family)] text-[1.18rem] text-[#10182a]">
              <span>{copy.summary.total}</span><span>{moneyFromCents(totalCents, language)}</span>
            </div>
          </div>
        </motion.section>
      ) : null}
      </AnimatePresence>

      {serverError ? (
        <p role="alert" className="rounded-[13px] border border-red-200 bg-red-50 px-4 py-3 text-[0.78rem] text-red-700">{serverError}</p>
      ) : null}

      <motion.div variants={reducedMotion ? undefined : { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
      <LandingPrimaryButton
        type="submit"
        disabled={submitting || visibleCertStatus === "checking" || !type}
        className="w-full"
      >
        {submitting ? copy.actions.creatingCheckout : visibleCertStatus === "checking" ? copy.actions.verifyingCertificate : copy.actions.continuePayment}
      </LandingPrimaryButton>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-[0.66rem] text-[#10182a]/42"><LockKeyhole size={11} /> {copy.actions.secureCheckout}</p>
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
    <section className="premium-glass p-4">
      <SectionTitle icon={<UserRound size={15} />}>{number ? `${copy.attendee.title} ${number}` : copy.attendee.information}</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
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
    <section className="premium-glass border-[var(--color-blue)]/45 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(185,217,235,0.25))] p-4">
      <SectionTitle icon={<UserRound size={15} />}>{copy.attendee.title} 2</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
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
