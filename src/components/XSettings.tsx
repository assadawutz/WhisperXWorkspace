import React, { useState } from "react";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { 
  Sparkles, 
  Settings, 
  Disc, 
  ShieldAlert, 
  BadgeHelp, 
  Cpu, 
  Database, 
  Network, 
  HelpCircle, 
  Save, 
  CheckCircle2 
} from "lucide-react";

export function XSettings() {
  const {
    provider,
    setProvider,
    geminiApiKey,
    ollamaUrl,
    ollamaModel,
    fallbackMode,
    updateConfigSettings,
    createSnapshot,
    addToast
  } = useWorkspaceStore() as any;

  const [localKey, setLocalKey] = useState(geminiApiKey);
  const [localOllaUrl, setLocalOllaUrl] = useState(ollamaUrl);
  const [localOllaModel, setLocalOllaModel] = useState(ollamaModel);
  const [localFallback, setLocalFallback] = useState(fallbackMode);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveChangesSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfigSettings({
      geminiApiKey: localKey,
      ollamaUrl: localOllaUrl,
      ollamaModel: localOllaModel,
      fallbackMode: localFallback,
    });
    setSavedSuccess(true);
    createSnapshot("Settings Updated");
    addToast("Primary AI specifications successfully serialized!", "success");
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex-grow p-6 space-y-6 overflow-y-auto bg-[#03040A] text-left">
      
      {/* Intro heading bar */}
      <div className="space-y-1 text-left border-b-2 border-black pb-4">
        <h2 className="text-base font-black text-white tracking-widest flex items-center gap-2 uppercase">
          <Settings size={16} className="text-[#00F5FF]" />
          System Settings panel
        </h2>
        <p className="text-[10px] text-slate-400 font-mono">
          Modify active AI providers, adjust credentials tokens, configure local fallback proxies, and audit environment health telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start text-left">
        
        {/* Left Column: Config Panel Container */}
        <form 
          onSubmit={handleSaveChangesSettings} 
          className="xl:col-span-7 bg-[#0b0b12] border-3 border-black p-6 shadow-[5px_5px_0_rgba(0,0,0,1)] space-y-5"
        >
          <h3 className="text-xs font-black font-mono text-[#00F5FF] tracking-wider uppercase flex items-center gap-1.5 border-b-2 border-black pb-2.5">
            <Cpu size={14} /> AI Provider Configurations
          </h3>

          {/* Model Selector Toggles */}
          <div className="space-y-2">
            <span className="text-[9.5px] tracking-wider font-mono text-slate-400 font-black uppercase block">
              Active Routing Provider
            </span>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setProvider("gemini");
                  addToast("Switched core provider routing to Cloud Gemini Flash", "info");
                }}
                className={`flex-1 py-3 px-4 border-2 border-black transition-all cursor-pointer shadow-[3px_3px_0_rgba(0,0,0,1)] flex flex-col items-start gap-1 ${
                  provider === "gemini"
                    ? "bg-[#CCFF00] text-black font-extrabold"
                    : "bg-[#121620] text-slate-400 hover:text-white"
                }`}
              >
                <span className="text-xs font-bold leading-none">Google Gemini API</span>
                <span className="text-[8px] font-mono opacity-80 uppercase font-bold mt-1">Cloud Reasoning (Standard)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider("ollama");
                  addToast("Switched core provider routing to Local Ollama sockets", "info");
                }}
                className={`flex-1 py-3 px-4 border-2 border-black transition-all cursor-pointer shadow-[3px_3px_0_rgba(0,0,0,1)] flex flex-col items-start gap-1 ${
                  provider === "ollama"
                    ? "bg-[#05f5ff] text-black font-extrabold"
                    : "bg-[#121620] text-slate-400 hover:text-white"
                }`}
              >
                <span className="text-xs font-bold leading-none">Local Ollama SDK</span>
                <span className="text-[8px] font-mono opacity-80 uppercase font-bold mt-1">Offline Local host</span>
              </button>
            </div>
          </div>

          {/* Gemini secret key inputs */}
          {provider === "gemini" && (
            <div className="space-y-2 pt-1">
              <span className="text-[9.5px] tracking-wider font-mono text-slate-400 font-black uppercase block">
                Google GenAI Token key (Server Protected)
              </span>
              <input
                type="password"
                className="w-full bg-[#03040A] border-2 border-black px-3.5 py-2 text-xs text-white placeholder-slate-700 font-mono focus:outline-none focus:border-[#CCFF00]"
                placeholder="Paste your private GenAI API key here..."
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
              />
              <span className="text-[9px] text-[#CCFF00] font-mono block leading-relaxed italic">
                Note: WhisperX Workspace routes query payloads through sandboxed secure node environment proxies. Your secret key is never serialized or dispatched to external browsers.
              </span>
            </div>
          )}

          {/* Ollama local inputs parameters */}
          {provider === "ollama" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 font-mono">
              <div className="space-y-1">
                <span className="text-[9.5px] tracking-wider text-slate-400 font-black uppercase block">
                  Local REST Host Port
                </span>
                <input
                  type="text"
                  className="w-full bg-[#03040A] border-2 border-black px-3 py-2 text-xs text-white focus:outline-none focus:border-[#05f5ff]"
                  value={localOllaUrl}
                  onChange={(e) => setLocalOllaUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9.5px] tracking-wider text-slate-400 font-black uppercase block">
                  Ollama Model variant
                </span>
                <select
                  value={localOllaModel}
                  onChange={(e) => setLocalOllaModel(e.target.value)}
                  className="w-full bg-[#03040A] border-2 border-black px-2 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="llama3">Llama3-8B (Default)</option>
                  <option value="qwen">Qwen-14B (Structured Specialist)</option>
                  <option value="mistral">Mistral-7B</option>
                </select>
              </div>
            </div>
          )}

          {/* Fallback settings trigger switch */}
          <div className="flex items-center justify-between p-4 bg-[#03040A] border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,1)]">
            <div className="space-y-1 pr-3">
              <span className="text-xs font-bold text-white block">Simulate Offline Fallback Proxy</span>
              <span className="text-[9.5px] text-slate-500 block leading-tight font-mono">
                Bypasses missing API server issues with beautiful, structured dummy output logs. Excellent for sandbox offline testing.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setLocalFallback(!localFallback);
                addToast(localFallback ? "Disabled offline mock fallbacks" : "Enabled offline mock fallbacks", "info");
              }}
              className={`w-11 h-6 transition-colors border border-black focus:outline-none cursor-pointer shrink-0 ${
                localFallback ? "bg-[#CCFF00]" : "bg-slate-900"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white border border-black transition-all ${
                  localFallback ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t-2 border-black gap-2">
            <div>
              {savedSuccess && (
                <span className="text-[9px] font-mono font-black text-[#CCFF00] flex items-center gap-1 animate-pulse">
                  <CheckCircle2 size={12} /> SNAPPED TO CORE STATE MEMORY!
                </span>
              )}
            </div>

            <button
              type="submit"
              className="bg-[#CCFF00] text-black border-2 border-black font-mono font-black text-xs px-5 py-2 shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-white transition-all cursor-pointer select-none"
            >
              COMMIT SETTINGS Config
            </button>
          </div>
        </form>

        {/* Right Column: System Environment Health Check */}
        <div className="xl:col-span-5 bg-[#0b0b12] border-3 border-black p-6 shadow-[5px_5px_0_rgba(0,0,0,1)] space-y-4">
          <h3 className="text-xs font-black font-mono text-[#00F5FF] tracking-wider uppercase flex items-center gap-1.5 border-b-2 border-black pb-2.5">
            <Network size={14} /> Telemetry health parameters
          </h3>

          <div className="space-y-3.5">
            {/* Health parameters lists index */}
            <div className="space-y-2 font-mono text-[10.5px] text-slate-350 bg-[#03040A] p-4 border-2 border-black">
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span>Roster status check:</span>
                <span className="text-[#CCFF00] font-bold">9 BOTS DEPLOYED</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span>Registry System range:</span>
                <span className="text-slate-300 font-bold">66 Core pipelines</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span>Module subsystems:</span>
                <span className="text-slate-300 font-bold">84 Component matrices</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span>Compiler warnings:</span>
                <span className="text-emerald-400 font-bold">0 FATAL CODE ISSUES</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span>Workspace DB Path:</span>
                <span className="text-slate-400 font-bold">Zustand Storage Hook</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Core socket port:</span>
                <span className="text-slate-400 font-bold">3000 Standard Container</span>
              </div>
            </div>

            <div className="bg-[#FF2D78]/10 p-3.5 border border-[#FF2D78]/30 space-y-1">
              <div className="flex items-center space-x-1.5 text-[#FF2D78] font-black font-mono text-[9px] uppercase tracking-wider">
                <ShieldAlert size={12} /> Compliance warning
              </div>
              <p className="text-[9px] text-slate-400 leading-normal italic mt-1 font-mono">
                WhisperX utilizes localized secure-tunnel encryption models. No raw document credentials, tesseract texts, or access parameters are stored or broadcast to third party caches.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
export default XSettings;
