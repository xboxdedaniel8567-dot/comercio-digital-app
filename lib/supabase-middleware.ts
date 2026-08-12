import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { resolvePrivateRouteAccess } from "@/lib/auth-redirects";

type CookieMutation = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function authorizePrivateRequest(request: NextRequest) {
  const cookieMutations: CookieMutation[] = [];
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookieMutations.push(...cookiesToSet);
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };

  const decision = resolvePrivateRouteAccess(
    request.nextUrl.pathname,
    profile?.role,
    Boolean(user),
    Boolean(profile),
  );

  if (decision.allowed) return response;

  const redirectResponse = NextResponse.redirect(new URL(decision.redirectTo, request.url));
  cookieMutations.forEach(({ name, value, options }) => {
    redirectResponse.cookies.set(name, value, options);
  });
  return redirectResponse;
}
