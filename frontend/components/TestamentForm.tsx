"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { type Address, isAddress, parseEther } from "viem";
import { CONTRACT_ADDRESS, TESTAMENT_ABI, daysToSeconds } from "@/lib/contract";
import toast from "react-hot-toast";
import { Loader2, Sparkles, Clock, Shield } from "lucide-react";

export function TestamentForm() {
    const { address } = useAccount();
    const [beneficiary, setBeneficiary] = useState("");
    const [amount, setAmount] = useState("");
    const [days, setDays] = useState(60);
    const [testMode, setTestMode] = useState(false);

    const { data: balance } = useBalance({ address });
    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const amountNum = parseFloat(amount) || 0;
    const commission = amountNum * 0.02;
    const netAmount = amountNum - commission;
    const balanceInMON = balance ? Number(balance.value) / 1e18 : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAddress(beneficiary)) {
            toast.error("Geçersiz alıcı adresi!");
            return;
        }

        if (beneficiary.toLowerCase() === address?.toLowerCase()) {
            toast.error("Alıcı adresiniz kendiniz olamaz!");
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Geçerli bir miktar girin!");
            return;
        }

        if (!balance || balance.value === 0n) {
            toast.error("Cüzdanınızda MON bulunmuyor!");
            return;
        }

        if (!testMode && days < 1) {
            toast.error("En az 1 gün belirtmelisiniz!");
            return;
        }

        try {
            const inactivityPeriod = testMode ? BigInt(5) : daysToSeconds(days);

            writeContract({
                address: CONTRACT_ADDRESS,
                abi: TESTAMENT_ABI,
                functionName: "createTestament",
                args: [beneficiary as Address, inactivityPeriod],
                value: parseEther(amount),
                gas: 500000n,
            });

            toast.success("İşlem gönderildi, onay bekleniyor...");
        } catch (error: any) {
            console.error("Testament creation error:", error);
            toast.error(error?.message || "İşlem başarısız!");
        }
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success("Vasiyet başarıyla oluşturuldu!", { duration: 5000 });
            setBeneficiary("");
            setAmount("");
            setDays(60);
            setTestMode(false);
            setTimeout(() => window.location.reload(), 2000);
        }
    }, [isSuccess]);

    return (
        <div className="card border-2 border-red-900/70 backdrop-blur-xl shadow-2xl shadow-red-950/50">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-red-900 to-red-950 rounded-xl shadow-lg shadow-red-950/80 border border-red-800/50">
                        <Sparkles className="text-red-300" size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold font-orbitron bg-gradient-to-r from-red-300 via-red-500 to-red-700 bg-clip-text text-transparent">
                            Dijital Vasiyet
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">Geleceğinizi güvence altına alın</p>
                    </div>
                </div>
                <a
                    href="https://testnet.monad.xyz/faucet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass border border-red-700/50 hover:border-red-600 px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-900/50 flex items-center gap-2"
                >
                    <span className="text-red-400 hover:text-red-300 text-sm font-medium">Testnet Faucet</span>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </a>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Balance Card */}
                <div className="glass border border-red-800/50 rounded-xl p-5 bg-gradient-to-br from-red-950/30 to-black/30">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Shield className="text-red-400" size={20} />
                            Bakiye Durumu
                        </h3>
                        <span className="text-2xl font-mono font-bold text-red-400">
                            {balanceInMON.toFixed(4)} MON
                        </span>
                    </div>

                    {amountNum > 0 && (
                        <div className="space-y-3 mt-4 border-t border-red-900/30 pt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Vasiyet Miktarı</span>
                                <span className="text-white font-mono">{amountNum.toFixed(4)} MON</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Protokol Komisyon (2%)</span>
                                <span className="text-yellow-400 font-mono">-{commission.toFixed(4)} MON</span>
                            </div>
                            <div className="h-px bg-gradient-to-r from-transparent via-red-700/50 to-transparent"></div>
                            <div className="flex justify-between">
                                <span className="text-gray-300 font-bold">Kontrata Gidecek</span>
                                <span className="text-red-400 font-mono font-bold text-lg">{netAmount.toFixed(4)} MON</span>
                            </div>
                        </div>
                    )}
                    <p className="text-xs text-blue-400/80 mt-3 flex items-center gap-1 bg-blue-950/30 px-3 py-2 rounded-lg border border-blue-900/30">
                        <span className="text-blue-300">ℹ️</span>
                        Komisyon bot işlemlerinin gas fee'sini karşılar
                    </p>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        Vasiyet Miktarı (MON)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Örn: 10.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input-field pr-16 font-mono text-lg relative z-10"
                            required
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold pointer-events-none">
                            MON
                        </div>
                    </div>
                </div>

                {/* Beneficiary Input */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        Mirasçı Cüzdan Adresi
                    </label>
                    <input
                        type="text"
                        placeholder="0x..."
                        value={beneficiary}
                        onChange={(e) => setBeneficiary(e.target.value)}
                        className="input-field font-mono relative z-10"
                        required
                    />
                </div>

                {/* Days Input */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                        <Clock className="text-red-400" size={16} />
                        İnaktivite Süresi (Gün)
                    </label>
                    <input
                        type="number"
                        min="1"
                        placeholder="60"
                        value={days}
                        onChange={(e) => setDays(parseInt(e.target.value))}
                        className="input-field relative z-10"
                        disabled={testMode}
                        required
                    />
                    <p className="text-xs text-gray-500 italic">
                        Bu süre boyunca ping atmazsanız, mirasçı vasiyeti talep edebilir
                    </p>
                </div>

                {/* Test Mode Toggle */}
                <div className="glass border border-yellow-700/40 rounded-xl p-4 bg-yellow-950/20">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={testMode}
                                onChange={(e) => setTestMode(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-dark-100 peer-checked:bg-gradient-to-r peer-checked:from-yellow-600 peer-checked:to-yellow-500 rounded-full peer transition-all duration-300 shadow-inner"></div>
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-5 shadow-lg"></div>
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-yellow-200 flex items-center gap-2">
                                🧪 Test Modu
                                {testMode && <span className="text-xs bg-yellow-500/20 px-2 py-0.5 rounded-full">Aktif</span>}
                            </span>
                            <p className="text-xs text-yellow-300/70 mt-0.5">5 saniye inaktivite süresi</p>
                        </div>
                    </label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isPending || isConfirming}
                    className="w-full btn-primary flex items-center justify-center gap-3 py-4 text-lg font-bold relative z-10"
                >
                    {isPending || isConfirming ? (
                        <>
                            <Loader2 className="animate-spin" size={24} />
                            <span>{isPending ? "Onay Bekleniyor..." : "İşleniyor..."}</span>
                        </>
                    ) : (
                        <>
                            <Sparkles size={24} />
                            <span>Vasiyet Oluştur</span>
                        </>
                    )}
                </button>

                {/* Info Box */}
                <div className="glass border border-blue-700/30 rounded-lg p-4 text-center bg-blue-950/20">
                    <p className="text-xs text-gray-400">
                        ⚠️ Para kontrata transfer edilecek • İstediğiniz zaman{" "}
                        <span className="text-red-400 font-semibold">iptal edip geri alabilirsiniz</span>
                    </p>
                </div>
            </form>
        </div>
    );
}
