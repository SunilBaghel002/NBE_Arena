import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { LoginSessionModel, ILoginSession } from "@/models/LoginSession";
import { UserModel } from "@/models/User";
import { sweepInactiveSessions } from "@/lib/session-tracker";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as unknown as { role?: string })?.role;

    // RBAC Security Gate: Only admin users permitted
    if (!session || role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required to view activity logs" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Sweep any sessions inactive for > 30 minutes before computing stats
    await sweepInactiveSessions();

    const { searchParams } = new URL(req.url);
    const userIdFilter = searchParams.get("userId");
    const range = searchParams.get("range") || "all";
    const searchQuery = searchParams.get("search")?.toLowerCase().trim();
    const format = searchParams.get("format");

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Build timeline query filter
    const query: Record<string, any> = {};

    if (userIdFilter) {
      query.userId = userIdFilter;
    }

    if (range === "today") {
      query.loginAt = { $gte: startOfToday };
    } else if (range === "7d") {
      query.loginAt = { $gte: sevenDaysAgo };
    } else if (range === "30d") {
      query.loginAt = { $gte: thirtyDaysAgo };
    }

    if (searchQuery) {
      query.username = { $regex: searchQuery, $options: "i" };
    }

    // High-level overall metrics across all sessions
    const [allSessions, users] = await Promise.all([
      LoginSessionModel.find({}).sort({ loginAt: -1 }).lean(),
      UserModel.find({}).sort({ name: 1 }).lean(),
    ]);

    const userMap = new Map<string, (typeof users)[0]>();
    for (const u of users) {
      userMap.set(u._id.toString(), u);
    }

    // Active Users Right Now (open session + activity in past 5 minutes)
    const activeSessions = allSessions.filter(
      (s) => !s.isClosed && new Date(s.lastActivityAt) >= fiveMinutesAgo
    );

    const activeUserIds = new Set<string>();
    const activeUsersList = [];
    for (const s of activeSessions) {
      const uid = s.userId.toString();
      if (!activeUserIds.has(uid)) {
        activeUserIds.add(uid);
        const u = userMap.get(uid);
        activeUsersList.push({
          userId: uid,
          username: s.username,
          name: u?.name || s.username,
          role: u?.role || "student",
          device: s.device,
          ipAddress: s.ipAddress,
          approxLocation: s.approxLocation,
          lastActivityAt: s.lastActivityAt,
          currentPage: s.pagesVisited?.length ? s.pagesVisited[s.pagesVisited.length - 1] : "/dashboard",
        });
      }
    }

    const loginsToday = allSessions.filter((s) => new Date(s.loginAt) >= startOfToday).length;
    const loginsThisWeek = allSessions.filter((s) => new Date(s.loginAt) >= sevenDaysAgo).length;
    const loginsThisMonth = allSessions.filter((s) => new Date(s.loginAt) >= thirtyDaysAgo).length;
    const totalDurationAll = allSessions.reduce((acc, curr) => acc + (curr.sessionDurationSeconds || 0), 0);

    // Per-User Summary Aggregation
    const sessionsByUser = new Map<string, typeof allSessions>();
    for (const s of allSessions) {
      const uid = s.userId.toString();
      const list = sessionsByUser.get(uid) || [];
      list.push(s);
      sessionsByUser.set(uid, list);
    }

    const userSummaries = users
      .filter((u) => {
        if (userIdFilter && u._id.toString() !== userIdFilter) return false;
        if (searchQuery) {
          return (
            u.username.toLowerCase().includes(searchQuery) ||
            u.name.toLowerCase().includes(searchQuery)
          );
        }
        return true;
      })
      .map((u) => {
        const uSessions = sessionsByUser.get(u._id.toString()) || [];
        const totalUserDuration = uSessions.reduce(
          (acc, curr) => acc + (curr.sessionDurationSeconds || 0),
          0
        );
        const latestSession = uSessions[0] || null;
        const isCurrentlyActive = activeUserIds.has(u._id.toString());

        return {
          userId: u._id.toString(),
          username: u.username,
          name: u.name,
          role: u.role,
          totalSessions: uSessions.length,
          totalDurationSeconds: totalUserDuration,
          lastLoginAt: latestSession?.loginAt || null,
          lastActivityAt: latestSession?.lastActivityAt || null,
          latestDevice: latestSession?.device || "Desktop",
          latestIp: latestSession?.ipAddress || null,
          latestLocation: latestSession?.approxLocation || null,
          isActiveNow: isCurrentlyActive,
        };
      });

    // Timeline Sessions matching filtered query
    const timelineLimit = format === "csv" ? 2000 : 50;
    const filteredSessions = await LoginSessionModel.find(query)
      .sort({ loginAt: -1 })
      .limit(timelineLimit)
      .lean();

    const formattedTimeline = filteredSessions.map((s) => {
      const u = userMap.get(s.userId.toString());
      const isActiveNow = !s.isClosed && new Date(s.lastActivityAt) >= fiveMinutesAgo;

      return {
        id: s._id.toString(),
        userId: s.userId.toString(),
        username: s.username,
        name: u?.name || s.username,
        role: u?.role || "student",
        loginAt: s.loginAt,
        logoutAt: s.logoutAt,
        lastActivityAt: s.lastActivityAt,
        sessionDurationSeconds: s.sessionDurationSeconds,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        device: s.device,
        approxLocation: s.approxLocation,
        pagesVisited: s.pagesVisited || [],
        isClosed: s.isClosed,
        isActiveNow,
      };
    });

    // CSV Export Handler
    if (format === "csv") {
      const csvRows: string[] = [];
      // CSV Header
      csvRows.push(
        [
          "Session ID",
          "Candidate Username",
          "Candidate Name",
          "Role",
          "Login Time (UTC)",
          "Logout Time (UTC)",
          "Duration (Minutes)",
          "Duration (Seconds)",
          "Status",
          "Device",
          "IP Address",
          "Approx Location",
          "Pages Visited",
        ]
          .map((v) => `"${v}"`)
          .join(",")
      );

      for (const s of formattedTimeline) {
        const durationMin = (s.sessionDurationSeconds / 60).toFixed(1);
        const statusStr = s.isActiveNow ? "Active Now" : s.isClosed ? "Closed" : "Idle";
        const pagesStr = (s.pagesVisited || []).join(" -> ");

        csvRows.push(
          [
            s.id,
            s.username,
            s.name,
            s.role,
            new Date(s.loginAt).toISOString(),
            s.logoutAt ? new Date(s.logoutAt).toISOString() : "Active / In-progress",
            durationMin,
            s.sessionDurationSeconds.toString(),
            statusStr,
            s.device,
            s.ipAddress || "N/A",
            s.approxLocation || "N/A",
            pagesStr,
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        );
      }

      const csvContent = csvRows.join("\n");
      return new Response(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="nbe_candidate_activity_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // JSON Response
    return NextResponse.json({
      summary: {
        activeUsersNow: activeUsersList.length,
        activeUsersList,
        loginsToday,
        loginsThisWeek,
        loginsThisMonth,
        totalSessions: allSessions.length,
        totalDurationSeconds: totalDurationAll,
      },
      userSummaries,
      timeline: formattedTimeline,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/activity:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
