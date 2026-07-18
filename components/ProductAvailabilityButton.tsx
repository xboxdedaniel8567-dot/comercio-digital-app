"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type ProductAvailabilityButtonProps = {
  initialUpdatedAt: string;
  productId: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ProductAvailabilityButton({
  initialUpdatedAt,
  productId,
}: ProductAvailabilityButtonProps) {
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [isUpdating, setIsUpdating] = useState(false);

  async function confirmAvailability() {
    const nextUpdatedAt = new Date().toISOString();
    setIsUpdating(true);

    const { error } = await supabase
      .from("products")
      .update({ updated_at: nextUpdatedAt })
      .eq("id", productId);

    setIsUpdating(false);

    if (error) {
      alert(`No se pudo confirmar la disponibilidad: ${error.message}`);
      return;
    }

    setUpdatedAt(nextUpdatedAt);
  }

  return (
    <div style={{ display: "grid", gap: 5 }}>
      <button
        className="btn btn-dark"
        disabled={isUpdating}
        onClick={() => void confirmAvailability()}
        type="button"
      >
        {isUpdating ? "Confirmando..." : "Confirmar disponibilidad"}
      </button>
      <small className="muted">Revisado: {formatDate(updatedAt)}</small>
    </div>
  );
}
