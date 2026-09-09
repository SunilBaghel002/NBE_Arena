"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus, Compass } from "lucide-react";
import { Attempt } from "@/types";
import { computeImprovementTrend } from "@/lib/analytics-helpers";
import { ImprovementTrendData } from "@/types/analytics";

interface ImprovementTrendBadgeProps {
  attempts: (Attempt & { mockTitle?: string })[];
}

export const ImprovementTrendBadge: React.FC<ImprovementTrendBadgeProps> = ({
  attempts,
}) => {
  const trend: ImprovementTrendData = computeImprovementTrend(attempts);

  if (trend.status === "baseline" && attempts.length === 0) {
    return null;
  }

  const getStyle = () => {
    switch (trend.status) {
      case "improving":
        return {
          container: "bg-emerald-50 text-emerald-800 border-emerald-200",
          icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case "declining":
        return {
          container: "bg-rose-50 text-rose-800 border-rose-200",
          icon: <TrendingDown className="w-3.5 h-3.5 text-rose-600" />,
        };
      case "plateau":
        return {
          container: "bg-amber-50 text-amber-800 border-amber-200",
          icon: <Minus className="w-3.5 h-3.5 text-amber-600" />,
        };
      default:
        return {
          container: "bg-blue-50 text-blue-800 border-blue-200",
          icon: <Compass className="w-3.5 h-3.5 text-blue-600" />,
        };
    }
  };

  const style = getStyle();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-xs cursor-default ${style.container}`}
      title={trend.comparisonText}
    >
      {style.icon}
      <span>{trend.deltaLabel}</span>
    </div>
  );
};
