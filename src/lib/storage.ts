import { STORAGE_KEYS } from '@/config/constants';
import { CryptoUtils } from './crypto';

export class SecureStorage {
  /**
   * Save encrypted wallet data
   */
  static saveWallet(walletData: any, password: string): void {
    const encrypted = CryptoUtils.encrypt(JSON.stringify(walletData), password);
    localStorage.setItem(STORAGE_KEYS.ENCRYPTED_KEY, encrypted);
  }

  /**
   * Load and decrypt wallet data
   */
  static loadWallet(password: string): any | null {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEYS.ENCRYPTED_KEY);
      if (!encrypted) return null;

      const decrypted = CryptoUtils.decrypt(encrypted, password);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to decrypt wallet:', error);
      return null;
    }
  }

  /**
   * Check if wallet exists
   */
  static hasWallet(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.ENCRYPTED_KEY);
  }

  /**
   * Remove wallet data
   */
  static clearWallet(): void {
    localStorage.removeItem(STORAGE_KEYS.ENCRYPTED_KEY);
    localStorage.removeItem(STORAGE_KEYS.WALLET);
  }

  /**
   * Save settings
   */
  static saveSettings(settings: any): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  /**
   * Load settings
   */
  static loadSettings(): any {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : {};
  }
}
