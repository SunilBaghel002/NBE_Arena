"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Target, Settings, Check, X } from "lucide-react";
import { computeCountdownGoal } from "@/lib/analytics-helpers";
import { CountdownGoalSettings } from "@/types/analytics";

interface CountdownGoalWidgetProps {
  averageScore: number;
}

const STORAGE_KEY_DATE = "nbe_target_exam_date";
const STORAGE_KEY_SCORE = "nbe_target_score";

export const CountdownGoalWidget: React.FC<CountdownGoalWidgetProps> = ({
  averageScore,
}) => {
  const [targetDate, setTargetDate] = useState<string>("");
  const [targetScore, setTargetScore] = useState<number>(150);
  const [isEditing, setIsEditing] = useState<boolean>(false);
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
        const iso = defaultDate.toISOString().split("T")[0];
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
    } catch (e) {
      console.error("Failed to save target settings:", e);
    }
  };

  const goalData: CountdownGoalSettings = computeCountdownGoal(
    targetDate,
    targetScore,
    averageScore
  );

  const isQualified = averageScore >= targetScore;

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800 relative overflow-hidden flex flex-col justify-between group">
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block leading-tight">
              Exam Countdown
            </span>
            <span className="text-xs font-bold text-slate-200">
              NBEMS Junior Assistant
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
          title="Configure Target Date & Goal"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editing State */}
      {isEditing ? (
        <div className="space-y-3 relative z-10 py-1">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Target Exam Date
            </label>
            <input
              type="date"
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
              className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Target Net Score (Default: 150)
            </label>
            <input
              type="number"
              min={50}
              max={200}
              value={tempScore}
              onChange={(e) => setTempScore(parseInt(e.target.value, 10) || 150)}
              className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded-md"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-md flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Save
            </button>
          </div>
        </div>
      ) : (
        /* Display State */
        <div className="space-y-3 relative z-10">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-black font-mono tracking-tight text-white flex items-baseline gap-1">
                <span>{goalData.daysRemaining}</span>
                <span className="text-xs text-slate-400 font-sans font-semibold">
                  Days Left
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                Target Date: {goalData.targetExamDate}
              </p>
            </div>

            <div className="text-right">
              <div className="text-sm font-bold font-mono text-emerald-400">
                {averageScore} / {targetScore}
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Target Benchmark
              </span>
            </div>
          </div>

          {/* Goal Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
              <span>Goal Progress</span>
              <span className={isQualified ? "text-emerald-400" : "text-blue-300"}>
                {goalData.progressPercentage}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isQualified ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"
                }`}
                style={{ width: `${goalData.progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
