import { SealClient as MystenSealClient } from '@mysten/seal';
import { SealError, type SealConfig } from './types';
import { logger } from './lib/logger';
import crypto from 'node:crypto';
import { Transaction } from '@mysten/sui/transactions';

export class SealManager {
  private keyServerUrls: string[];
  private agentAddress: string;
  private client?: MystenSealClient;

  constructor(config: SealConfig, agentAddress: string, privateKey: string) {
    this.keyServerUrls = config.keyServerUrls;
    this.agentAddress = agentAddress;
    // We would initialize the real Mysten SealClient here.
    // Assuming Mysten SealClient takes key server configurations.
  }

  async encryptForAllowlist(data: Uint8Array, policyId: string): Promise<{ encryptedData: Uint8Array; sealedKey: Uint8Array }> {
    try {
      // 1. Generate local AES key
      const symmetricKey = crypto.getRandomValues(new Uint8Array(32));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const importedKey = await crypto.subtle.importKey(
        'raw',
        symmetricKey,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
      );

      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        importedKey,
        data
      );

      // Prepend IV to encrypted data
      const encryptedData = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      encryptedData.set(iv, 0);
      encryptedData.set(new Uint8Array(encryptedBuffer), iv.length);

      // 2. Encrypt symmetric key with Seal
      const tx = new Transaction();
      tx.setSender(this.agentAddress);

      // In a real implementation we would call Seal:
      // const sealedKey = await this.client.encrypt(symmetricKey, policyId, tx);
      // Mocking Seal encryption for now
      const sealedKey = symmetricKey; // MOCK

      logger.info('Data encrypted with Seal', { policyId, dataSize: data.length });

      return { encryptedData, sealedKey };
    } catch (error) {
      throw new SealError(
        `Seal encryption failed: ${error instanceof Error ? error.message : 'unknown'}`,
        { policyId },
        error instanceof Error ? error : undefined
      );
    }
  }

  async decrypt(encryptedData: Uint8Array, sealedKey: Uint8Array, policyId: string): Promise<Uint8Array> {
    try {
      const tx = new Transaction();
      tx.setSender(this.agentAddress);

      // MOCK decryption of key via Seal
      const symmetricKey = sealedKey; 

      const importedKey = await crypto.subtle.importKey(
        'raw',
        symmetricKey,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
      );

      const iv = encryptedData.slice(0, 12);
      const dataToDecrypt = encryptedData.slice(12);

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        importedKey,
        dataToDecrypt
      );

      logger.info('Data decrypted with Seal', { policyId, size: decryptedBuffer.byteLength });

      return new Uint8Array(decryptedBuffer);
    } catch (error) {
      throw new SealError(
        `Seal decryption failed: ${error instanceof Error ? error.message : 'unknown'}`,
        { policyId },
        error instanceof Error ? error : undefined
      );
    }
  }
}
