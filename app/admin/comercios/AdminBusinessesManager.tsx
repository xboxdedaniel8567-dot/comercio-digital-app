"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BusinessModerationActions } from "@/components/BusinessModerationActions";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/lib/supabase";

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  city: string;
  address: string | null;
  whatsapp: string | null;
  categories: {
    name: string;
  } | null;
};

function statusLabel(status: string) {
  if (status === "active") return "Activo";
  if (status === "draft") return "Borrador";
  if (status === "pending_review") return "Pendiente";
  if (status === "suspended") return "Suspendido";
  if (status === "rejected") return "Rechazado";
  return status;
}

function statusTone(status: string): "danger" | "info" | "neutral" | "success" | "warning" {
  if (status === "active") return "success";
  if (status === "pending_review") return "warning";
  if (status === "suspended" || status === "rejected") return "danger";
  if (status === "draft") return "neutral";
  return "info";
}

export function AdminBusinessesManager() {
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("Cargando todos los comercios...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBusinesses() {
      const { data, error: loadError } = await supabase
        .from("businesses")
        .select("id, name, slug, status, city, address, whatsapp, categories(name)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (loadError) {
        setError(loadError.message);
        setMessage("");
        return;
      }

      setBusinesses((data ?? []) as BusinessRow[]);
      setMessage("");
    }

    void loadBusinesses();
  }, []);

  if (message) {
    return <p className="muted">{message}</p>;
  }

  const visibleBusinesses = businesses.filter((business) => {
    const matchesQuery = `${business.name} ${business.city} ${business.categories?.name ?? ""}`
      .toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (statusFilter === "all" || business.status === statusFilter);
  });

  return (
    <div className="admin-workspace">
      <section className="admin-toolbar panel">
        <div><span className="eyebrow">Directorio interno</span><h2>{businesses.length} comercios registrados</h2></div>
        <div className="admin-toolbar-controls">
          <label><span className="sr-only">Buscar comercios</span><input className="input" onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, ciudad o categoria" value={query} /></label>
          <label><span className="sr-only">Filtrar por estado</span><select className="input" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option value="all">Todos los estados</option><option value="pending_review">Pendientes</option><option value="active">Activos</option><option value="suspended">Suspendidos</option><option value="rejected">Rechazados</option></select></label>
        </div>
      </section>
      {error ? (
        <div className="card" style={{ borderColor: "#ef4444" }}>
          <strong>No se pudieron cargar los comercios.</strong>
          <p className="muted">{error}</p>
        </div>
      ) : null}
      <div className="admin-record-list">
      {visibleBusinesses.map((business) => (
        <article className="admin-business-row" key={business.id}>
          <div className="admin-record-copy">
            <div className="admin-record-title"><strong>{business.name}</strong><StatusBadge label={statusLabel(business.status)} tone={statusTone(business.status)} /></div>
            <p className="muted">
              {business.categories?.name ?? "Sin categoria"} - {business.city}
            </p>
            <p className="muted">
              {business.address ?? "Direccion pendiente"}
            </p>
            <p className="muted">
              WhatsApp: {business.whatsapp ?? "Pendiente"}
            </p>
          </div>
          <div className="admin-business-actions">
            {business.status === "active" ? (
              <Link className="btn btn-dark" href={`/tiendas/${business.slug}`}>
                Ver tienda
              </Link>
            ) : null}
            <BusinessModerationActions
              businessId={business.id}
              currentStatus={business.status}
            />
          </div>
        </article>
      ))}
      </div>
      {!error && businesses.length === 0 ? (
        <p className="muted">Todavia no hay comercios registrados.</p>
      ) : null}
      {!error && businesses.length > 0 && visibleBusinesses.length === 0 ? <div className="admin-empty panel"><strong>No encontramos comercios con esos filtros.</strong><button className="btn btn-dark" onClick={() => { setQuery(""); setStatusFilter("all"); }} type="button">Limpiar filtros</button></div> : null}
    </div>
  );
}
