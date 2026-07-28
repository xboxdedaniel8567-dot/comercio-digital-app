"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";

type TabProduct = {
  name: string;
  slug: string;
  businessName: string;
  businessCity?: string | null;
  category: string;
  price: string;
  stock: number | null;
  attributes: string[];
  imageUrl?: string | null;
};

type BusinessInfo = {
  description: string | null;
  city: string;
  address: string | null;
  neighborhood: string | null;
  shopping_center: string | null;
  floor: string | null;
  local_number: string | null;
  landmark: string | null;
  whatsapp: string | null;
};

type StoreProfileTabsProps = {
  allProducts: TabProduct[];
  featuredProducts: TabProduct[];
  mostViewedProducts: TabProduct[];
  business: BusinessInfo;
  hours: { day_of_week: number; opens_at: string | null; closes_at: string | null; is_closed: boolean }[];
  dayNames: string[];
};

function formatTime12Hour(value: string | null) {
  if (!value) return "Por confirmar";

  const [hourPart, minutePart = "00"] = value.split(":");
  const hour24 = Number(hourPart);
  const hour12 = hour24 % 12 || 12;
  const period = hour24 >= 12 ? "p. m." : "a. m.";
  return `${hour12}:${minutePart} ${period}`;
}

type TabId = "products" | "featured" | "viewed" | "info";

type TabDef = { id: TabId; label: string; show: boolean };

export function StoreProfileTabs({
  allProducts,
  featuredProducts,
  mostViewedProducts,
  business,
  hours,
  dayNames,
}: StoreProfileTabsProps) {
  const tabs: TabDef[] = [
    { id: "products", label: "Productos", show: true },
    { id: "featured", label: "Destacados", show: featuredProducts.length > 0 },
    { id: "viewed", label: "Mas consultados", show: mostViewedProducts.length > 0 },
    { id: "info", label: "Informacion", show: true },
  ];
  const visibleTabs = tabs.filter((tab) => tab.show);
  const [active, setActive] = useState<TabId>("products");

  return (
    <section className="store-profile-tabs-section">
      <div className="store-profile-tabs" role="tablist">
        {visibleTabs.map((tab) => (
          <button
            aria-controls={`store-tab-${tab.id}`}
            aria-selected={active === tab.id}
            className={`store-profile-tab ${active === tab.id ? "store-profile-tab-active" : ""}`}
            id={`store-tabbtn-${tab.id}`}
            key={tab.id}
            onClick={() => setActive(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="store-profile-tab-content" id="store-tab-products" hidden={active !== "products"} role="tabpanel">
        {allProducts.length > 0 ? (
          <div className="store-product-grid">
            {allProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="store-empty-catalog">
            <h3>Sin productos publicados</h3>
            <p>Esta tienda aun no tiene productos visibles.</p>
          </div>
        )}
      </div>

      <div className="store-profile-tab-content" id="store-tab-featured" hidden={active !== "featured"} role="tabpanel">
        {featuredProducts.length > 0 ? (
          <div className="store-product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="store-empty-catalog">
            <h3>Sin productos destacados</h3>
            <p>Esta tienda no ha marcado productos como destacados.</p>
          </div>
        )}
      </div>

      <div className="store-profile-tab-content" id="store-tab-viewed" hidden={active !== "viewed"} role="tabpanel">
        {mostViewedProducts.length > 0 ? (
          <div className="store-product-grid">
            {mostViewedProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="store-empty-catalog">
            <h3>Sin datos de consultas</h3>
            <p>Aun no hay suficiente actividad para mostrar los productos mas consultados.</p>
          </div>
        )}
      </div>

      <div className="store-profile-tab-content" id="store-tab-info" hidden={active !== "info"} role="tabpanel">
        <div className="store-info-grid">
          {business.description ? (
            <article className="store-info-card">
              <h3>Sobre la tienda</h3>
              <p>{business.description}</p>
            </article>
          ) : null}

          <article className="store-info-card">
            <h3>Ubicacion</h3>
            <address>
              {business.address ? <strong>{business.address}</strong> : null}
              {business.neighborhood ? <span>Barrio: {business.neighborhood}</span> : null}
              {business.shopping_center ? <span>Centro comercial: {business.shopping_center}</span> : null}
              {business.floor ? <span>Piso: {business.floor}</span> : null}
              {business.local_number ? <span>Local: {business.local_number}</span> : null}
              {business.landmark ? <span>Referencia: {business.landmark}</span> : null}
              {business.city ? <span>Ciudad: {business.city}</span> : null}
            </address>
          </article>

          <article className="store-info-card">
            <h3>Horario de atencion</h3>
            <dl className="store-hours-list">
              {hours.map((day) => (
                <div key={day.day_of_week}>
                  <dt>{dayNames[day.day_of_week]}</dt>
                  <dd className={day.is_closed ? "store-hours-closed" : ""}>
                    {day.is_closed
                      ? "Cerrado"
                      : `${formatTime12Hour(day.opens_at)} - ${formatTime12Hour(day.closes_at)}`}
                  </dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="store-info-card">
            <h3>Contacto</h3>
            <p>
              {business.whatsapp
                ? `WhatsApp: ${business.whatsapp}`
                : "WhatsApp no disponible"}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
