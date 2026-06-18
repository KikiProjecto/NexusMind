import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArtifactManager } from '../src/artifacts';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

// Mock WalrusClient
vi.mock('@mysten/walrus', () => {
  const mockWalrusInstance = {
    writeBlob: vi.fn().mockResolvedValue({
      blobId: 'mock-blob-id',
      blobObject: { id: 'mock-object-id' }
    }),
    readBlob: vi.fn().mockResolvedValue(new TextEncoder().encode('mocked content'))
  };

  return {
    WalrusClient: vi.fn().mockImplementation(() => mockWalrusInstance)
  };
});

describe('ArtifactManager', () => {
  let artifacts: ArtifactManager;

  beforeEach(() => {
    const suiClient = new SuiClient({ url: 'http://mock-rpc' });
    const keypair = Ed25519Keypair.generate();
    artifacts = new ArtifactManager({
      network: 'testnet',
      publisherUrl: 'http://mock-publisher',
      aggregatorUrl: 'http://mock-aggregator',
    }, suiClient, keypair);
  });

  it('should upload and download a blob', async () => {
    const content = 'Test artifact content';
    const bytes = new TextEncoder().encode(content);
    
    const { blobId } = await artifacts.upload(bytes, {
      type: 'report',
      taskId: 'test-task-1',
      epochs: 1,
    });
    
    expect(blobId).toBe('mock-blob-id');
    
    vi.spyOn(artifacts['client'], 'readBlob').mockResolvedValueOnce(bytes);

    const downloaded = await artifacts.download(blobId);
    const downloadedText = new TextDecoder().decode(downloaded);
    
    expect(downloadedText).toBe(content);
  });

  it('should batch upload with Quilt', async () => {
    const files = [
      { name: 'report.txt', data: new TextEncoder().encode('Report content') },
      { name: 'log.txt', data: new TextEncoder().encode('Log content') },
    ];
    
    const blobId = await artifacts.uploadBatch(files, { taskId: 'test-batch' });
    expect(blobId).toBe('mock-blob-id');
  });

  it('should compute consistent content hash', async () => {
    const content = 'Hash verification test';
    const bytes = new TextEncoder().encode(content);
    
    const { contentHash: hash1 } = await artifacts.upload(bytes, { type: 'log', taskId: 't1' });
    const { contentHash: hash2 } = await artifacts.upload(bytes, { type: 'log', taskId: 't2' });
    
    expect(hash1).toBe(hash2);
  });
});
