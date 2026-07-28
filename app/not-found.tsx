import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export default function NotFoundPage() {
  return (
    <main className="shell">
      <AppHeader />
      <section className="container" style={{ padding: "48px 0" }}>
        <div className="card">
          <p className="kicker">404</p>
          <h1 style={{ marginTop: 8 }}>Pagina no encontrada</h1>
          <p className="muted">
            El enlace puede estar desactualizado o el contenido ya no esta disponible.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
            <Link className="btn" href="/">
              Ir al inicio
            </Link>
            <Link className="btn btn-dark" href="/buscar">
              Buscar productos
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
