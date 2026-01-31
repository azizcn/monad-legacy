import { http, createConfig } from "wagmi";
import { monad } from "wagmi/chains";
import { coinbaseWallet, injected, metaMask, walletConnect } from "wagmi/connectors";
import { defineChain } from "viem";

// Define Monad Testnet chain
export const monadTestnet = defineChain({
    id: 10143,
    name: "Monad Testnet",
    nativeCurrency: {
        decimals: 18,
        name: "Monad",
        symbol: "MON",
    },
    rpcUrls: {
        default: { http: ["https://testnet-rpc.monad.xyz/"] },
        public: { http: ["https://testnet-rpc.monad.xyz/"] },
    },
    blockExplorers: {
        default: {
            name: "Monad Explorer",
            url: "https://explorer.testnet.monad.xyz",
        },
    },
    testnet: true,
});

export const config = createConfig({
    chains: [monadTestnet],
    connectors: [
        injected({
            target: "metaMask",
            shimDisconnect: true,
        }),
        metaMask({
            shimDisconnect: true,
        }),
        walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "demo",
            showQrModal: true,
        }),
        coinbaseWallet({
            appName: "Monad Testament",
            preference: "smartWalletOnly",
        }),
    ],
    transports: {
        [monadTestnet.id]: http(),
    },
});
