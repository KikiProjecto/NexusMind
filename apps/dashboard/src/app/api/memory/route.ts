import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const namespace = searchParams.get('namespace') || 'all';

  // Demo data for Memories
  let memories = [
    {
      id: 'mem-001',
      namespace: 'nexusmind-researcher-v1',
      content: 'DeFi TVL increased by 34% in Q3. Top performing protocols were Aave, Compound, and Uniswap. The total value locked reached $12.4B.',
      timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
      similarityScore: 0.94,
      blobId: '0x7a8f9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
    },
    {
      id: 'mem-002',
      namespace: 'nexusmind-trader-v1',
      content: 'Executed SUI/USDT long position based on researcher analysis of upcoming network upgrade and increased developer activity.',
      timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      similarityScore: 0.82,
      blobId: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
    },
    {
      id: 'mem-003',
      namespace: 'nexusmind-monitor-v1',
      content: 'Detected increased latency in Sui RPC endpoints. Failed over to backup nodes. System remains stable.',
      timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
      similarityScore: 0.71,
    },
    {
      id: 'mem-004',
      namespace: 'nexusmind-orchestrator-v1',
      content: 'Workflow 0x8f2d completed successfully. Artifacts verified. Agents returned to idle state.',
      timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
      similarityScore: 0.88,
    },
  ];

  if (namespace !== 'all') {
    memories = memories.filter((m) => m.namespace.includes(namespace));
  }

  if (query) {
    const q = query.toLowerCase();
    memories = memories.filter((m) => m.content.toLowerCase().includes(q));
  }

  return NextResponse.json({ memories });
}
