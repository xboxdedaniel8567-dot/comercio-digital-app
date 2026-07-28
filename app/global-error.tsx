"use client";

import Link from "next/link";
import { useEffect } from "react";
import { createErrorId, logServerError } from "@/lib/observability";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const errorId = error.digest ?? createErrorId();

  useEffect(() => {
    logServerError("app/error", error, errorId);
  }, [error, errorId]);

  return (
    <html lang="es">
      <body style={{ margin: 0, background: "#090a0c", color: "#f4f4f5", fontFamily: "system-ui, sans-serif" }}>
        <main className="shell">
          <section className="container" style={{ padding: "72px 0" }}>
            <div className="card">
              <p className="kicker">Error</p>
              <h1 style={{ marginTop: 8 }}>Algo salio mal</h1>
              <p className="muted">
                No pudimos completar esta accion. Puedes intentar de nuevo o volver al inicio.
              </p>
              <p className="muted" style={{ fontSize: "0.9rem" }}>
                Referencia: <code>{errorId}</code>
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
                <button className="btn" type="button" onClick={() => reset()}>
                  Reintentar
                </button>
                <Link className="btn btn-dark" href="/">
                  Ir al inicio
                </Link>
              </div>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
