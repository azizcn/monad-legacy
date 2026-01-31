"use client";

import { WalletConnect } from "@/components/WalletConnect";
import { TestamentForm } from "@/components/TestamentForm";
import { TestamentStatus } from "@/components/TestamentStatus";
import { TestTransfer } from "@/components/TestTransfer";
import { Skull } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";

export default function DashboardPage() {
    const { isConnected } = useAccount();

    return (
        <div className="min-h-screen bg-dark-red-gradient">
            {/* Header */}
            <header className="border-b border-blood-600 bg-black bg-opacity-50 backdrop-blur-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
                            <Skull className="text-blood-600" size={32} />
                            <h1 className="text-2xl font-bold font-orbitron text-gradient">
                                MONAD TESTAMENT
                            </h1>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/history"
                                className="text-gray-300 hover:text-blood-500 transition-colors font-medium"
                            >
                                📜 Geçmiş
                            </Link>
                            <WalletConnect />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {!isConnected ? (
                    <div className="text-center py-20">
                        <Skull className="mx-auto text-blood-600 mb-6 animate-glow" size={96} />
                        <h2 className="text-3xl font-bold mb-4 text-gradient font-orbitron">
                            Cüzdanınızı Bağlayın
                        </h2>
                        <p className="text-gray-400 mb-8">
                            Devam etmek için lütfen MetaMask veya başka bir cüzdanı bağlayın.
                        </p>
                        <div className="flex justify-center">
                            <WalletConnect />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Testament Form + Test Transfer */}
                        <div className="space-y-6">
                            <TestamentForm />
                            <TestTransfer />
                        </div>

                        {/* Right Column - Testament Status */}
                        <div>
                            <TestamentStatus />
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-blood-600 bg-black mt-20 py-8 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-gray-500">
                        Kontrat Adresi:{" "}
                        <a
                            href="https://explorer.testnet.monad.xyz/address/0x8baf039aC2129BEA081ACEBE44546FB5706F12b8"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blood-500 hover:text-blood-400 font-mono text-sm"
                        >
                            0x8baf...12b8
                        </a>
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                        Testnet için tasarlanmıştır. Gerçek varlıklar için kullanmayın.
                    </p>
                </div>
            </footer>
        </div>
    );
}
