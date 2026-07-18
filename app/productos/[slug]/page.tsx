import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ContactButton } from "@/components/ContactButton";
import { DirectionsLink } from "@/components/DirectionsLink";
import { FavoriteButton } from "@/components/FavoriteButton";
import { InventoryBadge } from "@/components/InventoryBadge";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
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
    description: string | null;
    logo_url: string | null;
    name: string;
    slug: string;
    whatsapp: string | null;
  } | null;
  categories: { name: string } | null;
  subcategories: { name: string } | null;
  product_images: { url: string; alt_text: string | null }[];
  product_attribute_values: {
    value: string;
    category_attributes: { name: string; sort_order: number } | null;
  }[];
  product_variants: {
    id: string;
    name: string;
    option_values: Record<string, string>;
    price: number | null;
    stock: number;
  }[];
};

type RelatedProductRow = {
  name: string;
  slug: string;
  price: number | null;
  currency: string;
  stock: number | null;
  categories: { name: string } | null;
  product_images: { url: string }[];
  product_attribute_values: {
    value: string;
    category_attributes: { name: string; sort_order: number } | null;
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
      "id, name, slug, description, price, currency, stock, updated_at, businesses!inner(id, address, city, description, logo_url, name, slug, whatsapp), categories(name), subcategories(name), product_images(url, alt_text), product_attribute_values(value, category_attributes(name, sort_order)), product_variants(id, name, option_values, price, stock)",
    )
    .eq("slug", slug)
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .eq("businesses.status", "active")
    .single();

  if (error || !data) notFound();

  const product = data as ProductDetail;
  const business = product.businesses;
  const attributes = [...(product.product_attribute_values ?? [])].sort(
    (first, second) =>
      (first.category_attributes?.sort_order ?? 0) -
      (second.category_attributes?.sort_order ?? 0),
  );
  const variants = product.product_variants ?? [];
  const isOutOfStock = getInventoryState(product.stock) === "out";
  const whatsappMessage = encodeURIComponent(
    `Hola, vi ${product.name} en Comercio Digital. Quiero mas informacion.`,
  );

  const { data: relatedData } = await supabase
    .from("products")
    .select("name, slug, price, currency, stock, categories(name), product_images(url), product_attribute_values(value, category_attributes(name, sort_order))")
    .eq("business_id", business?.id ?? "")
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .neq("id", product.id)
    .or("stock.gt.0,stock.is.null")
    .order("updated_at", { ascending: false })
    .limit(4);

  const relatedProducts = ((relatedData ?? []) as RelatedProductRow[]).map((related) => ({
    name: related.name,
    slug: related.slug,
    businessName: business?.name ?? "Tienda por confirmar",
    category: related.categories?.name ?? "Sin categoria",
    price: formatPrice(related.price, related.currency),
    stock: related.stock,
    attributes: [...(related.product_attribute_values ?? [])]
      .sort(
        (first, second) =>
          (first.category_attributes?.sort_order ?? 0) -
          (second.category_attributes?.sort_order ?? 0),
      )
      .slice(0, 2)
      .map((attribute) => attribute.value),
    imageUrl: related.product_images?.[0]?.url ?? null,
  }));

  return (
    <main className="shell">
      <AppHeader />
      <div className="container product-detail-page">
        <nav aria-label="Ruta de navegacion" className="product-breadcrumbs">
          <Link href="/buscar">Buscar</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/buscar?category=${encodeURIComponent(product.categories?.name ?? "")}`}>
            {product.categories?.name ?? "Productos"}
          </Link>
          <span aria-hidden="true">/</span>
          <span>{product.name}</span>
        </nav>

        <div className="product-detail-layout">
          <ProductGallery images={product.product_images ?? []} productName={product.name} />

          <article className="product-summary">
            <p className="product-detail-category">
              {product.categories?.name ?? "Sin categoria"}
              {product.subcategories?.name ? ` / ${product.subcategories.name}` : ""}
            </p>
            <h1>{product.name}</h1>
            <strong className="product-detail-price">
              {formatPrice(product.price, product.currency)}
            </strong>
            <p className="product-detail-description">
              {product.description || "Consulta directamente con la tienda los detalles de este producto."}
            </p>

            <div className="product-availability-row">
              <InventoryBadge stock={product.stock} />
              <span>
                Actualizado {new Intl.DateTimeFormat("es-CO", {
                  dateStyle: "medium",
                  timeZone: "America/Bogota",
                }).format(new Date(product.updated_at))}
              </span>
            </div>

            {attributes.length > 0 ? (
              <section aria-labelledby="product-features" className="product-features">
                <h2 id="product-features">Caracteristicas</h2>
                <dl>
                  {attributes.map((attribute) => (
                    <div key={`${attribute.category_attributes?.name}-${attribute.value}`}>
                      <dt>{attribute.category_attributes?.name ?? "Detalle"}</dt>
                      <dd>{attribute.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            {variants.length > 0 ? (
              <ProductVariantSelector
                basePrice={product.price}
                businessId={business?.id ?? ""}
                businessName={business?.name ?? "Tienda por confirmar"}
                currency={product.currency}
                productId={product.id}
                productName={product.name}
                returnPath={`/productos/${product.slug}`}
                variants={variants}
                whatsapp={business?.whatsapp}
              />
            ) : (
              <div className="product-primary-actions">
                {isOutOfStock ? (
                  <p className="muted">Este producto no esta disponible actualmente.</p>
                ) : (
                  <>
                    <ContactButton
                      businessId={business?.id ?? ""}
                      businessName={business?.name ?? "Tienda por confirmar"}
                      label="Escribir por WhatsApp"
                      message={whatsappMessage}
                      productId={product.id}
                      source="product_detail"
                      whatsapp={business?.whatsapp}
                    />
                    <ReservationButton
                      availableStock={product.stock}
                      productId={product.id}
                      productName={product.name}
                      returnPath={`/productos/${product.slug}`}
                    />
                  </>
                )}
              </div>
            )}

            <div className="product-secondary-actions">
              <FavoriteButton productId={product.id} returnPath={`/productos/${product.slug}`} />
              <DirectionsLink address={business?.address ?? null} city={business?.city ?? null} />
            </div>
          </article>

          <aside className="product-context" aria-label="Informacion de compra y tienda">
            <section className="product-context-block">
              <p className="product-context-kicker">Compra en tienda fisica</p>
              <h2>Ubicacion y disponibilidad</h2>
              <div className="product-context-status">
                <span aria-hidden="true" />
                <strong>{isOutOfStock ? "Agotado actualmente" : "Disponible para consultar"}</strong>
              </div>
              <address>
                {business?.address ?? "Direccion por confirmar"}
                <br />
                {business?.city ?? "Ciudad por confirmar"}
              </address>
              <DirectionsLink address={business?.address ?? null} city={business?.city ?? null} />
            </section>

            <section className="product-context-block product-store-summary">
              {business?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={`Logo de ${business.name}`} src={business.logo_url} />
              ) : (
                <span className="product-store-monogram" aria-hidden="true">
                  {business?.name?.slice(0, 2).toUpperCase() ?? "CD"}
                </span>
              )}
              <div>
                <p>Vendido por</p>
                <h2>{business?.name ?? "Tienda por confirmar"}</h2>
              </div>
              {business?.description ? <p>{business.description}</p> : null}
              <Link className="btn btn-dark" href={`/tiendas/${business?.slug ?? ""}`}>
                Ver perfil de la tienda
              </Link>
            </section>

            <section className="product-context-block product-trust-note">
              <h2>Antes de desplazarte</h2>
              <p>Confirma por WhatsApp la variante, el precio y la disponibilidad con la tienda.</p>
            </section>
          </aside>
        </div>

        {relatedProducts.length > 0 ? (
          <section aria-labelledby="related-products-title" className="product-related-section">
            <div className="product-section-heading">
              <div>
                <p>Mas opciones</p>
                <h2 id="related-products-title">Productos de {business?.name}</h2>
              </div>
              <Link href={`/tiendas/${business?.slug ?? ""}`}>Ver toda la tienda</Link>
            </div>
            <div className="product-related-grid">
              {relatedProducts.map((related) => (
                <ProductCard key={related.slug} product={related} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="product-report-section" aria-label="Seguridad de la publicacion">
          <div>
            <h2>Ayudanos a mantener informacion confiable</h2>
            <p>Informa si el precio, la disponibilidad o la descripcion no corresponden.</p>
          </div>
          <ReportButton
            returnPath={`/productos/${product.slug}`}
            targetId={product.id}
            targetName={product.name}
            targetType="product"
          />
        </section>
      </div>
    </main>
  );
}
