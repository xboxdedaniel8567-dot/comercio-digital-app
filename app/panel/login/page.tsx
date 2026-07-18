import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { LoginForm } from "./LoginForm";

export default function MerchantLoginPage() {
  return (
    <main className="shell">
      <AppHeader />
      <section className="container section" style={{ maxWidth: 720 }}>
        <p className="kicker">Acceso seguro</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 4rem)", margin: "10px 0 24px" }}>
          Iniciar sesion
        </h1>
        <LoginForm />
        <section className="panel" style={{ marginTop: 18, padding: 18 }}>
          <p style={{ fontWeight: 700, margin: "0 0 6px" }}>Aun no tienes cuenta?</p>
          <p className="muted" style={{ margin: "0 0 16px" }}>
            Elige el tipo de cuenta que necesitas para continuar.
          </p>
          <div className="grid-auto">
            <Link className="btn btn-dark" href="/cuenta/registro">
              Crear cuenta de cliente
            </Link>
            <Link className="btn" href="/panel/registro">
              Crear cuenta de comerciante
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
