# Getting Started

This guide walks you through setting up a local NexusMind development environment, deploying contracts to Sui testnet, seeding agent memory, and running the dashboard and agent demos. Follow every step in order; later stages depend on artifacts produced by earlier ones.

---

## Prerequisites

Install the following tools before proceeding. The versions listed are the minimum supported.

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.x or later | Runtime for SDK, agents, and dashboard |
| pnpm | 11.x or later | Monorepo package manager (workspaces) |
| Sui CLI | Latest stable | Move compilation, testnet deployment, key management |
| Walrus CLI | Latest stable | Blob upload/download and epoch inspection |
| Git | 2.40+ | Version control |

### Verify installations

```bash
node --version    # v20.x+
pnpm --version    # 11.x+
sui --version     # sui <version>-<commit>
walrus --version  # walrus <version>
```

### Sui testnet wallet

If you do not already have a Sui keypair, generate one and request testnet SUI:

```bash
sui client new-address ed25519
sui client faucet --address <YOUR_ADDRESS> --network testnet
```

Record the private key. You will need it for the `AGENT_PRIVATE_KEY` environment variable.

---

## Clone and Install

```bash
git clone https://github.com/<your-org>/nexusmind.git
cd nexusmind
pnpm install
```

The repository uses Turborepo workspaces. `pnpm install` at the root resolves dependencies for all packages:

```
nexusmind/
  packages/nexusmind-sdk/
  agents/
  apps/dashboard/
  relayer/
  scripts/
  tests/
```

### Build the SDK first

Other packages depend on `nexusmind-sdk`. Build it before anything else:

```bash
pnpm --filter nexusmind-sdk build
```

---

## Environment Setup

Copy the example environment file and fill in every value:

```bash
cp .env.example .env.local
```

The required variables are listed below. Do not leave any blank; the system validates all variables at startup and will exit with a descriptive error if any are missing.

```bash
# MemWal
MEMWAL_DELEGATE_KEY=          # From MemWal Playground
MEMWAL_ACCOUNT_ID=            # From MemWal Playground
MEMWAL_SERVER_URL=https://relayer.memory.walrus.xyz

# Walrus
WALRUS_NETWORK=testnet
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space

# Sui
SUI_NETWORK=testnet
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
AGENT_PRIVATE_KEY=            # Ed25519 private key (base64 or hex)

# Deployed Move Package (populated after deploy step)
MOVE_PACKAGE_ID=
AGENT_REGISTRY_ID=

# Seal
SEAL_KEY_SERVER_URLS=         # Comma-separated Seal key server URLs

# Messaging Relayer
MESSAGING_RELAYER_URL=        # URL of your deployed relayer instance

# LLM Provider
ANTHROPIC_API_KEY=            # Required for agent LLM calls

# Dashboard (public, embedded in client bundle)
NEXT_PUBLIC_WALRUS_NETWORK=testnet
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_MOVE_PACKAGE_ID=  # Same as MOVE_PACKAGE_ID
```

> **Security note.** Never commit `.env.local`. The repository `.gitignore` already excludes it. Verify this before your first commit.

---

## Deploy Move Contracts

Compile and publish the Move package to Sui testnet. The deployment script handles compilation, publishing, and object ID extraction in a single step.

### Option A: Deployment script

```bash
pnpm tsx scripts/deploy-move.ts
```

The script will:

1. Compile `move/sources/*.move` against the `Move.toml` dependency graph.
2. Publish the package to the network specified by `SUI_NETWORK`.
3. Create the shared `AgentRegistry` object.
4. Print the `MOVE_PACKAGE_ID` and `AGENT_REGISTRY_ID`.

Copy both IDs into `.env.local`.

### Option B: Manual Sui CLI

```bash
cd move
sui move build
sui client publish --gas-budget 200000000
```

After publishing, note the package ID from the transaction output and call the registry initialization function manually:

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module agent_registry \
  --function create_registry \
  --gas-budget 10000000
```

Record the created object ID as `AGENT_REGISTRY_ID`.

---

## Seed Agents

With the Move package deployed and environment variables set, register the demo agents and populate their initial memories:

```bash
pnpm tsx scripts/seed-agents.ts
```

This script performs the following operations:

1. Registers three agents (Researcher, Trader, Monitor) in the onchain `AgentRegistry`.
2. Creates `AgentCap` capability objects for each agent.
3. Populates each agent's MemWal namespace with seed memories (historical research findings, baseline trading signals, infrastructure health snapshots).
4. Creates Seal allowlist policies that grant cross-agent read access where required.

### Verify memory persistence

Run the restore script to confirm that seed memories survive a cold start:

```bash
pnpm tsx scripts/restore-memory.ts
```

The script wipes the local memory index and rebuilds it entirely from Walrus-backed storage. If it prints the seeded memories, the system is correctly configured.

---

## Run the Dashboard

The dashboard is a Next.js application located in `apps/dashboard/`.

### Development mode

```bash
pnpm --filter dashboard dev
```

The development server starts at `http://localhost:3000`. Hot module replacement is enabled. Connect a Sui wallet (Sui Wallet, Suiet, or Ethos) to interact with onchain data.

### Production build

```bash
pnpm --filter dashboard build
pnpm --filter dashboard start
```

### Dashboard features

| Page | Description |
|------|-------------|
| Landing | System overview, agent status summary |
| Memory Explorer | Browse and search agent memories by namespace |
| Artifact Viewer | Inspect, download, and decrypt Walrus-stored artifacts |
| Workflow Map | Live visualization of multi-agent workflow state |
| Network Graph | D3-rendered graph of memory relationships across agents |

---

## Run Agent Demos

### Full research workflow

Execute the end-to-end research workflow where the Orchestrator dispatches a task, the Researcher generates a report, stores it to Walrus, and the Trader consumes it:

```bash
pnpm tsx agents/orchestrator.ts
```

The orchestrator will:

1. Create a `Workflow` object onchain.
2. Send an encrypted task to the Researcher via Sui Stack Messaging.
3. Wait for the Researcher to produce an artifact.
4. Forward the artifact reference to the Trader.
5. Aggregate results and mark the workflow as completed.

### Individual agents

Run agents in isolation for debugging:

```bash
# Researcher only
pnpm tsx agents/researcher.ts

# Trader only (requires existing research artifacts)
pnpm tsx agents/trader.ts

# Monitor (runs continuously, Ctrl+C to stop)
pnpm tsx agents/monitor.ts
```

### End-to-end tests

```bash
# Unit and integration tests
pnpm test

# Full E2E suite (requires deployed contracts and running relayer)
pnpm test:e2e
```

---

## Start the Messaging Relayer

The relayer bridges Sui Stack Messaging between agents. It must be running for multi-agent workflows to function.

```bash
cd relayer
pnpm install
pnpm start
```

The relayer binds to the port specified in its configuration (default: `4000`). Set `MESSAGING_RELAYER_URL=http://localhost:4000` in `.env.local` when running locally.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `MemWal recall returns empty` | Delegate key expired or wrong namespace | Regenerate key in MemWal Playground; verify namespace string |
| `Seal decrypt fails silently` | Missing `tx.setSender()` in PTB | Ensure every Seal transaction sets the sender address |
| `Move publish fails` | Insufficient gas or wrong network | Run `sui client faucet` and verify `SUI_NETWORK` matches CLI active env |
| `Walrus upload timeout` | Publisher endpoint unreachable | Check `WALRUS_PUBLISHER_URL`; try a different publisher from the Walrus docs |
| `Dashboard wallet not connecting` | dApp kit version mismatch | Run `pnpm --filter dashboard install` to resync dependencies |

For additional debugging guidance, see `DEBUG.md` at the repository root.

---

## Next Steps

- Read [Architecture](./architecture.md) to understand how the layers fit together.
- Read [SDK Reference](./sdk-reference.md) for the full `nexusmind-sdk` API.
- Read [Agent Demos](./agent-demos.md) for detailed workflow walkthroughs.
