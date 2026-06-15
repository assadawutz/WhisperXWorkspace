import React, { useState } from "react";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { Info, HelpCircle, Tags, ClipboardCheck, ShieldAlert, FileSignature, MessageSquarePlus, MessageSquareCode, Badge } from "lucide-react";

export function Inspector() {
  const {
    sourceFiles,
    activeFileId,
    reviewRecords,
    readinessReports,
    addCommentToReview,
    updateReviewStatus,
  } = useWorkspaceStore();

  const [commentText, setCommentText] = useState("");
  const activeFile = sourceFiles.find((f) => f.id === activeFileId);
  const activeReview = activeFile ? reviewRecords[activeFile.id] : null;
  const activeReport = activeFile ? readinessReports[activeFile.id] : null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFile || !commentText.trim()) return;

    addCommentToReview(activeFile.id, commentText, "User Analyst");
    setCommentText("");
  };

  if (!activeFile) {
    return (
      <aside className="w-80 border-l border-white/10 bg-[#0F1117] p-6 flex flex-col justify-center items-center text-center text-slate-500 text-xs shrink-0">
        <Info size={28} className="mb-2 text-blue-500 animate-pulse" />
        <p className="font-semibold text-slate-300">Inspector Stasis</p>
        <p className="mt-1">Ingest or open a registry file inside XHome intake hub to map active systems variables.</p>
      </aside>
    );
  }

  return (
    <aside className="w-80 border-l border-white/10 bg-[#0F1117] flex flex-col shrink-0 overflow-y-auto z-25 text-xs text-slate-300">
      {/* Tab/Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#151921]">
        <span className="font-bold text-slate-200 uppercase tracking-widest text-[10px] flex items-center gap-1.5 font-mono">
          <FileSignature size={14} className="text-blue-400" /> FILE INSPECTOR
        </span>
        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-blue-400 font-mono">
          ID: {activeFile.id.substring(0, 8)}
        </span>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Section 1: File Properties */}
        <div className="space-y-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold">Metadata Specs</p>
          <div className="bg-white/5 border border-white/10 p-3 rounded-lg space-y-2 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Name:</span>
              <span className="text-indigo-300 truncate max-w-[150px]" title={activeFile.name}>{activeFile.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Author:</span>
              <span className="text-slate-300 truncate max-w-[150px]">{activeFile.metadata.author || "Unknown"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Size:</span>
              <span className="text-slate-300">{(activeFile.size / 1024).toFixed(1)} KB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Type:</span>
              <span className="text-slate-300 truncate max-w-[150px]">{activeFile.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Words Analyzed:</span>
              <span className="text-emerald-450">{activeFile.metadata.wordCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Extracted Machine Entities */}
        <div className="space-y-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold">Classified Entities</p>
          <div className="flex flex-wrap gap-1.5">
            {activeFile.entities && activeFile.entities.length > 0 ? (
              activeFile.entities.map((en) => (
                <div
                  key={en.id}
                  className="flex items-center gap-1 bg-indigo-950/40 border border-indigo-900/60 px-2 py-1 rounded text-[11px] hover:border-indigo-500 transition-colors"
                >
                  <Tags size={10} className="text-indigo-400" />
                  <span className="font-semibold text-slate-200">{en.name}</span>
                  <span className="text-[9px] text-indigo-400/80 font-mono">({en.type})</span>
                </div>
              ))
            ) : (
              <p className="italic text-slate-500">No entities identified on schema.</p>
            )}
          </div>
        </div>

        {/* Section 3: Readiness Score Audit */}
        {activeReport && (
          <div className="space-y-2 border-t border-slate-900 pt-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold">Readiness Score</p>
            <div className="bg-slate-900/30 border border-slate-800 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-300">System Integration Checklist</span>
                <span className={`text-sm font-bold font-mono ${
                  activeReport.score >= 90 ? "text-emerald-400" : activeReport.score >= 75 ? "text-amber-400" : "text-rose-400"
                }`}>
                  {activeReport.score}/100
                </span>
              </div>
              
              {/* Progress visual bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full mb-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeReport.score >= 90 ? "bg-emerald-500" : activeReport.score >= 75 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${activeReport.score}%` }}
                />
              </div>

              {/* Blockers */}
              {activeReport.blockers.length > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-center text-amber-500 font-semibold gap-1 font-mono text-[10px]">
                    <ShieldAlert size={12} /> BLOCKERS FOUND ({activeReport.blockers.length})
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400 pl-1 text-[10px]">
                    {activeReport.blockers.map((bl, i) => (
                      <li key={i}>{bl}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-[10px] text-emerald-400 font-semibold font-mono flex items-center gap-1">
                  ✓ NO BLOCKERS DISCOVERED
                </p>
              )}
            </div>
          </div>
        )}

        {/* Section 4: System Ingestion Reviews */}
        {activeReview && (
          <div className="space-y-2 border-t border-white/10 pt-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold">Workspace Audit Review</p>
            <div className="space-y-2">
              <div className="flex gap-1">
                {["pending", "approved", "rejected"].map((st) => (
                  <button
                    key={st}
                    onClick={() => updateReviewStatus(activeFile.id, st as any)}
                    className={`flex-1 py-1 px-2 rounded font-mono font-medium text-[9px] uppercase tracking-wider text-center border transition-all cursor-pointer ${
                      activeReview.status === st
                        ? st === "approved"
                          ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.1)]"
                          : st === "rejected"
                          ? "bg-rose-950/60 text-rose-400 border-rose-500/60"
                          : "bg-amber-950/60 text-amber-400 border-amber-500/60"
                        : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Comments feedback loops */}
              <div className="space-y-2 max-h-40 overflow-y-auto border-t border-white/10 pt-2">
                {activeReview.comments.map((cmt) => (
                  <div key={cmt.id} className="bg-white/5 p-2 rounded border border-white/10 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-semibold text-blue-450">{cmt.author}</span>
                      <span className="font-mono text-[9px]">{new Date(cmt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300">{cmt.text}</p>
                  </div>
                ))}
              </div>

              {/* Comment submission form */}
              <form onSubmit={handleAddComment} className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder="Record comment..."
                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-blue-500"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded px-2 md:px-3 text-[11px] tracking-wide active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  <MessageSquarePlus size={13} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
