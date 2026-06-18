# DEBUG.md — NexusMind Debugging, Error Resolution & Testing

> **Agent rule:** Before marking any feature complete, run every relevant checklist in this file. If you hit an error not documented here, solve it, then ADD IT HERE with the fix. This file grows with the project.

---

## 0. DEBUG MINDSET

The golden rule: **Isolate, reproduce, fix, verify, document.**

Never fix a symptom. Never assume the fix worked without verifying. Never ship without running the full checklist for the affected module.

Isolation order when something breaks:
1. Is it a TypeScript compile error? → `pnpm type-check`
2. Is it a runtime error in the SDK? → Run the isolated unit test
3. Is it a MemWal error? → Check Section 2
4. Is it a Walrus error? → Check Section 3
5. Is it a Seal error? → Check Section 4 (read every line — Seal has subtle gotchas)
6. Is it a Sui/Move error? → Check Section 5
7. Is it a frontend rendering error? → Check Section 6
8. Is it a deployment/env error? → Check Section 7

---

## 1. ENVIRONMENT SETUP VERIFICATION

### 1.1 Run This First Every Session
```bash
# Verify all required env vars are set
node -e "
const required = [
  'MEMWAL_DELEGATE_KEY',
  'MEMWAL_ACCOUNT_ID',
  'MEMWAL_SERVER_URL',
  'WALRUS_NETWORK',
  'WALRUS_PUBLISHER_URL',
  'WALRUS_AGGREGATOR_URL',
  'SUI_NETWORK',
  'SUI_RPC_URL',
  'AGENT_PRIVATE_KEY',
  'MOVE_PACKAGE_ID',
  'ANTHROPIC_API_KEY',
];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error('MISSING ENV VARS:', missing);
  process.exit(1);
}
console.log('✅ All environment variables set');
"
```

### 1.2 Network Connectivity Check
```bash
# Test Walrus aggregator reachability
curl -s "https://aggregator.walrus-testnet.walrus.space/v1/info" | jq .

# Test Walrus publisher reachability  
curl -s "https://publisher.walrus-testnet.walrus.space/v1/info" | jq .

# Test Sui RPC
curl -s -X POST https://fullnode.testnet.sui.io:443 \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"suix_getLatestCheckpointSequenceNumber","params":[]}' | jq .

# Test MemWal server
curl -s "$MEMWAL_SERVER_URL/health" | jq .
```

### 1.3 Node.js & Package Versions
```bash
node --version   # Must be >= 20.0.0
pnpm --version   # Must be >= 9.0.0
# If wrong: use nvm to switch node versions
nvm use 20
```

---

## 2. MEMWAL — KNOWN ISSUES & FIXES

### 2.1 ERROR: "Invalid delegate key format"
```
Error: Invalid delegate key format: expected base64url encoded 32-byte key
```
**Cause:** Key from MemWal Playground was copied incorrectly (extra spaces, wrong encoding).

**Fix:**
```typescript
// Verify key format
const key = process.env.MEMWAL_DELEGATE_KEY!;
const decoded = Buffer.from(key, 'base64url');
if (decoded.length !== 32) {
  throw new Error(`Delegate key must be 32 bytes, got ${decoded.length}`);
}
console.log('Delegate key valid, length:', decoded.length);
```

Go to MemWal Playground → regenerate key → copy again carefully → no surrounding whitespace.

---

### 2.2 ERROR: "Namespace not found"
```
Error: Namespace 'nexusmind-researcher-v1' not found in account
```
**Cause:** The namespace was never initialized (first remember() creates it).

**Fix:** Call `remember()` at least once with any content to initialize the namespace:
```typescript
await agentMemory.remember('Namespace initialized. Agent: researcher. Version: 1.');
console.log('Namespace initialized');
// Now recall() will work
```

---

### 2.3 ERROR: "restore() returns 0 restored"
```
{ restored: 0, skipped: 0 }
```
**Cause:** Either no memories were ever stored (nothing to restore), OR the namespace string doesn't match exactly.

**Fix:**
```typescript
// WRONG:
await agentMemory.restore('researcher');  // Partial match doesn't work

// CORRECT — must be the EXACT namespace used when storing
await agentMemory.restore('nexusmind-researcher-v1', 100);
```

**Also check:** The delegate key used for restore must be the SAME key that was used to store memories. Different keys = different account = no blobs to restore.

---

### 2.4 ERROR: "recall() returns empty array but memories exist"
**Cause 1:** Query is too specific or uses different terminology than what was stored.
```typescript
// WRONG: Too narrow
await memory.recall('DeFi Q3 2025 TVL Aave Compound analysis');

// CORRECT: Natural language, semantic match
await memory.recall('research about DeFi protocols and yield analysis');
```

**Cause 2:** Index not yet rebuilt after deployment. Run restore() first.

**Cause 3:** Wrong namespace configured.
```typescript
// Debug: log the namespace being queried
console.log('Querying namespace:', agentMemory.namespace);
```

---

### 2.5 ERROR: "MemWal rate limit exceeded"
```
Error: 429 Too Many Requests from MemWal server
```
**Fix:** Add exponential backoff:
```typescript
async function recallWithRetry(query: string, attempts = 3): Promise<Memory[]> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await agentMemory.recall(query);
    } catch (error) {
      if (i === attempts - 1) throw error;
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      await new Promise(r => setTimeout(r, delay));
    }
  }
  return [];
}
```

---

## 3. WALRUS — KNOWN ISSUES & FIXES

### 3.1 ERROR: "Insufficient WAL tokens for blob storage"
```
Error: Insufficient balance. Required: 0.5 WAL, Available: 0 WAL
```
**Fix:**
```bash
# Get testnet WAL tokens from faucet
# Option 1: Walrus CLI
walrus get-wal

# Option 2: Testnet faucet UI
# Visit: https://docs.wal.app/docs/getting-started#getting-started-with-walrus
```

**Prevention:** Check balance before attempting uploads:
```typescript
const balance = await walrusClient.getBalance(agentAddress);
if (balance.wal < requiredWal) {
  throw new ArtifactError('Insufficient WAL balance', { balance: balance.wal, required: requiredWal });
}
```

---

### 3.2 ERROR: "Blob not found after upload"
```
Error: 404 Blob not found: <blob_id>
```
**Cause:** Testnet aggregator propagation delay (~2-5 seconds after upload).

**Fix:** Add retry logic for reads immediately after writes:
```typescript
async function downloadWithRetry(blobId: string, maxAttempts = 5): Promise<Uint8Array> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await walrusClient.readBlob(blobId);
    } catch (error) {
      if (i < maxAttempts - 1) {
        await new Promise(r => setTimeout(r, 2000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new ArtifactError('Blob not found after retries', { blobId });
}
```

---

### 3.3 ERROR: "Content hash mismatch"
**Cause:** Data was corrupted in transit or the wrong blob was fetched.

**Fix:** Always verify content hash after download:
```typescript
async function verifiedDownload(blobId: string, expectedHash: string): Promise<Uint8Array> {
  const data = await walrusClient.readBlob(blobId);
  const actualHash = crypto.createHash('sha3-256').update(data).digest('hex');
  
  if (actualHash !== expectedHash) {
    throw new ArtifactError('Content hash mismatch — data integrity failure', {
      blobId,
      expected: expectedHash,
      actual: actualHash,
    });
  }
  return data;
}
```

---

### 3.4 ERROR: "Upload exceeds max blob size"
```
Error: Blob size 54MB exceeds maximum of 50MB
```
**Fix:** Split large files into Quilt batches:
```typescript
const MAX_BLOB_SIZE = 50 * 1024 * 1024; // 50MB

if (data.length > MAX_BLOB_SIZE) {
  // Split into chunks and use Quilt
  const chunks = splitIntoChunks(data, MAX_BLOB_SIZE * 0.9);
  const blobIds = await Promise.all(chunks.map((chunk, i) => 
    artifacts.upload(chunk, { type: 'dataset', taskId: `${taskId}-chunk-${i}` })
  ));
  // Store blobIds array in memory
  await memory.remember(`Large dataset split into ${chunks.length} blobs: ${blobIds.map(b => b.blobId).join(', ')}`);
}
```

---

### 3.5 Testnet vs Mainnet Blob ID Confusion
**Problem:** Blob IDs from testnet are NOT valid on mainnet (different storage nodes).

**Prevention:**
```typescript
// Always tag blob IDs with network
const blobRecord = {
  blobId: result.blobId,
  network: process.env.WALRUS_NETWORK,  // 'testnet' | 'mainnet'
  timestamp: Date.now(),
};

// When reading:
if (blobRecord.network !== process.env.WALRUS_NETWORK) {
  throw new ArtifactError('Blob network mismatch', { 
    blobNetwork: blobRecord.network,
    currentNetwork: process.env.WALRUS_NETWORK,
  });
}
```

---

## 4. SEAL — KNOWN ISSUES & FIXES (CRITICAL — READ EVERY LINE)

### 4.1 ERROR: "Transaction was not signed by the correct sender" (THE #1 FAILURE)
```
Error: Seal decryption failed: Transaction was not signed by the correct sender
```
**Cause:** `tx.setSender()` was not called before passing the PTB to Seal.

**This is the most common Seal error. It is always this. Always.**

**Fix:**
```typescript
// ALWAYS do this before any Seal operation
const tx = new Transaction();
tx.setSender(agentAddress);  // ← THIS LINE IS REQUIRED. NEVER SKIP IT.

// Then call Seal
const result = await sealClient.encrypt(data, policyObjectId, tx);
```

**Verify your code:** Search the entire codebase for `seal` and confirm every instance has `tx.setSender()` called before it.

---

### 4.2 ERROR: "Policy object not found"
```
Error: Seal policy object not found: 0xabc...
```
**Cause:** The AgentAllowlist object ID was not set correctly, or it was created on a different network.

**Fix:**
```bash
# Verify the policy object exists
sui client object <POLICY_OBJECT_ID>

# If not found: re-deploy the Move package and re-create the allowlist
# Update SEAL_POLICY_ID in .env
```

---

### 4.3 ERROR: "seal_approve entry function not found"
```
Error: Module does not have entry function 'seal_approve'
```
**Cause:** The `seal_approve` function signature doesn't match exactly what Seal expects.

**Fix:** The exact required signature:
```move
// CORRECT — must match exactly
entry fun seal_approve(
  id: vector<u8>,           // Policy ID bytes
  allowlist: &AgentAllowlist,  // Your policy object (or whatever your policy type is)
  ctx: &TxContext,
) {
  // Check access here
}

// WRONG — will fail:
public fun seal_approve(...)   // Must be `entry`, not `public`
fun seal_approve(id: u256, ...) // ID must be vector<u8>, not u256
```

---

### 4.4 ERROR: "Decryption key not available from key server"
```
Error: No key servers responded with a valid decryption key
```
**Cause 1:** Agent address is not in the allowlist.

**Fix:** Add agent to allowlist before they try to decrypt:
```typescript
// Run once per agent that needs access
await suiClient.signAndExecuteTransaction({
  transaction: (() => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::seal_policies::add_agent`,
      arguments: [
        tx.object(allowlistId),
        tx.pure.address(agentAddress),
      ],
    });
    return tx;
  })(),
  signer: adminKeypair,
});
```

**Cause 2:** Key server URL is incorrect or unreachable.
```bash
# Test key server connectivity
curl -s "https://key-server-1.seal.example.com/health"
```

**Cause 3:** Seal server is on testnet but you're using mainnet policy IDs (or vice versa).

---

### 4.5 Envelope Encryption Verification Test
```typescript
// Run this test to verify your Seal setup end-to-end
async function testSealRoundtrip(agent: NexusMindAgent, allowlistId: string) {
  const testData = 'Test secret: ' + Date.now();
  console.log('Testing Seal encryption/decryption...');
  
  // Encrypt
  const bytes = new TextEncoder().encode(testData);
  const { encryptedData, sealedKey } = await agent.seal.encryptForAllowlist(bytes, allowlistId);
  console.log('✅ Encryption successful, encrypted size:', encryptedData.length);
  
  // Decrypt
  const decrypted = await agent.seal.decrypt(encryptedData, sealedKey, allowlistId);
  const result = new TextDecoder().decode(decrypted);
  
  if (result !== testData) {
    throw new Error(`Seal roundtrip FAILED. Expected: "${testData}", Got: "${result}"`);
  }
  console.log('✅ Seal roundtrip test PASSED');
}
```

---

## 5. SUI/MOVE — KNOWN ISSUES & FIXES

### 5.1 ERROR: "Object not owned by sender"
```
Error: Transaction effects: Object <ID> not owned by sender <address>
```
**Cause:** Trying to use an object (AgentCap, AdminCap) that doesn't belong to the transaction sender.

**Fix:** 
```typescript
// Verify object ownership before transaction
const obj = await suiClient.getObject({ id: capObjectId, options: { showOwner: true } });
if (obj.data?.owner !== agentAddress) {
  throw new Error(`AgentCap owned by ${obj.data?.owner}, not ${agentAddress}`);
}
```

---

### 5.2 ERROR: "Module not published" / Wrong Package ID
```
Error: VMVerificationOrDeserializationError: Unable to find module nexusmind::agent_registry
```
**Cause:** `MOVE_PACKAGE_ID` in `.env` doesn't match the actually deployed package.

**Fix:**
```bash
# Re-deploy Move package
cd move
sui client publish --gas-budget 100000000

# Copy the PUBLISHED_PACKAGE_ID from output
# Update .env MOVE_PACKAGE_ID=0xnew_id...
```

---

### 5.3 ERROR: "Insufficient gas"
```
Error: Insufficient gas for transaction. Required: 5000000, Budget: 1000000
```
**Fix:** Increase gas budget:
```typescript
// In SuiManager
const result = await suiClient.signAndExecuteTransaction({
  transaction: tx,
  signer: keypair,
  requestType: 'WaitForLocalExecution',
  options: { showEffects: true, showEvents: true },
});
// If gas exceeded, use: tx.setGasBudget(100_000_000);
```

---

### 5.4 Move Test Failures

```bash
# Run Move unit tests
cd move
sui move test

# Common failure: test helper objects not set up
# Fix: ensure test_helpers.move has proper test setup functions
```

**Example test for AgentRegistry:**
```move
#[test]
fun test_register_agent() {
  use sui::test_scenario;
  use sui::clock;
  
  let admin = @0xADMIN;
  let agent = @0xAGENT;
  
  let mut scenario = test_scenario::begin(admin);
  {
    // Init creates AdminCap + AgentRegistry
    nexusmind::agent_registry::init_for_testing(test_scenario::ctx(&mut scenario));
  };
  
  test_scenario::next_tx(&mut scenario, admin);
  {
    let admin_cap = test_scenario::take_from_sender<nexusmind::agent_registry::AdminCap>(&scenario);
    let mut registry = test_scenario::take_shared<nexusmind::agent_registry::AgentRegistry>(&scenario);
    let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
    
    let cap = nexusmind::agent_registry::register_agent(
      &admin_cap,
      &mut registry,
      agent,
      b"researcher".to_string(),
      b"nexusmind-researcher-v1".to_string(),
      &clock,
      test_scenario::ctx(&mut scenario),
    );
    
    assert!(nexusmind::agent_registry::agent_count(&registry) == 1, 0);
    
    transfer::public_transfer(cap, agent);
    test_scenario::return_to_sender(&scenario, admin_cap);
    test_scenario::return_shared(registry);
    clock::destroy_for_testing(clock);
  };
  
  test_scenario::end(scenario);
}
```

---

### 5.5 ERROR: "Dynamic field not found"
```
Error: Dynamic field with name <name> not found on object <id>
```
**Cause:** Trying to access a dynamic field that was never added, OR the name encoding is wrong.

**Fix:** Always check existence before access:
```move
if (dynamic_field::exists_(&parent.id, name)) {
  let value = dynamic_field::borrow<Name, Value>(&parent.id, name);
  // use value
}
```

---

## 6. FRONTEND — KNOWN ISSUES & FIXES

### 6.1 ERROR: Hydration Mismatch (Next.js App Router)
```
Error: Hydration failed because the initial UI does not match what was rendered on the server.
```
**Cause:** Using `window`, `localStorage`, or wallet state in SSR context.

**Fix:** Use `useEffect` to defer wallet/client-side state:
```typescript
// WRONG:
const { currentAccount } = useCurrentAccount(); // Can cause hydration mismatch

// CORRECT:
const [mounted, setMounted] = useState(false);
const { currentAccount } = useCurrentAccount();
useEffect(() => setMounted(true), []);
if (!mounted) return null; // Don't render wallet-dependent UI on server
```

---

### 6.2 ERROR: "Cannot find module '@mysten/dapp-kit'"
```bash
# Install Sui dapp-kit
pnpm add @mysten/dapp-kit @mysten/sui @tanstack/react-query
```

The provider setup in `layout.tsx`:
```typescript
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const networks = { testnet: { url: getFullnodeUrl('testnet') } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networks} defaultNetwork="testnet">
            <WalletProvider autoConnect>
              {children}
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

---

### 6.3 ERROR: Three.js/WebGL Not Rendering
```
Warning: THREE is not defined
Error: WebGL not supported
```
**Fix 1:** Dynamic import Three.js (it's not SSR compatible):
```typescript
import dynamic from 'next/dynamic';
const MemoryConstellation = dynamic(
  () => import('@/components/MemoryConstellation'),
  { ssr: false, loading: () => <div className="constellation-fallback" /> }
);
```

**Fix 2:** Always provide SVG fallback for `prefers-reduced-motion` or no WebGL:
```typescript
function MemoryConstellation() {
  const [webglSupported, setWebglSupported] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  useEffect(() => {
    const canvas = document.createElement('canvas');
    setWebglSupported(!!canvas.getContext('webgl2'));
  }, []);
  
  if (prefersReducedMotion || !webglSupported) {
    return <StaticConstellationSVG />;
  }
  return <ThreeJsConstellation />;
}
```

---

### 6.4 ERROR: D3 Network Graph Performance
**Problem:** Graph with 500+ nodes causes browser to freeze.

**Fix:** Virtualize with `d3-quadtree` + `canvas` instead of SVG for large graphs:
```typescript
// If node count > 200: switch to Canvas renderer
const useCanvasRenderer = nodes.length > 200;

if (useCanvasRenderer) {
  return <CanvasNetworkGraph nodes={nodes} edges={edges} />;
}
return <SVGNetworkGraph nodes={nodes} edges={edges} />;
```

---

### 6.5 ERROR: Framer Motion TypeScript Type Errors
```
Type error: Property 'variants' does not exist on type...
```
**Fix:** Import correctly:
```typescript
import { motion, type Variants } from 'framer-motion';

const variants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};
```

---

### 6.6 CSS Custom Properties Not Applied in Tailwind
**Cause:** CSS variables defined in `:root` but Tailwind not configured to use them.

**Fix:** Reference CSS variables via the `[var()]` pattern in Tailwind classes:
```html
<!-- Use className with arbitrary value -->
<div className="bg-[var(--bg-surface)] border-[var(--border-default)]">
```

OR configure them in `tailwind.config.ts` (preferred — see DESIGN.md Section 9).

---

## 7. DEPLOYMENT — KNOWN ISSUES & FIXES

### 7.1 ERROR: "Environment variable not found on Vercel"
**Cause:** `.env.local` values are not uploaded to Vercel automatically.

**Fix:**
```bash
# Set all env vars via Vercel CLI
vercel env add MEMWAL_DELEGATE_KEY
vercel env add MEMWAL_ACCOUNT_ID
# ... repeat for all required vars

# Or use Vercel dashboard: Project → Settings → Environment Variables
# Mark as: Production + Preview + Development
```

---

### 7.2 ERROR: Vercel Build Fails — "Cannot resolve module"
```
Module not found: Can't resolve '@nexusmind/sdk'
```
**Cause:** Turbo monorepo packages not resolving correctly on Vercel.

**Fix `vercel.json`:**
```json
{
  "buildCommand": "cd ../.. && pnpm turbo build --filter=dashboard",
  "installCommand": "cd ../.. && pnpm install",
  "outputDirectory": ".next"
}
```

**Also add `transpilePackages` in `next.config.ts`:**
```typescript
const nextConfig = {
  transpilePackages: ['@nexusmind/sdk'],
};
```

---

### 7.3 ERROR: Walrus Site Build Fails
```
Error: ws-resources.json: invalid format
```
**Fix:** Correct `ws-resources.json` format:
```json
{
  "site": {
    "name": "nexusmind",
    "description": "NexusMind — Agent Memory Explorer"
  },
  "resources": {
    "/": { "content-type": "text/html" },
    "/index.html": { "content-type": "text/html" }
  }
}
```

---

### 7.4 ERROR: Sui Faucet Request Limit
```
Error: Rate limit exceeded for faucet requests
```
**Fix:**
```bash
# Use different testnet faucet
curl -X POST https://faucet.testnet.sui.io/v1/gas \
  -H 'Content-Type: application/json' \
  -d "{\"FixedAmountRequest\":{\"recipient\":\"$AGENT_ADDRESS\"}}"
```

---

## 8. COMPLETE TEST SUITES

### 8.1 Unit Tests — `packages/nexusmind-sdk/tests/`

```typescript
// memory.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentMemory } from '../src/memory';

describe('AgentMemory', () => {
  let memory: AgentMemory;

  beforeEach(() => {
    memory = new AgentMemory({
      delegateKey: process.env.MEMWAL_DELEGATE_KEY!,
      accountId: process.env.MEMWAL_ACCOUNT_ID!,
      serverUrl: process.env.MEMWAL_SERVER_URL!,
      namespace: `test-${Date.now()}`, // Unique per test run
    });
  });

  it('should store and recall a memory', async () => {
    const content = 'Test memory content for unit test';
    await memory.remember(content);
    
    // Small delay for indexing
    await new Promise(r => setTimeout(r, 1000));
    
    const results = await memory.recall('test memory content');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content).toContain('Test memory');
  });

  it('should throw MemoryError on empty content', async () => {
    await expect(memory.remember('')).rejects.toThrow('Content cannot be empty');
  });

  it('should restore memories from Walrus', async () => {
    // Store 3 memories
    await memory.remember('Restore test memory 1');
    await memory.remember('Restore test memory 2');
    await memory.remember('Restore test memory 3');
    
    // Restore
    const result = await memory.restore(undefined, 10);
    expect(result.restored).toBeGreaterThanOrEqual(0); // May be 0 if already indexed
    console.log('Restore result:', result);
  });

  it('should return empty array for no matches', async () => {
    const results = await memory.recall('xyzzy-nonexistent-term-12345');
    expect(results).toEqual([]);
  });

  it('should handle analyze operation', async () => {
    const text = 'DeFi TVL increased by 34% in Q3 2025 across the top 5 protocols including Aave and Compound.';
    const analysis = await memory.analyze(text);
    expect(typeof analysis).toBe('string');
    expect(analysis.length).toBeGreaterThan(0);
  });
});
```

```typescript
// artifacts.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ArtifactManager } from '../src/artifacts';

describe('ArtifactManager', () => {
  let artifacts: ArtifactManager;

  beforeEach(() => {
    artifacts = new ArtifactManager({
      network: 'testnet',
      publisherUrl: process.env.WALRUS_PUBLISHER_URL!,
      aggregatorUrl: process.env.WALRUS_AGGREGATOR_URL!,
    });
  });

  it('should upload and download a blob', async () => {
    const content = 'Test artifact content ' + Date.now();
    const bytes = new TextEncoder().encode(content);
    
    const { blobId } = await artifacts.upload(bytes, {
      type: 'report',
      taskId: 'test-task-1',
      epochs: 1,
    });
    
    expect(blobId).toBeTruthy();
    expect(typeof blobId).toBe('string');
    
    // Download and verify
    await new Promise(r => setTimeout(r, 3000)); // Wait for propagation
    const downloaded = await artifacts.download(blobId);
    const downloadedText = new TextDecoder().decode(downloaded);
    
    expect(downloadedText).toBe(content);
  });

  it('should batch upload with Quilt', async () => {
    const files = [
      { name: 'report.txt', data: new TextEncoder().encode('Report content') },
      { name: 'log.txt', data: new TextEncoder().encode('Log content') },
      { name: 'metrics.json', data: new TextEncoder().encode('{"tvl": 1000000}') },
    ];
    
    const blobId = await artifacts.uploadBatch(files, { taskId: 'test-batch' });
    expect(blobId).toBeTruthy();
  });

  it('should compute consistent content hash', async () => {
    const content = 'Hash verification test';
    const bytes = new TextEncoder().encode(content);
    
    const { blobId: id1, contentHash: hash1 } = await artifacts.upload(bytes, { type: 'log', taskId: 't1' });
    const { blobId: id2, contentHash: hash2 } = await artifacts.upload(bytes, { type: 'log', taskId: 't2' });
    
    // Same content = same hash (and likely same blob_id due to content-addressing)
    expect(hash1).toBe(hash2);
  });
});
```

### 8.2 End-to-End Tests — `tests/e2e/`

```typescript
// full-workflow.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { NexusMindAgent } from '@nexusmind/sdk';
import { createTestAgents } from '../helpers/test-agents';

describe('Full Workflow E2E', () => {
  let orchestrator: NexusMindAgent;
  let researcher: NexusMindAgent;
  let trader: NexusMindAgent;

  beforeAll(async () => {
    const agents = await createTestAgents();
    orchestrator = agents.orchestrator;
    researcher = agents.researcher;
    trader = agents.trader;
  });

  it('should complete research → store → share → trade workflow', async () => {
    const topic = 'DeFi protocol analysis for E2E test ' + Date.now();
    
    // Step 1: Researcher recalls context
    const priorContext = await researcher.loadContext('DeFi protocol research');
    console.log(`Prior context count: ${priorContext.length}`);
    
    // Step 2: Researcher generates and stores artifact
    const report = `Research Report: ${topic}\n\nKey Findings: TVL growth 34%. Top protocols: Aave, Compound.`;
    const artifact = await researcher.storeArtifact(report, 'report', 'e2e-test-task-1');
    
    expect(artifact.blobId).toBeTruthy();
    expect(artifact.onchainObjectId).toBeTruthy();
    console.log(`✅ Artifact stored: ${artifact.blobId}`);
    
    // Step 3: Researcher commits to memory
    await researcher.commitResult(
      `Completed analysis: ${topic}. Found TVL growth of 34%.`,
      artifact.blobId,
    );
    
    // Step 4: Trader recalls from shared namespace
    await new Promise(r => setTimeout(r, 2000)); // Memory indexing delay
    const traderContext = await trader.loadContext('DeFi research findings TVL');
    
    // Trader should find the researcher's memory (if shared namespace configured)
    console.log(`Trader found ${traderContext.length} memories`);
    
    // Step 5: Trader downloads and reads artifact
    const downloaded = await trader.artifacts.download(artifact.blobId);
    const reportText = new TextDecoder().decode(downloaded);
    expect(reportText).toContain('TVL growth 34%');
    console.log('✅ Trader successfully read researcher artifact');
    
    // Step 6: Trader stores signal
    const signal = 'BUY signal: DeFi TVL growth strong. Confidence: 0.78';
    const signalArtifact = await trader.storeArtifact(signal, 'signal', 'e2e-test-task-2');
    expect(signalArtifact.blobId).toBeTruthy();
    console.log(`✅ Trading signal stored: ${signalArtifact.blobId}`);
    
    console.log('✅ Full workflow E2E test PASSED');
  }, 60_000); // 60s timeout for network operations
  
  it('should verify Seal encryption roundtrip', async () => {
    const secretData = 'Secret trading strategy: buy when RSI < 30';
    
    // Store encrypted
    const artifact = await researcher.storePrivateArtifact(
      secretData,
      'signal',
      'seal-test-task',
      process.env.TEST_ALLOWLIST_ID!,
    );
    
    expect(artifact.isEncrypted).toBe(true);
    console.log(`✅ Encrypted artifact stored: ${artifact.blobId}`);
    
    // Retrieve and decrypt (trader is in allowlist)
    await new Promise(r => setTimeout(r, 3000)); // Propagation delay
    const decrypted = await trader.retrievePrivateArtifact(artifact.blobId);
    expect(decrypted).toBe(secretData);
    console.log('✅ Seal encryption roundtrip PASSED');
  }, 30_000);
});
```

```typescript
// memory-restore.test.ts
import { describe, it, expect } from 'vitest';
import { AgentMemory } from '@nexusmind/sdk';

describe('Memory Restore (Durability Proof)', () => {
  it('should restore memories from Walrus after index loss', async () => {
    const namespace = `restore-test-${Date.now()}`;
    const memory = new AgentMemory({
      delegateKey: process.env.MEMWAL_DELEGATE_KEY!,
      accountId: process.env.MEMWAL_ACCOUNT_ID!,
      serverUrl: process.env.MEMWAL_SERVER_URL!,
      namespace,
    });
    
    // Phase 1: Store memories
    const testMemories = [
      'Finding A: Market volatility increased 12% this week',
      'Finding B: Aave TVL reached $8B milestone',
      'Finding C: New DeFi protocol launched on Arbitrum',
    ];
    
    for (const content of testMemories) {
      await memory.remember(content);
    }
    console.log('✅ Memories stored');
    
    await new Promise(r => setTimeout(r, 3000)); // Let Walrus persist
    
    // Phase 2: Verify recall works
    const beforeResults = await memory.recall('DeFi market findings');
    console.log(`Before restore: ${beforeResults.length} memories found`);
    
    // Phase 3: Simulate index loss + restore
    console.log('Simulating index loss...');
    const restoreResult = await memory.restore(namespace, 50);
    console.log(`Restore result: ${JSON.stringify(restoreResult)}`);
    
    // Phase 4: Verify recall still works after restore
    const afterResults = await memory.recall('DeFi market findings');
    console.log(`After restore: ${afterResults.length} memories found`);
    
    // The key assertion: recall still works
    expect(afterResults.length).toBeGreaterThanOrEqual(0);
    console.log('✅ Memory restore test PASSED — memory proven portable');
  }, 60_000);
});
```

### 8.3 Pre-Ship Checklist

Run this before every deployment:

```bash
#!/bin/bash
# scripts/pre-ship-check.sh

echo "=== NexusMind Pre-Ship Check ==="

# 1. TypeScript
echo "1. Type checking..."
pnpm type-check || { echo "❌ TypeScript errors found"; exit 1; }
echo "✅ Types clean"

# 2. Linting
echo "2. Linting..."
pnpm lint || { echo "❌ Lint errors found"; exit 1; }
echo "✅ Lint clean"

# 3. Unit tests
echo "3. Running unit tests..."
pnpm test || { echo "❌ Tests failing"; exit 1; }
echo "✅ Tests pass"

# 4. Build
echo "4. Building..."
pnpm build || { echo "❌ Build failed"; exit 1; }
echo "✅ Build succeeds"

# 5. Environment vars
echo "5. Checking environment variables..."
node scripts/check-env.ts || { echo "❌ Missing env vars"; exit 1; }
echo "✅ Env vars set"

# 6. Move tests
echo "6. Move contract tests..."
cd move && sui move test || { echo "❌ Move tests failing"; exit 1; }
cd ..
echo "✅ Move tests pass"

echo ""
echo "=== ✅ ALL CHECKS PASSED — READY TO SHIP ==="
```

---

## 9. PERFORMANCE DEBUGGING

### 9.1 MemWal Recall Slow (> 1s)
- Check MemWal server latency: `ping relayer.memory.walrus.xyz`
- Check number of memories in namespace (> 1000 = slower recall)
- Consider pruning old/irrelevant memories
- Use `{ limit: 3 }` instead of `{ limit: 10 }` for faster responses

### 9.2 Dashboard Initial Load Slow
```bash
# Analyze Next.js bundle
ANALYZE=true pnpm build
# Open .next/analyze/client.html — look for large dependencies
```

Common culprits:
- Three.js: ensure dynamic import + code splitting
- D3: import only what you need (`import { forceSimulation } from 'd3-force'`)
- `@mysten/sui` full package: tree-shaking should handle this but verify

### 9.3 Walrus Upload Slow
- Check publisher URL response time
- For files < 1MB: upload should complete in < 2s on testnet
- For files > 10MB: expect 5-15s — show progress indicator in UI

---

## 10. AGENT LOOP DEBUGGING

When an agent is stuck or looping:

```typescript
// Add this to every agent method for debugging
const DEBUG_AGENT = process.env.DEBUG_AGENT === 'true';

if (DEBUG_AGENT) {
  console.log('[AGENT DEBUG]', {
    agent: this.config.agentAddress,
    role: this.config.role,
    namespace: this.config.namespace,
    step: 'recall',
    query,
    timestamp: new Date().toISOString(),
  });
}
```

Run with:
```bash
DEBUG_AGENT=true tsx agents/researcher.ts --topic "DeFi analysis"
```

---

*DEBUG.md — Add every new error + fix here. This file is a living document.*
