import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES   = ["/", "/login", "/register", "/about", "/pricing"];
const AUTH_ROUTES     = ["/login", "/register"];
const RECRUITER_PATHS = ["/recruiter"];
const ADMIN_PATHS     = ["/admin"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth pages
  if (user && AUTH_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect all non-public routes
  const isPublic = PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_ROUTES.some(r => r !== "/" && pathname.startsWith(r));

  if (!isPublic && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based protection for recruiter and admin sections
  const needsRoleCheck =
    RECRUITER_PATHS.some(p => pathname.startsWith(p)) ||
    ADMIN_PATHS.some(p => pathname.startsWith(p));

  if (user && needsRoleCheck) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "student";

    if (ADMIN_PATHS.some(p => pathname.startsWith(p)) && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (RECRUITER_PATHS.some(p => pathname.startsWith(p)) && role !== "recruiter" && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|manifest.json|icons/).*)",
  ],
};
