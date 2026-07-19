"use client";

import { useEffect, useMemo, useState } from "react";
import { getCurrentBusiness } from "@/lib/current-business";
import { getInventoryState } from "@/lib/inventory";
import { supabase } from "@/lib/supabase";

type ProductRow = {
  name: string;
  price: number | null;
  stock: number | null;
  status: string;
  businesses: {
    slug: string;
  } | null;
};

type SearchLog = {
  query: string;
  results_count: number | null;
  created_at: string;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function StatsDashboard() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [contactClicks, setContactClicks] = useState(0);
  const [searchCount, setSearchCount] = useState(0);
  const [recentSearches, setRecentSearches] = useState<SearchLog[]>([]);
  const [message, setMessage] = useState("Calculando estadisticas...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      const { business, error: businessError } = await getCurrentBusiness();

      if (!business) {
        setError(businessError || "No se pudo encontrar la tienda de esta cuenta.");
        setMessage("");
        return;
      }

      const { data, error: productsError } = await supabase
        .from("products")
        .select("name, price, stock, status, businesses!inner(slug)")
        .eq("businesses.slug", business.slug);

      if (productsError) {
        setError(productsError.message);
        setMessage("");
        return;
      }

      const { count, error: contactError } = await supabase
        .from("contact_events")
        .select("*", { count: "exact", head: true })
        .eq("business_id", business.id);

      if (contactError) {
        setError(contactError.message);
        setMessage("");
        return;
      }

      const { count: searchesTotal, error: searchesCountError } = await supabase
        .from("search_logs")
        .select("*", { count: "exact", head: true });

      if (searchesCountError) {
        setError(searchesCountError.message);
        setMessage("");
        return;
      }

      const { data: searchRows, error: searchesError } = await supabase
        .from("search_logs")
        .select("query, results_count, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (searchesError) {
        setError(searchesError.message);
        setMessage("");
        return;
      }

      setProducts((data ?? []) as ProductRow[]);
      setContactClicks(count ?? 0);
      setSearchCount(searchesTotal ?? 0);
      setRecentSearches((searchRows ?? []) as SearchLog[]);
      setMessage("");
    }

    void loadStats();
  }, []);

  const stats = useMemo(() => {
    const activeProducts = products.filter((product) => product.status === "active");
    const hiddenProducts = products.filter((product) => product.status !== "active");
    const outOfStockProducts = products.filter((product) => (product.stock ?? 0) <= 0);
    const lowStockProducts = products.filter(
      (product) => getInventoryState(product.stock) === "low",
    );
    const inventoryValue = products.reduce((total, product) => {
      return total + (product.price ?? 0) * (product.stock ?? 0);
    }, 0);
    const mostExpensive = [...products].sort((a, b) => (b.price ?? 0) - (a.price ?? 0))[0];
    const lowestStock = [...products]
      .filter((product) => product.stock !== null)
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))[0];

    return {
      active: activeProducts.length,
      hidden: hiddenProducts.length,
      inventoryValue,
      lowStock: lowStockProducts.length,
      lowestStock,
      mostExpensive,
      outOfStock: outOfStockProducts.length,
      total: products.length,
    };
  }, [products]);

  if (message) {
    return <p className="muted">{message}</p>;
  }

  if (error) {
    return (
      <div className="card" style={{ borderColor: "#ef4444" }}>
        <strong>No se pudieron cargar las estadisticas.</strong>
        <p className="muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="merchant-stats-dashboard">
      <div className="merchant-section-heading">
        <div>
          <p className="kicker">Rendimiento</p>
          <h2>Lectura general de la tienda</h2>
          <p>Datos operativos para mantener actualizado tu catalogo.</p>
        </div>
      </div>
      <div className="merchant-stat-grid">
        {[
          ["Total productos", String(stats.total)],
          ["Productos activos", String(stats.active)],
          ["Productos ocultos", String(stats.hidden)],
          ["Sin stock", String(stats.outOfStock)],
          ["Pocas unidades", String(stats.lowStock)],
          ["Clics WhatsApp", String(contactClicks)],
          ["Busquedas", String(searchCount)],
          ["Valor inventario", formatMoney(stats.inventoryValue)],
        ].map(([label, value]) => (
          <div className="merchant-stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <section className="merchant-data-panel panel">
        <h2 style={{ marginTop: 0 }}>Busquedas recientes</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {recentSearches.map((search) => (
            <div
              key={`${search.query}-${search.created_at}`}
              style={{
                borderBottom: "1px solid var(--line)",
                display: "flex",
                justifyContent: "space-between",
                paddingBottom: 8,
              }}
            >
              <strong>{search.query}</strong>
              <span className="muted">{search.results_count ?? 0} resultados</span>
            </div>
          ))}
          {recentSearches.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>
              Todavia no hay busquedas registradas.
            </p>
          ) : null}
        </div>
      </section>

      <section className="merchant-data-panel panel">
        <h2 style={{ marginTop: 0 }}>Lectura rapida del negocio</h2>
        <div style={{ display: "grid", gap: 10 }}>
          <p className="muted" style={{ margin: 0 }}>
            Producto mas caro:{" "}
            <strong>
              {stats.mostExpensive
                ? `${stats.mostExpensive.name} (${formatMoney(stats.mostExpensive.price ?? 0)})`
                : "Sin datos"}
            </strong>
          </p>
          <p className="muted" style={{ margin: 0 }}>
            Producto con menos stock:{" "}
            <strong>
              {stats.lowestStock
                ? `${stats.lowestStock.name} (${stats.lowestStock.stock ?? 0} unidades)`
                : "Sin datos"}
            </strong>
          </p>
          <p className="muted" style={{ margin: 0 }}>
            Recomendacion: manten activos solo los productos disponibles y oculta los agotados para evitar preguntas innecesarias por WhatsApp.
          </p>
        </div>
      </section>
    </div>
  );
}
