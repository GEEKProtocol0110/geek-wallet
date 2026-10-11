/**
 * Kaspa Wallet SDK Integration
 * Using OKX Web3's Kaspa implementation for production-ready operations
 */

import { KaspaWallet, validateAddress as sdkValidateAddress, addressFromPrvKey } from '@okxweb3/coin-kaspa';
import type { NewAddressParams, SignTxParams, DerivePriKeyParams } from '@okxweb3/coin-base';

// Initialize the SDK
const kaspaSDK = new KaspaWallet();

export interface KaspaKeyPair {
  privateKey: string;
  publicKey: string;
  address: string;
}

export interface TransactionInput {
  txId: string;
  vout: number;
  amount: number;
  address: string;
}

export interface TransactionOutput {
  address: string;
  amount: number;
}

export interface KaspaTransaction {
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  changeAddress: string;
  feeRate?: number;
}

/**
 * Generate a new Kaspa wallet from mnemonic
 */
export async function generateWalletFromMnemonic(
  mnemonic: string,
  password?: string
): Promise<KaspaKeyPair> {
  try {
    // First, derive the private key from mnemonic
    const deriveParams: DerivePriKeyParams = {
      mnemonic: mnemonic,
      hdPath: "m/44'/111111'/0'/0/0", // Kaspa BIP44 path
    };

    const derivedKey = await kaspaSDK.getDerivedPrivateKey(deriveParams);
    const privateKey = derivedKey.privateKey;
    
    // Then get the address and public key from the private key
    const addressParams: NewAddressParams = {
      privateKey: privateKey,
    };

    const addressData = await kaspaSDK.getNewAddress(addressParams);
    
    return {
      privateKey: privateKey,
      publicKey: addressData.publicKey || '',
      address: addressData.address,
    };
  } catch (error) {
    console.error('Failed to generate wallet from mnemonic:', error);
    throw new Error('Failed to generate Kaspa wallet');
  }
}

/**
 * Get address from private key
 */
export async function getAddressFromPrivateKey(privateKey: string): Promise<string> {
  try {
    return addressFromPrvKey(privateKey);
  } catch (error) {
    console.error('Failed to get address from private key:', error);
    throw new Error('Invalid private key');
  }
}

/**
 * Validate Kaspa address
 */
export function validateAddress(address: string): boolean {
  try {
    return sdkValidateAddress(address);
  } catch (error) {
    return false;
  }
}

/**
 * Sign a Kaspa transaction
 */
export async function signTransaction(
  privateKey: string,
  transactionData: any
): Promise<string> {
  try {
    const signParams: SignTxParams = {
      privateKey: privateKey,
      data: transactionData,
    };

    const signedTx = await kaspaSDK.signTransaction(signParams);
    return signedTx.txHex || signedTx;
  } catch (error) {
    console.error('Failed to sign transaction:', error);
    throw new Error('Transaction signing failed');
  }
}

/**
 * Calculate transaction fee
 */
export function calculateTransactionFee(
  inputCount: number,
  outputCount: number,
  feeRate: number = 1
): number {
  // Approximate size calculation for Kaspa transaction
  // Input: ~150 bytes, Output: ~34 bytes, overhead: ~10 bytes
  const estimatedSize = (inputCount * 150) + (outputCount * 34) + 10;
  return Math.ceil(estimatedSize * feeRate);
}

/**
 * Format amount from sompi to KAS (1 KAS = 100,000,000 sompi)
 */
export function sompiToKAS(sompi: number): number {
  return sompi / 100000000;
}

/**
 * Format amount from KAS to sompi
 */
export function kasToSompi(kas: number): number {
  return Math.round(kas * 100000000);
}

export { kaspaSDK };
