"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AppHeader } from "./AppHeader";
import { LogoutButton } from "./LogoutButton";

type DashboardShellProps = {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  links: { href: string; label: string }[];
};

export function DashboardShell({ title, eyebrow, children, links }: DashboardShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const isAdmin = eyebrow.toLowerCase().includes("admin") || eyebrow.toLowerCase().includes("operacion");

  return (
    <main className="shell">
      <AppHeader />
      <section className="container dashboard-page">
        <header className="dashboard-page-heading">
          <div className="dashboard-mobile-bar">
            <button
              type="button"
              className="dashboard-menu-btn"
              aria-label="Abrir menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
            >
              <span className="dashboard-menu-icon" aria-hidden="true" />
              Menu
            </button>
            <h1 className="dashboard-mobile-title">{title}</h1>
          </div>
          <p className="kicker dashboard-eyebrow-desktop">{eyebrow}</p>
          <h1 className="dashboard-title-desktop">{title}</h1>
        </header>

        <div className="dashboard-grid">
          {/* Sidebar desktop */}
          <aside className="dashboard-nav panel" aria-label="Navegacion del panel">
            <p className="dashboard-nav-label">{isAdmin ? "Control de plataforma" : "Gestion de tienda"}</p>
            {links.map((link) => (
              <Link
                aria-current={pathname === link.href ? "page" : undefined}
                className="dashboard-nav-link"
                href={link.href}
                key={link.href + link.label}
              >
                {link.label}
              </Link>
            ))}
            <div className="dashboard-nav-logout"><LogoutButton /></div>
          </aside>

          {/* Drawer movil */}
          {drawerOpen ? (
            <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} role="presentation">
              <aside
                className="drawer panel"
                aria-label="Menu del panel"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
              >
                <div className="drawer-header">
                  <span className="kicker">{eyebrow}</span>
                  <button
                    type="button"
                    className="drawer-close"
                    aria-label="Cerrar menu"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
                <nav className="drawer-nav">
                  {links.map((link) => (
                    <Link
                      aria-current={pathname === link.href ? "page" : undefined}
                      className="drawer-nav-link"
                      href={link.href}
                      key={link.href + link.label}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="drawer-footer"><LogoutButton /></div>
              </aside>
            </div>
          ) : null}

          <div className="dashboard-content">{children}</div>
        </div>
      </section>
    </main>
  );
}
