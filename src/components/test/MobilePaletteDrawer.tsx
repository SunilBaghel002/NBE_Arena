"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { QuestionPalette } from "@/components/test/QuestionPalette";

interface MobilePaletteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobilePaletteDrawer: React.FC<MobilePaletteDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Store currently focused element before opening drawer
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    // 2. Move focus into the drawer when opened
    const focusTimer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    // 3. Handle Escape key to close and Tab key to trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const dialog = drawerRef.current;
        if (!dialog) return;

        const focusableElements = dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !dialog.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !dialog.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      // 4. Restore previously focused element on close
      previousActiveElementRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      aria-hidden={!isOpen}
    >
      {/* Backdrop for click-to-dismiss */}
      <button
        type="button"
        className="flex-1 w-full cursor-default focus:outline-none"
        onClick={onClose}
        tabIndex={-1}
        aria-label="Close palette overlay"
      />

      {/* Accessible Modal Dialog Container */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-palette-title"
        className="bg-white rounded-t-3xl shadow-2xl border-t border-slate-300 flex flex-col max-h-[82vh] h-[75vh] w-full overflow-hidden animate-in slide-in-from-bottom duration-200"
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <h2 id="mobile-palette-title" className="font-bold text-slate-800 text-xs sm:text-sm">
            Question Palette & Candidate Console
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label="Close Question Palette"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <QuestionPalette onQuestionSelected={onClose} />
        </div>
      </div>
    </div>
  );
};
