import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="container" style={{ paddingBottom: 32, paddingTop: 48 }}>
      <div
        style={{
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          justifyContent: "space-between",
          paddingTop: 20,
        }}
      >
        <span className="muted">Comercio Digital by Gregor Magnus</span>
        <nav style={{ display: "flex", flexWrap: "wrap", gap: 14 }} aria-label="Informacion legal">
          <Link className="muted" href="/legal/terminos">Terminos</Link>
          <Link className="muted" href="/legal/privacidad">Privacidad</Link>
          <Link className="muted" href="/legal/tratamiento-datos">Tratamiento de datos</Link>
          <a className="muted" href="https://www.sic.gov.co/" rel="noreferrer" target="_blank">
            Superintendencia de Industria y Comercio
          </a>
        </nav>
      </div>
    </footer>
  );
}
