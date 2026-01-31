# Monad Legacy

Blockchain-based digital testament system built on Monad testnet.

## 🩸 Features

- **Smart Testament Creation**: Deposit MON and set inactivity period
- **Ping System**: Prove you're alive by pinging the contract
- **Auto-Claim Bot**: Automatically transfers funds to beneficiary when deadline passes
- **Cancel Anytime**: Withdraw your funds whenever you want
- **2% Commission**: Covers gas fees for bot operations

## 🚀 Tech Stack

- **Smart Contract**: Solidity on Monad Blockchain
- **Frontend**: Next.js + TypeScript + TailwindCSS
- **Web3**: Wagmi + Viem
- **Backend Bot**: Vercel Cron Job

## 📦 Installation

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Smart Contract
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy-v7.cjs --network monadTestnet
```

## 🔗 Contract Address

V7 Contract: `0x4D4A544aB49f0A5f82cf0eDc6edc706dF2976262`

## ⚠️ Disclaimer

This is a testnet project. Do not use with real assets.

## 📄 License

MIT
