"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { type Address, formatEther } from "viem";
import {
    useTestament,
    useCanBeClaimed,
    CONTRACT_ADDRESS,
    TESTAMENT_ABI,
    formatTimestamp,
    formatRemainingTime,
    useBeneficiaryTestaments,
    useClaimDeadline,
} from "@/lib/contract";
import { Clock, User, Coins, Activity, Skull, ArrowDownCircle, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export function TestamentStatus() {
    const { address } = useAccount();
    const [searchAddress, setSearchAddress] = useState("");
    const targetAddress = (searchAddress && searchAddress.startsWith("0x") && searchAddress.length === 42) ? (searchAddress as Address) : address;

    // Read contracts
    const { data: testament, isLoading, refetch } = useTestament(targetAddress);
    const { data: canBeClaimed } = useCanBeClaimed(targetAddress);
    const { data: myInheritances } = useBeneficiaryTestaments(address);
    const { data: claimDeadline } = useClaimDeadline(targetAddress);

    // Client-side smooth countdown
    const [timeLeft, setTimeLeft] = useState<bigint>(0n);

    useEffect(() => {
        if (!testament) return;

        const calculateTimeLeft = () => {
            const now = BigInt(Math.floor(Date.now() / 1000));
            const deadline = testament.lastActivity + testament.inactivityPeriod;
            return deadline > now ? deadline - now : 0n;
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [testament]);

    // Write contracts
    const { data: pingHash, writeContract: ping, isPending: isPinging } = useWriteContract();
    const { data: cancelHash, writeContract: cancel, isPending: isCanceling } = useWriteContract();
    const { data: claimHash, writeContract: claim, isPending: isClaiming } = useWriteContract();

    // Transaction success handlers
    const { isSuccess: pingSuccess } = useWaitForTransactionReceipt({ hash: pingHash });
    const { isSuccess: cancelSuccess } = useWaitForTransactionReceipt({ hash: cancelHash });
    const { isSuccess: claimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

    const handlePing = () => {
        ping({
            address: CONTRACT_ADDRESS,
            abi: TESTAMENT_ABI,
            functionName: "ping",
        });
        toast.success("Ping işlemi gönderildi!");
    };

    const handleCancel = () => {
        if (confirm("Vasiyeti iptal etmek istediğinize emin misiniz?")) {
            cancel({
                address: CONTRACT_ADDRESS,
                abi: TESTAMENT_ABI,
                functionName: "cancel",
            });
            toast.success("İptal işlemi gönderildi!");
        }
    };

    const handleClaim = () => {
        if (address && confirm("Vasiyeti talep etmek istediğinize emin misiniz?")) {
            claim({
                address: CONTRACT_ADDRESS,
                abi: TESTAMENT_ABI,
                functionName: "claim",
                args: [targetAddress],
            });
            toast.success("Talep işlemi gönderildi!");
        }
    };

    // Success handler
    useEffect(() => {
        if (pingSuccess || cancelSuccess || claimSuccess) {
            toast.success("İşlem başarılı!");
            setTimeout(() => {
                refetch();
                window.location.reload();
            }, 2000);
        }
    }, [pingSuccess, cancelSuccess, claimSuccess, refetch]);

    if (isLoading) {
        return (
            <div className="card animate-fadeIn flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-blood-600" size={48} />
            </div>
        );
    }

    const isBeneficiary = testament?.beneficiary && address?.toLowerCase() === testament.beneficiary.toLowerCase();
    const progressPercentage = (testament?.inactivityPeriod || 0n) > 0n
        ? Math.max(0, Math.min(100, (Number(timeLeft) / Number(testament!.inactivityPeriod)) * 100))
        : 0;

    return (
        <div className="space-y-6">
            {/* Testament Details Card */}
            <div className="card animate-fadeIn">
                <h2 className="text-2xl font-bold text-gradient mb-6 font-orbitron flex items-center gap-2">
                    <Activity className="text-blood-600" />
                    Vasiyet Durumu
                </h2>

                {/* Search Box */}
                <div className="mb-6 bg-dark-100 p-4 rounded-lg border border-blood-900/30">
                    <label className="block text-sm text-gray-400 mb-2">Başkasının Vasiyetini Sorgula (Claim İçin)</label>
                    <input
                        type="text"
                        placeholder="Vasiyet Sahibinin Adresi (0x...)"
                        className="input-field text-sm"
                        value={searchAddress}
                        onChange={(e) => setSearchAddress(e.target.value)}
                    />
                    {searchAddress && targetAddress !== address && (
                        <div className="mt-2 text-xs text-blood-400">
                            ⚠️ Şu an <strong>{targetAddress}</strong> adresinin vasiyetini görüntülüyorsunuz.
                        </div>
                    )}
                </div>

                {/* My Inheritances List */}
                <div className="mb-6 bg-dark-100 p-4 rounded-lg border border-blood-900/30">
                    <h4 className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1">
                        <Coins size={12} /> Size Atanan Miraslar ({myInheritances?.length || 0})
                    </h4>

                    {myInheritances && myInheritances.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {myInheritances.map((addr: Address) => (
                                <button
                                    key={addr}
                                    onClick={() => setSearchAddress(addr)}
                                    className={`text-xs px-2 py-1 rounded border transition-colors font-mono ${targetAddress === addr
                                        ? "bg-blood-900 text-blood-200 border-blood-500"
                                        : "bg-dark-50 text-gray-400 border-dark-50 hover:border-gray-500"
                                        }`}
                                >
                                    {addr.slice(0, 6)}...{addr.slice(-4)}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-600 italic">
                            Henüz size bırakılan bir vasiyet bulunmuyor.
                        </p>
                    )}
                </div>

                {/* Testament Details */}
                {testament && testament.isActive ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Beneficiary */}
                            <div className="bg-dark-100 rounded-lg p-4 border border-dark-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="text-blood-500" size={20} />
                                    <span className="text-sm text-gray-400">Mirasçı</span>
                                </div>
                                <p className="text-white font-mono text-sm break-all">
                                    {testament.beneficiary}
                                </p>
                            </div>

                            {/* Amount */}
                            <div className="bg-dark-100 rounded-lg p-4 border border-dark-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <Coins className="text-blood-500" size={20} />
                                    <span className="text-sm text-gray-400">Vasiyet Miktarı</span>
                                </div>
                                <p className="text-white text-2xl font-bold">
                                    {formatEther(testament.amount)} MON
                                </p>
                            </div>

                            {/* Last Activity */}
                            <div className="bg-dark-100 rounded-lg p-4 border border-dark-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="text-blood-500" size={20} />
                                    <span className="text-sm text-gray-400">Son Aktivite</span>
                                </div>
                                <p className="text-white text-sm">
                                    {formatTimestamp(testament.lastActivity)}
                                </p>
                            </div>

                            {/* Time Remaining */}
                            <div className="bg-dark-100 rounded-lg p-4 border border-dark-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="text-blood-500" size={20} />
                                    <span className="text-sm text-gray-400">Kalan Süre</span>
                                </div>
                                <p className="text-white text-xl font-bold">
                                    {formatRemainingTime(timeLeft)}
                                </p>
                                {claimDeadline && claimDeadline > 0n && (
                                    <p className="text-xs text-red-400 mt-1">
                                        ⏳ Son Alma Tarihi: {formatTimestamp(claimDeadline)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="h-3 bg-dark-100 rounded-full overflow-hidden border border-dark-50">
                                <div
                                    className="h-full bg-gradient-to-r from-blood-600 to-blood-700 transition-all duration-1000"
                                    style={{ width: `${100 - progressPercentage}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Başlangıç</span>
                                <span>{testament.isLocked ? "Kilitli - Claim Edilebilir!" : canBeClaimed ? "Bot Kilitleyecek" : "Süre Devam Ediyor"}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Ping Button (Owner only) */}
                            {!isBeneficiary && (
                                <button
                                    onClick={handlePing}
                                    disabled={isPinging}
                                    className="btn-success flex items-center justify-center gap-2"
                                >
                                    {isPinging ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            <span>İletiliyor...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Activity size={20} />
                                            <span>Ben Hala Hayattayım</span>
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Cancel Button (Owner only) */}
                            {!isBeneficiary && (
                                <button
                                    onClick={handleCancel}
                                    disabled={isCanceling}
                                    className="btn-danger flex items-center justify-center gap-2"
                                >
                                    {isCanceling ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            <span>İptal Ediliyor...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Skull size={20} />
                                            <span>Vasiyeti İptal Et</span>
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Claim Button - Bot will handle this, show info instead */}
                            {isBeneficiary && canBeClaimed && (
                                <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-4">
                                    <h3 className="text-green-300 font-bold mb-2">✅ Claim Edilebilir</h3>
                                    <p className="text-sm text-green-200/80">
                                        Bot otomatik olarak size transfer edecek. Birkaç dakika bekleyin.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 border-t border-blood-900/30">
                        <Skull className="mx-auto text-blood-600 mb-4" size={64} />
                        <h3 className="text-xl font-bold text-gray-300 mb-2">
                            {targetAddress === address ? "Henüz Bir Vasiyet Oluşturmadınız" : "Bu Adresin Vasiyeti Bulunamadı"}
                        </h3>
                        <p className="text-gray-500">
                            {targetAddress === address
                                ? "Yukarıdaki formu kullanarak dijital miras vasiyetinizi oluşturun."
                                : "Aradığınız adres henüz bir vasiyet oluşturmamış veya iptal etmiş."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
