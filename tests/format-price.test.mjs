import assert from "node:assert/strict";
import test from "node:test";

test("formatPrice handles numeric strings from Supabase", async () => {
  const { formatPrice, coercePrice } = await import("../lib/format-price.ts");

  assert.equal(coercePrice("1400.00"), 1400);
  assert.match(formatPrice("1400.00", "COP"), /1\.?400/);
  assert.equal(formatPrice(null, "COP"), "Precio por consultar");
  assert.equal(formatPrice("invalid", "COP"), "Precio por consultar");
});

test("formatPrice falls back when currency code is invalid", async () => {
  const { formatPrice } = await import("../lib/format-price.ts");
  const formatted = formatPrice(1000, "NOT_A_CURRENCY");
  assert.match(formatted, /1\.?000/);
  assert.match(formatted, /NOT_A_CURRENCY/);
});
