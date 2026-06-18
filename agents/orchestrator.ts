import { NexusMindAgent } from '@nexusmind/sdk';

export async function runOrchestrator(agent: NexusMindAgent, taskDesc: string) {
  console.log(`[Orchestrator] Starting task: ${taskDesc}`);

  // 1. Create Workflow onchain (mock generation)
  const workflowId = `wf-${Date.now()}`;

  // 2. Add agents to PermissionedGroup / Send encrypted task assignments
  console.log(`[Orchestrator] Assigning tasks to agents for workflow ${workflowId}`);
  try {
    const relayerUrl = process.env.MESSAGING_RELAYER_URL || 'http://localhost:3001/message';
    await fetch(relayerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: agent.config.agentAddress,
        recipient: 'researcher',
        type: 'task_assignment',
        content: taskDesc,
        workflowId
      })
    });
  } catch(e) {
    console.warn('[Orchestrator] Could not send message via relayer', e);
  }

  // 3. Mock aggregate results from shared namespace
  const memories = await agent.loadContext(`results for ${workflowId}`, 5);

  const summary = `Workflow ${workflowId} summary: Found ${memories.length} related memories. Task completed successfully.`;

  // 4. Final summary and Walrus artifact
  const artifact = await agent.storeArtifact(
    summary,
    'summary',
    workflowId
  );

  await agent.commitResult(`Workflow ${workflowId} completed.`, artifact.blobId);
  console.log(`[Orchestrator] Complete. Summary Blob: ${artifact.blobId}`);
}
