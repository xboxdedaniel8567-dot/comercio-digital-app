"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AdminGuardProps = {
  children: ReactNode;
};

type AccessState = "checking" | "allowed" | "denied";

export function AdminGuard({ children }: AdminGuardProps) {
  const [accessState, setAccessState] = useState<AccessState>("checking");
  const [message, setMessage] = useState("Verificando tu acceso administrativo...");

  useEffect(() => {
    async function checkAdminAccess() {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData.user;

      if (userError || !user) {
        const next = encodeURIComponent(window.location.pathname);
        window.location.href = `/panel/login?next=${next}`;
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setMessage(`No se pudo verificar tu perfil: ${profileError.message}`);
        setAccessState("denied");
        return;
      }

      if (!profile || !["admin", "super_admin"].includes(profile.role)) {
        setMessage("Tu cuenta es de comerciante y no tiene acceso al panel administrativo.");
        setAccessState("denied");
        return;
      }

      setAccessState("allowed");
    }

    void checkAdminAccess();
  }, []);

  if (accessState === "checking") {
    return (
      <main className="shell">
        <section className="container" style={{ padding: "72px 0" }}>
          <div className="card">
            <strong>Comprobando permisos...</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              {message}
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (accessState === "denied") {
    return (
      <main className="shell">
        <section className="container" style={{ padding: "72px 0" }}>
          <div className="card">
            <p className="kicker">Acceso restringido</p>
            <h1 style={{ marginTop: 8 }}>Panel administrativo</h1>
            <p className="muted">{message}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Link className="btn" href="/panel">
                Ir al panel comerciante
              </Link>
              <Link className="btn btn-dark" href="/panel/login?next=/admin">
                Entrar con otra cuenta
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return children;
}
