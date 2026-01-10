'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/wallet-store';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { KaspaWallet } from '@/lib/kaspa-wallet';

export function SendTransaction() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState<'KAS' | 'GEEK'>('GEEK');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { sendTransaction, wallet, isLoading } = useWalletStore();

  const handleSend = async () => {
    setError('');
    setSuccess('');
    
    if (!KaspaWallet.isValidAddress(recipient)) {
      setError('Invalid recipient address');
      return;
    }
    
    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      const txHash = await sendTransaction(recipient, amount, token);
      setSuccess(`Transaction sent! Hash: ${txHash.substring(0, 10)}...`);
      setRecipient('');
      setAmount('');
    } catch (err: any) {
      setError(err.message || 'Failed to send transaction');
    }
  };

  return (
    <Card title="Send Tokens">
      <div className="space-y-4">
        {/* Token Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setToken('GEEK')}
              className={`p-3 rounded-lg border-2 transition-all ${
                token === 'GEEK'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">GEEK</div>
              <div className="text-sm text-gray-600">
                {wallet?.geekBalance || '0'}
              </div>
            </button>
            
            <button
              onClick={() => setToken('KAS')}
              className={`p-3 rounded-lg border-2 transition-all ${
                token === 'KAS'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">KAS</div>
              <div className="text-sm text-gray-600">
                {wallet?.balance || '0'}
              </div>
            </button>
          </div>
        </div>

        <Input
          label="Recipient Address"
          placeholder="kaspa:..."
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        
        <Input
          type="number"
          label="Amount"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={error}
        />
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}
        
        <Button
          onClick={handleSend}
          isLoading={isLoading}
          className="w-full"
        >
          Send {token}
        </Button>
      </div>
    </Card>
  );
}
