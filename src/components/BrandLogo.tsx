import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  clickable?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "md",
  showSubtitle = true,
  clickable = true,
}) => {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const titleSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  const subtitleSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  const content = (
    <div className="flex items-center gap-3 select-none group">
      {/* Emblem SVG with Glow */}
      <div
        className={`${iconSizes[size]} relative flex-shrink-0 transition transform group-hover:scale-105 duration-200`}
      >
        <svg viewBox="0 0 512 512" fill="none" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="shieldNav" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="50%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <linearGradient id="goldNav" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <path
            d="M256 32L416 96V240C416 348 348 444 256 480C164 444 96 348 96 240V96L256 32Z"
            fill="url(#shieldNav)"
            stroke="url(#goldNav)"
            strokeWidth="16"
            strokeLinejoin="round"
          />
          <path d="M246 160H266V330H246V160Z" fill="url(#goldNav)" rx="4" />
          <path d="M256 120C244 140 236 150 256 170C276 150 268 140 256 120Z" fill="#EF4444" />
          <polygon
            points="256,180 263,198 282,198 267,209 273,227 256,216 239,227 245,209 230,198 249,198"
            fill="url(#goldNav)"
          />
          <path
            d="M190 230C180 270 200 310 240 330C220 310 210 280 215 250C198 248 192 238 190 230Z"
            fill="url(#goldNav)"
          />
          <path
            d="M322 230C332 270 312 310 272 330C292 310 302 280 297 250C314 248 320 238 322 230Z"
            fill="url(#goldNav)"
          />
          <path d="M160 370H352L336 410H176L160 370Z" fill="url(#goldNav)" rx="4" />
          <text
            x="256"
            y="398"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="30"
            fontWeight="900"
            fill="#0F172A"
            textAnchor="middle"
            letterSpacing="4"
          >
            NBE
          </text>
        </svg>
      </div>

      {/* Typography */}
      <div>
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight text-white ${titleSizes[size]}`}>
            NBE <span className="text-amber-400">ARENA</span>
          </span>
          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
            CBT
          </span>
        </div>
        {showSubtitle && (
          <p className={`text-slate-400 font-medium mt-1 leading-none ${subtitleSizes[size]}`}>
            NBEMS Jr. Assistant Simulation
          </p>
        )}
      </div>
    </div>
  );

  if (clickable) {
    return <Link href="/">{content}</Link>;
  }

  return content;
};
