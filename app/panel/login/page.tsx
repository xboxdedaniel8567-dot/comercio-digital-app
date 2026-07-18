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
        <p className="muted" style={{ marginTop: 18 }}>
          No tienes tienda?{" "}
          <Link href="/panel/registro" style={{ color: "white", fontWeight: 700 }}>
            Crear cuenta de comerciante
          </Link>
        </p>
      </section>
    </main>
  );
}
