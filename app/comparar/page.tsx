import { AppHeader } from "@/components/AppHeader";
import { CompareProducts } from "./CompareProducts";

export default function ComparePage() {
  return (
    <main className="shell">
      <AppHeader />
      <section className="container section">
        <p className="kicker">Decision de compra</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 4.6rem)", margin: "10px 0 24px" }}>
          Comparar productos
        </h1>
        <CompareProducts />
      </section>
    </main>
  );
}

