/**
 * check-env.ts — Validates all required environment variables are set.
 * Run: npx tsx scripts/check-env.ts
 */

const REQUIRED_VARS = [
  'MEMWAL_DELEGATE_KEY',
  'MEMWAL_ACCOUNT_ID',
  'MEMWAL_SERVER_URL',
  'WALRUS_NETWORK',
  'WALRUS_PUBLISHER_URL',
  'WALRUS_AGGREGATOR_URL',
  'SUI_NETWORK',
  'SUI_RPC_URL',
  'AGENT_PRIVATE_KEY',
  'MOVE_PACKAGE_ID',
  'ANTHROPIC_API_KEY',
] as const;

const OPTIONAL_VARS = [
  'AGENT_REGISTRY_ID',
  'SEAL_KEY_SERVER_URLS',
  'MESSAGING_RELAYER_URL',
  'NEXT_PUBLIC_WALRUS_NETWORK',
  'NEXT_PUBLIC_SUI_NETWORK',
  'NEXT_PUBLIC_MOVE_PACKAGE_ID',
  'NEXT_PUBLIC_APP_URL',
] as const;

function main(): void {
  const missing: string[] = [];
  const present: string[] = [];
  const optionalMissing: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (process.env[key]) {
      present.push(key);
    } else {
      missing.push(key);
    }
  }

  for (const key of OPTIONAL_VARS) {
    if (!process.env[key]) {
      optionalMissing.push(key);
    }
  }

  console.log('\n--- NexusMind Environment Check ---\n');

  if (present.length > 0) {
    console.log(`Set (${present.length}/${REQUIRED_VARS.length} required):`);
    for (const key of present) {
      const value = process.env[key] ?? '';
      const masked = value.length > 8
        ? value.slice(0, 4) + '...' + value.slice(-4)
        : '****';
      console.log(`  [OK] ${key} = ${masked}`);
    }
  }

  if (optionalMissing.length > 0) {
    console.log(`\nOptional (${optionalMissing.length} not set):`);
    for (const key of optionalMissing) {
      console.log(`  [--] ${key}`);
    }
  }

  if (missing.length > 0) {
    console.log(`\nMISSING REQUIRED (${missing.length}):`);
    for (const key of missing) {
      console.error(`  [FAIL] ${key}`);
    }
    console.log('\nCopy .env.example to .env.local and fill in all values.');
    process.exit(1);
  }

  console.log('\nAll required environment variables are set.\n');
}

main();
