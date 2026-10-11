export const NETWORKS = {
  MAINNET: {
    name: 'Kaspa Mainnet',
    rpcUrl: 'https://api.kaspa.org',
    explorerUrl: 'https://explorer.kaspa.org',
    chainId: 'kaspa-mainnet',
  },
  TESTNET: {
    name: 'Kaspa Testnet',
    rpcUrl: 'https://api-tn10.kaspa.org',
    explorerUrl: 'https://explorer-tn10.kaspa.org',
    chainId: 'kaspa-testnet-10',
  },
} as const;

export const GEEK_TOKEN = {
  symbol: 'GEEK',
  name: 'GEEK Protocol',
  decimals: 8,
  contractAddress: 'krc20:geek', // KRC-20 uses ticker-based identification
} as const;

// Additional KRC-20 tokens that can be supported
export const SUPPORTED_KRC20_TOKENS = [
  GEEK_TOKEN,
  // Add more tokens here as they become available
] as const;

export const DEFAULT_NETWORK = NETWORKS.TESTNET;

// Development mode - set to false when connecting to real Kaspa node
export const DEMO_MODE = false;

export const STORAGE_KEYS = {
  WALLET: 'geek_wallet',
  ENCRYPTED_KEY: 'geek_wallet_encrypted',
  SETTINGS: 'geek_wallet_settings',
} as const;

export const TX_CONFIRMATIONS_REQUIRED = 10;
export const REFRESH_INTERVAL = 2000; // 2 seconds, leveraging Kaspa's speed
