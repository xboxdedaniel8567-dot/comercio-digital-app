"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/lib/supabase";
import { firstRelation } from "@/lib/supabase-relations";

type ReportRow = {
  id: string;
  target_type: "business" | "product";
  reason: string;
  details: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  products: { name: string; slug: string } | null;
  businesses: { name: string; slug: string } | null;
};

const reasonLabels: Record<string, string> = {
  incorrect_information: "Informacion incorrecta",
  misleading: "Publicacion enganosa",
  other: "Otro motivo",
  prohibited: "Contenido prohibido",
  unavailable: "No esta disponible",
};

const statusLabels: Record<string, string> = {
  dismissed: "Descartado",
  open: "Abierto",
  resolved: "Resuelto",
  under_review: "En revision",
};

export function AdminReportsManager() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [message, setMessage] = useState("Cargando reportes...");

  async function loadReports() {
    const { data, error } = await supabase
      .from("marketplace_reports")
      .select("id, target_type, reason, details, status, admin_note, created_at, products(name, slug), businesses(name, slug)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      setMessage("No pudimos cargar los reportes. Intenta nuevamente.");
      return;
    }

    setReports(
      (data ?? []).map((report) => ({
        ...report,
        businesses: firstRelation(report.businesses),
        products: firstRelation(report.products),
      })),
    );
    setMessage("");
  }

  useEffect(() => {
    void loadReports();
  }, []);

  async function updateReport(reportId: string, status: string, adminNote: string) {
    const { error } = await supabase
      .from("marketplace_reports")
      .update({
        admin_note: adminNote.trim() || null,
        resolved_at: ["resolved", "dismissed"].includes(status) ? new Date().toISOString() : null,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (error) {
      setMessage("No pudimos actualizar el reporte. Intenta nuevamente.");
      return;
    }

    await loadReports();
  }

  if (message && reports.length === 0) return <p className="muted">{message}</p>;

  return (
    <div className="admin-workspace">
      <section className="admin-toolbar panel"><div><span className="eyebrow">Confianza y seguridad</span><h2>{reports.length} reportes recibidos</h2><p className="muted">Revisa primero los casos abiertos y documenta cada decision.</p></div></section>
      {message ? <p className="muted" role="status">{message}</p> : null}
      {reports.map((report) => {
        const target = report.target_type === "product" ? report.products : report.businesses;
        const targetPath = report.target_type === "product"
          ? `/productos/${report.products?.slug ?? ""}`
          : `/tiendas/${report.businesses?.slug ?? ""}`;

        return (
          <ReportReviewCard
            key={report.id}
            onSave={updateReport}
            report={report}
            targetName={target?.name ?? "Publicacion no disponible"}
            targetPath={targetPath}
          />
        );
      })}
      {reports.length === 0 ? <p className="muted">No hay reportes registrados.</p> : null}
    </div>
  );
}

function ReportReviewCard({
  onSave,
  report,
  targetName,
  targetPath,
}: {
  onSave: (id: string, status: string, note: string) => Promise<void>;
  report: ReportRow;
  targetName: string;
  targetPath: string;
}) {
  const [status, setStatus] = useState(report.status);
  const [note, setNote] = useState(report.admin_note ?? "");
  const [isSaving, setIsSaving] = useState(false);

  return (
    <article className="admin-review-card panel">
      <div className="admin-review-heading">
        <div>
          <p className="kicker">{reasonLabels[report.reason] ?? report.reason}</p>
          <h2>{targetName}</h2>
          <p className="muted">{report.details}</p>
        </div>
        <StatusBadge label={statusLabels[report.status] ?? report.status} tone={report.status === "resolved" ? "success" : report.status === "dismissed" ? "neutral" : report.status === "under_review" ? "info" : "warning"} />
      </div>
      <Link className="text-action" href={targetPath}>Abrir publicacion</Link>
      <div className="admin-review-form">
      <label className="merchant-field">
        <span>Estado</span>
        <select onChange={(event) => setStatus(event.target.value)} value={status}>
          <option value="open">Abierto</option>
          <option value="under_review">En revision</option>
          <option value="resolved">Resuelto</option>
          <option value="dismissed">Descartado</option>
        </select>
      </label>
      <label className="merchant-field">
        <span>Nota administrativa</span>
        <textarea maxLength={1000} onChange={(event) => setNote(event.target.value)} rows={3} value={note} />
      </label>
      </div>
      <button
        className="btn"
        disabled={isSaving}
        onClick={async () => {
          setIsSaving(true);
          await onSave(report.id, status, note);
          setIsSaving(false);
        }}
        type="button"
      >
        {isSaving ? "Guardando..." : "Guardar revision"}
      </button>
    </article>
  );
}
