import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { BusinessOpenStatus } from "@/components/BusinessOpenStatus";
import { ContactButton } from "@/components/ContactButton";
import { DirectionsLink } from "@/components/DirectionsLink";
import { ProductCard } from "@/components/ProductCard";
import { ReportButton } from "@/components/ReportButton";
import { supabase } from "@/lib/supabase";

type StorePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabase
    .from("businesses")
    .select("name, description, city, logo_url, cover_url")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!data) return { title: "Tienda no disponible | Comercio Digital" };

  const store = data as {
    name: string;
    description: string | null;
    city: string;
    logo_url: string | null;
    cover_url: string | null;
  };
  const title = `${store.name} en ${store.city}`;
  const description = store.description || `Consulta el catalogo, ubicacion y contacto de ${store.name}.`;
  const image = store.cover_url || store.logo_url;

  return {
    title,
    description,
    alternates: { canonical: `/tiendas/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/tiendas/${slug}`,
      images: image ? [{ url: image, alt: store.name }] : undefined,
    },
  };
}

type BusinessDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string;
  address: string | null;
  neighborhood: string | null;
  shopping_center: string | null;
  floor: string | null;
  local_number: string | null;
  landmark: string | null;
  whatsapp: string | null;
  logo_url: string | null;
  cover_url: string | null;
  categories: {
    name: string;
  } | null;
  business_hours: {
    day_of_week: number;
    opens_at: string | null;
    closes_at: string | null;
    is_closed: boolean;
  }[];
};

type ProductRow = {
  name: string;
  slug: string;
  price: number | null;
  currency: string;
  stock: number | null;
  categories: {
    name: string;
  } | null;
};

function formatPrice(price: number | null, currency: string) {
  if (price === null) return "Precio por consultar";

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatTime12Hour(value: string | null) {
  if (!value) return "Por confirmar";

  const [hourPart, minutePart = "00"] = value.split(":");
  const hour24 = Number(hourPart);
  const hour12 = hour24 % 12 || 12;
  const period = hour24 >= 12 ? "p. m." : "a. m.";
  return `${hour12}:${minutePart} ${period}`;
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const { data: businessData, error: businessError } = await supabase
    .from("businesses")
    .select("id, name, slug, description, city, address, neighborhood, shopping_center, floor, local_number, landmark, whatsapp, logo_url, cover_url, categories(name), business_hours(day_of_week, opens_at, closes_at, is_closed)")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (businessError || !businessData) {
    notFound();
  }

  const business = businessData as BusinessDetail;
  const { data: productsData } = await supabase
    .from("products")
    .select("name, slug, price, currency, stock, categories(name), product_images(url)")
    .eq("business_id", business.id)
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .or("stock.gt.0,stock.is.null")
    .order("name");

  const storeProducts = ((productsData ?? []) as ProductRow[]).map((product) => ({
    name: product.name,
    slug: product.slug,
    businessName: business.name,
    category: product.categories?.name ?? "Sin categoria",
    price: formatPrice(product.price, product.currency),
    stock: product.stock,
    attributes: [],
    imageUrl: product.product_images?.[0]?.url ?? null,
  }));
  const message = encodeURIComponent(
    `Hola, vi la tienda ${business.name} en Comercio Digital. Quiero mas informacion.`
  );
  const dayNames = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
  const hours = [...(business.business_hours ?? [])].sort(
    (first, second) => first.day_of_week - second.day_of_week,
  );

  return (
    <main className="shell">
      <AppHeader />
      <section className="container section">
        <div className="panel">
          {business.cover_url ? (
            <img alt={`Portada de ${business.name}`} src={business.cover_url} style={{ aspectRatio: "16 / 5", display: "block", objectFit: "cover", width: "100%" }} />
          ) : null}
          <div style={{ padding: 28 }}>
          <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 18 }}>
            {business.logo_url ? (
              <img alt={`Logo de ${business.name}`} src={business.logo_url} style={{ aspectRatio: "1", border: "1px solid var(--line)", objectFit: "cover", width: 96 }} />
            ) : null}
            <div>
              <p className="kicker">{business.categories?.name ?? "Sin categoria"}</p>
              <h1 style={{ fontSize: "clamp(2rem, 5vw, 4.4rem)", margin: "10px 0" }}>{business.name}</h1>
            </div>
          </div>
          <p className="muted">{business.description}</p>
          <p className="muted">{business.address}</p>
          {business.neighborhood ? <p className="muted">Barrio: {business.neighborhood}</p> : null}
          {business.shopping_center ? (
            <p className="muted">
              {business.shopping_center}
              {business.floor ? ` - Piso ${business.floor}` : ""}
              {business.local_number ? ` - Local ${business.local_number}` : ""}
            </p>
          ) : null}
          {business.landmark ? <p className="muted">Referencia: {business.landmark}</p> : null}
          <p>{business.city}</p>
          <p>WhatsApp: {business.whatsapp}</p>
          <BusinessOpenStatus hours={hours} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <ContactButton
              businessId={business.id}
              businessName={business.name}
              label="Contactar tienda"
              message={message}
              source="store_detail"
              whatsapp={business.whatsapp}
            />
            <DirectionsLink address={business.address} city={business.city} />
          </div>
          <div style={{ marginTop: 14 }}>
            <ReportButton
              returnPath={`/tiendas/${business.slug}`}
              targetId={business.id}
              targetName={business.name}
              targetType="business"
            />
          </div>
          </div>
        </div>
        <section style={{ marginTop: 32 }}>
          <h2>Horario de atencion</h2>
          {hours.length > 0 ? (
            <div className="grid-auto" style={{ marginTop: 16 }}>
              {hours.map((day) => (
                <div
                  key={day.day_of_week}
                  style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}
                >
                  <strong>{dayNames[day.day_of_week]}</strong>
                  <p className="muted" style={{ marginBottom: 0 }}>
                    {day.is_closed
                      ? "Cerrado"
                      : `${formatTime12Hour(day.opens_at)} - ${formatTime12Hour(day.closes_at)}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">Horario por confirmar.</p>
          )}
        </section>
        <h2 style={{ marginTop: 32 }}>Productos de la tienda</h2>
        <div className="grid-auto" style={{ marginTop: 18 }}>
          {storeProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        {storeProducts.length === 0 ? (
          <p className="muted" style={{ marginTop: 18 }}>
            Esta tienda todavia no tiene productos activos.
          </p>
        ) : null}
      </section>
    </main>
  );
}
