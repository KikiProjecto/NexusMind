import { WalrusClient } from '@mysten/walrus';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { ArtifactError, type ArtifactType, type WalrusConfig } from './types';
import { logger } from './lib/logger';
import crypto from 'node:crypto';

export class ArtifactManager {
  private client: WalrusClient;
  private config: WalrusConfig;
  private suiClient: SuiClient;
  private keypair: Ed25519Keypair;

  constructor(config: WalrusConfig, suiClient: SuiClient, keypair: Ed25519Keypair) {
    this.config = config;
    this.suiClient = suiClient;
    this.keypair = keypair;
    this.client = new WalrusClient({
      network: config.network,
      suiClient: suiClient as any,
    });
  }

  async upload(
    data: Uint8Array | string,
    options: {
      type: ArtifactType;
      taskId: string;
      epochs?: number;
      metadata?: Record<string, string>;
    },
  ): Promise<{ blobId: string; contentHash: string }> {
    try {
      const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
      
      // Content-hash for onchain record
      const contentHash = crypto.createHash('sha3-256').update(bytes).digest('hex');
      
      const result = await this.client.writeBlob({
        blob: bytes,
        deletable: true,
        epochs: options.epochs ?? 10,
        signer: this.keypair as any,
      });

      logger.info('Artifact uploaded to Walrus', {
        blobId: result.blobId,
        size: bytes.length,
        epochs: options.epochs ?? 10,
        type: options.type,
        taskId: options.taskId,
      });

      return { blobId: result.blobId, contentHash };
    } catch (error) {
      throw new ArtifactError(
        `Upload failed: ${error instanceof Error ? error.message : 'unknown'}`,
        { type: options.type, taskId: options.taskId },
        error instanceof Error ? error : undefined,
      );
    }
  }

  async download(blobId: string): Promise<Uint8Array> {
    try {
      const data = await this.client.readBlob({ blobId });
      logger.info('Artifact downloaded from Walrus', { blobId, size: data.length });
      return data;
    } catch (error) {
      throw new ArtifactError(
        `Download failed for blob ${blobId}: ${error instanceof Error ? error.message : 'unknown'}`,
        { blobId },
        error instanceof Error ? error : undefined,
      );
    }
  }

  async uploadBatch(
    files: Array<{ name: string; data: Uint8Array }>,
    options: { taskId: string; epochs?: number },
  ): Promise<string> {
    // Use Walrus Quilt for batch uploads — cost-optimized
    try {
      const quiltData = this.packQuilt(files);
      const result = await this.client.writeBlob({
        blob: quiltData,
        deletable: true,
        epochs: options.epochs ?? 10,
        signer: this.keypair as any,
      });
      logger.info('Batch artifacts uploaded via Quilt', {
        blobId: result.blobId,
        fileCount: files.length,
        taskId: options.taskId,
      });
      return result.blobId;
    } catch (error) {
      throw new ArtifactError(
        `Batch upload failed: ${error instanceof Error ? error.message : 'unknown'}`,
        { fileCount: files.length, taskId: options.taskId },
        error instanceof Error ? error : undefined,
      );
    }
  }

  private packQuilt(files: Array<{ name: string; data: Uint8Array }>): Uint8Array {
    // Simple quilt format: [4-byte count][for each: 4-byte name-len][name bytes][4-byte data-len][data bytes]
    const parts: Uint8Array[] = [];
    const count = new Uint8Array(new Uint32Array([files.length]).buffer);
    parts.push(count);

    for (const file of files) {
      const nameBytes = new TextEncoder().encode(file.name);
      const nameLen = new Uint8Array(new Uint32Array([nameBytes.length]).buffer);
      const dataLen = new Uint8Array(new Uint32Array([file.data.length]).buffer);
      parts.push(nameLen, nameBytes, dataLen, file.data);
    }

    const total = parts.reduce((acc, p) => acc + p.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
      result.set(part, offset);
      offset += part.length;
    }
    return result;
  }
}
