'use client';

import { useState } from 'react';
import { SecureStorage } from '@/lib/storage';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { ThemeToggle } from '../theme/ThemeToggle';

export function UnlockWallet({ 
  onUnlock, 
  onCreateNew 
}: { 
  onUnlock: (password: string) => void;
  onCreateNew?: () => void;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Verify password can decrypt wallet
      const wallet = SecureStorage.loadWallet(password);
      if (!wallet) {
        setError('Invalid password');
        setIsLoading(false);
        return;
      }

      onUnlock(password);
    } catch {
      setError('Invalid password');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">G</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GEEK Wallet</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Enter your password to unlock</p>
        </div>

        <div className="space-y-4">
          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
            error={error}
            autoFocus
          />

          <Button
            onClick={handleUnlock}
            isLoading={isLoading}
            className="w-full"
          >
            Unlock Wallet
          </Button>

          {onCreateNew && (
            <div className="text-center">
              <button
                onClick={onCreateNew}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create a new wallet instead
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
