"use client";

import React, { useState, useRef, useEffect } from "react";
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
  ChevronDown,
  User,
  Calendar,
  PhoneCall,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userRole = (session?.user as unknown as { role?: string })?.role || "student";
  const userName = session?.user?.name || session?.user?.email || "Candidate";
  const userEmail = session?.user?.email || "";

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

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
      <div className="max-w-[1700px] mx-auto rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-card py-2.5 px-4 sm:px-6 transition-all duration-200">
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

          {/* Right: Candidate Profile Dropdown & Mobile Toggle */}
          <div className="flex items-center gap-2.5">
            {status === "authenticated" ? (
              <div className="relative" ref={dropdownRef}>
                {/* Candidate Dropdown Trigger Button */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border transition-all duration-150 focus-ring ${
                    dropdownOpen
                      ? "bg-slate-100 border-slate-300 ring-2 ring-blue-500/20 shadow-sm"
                      : "bg-slate-50/90 hover:bg-slate-100 border-slate-200/90 shadow-xs"
                  }`}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {/* Initials Avatar with Active Pulse */}
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[11px] font-black shadow-inner">
                      {getInitials(userName)}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  {/* Name and Role */}
                  <div className="text-left leading-none hidden sm:block">
                    <span className="text-xs font-bold text-slate-900 block truncate max-w-[120px]">
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

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {/* Candidate Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200/90 shadow-dropdown p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* User Profile Header */}
                    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 mb-1.5">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
                          {getInitials(userName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                          <p className="text-[10px] text-slate-400 truncate">{userEmail || "Student Portal Account"}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 text-[10px]">
                        <Badge
                          variant={userRole === "admin" ? "amber" : "emerald"}
                          size="xs"
                          dot
                        >
                          {userRole.toUpperCase()}
                        </Badge>
                        <span className="text-slate-500 font-semibold">CBT Mode</span>
                      </div>
                    </div>

                    {/* Navigation Items in Dropdown */}
                    <div className="space-y-0.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-600" />
                        <span>Candidate Dashboard</span>
                      </Link>

                      {userRole === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition"
                        >
                          <Database className="w-4 h-4 text-amber-600" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}

                      <Link
                        href="/book-demo"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition"
                      >
                        <PhoneCall className="w-4 h-4 text-emerald-600" />
                        <span>Schedule Academy Walkthrough</span>
                      </Link>
                    </div>

                    {/* Sign Out Action */}
                    <div className="pt-1.5 mt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut({ callbackUrl: "/login" });
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of Portal</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-bold bg-exam-primary hover:bg-exam-primaryHover text-white px-4 py-2 rounded-xl shadow transition"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Toggle (for screens < 768px) */}
            {status === "authenticated" && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 border-t border-slate-100 mt-2.5 space-y-1 animate-in slide-in-from-top-2 duration-150">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    link.active
                      ? "bg-exam-primary text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
