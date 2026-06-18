const WALRUS_NETWORKS = {
  testnet: {
    publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
    aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
  },
  mainnet: {
    publisherUrl: 'https://publisher.walrus.space',
    aggregatorUrl: 'https://aggregator.walrus.space',
  },
} as const;

type WalrusNetwork = keyof typeof WALRUS_NETWORKS;

function getWalrusNetwork(): WalrusNetwork {
  const raw = process.env.NEXT_PUBLIC_WALRUS_NETWORK ?? 'testnet';
  if (raw === 'testnet' || raw === 'mainnet') return raw;
  return 'testnet';
}

export const WALRUS_NETWORK = getWalrusNetwork();

export const WALRUS_PUBLISHER_URL =
  process.env.WALRUS_PUBLISHER_URL ?? WALRUS_NETWORKS[WALRUS_NETWORK].publisherUrl;

export const WALRUS_AGGREGATOR_URL =
  process.env.WALRUS_AGGREGATOR_URL ?? WALRUS_NETWORKS[WALRUS_NETWORK].aggregatorUrl;

export function getBlobUrl(blobId: string): string {
  return `${WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`;
}
