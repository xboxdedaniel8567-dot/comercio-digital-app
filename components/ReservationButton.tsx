"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

type ReservationButtonProps = {
  availableStock: number | null;
  productId: string;
  productName: string;
  returnPath: string;
  variantId?: string | null;
  variantName?: string | null;
};

export function ReservationButton({
  availableStock,
  productId,
  productName,
  returnPath,
  variantId = null,
  variantName = null,
}: ReservationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function submitReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setNeedsLogin(false);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setNeedsLogin(true);
      setMessage("Debes iniciar sesion con una cuenta de comprador.");
      setIsSaving(false);
      return;
    }

    const { error } = await supabase.rpc("create_reservation_request", {
      p_note: note.trim(),
      p_product_id: productId,
      p_quantity: quantity,
      p_variant_id: variantId,
    });

    if (error) {
      setMessage("No pudimos solicitar la reserva. Intenta nuevamente.");
      setIsSaving(false);
      return;
    }

    setMessage("Solicitud enviada. La tienda debe confirmarla antes de que te desplaces.");
    setIsOpen(false);
    setIsSaving(false);
  }

  if ((availableStock ?? 1) <= 0) return null;

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <button className="btn" onClick={() => setIsOpen((current) => !current)} type="button">
        {isOpen ? "Cancelar" : "Solicitar reserva"}
      </button>
      {isOpen ? (
        <form className="card" onSubmit={submitReservation} style={{ display: "grid", gap: 10 }}>
          <strong>{productName}{variantName ? ` - ${variantName}` : ""}</strong>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Cantidad</span>
            <input
              max={availableStock ?? 99}
              min={1}
              onChange={(event) => setQuantity(Number(event.target.value))}
              required
              type="number"
              value={quantity}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Nota para la tienda (opcional)</span>
            <textarea maxLength={500} onChange={(event) => setNote(event.target.value)} rows={3} value={note} />
          </label>
          <button className="btn" disabled={isSaving} type="submit">
            {isSaving ? "Enviando..." : "Enviar solicitud"}
          </button>
        </form>
      ) : null}
      {message ? <p className="muted" role="status" style={{ margin: 0 }}>{message}</p> : null}
      {needsLogin ? (
        <Link className="btn btn-dark" href={`/panel/login?next=${encodeURIComponent(returnPath)}`}>Iniciar sesion</Link>
      ) : null}
    </div>
  );
}
