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

      <section
        className="container"
        style={{
          paddingTop: "72px",
          paddingBottom: "56px",
        }}
      >
        <div
          className="hero-grid animate-in"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.35fr) minmax(280px, 0.65fr)",
            gap: 24,
            alignItems: "stretch",
          }}
        >
          <div className="panel" style={{ padding: "40px 36px" }}>
            <span className="hero-badge">
              <span aria-hidden="true">&#9679;</span> Plataforma de Gregor Magnus
            </span>
            <h1
              className="hero-title"
              style={{
                fontSize: "clamp(2.2rem, 6vw, 4.6rem)",
                lineHeight: 1.02,
                margin: "20px 0 16px",
                letterSpacing: "-0.04em",
                fontWeight: 800,
              }}
            >
              Encuentra lo que buscas{" "}
              <span style={{ color: "var(--accent)" }}>sin recorrer</span> toda la ciudad.
            </h1>
            <p
              className="muted"
              style={{
                maxWidth: 560,
                fontSize: "1.12rem",
                lineHeight: 1.55,
              }}
            >
              Comercio Digital conecta compradores con tiendas fisicas: productos, precios,
              ubicacion y contacto directo por WhatsApp en una sola busqueda.
            </p>
            <form
              className="search-submit-row"
              action="/buscar"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 12,
                marginTop: 32,
              }}
            >
              <input
                className="input"
                name="q"
                placeholder="Buscar: iPhone, zapatillas, perfume, taladro..."
                style={{ minHeight: 56, fontSize: "1.05rem" }}
              />
              <button
                className="btn"
                type="submit"
                style={{ minHeight: 56, padding: "0 28px", fontSize: "1rem" }}
              >
                Buscar
              </button>
            </form>
            <div
              style={{
                display: "flex",
                gap: 28,
                marginTop: 36,
                flexWrap: "wrap",
              }}
            >
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

          <div
            className="panel"
            style={{
              padding: 28,
              display: "grid",
              alignContent: "center",
              gap: 20,
            }}
          >
            <div>
              <p className="kicker" style={{ marginBottom: 16 }}>
                Para comercios
              </p>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  marginBottom: 8,
                }}
              >
                Digitaliza tu tienda en minutos
              </h2>
              <p className="muted" style={{ fontSize: "0.96rem", lineHeight: 1.55 }}>
                Registra tu negocio, publica tus productos y recibe clientes por WhatsApp.
                Sin aplicaciones complicadas.
              </p>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <Link
                className="btn"
                href="/panel/registro"
                style={{ minHeight: 48, fontSize: "0.96rem" }}
              >
                Registrar mi tienda
              </Link>
              <Link
                className="btn btn-dark"
                href="/panel/login"
                style={{ minHeight: 48, fontSize: "0.96rem" }}
              >
                Entrar al panel
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: "32px 0" }}>
        <div className="how-it-works">
          <div className="how-it-works-step">
            <div className="how-it-works-icon" aria-hidden="true">
              &#128269;
            </div>
            <h3>Busca productos</h3>
            <p>Escribe lo que necesitas y encuentra tiendas cercanas que lo tienen disponible.</p>
          </div>
          <div className="how-it-works-step">
            <div className="how-it-works-icon" aria-hidden="true">
              &#128205;
            </div>
            <h3>Compara y elige</h3>
            <p>Revisa precios, distancia, horarios y disponibilidad antes de salir de casa.</p>
          </div>
          <div className="how-it-works-step">
            <div className="how-it-works-icon" aria-hidden="true">
              &#128172;
            </div>
            <h3>Contacta por WhatsApp</h3>
            <p>Habla directamente con el comercio, reserva tu producto y ve a recogerlo.</p>
          </div>
        </div>
      </section>

      {cities.length > 0 ? (
        <section className="container section">
          <div className="section-header">
            <div>
              <p className="kicker">Ciudades activas</p>
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

      {categories.length > 0 ? (
        <section className="container section">
          <div className="section-header">
            <div>
              <p className="kicker">Categorias</p>
              <h2>Categorias principales</h2>
            </div>
            <Link className="section-header-link" href="/buscar">
              Ver todas
            </Link>
          </div>
          <div className="grid-auto">
            {categories.map((category) => (
              <Link
                className="card"
                href={`/c/${defaultCitySlug}/categoria/${category.slug}`}
                key={category.slug}
              >
                <strong style={{ fontSize: "1.1rem" }}>{category.name}</strong>
                <p className="muted" style={{ marginTop: 6 }}>
                  {category.description ?? "Explora productos activos de esta categoria."}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {products.length > 0 ? (
        <section className="container section">
          <div className="section-header">
            <div>
              <p className="kicker">Destacados</p>
              <h2>Productos disponibles</h2>
            </div>
            <Link className="section-header-link" href="/buscar">
              Ver todos
            </Link>
          </div>
          <div className="grid-auto">
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

      {businesses.length > 0 ? (
        <section className="container section">
          <div className="section-header">
            <div>
              <p className="kicker">Tiendas</p>
              <h2>Comercios piloto</h2>
            </div>
            <Link className="section-header-link" href="/comerciantes">
              Ver todas
            </Link>
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

      <section className="container" style={{ padding: "48px 0 64px" }}>
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
            <Link
              className="btn btn-dark"
              href="/buscar"
              style={{ minHeight: 50, padding: "0 32px" }}
            >
              Explorar productos
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
