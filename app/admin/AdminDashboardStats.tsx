"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AdminStats = {
  businesses_total: number;
  businesses_active: number;
  businesses_pending: number;
  businesses_suspended: number;
  businesses_rejected: number;
  products_total: number;
  products_active: number;
  searches_total: number;
  contacts_total: number;
};

const emptyStats: AdminStats = {
  businesses_total: 0,
  businesses_active: 0,
  businesses_pending: 0,
  businesses_suspended: 0,
  businesses_rejected: 0,
  products_total: 0,
  products_active: 0,
  searches_total: 0,
  contacts_total: 0,
};

export function AdminDashboardStats() {
  const [stats, setStats] = useState<AdminStats>(emptyStats);
  const [openReports, setOpenReports] = useState(0);
  const [message, setMessage] = useState("Cargando metricas administrativas...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      const [statsResult, reportsResult] = await Promise.all([
        supabase.rpc("get_admin_dashboard_stats"),
        supabase
          .from("marketplace_reports")
          .select("*", { count: "exact", head: true })
          .in("status", ["open", "under_review"]),
      ]);

      if (statsResult.error || reportsResult.error) {
        setError(statsResult.error?.message || reportsResult.error?.message || "No se pudieron cargar las metricas.");
        setMessage("");
        return;
      }

      setStats({ ...emptyStats, ...((statsResult.data ?? {}) as Partial<AdminStats>) });
      setOpenReports(reportsResult.count ?? 0);
      setMessage("");
    }

    void loadStats();
  }, []);

  if (message) {
    return <p className="muted">{message}</p>;
  }

  if (error) {
    return (
      <div className="card" style={{ borderColor: "#ef4444" }}>
        <strong>No se pudieron cargar las metricas.</strong>
        <p className="muted" style={{ marginBottom: 0 }}>{error}</p>
      </div>
    );
  }

  const cards = [
    ["Comercios", stats.businesses_total, "Registrados en la plataforma"],
    ["Productos", stats.products_total, `${stats.products_active} visibles en el marketplace`],
    ["Busquedas", stats.searches_total, "Intenciones de compra registradas"],
    ["WhatsApp", stats.contacts_total, "Contactos enviados a comercios"],
  ];

  return (
    <>
      <section className="admin-overview-intro panel">
        <div>
          <span className="eyebrow">Estado general</span>
          <h2>Operacion del marketplace</h2>
          <p className="muted">Supervisa oferta, actividad y asuntos que necesitan una decision del equipo.</p>
        </div>
        <span className={openReports || stats.businesses_pending ? "status-badge status-badge-warning" : "status-badge status-badge-success"}>
          {openReports || stats.businesses_pending ? "Requiere atencion" : "Operacion estable"}
        </span>
      </section>
      <div className="admin-metric-grid">
        {cards.map(([label, value, detail]) => (
          <article className="admin-metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>
          </article>
        ))}
      </div>
      <div className="admin-operations-grid">
      <section className="admin-priority-card panel">
        <span className="eyebrow">Siguiente accion</span>
        <h2>Prioridad operativa</h2>
        <p className="muted">
          {openReports > 0
            ? `Hay ${openReports} reporte(s) abierto(s) que necesitan revision.`
            : stats.businesses_pending > 0
            ? `Hay ${stats.businesses_pending} comercio(s) esperando revision.`
            : "No hay comercios pendientes. Revisa ahora la calidad de los catalogos activos."}
        </p>
        <div className="admin-action-row">
          {openReports > 0 ? (
            <Link className="btn" href="/admin/reportes">
              Revisar reportes
            </Link>
          ) : null}
          <Link className="btn" href="/admin/comercios">
            Revisar comercios
          </Link>
          <Link className="btn btn-dark" href="/admin/calidad">
            Revisar calidad
          </Link>
        </div>
      </section>
      <section className="admin-state-summary panel">
        <div><span>Comercios activos</span><strong>{stats.businesses_active}</strong></div>
        <div><span>Pendientes</span><strong>{stats.businesses_pending}</strong></div>
        <div><span>Suspendidos</span><strong>{stats.businesses_suspended}</strong></div>
        <div><span>Rechazados</span><strong>{stats.businesses_rejected}</strong></div>
      </section>
      </div>
    </>
  );
}
