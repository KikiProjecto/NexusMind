'use client';

import { useState, useCallback } from 'react';
import type { Memory, MemorySearchResult, DataState, Namespace } from '@/types';
import { logger } from '@/lib/logger';

/* ─── Demo Data ─── */
const DEMO_MEMORIES: Memory[] = [
  {
    id: 'mem-001',
    content: 'DeFi market analysis for Q3 2025 completed. Total Value Locked increased 34% across top 5 protocols. Key protocols: Aave ($12.4B), Compound ($5.2B), Uniswap ($4.8B). Recommend increased allocation to lending protocols.',
    namespace: 'nexusmind-researcher-v1',
    timestamp: '2025-06-15T14:30:00Z',
    blobId: '0x7a8f3e2b1c9d4e5f6a7b8c9d0e1f2a3b',
    metadata: { taskId: 'task-042', confidence: 'high', category: 'defi-analysis' },
  },
  {
    id: 'mem-002',
    content: 'Trading signal generated: LONG SUI/USDT based on researcher DeFi analysis. Entry: $1.24, Target: $1.48, Stop: $1.12. Confidence: medium. Encrypted blob stored with Seal for orchestrator access.',
    namespace: 'nexusmind-trader-v1',
    timestamp: '2025-06-15T15:00:00Z',
    blobId: '0x3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e',
    metadata: { taskId: 'task-043', signalType: 'long', pair: 'SUI/USDT' },
  },
  {
    id: 'mem-003',
    content: 'Walrus network health check completed. All 12 aggregator nodes responsive. Average latency: 142ms. Blob upload success rate: 99.7%. No degradation detected. Next check scheduled in 30 minutes.',
    namespace: 'nexusmind-monitor-v1',
    timestamp: '2025-06-15T15:15:00Z',
    blobId: null,
    metadata: { checkType: 'health', nodeCount: '12', latencyMs: '142' },
  },
  {
    id: 'mem-004',
    content: 'Workflow WF-007 orchestrated successfully. Research phase: 45s. Trading signal generation: 12s. Artifact storage: 3s. All 3 agents coordinated without conflicts. Total execution time: 62s.',
    namespace: 'nexusmind-orchestrator-v1',
    timestamp: '2025-06-15T15:30:00Z',
    blobId: '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b',
    metadata: { workflowId: 'WF-007', totalTimeMs: '62000' },
  },
  {
    id: 'mem-005',
    content: 'Cross-chain bridge vulnerability analysis: identified 3 potential attack vectors in LayerZero v2 message verification. Detailed report uploaded to Walrus with Seal encryption. Only orchestrator has decryption access.',
    namespace: 'nexusmind-researcher-v1',
    timestamp: '2025-06-15T16:00:00Z',
    blobId: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    metadata: { taskId: 'task-044', confidence: 'high', category: 'security-audit' },
  },
  {
    id: 'mem-006',
    content: 'MemWal restore test completed successfully. Wiped all 47 memories from nexusmind-researcher-v1 namespace, then restored from Walrus. 47/47 memories recovered with full metadata integrity. Restore time: 2.3 seconds.',
    namespace: 'nexusmind-monitor-v1',
    timestamp: '2025-06-15T16:30:00Z',
    blobId: null,
    metadata: { testType: 'restore', memoriesRestored: '47', restoreTimeMs: '2300' },
  },
  {
    id: 'mem-007',
    content: 'NFT market sentiment analysis: Sui ecosystem NFTs showing 28% increase in floor prices over 7 days. Key collections: SuiFrens (+42%), Cosmocadia (+19%). Collector wallet activity up 15%. Bearish indicators absent.',
    namespace: 'nexusmind-researcher-v1',
    timestamp: '2025-06-15T17:00:00Z',
    blobId: '0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f',
    metadata: { taskId: 'task-045', confidence: 'medium', category: 'nft-analysis' },
  },
  {
    id: 'mem-008',
    content: 'Portfolio rebalance signal: Reduce SUI allocation from 40% to 30%, increase USDC hedge to 25%. Based on 72h volatility spike detection and researcher bearish cross-chain report. Risk-adjusted return optimization applied.',
    namespace: 'nexusmind-trader-v1',
    timestamp: '2025-06-15T17:30:00Z',
    blobId: '0x0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c',
    metadata: { taskId: 'task-046', signalType: 'rebalance', riskLevel: 'medium' },
  },
];

function filterByNamespace(memories: Memory[], ns: Namespace): Memory[] {
  if (ns === 'all') return memories;
  return memories.filter((m) => m.namespace === ns);
}

function searchMemories(memories: Memory[], query: string): MemorySearchResult[] {
  const lower = query.toLowerCase();
  return memories
    .map((memory) => {
      const content = memory.content.toLowerCase();
      const words = lower.split(/\s+/);
      const matchCount = words.filter((w) => content.includes(w)).length;
      const similarity = matchCount / Math.max(words.length, 1);
      return { memory, similarity };
    })
    .filter((r) => r.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity);
}

export function useMemory() {
  const [memories, setMemories] = useState<DataState<Memory[]>>({ status: 'success', data: DEMO_MEMORIES });
  const [searchResults, setSearchResults] = useState<MemorySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [askResponse, setAskResponse] = useState<string | null>(null);

  const recall = useCallback(async (query: string, namespace: Namespace = 'all') => {
    setIsSearching(true);
    try {
      /* Attempt real API first */
      const res = await fetch(`/api/memory?q=${encodeURIComponent(query)}&ns=${namespace}`);
      if (res.ok) {
        const json = await res.json() as { data: MemorySearchResult[] };
        setSearchResults(json.data);
        return json.data;
      }
    } catch {
      logger.warn('API unavailable, using local search', { query });
    }
    /* Fallback to local */
    const filtered = filterByNamespace(DEMO_MEMORIES, namespace);
    const results = searchMemories(filtered, query);
    setSearchResults(results);
    setIsSearching(false);
    return results;
  }, []);

  const remember = useCallback(async (content: string, namespace: Namespace) => {
    try {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, namespace }),
      });
      if (res.ok) {
        logger.info('Memory stored via API', { namespace });
        return;
      }
    } catch {
      logger.warn('API unavailable for remember');
    }
    /* Fallback: add to local state */
    const newMemory: Memory = {
      id: `mem-${Date.now()}`,
      content,
      namespace,
      timestamp: new Date().toISOString(),
      blobId: null,
      metadata: {},
    };
    setMemories((prev) => {
      if (prev.status === 'success') {
        return { status: 'success', data: [newMemory, ...prev.data] };
      }
      return { status: 'success', data: [newMemory] };
    });
  }, []);

  const restore = useCallback(async (namespace: Namespace): Promise<Memory[]> => {
    try {
      const res = await fetch(`/api/memory?action=restore&ns=${namespace}`);
      if (res.ok) {
        const json = await res.json() as { data: Memory[] };
        setMemories({ status: 'success', data: json.data });
        return json.data;
      }
    } catch {
      logger.warn('API unavailable for restore, using demo data');
    }
    const restored = filterByNamespace(DEMO_MEMORIES, namespace);
    setMemories({ status: 'success', data: restored });
    return restored;
  }, []);

  const ask = useCallback(async (question: string): Promise<string> => {
    const response = `Based on the agent memory context: The agents have been tracking DeFi market trends, with TVL increasing 34% across top protocols. The trader agent has generated signals for SUI/USDT with medium confidence. The system has verified 99.7% blob upload success rates on Walrus.`;
    setAskResponse(response);
    return response;
  }, []);

  const clearMemories = useCallback(() => {
    setMemories({ status: 'empty' });
    setSearchResults([]);
  }, []);

  const getByNamespace = useCallback((ns: Namespace): Memory[] => {
    if (memories.status !== 'success') return [];
    return filterByNamespace(memories.data, ns);
  }, [memories]);

  return {
    memories,
    searchResults,
    isSearching,
    askResponse,
    recall,
    remember,
    restore,
    ask,
    clearMemories,
    setMemories,
    getByNamespace,
  };
}
