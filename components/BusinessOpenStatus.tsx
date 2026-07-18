"use client";

import { useEffect, useState } from "react";

type BusinessHour = {
  closes_at: string | null;
  day_of_week: number;
  is_closed: boolean;
  opens_at: string | null;
};

type BusinessOpenStatusProps = {
  hours: BusinessHour[];
};

const weekdayIndexes: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

function timeToMinutes(value: string | null) {
  if (!value) return null;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function getOpenState(hours: BusinessHour[]) {
  if (hours.length === 0) return "unknown";

  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    timeZone: "America/Bogota",
    weekday: "short",
  }).formatToParts(new Date());

  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const today = hours.find((day) => day.day_of_week === weekdayIndexes[weekday]);

  if (!today || today.is_closed) return "closed";

  const opensAt = timeToMinutes(today.opens_at);
  const closesAt = timeToMinutes(today.closes_at);
  if (opensAt === null || closesAt === null) return "unknown";

  const currentTime = hour * 60 + minute;
  const isOpen = closesAt > opensAt
    ? currentTime >= opensAt && currentTime < closesAt
    : currentTime >= opensAt || currentTime < closesAt;

  return isOpen ? "open" : "closed";
}

export function BusinessOpenStatus({ hours }: BusinessOpenStatusProps) {
  const [state, setState] = useState<"open" | "closed" | "unknown">("unknown");

  useEffect(() => {
    function refresh() {
      setState(getOpenState(hours));
    }

    refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(timer);
  }, [hours]);

  const presentation = state === "open"
    ? { color: "#34d399", label: "Abierto ahora" }
    : state === "closed"
      ? { color: "#f87171", label: "Cerrado ahora" }
      : { color: "var(--muted)", label: "Horario por confirmar" };

  return (
    <span
      style={{
        border: `1px solid ${presentation.color}`,
        color: presentation.color,
        display: "inline-flex",
        fontWeight: 700,
        marginTop: 8,
        padding: "7px 10px",
      }}
    >
      {presentation.label}
    </span>
  );
}

