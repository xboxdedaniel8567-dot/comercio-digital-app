import { AppHeader } from "@/components/AppHeader";
import { MerchantDirectory, type DirectoryBusiness } from "@/components/MerchantDirectory";
import { supabase } from "@/lib/supabase";
import { firstRelation } from "@/lib/supabase-relations";

export default async function MerchantsPage() {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, slug, description, city, address, whatsapp, logo_url, cover_url, categories(name)")
    .eq("status", "active")
    .order("name");

  const businesses: DirectoryBusiness[] = (data ?? []).map((business) => ({
    ...business,
    categories: firstRelation(business.categories),
  }));

  return (
    <main className="shell">
      <AppHeader />
      <section className="container section directory-page">
        <header className="directory-heading">
          <div>
            <p className="kicker">Directorio local</p>
            <h1>Comercios de tu ciudad</h1>
          </div>
          <p className="muted">
            Explora negocios activos, revisa sus catalogos y contactalos directamente antes de desplazarte.
          </p>
        </header>

        {error ? (
          <div className="card" style={{ borderColor: "#ef4444", marginTop: 24 }}>
            <strong>No se pudieron cargar los comercios.</strong>
            <p className="muted">Intenta nuevamente en unos momentos.</p>
          </div>
        ) : null}

        {!error ? <MerchantDirectory businesses={businesses} /> : null}

        {!error && businesses.length === 0 ? (
          <p className="muted directory-empty-message">
            Todavia no hay comercios activos.
          </p>
        ) : null}
      </section>
    </main>
  );
}
