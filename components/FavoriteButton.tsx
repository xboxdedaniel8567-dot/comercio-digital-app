"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type FavoriteButtonProps = {
  productId: string;
  returnPath: string;
};

export function FavoriteButton({ productId, returnPath }: FavoriteButtonProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

    setIsSaving(true);

    const { error } = isFavorite
      ? await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", productId)
      : await supabase.from("favorites").insert({
          product_id: productId,
          user_id: userId,
        });

    setIsSaving(false);
    if (!error) setIsFavorite(!isFavorite);
  }

  return (
    <button
      aria-pressed={isFavorite}
      className="btn btn-dark"
      disabled={isChecking || isSaving}
      onClick={() => void toggleFavorite()}
      type="button"
    >
      {isChecking
        ? "Comprobando..."
        : isSaving
          ? "Guardando..."
          : isFavorite
            ? "Quitar de favoritos"
            : "Guardar en favoritos"}
    </button>
  );
}

