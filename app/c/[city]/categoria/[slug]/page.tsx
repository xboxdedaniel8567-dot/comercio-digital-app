import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice } from "@/lib/format-price";
import { supabase } from "@/lib/supabase";
import { firstRelation } from "@/lib/supabase-relations";

type CategoryPageProps = {
  params: Promise<{ city: string; slug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { city, slug } = await params;
  const cityName = formatCity(city);
  const { data } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .maybeSingle();
  const category = data as { name: string; description: string | null } | null;
  const categoryName = category?.name ?? "Productos";
  const title = `${categoryName} en ${cityName}`;
  const description = category?.description || `Explora ${categoryName.toLowerCase()} disponibles en comercios de ${cityName}.`;

  return {
    title,
    description,
    alternates: { canonical: `/c/${city}/categoria/${slug}` },
    openGraph: { title, description, type: "website", url: `/c/${city}/categoria/${slug}` },
  };
}

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
    city: string;
  } | null;
  categories: {
    name: string;
    slug: string;
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { city, slug } = await params;
  const cityName = formatCity(city);

  const [categoryResult, productsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("name, slug, description")
      .eq("slug", slug)
      .maybeSingle(),
    supabase
      .from("products")
      .select("name, slug, price, currency, stock, businesses!inner(name, city), categories!inner(name, slug), product_images(url)")
      .eq("status", "active")
      .eq("moderation_status", "approved")
      .eq("businesses.status", "active")
      .eq("categories.slug", slug)
      .or("stock.gt.0,stock.is.null")
      .eq("businesses.city_slug", city)
      .order("created_at", { ascending: false })
      .limit(48),
  ]);

  const category = categoryResult.data as CategoryRow | null;
  const products = (productsResult.data ?? []).map((row) => ({
    ...row,
    businesses: firstRelation(row.businesses),
    categories: firstRelation(row.categories),
  })).map((product: ProductRow) => ({
    name: product.name,
    slug: product.slug,
    businessName: product.businesses?.name ?? "Tienda por confirmar",
    category: product.categories?.name ?? category?.name ?? "Sin categoria",
    price: formatPrice(product.price, product.currency),
    stock: product.stock,
    attributes: [],
    imageUrl: product.product_images?.[0]?.url ?? null,
  }));

  return (
    <main className="shell">
      <AppHeader />
      <section className="container section">
        <p className="kicker">{cityName}</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 4.4rem)", margin: "10px 0" }}>
          {category?.name ?? `Categoria: ${slug}`}
        </h1>
        {category?.description ? (
          <p className="muted" style={{ maxWidth: 720 }}>{category.description}</p>
        ) : null}
        {categoryResult.error || productsResult.error ? (
          <div className="card" style={{ borderColor: "#ef4444", marginTop: 24 }}>
            <strong>No se pudieron cargar los productos.</strong>
            <p className="muted">{categoryResult.error?.message ?? productsResult.error?.message}</p>
          </div>
        ) : null}
        <div className="grid-auto" style={{ marginTop: 24 }}>
          {products.map((product) => (
            <ProductCard product={product} key={product.slug} />
          ))}
        </div>
        {!categoryResult.error && !productsResult.error && products.length === 0 ? (
          <p className="muted" style={{ marginTop: 18 }}>
            Todavia no hay productos activos en esta categoria para esta ciudad.
          </p>
        ) : null}
      </section>
    </main>
  );
}

