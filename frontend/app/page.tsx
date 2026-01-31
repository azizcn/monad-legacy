"use client";

import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";
import { Skull, Clock, Shield, Send, ArrowRight, Sparkles, Zap, Flame } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Blood drip background effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-900/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute top-40 right-1/3 w-80 h-80 bg-red-800/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-red-950/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Header */}
            <header className="border-b border-red-900/50 glass sticky top-0 z-50 bg-black/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-red-900 to-red-950 rounded-xl shadow-lg shadow-red-950/80 border border-red-800/50">
                                <Skull className="text-red-300" size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold font-orbitron bg-gradient-to-r from-red-400 via-red-500 to-red-700 bg-clip-text text-transparent">
                                    MONAD LEGACY
                                </h1>
                                <p className="text-xs text-red-800">Blockchain Testament Protocol</p>
                            </div>
                        </div>
                        <WalletConnect />
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-24 px-4">
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    {/* Floating Skull Icon */}
                    <div className="mb-10 inline-block relative">
                        <div className="absolute inset-0 bg-red-800/40 rounded-full blur-3xl animate-pulse scale-150"></div>
                        <div className="relative p-8 bg-gradient-to-br from-red-900 via-red-950 to-black rounded-3xl shadow-2xl shadow-red-950/80 border-2 border-red-800/50">
                            <Skull className="text-red-300 animate-pulse" size={80} />
                        </div>
                    </div>

                    {/* Title with Blood Theme */}
                    <h2 className="text-6xl md:text-8xl font-black mb-6 font-orbitron leading-tight">
                        <span className="bg-gradient-to-r from-red-400 via-red-600 to-red-900 bg-clip-text text-transparent block drop-shadow-2xl">
                            Dijital Mirasınızı
                        </span>
                        <span className="text-white block mt-2 flex items-center justify-center gap-4 drop-shadow-lg">
                            <Flame className="text-red-600 animate-pulse" size={60} />
                            Koruyun
                            <Sparkles className="text-red-400 animate-pulse" size={60} />
                        </span>
                    </h2>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Blockchain teknolojisi ile <span className="text-red-400 font-bold">akıllı vasiyetinizi</span> oluşturun.
                        Belirli bir süre aktif olmazsanız, varlıklarınız otomatik olarak sevdiklerinize transfer edilir.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
                        <div className="glass border border-red-800/50 rounded-xl p-4 hover:border-red-600 transition-all duration-300 bg-gradient-to-br from-red-950/30 to-black/50">
                            <div className="text-3xl font-bold text-red-400 mb-1">100%</div>
                            <div className="text-xs text-gray-400">Güvenli</div>
                        </div>
                        <div className="glass border border-red-800/50 rounded-xl p-4 hover:border-red-600 transition-all duration-300 bg-gradient-to-br from-red-950/30 to-black/50">
                            <div className="text-3xl font-bold text-red-400 mb-1">0</div>
                            <div className="text-xs text-gray-400">İnsan Müdahalesi</div>
                        </div>
                        <div className="glass border border-red-800/50 rounded-xl p-4 hover:border-red-600 transition-all duration-300 bg-gradient-to-br from-red-950/30 to-black/50">
                            <div className="text-3xl font-bold text-red-400 mb-1">24/7</div>
                            <div className="text-xs text-gray-400">Aktif</div>
                        </div>
                    </div>

                    {/* CTA Button - Single */}
                    <div className="flex justify-center">
                        <Link
                            href="/dashboard"
                            className="group btn-primary inline-flex items-center justify-center gap-3 text-lg px-10 py-5 relative overflow-hidden shadow-2xl shadow-red-950/50"
                        >
                            <Zap className="group-hover:animate-pulse" size={28} />
                            <span className="font-bold">Hemen Başlayın</span>
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4 glass border-y border-red-900/50 relative bg-gradient-to-b from-black via-red-950/10 to-black">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h3 className="text-5xl font-bold font-orbitron bg-gradient-to-r from-red-400 via-red-500 to-red-700 bg-clip-text text-transparent mb-4">
                            Nasıl Çalışır?
                        </h3>
                        <p className="text-gray-400 text-lg">3 basit adımda dijital vasiyetinizi oluşturun</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-800 to-red-600 rounded-2xl opacity-0 group-hover:opacity-40 blur-xl transition-all duration-500"></div>
                            <div className="relative card hover:scale-105 transition-all duration-300 h-full border-red-900/70">
                                <div className="mb-6 inline-block p-5 bg-gradient-to-br from-red-900/30 to-red-950/30 rounded-2xl border border-red-800/50">
                                    <Send className="text-red-400 group-hover:rotate-12 transition-transform duration-300" size={48} />
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-red-800 flex items-center justify-center text-white font-bold border border-red-700">1</div>
                                    <h4 className="text-xl font-bold font-orbitron text-red-300">Vasiyet Oluştur</h4>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Mirasçı adresini ve inaktivite süresini belirleyerek vasiyetinizi oluşturun
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-800 to-red-600 rounded-2xl opacity-0 group-hover:opacity-40 blur-xl transition-all duration-500"></div>
                            <div className="relative card hover:scale-105 transition-all duration-300 h-full border-red-900/70">
                                <div className="mb-6 inline-block p-5 bg-gradient-to-br from-red-900/30 to-red-950/30 rounded-2xl border border-red-800/50">
                                    <Clock className="text-red-400 group-hover:rotate-12 transition-transform duration-300" size={48} />
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-red-800 flex items-center justify-center text-white font-bold border border-red-700">2</div>
                                    <h4 className="text-xl font-bold font-orbitron text-red-300">Ping Gönderin</h4>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    "Ben hala hayattayım" ping'i göndererek aktifliğinizi kanıtlayın
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-800 to-red-600 rounded-2xl opacity-0 group-hover:opacity-40 blur-xl transition-all duration-500"></div>
                            <div className="relative card hover:scale-105 transition-all duration-300 h-full border-red-900/70">
                                <div className="mb-6 inline-block p-5 bg-gradient-to-br from-red-900/30 to-red-950/30 rounded-2xl border border-red-800/50">
                                    <Shield className="text-red-400 group-hover:rotate-12 transition-transform duration-300" size={48} />
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-red-800 flex items-center justify-center text-white font-bold border border-red-700">3</div>
                                    <h4 className="text-xl font-bold font-orbitron text-red-300">Güvende Kalın</h4>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Varlıklarınız blockchain üzerinde güvenle korunur
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-red-900/50 glass py-12 px-4 relative z-10 bg-black/60">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Skull className="text-red-500" size={24} />
                        <span className="font-orbitron font-bold text-xl bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">MONAD LEGACY</span>
                    </div>
                    <p className="text-gray-400 mb-2">
                        Built with ❤️ on{" "}
                        <a
                            href="https://monad.xyz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:text-red-300 font-semibold transition-colors"
                        >
                            Monad Blockchain
                        </a>
                    </p>
                    <p className="text-gray-600 text-sm">
                        ⚠️ Testnet için tasarlanmıştır • Gerçek varlıklar için kullanmayın
                    </p>
                </div>
            </footer>
        </div>
    );
}
