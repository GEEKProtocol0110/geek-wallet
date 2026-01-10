'use client';

import { useEffect, useState } from 'react';
import { useWalletStore } from '@/store/wallet-store';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { formatAmount, formatAddress, copyToClipboard } from '@/lib/utils';
import { DEMO_MODE } from '@/config/constants';

export function WalletDashboard() {
  const { wallet, tokens, network, isConnected, refreshBalance, lockWallet } = useWalletStore();
  const [showFullAddress, setShowFullAddress] = useState(false);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  if (!wallet) return null;

  return (
    <div className="space-y-6">
      {/* Network Status */}
      <div className={`border-l-4 p-4 rounded ${
        isConnected 
          ? 'bg-green-50 border-green-400 dark:bg-green-900/20' 
          : 'bg-red-50 border-red-400 dark:bg-red-900/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              isConnected ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
            }`}>
              {isConnected ? 'Connected to' : 'Disconnected from'} {network.name}
            </span>
          </div>
          {DEMO_MODE && (
            <span className="text-xs bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
              DEMO MODE
            </span>
          )}
        </div>
      </div>

      {/* Demo Mode Warning */}
      {DEMO_MODE && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Demo Mode Active:</strong> You&apos;re seeing simulated balances and transactions. 
                To connect to real Kaspa testnet, set <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">DEMO_MODE = false</code> in <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">src/config/constants.ts</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Balance Card - Kasware Style */}
      <Card className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 text-white shadow-2xl">
        <div className="space-y-6">
          {/* Header with Logo and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="small" />
              <div>
                <h2 className="text-sm font-medium opacity-90">GEEK Wallet</h2>
                <p className="text-xs opacity-75">{network.name}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={lockWallet}
              className="text-white border-white/30 hover:bg-white/10 hover:border-white"
            >
              🔒 Lock
            </Button>
          </div>
          
          {/* Main Balance Display */}
          <div>
            <div className="text-5xl font-bold mb-3 tracking-tight">
              {formatAmount(wallet.balance)} KAS
            </div>
            <div className="text-2xl opacity-90 font-semibold">
              {formatAmount(wallet.geekBalance)} GEEK
            </div>
          </div>
          
          {/* Address Section */}
          <div className="pt-4 border-t border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-75">Your Address</span>
              <button
                onClick={() => setShowFullAddress(!showFullAddress)}
                className="text-xs opacity-75 hover:opacity-100 transition"
              >
                {showFullAddress ? 'Hide' : 'Show Full'}
              </button>
            </div>
            <button
              onClick={() => {
                copyToClipboard(wallet.address);
              }}
              className="text-sm font-mono hover:opacity-75 transition-opacity bg-white/10 px-3 py-2 rounded-lg w-full text-left hover:bg-white/20"
            >
              {showFullAddress ? wallet.address : formatAddress(wallet.address)}
            </button>
          </div>
        </div>
      </Card>

      {/* Quick Actions - Kasware Style */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="hover:shadow-xl hover:scale-105 transition-all cursor-pointer border-2 border-transparent hover:border-purple-500">
          <div className="text-center py-2">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Receive</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Get tokens</p>
          </div>
        </Card>

        <Card className="hover:shadow-xl hover:scale-105 transition-all cursor-pointer border-2 border-transparent hover:border-purple-500">
          <div className="text-center py-2">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Send</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Transfer tokens</p>
          </div>
        </Card>

        <Card className="hover:shadow-xl hover:scale-105 transition-all cursor-pointer border-2 border-transparent hover:border-purple-500">
          <div className="text-center py-2">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">History</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">View activity</p>
          </div>
        </Card>
      </div>

      {/* Token List - Kasware Style */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Assets</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {tokens?.length || 0} + 2 tokens
          </span>
        </div>
        <div className="space-y-2">
          {/* KAS Token */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl hover:shadow-md transition-all cursor-pointer border border-blue-200/50 dark:border-blue-700/50">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">Kaspa</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">KAS</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                {formatAmount(wallet.balance)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">≈ $0.00</div>
            </div>
          </div>

          {/* GEEK Token */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl hover:shadow-md transition-all cursor-pointer border border-purple-200/50 dark:border-purple-700/50">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">GEEK Protocol</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">GEEK</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                {formatAmount(wallet.geekBalance)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">≈ $0.00</div>
            </div>
          </div>

          {/* Other KRC-20 Tokens */}
          {tokens?.filter(t => t.symbol !== 'GEEK').map((token, index) => {
            const colors = [
              { from: 'from-green-50', to: 'to-green-100', darkFrom: 'dark:from-green-900/20', darkTo: 'dark:to-green-800/20', border: 'border-green-200/50 dark:border-green-700/50', bg: 'from-green-500 to-green-600' },
              { from: 'from-orange-50', to: 'to-orange-100', darkFrom: 'dark:from-orange-900/20', darkTo: 'dark:to-orange-800/20', border: 'border-orange-200/50 dark:border-orange-700/50', bg: 'from-orange-500 to-orange-600' },
              { from: 'from-pink-50', to: 'to-pink-100', darkFrom: 'dark:from-pink-900/20', darkTo: 'dark:to-pink-800/20', border: 'border-pink-200/50 dark:border-pink-700/50', bg: 'from-pink-500 to-pink-600' }
            ];
            const colorScheme = colors[index % 3];
            
            return (
              <div 
                key={token.symbol} 
                className={`flex items-center justify-between p-4 bg-gradient-to-r ${colorScheme.from} ${colorScheme.to} ${colorScheme.darkFrom} ${colorScheme.darkTo} rounded-xl hover:shadow-md transition-all cursor-pointer border ${colorScheme.border}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${colorScheme.bg} rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-xl">{token.symbol[0]}</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">{token.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{token.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                    {(parseFloat(token.balance) / Math.pow(10, token.decimals)).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">≈ $0.00</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
