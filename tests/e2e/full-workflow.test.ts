import { test, expect } from 'vitest';
import { NexusMindAgent } from '../../packages/nexusmind-sdk/src';
import { SuiManager } from '../../packages/nexusmind-sdk/src/sui';

test('End-to-End Workflow', async () => {
  const orchestrator = new NexusMindAgent({
    agentAddress: '0x123',
    privateKey: 'mock',
    role: 'orchestrator',
    namespace: 'nexusmind-test',
    memwalConfig: {
      delegateKey: 'mock',
      accountId: 'mock',
      serverUrl: 'http://localhost',
      namespace: 'nexusmind-test'
    },
    walrusConfig: {
      network: 'testnet',
      publisherUrl: 'http://localhost',
      aggregatorUrl: 'http://localhost'
    },
    sealConfig: {
      keyServerUrls: ['http://localhost']
    },
    suiConfig: {
      network: 'testnet',
      rpcUrl: 'http://localhost',
      packageId: '0x0',
      registryId: '0x0'
    }
  });

  // Since we are running offline, we just instantiate to verify types and structure
  expect(orchestrator).toBeDefined();
  expect(orchestrator.memory).toBeDefined();
  expect(orchestrator.artifacts).toBeDefined();
});
