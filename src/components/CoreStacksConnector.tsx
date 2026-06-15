import React, { useState } from "react";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { useDevice } from "./DeviceProvider";

interface StackNode {
  id: string;
  name: string;
  logo: string;
  color: string;
  x: number;
  y: number;
}

export function CoreStacksConnector() {
  const { addToast } = useWorkspaceStore() as any;
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const device = useDevice();

  // Nodes position coordinates within 600x200 responsive SVG grid
  const nodes: StackNode[] = [
    { id: "next", name: "Next.js Pages", logo: "▲", color: "#CCFF00", x: 70, y: 100 },
    { id: "ts", name: "Strict TS", logo: "TS", color: "#00F5FF", x: 190, y: 55 },
    { id: "tw", name: "Tailwind v4", logo: "✽", color: "#FF2D78", x: 190, y: 145 },
    { id: "flow", name: "React Flow", logo: "⇋", color: "#B44FFF", x: 310, y: 100 },
    { id: "tiptap", name: "TipTap Docs", logo: "✎", color: "#CCFF00", x: 430, y: 55 },
    { id: "zustand", name: "Zustand State", logo: "🐻", color: "#00F5FF", x: 430, y: 145 },
    { id: "tess", name: "Tesseract.js", logo: "[o]", color: "#FF2D78", x: 530, y: 100 },
  ];

  // Bezier curve connectors between logical layout nodes
  const paths = [
    { from: "next", to: "ts" },
    { from: "next", to: "tw" },
    { from: "ts", to: "flow" },
    { from: "tw", to: "flow" },
    { from: "flow", to: "tiptap" },
    { from: "flow", to: "zustand" },
    { from: "tiptap", to: "tess" },
    { from: "zustand", to: "tess" },
  ];

  if (device === "mobile") {
    return (
      <div className="bg-[#03040A] p-4 border-3 border-black relative overflow-hidden select-none shadow-[4px_4px_0_rgba(0,0,0,1)] text-left space-y-4">
        <div className="absolute inset-0 bg-[#0b0b12] pointer-events-none opacity-40" />
        
        <div className="relative z-10 border-b-2 border-black pb-3 flex justify-between items-center">
          <div>
            <h4 className="text-xs font-black font-mono tracking-tight flex items-center gap-1.5 text-[#CCFF00]">
              <span className="w-1.5 h-1.5 bg-[#CCFF00] inline-block animate-ping rounded-full" />
              INTEGRATION ROUTINGS (MOBILE)
            </h4>
            <p className="text-[8.5px] text-slate-400 font-mono mt-0.5">
              Continuous framework integration pipelines nominal.
            </p>
          </div>
          <button 
            onClick={() => addToast("Testing Core Stacks Flow Connector triggers", "success")} 
            className="bg-[#00F5FF] text-black text-[8px] font-bold font-mono px-2 py-1 border-2 border-black active:scale-95 transition-all cursor-pointer select-none shrink-0"
          >
            SYNC
          </button>
        </div>

        <div className="relative pl-6 space-y-4 py-2">
          {/* Vertical connection vector line */}
          <div className="absolute left-3 top-0 bottom-0 w-1 bg-black overflow-hidden border border-white/5">
            {/* Animated neon line indicator */}
            <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-b from-[#CCFF00] via-[#FF2D78] to-[#00F5FF] h-20 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>

          {nodes.map((n) => (
            <div key={n.id} className="relative flex items-center gap-3 bg-[#0b0b12] border-2 border-black p-2.5 shadow-[2px_2px_0_rgba(0,0,0,1)]">
              {/* Node index circles */}
              <div 
                className="w-7 h-7 rounded-full bg-[#03040A] border-2 flex items-center justify-center font-black text-xs font-mono shrink-0"
                style={{ borderColor: n.color, color: n.color, boxShadow: `0px 0px 8px ${n.color}3a` }}
              >
                {n.logo}
              </div>
              
              <div className="text-left font-mono leading-none">
                <span className="text-[10px] font-black text-white block uppercase tracking-wide">{n.name}</span>
                <span className="text-[8px] text-slate-500 block uppercase mt-1">Status: Nominal • Online</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#03040A] p-6 border-3 border-black relative overflow-hidden select-none shadow-[6px_6px_0_rgba(0,0,0,1)] text-left space-y-4">
      {/* Decorative Matrix Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,30,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,30,0.45)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />

      {/* Tilted Header Block Section inside */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-white/10 pb-4">
        <div>
          <h4 className="text-sm font-bold font-mono tracking-tight flex items-center gap-2 text-[#CCFF00]">
            <span className="w-2.5 h-2.5 bg-[#CCFF00] inline-block animate-ping rounded-full shrink-0" />
            CORE WORKSPACE PIPELINE ENGINE
          </h4>
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            Real-time visual node mapping connecting downstream frameworks and state hydration.
          </p>
        </div>

        <button 
          onClick={() => addToast("Testing Core Stacks Flow Connector triggers", "success")} 
          className="bg-[#00F5FF] text-black text-[9.5px] font-bold font-mono px-3 py-1.5 border-2 border-black hover:bg-white transition-colors cursor-pointer"
        >
          FORCE LINK SYNC
        </button>
      </div>

      <div className="relative h-64 md:h-52 w-full border border-white/5 bg-[#08080f] overflow-hidden">
        {/* SVG Drawing Canvas for bezier connections */}
        <svg 
          viewBox="0 0 600 200" 
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Pulsing glow gradient definitions */}
            <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CCFF00" />
              <stop offset="50%" stopColor="#FF2D78" />
              <stop offset="100%" stopColor="#00F5FF" />
            </linearGradient>

            <style>{`
              @keyframes dash-flow {
                to {
                  stroke-dashoffset: -20;
                }
              }
              .beiz-link {
                animation: dash-flow 0.8s linear infinite;
              }
              .node-tilt-pulse {
                transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
              }
              .node-tilt-pulse:hover {
                transform: rotate(3deg) scale(1.1);
              }
            `}</style>
          </defs>

          {/* SVG Connector Paths */}
          {paths.map((p, idx) => {
            const start = nodes.find(n => n.id === p.from);
            const end = nodes.find(n => n.id === p.to);
            if (!start || !end) return null;

            // Draw a smooth bezier curve
            const cx1 = start.x + (end.x - start.x) / 2;
            const cy1 = start.y;
            const cx2 = start.x + (end.x - start.x) / 2;
            const cy2 = end.y;
            const d = `M ${start.x} ${start.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${end.x} ${end.y}`;

            const isHighlighted = hoveredNode === p.from || hoveredNode === p.to;

            return (
              <g key={idx}>
                {/* Thick underlying backing glow path */}
                <path
                  d={d}
                  fill="none"
                  stroke={isHighlighted ? "url(#glow-grad)" : "#222230"}
                  strokeWidth={isHighlighted ? 4 : 2}
                  className="transition-all duration-300"
                  opacity={isHighlighted ? 0.95 : 0.4}
                />
                
                {/* Moving glowing particle flow dash path */}
                <path
                  d={d}
                  fill="none"
                  stroke={isHighlighted ? "#ffffff" : "url(#glow-grad)"}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  strokeDasharray={isHighlighted ? "4 4" : "6 8"}
                  className="beiz-link"
                  opacity={isHighlighted ? 1.0 : 0.65}
                />
              </g>
            );
          })}

          {/* Core Visual Stacks Nodes */}
          {nodes.map((n) => {
            const isHovered = hoveredNode === n.id;
            return (
              <g 
                key={n.id}
                onMouseEnter={() => setHoveredNode(n.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer node-tilt-pulse"
                style={{ transformOrigin: `${n.x}px ${n.y}px` }}
              >
                {/* Neon backing block shadow card effect on node */}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={18}
                  fill="#03040A"
                  stroke={isHovered ? "#ffffff" : n.color}
                  strokeWidth={isHovered ? 3.5 : 2.5}
                  style={{
                    filter: isHovered 
                      ? `drop-shadow(0px 0px 8px ${n.color})` 
                      : `drop-shadow(3px 3px 0px rgba(0,0,0,1))`
                  }}
                  className="transition-all duration-300"
                />

                <text
                  x={n.x}
                  y={n.y + 3.5}
                  textAnchor="middle"
                  fill={isHovered ? "#CCFF00" : "#F0F4FF"}
                  fontSize="11px"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {n.logo}
                </text>

                {/* Subtitle / text floating below node */}
                <text
                  x={n.x}
                  y={n.y + 33}
                  textAnchor="middle"
                  fill={isHovered ? n.color : "#9CA3C0"}
                  fontSize="8px"
                  fontWeight="bold"
                  fontFamily="monospace"
                  letterSpacing="0.05em"
                  opacity={isHovered ? 1.0 : 0.75}
                >
                  {n.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
