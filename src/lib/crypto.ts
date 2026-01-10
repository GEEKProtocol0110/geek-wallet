import * as bip39 from 'bip39';
import CryptoJS from 'crypto-js';

export class CryptoUtils {
  /**
   * Generate a new mnemonic phrase
   */
  static generateMnemonic(): string {
    return bip39.generateMnemonic(256); // 24 words for maximum security
  }

  /**
   * Validate a mnemonic phrase
   */
  static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  /**
   * Encrypt data with a password
   */
  static encrypt(data: string, password: string): string {
    return CryptoJS.AES.encrypt(data, password).toString();
  }

  /**
   * Decrypt data with a password
   */
  static decrypt(encryptedData: string, password: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Hash a password for verification
   */
  static hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }

  /**
   * Generate a secure random password
   */
  static generateSecurePassword(length: number = 32): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      password += charset[randomValues[i] % charset.length];
    }
    
    return password;
  }

  /**
   * Derive seed from mnemonic
   */
  static mnemonicToSeed(mnemonic: string, passphrase: string = ''): Promise<Buffer> {
    return bip39.mnemonicToSeed(mnemonic, passphrase);
  }
}
