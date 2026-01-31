import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther, type Address } from "viem";

// V7: Deposit + Ping + Bot Auto-Claim
export const CONTRACT_ADDRESS = "0x4D4A544aB49f0A5f82cf0eDc6edc706dF2976262" as Address;
export const TOKEN_ADDRESS = "0xAb17134dB14E29c961eB2E4b8A44CC6E26abBf74" as Address; // Kept for reference but not used for testament

// ERC-20 ABI (Not used for V5 testament but kept for legacy check)
export const ERC20_ABI = [
    {
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        name: 'approve',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' }
        ],
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        outputs: [{ name: '', type: 'uint256' }]
    },
    {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }]
    }
] as const;

export const TESTAMENT_ABI = [
    {
        type: 'function',
        name: 'createTestament',
        stateMutability: 'payable',
        inputs: [
            { name: '_beneficiary', type: 'address' },
            { name: '_inactivityPeriod', type: 'uint256' }
        ],
        outputs: []
    },
    {
        type: 'function',
        name: 'ping',
        stateMutability: 'nonpayable',
        inputs: [],
        outputs: []
    },
    {
        type: 'function',
        name: 'cancel',
        stateMutability: 'nonpayable',
        inputs: [],
        outputs: []
    },
    {
        type: 'function',
        name: 'claim',
        stateMutability: 'nonpayable',
        inputs: [{ name: '_owner', type: 'address' }],
        outputs: []
    },
    {
        type: 'function',
        name: 'getTestament',
        stateMutability: 'view',
        inputs: [{ name: '_owner', type: 'address' }],
        outputs: [
            { name: 'beneficiary', type: 'address' },
            { name: 'lastActivity', type: 'uint256' },
            { name: 'inactivityPeriod', type: 'uint256' },
            { name: 'amount', type: 'uint256' },
            { name: 'isActive', type: 'bool' }
        ]
    },
    {
        type: 'function',
        name: 'canBeClaimed',
        stateMutability: 'view',
        inputs: [{ name: '_owner', type: 'address' }],
        outputs: [{ name: '', type: 'bool' }]
    },
    {
        type: 'function',
        name: 'getClaimDeadline',
        stateMutability: 'view',
        inputs: [{ name: '_owner', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }]
    },
    {
        type: 'function',
        name: 'getBeneficiaryTestaments',
        stateMutability: 'view',
        inputs: [{ name: '_beneficiary', type: 'address' }],
        outputs: [{ name: '', type: 'address[]' }]
    },
    // Events
    {
        type: "event",
        name: "TestamentCreated",
        inputs: [
            { indexed: true, name: "owner", type: "address" },
            { indexed: true, name: "beneficiary", type: "address" },
            { indexed: false, name: "amount", type: "uint256" },
            { indexed: false, name: "inactivityPeriod", type: "uint256" }
        ],
    },
    {
        type: "event",
        name: "ActivityRecorded",
        inputs: [
            { indexed: true, name: "owner", type: "address" },
            { indexed: false, name: "timestamp", type: "uint256" }
        ],
    },
    {
        type: "event",
        name: "TestamentClaimed",
        inputs: [
            { indexed: true, name: "beneficiary", type: "address" },
            { indexed: false, name: "amount", type: "uint256" },
            { indexed: false, name: "timestamp", type: "uint256" }
        ],
    },
    {
        type: "event",
        name: "TestamentCancelled",
        inputs: [
            { indexed: true, name: "owner", type: "address" },
            { indexed: false, name: "amount", type: "uint256" }
        ],
    },
] as const;

export type TestamentData = {
    beneficiary: Address;
    lastActivity: bigint;
    inactivityPeriod: bigint;
    amount: bigint;
    isActive: boolean;
};

// Hook to get testament data
export function useTestament(address: Address | undefined) {
    return useReadContract({
        address: CONTRACT_ADDRESS,
        abi: TESTAMENT_ABI,
        functionName: "getTestament",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: 15000, // Refetch every 15 seconds to avoid 429
        },
    });
}

// Hook to check if testament can be claimed
export function useCanBeClaimed(address: Address | undefined) {
    return useReadContract({
        address: CONTRACT_ADDRESS,
        abi: TESTAMENT_ABI,
        functionName: "canBeClaimed",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: 15000,
        },
    });
}

// Hook to get claim deadline
export function useClaimDeadline(address: Address | undefined) {
    return useReadContract({
        address: CONTRACT_ADDRESS,
        abi: TESTAMENT_ABI,
        functionName: "getClaimDeadline",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: 15000,
        },
    });
}

// Format timestamp
export function formatTimestamp(timestamp: bigint): string {
    return new Date(Number(timestamp) * 1000).toLocaleString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Format remaining time
export function formatRemainingTime(seconds: bigint): string {
    const totalSecs = Number(seconds);
    if (totalSecs <= 0) return "Süre Doldu";

    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (days > 0) {
        return `${days}g ${hours}s ${minutes}d`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

// Hook to get testaments where user is beneficiary
export function useBeneficiaryTestaments(address: Address | undefined) {
    return useReadContract({
        address: CONTRACT_ADDRESS,
        abi: TESTAMENT_ABI,
        functionName: "getBeneficiaryTestaments",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: 15000,
        },
    });
}

// Convert days to seconds
export function daysToSeconds(days: number): bigint {
    return BigInt(days * 24 * 60 * 60);
}
