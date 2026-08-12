export function resolvePostResetPath(role: string | null | undefined) {
  if (role === "buyer") return "/cuenta";
  if (role === "admin" || role === "super_admin") return "/admin";
  return "/panel";
}

export function resolveLoginRedirectPath(
  role: string | null | undefined,
  nextPath: string | null,
): string {
  const safeNext =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : null;

  if (role === "buyer") {
    return safeNext && !safeNext.startsWith("/panel") && !safeNext.startsWith("/admin")
      ? safeNext
      : "/cuenta";
  }

  if (role === "admin" || role === "super_admin") {
    return safeNext?.startsWith("/admin") ? safeNext : "/admin";
  }

  return safeNext && !safeNext.startsWith("/cuenta") && !safeNext.startsWith("/admin")
    ? safeNext
    : "/panel";
}

export function resolveAuthenticatedEntryPath(
  role: string | null | undefined,
  hasProfile: boolean,
  nextPath: string | null,
): string {
  if (!hasProfile || !role) return "/cuenta/tipo";
  return resolveLoginRedirectPath(role, nextPath);
}

export type PrivateRouteDecision =
  | { allowed: true }
  | { allowed: false; redirectTo: string };

const PUBLIC_PANEL_PATHS = new Set([
  "/panel/login",
  "/panel/recuperar",
  "/panel/registro",
  "/panel/restablecer",
]);

export function isProtectedPrivatePath(pathname: string): boolean {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  if (pathname !== "/panel" && !pathname.startsWith("/panel/")) return false;
  return !PUBLIC_PANEL_PATHS.has(pathname);
}

export function resolvePrivateRouteAccess(
  pathname: string,
  role: string | null | undefined,
  hasUser: boolean,
  hasProfile: boolean,
): PrivateRouteDecision {
  if (!isProtectedPrivatePath(pathname)) return { allowed: true };

  if (!hasUser) {
    return {
      allowed: false,
      redirectTo: `/panel/login?next=${encodeURIComponent(pathname)}`,
    };
  }

  if (!hasProfile || !role) {
    return { allowed: false, redirectTo: "/cuenta/tipo" };
  }

  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdmin = role === "admin" || role === "super_admin";
  const isMerchant = role === "merchant" || role === "merchant_staff";

  if (isAdminPath) {
    if (isAdmin) return { allowed: true };
    return {
      allowed: false,
      redirectTo: isMerchant ? "/panel" : "/cuenta",
    };
  }

  if (isMerchant) return { allowed: true };
  return { allowed: false, redirectTo: isAdmin ? "/admin" : "/cuenta" };
}
