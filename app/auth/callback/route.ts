import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { resolveAuthenticatedEntryPath } from "@/lib/auth-redirects";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = requestUrl.searchParams.get("next");
  const response = NextResponse.redirect(new URL("/panel/login", request.url));

  if (!code) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    const loginUrl = new URL("/panel/login", request.url);
    loginUrl.searchParams.set("oauth", "1");
    loginUrl.searchParams.set("error_description", error?.message ?? "No encontramos una sesion valida.");
    response.headers.set("location", loginUrl.toString());
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  response.headers.set(
    "location",
    new URL(
      resolveAuthenticatedEntryPath(profile?.role, Boolean(profile), nextPath),
      request.url,
    ).toString(),
  );
  return response;
}
