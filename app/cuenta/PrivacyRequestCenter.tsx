"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/lib/supabase";

type PrivacyRequest = {
  id: string;
  request_type: string;
  details: string;
  status: string;
  admin_response: string | null;
  created_at: string;
};

const typeLabels: Record<string, string> = {
  access: "Consultar mis datos",
  correction: "Corregir mis datos",
  deletion: "Solicitar eliminacion",
  revoke_consent: "Revocar autorizacion",
};

const statusLabels: Record<string, string> = {
  received: "Recibida",
  in_review: "En revision",
  completed: "Atendida",
  rejected: "No procede",
};

function statusTone(status: string): "danger" | "info" | "success" | "warning" {
  if (status === "completed") return "success";
  if (status === "rejected") return "danger";
  if (status === "in_review") return "info";
  return "warning";
}

export function PrivacyRequestCenter() {
  const [requests, setRequests] = useState<PrivacyRequest[]>([]);
  const [requestType, setRequestType] = useState("access");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadRequests() {
    const { data, error } = await supabase
      .from("privacy_requests")
      .select("id, request_type, details, status, admin_response, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("No pudimos cargar tus solicitudes. Intenta nuevamente.");
      return;
    }

    setRequests((data ?? []) as PrivacyRequest[]);
  }

  useEffect(() => {
    void loadRequests();
  }, []);

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (details.trim().length < 10) {
      setMessage("Explica tu solicitud con al menos 10 caracteres.");
      return;
    }

    setIsSubmitting(true);
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user?.email) {
      setMessage("Debes iniciar sesion para enviar la solicitud.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("privacy_requests").insert({
      contact_email: user.email,
      details: details.trim(),
      request_type: requestType,
      user_id: user.id,
    });

    if (error) {
      setMessage(error.code === "23505"
        ? "Ya tienes una solicitud de este tipo pendiente. Espera su respuesta antes de crear otra."
        : "No pudimos enviar la solicitud. Revisa los datos e intenta nuevamente.");
      setIsSubmitting(false);
      return;
    }

    setDetails("");
    setMessage("Solicitud recibida correctamente.");
    await loadRequests();
    setIsSubmitting(false);
  }

  return (
    <section aria-labelledby="privacy-center">
      <h2 id="privacy-center">Privacidad y datos personales</h2>
      <p className="muted">
        Consulta, corrige o solicita la eliminacion de tus datos. Algunas solicitudes requieren verificar tu identidad antes de ser atendidas.
      </p>
      <form className="card" onSubmit={submitRequest} style={{ display: "grid", gap: 12, marginTop: 18 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Tipo de solicitud</span>
          <select onChange={(event) => setRequestType(event.target.value)} value={requestType}>
            {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Explica lo que necesitas</span>
          <textarea
            maxLength={2000}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Describe claramente los datos o la accion que solicitas."
            required
            rows={4}
            value={details}
          />
        </label>
        <button className="btn" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Enviando..." : "Enviar solicitud"}
        </button>
        {message ? <p className="muted" role="status" style={{ margin: 0 }}>{message}</p> : null}
        <p className="muted" style={{ margin: 0 }}>
          Consulta nuestra <Link href="/legal/privacidad">Politica de privacidad</Link> y la <Link href="/legal/tratamiento-datos">Politica de tratamiento de datos</Link>.
        </p>
      </form>

      <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
        {requests.map((request) => (
          <article className="card" key={request.id} style={{ display: "grid", gap: 8 }}>
            <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "space-between" }}>
              <strong>{typeLabels[request.request_type] ?? request.request_type}</strong>
              <StatusBadge label={statusLabels[request.status] ?? request.status} tone={statusTone(request.status)} />
            </div>
            <p className="muted" style={{ margin: 0 }}>{request.details}</p>
            <small className="muted">Enviada: {new Date(request.created_at).toLocaleString("es-CO")}</small>
            {request.admin_response ? <p style={{ margin: 0 }}><strong>Respuesta:</strong> {request.admin_response}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
