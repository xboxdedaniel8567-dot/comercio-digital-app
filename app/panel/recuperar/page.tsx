import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { RecoveryForm } from "./RecoveryForm";

export default function RecoverPasswordPage() {
  return (
    <main className="shell">
      <AppHeader />
      <section className="container section" style={{ maxWidth: 720 }}>
        <p className="kicker">Seguridad de la cuenta</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 4rem)", margin: "10px 0 24px" }}>
          Recuperar contrasena
        </h1>
        <RecoveryForm />
        <Link className="muted" href="/panel/login" style={{ display: "inline-block", marginTop: 18 }}>
          Volver al inicio de sesion
        </Link>
      </section>
    </main>
  );
}
