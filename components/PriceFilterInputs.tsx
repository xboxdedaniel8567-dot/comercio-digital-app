"use client";

import { useState } from "react";
import { PriceInput } from "@/components/PriceInput";
import { sanitizePriceInput } from "@/lib/format-price";

type PriceFilterInputsProps = {
  initialMax?: string;
  initialMin?: string;
  prefix: string;
};

export function PriceFilterInputs({
  initialMax = "",
  initialMin = "",
  prefix,
}: PriceFilterInputsProps) {
  const [minimum, setMinimum] = useState(sanitizePriceInput(initialMin));
  const [maximum, setMaximum] = useState(sanitizePriceInput(initialMax));

  return (
    <div className="search-price-grid">
      <PriceInput
        id={`${prefix}-min-price`}
        label="Precio mínimo"
        name="min_price"
        onValueChange={setMinimum}
        optional
        placeholder="Mínimo"
        showPreview={false}
        showWords={false}
        value={minimum}
      />
      <PriceInput
        id={`${prefix}-max-price`}
        label="Precio máximo"
        name="max_price"
        onValueChange={setMaximum}
        optional
        placeholder="Máximo"
        showPreview={false}
        showWords={false}
        value={maximum}
      />
    </div>
  );
}
