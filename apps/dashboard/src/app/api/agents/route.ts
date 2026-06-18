import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const agents = [
    {
      id: '0xabc123...456',
      name: 'NexusOrchestrator',
      role: 'orchestrator',
      status: 'idle',
      uptime: '14d 5h',
      metrics: {
        tasksCompleted: 142,
        memoriesStored: 450,
        suiBalance: 4.5,
      },
      lastActive: Date.now() - 1000 * 60 * 15,
      namespace: 'nexusmind-orchestrator-v1',
    },
    {
      id: '0xdef456...789',
      name: 'ResearchAlpha',
      role: 'researcher',
      status: 'active',
      uptime: '14d 5h',
      metrics: {
        tasksCompleted: 856,
        memoriesStored: 8204,
        suiBalance: 12.1,
      },
      lastActive: Date.now() - 1000 * 60 * 2,
      namespace: 'nexusmind-researcher-v1',
    },
    {
      id: '0xghi789...012',
      name: 'TradeExec_01',
      role: 'trader',
      status: 'idle',
      uptime: '14d 5h',
      metrics: {
        tasksCompleted: 341,
        memoriesStored: 1240,
        suiBalance: 8.9,
      },
      lastActive: Date.now() - 1000 * 60 * 45,
      namespace: 'nexusmind-trader-v1',
    },
    {
      id: '0xjkl012...345',
      name: 'SystemMonitor',
      role: 'monitor',
      status: 'active',
      uptime: '30d 12h',
      metrics: {
        tasksCompleted: 10420,
        memoriesStored: 2953,
        suiBalance: 2.2,
      },
      lastActive: Date.now() - 1000 * 15, // 15 seconds ago
      namespace: 'nexusmind-monitor-v1',
    }
  ];

  return NextResponse.json({ agents });
}
