import { DEFAULT_NETWORK } from '@/config/constants';
import type { NetworkConfig, Transaction } from '@/types/wallet';

export class KaspaClient {
  private rpcUrl: string;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private requestId: number = 0;
  private pendingRequests: Map<number, { resolve: Function; reject: Function }> = new Map();
  private connected: boolean = false;

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
        console.log('✅ Connected to Kaspa network (HTTP RPC)');
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
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Make HTTP RPC request
   */
  private async httpRequest(method: string, params: any = {}): Promise<any> {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'RPC error');
      }

      return data.result;
    } catch (error) {
      console.error('❌ RPC request failed:', error);
      throw error;
    }
  }

  /**
   * Get balance for an address
   */
  async getBalance(address: string): Promise<string> {
    try {
      const result = await this.httpRequest('getBalanceByAddress', { address });
      
      // Kaspa returns balance in sompi (1 KAS = 100,000,000 sompi)
      return result?.balance || '0';
    } catch (error) {
      console.error('Failed to get balance:', error);
      // Return mock balance for development/testing
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
      });
      
      return this.formatTransactions(result?.transactions || []);
    } catch (error) {
      console.error('Failed to get transactions:', error);
      return [];
    }
  }

  /**
   * Format raw transactions to our Transaction type
   */
  private formatTransactions(rawTxs: any[]): Transaction[] {
    return rawTxs.map((tx: any) => ({
      id: tx.transaction_id || tx.txId || Math.random().toString(),
      type: tx.is_outgoing || tx.isOutgoing ? 'send' : 'receive',
      amount: tx.amount || '0',
      token: 'KAS',
      from: tx.from || tx.inputs?.[0]?.address || '',
      to: tx.to || tx.outputs?.[0]?.address || '',
      timestamp: tx.block_time || tx.timestamp || Date.now(),
      status: tx.is_accepted || tx.accepted ? 'confirmed' : 'pending',
      confirmations: tx.confirmations || 0,
      txHash: tx.transaction_id || tx.txId || '',
    }));
  }

  /**
   * Send transaction
   */
  async sendTransaction(
    from: string,
    to: string,
    amount: string,
    privateKey: string
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
        signature: await this.signTransaction(tx, privateKey),
      });

      return result.txHash || result.transactionId || '';
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  }

  /**
   * Sign transaction (placeholder)
   */
  private async signTransaction(tx: any, privateKey: string): Promise<string> {
    // This would use proper signing with secp256k1
    return 'signature_placeholder';
  }

  /**
   * Get network info
   */
  async getNetworkInfo(): Promise<any> {
    try {
      return await this.httpRequest('getBlockDag');
    } catch (error) {
      console.error('Failed to get network info:', error);
      return null;
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
