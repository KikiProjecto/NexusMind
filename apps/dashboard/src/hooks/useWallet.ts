'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';

export function useWallet() {
  const account = useCurrentAccount();

  return {
    isConnected: account !== null && account !== undefined,
    address: account?.address ?? null,
    account,
  };
}
