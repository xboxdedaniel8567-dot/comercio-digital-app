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
  assert.match(html, /Encuentra lo que buscas sin recorrer toda la ciudad/i);
  assert.match(html, /action="\/buscar"/i);
  assert.match(html, /Registrar mi tienda/i);
  assert.match(html, /href="\/legal\/terminos"/i);
  assert.match(html, /Superintendencia de Industria y Comercio/i);
});

test("keeps launch-critical application files in place", async () => {
  const [layout, manifest, sqlFiles] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    readdir(new URL("../supabase/", import.meta.url)),
  ]);

  assert.match(layout, /lang="es"/);
  assert.match(layout, /<AppFooter \/>/);
  assert.match(manifest, /"name": "Comercio Digital"/);
  assert.ok(sqlFiles.includes("marketplace_search_v2.sql"));
  assert.ok(sqlFiles.includes("notifications.sql"));
  assert.ok(sqlFiles.includes("privacy_requests.sql"));
  assert.ok(sqlFiles.includes("legal_consents.sql"));
});
