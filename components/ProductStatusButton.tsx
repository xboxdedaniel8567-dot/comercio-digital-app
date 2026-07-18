"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type ProductStatusButtonProps = {
  slug: string;
  status: string;
};

export function ProductStatusButton({ slug, status }: ProductStatusButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isActive = status === "active";
  const nextStatus = isActive ? "draft" : "active";

  async function updateStatus() {
    setIsUpdating(true);

    const { error } = await supabase
      .from("products")
      .update({ status: nextStatus })
      .eq("slug", slug);

    if (error) {
      setIsUpdating(false);
      alert(`No se pudo actualizar el producto: ${error.message}`);
      return;
    }

    window.location.reload();
  }

  return (
    <button
      className="btn btn-dark"
      disabled={isUpdating}
      onClick={updateStatus}
      type="button"
    >
      {isUpdating ? "Actualizando..." : isActive ? "Desactivar" : "Activar"}
    </button>
  );
}
