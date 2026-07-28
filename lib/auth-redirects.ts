export function resolvePostResetPath(role: string | null | undefined) {
  if (role === "buyer") return "/cuenta";
  if (role === "admin" || role === "super_admin") return "/admin";
  return "/panel";
}

export function resolveLoginRedirectPath(
  role: string,
  nextPath: string | null,
): string {
  const safeNext =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : null;

  if (role === "buyer") return safeNext ?? "/cuenta";
  if (role === "admin" || role === "super_admin") return safeNext ?? "/admin";
  return safeNext ?? "/panel";
}
