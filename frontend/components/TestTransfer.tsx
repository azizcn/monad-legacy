"use client";

import { useState, useEffect } from "react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, type Address } from "viem";
import toast from "react-hot-toast";
import { Loader2, Send, Zap } from "lucide-react";

export function TestTransfer() {
    const { address } = useAccount();
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("1");

    const { data: hash, sendTransaction, isPending } = useSendTransaction();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleSend = () => {
        if (!recipient || !recipient.startsWith("0x") || recipient.length !== 42) {
            toast.error("Geçersiz adres!");
            return;
        }

        try {
            sendTransaction({
                to: recipient as Address,
                value: parseEther(amount),
            });
            toast.success("Transfer başlatıldı!");
        } catch (error: any) {
            toast.error(error?.message || "Transfer başarısız!");
        }
    };

    const handleQuickSend = () => {
        setAmount("1");
        handleSend();
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success(`${amount} MON başarıyla gönderildi!`, { duration: 5000 });
            setRecipient("");
        }
    }, [isSuccess, amount]);

    return (
        <div className="card animate-fadeIn bg-dark-100 border-yellow-900/30">
            <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                🧪 Test Transfer
            </h3>
            <div className="space-y-3">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Alıcı Adres</label>
                    <input
                        type="text"
                        placeholder="0x..."
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="input-field text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Miktar (MON)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input-field text-sm"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={handleQuickSend}
                        disabled={isPending || isConfirming || !address}
                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {isPending || isConfirming ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <>
                                <Zap size={16} />
                                <span>⚡ 1 MON</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={isPending || isConfirming || !address}
                        className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {isPending || isConfirming ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <>
                                <Send size={16} />
                                <span>Gönder</span>
                            </>
                        )}
                    </button>
                </div>
                <p className="text-xs text-gray-500 italic">
                    * Hızlı test için kullanın
                </p>
            </div>
        </div>
    );
}
