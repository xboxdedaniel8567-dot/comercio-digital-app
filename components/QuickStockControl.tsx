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
  const [error, setError] = useState("");

  async function persist(nextStock: number) {
    const safeStock = Math.max(0, nextStock);
    setIsUpdating(true);
    setError("");

    const { error: updateError } = await supabase
      .from("products")
      .update({ stock: safeStock })
      .eq("id", productId);

    setIsUpdating(false);

    if (updateError) {
      setError("No se pudo actualizar el stock. Intenta de nuevo.");
      return;
    }

    setStock(safeStock);
    onStockChange?.(safeStock);
  }

  return (
    <div className="quick-stock" aria-label="Control rapido de stock">
      <InventoryBadge stock={stock} />
      <div className="quick-stock-controls">
        <button
          aria-label="Restar una unidad"
          className="btn btn-dark quick-stock-btn"
          disabled={isUpdating || stock === 0}
          onClick={() => void persist(stock - 1)}
          type="button"
        >
          <span aria-hidden="true">&minus;</span>
        </button>
        <input
          aria-label="Cantidad de stock"
          className="input quick-stock-input"
          disabled={isUpdating}
          inputMode="numeric"
          min={0}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (Number.isFinite(value)) setStock(Math.max(0, value));
          }}
          onBlur={(event) => {
            const value = Number(event.target.value);
            if (Number.isFinite(value) && value !== stock) void persist(value);
          }}
          type="number"
          value={stock}
        />
        <button
          aria-label="Sumar una unidad"
          className="btn btn-dark quick-stock-btn"
          disabled={isUpdating}
          onClick={() => void persist(stock + 1)}
          type="button"
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
      {error ? <p className="quick-stock-error">{error}</p> : null}
    </div>
  );
}
