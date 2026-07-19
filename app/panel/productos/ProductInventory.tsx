"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductStatusButton } from "@/components/ProductStatusButton";
import { QuickStockControl } from "@/components/QuickStockControl";
import { ProductAvailabilityButton } from "@/components/ProductAvailabilityButton";
import { StatusBadge } from "@/components/StatusBadge";
import { getCurrentBusiness } from "@/lib/current-business";
import { getInventoryState } from "@/lib/inventory";
import { supabase } from "@/lib/supabase";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  currency: string;
  stock: number | null;
  status: string;
  moderation_status: string;
  moderation_note: string | null;
  updated_at: string;
  product_images: {
    url: string;
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

function statusLabel(status: string) {
  if (status === "active") return "Activo";
  if (status === "draft") return "Oculto";
  if (status === "pending_review") return "Pendiente";
  return status;
}

function moderationLabel(status: string) {
  if (status === "approved") return "Aprobado";
  if (status === "under_review") return "En revision";
  if (status === "rejected") return "Rechazado";
  return status;
}

export function ProductInventory() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [message, setMessage] = useState("Cargando productos...");
  const [error, setError] = useState("");
  const lowStockCount = products.filter(
    (product) => getInventoryState(product.stock) === "low",
  ).length;
  const outOfStockCount = products.filter(
    (product) => getInventoryState(product.stock) === "out",
  ).length;
  const availableCount = products.filter(
    (product) => getInventoryState(product.stock) === "available",
  ).length;

  function updateProductStock(productId: string, stock: number) {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId ? { ...product, stock } : product,
      ),
    );
  }

  useEffect(() => {
    async function loadProducts() {
      const { business, error: businessError } = await getCurrentBusiness();

      if (!business) {
        setError(businessError || "No encontramos una tienda para esta cuenta.");
        setMessage("");
        return;
      }

      const { data, error: productsError } = await supabase
        .from("products")
        .select(
          "id, name, slug, price, currency, stock, status, moderation_status, moderation_note, updated_at, product_images(url), businesses!inner(slug)",
        )
        .eq("businesses.slug", business.slug)
        .order("name");

      if (productsError) {
        setError(productsError.message);
        setMessage("");
        return;
      }

      setProducts((data ?? []) as ProductRow[]);
      setMessage("");
    }

    void loadProducts();
  }, []);

  return (
    <div className="merchant-inventory">
      <div className="merchant-section-heading merchant-inventory-heading">
        <div>
          <p className="kicker">Catalogo</p>
          <h2>Inventario de productos</h2>
          <p>Actualiza existencias, visibilidad y datos de cada publicacion.</p>
        </div>
        <Link className="btn" href="/panel/productos/nuevo">Nuevo producto</Link>
      </div>
      {message ? (
        <p className="muted" style={{ marginTop: 18 }}>
          {message}
        </p>
      ) : null}
      {error ? (
        <div className="card" style={{ borderColor: "#ef4444", marginTop: 18 }}>
          <strong>No se pudieron cargar los productos.</strong>
          <p className="muted">{error}</p>
        </div>
      ) : null}
      {!message && !error && products.length > 0 ? (
        <div className="merchant-inventory-summary">
          {[
            ["Disponibles", availableCount],
            ["Pocas unidades", lowStockCount],
            ["Agotados", outOfStockCount],
          ].map(([label, value]) => (
            <div className="merchant-inventory-summary-card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      ) : null}
      <div className="merchant-inventory-list">
        {products.map((product) => (
          <div
            className="inventory-product-row panel"
            key={product.slug}
          >
            <div className="inventory-product-image">
              {product.product_images?.[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={product.name}
                  src={product.product_images[0].url}
                  style={{
                    display: "block",
                    height: "100%",
                    objectFit: "cover",
                    width: "100%",
                  }}
                />
              ) : null}
            </div>
            <div className="inventory-product-copy">
              <strong>{product.name}</strong>
              <p>{formatPrice(product.price, product.currency)}</p>
              <StatusBadge
                label={moderationLabel(product.moderation_status)}
                tone={product.moderation_status === "approved" ? "success" : product.moderation_status === "rejected" ? "danger" : "warning"}
              />
              {product.moderation_note ? (
                <small className="muted">Nota: {product.moderation_note}</small>
              ) : null}
            </div>
            <div className="inventory-product-actions">
              <QuickStockControl
                initialStock={product.stock}
                onStockChange={(stock) => updateProductStock(product.id, stock)}
                productId={product.id}
              />
              <ProductAvailabilityButton
                initialUpdatedAt={product.updated_at}
                productId={product.id}
              />
              <span className="inventory-product-state">{statusLabel(product.status)}</span>
              <Link className="btn btn-dark" href={`/panel/productos/${product.slug}/editar`}>
                Editar
              </Link>
              <ProductStatusButton slug={product.slug} status={product.status} />
            </div>
          </div>
        ))}
      </div>
      {!error && !message && products.length === 0 ? (
        <p className="muted" style={{ marginTop: 18 }}>
          Esta tienda todavia no tiene productos.
        </p>
      ) : null}
    </div>
  );
}
