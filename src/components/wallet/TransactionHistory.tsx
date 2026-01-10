'use client';

import { useEffect, useState } from 'react';
import { useWalletStore } from '@/store/wallet-store';
import { Card } from '../ui/Card';
import { formatAmount, formatAddress, formatDate } from '@/lib/utils';

export function TransactionHistory() {
  const { transactions, refreshTransactions, network } = useWalletStore();
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  if (transactions.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No transactions yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Your transaction history will appear here</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Activity</h3>
        <button 
          onClick={refreshTransactions}
          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      <div className="space-y-2">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            onClick={() => setSelectedTx(selectedTx === tx.id ? null : tx.id)}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 rounded-xl hover:shadow-md transition-all cursor-pointer border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600"
          >
            <div className="flex items-center space-x-4 flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                tx.type === 'send' 
                  ? 'bg-gradient-to-br from-red-400 to-red-600' 
                  : 'bg-gradient-to-br from-green-400 to-green-600'
              }`}>
                {tx.type === 'send' ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {tx.type === 'send' ? 'Sent' : 'Received'} {tx.token}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    tx.status === 'confirmed' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : tx.status === 'pending'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {tx.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {tx.type === 'send' ? 'To' : 'From'}: {formatAddress(tx.type === 'send' ? tx.to : tx.from)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {formatDate(tx.timestamp)} • {tx.confirmations} confirmations
                </div>
                
                {selectedTx === tx.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Transaction ID:</span>
                      <a 
                        href={`${network.explorerUrl}/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-purple-600 dark:text-purple-400 hover:underline font-mono break-all"
                      >
                        {tx.txHash.substring(0, 16)}...{tx.txHash.substring(tx.txHash.length - 16)}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-right ml-4">
                <div className={`font-bold text-lg ${
                  tx.type === 'send' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                }`}>
                  {tx.type === 'send' ? '-' : '+'}{formatAmount(tx.amount)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ≈ $0.00
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
