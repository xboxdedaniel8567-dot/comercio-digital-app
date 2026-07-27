import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { LoginForm } from "./LoginForm";

export default function MerchantLoginPage() {
  return (
    <main className="shell">
      <AppHeader />
      <section className="container section" style={{ maxWidth: 560 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p className="kicker">Acceso seguro</p>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", margin: "10px 0 12px", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Iniciar sesion
          </h1>
          <p className="muted" style={{ fontSize: "0.96rem" }}>
            Entra a tu panel para administrar tu tienda y productos.
          </p>
        </div>
        <LoginForm />
        <div className="card" style={{ marginTop: 20, textAlign: "center" }}>
          <p style={{ fontWeight: 600, margin: "0 0 6px", fontSize: "0.94rem" }}>Aun no tienes cuenta?</p>
          <p className="muted" style={{ margin: "0 0 18px", fontSize: "0.88rem" }}>
            Elige el tipo de cuenta que necesitas.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link className="btn btn-dark" href="/cuenta/registro">
              Soy cliente
            </Link>
            <Link className="btn" href="/panel/registro">
              Soy comerciante
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
