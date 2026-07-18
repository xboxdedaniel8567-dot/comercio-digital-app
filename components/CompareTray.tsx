"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ComparisonItem,
  comparisonChangedEvent,
  readComparison,
  writeComparison,
} from "@/lib/comparison";

export function CompareTray() {
  const [items, setItems] = useState<ComparisonItem[]>([]);

  useEffect(() => {
    function syncItems() {
      setItems(readComparison());
    }

    syncItems();
    window.addEventListener(comparisonChangedEvent, syncItems);
    return () => window.removeEventListener(comparisonChangedEvent, syncItems);
  }, []);

  if (items.length === 0) return null;

  return (
    <aside className="compare-tray">
      <div className="compare-tray-heading">
        <strong>Comparador: {items.length} de 3</strong>
        <button className="btn btn-dark" onClick={() => writeComparison([])} type="button">
          Limpiar
        </button>
      </div>
      <div className="compare-tray-items">
        {items.map((item) => (
          <span className="compare-tray-item" key={item.slug}>{item.name}</span>
        ))}
      </div>
      {items.length >= 2 ? (
        <Link className="btn" href="/comparar">Comparar productos</Link>
      ) : (
        <p className="muted" style={{ margin: 0 }}>Selecciona al menos dos productos.</p>
      )}
    </aside>
  );
}
