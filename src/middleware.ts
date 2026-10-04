import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const key = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-only-secret-change-me");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/dashboard/login")) return NextResponse.next();

  const token = req.cookies.get("abiest_admin")?.value;
  if (token) {
    try {
      await jwtVerify(token, key());
      return NextResponse.next();
    } catch {}
  }
  const url = req.nextUrl.clone();
  url.pathname = "/dashboard/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/dashboard/:path*"] };
