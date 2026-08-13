import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="container app-footer-inner">
        <div className="app-footer-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Comercio Digital"
            className="app-footer-logo"
            height={26}
            src="/brand-icon.png"
            width={26}
          />
          <span className="app-footer-brand-copy">
            <strong>Comercio Digital</strong>
            <span className="muted app-footer-tagline">by Gregor Magnus</span>
          </span>
        </div>
        <nav className="app-footer-nav" aria-label="Informacion legal">
          <Link className="muted" href="/legal/terminos">Terminos</Link>
          <Link className="muted" href="/legal/privacidad">Privacidad</Link>
          <Link className="muted" href="/legal/tratamiento-datos">Tratamiento de datos</Link>
          <a
            className="muted"
            href="https://www.sic.gov.co/"
            rel="noreferrer"
            target="_blank"
          >
            Superintendencia de Industria y Comercio
          </a>
        </nav>
      </div>
    </footer>
  );
}
