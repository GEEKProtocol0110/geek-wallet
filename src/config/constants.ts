export const NETWORKS = {
  MAINNET: {
    name: 'Kaspa Mainnet',
    rpcUrl: 'wss://api.kaspa.org',
    explorerUrl: 'https://explorer.kaspa.org',
    chainId: 'kaspa-mainnet',
  },
  TESTNET: {
    name: 'Kaspa Testnet',
    rpcUrl: 'wss://api-tn10.kaspa.org',
    explorerUrl: 'https://explorer-tn10.kaspa.org',
    chainId: 'kaspa-testnet-10',
  },
} as const;

export const GEEK_TOKEN = {
  symbol: 'GEEK',
  name: 'GEEK Protocol',
  decimals: 8,
  contractAddress: 'kaspa:qz...', // Replace with actual GEEK token contract
} as const;

export const DEFAULT_NETWORK = NETWORKS.MAINNET;

export const STORAGE_KEYS = {
  WALLET: 'geek_wallet',
  ENCRYPTED_KEY: 'geek_wallet_encrypted',
  SETTINGS: 'geek_wallet_settings',
} as const;

export const TX_CONFIRMATIONS_REQUIRED = 10;
export const REFRESH_INTERVAL = 2000; // 2 seconds, leveraging Kaspa's speed
