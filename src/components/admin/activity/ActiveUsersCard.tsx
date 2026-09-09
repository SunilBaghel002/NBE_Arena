"use client";

import React from "react";
import { Laptop, Smartphone, Tablet, Globe, Compass, Radio } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface ActiveUser {
  userId: string;
  username: string;
  name: string;
  role: "admin" | "student";
  device: "Desktop" | "Mobile" | "Tablet" | "Unknown";
  ipAddress?: string | null;
  approxLocation?: string | null;
  lastActivityAt: string;
  currentPage?: string;
}

interface ActiveUsersCardProps {
  activeUsers: ActiveUser[];
}

export const ActiveUsersCard: React.FC<ActiveUsersCardProps> = ({ activeUsers }) => {
  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "Mobile":
        return <Smartphone className="w-3.5 h-3.5 text-blue-500" />;
      case "Tablet":
        return <Tablet className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Laptop className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Telemetry Feed
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Active Candidates Right Now
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time candidate sessions verified by 60s client heartbeats within the last 5 minutes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2 rounded-2xl flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Online Count</span>
            <span className="text-2xl font-black text-emerald-400 font-tabular">
              {activeUsers.length}
            </span>
          </div>
        </div>
      </div>

      {/* Active User List / Grid */}
      <div className="relative z-10 mt-5">
        {activeUsers.length === 0 ? (
          <div className="py-8 text-center bg-slate-800/30 rounded-2xl border border-dashed border-slate-800">
            <p className="text-sm font-semibold text-slate-400">
              No candidates are actively taking tests or browsing the portal right now.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Sessions will appear dynamically as candidates log in and send heartbeats.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activeUsers.map((user) => (
              <div
                key={user.userId}
                className="bg-slate-800/60 hover:bg-slate-800/90 transition border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xs font-black text-white shadow-inner">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 font-mono truncate">@{user.username}</p>
                    </div>
                  </div>
                  <Badge variant={user.role === "admin" ? "amber" : "emerald"} size="xs">
                    {user.role.toUpperCase()}
                  </Badge>
                </div>

                <div className="pt-2 border-t border-slate-700/50 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      {getDeviceIcon(user.device)} {user.device}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono font-bold">
                      Online
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1 truncate max-w-[150px]">
                      <Compass className="w-3 h-3 text-slate-500" />
                      <span className="truncate">{user.currentPage || "/dashboard"}</span>
                    </span>
                    {user.approxLocation && (
                      <span className="text-slate-400 flex items-center gap-1 font-mono">
                        <Globe className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[90px]">{user.approxLocation}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
