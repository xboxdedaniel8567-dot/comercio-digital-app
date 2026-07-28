import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { BusinessOpenStatus } from "@/components/BusinessOpenStatus";
import { ContactButton } from "@/components/ContactButton";
import { DirectionsLink } from "@/components/DirectionsLink";
import { ProductCard } from "@/components/ProductCard";
import { ReportButton } from "@/components/ReportButton";
import { StoreProfileTabs } from "./StoreProfileTabs";
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
  created_at: string;
  categories: {
    name: string;
  } | null;
  business_hours: {
    day_of_week: number;
    opens_at: string | null;
    closes_at: string | null;
    is_closed: boolean;
  }[];
  business_gallery_images: {
    url: string;
    alt_text: string | null;
  }[];
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: string | number | null;
  currency: string | null;
  stock: number | null;
  is_featured: boolean | null;
  view_count: number | null;
  categories: {
    name: string;
  } | null;
  product_images: {
    url: string;
  }[] | null;
};

function formatPrice(price: string | number | null, currency: string | null) {
  if (price === null || price === undefined) return "Precio por consultar";

  const numericPrice = typeof price === "string" ? Number(price) : price;
  if (!Number.isFinite(numericPrice)) return "Precio por consultar";

  const safeCurrency = currency || "COP";
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 0,
    }).format(numericPrice);
  } catch {
    return `${numericPrice.toLocaleString("es-CO")} ${safeCurrency}`;
  }
}

function formatTime12Hour(value: string | null) {
  if (!value) return "Por confirmar";

  const [hourPart, minutePart = "00"] = value.split(":");
  const hour24 = Number(hourPart);
  const hour12 = hour24 % 12 || 12;
  const period = hour24 >= 12 ? "p. m." : "a. m.";
  return `${hour12}:${minutePart} ${period}`;
}

function timeOnPlatform(createdAt: string | null) {
  if (!createdAt) return "Recien unida";
  const created = new Date(createdAt);
  if (isNaN(created.getTime())) return "Recien unida";
  const now = new Date();
  const months = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
  if (months <= 0) return "Recien unida";
  if (months === 1) return "1 mes en Comercio Digital";
  if (months < 12) return `${months} meses en Comercio Digital`;
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  if (remaining === 0) return `${years} ${years === 1 ? "año" : "años"} en Comercio Digital`;
  return `${years} ${years === 1 ? "año" : "años"} y ${remaining} ${remaining === 1 ? "mes" : "meses"} en Comercio Digital`;
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const { data: businessData, error: businessError } = await supabase
    .from("businesses")
    .select(`
      id, name, slug, description, city, address, neighborhood, shopping_center,
      floor, local_number, landmark, whatsapp, logo_url, cover_url, created_at,
      categories(name),
      business_hours(day_of_week, opens_at, closes_at, is_closed),
      business_gallery_images(url, alt_text)
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (businessError) {
    console.error("[store-page] Error loading business:", businessError.message, businessError.code, businessError.details);
  }
  if (!businessData) {
    notFound();
  }

  const business = businessData as unknown as BusinessDetail;

  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select(`
      id, name, slug, price, currency, stock, is_featured, view_count,
      categories(name), product_images(url)
    `)
    .eq("business_id", business.id)
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .or("stock.gt.0,stock.is.null")
    .order("name");

  if (productsError) {
    console.error("[store-page] Error loading products:", productsError.message, productsError.code);
  }

  const allProducts = ((productsData ?? []) as ProductRow[]).map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    businessName: business.name,
    businessCity: business.city,
    category: product.categories?.name ?? "Sin categoria",
    price: formatPrice(product.price, product.currency),
    stock: product.stock ?? null,
    attributes: [],
    imageUrl: product.product_images?.[0]?.url ?? null,
    isFeatured: product.is_featured ?? false,
    viewCount: product.view_count ?? 0,
  }));

  const featuredProducts = allProducts.filter((p) => p.isFeatured);
  const mostViewedProducts = [...allProducts]
    .filter((p) => p.view_count > 0)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 8);
  const galleryImages = (business.business_gallery_images ?? []).map((img) => ({
    url: img.url,
    alt: img.alt_text ?? `${business.name} - fotografia del establecimiento`,
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
        {/* ─── Portada + Logo + Identidad ─── */}
        <section className="store-profile-hero">
          <div className="store-profile-cover-wrap">
            {business.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={`Portada de ${business.name}`}
                className="store-profile-cover"
                src={business.cover_url}
              />
            ) : (
              <div className="store-profile-cover store-profile-cover-placeholder" />
            )}
          </div>

          <div className="store-profile-id-row">
            {business.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={`Logo de ${business.name}`}
                className="store-profile-logo"
                src={business.logo_url}
              />
            ) : (
              <span className="store-profile-logo store-profile-logo-placeholder" aria-hidden="true">
                {business.name.slice(0, 2).toUpperCase()}
              </span>
            )}

            <div className="store-profile-id-info">
              <h1 className="store-profile-name">{business.name}</h1>
              <p className="store-profile-category">{business.categories?.name ?? "Sin categoria"}</p>
              <div className="store-profile-meta-row">
                <BusinessOpenStatus hours={hours} />
                <span className="store-profile-address-line">
                  {business.address ? business.address : "Direccion por confirmar"}
                  {business.city ? ` - ${business.city}` : ""}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Botones de accion ─── */}
        <section className="store-profile-actions">
          <ContactButton
            businessId={business.id}
            businessName={business.name}
            className="btn store-profile-action-btn store-profile-action-primary"
            label="WhatsApp"
            message={message}
            source="store_detail"
            whatsapp={business.whatsapp}
          />
          <DirectionsLink
            address={business.address}
            city={business.city}
            className="btn btn-dark store-profile-action-btn"
            label="Como llegar"
          />
          <div className="store-profile-action-report">
            <ReportButton
              returnPath={`/tiendas/${business.slug}`}
              targetId={business.id}
              targetName={business.name}
              targetType="business"
            />
          </div>
        </section>

        {/* ─── Resumen compacto ─── */}
        <section className="store-profile-summary">
          <article className="store-profile-stat">
            <strong>{allProducts.length}</strong>
            <span>Productos</span>
          </article>
          <article className="store-profile-stat">
            <strong>{featuredProducts.length}</strong>
            <span>Destacados</span>
          </article>
          <article className="store-profile-stat">
            <strong>{timeOnPlatform(business.created_at)}</strong>
            <span>En Comercio Digital</span>
          </article>
        </section>

        {/* ─── Carrusel de fotografias del establecimiento ─── */}
        {galleryImages.length > 0 ? (
          <section className="store-profile-gallery-section" aria-label="Fotografias del establecimiento">
            <h2 className="store-profile-section-title">Fotografias del establecimiento</h2>
            <div className="store-profile-gallery-scroll">
              {galleryImages.map((image, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={image.alt}
                  className="store-profile-gallery-img"
                  decoding="async"
                  key={image.url + index}
                  loading="lazy"
                  src={image.url}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* ─── Pestañas: Productos / Destacados / Mas consultados / Informacion ─── */}
        <StoreProfileTabs
          allProducts={allProducts}
          featuredProducts={featuredProducts}
          mostViewedProducts={mostViewedProducts}
          business={{
            description: business.description,
            city: business.city,
            address: business.address,
            neighborhood: business.neighborhood,
            shopping_center: business.shopping_center,
            floor: business.floor,
            local_number: business.local_number,
            landmark: business.landmark,
            whatsapp: business.whatsapp,
          }}
          hours={hours}
          dayNames={dayNames}
          formatTime12Hour={formatTime12Hour}
        />
      </div>
    </main>
  );
}
