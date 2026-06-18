# SDK Reference

The `nexusmind-sdk` package (`packages/nexusmind-sdk/`) provides a TypeScript interface for building agents on the NexusMind platform. It abstracts direct interaction with MemWal, Walrus, Seal, and Sui Move contracts behind a consistent, type-safe API.

All public functions use named exports. There are no default exports. All async methods include structured error handling with specific error classes.

```bash
pnpm add nexusmind-sdk
```

---

## Table of Contents

- [NexusMindAgent](#nexusmindagent)
- [MemoryManager](#memorymanager)
- [ArtifactManager](#artifactmanager)
- [SealManager](#sealmanager)
- [SuiManager](#suimanager)
- [Type Definitions](#type-definitions)
- [Error Classes](#error-classes)

---

## NexusMindAgent

`agent.ts` -- The primary entry point. A `NexusMindAgent` instance composes all subsystem managers and provides a unified interface for agent operations.

### Constructor

```typescript
import { NexusMindAgent } from 'nexusmind-sdk';

const agent = new NexusMindAgent(config: AgentConfig);
```

### AgentConfig

```typescript
interface AgentConfig {
  /** Agent display name, used in logs and onchain metadata */
  name: string;

  /** Agent role: determines capabilities and namespace conventions */
  role: AgentRole;

  /** MemWal delegate key (from MemWal Playground) */
  memwalDelegateKey: string;

  /** MemWal account ID */
  memwalAccountId: string;

  /** MemWal server URL */
  memwalServerUrl: string;

  /** MemWal namespace for this agent (versioned, e.g. "nexusmind-researcher-v1") */
  namespace: string;

  /** Sui Ed25519 private key (base64 or hex encoded) */
  suiPrivateKey: string;

  /** Sui network: "testnet" or "mainnet" */
  suiNetwork: SuiNetwork;

  /** Sui RPC endpoint URL */
  suiRpcUrl: string;

  /** Deployed Move package ID */
  movePackageId: string;

  /** AgentRegistry shared object ID */
  agentRegistryId: string;

  /** Walrus publisher URL */
  walrusPublisherUrl: string;

  /** Walrus aggregator URL */
  walrusAggregatorUrl: string;

  /** Seal key server URLs (array) */
  sealKeyServerUrls: string[];
}
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `memory` | `MemoryManager` | Access to MemWal operations |
| `artifacts` | `ArtifactManager` | Access to Walrus blob operations |
| `seal` | `SealManager` | Access to Seal encryption operations |
| `sui` | `SuiManager` | Access to Sui transaction operations |
| `address` | `string` | The agent's Sui address (derived from private key) |
| `name` | `string` | The agent's display name |
| `role` | `AgentRole` | The agent's role |
| `namespace` | `string` | The agent's MemWal namespace |

### Methods

#### `initialize`

```typescript
async initialize(): Promise<void>
```

Initializes all subsystem connections. Must be called before any other method. Validates environment configuration, establishes the MemWal connection, and verifies Sui RPC reachability.

Throws `ConfigurationError` if any required configuration value is missing or invalid.

#### `shutdown`

```typescript
async shutdown(): Promise<void>
```

Gracefully shuts down all connections and flushes pending operations. Call this before process exit.

#### `getStatus`

```typescript
async getStatus(): Promise<AgentStatus>
```

Returns the current operational status of all subsystems.

```typescript
interface AgentStatus {
  memwalConnected: boolean;
  suiConnected: boolean;
  walrusReachable: boolean;
  sealAvailable: boolean;
  agentCapId: string | null;
  lastActivityTimestamp: number;
}
```

---

## MemoryManager

`memory.ts` -- Wraps MemWal operations with structured logging, error handling, and NexusMind-specific conventions.

Access via `agent.memory`.

### remember

```typescript
async remember(content: string, metadata?: MemoryMetadata): Promise<MemoryRecord>
```

Stores a natural-language memory in the agent's namespace. The `content` string should be descriptive and include all terms that future recall queries might use.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | `string` | Yes | Natural-language memory content |
| `metadata` | `MemoryMetadata` | No | Structured metadata attached to the memory |

**Returns:** `MemoryRecord` with the assigned memory ID and timestamp.

**Example:**

```typescript
await agent.memory.remember(
  `Task completed: DeFi market analysis for Q3 2025. ` +
  `Key finding: TVL increased 34% across top 5 protocols. ` +
  `Blob ID: ${blobId}. Task ID: ${taskId}. Confidence: high.`,
  {
    taskId,
    blobId,
    tags: ['defi', 'tvl', 'q3-2025'],
  }
);
```

### recall

```typescript
async recall(query: string, options?: RecallOptions): Promise<MemoryRecord[]>
```

Retrieves memories semantically similar to the query string.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | Natural-language search query |
| `options.limit` | `number` | No | Maximum results to return (default: 5) |
| `options.minRelevance` | `number` | No | Minimum similarity threshold, 0-1 (default: 0.0) |
| `options.tags` | `string[]` | No | Filter results to memories with any of these tags |

**Returns:** Array of `MemoryRecord` ordered by semantic relevance (most relevant first). Returns an empty array if no memories match.

**Example:**

```typescript
const memories = await agent.memory.recall(
  'DeFi market analysis findings about TVL',
  { limit: 5 }
);
```

### restore

```typescript
async restore(options?: RestoreOptions): Promise<RestoreResult>
```

Rebuilds the local memory index entirely from Walrus-backed storage. This is the critical durability operation: it proves that agent memory survives total local state loss.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `options.namespace` | `string` | No | Namespace to restore (defaults to agent's namespace) |
| `options.limit` | `number` | No | Maximum memories to restore (default: all) |

**Returns:** `RestoreResult` with count of restored memories and any errors.

```typescript
interface RestoreResult {
  restoredCount: number;
  errors: RestoreError[];
  durationMs: number;
}
```

### analyze

```typescript
async analyze(query: string): Promise<AnalysisResult>
```

Runs an analytical query across the full memory corpus. Unlike `recall`, which returns individual memories, `analyze` synthesizes an answer from multiple memories.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | Analytical question to answer from memory |

**Returns:** `AnalysisResult` containing the synthesized answer and source memory IDs.

### ask

```typescript
async ask(question: string): Promise<AskResult>
```

Asks a direct question answered from the agent's memory context. Similar to `analyze` but optimized for factual, single-answer questions.

---

## ArtifactManager

`artifacts.ts` -- Manages Walrus blob upload, retrieval, and batching.

Access via `agent.artifacts`.

### upload

```typescript
async upload(data: Uint8Array | string, options?: UploadOptions): Promise<ArtifactUploadResult>
```

Uploads data to Walrus as a blob. Returns the content-addressed `blobId` and the Sui `objectId` of the blob registration.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | `Uint8Array \| string` | Yes | Raw bytes or UTF-8 string to upload |
| `options.epochs` | `number` | No | Storage duration in epochs (default: 5) |
| `options.contentType` | `string` | No | MIME type for retrieval hints |

**Returns:**

```typescript
interface ArtifactUploadResult {
  blobId: string;       // Content-addressed blob ID (hex)
  objectId: string;     // Sui object ID of the blob registration
  size: number;         // Uploaded size in bytes
  cost: bigint;         // Storage cost in MIST
}
```

**Example:**

```typescript
const report = JSON.stringify(researchFindings);
const result = await agent.artifacts.upload(report, {
  epochs: 10,
  contentType: 'application/json',
});
```

### retrieve

```typescript
async retrieve(blobId: string): Promise<Uint8Array>
```

Retrieves a blob from the Walrus aggregator by its content-addressed ID.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `blobId` | `string` | Yes | Content-addressed blob ID (hex) |

**Returns:** Raw blob content as `Uint8Array`.

Throws `ArtifactError` if the blob is not found or the aggregator is unreachable.

### batchUpload

```typescript
async batchUpload(items: BatchUploadItem[]): Promise<ArtifactUploadResult[]>
```

Uploads multiple small files as a Walrus Quilt. Use this for files under 1 MB each to reduce storage cost.

**Parameters:**

```typescript
interface BatchUploadItem {
  data: Uint8Array | string;
  contentType?: string;
  label?: string;         // Human-readable label for logging
}
```

**Returns:** Array of `ArtifactUploadResult`, one per item, in the same order as input.

### getMetadata

```typescript
async getMetadata(blobId: string): Promise<BlobMetadata>
```

Retrieves metadata about a blob without downloading its content. Returns size, content type, creation epoch, and expiration epoch.

---

## SealManager

`seal.ts` -- Handles Seal threshold encryption and decryption using the envelope pattern.

Access via `agent.seal`.

### encrypt

```typescript
async encrypt(
  plaintext: Uint8Array,
  policyId: string,
  policyType: SealPolicyType
): Promise<SealedEnvelope>
```

Encrypts data using the Seal envelope pattern:

1. Generates a random AES-256-GCM symmetric key.
2. Encrypts the plaintext with the symmetric key.
3. Encrypts the symmetric key with Seal, bound to the specified Move policy.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `plaintext` | `Uint8Array` | Yes | Data to encrypt |
| `policyId` | `string` | Yes | Sui object ID of the Seal policy |
| `policyType` | `SealPolicyType` | Yes | `"allowlist"` or `"timelock"` |

**Returns:**

```typescript
interface SealedEnvelope {
  encryptedData: Uint8Array;    // AES-256-GCM ciphertext
  sealedKey: Uint8Array;        // Seal-encrypted symmetric key
  nonce: Uint8Array;            // AES-GCM nonce (12 bytes)
  policyId: string;             // Policy used for encryption
  policyType: SealPolicyType;   // Policy type
}
```

### decrypt

```typescript
async decrypt(envelope: SealedEnvelope): Promise<Uint8Array>
```

Decrypts a sealed envelope. The calling agent must satisfy the Seal policy (be on the allowlist, or the time-lock epoch must have passed).

Internally constructs a PTB with `tx.setSender(agentAddress)` set before calling the Seal decrypt function. This sender assignment is mandatory; omitting it causes silent failure.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `envelope` | `SealedEnvelope` | Yes | The sealed envelope to decrypt |

**Returns:** Decrypted plaintext as `Uint8Array`.

Throws `SealError` if the agent is not authorized by the policy or if the Seal key servers are unreachable.

### encryptAndUpload

```typescript
async encryptAndUpload(
  plaintext: Uint8Array,
  policyId: string,
  policyType: SealPolicyType,
  uploadOptions?: UploadOptions
): Promise<EncryptedArtifactResult>
```

Convenience method that encrypts data with Seal and uploads the encrypted payload to Walrus in a single call.

**Returns:**

```typescript
interface EncryptedArtifactResult {
  blobId: string;                // Walrus blob ID of encrypted data
  objectId: string;              // Sui object ID of blob registration
  sealedKey: Uint8Array;         // Must be stored for future decryption
  nonce: Uint8Array;             // Must be stored for future decryption
  policyId: string;
}
```

### retrieveAndDecrypt

```typescript
async retrieveAndDecrypt(
  blobId: string,
  sealedKey: Uint8Array,
  nonce: Uint8Array,
  policyId: string,
  policyType: SealPolicyType
): Promise<Uint8Array>
```

Convenience method that retrieves an encrypted blob from Walrus and decrypts it with Seal in a single call.

---

## SuiManager

`sui.ts` -- Manages Sui transaction building, signing, and onchain object queries.

Access via `agent.sui`.

### registerAgent

```typescript
async registerAgent(
  name: string,
  role: AgentRole,
  namespace: string
): Promise<RegisterAgentResult>
```

Registers an agent in the onchain `AgentRegistry`. Mints an `AgentCap` capability object for the agent.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | Yes | Agent display name |
| `role` | `AgentRole` | Yes | `"orchestrator"`, `"researcher"`, `"trader"`, or `"monitor"` |
| `namespace` | `string` | Yes | MemWal namespace for this agent |

**Returns:**

```typescript
interface RegisterAgentResult {
  agentCapId: string;       // Object ID of the minted AgentCap
  txDigest: string;         // Transaction digest
}
```

### recordArtifact

```typescript
async recordArtifact(
  blobId: string,
  artifactType: ArtifactType,
  taskId: string,
  metadata?: Record<string, string>
): Promise<RecordArtifactResult>
```

Creates an `AgentArtifact` object onchain, linking a Walrus blob to the calling agent with provenance metadata.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `blobId` | `string` | Yes | Walrus content-addressed blob ID |
| `artifactType` | `ArtifactType` | Yes | `"report"`, `"signal"`, `"log"`, or `"dataset"` |
| `taskId` | `string` | Yes | Workflow task identifier |
| `metadata` | `Record<string, string>` | No | Additional key-value metadata |

**Returns:**

```typescript
interface RecordArtifactResult {
  artifactId: string;       // Object ID of the created AgentArtifact
  txDigest: string;
}
```

### createWorkflow

```typescript
async createWorkflow(
  name: string,
  agents: string[]
): Promise<CreateWorkflowResult>
```

Creates a `Workflow` object onchain in `Pending` state.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | Yes | Human-readable workflow name |
| `agents` | `string[]` | Yes | Sui addresses of participating agents |

**Returns:**

```typescript
interface CreateWorkflowResult {
  workflowId: string;       // Object ID of the created Workflow
  txDigest: string;
}
```

### updateWorkflowState

```typescript
async updateWorkflowState(
  workflowId: string,
  newState: WorkflowState
): Promise<TransactionResult>
```

Transitions a workflow to a new state. Only the orchestrator agent (verified by `AgentCap` role) can transition from `Pending` to `Running`. Any participating agent can transition to `Completed` or `Failed`.

### buildTransaction

```typescript
buildTransaction(): Transaction
```

Returns a new Sui `Transaction` object pre-configured with the agent's address as sender. Use this for custom PTBs that compose multiple operations.

```typescript
const tx = agent.sui.buildTransaction();
// tx.setSender() is already called
tx.moveCall({
  target: `${packageId}::module::function`,
  arguments: [/* ... */],
});
const result = await agent.sui.executeTransaction(tx);
```

### executeTransaction

```typescript
async executeTransaction(tx: Transaction): Promise<TransactionResult>
```

Signs and executes a Programmable Transaction Block. Returns the transaction digest and effects.

### queryObjects

```typescript
async queryObjects<T>(params: QueryObjectsParams): Promise<T[]>
```

Queries Sui objects by type, owner, or structured filter. Used internally by dashboard hooks and available for custom queries.

---

## Type Definitions

`types.ts` -- All shared types and interfaces. Key definitions:

### Enums and Literals

```typescript
const AGENT_ROLES = {
  ORCHESTRATOR: 'orchestrator',
  RESEARCHER: 'researcher',
  TRADER: 'trader',
  MONITOR: 'monitor',
} as const;

type AgentRole = typeof AGENT_ROLES[keyof typeof AGENT_ROLES];

const ARTIFACT_TYPES = {
  REPORT: 'report',
  SIGNAL: 'signal',
  LOG: 'log',
  DATASET: 'dataset',
} as const;

type ArtifactType = typeof ARTIFACT_TYPES[keyof typeof ARTIFACT_TYPES];

const WORKFLOW_STATES = {
  PENDING: 0,
  RUNNING: 1,
  COMPLETED: 2,
  FAILED: 3,
} as const;

type WorkflowState = typeof WORKFLOW_STATES[keyof typeof WORKFLOW_STATES];

type SuiNetwork = 'testnet' | 'mainnet';

type SealPolicyType = 'allowlist' | 'timelock';
```

### Core Interfaces

```typescript
interface MemoryRecord {
  id: string;
  content: string;
  namespace: string;
  timestamp: number;
  metadata?: MemoryMetadata;
}

interface MemoryMetadata {
  taskId?: string;
  blobId?: string;
  tags?: string[];
  [key: string]: unknown;
}

interface RecallOptions {
  limit?: number;
  minRelevance?: number;
  tags?: string[];
}

interface RestoreOptions {
  namespace?: string;
  limit?: number;
}

interface UploadOptions {
  epochs?: number;
  contentType?: string;
}

interface TransactionResult {
  txDigest: string;
  effects: TransactionEffects;
}

interface BlobMetadata {
  blobId: string;
  objectId: string;
  size: number;
  contentType: string;
  createdEpoch: number;
  expirationEpoch: number;
}
```

---

## Error Classes

All errors extend a base `NexusMindError` class that includes structured context for debugging.

```typescript
class NexusMindError extends Error {
  readonly context: Record<string, unknown>;
  readonly cause?: Error;
}

class ConfigurationError extends NexusMindError { }
class MemoryError extends NexusMindError { }
class ArtifactError extends NexusMindError { }
class SealError extends NexusMindError { }
class TransactionError extends NexusMindError { }
class WorkflowError extends NexusMindError { }
```

Each error class carries contextual data that can be logged with a structured logger:

```typescript
try {
  await agent.memory.recall('some query');
} catch (error) {
  if (error instanceof MemoryError) {
    logger.error('Memory recall failed', {
      query: error.context.query,
      namespace: error.context.namespace,
      cause: error.cause?.message,
    });
  }
}
```
