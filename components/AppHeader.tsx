"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { isShellPathActive, publicMobileLinks } from "@/lib/shell-navigation";
import { InstallAppButton } from "./InstallAppButton";
import { ShellIcon } from "./ShellIcon";

type AccountLink = {
  href: string;
  label: string;
};

export function AppHeader() {
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [accountLink, setAccountLink] = useState<AccountLink>({
    href: "/panel/login",
    label: "Iniciar sesion",
  });

  const isInternalArea = pathname.startsWith("/panel") || pathname.startsWith("/admin");
  const isAuthFlow = pathname.startsWith("/cuenta/registro") || pathname.startsWith("/panel/");
  const showMobilePublicNavigation = !isInternalArea && !isAuthFlow;
  const favoritesHref = accountLink.label === "Mi cuenta" ? "/cuenta#favoritos" : "/panel/login?next=/cuenta%23favoritos";

  const mobileLinks = publicMobileLinks.map((link) => {
    if (link.label === "Favoritos") return { ...link, href: favoritesHref };
    if (link.label === "Perfil") return { ...link, href: accountLink.href };
    return link;
  });

  useEffect(() => {
    const updateHash = () => setCurrentHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);

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
      window.removeEventListener("hashchange", updateHash);
    };
  }, []);

  const isCurrentPath = (href: string) => isShellPathActive(pathname, href);

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
              <ShellIcon name="search" />
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
            <Link className="site-header-favorites" href={favoritesHref}>
              <ShellIcon name="heart" />
              <span>Favoritos</span>
            </Link>
            {accountLink.label !== "Iniciar sesion" ? (
              <Link className="site-header-notifications" aria-current={isCurrentPath("/notificaciones") ? "page" : undefined} href="/notificaciones">
                <ShellIcon name="bell" />
                <span>Avisos</span>
                {unreadNotifications > 0 ? <span className="site-header-notification-count">{unreadNotifications}</span> : null}
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
            const isFavorites = link.label === "Favoritos";
            const isProfile = link.label === "Perfil";
            const isCurrent = isFavorites
              ? pathname === "/cuenta" && currentHash === "#favoritos"
              : isProfile
                ? isCurrentPath(link.href) && currentHash !== "#favoritos"
                : isCurrentPath(link.href);
            return (
              <Link
                aria-current={isCurrent ? "page" : undefined}
                className={isCurrent ? "is-active" : ""}
                href={link.href}
                key={`${link.href}-${link.label}`}
              >
                {link.icon ? <ShellIcon name={link.icon} /> : null}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </>
  );
}
