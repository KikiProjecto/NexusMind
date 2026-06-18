export const MEMWAL_CONFIG = {
  delegateKey: process.env.MEMWAL_DELEGATE_KEY ?? '',
  accountId: process.env.MEMWAL_ACCOUNT_ID ?? '',
  serverUrl: process.env.MEMWAL_SERVER_URL ?? 'https://relayer.memory.walrus.xyz',
} as const;

export function isMemWalConfigured(): boolean {
  return (
    MEMWAL_CONFIG.delegateKey.length > 0 &&
    MEMWAL_CONFIG.accountId.length > 0
  );
}

export function getNamespace(role: string, version = 'v1'): string {
  return `nexusmind-${role}-${version}`;
}
