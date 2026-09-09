"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { ActiveUsersCard } from "@/components/admin/activity/ActiveUsersCard";
import { UserSessionTable, UserSummaryItem } from "@/components/admin/activity/UserSessionTable";
import { SessionTimeline, TimelineSessionItem } from "@/components/admin/activity/SessionTimeline";
import {
  ArrowLeft,
  RefreshCw,
  Download,
  ShieldAlert,
  Search,
  Filter,
  Radio,
  Users,
  Calendar,
  Clock,
  Activity,
  Layers,
} from "lucide-react";

interface ActivityPayload {
  summary: {
    activeUsersNow: number;
    activeUsersList: any[];
    loginsToday: number;
    loginsThisWeek: number;
    loginsThisMonth: number;
    totalSessions: number;
    totalDurationSeconds: number;
  };
  userSummaries: UserSummaryItem[];
  timeline: TimelineSessionItem[];
}

export default function AdminActivityPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ActivityPayload | null>(null);
  const [dateRange, setDateRange] = useState<"all" | "today" | "7d" | "30d">("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<"both" | "summary" | "timeline">("both");

  const userRole = (session?.user as unknown as { role?: string })?.role || "student";

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange !== "all") params.set("range", dateRange);
      if (selectedUserId) params.set("userId", selectedUserId);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/admin/activity?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 403) {
          setData(null);
          return;
        }
        throw new Error("Failed to fetch activity");
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error loading admin activity:", err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedUserId, searchQuery]);

  useEffect(() => {
    if (status === "authenticated" && userRole === "admin") {
      fetchActivity();
      // Auto-refresh every 30 seconds for live candidate monitoring
      const interval = setInterval(fetchActivity, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [status, userRole, fetchActivity]);

  const handleExportCsv = () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      params.set("format", "csv");
      if (dateRange !== "all") params.set("range", dateRange);
      if (selectedUserId) params.set("userId", selectedUserId);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      window.location.href = `/api/admin/activity?${params.toString()}`;
    } catch (e) {
      console.error("Error exporting CSV:", e);
    } finally {
      setTimeout(() => setIsExporting(false), 2000);
    }
  };

  const formatHours = (seconds: number) => {
    const hrs = (seconds / 3600).toFixed(1);
    return `${hrs}h`;
  };

  if (status === "loading" || (loading && !data)) {
    return (
      <div className="min-h-screen bg-exam-bg flex flex-col justify-between">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-12 h-12 border-4 border-exam-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-base font-bold text-slate-700">Loading Candidate Telemetry...</h2>
        </div>
        <footer className="bg-white border-t border-exam-border py-4 text-center text-xs text-slate-400">
          NBE Arena — Activity Audit Center
        </footer>
      </div>
    );
  }

  // RBAC Access Restriction Gate
  if (userRole !== "admin") {
    return (
      <div className="min-h-screen bg-exam-bg flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-card border border-exam-border text-center max-w-md w-full">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="font-black text-xl text-slate-800 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-6">
            You do not have administrative privileges to view candidate session logs or platform telemetry.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-exam-primary text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-exam-primaryHover transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Student Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-exam-bg flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-7">
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Control Center
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <Activity className="w-7 h-7 text-exam-primary" /> Candidate Login & Activity Audit
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live heartbeat telemetry, session durations, device footprints, and route breadcrumbs across candidates.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-xs transition"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>{isExporting ? "Generating CSV..." : "Export CSV"}</span>
            </button>

            <button
              type="button"
              onClick={() => fetchActivity()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-exam-primary hover:bg-exam-primaryHover text-white text-xs sm:text-sm font-bold shadow-sm transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Real-Time Telemetry Card */}
        {data?.summary && (
          <ActiveUsersCard activeUsers={data.summary.activeUsersList || []} />
        )}

        {/* Overall Platform Metrics Row */}
        {data?.summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Active Right Now
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-tabular">
                  {data.summary.activeUsersNow}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Within last 5 mins</span>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Logins Today
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-tabular">
                {data.summary.loginsToday}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">Since 00:00 midnight</span>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Logins This Week
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-tabular">
                {data.summary.loginsThisWeek}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">Past 7 days rolling</span>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Sessions
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-tabular">
                {data.summary.totalSessions}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">All-time tracked logins</span>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-card col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Candidate Hours
              </span>
              <span className="text-2xl sm:text-3xl font-black text-exam-primary font-tabular">
                {formatHours(data.summary.totalDurationSeconds)}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">Active on-platform time</span>
            </div>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            {/* Date Range Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start md:self-auto">
              {(
                [
                  { key: "all", label: "All Time" },
                  { key: "today", label: "Today" },
                  { key: "7d", label: "Last 7 Days" },
                  { key: "30d", label: "Last 30 Days" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setDateRange(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    dateRange === tab.key
                      ? "bg-white text-exam-primary shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* View Tab Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveViewTab("both")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeViewTab === "both"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Views
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab("summary")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeViewTab === "summary"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Candidate Table
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab("timeline")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeViewTab === "timeline"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Session Timeline
              </button>
            </div>
          </div>

          {/* Search and Candidate Select Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            {/* Candidate Dropdown Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Filter by Candidate
              </label>
              <select
                value={selectedUserId || ""}
                onChange={(e) => setSelectedUserId(e.target.value || null)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-medium focus:ring-2 focus:ring-exam-primary"
              >
                <option value="">All Candidates (Controlled Cohort)</option>
                {data?.userSummaries.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.name} (@{u.username}) — {u.totalSessions} sessions
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Search Candidate or Username
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. karishma, prachii, sunil, demobot..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-exam-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Candidate Usage Summary Table */}
        {(activeViewTab === "both" || activeViewTab === "summary") && (
          <UserSessionTable
            users={data?.userSummaries || []}
            selectedUserId={selectedUserId}
            onSelectUser={(uid) => setSelectedUserId(uid)}
          />
        )}

        {/* Section 2: Chronological Session Timeline */}
        {(activeViewTab === "both" || activeViewTab === "timeline") && (
          <SessionTimeline timeline={data?.timeline || []} />
        )}
      </main>

      <footer className="bg-white border-t border-exam-border py-4 text-center text-xs text-slate-400 mt-10">
        NBE Arena — Activity Audit Center · Admin Only Access
      </footer>
    </div>
  );
}
