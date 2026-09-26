"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface Props {
  expiryAt: string;
  showIcon?: boolean;
  compact?: boolean;
}

export const ExpiryCountdown: React.FC<Props> = ({
  expiryAt,
  showIcon = true,
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(expiryAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [expiryAt]);

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500">
        {showIcon && <Clock className="w-3 h-3" />} Đã hết hạn
      </span>
    );
  }

  const isUrgent = timeLeft.hours < 2;
  const isWarning = timeLeft.hours < 6;

  const colorClass = isUrgent
    ? "bg-rose-500 text-white shadow-sm animate-pulse"
    : isWarning
    ? "bg-amber-50 text-amber-700 border border-amber-200"
    : "bg-emerald-50 text-emerald-800 border border-emerald-200";

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono ${colorClass}`}
    >
      {showIcon && <Clock className="w-3.5 h-3.5 shrink-0" />}
      <span>
        {compact
          ? `${timeLeft.hours}h ${pad(timeLeft.minutes)}m`
          : `${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(
              timeLeft.seconds
            )}`}
      </span>
    </span>
  );
};
