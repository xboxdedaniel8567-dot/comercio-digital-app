import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { BusinessCard } from "@/components/BusinessCard";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Comercio Digital - Busca productos en comercios fisicos",
  description:
    "Encuentra productos, compara tiendas y habla por WhatsApp con comercios fisicos de tu ciudad.",
};

type CategoryRow = {
  name: string;
  slug: string;
  description: string | null;
};

type ProductRow = {
  name: string;
  slug: string;
  price: number | null;
  currency: string;
  stock: number | null;
  businesses: {
    name: string;
  } | null;
  categories: {
    name: string;
  } | null;
  product_images: {
    url: string;
  }[];
};

type BusinessRow = {
  name: string;
  slug: string;
  city: string;
  city_slug: string;
  address: string | null;
  status: string;
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

export default async function Home() {
  const [categoriesResult, productsResult, businessesResult] = await Promise.all([
    supabase.from("categories").select("name, slug, description").order("name").limit(8),
    supabase
      .from("products")
      .select("name, slug, price, currency, stock, businesses!inner(name), categories(name), product_images(url)")
      .eq("status", "active")
      .eq("moderation_status", "approved")
      .eq("businesses.status", "active")
      .or("stock.gt.0,stock.is.null")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("businesses")
      .select("name, slug, city, city_slug, address, status, categories(name)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const categories = (categoriesResult.data ?? []) as CategoryRow[];
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
  const businessRows = (businessesResult.data ?? []) as BusinessRow[];
  const businesses = businessRows.map((business) => ({
    name: business.name,
    slug: business.slug,
    category: business.categories?.name ?? "Sin categoria",
    city: business.city,
    address: business.address ?? "Direccion por confirmar",
    status: business.status === "active" ? "Activo" : business.status,
  }));
  const cities = [
    ...new Map(
      businessRows
        .filter((business) => business.city_slug)
        .map((business) => [business.city_slug, { name: business.city, slug: business.city_slug }]),
    ).values(),
  ];
  const defaultCitySlug = cities[0]?.slug ?? "cali-valle-del-cauca";

  return (
    <main className="shell">
      <AppHeader />
      <section className="container" style={{ padding: "72px 0 48px" }}>
        <div
          className="hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.25fr) minmax(280px, 0.75fr)",
            gap: 24,
            alignItems: "stretch",
          }}
        >
          <div className="panel" style={{ padding: 28 }}>
            <p className="kicker">Fabricado por Gregor Magnus</p>
            <h1
              className="hero-title"
              style={{
                fontSize: "clamp(2.4rem, 7vw, 5.8rem)",
                lineHeight: 0.94,
                margin: "16px 0",
                letterSpacing: "-0.04em",
              }}
            >
              Encuentra lo que buscas sin recorrer toda la ciudad.
            </h1>
            <p className="muted" style={{ maxWidth: 720, fontSize: "1.08rem" }}>
              Comercio Digital conecta compradores con tiendas fisicas:
              productos, precios, ubicacion y contacto directo por WhatsApp en
              una sola busqueda.
            </p>
            <form
              className="search-submit-row"
              action="/buscar"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 10,
                marginTop: 28,
              }}
            >
              <input
                className="input"
                name="q"
                placeholder="Buscar: iPhone, zapatillas, perfume, taladro..."
              />
              <button className="btn" type="submit">
                Buscar
              </button>
            </form>
          </div>

          <div className="panel" style={{ padding: 22 }}>
            <p className="kicker">MVP Cali</p>
            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
              {[
                ["Tiendas activas", String(businesses.length)],
                ["Productos activos", String(products.length)],
                ["Contacto", "WhatsApp"],
                ["Modelo", "Web/PWA"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid var(--line)",
                    paddingBottom: 12,
                  }}
                >
                  <span className="muted">{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gap: 10, marginTop: 22 }}>
              <Link className="btn" href="/panel/registro">
                Registrar mi tienda
              </Link>
              <Link className="btn btn-dark" href="/panel/login">
                Entrar al panel
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <p className="kicker">Ciudades activas</p>
        <div className="grid-auto" style={{ marginTop: 18 }}>
          {cities.map((city) => (
            <Link className="card" href={`/c/${city.slug}`} key={city.slug}>
              <strong>{city.name}</strong>
              <p className="muted">Explorar comercios y productos disponibles.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <p className="kicker">Categorias iniciales</p>
        <div className="grid-auto" style={{ marginTop: 18 }}>
          {categories.map((category) => (
            <Link className="card" href={`/c/${defaultCitySlug}/categoria/${category.slug}`} key={category.slug}>
              <strong>{category.name}</strong>
              <p className="muted">{category.description ?? "Explora productos activos de esta categoria."}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <p className="kicker">Productos de ejemplo</p>
        <div className="grid-auto" style={{ marginTop: 18 }}>
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        {productsResult.error ? (
          <p className="muted" style={{ marginTop: 16 }}>
            No se pudieron cargar los productos: {productsResult.error.message}
          </p>
        ) : null}
      </section>

      <section className="container section">
        <p className="kicker">Comercios piloto</p>
        <div className="grid-auto" style={{ marginTop: 18 }}>
          {businesses.map((business) => (
            <BusinessCard business={business} key={business.slug} />
          ))}
        </div>
        {businessesResult.error ? (
          <p className="muted" style={{ marginTop: 16 }}>
            No se pudieron cargar los comercios: {businessesResult.error.message}
          </p>
        ) : null}
      </section>
    </main>
  );
}
