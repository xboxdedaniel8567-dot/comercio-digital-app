import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "ci-public-key";
process.env.NEXT_PUBLIC_SITE_URL ??= "http://localhost:3000";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Comercio Digital marketplace shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Comercio Digital - Busca productos en comercios fisicos<\/title>/i);
  assert.match(html, /Buscar productos en comercios fisicos/i);
  assert.match(html, /action="\/buscar"/i);
  assert.match(html, /Cerca de ti/i);
  assert.match(html, /href="\/legal\/terminos"/i);
  assert.match(html, /Superintendencia de Industria y Comercio/i);
  assert.equal((html.match(/<footer\b/gi) ?? []).length, 1);
  assert.match(html, /aria-label="Navegacion movil"/i);
});

test("Home renders real discovery data without unsupported marketing claims", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input?.url ?? "";

    if (url.includes("/rest/v1/categories")) {
      return Response.json([{ name: "Tecnologia", slug: "tecnologia", description: null }]);
    }

    if (url.includes("/rest/v1/products")) {
      return Response.json([
        {
          name: "Telefono piloto",
          slug: "telefono-piloto",
          price: 1800000,
          currency: "COP",
          stock: 2,
          businesses: { name: "Tienda Cali", city: "Cali" },
          categories: { name: "Tecnologia" },
          product_images: [{ url: "https://example.com/telefono.webp" }],
        },
      ]);
    }

    if (url.includes("/rest/v1/businesses")) {
      return Response.json([
        {
          name: "Tienda Cali",
          slug: "tienda-cali",
          city: "Cali",
          city_slug: "cali",
          address: "Centro de Cali",
          status: "active",
          logo_url: null,
          cover_url: "https://example.com/tienda.webp",
          categories: { name: "Tecnologia" },
        },
      ]);
    }

    return Response.json([]);
  };

  try {
    const response = await render();
    assert.equal(response.status, 200);

    const html = await response.text();
    assert.match(html, /role="search"/i);
    assert.match(html, /Explora por categoria/i);
    assert.match(html, /Tecnologia/i);
    assert.match(html, /Telefono piloto/i);
    assert.match(html, /Tienda Cali/i);
    assert.match(html, /href="\/comerciantes"/i);
    assert.doesNotMatch(html, /Productos destacados|Comercios piloto|Como funciona/i);
    assert.equal((html.match(/<footer\b/gi) ?? []).length, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Home presents useful empty states when the catalog has no content", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json([]);

  try {
    const response = await render();
    assert.equal(response.status, 200);

    const html = await response.text();
    assert.match(html, /Todavia no hay productos para mostrar/i);
    assert.match(html, /Todavia no hay comercios para mostrar/i);
    assert.match(html, /Explorar busqueda/i);
    assert.match(html, /Registrar un comercio/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("keeps launch-critical application files in place", async () => {
  const [layout, manifest, sqlFiles, pilotGuide] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    readdir(new URL("../supabase/", import.meta.url)),
    readFile(new URL("../docs/PILOT_READINESS.md", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /lang="es"/);
  assert.match(layout, /<AppFooter \/>/);
  assert.match(manifest, /"name": "Comercio Digital"/);
  assert.ok(sqlFiles.includes("marketplace_search_v2.sql"));
  assert.ok(sqlFiles.includes("notifications.sql"));
  assert.ok(sqlFiles.includes("privacy_requests.sql"));
  assert.ok(sqlFiles.includes("legal_consents.sql"));
  assert.ok(sqlFiles.includes("pilot_readiness_check.sql"));
  assert.match(pilotGuide, /Piloto controlado de Comercio Digital/i);
});

test("server-renders /tiendas/[slug] without crashing (no function props)", async () => {
  const originalFetch = globalThis.fetch;

  const fruverBusiness = {
    id: "mock-fruver-id",
    name: "Fruver",
    slug: "fruver",
    description: "Venta de frutas y verduras",
    city: "Cali, Valle del Cauca",
    address: "Carrera 25#19a-38",
    neighborhood: null,
    shopping_center: null,
    floor: null,
    local_number: null,
    landmark: null,
    whatsapp: "573103450581",
    logo_url: null,
    cover_url: null,
    created_at: "2026-07-28T00:37:08.598Z",
    categories: { name: "Alimentos" },
    business_hours: [],
    business_gallery_images: [],
  };

  const fruverProducts = [
    {
      id: "mock-product-id",
      name: "Manzana roja",
      slug: "manzana-roja",
      price: "1400.00",
      currency: "COP",
      stock: 100,
      is_featured: false,
      view_count: 0,
      categories: { name: "Alimentos" },
      product_images: [],
    },
  ];

  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input?.url ?? "";
    const accept = (init?.headers instanceof Headers ? init.headers.get("accept") : "") ?? "";

    if (url.includes("/rest/v1/businesses") && accept.includes("application/vnd.pgrst.object+json")) {
      return new Response(JSON.stringify(fruverBusiness), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    if (url.includes("/rest/v1/businesses")) {
      return new Response(JSON.stringify(fruverBusiness), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    if (url.includes("/rest/v1/products")) {
      return new Response(JSON.stringify(fruverProducts), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const response = await render("/tiendas/fruver");
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

    const html = await response.text();
    assert.match(html, /Fruver/i);
    assert.match(html, /Manzana roja/i);
    assert.match(html, /1\.400/i);
    assert.match(html, /Informacion/i);
    assert.match(html, /Horario por confirmar/i);
    assert.doesNotMatch(html, /formatTime12Hour/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("server-renders the design system primitives with accessible contracts", async () => {
  const response = await render("/design-system");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Comercio Digital Design System/i);
  assert.match(html, /cd-button-primary/i);
  assert.match(html, /cd-button-secondary/i);
  assert.match(html, /cd-button-destructive/i);
  assert.match(html, /aria-busy="true"/i);
  assert.match(html, /disabled=""/i);
  assert.match(html, /<label[^>]+for=/i);
  assert.match(html, /aria-describedby=/i);
  assert.match(html, /aria-label="Cerrar ejemplo"/i);
  assert.match(html, /Fixtures locales de demostracion/i);
  assert.match(html, /cd-product-card-grid/i);
  assert.match(html, /cd-product-card-horizontal/i);
  assert.match(html, /cd-product-card-mapPreview/i);
  assert.match(html, /cd-store-card-featured/i);
  assert.match(html, /No encontramos productos/i);
});
