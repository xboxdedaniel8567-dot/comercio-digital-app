"use client";

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
  icon: string;
};

function Icon({ name }: { name: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case "store":
      return (
        <svg {...common}>
          <path d="M3 9l1.5-5h15L21 9M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18M9 21v-6h6v6" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      );
    default:
      return null;
  }
}

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
    { href: "/", label: "Inicio", icon: "home" },
    { href: "/buscar", label: "Buscar", icon: "search" },
    { href: "/comerciantes", label: "Tiendas", icon: "store" },
    { href: favoritesHref, label: "Favoritos", icon: "heart" },
    {
      href: accountLink.href,
      label: accountLink.label === "Iniciar sesion" ? "Cuenta" : accountLink.label,
      icon: "user",
    },
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Comercio Digital"
              className="site-brand-logo"
              height={32}
              src="/brand-icon.png"
              width={32}
            />
            <span className="site-brand-copy">Comercio Digital</span>
          </Link>

          {!isInternalArea ? (
            <form action="/buscar" className="site-header-search" method="get" role="search">
              <label className="sr-only" htmlFor="global-search">Buscar productos o tiendas</label>
              <Icon name="search" />
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
            <Link aria-current={isCurrentPath("/buscar") ? "page" : undefined} href="/buscar">Buscar</Link>
            <Link aria-current={isCurrentPath("/comerciantes") ? "page" : undefined} href="/comerciantes">Tiendas</Link>
            {accountLink.label !== "Iniciar sesion" ? (
              <Link aria-current={isCurrentPath("/notificaciones") ? "page" : undefined} href="/notificaciones">
                Avisos{unreadNotifications > 0 ? ` (${unreadNotifications})` : ""}
              </Link>
            ) : null}
            <Link aria-current={isCurrentPath(accountLink.href) ? "page" : undefined} href={accountLink.href}>{accountLink.label}</Link>
            <InstallAppButton />
          </nav>
        </div>
      </header>

      {showMobilePublicNavigation ? (
        <nav aria-label="Navegacion movil" className="mobile-bottom-navigation">
          {mobileLinks.map((link) => {
            const isCurrent = isCurrentPath(link.href);
            return (
              <Link
                aria-current={isCurrent ? "page" : undefined}
                className={isCurrent ? "is-active" : ""}
                href={link.href}
                key={`${link.href}-${link.label}`}
              >
                <Icon name={link.icon} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </>
  );
}
