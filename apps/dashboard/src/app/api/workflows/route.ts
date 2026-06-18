import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const workflows = [
    {
      id: '0x8f2d...91a2',
      name: 'DeFi Yield Analysis Q3',
      status: 'completed',
      createdAt: Date.now() - 1000 * 60 * 60 * 3,
      updatedAt: Date.now() - 1000 * 60 * 60 * 2,
      agentCount: 3,
      artifactCount: 2,
      tasks: [
        { id: 'task-001', name: 'Data Collection', agentRole: 'Researcher', status: 'completed' },
        { id: 'task-002', name: 'Signal Generation', agentRole: 'Trader', status: 'completed' },
        { id: 'task-003', name: 'Report Aggregation', agentRole: 'Orchestrator', status: 'completed' },
      ]
    },
    {
      id: '0x4a1b...7c8d',
      name: 'Market Sentiment Tracking',
      status: 'running',
      createdAt: Date.now() - 1000 * 60 * 30,
      updatedAt: Date.now() - 1000 * 60 * 5,
      agentCount: 2,
      artifactCount: 1,
      tasks: [
        { id: 'task-004', name: 'Twitter Scrape', agentRole: 'Researcher', status: 'completed' },
        { id: 'task-005', name: 'Sentiment Analysis', agentRole: 'Researcher', status: 'running' },
        { id: 'task-006', name: 'Strategy Update', agentRole: 'Trader', status: 'pending' },
      ]
    },
    {
      id: '0x2e9f...3b4c',
      name: 'Node Latency Audit',
      status: 'failed',
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      updatedAt: Date.now() - 1000 * 60 * 60 * 23.5,
      agentCount: 1,
      artifactCount: 0,
      error: 'RPC timeout during block synchronization check',
      tasks: [
        { id: 'task-007', name: 'Ping Nodes', agentRole: 'Monitor', status: 'completed' },
        { id: 'task-008', name: 'Sync Check', agentRole: 'Monitor', status: 'failed' },
      ]
    },
    {
      id: '0x9c8d...1a2b',
      name: 'Daily Portfolio Rebalance',
      status: 'pending',
      createdAt: Date.now() - 1000 * 60 * 5,
      updatedAt: Date.now() - 1000 * 60 * 5,
      agentCount: 2,
      artifactCount: 0,
      tasks: [
        { id: 'task-009', name: 'Fetch Balances', agentRole: 'Trader', status: 'pending' },
        { id: 'task-010', name: 'Execute Swaps', agentRole: 'Trader', status: 'pending' },
      ]
    }
  ];

  return NextResponse.json({ workflows });
}
