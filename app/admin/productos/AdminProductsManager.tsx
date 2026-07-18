"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductModerationActions } from "@/components/ProductModerationActions";
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

export function AdminProductsManager() {
  const [products, setProducts] = useState<ProductRow[]>([]);
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

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {error ? (
        <div className="card" style={{ borderColor: "#ef4444" }}>
          <strong>No se pudieron cargar los productos.</strong>
          <p className="muted">{error}</p>
        </div>
      ) : null}
      {products.map((product) => (
        <div
          className="admin-product-row card"
          key={product.id}
          style={{ display: "grid", gap: 14, gridTemplateColumns: "72px minmax(180px, 1fr) minmax(250px, auto)", alignItems: "center" }}
        >
          <div style={{ aspectRatio: "1", border: "1px solid var(--line)", background: "linear-gradient(135deg, #222, #080808)", overflow: "hidden" }}>
            {product.product_images?.[0]?.url ? (
              <img alt={product.name} src={product.product_images[0].url} style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }} />
            ) : null}
          </div>
          <div>
            <strong>{product.name}</strong>
            <p className="muted" style={{ marginBottom: 4 }}>
              {product.businesses?.name ?? "Tienda por confirmar"} - {product.categories?.name ?? "Sin categoria"}
            </p>
            <p className="muted" style={{ margin: 0 }}>
              {formatPrice(product.price, product.currency)} - Stock: {product.stock ?? "Por confirmar"}
            </p>
            <p style={{ marginBottom: 0 }}>
              {publicationLabel(product.status)} - {moderationLabel(product.moderation_status)}
            </p>
            {product.status === "active" && product.moderation_status === "approved" ? (
              <Link className="btn btn-dark" href={`/productos/${product.slug}`} style={{ marginTop: 10 }}>
                Ver producto
              </Link>
            ) : null}
          </div>
          <ProductModerationActions
            currentStatus={product.moderation_status}
            initialNote={product.moderation_note ?? ""}
            productId={product.id}
          />
        </div>
      ))}
      {!error && products.length === 0 ? <p className="muted">Todavia no hay productos registrados.</p> : null}
    </div>
  );
}
