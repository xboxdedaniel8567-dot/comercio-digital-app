"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type BusinessStatus = "active" | "pending_review" | "suspended" | "rejected";

type BusinessModerationActionsProps = {
  businessId: string;
  currentStatus: string;
};

const actions: { label: string; status: BusinessStatus }[] = [
  { label: "Aprobar", status: "active" },
  { label: "Revisar", status: "pending_review" },
  { label: "Suspender", status: "suspended" },
  { label: "Rechazar", status: "rejected" },
];

export function BusinessModerationActions({
  businessId,
  currentStatus,
}: BusinessModerationActionsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function updateStatus(nextStatus: BusinessStatus) {
    setIsSaving(true);
    setMessage("Guardando...");

    const { error } = await supabase.rpc("moderate_business", {
      next_status: nextStatus,
      target_business_id: businessId,
    });

    if (error) {
      setIsSaving(false);
      setMessage("No pudimos cambiar el estado. Intenta nuevamente.");
      return;
    }

    setMessage("Estado actualizado.");
    window.location.reload();
  }

  return (
    <div className="admin-moderation-actions">
      <div className="admin-action-row">
        {actions.map((action) => (
          <button
            className={action.status === "active" ? "btn" : "btn btn-dark"}
            disabled={isSaving || currentStatus === action.status}
            key={action.status}
            onClick={() => void updateStatus(action.status)}
            type="button"
          >
            {currentStatus === action.status ? "Estado actual" : action.label}
          </button>
        ))}
      </div>
      {message ? <small className="muted" role="status">{message}</small> : null}
    </div>
  );
}
