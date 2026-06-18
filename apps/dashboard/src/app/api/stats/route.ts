import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const stats = {
    memoriesStored: 12847,
    artifactsCreated: 3291,
    workflowsExecuted: 856,
    agentsActive: 4,
    walrusStorageUsed: 1024 * 1024 * 542, // 542MB
    suiTransactions: 15420,
  };

  return NextResponse.json({ stats });
}
