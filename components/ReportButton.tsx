"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

type ReportButtonProps = {
  targetId: string;
  targetName: string;
  targetType: "business" | "product";
  returnPath: string;
};

export function ReportButton({ targetId, targetName, targetType, returnPath }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("incorrect_information");
  const [details, setDetails] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setNeedsLogin(false);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setNeedsLogin(true);
      setMessage("Debes iniciar sesion para enviar un reporte.");
      setIsSaving(false);
      return;
    }

    const { error } = await supabase.from("marketplace_reports").insert({
      business_id: targetType === "business" ? targetId : null,
      details: details.trim(),
      product_id: targetType === "product" ? targetId : null,
      reason,
      reporter_id: userData.user.id,
      target_type: targetType,
    });

    if (error) {
      setMessage(`No se pudo enviar el reporte: ${error.message}`);
      setIsSaving(false);
      return;
    }

    setDetails("");
    setMessage("Reporte enviado. El equipo administrativo lo revisara.");
    setIsOpen(false);
    setIsSaving(false);
  }

  return (
    <div style={{ display: "grid", gap: 10, width: "100%" }}>
      <button className="btn btn-dark" onClick={() => setIsOpen((current) => !current)} type="button">
        {isOpen ? "Cancelar reporte" : "Reportar informacion"}
      </button>
      {isOpen ? (
        <form className="card" onSubmit={submitReport} style={{ display: "grid", gap: 10 }}>
          <strong>Reportar {targetName}</strong>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Motivo</span>
            <select onChange={(event) => setReason(event.target.value)} value={reason}>
              <option value="incorrect_information">Informacion incorrecta</option>
              <option value="unavailable">No esta disponible</option>
              <option value="misleading">Publicacion enganosa</option>
              <option value="prohibited">Producto o contenido prohibido</option>
              <option value="other">Otro motivo</option>
            </select>
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Explica lo ocurrido</span>
            <textarea
              maxLength={1000}
              minLength={10}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Escribe al menos 10 caracteres."
              required
              rows={4}
              value={details}
            />
          </label>
          <button className="btn" disabled={isSaving} type="submit">
            {isSaving ? "Enviando..." : "Enviar reporte"}
          </button>
        </form>
      ) : null}
      {message ? <p className="muted" role="status" style={{ margin: 0 }}>{message}</p> : null}
      {needsLogin ? (
        <Link className="btn" href={`/panel/login?next=${encodeURIComponent(returnPath)}`}>
          Iniciar sesion
        </Link>
      ) : null}
    </div>
  );
}

