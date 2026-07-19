"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductModerationActions } from "@/components/ProductModerationActions";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/lib/supabase";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  moderation_status: string;
  moderation_note: string | null;
  price: number | null;
  currency: string;
  stock: number | null;
  businesses: { name: string } | null;
  categories: { name: string } | null;
  product_images: { url: string }[];
};

function formatPrice(price: number | null, currency: string) {
  if (price === null) return "Precio por consultar";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function publicationLabel(status: string) {
  if (status === "active") return "Publicado";
  if (status === "draft") return "Oculto por comerciante";
  if (status === "pending_review") return "Pendiente";
  return status;
}

function moderationLabel(status: string) {
  if (status === "approved") return "Aprobado";
  if (status === "under_review") return "En revision";
  if (status === "rejected") return "Rechazado";
  return status;
}

function moderationTone(status: string): "danger" | "info" | "success" {
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  return "info";
}

export function AdminProductsManager() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [query, setQuery] = useState("");
  const [moderationFilter, setModerationFilter] = useState("all");
  const [message, setMessage] = useState("Cargando todos los productos...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      const { data, error: loadError } = await supabase
        .from("products")
        .select(
          "id, name, slug, status, moderation_status, moderation_note, price, currency, stock, businesses(name), categories(name), product_images(url)",
        )
        .order("created_at", { ascending: false })
        .limit(100);

      if (loadError) {
        setError(loadError.message);
        setMessage("");
        return;
      }

      setProducts((data ?? []) as ProductRow[]);
      setMessage("");
    }

    void loadProducts();
  }, []);

  if (message) return <p className="muted">{message}</p>;

  const visibleProducts = products.filter((product) => {
    const matchesQuery = `${product.name} ${product.businesses?.name ?? ""} ${product.categories?.name ?? ""}`
      .toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (moderationFilter === "all" || product.moderation_status === moderationFilter);
  });

  return (
    <div className="admin-workspace">
      <section className="admin-toolbar panel">
        <div><span className="eyebrow">Catalogo global</span><h2>{products.length} productos registrados</h2></div>
        <div className="admin-toolbar-controls">
          <label><span className="sr-only">Buscar productos</span><input className="input" onChange={(event) => setQuery(event.target.value)} placeholder="Buscar producto, tienda o categoria" value={query} /></label>
          <label><span className="sr-only">Filtrar moderacion</span><select className="input" onChange={(event) => setModerationFilter(event.target.value)} value={moderationFilter}><option value="all">Todos los estados</option><option value="under_review">En revision</option><option value="approved">Aprobados</option><option value="rejected">Rechazados</option></select></label>
        </div>
      </section>
      {error ? (
        <div className="card" style={{ borderColor: "#ef4444" }}>
          <strong>No se pudieron cargar los productos.</strong>
          <p className="muted">{error}</p>
        </div>
      ) : null}
      <div className="admin-record-list">
      {visibleProducts.map((product) => (
        <article className="admin-product-row" key={product.id}>
          <div className="admin-product-media">
            {product.product_images?.[0]?.url ? (
              <img alt={product.name} src={product.product_images[0].url} />
            ) : <span>Sin imagen</span>}
          </div>
          <div className="admin-record-copy">
            <div className="admin-record-title"><strong>{product.name}</strong><StatusBadge label={moderationLabel(product.moderation_status)} tone={moderationTone(product.moderation_status)} /></div>
            <p className="muted">
              {product.businesses?.name ?? "Tienda por confirmar"} - {product.categories?.name ?? "Sin categoria"}
            </p>
            <p className="muted">
              {formatPrice(product.price, product.currency)} - Stock: {product.stock ?? "Por confirmar"}
            </p>
            <small>{publicationLabel(product.status)}</small>
            {product.status === "active" && product.moderation_status === "approved" ? (
              <Link className="text-action" href={`/productos/${product.slug}`}>
                Ver producto
              </Link>
            ) : null}
          </div>
          <ProductModerationActions
            currentStatus={product.moderation_status}
            initialNote={product.moderation_note ?? ""}
            productId={product.id}
          />
        </article>
      ))}
      </div>
      {!error && products.length === 0 ? <p className="muted">Todavia no hay productos registrados.</p> : null}
      {!error && products.length > 0 && visibleProducts.length === 0 ? <div className="admin-empty panel"><strong>No encontramos productos con esos filtros.</strong><button className="btn btn-dark" onClick={() => { setQuery(""); setModerationFilter("all"); }} type="button">Limpiar filtros</button></div> : null}
    </div>
  );
}
