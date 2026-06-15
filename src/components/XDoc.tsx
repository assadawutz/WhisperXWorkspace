import React, { useState, useRef, useEffect } from "react";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { SourceFileRecord } from "../types";
import { 
  Sparkles, 
  FileText, 
  Layout, 
  Grid, 
  Bold, 
  Italic, 
  Link2, 
  Download, 
  Table, 
  Trash, 
  Plus, 
  FileSpreadsheet, 
  Eye, 
  Presentation, 
  RefreshCw 
} from "lucide-react";

// ====================================================
// REUSABLE INTERSECTION OBSERVER FOR SCROLL REVEAL
// ====================================================
function useScrollObserver() {
  const domRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-slide-in");
            entry.target.classList.remove("opacity-0");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" }
    );

    const currentElem = domRef.current;
    if (currentElem) {
      const targets = currentElem.querySelectorAll(".reveal-section");
      if (targets.length > 0) {
        targets.forEach((t) => {
          t.classList.add("opacity-0");
          observer.observe(t);
        });
      } else {
        currentElem.classList.add("opacity-0");
        observer.observe(currentElem);
      }
    }

    return () => {
      if (currentElem) {
        const targets = currentElem.querySelectorAll(".reveal-section");
        targets.forEach((t) => observer.unobserve(t));
        observer.unobserve(currentElem);
      }
    };
  }, []);

  return domRef;
}

export function XDoc() {
  const {
    sourceFiles,
    activeFileId,
    setActiveFileId,
    updateSourceFile,
    activeDocSubTab,
    setActiveDocSubTab,
    sheetData,
    updateSheetData,
    deck,
    updateDeck,
    addToast,
    saveDocumentVersion,
    restoreDocumentVersion
  } = useWorkspaceStore() as any;

  const revealRef = useScrollObserver();

  const activeFile = sourceFiles.find((f: any) => f.id === activeFileId);
  const [editorText, setEditorText] = useState(activeFile?.extractedText || "");
  const [historyOpen, setHistoryOpen] = useState(true);
  const [newVersionLabel, setNewVersionLabel] = useState("");

  // Local editing sync handler for Docs
  const handleSaveDocContent = () => {
    if (!activeFile) return;
    updateSourceFile(activeFile.id, { extractedText: editorText });
    addToast("Extracted document paragraph changes synced to core text memory!", "success");
  };

  // Reset local state if active file id shifts
  React.useEffect(() => {
    if (activeFile) {
      setEditorText(activeFile.extractedText || activeFile.content || "");
    }
  }, [activeFileId, activeFile]);

  // Sheets variables
  const [editingCell, setEditingCell] = useState<{ rIdx: number; colName: string } | null>(null);
  const [cellValue, setCellValue] = useState("");

  const handleStartCellEdit = (rIdx: number, colName: string, val: string) => {
    setEditingCell({ rIdx, colName });
    setCellValue(val);
  };

  const handleSaveCellEdit = () => {
    if (!editingCell) return;
    const updatedRows = [...sheetData.rows];
    updatedRows[editingCell.rIdx] = {
      ...updatedRows[editingCell.rIdx],
      [editingCell.colName]: cellValue,
    };
    updateSheetData({ columns: sheetData.columns, rows: updatedRows });
    addToast(`Synced ledger cell [Row ${editingCell.rIdx + 1}, ${editingCell.colName}]`, "success");
    setEditingCell(null);
  };

  const handleAddNewRow = () => {
    const newRow = sheetData.columns.reduce((acc: any, col: string) => {
      acc[col] = col === "System ID" ? `SYS-${Math.floor(Math.random() * 900) + 100}` : "NEW SPEC DETAILS";
      return acc;
    }, {} as Record<string, any>);
    updateSheetData({ columns: sheetData.columns, rows: [...sheetData.rows, newRow] });
    addToast("New register item appended to Ledger matrix", "success");
  };

  // Slides / Presentation editing states
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const currentSlide = deck.slides[activeSlideIdx] || deck.slides[0];

  const handleUpdateSlideTitle = (title: string) => {
    const updatedSlides = [...deck.slides];
    if (updatedSlides[activeSlideIdx]) {
      updatedSlides[activeSlideIdx] = { ...updatedSlides[activeSlideIdx], title };
      updateDeck({ ...deck, slides: updatedSlides });
    }
  };

  const handleUpdateSlidePoints = (index: number, val: string) => {
    const updatedSlides = [...deck.slides];
    if (updatedSlides[activeSlideIdx]) {
      const updatedPts = [...updatedSlides[activeSlideIdx].bulletPoints];
      updatedPts[index] = val;
      updatedSlides[activeSlideIdx] = {
        ...updatedSlides[activeSlideIdx],
        bulletPoints: updatedPts,
      };
      updateDeck({ ...deck, slides: updatedSlides });
    }
  };

  const handleAddNewSlide = () => {
    const newSlide = {
      id: `sl-${Date.now()}`,
      title: "New Dynamic System Slide",
      bulletPoints: ["Insert system metrics core details.", "Verify status checks via ARIA router."],
      layout: "split" as const,
      background: "bg-slate-900",
    };
    updateDeck({ ...deck, slides: [...deck.slides, newSlide] });
    setActiveSlideIdx(deck.slides.length);
    addToast("New presentation item slide added!", "success");
  };

  return (
    <div ref={revealRef} className="flex-grow flex flex-col min-h-[500px] bg-[#03040A] text-left overflow-x-hidden">
      
      {/* Tab Selector sub bar */}
      <div className="py-2.5 border-b-2 border-black bg-[#0b0b12] px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap gap-1.5 font-mono">
          <button
            onClick={() => {
              setActiveDocSubTab("docs");
              addToast("Loaded XDocs editor", "info");
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-[10px] font-bold uppercase transition-all duration-150 border-2 border-black cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] ${
              activeDocSubTab === "docs"
                ? "bg-[#CCFF00] text-black"
                : "bg-[#121620] text-slate-400 hover:text-white"
            }`}
          >
            <FileText size={12} />
            <span>XDocs Editor</span>
          </button>
          
          <button
            onClick={() => {
              setActiveDocSubTab("sheets");
              addToast("Loaded XSheets balance", "info");
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-[10px] font-bold uppercase transition-all duration-150 border-2 border-black cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] ${
              activeDocSubTab === "sheets"
                ? "bg-[#00F5FF] text-black"
                : "bg-[#121620] text-slate-400 hover:text-white"
            }`}
          >
            <Grid size={12} />
            <span>XSheets Ledger</span>
          </button>
          
          <button
            onClick={() => {
              setActiveDocSubTab("slides");
              addToast("Loaded XSlides storyboard", "info");
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-[10px] font-bold uppercase transition-all duration-150 border-2 border-black cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] ${
              activeDocSubTab === "slides"
                ? "bg-[#FF2D78] text-white"
                : "bg-[#121620] text-slate-400 hover:text-white"
            }`}
          >
            <Layout size={12} />
            <span>XSlides Deck</span>
          </button>
        </div>

        {/* Selected file link */}
        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
          <span className="text-[9.5px] font-bold text-slate-500 uppercase">CONTEXT TARGET:</span>
          {activeFile ? (
            <span className="text-white font-bold flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5">
              <FileSpreadsheet size={12} className="text-[#CCFF00]" /> {activeFile.name}
            </span>
          ) : (
            <span className="italic text-slate-600 bg-white/2 px-2 py-0.5 border border-white/5">No active context</span>
          )}
        </div>
      </div>

      {/* Main workspace editor container */}
      <div className="flex-grow overflow-hidden flex flex-col min-h-0">
        
        {/* --- 1. XDOCS TEXT/MARKDOWN EDITOR --- */}
        {activeDocSubTab === "docs" && (
          <div className="flex-grow flex flex-col min-h-0 space-y-4 p-4 md:p-6 reveal-section transition-all duration-300">
            {/* Toolbar Docs mockup */}
            <div className="h-12 bg-[#0b0b12] border-3 border-black p-4 flex items-center justify-between shrink-0 shadow-[4px_4px_0_rgba(0,0,0,1)]">
              <div className="flex items-center space-x-3 text-slate-400 font-mono">
                <button 
                  className="p-1 hover:text-[#CCFF00] hover:bg-white/5 border border-transparent hover:border-white/10 text-xs font-bold cursor-pointer" 
                  onClick={() => setEditorText(editorText + " **Bold Text**")}
                >
                  <Bold size={13} />
                </button>
                <button 
                  className="p-1 hover:text-[#00F5FF] hover:bg-white/5 border border-transparent hover:border-white/10 text-xs font-bold cursor-pointer" 
                  onClick={() => setEditorText(editorText + " *Italics*")}
                >
                  <Italic size={13} />
                </button>
                <button 
                  className="p-1 hover:text-[#FF2D78] hover:bg-white/5 border border-transparent hover:border-white/10 text-xs font-bold cursor-pointer" 
                  onClick={() => setEditorText(editorText + " [Hyperlink](https://...)")}
                >
                  <Link2 size={13} />
                </button>
                <span className="w-px h-4 bg-white/10" />
                <button
                  type="button"
                  onClick={() => {
                    setHistoryOpen(!historyOpen);
                    addToast(historyOpen ? "Collapsed version checkpoints browser" : "Expanded version checkpoints browser", "info");
                  }}
                  className={`px-2 py-0.5 text-[9px] font-bold border-2 border-black transition-all font-mono uppercase cursor-pointer shadow-[1px_1px_0_rgba(0,0,0,1)] hover:bg-white hover:text-black ${
                    historyOpen 
                      ? "bg-[#00F5FF] text-black" 
                      : "bg-slate-950 text-slate-400"
                  }`}
                >
                  History {historyOpen ? "ON" : "OFF"}
                </button>
                <span className="w-px h-4 bg-white/10" />
                <span className="text-[10px] text-slate-500 hidden xl:inline">Markdown shortcuts active</span>
              </div>

              <button
                onClick={handleSaveDocContent}
                disabled={!activeFile}
                className="bg-[#CCFF00] text-black border-2 border-black font-mono font-black text-[10px] uppercase px-3.5 py-1 shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px ] flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shrink-0"
              >
                <RefreshCw size={11} /> 
                <span>Save Text Core</span>
              </button>
            </div>

            {/* Split layout: main document text editor Left + version snapshots right */}
            <div className="flex-grow flex flex-col xl:flex-row gap-5 min-h-0">
              {/* Left Column: Docs Content Text Area */}
              <div className="flex-1 bg-[#0b0b12] border-3 border-black p-5 flex flex-col shadow-[4px_4px_0_rgba(0,0,0,1)] min-h-[260px]">
                <textarea
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                  placeholder="Synchronize document parameters here. When files pass OCR checking, editing their raw text directly populates our vector states instantly."
                  className="w-full flex-grow bg-transparent text-slate-100 placeholder-slate-700 focus:outline-none resize-none font-mono text-xs leading-relaxed outline-none border-none h-full"
                />
              </div>

              {/* Right Column: Checkpoint Version Browser */}
              {historyOpen && (
                <div className="w-full xl:w-[280px] shrink-0 bg-[#0b0b12] border-3 border-black p-4 shadow-[4px_4px_0_rgba(0,0,0,1)] flex flex-col space-y-3.5 font-mono text-xs min-h-0 overflow-y-auto">
                  <div className="border-b-2 border-black pb-2.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-black tracking-widest text-[#00F5FF] uppercase">
                        REVISION PORTAL
                      </h4>
                      <p className="text-[8px] text-slate-500 mt-0.5">Restore document state checkpoints</p>
                    </div>
                    <span className="text-[8.5px] font-bold bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30 px-1.5 py-0.5 leading-none">
                      {(activeFile?.versions?.length || 0)} Saved
                    </span>
                  </div>

                  {activeFile ? (
                    <>
                      {/* Create Snapshot Trigger Container */}
                      <div className="bg-[#03040A] p-2.5 border-2 border-black space-y-1.5">
                        <span className="text-[8.5px] uppercase text-slate-400 font-extrabold block">
                          Tag New revision:
                        </span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Snapshot label..."
                            value={newVersionLabel}
                            onChange={(e) => setNewVersionLabel(e.target.value)}
                            className="bg-black border border-black focus:border-[#CCFF00] text-[9.5px] text-white px-2 py-1 focus:outline-none w-full font-mono shrink-0 min-w-0"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!editorText.trim()) {
                                addToast("Cannot checkpoint an empty document text core!", "warn");
                                return;
                              }
                              // Save checkpoint version
                              saveDocumentVersion(activeFile.id, newVersionLabel);
                              setNewVersionLabel("");
                              addToast("Secure document checkpoint serialized!", "success");
                            }}
                            className="bg-[#CCFF00] text-black border border-black hover:bg-white px-2.5 py-1 text-[9px] font-extrabold uppercase shrink-0 transition-all active:scale-95 cursor-pointer"
                          >
                            TAG
                          </button>
                        </div>
                      </div>

                      {/* Snapshots Scrollable Listing */}
                      <div className="space-y-2 max-h-[220px] xl:max-h-none overflow-y-auto pr-0.5 flex-1">
                        {(!activeFile.versions || activeFile.versions.length === 0) ? (
                          <div className="text-center text-slate-600 py-6 italic text-[9px]">
                            No checkpoints Cataloged on active file. Use &quot;TAG&quot; to build.
                          </div>
                        ) : (
                          activeFile.versions.map((ver: any) => (
                            <div 
                              key={ver.id}
                              className="bg-[#03040A] border-2 border-black p-3 space-y-1.5 hover:border-[#CCFF00] transition-colors text-left"
                            >
                              <div className="flex justify-between items-start gap-1">
                                <span className="font-extrabold text-[#00F5FF] text-[10px] truncate max-w-[150px] leading-tight block">
                                  {ver.label}
                                </span>
                                <span className="text-[7.5px] bg-[#121620] border border-white/5 text-slate-400 px-1 py-0.2 shrink-0">
                                  {ver.content ? ver.content.length : 0}B
                                </span>
                              </div>
                              <span className="text-[8px] text-slate-500 font-bold block">
                                {new Date(ver.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </span>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditorText(ver.content);
                                  restoreDocumentVersion(activeFile.id, ver.id);
                                  addToast(`Active document state rolled back to: ${ver.label}`, "success");
                                }}
                                className="w-full bg-[#121620] hover:bg-[#CCFF00] hover:text-black hover:border-black text-slate-300 font-bold text-[8.5px] py-1 border border-white/10 transition-all uppercase cursor-pointer text-center"
                              >
                                RESTORE REVISION
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-slate-600 py-10 italic">
                      No document context active.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- 2. INTERACTIVE SPREADSHEET LEDGER --- */}
        {activeDocSubTab === "sheets" && (
          <div className="flex-grow flex flex-col p-4 md:p-6 space-y-4 overflow-hidden text-left reveal-section transition-all duration-300">
            {/* Spreadsheet command utilities */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
              <h3 className="text-xs font-mono uppercase text-white font-bold tracking-wider flex items-center gap-1.5 bg-[#0b0b12] px-3.5 py-1.5 border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,1)]">
                <Table size={13} className="text-[#00F5FF]" /> Ledger matrix rows ({sheetData.rows.length})
              </h3>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddNewRow}
                  className="bg-[#121620] hover:bg-white/10 text-white border-2 border-black font-mono font-bold text-[10px] px-3 py-1.5 shadow-[2px_2px_0_rgba(0,0,0,1)] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={11} className="text-[#00F5FF]" /> ADD ROW DATA
                </button>

                <button
                  onClick={() => {
                    addToast(`Exporting ${sheetData.rows.length} records...`, "info");
                    setTimeout(() => {
                      addToast("Export finished! System state serialized to active JSON schema.", "success");
                    }, 1000);
                  }}
                  className="bg-[#00F5FF] text-black border-2 border-black font-mono font-black text-[10px] px-3.5 py-1.5 shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <Download size={11} /> 
                  <span>EXPORT SYSTEM MATRIX</span>
                </button>
              </div>
            </div>

            {/* Table wrapper layout */}
            <div className="flex-grow border-3 border-black bg-[#0b0b12] overflow-auto shadow-[4px_4px_0_rgba(0,0,0,1)]">
              <table className="w-full text-xs text-slate-300 text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-black bg-[#03040A] font-mono text-slate-400 uppercase text-[9.5px] tracking-wider select-none">
                    {sheetData.columns.map((col: string, idx: number) => (
                      <th key={idx} className="p-3 border-r-2 border-black font-extrabold">{col}</th>
                    ))}
                    <th className="p-3">DANGER ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black font-mono bg-[#0b0b12]">
                  {sheetData.rows.length === 0 ? (
                    <tr>
                      <td colSpan={sheetData.columns.length + 1} className="p-8 text-center text-slate-500 italic font-mono">
                        No rows recorded on active memory sheet. Click &apos;ADD ROW DATA&apos; above.
                      </td>
                    </tr>
                  ) : (
                    sheetData.rows.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-white/2 transition-colors">
                        {sheetData.columns.map((col: string, cIdx: number) => {
                          const isEditing = editingCell?.rIdx === rIdx && editingCell?.colName === col;
                          return (
                            <td
                              key={cIdx}
                              onClick={() => handleStartCellEdit(rIdx, col, row[col] || "")}
                              className="p-3 border-r-2 border-black cursor-pointer hover:bg-[#CCFF00]/5 transition-colors focus-within:bg-[#CCFF00]/10"
                            >
                              {isEditing ? (
                                <input
                                  type="text"
                                  className="w-full bg-[#03040A] border-2 border-[#CCFF00] text-white px-2 py-0.5 text-xs focus:outline-none font-mono font-medium"
                                  value={cellValue}
                                  onChange={(e) => setCellValue(e.target.value)}
                                  onBlur={handleSaveCellEdit}
                                  onKeyDown={(e) => e.key === "Enter" && handleSaveCellEdit()}
                                  autoFocus
                                />
                              ) : (
                                <span className={
                                  row[col] === "Medium" || row[col] === "Critical" 
                                    ? "text-[#FF2D78] font-bold" 
                                    : row[col] === "Passed" || row[col] === "Active" 
                                      ? "text-[#CCFF00] font-bold" 
                                      : "text-slate-200"
                                }>
                                  {row[col] || ""}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-3">
                          <button
                            onClick={() => {
                              const updated = [...sheetData.rows];
                              updated.splice(rIdx, 1);
                              updateSheetData({ columns: sheetData.columns, rows: updated });
                              addToast(`Discarded row index #${rIdx + 1}`, "warn");
                            }}
                            className="bg-rose-950/30 hover:bg-[#FF2D78] text-rose-450 hover:text-white border border-rose-800 hover:border-black font-mono font-bold text-[9px] uppercase px-2 py-0.5 cursor-pointer shadow-[1px_1px_0_rgba(0,0,0,1)]"
                          >
                            DUMP
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- 3. DYNAMIC SLIDES PRESENTATION --- */}
        {activeDocSubTab === "slides" && (
          <div className="flex-grow flex flex-col lg:flex-row p-4 md:p-6 gap-6 min-h-0 overflow-hidden reveal-section transition-all duration-300">
            {/* Visual slides directory index */}
            <div className="w-full lg:w-56 overflow-y-auto shrink-0 space-y-3 pr-2 select-none">
              <div className="flex justify-between items-center bg-[#0b0b12] p-3 border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,1)]">
                <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest">
                  Slides List ({deck.slides.length})
                </span>
                <button
                  onClick={handleAddNewSlide}
                  className="bg-[#CCFF00] text-black border border-black p-1 hover:bg-white active:scale-95 transition-all cursor-pointer"
                  title="Make Slide"
                >
                  <Plus size={12} />
                </button>
              </div>

              {deck.slides.map((sl: any, idx: number) => {
                const isActive = idx === activeSlideIdx;
                return (
                  <button
                    key={sl.id}
                    onClick={() => {
                      setActiveSlideIdx(idx);
                      addToast(`Inspecting slide #${idx + 1}: ${sl.title}`, "info");
                    }}
                    className={`w-full text-left p-2.5 border-2 transition-all cursor-pointer flex flex-col gap-1.5 shadow-[2px_2px_0_rgba(0,0,0,1)] ${
                      isActive
                        ? "bg-[#FF2D78]/10 border-[#FF2D78]"
                        : "bg-[#0b0b12] border-black hover:border-white/20"
                    }`}
                  >
                    <span className="text-[8px] font-mono text-[#FF2D78] font-bold">SLIDE MAP 0{idx + 1}</span>
                    <p className="text-[10px] font-bold text-slate-200 truncate pr-1">
                      {sl.title}
                    </p>
                    <div className="h-6 w-full bg-[#03040A] border border-black flex items-center justify-center">
                      <Presentation size={10} className="text-slate-600" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Editing Work area panel */}
            <div className="flex-grow flex flex-col space-y-4 min-h-0 text-left">
              {currentSlide ? (
                <div className="flex-grow bg-[#0b0b12] border-3 border-black p-5 shadow-[4px_4px_0_rgba(0,0,0,1)] flex flex-col min-h-0 overflow-y-auto">
                  
                  {/* Presentation Preview Card screen aspect */}
                  <div className="w-full aspect-[16/9] bg-gradient-to-tr from-[#03040a] via-[#121620] to-[#03040a] border-3 border-black p-6 flex flex-col justify-between shrink-0 shadow-[4px_4px_0_rgba(0,0,0,1)] relative max-w-xl mx-auto overflow-hidden text-left select-none">
                    {/* Laser aesthetic floating bar */}
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2D78] to-transparent animate-pulse" />

                    <div className="absolute right-3.5 top-3.5 flex items-center space-x-1 border border-black bg-black px-2 py-0.5">
                      <Eye size={10} className="text-[#FF2D78] animate-pulse shrink-0" />
                      <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase">Live Slide Presenter</span>
                    </div>

                    <div className="space-y-2 mt-3">
                      <div className="w-8 h-1 bg-[#FF2D78]" />
                      <h2 className="text-sm font-mono font-black text-white tracking-wide uppercase leading-tight">
                        {currentSlide.title}
                      </h2>
                    </div>

                    <ul className="list-disc list-inside space-y-1.5 pl-2 my-2 font-mono text-left">
                      {currentSlide.bulletPoints.map((pt: string, pIdx: number) => (
                        <li key={pIdx} className="text-[10.5px] text-slate-300 font-bold leading-normal">
                          {pt}
                        </li>
                      ))}
                    </ul>

                    <div className="flex justify-between items-center border-t border-white/5 pt-1.5 text-[8px] text-slate-500 font-mono">
                      <span>WHISPERX SYSTEMS DECK</span>
                      <span>PAGE 0{activeSlideIdx + 1} // 0{deck.slides.length}</span>
                    </div>
                  </div>

                  {/* Editors input fields */}
                  <div className="space-y-4 pt-4 border-t-2 border-black mt-4">
                    <p className="text-[9.5px] font-bold font-mono text-[#FF2D78] uppercase tracking-wider">
                      Edit Selected Slide Parameters
                    </p>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-400 block font-bold">Edit Slide Title:</span>
                      <input
                        type="text"
                        className="w-full bg-[#03040A] border-2 border-black rounded-none px-3 py-1.5 text-xs text-white placeholder-slate-700 font-mono focus:outline-none focus:border-[#FF2D78]"
                        value={currentSlide.title}
                        onChange={(e) => handleUpdateSlideTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono text-slate-400 block font-bold">Edit Slide Bullet Points:</span>
                      <div className="space-y-2">
                        {currentSlide.bulletPoints.map((pt: string, pIdx: number) => (
                          <input
                            key={pIdx}
                            type="text"
                            className="w-full bg-[#03040A] border-2 border-black rounded-none px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-[#FF2D78]"
                            value={pt}
                            onChange={(e) => handleUpdateSlidePoints(pIdx, e.target.value)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex-grow flex justify-center items-center text-slate-500 font-mono italic">
                  Select or add a slide item index to edit visual decks.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
export default XDoc;
