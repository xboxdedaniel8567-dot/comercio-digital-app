import { AppHeader } from "@/components/AppHeader";
import { BusinessCard } from "@/components/BusinessCard";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

type CityPageProps = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  const cityName = formatCity(city);
  const title = `Productos y tiendas en ${cityName}`;
  const description = `Encuentra productos disponibles en comercios fisicos de ${cityName} y contacta directamente por WhatsApp.`;

  return {
    title,
    description,
    alternates: { canonical: `/c/${city}` },
    openGraph: { title, description, type: "website", url: `/c/${city}` },
  };
}

type BusinessRow = {
  name: string;
  slug: string;
  city: string;
  address: string | null;
  status: string;
  categories: {
    name: string;
  } | null;
};

type ProductRow = {
  name: string;
  slug: string;
  price: number | null;
  currency: string;
  stock: number | null;
  businesses: {
    name: string;
    city: string;
  } | null;
  categories: {
    name: string;
  } | null;
  product_images: {
    url: string;
  }[];
};

function formatCity(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatPrice(price: number | null, currency: string) {
  if (price === null) return "Precio por consultar";

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function CityPage({ params }: CityPageProps) {
  const { city } = await params;
  const cityName = formatCity(city);

  const [businessesResult, productsResult] = await Promise.all([
    supabase
      .from("businesses")
      .select("name, slug, city, address, status, categories(name)")
      .eq("status", "active")
      .eq("city_slug", city)
      .order("created_at", { ascending: false })
      .limit(24),
    supabase
      .from("products")
      .select("name, slug, price, currency, stock, businesses!inner(name, city), categories(name), product_images(url)")
      .eq("status", "active")
      .eq("moderation_status", "approved")
      .eq("businesses.status", "active")
      .or("stock.gt.0,stock.is.null")
      .eq("businesses.city_slug", city)
      .order("created_at", { ascending: false })
      .limit(24),
  ]);

  const businesses = ((businessesResult.data ?? []) as BusinessRow[]).map((business) => ({
    name: business.name,
    slug: business.slug,
    category: business.categories?.name ?? "Sin categoria",
    city: business.city,
    address: business.address ?? "Direccion por confirmar",
    status: "Activo",
  }));

  const products = ((productsResult.data ?? []) as ProductRow[]).map((product) => ({
    name: product.name,
    slug: product.slug,
    businessName: product.businesses?.name ?? "Tienda por confirmar",
    category: product.categories?.name ?? "Sin categoria",
    price: formatPrice(product.price, product.currency),
    stock: product.stock,
    attributes: [],
    imageUrl: product.product_images?.[0]?.url ?? null,
  }));

  return (
    <main className="shell">
      <AppHeader />
      <section className="container section">
        <p className="kicker">Ciudad piloto</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 4.4rem)", margin: "10px 0" }}>
          Comercio en {cityName}
        </h1>
        {businessesResult.error ? (
          <div className="card" style={{ borderColor: "#ef4444", marginTop: 24 }}>
            <strong>No se pudieron cargar los comercios.</strong>
            <p className="muted">{businessesResult.error.message}</p>
          </div>
        ) : null}
        <div className="grid-auto" style={{ marginTop: 24 }}>
          {businesses.map((business) => (
            <BusinessCard business={business} key={business.slug} />
          ))}
        </div>
        {!businessesResult.error && businesses.length === 0 ? (
          <p className="muted" style={{ marginTop: 18 }}>
            Todavia no hay comercios activos para esta ciudad.
          </p>
        ) : null}
        <h2 style={{ marginTop: 42 }}>Productos recientes</h2>
        {productsResult.error ? (
          <div className="card" style={{ borderColor: "#ef4444", marginTop: 18 }}>
            <strong>No se pudieron cargar los productos.</strong>
            <p className="muted">{productsResult.error.message}</p>
          </div>
        ) : null}
        <div className="grid-auto" style={{ marginTop: 18 }}>
          {products.map((product) => (
            <ProductCard product={product} key={product.slug} />
          ))}
        </div>
        {!productsResult.error && products.length === 0 ? (
          <p className="muted" style={{ marginTop: 18 }}>
            Todavia no hay productos activos para esta ciudad.
          </p>
        ) : null}
      </section>
    </main>
  );
}
import type { Metadata } from "next";
