"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ContactButton } from "@/components/ContactButton";
import { InventoryBadge } from "@/components/InventoryBadge";
import { readComparison, writeComparison } from "@/lib/comparison";
import { supabase } from "@/lib/supabase";

type ComparisonProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  currency: string;
  stock: number | null;
  businesses: {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    whatsapp: string | null;
  } | null;
  categories: { name: string } | null;
  subcategories: { name: string } | null;
  product_images: { url: string }[];
  product_attribute_values: {
    value: string;
    category_attributes: { name: string } | null;
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

export function CompareProducts() {
  const [products, setProducts] = useState<ComparisonProduct[]>([]);
  const [message, setMessage] = useState("Cargando comparacion...");

  useEffect(() => {
    async function loadProducts() {
      const selected = readComparison();
      if (selected.length < 2) {
        setMessage("Selecciona al menos dos productos desde el buscador.");
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, description, price, currency, stock, businesses!inner(id, name, slug, city, whatsapp), categories(name), subcategories(name), product_images(url), product_attribute_values(value, category_attributes(name))")
        .in("slug", selected.map((item) => item.slug))
        .eq("status", "active")
        .eq("moderation_status", "approved")
        .eq("businesses.status", "active");

      if (error) {
        setMessage(`No se pudo cargar la comparacion: ${error.message}`);
        return;
      }

      const rows = (data ?? []) as ComparisonProduct[];
      setProducts(
        selected
          .map((item) => rows.find((product) => product.slug === item.slug))
          .filter((product): product is ComparisonProduct => Boolean(product)),
      );
      setMessage("");
    }

    void loadProducts();
  }, []);

  function removeProduct(slug: string) {
    writeComparison(readComparison().filter((item) => item.slug !== slug));
    setProducts((current) => current.filter((product) => product.slug !== slug));
  }

  if (message) {
    return (
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <p className="muted" style={{ margin: 0 }}>{message}</p>
        <Link className="btn" href="/buscar">Buscar productos</Link>
      </div>
    );
  }

  return (
    <div className="comparison-scroll" style={{ overflowX: "auto", paddingBottom: 8 }}>
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: `repeat(${products.length}, minmax(260px, 1fr))`,
          minWidth: products.length * 280,
        }}
      >
        {products.map((product) => {
          const whatsapp = product.businesses?.whatsapp;
          const messageText = encodeURIComponent(
            `Hola, compare ${product.name} en Comercio Digital y quiero mas informacion.`,
          );

          return (
            <article className="card" key={product.id} style={{ alignContent: "start", display: "grid", gap: 12 }}>
              <div style={{ aspectRatio: "4 / 3", background: "#111", border: "1px solid var(--line)", overflow: "hidden" }}>
                {product.product_images?.[0]?.url ? (
                  <img alt={product.name} src={product.product_images[0].url} style={{ display: "block", height: "100%", objectFit: "contain", width: "100%" }} />
                ) : null}
              </div>
              <p className="kicker" style={{ margin: 0 }}>{product.categories?.name ?? "Sin categoria"}</p>
              <h2 style={{ margin: 0 }}>{product.name}</h2>
              <strong style={{ fontSize: "1.25rem" }}>{formatPrice(product.price, product.currency)}</strong>
              <InventoryBadge stock={product.stock} />
              <dl style={{ display: "grid", gap: 10, margin: 0 }}>
                <div><dt className="muted">Tienda</dt><dd style={{ margin: "3px 0 0" }}>{product.businesses?.name}</dd></div>
                <div><dt className="muted">Ciudad</dt><dd style={{ margin: "3px 0 0" }}>{product.businesses?.city ?? "Por confirmar"}</dd></div>
                <div><dt className="muted">Tipo</dt><dd style={{ margin: "3px 0 0" }}>{product.subcategories?.name ?? product.categories?.name}</dd></div>
                {product.product_attribute_values.map((attribute) => (
                  <div key={`${attribute.category_attributes?.name}-${attribute.value}`}>
                    <dt className="muted">{attribute.category_attributes?.name ?? "Caracteristica"}</dt>
                    <dd style={{ margin: "3px 0 0" }}>{attribute.value}</dd>
                  </div>
                ))}
              </dl>
              <ContactButton
                businessId={product.businesses?.id ?? ""}
                businessName={product.businesses?.name ?? "Tienda por confirmar"}
                label="Consultar por WhatsApp"
                message={messageText}
                productId={product.id}
                source="product_detail"
                whatsapp={whatsapp}
              />
              <Link className="btn btn-dark" href={`/productos/${product.slug}`}>Ver producto</Link>
              <button className="btn btn-dark" onClick={() => removeProduct(product.slug)} type="button">Quitar</button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
