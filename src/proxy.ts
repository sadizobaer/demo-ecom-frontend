/**
 * Next.js Proxy — Route Protection
 *
 * This file replaces the deprecated middleware.ts in Next.js 16.
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Proxy /uploads/:path* to the backend
  if (pathname.startsWith("/uploads")) {
    return NextResponse.rewrite(new URL(pathname, BACKEND));
  }

  // 2. Only guard /admin/* routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const isAdminCookie = req.cookies.get("is_admin")?.value;

  if (isAdminCookie !== "1") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("auth", "admin_required");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/uploads/:path*"],
};
