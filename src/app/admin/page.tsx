"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Database,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Layers,
  Shield,
  ShieldAlert,
  Loader2,
  Users,
  Award,
  TrendingUp,
  UserPlus,
  KeyRound,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye,
  Check,
  X,
  Clock,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { BankStats, Attempt } from "@/types";

interface UserAdminData {
  id: string;
  username: string;
  name: string;
  role: "admin" | "student";
  createdAt: string;
  stats: {
    totalAttempts: number;
    averageScore: number;
    highestScore: number;
    averageAccuracy: number;
    qualifiedCount: number;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<"progress" | "users" | "bank">("progress");
  const [stats, setStats] = useState<BankStats | null>(null);
  const [users, setUsers] = useState<UserAdminData[]>([]);
  const [allAttempts, setAllAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Edit / Create Modal state
  const [editingUser, setEditingUser] = useState<UserAdminData | null>(null);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "student">("student");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [savingUser, setSavingUser] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const userRole = (session?.user as unknown as { role?: string })?.role || "student";

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setActionMessage(null);
      const [bankRes, usersRes] = await Promise.all([
        fetch("/api/bank-stats"),
        fetch("/api/admin/users"),
      ]);

      if (bankRes.ok) {
        const bData = await bankRes.json();
        setStats(bData);
      }

      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users || []);
        setAllAttempts(uData.attempts || []);
      }
    } catch (e) {
      console.error("Error fetching admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && userRole === "admin") {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [status, userRole]);

  // Open Edit User Modal
  const handleOpenEdit = (user: UserAdminData) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditUsername(user.username);
    setEditPassword(""); // Blank unless admin wants to change password
    setEditRole(user.role);
    setEditModalOpen(true);
  };

  // Open Create User Modal
  const handleOpenCreate = () => {
    setEditName("");
    setEditUsername("");
    setEditPassword("");
    setEditRole("student");
    setCreateModalOpen(true);
  };

  // Save Edit User
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setSavingUser(true);
      setActionMessage(null);

      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          name: editName,
          username: editUsername,
          password: editPassword.trim() || undefined,
          role: editRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      setActionMessage({ type: "success", text: `Updated candidate ${editName} (${editUsername}) successfully!` });
      setEditModalOpen(false);
      fetchAllData();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error updating user",
      });
    } finally {
      setSavingUser(false);
    }
  };

  // Save Create User
  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername || !editName || !editPassword) {
      setActionMessage({ type: "error", text: "Username, Name, and Password are required" });
      return;
    }

    try {
      setSavingUser(true);
      setActionMessage(null);

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          username: editUsername,
          password: editPassword,
          role: editRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create candidate account");
      }

      setActionMessage({
        type: "success",
        text: `Created new candidate account for ${editName} (${editUsername})!`,
      });
      setCreateModalOpen(false);
      fetchAllData();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error creating user",
      });
    } finally {
      setSavingUser(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete account: ${userName}? This cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      setActionMessage(null);

      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      setActionMessage({ type: "success", text: `Deleted user ${userName} successfully` });
      fetchAllData();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error deleting user",
      });
      setLoading(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && userRole === "admin" && loading && users.length === 0)) {
    return (
      <div className="min-h-screen bg-exam-bg flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-exam-border text-center max-w-sm w-full">
          <Loader2 className="w-10 h-10 text-exam-primary animate-spin mx-auto mb-3" />
          <h2 className="font-bold text-base text-slate-800">Verifying Admin Access</h2>
          <p className="text-xs text-slate-500 mt-1">Connecting to MongoDB Atlas...</p>
        </div>
      </div>
    );
  }

  // Access Denied for Students
  if (userRole !== "admin") {
    return (
      <div className="min-h-screen bg-exam-bg flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-rose-200 text-center max-w-md w-full">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-xl text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-6">
            You are signed in as <strong>{session?.user?.name || "Student"}</strong> ({userRole}). Administrator permissions are required to access candidate management and progress tracking.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-exam-primary text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-exam-primaryHover transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Student Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Summary Metrics Across All Candidates
  const totalMocksAttempted = allAttempts.filter((a) => a.score).length;
  const overallAvgScore =
    totalMocksAttempted > 0
      ? Number(
          (
            allAttempts.reduce((acc, curr) => acc + (curr.score?.netScore || 0), 0) /
            totalMocksAttempted
          ).toFixed(2)
        )
      : 0;

  const totalQualifiedAttempts = allAttempts.filter((a) => a.score?.qualifyingCleared).length;

  return (
    <main className="min-h-screen bg-exam-bg flex flex-col justify-between">
      {/* Top Admin Header */}
      <header className="bg-exam-primary text-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-exam-saffron rounded flex items-center justify-center font-black text-white text-sm">
              NBE
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg">Candidate Tracking & Admin Center</h1>
              <p className="text-xs text-white/80">
                Administrator: {session?.user?.name} · MongoDB Atlas Cloud
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={fetchAllData}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Toast / Action Feedback Banner */}
        {actionMessage && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-sm font-semibold animate-in fade-in duration-150 ${
              actionMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <span>{actionMessage.text}</span>
            <button
              type="button"
              onClick={() => setActionMessage(null)}
              className="p-1 hover:bg-black/5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Global Statistics Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-exam-border shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Registered Candidates
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">{users.length}</span>
              <span className="text-xs text-slate-500 font-medium">accounts</span>
            </div>
            <p className="text-[11px] text-exam-primary font-semibold mt-2 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Multi-candidate portal
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-exam-border shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Total Mocks Attempted
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">{totalMocksAttempted}</span>
              <span className="text-xs text-slate-500 font-medium">completed</span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mt-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 180-min CBT sessions
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-exam-border shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Platform Average Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-exam-primary">{overallAvgScore}</span>
              <span className="text-xs text-slate-400 font-bold">/ 200</span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mt-2">Target: 150 Qualifying</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-exam-border shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              150+ Target Cleared
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-emerald-700">{totalQualifiedAttempts}</span>
              <span className="text-xs text-slate-500 font-medium">times</span>
            </div>
            <p className="text-[11px] text-emerald-800 font-semibold mt-2 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> 75% Net Benchmark
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab("progress")}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
                activeTab === "progress"
                  ? "border-exam-primary text-exam-primary"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Candidate Progress Reports</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
                activeTab === "users"
                  ? "border-exam-primary text-exam-primary"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>User Credentials & Accounts</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("bank")}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
                activeTab === "bank"
                  ? "border-exam-primary text-exam-primary"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Question Bank (200Q Pool)</span>
            </button>
          </div>

          {activeTab === "users" && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mb-2 inline-flex items-center gap-1.5 bg-exam-primary hover:bg-exam-primaryHover text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add New Candidate</span>
            </button>
          )}
        </div>

        {/* TAB 1: CANDIDATE PROGRESS REPORTS */}
        {activeTab === "progress" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-exam-primary" /> Individual Candidate Performance Cards
              </h2>
              <p className="text-xs text-slate-500">
                Click any candidate to inspect their detailed mock attempts and scores.
              </p>
            </div>

            <div className="space-y-4">
              {users.map((user) => {
                const userAtts = allAttempts.filter((a) => a.userId === user.id && a.score);
                const isExpanded = expandedUserId === user.id;

                return (
                  <div
                    key={user.id}
                    className="bg-white rounded-2xl border border-exam-border shadow-sm overflow-hidden transition"
                  >
                    {/* Header Summary Row */}
                    <div
                      onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition select-none"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-11 h-11 rounded-full bg-exam-primary/10 border border-exam-primary/20 flex items-center justify-center text-exam-primary font-black text-base flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-base text-slate-900">{user.name}</h3>
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded font-bold">
                              @{user.username}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                user.role === "admin"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {user.role.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Member since: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Mini Stats Badges */}
                      <div className="flex items-center space-x-3 sm:space-x-6 text-center">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Tests</span>
                          <span className="text-base font-black text-slate-800">{user.stats.totalAttempts}</span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Score</span>
                          <span className="text-base font-black text-exam-primary">
                            {user.stats.averageScore}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Best Score</span>
                          <span className="text-base font-black text-emerald-700">
                            {user.stats.highestScore}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Accuracy</span>
                          <span className="text-base font-black text-slate-800">
                            {user.stats.averageAccuracy}%
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">150+ Cleared</span>
                          <span className="text-base font-black text-emerald-700">
                            {user.stats.qualifiedCount}
                          </span>
                        </div>

                        <div className="pl-2">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Attempt History */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50 p-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-exam-primary" /> Attempt History for {user.name}
                        </h4>

                        {userAtts.length === 0 ? (
                          <p className="text-xs text-slate-400 py-4 text-center">
                            This candidate has not completed any full mock tests yet.
                          </p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                              <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                                <tr>
                                  <th className="p-3">Test Title / Date</th>
                                  <th className="p-3 text-center">Net Score / 200</th>
                                  <th className="p-3 text-center">Reasoning</th>
                                  <th className="p-3 text-center">GA</th>
                                  <th className="p-3 text-center">Quant</th>
                                  <th className="p-3 text-center">English</th>
                                  <th className="p-3 text-center">Accuracy</th>
                                  <th className="p-3 text-center">Status</th>
                                  <th className="p-3 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {userAtts.map((att) => {
                                  const sc = att.score;
                                  if (!sc) return null;
                                  return (
                                    <tr key={att.id} className="hover:bg-slate-50 transition">
                                      <td className="p-3">
                                        <p className="font-bold text-slate-800">{att.mockTitle || "NBE Mock"}</p>
                                        <p className="text-[10px] text-slate-500 font-mono">
                                          {new Date(att.submittedAt || att.startedAt).toLocaleString()}
                                        </p>
                                      </td>
                                      <td className="p-3 text-center">
                                        <span className="font-black text-sm text-slate-900">
                                          {sc.netScore}
                                        </span>
                                        <span className="text-[10px] text-slate-400 block font-normal">
                                          +{sc.correctCount} / -{sc.negativePenalty}
                                        </span>
                                      </td>
                                      <td className="p-3 text-center font-bold text-slate-700">
                                        {sc.bySection.REASONING?.netScore || 0}
                                      </td>
                                      <td className="p-3 text-center font-bold text-slate-700">
                                        {sc.bySection.GA?.netScore || 0}
                                      </td>
                                      <td className="p-3 text-center font-bold text-slate-700">
                                        {sc.bySection.QUANT?.netScore || 0}
                                      </td>
                                      <td className="p-3 text-center font-bold text-slate-700">
                                        {sc.bySection.ENGLISH?.netScore || 0}
                                      </td>
                                      <td className="p-3 text-center font-bold text-slate-800">
                                        {sc.accuracyPercentage}%
                                      </td>
                                      <td className="p-3 text-center">
                                        <span
                                          className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                            sc.qualifyingCleared
                                              ? "bg-emerald-100 text-emerald-800"
                                              : "bg-rose-100 text-rose-800"
                                          }`}
                                        >
                                          {sc.qualifyingCleared ? "QUALIFIED" : "BELOW TARGET"}
                                        </span>
                                      </td>
                                      <td className="p-3 text-right">
                                        <Link
                                          href={`/results/${att.id}`}
                                          className="inline-flex items-center gap-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-2.5 py-1 rounded transition"
                                        >
                                          <Eye className="w-3 h-3" /> Scorecard
                                        </Link>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CANDIDATE USER ACCOUNTS & CREDENTIALS MANAGEMENT */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-exam-border shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-exam-primary" /> Candidate Accounts & Credentials Editor
                </h3>
                <p className="text-xs text-slate-500">
                  Update usernames, candidate display names, and reset passwords for your friends.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="p-3.5">Candidate Name</th>
                    <th className="p-3.5">Username (Login ID)</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5 text-center">Tests Taken</th>
                    <th className="p-3.5 text-center">Average Score</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-bold text-slate-900 text-sm">{u.name}</td>
                      <td className="p-3.5 font-mono text-slate-700 font-semibold">@{u.username}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            u.role === "admin"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-800">
                        {u.stats.totalAttempts}
                      </td>
                      <td className="p-3.5 text-center font-bold text-exam-primary">
                        {u.stats.averageScore} / 200
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit Credentials
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: QUESTION BANK & METRICS */}
        {activeTab === "bank" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Database className="w-5 h-5 text-exam-primary" /> Question Repository Pool (MongoDB Atlas)
              </h2>
              <p className="text-xs text-slate-500">
                200 Questions synchronized in database ready for dynamic mock creation.
              </p>
            </div>

            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-exam-border shadow-sm">
                  <span className="text-xs font-bold text-exam-primary uppercase tracking-wider block mb-1">
                    Reasoning
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">{stats.bySection.REASONING}</span>
                    <span className="text-xs text-slate-500 font-medium">/ 50 req</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Mock
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-exam-border shadow-sm">
                  <span className="text-xs font-bold text-exam-primary uppercase tracking-wider block mb-1">
                    General Awareness
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">{stats.bySection.GA}</span>
                    <span className="text-xs text-slate-500 font-medium">/ 50 req</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Mock
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-exam-border shadow-sm">
                  <span className="text-xs font-bold text-exam-primary uppercase tracking-wider block mb-1">
                    Quantitative Aptitude
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">{stats.bySection.QUANT}</span>
                    <span className="text-xs text-slate-500 font-medium">/ 50 req</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Mock
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-exam-border shadow-sm">
                  <span className="text-xs font-bold text-exam-primary uppercase tracking-wider block mb-1">
                    English Comprehension
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">{stats.bySection.ENGLISH}</span>
                    <span className="text-xs text-slate-500 font-medium">/ 50 req</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Mock
                  </p>
                </div>
              </div>
            )}

            {stats && (
              <div className="bg-white p-6 rounded-xl border border-exam-border shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-exam-primary" /> Contributing Sources in Question Pool
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stats.sources.map((src) => (
                    <div
                      key={src.sourceExam}
                      className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <span className="font-semibold text-xs text-slate-700">{src.sourceExam}</span>
                      <span className="font-bold text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-900">
                        {src.count} Qs
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* EDIT USER MODAL */}
      {editModalOpen && editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-exam-primary" /> Edit Candidate Credentials
              </h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Candidate Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-exam-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username (Login Identifier)
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="e.g. rahul"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-exam-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Password (leave empty to keep current password)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-exam-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as "admin" | "student")}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-exam-primary"
                >
                  <option value="student">Student (Candidate Practice Only)</option>
                  <option value="admin">Administrator (Full Access & PDF Ingestion)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-5 py-2 rounded-xl bg-exam-primary hover:bg-exam-primaryHover text-white text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingUser && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW CANDIDATE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-exam-primary" /> Add New Candidate Friend
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Candidate Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Aman Gupta"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-exam-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username (Login Identifier)
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="e.g. aman"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-exam-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="e.g. nbe2026"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-exam-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as "admin" | "student")}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-exam-primary"
                >
                  <option value="student">Student (Candidate Practice Only)</option>
                  <option value="admin">Administrator (Full Access & PDF Ingestion)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-5 py-2 rounded-xl bg-exam-primary hover:bg-exam-primaryHover text-white text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingUser && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-exam-border py-4 text-center text-xs text-exam-muted">
        NBE Arena — Administrator Center & Candidate Analytics
      </footer>
    </main>
  );
}
