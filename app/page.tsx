import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { ShellIcon } from "@/components/ShellIcon";
import { StoreCard } from "@/components/StoreCard";
import { StoreCardSkeleton } from "@/components/StoreCardSkeleton";
import { Alert } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { firstRelation } from "@/lib/supabase-relations";

export const metadata: Metadata = {
  title: "Comercio Digital - Busca productos en comercios fisicos",
  description:
    "Encuentra productos disponibles y comercios fisicos de tu ciudad en Comercio Digital.",
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
  businesses: { name: string; city: string | null } | null;
  categories: { name: string } | null;
  product_images: { url: string }[];
};

type BusinessRow = {
  name: string;
  slug: string;
  city: string;
  city_slug: string;
  address: string | null;
  status: string;
  logo_url: string | null;
  cover_url: string | null;
  categories: { name: string } | null;
};

function HomeLoading() {
  return (
    <main className="shell">
      <AppHeader />
      <div aria-label="Cargando inicio" className="home-pilot container">
        <section className="home-entry home-entry-loading">
          <div className="cd-skeleton home-loading-search" />
          <div className="cd-skeleton home-loading-categories" />
        </section>
        <section aria-label="Cargando productos" className="home-pilot-section">
          <div className="home-product-grid">
            {Array.from({ length: 4 }, (_, index) => <ProductCardSkeleton key={index} />)}
          </div>
        </section>
        <section aria-label="Cargando comercios" className="home-pilot-section home-store-list">
          <StoreCardSkeleton />
          <StoreCardSkeleton />
        </section>
      </div>
    </main>
  );
}

async function HomeContent() {
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
      .select("name, slug, city, city_slug, address, status, logo_url, cover_url, categories(name)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const categories = (categoriesResult.data ?? []) as CategoryRow[];
  const products = (productsResult.data ?? [])
    .map((row) => ({
      ...row,
      businesses: firstRelation(row.businesses),
      categories: firstRelation(row.categories),
    }))
    .map((product: ProductRow) => ({
      name: product.name,
      slug: product.slug,
      businessName: product.businesses?.name ?? "Tienda por confirmar",
      businessCity: product.businesses?.city ?? null,
      category: product.categories?.name ?? "Sin categoria",
      price: product.price,
      currency: product.currency,
      stock: product.stock,
      attributes: [],
      imageUrl: product.product_images?.[0]?.url ?? null,
    }));
  const businessRows: BusinessRow[] = (businessesResult.data ?? []).map((business) => ({
    ...business,
    categories: firstRelation(business.categories),
  }));
  const businesses = businessRows.map((business) => ({
    name: business.name,
    slug: business.slug,
    category: business.categories?.name ?? "Sin categoria",
    city: business.city,
    address: business.address ?? "Direccion por confirmar",
    status: business.status === "active" ? "Activo" : business.status,
    imageUrl: business.cover_url ?? business.logo_url,
  }));
  const cities = [
    ...new Map(
      businessRows
        .filter((business) => business.city_slug)
        .map((business) => [business.city_slug, { name: business.city, slug: business.city_slug }]),
    ).values(),
  ];
  const defaultCitySlug = cities[0]?.slug ?? null;
  const hasLoadErrors = Boolean(categoriesResult.error || productsResult.error || businessesResult.error);

  return (
    <main className="shell">
      <AppHeader />
      <div className="home-pilot container">
        <section aria-labelledby="home-title" className="home-entry">
          <h1 className="sr-only" id="home-title">Buscar productos en comercios fisicos</h1>
          <form action="/buscar" className="home-search" method="get" role="search">
            <ShellIcon name="search" size={22} />
            <label className="sr-only" htmlFor="home-search-input">Buscar productos, marcas o comercios</label>
            <input
              autoComplete="off"
              id="home-search-input"
              name="q"
              placeholder="Buscar productos, marcas o comercios"
              type="search"
            />
            <button type="submit">Buscar</button>
          </form>
          {categories.length > 0 ? (
            <div className="home-category-block">
              <div className="home-category-heading">
                <h2>Explora por categoria</h2>
                <Link href="/buscar">Ver todas</Link>
              </div>
              <nav aria-label="Categorias para explorar" className="home-quick-categories">
                {categories.map((category) => (
                  <Link
                    href={defaultCitySlug ? `/c/${defaultCitySlug}/categoria/${category.slug}` : `/buscar?category=${category.slug}`}
                    key={category.slug}
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            </div>
          ) : null}
        </section>

        {hasLoadErrors ? (
          <Alert
            action={<Link className="home-inline-action" href="/">Reintentar</Link>}
            message="Puedes seguir buscando mientras recuperamos el contenido que falta."
            title="Algunas secciones no estan disponibles"
            tone="warning"
          />
        ) : null}

        <section aria-labelledby="home-products-title" className="home-pilot-section">
          <div className="home-section-heading">
            <div>
              <p className="kicker">Productos</p>
              <h2 id="home-products-title">Productos disponibles</h2>
            </div>
            <Link href="/buscar">Ver todos</Link>
          </div>
          {products.length > 0 ? (
            <div className="home-product-grid">
              {products.map((product, index) => (
                <ProductCard imagePriority={index < 2} key={product.slug} product={product} />
              ))}
            </div>
          ) : !productsResult.error ? (
            <EmptyState
              action={<Link className="home-empty-action" href="/buscar">Explorar busqueda</Link>}
              description="Cuando los comercios publiquen productos disponibles, apareceran en esta seccion."
              icon={<ShellIcon name="package" />}
              title="Todavia no hay productos para mostrar"
            />
          ) : null}
        </section>

        <section aria-labelledby="home-stores-title" className="home-pilot-section">
          <div className="home-section-heading">
            <div>
              <p className="kicker">Comercios</p>
              <h2 id="home-stores-title">Comercios para explorar</h2>
            </div>
            <Link href="/comerciantes">Ver directorio</Link>
          </div>
          {businesses.length > 0 ? (
            <div className="home-store-list">
              {businesses.map((business) => <StoreCard business={business} key={business.slug} />)}
            </div>
          ) : !businessesResult.error ? (
            <EmptyState
              action={<Link className="home-empty-action" href="/panel/registro">Registrar un comercio</Link>}
              description="Los comercios activos de la ciudad apareceran aqui."
              icon={<ShellIcon name="store" />}
              title="Todavia no hay comercios para mostrar"
            />
          ) : null}
        </section>

        <section aria-labelledby="home-nearby-title" className="home-nearby-entry">
          <div className="home-nearby-icon" aria-hidden="true"><ShellIcon name="map-pin" size={24} /></div>
          <div>
            <p className="kicker">Comercio local</p>
            <h2 id="home-nearby-title">Cerca de ti</h2>
            <p>Explora comercios y consulta la ubicacion que cada establecimiento ha publicado.</p>
          </div>
          <Link href="/comerciantes">Explorar comercios</Link>
        </section>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}
