export interface WorkspaceRecord {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  settings: {
    avatarColor?: string;
  };
}

export interface PageRecord {
  fileId: string;
  pageIndex: number;
  extractedText: string;
  imageBase64?: string;
}

export interface ExtractedBlockRecord {
  id: string;
  sourceFileId: string;
  type: "paragraph" | "table" | "visual" | "header" | "footer";
  content: string;
  metadata?: any;
}

export interface EntityRecord {
  id: string;
  name: string;
  type: string; // e.g. "Person", "Date", "Location", "Metric"
  sourceFileId: string;
  relevance: number; // 0 to 1
}

export interface SummaryRecord {
  id: string;
  sourceFileId: string;
  text: string;
  keyPoints: string[];
  sentiment?: string;
}

export interface SourceFileRecord {
  id: string;
  name: string;
  size: number;
  type: string; // e.g. "application/pdf" | "image/png" | "text/plain"
  ocrStatus: "pending" | "processing" | "completed" | "failed";
  metadata: {
    author?: string;
    keywords?: string[];
    language?: string;
    wordCount?: number;
    dimensions?: string;
  };
  extractedText: string;
  content?: string; // OCR text content update field
  rawContent?: string; // Standard source/base64 representation
  uploadedAt: string;
  pages: PageRecord[];
  extractedBlocks: ExtractedBlockRecord[];
  entities: EntityRecord[];
  summary?: SummaryRecord;
  versions?: any[];
}

export interface ArtifactRecord {
  id: string;
  title: string;
  type: "code" | "layout" | "document" | "prompt-plan";
  data: string; // JSON or markup representing the draft code structure / plan
  createdAt: string;
}

export interface CanvasShape {
  id: string;
  type: "rect" | "circle" | "text" | "arrow";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  text?: string;
}

export interface CanvasSceneRecord {
  id: string;
  workspaceId: string;
  shapes: CanvasShape[];
  connectors: { from: string; to: string }[];
  createdAt: string;
}

export interface GhostNodeData {
  label: string;
  color: string;
  variant: "scout" | "engineer" | "commander" | "sage";
  description?: string;
  status?: string;
  agentId?: string;
}

export interface GraphNode {
  id: string;
  type: "ghost";
  position: { x: number; y: number };
  data: GhostNodeData;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  type?: "lightning";
}

export interface GraphSceneRecord {
  id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  createdAt: string;
}

export interface ChartSpecRecord {
  id: string;
  title: string;
  type: "bar" | "line" | "pie" | "scatter";
  config: {
    xAxisKey: string;
    dataKeys: string[];
    colors: string[];
  };
  data: Record<string, any>[];
}

export interface DeckRecord {
  id: string;
  title: string;
  slides: {
    id: string;
    title: string;
    bulletPoints: string[];
    layout: "title" | "split" | "text" | "dark-accent";
    background?: string;
  }[];
}

export interface ReviewComment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

export interface ReviewRecord {
  id: string;
  sourceFileId: string;
  score: number; // 0 - 100
  comments: ReviewComment[];
  status: "approved" | "rejected" | "pending";
}

export interface ReadinessReport {
  id: string;
  blockers: string[];
  recommendations: string[];
  score: number; // 0 - 100
  lastChecked: string;
}

export interface SnapshotRecord {
  id: string;
  name: string;
  stateSummary: string;
  timestamp: string;
}

export interface JobRecord {
  id: string;
  name: string;
  status: "running" | "completed" | "failed";
  progress: number; // 0 - 100
  log?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "system";
  agentId?: string;
  content: string;
  timestamp: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string; // emoji or CSS
  persona: string;
  status: "idle" | "typing" | "assigned";
  skills: string[];
}
