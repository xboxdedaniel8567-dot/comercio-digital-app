import assert from "node:assert/strict";
import test from "node:test";

test("resolvePostResetPath sends buyers and admins to the right home", async () => {
  const { resolvePostResetPath, resolveLoginRedirectPath } = await import("../lib/auth-redirects.ts");

  assert.equal(resolvePostResetPath("buyer"), "/cuenta");
  assert.equal(resolvePostResetPath("admin"), "/admin");
  assert.equal(resolvePostResetPath("merchant"), "/panel");
  assert.equal(resolveLoginRedirectPath("merchant", "/panel/tienda"), "/panel/tienda");
  assert.equal(resolveLoginRedirectPath("buyer", "//evil.test"), "/cuenta");
});
