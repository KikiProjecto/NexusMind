# 🏆 Complete Winning Brief: Walrus Track — AI Agent Persistent Memory

## Executive Summary

**Project Name:** `NexusMind` — A Multi-Agent Coordination Platform with Verifiable Persistent Memory

**One-liner:** A framework where AI agents remember, share knowledge, and coordinate across sessions — powered by MemWal for persistent memory, Walrus for artifact storage, Seal for private cross-agent sharing, and Sui for verifiable ownership.

**Why it wins:** It hits every judging dimension — long-term memory, multi-agent coordination, artifact-driven workflows, developer tooling, and real utility — while showcasing the deepest possible Walrus stack integration.

---

## 🎯 The Problem You Are Solving

From the track statement, agents are:

- **Stateless** — lose context between sessions
- **Fragmented** — memory locked to one app, model, or device
- **Not trustworthy** — no verifiable proof that memory is intact, untampered, or portable

MemWal and Walrus solve exactly this. [[Walrus Memory Intro](https://docs.wal.app/walrus-memory/getting-started/what-is-walrus-memory)]

---

## 🏗️ Architecture: Every Layer, Every Detail

```
┌─────────────────────────────────────────────────────────┐
│                   NEXUSMIND PLATFORM                    │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Agent A  │  │ Agent B  │  │ Agent C  │  ...         │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       │              │              │                   │
│  ─────┼──────────────┼──────────────┼──────────────    │
│       ▼              ▼              ▼                   │
│  ┌─────────────────────────────────────────────┐       │
│  │         MemWal SDK  (memory layer)          │       │
│  │  remember / recall / analyze / ask          │       │
│  │  namespace isolation per agent/workflow     │       │
│  └──────────────────┬──────────────────────────┘       │
│                     │                                   │
│       ┌─────────────┼─────────────┐                    │
│       ▼             ▼             ▼                     │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Walrus  │  │   Seal   │  │   Sui    │              │
│  │ (blobs/ │  │ (private │  │(ownership│              │
│  │artifacts│  │ sharing) │  │ /access) │              │
│  └─────────┘  └──────────┘  └──────────┘              │
│                                                         │
│  ┌──────────────────────────────────────────────┐      │
│  │     Walrus Site: Developer Dashboard         │      │
│  │  inspect memory / debug / manage agents      │      │
│  └──────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Deep Dive

### Layer 1: MemWal — Persistent Agent Memory

MemWal is your core memory engine. Every agent gets its own namespaced memory space. [[MemWal Overview](https://docs.wal.app/walrus-memory/getting-started/what-is-walrus-memory)]

**Setup:**

```typescript
import { MemWal } from "@mysten-incubation/memwal";

// Each agent gets a scoped client
const agentMemory = MemWal.create({
  key: process.env.AGENT_DELEGATE_KEY!,
  accountId: process.env.AGENT_ACCOUNT_ID!,
  serverUrl: "https://relayer.memory.walrus.xyz",
  namespace: "research-agent-v1", // isolate per agent role
});
```

[[MemWal Quick Start](https://docs.wal.app/walrus-memory/sdk/quick-start)]

**Four memory operations you must implement:**

| Operation | What It Does | Your Use Case |
|---|---|---|
| `remember()` | Store a memory with semantic embedding | Agent saves findings after each task |
| `recall()` | Retrieve by natural language query | Agent loads relevant context before a new task |
| `analyze()` | Extract structured facts from long text | Agent processes a report into searchable facts |
| `ask()` | Query memory + get LLM-reasoned answer | User or orchestrator queries agent knowledge |
| `restore()` | Rebuild index from Walrus | Cross-device or disaster recovery |

[[MemWal Core Methods](https://docs.wal.app/walrus-memory/sdk/usage/memwal)]

**Multi-agent pattern — namespaces are your coordination primitive:**

```typescript
// Shared namespace: multiple agents read/write to same context
const sharedWorkspace = MemWal.create({
  key: delegateKey,
  accountId: accountId,
  serverUrl: relayerUrl,
  namespace: "project-apollo-shared", // all agents in workflow share this
});

// Private namespace: agent-specific working memory
const privateAgent = MemWal.create({
  key: delegateKey,
  accountId: accountId,
  serverUrl: relayerUrl,
  namespace: "agent-researcher-private",
});
```

[[MemWal Namespaces](https://docs.wal.app/walrus-memory/sdk/overview#namespace)]

**The restore capability is a critical differentiator for judges** — it proves memory is *verifiably portable*, not just cached:

```typescript
// Rebuild index from Walrus if ever lost — proves durability
const result = await agentMemory.restore("research-agent-v1", 10);
console.log(`Restored: ${result.restored}, Skipped: ${result.skipped}`);
```

[[MemWal Restore](https://docs.wal.app/walrus-memory/sdk/usage/memwal#restore)]

---

### Layer 2: Walrus — Artifact & File Storage

Agents generate artifacts — reports, datasets, logs, intermediate outputs. These go directly to Walrus as blobs. [[Walrus Data Storage](https://docs.sui.io/sui-stack/walrus/sui-stack-walrus)]

**Key facts you must build around:**

- All blobs are **public** — never store secrets unencrypted [[Walrus Security](https://docs.wal.app/docs/data-security)]
- Every blob has a `blob_id` (content-addressed hash) and a Sui `object_id` (onchain record)
- Blob IDs are **deterministic** — same content = same ID, enabling deduplication
- Blobs can be **permanent** (guaranteed until expiry) or **deletable** (owner can remove)
- Max storage = 53 epochs (~2 years on Mainnet) [[Walrus Blob Lifetimes](https://docs.wal.app/docs/walrus-client/storing-blobs)]

**Upload path for your agents:**

```typescript
// TypeScript SDK is the right path for in-app agent uploads
// Agent generates a report, stores it as a Walrus blob
// Then stores the blob_id in MemWal memory for future recall

const blobId = await walrusClient.uploadBlob(reportBytes, { epochs: 10 });
await agentMemory.remember(
  `Generated market analysis report. Blob ID: ${blobId}. Topic: DeFi trends Q3.`
);
```

**Use Quilt for batch artifact storage** — multiple small files in one blob, cost-optimized: [[Walrus Quilt](https://docs.wal.app/docs/system-overview/quilt)]

```
// Batch: research sources, intermediate outputs, logs → single quilt blob
// Massive cost saving vs individual uploads
```

**Blob lifecycle managed onchain via Sui objects:**

```move
// Blobs are Sui objects — you can own, transfer, wrap, and manage them
// Your platform can give agents verifiable proof of what data they generated
public struct AgentArtifact has key, store {
    id: UID,
    blob_id: u256,
    agent_address: address,
    artifact_type: String,
    created_epoch: u64,
}
```

---

### Layer 3: Seal — Private Cross-Agent Memory Sharing

Since Walrus is fully public, **Seal is what enables private, access-controlled agent collaboration**. This is your biggest differentiator. [[Seal on Walrus](https://docs.wal.app/docs/data-security#seal-data-confidentially-and-access-control)]

**The envelope encryption pattern for agent artifacts:**

1. Agent generates sensitive output (e.g., proprietary trading signal)
2. Generate a local AES symmetric key, encrypt the artifact
3. Encrypt only the symmetric key with Seal
4. Store encrypted artifact on Walrus
5. Only agents with `seal_approve` permission can decrypt [[Seal Architecture](https://github.com/MystenLabs/sui-move-bootcamp/blob/main/K5/02_architecture.md)]

**Access policy patterns for agent coordination:**

| Pattern | Agent Use Case |
|---|---|
| **Allowlist** | Only agents in your workflow can read shared memory |
| **Token gating** | Agents holding a capability object get read access |
| **Time-lock** | Seal auction/trading results until a future timestamp |
| **Custom Move** | Any onchain condition — agent role, task completion state |

[[Seal Access Patterns](https://docs.wal.app/docs/sites/security/access-control-options#restricting-access-through-seal)]

**Critical:** Set the transaction sender before passing PTB to Seal:

```typescript
tx.setSender(agentAddress); // must match requesting agent's address
// Otherwise decryption fails with "Transaction was not signed by the correct sender"
```

[[Seal Sender Requirement](https://docs.wal.app/docs/data-security)]

---

### Layer 4: Sui Stack Messaging — Agent-to-Agent Communication

For multi-agent coordination, agents need to communicate. The Sui Stack Messaging SDK provides E2E encrypted group messaging with Walrus archival — perfect for agent task delegation and negotiation. [[Messaging SDK](https://docs.sui.io/sui-stack/messaging/)]

**What it gives you:**
- `PermissionedGroup` — onchain group membership (your agent teams)
- 7 granular permission types (send, read, edit, delete, rotate keys)
- Messages archived to Walrus automatically
- Seal encryption — the relayer never sees plaintext

```typescript
import { createSuiStackMessagingClient } from '@mysten/sui-stack-messaging';

// Agents communicate through encrypted channels
// Messages archived to Walrus for audit trail + recovery
const messagingClient = createSuiStackMessagingClient(suiGrpcClient, {
  seal: { serverConfigs: [...] },
  encryption: { sessionKey: { signer: agentKeypair } },
  relayer: { relayerUrl: 'https://your-relayer.example.com' },
});
```

[[Messaging Setup](https://docs.sui.io/sui-stack/messaging/setup)]

**Agent coordination flow:**
- **Orchestrator agent** creates a `PermissionedGroup` — the task channel
- **Specialist agents** are added as members with appropriate permissions
- Messages (task assignments, results, status) are E2E encrypted
- Full message history archived to Walrus — verifiable audit trail
- Key rotation when an agent is removed from a workflow [[Key Rotation](https://docs.sui.io/sui-stack/messaging/chat-app#key-code-highlights)]

---

### Layer 5: Walrus Sites — Developer Dashboard

Deploy your inspection/debug UI as a **Walrus Site** — fully decentralized, censorship-resistant. This is polish that judges notice. [[Walrus Sites](https://docs.wal.app/docs/sites)]

**What your dashboard shows:**
- Agent memory namespaces and their contents
- Blob artifacts with provenance (which agent, which task, when)
- Access control policies (who can read what)
- Workflow execution history
- Memory restore status

---

## 📋 Full Project Structure

```
nexusmind/
├── move/
│   └── sources/
│       ├── agent_registry.move      # Register agents, capabilities
│       ├── artifact_record.move     # Link blob_ids to agent tasks
│       ├── seal_policies.move       # seal_approve functions for access control
│       └── workflow.move            # Workflow state machine onchain
│
├── sdk/                             # Your developer framework (the tooling angle)
│   ├── src/
│   │   ├── agent.ts                 # Agent class wrapping MemWal + Walrus
│   │   ├── workflow.ts              # Multi-agent orchestration
│   │   ├── memory.ts                # MemWal abstraction layer
│   │   ├── artifacts.ts             # Walrus blob management
│   │   └── messaging.ts             # Sui Stack Messaging wrapper
│   └── package.json
│
├── agents/
│   ├── researcher.ts                # Long-running research agent demo
│   ├── trader.ts                    # Trading signal agent demo
│   └── orchestrator.ts             # Coordinates other agents
│
├── dashboard/                       # Walrus Site
│   ├── src/
│   │   ├── pages/
│   │   │   ├── MemoryExplorer.tsx   # Browse agent memories
│   │   │   ├── ArtifactViewer.tsx  # View Walrus blobs
│   │   │   └── WorkflowDebugger.tsx
│   └── ws-resources.json
│
├── relayer/                         # Fork of sui-stack-messaging relayer
│   └── ...
│
└── Move.toml
```

---

## 🔄 Complete Data Flow: One Full Workflow

```
1. TASK ASSIGNED
   Orchestrator → sends encrypted task to ResearchAgent via Messaging SDK
   [Walrus archives task message automatically]

2. AGENT LOADS CONTEXT
   ResearchAgent → recall("previous findings on DeFi yields")
   MemWal returns top-5 semantic matches from Walrus-backed memory

3. AGENT EXECUTES
   ResearchAgent → fetches live data, generates 50-page report

4. ARTIFACT STORED
   ResearchAgent → uploads report bytes to Walrus (blob_id: 0xabc...)
   ResearchAgent → remember("Completed DeFi analysis. Blob: 0xabc. Key findings: ...")
   [blob_id now searchable via future recall()]

5. PRIVATE SHARING
   ResearchAgent → encrypts summary with Seal for TradingAgent only
   Stores encrypted summary on Walrus
   Trading agent has seal_approve permission → decrypts locally

6. RESULT COORDINATION
   TradingAgent → recall("DeFi analysis findings")
   [Retrieves ResearchAgent's memory from shared namespace]
   TradingAgent → executes trade, stores outcome

7. AUDIT TRAIL
   All messages archived to Walrus via Messaging SDK
   All artifacts linked to onchain AgentArtifact objects
   Full workflow verifiable and reproducible
   Developer inspects via Walrus Sites dashboard
```

---

## 🔑 Judging Criteria Mapped to Your Implementation

| What Judges Want | Your Implementation |
|---|---|
| **Long-term memory** | MemWal `remember`/`recall` with `restore` proving durability |
| **Cross-session persistence** | MemWal backed by Walrus — survives restarts, device changes |
| **Multi-agent coordination** | Shared namespaces + Sui Stack Messaging for task delegation |
| **Artifact-driven workflows** | Walrus blob storage with blob_ids stored in MemWal memory |
| **Developer tooling** | Your SDK wrapping MemWal + Walrus + Seal into agent primitives |
| **Verifiability** | Sui objects as onchain records of every artifact |
| **Working system** | Not a demo — a real framework with 2-3 agent demos |
| **Portability** | `restore()` proves memory is not locked to any platform |

---

## ⚡ Implementation Priority Order

**Week 1 — Core Memory Layer:**
1. Set up MemWal accounts + delegate keys [[MemWal Playground](https://docs.wal.app/walrus-memory/getting-started/quick-start)]
2. Build `AgentMemory` class wrapping MemWal with `remember`/`recall`/`analyze`/`restore`
3. Implement namespace strategy (private + shared)
4. Write one working research agent demo end-to-end

**Week 2 — Storage + Privacy:**
5. Walrus blob upload for artifacts, store `blob_id` in MemWal
6. Deploy Move package: `AgentArtifact` struct linking blobs to agents
7. Integrate Seal for encrypted cross-agent artifact sharing
8. Test `restore()` — rebuild memory from Walrus from scratch

**Week 3 — Multi-Agent + Tooling:**
9. Fork and configure Sui Stack Messaging relayer
10. Build orchestrator → specialist agent workflow
11. Ship developer SDK as an npm package
12. Deploy dashboard as a Walrus Site

**Week 4 — Polish + Submission:**
13. Write 2-3 compelling agent demos (research, trading, monitoring)
14. Record demo video showing memory persisting across restarts
15. Document the SDK with clear getting-started guide

---

## 🚫 Critical Pitfalls to Avoid

| Mistake | Why It Loses | Fix |
|---|---|---|
| Storing secrets unencrypted on Walrus | All blobs are public — catastrophic | Always use Seal for sensitive data |
| Missing `tx.setSender()` before Seal PTB | Decryption silently fails | Always set sender on the transaction |
| Single namespace for all agents | No isolation, no coordination story | Design namespace hierarchy upfront |
| No `restore()` demo | Doesn't prove portability | Show memory surviving a full wipe |
| Demo only, no real system | Explicitly what judges said they don't want | Ship working code |
| Hardcoding community endpoints | Fragile, breaks in production | Use Mysten Labs reference endpoints or run your own [[Network Reference](https://docs.wal.app/docs/network-reference#aggregators-and-publishers)] |

---

## 🏅 The Winning Differentiator

Most teams will build a chatbot with memory. You build a **verifiable, decentralized agent memory protocol** — where:

- Memory is **cryptographically owned** by the agent (Sui smart contract)
- Memory is **portable** across any app that holds the delegate key
- Memory is **private by default** (Seal) but selectively shareable
- Memory is **auditable** — every artifact has an onchain provenance record
- Memory **survives everything** — `restore()` from Walrus proves it

That is the future the track is asking for. [[Walrus Memory Vision](https://docs.wal.app/walrus-memory/getting-started/what-is-walrus-memory)]
































## 🏆 Foundation: What the Programmable Storage Track Rewards

Based on the 2025 winners, judges look for projects that are **deeply integrated** with Walrus — not just using it as a file dump, but leveraging its programmable, onchain properties. [[Overflow 2025 Winners](https://blog.sui.io/2025-sui-overflow-hackathon-winners/#programmable-storage)]

| Place | Project | Why It Won |
|---|---|---|
| 1st | SuiSign | Verifiable, onchain signatures — full Walrus + Sui integration |
| 2nd | WalGraph | Novel data structure (graph DB) on Walrus |
| 3rd | SuiMail | Wallet-native protocol with pay-to-send + spam control |
| 4th | Walpress | Censorship-resistant site builder with SuiNS |

**Pattern:** Novel data primitives + real user utility + deep Sui/Walrus composability.

---

## 🔧 Technical Foundations

### 1. Core Walrus Concepts You Must Master

- **Blobs are always public.** All data stored is publicly discoverable. Never store secrets unencrypted. [[Walrus Docs](https://docs.sui.io/sui-stack/walrus/sui-stack-walrus)]
- **Blob ID vs Object ID:** Every blob has a content-addressed `blob_id` (hash) and a Sui `object_id` (onchain record). [[Walrus Data Storage](https://docs.sui.io/sui-stack/walrus/sui-stack-walrus)]
- **Erasure coding:** ~4.5x redundancy across storage nodes — reads stay available with up to 2/3 nodes responsive. [[Walrus Docs](https://docs.wal.app/)]
- **Epochs:** 14 days on Mainnet, 1 day on Testnet. Maximum storage = 53 epochs. [[Walrus Sites Components](https://docs.wal.app/docs/sites/introduction/components)]
- **Quilt API:** Batch multiple small files into one blob to save costs. [[Storage Costs](https://docs.wal.app/docs/system-overview/storage-costs#what-you-get-for-0023gbmonth)]

### 2. The Winning Stack

```
YOUR APP
  ├── Sui (execution, coordination, payments, object ownership)
  ├── Walrus (blob storage, data availability)
  ├── Seal (encryption + onchain access control)       ← differentiator
  └── SuiNS (human-readable names for your resources)  ← polish
```

[[Sui Stack Overview](https://www.sui.io/developers)]

### 3. Encryption with Seal (Critical for Differentiation)

Since all Walrus blobs are public, adding **Seal** for access-controlled content immediately elevates your project. Seal's access policies are Move functions — fully composable: [[Seal Access Policies](https://docs.wal.app/docs/sites/security/access-control-options#restricting-access-through-seal)]

| Pattern | Use Case |
|---|---|
| **Allowlist** | Private docs, collaboration spaces |
| **Token/NFT gating** | Premium content, creator monetization |
| **Time-lock** | Embargoed releases, sealed auctions |
| **Custom Move logic** | Any onchain condition |

---

## 📁 Perfect Project Structure

```
my_walrus_project/
├── move/
│   └── sources/
│       ├── core.move          # Main business logic
│       ├── access_policy.move # seal_approve function
│       └── events.move        # Onchain events
├── frontend/
│   ├── src/
│   │   ├── hooks/
│   │   │   ├── useUpload.ts        # Walrus upload
│   │   │   └── useDecryption.ts    # Seal decryption
│   │   ├── components/
│   │   └── App.tsx
│   └── ws-resources.json      # Walrus Sites config
├── scripts/
│   └── encryptAndUpload.ts    # Pre-upload encryption
├── tests/
│   └── extensions/
│       └── test_helpers.move
└── Move.toml
```

[[Move Testing](https://move-book.com/testing/extend-foreign-module/#project-structure); [OnlyFins Architecture](https://docs.sui.io/sui-stack/walrus/only-fins#architecture)]

---

## 🚀 Upload Path — Choose Right for Your Use Case

| Path | When to Use |
|---|---|
| **TypeScript SDK** | In-app uploads, most hackathon projects |
| **Upload Relay** | Browser/mobile clients |
| **Walrus CLI** | Scripts, dev workflows |
| **HTTP API** | Quick Testnet prototyping |

[[Getting Started with Walrus](https://docs.wal.app/docs/getting-started)]

---

## ✅ Checklist for a Winning Submission

- [ ] **Novel data primitive** — don't just store files, introduce a new data structure or protocol
- [ ] **Deep Sui integration** — blobs linked to Sui objects, ownership transferable, lifecycle managed onchain
- [ ] **Seal encryption** — access-controlled content with a Move policy
- [ ] **SuiNS integration** — human-readable addresses/names for your resources
- [ ] **zkLogin onboarding** — frictionless user entry, no wallet required upfront
- [ ] **Quilt for small blobs** — cost optimization shows judges you understand the system
- [ ] **Real-world utility** — censorship resistance, verifiability, or decentralized ownership must matter for your use case
- [ ] **Clean documentation** — judges read READMEs

[[Overflow 2025 Registration](https://blog.sui.io/overflow-hackathon-2025-registration-opens/); [Walrus System Overview](https://docs.wal.app/docs/system-overview)]

---

Keep an eye on [sui.io/overflow](https://sui.io/overflow) and the [Sui Discord](https://discord.gg/sui) for Sui Overflow 2026 official track announcements, as the exact tracks may differ from 2025.
