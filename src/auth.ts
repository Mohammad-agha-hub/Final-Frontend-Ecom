// src/auth.ts
import NextAuth from "next-auth";
import { authOptions } from "./auth.config";

const handler = NextAuth(authOptions);

// Correct way to get the auth session
export async function auth() {
  const session = await handler.auth?.();
  return session || null;
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

export { handler as GET, handler as POST };