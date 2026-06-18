import { NexusMindAgent } from '@nexusmind/sdk';

async function mockAnthropicCall(context: string, asset: string) {
  return `MOCK TRADING SIGNAL:
Asset: ${asset}
Based on research: ${context.substring(0, 50)}...
Signal: STRONG BUY`;
}

export async function runTrader(agent: NexusMindAgent, asset: string) {
  console.log(`[TradingAgent] Starting signal generation for asset: ${asset}`);

  // 1. Recall relevant research memories
  const memories = await agent.loadContext(`DeFi analysis from researcher about ${asset}`, 1);

  if (!memories || memories.length === 0) {
    console.log('[TradingAgent] No memories found for trading.');
    return;
  }

  // Find blobId in the memory content
  const blobIdMatch = memories[0].content.match(/Walrus Blob: ([a-zA-Z0-9_-]+)/);
  const blobId = blobIdMatch ? blobIdMatch[1] : null;

  let researchContext = 'No direct artifact';

  if (blobId) {
    try {
      // 2. Download and decrypt the researcher's sealed artifact
      researchContext = await agent.retrievePrivateArtifact(blobId);
    } catch (e) {
      console.log('[TradingAgent] Failed to decrypt, falling back to public info or memory content');
      researchContext = memories[0].content;
    }
  } else {
    researchContext = memories[0].content;
  }

  // 3. Generate trading signal
  const signal = await mockAnthropicCall(researchContext, asset);

  // 4. Store as public Walrus artifact
  const artifact = await agent.storeArtifact(
    signal,
    'signal',
    `trade-${Date.now()}`
  );

  // 5. Commit to memory
  await agent.commitResult(`Generated signal for ${asset}: STRONG BUY`, artifact.blobId);

  console.log(`[TradingAgent] Complete. Signal Blob: ${artifact.blobId}`);

  // Send result notification via Sui Stack Messaging
  try {
    const relayerUrl = process.env.MESSAGING_RELAYER_URL || 'http://localhost:3001/message';
    await fetch(relayerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: agent.config.agentAddress,
        recipient: 'orchestrator',
        type: 'signal_complete',
        blobId: artifact.blobId
      })
    });
  } catch (e) {
    console.warn('[TradingAgent] Could not notify orchestrator:', e);
  }
}
