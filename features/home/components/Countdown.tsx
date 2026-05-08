"use client";

import { useEffect, useState } from "react";

function getTimeLeft() {
  const target = new Date("2026-07-31T23:59:00-04:00").getTime();
  const now = new Date().getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function getEmptyTime() {
  return {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };
}

function CountdownCard({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-sm border border-border-footer bg-[rgba(255,255,255,0.07)] px-(--space-sm) py-(--space-md) text-center">
      <div className="font-(--font-display) text-[clamp(1.8rem,4vw,2.8rem)] leading-none text-white">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-(--space-xs) text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-[rgba(255,255,255,0.45)]">
        {label}
      </div>
    </div>
  );
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getEmptyTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
      <div className="mt-(--space-lg) grid max-w-2xl grid-cols-2 gap-(--space-sm) rounded-(--radius) border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-(--space-md) backdrop-blur-md md:grid-cols-4">
        <CountdownCard value={timeLeft.days} label="Days" />
        <CountdownCard value={timeLeft.hours} label="Hours" />
        <CountdownCard value={timeLeft.minutes} label="Minutes" />
        <CountdownCard value={timeLeft.seconds} label="Seconds" />
      </div>
  );
}
