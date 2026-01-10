'use client';

import { useEffect } from 'react';
import { useWalletStore } from '@/store/wallet-store';
import { Card } from '../ui/Card';
import { formatAmount, formatAddress, formatDate } from '@/lib/utils';

export function TransactionHistory() {
  const { transactions, refreshTransactions } = useWalletStore();

  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  if (transactions.length === 0) {
    return (
      <Card title="Transaction History">
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No transactions yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Transaction History">
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                tx.type === 'send' ? 'bg-red-100' : 'bg-green-100'
              }`}>
                {tx.type === 'send' ? (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
              </div>
              
              <div>
                <div className="font-semibold text-gray-900">
                  {tx.type === 'send' ? 'Sent' : 'Received'} {tx.token}
                </div>
                <div className="text-sm text-gray-600">
                  {tx.type === 'send' ? 'To' : 'From'}: {formatAddress(tx.type === 'send' ? tx.to : tx.from)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(tx.timestamp)}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className={`font-semibold ${
                tx.type === 'send' ? 'text-red-600' : 'text-green-600'
              }`}>
                {tx.type === 'send' ? '-' : '+'}{formatAmount(tx.amount)}
              </div>
              <div className="text-sm text-gray-600">
                <span className={`inline-block px-2 py-1 rounded text-xs ${
                  tx.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800'
                    : tx.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {tx.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
