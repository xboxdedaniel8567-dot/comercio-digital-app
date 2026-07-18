"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type ModerationStatus = "approved" | "under_review" | "rejected";

type ProductModerationActionsProps = {
  currentStatus: string;
  initialNote: string;
  productId: string;
};

const actions: { label: string; status: ModerationStatus }[] = [
  { label: "Aprobar", status: "approved" },
  { label: "Revisar", status: "under_review" },
  { label: "Rechazar", status: "rejected" },
];

export function ProductModerationActions({
  currentStatus,
  initialNote,
  productId,
}: ProductModerationActionsProps) {
  const [note, setNote] = useState(initialNote);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function updateModeration(nextStatus: ModerationStatus) {
    setIsSaving(true);
    setMessage("Guardando...");

    const { error } = await supabase.rpc("moderate_product", {
      next_note: note.trim() || null,
      next_status: nextStatus,
      target_product_id: productId,
    });

    if (error) {
      setIsSaving(false);
      setMessage(`No se pudo moderar: ${error.message}`);
      return;
    }

    setMessage("Moderacion actualizada.");
    window.location.reload();
  }

  return (
    <div className="product-moderation-actions" style={{ display: "grid", gap: 8, minWidth: 250 }}>
      <input
        className="input"
        disabled={isSaving}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Nota para el comerciante"
        value={note}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
        {actions.map((action) => (
          <button
            className={action.status === "approved" ? "btn" : "btn btn-dark"}
            disabled={isSaving || currentStatus === action.status}
            key={action.status}
            onClick={() => void updateModeration(action.status)}
            type="button"
          >
            {currentStatus === action.status ? "Estado actual" : action.label}
          </button>
        ))}
      </div>
      {message ? <small className="muted">{message}</small> : null}
    </div>
  );
}
