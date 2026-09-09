import mongoose from "mongoose";
import { connectToDatabase } from "./mongodb";
import { LoginSessionModel, ILoginSession } from "@/models/LoginSession";

export type DeviceType = "Desktop" | "Mobile" | "Tablet" | "Unknown";

/**
 * Parses user agent string to classify device type
 */
export function parseDevice(userAgent?: string | null): DeviceType {
  if (!userAgent) return "Unknown";
  const ua = userAgent.toLowerCase();

  // Check Tablet first (iPad, Android tablets without 'mobile')
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    return "Tablet";
  }

  // Check Mobile
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return "Mobile";
  }

  // Check Desktop
  if (/windows|macintosh|linux|cros/i.test(ua)) {
    return "Desktop";
  }

  return "Desktop";
}

/**
 * Extracts client IP address from request headers
 */
export function getClientIp(
  headers: Headers | Record<string, string | string[] | undefined>
): string | null {
  const getHeader = (key: string): string | null => {
    if (typeof (headers as Headers).get === "function") {
      return (headers as Headers).get(key);
    }
    const val = (headers as Record<string, string | string[] | undefined>)[key];
    if (Array.isArray(val)) return val[0] || null;
    return val || null;
  };

  const forwarded = getHeader("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",");
    return ips[0].trim();
  }

  const realIp = getHeader("x-real-ip") || getHeader("cf-connecting-ip");
  if (realIp) return realIp.trim();

  return null;
}

/**
 * Extracts coarse-grained approximate location from Vercel / Cloudflare edge headers
 */
export function getApproxLocation(
  headers: Headers | Record<string, string | string[] | undefined>,
  ip?: string | null
): string | null {
  const getHeader = (key: string): string | null => {
    if (typeof (headers as Headers).get === "function") {
      return (headers as Headers).get(key);
    }
    const val = (headers as Record<string, string | string[] | undefined>)[key];
    if (Array.isArray(val)) return val[0] || null;
    return val || null;
  };

  // Vercel Geolocation headers
  const city = getHeader("x-vercel-ip-city");
  const country = getHeader("x-vercel-ip-country");
  const region = getHeader("x-vercel-ip-country-region");

  if (city && country) {
    try {
      return `${decodeURIComponent(city)}, ${country}${region ? ` (${region})` : ""}`;
    } catch {
      return `${city}, ${country}`;
    }
  }

  // Cloudflare Geolocation headers
  const cfCity = getHeader("cf-ipcity");
  const cfCountry = getHeader("cf-ipcountry");
  if (cfCity && cfCountry) {
    return `${cfCity}, ${cfCountry}`;
  }

  if (country) {
    return country;
  }

  // Local development fallback
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
    return "Localhost / Dev";
  }

  return null;
}

/**
 * Sweep stale/inactive sessions (sessions un-pinged for > 30 minutes)
 */
export async function sweepInactiveSessions(): Promise<number> {
  try {
    await connectToDatabase();
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const staleSessions = await LoginSessionModel.find({
      isClosed: false,
      lastActivityAt: { $lt: thirtyMinutesAgo },
    });

    let sweptCount = 0;
    for (const session of staleSessions) {
      session.isClosed = true;
      session.logoutAt = session.lastActivityAt;
      session.sessionDurationSeconds = Math.max(
        0,
        Math.floor(
          (new Date(session.lastActivityAt).getTime() - new Date(session.loginAt).getTime()) / 1000
        )
      );
      await session.save();
      sweptCount++;
    }

    return sweptCount;
  } catch (error) {
    console.error("Error sweeping inactive sessions:", error);
    return 0;
  }
}

/**
 * Creates a new LoginSession record in MongoDB
 */
export async function createLoginSession(params: {
  userId: string | mongoose.Types.ObjectId;
  username: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  device?: DeviceType;
  approxLocation?: string | null;
  initialPage?: string;
}): Promise<string> {
  await connectToDatabase();

  // Periodically sweep inactive sessions
  sweepInactiveSessions().catch((err) => console.error("Auto-sweep error:", err));

  const device = params.device || parseDevice(params.userAgent);

  const newSession = await LoginSessionModel.create({
    userId: new mongoose.Types.ObjectId(params.userId),
    username: params.username,
    loginAt: new Date(),
    lastActivityAt: new Date(),
    sessionDurationSeconds: 0,
    ipAddress: params.ipAddress || null,
    userAgent: params.userAgent || null,
    device,
    approxLocation: params.approxLocation || null,
    pagesVisited: params.initialPage ? [params.initialPage] : ["/login"],
    isClosed: false,
  });

  return newSession._id.toString();
}

/**
 * Updates session activity on client heartbeat ping (every 60s)
 */
export async function updateSessionPing(
  sessionId: string,
  currentPage?: string
): Promise<boolean> {
  if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
    return false;
  }

  await connectToDatabase();

  const session = await LoginSessionModel.findById(sessionId);
  if (!session) return false;

  // If session was prematurely closed by inactivity sweep but candidate is actively pinging, reopen it
  const now = new Date();
  const duration = Math.max(
    0,
    Math.floor((now.getTime() - new Date(session.loginAt).getTime()) / 1000)
  );

  session.lastActivityAt = now;
  session.sessionDurationSeconds = duration;
  if (session.isClosed) {
    session.isClosed = false;
    session.logoutAt = undefined;
  }

  if (currentPage && typeof currentPage === "string") {
    if (!session.pagesVisited) {
      session.pagesVisited = [];
    }
    if (!session.pagesVisited.includes(currentPage)) {
      session.pagesVisited.push(currentPage);
    }
  }

  await session.save();
  return true;
}

/**
 * Closes an active login session on explicit sign-out
 */
export async function closeSession(sessionId: string): Promise<boolean> {
  if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
    return false;
  }

  await connectToDatabase();

  const session = await LoginSessionModel.findById(sessionId);
  if (!session) return false;

  const logoutTime = new Date();
  session.logoutAt = logoutTime;
  session.isClosed = true;
  session.sessionDurationSeconds = Math.max(
    0,
    Math.floor((logoutTime.getTime() - new Date(session.loginAt).getTime()) / 1000)
  );

  await session.save();
  return true;
}
