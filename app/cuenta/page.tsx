import { AppHeader } from "@/components/AppHeader";
import { BuyerAccount } from "./BuyerAccount";

export default function AccountPage() {
  return (
    <main className="shell">
      <AppHeader />
      <section className="container section">
        <p className="kicker">Mi cuenta</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 4rem)", margin: "10px 0 24px" }}>
          Tus favoritos
        </h1>
        <BuyerAccount />
      </section>
    </main>
  );
}

