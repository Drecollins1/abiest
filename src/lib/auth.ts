import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "abiest_admin";
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-only-secret-change-me");

export async function createSession(email: string) {
  const token = await new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function verifyToken(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return payload as { email: string; role: string };
  } catch {
    return null;
  }
}

export async function getSession() {
  return verifyToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Call at the top of every dashboard server action. Middleware guards pages; this guards mutations. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/dashboard/login");
  return session;
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}
