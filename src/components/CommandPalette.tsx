import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useWorkspaceStore, ORCHESTRATION_AGENTS } from "../stores/workspaceStore";
import { Search, File, Terminal, ArrowRight, Settings, Layout, Home, MessageSquare, Compass, Bot } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { 
    sourceFiles, 
    artifacts, 
    setActiveTab, 
    setActiveDocSubTab, 
    setActiveFileId,
    setActiveAgentId,
    addToast 
  } = useWorkspaceStore() as any;

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Filter items in real time based on user query
  const query = search.toLowerCase();
  
  const filteredFiles = sourceFiles.filter((f: any) => 
    f.name.toLowerCase().includes(query) || 
    (f.extractedText && f.extractedText.toLowerCase().includes(query)) ||
    (f.content && f.content.toLowerCase().includes(query))
  );

  const filteredArtifacts = artifacts.filter((a: any) => 
    a.title.toLowerCase().includes(query) || 
    a.type.toLowerCase().includes(query) || 
    (a.data && a.data.toLowerCase().includes(query))
  );

  const filteredAgents = (ORCHESTRATION_AGENTS || []).filter((a: any) =>
    a.id.toLowerCase().includes(query) ||
    a.name.toLowerCase().includes(query) ||
    a.role.toLowerCase().includes(query) ||
    a.persona.toLowerCase().includes(query) ||
    a.skills.some((sk: string) => sk.toLowerCase().includes(query))
  );

  const handleNavigate = (tab: any, fileId?: string, isDocSubtab?: any) => {
    setActiveTab(tab);
    if (fileId) {
      setActiveFileId(fileId);
    }
    if (isDocSubtab) {
      setActiveDocSubTab(isDocSubtab);
    }
    setOpen(false);
    addToast(`Navigated to ${tab.toUpperCase()} ${fileId ? `→ file: ${fileId}` : ""}`, "success");
  };

  const handleSelectAgent = (agentId: string) => {
    setActiveTab("agent");
    setActiveAgentId(agentId);
    setOpen(false);
    addToast(`Routed channel focus to Agent: ${agentId}`, "success");
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={() => setOpen(false)}
    >
      <div 
        className="bg-[#0b0b12] border-3 border-[#CCFF00] rounded-none w-full max-w-xl shadow-[8px_8px_0_rgba(0,0,0,1)] flex flex-col overflow-hidden font-mono text-xs max-h-[460px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b-2 border-white/10 px-4 py-3.5 bg-white/5">
          <Search size={16} className="text-[#CCFF55]" />
          <input
            autoFocus
            placeholder="Type a command, file name, or artifact content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent flex-1 focus:outline-none text-white font-mono placeholder-slate-500 text-xs"
          />
          <span className="text-[9px] bg-[#CCFF00] text-black px-1.5 py-0.5 font-bold uppercase border border-black">
            ESC TO EXIT
          </span>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-4">
          {/* Default Navigation shortcuts */}
          {!search && (
            <div className="space-y-1">
              <span className="text-[9px] px-2 text-[#00F5FF] font-bold uppercase tracking-widest">QUICK NAVIGATE</span>
              <div className="grid grid-cols-2 gap-1 p-1">
                <button 
                  onClick={() => handleNavigate("home")}
                  className="flex items-center gap-2 text-left p-2 hover:bg-[#CCFF00] hover:text-black transition-colors rounded-none text-slate-300"
                >
                  <Home size={14} /> <span>Home Intake Dashboard</span>
                </button>
                <button 
                  onClick={() => handleNavigate("agent")}
                  className="flex items-center gap-2 text-left p-2 hover:bg-[#00F5FF] hover:text-black transition-colors rounded-none text-slate-300"
                >
                  <MessageSquare size={14} /> <span>WhisperX Personal Agent</span>
                </button>
                <button 
                  onClick={() => handleNavigate("doc")}
                  className="flex items-center gap-2 text-left p-2 hover:bg-[#B44FFF] hover:text-white transition-colors rounded-none text-slate-300"
                >
                  <Layout size={14} /> <span>XDoc Unified Editors</span>
                </button>
                <button 
                  onClick={() => handleNavigate("tools")}
                  className="flex items-center gap-2 text-left p-2 hover:bg-[#FF2D78] hover:text-white transition-colors rounded-none text-slate-300"
                >
                  <Compass size={14} /> <span>XTools Design Studio</span>
                </button>
              </div>
            </div>
          )}

          {/* Source files results */}
          <div className="space-y-1.5">
            <span className="text-[9px] px-2 text-[#CCFF00] font-bold uppercase tracking-widest">
              FILES ({filteredFiles.length})
            </span>
            {filteredFiles.length === 0 ? (
              <p className="text-[10px] px-2 text-slate-500 italic">No files matched search</p>
            ) : (
              <div className="space-y-0.5">
                {filteredFiles.map((file: any) => (
                  <button
                    key={file.id}
                    onClick={() => handleNavigate("home", file.id)}
                    className="w-full text-left p-2 hover:bg-white/5 active:bg-white/10 text-slate-300 hover:text-white flex items-center justify-between transition-colors border border-transparent hover:border-white/10"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <File size={13} className="text-[#00F5FF] shrink-0" />
                      <span className="truncate font-bold text-[11px]">{file.name}</span>
                    </div>
                    <span className="text-[9px] text-[#00F5FF]/60 shrink-0 uppercase font-bold">
                      {(file.size / 1024).toFixed(0)}KB • SELECT 
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Artifacts results */}
          <div className="space-y-1.5">
            <span className="text-[9px] px-2 text-[#FF2D78] font-bold uppercase tracking-widest">
              WORKSPACE ARTIFACTS ({filteredArtifacts.length})
            </span>
            {filteredArtifacts.length === 0 ? (
              <p className="text-[10px] px-2 text-slate-500 italic">No artifacts matched search</p>
            ) : (
              <div className="space-y-0.5">
                {filteredArtifacts.map((art: any) => (
                  <button
                    key={art.id}
                    onClick={() => handleNavigate("tools")}
                    className="w-full text-left p-2 hover:bg-white/5 active:bg-white/10 text-slate-300 hover:text-white flex items-center justify-between transition-colors border border-transparent hover:border-white/10"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Terminal size={13} className="text-[#FF2D78] shrink-0" />
                      <span className="truncate font-bold text-[11px]">{art.title}</span>
                    </div>
                    <span className="text-[9px] text-pink-400/70 border border-pink-500/30 px-1 py-0.2 uppercase shrink-0 font-bold">
                      {art.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Agent Nodes results */}
          <div className="space-y-1.5">
            <span className="text-[9px] px-2 text-[#00F5FF] font-bold uppercase tracking-widest">
              CO-GHOST AGENT NODES ({filteredAgents.length})
            </span>
            {filteredAgents.length === 0 ? (
              <p className="text-[10px] px-2 text-slate-500 italic">No agents matched search</p>
            ) : (
              <div className="space-y-0.5">
                {filteredAgents.map((ag: any) => (
                  <button
                    key={ag.id}
                    onClick={() => handleSelectAgent(ag.id)}
                    className="w-full text-left p-2 hover:bg-[#00F5FF]/10 active:bg-white/10 text-slate-200 hover:text-white flex items-center justify-between transition-colors border border-transparent hover:border-[#00F5FF]/20"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm select-none p-1 bg-black/60 rounded border border-white/5 shrink-0">{ag.avatar}</span>
                      <div className="truncate leading-tight text-left">
                        <span className="font-bold text-[11px] text-[#00F5FF] block">{ag.id} / {ag.name}</span>
                        <span className="text-[8.5px] text-slate-500 block truncate max-w-[280px] font-mono">{ag.role}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-[#00F5FF] border border-[#00F5FF]/30 px-1.5 py-0.5 uppercase shrink-0 font-bold bg-[#00F5FF]/5 rounded">
                      ROUTE Focus
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#CCFF00]/5 border-t-2 border-white/10 p-3 flex justify-between items-center text-[10px] text-slate-400">
          <span>Search documents, agents, metrics, and workspace code blocks.</span>
          <span className="text-white text-[9.5px]">◄ Enter to Nav</span>
        </div>
      </div>
    </div>
  );
}
