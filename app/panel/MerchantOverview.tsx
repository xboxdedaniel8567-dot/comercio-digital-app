"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCurrentBusiness } from "@/lib/current-business";
import { getInventoryState } from "@/lib/inventory";
import { supabase } from "@/lib/supabase";

type Business = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string;
  address: string | null;
  whatsapp: string | null;
  status: string;
};

type ProductRow = {
  price: number | null;
  stock: number | null;
  status: string;
};

function businessStatusLabel(status: string) {
  if (status === "active") return "Activo";
  if (status === "draft") return "Oculto";
  if (status === "pending_review") return "Pendiente";
  if (status === "suspended") return "Suspendido";
  if (status === "rejected") return "Rechazado";
  return status;
}

export function MerchantOverview() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [pendingReservations, setPendingReservations] = useState(0);
  const [message, setMessage] = useState("Cargando resumen...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOverview() {
      const { business: businessRow, error: businessError } = await getCurrentBusiness();

      if (!businessRow) {
        setError(businessError || "No se pudo cargar la tienda de esta cuenta.");
        setMessage("");
        return;
      }

      const { data: productRows, error: productsError } = await supabase
        .from("products")
        .select("price, stock, status, businesses!inner(slug)")
        .eq("businesses.slug", businessRow.slug);

      if (productsError) {
        setError(productsError.message);
        setMessage("");
        return;
      }

      const reservationResult = await supabase
        .from("reservation_requests")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessRow.id)
        .eq("status", "pending");

      if (reservationResult.error) {
        setError(reservationResult.error.message);
        setMessage("");
        return;
      }

      setBusiness(businessRow as Business);
      setProducts((productRows ?? []) as ProductRow[]);
      setPendingReservations(reservationResult.count ?? 0);
      setMessage("");
    }

    void loadOverview();
  }, []);

  const stats = useMemo(() => {
    const active = products.filter((product) => product.status === "active").length;
    const lowStock = products.filter(
      (product) => getInventoryState(product.stock) === "low",
    ).length;
    const outOfStock = products.filter(
      (product) => getInventoryState(product.stock) === "out",
    ).length;

    return { active, lowStock, outOfStock, total: products.length };
  }, [products]);

  if (message) return <p className="muted">{message}</p>;

  if (error || !business) {
    return (
      <div className="card card-error">
        <strong>No se pudo cargar el resumen.</strong>
        <p className="muted">{error}</p>
      </div>
    );
  }

  const hasAlerts = pendingReservations > 0 || stats.lowStock > 0 || stats.outOfStock > 0;

  return (
    <div className="merchant-overview">
      {/* Identidad del comercio */}
      <section className="merchant-id-card panel">
        <div className="merchant-id-avatar" aria-hidden="true">
          {business.name.charAt(0).toUpperCase()}
        </div>
        <div className="merchant-id-info">
          <h2 className="merchant-id-name">{business.name}</h2>
          <span className={`merchant-store-state merchant-store-state-${business.status}`}>
            {businessStatusLabel(business.status)}
          </span>
        </div>
      </section>

      {/* Resumen breve — solo 3 numeros */}
      <section className="merchant-mini-stats">
        <article className="merchant-mini-stat">
          <strong>{stats.active}</strong>
          <span>Productos activos</span>
        </article>
        <article className="merchant-mini-stat">
          <strong>{pendingReservations}</strong>
          <span>Reservas pendientes</span>
        </article>
        <article className="merchant-mini-stat">
          <strong>{stats.lowStock + stats.outOfStock}</strong>
          <span>Alertas de stock</span>
        </article>
      </section>

      {/* Boton principal — una pantalla, una tarea */}
      <section className="merchant-primary-action">
        <Link className="btn merchant-primary-btn" href="/panel/productos/nuevo">
          + Anadir producto
        </Link>
      </section>

      {/* Alertas importantes — solo si las hay */}
      {hasAlerts ? (
        <section className="merchant-alerts">
          {pendingReservations > 0 ? (
            <Link className="merchant-alert-card" href="/panel/reservas">
              <span className="merchant-alert-badge merchant-alert-badge-warning">
                {pendingReservations}
              </span>
              <span className="merchant-alert-text">
                Reserva(s) nueva(s) esperando confirmacion
              </span>
            </Link>
          ) : null}
          {stats.lowStock > 0 ? (
            <Link className="merchant-alert-card" href="/panel/productos">
              <span className="merchant-alert-badge merchant-alert-badge-warning">
                {stats.lowStock}
              </span>
              <span className="merchant-alert-text">
                Producto(s) con pocas unidades
              </span>
            </Link>
          ) : null}
          {stats.outOfStock > 0 ? (
            <Link className="merchant-alert-card" href="/panel/productos">
              <span className="merchant-alert-badge merchant-alert-badge-danger">
                {stats.outOfStock}
              </span>
              <span className="merchant-alert-text">
                Producto(s) agotados
              </span>
            </Link>
          ) : null}
        </section>
      ) : null}

      {/* Acceso directo a la tienda publica */}
      {business.status === "active" ? (
        <section className="merchant-quick-links">
          <Link className="btn btn-dark" href={`/tiendas/${business.slug}`}>
            Ver tienda publica
          </Link>
          <Link className="btn btn-dark" href="/panel/tienda">
            Editar perfil
          </Link>
        </section>
      ) : null}
    </div>
  );
}
