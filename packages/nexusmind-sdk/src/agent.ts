import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { AgentMemory } from './memory';
import { ArtifactManager } from './artifacts';
import { SealManager } from './seal';
import { SuiManager } from './sui';
import type { AgentConfig, ArtifactType, Memory, Artifact } from './types';
import { logger } from './lib/logger';

export class NexusMindAgent {
  public memory: AgentMemory;
  public artifacts: ArtifactManager;
  public seal: SealManager;
  public sui: SuiManager;
  public config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    this.memory = new AgentMemory(config.memwalConfig);
    
    const suiClient = new SuiClient({ url: config.suiConfig.rpcUrl || 'https://fullnode.testnet.sui.io:443' });
    const secretKey = Uint8Array.from(Buffer.from(config.privateKey, 'base64'));
    const keypair = Ed25519Keypair.fromSecretKey(secretKey);
    
    this.artifacts = new ArtifactManager(config.walrusConfig, suiClient, keypair);
    this.seal = new SealManager(config.sealConfig, config.agentAddress, config.privateKey);
    this.sui = new SuiManager(config.suiConfig, config.privateKey);
  }

  async loadContext(query: string, limit = 5): Promise<Memory[]> {
    logger.info('Loading agent context', {
      agent: this.config.agentAddress,
      role: this.config.role,
      query,
    });
    return this.memory.recall(query, { limit });
  }

  async commitResult(summary: string, blobId?: string): Promise<void> {
    const fullMemory = blobId
      ? `${summary} [Walrus Blob: ${blobId}]`
      : summary;
    await this.memory.remember(fullMemory);
    logger.info('Result committed to memory', {
      agent: this.config.agentAddress,
      blobId,
      summaryLength: summary.length,
    });
  }

  async storeArtifact(
    content: string,
    type: ArtifactType,
    taskId: string,
    options: { epochs?: number; registerOnchain?: boolean } = {},
  ): Promise<Artifact> {
    const bytes = new TextEncoder().encode(content);
    const { blobId, contentHash } = await this.artifacts.upload(bytes, {
      type,
      taskId,
      epochs: options.epochs,
    });

    let onchainObjectId: string | undefined;
    if (options.registerOnchain !== false) {
      onchainObjectId = await this.sui.recordArtifact({
        blobId,
        contentHash,
        artifactType: type,
        taskId,
        isEncrypted: false,
      });
    }

    const artifact: Artifact = {
      blobId,
      type,
      taskId,
      agentAddress: this.config.agentAddress,
      createdAt: Date.now(),
      isEncrypted: false,
      onchainObjectId,
    };

    await this.commitResult(
      `Stored ${type} artifact for task ${taskId}.`,
      blobId,
    );

    return artifact;
  }

  async storePrivateArtifact(
    content: string,
    type: ArtifactType,
    taskId: string,
    allowlistId: string,
    options: { epochs?: number } = {},
  ): Promise<Artifact> {
    const bytes = new TextEncoder().encode(content);
    const { encryptedData, sealedKey } = await this.seal.encryptForAllowlist(
      bytes,
      allowlistId,
    );

    const bundle = JSON.stringify({
      encryptedData: Buffer.from(encryptedData).toString('base64'),
      sealedKey: Buffer.from(sealedKey).toString('base64'),
      policyId: allowlistId,
    });

    const { blobId, contentHash } = await this.artifacts.upload(
      new TextEncoder().encode(bundle),
      { type, taskId, epochs: options.epochs },
    );

    const onchainObjectId = await this.sui.recordArtifact({
      blobId,
      contentHash,
      artifactType: type,
      taskId,
      isEncrypted: true,
      sealPolicyId: allowlistId,
    });

    const artifact: Artifact = {
      blobId,
      type,
      taskId,
      agentAddress: this.config.agentAddress,
      createdAt: Date.now(),
      isEncrypted: true,
      sealPolicyId: allowlistId,
      onchainObjectId,
    };

    await this.commitResult(
      `Stored encrypted ${type} artifact for task ${taskId}. Access restricted via Seal policy ${allowlistId}.`,
      blobId,
    );

    return artifact;
  }

  async retrievePrivateArtifact(blobId: string): Promise<string> {
    const rawBytes = await this.artifacts.download(blobId);
    const bundle = JSON.parse(new TextDecoder().decode(rawBytes));
    const encryptedData = Buffer.from(bundle.encryptedData, 'base64');
    const sealedKey = Buffer.from(bundle.sealedKey, 'base64');
    const decrypted = await this.seal.decrypt(encryptedData, sealedKey, bundle.policyId);
    return new TextDecoder().decode(decrypted);
  }

  async demonstrateRestore(): Promise<{ restored: number; skipped: number }> {
    logger.info('Starting memory restore demonstration', {
      agent: this.config.agentAddress,
      namespace: this.config.namespace,
    });
    const result = await this.memory.restore(this.config.namespace);
    logger.info('Memory restore complete — agent memory proven portable', result);
    return result;
  }
}
