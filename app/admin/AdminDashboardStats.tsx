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
    ["Comercios totales", stats.businesses_total],
    ["Activos", stats.businesses_active],
    ["Pendientes", stats.businesses_pending],
    ["Suspendidos", stats.businesses_suspended],
    ["Rechazados", stats.businesses_rejected],
    ["Productos totales", stats.products_total],
    ["Productos activos", stats.products_active],
    ["Busquedas", stats.searches_total],
    ["Contactos WhatsApp", stats.contacts_total],
    ["Reportes abiertos", openReports],
  ];

  return (
    <>
      <div className="grid-auto">
        {cards.map(([label, value]) => (
          <div className="card" key={label}>
            <p className="muted">{label}</p>
            <strong style={{ fontSize: "1.6rem" }}>{value}</strong>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Prioridad operativa</h2>
        <p className="muted">
          {openReports > 0
            ? `Hay ${openReports} reporte(s) abierto(s) que necesitan revision.`
            : stats.businesses_pending > 0
            ? `Hay ${stats.businesses_pending} comercio(s) esperando revision.`
            : "No hay comercios pendientes. Revisa ahora la calidad de los catalogos activos."}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
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
      </div>
    </>
  );
}
