import React from "react";

export const InstructionsSkeleton: React.FC = () => {
  return (
    <div className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="h-5 w-64 bg-slate-200 rounded-full" />
        <div className="h-8 w-96 bg-slate-200 rounded-xl" />
        <div className="h-4 w-2/3 bg-slate-100 rounded-md" />
      </div>

      {/* 2-Column Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-7 w-16 bg-slate-300 rounded" />
              </div>
            ))}
          </div>
          <div className="h-48 bg-slate-50 rounded-2xl border border-slate-200" />
          <div className="h-32 bg-slate-50 rounded-2xl border border-slate-200" />
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="h-5 w-48 bg-slate-200 rounded" />
            <div className="h-32 bg-slate-50 rounded-2xl border border-slate-200" />
            <div className="h-20 bg-blue-50 rounded-2xl border border-blue-200" />
            <div className="h-12 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
