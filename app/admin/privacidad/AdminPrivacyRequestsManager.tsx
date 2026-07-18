"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/lib/supabase";

type PrivacyRequest = {
  id: string;
  contact_email: string;
  request_type: string;
  details: string;
  status: string;
  admin_response: string | null;
  created_at: string;
};

const typeLabels: Record<string, string> = {
  access: "Consulta de datos",
  correction: "Correccion de datos",
  deletion: "Eliminacion de datos",
  revoke_consent: "Revocacion de autorizacion",
};

const statusLabels: Record<string, string> = {
  received: "Recibida",
  in_review: "En revision",
  completed: "Atendida",
  rejected: "No procede",
};

export function AdminPrivacyRequestsManager() {
  const [requests, setRequests] = useState<PrivacyRequest[]>([]);
  const [message, setMessage] = useState("Cargando solicitudes...");

  async function loadRequests() {
    const { data, error } = await supabase
      .from("privacy_requests")
      .select("id, contact_email, request_type, details, status, admin_response, created_at")
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) {
      setMessage(`No se pudieron cargar las solicitudes: ${error.message}`);
      return;
    }

    setRequests((data ?? []) as PrivacyRequest[]);
    setMessage("");
  }

  useEffect(() => {
    void loadRequests();
  }, []);

  async function updateRequest(id: string, status: string, response: string) {
    const { error } = await supabase
      .from("privacy_requests")
      .update({
        admin_response: response.trim() || null,
        resolved_at: ["completed", "rejected"].includes(status) ? new Date().toISOString() : null,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      setMessage(`No se pudo actualizar la solicitud: ${error.message}`);
      return;
    }

    await loadRequests();
  }

  if (message && requests.length === 0) return <p className="muted">{message}</p>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card">
        <strong>Proceso responsable</strong>
        <p className="muted" style={{ marginBottom: 0 }}>
          Verifica la identidad antes de entregar, corregir o eliminar datos. Registra siempre la respuesta final.
        </p>
      </div>
      {message ? <p className="muted" role="status">{message}</p> : null}
      {requests.map((request) => (
        <PrivacyReviewCard key={request.id} onSave={updateRequest} request={request} />
      ))}
      {requests.length === 0 ? <p className="muted">No hay solicitudes de privacidad.</p> : null}
    </div>
  );
}

function PrivacyReviewCard({
  onSave,
  request,
}: {
  onSave: (id: string, status: string, response: string) => Promise<void>;
  request: PrivacyRequest;
}) {
  const [status, setStatus] = useState(request.status);
  const [response, setResponse] = useState(request.admin_response ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const tone = request.status === "completed" ? "success"
    : request.status === "rejected" ? "danger"
      : request.status === "in_review" ? "info" : "warning";

  return (
    <article className="card" style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
        <div>
          <p className="kicker" style={{ marginTop: 0 }}>{typeLabels[request.request_type] ?? request.request_type}</p>
          <strong>{request.contact_email}</strong>
        </div>
        <StatusBadge label={statusLabels[request.status] ?? request.status} tone={tone} />
      </div>
      <p className="muted" style={{ margin: 0 }}>{request.details}</p>
      <small className="muted">Recibida: {new Date(request.created_at).toLocaleString("es-CO")}</small>
      <label style={{ display: "grid", gap: 6 }}>
        <span>Estado</span>
        <select onChange={(event) => setStatus(event.target.value)} value={status}>
          <option value="received">Recibida</option>
          <option value="in_review">En revision</option>
          <option value="completed">Atendida</option>
          <option value="rejected">No procede</option>
        </select>
      </label>
      <label style={{ display: "grid", gap: 6 }}>
        <span>Respuesta al titular</span>
        <textarea maxLength={2000} onChange={(event) => setResponse(event.target.value)} rows={4} value={response} />
      </label>
      <button
        className="btn"
        disabled={isSaving}
        onClick={async () => {
          setIsSaving(true);
          await onSave(request.id, status, response);
          setIsSaving(false);
        }}
        type="button"
      >
        {isSaving ? "Guardando..." : "Guardar respuesta"}
      </button>
    </article>
  );
}
