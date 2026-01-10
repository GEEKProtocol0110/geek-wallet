'use client';

import { useState, useEffect } from 'react';
import { SecureStorage } from '@/lib/storage';
import { useWalletStore } from '@/store/wallet-store';
import { CreateWallet } from '@/components/wallet/CreateWallet';
import { RestoreWallet } from '@/components/wallet/RestoreWallet';
import { UnlockWallet } from '@/components/wallet/UnlockWallet';
import { WalletDashboard } from '@/components/wallet/WalletDashboard';
import { SendTransaction } from '@/components/wallet/SendTransaction';
import { ReceiveTransaction } from '@/components/wallet/ReceiveTransaction';
import { TransactionHistory } from '@/components/wallet/TransactionHistory';
import { Button } from '@/components/ui/Button';
import { DEMO_MODE } from '@/config/constants';

type View = 'dashboard' | 'send' | 'receive' | 'history';

export default function Home() {
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [showRestore, setShowRestore] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const { wallet, unlockWallet } = useWalletStore();

  useEffect(() => {
    setHasWallet(SecureStorage.hasWallet());
  }, []);

  const handleUnlock = async (password: string) => {
    try {
      await unlockWallet(password);
    } catch (error) {
      console.error('Failed to unlock wallet:', error);
    }
  };

  // Loading state
  if (hasWallet === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Wallet exists but locked
  if (hasWallet && !wallet) {
    return <UnlockWallet onUnlock={handleUnlock} />;
  }

  // No wallet - show setup
  if (!hasWallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-6xl mx-auto py-12">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-white">G</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to GEEK Wallet
            </h1>
            <p className="text-lg text-gray-600">
              Your secure gateway to GEEK Protocol on Kaspa
            </p>
          </div>

          <div className="mb-8 flex justify-center space-x-4">
            <Button
              variant={!showRestore ? 'primary' : 'outline'}
              onClick={() => setShowRestore(false)}
            >
              Create New Wallet
            </Button>
            <Button
              variant={showRestore ? 'primary' : 'outline'}
              onClick={() => setShowRestore(true)}
            >
              Restore Wallet
            </Button>
          </div>

          {showRestore ? <RestoreWallet /> : <CreateWallet />}
        </div>
      </div>
    );
  }

  // Wallet unlocked - show app
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">G</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">GEEK Wallet</h1>
            </div>

            <div className="flex items-center space-x-2">
              {DEMO_MODE && (
                <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  Demo Mode
                </div>
              )}
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Connected
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'send', label: 'Send' },
              { id: 'receive', label: 'Receive' },
              { id: 'history', label: 'History' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`px-4 py-3 border-b-2 transition-colors ${
                  currentView === item.id
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'dashboard' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <WalletDashboard />
            </div>
            <div className="space-y-6">
              <TransactionHistory />
            </div>
          </div>
        )}
        
        {currentView === 'send' && (
          <div className="max-w-2xl mx-auto">
            <SendTransaction />
          </div>
        )}
        
        {currentView === 'receive' && (
          <div className="max-w-2xl mx-auto">
            <ReceiveTransaction />
          </div>
        )}
        
        {currentView === 'history' && (
          <div className="max-w-4xl mx-auto">
            <TransactionHistory />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>GEEK Wallet v1.0.0 - Built for GEEK Protocol on Kaspa</p>
            <p className="mt-1">🚀 Leveraging Kaspa's BlockDAG speed</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
