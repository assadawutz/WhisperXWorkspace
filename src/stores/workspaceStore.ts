import { create } from "zustand";
import {
  WorkspaceRecord,
  SourceFileRecord,
  PageRecord,
  ExtractedBlockRecord,
  EntityRecord,
  SummaryRecord,
  ArtifactRecord,
  CanvasSceneRecord,
  GraphSceneRecord,
  ChartSpecRecord,
  DeckRecord,
  ReviewRecord,
  ReadinessReport,
  SnapshotRecord,
  JobRecord,
  ChatMessage,
  Agent,
} from "../types";

// Pre-define 9 agents with roles, emojis, personas, and skills
export const ORCHESTRATION_AGENTS: Agent[] = [
  {
    id: "ARIA",
    name: "ARIA",
    role: "Intake & Quality Specialist",
    avatar: "🧬",
    persona: "Precision-driven metadata analyst focusing on data lineage, quality metrics, and input sanitization.",
    status: "idle",
    skills: ["File OCR analysis", "Structure Extraction", "System Schema Registry Compliance"],
  },
  {
    id: "KODE",
    name: "KODE",
    role: "TypeScript & Code Architect",
    avatar: "⚡",
    persona: "Highly technical software engineer writing complete, bug-free, copy-paste-ready React and TypeScript modules.",
    status: "idle",
    skills: ["Code Generation", "Vite Configuration", "TypeScript Compiler Validation"],
  },
  {
    id: "LUMA",
    name: "LUMA",
    role: "UX & Responsive Visualist",
    avatar: "🎨",
    persona: "Tailwind specialist implementing desktop-first layout precision and responsive mobile interfaces.",
    status: "idle",
    skills: ["Visual Design System Enforcement", "Animate-ready templates", "Color & Spacing Pairings"],
  },
  {
    id: "SAGE",
    name: "SAGE",
    role: "Deduction & Abstract Reasoning Coach",
    avatar: "🧿",
    persona: "Advanced reasoning planner. Breaks down complex task queries into micro-steps.",
    status: "idle",
    skills: ["Chain-of-thought orchestration", "Gap Discovery", "Cognitive Workflow Modeling"],
  },
  {
    id: "ECHO",
    name: "ECHO",
    role: "Synthesizer & Audio Architect",
    avatar: "🔊",
    persona: "Audio signal engineer and TTS formatter designing interactive prompt loops and speech parameters.",
    status: "idle",
    skills: ["Speech Synthesis Planning", "Live API WebSocket Stream Synchronization", "Audio Sync Playback Parameters"],
  },
  {
    id: "NOVA",
    name: "NOVA",
    role: "Mermaid & Systems Cartographer",
    avatar: "🪐",
    persona: "Process mapping expert converting unstructured files into elegant charts, flows, and graphs.",
    status: "idle",
    skills: ["React Flow Structure Translation", "Mermaid Diagram Mapping", "Visual System Specs"],
  },
  {
    id: "VIGI",
    name: "VIGI",
    role: "Readiness & Compliance Validator",
    avatar: "🛡️",
    persona: "Critical auditor checking files for errors, structural integrity, and regulatory completeness.",
    status: "idle",
    skills: ["Readiness Verification check", "Compliance reports", "Blocker Tracking"],
  },
  {
    id: "ZARA",
    name: "ZARA",
    role: "Content Coordinator & Copyeditor",
    avatar: "📝",
    persona: "Editorial content generalist skilled at distilling raw tabular spreadsheets into copy summaries.",
    status: "idle",
    skills: ["Summary Reports", "PowerPoint / Deck bullet points", "Copyediting"],
  },
  {
    id: "REX",
    name: "REX",
    role: "Database & Schema Integrator",
    avatar: "💾",
    persona: "Structuring specialist designing databases, collections, and structured JSON outputs.",
    status: "idle",
    skills: ["Database schemas", "JSON entity indexing", "Workspace data bindings"],
  },
];

// Seed initial content to bypass empty slate and enable beautiful workflows
const initialFiles: SourceFileRecord[] = [
  {
    id: "file-system-reg",
    name: "SystemRegistry_v4.pdf",
    size: 245000,
    type: "application/pdf",
    ocrStatus: "completed",
    metadata: {
      author: "Systems Division Alpha",
      keywords: ["System Health", "Intake Hub", "66 Systems", "84 Subsystems"],
      language: "en-US",
      wordCount: 1240,
    },
    uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    extractedText: `WhisperXWorkspace System Registry. This is version 4.0 of our alpha design spec.
Our architecture comprises exactly 66 primary business systems and 84 tightly-coupled technical subsystems.
Core subsystems are indexed into:
- System 01: Intake Hub & Source Upload pipeline
- System 02: Prompt Plan generator module
- System 03: Node Agent Orchestrator with Mascot Node Editor
- System 04: Visual Document workspaces (XDoc: docs, sheets, slides)
Performance specs mandate under 250ms latency for Local and Gemini Cloud fallback.`,
    pages: [
      {
        fileId: "file-system-reg",
        pageIndex: 1,
        extractedText: "WhisperXWorkspace System Registry Core Outline. Primary hub registers 66 core systems.",
      },
      {
        fileId: "file-system-reg",
        pageIndex: 2,
        extractedText: "System numbers 01 to 66 have 84 subcomponents. Visual systems like Canvas and ReactFlow are integrated.",
      },
    ],
    extractedBlocks: [
      {
        id: "block-1",
        sourceFileId: "file-system-reg",
        type: "paragraph",
        content: "WhisperXWorkspace System Registry. Primary architecture contains 66 systems and 84 subsystems.",
      },
      {
        id: "block-2",
        sourceFileId: "file-system-reg",
        type: "table",
        content: "System ID | System Name | Subsystems Count | Status\nS01 | Intake Pipeline | 12 | Active\nS02 | Personal Agent Chat | 14 | Active\nS03 | Multi-Window Workspace (XDoc/XTools) | 28 | Active",
      },
    ],
    entities: [
      { id: "e-01", name: "Intake Hub", type: "Core Module", sourceFileId: "file-system-reg", relevance: 0.95 },
      { id: "e-02", name: "66 Systems", type: "Metric", sourceFileId: "file-system-reg", relevance: 1 },
      { id: "e-03", name: "84 Subsystems", type: "Metric", sourceFileId: "file-system-reg", relevance: 1 },
    ],
    summary: {
      id: "sum-system-reg",
      sourceFileId: "file-system-reg",
      text: "SystemRegistry_v4 defines the blueprint for WhisperXWorkspace, specifying 66 systems and 84 subsystems. Intake pathways and multi-agent roles are outlined.",
      keyPoints: [
        "Defines 66 interactive high-level business systems.",
        "Contains 84 tech subcomponets.",
        "Establishes structural limits for local & fallback Gemini operations.",
      ],
      sentiment: "Highly positive / Structured",
    },
    versions: [
      {
        id: "ver-sys-v1",
        name: "SystemRegistry_v4.pdf",
        content: "WhisperXWorkspace System Registry Core Outline. Primary hub registers 66 core systems.",
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        label: "Primary Baseline Version v1.0",
      },
      {
        id: "ver-sys-v2",
        name: "SystemRegistry_v4.pdf",
        content: `WhisperXWorkspace System Registry. This is version 4.0 of our alpha design spec.
Our architecture comprises exactly 66 primary business systems and 84 tightly-coupled technical subsystems.
Core subsystems are indexed into:
- System 01: Intake Hub & Source Upload pipeline
- System 02: Prompt Plan generator module
- System 03: Node Agent Orchestrator with Mascot Node Editor
- System 04: Visual Document workspaces (XDoc: docs, sheets, slides)
Performance specs mandate under 250ms latency for Local and Gemini Cloud fallback.`,
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        label: "Approved Alpha Spec Audit v2.0",
      }
    ],
  },
];

interface WorkspaceState {
  workspaces: WorkspaceRecord[];
  activeWorkspaceId: string;
  sourceFiles: SourceFileRecord[];
  activeFileId: string | null;
  activeTab: "home" | "agent" | "doc" | "tools" | "settings";
  activeDocSubTab: "docs" | "sheets" | "slides";
  artifacts: ArtifactRecord[];
  canvasScene: CanvasSceneRecord;
  graphScene: GraphSceneRecord;
  sheetData: {
    columns: string[];
    rows: Record<string, any>[];
  };
  deck: DeckRecord;
  reviewRecords: Record<string, ReviewRecord>; // fileId -> ReviewRecord
  readinessReports: Record<string, ReadinessReport>; // fileId -> ReadinessReport
  snapshots: SnapshotRecord[];
  jobs: JobRecord[];
  chatMessages: ChatMessage[];
  selectedAgents: string[];
  activeAgentId: string | null;
  
  // AI Config Provider Settings
  provider: "gemini" | "ollama";
  geminiApiKey: string;
  ollamaUrl: string;
  ollamaModel: string;
  fallbackMode: boolean;
  
  // App Idea Generation State
  generatedAppPlan: {
    idea: string;
    projectPlan: string[];
    fileStructure: string[];
    skeletonCode: string;
  } | null;

  // Toasts Notification system
  toasts: Array<{ id: string; message: string; type: "success" | "info" | "warn" }>;
  addToast: (message: string, type?: "success" | "info" | "warn") => void;
  removeToast: (id: string) => void;

  // Search indexing and CMDK command palette
  searchIndex: Array<{ id: string; type: "file" | "artifact"; title: string; subtitle: string; content: string }>;
  rebuildSearchIndex: () => void;

  // Real-time Telemetry Store
  telemetryStore: {
    activeJobsCount: number;
    completedJobsCount: number;
    activeAgentThreads: Array<{ agentId: string; role: string; task: string; timestamp: string }>;
    systemMetrics: {
      cpuLoad: number;
      ramUsage: number;
      ioSpeed: string;
    };
  };
  updateTelemetry: (updates: Partial<any>) => void;

  // Navigation and Selection
  setActiveWorkspaceId: (id: string) => void;
  setActiveTab: (tab: "home" | "agent" | "doc" | "tools" | "settings") => void;
  setActiveDocSubTab: (subTab: "docs" | "sheets" | "slides") => void;
  setActiveFileId: (id: string | null) => void;
  
  // Resource Actions
  addSourceFile: (file: SourceFileRecord) => void;
  updateSourceFile: (id: string, updates: Partial<SourceFileRecord>) => void;
  removeSourceFile: (id: string) => void;
  
  // Job Queue Actions
  addJob: (job: JobRecord) => void;
  updateJob: (id: string, updates: Partial<JobRecord>) => void;
  
  // Chat Actions
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  setSelectedAgents: (ids: string[]) => void;
  setActiveAgentId: (id: string | null) => void;
  
  // Config Actions
  setProvider: (provider: "gemini" | "ollama") => void;
  updateConfigSettings: (updates: {
    geminiApiKey?: string;
    ollamaUrl?: string;
    ollamaModel?: string;
    fallbackMode?: boolean;
  }) => void;
  
  // Canvas & Story Flow Actions
  updateCanvasScene: (shapes: any[], connectors: any[]) => void;
  updateGraphScene: (nodes: any[], edges: any[]) => void;
  
  // Tabulated Sheets Data Actions
  updateSheetData: (data: { columns: string[]; rows: Record<string, any>[] }) => void;
  
  // Reveal Document Deck Slides
  updateDeck: (deck: DeckRecord) => void;
  
  // Review System & Audits
  addCommentToReview: (fileId: string, comment: string, author: string) => void;
  updateReviewStatus: (fileId: string, status: "approved" | "rejected" | "pending") => void;
  updateReadinessReport: (fileId: string, report: ReadinessReport) => void;
  
  // State Restorations / History Snapshots
  createSnapshot: (name: string) => void;
  restoreSnapshot: (id: string) => void;

  setGeneratedAppPlan: (plan: any) => void;
  saveDocumentVersion: (fileId: string, label: string) => void;
  restoreDocumentVersion: (fileId: string, versionId: string) => void;

  lastSavedTime: number;
  agentPositions: Record<string, { x: number; y: number }>;
  updateAgentPosition: (agentId: string, x: number, y: number) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [
    {
      id: "ws-primary",
      name: "WhisperX Systems Laboratory",
      description: "Default workspace for compiling the 66 primary systems registry.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: { avatarColor: "emerald" },
    },
  ],
  activeWorkspaceId: "ws-primary",
  sourceFiles: initialFiles,
  activeFileId: "file-system-reg",
  activeTab: "home",
  activeDocSubTab: "docs",
  artifacts: [
    {
      id: "art-initial-plan",
      title: "66 Systems Deployment Map",
      type: "prompt-plan",
      data: JSON.stringify({
        project: "WhisperX Workspace Registry Expansion",
        steps: [
          "Setup secure fallback client logic",
          "Ingest SystemRegistry_v4 for OCR and table extraction",
          "Distill 84 subsystems parameters via Agent SAGE",
          "Build interactive layout slides visually",
        ],
      }),
      createdAt: new Date().toISOString(),
    },
  ],
  canvasScene: {
    id: "sc-default",
    workspaceId: "ws-primary",
    shapes: [
      { id: "sh-1", type: "rect", x: 60, y: 80, width: 140, height: 70, fill: "#047857", stroke: "#065f46", text: "Systems Ingestion Portal" },
      { id: "sh-2", type: "circle", x: 300, y: 115, width: 80, height: 80, fill: "#0369a1", stroke: "#075985", text: "Agent Gateway" },
      { id: "sh-3", type: "text", x: 190, y: 40, width: 120, height: 30, fill: "transparent", stroke: "transparent", text: "Interactive Pipeline" },
    ],
    connectors: [{ from: "sh-1", to: "sh-2" }],
    createdAt: new Date().toISOString(),
  },
  graphScene: {
    id: "g-default",
    nodes: [
      {
        id: "g-node-1",
        type: "ghost",
        position: { x: 150, y: 100 },
        data: { label: "ARIA Scout", color: "#10b981", variant: "scout", description: "Ingestion quality watchdog" },
      },
      {
        id: "g-node-2",
        type: "ghost",
        position: { x: 450, y: 180 },
        data: { label: "SAGE Commander", color: "#3b82f6", variant: "commander", description: "Logical pathway scheduler" },
      },
      {
        id: "g-node-3",
        type: "ghost",
        position: { x: 250, y: 320 },
        data: { label: "KODE Engineer", color: "#f59e0b", variant: "engineer", description: "Module builder ghost" },
      },
    ],
    edges: [
      { id: "edge-1-2", source: "g-node-1", target: "g-node-2", animated: true },
      { id: "edge-2-3", source: "g-node-2", target: "g-node-3", animated: true },
    ],
    createdAt: new Date().toISOString(),
  },
  sheetData: {
    columns: ["System ID", "Subsystem Unit", "Vulnerability Level", "Validation Check"],
    rows: [
      { "System ID": "SYS-001", "Subsystem Unit": "Asset OCR Scanner", "Vulnerability Level": "Low", "Validation Check": "Passed" },
      { "System ID": "SYS-002", "Subsystem Unit": "Mascot Lightning Engine", "Vulnerability Level": "None", "Validation Check": "Passed" },
      { "System ID": "SYS-003", "Subsystem Unit": "Document PPTX exporter", "Vulnerability Level": "Medium", "Validation Check": "Requires Re-Review" },
      { "System ID": "SYS-007", "Subsystem Unit": "Multi-agent coordinator", "Vulnerability Level": "None", "Validation Check": "Passed" },
    ],
  },
  deck: {
    id: "deck-default",
    title: "WhisperX Core Briefing v4",
    slides: [
      {
        id: "sl-1",
        title: "WhisperXWorkspace Overview",
        bulletPoints: [
          "Durable Cloud Workspace featuring multi-turn orchestration",
          "Automated file intakes with precise entity Extraction",
          "Comprehensive Mascot Node workflows linking 9 specialized ghost layers",
        ],
        layout: "title",
        background: "bg-slate-900",
      },
      {
        id: "sl-2",
        title: "The 66 Core Systems Registry",
        bulletPoints: [
          "Organized across structured functional registries",
          "Deduplicative OCR matching blocks and properties",
          "State persistence syncing instantly with inspection drawers",
        ],
        layout: "split",
        background: "bg-indigo-950",
      },
    ],
  },
  reviewRecords: {
    "file-system-reg": {
      id: "rev-sys",
      sourceFileId: "file-system-reg",
      score: 92,
      status: "pending",
      comments: [
        {
          id: "c-1",
          text: "SystemRegistry meets 64 out of 66 schema validators. Verified by ARIA.",
          author: "ARIA Agent",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: "c-2",
          text: "Minor styling and column formatting on Sheet block S02 needs auditing.",
          author: "LUMA Agent",
          timestamp: new Date().toISOString(),
        },
      ],
    },
  },
  readinessReports: {
    "file-system-reg": {
      id: "read-sys",
      blockers: [
        "System 02 lacks fallback configurations",
        "Subsystem 43 missing metadata signature",
      ],
      recommendations: [
        "Prompt SAGE to generate the project skeleton plan automatically",
        "Export slide v4 deck structure to slide template standard",
      ],
      score: 84,
      lastChecked: new Date().toISOString(),
    },
  },
  snapshots: [
    { id: "snap-1", name: "Alpha Baseline", stateSummary: "Loaded systems registries and initial 3 Ghost nodes set.", timestamp: new Date(Date.now() - 3600 * 1000).toISOString() },
  ],
  jobs: [
    { id: "job-initial-ocr", name: "OCR Registry Parsing", status: "completed", progress: 100, log: "Complete extraction - parsed metadata, summary, and sheets blocks successfully." },
  ],
  chatMessages: [
    { id: "msg-1", role: "system", content: "You are interacting with WhisperX Agent Hub. Select agents from your roster to orchestrate collaborative research with your files.", timestamp: new Date().toISOString() },
  ],
  selectedAgents: ["SAGE", "ARIA"],
  activeAgentId: "SAGE",
  
  // Default Settings Setup
  provider: "gemini",
  geminiApiKey: "",
  ollamaUrl: "http://localhost:11434",
  ollamaModel: "llama3",
  fallbackMode: true,
  generatedAppPlan: null,

  lastSavedTime: Date.now(),
  agentPositions: {
    ARIA: { x: 30, y: 30 },
    KODE: { x: 260, y: 30 },
    LUMA: { x: 490, y: 30 },
    SAGE: { x: 30, y: 210 },
    ECHO: { x: 260, y: 210 },
    NOVA: { x: 490, y: 210 },
    VIGI: { x: 30, y: 390 },
    ZARA: { x: 260, y: 390 },
    REX: { x: 490, y: 390 },
  },

  updateAgentPosition: (agentId, x, y) =>
    set((state) => ({
      agentPositions: {
        ...state.agentPositions,
        [agentId]: { x, y },
      },
    })),

  // Toasts
  toasts: [],
  addToast: (message, type = "info") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  // Search indexing and CMDK
  searchIndex: [],
  rebuildSearchIndex: () => {
    const { sourceFiles, artifacts } = get();
    const index: Array<{ id: string; type: "file" | "artifact"; title: string; subtitle: string; content: string }> = [];
    sourceFiles.forEach((f) => {
      index.push({
        id: f.id,
        type: "file",
        title: f.name,
        subtitle: `File • ${f.type} • ${(f.size / 1024).toFixed(1)} KB`,
        content: (f.extractedText || "") + " " + (f.content || ""),
      });
    });
    artifacts.forEach((art) => {
      index.push({
        id: art.id,
        type: "artifact",
        title: art.title,
        subtitle: `Artifact • ${art.type}`,
        content: art.data || "",
      });
    });
    set({ searchIndex: index });
  },

  // Telemetry Store
  telemetryStore: {
    activeJobsCount: 1,
    completedJobsCount: 8,
    activeAgentThreads: [
      { agentId: "SAGE", role: "Planning Coach", task: "Orchestrating File Systems Analysis", timestamp: new Date().toISOString() },
      { agentId: "ARIA", role: "Quality Watchdog", task: "Tesseract OCR queue listener active", timestamp: new Date().toISOString() },
    ],
    systemMetrics: {
      cpuLoad: 12,
      ramUsage: 35,
      ioSpeed: "94 MB/s"
    },
  },
  updateTelemetry: (updates) => set((state) => ({
    telemetryStore: {
      ...state.telemetryStore,
      ...updates,
    }
  })),

  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveDocSubTab: (subTab) => set({ activeDocSubTab: subTab }),
  setActiveFileId: (id) => set({ activeFileId: id }),
  
  addSourceFile: (file) => set((state) => ({ sourceFiles: [...state.sourceFiles, file], activeFileId: file.id })),
  updateSourceFile: (id, updates) =>
    set((state) => ({
      sourceFiles: state.sourceFiles.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),
  removeSourceFile: (id) =>
    set((state) => ({
      sourceFiles: state.sourceFiles.filter((f) => f.id !== id),
      activeFileId: state.activeFileId === id ? (state.sourceFiles[0]?.id || null) : state.activeFileId,
    })),
    
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  updateJob: (id, updates) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
    })),
    
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  clearChat: () => set({ chatMessages: [] }),
  setSelectedAgents: (ids) => set({ selectedAgents: ids }),
  setActiveAgentId: (id) => set({ activeAgentId: id }),
  
  setProvider: (provider) => set({ provider }),
  updateConfigSettings: (updates) =>
    set((state) => ({
      geminiApiKey: updates.geminiApiKey !== undefined ? updates.geminiApiKey : state.geminiApiKey,
      ollamaUrl: updates.ollamaUrl !== undefined ? updates.ollamaUrl : state.ollamaUrl,
      ollamaModel: updates.ollamaModel !== undefined ? updates.ollamaModel : state.ollamaModel,
      fallbackMode: updates.fallbackMode !== undefined ? updates.fallbackMode : state.fallbackMode,
    })),
    
  updateCanvasScene: (shapes, connectors) =>
    set((state) => ({
      canvasScene: { ...state.canvasScene, shapes, connectors },
    })),
  updateGraphScene: (nodes, edges) =>
    set((state) => ({
      graphScene: { ...state.graphScene, nodes, edges },
    })),
    
  updateSheetData: (sheetData) => set({ sheetData }),
  updateDeck: (deck) => set({ deck }),
  
  addCommentToReview: (fileId, text, author) =>
    set((state) => {
      const record = state.reviewRecords[fileId] || {
        id: `rev-${Date.now()}`,
        sourceFileId: fileId,
        score: 100,
        status: "pending",
        comments: [],
      };
      const newComment = {
        id: `comm-${Date.now()}`,
        text,
        author,
        timestamp: new Date().toISOString(),
      };
      const updatedRecord = {
        ...record,
        comments: [...record.comments, newComment],
      };
      return {
        reviewRecords: {
          ...state.reviewRecords,
          [fileId]: updatedRecord,
        },
      };
    }),
    
  updateReviewStatus: (fileId, status) =>
    set((state) => {
      const record = state.reviewRecords[fileId] || {
        id: `rev-${Date.now()}`,
        sourceFileId: fileId,
        score: 100,
        status: status,
        comments: [],
      };
      return {
        reviewRecords: {
          ...state.reviewRecords,
          [fileId]: { ...record, status },
        },
      };
    }),
    
  updateReadinessReport: (fileId, report) =>
    set((state) => ({
      readinessReports: {
        ...state.readinessReports,
        [fileId]: report,
      },
    })),
    
  createSnapshot: (name) =>
    set((state) => {
      const snap: SnapshotRecord = {
        id: `snap-${Date.now()}`,
        name,
        stateSummary: `Backup of ${state.sourceFiles.length} files. Nodes in workspace: ${state.graphScene.nodes.length}.`,
        timestamp: new Date().toISOString(),
      };
      return { snapshots: [snap, ...state.snapshots] };
    }),
    
  restoreSnapshot: (id) =>
    set((state) => {
      const target = state.snapshots.find((s) => s.id === id);
      if (!target) return {};
      // For rich visual interaction, we can add a job simulation
      const restoreJob: JobRecord = {
        id: `job-restore-${Date.now()}`,
        name: `Restoring Snapshot: ${target.name}`,
        status: "completed",
        progress: 100,
        log: "Restoration of state finished.",
      };
      return {
        jobs: [restoreJob, ...state.jobs],
      };
    }),

  setGeneratedAppPlan: (generatedAppPlan) => set({ generatedAppPlan }),

  saveDocumentVersion: (fileId, label) =>
    set((state) => {
      const file = state.sourceFiles.find((f) => f.id === fileId);
      if (!file) return {};
      
      const versions = (file as any).versions || [];
      const newVersion = {
        id: `ver-${Date.now()}`,
        name: file.name,
        content: file.extractedText || "",
        timestamp: new Date().toISOString(),
        label: label || `Manual checkpoint ${versions.length + 1}`,
      };
      
      const updatedFiles = state.sourceFiles.map((f) => {
        if (f.id === fileId) {
          return {
            ...f,
            versions: [newVersion, ...versions],
          };
        }
        return f;
      });

      return { sourceFiles: updatedFiles };
    }),

  restoreDocumentVersion: (fileId, versionId) =>
    set((state) => {
      const file = state.sourceFiles.find((f) => f.id === fileId);
      if (!file) return {};

      const versions = (file as any).versions || [];
      const target = versions.find((v: any) => v.id === versionId);
      if (!target) return {};

      const updatedFiles = state.sourceFiles.map((f) => {
        if (f.id === fileId) {
          return {
            ...f,
            extractedText: target.content,
          };
        }
        return f;
      });

      return { sourceFiles: updatedFiles };
    }),
}));

// Auto-hydration from localStorage on startup (with try-catch safety)
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("whisperx_workspace_state");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Hydrate state
      useWorkspaceStore.setState({
        sourceFiles: parsed.sourceFiles || useWorkspaceStore.getState().sourceFiles,
        artifacts: parsed.artifacts || useWorkspaceStore.getState().artifacts,
        canvasScene: parsed.canvasScene || useWorkspaceStore.getState().canvasScene,
        graphScene: parsed.graphScene || useWorkspaceStore.getState().graphScene,
        sheetData: parsed.sheetData || useWorkspaceStore.getState().sheetData,
        deck: parsed.deck || useWorkspaceStore.getState().deck,
        reviewRecords: parsed.reviewRecords || useWorkspaceStore.getState().reviewRecords,
        readinessReports: parsed.readinessReports || useWorkspaceStore.getState().readinessReports,
        chatMessages: parsed.chatMessages || useWorkspaceStore.getState().chatMessages,
        provider: parsed.provider || useWorkspaceStore.getState().provider,
        geminiApiKey: parsed.geminiApiKey || useWorkspaceStore.getState().geminiApiKey,
        ollamaUrl: parsed.ollamaUrl || useWorkspaceStore.getState().ollamaUrl,
        ollamaModel: parsed.ollamaModel || useWorkspaceStore.getState().ollamaModel,
        fallbackMode: parsed.fallbackMode !== undefined ? parsed.fallbackMode : useWorkspaceStore.getState().fallbackMode,
        agentPositions: parsed.agentPositions || useWorkspaceStore.getState().agentPositions,
      });
      console.log("WhisperXWorkspace state hydrated from LocalStorage.");
    }
  } catch (err) {
    console.error("WhisperXWorkspace state hydration error", err);
  }

  // Build search index initially!
  useWorkspaceStore.getState().rebuildSearchIndex();
}

// Auto-save subscriber & Toast connector
let lastSavedString = "";
if (typeof window !== "undefined") {
  useWorkspaceStore.subscribe((state) => {
    try {
      const dataToSave = {
        sourceFiles: state.sourceFiles,
        artifacts: state.artifacts,
        canvasScene: state.canvasScene,
        graphScene: state.graphScene,
        sheetData: state.sheetData,
        deck: state.deck,
        reviewRecords: state.reviewRecords,
        readinessReports: state.readinessReports,
        chatMessages: state.chatMessages,
        selectedAgents: state.selectedAgents,
        activeAgentId: state.activeAgentId,
        provider: state.provider,
        geminiApiKey: state.geminiApiKey,
        ollamaUrl: state.ollamaUrl,
        ollamaModel: state.ollamaModel,
        fallbackMode: state.fallbackMode,
        agentPositions: state.agentPositions,
      };
      const stringified = JSON.stringify(dataToSave);
      if (stringified === lastSavedString) return;
      lastSavedString = stringified;

      localStorage.setItem("whisperx_workspace_state", stringified);
      
      // Auto-rebuild the search filter index
      state.rebuildSearchIndex();

      // Trigger automatic save toast status notification
      state.addToast(`Autosaved Workspace State (${state.sourceFiles.length} files, ${state.artifacts.length} artifacts)`, "success");

      // Stamp the sync time to flash visual indicator in real-time
      useWorkspaceStore.setState({ lastSavedTime: Date.now() });
    } catch (err) {
      console.error("Local storage auto-save failure:", err);
    }
  });
}

