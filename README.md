# NexusMind

**Verifiable, decentralized multi-agent coordination with persistent memory.**

<div align="center">
  <img src="header.png" alt="current visual" width="100%"/>
</div>

NexusMind is a framework for building AI agent systems where every agent action is verifiable onchain, every artifact is stored on decentralized infrastructure, and every memory persists across sessions. Agents coordinate through encrypted messaging, share knowledge through namespaced semantic memory, and produce tamper-proof provenance records on the Sui blockchain.

This is not a chatbot wrapper. It is a working coordination layer for autonomous agents backed by Sui Move smart contracts, Walrus decentralized storage, MemWal persistent memory, and Seal threshold encryption.

---

## Table of Contents

- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Move Contracts](#move-contracts)
- [SDK](#sdk)
- [Agent Demos](#agent-demos)
- [Dashboard](#dashboard)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [License](#license)

---

## Architecture

NexusMind operates across four layers:

```
 Dashboard (Next.js)          Wallet Integration
       |                             |
       v                             v
 +---------------------------------------------------+
 |                  Agent Layer                       |
 |  Orchestrator | Researcher | Trader | Monitor      |
 +---------------------------------------------------+
       |            |            |            |
       v            v            v            v
 +---------------------------------------------------+
 |              NexusMind SDK (@nexusmind/sdk)        |
 |  MemoryManager | ArtifactManager | SealManager     |
 +---------------------------------------------------+
       |            |            |            |
       v            v            v            v
 +---------------------------------------------------+
 |              Infrastructure Layer                  |
 |  MemWal     | Walrus      | Seal       | Sui      |
 |  (Memory)   | (Storage)   | (Encrypt)  | (Chain)  |
 +---------------------------------------------------+
```

**Onchain contracts** (Sui Move) manage agent registration, artifact provenance records, workflow state machines, and Seal access policies. **Walrus** provides decentralized blob storage for all agent-produced artifacts. **MemWal** gives each agent persistent, semantically searchable memory backed by Walrus. **Seal** provides threshold encryption so agents can share sensitive data with only authorized peers.

---

## Repository Structure

```
nexusmind/
|-- move/
|   |-- Move.toml
|   `-- sources/
|       |-- agent_registry.move      Agent registration, capabilities, roles
|       |-- artifact_record.move     Artifact struct linking blobs to agents
|       |-- seal_policies.move       Seal access control policies
|       `-- workflow.move            Workflow state machine
|
|-- packages/
|   `-- nexusmind-sdk/
|       `-- src/
|           |-- agent.ts             Agent class with memory + storage + identity
|           |-- memory.ts            MemWal abstraction layer
|           |-- artifacts.ts         Walrus blob management
|           |-- seal.ts              Seal encryption helpers
|           |-- sui.ts               Sui transaction building
|           |-- types.ts             All TypeScript types and interfaces
|           `-- index.ts             Public exports
|
|-- agents/
|   |-- orchestrator.ts              Coordinates all specialist agents
|   |-- researcher.ts                Long-running research agent
|   |-- trader.ts                    Trading signal agent
|   `-- monitor.ts                   Infrastructure monitoring agent
|
|-- apps/
|   `-- dashboard/                   Next.js 16 dashboard
|       `-- src/
|           |-- app/                 App Router pages
|           `-- components/          UI components
|
|-- relayer/                         Sui Stack Messaging relayer
|-- scripts/                         Deploy and seed scripts
|-- tests/                           E2E and Move tests
`-- docs/                            Technical documentation
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Smart Contracts | Sui Move | Agent registry, artifact provenance, workflow state, access policies |
| Persistent Memory | MemWal | Semantic search over agent memories, backed by Walrus |
| Decentralized Storage | Walrus | Immutable blob storage for artifacts, reports, datasets |
| Encryption | Seal | Threshold encryption for private agent-to-agent data sharing |
| Messaging | Sui Stack Messaging | Encrypted agent-to-agent communication with Walrus archival |
| SDK | TypeScript | Unified abstraction over all infrastructure services |
| Dashboard | Next.js 16, Tailwind CSS 4, Framer Motion | Agent monitoring, memory exploration, artifact viewing |
| Wallet Integration | @mysten/dapp-kit | Sui wallet connection for the dashboard |
| State Management | Zustand, TanStack Query | Client-side state and server data caching |
| Monorepo | Turborepo, pnpm | Workspace management and build orchestration |

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- pnpm 11 or later
- Sui CLI (for Move contract deployment)
- A Sui testnet wallet with SUI tokens (use the Sui faucet)
- MemWal delegate key and account ID (from the MemWal Playground)

### Installation

```bash
git clone https://github.com/KikiProjecto/NexusMind.git
cd NexusMind
pnpm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials. See [Configuration](#configuration) for details on each variable.

### Deploy Move Contracts

```bash
npx tsx scripts/deploy-move.ts
```

This publishes the Move package to Sui testnet and outputs the `MOVE_PACKAGE_ID` and `AGENT_REGISTRY_ID`. Add these values to your `.env.local`.

### Seed Agent Memories

```bash
npx tsx scripts/seed-agents.ts
```

Populates initial semantic memories for the researcher, trader, and monitor agents.

### Run the Dashboard

```bash
cd apps/dashboard
pnpm dev
```

The dashboard is available at `http://localhost:3000`.

### Run Agent Demos

```bash
# Run the full research workflow
npx tsx agents/orchestrator.ts

# Run individual agents
npx tsx agents/researcher.ts
npx tsx agents/trader.ts
npx tsx agents/monitor.ts
```

---

## Move Contracts

Four modules deployed as a single Sui Move package:

### agent_registry

Manages agent registration with capability-based access control. Each agent receives an `AgentCap` object that grants role-specific permissions.

```move
public struct AgentCap has key, store {
    id: UID,
    agent_address: address,
    role: String,
    namespace: String,
}
```

### artifact_record

Links Walrus blob IDs to agent identities onchain. Provides an immutable provenance record for every artifact produced by the system.

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

### workflow

Onchain state machine tracking multi-agent workflows from creation through completion or failure.

### seal_policies

Seal-compatible `seal_approve` functions implementing allowlist-based access control for encrypted artifacts.

---

## SDK

The `@nexusmind/sdk` package provides a unified TypeScript interface over all infrastructure services.

### NexusMindAgent

The primary class combining memory, storage, encryption, and blockchain identity:

```typescript
import { NexusMindAgent } from '@nexusmind/sdk';

const agent = new NexusMindAgent({
  agentAddress: '0x...',
  privateKey: process.env.AGENT_PRIVATE_KEY,
  role: 'researcher',
  namespace: 'nexusmind-researcher-v1',
  memwalConfig: { /* ... */ },
  walrusConfig: { /* ... */ },
  sealConfig: { /* ... */ },
  suiConfig: { /* ... */ },
});

// Store a memory
await agent.memory.remember('Completed DeFi analysis. TVL up 34%.');

// Recall relevant context
const memories = await agent.memory.recall('DeFi TVL findings');

// Upload an artifact to Walrus
const blobId = await agent.artifacts.upload(reportBuffer, {
  type: 'report',
  taskId: 'task-001',
});

// Record artifact provenance onchain
await agent.sui.recordArtifact(blobId, 'report', 'task-001');
```

See [docs/sdk-reference.md](docs/sdk-reference.md) for the complete API reference.

---

## Agent Demos

NexusMind ships with four agent implementations demonstrating the full coordination workflow:

| Agent | Role | Description |
|-------|------|-------------|
| Orchestrator | Coordinator | Creates workflows, dispatches tasks, aggregates results |
| Researcher | Specialist | Recalls prior context, generates research reports, stores artifacts |
| Trader | Specialist | Decrypts research via Seal, produces trading signals |
| Monitor | Infrastructure | Tracks agent health, Walrus network status, latency metrics |

The core demonstration flow:

1. Orchestrator creates a workflow and dispatches a research task
2. Researcher recalls prior findings from MemWal, generates a report, encrypts it with Seal, uploads to Walrus, and records provenance onchain
3. Trader retrieves the encrypted report from Walrus, decrypts with Seal, and generates trading signals
4. Orchestrator aggregates results and marks the workflow as completed

See [docs/agent-demos.md](docs/agent-demos.md) for detailed instructions.

---

## Dashboard

The Next.js dashboard provides a visual interface for inspecting the NexusMind system:

- **Agent Cards** -- Live status display for each registered agent with role and activity indicators
- **Memory Explorer** -- Browse and search agent memories stored in MemWal namespaces
- **Artifact Viewer** -- View and download Walrus-stored blobs with provenance metadata
- **Wallet Integration** -- Connect a Sui wallet to interact with onchain data

The dashboard connects to Sui testnet by default and uses `@mysten/dapp-kit` for wallet management.

---

## Configuration

All configuration is managed through environment variables. Copy `.env.example` to `.env.local` and fill in your values.

| Variable | Description | Required |
|----------|-------------|----------|
| `MEMWAL_DELEGATE_KEY` | MemWal delegate key from the Playground | Yes |
| `MEMWAL_ACCOUNT_ID` | MemWal account identifier | Yes |
| `MEMWAL_SERVER_URL` | MemWal relay server endpoint | Yes |
| `WALRUS_NETWORK` | Walrus network: `testnet` or `mainnet` | Yes |
| `WALRUS_PUBLISHER_URL` | Walrus publisher endpoint | Yes |
| `WALRUS_AGGREGATOR_URL` | Walrus aggregator endpoint | Yes |
| `SUI_NETWORK` | Sui network: `testnet` or `mainnet` | Yes |
| `SUI_RPC_URL` | Sui fullnode JSON-RPC URL | Yes |
| `AGENT_PRIVATE_KEY` | Ed25519 private key for agent transactions | Yes |
| `MOVE_PACKAGE_ID` | Deployed Move package object ID | After deploy |
| `AGENT_REGISTRY_ID` | Agent registry shared object ID | After deploy |
| `SEAL_KEY_SERVER_URLS` | Comma-separated Seal key server URLs | For encryption |
| `ANTHROPIC_API_KEY` | Anthropic API key for LLM-powered agents | For agent demos |

---

## Testing

### Type Checking

```bash
pnpm type-check
```

### Unit Tests

```bash
pnpm test
```

### Memory Restore Verification

Demonstrates the durability guarantee -- wipes local state and rebuilds entirely from Walrus:

```bash
npx tsx scripts/restore-memory.ts
```

---

## Deployment

### Dashboard to Vercel

The dashboard is configured for deployment on Vercel with the Next.js framework preset.

```bash
cd apps/dashboard
npx vercel --prod
```

Set the following environment variables in your Vercel project settings:

- `NEXT_PUBLIC_WALRUS_NETWORK`
- `NEXT_PUBLIC_SUI_NETWORK`
- `NEXT_PUBLIC_MOVE_PACKAGE_ID`

### Move Contracts to Sui Testnet

```bash
npx tsx scripts/deploy-move.ts
```

---

## Documentation

Detailed documentation is available in the `docs/` directory:

- [Getting Started](docs/getting-started.md) -- Installation, setup, and first run
- [Architecture](docs/architecture.md) -- System design and component relationships
- [SDK Reference](docs/sdk-reference.md) -- Complete API documentation for `@nexusmind/sdk`
- [Agent Demos](docs/agent-demos.md) -- Running and understanding the agent demonstrations

---

## License

MIT

---

Built on the Sui ecosystem: Sui Move, Walrus, MemWal, Seal, and Sui Stack Messaging.
