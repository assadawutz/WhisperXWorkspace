import React, { useRef, useState, useEffect } from "react";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { Upload, Search, ShieldCheck, Database, Save, RotateCcw, RotateCw, ExternalLink, Settings, Sparkles, Activity } from "lucide-react";
import { Command } from "cmdk";

export function TopBar() {
  const {
    sourceFiles,
    activeFileId,
    activeTab,
    jobs,
    addSourceFile,
    addJob,
    updateJob,
    addCommentToReview,
    updateReadinessReport,
    setActiveFileId,
    setActiveTab,
    createSnapshot
  } = useWorkspaceStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Globally capture Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Quick file intake uploader via API pipeline
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    const jobId = `job-upload-${Date.now()}`;
    addJob({
      id: jobId,
      name: `OCR Analytics Ingestion: ${file.name}`,
      status: "running",
      progress: 25,
      log: "Connecting to secure upload proxy...",
    });

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result?.toString().split(",")[1] || "";

        updateJob(jobId, { progress: 60, log: "Starting high-precision block layout extraction..." });

        const res = await fetch("/api/upload-analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            size: file.size,
            type: file.type || "application/octet-stream",
            rawContent: base64Data,
          }),
        });

        if (!res.ok) throw new Error("Server analysis failed");

        const data = await res.json();
        
        // Add parsed file record, review items, and compliance report to the store states
        addSourceFile(data.fileRecord);
        addCommentToReview(data.fileRecord.id, "Auto OCR system completed layout mapping.", "System Intake");
        updateReadinessReport(data.fileRecord.id, data.readinessReport);

        updateJob(jobId, {
          status: "completed",
          progress: 100,
          log: `Success. Extracted ${data.fileRecord.summary.keyPoints.length} key points. Clean text mapped.`,
        });

        setUploadLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      updateJob(jobId, {
        status: "failed",
        progress: 100,
        log: `Error: ${err.message || "Failed to parse"}`,
      });
      setUploadLoading(false);
    }
  };

  return (
    <header className="h-16 border-b border-white/10 bg-[#151921] px-6 flex items-center justify-between z-30 shrink-0 relative">
      {/* Workspace Identity Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">W</div>
          <span className="font-semibold text-sm tracking-tight text-white">
            Whisper<span className="text-blue-500 font-bold">X</span>Workspace
          </span>
        </div>
        <div className="h-6 w-px bg-white/10 ml-1 hidden sm:block"></div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] text-slate-400">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>Syncing: Gemini-2.0-Flash</span>
        </div>
      </div>

      {/* Interactive Command Palette Search Bar Trigger */}
      <div className="hidden md:flex flex-1 max-w-sm mx-6 relative font-sans">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-[#1e293b]/45 border border-white/10 rounded-xl pl-3.5 pr-4 py-2 text-xs text-slate-400 hover:border-white/20 transition-all flex items-center justify-between cursor-pointer text-left focus:outline-none"
        >
          <div className="flex items-center gap-2.5">
            <Search size={14} className="text-slate-500" />
            <span>Search workspace records & files...</span>
          </div>
          <span className="text-[10px] font-mono tracking-widest bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-500 select-none">⌘K</span>
        </button>

        {/* CMD+K OVERLAY MODAL */}
        {isOpen && (
          <div className="fixed inset-0 bg-[#06080d]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            {/* Backdrop click to dismiss */}
            <div className="absolute inset-0 z-0" onClick={() => setIsOpen(false)} />
            
            <div className="relative w-full max-w-xl bg-[#121620] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 font-sans text-left animate-fade-in">
              <Command className="w-full focus:outline-none">
                
                {/* Search Input bar */}
                <div className="flex items-center px-4 border-b border-white/10 h-13 gap-2.5 bg-[#161a25]">
                  <Search size={16} className="text-blue-400 shrink-0" />
                  <Command.Input
                    placeholder="Type to search files, OCR data, systems or pages..."
                    className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none h-full outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-[9px] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-400 tracking-wider hover:text-white"
                  >
                    ESC
                  </button>
                </div>

                {/* Dropdown records lists */}
                <Command.List className="max-h-80 overflow-y-auto p-2.5 space-y-1.5 bg-[#0e121a]">
                  <Command.Empty className="text-xs text-slate-500 p-6 text-center italic">
                    No matching workspace files, logs, or tools detected.
                  </Command.Empty>

                  {/* NAVIGATION TABS GROUP */}
                  <Command.Group 
                    heading="workspace navigation shortcuts" 
                    className="text-[9.5px] font-mono text-slate-500 uppercase tracking-widest px-2.5 py-2 font-bold block"
                  >
                    <Command.Item
                      onSelect={() => {
                        setActiveTab("home");
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/5 cursor-pointer select-none aria-selected:bg-blue-600 aria-selected:text-white"
                    >
                      <span className="text-sm">🏠</span>
                      <div className="flex-1">
                        <span className="font-semibold block">XHome Dashboard</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">Registry hub, recent OCR streams, stats</span>
                      </div>
                    </Command.Item>

                    <Command.Item
                      onSelect={() => {
                        setActiveTab("agent");
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/5 cursor-pointer select-none aria-selected:bg-blue-600 aria-selected:text-white"
                    >
                      <span className="text-sm">💬</span>
                      <div className="flex-1">
                        <span className="font-semibold block">WhisperX Agents Gallery</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">Chat and multi-agent pipeline orchestration</span>
                      </div>
                    </Command.Item>

                    <Command.Item
                      onSelect={() => {
                        setActiveTab("doc");
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/5 cursor-pointer select-none aria-selected:bg-blue-600 aria-selected:text-white"
                    >
                      <span className="text-sm">📝</span>
                      <div className="flex-1">
                        <span className="font-semibold block">XDoc Editor Hub</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">Tabs for Docs, Sheets ledger, and Slide deck presentation</span>
                      </div>
                    </Command.Item>

                    <Command.Item
                      onSelect={() => {
                        setActiveTab("tools");
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/5 cursor-pointer select-none aria-selected:bg-blue-600 aria-selected:text-white"
                    >
                      <span className="text-sm">⚙️</span>
                      <div className="flex-1">
                        <span className="font-semibold block">XTools Visual Studio</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">React Flow Mascot editor, drawing board, playgrounds</span>
                      </div>
                    </Command.Item>

                    <Command.Item
                      onSelect={() => {
                        setActiveTab("settings");
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/5 cursor-pointer select-none aria-selected:bg-blue-600 aria-selected:text-white"
                    >
                      <span className="text-sm">🔧</span>
                      <div className="flex-1">
                        <span className="font-semibold block">XSettings Control Center</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">API Providers selector config, health metrics</span>
                      </div>
                    </Command.Item>
                  </Command.Group>

                  {/* SOURCE FILES INDEX */}
                  {sourceFiles.length > 0 && (
                    <Command.Group 
                      heading="Ingested Documents Index" 
                      className="text-[9.5px] font-mono text-slate-500 uppercase tracking-widest px-2.5 py-2 font-bold block pt-3 border-t border-white/5"
                    >
                      {sourceFiles.map((f) => (
                        <Command.Item
                          key={f.id}
                          value={f.name}
                          onSelect={() => {
                            setActiveFileId(f.id);
                            setActiveTab("doc");
                            setIsOpen(false);
                          }}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/5 cursor-pointer select-none aria-selected:bg-blue-600 aria-selected:text-white"
                        >
                          <div className="flex items-center gap-2 truncate max-w-[340px]">
                            <span className="text-slate-450 text-[13px]">📄</span>
                            <div className="truncate text-left">
                              <span className="font-semibold block truncate">{f.name}</span>
                              <span className="text-[9.5px] text-slate-500 truncate block font-serif italic">
                                {f.extractedText ? f.extractedText.slice(0, 70) : "No OCR metadata content loaded."}
                              </span>
                            </div>
                          </div>
                          <span className="text-[8.5px] bg-indigo-950 text-indigo-400 border border-white/5 font-mono py-0.5 px-1.5 rounded uppercase font-bold shrink-0">Open</span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}

                  {/* ACTIVE JOBS telemetry indicators */}
                  {jobs.length > 0 && (
                    <Command.Group 
                      heading="Telemetry Jobs queue" 
                      className="text-[9.5px] font-mono text-slate-500 uppercase tracking-widest px-2.5 py-2 font-bold block pt-3 border-t border-white/5"
                    >
                      {jobs.map((j) => (
                        <Command.Item
                          key={j.id}
                          value={j.name}
                          onSelect={() => setIsOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/5 select-none aria-selected:bg-slate-800"
                        >
                          <div className="flex items-center gap-2 truncate max-w-[340px]">
                            <span className="text-[13px]">⚙️</span>
                            <div className="truncate text-left">
                              <span className="font-medium block truncate-ellipsis">{j.name}</span>
                              <span className="text-[9.5px] font-mono text-slate-500 block leading-none mt-0.5">{j.log || "Awaiting task execution..."}</span>
                            </div>
                          </div>
                          <div className="shrink-0 pl-1">
                            <span className={`text-[8px] border font-mono font-bold tracking-wide py-0.5 px-1.5 rounded uppercase ${
                              j.status === "running" ? "bg-amber-950/40 border-amber-500/20 text-amber-400" :
                              j.status === "completed" ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-450" :
                              "bg-rose-955/40 border-rose-500/20 text-rose-450"
                            }`}>
                              {j.status}
                            </span>
                          </div>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}

                </Command.List>
              </Command>
            </div>
          </div>
        )}
      </div>

      {/* Action Pipeline Tools */}
      <div className="flex items-center space-x-3">
        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center space-x-1.5 border-r border-white/10 pr-3 mr-1">
          <button
            onClick={() => createSnapshot("Restore Point Undo")}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors"
            title="Create undo snapshot"
          >
            <RotateCcw size={14} />
          </button>
          <button
            className="p-1.5 text-slate-600 cursor-not-allowed rounded"
            title="Redo state"
            disabled
          >
            <RotateCw size={14} />
          </button>
        </div>

        {/* Quick Ingest / Upload Trigger */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.txt,.json,.csv"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadLoading}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-550 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-lg shadow-blue-500/15 active:scale-95 transition-all cursor-pointer"
        >
          {uploadLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          <span>{uploadLoading ? "Analyzing..." : "Quick Intake"}</span>
        </button>

        {/* Snapshot Save Trigger */}
        <button
          onClick={() => createSnapshot(`Manual Backup ${new Date().toLocaleTimeString()}`)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors relative"
          title="Create Snapshot"
        >
          <Database size={15} />
        </button>

        {/* Status indicator */}
        <div className="hidden md:flex items-center space-x-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] text-slate-450 font-mono tracking-wider">SYNC COMPLETED</span>
        </div>
      </div>
    </header>
  );
}
