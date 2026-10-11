export interface Wallet {
  address: string;
  publicKey: string;
  privateKey?: string;
  mnemonic?: string;
  balance: string;
  geekBalance: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: string;
  token: 'KAS' | 'GEEK';
  from: string;
  to: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  txHash: string;
}

export interface KRC20Token {
  symbol: string;
  name: string;
  decimals: number;
  contractAddress: string;
  balance: string;
}

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  chainId: string;
}

export interface WalletState {
  wallet: Wallet | null;
  transactions: Transaction[];
  tokens: KRC20Token[];
  isConnected: boolean;
  isLoading: boolean;
  network: NetworkConfig;
}
