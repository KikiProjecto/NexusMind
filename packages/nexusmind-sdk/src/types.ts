export type AgentRole = 'orchestrator' | 'researcher' | 'trader' | 'monitor';
export type ArtifactType = 'report' | 'signal' | 'log' | 'dataset' | 'summary';
export type WorkflowState = 'pending' | 'running' | 'completed' | 'failed';
export type WalrusNetwork = 'testnet' | 'mainnet';

export interface AgentConfig {
  agentAddress: string;
  privateKey: string;
  role: AgentRole;
  namespace: string;
  memwalConfig: MemWalConfig;
  walrusConfig: WalrusConfig;
  sealConfig: SealConfig;
  suiConfig: SuiConfig;
}

export interface MemWalConfig {
  delegateKey: string;
  accountId: string;
  serverUrl: string;
  namespace: string;
}

export interface WalrusConfig {
  network: WalrusNetwork;
  publisherUrl: string;
  aggregatorUrl: string;
}

export interface SealConfig {
  keyServerUrls: string[];
  policyId?: string;
}

export interface SuiConfig {
  network: string;
  rpcUrl: string;
  packageId: string;
  registryId: string;
}

export interface Memory {
  id: string;
  content: string;
  timestamp: number;
  namespace: string;
  similarity?: number;
}

export interface Artifact {
  blobId: string;
  type: ArtifactType;
  taskId: string;
  workflowId?: string;
  agentAddress: string;
  createdAt: number;
  isEncrypted: boolean;
  sealPolicyId?: string;
  onchainObjectId?: string;
  metadata?: Record<string, string>;
}

export interface WorkflowTask {
  id: string;
  description: string;
  assignedAgent: AgentRole;
  status: 'pending' | 'running' | 'completed' | 'failed';
  artifacts: Artifact[];
  startedAt?: number;
  completedAt?: number;
  error?: string;
}

export interface NexusMindError extends Error {
  code: string;
  context?: Record<string, unknown>;
  cause?: Error;
}

export class MemoryError extends Error implements NexusMindError {
  code = 'MEMORY_ERROR';
  constructor(message: string, public context?: Record<string, unknown>, public cause?: Error) {
    super(message);
    this.name = 'MemoryError';
  }
}

export class ArtifactError extends Error implements NexusMindError {
  code = 'ARTIFACT_ERROR';
  constructor(message: string, public context?: Record<string, unknown>, public cause?: Error) {
    super(message);
    this.name = 'ArtifactError';
  }
}

export class SealError extends Error implements NexusMindError {
  code = 'SEAL_ERROR';
  constructor(message: string, public context?: Record<string, unknown>, public cause?: Error) {
    super(message);
    this.name = 'SealError';
  }
}
