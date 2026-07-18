import Link from "next/link";
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
  return (
    <main className="shell">
      <AppHeader />
      <section className="container" style={{ padding: "32px 0 72px" }}>
        <p className="kicker">{eyebrow}</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 4rem)", margin: "10px 0 24px" }}>
          {title}
        </h1>
        <div
          className="dashboard-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gap: 18,
            alignItems: "start",
          }}
        >
          <aside className="dashboard-nav panel" style={{ padding: 14, display: "grid", gap: 8 }}>
            {links.map((link) => (
              <Link className="btn btn-dark" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
            <LogoutButton />
          </aside>
          <div>{children}</div>
        </div>
      </section>
    </main>
  );
}
