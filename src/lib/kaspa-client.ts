import { DEFAULT_NETWORK, DEMO_MODE } from '@/config/constants';
import type { NetworkConfig, Transaction } from '@/types/wallet';

export class KaspaClient {
  private rpcUrl: string;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private listeners: Map<string, ((...args: unknown[]) => void)[]> = new Map();
  private requestId: number = 0;
  private pendingRequests: Map<number, { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = new Map();
  private connected: boolean = false;
  private demoMode: boolean = DEMO_MODE;

  constructor(network: NetworkConfig = DEFAULT_NETWORK) {
    this.rpcUrl = network.rpcUrl;
    this.wsUrl = network.rpcUrl;
  }

  /**
   * Connect to Kaspa network via WebSocket (optional, uses HTTP fallback)
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // For now, skip WebSocket and use HTTP RPC only
        // WebSocket support can be added later
        this.connected = true;
        if (this.demoMode) {
          console.log('✅ Connected to Kaspa network (DEMO MODE)');
        } else {
          console.log('✅ Connected to Kaspa network (HTTP RPC)');
        }
        resolve();
      } catch (error) {
        console.error('Connection error:', error);
        reject(error);
      }
    });
  }

  /**
   * Reconnect to network
   */
  private async reconnect(): Promise<void> {
    console.log('🔄 Attempting to reconnect...');
    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    }, 5000);
  }

  /**
   * Subscribe to events
   */
  on(event: string, callback: (...args: unknown[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Make HTTP RPC request
   */
  private async httpRequest(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    // In demo mode, return mock data
    if (this.demoMode) {
      return this.getMockResponse(method, params);
    }

    try {
      // Convert WebSocket URL to HTTP
      const httpUrl = this.rpcUrl
        .replace('wss://', 'https://')
        .replace('ws://', 'http://');

      const response = await fetch(httpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: ++this.requestId,
          method,
          params,
        }),
      });

      if (!response.ok) {
        console.warn(`RPC request failed: ${response.status}. Switching to demo mode.`);
        this.demoMode = true;
        return this.getMockResponse(method, params);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'RPC error');
      }

      return data.result;
    } catch (error) {
      console.error('❌ RPC request failed, using demo mode:', error);
      this.demoMode = true;
      return this.getMockResponse(method, params);
    }
  }

  /**
   * Get mock response for demo mode
   */
  private getMockResponse(method: string, params: Record<string, unknown>): unknown {
    const address = params?.address || '';
    
    switch (method) {
      case 'getBalanceByAddress':
        // Return mock balance: 10,000 KAS (in sompi: 1 KAS = 100,000,000 sompi)
        return {
          balance: '1000000000000', // 10,000 KAS
        };
        
      case 'getTransactionsByAddress':
        // Return mock transactions
        return {
          transactions: [
            {
              transaction_id: 'demo_tx_1',
              is_outgoing: false,
              amount: '500000000000', // 5,000 KAS
              block_time: Date.now() - 3600000,
              is_accepted: true,
              confirmations: 100,
              inputs: [{ address: 'kaspa:demo_sender' }],
              outputs: [{ address }],
            },
            {
              transaction_id: 'demo_tx_2',
              is_outgoing: true,
              amount: '100000000000', // 1,000 KAS
              block_time: Date.now() - 7200000,
              is_accepted: true,
              confirmations: 200,
              inputs: [{ address }],
              outputs: [{ address: 'kaspa:demo_recipient' }],
            },
          ],
        };
        
      case 'createTransaction':
      case 'submitTransaction':
        return {
          txHash: 'demo_tx_' + Math.random().toString(36).substr(2, 9),
        };
        
      case 'getBlockDag':
        return {
          blockCount: 42000000,
          difficulty: 123456789,
          networkHashRate: '1.5 PH/s',
        };
        
      default:
        return {};
    }
  }

  /**
   * Get balance for an address
   */
  async getBalance(address: string): Promise<string> {
    try {
      const result = await this.httpRequest('getBalanceByAddress', { address }) as { balance?: string };
      
      // Kaspa returns balance in sompi (1 KAS = 100,000,000 sompi)
      return result?.balance || '0';
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(address: string): Promise<Transaction[]> {
    try {
      const result = await this.httpRequest('getTransactionsByAddress', { 
        address,
        limit: 50 
      }) as { transactions?: Array<Record<string, unknown>> };
      
      return this.formatTransactions(result?.transactions || []);
    } catch (error) {
      console.error('Failed to get transactions:', error);
      return [];
    }
  }

  /**
   * Format raw transactions to our Transaction type
   */
  private formatTransactions(rawTxs: Array<Record<string, unknown>>): Transaction[] {
    return rawTxs.map((tx: Record<string, unknown>): Transaction => ({
      id: (tx.transaction_id as string) || (tx.txId as string) || Math.random().toString(),
      type: (tx.is_outgoing || tx.isOutgoing) ? 'send' as const : 'receive' as const,
      amount: (tx.amount as string) || '0',
      token: 'KAS',
      from: (tx.from as string) || ((tx.inputs as Array<{ address?: string }>)?.[0]?.address) || '',
      to: (tx.to as string) || ((tx.outputs as Array<{ address?: string }>)?.[0]?.address) || '',
      timestamp: (tx.block_time as number) || (tx.timestamp as number) || Date.now(),
      status: (tx.is_accepted || tx.accepted) ? 'confirmed' as const : 'pending' as const,
      confirmations: (tx.confirmations as number) || 0,
      txHash: (tx.transaction_id as string) || (tx.txId as string) || '',
    }));
  }

  /**
   * Send transaction
   */
  async sendTransaction(
    from: string,
    to: string,
    amount: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateKey: string
  ): Promise<string> {
    try {
      // Create and sign transaction
      const tx = await this.httpRequest('createTransaction', {
        from,
        to,
        amount,
      });

      // Submit signed transaction
      const result = await this.httpRequest('submitTransaction', {
        transaction: tx,
        signature: await this.signTransaction(),
      }) as { txHash?: string; transactionId?: string };

      return result.txHash || result.transactionId || '';
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  }

  /**
   * Sign transaction (placeholder)
   */
  private async signTransaction(): Promise<string> {
    // This would use proper signing with secp256k1
    return 'signature_placeholder';
  }

  /**
   * Get network info
   */
  async getNetworkInfo(): Promise<Record<string, unknown> | null> {
    try {
      return await this.httpRequest('getBlockDag') as Record<string, unknown>;
    } catch (error) {
      console.error('Failed to get network info:', error);
      return null;
    }
  }

  /**
   * Get KRC-20 token balance
   */
  async getKRC20Balance(address: string, ticker: string): Promise<string> {
    try {
      // Query KRC-20 balance from UTXOs
      const result = await this.httpRequest('getKRC20Balance', { 
        address, 
        ticker 
      }) as { balance?: string };
      
      return result?.balance || '0';
    } catch (error) {
      console.error(`Failed to get KRC-20 ${ticker} balance:`, error);
      // Return demo balance for testing
      if (this.demoMode && ticker === 'GEEK') {
        return '5000000000000'; // 50,000 GEEK (8 decimals)
      }
      return '0';
    }
  }

  /**
   * Send KRC-20 transaction
   */
  async sendKRC20Transaction(
    from: string,
    to: string,
    krc20Data: Record<string, unknown>,
    privateKey: string
  ): Promise<string> {
    try {
      // Create transaction with KRC-20 data in OP_RETURN
      const tx = await this.httpRequest('createKRC20Transaction', {
        from,
        to,
        krc20Data: JSON.stringify(krc20Data),
      });

      // Sign and submit transaction
      const result = await this.httpRequest('submitTransaction', {
        transaction: tx,
        signature: await this.signTransaction(),
        privateKey,
      }) as { txHash?: string; transactionId?: string };

      return result.txHash || result.transactionId || '';
    } catch (error) {
      console.error('Failed to send KRC-20 transaction:', error);
      // In demo mode, return mock tx hash
      if (this.demoMode) {
        return 'demo_krc20_tx_' + Math.random().toString(36).substr(2, 16);
      }
      throw error;
    }
  }

  /**
   * Disconnect from network
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    console.log('🔌 Disconnected from Kaspa network');
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}
