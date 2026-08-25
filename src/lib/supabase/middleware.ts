import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/welcome", "/login", "/signup", "/auth/callback", "/admin/login"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  const pathname = request.nextUrl.pathname;
  const isAdminPath = pathname.startsWith("/admin");

  if (!user && !isPublicPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isAdminPath ? "/admin/login" : pathname === "/" ? "/welcome" : "/login";
    return NextResponse.redirect(redirectUrl);
  }

  // Admin paths decide their own redirect-when-signed-in behavior at the
  // page/layout level (an admin account vs. a regular account visiting
  // /admin/login need different outcomes) rather than the blanket "logged in
  // + public path -> home" rule below.
  if (user && isPublicPath && !isAdminPath) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  return response;
}
