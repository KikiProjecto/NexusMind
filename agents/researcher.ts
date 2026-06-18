import { NexusMindAgent } from '@nexusmind/sdk';

async function mockAnthropicCall(context: unknown, task: string) {
  const ctxLength = Array.isArray(context) ? context.length : 0;
  return `MOCK RESEARCH REPORT:
Task: ${task}
Based on context with ${ctxLength} items.
Key finding: TVL increased 34% across top 5 protocols.`;
}

export async function runResearcher(agent: NexusMindAgent, topic: string) {
  console.log(`[ResearchAgent] Starting research for topic: ${topic}`);

  // 1. Recall prior research
  const memories = await agent.loadContext(`previous research findings about ${topic}`, 5);

  // 2. Call Anthropic
  const report = await mockAnthropicCall(memories, topic);

  // 3. Store full report as Walrus blob (public)
  const publicArtifact = await agent.storeArtifact(
    report,
    'report',
    `task-${Date.now()}`
  );

  // 4. Store a Seal-encrypted version for TradingAgent only
  const policyId = process.env.SEAL_POLICY_ID || '0xmockpolicy';
  const privateArtifact = await agent.storePrivateArtifact(
    report,
    'report',
    `task-${Date.now()}-private`,
    policyId
  );

  // 5. Commit result summary to MemWal
  await agent.commitResult(
    `Completed research on ${topic}. Key finding: TVL +34%.`,
    publicArtifact.blobId
  );

  console.log(`[ResearchAgent] Complete. Public Blob: ${publicArtifact.blobId}, Private Blob: ${privateArtifact.blobId}`);
}
