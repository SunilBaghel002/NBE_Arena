import React from "react";

export const InstructionsSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full space-y-6 animate-pulse">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="h-5 w-48 bg-slate-200 rounded-full" />
        <div className="h-8 w-80 bg-slate-200 rounded-lg" />
        <div className="h-4 w-full bg-slate-100 rounded-md" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-7 w-16 bg-slate-300 rounded" />
            </div>
          ))}
        </div>

        <div className="h-48 bg-slate-50 rounded-xl border border-slate-200" />
      </div>
    </div>
  );
};
