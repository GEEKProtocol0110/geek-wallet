import { GEEK_TOKEN, SUPPORTED_KRC20_TOKENS } from '@/config/constants';
import { KaspaClient } from './kaspa-client';
import type { KRC20Token } from '@/types/wallet';

export class KRC20Handler {
  private client: KaspaClient;
  private tokenBalancesCache: Map<string, Map<string, string>> = new Map();

  constructor(client: KaspaClient) {
    this.client = client;
  }

  /**
   * Get all supported KRC-20 tokens
   */
  getSupportedTokens(): typeof SUPPORTED_KRC20_TOKENS {
    return SUPPORTED_KRC20_TOKENS;
  }

  /**
   * Get GEEK token balance
   */
  async getGeekBalance(address: string): Promise<string> {
    return this.getTokenBalance(address, GEEK_TOKEN.symbol);
  }

  /**
   * Get KRC-20 token balance by ticker symbol
   */
  async getTokenBalance(address: string, ticker: string): Promise<string> {
    try {
      // Check cache first
      const cached = this.tokenBalancesCache.get(address)?.get(ticker);
      if (cached !== undefined) {
        return cached;
      }

      // Query KRC-20 balance from Kaspa network
      // KRC-20 tokens are tracked through UTXO commitment data
      const balance = await this.queryKRC20Balance(address, ticker);
      
      // Update cache
      if (!this.tokenBalancesCache.has(address)) {
        this.tokenBalancesCache.set(address, new Map());
      }
      this.tokenBalancesCache.get(address)!.set(ticker, balance);
      
      return balance;
    } catch (error) {
      console.error(`Failed to get ${ticker} balance:`, error);
      return '0';
    }
  }

  /**
   * Query KRC-20 balance from the network
   */
  private async queryKRC20Balance(address: string, ticker: string): Promise<string> {
    try {
      // KRC-20 uses JSON in OP_RETURN outputs
      // Query transactions and parse KRC-20 data
      const result = await this.client.getKRC20Balance(address, ticker);
      return result || '0';
    } catch (error) {
      console.error('KRC-20 balance query failed:', error);
      return '0';
    }
  }

  /**
   * Get all token balances for an address
   */
  async getAllTokenBalances(address: string): Promise<KRC20Token[]> {
    const tokens: KRC20Token[] = [];
    
    for (const token of SUPPORTED_KRC20_TOKENS) {
      const balance = await this.getTokenBalance(address, token.symbol);
      tokens.push({
        ...token,
        balance,
      });
    }
    
    return tokens;
  }

  /**
   * Clear balance cache
   */
  clearCache(): void {
    this.tokenBalancesCache.clear();
  }

  /**
   * Transfer GEEK tokens
   */
  async transferGeek(
    from: string,
    to: string,
    amount: string,
    privateKey: string
  ): Promise<string> {
    return this.transferToken(
      from,
      to,
      amount,
      GEEK_TOKEN.symbol,
      privateKey
    );
  }

  /**
   * Transfer KRC-20 tokens by ticker
   */
  async transferToken(
    from: string,
    to: string,
    amount: string,
    ticker: string,
    privateKey: string
  ): Promise<string> {
    try {
      // Create KRC-20 transfer data
      const krc20Data = this.createKRC20Transfer(from, to, amount, ticker);
      
      // Send through Kaspa network with KRC-20 metadata
      return await this.client.sendKRC20Transaction(
        from,
        to,
        krc20Data,
        privateKey
      );
    } catch (error) {
      console.error(`Failed to transfer ${ticker}:`, error);
      throw error;
    }
  }

  /**
   * Create KRC-20 transfer data
   */
  private createKRC20Transfer(
    from: string,
    to: string,
    amount: string,
    ticker: string
  ): Record<string, unknown> {
    // KRC-20 format: embed token metadata in OP_RETURN
    // Format follows KRC-20 specification
    return {
      p: 'krc-20',
      op: 'transfer',
      tick: ticker,
      amt: amount,
      from,
      to,
    };
  }

  /**
   * Get token information
   */
  async getTokenInfo(contractAddress: string): Promise<KRC20Token> {
    // Placeholder - fetch from chain or metadata
    if (contractAddress === GEEK_TOKEN.contractAddress) {
      return {
        ...GEEK_TOKEN,
        balance: '0',
      };
    }

    throw new Error('Token not found');
  }

  /**
   * Parse KRC-20 transactions
   */
  parseKRC20Transaction(txData: Record<string, unknown>): Record<string, unknown> | null {
    // Parse KRC-20 metadata from transaction
    try {
      // KRC-20 tokens use JSON in OP_RETURN or similar
      const metadata = JSON.parse((txData.metadata as string) || '{}');
      return metadata;
    } catch {
      return null;
    }
  }
}
