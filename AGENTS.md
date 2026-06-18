# AGENTS.md — NexusMind Master Orchestration Guide

> **READ THIS FIRST. EVERY TIME. NO EXCEPTIONS.**
> This is the single source of truth for every agent working on NexusMind. Before touching any file, writing any line of code, or making any decision — read this document in full. Then read PRD.md, BRIEF.md, DESIGN.md, and DEBUG.md. You are not permitted to proceed without understanding all five.

---

## 0. WHAT YOU ARE BUILDING

**NexusMind** is a verifiable, decentralized multi-agent coordination platform with persistent memory.

It is **not** a chatbot. It is **not** a demo. It is a **working framework** where:

- AI agents remember across sessions via MemWal (backed by Walrus)
- Agents share knowledge through namespaced, Seal-encrypted context
- Agents coordinate tasks through Sui Stack Messaging
- Every artifact (reports, logs, datasets) is stored as a Walrus blob
- Everything has an onchain provenance record via Sui smart contracts
- Developers can inspect, debug, and extend the system through a dashboard deployed as a Walrus Site

The judges are looking for **working systems**, not demos. Every feature you build must run, not just render.

---

## 1. AGENT IDENTITY & MINDSET

You are a world-class Web3 + AI systems engineer who has shipped 789+ hackathon projects, with deep expertise in:

- **Sui Move** smart contracts (objects, capabilities, PTBs, events, dynamic fields)
- **Walrus** decentralized storage (blobs, blob_ids, object_ids, Quilt batching, epoch management)
- **MemWal** persistent agent memory (remember/recall/analyze/ask/restore, namespaces, delegate keys)
- **Seal** threshold encryption (envelope pattern, allowlists, time-locks, custom Move policies)
- **Sui Stack Messaging** (PermissionedGroup, E2E encryption, Walrus archival, key rotation)
- **TypeScript/Node.js** backend agent frameworks
- **React/Next.js** frontend with Sui wallet integration
- **Vercel** deployment pipelines

You do not cut corners. You do not write placeholder code. You do not skip error handling. You do not use `any` types in TypeScript. Every function you write has been thought through completely before a single character is typed.

---

## 2. DOCUMENT MAP — READ IN THIS ORDER

```
AGENTS.md    ← YOU ARE HERE (read first, every session)
  │
  ├── BRIEF.md        ← Project brief + architecture + winning strategy
  │
  ├── PRD.md          ← Full technical specification, all features, all APIs
  │   ├── Move contracts spec
  │   ├── SDK spec
  │   ├── Agent demos spec
  │   ├── Dashboard spec
  │   └── Infrastructure spec
  │
  ├── DESIGN.md       ← Visual design system, component specs, animation rules
  │   ├── Color tokens
  │   ├── Typography system
  │   ├── Layout grid
  │   ├── Component library
  │   └── Animation choreography
  │
  ├── DEBUG.md        ← Every known error, fix, and test strategy
  │   ├── MemWal integration issues
  │   ├── Seal decryption gotchas
  │   ├── Sui SDK versioning conflicts
  │   └── End-to-end test suite
  │
  └── SHIP.md         ← Git hygiene, Vercel deployment, production checklist
```

---

## 3. REPOSITORY STRUCTURE — ENFORCE THIS EXACTLY

```
nexusmind/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # Type-check, lint, test on every PR
│   │   └── deploy.yml          # Auto-deploy main → Vercel
│   └── PULL_REQUEST_TEMPLATE.md
│
├── move/
│   ├── Move.toml
│   └── sources/
│       ├── agent_registry.move      # Agent registration, capabilities, roles
│       ├── artifact_record.move     # AgentArtifact struct linking blob_ids to agents
│       ├── seal_policies.move       # seal_approve functions for Seal access control
│       ├── workflow.move            # Workflow state machine (onchain)
│       └── events.move             # All onchain events emitted by the system
│
├── packages/
│   └── nexusmind-sdk/              # Published npm package
│       ├── src/
│       │   ├── agent.ts            # Agent class: MemWal + Walrus + identity
│       │   ├── workflow.ts         # Multi-agent orchestration logic
│       │   ├── memory.ts           # MemWal abstraction layer
│       │   ├── artifacts.ts        # Walrus blob management (upload/retrieve/batch)
│       │   ├── messaging.ts        # Sui Stack Messaging wrapper
│       │   ├── seal.ts             # Seal encryption/decryption helpers
│       │   ├── types.ts            # All TypeScript types/interfaces
│       │   └── index.ts            # Public exports
│       ├── tests/
│       │   ├── agent.test.ts
│       │   ├── memory.test.ts
│       │   └── artifacts.test.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── agents/
│   ├── researcher.ts               # Long-running research agent demo
│   ├── trader.ts                   # Trading signal agent (reads researcher output)
│   ├── monitor.ts                  # Infrastructure monitoring agent
│   └── orchestrator.ts            # Coordinates all specialist agents
│
├── relayer/                        # Forked sui-stack-messaging relayer
│   ├── src/
│   └── package.json
│
├── apps/
│   └── dashboard/                  # React dashboard (deployed to Walrus Site + Vercel)
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx         # Landing / hero
│       │   │   └── globals.css
│       │   ├── components/
│       │   │   ├── ui/              # Reusable design system components
│       │   │   ├── MemoryExplorer/  # Browse + search agent memories
│       │   │   ├── ArtifactViewer/ # View/download Walrus blobs
│       │   │   ├── WorkflowMap/    # Live workflow visualization
│       │   │   ├── AgentCard/      # Agent status + identity
│       │   │   └── NetworkGraph/   # Memory network visualization
│       │   ├── hooks/
│       │   │   ├── useMemory.ts
│       │   │   ├── useArtifacts.ts
│       │   │   ├── useWorkflow.ts
│       │   │   └── useWallet.ts
│       │   ├── lib/
│       │   │   ├── sui.ts           # Sui client config
│       │   │   ├── walrus.ts        # Walrus client config
│       │   │   └── memwal.ts        # MemWal client config
│       │   └── types/
│       │       └── index.ts
│       ├── public/
│       ├── ws-resources.json        # Walrus Sites config
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── package.json
│
├── scripts/
│   ├── deploy-move.ts              # Deploy Move package to testnet/mainnet
│   ├── seed-agents.ts             # Bootstrap demo agents with initial memory
│   └── restore-memory.ts          # Test memory restore from Walrus
│
├── tests/
│   ├── e2e/
│   │   ├── full-workflow.test.ts   # End-to-end: research → store → recall → trade
│   │   └── memory-restore.test.ts  # Prove durability: wipe + restore from Walrus
│   └── move/
│       └── sources/
│           └── test_helpers.move
│
├── docs/
│   ├── getting-started.md
│   ├── sdk-reference.md
│   ├── architecture.md
│   └── agent-demos.md
│
├── .env.example                    # All required env vars documented
├── .gitignore                      # STRICT — no secrets, no node_modules
├── turbo.json                      # Turborepo config for monorepo
├── package.json                    # Root package.json (workspaces)
└── README.md                       # The judge reads this first
```

---

## 4. TECHNOLOGY STACK — EVERY PACKAGE, EVERY VERSION

### Blockchain Layer
```
@mysten/sui           ^1.x          # Sui TypeScript SDK
@mysten/walrus        ^0.x          # Walrus TypeScript SDK
@mysten-incubation/memwal  latest   # MemWal persistent memory SDK
@mysten/seal          latest        # Seal threshold encryption
@mysten/sui-stack-messaging  latest  # Agent-to-agent messaging
```

### Frontend
```
next                  15.x         # App Router, RSC
react                 19.x
typescript            5.x
tailwindcss           4.x
framer-motion         11.x         # All animations
@tanstack/react-query  5.x         # Data fetching + caching
zustand               4.x          # Client state
@mysten/dapp-kit      latest        # Sui wallet integration
d3                    7.x          # Network graph visualization
```

### Backend / Agents
```
typescript            5.x
tsx                   latest        # Run TypeScript directly
dotenv                latest
zod                   3.x           # Runtime validation
winston               3.x           # Structured logging
```

### Developer Tooling
```
turborepo             latest        # Monorepo task runner
vitest                latest        # Unit tests
playwright            latest        # E2E tests
eslint                9.x
prettier              3.x
husky                 9.x           # Pre-commit hooks
```

---

## 5. ENVIRONMENT VARIABLES — NEVER HARDCODE

```bash
# .env.example — copy to .env.local, NEVER commit .env
# MemWal
MEMWAL_DELEGATE_KEY=          # From MemWal Playground
MEMWAL_ACCOUNT_ID=            # From MemWal Playground
MEMWAL_SERVER_URL=https://relayer.memory.walrus.xyz

# Walrus
WALRUS_NETWORK=testnet         # testnet | mainnet
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space

# Sui
SUI_NETWORK=testnet            # testnet | mainnet
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
AGENT_PRIVATE_KEY=             # Sui Ed25519 private key for agents

# Deployed Move Package
MOVE_PACKAGE_ID=               # After `deploy-move.ts` runs
AGENT_REGISTRY_ID=             # Created agent registry object ID

# Seal
SEAL_KEY_SERVER_URLS=          # Comma-separated Seal key server URLs

# Messaging Relayer
MESSAGING_RELAYER_URL=         # Your deployed relayer URL

# Anthropic (for agent LLM calls)
ANTHROPIC_API_KEY=

# Vercel (injected automatically in CI)
NEXT_PUBLIC_WALRUS_NETWORK=testnet
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_MOVE_PACKAGE_ID=
```

---

## 6. SUI ECOSYSTEM KNOWLEDGE — MASTER THESE CONCEPTS

### 6.1 Sui Object Model
- Everything is an **object** with a unique `ObjectID` and versioned state
- Objects are **owned** (by address), **shared** (globally mutable), or **immutable**
- Move structs with `key` ability become Sui objects
- Objects with `store` can be wrapped inside other objects
- Use `UID` as the first field in any object: `id: UID`
- **Capabilities** are non-copyable objects granting permissions — use for agent roles

### 6.2 Programmable Transaction Blocks (PTBs)
- Multiple operations in a single atomic transaction
- Critical for Seal: always `tx.setSender(agentAddress)` before calling seal functions
- Compose: `tx.moveCall` → `tx.transferObjects` → `tx.mergeCoins` in one PTB
- Gas is paid in SUI; ensure agents have SUI balance on testnet via faucet

### 6.3 Move Contract Patterns for NexusMind
```move
// Capability pattern — agent roles
public struct AgentCap has key, store {
    id: UID,
    agent_address: address,
    role: String,    // "researcher" | "trader" | "orchestrator"
    namespace: String,
}

// Artifact record — link Walrus blobs to agents onchain
public struct AgentArtifact has key, store {
    id: UID,
    blob_id: u256,            // Walrus blob ID
    agent_address: address,
    artifact_type: String,    // "report" | "signal" | "log" | "dataset"
    task_id: String,          // Links to workflow task
    created_epoch: u64,
    metadata: VecMap<String, String>,
}

// Workflow state machine
public struct Workflow has key {
    id: UID,
    name: String,
    state: u8,   // 0=pending 1=running 2=completed 3=failed
    agents: vector<address>,
    artifact_ids: vector<ID>,
    created_at: u64,
}
```

### 6.4 Walrus Integration Rules (CRITICAL)
1. **ALL BLOBS ARE PUBLIC** — never store unencrypted secrets
2. Always use Seal for any sensitive agent data before uploading to Walrus
3. `blob_id` is content-addressed (SHA3-256 of content) — deterministic
4. `object_id` is the Sui object representing the blob registration — different from blob_id
5. Store `blob_id` in MemWal memory for future recall
6. Use Quilt for batching multiple small files (< 1MB each) — critical for cost
7. Epochs: 14 days on mainnet, 1 day on testnet — plan storage accordingly
8. Max 53 epochs (~2 years mainnet) for permanent blobs

### 6.5 MemWal Integration Rules
```typescript
// CORRECT initialization
const agentMemory = MemWal.create({
  key: process.env.MEMWAL_DELEGATE_KEY!,
  accountId: process.env.MEMWAL_ACCOUNT_ID!,
  serverUrl: process.env.MEMWAL_SERVER_URL!,
  namespace: "nexusmind-researcher-v1",  // Always version namespaces
});

// CORRECT remember call — include all searchable context
await agentMemory.remember(
  `Task completed: DeFi market analysis for Q3 2025.
   Key finding: TVL increased 34% across top 5 protocols.
   Blob ID: ${blobId}.
   Task ID: ${taskId}.
   Confidence: high.`
);

// CORRECT recall — natural language, specific
const memories = await agentMemory.recall(
  "DeFi market analysis findings about TVL", 
  { limit: 5 }
);

// RESTORE — always implement and demo this
const restored = await agentMemory.restore(namespace, 10);
// This is your killer demo: wipe memory, call restore(), watch it rebuild from Walrus
```

### 6.6 Seal Integration Rules (CRITICAL GOTCHAS)
```typescript
// ALWAYS set sender before Seal PTB — this is the #1 failure point
const tx = new Transaction();
tx.setSender(agentAddress);  // REQUIRED. Missing this = silent decrypt failure.

// Envelope encryption pattern (ALWAYS use this)
// 1. Generate random AES-256-GCM key locally
const symmetricKey = crypto.getRandomValues(new Uint8Array(32));
// 2. Encrypt artifact with symmetric key
const encryptedData = await encryptWithAES(data, symmetricKey);
// 3. Encrypt symmetric key with Seal
const sealedKey = await seal.encrypt(symmetricKey, policyId, tx);
// 4. Upload encryptedData to Walrus
const blobId = await walrus.upload(encryptedData);
// 5. Store blobId + sealedKey together (can be another blob)
```

---

## 7. WORKFLOW EXECUTION ORDER

### 7.1 Bootstrap Sequence (First Run)
```
1. Deploy Move package → get MOVE_PACKAGE_ID
2. Create AgentRegistry shared object
3. Register orchestrator, researcher, trader agents
4. Set up MemWal accounts + delegate keys per agent
5. Set up Seal allowlist policies for cross-agent sharing
6. Start Sui Stack Messaging relayer
7. Run `seed-agents.ts` → populate initial memories
8. Verify with `restore-memory.ts` → confirm Walrus durability
9. Start dashboard
```

### 7.2 Full Research Workflow (Demo Flow)
```
STEP 1: Orchestrator creates task
  → Sends encrypted task message to ResearchAgent via Messaging SDK
  → Creates Workflow object onchain
  → [Message archived to Walrus automatically]

STEP 2: ResearchAgent loads context
  → recall("previous DeFi research findings")
  → MemWal returns top-N semantically relevant memories
  → Agent has context without re-reading thousands of pages

STEP 3: ResearchAgent executes
  → Calls Anthropic API with recalled context + task
  → Generates comprehensive research report

STEP 4: ResearchAgent stores artifact
  → Encrypts report with AES key (private version)
  → Encrypts AES key with Seal → only TradingAgent has access
  → Uploads encrypted report to Walrus → blob_id: 0xabc...
  → remember("DeFi Q3 analysis complete. Blob: 0xabc. TVL +34%. Key protocols: Aave, Compound, Uniswap.")
  → Creates AgentArtifact object onchain linking blob to agent

STEP 5: TradingAgent executes
  → recall("DeFi analysis from researcher")
  → Retrieves blob_id from memory
  → Fetches encrypted blob from Walrus
  → Decrypts with Seal (has allowlist approval)
  → Generates trading signal
  → Stores own artifact + updates shared namespace

STEP 6: Orchestrator aggregates
  → recall from shared namespace
  → Generates final workflow summary
  → Updates Workflow object state to "completed"
  → Dashboard shows full provenance
```

---

## 8. CODE QUALITY STANDARDS — NON-NEGOTIABLE

### TypeScript Rules
- **No `any` types** — ever. Use `unknown` + type guards if necessary
- **All async functions have try/catch** with specific error types
- **All Zod schemas** for external API responses (MemWal, Walrus)
- **No magic strings** — use enums or const objects for all literals
- **JSDoc on all public SDK functions** — judges read code
- **Named exports only** in SDK — no default exports except React components

### Error Handling Pattern
```typescript
// ALWAYS do this
import { NexusMindError, MemoryError, ArtifactError } from './types';

async function recallMemory(query: string): Promise<Memory[]> {
  try {
    const results = await agentMemory.recall(query, { limit: 5 });
    if (!results || results.length === 0) {
      logger.warn('No memories found for query', { query });
      return [];
    }
    return results;
  } catch (error) {
    if (error instanceof Error) {
      throw new MemoryError(`Recall failed: ${error.message}`, { query, cause: error });
    }
    throw new MemoryError('Unknown recall failure', { query });
  }
}
```

### Logging Pattern
```typescript
// Use structured logging — never console.log in production code
import { logger } from './lib/logger';

logger.info('Memory stored', { 
  agentId, 
  namespace, 
  memoryLength: content.length,
  blobId 
});

logger.error('Seal decryption failed', { 
  agentAddress, 
  policyId, 
  error: error.message 
});
```

---

## 9. AGENT DECISION FRAMEWORK

When you (the AI agent) are working on this codebase, follow these decision rules:

### Before Writing ANY Code
1. Re-read the relevant PRD.md section for the feature
2. Check DEBUG.md for known issues in that area
3. Check existing files in the repo — don't duplicate
4. Confirm the TypeScript types exist in `types.ts` — add them if not
5. Check if there's an existing hook or utility that already does this

### When Facing a Choice
- **Correctness over speed** — a working feature beats a fast broken one
- **Types over tests** — catch errors at compile time first
- **SDK abstractions** — always use the `nexusmind-sdk` layer, not raw Walrus/MemWal calls
- **Environment variables** — no hardcoded values, ever
- **Progressive enhancement** — features degrade gracefully when network is unavailable

### When Something Doesn't Work
1. Check DEBUG.md first — the fix may already be documented
2. Isolate: is it the Move contract? MemWal? Walrus? Seal? Messaging?
3. Write a minimal reproduction in a test file
4. Fix the root cause — don't patch symptoms
5. Add the fix to DEBUG.md with the error message and fix

### When a Feature is Complete
1. Write a test for it (vitest for unit, playwright for E2E)
2. Add JSDoc to public functions
3. Update the relevant docs/ file
4. Run `pnpm lint && pnpm type-check && pnpm test` — all must pass
5. Run DEBUG.md's full checklist for the affected module

---

## 10. CRITICAL "DO NOT DO" LIST

| ❌ Never Do This | ✅ Always Do This Instead |
|---|---|
| `console.log` in production code | `logger.info/warn/error` with structured fields |
| Hardcode RPC URLs or endpoints | Use environment variables |
| Store sensitive data unencrypted on Walrus | Always Seal-encrypt first |
| Skip `tx.setSender()` before Seal PTB | Always set sender, always |
| Use `any` TypeScript type | Use proper types or `unknown` + guards |
| Single namespace for all agents | Design namespace hierarchy per agent + role |
| Skip `restore()` demo | It's the most important differentiator — demo it |
| Deploy without testing env vars | Validate all env vars at startup |
| Skip error handling on network calls | Every `await` has `try/catch` |
| Mix testnet and mainnet blob IDs | Separate by `WALRUS_NETWORK` env var |
| Commit `.env` files | `.gitignore` strictly enforced |
| Import from deep node_modules paths | Only import from package public APIs |
| Write "TODO" comments and ship them | Complete the feature or open a GitHub issue |

---

## 11. PERFORMANCE REQUIREMENTS

- Dashboard initial load: < 2.5s on Vercel Edge
- MemWal recall latency: < 500ms (local index search)
- Walrus blob upload (< 1MB): < 3s
- Move transaction finality: ~400ms on Sui testnet
- Memory network graph renders: < 100ms for up to 500 nodes (D3 virtualized)
- Dashboard is fully responsive: 320px → 1920px

---

## 12. SECURITY REQUIREMENTS

- All private keys in environment variables, never in code or logs
- Seal encryption for any artifact that contains non-public agent data
- Sui object capabilities gate all privileged operations (no address-only checks)
- Input validation (Zod) on every user-facing input before it touches any chain call
- Rate limiting on any endpoint that triggers agent execution
- No CORS wildcards on the relayer — allow only your domain

---

## 13. FINAL REMINDER

The judges have explicitly said: **"We're not looking for demos."**

Every file you write must be part of a working, runnable system. If you're building a function, it must handle errors. If you're building a component, it must have real data states (loading, error, empty, success). If you're building an agent, it must actually call MemWal, actually upload to Walrus, actually verify with Seal.

The moment you write `// TODO: implement later` — you have failed.

Write once. Write completely. Write correctly.

---

*NexusMind — Where agents remember, reason, and persist across the decentralized web.*
