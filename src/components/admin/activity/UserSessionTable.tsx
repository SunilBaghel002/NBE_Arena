"use client";

import React from "react";
import { Laptop, Smartphone, Tablet, Globe, Clock, History, UserCheck, Shield } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface UserSummaryItem {
  userId: string;
  username: string;
  name: string;
  role: "admin" | "student";
  totalSessions: number;
  totalDurationSeconds: number;
  lastLoginAt: string | null;
  lastActivityAt: string | null;
  latestDevice: "Desktop" | "Mobile" | "Tablet" | "Unknown";
  latestIp: string | null;
  latestLocation: string | null;
  isActiveNow: boolean;
}

interface UserSessionTableProps {
  users: UserSummaryItem[];
  selectedUserId?: string | null;
  onSelectUser: (userId: string | null) => void;
}

export const UserSessionTable: React.FC<UserSessionTableProps> = ({
  users,
  selectedUserId,
  onSelectUser,
}) => {
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-black text-lg text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-exam-primary" /> Candidate Usage Profiles ({users.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated login sessions, cumulative platform engagement, and device footprints across candidates.
          </p>
        </div>

        {selectedUserId && (
          <button
            type="button"
            onClick={() => onSelectUser(null)}
            className="text-xs font-bold text-exam-primary bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Showing filtered user</span>
            <span className="text-slate-400 font-normal hover:text-slate-700">✕ Clear</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
            <tr>
              <th className="py-3.5 px-4 sm:px-6">Candidate</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Total Sessions</th>
              <th className="py-3.5 px-4 text-center">Total Time Spent</th>
              <th className="py-3.5 px-4">Last Login</th>
              <th className="py-3.5 px-4">Latest Device & IP</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {users.map((u) => {
              const isSelected = selectedUserId === u.userId;

              return (
                <tr
                  key={u.userId}
                  className={`transition ${
                    isSelected
                      ? "bg-blue-50/60"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* Candidate Info */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{u.name}</span>
                          <Badge variant={u.role === "admin" ? "amber" : "slate"} size="xs">
                            {u.role.toUpperCase()}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">@{u.username}</span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    {u.isActiveNow ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active Now
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-400 bg-slate-100">
                        Offline
                      </span>
                    )}
                  </td>

                  {/* Total Sessions */}
                  <td className="py-3.5 px-4 text-center font-tabular font-bold text-slate-800">
                    {u.totalSessions}
                  </td>

                  {/* Total Time Spent */}
                  <td className="py-3.5 px-4 text-center font-tabular font-bold text-exam-primary">
                    {formatDuration(u.totalDurationSeconds)}
                  </td>

                  {/* Last Login */}
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                    {formatDate(u.lastLoginAt)}
                  </td>

                  {/* Latest Device & IP */}
                  <td className="py-3.5 px-4 text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      {getDeviceIcon(u.latestDevice)}
                      <span>{u.latestDevice}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                      <span>{u.latestIp || "Unknown IP"}</span>
                      {u.latestLocation && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[120px] text-slate-500">
                            {u.latestLocation}
                          </span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectUser(isSelected ? null : u.userId)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        isSelected
                          ? "bg-exam-primary text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>{isSelected ? "Selected" : "View Logs"}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
