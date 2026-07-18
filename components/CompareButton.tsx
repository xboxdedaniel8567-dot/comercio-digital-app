"use client";

import { useEffect, useState } from "react";
import {
  comparisonChangedEvent,
  comparisonLimit,
  readComparison,
  writeComparison,
} from "@/lib/comparison";

export function CompareButton({ name, slug }: { name: string; slug: string }) {
  const [isSelected, setIsSelected] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    function syncState() {
      setIsSelected(readComparison().some((item) => item.slug === slug));
    }

    syncState();
    window.addEventListener(comparisonChangedEvent, syncState);
    return () => window.removeEventListener(comparisonChangedEvent, syncState);
  }, [slug]);

  function toggleProduct() {
    const current = readComparison();

    if (current.some((item) => item.slug === slug)) {
      writeComparison(current.filter((item) => item.slug !== slug));
      setMessage("");
      return;
    }

    if (current.length >= comparisonLimit) {
      setMessage(`Puedes comparar maximo ${comparisonLimit} productos.`);
      return;
    }

    writeComparison([...current, { name, slug }]);
    setMessage("");
  }

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <button
        aria-pressed={isSelected}
        className={isSelected ? "btn" : "btn btn-dark"}
        onClick={toggleProduct}
        type="button"
      >
        {isSelected ? "Quitar del comparador" : "Agregar al comparador"}
      </button>
      {message ? <small className="muted" role="status">{message}</small> : null}
    </div>
  );
}

