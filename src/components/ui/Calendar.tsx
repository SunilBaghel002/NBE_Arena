"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
  Flag,
  RotateCcw,
  Check,
} from "lucide-react";

export interface ActivityDay {
  count: number;
  avgScore?: number;
}

export interface CalendarProps {
  selectedDate?: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  examTargetDate?: string; // YYYY-MM-DD
  activityDates?: Record<string, ActivityDay> | string[];
  showPresets?: boolean;
  className?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function formatDateToYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYMD(str: string): Date | null {
  if (!str) return null;
  const parts = str.split("-").map(Number);
  if (parts.length !== 3) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onSelectDate,
  minDate,
  maxDate,
  examTargetDate,
  activityDates,
  showPresets = true,
  className = "",
}) => {
  const todayStr = useMemo(() => formatDateToYMD(new Date()), []);
  const initialDate = useMemo(() => {
    return parseYMD(selectedDate || "") || new Date();
  }, [selectedDate]);

  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth());

  // Convert activityDates to standard lookup
  const activityMap = useMemo<Record<string, ActivityDay>>(() => {
    if (!activityDates) return {};
    if (Array.isArray(activityDates)) {
      const map: Record<string, ActivityDay> = {};
      activityDates.forEach((d) => {
        map[d] = { count: 1 };
      });
      return map;
    }
    return activityDates;
  }, [activityDates]);

  // Navigate Months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    onSelectDate(todayStr);
  };

  // Quick Presets (+30d, +45d, +60d, etc.)
  const applyPresetDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const ymd = formatDateToYMD(d);
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
    onSelectDate(ymd);
  };

  // Generate Month Grid Days
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    // Day of week: 0 is Sunday, convert to Monday = 0
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const totalDaysInMonth = lastDay.getDate();
    const days: {
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isDisabled: boolean;
      isSelected: boolean;
      isToday: boolean;
      isTarget: boolean;
      activity?: ActivityDay;
    }[] = [];

    // Previous month filler
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dNum = prevMonthLastDay - i;
      const prevDate = new Date(currentYear, currentMonth - 1, dNum);
      const dateStr = formatDateToYMD(prevDate);
      days.push({
        dayNumber: dNum,
        dateStr,
        isCurrentMonth: false,
        isDisabled: Boolean(minDate && dateStr < minDate) || Boolean(maxDate && dateStr > maxDate),
        isSelected: dateStr === selectedDate,
        isToday: dateStr === todayStr,
        isTarget: dateStr === examTargetDate,
        activity: activityMap[dateStr],
      });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const currDate = new Date(currentYear, currentMonth, i);
      const dateStr = formatDateToYMD(currDate);
      days.push({
        dayNumber: i,
        dateStr,
        isCurrentMonth: true,
        isDisabled: Boolean(minDate && dateStr < minDate) || Boolean(maxDate && dateStr > maxDate),
        isSelected: dateStr === selectedDate,
        isToday: dateStr === todayStr,
        isTarget: dateStr === examTargetDate,
        activity: activityMap[dateStr],
      });
    }

    // Next month filler (pad to complete 42 or 35 cells)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(currentYear, currentMonth + 1, i);
      const dateStr = formatDateToYMD(nextDate);
      days.push({
        dayNumber: i,
        dateStr,
        isCurrentMonth: false,
        isDisabled: Boolean(minDate && dateStr < minDate) || Boolean(maxDate && dateStr > maxDate),
        isSelected: dateStr === selectedDate,
        isToday: dateStr === todayStr,
        isTarget: dateStr === examTargetDate,
        activity: activityMap[dateStr],
      });
    }

    return days;
  }, [currentYear, currentMonth, selectedDate, todayStr, minDate, maxDate, examTargetDate, activityMap]);

  return (
    <div className={`p-4 bg-white rounded-2xl border border-slate-200 shadow-soft select-none ${className}`}>
      {/* Month & Year Navigation Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <span className="font-heading font-extrabold text-sm text-slate-900">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Presets Strip */}
      {showPresets && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3 pb-2.5 border-b border-slate-100 text-[10px]">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mr-1">
            Presets:
          </span>
          <button
            type="button"
            onClick={() => applyPresetDays(30)}
            className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-bold border border-slate-200/80 transition"
          >
            +30 Days
          </button>
          <button
            type="button"
            onClick={() => applyPresetDays(45)}
            className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 transition"
          >
            +45 Days (Rec)
          </button>
          <button
            type="button"
            onClick={() => applyPresetDays(60)}
            className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-bold border border-slate-200/80 transition"
          >
            +60 Days
          </button>
          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold ml-auto flex items-center gap-1 transition"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Today</span>
          </button>
        </div>
      )}

      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 text-center gap-1 mb-1.5">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 py-1"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarGrid.map((item, idx) => {
          const isSelected = item.isSelected;
          const isToday = item.isToday;
          const isTarget = item.isTarget;
          const hasActivity = Boolean(item.activity);

          return (
            <button
              key={`${item.dateStr}-${idx}`}
              type="button"
              disabled={item.isDisabled}
              onClick={() => onSelectDate(item.dateStr)}
              className={`relative h-9 w-full rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all duration-150 group ${
                item.isDisabled
                  ? "opacity-30 cursor-not-allowed text-slate-300"
                  : isSelected
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25 scale-105 z-10"
                  : isTarget
                  ? "bg-amber-50 text-amber-900 border border-amber-300 font-bold hover:bg-amber-100"
                  : isToday
                  ? "bg-blue-50 text-blue-700 font-bold border border-blue-200 hover:bg-blue-100"
                  : item.isCurrentMonth
                  ? "text-slate-800 hover:bg-slate-100 hover:text-slate-900"
                  : "text-slate-300 hover:bg-slate-50 hover:text-slate-500"
              }`}
            >
              <span>{item.dayNumber}</span>

              {/* Badges / Dots */}
              <div className="flex items-center gap-0.5 absolute bottom-1">
                {isTarget && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Target Exam Date" />
                )}
                {hasActivity && !isSelected && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                    title={`Practiced on this day: ${item.activity?.count} test(s)`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> Selected
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Practiced
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Exam Target
          </span>
        </div>

        {selectedDate && (
          <span className="font-mono font-bold text-slate-700">{selectedDate}</span>
        )}
      </div>
    </div>
  );
};
