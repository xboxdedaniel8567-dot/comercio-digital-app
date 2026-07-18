"use client";

import { useMemo, useState } from "react";
import { ContactButton } from "@/components/ContactButton";
import { InventoryBadge } from "@/components/InventoryBadge";
import { ReservationButton } from "@/components/ReservationButton";

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

function formatPrice(price: number | null, currency: string) {
  if (price === null) return "Precio por consultar";

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

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
    <section
      aria-labelledby="variant-selector-title"
      style={{ borderTop: "1px solid var(--line)", display: "grid", gap: 12, marginTop: 22, paddingTop: 18 }}
    >
      <div>
        <h2 id="variant-selector-title" style={{ fontSize: "1rem", margin: "0 0 6px" }}>
          Selecciona una presentacion
        </h2>
        <p className="muted" style={{ margin: 0 }}>
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
      {optionText ? <p className="muted" style={{ margin: 0 }}>{optionText}</p> : null}
      <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 10 }}>
        <strong style={{ fontSize: "1.2rem" }}>{formatPrice(selectedPrice, currency)}</strong>
        <InventoryBadge stock={selectedVariant.stock} />
      </div>
      {selectedVariant.stock > 0 ? (
        <div style={{ display: "grid", gap: 10 }}>
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
        <p className="muted" style={{ margin: 0 }}>Esta variante esta agotada.</p>
      )}
    </section>
  );
}
