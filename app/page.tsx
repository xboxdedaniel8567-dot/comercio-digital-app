import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { BusinessCard } from "@/components/BusinessCard";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice } from "@/lib/format-price";
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
    city: string | null;
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

const CATEGORY_ICONS: Record<string, string> = {
  electronica: "📱",
  moda: "👕",
  hogar: "🏠",
  deportes: "⚽",
  belleza: "💄",
  alimentos: "🍔",
  ferreteria: "🔧",
  juguetes: "🧸",
};

function categoryIcon(name: string, slug: string) {
  return CATEGORY_ICONS[slug] ?? "📦";
}

export default async function Home() {
  const [categoriesResult, productsResult, businessesResult] = await Promise.all([
    supabase.from("categories").select("name, slug, description").order("name").limit(8),
    supabase
      .from("products")
      .select("name, slug, price, currency, stock, businesses!inner(name, city), categories(name), product_images(url)")
      .eq("status", "active")
      .eq("moderation_status", "approved")
      .eq("businesses.status", "active")
      .or("stock.gt.0,stock.is.null")
      .order("created_at", { ascending: false })
      .limit(8),
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
    businessCity: product.businesses?.city ?? null,
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
  const loadErrors = [
    categoriesResult.error ? `Categorias: ${categoriesResult.error.message}` : null,
    productsResult.error ? `Productos: ${productsResult.error.message}` : null,
    businessesResult.error ? `Comercios: ${businessesResult.error.message}` : null,
  ].filter(Boolean) as string[];

  return (
    <main className="shell">
      <AppHeader />

      {loadErrors.length > 0 ? (
        <section className="container" style={{ paddingTop: 24 }}>
          <div className="card" style={{ borderColor: "#ef4444" }} role="alert">
            <strong>Parte del contenido no se pudo cargar.</strong>
            {loadErrors.map((line) => (
              <p className="muted" key={line} style={{ marginBottom: 0 }}>
                {line}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {/* ─── HERO ─── */}
      <section className="home-hero">
        <div className="container home-hero-inner">
          <div className="home-hero-copy animate-in">
            <span className="hero-badge">
              <span aria-hidden="true" className="hero-badge-dot" />
              by Gregor Magnus
            </span>
            <h1 className="home-hero-title">
              Encuentra lo que buscas{" "}
              <span className="home-hero-accent">sin recorrer</span> toda la ciudad
            </h1>
            <p className="home-hero-subtitle">
              Comercio Digital conecta compradores con tiendas fisicas: productos, precios,
              ubicacion y contacto directo por WhatsApp en una sola busqueda.
            </p>
            <form action="/buscar" className="home-hero-search">
              <input
                aria-label="Buscar productos o tiendas"
                className="home-hero-search-input"
                name="q"
                placeholder="Buscar: iPhone, zapatillas, perfume, taladro..."
                type="search"
              />
              <button className="btn home-hero-search-btn" type="submit">Buscar</button>
            </form>
            <div className="home-hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">{businesses.length}</span>
                <span className="hero-stat-label">Tiendas activas</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">{products.length}</span>
                <span className="hero-stat-label">Productos disponibles</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">WhatsApp</span>
                <span className="hero-stat-label">Contacto directo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CÓMO FUNCIONA ─── */}
      <section className="container home-section">
        <div className="how-it-works">
          <div className="how-it-works-step">
            <div className="how-it-works-icon" aria-hidden="true">🔍</div>
            <h3>Busca productos</h3>
            <p>Escribe lo que necesitas y encuentra tiendas cercanas que lo tienen disponible.</p>
          </div>
          <div className="how-it-works-step">
            <div className="how-it-works-icon" aria-hidden="true">📍</div>
            <h3>Compara y elige</h3>
            <p>Revisa precios, distancia, horarios y disponibilidad antes de salir de casa.</p>
          </div>
          <div className="how-it-works-step">
            <div className="how-it-works-icon" aria-hidden="true">💬</div>
            <h3>Contacta por WhatsApp</h3>
            <p>Habla directamente con el comercio, reserva tu producto y ve a recogerlo.</p>
          </div>
        </div>
      </section>

      {/* ─── CATEGORÍAS ─── */}
      {categories.length > 0 ? (
        <section className="container home-section">
          <div className="section-header">
            <div>
              <p className="kicker">Categorias</p>
              <h2>Explora por categoria</h2>
            </div>
            <Link className="section-header-link" href="/buscar">Ver todas</Link>
          </div>
          <div className="home-category-grid">
            {categories.map((category) => (
              <Link
                className="home-category-card"
                href={`/c/${defaultCitySlug}/categoria/${category.slug}`}
                key={category.slug}
              >
                <span className="home-category-icon" aria-hidden="true">
                  {categoryIcon(category.name, category.slug)}
                </span>
                <span className="home-category-name">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ─── CIUDADES ─── */}
      {cities.length > 0 ? (
        <section className="container home-section">
          <div className="section-header">
            <div>
              <p className="kicker">Ciudades</p>
              <h2>Explora por ciudad</h2>
            </div>
          </div>
          <div className="grid-auto">
            {cities.map((city) => (
              <Link className="card" href={`/c/${city.slug}`} key={city.slug}>
                <strong style={{ fontSize: "1.15rem" }}>{city.name}</strong>
                <p className="muted" style={{ marginTop: 6 }}>
                  Explorar comercios y productos disponibles.
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ─── PRODUCTOS DESTACADOS ─── */}
      {products.length > 0 ? (
        <section className="container home-section">
          <div className="section-header">
            <div>
              <p className="kicker">Destacados</p>
              <h2>Productos disponibles ahora</h2>
            </div>
            <Link className="section-header-link" href="/buscar">Ver todos</Link>
          </div>
          <div className="home-product-grid">
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
      ) : null}

      {/* ─── TIENDAS ─── */}
      {businesses.length > 0 ? (
        <section className="container home-section">
          <div className="section-header">
            <div>
              <p className="kicker">Tiendas</p>
              <h2>Comercios piloto</h2>
            </div>
            <Link className="section-header-link" href="/comerciantes">Ver todas</Link>
          </div>
          <div className="grid-auto">
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
      ) : null}

      {/* ─── CTA COMERCIANTES ─── */}
      <section className="container home-section">
        <div className="cta-band">
          <h2>Tu tienda tambien puede estar aqui</h2>
          <p>
            Une tu comercio a Comercio Digital y llega a mas clientes en tu ciudad. Registro
            gratuito, configuracion en minutos.
          </p>
          <div className="cta-band-actions">
            <Link className="btn" href="/panel/registro" style={{ minHeight: 50, padding: "0 32px" }}>
              Registrar mi tienda
            </Link>
            <Link className="btn btn-dark" href="/buscar" style={{ minHeight: 50, padding: "0 32px" }}>
              Explorar productos
            </Link>
          </div>
        </div>
      </section>

      <AppFooter />
    </main>
  );
}
