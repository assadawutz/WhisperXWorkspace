import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { ListTodo, RefreshCw, AlertTriangle, History, ShieldAlert, Cpu, Activity, Server } from "lucide-react";
import { InteractiveTilt } from "./InteractiveTilt";

export function BottomTray() {
  const { 
    jobs, 
    snapshots, 
    restoreSnapshot, 
    sourceFiles, 
    readinessReports, 
    activeFileId, 
    telemetryStore,
    addToast
  } = useWorkspaceStore() as any;

  const [activeSubTab, setActiveSubTab] = useState<"jobs" | "snapshots" | "warnings" | "telemetry">("telemetry");

  // Performance simulation history
  const [fpsHistory, setFpsHistory] = useState<number[]>([
    60, 59, 60, 61, 60, 58, 59, 60, 60, 59, 60, 61, 60, 58, 60, 60, 59, 60, 61, 60
  ]);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([
    12, 14, 11, 15, 13, 16, 12, 11, 14, 15, 12, 13, 11, 16, 14, 12, 15, 11, 13, 12
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setFpsHistory((prev) => {
        const next = [...prev.slice(1)];
        const nextFps = Math.max(30, Math.min(60, Math.round(57 + Math.random() * 5 - 2)));
        next.push(nextFps);
        return next;
      });
      setLatencyHistory((prev) => {
        const next = [...prev.slice(1)];
        // Fluctuating ping latency in millisec
        const nextLatency = Math.max(2, Math.min(50, Math.round(14 + Math.random() * 8 - 3.8)));
        next.push(nextLatency);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fpsCurrent = fpsHistory[fpsHistory.length - 1];
  const latencyCurrent = latencyHistory[latencyHistory.length - 1];

  // Draw sparkline coordinates using real D3.js line generators and scaling
  const xScale = d3.scaleLinear().domain([0, 19]).range([0, 45]);
  const yScaleFps = d3.scaleLinear().domain([30, 65]).range([13, 2]);
  const yScaleLatency = d3.scaleLinear().domain([0, 40]).range([13, 2]);

  const lineBuilderFps = d3.line<number>()
    .x((_, i) => xScale(i))
    .y((val) => yScaleFps(val));

  const lineBuilderLatency = d3.line<number>()
    .x((_, i) => xScale(i))
    .y((val) => yScaleLatency(val));

  const fpsPath = lineBuilderFps(fpsHistory);
  const latencyPath = lineBuilderLatency(latencyHistory);

  // Dynamically calculate blockers based on files
  const activeReport = activeFileId ? readinessReports[activeFileId] : null;
  const totalBlockersCount = sourceFiles.reduce((acc: number, f: any) => {
    const rep = readinessReports[f.id];
    return acc + (rep?.blockers.length || 0);
  }, 0);

  const activeThreads = telemetryStore?.activeAgentThreads || [];

  return (
    <footer className="h-11 border-t-3 border-[#CCFF00] bg-[#03040A] px-6 flex items-center justify-between shrink-0 text-slate-300 text-xs z-20 font-mono relative overflow-hidden select-none select-none">
      {/* Background neon laser ray line effect */}
      <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00F5FF] to-transparent animate-pulse" />

      <div className="flex items-center space-x-5 h-full">
        {/* Connection health & Telemetry stats */}
        <div 
          onClick={() => {
            setActiveSubTab("telemetry");
            addToast("Opening workspace Telemetry console", "info");
          }}
          className={`flex items-center space-x-2 border-r border-[#FF2D78]/25 pr-4 h-full cursor-pointer hover:bg-[#FF2D78]/5 px-2 transition-colors ${activeSubTab === "telemetry" ? "bg-white/5 border-r border-white/10" : ""}`}
        >
          <Cpu size={13} className="text-[#CCFF00] animate-pulse" />
          <span className="text-[10.5px] text-white">
            LOAD: <span className="text-[#00F5FF] font-bold">{telemetryStore?.systemMetrics?.cpuLoad || 18}%</span>
          </span>
          <span className="text-[10.5px] text-slate-500">•</span>
          <span className="text-[10.5px] text-white">
            RAM: <span className="text-[#FF2D78] font-bold">{telemetryStore?.systemMetrics?.ramUsage || 42}%</span>
          </span>
        </div>

        {/* Tab triggers in robust Brutalist design (sharp corners, hard black borders) */}
        <div className="flex items-center space-x-2">
          {/* Telemetry Tab */}
          <button
            onClick={() => setActiveSubTab("telemetry")}
            className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-tight transition-all flex items-center gap-1 cursor-pointer border-2 ${
              activeSubTab === "telemetry"
                ? "bg-[#CCFF00] text-black border-black shadow-[2px_2px_0_rgba(0,0,0,1)]"
                : "bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-white/5"
            }`}
          >
            <Activity size={11} />
            <span>Telemetry ({activeThreads.length} THREADS)</span>
          </button>

          {/* Jobs Tab */}
          <button
            onClick={() => setActiveSubTab("jobs")}
            className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-tight transition-all flex items-center gap-1 cursor-pointer border-2 ${
              activeSubTab === "jobs"
                ? "bg-[#00F5FF] text-black border-black shadow-[2px_2px_0_rgba(0,0,0,1)]"
                : "bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-white/5"
            }`}
          >
            <RefreshCw size={11} className={jobs.some((j: any) => j.status === "running") ? "animate-spin" : ""} />
            <span>Jobs ({jobs.length})</span>
          </button>

          {/* Restore Points */}
          <button
            onClick={() => setActiveSubTab("snapshots")}
            className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-tight transition-all flex items-center gap-1 cursor-pointer border-2 ${
              activeSubTab === "snapshots"
                ? "bg-[#B44FFF] text-white border-black shadow-[2px_2px_0_rgba(0,0,0,1)]"
                : "bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-white/5"
            }`}
          >
            <History size={11} />
            <span>Snapshots ({snapshots.length})</span>
          </button>

          {/* Warnings */}
          <button
            onClick={() => setActiveSubTab("warnings")}
            className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-tight transition-all flex items-center gap-1 cursor-pointer border-2 ${
              activeSubTab === "warnings"
                ? "bg-[#FF2D78] text-white border-black shadow-[2px_2px_0_rgba(0,0,0,1)]"
                : "bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-white/5"
            }`}
          >
            <AlertTriangle size={11} className={totalBlockersCount > 0 ? "animate-bounce" : ""} />
            <span>Warnings ({totalBlockersCount})</span>
          </button>
        </div>
      </div>

      {/* Mini Active Status Display matching current SubTab */}
      <div className="flex items-center space-x-4">
        {/* Telemetry detail */}
        {activeSubTab === "telemetry" && (
          <div className="hidden lg:flex items-center space-x-3 text-[10px] text-slate-400">
            <span className="text-[#CCFF00]">► CORES BUSY:</span>
            {activeThreads.map((th: any, idx: number) => (
              <span key={idx} className="bg-white/5 px-2 py-0.5 rounded border border-white/10 text-[9.5px]">
                <strong className="text-white">{th.agentId}</strong>: {th.task}
              </span>
            ))}
          </div>
        )}

        {activeSubTab === "jobs" && jobs[0] && (
          <p className="text-[11px] text-slate-400 truncate max-w-sm border-l border-white/10 pl-4">
            LOG: <span className="text-[#00F5FF]">{jobs[0].log}</span>
          </p>
        )}

        {/* Dynamic Snapshots Popup Trigger inline */}
        {activeSubTab === "snapshots" && snapshots.length > 0 && (
          <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
            {snapshots.slice(0, 1).map((snap: any) => (
              <button
                key={snap.id}
                onClick={() => {
                  restoreSnapshot(snap.id);
                  addToast(`Reversing pipeline files to snap point: ${snap.name}`, "info");
                }}
                className="text-[10px] text-[#00F5FF] hover:underline font-bold cursor-pointer"
              >
                Restore {snap.name}
              </button>
            ))}
          </div>
        )}

        {activeSubTab === "warnings" && activeReport && (
          <div className="flex items-center space-x-1.5 text-[#FF2D78] bg-[#FF2D78]/10 border border-[#FF2D78]/40 px-2 py-0.5 rounded">
            <ShieldAlert size={12} />
            <span className="text-[10px] whitespace-nowrap">Blockers: {activeReport.blockers.length}</span>
          </div>
        )}

        {/* Performance Sparklines */}
        <div className="hidden md:flex items-center space-x-4 border-l border-white/15 pl-4 h-full shrink-0 select-none">
          {/* FPS Sparkline */}
          <div className="flex items-center space-x-1.5 text-[9.5px] text-slate-455 font-bold font-mono">
            <span>FPS</span>
            <span className="font-black text-[#CCFF00] font-mono leading-none">{fpsCurrent}</span>
            <svg width="45" height="15" className="overflow-visible select-none shrink-0">
              <path
                d={fpsPath || ""}
                fill="none"
                stroke="#CCFF00"
                strokeWidth="1.5"
                className="transition-all duration-300"
              />
            </svg>
          </div>

          {/* Latency Sparkline */}
          <div className="flex items-center space-x-1.5 text-[9.5px] text-slate-455 font-bold font-mono">
            <span>LATENCY</span>
            <span className="font-black text-[#00F5FF] font-mono leading-none">{latencyCurrent}ms</span>
            <svg width="45" height="15" className="overflow-visible select-none shrink-0">
              <path
                d={latencyPath || ""}
                 fill="none"
                stroke="#00F5FF"
                strokeWidth="1.5"
                className="transition-all duration-300"
              />
            </svg>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-mono hidden xl:block">
          NET: {telemetryStore?.systemMetrics?.ioSpeed || "120 MB/s"}
        </div>
      </div>
    </footer>
  );
}
