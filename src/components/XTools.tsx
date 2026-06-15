import React, { useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Position,
  Handle,
  NodeProps,
  EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useWorkspaceStore, ORCHESTRATION_AGENTS } from "../stores/workspaceStore";
import { GhostSVG } from "./GhostSVG";
import { 
  Sparkles, 
  Hammer, 
  GitMerge, 
  FileCode, 
  Wand2, 
  Eye, 
  Camera, 
  Send, 
  RefreshCw, 
  Layers, 
  Plus, 
  Trash2, 
  HelpCircle, 
  Palette, 
  Zap,
  Terminal,
  Play
} from "lucide-react";

// ====================================================
// CUSTOM REACT FLOW GHOST MASCOT NODE COMPONENT
// ====================================================
type MascotNodeData = {
  label: string;
  color: string;
  variant: "scout" | "engineer" | "commander" | "sage";
  description: string;
  status?: "online" | "busy" | "offline";
  agentId?: string;
};

function MascotNode({ id, data, selected }: NodeProps<any>) {
  const statusColors = {
    online: "bg-emerald-400",
    busy: "bg-amber-400",
    offline: "bg-rose-500",
  };
  const status = data.status || "online";
  const dotColor = statusColors[status as keyof typeof statusColors] || "bg-emerald-400";
  const pulseClass = status === "online" ? "bg-emerald-400" : status === "busy" ? "bg-amber-400" : "";

  return (
    <div
      className={`bg-[#0b0b12] border-3 p-4 transition-all w-[180px] text-left relative ${
        selected
          ? "border-[#CCFF00] shadow-[5px_5px_0_rgba(204,255,0,0.2)]"
          : "border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:border-white/40"
      }`}
    >
      {/* Target input handle (at the top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-black !border-2 !border-[#00F5FF] !-top-1 px-0"
      />

      {/* Header card drag handles */}
      <div className="h-6 border-b border-white/10 pb-1 mb-2.5 flex items-center justify-between text-[9px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5 truncate max-w-[120px]" title={data.label}>
          <span className="relative flex h-2 w-2 shrink-0">
            {pulseClass && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseClass}`}></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
          </span>
          <span className="font-bold text-white truncate">{data.label}</span>
        </div>
        <span 
          style={{ color: data.color }}
          className="text-[8px] bg-white/5 px-1 py-0.5 rounded font-mono font-bold uppercase shrink-0"
        >
          {data.variant}
        </span>
      </div>

      {/* Display Glowing vector Ghost */}
      <div className="flex justify-center p-1.5 cursor-grab">
        <GhostSVG variant={data.variant} color={data.color} size={65} levitate={true} />
      </div>

      <div className="text-center pt-2">
        <p className="text-[9.5px] text-slate-400 font-mono truncate px-0.5">
          {data.description || `${data.variant.toUpperCase()} Node`}
        </p>
      </div>

      {/* Source output handle (at the bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#CCFF00] !border-2 !border-black !-bottom-1 px-0"
      />
    </div>
  );
}

// ====================================================
// CUSTOM REACT FLOW GLOWING LIGHTNING CHAIN EDGE
// ====================================================
function LightningEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  return (
    <>
      {/* Thick glowing aesthetic path */}
      <path
        id={id + "-glow"}
        d={edgePath}
        fill="none"
        stroke="url(#lightningGrad)"
        strokeWidth={5}
        opacity={0.9}
        className="lightning-glow-intense"
        style={{ filter: "drop-shadow(0px 0px 10px rgba(236, 72, 153, 0.95))" }}
      />
      {/* Dynamic flowing dotted center edge line */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke="#CCFF00"
        strokeWidth={3}
        className="lightning-connection"
        style={style}
        markerEnd={markerEnd}
      />
    </>
  );
}

const nodeTypes = {
  ghost: MascotNode,
};

const edgeTypes = {
  lightning: LightningEdge,
};

// ====================================================
// MAIN XTOOLS RESOURCE CONTAINER
// ====================================================
export function XTools() {
  const {
    graphScene,
    updateGraphScene,
    addToast
  } = useWorkspaceStore() as any;

  const [activeToolSubTab, setActiveToolSubTab] = useState<"mascots" | "vision" | "playground" | "mermaid" | "board">("mascots");

  // React Flow Local position states
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Advanced Mascot parameters states
  const [selectionModeActive, setSelectionModeActive] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [renamingNodeId, setRenamingNodeId] = useState<string | null>(null);
  const [tempLabel, setTempLabel] = useState<string>("");
  const [activeViewingAgent, setActiveViewingAgent] = useState<any | null>(null);

  // Close context menu on any general clicking trigger
  useEffect(() => {
    const handleOutsideClick = () => setContextMenu(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Load store's initial graph on mount
  useEffect(() => {
    if (graphScene) {
      // Map stored initial graph nodes layout safely
      const rflowNodes = graphScene.nodes.map((n: any) => {
        const statuses: ("online" | "busy" | "offline")[] = ["online", "busy"];
        const computedStatus = n.data?.status || statuses[Math.floor(Math.random() * statuses.length)];
        return {
          id: n.id,
          type: "ghost",
          position: n.position || { x: 100, y: 150 },
          data: {
            label: n.data?.label || "Workspace Node",
            color: n.data?.color || "#CCFF00",
            variant: n.data?.variant || "scout",
            description: n.data?.description || "Compiled node",
            status: computedStatus,
            agentId: n.data?.agentId || n.data?.label,
          }
        };
      });

      const rflowEdges = graphScene.edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: "lightning",
        animated: true,
      }));

      setNodes(rflowNodes);
      setEdges(rflowEdges);
      if (rflowNodes.length > 0) {
        setSelectedNodeId(rflowNodes[0].id);
      }
    }
  }, []);

  // Sync ReactFlow update events block back to the main Workspace store (Zustand)
  useEffect(() => {
    if (nodes.length > 0) {
      const storeNodes = nodes.map((n: any) => ({
        id: n.id,
        type: "ghost" as const,
        position: n.position,
        data: {
          label: n.data.label,
          color: n.data.color,
          variant: n.data.variant,
          description: n.data.description,
          status: n.data.status || "online",
          agentId: n.data.agentId || n.data.label,
        }
      }));

      const storeEdges = edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: true,
      }));

      updateGraphScene(storeNodes, storeEdges);
    }
  }, [nodes, edges]);

  // Connect handlers
  const onConnect = useCallback((connection: Connection) => {
    const newEdge = { 
      ...connection, 
      id: `edge-${Date.now()}`, 
      type: "lightning", 
      animated: true 
    };
    setEdges((eds) => addEdge(newEdge, eds));
    addToast("Established high-intensity lightning-chain connector!", "success");
  }, [setEdges, addToast]);

  // Node customization bindings
  const selectedNode = nodes.find((n: any) => n.id === selectedNodeId);

  const handleCreateGhostNode = () => {
    const id = `g-node-${Date.now()}`;
    const colors = ["#CCFF00", "#00F5FF", "#FF2D78", "#a855f7"];
    const variants: ("scout" | "engineer" | "commander" | "sage")[] = ["scout", "engineer", "commander", "sage"];
    const randColor = colors[Math.floor(Math.random() * colors.length)];
    const randVariant = variants[Math.floor(Math.random() * variants.length)];
    const agentNames = ["ARIA", "KODE", "LUMA", "SAGE", "ECHO", "NOVA", "VIGI", "ZARA", "REX"];
    const matchedAgent = agentNames[Math.floor(Math.random() * agentNames.length)];

    const newNode = {
      id,
      type: "ghost",
      position: { 
        x: Math.floor(Math.random() * 200) + 120, 
        y: Math.floor(Math.random() * 200) + 80 
      },
      data: {
        label: `Agent ${matchedAgent}`,
        color: randColor,
        variant: randVariant,
        description: `Autonomous workspace ${randVariant} module`,
        status: Math.random() > 0.35 ? "online" : "busy",
        agentId: matchedAgent,
      },
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(id);
    addToast(`Assembled Agent ${matchedAgent} Ghost Mascot Node`, "success");
  };

  const handleDeleteNode = (id: string | null) => {
    if (!id) return;
    setNodes((prev) => prev.filter(n => n.id !== id));
    setEdges((prev) => prev.filter(e => e.source !== id && e.target !== id));
    setSelectedNodeId(null);
    addToast("Mascot node dismantled from canvas stack", "warn");
  };

  const handleModifyNodeData = (updates: Partial<MascotNodeData>) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === selectedNodeId) {
          return {
            ...n,
            data: { ...n.data, ...updates },
          };
        }
        return n;
      })
    );
  };

  const handleDeleteSelectedNodes = () => {
    const selectedIds = nodes.filter((n: any) => n.selected).map((n: any) => n.id);
    if (selectedIds.length === 0) return;
    setNodes((prev) => prev.filter(n => !selectedIds.includes(n.id)));
    setEdges((prev) => prev.filter(e => !selectedIds.includes(e.source) && !selectedIds.includes(e.target)));
    setSelectedNodeId(null);
    addToast(`Batch purged ${selectedIds.length} select nodes from scene`, "warn");
  };

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: any) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    [setContextMenu]
  );

  // ----------------------------------------------------
  // VISION STUDIO / GEMINI VISION INTEGRATOR
  // ----------------------------------------------------
  const [visionImage, setVisionImage] = useState<string | null>(null);
  const [visionPrompt, setVisionPrompt] = useState("");
  const [visionOutput, setVisionOutput] = useState("");
  const [visionLoading, setVisionLoading] = useState(false);

  const [imgSize, setImgSize] = useState("1024x1024");
  const [imgRatio, setImgRatio] = useState("1:1");

  const handleVisionAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setVisionLoading(true);
    addToast("Initializing Gemini Vision synthesis context...", "info");

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: visionPrompt || "Compile clean responsive neubrutalist UI components dashboard",
          size: imgSize,
          aspectRatio: imgRatio,
        }),
      });

      if (!res.ok) throw new Error("Vision generation failed");
      const data = await res.json();
      setVisionImage(data.imageUrl);
      setVisionOutput(`Successfully synthesized visual schema asset of ${imgSize} dimensions. Aspect ratio constraints nominal.`);
      addToast("Synthesized layout asset draft successfully!", "success");
    } catch (err: any) {
      setVisionOutput(`Visual proxy compilation log: ${err.message || "Standby visual asset resolved"}`);
      addToast("Standby asset loaded for mock pipeline.", "warn");
    } finally {
      setVisionLoading(false);
    }
  };

  // ----------------------------------------------------
  // AI PLAYGROUND COMPARATOR
  // ----------------------------------------------------
  const [playPrompt, setPlayPrompt] = useState("");
  const [geminiResult, setGeminiResult] = useState("");
  const [ollamaResult, setOllamaResult] = useState("");
  const [playLoading, setPlayLoading] = useState(false);

  const handlePlaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playPrompt.trim()) return;
    setPlayLoading(true);
    setGeminiResult("Polling Gemini Cloud Flash reasoning nodes...");
    setOllamaResult("Initializing Ollama Local Server endpoint thread...");
    addToast("Dispatched side-by-side prompt analysis...", "info");

    try {
      const gemRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "gemini", prompt: playPrompt }),
      });
      const gemData = await gemRes.json();
      setGeminiResult(gemData.text);

      const ollamRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "ollama", prompt: playPrompt }),
      });
      const ollamData = await ollamRes.json();
      setOllamaResult(ollamData.text);
      addToast("Side-by-side benchmark outputs loaded", "success");
    } catch (err: any) {
      console.error(err);
      addToast("Failed querying benchmarks. Multi-provider fallbacks active.", "warn");
    } finally {
      setPlayLoading(false);
    }
  };

  // ----------------------------------------------------
  // MERMAID DIAGRAMS GENERATION
  // ----------------------------------------------------
  const [mermaidCode, setMermaidCode] = useState(`graph TD
A[Upload PDF/File] -->|OCR Extraction| B(66 Core Registries)
B -->|Workflow Mapper| C[Mascot Lightning Chain]
C -->|Readiness Score| D{Deploy Ready?}`);

  // ----------------------------------------------------
  // WHITEBOARD BOX GENERATION
  // ----------------------------------------------------
  const [drawingsCount, setDrawingsCount] = useState(3);

  return (
    <div className="flex-grow flex flex-col min-h-[500px] bg-[#03040A] text-left">
      <style>{`
        @keyframes rf-dash {
          from { stroke-dashoffset: 16; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes rf-dash-super {
          from { stroke-dashoffset: 10; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes glow-pulse {
          0%, 100% {
            filter: drop-shadow(0px 0px 4px rgba(255, 45, 120, 0.7)) drop-shadow(0px 0px 6px rgba(0, 245, 255, 0.7));
            opacity: 0.85;
          }
          50% {
            filter: drop-shadow(0px 0px 14px rgba(236, 72, 153, 0.95)) drop-shadow(0px 0px 20px rgba(204, 255, 0, 0.9));
            opacity: 1.0;
          }
        }
        .lightning-connection-intense {
          animation: rf-dash-super 0.2s linear infinite !important;
        }
        .lightning-glow-intense {
          animation: glow-pulse 1s ease-in-out infinite !important;
        }
      `}</style>

      {/* Creation Tools sub tabs headers */}
      <div className="py-2.5 border-b-2 border-black bg-[#0b0b12] px-6 flex flex-wrap items-center gap-1.5 z-20 shrink-0 font-mono">
        <button
          onClick={() => {
            setActiveToolSubTab("mascots");
            addToast("Loaded Mascot Node-Based Canvas", "info");
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-[10px] uppercase font-bold transition-all border-2 border-black cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] ${
            activeToolSubTab === "mascots"
              ? "bg-[#CCFF00] text-black font-black"
              : "text-slate-400 bg-[#121620] hover:text-white"
          }`}
        >
          <Zap size={11} />
          <span>Mascot Editor</span>
        </button>

        <button
          onClick={() => {
            setActiveToolSubTab("vision");
            addToast("Loaded Vision Studio mockup workspace", "info");
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-[10px] uppercase font-bold transition-all border-2 border-black cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] ${
            activeToolSubTab === "vision"
              ? "bg-[#00F5FF] text-black font-black"
              : "text-slate-400 bg-[#121620] hover:text-white"
          }`}
        >
          <Camera size={11} />
          <span>Vision Studio</span>
        </button>

        <button
          onClick={() => {
            setActiveToolSubTab("playground");
            addToast("Loaded side‑by‑side prompt comparator", "info");
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-[10px] uppercase font-bold transition-all border-2 border-black cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] ${
            activeToolSubTab === "playground"
              ? "bg-[#FF2D78] text-white font-black"
              : "text-slate-400 bg-[#121620] hover:text-white"
          }`}
        >
          <Layers size={11} />
          <span>AI Playground</span>
        </button>

        <button
          onClick={() => {
            setActiveToolSubTab("mermaid");
            addToast("Loaded Mermaid syntax mapping tool", "info");
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-[10px] uppercase font-bold transition-all border-2 border-black cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] ${
            activeToolSubTab === "mermaid"
              ? "bg-purple-600 text-white font-black"
              : "text-slate-400 bg-[#121620] hover:text-white"
          }`}
        >
          <GitMerge size={11} />
          <span>Mermaid Creator</span>
        </button>

        <button
          onClick={() => {
            setActiveToolSubTab("board");
            addToast("Loaded whiteboard canvas sketch", "info");
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-[10px] uppercase font-bold transition-all border-2 border-black cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] ${
            activeToolSubTab === "board"
              ? "bg-[#38bdf8] text-black font-black"
              : "text-slate-400 bg-[#121620] hover:text-white"
          }`}
        >
          <Palette size={11} />
          <span>Whiteboard</span>
        </button>
      </div>

      {/* Main creation surface area */}
      <div className="flex-grow overflow-hidden flex flex-col min-h-0">
        
        {/* TAB 1: Mascot Node Editor with real-time drags and lightning connectors */}
        {activeToolSubTab === "mascots" && (
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
            
            {/* Visual React Flow Canvas */}
            <div className="flex-grow bg-[#03040A] relative overflow-hidden flex flex-col min-h-0 select-none border-b lg:border-b-0 h-full">
              
              {/* Floating controls toolbar inline */}
              <div className="absolute top-4 left-4 z-40 flex items-center flex-wrap gap-2.5 bg-[#0b0b12]/95 border-3 border-black p-3 shadow-[4px_4px_0_rgba(0,0,0,1)] max-w-xl">
                <button
                  onClick={handleCreateGhostNode}
                  className="bg-[#CCFF00] text-black font-extrabold text-[10px] px-3 py-1.5 border-2 border-black rounded-none active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all flex items-center gap-1 uppercase cursor-pointer"
                >
                  <Plus size={12} /> Add Mascot Node
                </button>

                {/* Marquee Select Mode toggle button */}
                <button
                  onClick={() => {
                    setSelectionModeActive(!selectionModeActive);
                    addToast(selectionModeActive ? "Disabled selection box marquee" : "Enabled selection box marquee. Drag left mouse on canvas to frame nodes.", "info");
                  }}
                  className={`font-mono text-[9.5px] font-bold px-3 py-1.5 rounded-none transition-all flex items-center gap-1.5 uppercase cursor-pointer border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)] ${
                    selectionModeActive 
                      ? "bg-[#FF2D78] text-white animate-pulse" 
                      : "bg-[#121620] text-slate-400 hover:text-white"
                  }`}
                  title="Toggles canvas drag to marquee-select multiple nodes at once"
                >
                  <span>🎯</span> {selectionModeActive ? "BOX SELECT ACTIVE" : "ENABLE BOX SELECT"}
                </button>

                {/* Batch Delete button */}
                {nodes.filter((n: any) => n.selected).length > 0 && (
                  <button
                    onClick={handleDeleteSelectedNodes}
                    className="bg-rose-950 text-[#FF2D78] border-2 border-black font-black text-[9.5px] font-mono px-3 py-1.5 rounded-none active:scale-95 transition-all flex items-center gap-1.5 uppercase cursor-pointer"
                  >
                    <Trash2 size={12} /> PURGE BATCH ({nodes.filter((n: any) => n.selected).length})
                  </button>
                )}

                <span className="text-[9px] text-slate-400 font-mono block w-full mt-1.5 leading-tight">
                  {selectionModeActive 
                    ? "★ Box select active! Drag standard mouse pointer directly over several nodes to multi-select."
                    : "⚡ Connect matching nodes by dragging ports. Right click a mascot to rename, toggle live availability states, etc."
                  }
                </span>
              </div>

              {/* Laser definitions injection */}
              <svg className="absolute w-0 h-0">
                <defs>
                  <linearGradient id="lightningGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#CCFF00" />
                    <stop offset="50%" stopColor="#FF2D78" />
                    <stop offset="100%" stopColor="#00F5FF" />
                  </linearGradient>
                </defs>
              </svg>

              {/* React Flow Core Engine integration */}
              <div className="flex-grow w-full h-full relative">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  snapToGrid={true}
                  snapGrid={[10, 10]}
                  onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                  onNodeContextMenu={onNodeContextMenu}
                  selectionOnDrag={selectionModeActive}
                  panOnDrag={!selectionModeActive}
                  selectionMode={"partial" as any}
                  fitView
                  className="bg-transparent"
                >
                  <Background color="#1b1c2b" gap={16} size={1.2} />
                  <Controls className="!bg-[#0b0b12] !border-2 !border-black !text-white [&>button]:!border-black" />
                  <MiniMap 
                    className="!bg-[#0b0b12] !border-2 !border-black" 
                    nodeColor={(n: any) => (n.data?.color || "#CCFF00") as string}
                    maskColor="rgba(3, 4, 10, 0.85)"
                    nodeStrokeWidth={3}
                  />
                </ReactFlow>

                {/* CUSTOM DECORATIVE RIGHT CLICK CONTEXT MENU */}
                {contextMenu && (
                  <div 
                    className="fixed bg-[#0b0b12] border-3 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-2.5 z-50 w-52 font-mono text-[10px] text-left divide-y-2 divide-black"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1">
                      <button 
                        onClick={() => {
                          const targetNode = nodes.find((n: any) => n.id === contextMenu.nodeId);
                          if (targetNode) {
                            setTempLabel(targetNode.data.label);
                            setRenamingNodeId(contextMenu.nodeId);
                          }
                          setContextMenu(null);
                        }}
                        className="w-full text-left px-2 py-1.5 hover:bg-[#CCFF00] hover:text-black transition-all flex items-center gap-1.5 cursor-pointer text-slate-200"
                      >
                        <span>📝</span> Rename Mascot
                      </button>

                      <button
                        onClick={() => {
                          const targetNode = nodes.find((n: any) => n.id === contextMenu.nodeId);
                          const mappedId = targetNode?.data?.agentId || targetNode?.data?.label;
                          const cleanId = String(mappedId).replace(/Agent\s+/i, "").trim().toUpperCase();
                          const matchedAgent = ORCHESTRATION_AGENTS.find(
                            a => a.id === cleanId || cleanId.includes(a.id)
                          ) || ORCHESTRATION_AGENTS[0];
                          setActiveViewingAgent(matchedAgent);
                          setContextMenu(null);
                        }}
                        className="w-full text-left px-2 py-1.5 hover:bg-[#00F5FF] hover:text-black transition-all flex items-center gap-1.5 cursor-pointer text-slate-200"
                      >
                        <span>🧿</span> Inspect Linked Agent
                      </button>
                    </div>

                    <div className="py-2.5 px-2">
                      <p className="text-[7.5px] uppercase text-slate-500 font-black mb-1.5 tracking-wider">Change Color Accent</p>
                      <div className="flex gap-2">
                        {["#CCFF00", "#00F5FF", "#FF2D78", "#a855f7"].map(cl => (
                          <button
                            key={cl}
                            type="button"
                            onClick={() => {
                              setNodes((prev) =>
                                prev.map((n) => {
                                  if (n.id === contextMenu.nodeId) {
                                    return {
                                      ...n,
                                      data: { ...n.data, color: cl },
                                    };
                                  }
                                  return n;
                                })
                              );
                              addToast("Synchronized mascot theme color", "success");
                              setContextMenu(null);
                            }}
                            className="w-4 h-4 rounded-full border border-black hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                            style={{ backgroundColor: cl }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="py-2.5 px-2">
                      <p className="text-[7.5px] uppercase text-slate-500 font-black mb-1.5 tracking-wider">Set Node Channel state</p>
                      <div className="flex gap-1.5">
                        {["online", "busy", "offline"].map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              setNodes((prev) =>
                                prev.map((n) => {
                                  if (n.id === contextMenu.nodeId) {
                                    return {
                                      ...n,
                                      data: { ...n.data, status: st },
                                    };
                                  }
                                  return n;
                                })
                              );
                              addToast(`Channel route marked [${st.toUpperCase()}]`, "info");
                              setContextMenu(null);
                            }}
                            className="text-[8px] bg-[#121620] hover:bg-[#CCFF00] hover:text-black px-1.5 py-0.5 rounded-none font-mono font-bold uppercase transition-all cursor-pointer text-slate-400"
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* RENAME CUSTOM GHOST REAL-TIME WINDOW */}
                {renamingNodeId && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0b0b12] border-3 border-black p-5 w-full max-w-sm text-left shadow-[6px_6px_0_rgba(0,0,0,1)] space-y-4">
                      <h3 className="text-xs font-bold font-mono uppercase text-[#00F5FF] tracking-wider">Rename Ghost Node</h3>
                      <input
                        type="text"
                        className="w-full bg-[#03040A] border-2 border-black rounded-none px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00] font-mono"
                        value={tempLabel}
                        onChange={(e) => setTempLabel(e.target.value)}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => setRenamingNodeId(null)}
                          className="bg-[#121620] border-2 border-black text-slate-300 px-3.5 py-1.5 rounded-none text-xs font-semibold cursor-pointer"
                        >
                          CLOSE
                        </button>
                        <button
                          onClick={() => {
                            setNodes((prev) =>
                              prev.map((n) => {
                                  if (n.id === renamingNodeId) {
                                    return {
                                      ...n,
                                      data: { ...n.data, label: tempLabel },
                                    };
                                  }
                                  return n;
                                })
                            );
                            addToast("Re-labeled custom mascot", "success");
                            setRenamingNodeId(null);
                          }}
                          className="bg-[#CCFF00] text-black border-2 border-black px-3.5 py-1.5 rounded-none text-xs font-black cursor-pointer"
                        >
                          APPLY
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* AGENT DETAILS POPUP WINDOW */}
                {activeViewingAgent && (
                  <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveViewingAgent(null)}>
                    <div className="bg-[#0b0b12] border-3 border-black p-6 w-full max-w-md text-left shadow-[6px_6px_0_rgba(0,0,0,1)] space-y-4 relative" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-start gap-4 border-b-2 border-black pb-4">
                        <span className="text-4xl p-2 bg-[#03040A] border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)]">{activeViewingAgent.avatar}</span>
                        <div>
                          <h3 className="text-sm font-bold text-white tracking-wide">{activeViewingAgent.name}</h3>
                          <p className="text-[10px] text-[#00F5FF] font-mono font-black uppercase tracking-wider mt-1">{activeViewingAgent.role}</p>
                        </div>
                      </div>

                      <div className="space-y-4 text-xs font-mono text-slate-300">
                        <div>
                          <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold mb-1">Mascot Bio Profile:</span>
                          <p className="leading-relaxed bg-black/40 p-3 border border-white/5 text-slate-200">{activeViewingAgent.persona}</p>
                        </div>

                        <div>
                          <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold mb-1">Pipeline Skills:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {activeViewingAgent.skills.map((sk: string) => (
                              <span key={sk} className="text-[9.5px] bg-slate-900 text-slate-300 border border-white/10 px-2 py-0.5">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 flex justify-between items-center text-[10px] border-t border-black">
                          <span className="text-slate-500">Availability:</span>
                          <span className="text-[#CCFF00] uppercase font-black flex items-center gap-1.5 animate-pulse">
                            <span className="inline-block w-2.5 h-2.5 bg-[#CCFF00] rounded-full"></span> SYSTEM ONLINE
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => setActiveViewingAgent(null)}
                          className="bg-[#CCFF00] text-black border-2 border-black font-black px-4 py-2 cursor-pointer"
                        >
                          DISMISS
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Sidebar properties layout panel */}
            <div className="w-full lg:w-80 bg-[#0b0b12] border-t-3 lg:border-t-0 lg:border-l-3 border-black p-5 space-y-4 shrink-0 overflow-y-auto text-left text-xs text-slate-300">
              <h3 className="text-xs font-black font-mono tracking-wider uppercase text-slate-450 border-b-2 border-black pb-2">
                Node Properties
              </h3>

              {selectedNode ? (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase font-black">Node id:</span>
                    <span className="block font-mono text-[#00F5FF] font-bold">{selectedNode.id}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase font-black">Label descriptor:</span>
                    <input
                      type="text"
                      className="w-full bg-[#03040A] border-2 border-black rounded-none px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#CCFF00] font-mono"
                      value={selectedNode.data.label}
                      onChange={(e) => handleModifyNodeData({ label: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase font-black">Mascot Model variant:</span>
                    <select
                      className="w-full bg-[#03040A] border-2 border-black rounded-none px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#CCFF00] cursor-pointer text-slate-300 font-mono"
                      value={selectedNode.data.variant}
                      onChange={(e) => handleModifyNodeData({ variant: e.target.value as any })}
                    >
                      <option value="scout">Scout Base Model</option>
                      <option value="engineer">Engineer Build Model</option>
                      <option value="commander">Commander Lead Model</option>
                      <option value="sage">Sage Abstract Model</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase font-black">Purpose context:</span>
                    <input
                      type="text"
                      className="w-full bg-[#03040A] border-2 border-black rounded-none px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#CCFF00] font-mono"
                      value={selectedNode.data.description || ""}
                      onChange={(e) => handleModifyNodeData({ description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Preset Accents:</span>
                    <div className="flex gap-2">
                      {["#CCFF00", "#00F5FF", "#FF2D78", "#a855f7"].map(cl => (
                        <button
                          key={cl}
                          type="button"
                          onClick={() => {
                            handleModifyNodeData({ color: cl });
                            addToast("Mascot color synchronized", "success");
                          }}
                          className={`w-6 h-6 rounded-none border-2 transition-transform cursor-pointer ${
                            selectedNode.data.color === cl ? "scale-110 border-white" : "border-black"
                          }`}
                          style={{ backgroundColor: cl }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 z-20 relative">
                    <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Assigned Workspace Agent Profile:</span>
                    <select
                      className="w-full bg-[#03040A] border-2 border-black rounded-none px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#CCFF00] cursor-pointer font-mono"
                      value={selectedNode.data.agentId || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const match = ORCHESTRATION_AGENTS.find(a => a.id === val);
                        handleModifyNodeData({ 
                          agentId: val,
                          label: match ? `Agent ${match.name}` : selectedNode.data.label,
                          description: match ? match.role : selectedNode.data.description,
                        });
                        addToast(`Linked system proxy node to workspace agent Profile ID: ${val}`, "success");
                      }}
                    >
                      <option value="">-- NO AGENT LINK --</option>
                      {ORCHESTRATION_AGENTS.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.avatar} {ag.name} // {ag.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleDeleteNode(selectedNode.id)}
                    className="w-full bg-rose-950/20 hover:bg-[#FF2D78] hover:text-white text-[#FF2D78] border-2 border-black font-black text-xs py-2 shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={13} strokeWidth={2.5} />
                    <span>DISMANTLE MASCOT</span>
                  </button>
                </div>
              ) : (
                <p className="italic text-slate-500 font-mono">Select any visual ghost nodes on the canvas to configure parameters in real-time.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Vision Studio screenshot prompt design tools */}
        {activeToolSubTab === "vision" && (
          <div className="flex-grow p-4 md:p-6 space-y-6 overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-6 items-start text-left">
              <div className="flex-grow bg-[#0b0b12] border-3 border-black p-5 shadow-[4px_4px_0_rgba(0,0,0,1)] space-y-4 max-w-2xl">
                <h3 className="text-xs font-black font-mono text-[#00F5FF] tracking-wider uppercase flex items-center gap-2">
                  <Wand2 size={14} /> Screen‑to‑Code prompt vision block
                </h3>

                <form onSubmit={handleVisionAnalyze} className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-slate-400 font-bold block uppercase">Visual asset descriptor prompts:</span>
                    <textarea
                      value={visionPrompt}
                      onChange={(e) => setVisionPrompt(e.target.value)}
                      placeholder="Describe the responsive UI block layouts: E.g., Dense dashboard with neon stats cards, thick neubrutalist borders, contrasting pastel dividers, space-grotesk header elements..."
                      className="w-full bg-[#03040A] border-2 border-black rounded-none p-3.5 text-xs text-white placeholder-slate-700 font-mono focus:outline-none focus:border-[#00F5FF] min-h-[90px] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Image Resolution (Size):</span>
                      <select
                        value={imgSize}
                        onChange={(e) => setImgSize(e.target.value)}
                        className="w-full bg-[#03040A] border-2 border-black px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                      >
                        <option value="512x512">512px Square (Insta-render)</option>
                        <option value="1024x1024">1024x1024 HD Output</option>
                        <option value="1660x900">1660x900 Panoramic Wide</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Display Layout aspect:</span>
                      <select
                        value={imgRatio}
                        onChange={(e) => setImgRatio(e.target.value)}
                        className="w-full bg-[#03040A] border-2 border-black px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                      >
                        <option value="1:1">1:1 Standard</option>
                        <option value="16:9">16:9 Cinema</option>
                        <option value="4:3">4:3 Analog</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={visionLoading || !visionPrompt.trim()}
                    className="w-full bg-[#00F5FF] text-black border-2 border-black font-mono font-black text-xs py-2.5 rounded-none transition-all active:scale-95 shadow-[3px_3px_0_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    {visionLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>ORCHESTRATING IMAGEN LAYOUT CELLS...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 size={13} />
                        <span>ASSEMBLING CODE-BLOCK MOCKUP</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Prompt generator log output console */}
                {visionOutput && (
                  <div className="bg-[#03040A] border-2 border-black p-3 font-mono text-[10px] space-y-1 shadow-[2px_2px_0_rgba(0,0,0,1)]">
                    <p className="text-[#00F5FF] font-black uppercase">SYSTEM VISION CONTROLLER RUN LOGS:</p>
                    <p className="text-slate-300 leading-normal">{visionOutput}</p>
                  </div>
                )}
              </div>

              {/* Vision side preview screen mockup */}
              <div className="w-full lg:w-[450px] bg-[#0b0b12] border-3 border-black p-4 shadow-[4px_4px_0_rgba(0,0,0,1)] space-y-3.5 text-left shrink-0">
                <span className="text-[9px] font-mono text-slate-500 font-extrabold block uppercase tracking-wider">
                  Generated layout viewport assets
                </span>
                
                <div className="aspect-video bg-[#03040A] border-2 border-black flex flex-col justify-center items-center text-center p-6 relative overflow-hidden">
                  {visionImage ? (
                    <img 
                      src={visionImage} 
                      alt="Generated design preview asset" 
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="space-y-2 select-none z-10">
                      <Camera size={26} className="text-slate-700 mx-auto animate-pulse" />
                      <p className="text-[10px] text-slate-400 font-mono">No active asset compiled yet.</p>
                      <p className="text-[9px] text-slate-600 font-mono max-w-xs mx-auto">Input specifications inside prompts on the left and trigger compilation.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AI Playground Comparator side-by-side (Gemini vs Ollama) */}
        {activeToolSubTab === "playground" && (
          <div className="flex-grow p-4 md:p-6 space-y-4 overflow-y-auto">
            <div className="bg-[#0b0b12] border-3 border-black p-5 shadow-[4px_4px_0_rgba(0,0,0,1)] max-w-3xl space-y-4 text-left">
              <h3 className="text-xs font-black font-mono text-[#FF2D78] tracking-wider uppercase flex items-center gap-1.5">
                <Terminal size={14} /> Side-by-side prompt performance comparator
              </h3>

              <form onSubmit={handlePlaySubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-slate-400 font-bold block uppercase">Active comparing prompt:</span>
                  <input
                    type="text"
                    value={playPrompt}
                    onChange={(e) => setPlayPrompt(e.target.value)}
                    placeholder="Enter benchmark question: E.g., Compare React Server Component states..."
                    className="w-full bg-[#03040A] border-2 border-black px-4 py-2.5 text-xs text-white placeholder-slate-700 font-mono focus:outline-none focus:border-[#FF2D78]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={playLoading || !playPrompt.trim()}
                  className="bg-[#FF2D78] text-white border-2 border-black font-mono font-black text-xs px-5 py-2 rounded-none transition-all active:scale-95 shadow-[2px_2px_0_rgba(0,0,0,1)] flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Play size={11} strokeWidth={3} />
                  <span>DISPATCH COMPARISON SEQUENCE</span>
                </button>
              </form>
            </div>

            {/* Results cards templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* Gemini block */}
              <div className="bg-[#0b0b12] border-3 border-black p-5 shadow-[4px_4px_0_rgba(0,0,0,1)] flex flex-col space-y-3.5 text-left min-h-[180px]">
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <span className="text-xs font-black font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1">
                    🌐 Cloud Provider (Gemini-Flash)
                  </span>
                  <span className="text-[8px] bg-sky-950 text-sky-400 font-mono px-2 py-0.5 border border-sky-900 font-bold">
                    NOMINAL
                  </span>
                </div>
                <div className="flex-grow font-mono text-[10px] text-slate-300 leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-wrap bg-[#03040A] border-2 border-black p-3 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.6)]">
                  {geminiResult || "Input sandbox prompt above and execute triggers to view cloud-provider metrics."}
                </div>
              </div>

              {/* Ollama local block */}
              <div className="bg-[#0b0b12] border-3 border-black p-5 shadow-[4px_4px_0_rgba(0,0,0,1)] flex flex-col space-y-3.5 text-left min-h-[180px]">
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <span className="text-xs font-black font-mono text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                    ⚙ Local Node Engine (Ollama / Llama3)
                  </span>
                  <span className="text-[8px] bg-indigo-950 text-indigo-400 font-mono px-2 py-0.5 border border-indigo-950 font-bold">
                    STANDBY
                  </span>
                </div>
                <div className="flex-grow font-mono text-[10px] text-slate-300 leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-wrap bg-[#03040A] border-2 border-black p-3 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.6)]">
                  {ollamaResult || "Local docker thread waiting for input benchmark parameters."}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Mermaid live render syntax editor */}
        {activeToolSubTab === "mermaid" && (
          <div className="flex-grow flex flex-col lg:flex-row p-4 md:p-6 gap-6 min-h-0 overflow-hidden">
            
            <div className="flex-grow bg-[#0b0b12] border-3 border-black p-5 shadow-[4px_4px_0_rgba(0,0,0,1)] flex flex-col space-y-4 text-left min-h-0">
              <h3 className="text-xs font-black font-mono text-violet-400 tracking-wider uppercase flex items-center gap-1.5 shrink-0">
                <GitMerge size={14} /> Mermaid diagram mapping editor
              </h3>

              <textarea
                value={mermaidCode}
                onChange={(e) => setMermaidCode(e.target.value)}
                className="w-full flex-grow bg-[#03040A] border-2 border-black p-3.5 text-xs text-white placeholder-slate-705 font-mono focus:outline-none focus:border-violet-500 min-h-[170px] leading-relaxed resize-none shadow-[inset_1px_1px_3px_rgba(0,0,0,0.6)]"
              />

              <button
                onClick={() => {
                  addToast("Mermaid workflow models synchronized!", "success");
                }}
                className="bg-violet-600 text-white border-2 border-black font-mono font-black text-xs py-2 px-4 shadow-[2px_2px_0_rgba(0,0,0,1)] shrink-0 max-w-xs transition-all active:translate-x-[1px] active:translate-y-[1px] cursor-pointer hover:bg-white hover:text-black"
              >
                COMPILE WORKFLOW MODEL
              </button>
            </div>

            {/* Mock live output renderer */}
            <div className="w-full lg:w-[440px] bg-[#0b0b12] border-3 border-black p-5 shadow-[4px_4px_0_rgba(0,0,0,1)] shrink-0 flex flex-col space-y-3 text-left">
              <span className="text-[9px] font-mono text-slate-500 font-extrabold uppercase tracking-wider block">
                RENDERED MODEL VIEWPORT
              </span>

              <div className="flex-grow bg-[#03040A] border-2 border-black p-4 font-mono text-[10px] space-y-3.5 max-h-[350px] overflow-y-auto">
                <div className="flex items-center space-x-1.5 border-b border-black pb-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-violet-400"></span>
                  <span className="text-white font-bold uppercase tracking-wider">Nominal routing pipeline logic:</span>
                </div>
                
                {/* Visual mockup blocks representing node flow logic */}
                <div className="space-y-4 select-none pt-2.5">
                  <div className="bg-slate-900 border border-black p-2 mx-auto max-w-[170px] text-center text-slate-300 font-bold uppercase tracking-tight shadow-[2px_2px_0_rgba(0,0,0,1)]">
                    📥 UPLOAD INPUT
                  </div>
                  <div className="h-5 w-px bg-slate-500 mx-auto relative">
                    <span className="absolute -bottom-1 -left-1 text-[8px] text-slate-500">▼</span>
                  </div>
                  <div className="bg-slate-900 border border-[#00F5FF] p-2 mx-auto max-w-[170px] text-center text-slate-200 font-bold uppercase tracking-tight shadow-[2px_2px_0_rgba(0,0,0,1)]">
                    🧬 TESSERACT OCR
                  </div>
                  <div className="h-5 w-px bg-[#00F5FF] mx-auto relative animate-pulse">
                    <span className="absolute -bottom-1 -left-1 text-[8px] text-[#00F5FF]">▼</span>
                  </div>
                  <div className="bg-[#CCFF00] border border-black p-2 mx-auto max-w-[170px] text-center text-black font-black uppercase tracking-tight shadow-[2px_2px_0_rgba(0,0,0,1)]">
                    ⚡ MASCOT CONNECTIONS
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Whiteboard Konva shape selector canvas mockup */}
        {activeToolSubTab === "board" && (
          <div className="flex-grow p-4 md:p-6 space-y-4 overflow-y-auto">
            <div className="bg-[#0b0b12] border-3 border-black p-5 shadow-[4px_4px_0_rgba(0,0,0,1)] space-y-4 text-left max-w-3xl">
              <h3 className="text-xs font-black font-mono text-[#38bdf8] tracking-wider uppercase flex items-center gap-1.5">
                <Palette size={14} /> Whiteboard sketching console
              </h3>

              <div className="flex flex-wrap items-center gap-3 font-mono text-[10px]">
                <button
                  onClick={() => {
                    setDrawingsCount((c) => c + 1);
                    addToast("Affixed circle node template to canvas", "success");
                  }}
                  className="bg-[#121620] hover:bg-white hover:text-black border-2 border-black font-bold px-3 py-1.5 shadow-[2px_2px_0_rgba(0,0,0,1)] cursor-pointer text-slate-300 transition-colors uppercase"
                >
                  ➕ INSERT CIRCLE
                </button>
                <button
                  onClick={() => {
                    setDrawingsCount((c) => c + 1);
                    addToast("Affixed rectangle template data layout", "success");
                  }}
                  className="bg-[#121620] hover:bg-white hover:text-black border-2 border-black font-bold px-3 py-1.5 shadow-[2px_2px_0_rgba(0,0,0,1)] cursor-pointer text-slate-300 transition-colors uppercase"
                >
                  ➕ INSERT RECTANGLE
                </button>
                <button
                  onClick={() => {
                    setDrawingsCount(0);
                    addToast("Cleared whiteboard vectors grid", "warn");
                  }}
                  className="bg-[#FF2D78]/10 text-[#FF2D78] hover:bg-white hover:text-black border-2 border-black font-bold px-3 py-1.5 shadow-[2px_2px_0_rgba(0,0,0,1)] cursor-pointer transition-colors uppercase"
                >
                  ❌ CLEAR CANVAS
                </button>
              </div>
            </div>

            {/* Konva graphic area backdrop */}
            <div className="aspect-video bg-[#03040A] border-3 border-black relative overflow-hidden select-none flex flex-col justify-center items-center text-center p-6 shadow-[5px_5px_0_rgba(0,0,0,1)] max-w-4xl">
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent animate-pulse" />

              {drawingsCount === 0 ? (
                <div className="space-y-1">
                  <Palette size={24} className="text-slate-700 mx-auto animate-bounce" />
                  <p className="text-xs text-slate-400 font-mono">Whiteboard cleared.</p>
                  <p className="text-[10px] text-slate-600 font-mono">Click commands above to generate vector blocks.</p>
                </div>
              ) : (
                <div className="flex gap-4 flex-wrap justify-center relative p-4 bg-black/30 border border-white/5">
                  {Array.from({ length: drawingsCount }).map((_, idx) => (
                    <div
                      key={idx}
                      className="cursor-move w-16 h-16 bg-[#38bdf8]/10 border-2 border-[#38bdf8] hover:border-white transition-all flex items-center justify-center text-[10px] font-mono text-white text-center shadow-[3px_3px_0_rgba(0,0,0,1)]"
                      style={{ transform: `rotate(${idx * 7}deg)` }}
                    >
                      SHAPE 0{idx + 1}
                    </div>
                  ))}
                  <div className="absolute -bottom-8 left-4 text-[8px] font-mono text-slate-500 uppercase">
                    ✋ Shapes can be repositioned using standard drags. Coordinates are tracked nominal.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
export default XTools;
