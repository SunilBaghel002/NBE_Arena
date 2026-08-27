"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { BrandLogo } from "./BrandLogo";
import {
  LayoutDashboard,
  Database,
  History,
  LogOut,
  User,
  Shield,
  Layers,
  Sparkles,
  BookOpen,
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
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/",
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
    <header className="bg-slate-950/90 backdrop-blur-md text-white border-b border-slate-800/80 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <BrandLogo size="md" />

        {/* Center: Navigation Links (Desktop) */}
        {status === "authenticated" && (
          <nav className="hidden md:flex items-center space-x-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition duration-150 ${
                    link.active
                      ? "bg-exam-primary text-white shadow-md shadow-blue-900/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
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
        <div className="flex items-center space-x-3">
          {status === "authenticated" ? (
            <div className="flex items-center space-x-3">
              {/* Profile Pill */}
              <div className="flex items-center gap-2.5 bg-slate-900/80 border border-slate-800 pl-1.5 pr-3 py-1 rounded-full shadow-sm">
                {/* Initials Avatar Circle */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-[11px] font-black shadow-inner">
                  {getInitials(userName)}
                </div>

                <div className="text-left leading-none">
                  <span className="text-xs font-bold text-slate-200 block truncate max-w-[100px] sm:max-w-[140px]">
                    {userName}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider ${
                      userRole === "admin" ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    {userRole}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-600/90 text-slate-400 hover:text-white border border-slate-800 hover:border-rose-500 transition duration-150 shadow-sm"
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
    </header>
  );
};
