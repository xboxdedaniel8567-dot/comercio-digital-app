"use client";

import { useEffect, useRef, useState } from "react";
import { resolveAuthenticatedEntryPath } from "@/lib/auth-redirects";
import { supabase } from "@/lib/supabase";

export function AccountTypeOnboarding() {
  const [message, setMessage] = useState("Verificando tu cuenta...");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasCheckedAccount = useRef(false);

  useEffect(() => {
    async function checkAccount() {
      if (hasCheckedAccount.current) return;
      hasCheckedAccount.current = true;

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        window.location.href = "/panel/login";
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (error) {
        setMessage(`No se pudo verificar tu cuenta: ${error.message}`);
        return;
      }

      if (profile) {
        window.location.href = resolveAuthenticatedEntryPath(profile.role, true, null);
        return;
      }

      setMessage("");
    }

    void checkAccount();
  }, []);

  async function continueAsBuyer() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage("Preparando tu cuenta de cliente...");

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setIsSubmitting(false);
      setMessage("Tu sesion no esta disponible. Inicia sesion nuevamente.");
      return;
    }

    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        ...userData.user.user_metadata,
        account_type: "buyer",
      },
    });

    if (metadataError) {
      setIsSubmitting(false);
      setMessage(`No se pudo guardar tu eleccion: ${metadataError.message}`);
      return;
    }

    const { error } = await supabase.rpc("complete_oauth_onboarding", {
      p_account_type: "buyer",
    });

    if (error) {
      setIsSubmitting(false);
      setMessage(`No se pudo completar tu cuenta: ${error.message}`);
      return;
    }

    window.location.href = "/cuenta";
  }

  function continueAsMerchant() {
    if (isSubmitting) return;
    window.location.href = "/panel/registro?oauth=1";
  }

  return (
    <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
      <section className="card" style={{ display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Cliente</h2>
        <p className="muted" style={{ margin: 0 }}>
          Busca productos, guarda favoritos y solicita reservas en comercios locales.
        </p>
        <button className="btn" disabled={isSubmitting || Boolean(message)} onClick={() => void continueAsBuyer()} type="button">
          Continuar como cliente
        </button>
      </section>
      <section className="card" style={{ display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Comerciante</h2>
        <p className="muted" style={{ margin: 0 }}>
          Registra tu negocio. La tienda quedara pendiente de revision antes de publicarse.
        </p>
        <button className="btn btn-dark" disabled={isSubmitting || Boolean(message)} onClick={continueAsMerchant} type="button">
          Registrar mi comercio
        </button>
      </section>
      {message ? <p className="muted" style={{ gridColumn: "1 / -1", margin: 0 }}>{message}</p> : null}
    </div>
  );
}
