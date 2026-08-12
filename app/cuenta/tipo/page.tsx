import { AppHeader } from "@/components/AppHeader";
import { AccountTypeOnboarding } from "./AccountTypeOnboarding";

export default function AccountTypePage() {
  return (
    <main className="shell">
      <AppHeader />
      <section className="container section" style={{ maxWidth: 680 }}>
        <p className="kicker">Configura tu cuenta</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", margin: "10px 0 12px" }}>
          Como quieres usar Comercio Digital?
        </h1>
        <p className="muted" style={{ margin: "0 0 24px" }}>
          Elige una opcion para continuar. Tu cuenta no recibira permisos de comerciante sin registrar primero un negocio.
        </p>
        <AccountTypeOnboarding />
      </section>
    </main>
  );
}
