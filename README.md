# GEEK Wallet 🚀

A **Kasware-inspired** production-ready wallet for **GEEK Protocol** (KRC-20) on Kaspa blockchain with stunning UI and powerful features.

## ✨ Kasware-Inspired Features

This wallet takes inspiration from Kasware's excellent UX and implements:

### 🎨 **Beautiful UI/UX**
- **Custom GEEK Logo** - Purple & blue gradient branding
- **Glassmorphism Effects** - Modern frosted glass design
- **Smooth Animations** - Hover effects, scale transforms, and transitions
- **Gradient Cards** - Eye-catching token and balance displays
- **Tab Navigation** - Portfolio, Send, Receive, Activity tabs
- **Dark Mode Support** - Seamless theme switching

### 💰 **Enhanced Wallet Dashboard**
- **Large Balance Display** - Prominent KAS and GEEK balances
- **Network Status Indicator** - Real-time connection status with pulse animation
- **Token List** - Beautiful gradient cards for each token
- **Quick Actions** - 3-button layout (Receive, Send, History)
- **Address Management** - Show/hide full address toggle

### 📤 **Advanced Send Transaction**
- **Visual Token Selector** - Icon-based token cards with balances
- **MAX Button** - Quick balance selection
- **Fee Display** - Transparent transaction costs
- **Error/Success Messages** - Beautiful gradient notifications
- **Smart Validation** - Real-time address and amount validation

### 📊 **Transaction History**
- **Expandable Details** - Click to see full transaction info
- **Status Badges** - Color-coded confirmation states
- **Explorer Links** - Direct links to Kaspa block explorer
- **Refresh Button** - Manual transaction updates
- **Empty State** - Friendly no-transactions message

## Features

🚀 **Built for Speed**
- Real-time balance updates (2-second refresh)
- Leverages Kaspa's 1 block/second speed
- Instant transaction feedback
- **Kaspa Testnet 10** connected by default

🔒 **Security First**
- AES-256 encryption for private keys
- Password-protected wallet access
- Secure local storage
- 24-word recovery phrase (BIP39)
- Testnet address support

💎 **Multi-Token Support**
- **KAS** - Native Kaspa token
- **GEEK** - Primary KRC-20 token
- **Any KRC-20** - Extensible token support
- Send/Receive all supported tokens
- Transaction history per token

🎨 **Modern UI**
- Kasware-inspired design language
- Clean, intuitive interface
- Real-time network status
- QR code support (coming soon)
- Fully responsive design

## Tech Stack

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Modern styling
- **Zustand** - State management
- **Kaspa Core Lib** - Blockchain integration
- **Crypto-JS** - Encryption

## Getting Started

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the wallet.

## 🎨 What Makes This Special

This wallet combines **Kasware's best features** with **GEEK Protocol** branding:

### From Kasware
- Tab-based navigation system
- Gradient card designs for tokens
- Expandable transaction details
- Network status indicators
- Clean, modern UI patterns
- MAX button for quick sends
- Real-time balance displays

### GEEK Additions
- Custom purple/blue gradient branding
- GEEK Protocol logo integration
- Testnet-first approach
- Multi-KRC-20 token support
- Enhanced dark mode
- Glassmorphism effects

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   └── page.tsx            # Main app with Kasware-style tabs
├── components/
│   ├── theme/
│   │   ├── ThemeProvider.tsx
│   │   └── ThemeToggle.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Logo.tsx       # ⭐ Custom GEEK logo
│   └── wallet/
│       ├── CreateWallet.tsx
│       ├── RestoreWallet.tsx
│       ├── UnlockWallet.tsx
│       ├── WalletDashboard.tsx   # ⭐ Kasware-inspired
│       ├── SendTransaction.tsx    # ⭐ Enhanced UI
│       ├── ReceiveTransaction.tsx
│       └── TransactionHistory.tsx # ⭐ Expandable details
├── config/
│   └── constants.ts        # Network configs, testnet default
├── lib/
│   ├── crypto.ts          # Encryption utilities
│   ├── kaspa-client.ts    # ⭐ KRC-20 support added
│   ├── kaspa-wallet.ts    # ⭐ Testnet addresses
│   ├── krc20-handler.ts   # ⭐ Multi-token support
│   ├── storage.ts         # Secure storage
│   └── utils.ts           # Helper functions
├── store/
│   └── wallet-store.ts    # ⭐ Enhanced state management
└── types/
    └── wallet.ts          # TypeScript definitions
```

## 🚀 Key Improvements

1. **Network Configuration**
   - Default to Kaspa Testnet 10
   - Easy mainnet/testnet switching
   - Real connection status display

2. **UI/UX Enhancements**
   - Kasware-style tab navigation
   - Beautiful gradient designs
   - Smooth animations and hover effects
   - Better spacing and typography

3. **Token Management**
   - Support for unlimited KRC-20 tokens
   - Visual token cards with balances
   - Easy token selection in send UI

4. **Transaction Experience**
   - MAX button for convenience
   - Better error/success messaging
   - Expandable transaction details
   - Explorer integration

## Usage

### Create New Wallet
1. Click "Create New Wallet"
2. Set a secure password
3. **IMPORTANT**: Save your 24-word recovery phrase

### Send GEEK Tokens
1. Navigate to "Send" tab
2. Select token (GEEK or KAS)
3. Enter recipient address
4. Confirm transaction

## Security

⚠️ **Never share your recovery phrase or private keys**

## License

MIT License

---

**Built for GEEK Protocol on Kaspa 🚀**
