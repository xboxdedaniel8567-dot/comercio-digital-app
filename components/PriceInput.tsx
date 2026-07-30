"use client";

import { useId, useState } from "react";
import {
  formatPrice,
  getPriceError,
  parsePriceInput,
  priceToWords,
  sanitizePriceInput,
  SUSPICIOUS_PRICE_COP,
} from "@/lib/format-price";

type PriceInputProps = {
  disabled?: boolean;
  id?: string;
  label?: string;
  name?: string;
  onValueChange: (value: string) => void;
  optional?: boolean;
  placeholder?: string;
  showPreview?: boolean;
  showWords?: boolean;
  value: string;
};

export function PriceInput({
  disabled = false,
  id,
  label = "Precio en pesos colombianos",
  name,
  onValueChange,
  optional = false,
  placeholder = "$1.250.000",
  showPreview = true,
  showWords = true,
  value,
}: PriceInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [interactionError, setInteractionError] = useState("");
  const numericPrice = parsePriceInput(value);
  const validationError = getPriceError(value, optional);
  const visibleError = interactionError || (value ? validationError : null);
  const formattedPrice = numericPrice === null ? "" : formatPrice(numericPrice, "COP");
  const words = priceToWords(numericPrice);
  const isSuspicious = numericPrice !== null && numericPrice >= SUSPICIOUS_PRICE_COP;

  function handleChange(rawValue: string) {
    if (rawValue.includes("-")) {
      setInteractionError("El precio no puede ser negativo.");
      return;
    }

    setInteractionError("");
    onValueChange(sanitizePriceInput(rawValue));
  }

  return (
    <div className="merchant-field price-input">
      <label htmlFor={inputId}>{label}{optional ? " (opcional)" : ""}</label>
      <input
        aria-describedby={`${inputId}-guidance`}
        aria-invalid={Boolean(visibleError)}
        className="input price-input-control"
        disabled={disabled}
        id={inputId}
        inputMode="numeric"
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder}
        required={!optional}
        type="text"
        value={formattedPrice}
      />
      {name ? <input name={name} type="hidden" value={value} /> : null}
      <div className="price-input-guidance" id={`${inputId}-guidance`}>
        {visibleError ? <span className="price-input-error">{visibleError}</span> : null}
        {!visibleError && showWords && words ? <span className="price-input-words">{words}</span> : null}
        {!visibleError && isSuspicious ? (
          <span className="price-input-warning">
            Revisa este valor antes de guardar. El precio es inusualmente alto.
          </span>
        ) : null}
        {showPreview && formattedPrice && !visibleError ? (
          <span className="price-input-preview">
            Así lo verán los compradores: <strong>{formattedPrice}</strong>
          </span>
        ) : null}
      </div>
    </div>
  );
}
