"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type ProductStatusButtonProps = {
  slug: string;
  status: string;
  onStatusChange?: (status: string) => void;
};

export function ProductStatusButton({ slug, status, onStatusChange }: ProductStatusButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const isActive = status === "active";
  const nextStatus = isActive ? "draft" : "active";

  async function updateStatus() {
    setIsUpdating(true);
    setError("");

    const { error: updateError } = await supabase
      .from("products")
      .update({ status: nextStatus })
      .eq("slug", slug);

    setIsUpdating(false);
    setConfirming(false);

    if (updateError) {
      setError("No se pudo actualizar el estado. Intenta de nuevo.");
      return;
    }

    onStatusChange?.(nextStatus);
  }

  if (confirming) {
    return (
      <div className="confirm-inline">
        <span className="confirm-inline-text">
          {isActive ? "Ocultar producto?" : "Activar producto?"}
        </span>
        <button
          className="btn btn-dark confirm-inline-btn"
          disabled={isUpdating}
          onClick={() => void updateStatus()}
          type="button"
        >
          {isUpdating ? "Guardando..." : "Si"}
        </button>
        <button
          className="btn btn-dark confirm-inline-btn"
          disabled={isUpdating}
          onClick={() => setConfirming(false)}
          type="button"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <div className="product-status-wrap">
      <button
        className="btn btn-dark"
        disabled={isUpdating}
        onClick={() => setConfirming(true)}
        type="button"
      >
        {isUpdating ? "Actualizando..." : isActive ? "Desactivar" : "Activar"}
      </button>
      {error ? <p className="product-status-error">{error}</p> : null}
    </div>
  );
}
