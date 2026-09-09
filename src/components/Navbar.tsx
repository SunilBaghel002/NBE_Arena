"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { BrandLogo } from "./BrandLogo";
import {
  LayoutDashboard,
  Database,
  LogOut,
  Sparkles,
  Shield,
  Layers,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const userRole = (session?.user as unknown as { role?: string })?.role || "student";
  const userName = session?.user?.name || session?.user?.email || "Candidate";

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const navLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    ...(userRole === "admin"
      ? [
          {
            label: "Admin Panel",
            href: "/admin",
            icon: Database,
            active: pathname === "/admin",
          },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 lg:px-10 pt-3 transition-all duration-300">
      <div className="max-w-[1700px] mx-auto rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-sm py-2.5 px-4 sm:px-6 transition-all duration-200">
        <div className="flex items-center justify-between">
          {/* Left: Brand Logo + Live Indicator */}
          <div className="flex items-center gap-3.5">
            <BrandLogo size="md" href="/dashboard" showSubtitle={false} theme="light" />

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/90 border border-slate-200 text-slate-700 text-[10px] font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>CBT Simulation Active</span>
            </div>
          </div>

          {/* Center: Navigation Links (Desktop) */}
          {status === "authenticated" && (
            <nav className="hidden md:flex items-center gap-1.5 bg-slate-50/80 p-1 rounded-xl border border-slate-200/80">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-150 ${
                      link.active
                        ? "bg-exam-primary text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right: Candidate Profile & Controls */}
          <div className="flex items-center gap-2.5">
            {status === "authenticated" ? (
              <div className="flex items-center gap-2.5">
                {/* Candidate Profile Pill */}
                <div className="flex items-center gap-2 bg-slate-50/90 border border-slate-200/90 pl-1.5 pr-3 py-1 rounded-full shadow-xs">
                  {/* Initials Avatar */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[11px] font-black shadow-inner">
                    {getInitials(userName)}
                  </div>

                  <div className="text-left leading-none">
                    <span className="text-xs font-bold text-slate-900 block truncate max-w-[100px] sm:max-w-[140px]">
                      {userName}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-wider block mt-0.5 ${
                        userRole === "admin" ? "text-amber-600" : "text-emerald-600"
                      }`}
                    >
                      {userRole}
                    </span>
                  </div>
                </div>

                {/* Logout Action Button */}
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition duration-150 shadow-xs"
                  title="Sign Out of Candidate Portal"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-bold bg-exam-primary hover:bg-exam-primaryHover text-white px-4 py-2 rounded-xl shadow transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
