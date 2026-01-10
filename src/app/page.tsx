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
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { DEMO_MODE } from '@/config/constants';

type View = 'dashboard' | 'send' | 'receive' | 'history';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const { wallet, unlockWallet } = useWalletStore();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setHasWallet(SecureStorage.hasWallet());
  }, []);

  const handleUnlock = async (password: string) => {
    try {
      await unlockWallet(password);
    } catch (error) {
      console.error('Failed to unlock wallet:', error);
    }
  };

  // Show loading state until mounted to avoid hydration mismatch
  if (!mounted) {
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 p-4">
        <div className="max-w-6xl mx-auto py-12">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          
          <div className="text-center mb-12">
            <Logo size="large" className="mx-auto mb-6" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
              Welcome to GEEK Wallet
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your secure gateway to GEEK Protocol on Kaspa
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Testnet Active</span>
            </div>
          </div>

          <div className="mb-8 flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Button
              variant={!showRestore ? 'primary' : 'outline'}
              onClick={() => setShowRestore(false)}
              className="flex-1 py-4 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Wallet
            </Button>
            <Button
              variant={showRestore ? 'primary' : 'outline'}
              onClick={() => setShowRestore(true)}
              className="flex-1 py-4 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Restore Existing Wallet
            </Button>
          </div>

          {showRestore ? <RestoreWallet /> : <CreateWallet />}
        </div>
      </div>
    );
  }

  // Wallet unlocked - show app
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-900 dark:to-gray-800">
      {/* Header - Kasware Style */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-purple-200/50 dark:border-gray-700 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size="small" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  GEEK Wallet
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Kaspa</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <ThemeToggle />
              {DEMO_MODE && (
                <div className="px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/50 dark:to-yellow-800/50 text-yellow-800 dark:text-yellow-200 rounded-lg text-xs font-bold shadow-md">
                  ⚠️ Demo
                </div>
              )}
              <div className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 text-green-800 dark:text-green-200 rounded-lg text-xs font-bold shadow-md flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Connected
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - Kasware Style Tabs */}
      <nav className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-2">
            {[
              { id: 'dashboard', label: 'Portfolio', icon: '💼' },
              { id: 'send', label: 'Send', icon: '📤' },
              { id: 'receive', label: 'Receive', icon: '📥' },
              { id: 'history', label: 'Activity', icon: '📊' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`px-6 py-3 border-b-3 transition-all font-medium rounded-t-lg ${
                  currentView === item.id
                    ? 'border-purple-600 bg-gradient-to-t from-purple-50 to-transparent dark:from-purple-900/20 dark:to-transparent text-purple-600 dark:text-purple-400 shadow-lg'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
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
            <div className="lg:col-span-2 space-y-6">
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
      <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-purple-200/50 dark:border-gray-700 mt-12 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p className="font-semibold">GEEK Wallet v1.0.0</p>
            <p className="mt-1">Built for <span className="font-bold text-purple-600 dark:text-purple-400">GEEK Protocol</span> on Kaspa BlockDAG</p>
            <p className="mt-2 text-xs">🚀 Fastest blockchain technology • 🔒 Secure & Open Source</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
