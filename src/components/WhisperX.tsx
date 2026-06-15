import React, { useState, useRef, useEffect } from "react";
import { useWorkspaceStore, ORCHESTRATION_AGENTS } from "../stores/workspaceStore";
import { ChatMessage, Agent } from "../types";
import { 
  Sparkles, 
  Send, 
  Brain, 
  Users, 
  ClipboardCheck, 
  Code, 
  CheckCircle, 
  RotateCcw, 
  Monitor, 
  Bot, 
  ArrowRight, 
  ShieldCheck, 
  HeartPulse, 
  Terminal,
  Activity,
  Trash2
} from "lucide-react";
import { TiltBlock } from "./TiltBlock";

export function WhisperX() {
  const {
    chatMessages,
    addChatMessage,
    clearChat,
    selectedAgents,
    setSelectedAgents,
    activeAgentId,
    setActiveAgentId,
    provider,
    geminiApiKey,
    ollamaUrl,
    ollamaModel,
    artifacts,
    addToast
  } = useWorkspaceStore() as any;

  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [whisperTab, setWhisperTab] = useState<"agents" | "orchestrator">("agents");
  
  // Orchestration specific states
  const [orchestrationGoal, setOrchestrationGoal] = useState("");
  const [orchestrating, setOrchestrating] = useState(false);
  const [orchestratedOutputs, setOrchestratedOutputs] = useState<{ agentId: string; output: string }[] | null>(null);
  const [orchestrationProgress, setOrchestrationProgress] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  // Handle individual-turn Agent chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: chatInput,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);
    setChatInput("");
    setChatLoading(true);

    const activeAgent = ORCHESTRATION_AGENTS.find((a) => a.id === activeAgentId);
    const systemInstruction = activeAgent
      ? `You are Agent ${activeAgent.name}, role: ${activeAgent.role}. Your persona is: "${activeAgent.persona}". Respond strictly within your character style.`
      : "You are the general WhisperX Workspace Coordinator.";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model: "gemini-3.5-flash",
          prompt: userMsg.content,
          systemInstruction,
          history: chatMessages.slice(-12),
          ollamaUrl,
          ollamaModel,
        }),
      });

      if (!res.ok) throw new Error("Chat execution failed");

      const data = await res.json();
      addChatMessage({
        id: `msg-model-${Date.now()}`,
        role: "model",
        agentId: activeAgentId || undefined,
        content: data.text,
        timestamp: new Date().toISOString(),
      });
      addToast(`Received answer from Agent ${activeAgentId || "Coordinator"}`, "success");
    } catch (err: any) {
      addChatMessage({
        id: `msg-err-${Date.now()}`,
        role: "model",
        content: `Error routing connection: ${err.message || "Offline fallback proxy loaded"}. Standard response executed.`,
        timestamp: new Date().toISOString(),
      });
      addToast("Active proxy failure. Standby loaded.", "warn");
    } finally {
      setChatLoading(false);
    }
  };

  // Run sequential Orchestration Chain across multiple selected agents
  const runOrchestrationChain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orchestrationGoal.trim() || selectedAgents.length === 0) return;

    setOrchestrating(true);
    setOrchestratedOutputs(null);
    setOrchestrationProgress(15);
    addToast(`Launching chain orchestration utilizing ${selectedAgents.length} agents...`, "info");

    try {
      const timer1 = setTimeout(() => setOrchestrationProgress(45), 800);
      const timer2 = setTimeout(() => setOrchestrationProgress(75), 1800);

      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: orchestrationGoal,
          selectedAgents: selectedAgents,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!res.ok) throw new Error("Orchestration pipeline broken");

      const data = await res.json();
      setOrchestrationProgress(100);
      setOrchestratedOutputs(data.results);
      addToast(`Multi-agent solutions synthesized for task: ${orchestrationGoal.substring(0, 20)}...`, "success");
    } catch (err) {
      console.error(err);
      addToast("Failed sequence trigger, using offline standby solvers", "warn");
    } finally {
      setOrchestrating(false);
    }
  };

  const handlePublishChainAsArtifact = () => {
    if (!orchestratedOutputs || !orchestrationGoal.trim()) return;

    const fullText = orchestratedOutputs
      .map((o) => `### Agent ${o.agentId} Solution:\n${o.output}`)
      .join("\n\n");

    artifacts.push({
      id: `art-orch-${Date.now()}`,
      title: `Orchestration: ${orchestrationGoal.substring(0, 35)}...`,
      type: "code",
      data: JSON.stringify({
        task: orchestrationGoal,
        outputChain: orchestratedOutputs,
      }),
      createdAt: new Date().toISOString(),
    });

    addToast("Published collaborative outputs as Workspace Artifact. Saved in memory registry!", "success");
  };

  const toggleAgentOnRoster = (agentId: string) => {
    if (selectedAgents.includes(agentId)) {
      setSelectedAgents(selectedAgents.filter((id: string) => id !== agentId));
      addToast(`Removed ${agentId} from team roster`, "warn");
    } else {
      setSelectedAgents([...selectedAgents, agentId]);
      addToast(`Assigned ${agentId} to team roster`, "success");
    }
  };

  const selectFullTeam = () => {
    setSelectedAgents(ORCHESTRATION_AGENTS.map((a) => a.id));
    addToast("Assigned all 9 workspace agents to active pipeline!", "success");
  };

  return (
    <div className="flex-grow flex flex-col lg:flex-row divide-y-3 lg:divide-y-0 lg:divide-x-3 divide-black bg-[#03040A] min-h-[500px]">
      
      {/* Col 1: Tabbed Agent Interface (Gallery vs Orchestrator Planner) */}
      <div className="w-full lg:w-[48%] p-6 flex flex-col space-y-5 overflow-y-auto min-h-0 text-left">
        
        {/* Header Intro and Tab Switch buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-white/10 pb-4 shrink-0">
          <div className="space-y-0.5">
            <h2 className="text-base font-black text-white tracking-widest flex items-center gap-2">
              <Users size={16} className="text-[#CCFF00]" />
              WHISPERX WORKSPACE AGENTS
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              Manage parameters, chat individual nodes, and setup pipeline sequences.
            </p>
          </div>

          <div className="flex bg-[#121620] border-2 border-black p-1 shrink-0">
            <button
              onClick={() => setWhisperTab("agents")}
              className={`px-3 py-1.5 text-[9.5px] uppercase font-mono font-bold transition-all cursor-pointer border ${
                whisperTab === "agents"
                  ? "bg-[#CCFF00] text-black border-black shadow-[2px_2px_0_rgba(0,0,0,1)]"
                  : "text-slate-400 border-transparent hover:text-white"
              }`}
            >
              Roster (9)
            </button>
            <button
              onClick={() => setWhisperTab("orchestrator")}
              className={`px-3 py-1.5 text-[9.5px] uppercase font-mono font-bold transition-all cursor-pointer border ${
                whisperTab === "orchestrator"
                  ? "bg-[#05f5ff] text-black border-black shadow-[2px_2px_0_rgba(0,0,0,1)]"
                  : "text-slate-400 border-transparent hover:text-white"
              }`}
            >
              Orchestrator
            </button>
          </div>
        </div>

        {/* Tab CONTENT 1: Agent Gallery Grid Cards */}
        {whisperTab === "agents" && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="flex justify-between items-center bg-[#0b0b12] border-2 border-black p-3.5 shadow-[3px_3px_0_rgba(0,0,0,1)]">
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-extrabold flex items-center gap-1.5">
                <Activity size={10} className="text-[#CCFF00] animate-pulse" />
                ROSTER PIPELINE STATUS ({selectedAgents.length} ON TEAM)
              </span>
              <button
                onClick={selectFullTeam}
                className="text-[9.5px] font-bold text-[#CCFF00] hover:underline uppercase font-mono cursor-pointer"
              >
                DEPLOY ENTIRE TEAM (9_AGENTS)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ORCHESTRATION_AGENTS.map((item) => {
                const isSelected = selectedAgents.includes(item.id);
                const isActiveChat = activeAgentId === item.id;
                
                // Neon avail dot (green online / amber busy)
                // We'll calculate a pseudo availability status for high fidelity
                const isBusy = ["KODE", "NOVA", "REX"].includes(item.id);

                let cardStyle = "border-black bg-[#0b0b12] shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[#00F5FF]";
                if (isActiveChat) {
                  cardStyle = "border-[#CCFF00] bg-[#CCFF00]/5 shadow-[4px_4px_0_rgba(0,0,0,1)] shadow-[#CCFF00]/10";
                } else if (isSelected) {
                  cardStyle = "border-[#00F5FF] bg-[#00F5FF]/5 shadow-[4px_4px_0_rgba(0,0,0,1)] shadow-[#00F5FF]/10";
                }

                return (
                  <div
                    key={item.id}
                    className={`p-4 border-2 flex flex-col space-y-3.5 transition-all text-left ${cardStyle}`}
                  >
                    {/* Header: Name, Avatar & Status Badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xl p-2 bg-[#03040A] border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)] select-none">
                          {item.avatar}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-xs font-bold text-white tracking-wide">{item.id}</h3>
                            {/* Realtime availability status dot indicator */}
                            <span 
                              className={`w-2 h-2 rounded-full inline-block ${isBusy ? "bg-amber-400 animate-pulse" : "bg-emerald-400 animate-pulse"}`} 
                              title={isBusy ? "Node occupied in background queue" : "Node online"}
                            />
                          </div>
                          <span className="text-[9px] font-mono text-slate-400 block truncate max-w-[130px]" title={item.role}>
                            {item.role}
                          </span>
                        </div>
                      </div>

                      {/* Status tags */}
                      {isActiveChat ? (
                        <span className="text-[8px] bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30 px-1.5 py-0.5 font-mono font-bold flex items-center gap-1">
                          CHAT NODE
                        </span>
                      ) : isSelected ? (
                        <span className="text-[8px] bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/30 px-1.5 py-0.5 font-mono font-bold">
                          ASSIGNED
                        </span>
                      ) : (
                        <span className="text-[8px] bg-slate-900 text-slate-500 border border-white/5 px-1.5 py-0.5 font-mono font-bold">
                          IDLE
                        </span>
                      )}
                    </div>

                    {/* Persona text */}
                    <p className="text-[10.5px] text-slate-300 leading-relaxed min-h-[50px] line-clamp-3">
                      {item.persona}
                    </p>

                    {/* Skill labels */}
                    <div className="flex flex-wrap gap-1">
                      {item.skills.slice(0, 3).map((sk, skIdx) => (
                        <span
                          key={skIdx}
                          className="text-[8px] font-mono px-1.5 py-0.5 bg-black/60 border border-white/5 text-slate-400"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>

                    {/* Bottom layout buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => {
                          setActiveAgentId(item.id);
                          addChatMessage({
                            id: `msg-welcome-${Date.now()}`,
                            role: "model",
                            agentId: item.id,
                            content: `Connection authorized. I am Agent ${item.id} (${item.role}). Send query prompts or workspace analysis requests directly over this channel.`,
                            timestamp: new Date().toISOString(),
                          });
                          addToast(`Switched chat focus: Agent ${item.id}`, "info");
                        }}
                        className={`text-[9.5px] font-mono font-black py-1.5 border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] ${
                          isActiveChat
                            ? "bg-[#CCFF00] text-black"
                            : "bg-[#121620] text-slate-300 hover:bg-white hover:text-black"
                        }`}
                      >
                        CHAT NODE
                      </button>

                      <button
                        onClick={() => toggleAgentOnRoster(item.id)}
                        className={`text-[9.5px] font-mono font-black py-1.5 border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] ${
                          isSelected
                            ? "bg-[#FF2D78] text-white"
                            : "bg-[#00F5FF] text-black"
                        }`}
                      >
                        {isSelected ? "DISMISS" : "DEPLOY"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab CONTENT 2: Multi-Agent Sequenced Strategy Orchestrator */}
        {whisperTab === "orchestrator" && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="bg-[#0b0b12] border-3 border-black p-5 shadow-[5px_5px_0_rgba(0,0,0,1)] space-y-4">
              <h3 className="text-xs font-bold font-mono text-[#00F5FF] uppercase tracking-wider flex items-center gap-1.5">
                <Brain size={15} /> Strategy Directive Orchestration Panel
              </h3>

              <form onSubmit={runOrchestrationChain} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9.5px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                    TASK ORCHESTRATION GOAL
                  </label>
                  <textarea
                    value={orchestrationGoal}
                    onChange={(e) => setOrchestrationGoal(e.target.value)}
                    placeholder="E.g., Query schema definitions, analyze metadata blocks, and output a complete React layout plan..."
                    className="w-full bg-[#03040A] border-2 border-black rounded-none p-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#00F5FF] min-h-[95px] leading-relaxed resize-none shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]"
                  />
                </div>

                {/* Team checkmarks overview */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold">
                      PIPELINE MEMBERS ({selectedAgents.length} ENGAGED)
                    </span>
                    <button
                      type="button"
                      onClick={selectFullTeam}
                      className="text-[9.5px] hover:underline font-mono font-bold text-[#CCFF00] cursor-pointer"
                    >
                      ENGAGE ALL (9)
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {ORCHESTRATION_AGENTS.map((item) => {
                      const isChecked = selectedAgents.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleAgentOnRoster(item.id)}
                          className={`p-2 border-2 border-black text-left flex items-center space-x-1.5 transition-all cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] ${
                            isChecked
                              ? "bg-[#00F5FF] text-black font-extrabold"
                              : "bg-[#121620] text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className="text-xs">{item.avatar}</span>
                          <span className="text-[9px] font-bold truncate tracking-wide leading-none">{item.id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={orchestrating || !orchestrationGoal.trim() || selectedAgents.length === 0}
                  className="w-full bg-[#CCFF00] text-black border-2 border-black font-black text-xs py-2.5 rounded-none transition-all active:scale-95 shadow-[4px_4px_0_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {orchestrating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>SEQUENCING COOPERATIVE PIPELINES...</span>
                    </>
                  ) : (
                    <>
                      <Users size={14} className="text-black" />
                      <span>TRIGGER STREAM CHAIN</span>
                    </>
                  )}
                </button>
              </form>

              {/* Progress Bar */}
              {orchestrating && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
                    <span>Active Chain Calculations</span>
                    <span>{orchestrationProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black border border-white/10 rounded-none overflow-hidden">
                    <div
                      className="bg-[#00F5FF] h-full transition-all duration-300"
                      style={{ width: `${orchestrationProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Orchestrated solution outputs */}
              {orchestratedOutputs && (
                <div className="border-t-2 border-black pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-[#00F5FF]">
                      ✓ Strategy output compiled
                    </span>
                    <button
                      onClick={handlePublishChainAsArtifact}
                      className="bg-[#FF2D78] text-white text-[9px] font-mono font-bold px-2.5 py-1 border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-white hover:text-black transition-all cursor-pointer uppercase"
                    >
                      Archive Collaborative Solution
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {orchestratedOutputs.map((o: any, idx: number) => {
                      const currentAg = ORCHESTRATION_AGENTS.find((a) => a.id === o.agentId);
                      return (
                        <div key={idx} className="bg-[#03040A] border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)] p-3.5 space-y-2 text-left">
                          <div className="flex items-center justify-between border-b border-black pb-1.5">
                            <div className="flex items-center space-x-2">
                              <span className="text-base">{currentAg?.avatar || "🤖"}</span>
                              <div>
                                <span className="text-[11px] font-bold text-white">{o.agentId}</span>
                                <span className="text-[8px] text-slate-400 block font-mono">{currentAg?.role}</span>
                              </div>
                            </div>
                            <span className="text-[8px] bg-slate-900 text-blue-400 border border-white/5 px-1.5 py-0.5 rounded font-mono">
                              NOMINAL
                            </span>
                          </div>
                          <pre className="text-[10px] text-slate-350 whitespace-pre-wrap leading-relaxed font-mono text-left bg-black/40 p-2 border border-white/5 max-h-32 overflow-y-auto">
                            {o.output}
                          </pre>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Col 2: Chat Hub Terminal for direct/isolated discussions */}
      <div className="flex-1 flex flex-col bg-[#0b0b12] p-6 space-y-4 text-left relative">
        
        {/* Chat target Selector header section */}
        <div className="flex items-center justify-between bg-[#03040A] p-4 border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,1)]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#121620] border-2 border-black text-[#CCFF00]">
              <Bot size={15} className="animate-pulse" />
            </div>
            <div className="text-left font-mono">
              <span className="text-[9px] text-[#00F5FF] uppercase font-bold leading-none block">ACTIVE CHANNEL ROUTER</span>
              <select
                value={activeAgentId || ""}
                onChange={(e) => {
                  setActiveAgentId(e.target.value ? e.target.value : null);
                  addToast(`Chat route changed: ${e.target.value || "General"}`, "info");
                }}
                className="block bg-transparent text-xs font-bold text-white mt-1 focus:outline-none border-b border-white/10 pb-0.5 cursor-pointer hover:text-[#CCFFFF]"
              >
                <option value="" className="bg-slate-950 text-white">General Coordinator Chat</option>
                {ORCHESTRATION_AGENTS.map((item) => (
                  <option key={item.id} value={item.id} className="bg-slate-950 text-white">
                    {item.id} ({item.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              clearChat();
              addToast("Cleared current chat cache pipeline", "warn");
            }}
            className="text-[9px] hover:underline font-mono text-[#FF2D78] uppercase font-bold cursor-pointer"
          >
            DUMP CACHE
          </button>
        </div>

        {/* Message Thread container */}
        <div className="flex-grow overflow-y-auto bg-[#03040A] border-2 border-black p-4 space-y-3.5 min-h-[220px] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.6)]">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center text-slate-500 p-6 space-y-2">
              <Terminal size={24} className="text-[#CCFF00] animate-pulse" />
              <p className="text-xs font-bold text-slate-300">INITIATED COMMUNICATION GAUGE</p>
              <p className="text-[10px] text-slate-500 font-mono max-w-xs mx-auto">
                Issue instructions or query active agent personalities directly concerning extracted document content.
              </p>
            </div>
          ) : (
            chatMessages.map((msg: any) => {
              const belongsToAgent = ORCHESTRATION_AGENTS.find((a) => a.id === msg.agentId);
              const isUser = msg.role === "user";
              
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${isUser ? "ml-auto text-right" : "mr-auto text-left"}`}
                >
                  <div className={`flex items-center space-x-1.5 mb-1 select-none ${isUser ? "justify-end" : "justify-start"}`}>
                    {!isUser && (
                      <span className="text-[10px] font-bold text-[#00F5FF]">
                        {belongsToAgent ? belongsToAgent.id : "SYSTEM"}
                      </span>
                    )}
                    <span className="text-[9px] text-slate-500 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`px-3.5 py-2.5 text-xs rounded-none border-2 border-black font-mono leading-relaxed shadow-[3px_3px_0_rgba(0,0,0,1)] text-left ${
                      isUser
                        ? "bg-[#CCFF00] text-black shadow-[#CCFF00]/10"
                        : "bg-[#121620] text-slate-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            })
          )}
          {chatLoading && (
            <div className="flex items-center space-x-2 text-[#00F5FF]/80 italic text-[10.5px] pl-3 font-mono">
              <div className="flex space-x-1 shrink-0">
                <span className="w-1.5 h-1.5 bg-[#00F5FF] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-[#00F5FF] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-[#00F5FF] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span>ORCHESTRATING REASONING CELLS...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat input block form */}
        <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0">
          <input
            type="text"
            className="flex-1 bg-[#03040A] border-2 border-black rounded-none px-4 py-2 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-[#CCFF00] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5)]"
            placeholder={
              activeAgentId
                ? `Send message node parameters to ${activeAgentId}...`
                : "Ask general coordinator maps..."
            }
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={chatLoading}
          />
          <button
            type="submit"
            disabled={chatLoading || !chatInput.trim()}
            className="bg-[#CCFF00] text-black border-2 border-black font-black px-4 rounded-none shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer hover:bg-white"
          >
            <Send size={13} />
          </button>
        </form>
      </div>

    </div>
  );
}
export default WhisperX;
