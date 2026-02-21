import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for token in cookie (set by client-side after login)
  const token = request.cookies.get("access_token")?.value;

  // For SPA approach, we rely on client-side auth check
  // This middleware provides a basic server-side guard
  if (!token && pathname !== "/") {
    // Don't redirect the root page (it redirects to /dashboard itself)
    // Client-side auth provider will handle the redirect
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
