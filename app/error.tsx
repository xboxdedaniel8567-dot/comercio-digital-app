"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { createErrorId, logServerError } from "@/lib/observability";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const errorId = error.digest ?? createErrorId();

  useEffect(() => {
    logServerError("app/segment-error", error, errorId);
  }, [error, errorId]);

  return (
    <main className="shell">
      <AppHeader />
      <section className="container" style={{ padding: "48px 0" }}>
        <div className="card">
          <p className="kicker">Error</p>
          <h1 style={{ marginTop: 8 }}>No pudimos cargar esta pagina</h1>
          <p className="muted">Intenta de nuevo en unos segundos.</p>
          <p className="muted" style={{ fontSize: "0.9rem" }}>
            Referencia: <code>{errorId}</code>
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
            <button className="btn" type="button" onClick={() => reset()}>
              Reintentar
            </button>
            <Link className="btn btn-dark" href="/">
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
