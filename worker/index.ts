/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

function createErrorId(): string {
  const stamp = Date.now().toString(36).slice(-4);
  const random = Math.random().toString(36).slice(2, 6);
  return `cd-${stamp}${random}`;
}

function workerErrorPage(errorId: string): Response {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Comercio Digital — error temporal</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #090a0c; color: #f4f4f5; margin: 0; padding: 2rem; }
    main { max-width: 32rem; margin: 0 auto; }
    p { color: #a1a1aa; line-height: 1.5; }
    code { font-size: 0.85rem; color: #e4e4e7; }
    a { color: #93c5fd; }
  </style>
</head>
<body>
  <main>
    <h1>No pudimos cargar esta pagina</h1>
    <p>Hubo un problema temporal. Intenta de nuevo en unos segundos.</p>
    <p>Referencia para soporte: <code>${errorId}</code></p>
    <p><a href="/">Volver al inicio</a></p>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: 500,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-cd-error-id": errorId,
    },
  });
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/_vinext/image") {
        const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
        return await handleImageOptimization(
          request,
          {
            fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
            transformImage: async (body, { width, format, quality }) => {
              const result = await env.IMAGES.input(body)
                .transform(width > 0 ? { width } : {})
                .output({ format, quality });
              return result.response();
            },
          },
          allowedWidths,
        );
      }

      return await handler.fetch(request, env, ctx);
    } catch (error) {
      const errorId = createErrorId();
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[${errorId}] worker.fetch ${url.pathname}: ${message}`);
      return workerErrorPage(errorId);
    }
  },
};

export default worker;
