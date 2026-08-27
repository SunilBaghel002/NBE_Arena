"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
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
  FileUp,
  Cpu,
  Sparkles,
  Zap,
  Play,
  FileText,
  AlertTriangle,
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

interface PyqFile {
  category: string;
  fileName: string;
  relativePath: string;
  sizeMb: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<"progress" | "users" | "bank" | "ingest">("progress");
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

  // AI Ingestion State
  const [pyqFiles, setPyqFiles] = useState<PyqFile[]>([]);
  const [selectedPyq, setSelectedPyq] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(3);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionSummary, setExtractionSummary] = useState<any | null>(null);
  const [providerConfig, setProviderConfig] = useState<{
    defaultVisionProvider: string;
    defaultTextProvider: string;
    openrouterModel: string;
    groqModel: string;
    geminiModel: string;
  } | null>(null);

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
      const [bankRes, usersRes, pyqRes] = await Promise.all([
        fetch("/api/bank-stats"),
        fetch("/api/admin/users"),
        fetch("/api/pyq-list"),
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

      if (pyqRes.ok) {
        const pData = await pyqRes.json();
        setPyqFiles(pData.files || []);
        if (pData.files?.length > 0 && !selectedPyq) {
          setSelectedPyq(pData.files[0].relativePath);
        }
        setProviderConfig({
          defaultVisionProvider: pData.defaultVisionProvider,
          defaultTextProvider: pData.defaultTextProvider,
          openrouterModel: pData.openrouterModel,
          groqModel: pData.groqModel,
          geminiModel: pData.geminiModel,
        });
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
          name: editName.trim(),
          username: editUsername.trim().toLowerCase(),
          password: editPassword || undefined,
          role: editRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update candidate");
      }

      setActionMessage({ type: "success", text: `Successfully updated ${editName}` });
      setEditModalOpen(false);
      fetchAllData();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error updating candidate",
      });
    } finally {
      setSavingUser(false);
    }
  };

  // Save Create User
  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername || !editPassword || !editName) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setSavingUser(true);
      setActionMessage(null);

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          username: editUsername.trim().toLowerCase(),
          password: editPassword,
          role: editRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create candidate");
      }

      setActionMessage({ type: "success", text: `Successfully created candidate ${editName}` });
      setCreateModalOpen(false);
      fetchAllData();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error creating candidate",
      });
    } finally {
      setSavingUser(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete candidate "${username}"?`)) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete candidate");
      }

      setActionMessage({ type: "success", text: `Deleted candidate ${username}` });
      fetchAllData();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error deleting candidate",
      });
      setLoading(false);
    }
  };

  // Execute PDF Extraction
  const handleRunExtraction = async () => {
    if (!selectedPyq && !uploadedFile) {
      alert("Please select a PYQ PDF or upload one first");
      return;
    }

    try {
      setIsExtracting(true);
      setExtractionSummary(null);
      setActionMessage(null);

      let targetPath = selectedPyq;

      // If user uploaded a new file, upload it first
      if (uploadedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", uploadedFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const uErr = await uploadRes.json();
          throw new Error(uErr.error || "Failed to upload PDF");
        }

        const uData = await uploadRes.json();
        targetPath = uData.filePath;
        setUploading(false);
      }

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: targetPath,
          startPage: Number(startPage) || 1,
          endPage: Number(endPage) || 3,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Extraction failed");
      }

      setExtractionSummary(data);
      setActionMessage({
        type: "success",
        text: `Extraction Complete! Extracted ${data.totalExtracted} questions (${data.totalInserted} new saved, ${data.totalDuplicates} duplicates skipped).`,
      });

      // Refresh question bank stats
      const bankRes = await fetch("/api/bank-stats");
      if (bankRes.ok) {
        setStats(await bankRes.json());
      }
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "PDF extraction failed",
      });
    } finally {
      setIsExtracting(false);
      setUploading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-exam-bg flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-exam-border text-center max-w-sm w-full">
          <Loader2 className="w-10 h-10 text-exam-primary animate-spin mx-auto mb-3" />
          <h2 className="font-bold text-base text-slate-800">Loading Admin Dashboard</h2>
          <p className="text-xs text-slate-500 mt-1">Connecting to MongoDB Atlas...</p>
        </div>
      </div>
    );
  }

  if (userRole !== "admin") {
    return (
      <div className="min-h-screen bg-exam-bg flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-exam-border text-center max-w-md w-full">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="font-bold text-xl text-slate-800 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-6">
            You do not have administrative privileges to view this portal.
          </p>
          <Link
            href="/"
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
      {/* Universal Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 space-y-6">
        {/* Action Message Banner */}
        {actionMessage && (
          <div
            className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-2.5 animate-in fade-in duration-150 ${
              actionMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-exam-border pb-4">
          <div className="flex space-x-2 bg-slate-200/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("progress")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                activeTab === "progress"
                  ? "bg-white text-exam-primary shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-exam-primary" /> Candidate Progress
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                activeTab === "users"
                  ? "bg-white text-exam-primary shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-4 h-4 text-exam-primary" /> Credentials Editor
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ingest")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                activeTab === "ingest"
                  ? "bg-white text-exam-primary shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Cpu className="w-4 h-4 text-emerald-600" /> AI PDF Ingestion
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("bank")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                activeTab === "bank"
                  ? "bg-white text-exam-primary shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Database className="w-4 h-4 text-exam-primary" /> Question Bank
            </button>
          </div>

          <button
            type="button"
            onClick={fetchAllData}
            className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 font-bold px-3 py-2 rounded-xl transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: AI PDF INGESTION PIPELINE */}
        {/* ========================================================================= */}
        {activeTab === "ingest" && (
          <div className="space-y-6">
            {/* Header / Active Provider Badges */}
            <div className="bg-white rounded-2xl shadow-sm border border-exam-border p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Cpu className="w-6 h-6 text-emerald-600" /> Hybrid AI PDF Extraction Engine
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Extracts MCQs from past year papers into MongoDB Atlas with SHA-256 deduplication.
                  </p>
                </div>

                {/* Provider Status Badges */}
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Text Engine (Path A)</span>
                    <span className="font-bold text-emerald-900">
                      Groq ({providerConfig?.groqModel || "llama-3.3-70b"})
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-[10px] uppercase font-bold text-blue-800 block">Vision Engine (Path B)</span>
                    <span className="font-bold text-blue-900">
                      OpenRouter ({providerConfig?.openrouterModel?.split("/")[1] || "qwen-2.5-vl"})
                    </span>
                  </div>
                </div>
              </div>

              {/* Ingestion Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                {/* Select PYQ File */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold uppercase text-slate-700">
                    Select Past Year Question PDF
                  </label>
                  <select
                    value={selectedPyq}
                    onChange={(e) => {
                      setSelectedPyq(e.target.value);
                      setUploadedFile(null);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-medium focus:ring-2 focus:ring-exam-primary"
                  >
                    {pyqFiles.map((f) => (
                      <option key={f.relativePath} value={f.relativePath}>
                        [{f.category}] {f.fileName} ({f.sizeMb})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Page Range */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase text-slate-700">
                    Page Range (e.g. 1 to 3)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={startPage}
                      onChange={(e) => setStartPage(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-center"
                      placeholder="Start"
                    />
                    <span className="text-slate-400 font-bold">to</span>
                    <input
                      type="number"
                      min={1}
                      value={endPage}
                      onChange={(e) => setEndPage(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-center"
                      placeholder="End"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  ⚡ Auto-selects Groq for digital text pages and OpenRouter Qwen2.5-VL for scanned pages.
                </div>

                <button
                  type="button"
                  onClick={handleRunExtraction}
                  disabled={isExtracting || uploading}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition transform active:scale-98 flex items-center gap-2 disabled:opacity-50"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Extracting & Ingesting Questions...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Start Hybrid Ingestion (Pages {startPage}–{endPage})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Extraction Results Feed */}
            {extractionSummary && (
              <div className="bg-white rounded-2xl shadow-sm border border-exam-border p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Ingestion Report: {extractionSummary.pdfName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Processed {extractionSummary.processedPages} pages of {extractionSummary.totalPages} total pages.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-tabular">
                      +{extractionSummary.totalInserted} New Saved
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold font-tabular">
                      {extractionSummary.totalDuplicates} Duplicates Skipped
                    </div>
                  </div>
                </div>

                {/* Per-Page Telemetry List */}
                <div className="space-y-3">
                  {extractionSummary.pageResults?.map((res: any) => (
                    <div
                      key={res.pageNumber}
                      className={`p-4 rounded-xl border transition ${
                        res.success
                          ? "bg-slate-50 border-slate-200"
                          : "bg-rose-50 border-rose-200 text-rose-900"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-exam-primary text-white font-black text-xs flex items-center justify-center">
                            P.{res.pageNumber}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                  res.mode === "text"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {res.mode === "text" ? "Path A (Text/Groq)" : "Path B (Vision/VLM)"}
                              </span>
                              <span className="text-xs font-mono font-bold text-slate-700">
                                {res.telemetry?.model}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Latency: {res.telemetry?.durationMs}ms · Found: {res.questions?.length || 0} MCQs
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-emerald-700">
                            +{res.telemetry?.newInserted || 0} New
                          </span>
                          <span className="text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500">
                            {res.telemetry?.duplicates || 0} Dupes
                          </span>
                        </div>
                      </div>

                      {/* Question Preview Accordion */}
                      {res.questions?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/70 space-y-2">
                          {res.questions.map((q: any, qIdx: number) => (
                            <div
                              key={qIdx}
                              className="text-xs p-2.5 rounded-lg bg-white border border-slate-200"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-exam-primary uppercase">
                                  [{q.section}]
                                </span>
                                {q.correctOption && (
                                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                                    Key: ({q.correctOption.toUpperCase()})
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-800 font-medium line-clamp-2">
                                {q.questionText}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CANDIDATE PROGRESS DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === "progress" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Candidate Progress Reports</h2>
                <p className="text-xs text-slate-500">
                  Track individual mock attempts, average net scores, and qualification benchmark status.
                </p>
              </div>
            </div>

            {/* Candidate Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {users.map((u) => {
                const isExpanded = expandedUserId === u.id;
                const userAttempts = allAttempts.filter((a) => a.userId === u.id);

                return (
                  <div
                    key={u.id}
                    className="bg-white rounded-2xl shadow-sm border border-exam-border p-5 flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-exam-primary/10 text-exam-primary font-bold flex items-center justify-center text-xs uppercase">
                            {u.name.slice(0, 2)}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-900">{u.name}</h3>
                            <p className="text-[11px] text-slate-500 font-mono">@{u.username}</p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 font-tabular text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Tests Taken</span>
                          <span className="text-base font-black text-slate-800">{u.stats.totalAttempts}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg Score</span>
                          <span className="text-base font-black text-exam-primary">
                            {u.stats.averageScore} / 200
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Best Score</span>
                          <span className="text-base font-black text-emerald-700">
                            {u.stats.highestScore} / 200
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Qualified (150+)</span>
                          <span className="text-base font-black text-slate-800">
                            {u.stats.qualifiedCount} times
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* View Attempt Details Toggle */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                        className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between transition"
                      >
                        <span>View Test History ({userAttempts.length})</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {/* Expanded Attempt History */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 max-h-56 overflow-y-auto pr-1">
                          {userAttempts.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-2">No tests completed yet.</p>
                          ) : (
                            userAttempts.map((att, idx) => (
                              <div
                                key={att.id}
                                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                              >
                                <div>
                                  <span className="font-bold text-slate-800 block">Mock #{idx + 1}</span>
                                  <span className="text-[10px] text-slate-500">
                                    {new Date(att.submittedAt || att.startedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span
                                    className={`font-black font-tabular block ${
                                      att.score && att.score.netScore >= 150
                                        ? "text-emerald-700"
                                        : "text-slate-800"
                                    }`}
                                  >
                                    {att.score?.netScore || 0} / 200
                                  </span>
                                  <Link
                                    href={`/results/${att.id}`}
                                    className="text-[10px] text-exam-primary hover:underline font-semibold"
                                  >
                                    Scorecard →
                                  </Link>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: USER CREDENTIALS EDITOR */}
        {/* ========================================================================= */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Candidate Credentials Management</h2>
                <p className="text-xs text-slate-500">
                  Update usernames, full names, reset passwords, or create new candidate profiles for your friends.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="flex items-center gap-1.5 bg-exam-primary hover:bg-exam-primaryHover text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition"
              >
                <UserPlus className="w-4 h-4" /> Add Candidate
              </button>
            </div>

            {/* Candidate List Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-exam-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="p-4">Candidate</th>
                      <th className="p-4">Username (Login ID)</th>
                      <th className="p-4">Role</th>
                      <th className="p-4 text-center">Tests Taken</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-exam-primary/10 text-exam-primary font-bold flex items-center justify-center text-xs uppercase">
                              {u.name.slice(0, 2)}
                            </div>
                            <span className="font-bold text-slate-900">{u.name}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-exam-primary">{u.username}</td>
                        <td className="p-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold font-tabular">{u.stats.totalAttempts}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit / Reset Password
                          </button>

                          {u.username !== "admin" && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2.5 py-1.5 rounded-lg text-xs transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: QUESTION BANK REPOSITORY */}
        {/* ========================================================================= */}
        {activeTab === "bank" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-exam-border p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Question Bank Repository</h2>
              <p className="text-xs text-slate-500 mb-6">
                Active questions in MongoDB Atlas. Each generated mock randomly pulls 50 per section.
              </p>

              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold uppercase text-slate-500 block">Reasoning</span>
                    <span className="text-3xl font-black text-slate-900">{stats.bySection.REASONING}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Need 50 / Mock</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold uppercase text-slate-500 block">General Awareness</span>
                    <span className="text-3xl font-black text-slate-900">{stats.bySection.GA}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Need 50 / Mock</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold uppercase text-slate-500 block">Quant Aptitude</span>
                    <span className="text-3xl font-black text-slate-900">{stats.bySection.QUANT}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Need 50 / Mock</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold uppercase text-slate-500 block">English</span>
                    <span className="text-3xl font-black text-slate-900">{stats.bySection.ENGLISH}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Need 50 / Mock</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Edit User Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900">Edit Candidate Credentials</h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-exam-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Username (Login ID)</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-exam-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Reset Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-exam-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as "admin" | "student")}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="student">Student (Candidate)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="flex-1 py-2.5 rounded-xl bg-exam-primary hover:bg-exam-primaryHover text-white font-bold text-xs shadow-md"
                >
                  {savingUser ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900">Add New Candidate</h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-exam-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Username (Login ID)</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="e.g. rahul"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-exam-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-exam-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as "admin" | "student")}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="student">Student (Candidate)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="flex-1 py-2.5 rounded-xl bg-exam-primary hover:bg-exam-primaryHover text-white font-bold text-xs shadow-md"
                >
                  {savingUser ? "Creating..." : "Create Candidate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-exam-border py-4 text-center text-xs text-slate-400">
        NBE Arena — Admin Control Panel
      </footer>
    </div>
  );
}
