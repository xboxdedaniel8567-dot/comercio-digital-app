import { AppHeader } from "@/components/AppHeader";
import { MerchantRegisterForm } from "./MerchantRegisterForm";

export default function MerchantRegisterPage() {
  return (
    <main className="shell">
      <AppHeader />
      <section className="container section" style={{ maxWidth: 780 }}>
        <p className="kicker">Registro comerciante</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 4rem)", margin: "10px 0 24px" }}>
          Crear tienda
        </h1>
        <MerchantRegisterForm />
      </section>
    </main>
  );
}
