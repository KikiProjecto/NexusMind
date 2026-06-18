import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const artifacts = [
    {
      id: '0x111122223333444455556666777788889999aaaabbbbccccddddeeeeffff0000',
      blobId: '0x7a8f9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
      agentId: '0xabc...123',
      agentRole: 'Researcher',
      type: 'report',
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
      sizeBytes: 1024 * 45, // 45KB
      isEncrypted: true,
      taskId: 'task-001',
    },
    {
      id: '0x22223333444455556666777788889999aaaabbbbccccddddeeeeffff00001111',
      blobId: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
      agentId: '0xdef...456',
      agentRole: 'Trader',
      type: 'signal',
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      sizeBytes: 1024 * 2, // 2KB
      isEncrypted: true,
      taskId: 'task-002',
    },
    {
      id: '0x3333444455556666777788889999aaaabbbbccccddddeeeeffff000011112222',
      blobId: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d',
      agentId: '0xghi...789',
      agentRole: 'Monitor',
      type: 'log',
      createdAt: Date.now() - 1000 * 60 * 30,
      sizeBytes: 1024 * 120, // 120KB
      isEncrypted: false,
      taskId: 'task-003',
    },
    {
      id: '0x444455556666777788889999aaaabbbbccccddddeeeeffff0000111122223333',
      blobId: '0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
      agentId: '0xjkl...012',
      agentRole: 'Researcher',
      type: 'dataset',
      createdAt: Date.now() - 1000 * 60 * 60 * 48,
      sizeBytes: 1024 * 1024 * 2.5, // 2.5MB
      isEncrypted: false,
      taskId: 'task-000',
    },
  ];

  return NextResponse.json({ artifacts });
}
