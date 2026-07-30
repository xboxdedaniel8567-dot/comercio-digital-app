const CACHE_NAME = "comercio-digital-v3";
const OFFLINE_URL = "/offline.html";

const CORE_ASSETS = [OFFLINE_URL, "/brand-icon.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(CORE_ASSETS.map((asset) => cache.add(asset))).then(() => undefined),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Nunca cachear datos de Supabase, autenticacion ni paneles privados
  if (url.pathname.startsWith("/rest/v1/")) return;
  if (url.pathname.startsWith("/auth/v1/")) return;
  if (url.pathname.startsWith("/panel")) return;
  if (url.pathname.startsWith("/admin")) return;
  if (url.pathname.startsWith("/cuenta")) return;

  // Navegacion: network-first con fallback offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))),
    );
    return;
  }

  // Archivos estaticos publicos: cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/brand-icon.png" ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/offline.html"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        });
      }),
    );
  }
});
