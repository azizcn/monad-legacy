import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { CONTRACT_ADDRESS, TESTAMENT_ABI } from '@/lib/contract';

// Monad Testnet config
const monadTestnet = {
    id: 10143,
    name: 'Monad Testnet',
    network: 'monad-testnet',
    nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://testnet-rpc.monad.xyz/'] },
        public: { http: ['https://testnet-rpc.monad.xyz/'] },
    },
};

// Bot wallet (environment variable'dan alınacak)
const BOT_PRIVATE_KEY = process.env.BOT_PRIVATE_KEY as `0x${string}`;

export async function GET(request: NextRequest) {
    try {
        console.log('🤖 Cron job started: Checking testaments...');

        // Create clients
        const publicClient = createPublicClient({
            chain: monadTestnet,
            transport: http(),
        });

        const account = privateKeyToAccount(BOT_PRIVATE_KEY);
        const walletClient = createWalletClient({
            account,
            chain: monadTestnet,
            transport: http(),
        });

        console.log('💼 Bot wallet:', account.address);

        // TODO: Get list of all active testaments dari contract events atau database
        // Şimdilik test için hard-coded address kullanıyoruz
        const testamentOwners: `0x${string}`[] = [];

        let lockedCount = 0;

        for (const owner of testamentOwners) {
            try {
                // Check if testament can be locked
                const canBeLocked = await publicClient.readContract({
                    address: CONTRACT_ADDRESS,
                    abi: TESTAMENT_ABI,
                    functionName: 'canBeLocked',
                    args: [owner],
                });

                if (!canBeLocked) {
                    console.log(`⏭️ Skipping ${owner}: not ready to lock`);
                    continue;
                }

                // Get testament data
                const testament = await publicClient.readContract({
                    address: CONTRACT_ADDRESS,
                    abi: TESTAMENT_ABI,
                    functionName: 'getTestament',
                    args: [owner],
                }) as any;

                const amount = testament.amount;

                console.log(`🔒 Locking funds for ${owner}: ${amount} wei`);

                // Call lockFunds
                const hash = await walletClient.writeContract({
                    address: CONTRACT_ADDRESS,
                    abi: TESTAMENT_ABI,
                    functionName: 'lockFunds',
                    args: [owner],
                    value: amount,
                });

                console.log(`✅ Funds locked! Tx: ${hash}`);

                // Wait for confirmation
                await publicClient.waitForTransactionReceipt({ hash });
                lockedCount++;

            } catch (error: any) {
                console.error(`❌ Error locking funds for ${owner}:`, error.message);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Cron job completed. Locked ${lockedCount} testament(s).`,
            timestamp: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('❌ Cron job error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
