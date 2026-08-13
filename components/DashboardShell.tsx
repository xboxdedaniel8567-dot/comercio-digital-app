"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  getActiveShellHref,
  merchantMobileLinks,
  type ShellNavItem,
} from "@/lib/shell-navigation";
import { AppHeader } from "./AppHeader";
import { LogoutButton } from "./LogoutButton";
import { ShellIcon } from "./ShellIcon";

type DashboardShellProps = {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  links: ShellNavItem[];
};

export function DashboardShell({ title, eyebrow, children, links }: DashboardShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const menuButton = menuButtonRef.current;
    const focusableSelector = "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])";
    const focusable = () => Array.from(drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
    focusable()[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      (previouslyFocused ?? menuButton)?.focus();
    };
  }, [drawerOpen]);

  const isAdmin = eyebrow.toLowerCase().includes("admin") || eyebrow.toLowerCase().includes("operacion");

  const activeHref = getActiveShellHref(pathname, links);
  const isLinkCurrent = (link: ShellNavItem) => link.href === activeHref;
  const isMoreCurrent = !merchantMobileLinks.some((link) => link.href === activeHref);
  const groups = isAdmin
    ? ["Operaciones", "Moderacion", "Sistema"].map((label) => ({ label, links: links.filter((link) => link.group === label) }))
    : [{ label: "Gestion de tienda", links }];

  return (
    <div className={`shell dashboard-shell ${isAdmin ? "dashboard-shell-admin" : "dashboard-shell-merchant"}`}>
      <AppHeader />
      <main className="container dashboard-page" id="main-content">
        <header className="dashboard-page-heading">
          <div className="dashboard-mobile-bar">
            {isAdmin ? (
              <button
                ref={menuButtonRef}
                type="button"
                className="dashboard-menu-btn"
                aria-controls="dashboard-drawer"
                aria-label="Abrir menu administrativo"
                aria-expanded={drawerOpen}
                onClick={() => setDrawerOpen(true)}
              >
                <ShellIcon name="menu" />
                Menu
              </button>
            ) : null}
            <h1 className="dashboard-mobile-title">{title}</h1>
          </div>
          <p className="kicker dashboard-eyebrow-desktop">{eyebrow}</p>
          <h1 className="dashboard-title-desktop">{title}</h1>
        </header>

        <div className="dashboard-grid">
          {/* Sidebar desktop */}
          <aside className="dashboard-nav panel" aria-label="Navegacion del panel">
            {groups.map((group) => (
              <div className="dashboard-nav-group" key={group.label}>
                <p className="dashboard-nav-label">{group.label}</p>
                {group.links.map((link) => (
                  <Link
                    aria-current={isLinkCurrent(link) ? "page" : undefined}
                    className="dashboard-nav-link"
                    href={link.href}
                    key={link.href + link.label}
                  >
                    {link.icon ? <ShellIcon name={link.icon} /> : null}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            ))}
            <div className="dashboard-nav-logout"><LogoutButton /></div>
          </aside>

          {/* Drawer movil */}
          {drawerOpen ? (
            <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} role="presentation">
              <aside
                ref={drawerRef}
                id="dashboard-drawer"
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
                    <ShellIcon name="x" />
                  </button>
                </div>
                <nav className="drawer-nav">
                  {groups.map((group) => (
                    <div className="drawer-nav-group" key={group.label}>
                      <p className="drawer-nav-label">{group.label}</p>
                      {group.links.map((link) => (
                        <Link
                          aria-current={isLinkCurrent(link) ? "page" : undefined}
                          className="drawer-nav-link"
                          href={link.href}
                          key={link.href + link.label}
                        >
                          {link.icon ? <ShellIcon name={link.icon} /> : null}
                          <span>{link.label}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </nav>
                <div className="drawer-footer"><LogoutButton /></div>
              </aside>
            </div>
          ) : null}

          <div className="dashboard-content">{children}</div>
        </div>
      </main>

      {!isAdmin ? (
        <nav aria-label="Navegacion movil del comerciante" className="merchant-bottom-navigation">
          {merchantMobileLinks.map((link) => {
            const current = isLinkCurrent(link);
            return (
              <Link aria-current={current ? "page" : undefined} href={link.href} key={link.href}>
                {link.icon ? <ShellIcon name={link.icon} /> : null}
                <span>{link.label}</span>
              </Link>
            );
          })}
          <button
            ref={menuButtonRef}
            className={isMoreCurrent ? "is-active" : undefined}
            aria-controls="dashboard-drawer"
            aria-expanded={drawerOpen}
            aria-label="Abrir mas opciones del comercio"
            onClick={() => setDrawerOpen(true)}
            type="button"
          >
            <ShellIcon name="menu" />
            <span>Mas</span>
          </button>
        </nav>
      ) : null}
    </div>
  );
}
