'use client';

import { useState, useCallback } from 'react';
import type { ArtifactRecord, DataState, ArtifactType, AgentRole } from '@/types';
import { logger } from '@/lib/logger';

const DEMO_ARTIFACTS: ArtifactRecord[] = [
  {
    id: 'art-001',
    blobId: '0x7a8f3e2b1c9d4e5f6a7b8c9d0e1f2a3b',
    agentAddress: '0x1234567890abcdef1234567890abcdef12345678',
    agentRole: 'researcher',
    artifactType: 'report',
    taskId: 'task-042',
    createdAt: '2025-06-15T14:30:00Z',
    sizeBytes: 245760,
    encrypted: true,
    metadata: { title: 'DeFi Q3 2025 Market Analysis', pages: '24', format: 'pdf' },
  },
  {
    id: 'art-002',
    blobId: '0x3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e',
    agentAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    agentRole: 'trader',
    artifactType: 'signal',
    taskId: 'task-043',
    createdAt: '2025-06-15T15:00:00Z',
    sizeBytes: 8192,
    encrypted: true,
    metadata: { pair: 'SUI/USDT', direction: 'long', confidence: 'medium' },
  },
  {
    id: 'art-003',
    blobId: '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b',
    agentAddress: '0x567890abcdef1234567890abcdef123456789012',
    agentRole: 'orchestrator',
    artifactType: 'log',
    taskId: 'WF-007',
    createdAt: '2025-06-15T15:30:00Z',
    sizeBytes: 32768,
    encrypted: false,
    metadata: { workflowId: 'WF-007', status: 'completed' },
  },
  {
    id: 'art-004',
    blobId: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    agentAddress: '0x1234567890abcdef1234567890abcdef12345678',
    agentRole: 'researcher',
    artifactType: 'report',
    taskId: 'task-044',
    createdAt: '2025-06-15T16:00:00Z',
    sizeBytes: 184320,
    encrypted: true,
    metadata: { title: 'Cross-chain Bridge Vulnerability Analysis', pages: '18', format: 'pdf' },
  },
  {
    id: 'art-005',
    blobId: '0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f',
    agentAddress: '0x1234567890abcdef1234567890abcdef12345678',
    agentRole: 'researcher',
    artifactType: 'dataset',
    taskId: 'task-045',
    createdAt: '2025-06-15T17:00:00Z',
    sizeBytes: 524288,
    encrypted: false,
    metadata: { title: 'NFT Floor Price Dataset - Sui Ecosystem', rows: '1240', format: 'csv' },
  },
  {
    id: 'art-006',
    blobId: '0x0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c',
    agentAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    agentRole: 'trader',
    artifactType: 'signal',
    taskId: 'task-046',
    createdAt: '2025-06-15T17:30:00Z',
    sizeBytes: 4096,
    encrypted: true,
    metadata: { type: 'rebalance', riskLevel: 'medium' },
  },
];

export function useArtifacts() {
  const [artifacts, setArtifacts] = useState<DataState<ArtifactRecord[]>>({
    status: 'success',
    data: DEMO_ARTIFACTS,
  });
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactRecord | null>(null);
  const [filterAgent, setFilterAgent] = useState<AgentRole | 'all'>('all');
  const [filterType, setFilterType] = useState<ArtifactType | 'all'>('all');

  const filteredArtifacts = (() => {
    if (artifacts.status !== 'success') return [];
    return artifacts.data.filter((a) => {
      if (filterAgent !== 'all' && a.agentRole !== filterAgent) return false;
      if (filterType !== 'all' && a.artifactType !== filterType) return false;
      return true;
    });
  })();

  const fetchArtifacts = useCallback(async () => {
    setArtifacts({ status: 'loading' });
    try {
      const res = await fetch('/api/artifacts');
      if (res.ok) {
        const json = await res.json() as { data: ArtifactRecord[] };
        setArtifacts({ status: 'success', data: json.data });
        return;
      }
    } catch {
      logger.warn('API unavailable, using demo artifacts');
    }
    setArtifacts({ status: 'success', data: DEMO_ARTIFACTS });
  }, []);

  const selectArtifact = useCallback((artifact: ArtifactRecord | null) => {
    setSelectedArtifact(artifact);
  }, []);

  const formatSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }, []);

  return {
    artifacts,
    filteredArtifacts,
    selectedArtifact,
    filterAgent,
    filterType,
    setFilterAgent,
    setFilterType,
    selectArtifact,
    fetchArtifacts,
    formatSize,
  };
}
