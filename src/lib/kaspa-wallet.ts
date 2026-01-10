import { CryptoUtils } from './crypto';
import type { Wallet } from '@/types/wallet';
import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync } from '@scure/bip39';
import * as secp256k1 from 'secp256k1';
import { createHash } from 'crypto';

export class KaspaWallet {
  // Kaspa uses BIP32/BIP44 derivation path: m/44'/111111'/0'/0/0
  private static readonly KASPA_COIN_TYPE = 111111;
  private static readonly DERIVATION_PATH = `m/44'/${this.KASPA_COIN_TYPE}'/0'/0/0`;

  /**
   * Create a new wallet
   */
  static async createWallet(): Promise<Wallet> {
    const mnemonic = CryptoUtils.generateMnemonic();
    return this.restoreFromMnemonic(mnemonic);
  }

  /**
   * Restore wallet from mnemonic
   */
  static async restoreFromMnemonic(mnemonic: string): Promise<Wallet> {
    if (!CryptoUtils.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    try {
      // Convert mnemonic to seed
      const seed = mnemonicToSeedSync(mnemonic);
      
      // Derive master key
      const masterKey = HDKey.fromMasterSeed(seed);
      
      // Derive Kaspa account key using BIP44 path
      const accountKey = masterKey.derive(this.DERIVATION_PATH);
      
      if (!accountKey.privateKey) {
        throw new Error('Failed to derive private key');
      }

      // Get public key from private key
      const publicKey = secp256k1.publicKeyCreate(accountKey.privateKey, true);
      
      // Generate Kaspa address from public key
      const address = this.publicKeyToAddress(publicKey);
      const privateKey = Buffer.from(accountKey.privateKey).toString('hex');
      const pubKeyHex = Buffer.from(publicKey).toString('hex');

      return {
        address,
        publicKey: pubKeyHex,
        privateKey,
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
   * Convert public key to Kaspa address
   */
  private static publicKeyToAddress(publicKey: Uint8Array, isTestnet: boolean = true): string {
    // Kaspa address generation:
    // 1. RIPEMD160(SHA256(publicKey))
    // 2. Add version prefix
    // 3. Encode with base32
    
    const sha256Hash = createHash('sha256').update(publicKey).digest();
    const ripemd160Hash = createHash('ripemd160').update(sha256Hash).digest();
    
    // Add version byte (0x00 for mainnet, 0x01 for testnet P2PKH)
    const version = Buffer.from([isTestnet ? 0x01 : 0x00]);
    const payload = Buffer.concat([version, ripemd160Hash]);
    
    // Calculate checksum (first 4 bytes of double SHA256)
    const checksum = createHash('sha256')
      .update(createHash('sha256').update(payload).digest())
      .digest()
      .slice(0, 4);
    
    const addressBytes = Buffer.concat([payload, checksum]);
    
    // Encode to Kaspa address format
    const addressHex = addressBytes.toString('hex');
    // Use testnet prefix for testnet addresses
    const prefix = isTestnet ? 'kaspatest:q' : 'kaspa:q';
    return `${prefix}${addressHex}`;
  }

  /**
   * Validate Kaspa address
   */
  static isValidAddress(address: string): boolean {
    // Kaspa address format: kaspa:q[hex] or kaspatest:q[hex]
    if (!address.startsWith('kaspa:q') && !address.startsWith('kaspatest:q')) {
      return false;
    }
    
    const addressPart = address.includes('kaspatest:') 
      ? address.slice(11) // Remove 'kaspatest:q'
      : address.slice(7);  // Remove 'kaspa:q'
    
    // Should be hex and reasonable length (50-100 chars typically)
    return /^[0-9a-f]{50,100}$/i.test(addressPart);
  }

  /**
   * Sign a message with private key
   */
  static signMessage(privateKey: string, message: string): string {
    try {
      const privKeyBuffer = Buffer.from(privateKey, 'hex');
      const messageHash = createHash('sha256').update(message).digest();
      
      const signature = secp256k1.ecdsaSign(messageHash, privKeyBuffer);
      return Buffer.from(signature.signature).toString('hex');
    } catch (error) {
      console.error('Error signing message:', error);
      throw new Error('Failed to sign message');
    }
  }

  /**
   * Sign a transaction
   */
  static async signTransaction(
    privateKey: string,
    txData: Record<string, unknown>
  ): Promise<string> {
    // Sign transaction data
    const txString = JSON.stringify(txData);
    return this.signMessage(privateKey, txString);
  }
}
