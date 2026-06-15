import React, { useState } from "react";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { Award, Layers, Hash, Zap } from "lucide-react";

interface SkillItem {
  name: string;
  size: string; // Tailwind text class or raw font height
  color: string;
  category: "intake" | "orchestration" | "design" | "systems";
}

export function SkillsCloud() {
  const { addToast } = useWorkspaceStore() as any;
  const [selectedCategory, setSelectedCategory] = useState<"all" | "intake" | "orchestration" | "design" | "systems">("all");

  const skills: SkillItem[] = [
    // Intake
    { name: "Tesseract.js OCR", size: "text-lg", color: "border-[#CCFF00] hover:bg-[#CCFF00]/10", category: "intake" },
    { name: "PDF Ingestion", size: "text-xs", color: "border-[#00F5FF] hover:bg-[#00F5FF]/10", category: "intake" },
    { name: "Metadata Extractor", size: "text-sm", color: "border-[#FF2D78] hover:bg-[#FF2D78]/10", category: "intake" },
    { name: "Entity Resolver", size: "text-base", color: "border-[#B44FFF] hover:bg-[#B44FFF]/10", category: "intake" },
    { name: "Word Ingestion API", size: "text-xs", color: "border-[#CCFF00] hover:bg-[#CCFF00]/10", category: "intake" },

    // Orchestration
    { name: "Agent ARIA", size: "text-sm", color: "border-[#00F5FF] hover:bg-[#00F5FF]/10", category: "orchestration" },
    { name: "Agent KODE", size: "text-lg", color: "border-[#FF2D78] hover:bg-[#FF2D78]/10", category: "orchestration" },
    { name: "Agent LUMA", size: "text-base", color: "border-[#B44FFF] hover:bg-[#B44FFF]/10", category: "orchestration" },
    { name: "Agent SAGE", size: "text-xs", color: "border-[#CCFF00] hover:bg-[#CCFF00]/10", category: "orchestration" },
    { name: "Multi-Agent Queue", size: "text-lg", color: "border-[#00F5FF] hover:bg-[#00F5FF]/10", category: "orchestration" },
    { name: "Gemini Structured Fallback", size: "text-sm", color: "border-[#FF2D78] hover:bg-[#FF2D78]/10", category: "orchestration" },

    // Design
    { name: "Tailwind CSS v4", size: "text-lg", color: "border-[#B44FFF] hover:bg-[#B44FFF]/10", category: "design" },
    { name: "Neon Brutalism UI", size: "text-base", color: "border-[#CCFF00] hover:bg-[#CCFF00]/10", category: "design" },
    { name: "Hard Shadows", size: "text-xs", color: "border-[#00F5FF] hover:bg-[#00F5FF]/10", category: "design" },
    { name: "Holographic Panels", size: "text-sm", color: "border-[#FF2D78] hover:bg-[#FF2D78]/10", category: "design" },
    { name: "Skew Layout SkewY", size: "text-xs", color: "border-[#B44FFF] hover:bg-[#B44FFF]/10", category: "design" },

    // Systems
    { name: "Zustand Persistence", size: "text-sm", color: "border-[#CCFF00] hover:bg-[#CCFF00]/10", category: "systems" },
    { name: "Telemetry Store", size: "text-lg", color: "border-[#00F5FF] hover:bg-[#00F5FF]/10", category: "systems" },
    { name: "IndexedDB Cache", size: "text-xs", color: "border-[#FF2D78] hover:bg-[#FF2D78]/10", category: "systems" },
    { name: "Command Palette CMDK", size: "text-base", color: "border-[#B44FFF] hover:bg-[#B44FFF]/10", category: "systems" },
  ];

  const filteredSkills = selectedCategory === "all"
    ? skills
    : skills.filter((sk) => sk.category === selectedCategory);

  const filterTabs = [
    { id: "all", label: "ALL ABILITIES", icon: Award },
    { id: "intake", label: "FILE & OCR INTAKE", icon: Layers },
    { id: "orchestration", label: "AGENT COORDINATION", icon: Zap },
    { id: "design", label: "NEON BRUTALIST UI", icon: Hash },
    { id: "systems", label: "STATE ENGINE", icon: Hash },
  ];

  return (
    <div className="bg-[#03040A] border-3 border-black p-6 relative overflow-hidden select-none shadow-[6px_6px_0_rgba(0,0,0,1)] text-left space-y-4">
      {/* Absolute Acid Grid Line Background */}
      <div className="absolute inset-0 bg-[#CCFF00]/2 bg-[radial-gradient(#CCFF00_1px,transparent_1px)] [background-size:12px_12px] opacity-35 pointer-events-none" />

      <div className="relative z-10 space-y-2">
        <h4 className="text-sm font-bold font-mono text-[#00F5FF] tracking-wider uppercase">
          SYSTEM CAPABILITY REGISTRY matrix (66 SYSTEMS / 84 SUBSYSTEMS)
        </h4>
        <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
          Operational models synced with active local storage. Click skills to query pipeline dependencies.
        </p>
      </div>

      {/* Categories Filtering tabs using Thick Borders */}
      <div className="flex flex-wrap gap-1.5 relative z-10">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedCategory(tab.id as any);
                addToast(`Filtered matrix view: ${tab.label}`, "info");
              }}
              className={`flex items-center gap-1 px-3 py-1 text-[9.5px] font-mono font-bold uppercase transition-all duration-155 border-2 border-black tracking-tight cursor-pointer ${
                isActive 
                  ? "bg-[#CCFF00] text-black shadow-[2px_2px_0_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]" 
                  : "bg-[#121620] text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={11} className={isActive ? "text-black" : "text-sky-400"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Cloud Items container */}
      <div className="border border-white/5 p-4 bg-[#06070c] relative z-10 flex flex-wrap gap-2 justify-center items-center py-6 min-h-36">
        {filteredSkills.map((sk, idx) => (
          <button
            key={idx}
            onClick={() => {
              addToast(`Synchronizing model parameters for: ${sk.name}`, "success");
            }}
            className={`font-mono font-black uppercase inline-block border-2 px-3.5 py-1.5 rounded-none cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 shadow-[3px_3px_0_rgba(0,0,0,1)] hover:shadow-[#00F5FF] hover:-translate-y-0.5 ${sk.size} ${sk.color} text-slate-100`}
            style={{
              textShadow: "1px 1px 0 rgba(0,0,0,0.8)",
            }}
          >
            {sk.name}
          </button>
        ))}
      </div>
    </div>
  );
}
