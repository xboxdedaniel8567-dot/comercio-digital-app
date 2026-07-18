import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ContactButton } from "@/components/ContactButton";
import { DirectionsLink } from "@/components/DirectionsLink";
import { FavoriteButton } from "@/components/FavoriteButton";
import { InventoryBadge } from "@/components/InventoryBadge";
import { ProductVariantSelector } from "@/components/ProductVariantSelector";
import { ReportButton } from "@/components/ReportButton";
import { ReservationButton } from "@/components/ReservationButton";
import { getInventoryState } from "@/lib/inventory";
import { supabase } from "@/lib/supabase";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabase
    .from("products")
    .select("name, description, product_images(url), businesses(name)")
    .eq("slug", slug)
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .maybeSingle();

  if (!data) return { title: "Producto no disponible | Comercio Digital" };

  const product = data as {
    name: string;
    description: string | null;
    product_images: { url: string }[];
    businesses: { name: string } | null;
  };
  const title = `${product.name} en ${product.businesses?.name ?? "Comercio Digital"}`;
  const description = product.description || `Consulta precio, disponibilidad y tienda de ${product.name}.`;
  const image = product.product_images?.[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/productos/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/productos/${slug}`,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
  };
}

type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  currency: string;
  stock: number | null;
  updated_at: string;
  businesses: {
    id: string;
    address: string | null;
    city: string | null;
    name: string;
    slug: string;
    whatsapp: string | null;
  } | null;
  categories: {
    name: string;
  } | null;
  subcategories: {
    name: string;
  } | null;
  product_images: {
    url: string;
    alt_text: string | null;
  }[];
  product_attribute_values: {
    value: string;
    category_attributes: {
      name: string;
      sort_order: number;
    } | null;
  }[];
  product_variants: {
    id: string;
    name: string;
    option_values: Record<string, string>;
    price: number | null;
    stock: number;
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

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, price, currency, stock, updated_at, businesses!inner(id, address, city, name, slug, whatsapp), categories(name), subcategories(name), product_images(url, alt_text), product_attribute_values(value, category_attributes(name, sort_order)), product_variants(id, name, option_values, price, stock)",
    )
    .eq("slug", slug)
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .eq("businesses.status", "active")
    .single();

  if (error || !data) {
    notFound();
  }

  const product = data as ProductDetail;
  const message = encodeURIComponent(
    `Hola, vi ${product.name} en Comercio Digital. Quiero mas informacion.`
  );
  const whatsapp = product.businesses?.whatsapp;
  const image = product.product_images?.[0] ?? null;
  const attributes = [...(product.product_attribute_values ?? [])].sort(
    (first, second) =>
      (first.category_attributes?.sort_order ?? 0) -
      (second.category_attributes?.sort_order ?? 0),
  );
  const isOutOfStock = getInventoryState(product.stock) === "out";
  const variants = product.product_variants ?? [];

  return (
    <main className="shell">
      <AppHeader />
      <section className="container section">
        <div className="product-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div
            className="panel"
            style={{
              minHeight: 420,
              background:
                "linear-gradient(135deg, #262626 0%, #0b0b0b 56%, #171717 100%)",
              overflow: "hidden",
            }}
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={image.alt_text ?? product.name}
                src={image.url}
                style={{
                  display: "block",
                  height: "100%",
                  objectFit: "contain",
                  width: "100%",
                }}
              />
            ) : null}
          </div>
          <div>
            <p className="kicker">
              {product.categories?.name ?? "Sin categoria"}
              {product.subcategories?.name ? ` / ${product.subcategories.name}` : ""}
            </p>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 4.2rem)", margin: "10px 0" }}>
              {product.name}
            </h1>
            <strong style={{ fontSize: "1.6rem" }}>
              {formatPrice(product.price, product.currency)}
            </strong>
            <p className="muted" style={{ fontSize: "1.04rem" }}>
              {product.description}
            </p>
            <p className="muted" style={{ fontSize: "0.86rem" }}>
              Disponibilidad confirmada: {new Intl.DateTimeFormat("es-CO", {
                dateStyle: "medium",
                timeZone: "America/Bogota",
              }).format(new Date(product.updated_at))}
            </p>
            {attributes.length > 0 ? (
              <section
                aria-labelledby="product-features"
                style={{ borderTop: "1px solid var(--line)", marginTop: 24, paddingTop: 18 }}
              >
                <h2 id="product-features" style={{ fontSize: "1rem", margin: "0 0 14px" }}>
                  Caracteristicas
                </h2>
                <dl
                  style={{
                    display: "grid",
                    gap: 10,
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    margin: 0,
                  }}
                >
                  {attributes.map((attribute) => (
                    <div key={`${attribute.category_attributes?.name}-${attribute.value}`}>
                      <dt className="muted" style={{ fontSize: "0.82rem" }}>
                        {attribute.category_attributes?.name ?? "Detalle"}
                      </dt>
                      <dd style={{ margin: "3px 0 0" }}>{attribute.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "22px 0" }}>
              <InventoryBadge stock={product.stock} />
              <span className="card" style={{ padding: "8px 10px" }}>
                Tienda: {product.businesses?.name ?? "Por confirmar"}
              </span>
            </div>
            {variants.length > 0 ? (
              <ProductVariantSelector
                basePrice={product.price}
                businessId={product.businesses?.id ?? ""}
                businessName={product.businesses?.name ?? "Tienda por confirmar"}
                currency={product.currency}
                productId={product.id}
                productName={product.name}
                returnPath={`/productos/${product.slug}`}
                variants={variants}
                whatsapp={whatsapp}
              />
            ) : null}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {variants.length > 0 ? null : isOutOfStock ? (
                <span className="muted">Este producto no esta disponible actualmente.</span>
              ) : (
                <ContactButton
                  businessId={product.businesses?.id ?? ""}
                  businessName={product.businesses?.name ?? "Tienda por confirmar"}
                  label="Contactar por WhatsApp"
                  message={message}
                  productId={product.id}
                  source="product_detail"
                  whatsapp={whatsapp}
                />
              )}
              <Link className="btn btn-dark" href={`/tiendas/${product.businesses?.slug ?? ""}`}>
                Ver tienda
              </Link>
              <DirectionsLink
                address={product.businesses?.address ?? null}
                city={product.businesses?.city ?? null}
              />
              <FavoriteButton productId={product.id} returnPath={`/productos/${product.slug}`} />
              {variants.length === 0 && !isOutOfStock ? (
                <ReservationButton
                  availableStock={product.stock}
                  productId={product.id}
                  productName={product.name}
                  returnPath={`/productos/${product.slug}`}
                />
              ) : null}
            </div>
            <div style={{ marginTop: 14 }}>
              <ReportButton
                returnPath={`/productos/${product.slug}`}
                targetId={product.id}
                targetName={product.name}
                targetType="product"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
