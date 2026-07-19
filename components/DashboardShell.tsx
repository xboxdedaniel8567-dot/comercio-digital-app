"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppHeader } from "./AppHeader";
import { LogoutButton } from "./LogoutButton";

type DashboardShellProps = {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  links: { href: string; label: string }[];
};

export function DashboardShell({
  title,
  eyebrow,
  children,
  links,
}: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <main className="shell">
      <AppHeader />
      <section className="container dashboard-page">
        <header className="dashboard-page-heading">
          <p className="kicker">{eyebrow}</p>
          <h1>{title}</h1>
        </header>
        <div className="dashboard-grid">
          <aside className="dashboard-nav panel" aria-label="Navegacion del panel">
            <p className="dashboard-nav-label">
              {eyebrow.toLowerCase().includes("admin") || eyebrow.toLowerCase().includes("operacion")
                ? "Control de plataforma"
                : "Gestion de tienda"}
            </p>
            {links.map((link) => (
              <Link
                aria-current={pathname === link.href ? "page" : undefined}
                className="dashboard-nav-link"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
            <div className="dashboard-nav-logout"><LogoutButton /></div>
          </aside>
          <div className="dashboard-content">{children}</div>
        </div>
      </section>
    </main>
  );
}
