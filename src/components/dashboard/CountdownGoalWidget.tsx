"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Target,
  Settings,
  Check,
  X,
  Sparkles,
  CalendarRange,
  ChevronRight,
} from "lucide-react";
import { computeCountdownGoal } from "@/lib/analytics-helpers";
import { CountdownGoalSettings } from "@/types/analytics";
import { Calendar } from "@/components/ui/Calendar";
import { DatePicker } from "@/components/ui/DatePicker";
import { useToast } from "@/components/ui/Toast";

interface CountdownGoalWidgetProps {
  averageScore: number;
  attemptDates?: string[];
}

const STORAGE_KEY_DATE = "nbe_target_exam_date";
const STORAGE_KEY_SCORE = "nbe_target_score";

export const CountdownGoalWidget: React.FC<CountdownGoalWidgetProps> = ({
  averageScore,
  attemptDates = [],
}) => {
  const { showToast } = useToast();
  const [targetDate, setTargetDate] = useState<string>("");
  const [targetScore, setTargetScore] = useState<number>(150);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);
  const [tempDate, setTempDate] = useState<string>("");
  const [tempScore, setTempScore] = useState<number>(150);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedDate = localStorage.getItem(STORAGE_KEY_DATE);
      const savedScore = localStorage.getItem(STORAGE_KEY_SCORE);

      if (savedDate) {
        setTargetDate(savedDate);
        setTempDate(savedDate);
      } else {
        // Default target: 45 days ahead
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 45);
        const y = defaultDate.getFullYear();
        const m = String(defaultDate.getMonth() + 1).padStart(2, "0");
        const d = String(defaultDate.getDate()).padStart(2, "0");
        const iso = `${y}-${m}-${d}`;
        setTargetDate(iso);
        setTempDate(iso);
      }

      if (savedScore) {
        const num = parseInt(savedScore, 10);
        if (!isNaN(num)) {
          setTargetScore(num);
          setTempScore(num);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY_DATE, tempDate);
      localStorage.setItem(STORAGE_KEY_SCORE, tempScore.toString());
      setTargetDate(tempDate);
      setTargetScore(tempScore);
      setIsEditing(false);
      showToast(
        "success",
        "Target Settings Saved",
        `Target exam date set to ${tempDate} (${tempScore} net marks benchmark).`
      );
    } catch (e) {
      console.error("Failed to save target settings:", e);
      showToast("error", "Failed to Save", "Could not persist target settings.");
    }
  };

  const goalData: CountdownGoalSettings = computeCountdownGoal(
    targetDate,
    targetScore,
    averageScore
  );

  const isQualified = averageScore >= targetScore;

  return (
    <>
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-card border border-slate-800 relative overflow-hidden flex flex-col justify-between group">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/15 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

        {/* Header Strip */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3.5 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-xs">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block leading-tight">
                Exam Countdown
              </span>
              <span className="text-xs font-bold text-slate-200">
                NBEMS Junior Assistant 2026
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsCalendarModalOpen(true)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              title="Open Full Study Calendar"
            >
              <CalendarRange className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              title="Configure Target Date & Goal"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editing State with Custom DatePicker */}
        {isEditing ? (
          <div className="space-y-3.5 relative z-10 py-1">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-300 block mb-1">
                Target Exam Date (Custom Calendar)
              </label>
              <DatePicker
                value={tempDate}
                onChange={(newDate) => setTempDate(newDate)}
                examTargetDate={tempDate}
                activityDates={attemptDates}
                showPresets={true}
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-300 block mb-1">
                Target Net Score (Official Benchmark: 150)
              </label>
              <input
                type="number"
                min={50}
                max={200}
                value={tempScore}
                onChange={(e) => setTempScore(parseInt(e.target.value, 10) || 150)}
                className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-blue-500 font-mono font-bold"
              />
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <Check className="w-3.5 h-3.5" /> Save Target
              </button>
            </div>
          </div>
        ) : (
          /* Display State */
          <div className="space-y-3.5 relative z-10">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-black font-mono tracking-tight text-white flex items-baseline gap-1.5">
                  <span>{goalData.daysRemaining}</span>
                  <span className="text-xs text-slate-400 font-sans font-semibold">
                    Days Remaining
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium flex items-center gap-1.5">
                  <span>Target Date:</span>
                  <strong className="text-slate-200 font-mono">{goalData.targetExamDate}</strong>
                </p>
              </div>

              <div className="text-right">
                <div className="text-sm font-black font-mono text-emerald-400">
                  {averageScore} / {targetScore}
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Target Benchmark
                </span>
              </div>
            </div>

            {/* Goal Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                <span className="uppercase tracking-wider">Benchmark Gap</span>
                <span className={isQualified ? "text-emerald-400" : "text-blue-300"}>
                  {goalData.progressPercentage}% of Target
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isQualified
                      ? "bg-emerald-500"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500"
                  }`}
                  style={{ width: `${goalData.progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Interactive Quick Calendar Peek Trigger */}
            <button
              type="button"
              onClick={() => setIsCalendarModalOpen(true)}
              className="w-full mt-1 py-1.5 px-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center justify-between transition group/btn"
            >
              <div className="flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-blue-400" />
                <span>View Study & Exam Schedule</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover/btn:translate-x-0.5 transition" />
            </button>
          </div>
        )}
      </div>

      {/* Full Custom Study Calendar Modal */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">NBEMS Study & Exam Calendar</h3>
                  <p className="text-[11px] text-slate-400">
                    Target Exam: <strong className="text-amber-400 font-mono">{targetDate}</strong> ({goalData.daysRemaining} days left)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCalendarModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Calendar Component */}
            <div className="p-5">
              <Calendar
                selectedDate={targetDate}
                onSelectDate={(newDate) => {
                  setTempDate(newDate);
                  setTargetDate(newDate);
                  localStorage.setItem(STORAGE_KEY_DATE, newDate);
                  showToast("success", "Target Date Updated", `Exam scheduled for ${newDate}.`);
                }}
                examTargetDate={targetDate}
                activityDates={attemptDates}
                showPresets={true}
                className="border-none shadow-none p-0"
              />

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-medium">
                  {attemptDates.length} mock attempt(s) recorded on calendar
                </div>
                <button
                  type="button"
                  onClick={() => setIsCalendarModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
