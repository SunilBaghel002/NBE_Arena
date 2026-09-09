"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarComponent, CalendarProps } from "./Calendar";
import { Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";

export interface DatePickerProps
  extends Omit<CalendarProps, "className" | "onSelectDate" | "selectedDate"> {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = "Select Target Date...",
  disabled = false,
  className = "",
  minDate,
  maxDate,
  examTargetDate,
  activityDates,
  showPresets = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Format date display (e.g., "15 Nov 2026")
  const formattedDisplay = React.useMemo(() => {
    if (!value) return "";
    try {
      const parts = value.split("-").map(Number);
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    } catch {
      // fallback
    }
    return value;
  }, [value]);

  const handleSelectDate = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="text-eyebrow block mb-1.5 text-slate-700 font-bold">
          {label}
        </label>
      )}

      {/* Input Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all duration-150 focus-ring ${
          isOpen
            ? "bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm"
            : "bg-slate-50 hover:bg-white border-slate-200/90 text-slate-800"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
          {formattedDisplay ? (
            <span className="font-bold text-slate-900">{formattedDisplay}</span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown Calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-[320px] animate-in fade-in zoom-in-95 duration-150">
          <CalendarComponent
            selectedDate={value}
            onSelectDate={handleSelectDate}
            minDate={minDate}
            maxDate={maxDate}
            examTargetDate={examTargetDate}
            activityDates={activityDates}
            showPresets={showPresets}
            className="border-slate-200 shadow-dropdown bg-white"
          />
        </div>
      )}
    </div>
  );
};
