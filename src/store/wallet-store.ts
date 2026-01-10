import { create } from 'zustand';
import { KaspaWallet } from '@/lib/kaspa-wallet';
import { KaspaClient } from '@/lib/kaspa-client';
import { KRC20Handler } from '@/lib/krc20-handler';
import { SecureStorage } from '@/lib/storage';
import { DEFAULT_NETWORK, REFRESH_INTERVAL } from '@/config/constants';
import type { NetworkConfig, WalletState } from '@/types/wallet';

interface WalletStore extends WalletState {
  // Actions
  createWallet: (password: string) => Promise<void>;
  restoreWallet: (mnemonic: string, password: string) => Promise<void>;
  unlockWallet: (password: string) => Promise<void>;
  lockWallet: () => void;
  sendTransaction: (to: string, amount: string, token: 'KAS' | 'GEEK') => Promise<string>;
  refreshBalance: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  switchNetwork: (network: NetworkConfig) => Promise<void>;
  startAutoRefresh: () => void;
  
  // Internal
  kaspaClient: KaspaClient | null;
  krc20Handler: KRC20Handler | null;
  autoRefreshInterval: NodeJS.Timeout | null;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  wallet: null,
  transactions: [],
  tokens: [],
  isConnected: false,
  isLoading: false,
  network: DEFAULT_NETWORK,
  kaspaClient: null,
  krc20Handler: null,
  autoRefreshInterval: null,

  createWallet: async (password: string) => {
    set({ isLoading: true });
    try {
      const wallet = await KaspaWallet.createWallet();
      
      // Save encrypted wallet
      SecureStorage.saveWallet(wallet, password);
      
      // Initialize clients
      const kaspaClient = new KaspaClient(get().network);
      await kaspaClient.connect();
      const krc20Handler = new KRC20Handler(kaspaClient);
      
      set({
        wallet,
        kaspaClient,
        krc20Handler,
        isConnected: true,
        isLoading: false,
      });
      
      // Start auto-refresh
      get().startAutoRefresh();
    } catch (error) {
      console.error('Failed to create wallet:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  restoreWallet: async (mnemonic: string, password: string) => {
    set({ isLoading: true });
    try {
      const wallet = await KaspaWallet.restoreFromMnemonic(mnemonic);
      
      // Save encrypted wallet
      SecureStorage.saveWallet(wallet, password);
      
      // Initialize clients
      const kaspaClient = new KaspaClient(get().network);
      await kaspaClient.connect();
      const krc20Handler = new KRC20Handler(kaspaClient);
      
      set({
        wallet,
        kaspaClient,
        krc20Handler,
        isConnected: true,
        isLoading: false,
      });
      
      // Start auto-refresh
      get().startAutoRefresh();
      
      // Load initial data
      await get().refreshBalance();
      await get().refreshTransactions();
    } catch (error) {
      console.error('Failed to restore wallet:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  unlockWallet: async (password: string) => {
    set({ isLoading: true });
    try {
      const walletData = SecureStorage.loadWallet(password);
      if (!walletData) {
        throw new Error('Invalid password or no wallet found');
      }
      
      // Initialize clients
      const kaspaClient = new KaspaClient(get().network);
      await kaspaClient.connect();
      const krc20Handler = new KRC20Handler(kaspaClient);
      
      set({
        wallet: walletData,
        kaspaClient,
        krc20Handler,
        isConnected: true,
        isLoading: false,
      });
      
      // Start auto-refresh
      get().startAutoRefresh();
      
      // Load initial data
      await get().refreshBalance();
      await get().refreshTransactions();
    } catch (error) {
      console.error('Failed to unlock wallet:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  lockWallet: () => {
    const { kaspaClient, autoRefreshInterval } = get();
    
    // Disconnect
    kaspaClient?.disconnect();
    
    // Stop auto-refresh
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }
    
    set({
      wallet: null,
      transactions: [],
      tokens: [],
      isConnected: false,
      kaspaClient: null,
      krc20Handler: null,
      autoRefreshInterval: null,
    });
  },

  sendTransaction: async (to: string, amount: string, token: 'KAS' | 'GEEK') => {
    const { wallet, kaspaClient, krc20Handler } = get();
    
    if (!wallet || !kaspaClient) {
      throw new Error('Wallet not initialized');
    }
    
    try {
      let txHash: string;
      
      if (token === 'KAS') {
        txHash = await kaspaClient.sendTransaction(
          wallet.address,
          to,
          amount,
          wallet.privateKey!
        );
      } else if (token === 'GEEK' && krc20Handler) {
        txHash = await krc20Handler.transferGeek(
          wallet.address,
          to,
          amount,
          wallet.privateKey!
        );
      } else {
        throw new Error('Unsupported token');
      }
      
      // Refresh after sending
      setTimeout(() => {
        get().refreshBalance();
        get().refreshTransactions();
      }, 2000);
      
      return txHash;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  },

  refreshBalance: async () => {
    const { wallet, kaspaClient, krc20Handler } = get();
    
    if (!wallet || !kaspaClient || !krc20Handler) return;
    
    try {
      // Get KAS and all KRC-20 token balances
      const [kasBalance, geekBalance, allTokens] = await Promise.all([
        kaspaClient.getBalance(wallet.address),
        krc20Handler.getGeekBalance(wallet.address),
        krc20Handler.getAllTokenBalances(wallet.address),
      ]);
      
      set({
        wallet: {
          ...wallet,
          balance: kasBalance,
          geekBalance,
        },
        tokens: allTokens,
      });
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  },

  refreshTransactions: async () => {
    const { wallet, kaspaClient } = get();
    
    if (!wallet || !kaspaClient) return;
    
    try {
      const transactions = await kaspaClient.getTransactions(wallet.address);
      set({ transactions });
    } catch (error) {
      console.error('Failed to refresh transactions:', error);
    }
  },

  switchNetwork: async (network: NetworkConfig) => {
    const { kaspaClient } = get();
    
    // Disconnect from current network
    kaspaClient?.disconnect();
    
    // Connect to new network
    const newClient = new KaspaClient(network);
    await newClient.connect();
    const krc20Handler = new KRC20Handler(newClient);
    
    set({
      network,
      kaspaClient: newClient,
      krc20Handler,
    });
    
    // Refresh data
    await get().refreshBalance();
    await get().refreshTransactions();
  },

  startAutoRefresh: () => {
    const { autoRefreshInterval } = get();
    
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }
    
    const interval = setInterval(() => {
      get().refreshBalance();
      get().refreshTransactions();
    }, REFRESH_INTERVAL);
    
    set({ autoRefreshInterval: interval });
  },
}));
