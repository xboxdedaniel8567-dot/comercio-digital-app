"use client";

import { useMemo, useState } from "react";
import { ContactButton } from "@/components/ContactButton";
import { InventoryBadge } from "@/components/InventoryBadge";
import { ReservationButton } from "@/components/ReservationButton";
import { formatPrice } from "@/lib/format-price";

type ProductVariant = {
  id: string;
  name: string;
  option_values: Record<string, string>;
  price: number | null;
  stock: number;
};

type ProductVariantSelectorProps = {
  basePrice: number | null;
  businessId: string;
  businessName: string;
  currency: string;
  productId: string;
  productName: string;
  returnPath: string;
  variants: ProductVariant[];
  whatsapp?: string | null;
};

export function ProductVariantSelector({
  basePrice,
  businessId,
  businessName,
  currency,
  productId,
  productName,
  returnPath,
  variants,
  whatsapp,
}: ProductVariantSelectorProps) {
  const firstAvailable = variants.find((variant) => variant.stock > 0) ?? variants[0];
  const [selectedId, setSelectedId] = useState(firstAvailable?.id ?? "");
  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedId) ?? firstAvailable,
    [firstAvailable, selectedId, variants],
  );

  if (!selectedVariant) return null;

  const selectedPrice = selectedVariant.price ?? basePrice;
  const optionText = Object.entries(selectedVariant.option_values ?? {})
    .map(([key, value]) => `${key}: ${value}`)
    .join(" - ");
  const message = encodeURIComponent(
    `Hola, vi ${productName} en Comercio Digital. Me interesa la variante ${selectedVariant.name}. Quiero confirmar disponibilidad.`,
  );

  return (
    <section aria-labelledby="variant-selector-title" className="product-variant-selector">
      <div>
        <h2 id="variant-selector-title">
          Selecciona una presentacion
        </h2>
        <p className="muted">
          Elige la talla, color o capacidad que necesitas.
        </p>
      </div>
      <select
        className="input"
        onChange={(event) => setSelectedId(event.target.value)}
        value={selectedVariant.id}
      >
        {variants.map((variant) => (
          <option disabled={variant.stock <= 0} key={variant.id} value={variant.id}>
            {variant.name}{variant.stock <= 0 ? " - Agotado" : ""}
          </option>
        ))}
      </select>
      {optionText ? <p className="product-variant-options">{optionText}</p> : null}
      <div className="product-variant-price">
        <strong>{formatPrice(selectedPrice, currency)}</strong>
        <InventoryBadge stock={selectedVariant.stock} />
      </div>
      {selectedVariant.stock > 0 ? (
        <div className="product-variant-actions">
          <ContactButton
            businessId={businessId}
            businessName={businessName}
            label="Consultar esta variante por WhatsApp"
            message={message}
            productId={productId}
            source="product_detail"
            whatsapp={whatsapp}
          />
          <ReservationButton
            availableStock={selectedVariant.stock}
            productId={productId}
            productName={productName}
            returnPath={returnPath}
            variantId={selectedVariant.id}
            variantName={selectedVariant.name}
          />
        </div>
      ) : (
        <p className="muted">Esta variante esta agotada.</p>
      )}
    </section>
  );
}
