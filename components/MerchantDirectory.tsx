"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ContactButton } from "@/components/ContactButton";
import { DirectionsLink } from "@/components/DirectionsLink";

export type DirectoryBusiness = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string;
  address: string | null;
  whatsapp: string | null;
  logo_url: string | null;
  cover_url: string | null;
  categories: {
    name: string;
  } | null;
};

type MerchantDirectoryProps = {
  businesses: DirectoryBusiness[];
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function monogram(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function MerchantDirectory({ businesses }: MerchantDirectoryProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");

  const categories = useMemo(
    () => [
      "Todas",
      ...Array.from(
        new Set(
          businesses
            .map((business) => business.categories?.name)
            .filter((name): name is string => Boolean(name))
        )
      ).sort((a, b) => a.localeCompare(b, "es")),
    ],
    [businesses]
  );

  const visibleBusinesses = useMemo(() => {
    const normalizedQuery = normalize(query);

    return businesses.filter((business) => {
      const matchesCategory = category === "Todas" || business.categories?.name === category;
      const searchable = normalize(
        [
          business.name,
          business.categories?.name,
          business.description,
          business.address,
          business.city,
        ]
          .filter(Boolean)
          .join(" ")
      );

      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [businesses, category, query]);

  return (
    <>
      <section aria-label="Buscar comercios" className="directory-controls">
        <label className="directory-search">
          <span className="sr-only">Buscar por nombre, categoria o ubicacion</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, categoria o ubicacion"
            type="search"
            value={query}
          />
        </label>

        <div aria-label="Filtrar por categoria" className="directory-categories" role="group">
          {categories.map((item) => (
            <button
              aria-pressed={category === item}
              className={category === item ? "is-active" : ""}
              key={item}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <div className="directory-results-bar">
        <strong>
          {visibleBusinesses.length} {visibleBusinesses.length === 1 ? "comercio" : "comercios"}
        </strong>
        {(query || category !== "Todas") && (
          <button
            className="text-action"
            onClick={() => {
              setQuery("");
              setCategory("Todas");
            }}
            type="button"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {visibleBusinesses.length > 0 ? (
        <div className="directory-list">
          {visibleBusinesses.map((business) => {
            const message = encodeURIComponent(
              `Hola, vi la tienda ${business.name} en Comercio Digital. Quiero mas informacion.`
            );

            return (
              <article className="directory-business" key={business.id}>
                <Link
                  aria-label={`Ver tienda ${business.name}`}
                  className="directory-business-media"
                  href={`/tiendas/${business.slug}`}
                >
                  {business.cover_url ? (
                    // Supabase Storage sirve estas imagenes desde dominios configurados por el comercio.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt={`Portada de ${business.name}`} src={business.cover_url} />
                  ) : (
                    <span aria-hidden="true" className="directory-cover-placeholder" />
                  )}
                </Link>

                <div className="directory-business-main">
                  <div className="directory-business-logo" aria-hidden={!business.logo_url}>
                    {business.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt={`Logo de ${business.name}`} src={business.logo_url} />
                    ) : (
                      <span>{monogram(business.name)}</span>
                    )}
                  </div>

                  <div className="directory-business-copy">
                    <p className="kicker">{business.categories?.name ?? "Comercio local"}</p>
                    <h2>
                      <Link href={`/tiendas/${business.slug}`}>{business.name}</Link>
                    </h2>
                    <p className="muted">
                      {business.description ?? "Tienda registrada en Comercio Digital."}
                    </p>
                    <p className="directory-business-address">
                      <strong>{business.address ?? "Direccion por confirmar"}</strong>
                      <span>{business.city}</span>
                    </p>
                  </div>
                </div>

                <div className="directory-business-actions">
                  <Link className="btn" href={`/tiendas/${business.slug}`}>
                    Ver tienda
                  </Link>
                  <ContactButton
                    businessId={business.id}
                    businessName={business.name}
                    className="btn btn-dark"
                    label="WhatsApp"
                    message={message}
                    source="store_detail"
                    whatsapp={business.whatsapp}
                  />
                  <DirectionsLink address={business.address} city={business.city} />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="directory-empty">
          <p className="kicker">Sin coincidencias</p>
          <h2>No encontramos comercios con esos filtros</h2>
          <p className="muted">Prueba otra palabra o vuelve a explorar todas las categorias.</p>
          <button
            className="btn"
            onClick={() => {
              setQuery("");
              setCategory("Todas");
            }}
            type="button"
          >
            Ver todos los comercios
          </button>
        </section>
      )}
    </>
  );
}
