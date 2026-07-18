"use client";

import { useState } from "react";
import { InventoryBadge } from "@/components/InventoryBadge";
import { supabase } from "@/lib/supabase";

type QuickStockControlProps = {
  initialStock: number | null;
  onStockChange?: (stock: number) => void;
  productId: string;
};

export function QuickStockControl({
  initialStock,
  onStockChange,
  productId,
}: QuickStockControlProps) {
  const [stock, setStock] = useState(initialStock ?? 0);
  const [isUpdating, setIsUpdating] = useState(false);

  async function changeStock(nextStock: number) {
    const safeStock = Math.max(0, nextStock);
    setIsUpdating(true);

    const { error } = await supabase
      .from("products")
      .update({ stock: safeStock })
      .eq("id", productId);

    setIsUpdating(false);

    if (error) {
      alert(`No se pudo actualizar el stock: ${error.message}`);
      return;
    }

    setStock(safeStock);
    onStockChange?.(safeStock);
  }

  return (
    <div
      aria-label="Control rapido de stock"
      style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 6 }}
    >
      <InventoryBadge stock={stock} />
      <button
        aria-label="Restar una unidad"
        className="btn btn-dark"
        disabled={isUpdating || stock === 0}
        onClick={() => void changeStock(stock - 1)}
        style={{ minHeight: 36, minWidth: 36, padding: 0 }}
        type="button"
      >
        -
      </button>
      <strong style={{ minWidth: 30, textAlign: "center" }}>{stock}</strong>
      <button
        aria-label="Sumar una unidad"
        className="btn btn-dark"
        disabled={isUpdating}
        onClick={() => void changeStock(stock + 1)}
        style={{ minHeight: 36, minWidth: 36, padding: 0 }}
        type="button"
      >
        +
      </button>
    </div>
  );
}
