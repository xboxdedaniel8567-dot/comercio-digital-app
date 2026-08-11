"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentBusiness } from "@/lib/current-business";
import { supabase } from "@/lib/supabase";
import { firstRelation } from "@/lib/supabase-relations";
import { StatusBadge } from "@/components/StatusBadge";

type ReservationRow = {
  id: string;
  buyer_name: string;
  buyer_phone: string;
  quantity: number;
  buyer_note: string | null;
  status: string;
  merchant_note: string | null;
  created_at: string;
  products: { name: string; slug: string } | null;
  product_variants: { name: string } | null;
};

const statusLabels: Record<string, string> = {
  cancelled: "Cancelada",
  completed: "Completada",
  confirmed: "Confirmada",
  expired: "Vencida",
  pending: "Pendiente",
  rejected: "Rechazada",
};

function statusTone(status: string) {
  if (["confirmed", "completed"].includes(status)) return "success" as const;
  if (["rejected", "cancelled"].includes(status)) return "danger" as const;
  if (status === "pending") return "warning" as const;
  if (status === "expired") return "neutral" as const;
  return "info" as const;
}

export function MerchantReservations() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [message, setMessage] = useState("Cargando reservas...");

  async function loadReservations() {
    const { business, error: businessError } = await getCurrentBusiness();
    if (!business) {
      setMessage(businessError || "No se encontro la tienda de esta cuenta.");
      return;
    }

    const { data, error } = await supabase
      .from("reservation_requests")
      .select("id, buyer_name, buyer_phone, quantity, buyer_note, status, merchant_note, created_at, products(name, slug), product_variants(name)")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      setMessage(`No se pudieron cargar las reservas: ${error.message}`);
      return;
    }

    setReservations(
      (data ?? []).map((reservation) => ({
        ...reservation,
        products: firstRelation(reservation.products),
        product_variants: firstRelation(reservation.product_variants),
      })),
    );
    setMessage("");
  }

  useEffect(() => {
    void loadReservations();
  }, []);

  async function updateReservation(id: string, status: string, note: string) {
    const { error } = await supabase.rpc("update_reservation_status", {
      p_merchant_note: note,
      p_reservation_id: id,
      p_status: status,
    });

    if (error) {
      setMessage(`No se pudo actualizar la reserva: ${error.message}`);
      return;
    }

    await loadReservations();
  }

  if (message && reservations.length === 0) return <p className="muted">{message}</p>;

  const pendingCount = reservations.filter((reservation) => reservation.status === "pending").length;
  const confirmedCount = reservations.filter((reservation) => reservation.status === "confirmed").length;

  return (
    <div className="merchant-reservations">
      <div className="merchant-section-heading">
        <div>
          <p className="kicker">Atencion al cliente</p>
          <h2>Solicitudes de reserva</h2>
          <p>Confirma disponibilidad y responde antes de que el comprador visite la tienda.</p>
        </div>
      </div>
      {reservations.length > 0 ? (
        <div className="merchant-inventory-summary">
          <div className="merchant-inventory-summary-card"><span>Total</span><strong>{reservations.length}</strong></div>
          <div className="merchant-inventory-summary-card"><span>Pendientes</span><strong>{pendingCount}</strong></div>
          <div className="merchant-inventory-summary-card"><span>Confirmadas</span><strong>{confirmedCount}</strong></div>
        </div>
      ) : null}
      {message ? <p className="muted" role="status">{message}</p> : null}
      <div className="merchant-reservation-list">
        {reservations.map((reservation) => (
          <MerchantReservationCard key={reservation.id} onSave={updateReservation} reservation={reservation} />
        ))}
      </div>
      {reservations.length === 0 ? <p className="muted">Todavia no hay solicitudes de reserva.</p> : null}
    </div>
  );
}

function MerchantReservationCard({
  onSave,
  reservation,
}: {
  onSave: (id: string, status: string, note: string) => Promise<void>;
  reservation: ReservationRow;
}) {
  const [status, setStatus] = useState(reservation.status);
  const [note, setNote] = useState(reservation.merchant_note ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const whatsappMessage = encodeURIComponent(
    `Hola ${reservation.buyer_name}, te escribimos por tu solicitud de reserva de ${reservation.products?.name ?? "un producto"} en Comercio Digital.`,
  );

  return (
    <article className="merchant-reservation-card panel">
      <div className="merchant-reservation-summary">
        <div>
          <StatusBadge
            label={statusLabels[reservation.status] ?? reservation.status}
            tone={statusTone(reservation.status)}
          />
          <h3>{reservation.products?.name ?? "Producto no disponible"}</h3>
          {reservation.product_variants?.name ? <p className="muted">Variante: {reservation.product_variants.name}</p> : null}
          <p style={{ marginBottom: 4 }}>Cantidad: {reservation.quantity}</p>
          <p className="muted" style={{ margin: 0 }}>Comprador: {reservation.buyer_name}</p>
          {reservation.buyer_note ? <p className="muted">Nota: {reservation.buyer_note}</p> : null}
        </div>
        <a className="btn" href={`https://wa.me/${reservation.buyer_phone}?text=${whatsappMessage}`} rel="noreferrer" target="_blank">
          Escribir por WhatsApp
        </a>
      </div>
      <div className="merchant-reservation-form">
      {reservation.products?.slug ? <Link className="btn btn-dark" href={`/productos/${reservation.products.slug}`}>Ver producto</Link> : null}
      <label>
        <span>Estado</span>
        <select onChange={(event) => setStatus(event.target.value)} value={status}>
          <option value="pending">Pendiente</option>
          <option value="confirmed">Confirmada</option>
          <option value="rejected">Rechazada</option>
          <option value="completed">Completada</option>
          <option value="cancelled">Cancelada</option>
          <option value="expired">Vencida</option>
        </select>
      </label>
      <label>
        <span>Respuesta para el comprador</span>
        <textarea maxLength={500} onChange={(event) => setNote(event.target.value)} rows={3} value={note} />
      </label>
      <button
        className="btn"
        disabled={isSaving}
        onClick={async () => {
          setIsSaving(true);
          await onSave(reservation.id, status, note);
          setIsSaving(false);
        }}
        type="button"
      >
        {isSaving ? "Guardando..." : "Guardar estado"}
      </button>
      </div>
    </article>
  );
}
