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
    <div className="rounded-2xl border border-[#d8c27a]/35 bg-white/5 px-5 py-4 text-center backdrop-blur-sm">
      <div className="text-3xl font-semibold text-white md:text-4xl">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-1 text-xs uppercase tracking-[0.28em] text-[#d8c27a]">
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
      <div className="mt-10 grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
        <CountdownCard value={timeLeft.days} label="Days" />
        <CountdownCard value={timeLeft.hours} label="Hours" />
        <CountdownCard value={timeLeft.minutes} label="Minutes" />
        <CountdownCard value={timeLeft.seconds} label="Seconds" />
      </div>
  );
}
