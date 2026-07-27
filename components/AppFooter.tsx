import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="container" style={{ paddingBottom: 40, paddingTop: 56 }}>
      <div
        style={{
          borderTop: "1px solid var(--line)",
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 24,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <strong style={{ fontSize: "0.95rem" }}>Comercio Digital</strong>
          <span className="muted" style={{ fontSize: "0.85rem" }}>by Gregor Magnus</span>
        </div>
        <nav
          style={{ display: "flex", flexWrap: "wrap", gap: 20 }}
          aria-label="Informacion legal"
        >
          <Link className="muted" href="/legal/terminos" style={{ fontSize: "0.88rem", textDecoration: "none", transition: "color var(--transition)" }}>
            Terminos
          </Link>
          <Link className="muted" href="/legal/privacidad" style={{ fontSize: "0.88rem", textDecoration: "none", transition: "color var(--transition)" }}>
            Privacidad
          </Link>
          <Link className="muted" href="/legal/tratamiento-datos" style={{ fontSize: "0.88rem", textDecoration: "none", transition: "color var(--transition)" }}>
            Tratamiento de datos
          </Link>
          <a
            className="muted"
            href="https://www.sic.gov.co/"
            rel="noreferrer"
            target="_blank"
            style={{ fontSize: "0.88rem", textDecoration: "none", transition: "color var(--transition)" }}
          >
            Superintendencia de Industria y Comercio
          </a>
        </nav>
      </div>
    </footer>
  );
}
