"use client";

import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/panel/login?next=${next}`;
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (error || !profile) {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/panel/login?next=${next}`;
        return;
      }

      if (profile.role === "buyer") {
        window.location.href = "/cuenta";
        return;
      }

      if (["admin", "super_admin"].includes(profile.role)) {
        window.location.href = "/admin";
        return;
      }

      setIsChecking(false);
    }

    void checkSession();
  }, []);

  if (isChecking) {
    return (
      <div className="card">
        <strong>Verificando sesion...</strong>
        <p className="muted">Un momento mientras validamos tu acceso.</p>
      </div>
    );
  }

  return children;
}
