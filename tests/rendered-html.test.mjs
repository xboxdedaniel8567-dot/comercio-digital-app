import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

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
  assert.match(html, /Encuentra lo que buscas/i);
  assert.match(html, /action="\/buscar"/i);
  assert.match(html, /Registrar mi tienda/i);
  assert.match(html, /href="\/legal\/terminos"/i);
  assert.match(html, /Superintendencia de Industria y Comercio/i);
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
