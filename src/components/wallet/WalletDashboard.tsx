'use client';

import { useEffect } from 'react';
import { useWalletStore } from '@/store/wallet-store';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatAmount, formatAddress, copyToClipboard } from '@/lib/utils';
import { DEMO_MODE } from '@/config/constants';

export function WalletDashboard() {
  const { wallet, refreshBalance, lockWallet } = useWalletStore();

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  if (!wallet) return null;

  return (
    <div className="space-y-6">
      {/* Demo Mode Warning */}
      {DEMO_MODE && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Demo Mode Active:</strong> You're seeing simulated balances and transactions. 
                To connect to real Kaspa network, set <code className="bg-yellow-100 px-1 rounded">DEMO_MODE = false</code> in <code className="bg-yellow-100 px-1 rounded">src/config/constants.ts</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium opacity-90">Total Balance</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={lockWallet}
              className="text-white border-white hover:bg-white/10"
            >
              Lock Wallet
            </Button>
          </div>
          
          <div>
            <div className="text-4xl font-bold mb-2">
              {formatAmount(wallet.balance)} KAS
            </div>
            <div className="text-lg opacity-90">
              {formatAmount(wallet.geekBalance)} GEEK
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-75">Address</span>
              <button
                onClick={() => copyToClipboard(wallet.address)}
                className="text-sm font-mono hover:opacity-75 transition-opacity"
              >
                {formatAddress(wallet.address)}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="hover:shadow-xl transition-shadow cursor-pointer">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Receive</h3>
            <p className="text-sm text-gray-600 mt-1">Get GEEK tokens</p>
          </div>
        </Card>

        <Card className="hover:shadow-xl transition-shadow cursor-pointer">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Send</h3>
            <p className="text-sm text-gray-600 mt-1">Transfer tokens</p>
          </div>
        </Card>
      </div>

      {/* Token List */}
      <Card title="Your Tokens">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">K</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Kaspa</div>
                <div className="text-sm text-gray-600">KAS</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">{formatAmount(wallet.balance)}</div>
              <div className="text-sm text-gray-600">$0.00</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">GEEK Protocol</div>
                <div className="text-sm text-gray-600">GEEK</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">{formatAmount(wallet.geekBalance)}</div>
              <div className="text-sm text-gray-600">$0.00</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
