/* ─── Agent Status ─── */
export const AGENT_STATUSES = ['active', 'idle', 'error', 'offline'] as const;
export type AgentStatus = (typeof AGENT_STATUSES)[number];

/* ─── Agent Roles ─── */
export const AGENT_ROLES = ['orchestrator', 'researcher', 'trader', 'monitor'] as const;
export type AgentRole = (typeof AGENT_ROLES)[number];

/* ─── Namespaces ─── */
export const NAMESPACES = [
  'all',
  'nexusmind-orchestrator-v1',
  'nexusmind-researcher-v1',
  'nexusmind-trader-v1',
  'nexusmind-monitor-v1',
] as const;
export type Namespace = (typeof NAMESPACES)[number];

/* ─── Memory ─── */
export interface Memory {
  id: string;
  content: string;
  namespace: Namespace;
  timestamp: string;
  blobId: string | null;
  metadata: Record<string, string>;
}

export interface MemorySearchResult {
  memory: Memory;
  similarity: number;
}

/* ─── Artifact ─── */
export const ARTIFACT_TYPES = ['report', 'signal', 'log', 'dataset'] as const;
export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

export interface ArtifactRecord {
  id: string;
  blobId: string;
  agentAddress: string;
  agentRole: AgentRole;
  artifactType: ArtifactType;
  taskId: string;
  createdAt: string;
  sizeBytes: number;
  encrypted: boolean;
  metadata: Record<string, string>;
}

/* ─── Workflow ─── */
export const WORKFLOW_STATES = ['pending', 'running', 'completed', 'failed'] as const;
export type WorkflowState = (typeof WORKFLOW_STATES)[number];

export const TASK_STATES = ['queued', 'running', 'completed', 'failed', 'skipped'] as const;
export type TaskState = (typeof TASK_STATES)[number];

export interface WorkflowTask {
  id: string;
  name: string;
  agentRole: AgentRole;
  state: TaskState;
  startedAt: string | null;
  completedAt: string | null;
  artifactIds: string[];
  error: string | null;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  state: WorkflowState;
  agents: string[];
  tasks: WorkflowTask[];
  artifactIds: string[];
  createdAt: string;
  updatedAt: string;
}

/* ─── Agent ─── */
export interface Agent {
  id: string;
  role: AgentRole;
  address: string;
  status: AgentStatus;
  namespace: Namespace;
  artifactCount: number;
  memoryCount: number;
  lastActive: string;
  capabilities: string[];
  metrics: AgentMetrics;
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksRunning: number;
  avgResponseMs: number;
  uptime: number;
}

/* ─── Stats ─── */
export interface StatsData {
  memoriesStored: number;
  artifactsCreated: number;
  workflowsExecuted: number;
  agentsActive: number;
}

/* ─── Generic Data State ─── */
export type DataState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'empty' }
  | { status: 'success'; data: T };

/* ─── API Response ─── */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}

/* ─── Navigation ─── */
export interface NavLink {
  href: string;
  label: string;
  id: string;
}
