"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { monadTestnet } from "@/lib/wagmi";
import { ReactNode } from "react";

const queryClient = new QueryClient();

// Configure RainbowKit with explicit wallet list
const config = getDefaultConfig({
    appName: "Monad Testament",
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "demo",
    chains: [monadTestnet],
    ssr: true,
});

export function Providers({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: "#DC2626",
                        accentColorForeground: "white",
                        borderRadius: "medium",
                        fontStack: "system",
                        overlayBlur: "small",
                    })}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
