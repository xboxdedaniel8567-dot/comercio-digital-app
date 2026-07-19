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

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function businessStatusLabel(status: string) {
  if (status === "active") return "Activa";
  if (status === "draft") return "Borrador";
  if (status === "pending_review") return "Pendiente";
  if (status === "suspended") return "Suspendida";
  if (status === "rejected") return "Rechazada";
  return status;
}

export function MerchantOverview() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [contactClicks, setContactClicks] = useState(0);
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

      const [contactResult, reservationResult] = await Promise.all([
        supabase
          .from("contact_events")
          .select("*", { count: "exact", head: true })
          .eq("business_id", businessRow.id),
        supabase
          .from("reservation_requests")
          .select("*", { count: "exact", head: true })
          .eq("business_id", businessRow.id)
          .eq("status", "pending"),
      ]);

      if (contactResult.error || reservationResult.error) {
        setError(contactResult.error?.message || reservationResult.error?.message || "No se pudieron cargar las metricas.");
        setMessage("");
        return;
      }

      setBusiness(businessRow as Business);
      setProducts((productRows ?? []) as ProductRow[]);
      setContactClicks(contactResult.count ?? 0);
      setPendingReservations(reservationResult.count ?? 0);
      setMessage("");
    }

    void loadOverview();
  }, []);

  const stats = useMemo(() => {
    const active = products.filter((product) => product.status === "active").length;
    const hidden = products.filter((product) => product.status !== "active").length;
    const lowStock = products.filter(
      (product) => getInventoryState(product.stock) === "low",
    ).length;
    const outOfStock = products.filter(
      (product) => getInventoryState(product.stock) === "out",
    ).length;
    const inventoryValue = products.reduce((total, product) => {
      return total + (product.price ?? 0) * (product.stock ?? 0);
    }, 0);

    const completedFields = [
      business?.name,
      business?.description,
      business?.city,
      business?.address,
      business?.whatsapp,
      products.length > 0 ? "products" : "",
    ].filter(Boolean).length;

    return {
      active,
      completion: Math.round((completedFields / 6) * 100),
      hidden,
      inventoryValue,
      lowStock,
      outOfStock,
      total: products.length,
    };
  }, [business, products]);

  if (message) {
    return <p className="muted">{message}</p>;
  }

  if (error || !business) {
    return (
      <div className="card" style={{ borderColor: "#ef4444" }}>
        <strong>No se pudo cargar el resumen.</strong>
        <p className="muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="merchant-overview">
      <section className="merchant-welcome panel">
        <div>
          <p className="kicker">Resumen de hoy</p>
          <h2>{business.name}</h2>
          <p>Controla el catalogo, las reservas y el estado de tu tienda desde un solo lugar.</p>
        </div>
        <span className={`merchant-store-state merchant-store-state-${business.status}`}>
          {businessStatusLabel(business.status)}
        </span>
      </section>

      <section aria-labelledby="merchant-metrics-title">
        <div className="merchant-section-heading">
          <div>
            <p className="kicker">Indicadores</p>
            <h2 id="merchant-metrics-title">Estado del negocio</h2>
          </div>
          <Link href="/panel/estadisticas">Ver estadisticas</Link>
        </div>
        <div className="merchant-stat-grid">
          {[
            ["Perfil completo", `${stats.completion}%`, "Completa los datos que ven tus clientes"],
            ["Productos activos", String(stats.active), `${stats.total} productos en total`],
            ["Reservas pendientes", String(pendingReservations), "Solicitudes por responder"],
            ["Contactos WhatsApp", String(contactClicks), "Interes generado por tu catalogo"],
            ["Pocas unidades", String(stats.lowStock), `${stats.outOfStock} productos agotados`],
            ["Valor del inventario", formatMoney(stats.inventoryValue), "Precio por unidades registradas"],
          ].map(([label, value, detail]) => (
            <article className="merchant-stat-card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="merchant-next-action panel">
        <div>
          <p className="kicker">Prioridad operativa</p>
          <h2>Siguiente accion recomendada</h2>
        </div>
        <p className="muted">
          {pendingReservations > 0
            ? `Tienes ${pendingReservations} reserva(s) nueva(s) esperando confirmacion.`
            : business.status === "pending_review"
            ? "Tu tienda esta en revision. Puedes completar el perfil y cargar productos mientras el equipo administrativo valida la informacion."
            : business.status === "suspended"
              ? "La tienda esta suspendida y no aparece publicamente. Contacta al equipo administrativo para revisar el caso."
              : business.status === "rejected"
                ? "La solicitud fue rechazada. Revisa los datos del negocio y contacta al equipo administrativo antes de solicitar otra revision."
                : stats.total < 10
                  ? "Publica al menos 10 productos con foto, precio y descripcion para que tu tienda tenga mejor presencia en las busquedas."
                  : "Revisa los productos ocultos y manten actualizado el stock para evitar consultas por productos no disponibles."}
        </p>
        <div className="merchant-action-row">
          {pendingReservations > 0 ? (
            <Link className="btn" href="/panel/reservas">
              Revisar reservas
            </Link>
          ) : null}
          <Link className="btn" href="/panel/productos/nuevo">
            Crear producto
          </Link>
          <Link className="btn btn-dark" href="/panel/tienda">
            Editar tienda
          </Link>
          {business.status === "active" ? (
            <Link className="btn btn-dark" href={`/tiendas/${business.slug}`}>
              Ver tienda publica
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
