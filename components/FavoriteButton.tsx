"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type FavoriteButtonProps = {
  productId: string;
  returnPath: string;
  variant?: "full" | "icon";
};

export function FavoriteButton({ productId, returnPath, variant = "full" }: FavoriteButtonProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFavorite() {
      const { data } = await supabase.auth.getUser();
      const currentUserId = data.user?.id ?? null;
      setUserId(currentUserId);

      if (currentUserId) {
        const { data: favorite } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", currentUserId)
          .eq("product_id", productId)
          .maybeSingle();

        setIsFavorite(Boolean(favorite));
      }

      setIsChecking(false);
    }

    void loadFavorite();
  }, [productId]);

  async function toggleFavorite() {
    if (!userId) {
      window.location.href = `/panel/login?next=${encodeURIComponent(returnPath)}`;
      return;
    }

    const nextState = !isFavorite;
    setIsFavorite(nextState);
    setIsSaving(true);
    setError("");

    const { error: toggleError } = nextState
      ? await supabase.from("favorites").insert({
          product_id: productId,
          user_id: userId,
        })
      : await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", productId);

    setIsSaving(false);

    if (toggleError) {
      setIsFavorite(!nextState);
      setError("No se pudo guardar. Intenta de nuevo.");
    }
  }

  if (variant === "icon") {
    return (
      <div className="favorite-icon-wrap">
        <button
          aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
          aria-pressed={isFavorite}
          className={`favorite-icon-btn ${isFavorite ? "favorite-icon-btn-active" : ""}`}
          disabled={isChecking || isSaving}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void toggleFavorite();
          }}
          type="button"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
          </svg>
        </button>
        {error ? <span className="favorite-icon-error" role="alert">{error}</span> : null}
      </div>
    );
  }

  return (
    <div className="favorite-full-wrap">
      <button
        aria-pressed={isFavorite}
        className={`btn btn-dark ${isFavorite ? "btn-favorite-active" : ""}`}
        disabled={isChecking || isSaving}
        onClick={() => void toggleFavorite()}
        type="button"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: 6 }}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
        </svg>
        {isChecking
          ? "Comprobando..."
          : isSaving
            ? "Guardando..."
            : isFavorite
              ? "Quitar de favoritos"
              : "Guardar en favoritos"}
      </button>
      {error ? <p className="favorite-error" role="alert">{error}</p> : null}
    </div>
  );
}
