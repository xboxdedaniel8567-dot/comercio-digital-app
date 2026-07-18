"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { InstallAppButton } from "./InstallAppButton";

type AccountLink = {
  href: string;
  label: string;
};

type MobileNavLink = {
  href: string;
  label: string;
};

export function AppHeader() {
  const pathname = usePathname();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [accountLink, setAccountLink] = useState<AccountLink>({
    href: "/panel/login",
    label: "Iniciar sesion",
  });

  const isInternalArea = pathname.startsWith("/panel") || pathname.startsWith("/admin");
  const isAuthFlow = pathname.startsWith("/cuenta/registro") || pathname.startsWith("/panel/");
  const showMobilePublicNavigation = !isInternalArea && !isAuthFlow;
  const favoritesHref = accountLink.label === "Mi cuenta" ? "/cuenta" : "/panel/login?next=/cuenta";

  const mobileLinks: MobileNavLink[] = [
    { href: "/", label: "Inicio" },
    { href: "/buscar", label: "Buscar" },
    { href: "/comerciantes", label: "Tiendas" },
    { href: favoritesHref, label: "Favoritos" },
    { href: accountLink.href, label: accountLink.label === "Iniciar sesion" ? "Cuenta" : accountLink.label },
  ];

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

  function isCurrentPath(href: string) {
    const cleanHref = href.split("?")[0];
    if (cleanHref === "/") return pathname === "/";
    return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
  }

  return (
    <>
      <header className="site-header">
        <div className={`container site-header-inner${isInternalArea ? " site-header-inner-compact" : ""}`}>
          <Link className="site-brand" href="/" aria-label="Comercio Digital, ir al inicio">
            <Image alt="" aria-hidden="true" height={32} priority src="/favicon.svg" width={32} />
            <span className="site-brand-copy">
              <strong>Comercio Digital</strong>
              <span>by Gregor Magnus</span>
            </span>
          </Link>

          {!isInternalArea ? (
            <form action="/buscar" className="site-header-search" method="get" role="search">
              <label className="sr-only" htmlFor="global-search">Buscar productos o tiendas</label>
              <input
                autoComplete="off"
                id="global-search"
                name="q"
                placeholder="Buscar productos, tiendas o categorias"
                type="search"
              />
              <button aria-label="Buscar" type="submit">Buscar</button>
            </form>
          ) : null}

          <nav aria-label="Navegacion principal" className="site-header-actions">
            <Link href="/buscar">Buscar</Link>
            <Link href="/comerciantes">Tiendas</Link>
            {accountLink.label !== "Iniciar sesion" ? (
              <Link href="/notificaciones">
                Avisos{unreadNotifications > 0 ? ` (${unreadNotifications})` : ""}
              </Link>
            ) : null}
            <Link href={accountLink.href}>{accountLink.label}</Link>
            <InstallAppButton />
          </nav>
        </div>
      </header>

      {showMobilePublicNavigation ? (
        <nav aria-label="Navegacion movil" className="mobile-bottom-navigation">
          {mobileLinks.map((link) => {
            const isCurrent = isCurrentPath(link.href);
            return (
              <Link aria-current={isCurrent ? "page" : undefined} href={link.href} key={`${link.href}-${link.label}`}>
                {link.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </>
  );
}
