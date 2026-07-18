import { AppHeader } from "@/components/AppHeader";
import { BuyerRegisterForm } from "./BuyerRegisterForm";

export default function BuyerRegisterPage() {
  return (
    <main className="shell">
      <AppHeader />
      <section className="container section" style={{ maxWidth: 680 }}>
        <p className="kicker">Cuenta de comprador</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 4rem)", margin: "10px 0 24px" }}>
          Guarda lo que te interesa
        </h1>
        <BuyerRegisterForm />
      </section>
    </main>
  );
}

