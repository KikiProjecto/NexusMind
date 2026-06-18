import { NexusMindAgent } from '@nexusmind/sdk';

export async function runMonitor(agent: NexusMindAgent) {
  console.log(`[MonitorAgent] Running health check`);

  // Mock system metrics
  const metrics = {
    cpu: Math.floor(Math.random() * 100),
    memory: Math.floor(Math.random() * 100),
    activeAgents: 3,
    lastEventTimestamp: Date.now()
  };

  const reportStr = JSON.stringify(metrics, null, 2);

  // Store health report to Walrus
  const artifact = await agent.storeArtifact(
    reportStr,
    'log',
    `monitor-${Date.now()}`
  );

  // Commit result summary to MemWal
  await agent.commitResult(`System health check complete. CPU: ${metrics.cpu}%, Memory: ${metrics.memory}%`, artifact.blobId);

  console.log(`[MonitorAgent] Complete. Log Blob: ${artifact.blobId}`);
}
