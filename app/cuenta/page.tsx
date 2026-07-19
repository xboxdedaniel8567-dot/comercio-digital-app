import { AppHeader } from "@/components/AppHeader";
import { BuyerAccount } from "./BuyerAccount";

export default function AccountPage() {
  return (
    <main className="shell">
      <AppHeader />
      <section className="container section buyer-account-page">
        <p className="kicker">Mi cuenta</p>
        <h1>Tu actividad</h1>
        <p className="muted buyer-account-intro">
          Administra tus datos y vuelve rapidamente a productos, busquedas y solicitudes recientes.
        </p>
        <BuyerAccount />
      </section>
    </main>
  );
}
