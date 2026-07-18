"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("Verificando enlace de recuperacion...");
  const [canReset, setCanReset] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function checkRecoverySession() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setCanReset(true);
        setMessage("Escribe una nueva contrasena para tu cuenta.");
        return;
      }

      setMessage("El enlace no es valido o ya vencio. Solicita uno nuevo.");
    }

    const timeout = window.setTimeout(() => void checkRecoverySession(), 400);
    return () => window.clearTimeout(timeout);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmation) {
      setMessage("Las contrasenas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Actualizando contrasena...");
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (error) {
      setMessage(`No se pudo actualizar la contrasena: ${error.message}`);
      return;
    }

    setMessage("Contrasena actualizada. Entrando al panel...");
    window.location.href = "/panel";
  }

  return (
    <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
      <p className="muted" style={{ margin: 0 }}>{message}</p>
      <input
        className="input"
        disabled={!canReset || isSubmitting}
        minLength={8}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Nueva contrasena"
        required
        type="password"
        value={password}
      />
      <input
        className="input"
        disabled={!canReset || isSubmitting}
        minLength={8}
        onChange={(event) => setConfirmation(event.target.value)}
        placeholder="Confirmar nueva contrasena"
        required
        type="password"
        value={confirmation}
      />
      <button className="btn" disabled={!canReset || isSubmitting} type="submit">
        {isSubmitting ? "Guardando..." : "Guardar nueva contrasena"}
      </button>
    </form>
  );
}
