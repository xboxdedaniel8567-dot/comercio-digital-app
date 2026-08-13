import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { formatCommercePrice, formatDistance } from "../lib/commerce-format.ts";
import { getInventoryLabel, getInventoryState } from "../lib/inventory.ts";

test("commerce price uses the existing Colombian formatter", () => {
  assert.equal(formatCommercePrice(1_800_000), "$1.800.000");
  assert.equal(formatCommercePrice("$1.800.000"), "$1.800.000");
  assert.equal(formatCommercePrice(null), "Precio por consultar");
});

test("distance formatting covers meters, kilometers and absence", () => {
  assert.equal(formatDistance(450), "450 m");
  assert.equal(formatDistance(1_200), "1,2 km");
  assert.equal(formatDistance(null), null);
  assert.equal(formatDistance(-1), null);
});

test("availability states include text and never depend only on color", () => {
  assert.equal(getInventoryState(8), "available");
  assert.equal(getInventoryLabel(8), "8 disponibles");
  assert.equal(getInventoryState(2), "low");
  assert.match(getInventoryLabel(2), /Pocas unidades/);
  assert.equal(getInventoryLabel(0), "Agotado");
  assert.equal(getInventoryLabel(null), "Disponibilidad por confirmar");
});

test("product card keeps navigation separate from the favorite control", async () => {
  const source = await readFile(new URL("../components/ProductCard.tsx", import.meta.url), "utf8");
  assert.match(source, /href=\{href\}/);
  assert.match(source, /favoriteSlot \? <div/);
  const mediaLinkEnd = source.indexOf("</Link>", source.indexOf("cd-product-card-media-link"));
  const favoriteControl = source.indexOf("favoriteSlot ?");
  assert.ok(mediaLinkEnd >= 0 && mediaLinkEnd < favoriteControl);
  assert.match(source, /promotionLabel \?/);
  assert.match(source, /distanceMeters=\{product\.distanceMeters\}/);
});

test("store card supports real optional media and professional fallback", async () => {
  const storeSource = await readFile(new URL("../components/BusinessCard.tsx", import.meta.url), "utf8");
  const imageSource = await readFile(new URL("../components/CommerceImage.tsx", import.meta.url), "utf8");
  assert.match(storeSource, /src=\{business\.imageUrl\}/);
  assert.match(storeSource, /business\.isSponsored/);
  assert.match(storeSource, /distanceMeters=\{business\.distanceMeters\}/);
  assert.match(imageSource, /cd-commerce-image-fallback/);
  assert.match(imageSource, /aria-label=\{alt\}/);
  assert.match(imageSource, /loading=\{loading\}/);
});
