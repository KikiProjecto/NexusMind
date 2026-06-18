import { NexusMindAgent } from '@nexusmind/sdk';
import { randomBytes } from 'crypto';

export async function main() {
  console.log("Seeding agents with initial memory...");

  const agentConfig = {
    agentAddress: '0x123',
    privateKey: randomBytes(32).toString('hex'),
    role: 'researcher' as const,
    namespace: 'nexusmind-researcher-v1',
    memwalConfig: {
      delegateKey: process.env.MEMWAL_DELEGATE_KEY || 'mock-key',
      accountId: process.env.MEMWAL_ACCOUNT_ID || 'mock-account',
      serverUrl: process.env.MEMWAL_SERVER_URL || 'http://localhost',
      namespace: 'nexusmind-researcher-v1',
    },
    walrusConfig: {
      network: 'testnet' as const,
      publisherUrl: 'http://localhost',
      aggregatorUrl: 'http://localhost',
    },
    sealConfig: {
      keyServerUrls: ['http://localhost'],
    },
    suiConfig: {
      network: 'testnet',
      rpcUrl: 'http://localhost',
      packageId: '0xabc',
      registryId: '0xdef',
    }
  };

  const agent = new NexusMindAgent(agentConfig);

  await agent.commitResult("Initial bootstrap memory. NexusMind initialized.");
  await agent.commitResult("DeFi analysis baseline: TVL is growing.");

  console.log("Agents seeded.");
}

if (require.main === module) {
  main().catch(console.error);
}
