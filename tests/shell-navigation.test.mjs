import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  getActiveShellHref,
  merchantMobileLinks,
  publicMobileLinks,
} from "../lib/shell-navigation.ts";
import { adminLinks } from "../lib/admin-links.ts";
import { merchantLinks } from "../lib/merchant-links.ts";

test("client and merchant mobile navigation expose five reachable destinations", () => {
  assert.deepEqual(publicMobileLinks.map(({ label }) => label), ["Inicio", "Buscar", "Cerca", "Favoritos", "Perfil"]);
  assert.equal(merchantMobileLinks.length, 4);
  assert.deepEqual(merchantMobileLinks.map(({ label }) => label), ["Resumen", "Productos", "Anadir", "Reservas"]);
});

test("active navigation selects only the most specific route", () => {
  assert.equal(getActiveShellHref("/panel", merchantLinks), "/panel");
  assert.equal(getActiveShellHref("/panel/productos/nuevo", merchantLinks), "/panel/productos/nuevo");
  assert.equal(getActiveShellHref("/panel/productos/iphone/editar", merchantLinks), "/panel/productos");
  assert.equal(getActiveShellHref("/admin/reportes", adminLinks), "/admin/reportes");
});

test("admin navigation preserves the approved information groups", () => {
  assert.deepEqual([...new Set(adminLinks.map(({ group }) => group))], ["Operaciones", "Moderacion", "Sistema"]);
});

test("dashboard drawer keeps keyboard and active-state accessibility contracts", async () => {
  const source = await readFile(new URL("../components/DashboardShell.tsx", import.meta.url), "utf8");
  assert.match(source, /aria-current=/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /event\.key !== "Tab"/);
  assert.match(source, /previouslyFocused/);
});
