import { DEFAULT_NETWORK } from '@/config/constants';
import type { NetworkConfig, Transaction } from '@/types/wallet';

export class KaspaClient {
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor(network: NetworkConfig = DEFAULT_NETWORK) {
    this.wsUrl = network.rpcUrl;
  }

  /**
   * Connect to Kaspa network
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log('Connected to Kaspa network');
          resolve();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = () => {
          console.log('Disconnected from Kaspa network');
          this.reconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Reconnect to network
   */
  private async reconnect(): Promise<void> {
    setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.connect().catch(console.error);
    }, 5000);
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      const listeners = this.listeners.get(message.type) || [];
      listeners.forEach(listener => listener(message));
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
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
   * Send RPC request
   */
  private async sendRequest(method: string, params: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('Not connected to network'));
        return;
      }

      const id = Math.random().toString(36).substring(7);
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      const listener = (message: any) => {
        if (message.id === id) {
          if (message.error) {
            reject(new Error(message.error.message));
          } else {
            resolve(message.result);
          }
        }
      };

      this.on('response', listener);
      this.ws.send(JSON.stringify(request));
    });
  }

  /**
   * Get balance for an address
   */
  async getBalance(address: string): Promise<string> {
    try {
      const result = await this.sendRequest('getBalanceByAddress', { address });
      return result.balance || '0';
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
      const result = await this.sendRequest('getTransactionsByAddress', { address });
      return this.formatTransactions(result.transactions || []);
    } catch (error) {
      console.error('Failed to get transactions:', error);
      return [];
    }
  }

  /**
   * Format transactions
   */
  private formatTransactions(rawTxs: any[]): Transaction[] {
    return rawTxs.map((tx: any) => ({
      id: tx.transaction_id,
      type: tx.is_outgoing ? 'send' : 'receive',
      amount: tx.amount,
      token: 'KAS',
      from: tx.inputs[0]?.previous_outpoint_address || '',
      to: tx.outputs[0]?.script_public_key_address || '',
      timestamp: tx.block_time || Date.now(),
      status: tx.is_accepted ? 'confirmed' : 'pending',
      confirmations: tx.confirmations || 0,
      txHash: tx.transaction_id,
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
      const tx = await this.sendRequest('createTransaction', {
        from,
        to,
        amount,
      });

      // Sign transaction (placeholder)
      // In production, implement proper signing

      const result = await this.sendRequest('submitTransaction', {
        transaction: tx,
      });

      return result.txHash;
    } catch (error) {
      console.error('Failed to send transaction:', error);
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
  }
}
