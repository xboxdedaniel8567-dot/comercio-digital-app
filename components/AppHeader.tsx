"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { InstallAppButton } from "./InstallAppButton";

type AccountLink = {
  href: string;
  label: string;
};

export function AppHeader() {
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [accountLink, setAccountLink] = useState<AccountLink>({
    href: "/panel/login",
    label: "Iniciar sesion",
  });

  useEffect(() => {
    async function loadUnreadNotifications() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setUnreadNotifications(0);
        return;
      }

      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .is("read_at", null);

      setUnreadNotifications(count ?? 0);
    }

    async function loadAccountLink() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setAccountLink({ href: "/panel/login", label: "Iniciar sesion" });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile?.role === "buyer") {
        setAccountLink({ href: "/cuenta", label: "Mi cuenta" });
        return;
      }

      if (["admin", "super_admin"].includes(profile?.role ?? "")) {
        setAccountLink({ href: "/admin", label: "Admin" });
        return;
      }

      setAccountLink({ href: "/panel", label: "Panel" });
    }

    void loadAccountLink();
    void loadUnreadNotifications();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      void loadAccountLink();
      void loadUnreadNotifications();
    });

    window.addEventListener("notifications-updated", loadUnreadNotifications);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("notifications-updated", loadUnreadNotifications);
    };
  }, []);

  return (
    <header
      className="app-header container"
      style={{
        display: "flex",
        minHeight: 78,
        alignItems: "center",
        justifyContent: "space-between",
        gap: 18,
      }}
    >
      <Link href="/" style={{ display: "grid", gap: 2 }}>
        <strong style={{ fontSize: "1.05rem", letterSpacing: "-0.02em" }}>
          Comercio Digital
        </strong>
        <span className="muted" style={{ fontSize: "0.78rem" }}>
          by Gregor Magnus
        </span>
      </Link>
      <nav className="app-header-nav" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <Link className="muted" href="/buscar">
          Buscar
        </Link>
        <Link className="muted" href="/comerciantes">
          Comerciantes
        </Link>
        {accountLink.label !== "Iniciar sesion" ? (
          <Link className="muted" href="/notificaciones">
            Avisos{unreadNotifications > 0 ? ` (${unreadNotifications})` : ""}
          </Link>
        ) : null}
        <Link className="muted" href={accountLink.href}>
          {accountLink.label}
        </Link>
        <InstallAppButton />
      </nav>
    </header>
  );
}
