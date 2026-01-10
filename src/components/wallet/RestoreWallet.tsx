'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/wallet-store';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

export function RestoreWallet() {
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { restoreWallet, isLoading } = useWalletStore();

  const handleRestore = async () => {
    setError('');
    
    const words = mnemonic.trim().split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      setError('Recovery phrase must be 12 or 24 words');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await restoreWallet(mnemonic.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Failed to restore wallet');
    }
  };

  return (
    <Card title="Restore Wallet" className="max-w-2xl mx-auto">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Enter your 12 or 24 word recovery phrase to restore your wallet.
        </p>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recovery Phrase
          </label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            rows={4}
            placeholder="Enter your recovery phrase (12 or 24 words)"
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
          />
        </div>
        
        <Input
          type="password"
          label="New Password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
        />
        
        <Button
          onClick={handleRestore}
          isLoading={isLoading}
          className="w-full"
        >
          Restore Wallet
        </Button>
      </div>
    </Card>
  );
}
