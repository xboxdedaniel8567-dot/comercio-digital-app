import { AppHeader } from "@/components/AppHeader";
import { UpdatePasswordForm } from "./UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <main className="shell">
      <AppHeader />
      <section className="container section" style={{ maxWidth: 720 }}>
        <p className="kicker">Seguridad de la cuenta</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 4rem)", margin: "10px 0 24px" }}>
          Nueva contrasena
        </h1>
        <UpdatePasswordForm />
      </section>
    </main>
  );
}
