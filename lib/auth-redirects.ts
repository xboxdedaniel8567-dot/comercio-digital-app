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
