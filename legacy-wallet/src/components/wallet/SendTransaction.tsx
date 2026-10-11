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
  const [token, setToken] = useState<string>('KAS');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMax, setShowMax] = useState(false);
  
  const { sendTransaction, wallet, tokens, isLoading } = useWalletStore();

  const getMaxAmount = () => {
    if (token === 'KAS') {
      return (parseFloat(wallet?.balance || '0') / 100000000).toFixed(8);
    } else if (token === 'GEEK') {
      return (parseFloat(wallet?.geekBalance || '0') / 100000000).toFixed(8);
    } else {
      const selectedToken = tokens?.find(t => t.symbol === token);
      return selectedToken 
        ? (parseFloat(selectedToken.balance) / Math.pow(10, selectedToken.decimals)).toFixed(8)
        : '0';
    }
  };

  const handleMaxClick = () => {
    setAmount(getMaxAmount());
  };

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
      // Support both KAS and any KRC-20 token
      const txHash = await sendTransaction(recipient, amount, token as 'KAS' | 'GEEK');
      setSuccess(`Transaction sent! Hash: ${txHash.substring(0, 10)}...`);
      setRecipient('');
      setAmount('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send transaction');
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Send Tokens</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Fee: ~0.001 KAS
          </div>
        </div>

        {/* Token Selector - Kasware Style */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            Select Token
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* KAS Token */}
            <button
              onClick={() => setToken('KAS')}
              className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                token === 'KAS'
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">KAS</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {(parseFloat(wallet?.balance || '0') / 100000000).toFixed(4)} KAS
              </div>
            </button>
            
            {/* GEEK Token */}
            <button
              onClick={() => setToken('GEEK')}
              className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                token === 'GEEK'
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">GEEK</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {(parseFloat(wallet?.geekBalance || '0') / 100000000).toFixed(4)} GEEK
              </div>
            </button>
            
            {/* Other KRC-20 Tokens */}
            {tokens?.filter(t => t.symbol !== 'GEEK').map((t) => (
              <button
                key={t.symbol}
                onClick={() => setToken(t.symbol)}
                className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                  token === t.symbol
                    ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{t.symbol[0]}</span>
                  </div>
                  <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">{t.symbol}</div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {(parseFloat(t.balance) / Math.pow(10, t.decimals)).toFixed(4)} {t.symbol}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recipient Address */}
        <div>
          <Input
            label="Recipient Address"
            placeholder="kaspa: or kaspatest:..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>
        
        {/* Amount Input with MAX button */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Amount
            </label>
            <button
              onClick={handleMaxClick}
              className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 px-3 py-1 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              MAX
            </button>
          </div>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        
        {/* Messages */}
        {success && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-l-4 border-green-500 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-800 dark:text-green-300 font-medium">{success}</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-l-4 border-red-500 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-sm text-red-800 dark:text-red-300 font-medium">{error}</p>
            </div>
          </div>
        )}
        
        {/* Send Button - Kasware Style */}
        <Button
          onClick={handleSend}
          disabled={isLoading || !recipient || !amount}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          ) : (
            `Send ${token}`
          )}
        </Button>
      </div>
    </Card>
  );
}
