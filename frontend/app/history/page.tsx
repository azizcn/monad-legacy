"use client";

import { useAccount } from "wagmi";
import { useTestament } from "@/lib/contract";
import { formatEther } from "viem";
import { Clock, User, Coins, Activity, CheckCircle, XCircle } from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import { formatTimestamp } from "@/lib/contract";

export default function HistoryPage() {
    const { address, isConnected } = useAccount();
    const { data: testament, isLoading } = useTestament(address);

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-dark-200 to-blood-900 p-4 flex items-center justify-center">
                <div className="card max-w-md w-full text-center animate-fadeIn">
                    <h1 className="text-3xl font-bold text-gradient mb-4 font-orbitron">
                        Vasiyet Geçmişi
                    </h1>
                    <p className="text-gray-400 mb-6">
                        Geçmişinizi görüntülemek için cüzdanınızı bağlayın.
                    </p>
                    <WalletConnect />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-dark-200 to-blood-900 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 animate-fadeIn">
                    <div>
                        <h1 className="text-4xl font-bold text-gradient font-orbitron mb-2">
                            Vasiyet Geçmişi
                        </h1>
                        <p className="text-gray-400">
                            Cüzdanınıza bağlı testament kayıtları
                        </p>
                    </div>
                    <WalletConnect />
                </div>

                {isLoading ? (
                    <div className="card animate-fadeIn">
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blood-600"></div>
                        </div>
                    </div>
                ) : testament && testament.isActive ? (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Active Testament Card */}
                        <div className="card border-2 border-blood-600">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle className="text-green-500" size={32} />
                                <div>
                                    <h2 className="text-2xl font-bold text-white font-orbitron">
                                        Aktif Vasiyet
                                    </h2>
                                    <p className="text-sm text-gray-400">Şu anda aktif testament kaydınız</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Beneficiary */}
                                <div className="bg-dark-100 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="text-blood-500" size={18} />
                                        <span className="text-sm text-gray-400">Alıcı</span>
                                    </div>
                                    <p className="text-white font-mono text-xs break-all">
                                        {testament.beneficiary.slice(0, 6)}...{testament.beneficiary.slice(-4)}
                                    </p>
                                </div>

                                {/* Amount */}
                                <div className="bg-dark-100 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Coins className="text-blood-500" size={18} />
                                        <span className="text-sm text-gray-400">Kilitli Miktar</span>
                                    </div>
                                    <p className="text-white text-xl font-bold">
                                        {formatEther(testament.amount)} MON
                                    </p>
                                </div>

                                {/* Last Activity */}
                                <div className="bg-dark-100 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity className="text-blood-500" size={18} />
                                        <span className="text-sm text-gray-400">Son Aktivite</span>
                                    </div>
                                    <p className="text-white text-sm">
                                        {formatTimestamp(testament.lastActivity)}
                                    </p>
                                </div>

                                {/* Period */}
                                <div className="bg-dark-100 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="text-blood-500" size={18} />
                                        <span className="text-sm text-gray-400">İnaktivite Süresi</span>
                                    </div>
                                    <p className="text-white text-lg font-bold">
                                        {Number(testament.inactivityPeriod) / 86400} gün
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-blood-900/20 rounded-lg border border-blood-600">
                                <p className="text-sm text-gray-300">
                                    <strong>Durum:</strong> Testament aktif ve çalışıyor. Düzenli olarak ping göndererek
                                    aktiviteyi sürdürün. Otomatik ping sistemi sayfa açıkken çalışmaktadır.
                                </p>
                            </div>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="card bg-gradient-to-br from-green-900/20 to-dark-100">
                                <h3 className="text-lg font-bold text-green-500 mb-2 flex items-center gap-2">
                                    <CheckCircle size={20} />
                                    Otomatik Ping
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Sitede olduğunuz sürece her 5 dakikada bir otomatik ping gönderiliyor.
                                </p>
                            </div>

                            <div className="card bg-gradient-to-br from-blue-900/20 to-dark-100">
                                <h3 className="text-lg font-bold text-blue-500 mb-2 flex items-center gap-2">
                                    <Coins size={20} />
                                    Esnek Sistem
                                </h3>
                                <p className="text-sm text-gray-400">
                                    İstediğiniz zaman para yatırabilir veya çekebilirsiniz.
                                </p>
                            </div>

                            <div className="card bg-gradient-to-br from-blood-900/20 to-dark-100">
                                <h3 className="text-lg font-bold text-blood-500 mb-2 flex items-center gap-2">
                                    <Clock size={20} />
                                    Güvenli Süreç
                                </h3>
                                <p className="text-sm text-gray-400">
                                    İnaktivite süresi dolmadan önce istediğiniz zaman iptal edebilirsiniz.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card text-center py-12 animate-fadeIn">
                        <XCircle className="mx-auto text-gray-600 mb-4" size={64} />
                        <h2 className="text-2xl font-bold text-gray-300 mb-2">
                            Henüz Vasiyet Kaydınız Yok
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Ana sayfaya gidip ilk testament kaydınızı oluşturun.
                        </p>
                        <a
                            href="/dashboard"
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            Vasiyet Oluştur
                        </a>
                    </div>
                )}

                {/* Back to Dashboard */}
                <div className="mt-8 text-center animate-fadeIn">
                    <a
                        href="/dashboard"
                        className="text-blood-500 hover:text-blood-400 transition-colors"
                    >
                        ← Dashboard'a Dön
                    </a>
                </div>
            </div>
        </div>
    );
}
