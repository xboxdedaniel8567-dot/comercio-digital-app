"use client";

import { FormEvent, useEffect, useState } from "react";
import { resolvePostResetPath } from "@/lib/auth-redirects";
import { supabase } from "@/lib/supabase";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("Verificando enlace de recuperacion...");
  const [canReset, setCanReset] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifyRecoveryAccess() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (cancelled) return;

      if (sessionData.session) {
        setCanReset(true);
        setMessage("Escribe una nueva contrasena para tu cuenta.");
        return;
      }

      setMessage("El enlace no es valido o ya vencio. Solicita uno nuevo.");
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
        setCanReset(true);
        setMessage("Escribe una nueva contrasena para tu cuenta.");
      }
    });

    const timeout = window.setTimeout(() => void verifyRecoveryAccess(), 100);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      authListener.subscription.unsubscribe();
    };
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

    const { data: userData } = await supabase.auth.getUser();
    let redirectPath = "/panel";

    if (userData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .maybeSingle();
      redirectPath = resolvePostResetPath(profile?.role);
    }

    setMessage("Contrasena actualizada. Redirigiendo...");
    window.location.href = redirectPath;
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
