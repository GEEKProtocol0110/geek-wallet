import { CryptoUtils } from './crypto';
import type { Wallet } from '@/types/wallet';
import { generateWalletFromMnemonic, validateAddress, signTransaction as sdkSignTransaction, type KaspaKeyPair } from './kaspa-sdk';

export class KaspaWallet {
  /**
   * Create a new wallet using Kaspa SDK
   */
  static async createWallet(): Promise<Wallet> {
    const mnemonic = CryptoUtils.generateMnemonic();
    return this.restoreFromMnemonic(mnemonic);
  }

  /**
   * Restore wallet from mnemonic using Kaspa SDK
   */
  static async restoreFromMnemonic(mnemonic: string): Promise<Wallet> {
    if (!CryptoUtils.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    try {
      // Use Kaspa SDK to generate wallet from mnemonic
      const kaspaWallet: KaspaKeyPair = await generateWalletFromMnemonic(mnemonic);

      return {
        address: kaspaWallet.address,
        publicKey: kaspaWallet.publicKey,
        privateKey: kaspaWallet.privateKey,
        mnemonic,
        balance: '0',
        geekBalance: '0',
      };
    } catch (error) {
      console.error('Error restoring wallet:', error);
      throw new Error('Failed to restore wallet from mnemonic');
    }
  }

  /**
   * Validate Kaspa address using SDK
   */
  static isValidAddress(address: string): boolean {
    return validateAddress(address);
  }

  /**
   * Sign a transaction using Kaspa SDK
   */
  static async signTransaction(
    privateKey: string,
    transactionData: any
  ): Promise<string> {
    return await sdkSignTransaction(privateKey, transactionData);
  }
}
