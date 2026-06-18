import { MemWal } from '@mysten-incubation/memwal';
import { MemoryError, type Memory, type MemWalConfig } from './types';
import { logger } from './lib/logger';
import { z } from 'zod';

const MemorySchema = z.object({
  id: z.string(),
  content: z.string(),
  timestamp: z.number(),
  namespace: z.string(),
  similarity: z.number().optional(),
});

export class AgentMemory {
  private client: ReturnType<typeof MemWal.create>;
  public namespace: string;

  constructor(config: MemWalConfig) {
    this.namespace = config.namespace;
    this.client = MemWal.create({
      key: config.delegateKey,
      accountId: config.accountId,
      serverUrl: config.serverUrl,
      namespace: config.namespace,
    });
  }

  async remember(content: string): Promise<void> {
    try {
      if (!content || content.trim().length === 0) {
        throw new MemoryError('Content cannot be empty', { namespace: this.namespace });
      }
      await this.client.remember(content);
      logger.info('Memory stored', {
        namespace: this.namespace,
        contentLength: content.length,
        preview: content.slice(0, 100),
      });
    } catch (error) {
      if (error instanceof MemoryError) throw error;
      throw new MemoryError(
        `Failed to store memory: ${error instanceof Error ? error.message : 'unknown'}`,
        { namespace: this.namespace, contentPreview: content.slice(0, 50) },
        error instanceof Error ? error : undefined,
      );
    }
  }

  async recall(query: string, options: { limit?: number } = {}): Promise<Memory[]> {
    try {
      const limit = options.limit ?? 5;
      const result = await this.client.recall({ query, limit });
      
      if (!result || !result.results || !Array.isArray(result.results)) return [];

      return result.results.map((item) => {
        const mapped = {
          id: item.blob_id,
          content: item.text,
          timestamp: Date.now(),
          namespace: this.namespace,
          similarity: 1 - item.distance,
        };
        const parsed = MemorySchema.safeParse(mapped);
        if (!parsed.success) {
          logger.warn('Invalid memory shape after mapping', { item, errors: parsed.error.issues });
          return null;
        }
        return parsed.data;
      }).filter((m): m is Memory => m !== null);
    } catch (error) {
      throw new MemoryError(
        `Recall failed for query "${query}": ${error instanceof Error ? error.message : 'unknown'}`,
        { namespace: this.namespace, query },
        error instanceof Error ? error : undefined,
      );
    }
  }

  async analyze(text: string): Promise<string> {
    try {
      const result = await this.client.analyze(text);
      return JSON.stringify(result.facts);
    } catch (error) {
      throw new MemoryError(
        `Analysis failed: ${error instanceof Error ? error.message : 'unknown'}`,
        { namespace: this.namespace, textLength: text.length },
        error instanceof Error ? error : undefined,
      );
    }
  }

  async ask(question: string): Promise<string> {
    try {
      const memories = await this.recall(question, { limit: 5 });
      if (memories.length === 0) {
        return `I do not remember anything about "${question}".`;
      }
      const context = memories.map(m => `- ${m.content}`).join('\n');
      return `Based on my memories, here is what I know about "${question}":\n\n${context}`;
    } catch (error) {
      throw new MemoryError(
        `Ask failed for "${question}": ${error instanceof Error ? error.message : 'unknown'}`,
        { namespace: this.namespace, question },
        error instanceof Error ? error : undefined,
      );
    }
  }

  async restore(namespace?: string, limit?: number): Promise<{ restored: number; skipped: number }> {
    try {
      const targetNamespace = namespace ?? this.namespace;
      logger.info('Starting memory restore', { namespace: targetNamespace });
      const result = await this.client.restore(targetNamespace, limit ?? 100);
      logger.info('Memory restore complete', { ...result, namespace: targetNamespace });
      return result;
    } catch (error) {
      throw new MemoryError(
        `Restore failed: ${error instanceof Error ? error.message : 'unknown'}`,
        { namespace: namespace ?? this.namespace },
        error instanceof Error ? error : undefined,
      );
    }
  }
}
