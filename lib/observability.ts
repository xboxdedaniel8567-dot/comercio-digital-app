/** Identificador corto para correlacionar logs en Cloudflare sin datos sensibles. */
export function createErrorId(): string {
  const stamp = Date.now().toString(36).slice(-4);
  const random = Math.random().toString(36).slice(2, 6);
  return `cd-${stamp}${random}`;
}

export function logServerError(scope: string, error: unknown, errorId: string): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${errorId}] ${scope}: ${message}`);
}
