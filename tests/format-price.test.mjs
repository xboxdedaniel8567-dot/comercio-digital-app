import assert from "node:assert/strict";
import test from "node:test";

test("formatPrice handles numeric strings from Supabase", async () => {
  const { formatPrice, coercePrice } = await import("../lib/format-price.ts");

  assert.equal(coercePrice("1400.00"), 1400);
  assert.equal(formatPrice("1400.00", "COP"), "$1.400");
  assert.equal(formatPrice(1_500_000, "COP"), "$1.500.000");
  assert.equal(formatPrice(null, "COP"), "Precio por consultar");
  assert.equal(formatPrice("invalid", "COP"), "Precio por consultar");
  assert.equal(coercePrice(""), null);
});

test("formatPrice falls back when currency code is invalid", async () => {
  const { formatPrice } = await import("../lib/format-price.ts");
  const formatted = formatPrice(1000, "NOT_A_CURRENCY");
  assert.match(formatted, /1\.?000/);
  assert.match(formatted, /NOT_A_CURRENCY/);
});

test("price input stays numeric and validates unsafe values", async () => {
  const {
    getPriceError,
    parsePriceInput,
    sanitizePriceInput,
  } = await import("../lib/format-price.ts");

  assert.equal(sanitizePriceInput("$ 1.250.000"), "1250000");
  assert.equal(parsePriceInput("1250000"), 1_250_000);
  assert.equal(getPriceError(""), "Escribe el precio del producto.");
  assert.equal(getPriceError("0"), "El precio debe ser mayor que cero.");
  assert.equal(getPriceError("", true), null);
});

test("priceToWords explains Colombian prices", async () => {
  const { priceToWords } = await import("../lib/format-price.ts");

  assert.equal(priceToWords(1), "Un peso");
  assert.equal(priceToWords(1_250_000), "Un millón doscientos cincuenta mil pesos");
  assert.equal(priceToWords(15_000_000), "Quince millones de pesos");
  assert.equal(priceToWords(0), "");
});
