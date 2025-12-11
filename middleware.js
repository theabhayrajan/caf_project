import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("caf_admin_token")?.value;
  const path = req.nextUrl.pathname;

  console.log("🔥 MIDDLEWARE TRIGGERED FOR:", path);
  console.log("🔑 Token Found:", token ? "YES" : "NO");

  // Prevent accessing dashboard without login
  if (path.startsWith("/admin/dashboard") && !token) {
    console.log("⛔ Redirect → /admin (not logged in)");
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Prevent accessing login page when already logged in
  if (path === "/admin" && token) {
    console.log("✅ Already logged in → Redirect → /admin/dashboard");
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

// Middleware applies only on admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
