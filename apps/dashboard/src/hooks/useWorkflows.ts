'use client';

import { useState, useCallback } from 'react';
import type { Workflow, DataState } from '@/types';
import { logger } from '@/lib/logger';

const DEMO_WORKFLOWS: Workflow[] = [
  {
    id: 'WF-007',
    name: 'DeFi Market Research Pipeline',
    description: 'Full research → analysis → trading signal workflow with encrypted artifact handoff.',
    state: 'completed',
    agents: ['0x1234...5678', '0xabcd...ef12', '0x5678...9012'],
    tasks: [
      {
        id: 'task-042',
        name: 'Collect DeFi Protocol Data',
        agentRole: 'researcher',
        state: 'completed',
        startedAt: '2025-06-15T14:00:00Z',
        completedAt: '2025-06-15T14:30:00Z',
        artifactIds: ['art-001'],
        error: null,
      },
      {
        id: 'task-043',
        name: 'Generate Trading Signal',
        agentRole: 'trader',
        state: 'completed',
        startedAt: '2025-06-15T14:35:00Z',
        completedAt: '2025-06-15T15:00:00Z',
        artifactIds: ['art-002'],
        error: null,
      },
      {
        id: 'task-wf7-agg',
        name: 'Aggregate & Store Workflow Summary',
        agentRole: 'orchestrator',
        state: 'completed',
        startedAt: '2025-06-15T15:05:00Z',
        completedAt: '2025-06-15T15:30:00Z',
        artifactIds: ['art-003'],
        error: null,
      },
    ],
    artifactIds: ['art-001', 'art-002', 'art-003'],
    createdAt: '2025-06-15T13:55:00Z',
    updatedAt: '2025-06-15T15:30:00Z',
  },
  {
    id: 'WF-008',
    name: 'Security Audit Pipeline',
    description: 'Cross-chain bridge vulnerability analysis with encrypted report distribution.',
    state: 'running',
    agents: ['0x1234...5678', '0x5678...9012'],
    tasks: [
      {
        id: 'task-044',
        name: 'Analyze Bridge Contracts',
        agentRole: 'researcher',
        state: 'completed',
        startedAt: '2025-06-15T15:30:00Z',
        completedAt: '2025-06-15T16:00:00Z',
        artifactIds: ['art-004'],
        error: null,
      },
      {
        id: 'task-sec-review',
        name: 'Generate Risk Assessment',
        agentRole: 'researcher',
        state: 'running',
        startedAt: '2025-06-15T16:05:00Z',
        completedAt: null,
        artifactIds: [],
        error: null,
      },
      {
        id: 'task-sec-report',
        name: 'Distribute Encrypted Report',
        agentRole: 'orchestrator',
        state: 'queued',
        startedAt: null,
        completedAt: null,
        artifactIds: [],
        error: null,
      },
    ],
    artifactIds: ['art-004'],
    createdAt: '2025-06-15T15:25:00Z',
    updatedAt: '2025-06-15T16:05:00Z',
  },
  {
    id: 'WF-009',
    name: 'NFT Market Sentiment Scan',
    description: 'Sui ecosystem NFT analysis with portfolio rebalance recommendation.',
    state: 'pending',
    agents: ['0x1234...5678', '0xabcd...ef12'],
    tasks: [
      {
        id: 'task-045-q',
        name: 'Scan NFT Marketplaces',
        agentRole: 'researcher',
        state: 'queued',
        startedAt: null,
        completedAt: null,
        artifactIds: [],
        error: null,
      },
      {
        id: 'task-046-q',
        name: 'Generate Portfolio Signal',
        agentRole: 'trader',
        state: 'queued',
        startedAt: null,
        completedAt: null,
        artifactIds: [],
        error: null,
      },
    ],
    artifactIds: [],
    createdAt: '2025-06-15T17:00:00Z',
    updatedAt: '2025-06-15T17:00:00Z',
  },
  {
    id: 'WF-006',
    name: 'Historical Data Migration',
    description: 'Migrate legacy trading data to Walrus with Seal encryption.',
    state: 'failed',
    agents: ['0x5678...9012', '0xabcd...ef12'],
    tasks: [
      {
        id: 'task-mig-1',
        name: 'Export Legacy Data',
        agentRole: 'orchestrator',
        state: 'completed',
        startedAt: '2025-06-14T10:00:00Z',
        completedAt: '2025-06-14T10:15:00Z',
        artifactIds: [],
        error: null,
      },
      {
        id: 'task-mig-2',
        name: 'Encrypt & Upload to Walrus',
        agentRole: 'trader',
        state: 'failed',
        startedAt: '2025-06-14T10:20:00Z',
        completedAt: '2025-06-14T10:25:00Z',
        artifactIds: [],
        error: 'Seal key server timeout after 30s — threshold not met (2/3 servers)',
      },
    ],
    artifactIds: [],
    createdAt: '2025-06-14T09:55:00Z',
    updatedAt: '2025-06-14T10:25:00Z',
  },
];

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<DataState<Workflow[]>>({
    status: 'success',
    data: DEMO_WORKFLOWS,
  });
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  const fetchWorkflows = useCallback(async () => {
    setWorkflows({ status: 'loading' });
    try {
      const res = await fetch('/api/workflows');
      if (res.ok) {
        const json = await res.json() as { data: Workflow[] };
        setWorkflows({ status: 'success', data: json.data });
        return;
      }
    } catch {
      logger.warn('API unavailable, using demo workflows');
    }
    setWorkflows({ status: 'success', data: DEMO_WORKFLOWS });
  }, []);

  const selectWorkflow = useCallback((workflow: Workflow | null) => {
    setSelectedWorkflow(workflow);
  }, []);

  return {
    workflows,
    selectedWorkflow,
    selectWorkflow,
    fetchWorkflows,
  };
}
