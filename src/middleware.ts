import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const access = req.cookies.get("access")?.value;
  const userCookie = req.cookies.get("user")?.value;
  const user = userCookie ? JSON.parse(userCookie) : null;

  const { pathname, search } = req.nextUrl;

  const protectedPaths = ["/owner", "/orders"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  if (!access) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/owner") && !user?.is_restaurant_owner) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*", "/orders/:path*"],
};
