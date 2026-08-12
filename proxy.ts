import type { NextRequest } from "next/server";
import { authorizePrivateRequest } from "@/lib/supabase-middleware";

export function proxy(request: NextRequest) {
  return authorizePrivateRequest(request);
}

export const config = {
  matcher: ["/panel/:path*", "/admin/:path*"],
};
