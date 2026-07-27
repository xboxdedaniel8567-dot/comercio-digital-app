import { AppHeader } from "@/components/AppHeader";
import { MerchantRegisterForm } from "./MerchantRegisterForm";

export default function MerchantRegisterPage() {
  return (
    <main className="shell">
      <AppHeader />
      <section className="container section" style={{ maxWidth: 680 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p className="kicker">Registro comerciante</p>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", margin: "10px 0 12px", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Crea tu tienda digital
          </h1>
          <p className="muted" style={{ fontSize: "0.96rem", maxWidth: 420, margin: "0 auto" }}>
            Registra tu negocio, publica tus productos y recibe clientes por WhatsApp.
            Configuracion en minutos.
          </p>
        </div>
        <MerchantRegisterForm />
      </section>
    </main>
  );
}
