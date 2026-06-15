import React from "react";

interface TiltBlockProps {
  title: string;
  subtitle?: string;
  gradient?: "lime-cyan" | "pink-violet" | "yellow-pink";
  className?: string;
}

export function TiltBlock({ 
  title, 
  subtitle, 
  gradient = "lime-cyan", 
  className = "" 
}: TiltBlockProps) {
  const gradientStyles = {
    "lime-cyan": "from-[#CCFF00] to-[#00F5FF] text-black",
    "pink-violet": "from-[#FF2D78] to-[#B44FFF] text-white",
    "yellow-pink": "from-amber-400 to-[#FF2D78] text-black",
  };

  const selectedGradient = gradientStyles[gradient] || gradientStyles["lime-cyan"];

  return (
    <div className={`relative my-8 ${className}`}>
      {/* Skewed background container */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r ${selectedGradient} transform -skew-y-1.5 border-3 border-black shadow-[6px_6px_0_rgba(0,0,0,1)]`}
        style={{ transformOrigin: "center" }}
      />

      {/* Inside straight container (counter-skewed to straighten out content) */}
      <div className="relative z-10 py-5 px-6 md:px-10 transform skew-y-1.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black font-mono tracking-tight uppercase select-none">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[10px] md:text-xs font-mono tracking-wider opacity-90 uppercase font-black mt-1">
              /// {subtitle}
            </p>
          )}
        </div>

        {/* Brutalist status tag on the right of tilted banner */}
        <div className="bg-black text-white text-[9px] font-mono font-bold px-3 py-1 border-2 border-white select-none whitespace-nowrap">
          SYSTEM COMPONENT: ACTIVE
        </div>
      </div>
    </div>
  );
}
