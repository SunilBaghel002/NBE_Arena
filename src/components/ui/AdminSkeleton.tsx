import React from "react";

export const AdminSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full space-y-6 animate-pulse">
      {/* Tabs bar skeleton */}
      <div className="flex justify-between border-b border-slate-200 pb-4">
        <div className="h-10 w-96 bg-slate-200 rounded-xl" />
        <div className="h-10 w-28 bg-slate-200 rounded-xl" />
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-8 w-16 bg-slate-300 rounded" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Content Table / Cards Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="h-6 w-48 bg-slate-200 rounded-md" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-xl border border-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
};
