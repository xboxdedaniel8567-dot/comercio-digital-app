"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

type StockFilter = "all" | "available" | "low" | "out";

export function ProductInventory() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [message, setMessage] = useState("Cargando productos...");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

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

  function updateProductStatus(slug: string, status: string) {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.slug === slug ? { ...product, status } : product,
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

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      if (query && !product.name.toLowerCase().includes(query)) return false;
      if (stockFilter !== "all" && getInventoryState(product.stock) !== stockFilter)
        return false;
      return true;
    });
  }, [products, search, stockFilter]);

  const hasProducts = products.length > 0;
  const hasResults = filteredProducts.length > 0;

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
        <div className="skeleton-list" aria-label="Cargando productos">
          {[0, 1, 2].map((i) => (
            <div className="skeleton-row" key={i}>
              <div className="skeleton skeleton-thumb" />
              <div className="skeleton-group">
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line skeleton-line-short" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="card card-error">
          <strong>No se pudieron cargar los productos.</strong>
          <p className="muted">{error}</p>
          <button className="btn btn-dark" onClick={() => window.location.reload()} type="button">
            Reintentar
          </button>
        </div>
      ) : null}

      {!message && !error && hasProducts ? (
        <>
          <div className="merchant-inventory-summary">
            {[
              ["Disponibles", availableCount],
              ["Pocas unidades", lowStockCount],
              ["Agotados", outOfStockCount],
            ].map(([label, value]) => (
              <div className="merchant-inventory-summary-card" key={label as string}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="inventory-toolbar">
            <input
              aria-label="Buscar productos"
              className="input inventory-search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto..."
              type="search"
              value={search}
            />
            <div className="inventory-filter-group" role="group" aria-label="Filtrar por stock">
              {([
                ["all", "Todos"],
                ["available", "Disponibles"],
                ["low", "Pocas unidades"],
                ["out", "Agotados"],
              ] as const).map(([value, label]) => (
                <button
                  aria-pressed={stockFilter === value}
                  className={`inventory-filter-chip ${stockFilter === value ? "inventory-filter-chip-active" : ""}`}
                  key={value}
                  onClick={() => setStockFilter(value)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}

      <div className="merchant-inventory-list">
        {filteredProducts.map((product) => (
          <div className="inventory-product-row panel" key={product.slug}>
            <div className="inventory-product-image">
              {product.product_images?.[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={product.name} src={product.product_images[0].url} />
              ) : (
                <span className="inventory-product-image-placeholder" aria-hidden="true">
                  {product.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="inventory-product-copy">
              <strong>{product.name}</strong>
              <p className="inventory-product-price">{formatPrice(product.price, product.currency)}</p>
              <div className="inventory-product-badges">
                <StatusBadge
                  label={statusLabel(product.status)}
                  tone={product.status === "active" ? "success" : "neutral"}
                />
                <StatusBadge
                  label={moderationLabel(product.moderation_status)}
                  tone={product.moderation_status === "approved" ? "success" : product.moderation_status === "rejected" ? "danger" : "warning"}
                />
              </div>
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
              <Link className="btn btn-dark" href={`/panel/productos/${product.slug}/editar`}>
                Editar
              </Link>
              <ProductStatusButton
                onStatusChange={(status) => updateProductStatus(product.slug, status)}
                slug={product.slug}
                status={product.status}
              />
            </div>
          </div>
        ))}
      </div>

      {!error && !message && !hasProducts ? (
        <div className="empty-state">
          <p className="empty-state-title">Esta tienda todavia no tiene productos</p>
          <p className="muted">Crea tu primer producto para que los clientes lo encuentren.</p>
          <Link className="btn" href="/panel/productos/nuevo">Anadir producto</Link>
        </div>
      ) : null}

      {!error && !message && hasProducts && !hasResults ? (
        <div className="empty-state">
          <p className="empty-state-title">No encontramos productos con esos filtros</p>
          <p className="muted">Cambia la busqueda o el filtro para ver mas resultados.</p>
          <button
            className="btn btn-dark"
            onClick={() => {
              setSearch("");
              setStockFilter("all");
            }}
            type="button"
          >
            Limpiar filtros
          </button>
        </div>
      ) : null}
    </div>
  );
}
