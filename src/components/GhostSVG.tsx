import React from "react";

interface GhostProps {
  variant: "scout" | "engineer" | "commander" | "sage";
  color?: string;
  size?: number;
  className?: string;
  levitate?: boolean;
}

export function GhostSVG({ variant, color = "#10b981", size = 80, className = "", levitate = true }: GhostProps) {
  // Determine gradient IDs uniquely to avoid collision
  const gradId = `grad-${variant}`;
  
  // Decide secondary highlights and features based on variant style
  const getFaces = () => {
    switch (variant) {
      case "scout":
        return (
          <g>
            {/* Round focus scout eyes */}
            <circle cx="35" cy="40" r="4" fill="#ffffff" />
            <circle cx="65" cy="40" r="4" fill="#ffffff" />
            <circle cx="36" cy="40" r="1.5" fill="#10b981" />
            <circle cx="66" cy="40" r="1.5" fill="#10b981" />
            <path d="M 46 48 Q 50 45 54 48" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        );
      case "engineer":
        return (
          <g>
            {/* Engineer goggles */}
            <rect x="26" y="32" width="18" height="12" rx="4" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
            <rect x="56" y="32" width="18" height="12" rx="4" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
            <line x1="44" y1="38" x2="56" y2="38" stroke="#f59e0b" strokeWidth="3" />
            <circle cx="35" cy="38" r="2.5" fill="#ffffff" />
            <circle cx="65" cy="38" r="2.5" fill="#ffffff" />
            <path d="M 44 48 L 56 48" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case "commander":
        return (
          <g>
            {/* Confident commander eyebrows and smirk */}
            <path d="M 28 32 L 38 36" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 72 32 L 62 36" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="34" cy="41" r="3.5" fill="#ffffff" />
            <circle cx="66" cy="41" r="3.5" fill="#ffffff" />
            <path d="M 45 50 Q 56 50 56 44" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        );
      case "sage":
        return (
          <g>
            {/* Mystical glowing abstract elder eyes */}
            <path d="M 30 38 Q 35 34 40 38" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 60 38 Q 65 34 70 38" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="35" cy="43" r="1.5" fill="#ffffff" className="animate-pulse" />
            <circle cx="65" cy="43" r="1.5" fill="#ffffff" className="animate-pulse" />
            <path d="M 43 47 Q 50 52 57 47" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        );
    }
  };

  return (
    <div className={`relative ${levitate ? "animate-bounce" : ""}`} style={{ animationDuration: "3s" }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={`filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] ${className}`}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.85" />
            <stop offset="70%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0a0f1d" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Ghost Body Aura */}
        <path
          d="M 20 50 
             C 20 20, 80 20, 80 50 
             C 80 65, 85 75, 76 88 
             C 70 95, 62 84, 58 88 
             C 54 92, 50 96, 46 90 
             C 42 84, 34 94, 28 88 
             C 20 80, 20 65, 20 50 Z"
          fill={`url(#${gradId})`}
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {/* Subtle inner ghost contour decoration */}
        <path
          d="M 26 48 C 26 26, 74 26, 74 48"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />

        {/* Eyes & Mouth (Face rendering based on role) */}
        {getFaces()}

        {/* Action Lightning Sparks (Orbiting dots) */}
        <circle cx="15" cy="30" r="1.5" fill={color} opacity="0.6" className="animate-ping" style={{ animationDuration: "1.5s" }} />
        <circle cx="85" cy="65" r="1.5" fill={color} opacity="0.6" className="animate-ping" style={{ animationDuration: "1.9s" }} />
      </svg>
    </div>
  );
}
