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
  product_images: {
    url: string;
  }[];
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
      <div className="container store-page">
        <section className="store-hero">
          {business.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={`Portada de ${business.name}`} className="store-cover" src={business.cover_url} />
          ) : (
            <div className="store-cover-placeholder" />
          )}
          <div className="store-hero-content">
            <div className="store-identity">
            {business.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={`Logo de ${business.name}`} className="store-logo" src={business.logo_url} />
              ) : (
                <span className="store-logo store-logo-placeholder" aria-hidden="true">
                  {business.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            <div>
                <p className="store-category">{business.categories?.name ?? "Sin categoria"}</p>
                <h1>{business.name}</h1>
                <BusinessOpenStatus hours={hours} />
              </div>
            </div>
            <p className="store-description">
              {business.description || "Descubre los productos disponibles y contacta directamente con la tienda."}
            </p>
            <div className="store-hero-actions">
              <ContactButton
                businessId={business.id}
                businessName={business.name}
                label="Escribir por WhatsApp"
                message={message}
                source="store_detail"
                whatsapp={business.whatsapp}
              />
              <DirectionsLink address={business.address} city={business.city} />
            </div>
          </div>
        </section>

        <div className="store-content-layout">
          <section aria-labelledby="store-products-title" className="store-catalog">
            <div className="store-section-heading">
              <div>
                <p>Catalogo</p>
                <h2 id="store-products-title">Productos disponibles</h2>
              </div>
              <span>{storeProducts.length} {storeProducts.length === 1 ? "producto" : "productos"}</span>
            </div>
            {storeProducts.length > 0 ? (
              <div className="store-product-grid">
                {storeProducts.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            ) : (
              <div className="store-empty-catalog">
                <h3>Catalogo en preparacion</h3>
                <p>Esta tienda todavia no tiene productos activos.</p>
              </div>
            )}
          </section>

          <aside className="store-sidebar" aria-label="Informacion de la tienda">
            <section className="store-info-block">
              <h2>Ubicacion</h2>
              <address>
                <strong>{business.address ?? "Direccion por confirmar"}</strong>
                {business.neighborhood ? <span>Barrio: {business.neighborhood}</span> : null}
                {business.shopping_center ? (
                  <span>
                    {business.shopping_center}
                    {business.floor ? ` - Piso ${business.floor}` : ""}
                    {business.local_number ? ` - Local ${business.local_number}` : ""}
                  </span>
                ) : null}
                {business.landmark ? <span>Referencia: {business.landmark}</span> : null}
                <span>{business.city}</span>
              </address>
              <DirectionsLink address={business.address} city={business.city} />
            </section>

            <section className="store-info-block">
              <h2>Horario de atencion</h2>
              {hours.length > 0 ? (
                <dl className="store-hours-list">
                  {hours.map((day) => (
                    <div key={day.day_of_week}>
                      <dt>{dayNames[day.day_of_week]}</dt>
                      <dd className={day.is_closed ? "store-hours-closed" : undefined}>
                        {day.is_closed
                          ? "Cerrado"
                          : `${formatTime12Hour(day.opens_at)} - ${formatTime12Hour(day.closes_at)}`}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="muted">Horario por confirmar.</p>
              )}
            </section>

            <section className="store-info-block store-contact-block">
              <h2>Contacto directo</h2>
              <p>Confirma existencias, variantes y precio antes de desplazarte.</p>
              <ContactButton
                businessId={business.id}
                businessName={business.name}
                label="Abrir WhatsApp"
                message={message}
                source="store_detail"
                whatsapp={business.whatsapp}
              />
            </section>
          </aside>
        </div>

        <section className="store-report-section" aria-label="Seguridad del comercio">
          <div>
            <h2>¿La informacion de esta tienda no coincide?</h2>
            <p>Envia un reporte para que el equipo administrativo pueda revisarla.</p>
          </div>
          <ReportButton
            returnPath={`/tiendas/${business.slug}`}
            targetId={business.id}
            targetName={business.name}
            targetType="business"
          />
        </section>
      </div>
    </main>
  );
}
