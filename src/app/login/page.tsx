"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { ShieldCheck, Lock, User, AlertCircle, Loader2, KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both username and password");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await signIn("credentials", {
        username: username.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!res || res.error) {
        setError(res?.error || "Invalid username or password");
        setLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred during login");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* CBT Portal Header */}
      <header className="max-w-7xl mx-auto w-full py-4 flex items-center justify-between z-10">
        <BrandLogo size="md" />
      </header>

      {/* Main Login Form Box */}
      <div className="max-w-md mx-auto w-full my-auto z-10">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-6 text-white text-center border-b border-slate-800">
            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl mx-auto flex items-center justify-center mb-3 border border-blue-500/30 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-100">Candidate Sign In</h2>
            <p className="text-xs text-slate-400 mt-1">
              Access your personalized CBT mock tests & analytics
            </p>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your candidate username"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-blue-900/30 transition transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In to CBT Portal</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full py-4 text-center text-xs text-slate-500 z-10">
        NBE Arena — National Board of Examinations in Medical Sciences CBT Simulation Platform
      </footer>
    </main>
  );
}
