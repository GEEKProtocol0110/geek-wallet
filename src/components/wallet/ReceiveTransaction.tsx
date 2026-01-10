'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/wallet-store';
import QRCode from 'qrcode';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { copyToClipboard } from '@/lib/utils';

export function ReceiveTransaction() {
  const { wallet } = useWalletStore();
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    if (wallet?.address) {
      QRCode.toDataURL(wallet.address, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }).then(setQrCode);
    }
  }, [wallet?.address]);

  if (!wallet) return null;

  return (
    <Card title="Receive Tokens">
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Scan this QR code or share your address to receive GEEK tokens
          </p>
          
          {qrCode && (
            <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="Wallet QR Code" className="w-64 h-64" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Wallet Address
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={wallet.address}
              readOnly
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
            />
            <Button
              variant="outline"
              onClick={() => {
                copyToClipboard(wallet.address);
              }}
            >
              Copy
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 Only send GEEK (KRC-20) or KAS tokens to this address. Sending other tokens may result in permanent loss.
          </p>
        </div>
      </div>
    </Card>
  );
}
