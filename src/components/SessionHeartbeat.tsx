"use client";

import React, { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export const SessionHeartbeat: React.FC = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const lastPingTimeRef = useRef<number>(0);

  const sessionId = (session?.user as unknown as { sessionId?: string })?.sessionId;

  const sendPing = async (page: string) => {
    if (!sessionId || status !== "authenticated") return;

    // Client-side throttle: don't ping more frequently than once every 10 seconds
    const now = Date.now();
    if (now - lastPingTimeRef.current < 10000) return;
    lastPingTimeRef.current = now;

    try {
      await fetch("/api/session/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          currentPage: page || "/dashboard",
        }),
      });
    } catch {
      // Fail silently to never interrupt candidate UX
    }
  };

  // Ping on route change
  useEffect(() => {
    if (status === "authenticated" && sessionId && pathname) {
      sendPing(pathname);
    }
  }, [pathname, sessionId, status]);

  // Periodic heartbeat every 60 seconds
  useEffect(() => {
    if (status !== "authenticated" || !sessionId) return;

    // Send initial ping
    sendPing(pathname || "/dashboard");

    const intervalId = setInterval(() => {
      sendPing(pathname || "/dashboard");
    }, 60000); // 60s heartbeat

    return () => clearInterval(intervalId);
  }, [sessionId, status, pathname]);

  return null;
};
