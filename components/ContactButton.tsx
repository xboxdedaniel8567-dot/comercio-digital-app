"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type ContactButtonProps = {
  businessId: string;
  businessName: string;
  className?: string;
  label: string;
  message: string;
  productId?: string;
  source: "product_detail" | "store_detail";
  whatsapp?: string | null;
};

export function ContactButton({
  businessId,
  businessName,
  className = "btn",
  label,
  message,
  productId,
  source,
  whatsapp,
}: ContactButtonProps) {
  const normalizedWhatsapp = whatsapp?.replace(/\D/g, "") ?? "";
  const [isOpening, setIsOpening] = useState(false);

  async function handleClick() {
    if (!normalizedWhatsapp || isOpening) return;

    setIsOpening(true);

    const { error } = await supabase.from("contact_events").insert({
      business_id: businessId,
      business_name: businessName,
      product_id: productId ?? null,
      source,
      whatsapp: normalizedWhatsapp,
    });

    if (error) {
      console.error("No se pudo registrar el clic de WhatsApp:", error.message);
    }

    window.open(`https://wa.me/${normalizedWhatsapp}?text=${message}`, "_blank", "noopener,noreferrer");
    setIsOpening(false);
  }

  return (
    <button className={className} disabled={!normalizedWhatsapp || isOpening} onClick={handleClick} type="button">
      {!normalizedWhatsapp ? "WhatsApp no disponible" : isOpening ? "Abriendo..." : label}
    </button>
  );
}
