# PRD.md — NexusMind Product Requirements Document

> **Complete technical specification for every module, feature, API, and infrastructure component.**
> Agents must read AGENTS.md before this file. Every requirement here is non-negotiable for a winning submission.

---

## 1. PRODUCT OVERVIEW

### 1.1 Vision
NexusMind is a verifiable, decentralized multi-agent coordination platform. It solves the fundamental problem of agent statelessness by providing cryptographically owned, portable, persistent memory — backed by MemWal (Walrus Memory), stored on Walrus, encrypted by Seal, coordinated through Sui Stack Messaging, and verified onchain by Sui smart contracts.

### 1.2 Target Users
- **Primary:** Hackathon judges evaluating Walrus track submissions
- **Secondary:** Web3 developers building production AI agent systems
- **Tertiary:** Researchers studying decentralized AI coordination

### 1.3 Success Criteria
- [ ] Research agent runs end-to-end: task → recall context → execute → store artifact → remember
- [ ] Trading agent successfully reads research output from shared namespace
- [ ] Memory `restore()` demo works: wipe local index, rebuild from Walrus, recall succeeds
- [ ] Seal encryption verified: unauthorized agent cannot decrypt sealed artifact
- [ ] Dashboard shows live memory browser, artifact viewer, workflow status
- [ ] Move package deployed to Sui testnet with all contracts functional
- [ ] SDK published as npm package with README and code examples
- [ ] Zero TypeScript errors, zero lint warnings in CI

---

## 2. MOVE SMART CONTRACTS

### 2.1 `agent_registry.move`

**Purpose:** Register agents, manage capabilities and roles.

```move
module nexusmind::agent_registry {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::{Self, String};
    use sui::vec_map::{Self, VecMap};
    use sui::clock::{Self, Clock};

    // === Errors ===
    const E_NOT_ADMIN: u64 = 1;
    const E_AGENT_ALREADY_REGISTERED: u64 = 2;
    const E_AGENT_NOT_FOUND: u64 = 3;
    const E_INVALID_ROLE: u64 = 4;

    // === Constants ===
    const ROLE_ORCHESTRATOR: vector<u8> = b"orchestrator";
    const ROLE_RESEARCHER: vector<u8> = b"researcher";
    const ROLE_TRADER: vector<u8> = b"trader";
    const ROLE_MONITOR: vector<u8> = b"monitor";

    // === Objects ===
    public struct AdminCap has key, store { id: UID }

    public struct AgentRegistry has key {
        id: UID,
        agents: VecMap<address, AgentInfo>,
        total_registered: u64,
    }

    public struct AgentInfo has store, copy, drop {
        role: String,
        namespace: String,
        registered_at: u64,
        is_active: bool,
        artifact_count: u64,
    }

    public struct AgentCap has key, store {
        id: UID,
        agent_address: address,
        role: String,
        namespace: String,
    }

    // === Events ===
    public struct AgentRegistered has copy, drop {
        agent_address: address,
        role: String,
        namespace: String,
        timestamp: u64,
    }

    public struct AgentDeactivated has copy, drop {
        agent_address: address,
        timestamp: u64,
    }

    // === Init ===
    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap { id: object::new(ctx) };
        transfer::transfer(admin_cap, tx_context::sender(ctx));

        let registry = AgentRegistry {
            id: object::new(ctx),
            agents: vec_map::empty(),
            total_registered: 0,
        };
        transfer::share_object(registry);
    }

    // === Public Functions ===
    public fun register_agent(
        _admin: &AdminCap,
        registry: &mut AgentRegistry,
        agent_address: address,
        role: String,
        namespace: String,
        clock: &Clock,
        ctx: &mut TxContext,
    ): AgentCap {
        assert!(
            !vec_map::contains(&registry.agents, &agent_address),
            E_AGENT_ALREADY_REGISTERED
        );

        let info = AgentInfo {
            role: role,
            namespace: namespace,
            registered_at: clock::timestamp_ms(clock),
            is_active: true,
            artifact_count: 0,
        };

        vec_map::insert(&mut registry.agents, agent_address, info);
        registry.total_registered = registry.total_registered + 1;

        event::emit(AgentRegistered {
            agent_address,
            role: role,
            namespace: namespace,
            timestamp: clock::timestamp_ms(clock),
        });

        AgentCap {
            id: object::new(ctx),
            agent_address,
            role: role,
            namespace: namespace,
        }
    }

    public fun increment_artifact_count(
        cap: &AgentCap,
        registry: &mut AgentRegistry,
    ) {
        let info = vec_map::get_mut(&mut registry.agents, &cap.agent_address);
        info.artifact_count = info.artifact_count + 1;
    }

    // === View Functions ===
    public fun get_agent_info(
        registry: &AgentRegistry,
        agent_address: address,
    ): &AgentInfo {
        vec_map::get(&registry.agents, &agent_address)
    }

    public fun agent_count(registry: &AgentRegistry): u64 {
        registry.total_registered
    }
}
```

### 2.2 `artifact_record.move`

**Purpose:** Link Walrus blob_ids to agent identities onchain. Immutable provenance record.

```move
module nexusmind::artifact_record {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::String;
    use sui::vec_map::{Self, VecMap};
    use sui::clock::{Self, Clock};
    use nexusmind::agent_registry::AgentCap;

    // === Errors ===
    const E_UNAUTHORIZED: u64 = 1;
    const E_INVALID_TYPE: u64 = 2;

    // === Objects ===
    public struct AgentArtifact has key, store {
        id: UID,
        blob_id: u256,                      // Walrus blob ID (content-addressed)
        walrus_object_id: address,          // Sui object ID of Walrus blob registration
        agent_address: address,
        agent_role: String,
        artifact_type: String,              // "report" | "signal" | "log" | "dataset" | "summary"
        task_id: String,
        workflow_id: address,
        is_encrypted: bool,                 // true if sealed with Seal
        seal_policy_id: address,            // Seal policy object ID (if encrypted)
        created_epoch: u64,
        created_at_ms: u64,
        content_hash: vector<u8>,           // SHA3-256 of plaintext content
        metadata: VecMap<String, String>,   // Arbitrary key-value metadata
    }

    public struct ArtifactRegistry has key {
        id: UID,
        total_artifacts: u64,
    }

    // === Events ===
    public struct ArtifactCreated has copy, drop {
        artifact_id: ID,
        blob_id: u256,
        agent_address: address,
        artifact_type: String,
        task_id: String,
        is_encrypted: bool,
        timestamp: u64,
    }

    fun init(ctx: &mut TxContext) {
        transfer::share_object(ArtifactRegistry {
            id: object::new(ctx),
            total_artifacts: 0,
        });
    }

    public fun record_artifact(
        cap: &AgentCap,
        registry: &mut ArtifactRegistry,
        blob_id: u256,
        walrus_object_id: address,
        artifact_type: String,
        task_id: String,
        workflow_id: address,
        is_encrypted: bool,
        seal_policy_id: address,
        content_hash: vector<u8>,
        metadata: VecMap<String, String>,
        clock: &Clock,
        ctx: &mut TxContext,
    ): AgentArtifact {
        let artifact = AgentArtifact {
            id: object::new(ctx),
            blob_id,
            walrus_object_id,
            agent_address: nexusmind::agent_registry::agent_cap_address(cap),
            agent_role: nexusmind::agent_registry::agent_cap_role(cap),
            artifact_type,
            task_id,
            workflow_id,
            is_encrypted,
            seal_policy_id,
            created_epoch: tx_context::epoch(ctx),
            created_at_ms: clock::timestamp_ms(clock),
            content_hash,
            metadata,
        };

        event::emit(ArtifactCreated {
            artifact_id: object::id(&artifact),
            blob_id,
            agent_address: artifact.agent_address,
            artifact_type: artifact.artifact_type,
            task_id: artifact.task_id,
            is_encrypted,
            timestamp: clock::timestamp_ms(clock),
        });

        registry.total_artifacts = registry.total_artifacts + 1;
        artifact
    }
}
```

### 2.3 `seal_policies.move`

**Purpose:** Define Seal `seal_approve` functions for access-controlled artifact sharing.

```move
module nexusmind::seal_policies {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::vector;
    use nexusmind::agent_registry::{Self, AgentCap, AgentRegistry};

    // === Objects ===
    public struct AgentAllowlist has key, store {
        id: UID,
        name: vector<u8>,
        allowed_agents: vector<address>,
        owner: address,
    }

    // === Errors ===
    const E_NOT_ALLOWED: u64 = 1;
    const E_NOT_OWNER: u64 = 2;

    public fun create_allowlist(
        name: vector<u8>,
        ctx: &mut TxContext,
    ): AgentAllowlist {
        AgentAllowlist {
            id: object::new(ctx),
            name,
            allowed_agents: vector::empty(),
            owner: tx_context::sender(ctx),
        }
    }

    public fun add_agent(
        allowlist: &mut AgentAllowlist,
        agent_address: address,
        ctx: &TxContext,
    ) {
        assert!(allowlist.owner == tx_context::sender(ctx), E_NOT_OWNER);
        if (!vector::contains(&allowlist.allowed_agents, &agent_address)) {
            vector::push_back(&mut allowlist.allowed_agents, agent_address);
        }
    }

    // seal_approve entry — called by Seal key servers
    // This is what Seal calls to verify access rights
    entry fun seal_approve(
        id: vector<u8>,
        allowlist: &AgentAllowlist,
        ctx: &TxContext,
    ) {
        let caller = tx_context::sender(ctx);
        assert!(
            vector::contains(&allowlist.allowed_agents, &caller) || 
            allowlist.owner == caller,
            E_NOT_ALLOWED
        );
    }
}
```

### 2.4 `workflow.move`

**Purpose:** Onchain workflow state machine tracking multi-agent task execution.

```move
module nexusmind::workflow {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::String;
    use std::vector;
    use sui::clock::{Self, Clock};
    use nexusmind::agent_registry::AgentCap;

    // === State Constants ===
    const STATE_PENDING: u8 = 0;
    const STATE_RUNNING: u8 = 1;
    const STATE_COMPLETED: u8 = 2;
    const STATE_FAILED: u8 = 3;

    // === Objects ===
    public struct Workflow has key {
        id: UID,
        name: String,
        description: String,
        state: u8,
        orchestrator: address,
        assigned_agents: vector<address>,
        artifact_ids: vector<ID>,
        task_count: u64,
        completed_tasks: u64,
        created_at: u64,
        updated_at: u64,
        error_message: vector<u8>,
    }

    // === Events ===
    public struct WorkflowCreated has copy, drop {
        workflow_id: ID,
        name: String,
        orchestrator: address,
        timestamp: u64,
    }

    public struct WorkflowStateChanged has copy, drop {
        workflow_id: ID,
        old_state: u8,
        new_state: u8,
        timestamp: u64,
    }

    public struct ArtifactLinked has copy, drop {
        workflow_id: ID,
        artifact_id: ID,
        agent_address: address,
        timestamp: u64,
    }

    // Full CRUD operations implemented...
    // (create, update_state, link_artifact, assign_agent, complete, fail)
}
```

---

## 3. SDK — `packages/nexusmind-sdk`

### 3.1 `src/types.ts` — All Type Definitions

```typescript
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
```

### 3.2 `src/memory.ts` — MemWal Abstraction Layer

```typescript
import { MemWal } from '@mysten-incubation/memwal';
import { MemoryError, type Memory, type MemWalConfig } from './types';
import { logger } from './lib/logger';
import { z } from 'zod';

const MemorySchema = z.object({
  id: z.string(),
  content: z.string(),
  timestamp: z.number(),
  namespace: z.string(),
  similarity: z.number().optional(),
});

export class AgentMemory {
  private client: ReturnType<typeof MemWal.create>;
  private namespace: string;

  constructor(config: MemWalConfig) {
    this.namespace = config.namespace;
    this.client = MemWal.create({
      key: config.delegateKey,
      accountId: config.accountId,
      serverUrl: config.serverUrl,
      namespace: config.namespace,
    });
  }

  async remember(content: string): Promise<void> {
    try {
      if (!content || content.trim().length === 0) {
        throw new MemoryError('Content cannot be empty', { namespace: this.namespace });
      }
      await this.client.remember(content);
      logger.info('Memory stored', {
        namespace: this.namespace,
        contentLength: content.length,
        preview: content.slice(0, 100),
      });
    } catch (error) {
      if (error instanceof MemoryError) throw error;
      throw new MemoryError(
        `Failed to store memory: ${error instanceof Error ? error.message : 'unknown'}`,
        { namespace: this.namespace, contentPreview: content.slice(0, 50) },
        error instanceof Error ? error : undefined,
      );
    }
  }

  async recall(query: string, options: { limit?: number } = {}): Promise<Memory[]> {
    try {
      const limit = options.limit ?? 5;
      const raw = await this.client.recall(query, { limit });
      
      if (!raw || !Array.isArray(raw)) return [];

      return raw.map((item: unknown) => {
        const parsed = MemorySchema.safeParse(item);
        if (!parsed.success) {
          logger.warn('Invalid memory shape from MemWal', { item, errors: parsed.error.issues });
          return null;
        }
        return parsed.data;
      }).filter((m): m is Memory => m !== null);
    } catch (error) {
      throw new MemoryError(
        `Recall failed for query "${query}": ${error instanceof Error ? error.message : 'unknown'}`,
        { namespace: this.namespace, query },
        error instanceof Error ? error : undefined,
      );
    }
  }

  async analyze(text: string): Promise<string> {
    try {
      return await this.client.analyze(text);
    } catch (error) {
      throw new MemoryError(
        `Analysis failed: ${error instanceof Error ? error.message : 'unknown'}`,
        { namespace: this.namespace, textLength: text.length },
        error instanceof Error ? error : undefined,
      );
    }
  }

  async ask(question: string): Promise<string> {
    try {
      return await this.client.ask(question);
    } catch (error) {
      throw new MemoryError(
        `Ask failed for "${question}": ${error instanceof Error ? error.message : 'unknown'}`,
        { namespace: this.namespace, question },
        error instanceof Error ? error : undefined,
      );
    }
  }

  async restore(namespace?: string, limit?: number): Promise<{ restored: number; skipped: number }> {
    try {
      const targetNamespace = namespace ?? this.namespace;
      logger.info('Starting memory restore', { namespace: targetNamespace });
      const result = await this.client.restore(targetNamespace, limit ?? 100);
      logger.info('Memory restore complete', { ...result, namespace: targetNamespace });
      return result;
    } catch (error) {
      throw new MemoryError(
        `Restore failed: ${error instanceof Error ? error.message : 'unknown'}`,
        { namespace: namespace ?? this.namespace },
        error instanceof Error ? error : undefined,
      );
    }
  }
}
```

### 3.3 `src/artifacts.ts` — Walrus Blob Management

```typescript
import { WalrusClient } from '@mysten/walrus';
import { ArtifactError, type Artifact, type ArtifactType, type WalrusConfig } from './types';
import { logger } from './lib/logger';
import crypto from 'node:crypto';

export class ArtifactManager {
  private client: WalrusClient;
  private config: WalrusConfig;

  constructor(config: WalrusConfig) {
    this.config = config;
    this.client = new WalrusClient({
      network: config.network,
      publisherUrl: config.publisherUrl,
      aggregatorUrl: config.aggregatorUrl,
    });
  }

  async upload(
    data: Uint8Array | string,
    options: {
      type: ArtifactType;
      taskId: string;
      epochs?: number;
      metadata?: Record<string, string>;
    },
  ): Promise<{ blobId: string; contentHash: string }> {
    try {
      const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
      
      // Content-hash for onchain record
      const contentHash = crypto.createHash('sha3-256').update(bytes).digest('hex');
      
      const result = await this.client.uploadBlob(bytes, {
        epochs: options.epochs ?? 10,
      });

      logger.info('Artifact uploaded to Walrus', {
        blobId: result.blobId,
        size: bytes.length,
        epochs: options.epochs ?? 10,
        type: options.type,
        taskId: options.taskId,
      });

      return { blobId: result.blobId, contentHash };
    } catch (error) {
      throw new ArtifactError(
        `Upload failed: ${error instanceof Error ? error.message : 'unknown'}`,
        { type: options.type, taskId: options.taskId },
        error instanceof Error ? error : undefined,
      );
    }
  }

  async download(blobId: string): Promise<Uint8Array> {
    try {
      const data = await this.client.readBlob(blobId);
      logger.info('Artifact downloaded from Walrus', { blobId, size: data.length });
      return data;
    } catch (error) {
      throw new ArtifactError(
        `Download failed for blob ${blobId}: ${error instanceof Error ? error.message : 'unknown'}`,
        { blobId },
        error instanceof Error ? error : undefined,
      );
    }
  }

  async uploadBatch(
    files: Array<{ name: string; data: Uint8Array }>,
    options: { taskId: string; epochs?: number },
  ): Promise<string> {
    // Use Walrus Quilt for batch uploads — cost-optimized
    try {
      const quiltData = this.packQuilt(files);
      const result = await this.client.uploadBlob(quiltData, {
        epochs: options.epochs ?? 10,
      });
      logger.info('Batch artifacts uploaded via Quilt', {
        blobId: result.blobId,
        fileCount: files.length,
        taskId: options.taskId,
      });
      return result.blobId;
    } catch (error) {
      throw new ArtifactError(
        `Batch upload failed: ${error instanceof Error ? error.message : 'unknown'}`,
        { fileCount: files.length, taskId: options.taskId },
        error instanceof Error ? error : undefined,
      );
    }
  }

  private packQuilt(files: Array<{ name: string; data: Uint8Array }>): Uint8Array {
    // Simple quilt format: [4-byte count][for each: 4-byte name-len][name bytes][4-byte data-len][data bytes]
    const parts: Uint8Array[] = [];
    const count = new Uint8Array(new Uint32Array([files.length]).buffer);
    parts.push(count);

    for (const file of files) {
      const nameBytes = new TextEncoder().encode(file.name);
      const nameLen = new Uint8Array(new Uint32Array([nameBytes.length]).buffer);
      const dataLen = new Uint8Array(new Uint32Array([file.data.length]).buffer);
      parts.push(nameLen, nameBytes, dataLen, file.data);
    }

    const total = parts.reduce((acc, p) => acc + p.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
      result.set(part, offset);
      offset += part.length;
    }
    return result;
  }
}
```

### 3.4 `src/agent.ts` — Main Agent Class

```typescript
import { AgentMemory } from './memory';
import { ArtifactManager } from './artifacts';
import { SealManager } from './seal';
import { SuiManager } from './sui';
import type { AgentConfig, AgentRole, ArtifactType, Memory, Artifact } from './types';
import { logger } from './lib/logger';

export class NexusMindAgent {
  private memory: AgentMemory;
  private artifacts: ArtifactManager;
  private seal: SealManager;
  private sui: SuiManager;
  readonly config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    this.memory = new AgentMemory(config.memwalConfig);
    this.artifacts = new ArtifactManager(config.walrusConfig);
    this.seal = new SealManager(config.sealConfig, config.agentAddress, config.privateKey);
    this.sui = new SuiManager(config.suiConfig, config.privateKey);
  }

  // Core: recall relevant context before executing a task
  async loadContext(query: string, limit = 5): Promise<Memory[]> {
    logger.info('Loading agent context', {
      agent: this.config.agentAddress,
      role: this.config.role,
      query,
    });
    return this.memory.recall(query, { limit });
  }

  // Core: remember the outcome of a completed task
  async commitResult(summary: string, blobId?: string): Promise<void> {
    const fullMemory = blobId
      ? `${summary} [Walrus Blob: ${blobId}]`
      : summary;
    await this.memory.remember(fullMemory);
    logger.info('Result committed to memory', {
      agent: this.config.agentAddress,
      blobId,
      summaryLength: summary.length,
    });
  }

  // Store artifact publicly on Walrus
  async storeArtifact(
    content: string,
    type: ArtifactType,
    taskId: string,
    options: { epochs?: number; registerOnchain?: boolean } = {},
  ): Promise<Artifact> {
    const bytes = new TextEncoder().encode(content);
    const { blobId, contentHash } = await this.artifacts.upload(bytes, {
      type,
      taskId,
      epochs: options.epochs,
    });

    let onchainObjectId: string | undefined;
    if (options.registerOnchain !== false) {
      onchainObjectId = await this.sui.recordArtifact({
        blobId,
        contentHash,
        artifactType: type,
        taskId,
        isEncrypted: false,
      });
    }

    const artifact: Artifact = {
      blobId,
      type,
      taskId,
      agentAddress: this.config.agentAddress,
      createdAt: Date.now(),
      isEncrypted: false,
      onchainObjectId,
    };

    // Cross-reference in memory
    await this.commitResult(
      `Stored ${type} artifact for task ${taskId}.`,
      blobId,
    );

    return artifact;
  }

  // Store artifact encrypted with Seal
  async storePrivateArtifact(
    content: string,
    type: ArtifactType,
    taskId: string,
    allowlistId: string,
    options: { epochs?: number } = {},
  ): Promise<Artifact> {
    // Seal-encrypt, then upload to Walrus
    const bytes = new TextEncoder().encode(content);
    const { encryptedData, sealedKey } = await this.seal.encryptForAllowlist(
      bytes,
      allowlistId,
    );

    // Package encrypted data + sealed key together
    const bundle = JSON.stringify({
      encryptedData: Buffer.from(encryptedData).toString('base64'),
      sealedKey: Buffer.from(sealedKey).toString('base64'),
      policyId: allowlistId,
    });

    const { blobId, contentHash } = await this.artifacts.upload(
      new TextEncoder().encode(bundle),
      { type, taskId, epochs: options.epochs },
    );

    const onchainObjectId = await this.sui.recordArtifact({
      blobId,
      contentHash,
      artifactType: type,
      taskId,
      isEncrypted: true,
      sealPolicyId: allowlistId,
    });

    const artifact: Artifact = {
      blobId,
      type,
      taskId,
      agentAddress: this.config.agentAddress,
      createdAt: Date.now(),
      isEncrypted: true,
      sealPolicyId: allowlistId,
      onchainObjectId,
    };

    await this.commitResult(
      `Stored encrypted ${type} artifact for task ${taskId}. Access restricted via Seal policy ${allowlistId}.`,
      blobId,
    );

    return artifact;
  }

  // Retrieve + decrypt a sealed artifact
  async retrievePrivateArtifact(blobId: string): Promise<string> {
    const rawBytes = await this.artifacts.download(blobId);
    const bundle = JSON.parse(new TextDecoder().decode(rawBytes));
    const encryptedData = Buffer.from(bundle.encryptedData, 'base64');
    const sealedKey = Buffer.from(bundle.sealedKey, 'base64');
    const decrypted = await this.seal.decrypt(encryptedData, sealedKey, bundle.policyId);
    return new TextDecoder().decode(decrypted);
  }

  // Prove memory durability: wipe local + restore from Walrus
  async demonstrateRestore(): Promise<{ restored: number; skipped: number }> {
    logger.info('Starting memory restore demonstration', {
      agent: this.config.agentAddress,
      namespace: this.config.namespace,
    });
    const result = await this.memory.restore(this.config.namespace);
    logger.info('Memory restore complete — agent memory proven portable', result);
    return result;
  }
}
```

---

## 4. AGENT DEMOS

### 4.1 `agents/researcher.ts` — Long-Running Research Agent

**Requirements:**
- Accepts a research topic as input
- Recalls all prior research on the topic from MemWal
- Calls Anthropic API with context to generate a comprehensive analysis
- Stores the full report as a Walrus blob
- Stores a Seal-encrypted version for TradingAgent only
- Records AgentArtifact onchain
- Commits result summary to MemWal memory
- Handles errors gracefully and logs everything
- Can be run repeatedly — memory accumulates correctly

### 4.2 `agents/trader.ts` — Trading Signal Agent

**Requirements:**
- Accepts a market/asset as input
- Recalls relevant research memories (cross-namespace from researcher's shared namespace)
- Downloads and decrypts the researcher's sealed artifact
- Generates a trading signal using Anthropic API
- Stores the signal as a public Walrus artifact
- Records onchain with AgentArtifact
- Sends result notification via Sui Stack Messaging to orchestrator

### 4.3 `agents/orchestrator.ts` — Multi-Agent Coordinator

**Requirements:**
- Creates a Workflow onchain
- Adds agents to a PermissionedGroup via Sui Stack Messaging
- Sends encrypted task assignments to specialist agents
- Monitors workflow state from onchain Workflow object
- Aggregates results from shared MemWal namespace
- Updates Workflow state to "completed" when all tasks are done
- Generates final summary and stores as Walrus artifact

### 4.4 `agents/monitor.ts` — System Health Monitor

**Requirements:**
- Runs on a schedule (every N minutes)
- Queries Sui for recent AgentArtifact creation events
- Checks MemWal for recent memory activity
- Stores health report to Walrus (Quilt batch: metrics + logs + status)
- Alerts via Sui Stack Messaging if agents are inactive

---

## 5. DASHBOARD — `apps/dashboard`

### 5.1 Pages

#### `/` — Landing / Hero
- Full-screen hero with NexusMind branding
- Live stat counters: total memories, total artifacts, active agents, workflows completed
- CTA: "Connect Wallet" / "Explore Memory" / "View Demo"
- Animated network graph showing agent connections (D3)

#### `/explorer` — Memory Explorer
- Search bar: natural language query → calls MemWal recall
- Namespace selector: switch between agent namespaces
- Memory cards: content, timestamp, similarity score
- Highlight matching terms in results
- "Ask Memory" mode: chat interface backed by MemWal `ask()`

#### `/artifacts` — Artifact Viewer
- Table: blob_id, agent, type, created_at, size, encrypted?
- Click row → detail view: download, provenance, Seal policy
- Filter by agent, type, date range
- Direct Walrus download link for public blobs
- Decrypt UI for sealed blobs (wallet-gated)

#### `/workflows` — Workflow Debugger
- List of all Workflow objects from Sui
- Click → expand: task timeline, assigned agents, artifacts produced
- Live status badges: pending/running/completed/failed
- Message history (Sui Stack Messaging archive from Walrus)
- Replay: step through workflow execution history

#### `/agents` — Agent Registry
- Cards for each registered agent: address, role, namespace, artifact count
- Status indicator: active/inactive
- Memory graph: recent memories as word cloud
- Performance: avg artifacts/day, recall latency

#### `/restore` — Memory Restore Demo
- Dedicated page showing the `restore()` capability
- Button: "Simulate Memory Loss" → clears local index display
- Button: "Restore from Walrus" → calls `restore()`, animates progress
- Before/after comparison: empty → fully populated
- This is the killer demo moment for judges

### 5.2 Components

```typescript
// components/NetworkGraph/index.tsx
// D3 force-directed graph showing:
// - Nodes: agents (colored by role), memories (smaller nodes), artifacts (diamond nodes)
// - Edges: "remembered by", "generated", "shares with"
// - Hover: show memory content preview
// - Click: navigate to memory/artifact detail
// - Animations: node entry, edge drawing, hover ripple

// components/MemoryCard/index.tsx
// - Content with syntax highlighting for blob IDs
// - Timestamp (relative + absolute on hover)
// - Similarity score bar
// - Namespace badge
// - Copy blob_id button

// components/ArtifactBadge/index.tsx
// - Type icon (report/signal/log/dataset)
// - Encrypted lock icon if Seal-encrypted
// - Walrus network indicator
// - Onchain verification checkmark

// components/WorkflowTimeline/index.tsx
// - Horizontal timeline with task nodes
// - Connecting lines animate in sequence
// - Agent avatars on each task node
// - Artifact bubbles floating above completed tasks
```

### 5.3 Hooks

```typescript
// hooks/useMemory.ts
export function useMemory(namespace: string) {
  return useQuery({
    queryKey: ['memory', namespace],
    queryFn: () => fetchMemories(namespace),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useMemorySearch(namespace: string) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Memory[]>([]);
  
  const search = useMutation({
    mutationFn: (q: string) => recallMemories(namespace, q),
    onSuccess: setResults,
  });

  return { query, setQuery, results, search: search.mutate, isPending: search.isPending };
}

// hooks/useArtifacts.ts
export function useArtifacts(filters?: ArtifactFilters) {
  return useQuery({
    queryKey: ['artifacts', filters],
    queryFn: () => fetchArtifacts(filters),
    staleTime: 15_000,
  });
}

// hooks/useWorkflows.ts
export function useWorkflows() {
  const suiClient = useSuiClient();
  return useQuery({
    queryKey: ['workflows'],
    queryFn: () => fetchWorkflows(suiClient),
    refetchInterval: 5_000, // Live updates
  });
}
```

---

## 6. BACKEND LOGIC & API ROUTES

### 6.1 Next.js API Routes (`apps/dashboard/src/app/api/`)

```
/api/memory/recall     POST   { namespace, query, limit }     → Memory[]
/api/memory/ask        POST   { namespace, question }         → { answer: string }
/api/memory/restore    POST   { namespace, limit }            → { restored, skipped }
/api/artifacts/list    GET    ?agent=&type=&limit=&offset=    → Artifact[]
/api/artifacts/get     GET    ?blobId=                        → { data: base64, metadata }
/api/workflows/list    GET    ?state=&limit=                  → Workflow[]
/api/agents/list       GET                                    → AgentInfo[]
/api/stats/overview    GET                                    → { memories, artifacts, agents, workflows }
```

### 6.2 Rate Limiting
- All API routes: 30 req/min per IP via `@upstash/ratelimit` + Vercel Edge Config
- `/api/memory/restore`: 5 req/hour (expensive operation)
- Agent execution endpoints: authenticated only (Sui wallet signature required)

### 6.3 Caching
- `overview` stats: 30s cache at Vercel Edge
- `artifacts/list`: 15s cache + stale-while-revalidate
- `workflows/list`: 5s cache (live updates needed)
- MemWal recall: no server cache (results depend on live index)

---

## 7. DATABASE & STORAGE ARCHITECTURE

### 7.1 Storage Layers

```
LAYER 1: MemWal (Agent Memory Index)
  - Vector index stored as Walrus blobs
  - Queried via MemWal SDK (semantic search)
  - Namespace-isolated per agent
  - Rebuiltable via restore()

LAYER 2: Walrus Blobs (Artifact Storage)
  - Raw artifact content (reports, signals, logs)
  - Content-addressed (blob_id = SHA3-256 of content)
  - Encrypted via Seal if private
  - Accessed via aggregator URL

LAYER 3: Sui Blockchain (Metadata + Provenance)
  - AgentRegistry shared object
  - AgentArtifact objects (one per artifact)
  - Workflow objects (state machine)
  - AgentAllowlist objects (Seal policies)
  - All queryable via Sui GraphQL/RPC

LAYER 4: Walrus Sites (Dashboard Static Assets)
  - Dashboard HTML/CSS/JS hosted on Walrus
  - Decentralized, censorship-resistant
  - Also deployed to Vercel for judge convenience

LAYER 5: In-Memory / React Query Cache
  - Dashboard UI state
  - 30-60s TTL for most data
  - WebSocket planned for live workflow updates
```

### 7.2 No Traditional Database
This is intentional and a key differentiator. All persistent state lives on:
- Walrus (blobs + MemWal index)
- Sui blockchain (objects + events)

No PostgreSQL, no Redis, no Firebase. Pure Web3 stack.

---

## 8. AUTH & PERMISSIONS

### 8.1 Wallet Authentication
- Uses `@mysten/dapp-kit` for Sui wallet connection
- Supported wallets: Sui Wallet, Slush, Nightly, Suiet
- zkLogin available for email-based onboarding (no wallet required)
- Session persisted in `sessionStorage` — not `localStorage`

### 8.2 Permission Model
```
Public (no auth required):
  - View public artifacts
  - Browse agent registry
  - View workflow status
  - Read memory stats

Wallet required:
  - Query private memories (must own AgentCap)
  - Download sealed artifacts (must be in Seal allowlist)
  - Execute agent actions
  - Register new agents (admin only)

Admin only (AdminCap holder):
  - Register agents
  - Deactivate agents
  - Create Seal policies
```

### 8.3 Agent Authentication
- Agents authenticate via Ed25519 keypairs stored in environment variables
- Each agent has its own Sui keypair + MemWal delegate key
- AgentCap object must be owned by agent address for Move calls
- Seal allowlist membership checked onchain by seal_approve function

---

## 9. INFRASTRUCTURE, HOSTING & DEPLOYMENT

### 9.1 Vercel Configuration
```json
// vercel.json
{
  "buildCommand": "pnpm turbo build",
  "outputDirectory": "apps/dashboard/.next",
  "framework": "nextjs",
  "regions": ["sin1", "iad1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

### 9.2 Walrus Site Deployment (Secondary)
```json
// ws-resources.json
{
  "site": {
    "name": "nexusmind-dashboard",
    "description": "NexusMind Agent Memory Explorer"
  },
  "resources": [
    { "path": "/", "contentType": "text/html" }
  ]
}
```
Command: `site-builder publish --config ws-resources.json`

### 9.3 Turborepo Pipeline
```json
// turbo.json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "test": { "dependsOn": ["build"] },
    "type-check": {},
    "lint": {}
  }
}
```

---

## 10. CI/CD & VERSION CONTROL

### 10.1 GitHub Actions — `ci.yml`
```yaml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo type-check
      - run: pnpm turbo lint
      - run: pnpm turbo test
      - run: pnpm turbo build
```

### 10.2 GitHub Actions — `deploy.yml`
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 11. SECURITY & RLS

### 11.1 Secret Management
- All secrets in Vercel Environment Variables (encrypted at rest)
- `.env.example` documents all required vars with descriptions
- `.gitignore` includes all `.env*` files except `.env.example`
- Rotate MEMWAL_DELEGATE_KEY after hackathon

### 11.2 Input Validation
- Zod schemas for all API route inputs
- Sanitize all content before passing to MemWal (prevent injection)
- Max content lengths enforced:
  - Memory content: 10,000 chars
  - Recall query: 500 chars
  - Artifact upload: 50MB

### 11.3 Walrus Security Reminder
- Public blobs: never store private keys, user PII, or sensitive business data
- Seal-encrypted blobs: AES-256-GCM with Seal key management
- Verify `blob_id` matches expected content hash before trusting retrieved data

---

## 12. RATE LIMITING & CACHING

### 12.1 Rate Limiting
```typescript
// Using Vercel Edge Config + Upstash
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
});

// In API route:
const { success, remaining } = await ratelimit.limit(ip);
if (!success) {
  return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
```

### 12.2 CDN & Edge Caching
- Static assets: Vercel CDN, infinite cache with hash-busted URLs
- API routes with `cache-control: s-maxage=30, stale-while-revalidate=60`
- Walrus blobs cached by aggregator (content-addressed = naturally immutable)

---

## 13. ERROR TRACKING & LOGS

### 13.1 Structured Logging
```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    // In production: pipe to Vercel log drains
  ],
  defaultMeta: {
    service: 'nexusmind',
    version: process.env.npm_package_version,
  },
});
```

### 13.2 Error Boundaries
- React Error Boundaries on all dashboard pages
- Custom error.tsx per Next.js app router convention
- Specific error messages for wallet disconnection, network failures, Seal errors

---

## 14. AVAILABILITY & RECOVERY

### 14.1 Graceful Degradation
- If MemWal is unavailable: dashboard shows cached data with stale indicator
- If Walrus aggregator is down: fall back to secondary aggregator URL
- If Sui RPC is unavailable: read from local cache, queue writes
- All fallback URLs configurable via environment variables

### 14.2 Memory Recovery
- The `restore()` function IS the recovery mechanism
- Documented procedure: back up delegate key → call restore() → verify recall works
- Automated restore test in CI against testnet (weekly schedule)

### 14.3 Multi-Region
- Vercel deployment in `sin1` (Singapore) + `iad1` (US East)
- Users routed to nearest region automatically
- Agent processes run where deployed (local to server region)

---

*End of PRD.md — Reference AGENTS.md for workflow execution order and team conventions.*
