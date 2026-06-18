# Architecture

NexusMind is a verifiable, decentralized multi-agent coordination platform with persistent memory. This document describes the system architecture across six layers: onchain logic (Sui Move), decentralized storage (Walrus), persistent memory (MemWal), threshold encryption (Seal), agent coordination (Sui Stack Messaging), and the human-facing dashboard (Next.js).

Every layer is designed for auditability. Agent actions produce onchain records, stored artifacts are content-addressed, and memory is recoverable from decentralized storage at any time.

---

## System Overview

The architecture follows a layered design where each layer has a single responsibility and communicates with adjacent layers through well-defined interfaces.

```
+---------------------------------------------------------------+
|                        Dashboard Layer                        |
|               Next.js 16 + Sui Wallet Integration             |
+---------------------------------------------------------------+
         |                    |                    |
         v                    v                    v
+------------------+  +----------------+  +------------------+
|   Agent Layer    |  |  Communication |  |   Storage Layer  |
|  Orchestrator    |  |     Layer      |  |  Walrus Blobs    |
|  Researcher      |  |  Sui Stack     |  |  MemWal Memory   |
|  Trader          |  |  Messaging     |  |  Seal Encryption |
|  Monitor         |  |                |  |                  |
+------------------+  +----------------+  +------------------+
         |                    |                    |
         v                    v                    v
+---------------------------------------------------------------+
|                       Onchain Layer                           |
|           Sui Move: Registry, Artifacts, Workflows            |
+---------------------------------------------------------------+
```

Data flows downward for writes (agents produce artifacts and record them onchain) and upward for reads (the dashboard queries onchain state and retrieves blobs from Walrus).

---

## Onchain Layer

The onchain layer consists of four Sui Move modules published as a single package. All modules share a common event system for indexing and dashboard consumption.

### AgentRegistry (`agent_registry.move`)

Manages agent identity and capabilities.

| Struct | Abilities | Purpose |
|--------|-----------|---------|
| `AgentRegistry` | `key` | Shared object holding all registered agent metadata |
| `AgentCap` | `key, store` | Capability object granting an agent its role and namespace |

Key functions:

- `create_registry` -- Creates the shared registry (called once at deployment).
- `register_agent` -- Adds an agent address with role and namespace; mints an `AgentCap`.
- `revoke_agent` -- Removes an agent from the registry and invalidates its capability.

The capability pattern ensures that only agents holding a valid `AgentCap` can record artifacts or participate in workflows. Address-only checks are never used.

### AgentArtifact (`artifact_record.move`)

Links Walrus blob IDs to the agents that produced them, creating an immutable provenance chain.

```move
public struct AgentArtifact has key, store {
    id: UID,
    blob_id: u256,
    agent_address: address,
    artifact_type: String,
    task_id: String,
    created_epoch: u64,
    metadata: VecMap<String, String>,
}
```

The `blob_id` is the content-addressed identifier from Walrus (SHA3-256 of the blob content). The `artifact_type` field uses a controlled vocabulary: `report`, `signal`, `log`, `dataset`. Arbitrary metadata is stored in the `VecMap` for extensibility without schema migration.

### Workflow (`workflow.move`)

Implements a state machine for multi-agent task coordination.

States:

| Value | State | Description |
|-------|-------|-------------|
| 0 | Pending | Workflow created, agents not yet started |
| 1 | Running | At least one agent is executing |
| 2 | Completed | All agents finished successfully |
| 3 | Failed | One or more agents reported failure |

A workflow tracks its participating agents and the artifact IDs they produce. State transitions are guarded: only the orchestrator agent (verified by `AgentCap` role) can advance a workflow from `Pending` to `Running`, and only participating agents can mark it `Completed` or `Failed`.

### SealPolicies (`seal_policies.move`)

Defines Seal access control policies that govern which agents can decrypt which artifacts.

Contains `seal_approve` entry functions that Seal key servers call during decryption. Two policy types are implemented:

- **Allowlist policy** -- A list of agent addresses permitted to decrypt. Used for cross-agent artifact sharing (e.g., Researcher encrypts a report; Trader is on the allowlist).
- **Time-lock policy** -- Decryption is permitted only after a specified Sui epoch. Used for embargoed research that should become public after a delay.

---

## Storage Layer

The storage layer has three components that serve different purposes but work together as a unified persistence system.

### Walrus (Blob Storage)

Walrus provides decentralized, content-addressed blob storage. NexusMind uses it for:

- Agent-produced artifacts (research reports, trading signals, logs)
- Encrypted data bundles (Seal envelope payloads)
- Archived message histories (via Sui Stack Messaging integration)

Key properties:

| Property | Value |
|----------|-------|
| Addressing | Content-addressed (`blob_id` = SHA3-256 of content) |
| Object ID | Separate Sui object representing the blob registration |
| Max epoch duration | 14 days (mainnet), 1 day (testnet) |
| Max storage duration | 53 epochs (~2 years mainnet) |
| Batching | Quilt for files under 1 MB each |
| Privacy | All blobs are public; encrypt before upload |

Walrus blob IDs are stored in MemWal memories and in onchain `AgentArtifact` records, creating a dual-index for retrieval.

### MemWal (Persistent Memory)

MemWal provides semantic, persistent memory for each agent. Unlike traditional databases, MemWal stores natural-language memories that are retrieved by semantic similarity, not exact key lookup.

Core operations:

| Operation | Description |
|-----------|-------------|
| `remember` | Store a natural-language memory with embedded metadata |
| `recall` | Retrieve top-N semantically similar memories for a query |
| `analyze` | Run analytical queries over the full memory corpus |
| `ask` | Ask a question answered from memory context |
| `restore` | Rebuild local memory index entirely from Walrus-backed storage |

Each agent operates in its own namespace (e.g., `nexusmind-researcher-v1`). Namespaces are versioned to allow schema evolution without polluting existing memory.

The `restore` operation is architecturally critical: it proves that agent memory survives total local state loss. The agent can be destroyed and reconstructed on a different machine with only its delegate key and namespace.

### Seal (Threshold Encryption)

Seal provides threshold encryption so that sensitive artifacts can be stored on Walrus (which is public) while remaining readable only by authorized agents.

The envelope encryption pattern used throughout NexusMind:

```
1. Generate random AES-256-GCM symmetric key
2. Encrypt artifact plaintext with the symmetric key
3. Encrypt the symmetric key with Seal (bound to a Move policy)
4. Upload the encrypted artifact to Walrus
5. Store the sealed key alongside the blob reference
```

Decryption reverses the process: the authorized agent presents the sealed key to Seal key servers, which verify the Move policy (allowlist or time-lock) and return the symmetric key. The agent then decrypts the artifact locally.

Critical implementation detail: every Seal Programmable Transaction Block (PTB) must call `tx.setSender(agentAddress)` before any Seal-related Move calls. Omitting this causes silent decryption failure.

---

## Agent Layer

Agents are long-running TypeScript processes that use the `nexusmind-sdk` to interact with MemWal, Walrus, Seal, and Sui. Each agent has a specific role defined by its `AgentCap`.

### Orchestrator

The coordination agent. It does not produce research or trading signals itself. Its responsibilities:

- Create `Workflow` objects onchain.
- Dispatch encrypted tasks to specialist agents via Sui Stack Messaging.
- Monitor workflow progress by polling agent artifact emissions.
- Aggregate results from all participating agents.
- Transition workflow state to `Completed` or `Failed`.
- Write summary artifacts to the shared namespace.

### Researcher

The knowledge-production agent. Given a research task:

1. Recalls relevant prior findings from its MemWal namespace.
2. Invokes an LLM (Anthropic Claude) with recalled context and the task prompt.
3. Generates a structured research report.
4. Encrypts the report with Seal (Trader on the allowlist).
5. Uploads the encrypted report to Walrus.
6. Records an `AgentArtifact` onchain with the `blob_id`.
7. Stores a memory summarizing the findings, including the `blob_id` and key conclusions.

### Trader

The signal-generation agent. Given a research artifact reference:

1. Retrieves the encrypted blob from Walrus.
2. Decrypts it via Seal (must be on the allowlist).
3. Analyzes the research content.
4. Generates actionable trading signals.
5. Stores signals as a new artifact and remembers key outcomes.

### Monitor

The infrastructure health agent. Runs continuously and:

- Checks MemWal server latency and availability.
- Verifies Walrus publisher and aggregator responsiveness.
- Confirms Sui RPC node health.
- Logs metrics as artifacts for historical tracking.
- Alerts (via MemWal memory) when any service degrades below threshold.

---

## Communication Layer

Agents communicate through Sui Stack Messaging, which provides:

- **Permissioned groups** -- Only agents with valid capabilities can join.
- **End-to-end encryption** -- Messages are encrypted in transit and at rest.
- **Walrus archival** -- Message history is automatically archived to Walrus blobs.
- **Key rotation** -- Group encryption keys rotate on a configurable schedule.

The messaging relayer is a standalone service (located in `relayer/`) that bridges messages between agents. It must be running for any multi-agent workflow to function.

Message flow:

```
Orchestrator                   Relayer                    Researcher
     |                            |                            |
     |-- encrypted task --------->|                            |
     |                            |-- encrypted task --------->|
     |                            |                            |
     |                            |<-- encrypted result -------|
     |<-- encrypted result -------|                            |
     |                            |                            |
     |              [archived to Walrus blob]                  |
```

All messages pass through the relayer, which handles delivery, ordering, and archival. The relayer does not have access to plaintext message content due to end-to-end encryption.

---

## Dashboard Layer

The dashboard is a Next.js 16 application that provides a human-readable view into the NexusMind system. It is read-heavy: most interactions query onchain state and Walrus blobs rather than writing.

### Technology

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router, React Server Components) |
| Styling | Tailwind CSS 4.x |
| Animation | Framer Motion 11.x |
| Data fetching | TanStack React Query 5.x |
| Client state | Zustand 4.x |
| Wallet integration | @mysten/dapp-kit |
| Graph visualization | D3 7.x |

### Key components

- **MemoryExplorer** -- Browse agent memories by namespace. Supports semantic search (delegates to MemWal `recall`) and chronological listing.
- **ArtifactViewer** -- Displays artifact metadata from onchain `AgentArtifact` records. Provides download and decryption (if the connected wallet holds the required Seal permissions).
- **WorkflowMap** -- Renders active and historical workflows as state-machine diagrams. Updates in near-real-time via Sui event subscriptions.
- **AgentCard** -- Shows agent identity, role, namespace, and current status.
- **NetworkGraph** -- D3-rendered force-directed graph of memory relationships across agents and namespaces. Virtualized rendering supports up to 500 nodes at interactive frame rates.

### Data sources

The dashboard reads from three sources:

1. **Sui RPC** -- Onchain objects (AgentRegistry, AgentArtifact, Workflow) via `@mysten/sui` queries.
2. **Walrus Aggregator** -- Blob content retrieval by `blob_id`.
3. **MemWal Server** -- Agent memory queries (recall, analyze) via the MemWal HTTP API.

Write operations (registering agents, creating workflows) require a connected Sui wallet and are executed as Programmable Transaction Blocks signed by the user.

---

## Data Flow: End-to-End Research Workflow

The following describes the complete data path for a single research task, touching every architectural layer:

1. **Dashboard** -- User creates a research task via the WorkflowMap interface. The dashboard builds a PTB that creates a `Workflow` object onchain and sends an encrypted task message to the Orchestrator.

2. **Onchain** -- The `Workflow` object is created in `Pending` state with the Orchestrator, Researcher, and Trader as participants.

3. **Orchestrator** -- Receives the task via Sui Stack Messaging. Transitions the workflow to `Running`. Forwards the task to the Researcher with additional context from its own MemWal recall.

4. **Researcher** -- Recalls prior research from MemWal. Calls the LLM with recalled context. Produces a report. Encrypts it with Seal (Trader on allowlist). Uploads to Walrus. Records `AgentArtifact` onchain. Stores summary memory in MemWal.

5. **Trader** -- Receives artifact reference from the Orchestrator. Fetches the encrypted blob from Walrus. Decrypts via Seal. Generates trading signals. Stores its own artifact and memory.

6. **Orchestrator** -- Detects that both agents have completed. Aggregates results. Transitions the workflow to `Completed`. Stores a summary artifact.

7. **Dashboard** -- The WorkflowMap updates to show the completed state. The ArtifactViewer displays all produced artifacts. The MemoryExplorer shows the new memories created during the workflow.

Every step in this flow produces verifiable records: onchain objects for provenance, Walrus blobs for data durability, and MemWal memories for semantic recall.
