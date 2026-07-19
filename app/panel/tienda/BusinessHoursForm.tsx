"use client";

import { FormEvent, useEffect, useState } from "react";
import { getCurrentBusiness } from "@/lib/current-business";
import { supabase } from "@/lib/supabase";

type DaySchedule = {
  dayOfWeek: number;
  name: string;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
};

const defaultSchedule: DaySchedule[] = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo",
].map((name, dayOfWeek) => ({
  closesAt: "18:00",
  dayOfWeek,
  isClosed: dayOfWeek === 6,
  name,
  opensAt: "08:00",
}));

type Time12HourInputProps = {
  disabled: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
};

function Time12HourInput({ disabled, label, onChange, value }: Time12HourInputProps) {
  const [hourPart = "08", minutePart = "00"] = value.split(":");
  const hour24 = Number(hourPart);
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;

  function updateTime(nextHour12: number, nextMinute: string, nextPeriod: string) {
    let nextHour24 = nextHour12 % 12;
    if (nextPeriod === "PM") nextHour24 += 12;
    onChange(`${String(nextHour24).padStart(2, "0")}:${nextMinute}`);
  }

  return (
    <div className="time-12-input" role="group" aria-label={label}>
      <select
        aria-label={`${label}, hora`}
        className="input"
        disabled={disabled}
        onChange={(event) => updateTime(Number(event.target.value), minutePart, period)}
        value={hour12}
      >
        {Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => (
          <option key={hour} value={hour}>{hour}</option>
        ))}
      </select>
      <select
        aria-label={`${label}, minutos`}
        className="input"
        disabled={disabled}
        onChange={(event) => updateTime(hour12, event.target.value, period)}
        value={minutePart}
      >
        {Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0")).map(
          (minute) => <option key={minute} value={minute}>{minute}</option>,
        )}
      </select>
      <select
        aria-label={`${label}, periodo`}
        className="input"
        disabled={disabled}
        onChange={(event) => updateTime(hour12, minutePart, event.target.value)}
        value={period}
      >
        <option value="AM">a. m.</option>
        <option value="PM">p. m.</option>
      </select>
    </div>
  );
}

export function BusinessHoursForm() {
  const [businessId, setBusinessId] = useState("");
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [message, setMessage] = useState("Cargando horarios...");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadHours() {
      const { business, error: businessError } = await getCurrentBusiness();
      if (!business) {
        setMessage(businessError || "No encontramos una tienda asociada.");
        setIsLoading(false);
        return;
      }

      setBusinessId(business.id);
      const { data, error } = await supabase
        .from("business_hours")
        .select("day_of_week, opens_at, closes_at, is_closed")
        .eq("business_id", business.id)
        .order("day_of_week");

      if (error) {
        setMessage(`No se pudieron cargar los horarios: ${error.message}`);
        setIsLoading(false);
        return;
      }

      if (data?.length) {
        setSchedule((current) =>
          current.map((day) => {
            const saved = data.find((row) => row.day_of_week === day.dayOfWeek);
            return saved
              ? {
                  ...day,
                  closesAt: saved.closes_at?.slice(0, 5) ?? day.closesAt,
                  isClosed: saved.is_closed,
                  opensAt: saved.opens_at?.slice(0, 5) ?? day.opensAt,
                }
              : day;
          }),
        );
      }

      setMessage("");
      setIsLoading(false);
    }

    void loadHours();
  }, []);

  function updateDay(dayOfWeek: number, changes: Partial<DaySchedule>) {
    setSchedule((current) =>
      current.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, ...changes } : day)),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!businessId) return;

    setIsSaving(true);
    setMessage("Guardando horarios...");

    const rows = schedule.map((day) => ({
      business_id: businessId,
      closes_at: day.isClosed ? null : day.closesAt,
      day_of_week: day.dayOfWeek,
      is_closed: day.isClosed,
      opens_at: day.isClosed ? null : day.opensAt,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("business_hours")
      .upsert(rows, { onConflict: "business_id,day_of_week" });

    setIsSaving(false);
    setMessage(error ? `No se guardaron los horarios: ${error.message}` : "Horarios actualizados correctamente.");
  }

  return (
    <form className="merchant-form-section panel" onSubmit={handleSubmit}>
      <div className="merchant-form-heading">
      <p className="kicker">Disponibilidad</p>
      <h2>Horario de atencion</h2>
      <p>
        Indica cuando pueden visitar tu local. Marca &quot;Cerrado&quot; cuando no atiendas.
      </p>
      </div>
      <div className="merchant-hours-list">
      {schedule.map((day) => (
        <div
          className="hours-row"
          key={day.dayOfWeek}
        >
          <strong>{day.name}</strong>
          <Time12HourInput
            disabled={isLoading || day.isClosed}
            label={`Apertura ${day.name}`}
            onChange={(value) => updateDay(day.dayOfWeek, { opensAt: value })}
            value={day.opensAt}
          />
          <Time12HourInput
            disabled={isLoading || day.isClosed}
            label={`Cierre ${day.name}`}
            onChange={(value) => updateDay(day.dayOfWeek, { closesAt: value })}
            value={day.closesAt}
          />
          <label style={{ alignItems: "center", display: "flex", gap: 7 }}>
            <input
              checked={day.isClosed}
              disabled={isLoading}
              onChange={(event) => updateDay(day.dayOfWeek, { isClosed: event.target.checked })}
              type="checkbox"
            />
            Cerrado
          </label>
        </div>
      ))}
      </div>
      <button className="btn" disabled={isLoading || isSaving} type="submit">
        {isSaving ? "Guardando..." : "Guardar horarios"}
      </button>
      {message ? <p className="merchant-form-message" role="status">{message}</p> : null}
    </form>
  );
}
