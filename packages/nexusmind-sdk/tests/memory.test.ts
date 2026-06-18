import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentMemory } from '../src/memory';

// Mock the memwal client
vi.mock('@mysten-incubation/memwal', () => {
  const mockMemWalInstance = {
    remember: vi.fn().mockResolvedValue({ job_id: 'mock-job-id' }),
    recall: vi.fn().mockResolvedValue({
      results: [
        { blob_id: 'mock-blob-id', text: 'Test memory content', distance: 0.1 }
      ],
      total: 1
    }),
    analyze: vi.fn().mockResolvedValue({
      job_ids: ['job-1'],
      facts: [{ id: 'fact-1', text: 'fact text' }],
      fact_count: 1,
      status: 'done',
      owner: '0x123'
    }),
    restore: vi.fn().mockResolvedValue({ restored: 3, skipped: 0 })
  };

  return {
    MemWal: {
      create: vi.fn().mockReturnValue(mockMemWalInstance)
    }
  };
});

describe('AgentMemory', () => {
  let memory: AgentMemory;

  beforeEach(() => {
    memory = new AgentMemory({
      delegateKey: 'mock-key',
      accountId: 'mock-account',
      serverUrl: 'http://mock-server',
      namespace: 'test-namespace',
    });
  });

  it('should store and recall a memory', async () => {
    const content = 'Test memory content for unit test';
    await memory.remember(content);
    
    const results = await memory.recall('test memory content');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content).toContain('Test memory');
  });

  it('should throw MemoryError on empty content', async () => {
    await expect(memory.remember('')).rejects.toThrow('Content cannot be empty');
  });

  it('should restore memories from Walrus', async () => {
    const result = await memory.restore(undefined, 10);
    expect(result.restored).toBeGreaterThanOrEqual(0);
  });

  it('should return empty array for no matches', async () => {
    vi.spyOn(memory['client'], 'recall').mockResolvedValueOnce({ results: [], total: 0 });

    const results = await memory.recall('xyzzy-nonexistent-term-12345');
    expect(results).toEqual([]);
  });

  it('should handle analyze operation', async () => {
    const text = 'DeFi TVL increased by 34%';
    const analysis = await memory.analyze(text);
    expect(typeof analysis).toBe('string');
    expect(analysis.length).toBeGreaterThan(0);
  });
});
