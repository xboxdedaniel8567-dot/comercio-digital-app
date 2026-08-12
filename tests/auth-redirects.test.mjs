import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("existing email accounts keep redirects for their role", async () => {
  const { resolveAuthenticatedEntryPath } = await import("../lib/auth-redirects.ts");

  assert.equal(resolveAuthenticatedEntryPath("buyer", true, null), "/cuenta");
  assert.equal(resolveAuthenticatedEntryPath("merchant", true, null), "/panel");
});

test("traditional registrations enter through their explicit role", async () => {
  const { resolveAuthenticatedEntryPath } = await import("../lib/auth-redirects.ts");

  assert.equal(resolveAuthenticatedEntryPath("buyer", true, "/cuenta"), "/cuenta");
  assert.equal(resolveAuthenticatedEntryPath("merchant", true, "/panel/tienda"), "/panel/tienda");
});

test("existing Google accounts preserve buyer and merchant roles", async () => {
  const { resolveAuthenticatedEntryPath } = await import("../lib/auth-redirects.ts");

  assert.equal(resolveAuthenticatedEntryPath("buyer", true, "/panel"), "/cuenta");
  assert.equal(resolveAuthenticatedEntryPath("merchant", true, "/cuenta"), "/panel");
});

test("new Google account without profile must choose its account type", async () => {
  const { resolveAuthenticatedEntryPath } = await import("../lib/auth-redirects.ts");

  assert.equal(resolveAuthenticatedEntryPath(null, false, null), "/cuenta/tipo");
});

test("existing administrators bypass account-type onboarding", async () => {
  const { resolveAuthenticatedEntryPath } = await import("../lib/auth-redirects.ts");

  assert.equal(resolveAuthenticatedEntryPath("admin", true, null), "/admin");
  assert.equal(resolveAuthenticatedEntryPath("super_admin", true, "/admin/calidad"), "/admin/calidad");
});

test("password reset and unsafe next paths remain role-safe", async () => {
  const { resolvePostResetPath, resolveLoginRedirectPath } = await import("../lib/auth-redirects.ts");

  assert.equal(resolvePostResetPath("buyer"), "/cuenta");
  assert.equal(resolvePostResetPath("admin"), "/admin");
  assert.equal(resolvePostResetPath("merchant"), "/panel");
  assert.equal(resolveLoginRedirectPath("buyer", "//evil.test"), "/cuenta");
  assert.equal(resolveLoginRedirectPath("buyer", "/admin"), "/cuenta");
  assert.equal(resolveLoginRedirectPath("merchant", "/admin"), "/panel");
});

test("SQL onboarding never defaults a missing account type to merchant", async () => {
  const sql = await readFile(new URL("../supabase/auth_onboarding.sql", import.meta.url), "utf8");

  assert.doesNotMatch(sql, /coalesce\([^\n]+account_type[^\n]+merchant/i);
  assert.match(sql, /account_type_value is null or account_type_value not in \('buyer', 'merchant'\)/);
  assert.match(sql, /return new;/);
});

test("public panel auth routes stay available before authentication", async () => {
  const { isProtectedPrivatePath } = await import("../lib/auth-redirects.ts");

  for (const pathname of [
    "/panel/login",
    "/panel/registro",
    "/panel/recuperar",
    "/panel/restablecer",
  ]) {
    assert.equal(isProtectedPrivatePath(pathname), false);
  }
});

test("anonymous and expired sessions are redirected before private routes", async () => {
  const { resolvePrivateRouteAccess } = await import("../lib/auth-redirects.ts");

  assert.deepEqual(resolvePrivateRouteAccess("/panel", null, false, false), {
    allowed: false,
    redirectTo: "/panel/login?next=%2Fpanel",
  });
  assert.deepEqual(resolvePrivateRouteAccess("/admin", null, false, false), {
    allowed: false,
    redirectTo: "/panel/login?next=%2Fadmin",
  });
  assert.equal(resolvePrivateRouteAccess("/panel/productos", null, false, false).allowed, false);
});

test("buyer cannot render merchant or admin routes", async () => {
  const { resolvePrivateRouteAccess } = await import("../lib/auth-redirects.ts");

  for (const pathname of ["/panel", "/admin"]) {
    assert.deepEqual(resolvePrivateRouteAccess(pathname, "buyer", true, true), {
      allowed: false,
      redirectTo: "/cuenta",
    });
  }
});

test("merchant roles can render panel but not admin", async () => {
  const { resolvePrivateRouteAccess } = await import("../lib/auth-redirects.ts");

  for (const role of ["merchant", "merchant_staff"]) {
    assert.deepEqual(resolvePrivateRouteAccess("/panel/productos", role, true, true), {
      allowed: true,
    });
    assert.deepEqual(resolvePrivateRouteAccess("/admin/productos", role, true, true), {
      allowed: false,
      redirectTo: "/panel",
    });
  }
});

test("admin roles can render admin and keep the current panel redirect policy", async () => {
  const { resolvePrivateRouteAccess } = await import("../lib/auth-redirects.ts");

  for (const role of ["admin", "super_admin"]) {
    assert.deepEqual(resolvePrivateRouteAccess("/admin", role, true, true), {
      allowed: true,
    });
    assert.deepEqual(resolvePrivateRouteAccess("/panel", role, true, true), {
      allowed: false,
      redirectTo: "/admin",
    });
  }
});

test("authenticated users without profiles continue OAuth onboarding", async () => {
  const { resolvePrivateRouteAccess } = await import("../lib/auth-redirects.ts");

  assert.deepEqual(resolvePrivateRouteAccess("/panel", null, true, false), {
    allowed: false,
    redirectTo: "/cuenta/tipo",
  });
});
