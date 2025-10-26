import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { signToken, verifyToken } from "@/lib/auth/session";

// Route protection configuration
const adminRoutes = "/admin";
const memberRoutes = "/member";
const authRoutes = ["/sign-in", "/sign-up"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session");

  const isAdminRoute = pathname.startsWith(adminRoutes);
  const isMemberRoute = pathname.startsWith(memberRoutes);
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = isAdminRoute || isMemberRoute;

  // No session and trying to access protected route
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Has session, verify role-based access
  if (sessionCookie) {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const userRole = parsed.user.role;

      // Admin trying to access member routes
      if (userRole === "admin" && isMemberRoute) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      // Member trying to access admin routes
      if (userRole === "member" && isAdminRoute) {
        return NextResponse.redirect(new URL("/member", request.url));
      }

      // Authenticated user on auth pages, redirect to their dashboard
      if (isAuthRoute) {
        const redirectUrl = userRole === "admin" ? "/admin" : "/member";
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }

      // Refresh session on GET requests
      if (request.method === "GET") {
        const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const res = NextResponse.next();

        res.cookies.set({
          name: "session",
          value: await signToken({
            ...parsed,
            expires: expiresInOneDay.toISOString(),
          }),
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          expires: expiresInOneDay,
        });

        return res;
      }
    } catch (error) {
      console.error("Error verifying session:", error);
      const res = NextResponse.next();
      res.cookies.delete("session");

      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }

      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
  runtime: "nodejs",
};
