"use client";

import React, { useState } from "react";
import {
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  Compass,
  CheckCircle2,
  AlertCircle,
  Radio,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface TimelineSessionItem {
  id: string;
  userId: string;
  username: string;
  name: string;
  role: "admin" | "student";
  loginAt: string;
  logoutAt?: string | null;
  lastActivityAt: string;
  sessionDurationSeconds: number;
  ipAddress?: string | null;
  userAgent?: string | null;
  device: "Desktop" | "Mobile" | "Tablet" | "Unknown";
  approxLocation?: string | null;
  pagesVisited: string[];
  isClosed: boolean;
  isActiveNow: boolean;
}

interface SessionTimelineProps {
  timeline: TimelineSessionItem[];
}

export const SessionTimeline: React.FC<SessionTimelineProps> = ({ timeline }) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "< 1m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "Mobile":
        return <Smartphone className="w-3.5 h-3.5 text-blue-500" />;
      case "Tablet":
        return <Tablet className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Laptop className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatTimestamp = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 sm:p-7 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-black text-lg text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-exam-primary" /> Chronological Session Audit Trail
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed session lifecycles, route breadcrumbs, and duration telemetry across past logins.
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono font-bold self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          Showing {timeline.length} Sessions
        </span>
      </div>

      {timeline.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-sm font-semibold text-slate-600">No session logs match your filters.</p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your candidate selection, search query, or date range.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {timeline.map((s) => {
            const isExpanded = expandedSessionId === s.id;

            return (
              <div
                key={s.id}
                className={`rounded-2xl border transition-all duration-150 p-4 ${
                  s.isActiveNow
                    ? "bg-emerald-50/40 border-emerald-200/80 shadow-xs"
                    : "bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Candidate & Device Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-300 text-slate-800 font-black flex items-center justify-center text-xs">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{s.name}</span>
                        <span className="text-xs font-mono text-slate-400">@{s.username}</span>
                        <Badge variant={s.role === "admin" ? "amber" : "slate"} size="xs">
                          {s.role.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          {getDeviceIcon(s.device)} {s.device}
                        </span>
                        <span>·</span>
                        <span className="font-mono text-slate-600">{s.ipAddress || "Unknown IP"}</span>
                        {s.approxLocation && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1 text-slate-600 font-medium">
                              <Globe className="w-3 h-3 text-slate-400" />
                              {s.approxLocation}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timings & Status Pill */}
                  <div className="flex items-center gap-2.5 sm:self-center">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {s.isActiveNow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Now
                          </span>
                        ) : s.isClosed ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                            Closed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                            Idle
                          </span>
                        )}
                        <span className="text-xs font-black font-tabular text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          {formatDuration(s.sessionDurationSeconds)}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                        {formatTimestamp(s.loginAt)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedSessionId(isExpanded ? null : s.id)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition"
                      aria-label="Toggle Session Details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Pages Visited & User Agent */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3.5 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-exam-primary" /> Route Breadcrumbs Traversed (
                        {s.pagesVisited.length})
                      </span>
                      {s.pagesVisited.length === 0 ? (
                        <span className="text-xs text-slate-400">No route transitions recorded</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {s.pagesVisited.map((p, idx) => (
                            <span
                              key={idx}
                              className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {s.userAgent && (
                      <div className="pt-2 border-t border-slate-100 text-[11px]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Browser User Agent
                        </span>
                        <p className="font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 break-all">
                          {s.userAgent}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
