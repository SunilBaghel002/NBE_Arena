import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

function setDynamicNextAuthUrl(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host) {
    const origin = `${proto}://${host}`;
    process.env.NEXTAUTH_URL = origin;
    process.env.NEXTAUTH_URL_INTERNAL = origin;
  }
}

export async function GET(req: NextRequest, ctx: any) {
  setDynamicNextAuthUrl(req);
  const handler = NextAuth(authOptions);
  return handler(req, ctx);
}

export async function POST(req: NextRequest, ctx: any) {
  setDynamicNextAuthUrl(req);
  const handler = NextAuth(authOptions);
  return handler(req, ctx);
}
