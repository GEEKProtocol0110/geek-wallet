'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/wallet-store';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

export function CreateWallet() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'password' | 'mnemonic'>('password');
  
  const { createWallet, isLoading } = useWalletStore();

  const handleCreateWallet = async () => {
    setError('');
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await createWallet(password);
      // In production, show the mnemonic to the user
      setStep('mnemonic');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
    }
  };

  if (step === 'mnemonic') {
    return (
      <Card title="Backup Your Wallet" className="max-w-2xl mx-auto">
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ Write down these 24 words in order and keep them safe. Never share them with anyone!
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              {/* Placeholder - in production, show actual mnemonic */}
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{i + 1}.</span>
                  <span className="text-sm font-mono">word{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button variant="outline" className="flex-1">
              Download Backup
            </Button>
            <Button className="flex-1">
              I&apos;ve Saved My Recovery Phrase
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Create New Wallet" className="max-w-md mx-auto">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Create a secure password to protect your wallet. You&apos;ll need this password every time you access your wallet.
        </p>
        
        <Input
          type="password"
          label="Password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
        />
        
        <Input
          type="password"
          label="Confirm Password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        
        <Button
          onClick={handleCreateWallet}
          isLoading={isLoading}
          className="w-full"
        >
          Create Wallet
        </Button>
      </div>
    </Card>
  );
}
