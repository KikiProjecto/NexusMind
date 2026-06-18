# Agent Demos

This document describes each agent demo workflow, explains what happens at every step, and provides instructions for running each demo independently or as part of the full end-to-end suite. These are not simulations; every demo executes real transactions on Sui testnet, stores real blobs on Walrus, and persists real memories in MemWal.

Before running any demo, complete the full setup described in [Getting Started](./getting-started.md). All environment variables must be configured and the Move package must be deployed.

---

## Prerequisites for All Demos

Verify the following before running any agent:

```bash
# Confirm environment is loaded
pnpm tsx -e "require('dotenv').config({path:'.env.local'}); \
  const vars = ['MEMWAL_DELEGATE_KEY','WALRUS_PUBLISHER_URL','SUI_RPC_URL','MOVE_PACKAGE_ID']; \
  vars.forEach(v => console.log(v, process.env[v] ? 'SET' : 'MISSING'));"

# Confirm Move package is deployed
sui client object $MOVE_PACKAGE_ID

# Confirm agents are registered (seed-agents.ts must have been run)
sui client object $AGENT_REGISTRY_ID
```

Ensure the messaging relayer is running:

```bash
cd relayer && pnpm start
```

---

## Research Workflow

The research workflow demonstrates the full lifecycle of a knowledge-production task: dispatching, context recall, LLM-driven generation, encrypted storage, onchain provenance, and persistent memory.

### Actors

| Agent | Role | Responsibility |
|-------|------|---------------|
| Orchestrator | Coordinator | Creates the workflow, dispatches the task, aggregates results |
| Researcher | Specialist | Recalls prior context, generates a research report, stores the artifact |

### Step-by-step execution

**Step 1: Orchestrator creates the workflow.**

The Orchestrator calls `agent.sui.createWorkflow()` to create a `Workflow` object onchain in `Pending` state. The workflow names the Researcher and Trader as participants.

```typescript
const workflow = await orchestrator.sui.createWorkflow(
  'DeFi Market Analysis Q3 2025',
  [researcherAddress, traderAddress]
);
```

**Step 2: Orchestrator dispatches the task.**

The Orchestrator sends an encrypted task message to the Researcher via Sui Stack Messaging. The task includes the research topic, required output format, and any constraints.

The Orchestrator then transitions the workflow to `Running` state.

**Step 3: Researcher recalls prior context.**

Before generating new research, the Researcher queries its MemWal namespace for relevant prior findings:

```typescript
const priorFindings = await researcher.memory.recall(
  'DeFi TVL analysis protocol comparison',
  { limit: 10 }
);
```

If the agent has produced related research before, those memories provide context that improves the quality and consistency of new output.

**Step 4: Researcher generates the report.**

The Researcher constructs a prompt that includes the recalled memories and the task specification, then calls the Anthropic API to generate a structured research report.

**Step 5: Researcher encrypts and stores the report.**

The report is encrypted with Seal using the envelope pattern. The Trader is added to the Seal allowlist so it can decrypt the report later.

```typescript
const encrypted = await researcher.seal.encryptAndUpload(
  new TextEncoder().encode(report),
  allowlistPolicyId,
  'allowlist',
  { epochs: 10, contentType: 'application/json' }
);
```

The encrypted blob is stored on Walrus. The `blob_id` and sealed key are retained for sharing with the Trader.

**Step 6: Researcher records onchain provenance.**

An `AgentArtifact` object is created onchain, linking the Walrus `blob_id` to the Researcher's address, the workflow task ID, and descriptive metadata.

```typescript
await researcher.sui.recordArtifact(
  encrypted.blobId,
  'report',
  workflow.workflowId,
  { topic: 'defi-tvl-q3-2025', confidence: 'high' }
);
```

**Step 7: Researcher stores memory.**

The Researcher writes a summary of the completed work to MemWal. This memory includes the blob ID, key findings, and task ID so that future recall queries can locate this work.

```typescript
await researcher.memory.remember(
  `Completed DeFi TVL analysis for Q3 2025. ` +
  `TVL increased 34% across top 5 protocols (Aave, Compound, Uniswap, Lido, MakerDAO). ` +
  `Blob ID: ${encrypted.blobId}. Task ID: ${workflow.workflowId}. Confidence: high.`
);
```

### Run the research workflow

```bash
pnpm tsx agents/researcher.ts
```

To run it as part of the orchestrated workflow (which also triggers the trading workflow):

```bash
pnpm tsx agents/orchestrator.ts
```

### Expected output

The agent logs will show:

1. MemWal recall results (prior memories, if any).
2. LLM prompt construction and response.
3. Seal encryption confirmation.
4. Walrus upload confirmation with `blob_id`.
5. Sui transaction digest for the `AgentArtifact` creation.
6. MemWal remember confirmation.

---

## Trading Workflow

The trading workflow demonstrates cross-agent artifact consumption: the Trader decrypts a Researcher-produced artifact via Seal and generates actionable signals.

### Actors

| Agent | Role | Responsibility |
|-------|------|---------------|
| Trader | Signal generator | Decrypts research, analyzes findings, produces trading signals |

### Step-by-step execution

**Step 1: Trader receives artifact reference.**

The Orchestrator (or direct message from the Researcher) provides the Trader with the `blob_id`, sealed key, and nonce for the encrypted research report.

**Step 2: Trader retrieves and decrypts the report.**

```typescript
const plaintext = await trader.seal.retrieveAndDecrypt(
  blobId,
  sealedKey,
  nonce,
  allowlistPolicyId,
  'allowlist'
);
const report = JSON.parse(new TextDecoder().decode(plaintext));
```

The Seal key servers verify that the Trader's address is on the allowlist before releasing the decryption key. If the Trader is not authorized, this step throws a `SealError`.

**Step 3: Trader recalls its own context.**

The Trader queries its own MemWal namespace for prior trading signals and market context:

```typescript
const priorSignals = await trader.memory.recall(
  'DeFi trading signals protocol exposure',
  { limit: 5 }
);
```

**Step 4: Trader generates signals.**

Using the decrypted research report and recalled prior signals, the Trader generates new trading signals. The signal includes:

- Recommended positions (long/short/neutral) per protocol.
- Confidence levels derived from the research.
- Risk parameters.

**Step 5: Trader stores its artifact and memory.**

The trading signal is stored as a new Walrus blob (optionally encrypted) with an onchain `AgentArtifact` record. A summary memory is written to MemWal.

### Run the trading workflow

The trading workflow requires an existing research artifact. Run the Orchestrator (which triggers both) or ensure a research artifact exists first:

```bash
# Full orchestrated flow
pnpm tsx agents/orchestrator.ts

# Trader only (requires existing artifact reference)
pnpm tsx agents/trader.ts
```

### Expected output

1. Walrus blob retrieval confirmation.
2. Seal decryption success (or failure with descriptive error).
3. Prior signal recall from MemWal.
4. Generated trading signals printed to structured log.
5. New artifact upload and onchain record.

---

## Monitor Workflow

The Monitor agent runs continuously and tracks the health of all NexusMind infrastructure components. It does not participate in research or trading workflows.

### Monitored services

| Service | Check | Threshold |
|---------|-------|-----------|
| MemWal Server | HTTP health endpoint, recall latency | Latency < 500ms |
| Walrus Publisher | Blob upload test (1 KB probe) | Response < 3s |
| Walrus Aggregator | Blob retrieval test (known blob) | Response < 2s |
| Sui RPC | `getLatestCheckpointSequenceNumber` | Response < 1s |
| Messaging Relayer | HTTP health endpoint | Response < 500ms |

### Execution loop

The Monitor runs on a configurable interval (default: 60 seconds):

1. Checks each service in parallel.
2. Logs results with structured fields (service, latency, status).
3. If any service exceeds its threshold, stores an alert memory in MemWal.
4. Periodically (every 10 iterations) uploads a health summary as a Walrus artifact and records it onchain.

### Run the monitor

```bash
pnpm tsx agents/monitor.ts
```

The Monitor runs indefinitely. Stop it with `Ctrl+C`. It handles `SIGINT` gracefully, flushing pending operations before exit.

### Expected output

Structured log lines every interval showing per-service latency and status. Alert memories are logged when thresholds are exceeded.

---

## Memory Restore Demo

The memory restore demo is the most important demonstration of NexusMind's durability guarantees. It proves that agent memory is not ephemeral local state but durable, decentralized data backed by Walrus.

### What it proves

An agent can:

1. Lose all local state (process termination, disk wipe, machine migration).
2. Start fresh with only its delegate key and namespace.
3. Rebuild its entire memory index from Walrus-backed storage.
4. Resume operations with full historical context.

### Step-by-step execution

**Step 1: Verify existing memories.**

Before the restore, confirm the agent has memories:

```typescript
const before = await agent.memory.recall('research findings', { limit: 20 });
console.log(`Memories before wipe: ${before.length}`);
```

**Step 2: Wipe local state.**

The demo simulates total state loss. In a real scenario, this would be a process crash or machine failure. In the demo, the local memory index is explicitly cleared.

**Step 3: Restore from Walrus.**

```typescript
const result = await agent.memory.restore();
console.log(`Restored ${result.restoredCount} memories in ${result.durationMs}ms`);
```

The `restore` operation contacts the MemWal server, which rebuilds the agent's memory index from Walrus-backed storage. No local cache is consulted.

**Step 4: Verify restored memories.**

```typescript
const after = await agent.memory.recall('research findings', { limit: 20 });
console.log(`Memories after restore: ${after.length}`);
// after.length should equal before.length
```

### Run the restore demo

```bash
pnpm tsx scripts/restore-memory.ts
```

### Expected output

```
Memories before wipe: 12
Wiping local memory index...
Restoring from Walrus-backed storage...
Restored 12 memories in 847ms
Memories after restore: 12
Restore verification: PASSED
```

The exact count depends on how many memories were seeded. The critical assertion is that the count after restore equals the count before wipe.

---

## Full End-to-End Demo

The full end-to-end demo runs every workflow in sequence, exercising every layer of the NexusMind architecture.

### Execution order

| Step | Action | Layer exercised |
|------|--------|----------------|
| 1 | Orchestrator creates workflow | Sui Move (Workflow) |
| 2 | Orchestrator dispatches task | Sui Stack Messaging |
| 3 | Researcher recalls prior context | MemWal |
| 4 | Researcher generates report | LLM (Anthropic) |
| 5 | Researcher encrypts report | Seal |
| 6 | Researcher uploads to Walrus | Walrus |
| 7 | Researcher records onchain | Sui Move (AgentArtifact) |
| 8 | Researcher remembers findings | MemWal |
| 9 | Trader decrypts research | Seal |
| 10 | Trader generates signals | LLM (Anthropic) |
| 11 | Trader stores artifact | Walrus, Sui Move |
| 12 | Trader remembers signals | MemWal |
| 13 | Orchestrator aggregates | MemWal, Sui Move |
| 14 | Workflow marked completed | Sui Move (Workflow) |
| 15 | Memory restore verification | MemWal, Walrus |

### Run the full demo

```bash
pnpm tsx agents/orchestrator.ts --full-demo
```

The `--full-demo` flag instructs the Orchestrator to run all workflows in sequence, including the memory restore verification at the end.

### Run the E2E test suite

For automated verification with assertions:

```bash
pnpm test:e2e
```

The E2E test suite (`tests/e2e/full-workflow.test.ts`) runs the same sequence with Playwright-managed assertions, verifying:

- Onchain objects are created with correct fields.
- Walrus blobs are retrievable by the returned `blob_id`.
- Seal encryption and decryption round-trips successfully.
- MemWal memories survive a restore cycle.
- Workflow state transitions follow the valid state machine.

### Expected duration

| Step | Typical duration |
|------|-----------------|
| Workflow creation (Sui tx) | ~400ms |
| Message dispatch | ~200ms |
| MemWal recall | ~300ms |
| LLM generation | ~5-15s |
| Seal encryption | ~500ms |
| Walrus upload (< 1 MB) | ~2s |
| Onchain artifact record | ~400ms |
| MemWal remember | ~200ms |
| Full workflow (all steps) | ~30-60s |
| Memory restore (12 memories) | ~1s |

Total end-to-end execution for the full demo is typically under 90 seconds, depending on LLM response latency and network conditions.

---

## Interpreting Results

All agent output uses structured logging (Winston). Key fields to monitor:

| Field | Meaning |
|-------|---------|
| `agentId` | Which agent produced the log line |
| `namespace` | MemWal namespace in use |
| `blobId` | Walrus content-addressed blob identifier |
| `txDigest` | Sui transaction hash (verify on explorer) |
| `taskId` | Workflow task correlation identifier |
| `durationMs` | Operation latency |
| `level` | `info`, `warn`, or `error` |

To verify any transaction on the Sui explorer:

```
https://suiscan.xyz/testnet/tx/<txDigest>
```

To retrieve any blob directly from Walrus:

```bash
walrus read <blobId> --network testnet
```

To inspect agent memories via the dashboard, navigate to the Memory Explorer and select the agent's namespace.
