const SUI_NETWORKS = {
  testnet: 'https://fullnode.testnet.sui.io:443',
  mainnet: 'https://fullnode.mainnet.sui.io:443',
} as const;

type SuiNetwork = keyof typeof SUI_NETWORKS;

function getNetwork(): SuiNetwork {
  const raw = process.env.NEXT_PUBLIC_SUI_NETWORK ?? 'testnet';
  if (raw === 'testnet' || raw === 'mainnet') return raw;
  return 'testnet';
}

export const SUI_NETWORK = getNetwork();

export const SUI_RPC_URL =
  process.env.NEXT_PUBLIC_SUI_RPC_URL ?? SUI_NETWORKS[SUI_NETWORK];

export const MOVE_PACKAGE_ID =
  process.env.NEXT_PUBLIC_MOVE_PACKAGE_ID ?? '';

export function getFullnodeUrl(network?: SuiNetwork): string {
  const net = network ?? SUI_NETWORK;
  return SUI_NETWORKS[net];
}
