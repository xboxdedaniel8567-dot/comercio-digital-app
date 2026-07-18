import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { ContactButton } from "@/components/ContactButton";
import { DirectionsLink } from "@/components/DirectionsLink";
import { supabase } from "@/lib/supabase";

type Business = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string;
  address: string | null;
  whatsapp: string | null;
  logo_url: string | null;
  categories: {
    name: string;
  } | null;
};

export default async function MerchantsPage() {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, slug, description, city, address, whatsapp, logo_url, categories(name)")
    .eq("status", "active")
    .order("name");

  const businesses = (data ?? []) as Business[];

  return (
    <main className="shell">
      <AppHeader />
      <section className="container section">
        <p className="kicker">Comercios</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 4.6rem)", margin: "10px 0" }}>
          Tiendas del marketplace
        </h1>
        <p className="muted" style={{ maxWidth: 720 }}>
          Explora negocios registrados en Comercio Digital, revisa su catalogo y contactalos directamente por WhatsApp.
        </p>

        {error ? (
          <div className="card" style={{ borderColor: "#ef4444", marginTop: 24 }}>
            <strong>No se pudieron cargar los comercios.</strong>
            <p className="muted">{error.message}</p>
          </div>
        ) : null}

        <div className="grid-auto" style={{ marginTop: 24 }}>
          {businesses.map((business) => {
            const message = encodeURIComponent(
              `Hola, vi la tienda ${business.name} en Comercio Digital. Quiero mas informacion.`
            );

            return (
              <div className="card" key={business.id} style={{ display: "grid", gap: 10 }}>
                {business.logo_url ? (
                  <img alt={`Logo de ${business.name}`} src={business.logo_url} style={{ aspectRatio: "1", border: "1px solid var(--line)", objectFit: "cover", width: 72 }} />
                ) : null}
                <p className="kicker">{business.categories?.name ?? "Sin categoria"}</p>
                <h2 style={{ margin: 0 }}>{business.name}</h2>
                <p className="muted" style={{ margin: 0 }}>
                  {business.description ?? "Tienda registrada en Comercio Digital."}
                </p>
                <p style={{ margin: 0 }}>{business.address ?? "Direccion por confirmar"}</p>
                <p className="muted" style={{ margin: 0 }}>{business.city}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
                  <Link className="btn" href={`/tiendas/${business.slug}`}>
                    Ver tienda
                  </Link>
                  <ContactButton
                    businessId={business.id}
                    businessName={business.name}
                    className="btn btn-dark"
                    label="WhatsApp"
                    message={message}
                    source="store_detail"
                    whatsapp={business.whatsapp}
                  />
                  <DirectionsLink address={business.address} city={business.city} />
                </div>
              </div>
            );
          })}
        </div>

        {!error && businesses.length === 0 ? (
          <p className="muted" style={{ marginTop: 24 }}>
            Todavia no hay comercios activos.
          </p>
        ) : null}
      </section>
    </main>
  );
}
