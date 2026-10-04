module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/blockchain/src/abis.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ESCROW_AI_ABI",
    ()=>ESCROW_AI_ABI,
    "USDC_ABI",
    ()=>USDC_ABI
]);
const ESCROW_AI_ABI = [
    {
        type: "constructor",
        inputs: [
            {
                name: "usdcToken_",
                type: "address"
            }
        ],
        stateMutability: "nonpayable"
    },
    {
        name: "BuyerEqualsSeller",
        type: "error",
        inputs: []
    },
    {
        name: "DeadlineNotReached",
        type: "error",
        inputs: []
    },
    {
        name: "EscrowNotFound",
        type: "error",
        inputs: []
    },
    {
        name: "InvalidAmount",
        type: "error",
        inputs: []
    },
    {
        name: "InvalidDeadline",
        type: "error",
        inputs: []
    },
    {
        name: "InvalidSeller",
        type: "error",
        inputs: []
    },
    {
        name: "InvalidStatus",
        type: "error",
        inputs: []
    },
    {
        name: "InvalidTokenAddress",
        type: "error",
        inputs: []
    },
    {
        name: "Unauthorized",
        type: "error",
        inputs: []
    },
    {
        name: "EscrowCreated",
        type: "event",
        inputs: [
            {
                name: "escrowId",
                type: "uint256",
                indexed: true
            },
            {
                name: "buyer",
                type: "address",
                indexed: true
            },
            {
                name: "seller",
                type: "address",
                indexed: true
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false
            },
            {
                name: "deadline",
                type: "uint256",
                indexed: false
            }
        ],
        anonymous: false
    },
    {
        name: "EscrowFunded",
        type: "event",
        inputs: [
            {
                name: "escrowId",
                type: "uint256",
                indexed: true
            },
            {
                name: "buyer",
                type: "address",
                indexed: true
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false
            }
        ],
        anonymous: false
    },
    {
        name: "EscrowReleased",
        type: "event",
        inputs: [
            {
                name: "escrowId",
                type: "uint256",
                indexed: true
            },
            {
                name: "buyer",
                type: "address",
                indexed: true
            },
            {
                name: "seller",
                type: "address",
                indexed: true
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false
            }
        ],
        anonymous: false
    },
    {
        name: "EscrowRefunded",
        type: "event",
        inputs: [
            {
                name: "escrowId",
                type: "uint256",
                indexed: true
            },
            {
                name: "buyer",
                type: "address",
                indexed: true
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false
            }
        ],
        anonymous: false
    },
    {
        name: "createEscrow",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            {
                name: "seller",
                type: "address"
            },
            {
                name: "amount",
                type: "uint256"
            },
            {
                name: "deadline",
                type: "uint256"
            }
        ],
        outputs: [
            {
                name: "escrowId",
                type: "uint256"
            }
        ]
    },
    {
        name: "fundEscrow",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            {
                name: "escrowId",
                type: "uint256"
            }
        ],
        outputs: []
    },
    {
        name: "releaseEscrow",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            {
                name: "escrowId",
                type: "uint256"
            }
        ],
        outputs: []
    },
    {
        name: "refundEscrow",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            {
                name: "escrowId",
                type: "uint256"
            }
        ],
        outputs: []
    },
    {
        name: "getEscrow",
        type: "function",
        stateMutability: "view",
        inputs: [
            {
                name: "escrowId",
                type: "uint256"
            }
        ],
        outputs: [
            {
                name: "id",
                type: "uint256"
            },
            {
                name: "buyer",
                type: "address"
            },
            {
                name: "seller",
                type: "address"
            },
            {
                name: "amount",
                type: "uint256"
            },
            {
                name: "createdAt",
                type: "uint256"
            },
            {
                name: "deadline",
                type: "uint256"
            },
            {
                name: "status",
                type: "uint8"
            }
        ]
    },
    {
        name: "isRefundable",
        type: "function",
        stateMutability: "view",
        inputs: [
            {
                name: "escrowId",
                type: "uint256"
            }
        ],
        outputs: [
            {
                name: "",
                type: "bool"
            }
        ]
    },
    {
        name: "usdcToken",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address"
            }
        ]
    }
];
const USDC_ABI = [
    {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [
            {
                name: "account",
                type: "address"
            }
        ],
        outputs: [
            {
                name: "",
                type: "uint256"
            }
        ]
    },
    {
        name: "allowance",
        type: "function",
        stateMutability: "view",
        inputs: [
            {
                name: "owner",
                type: "address"
            },
            {
                name: "spender",
                type: "address"
            }
        ],
        outputs: [
            {
                name: "",
                type: "uint256"
            }
        ]
    },
    {
        name: "approve",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            {
                name: "spender",
                type: "address"
            },
            {
                name: "value",
                type: "uint256"
            }
        ],
        outputs: [
            {
                name: "",
                type: "bool"
            }
        ]
    }
];
}),
"[project]/blockchain/src/config.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ARC_CHAIN_ID",
    ()=>ARC_CHAIN_ID,
    "ARC_EXPLORER",
    ()=>ARC_EXPLORER,
    "ARC_NATIVE_CURRENCY",
    ()=>ARC_NATIVE_CURRENCY,
    "ARC_RPC_URL",
    ()=>ARC_RPC_URL,
    "DEFAULT_USDC_ADDRESS",
    ()=>DEFAULT_USDC_ADDRESS,
    "arcMainnet",
    ()=>arcMainnet,
    "getArcConfig",
    ()=>getArcConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$utils$2f$chain$2f$defineChain$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/viem/_esm/utils/chain/defineChain.js [app-ssr] (ecmascript)");
;
const ARC_CHAIN_ID = 5042;
const ARC_RPC_URL = "https://rpc.mainnet.arc.io";
const ARC_EXPLORER = "https://explorer.arc.io";
const ARC_NATIVE_CURRENCY = {
    name: "USDC",
    symbol: "USDC",
    decimals: 6
};
const DEFAULT_USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const arcMainnet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$utils$2f$chain$2f$defineChain$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defineChain"])({
    id: ARC_CHAIN_ID,
    name: "Arc Mainnet",
    nativeCurrency: ARC_NATIVE_CURRENCY,
    rpcUrls: {
        default: {
            http: [
                ARC_RPC_URL
            ]
        }
    },
    blockExplorers: {
        default: {
            name: "Arc Explorer",
            url: ARC_EXPLORER
        }
    }
});
function getArcConfig() {
    const usdcAddressRaw = process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS || process.env.ARC_USDC_ADDRESS || DEFAULT_USDC_ADDRESS;
    const usdcAddress = usdcAddressRaw;
    const escrowContractAddress = ("TURBOPACK compile-time value", "0x84141727973c3A74844a51c058f199A82F12464f") || process.env.ESCROW_CONTRACT_ADDRESS;
    return {
        chainId: ARC_CHAIN_ID,
        rpcUrl: ("TURBOPACK compile-time value", "https://arc-mainnet.g.alchemy.com/v2/alch_0r9wEu1L4Sc0IH4Gf04eZ") || process.env.ARC_RPC_URL || ARC_RPC_URL,
        explorer: ARC_EXPLORER,
        nativeCurrency: ARC_NATIVE_CURRENCY,
        usdcAddress,
        escrowContractAddress: escrowContractAddress && /^0x[0-9a-fA-F]{40}$/.test(escrowContractAddress) ? escrowContractAddress : undefined
    };
}
}),
"[project]/blockchain/src/usdc.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "USDC_DECIMALS",
    ()=>USDC_DECIMALS,
    "approveUSDC",
    ()=>approveUSDC,
    "createUSDCClient",
    ()=>createUSDCClient,
    "fromUSDCBaseUnits",
    ()=>fromUSDCBaseUnits,
    "getUSDCAllowance",
    ()=>getUSDCAllowance,
    "getUSDCBalance",
    ()=>getUSDCBalance,
    "toUSDCBaseUnits",
    ()=>toUSDCBaseUnits,
    "usdcToString",
    ()=>usdcToString
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$actions$2f$getContract$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/viem/_esm/actions/getContract.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$blockchain$2f$src$2f$abis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/blockchain/src/abis.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$blockchain$2f$src$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/blockchain/src/config.ts [app-ssr] (ecmascript)");
;
;
;
const USDC_DECIMALS = 6;
function toUSDCBaseUnits(amount) {
    return BigInt(amount) * BigInt(10 ** USDC_DECIMALS);
}
function fromUSDCBaseUnits(baseUnits) {
    if (baseUnits < 0n) {
        throw new Error("Base units cannot be negative");
    }
    return baseUnits / BigInt(10 ** USDC_DECIMALS);
}
function usdcToString(amount) {
    const integerPart = amount / BigInt(10 ** USDC_DECIMALS);
    const fractional = amount % BigInt(10 ** USDC_DECIMALS);
    if (fractional === 0n) {
        return integerPart.toString();
    }
    const fractionStr = fractional.toString().padStart(USDC_DECIMALS, "0").replace(/0+$/, "");
    return `${integerPart.toString()}.${fractionStr}`;
}
function createUSDCClient(client, tokenAddress) {
    const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$blockchain$2f$src$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getArcConfig"])();
    const address = tokenAddress ?? config.usdcAddress;
    if (!address || address === "0x0000000000000000000000000000000000000000") {
        throw new Error("USDC token address is not configured");
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$actions$2f$getContract$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getContract"])({
        address,
        abi: __TURBOPACK__imported__module__$5b$project$5d2f$blockchain$2f$src$2f$abis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USDC_ABI"],
        client: client
    });
}
async function getUSDCBalance(client, owner, tokenAddress) {
    const usdc = createUSDCClient(client, tokenAddress);
    return await usdc.read.balanceOf([
        owner
    ]);
}
async function getUSDCAllowance(client, owner, spender, tokenAddress) {
    const usdc = createUSDCClient(client, tokenAddress);
    return await usdc.read.allowance([
        owner,
        spender
    ]);
}
async function approveUSDC(client, owner, spender, amount, tokenAddress) {
    if (!client.account) {
        throw new Error("Wallet client must be connected with an account");
    }
    const usdc = createUSDCClient(client, tokenAddress);
    return usdc.write.approve([
        spender,
        amount
    ], {
        account: owner
    });
}
}),
"[project]/contexts/WalletContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WalletProvider",
    ()=>WalletProvider,
    "useWallet",
    ()=>useWallet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$blockchain$2f$src$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/blockchain/src/config.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$clients$2f$createPublicClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/viem/_esm/clients/createPublicClient.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$clients$2f$transports$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/viem/_esm/clients/transports/http.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$blockchain$2f$src$2f$usdc$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/blockchain/src/usdc.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const WalletContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function useWallet() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(WalletContext);
    if (!ctx) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return ctx;
}
function createArcPublicClient() {
    const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$blockchain$2f$src$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getArcConfig"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$clients$2f$createPublicClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPublicClient"])({
        chain: __TURBOPACK__imported__module__$5b$project$5d2f$blockchain$2f$src$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["arcMainnet"],
        transport: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$clients$2f$transports$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["http"])(config.rpcUrl)
    });
}
function WalletProvider({ children }) {
    const [address, setAddress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [chainId, setChainId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [chainIdLoading, setChainIdLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [connectionStatus, setConnectionStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("disconnected");
    const [publicClient, setPublicClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [usdcBalance, setUsdcBalance] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [usdcBalanceLoading, setUsdcBalanceLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [usdcBalanceError, setUsdcBalanceError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$blockchain$2f$src$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getArcConfig"])();
    const isArcMainnet = chainId === __TURBOPACK__imported__module__$5b$project$5d2f$blockchain$2f$src$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ARC_CHAIN_ID"];
    const refreshUSDCBalance = async ()=>{
        if (!address) {
            setUsdcBalance(null);
            return;
        }
        setUsdcBalanceLoading(true);
        setUsdcBalanceError(null);
        try {
            const client = createArcPublicClient();
            const balance = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$blockchain$2f$src$2f$usdc$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUSDCBalance"])(client, address, config.usdcAddress);
            setUsdcBalance(balance);
        } catch (err) {
            setUsdcBalanceError(err instanceof Error ? err.message : "Failed to fetch USDC balance");
        } finally{
            setUsdcBalanceLoading(false);
        }
    };
    const detectChain = async (provider)=>{
        setChainIdLoading(true);
        try {
            const chainIdHex = await provider.request({
                method: "eth_chainId"
            });
            const id = parseInt(chainIdHex, 16);
            setChainId(id);
        } catch (err) {
            console.error("Failed to detect chain:", err);
        } finally{
            setChainIdLoading(false);
        }
    };
    async function connect() {
        if ("TURBOPACK compile-time truthy", 1) {
            setError("No Ethereum-compatible wallet detected. Install MetaMask or another Web3 wallet.");
            setConnectionStatus("error");
            return;
        }
        //TURBOPACK unreachable
        ;
        const provider = undefined;
    }
    function disconnect() {
        setAddress(null);
        setChainId(null);
        setConnectionStatus("disconnected");
        setPublicClient(null);
        setUsdcBalance(null);
        setUsdcBalanceError(null);
        setError(null);
    }
    async function switchToArc() {
        if ("TURBOPACK compile-time truthy", 1) {
            throw new Error("No Ethereum-compatible wallet detected.");
        }
        const provider = window.ethereum;
        try {
            await provider.request({
                method: "wallet_switchEthereumChain",
                params: [
                    {
                        chainId: `0x${__TURBOPACK__imported__module__$5b$project$5d2f$blockchain$2f$src$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ARC_CHAIN_ID"].toString(16)}`
                    }
                ]
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                await provider.request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId: `0x${__TURBOPACK__imported__module__$5b$project$5d2f$blockchain$2f$src$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ARC_CHAIN_ID"].toString(16)}`,
                            chainName: "Arc Mainnet",
                            nativeCurrency: {
                                name: "USDC",
                                symbol: "USDC",
                                decimals: 6
                            },
                            rpcUrls: [
                                config.rpcUrl
                            ],
                            blockExplorerUrls: [
                                config.explorer
                            ]
                        }
                    ]
                });
            } else {
                throw switchError;
            }
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const provider = undefined;
        const handleAccountsChanged = undefined;
        const handleChainChanged = undefined;
    }, [
        address
    ]);
    const value = {
        address,
        chainId,
        chainIdLoading,
        isArcMainnet,
        connectionStatus,
        publicClient,
        tokenBalance: {
            usdc: usdcBalance,
            isLoading: usdcBalanceLoading,
            error: usdcBalanceError
        },
        usdcBalance,
        usdcBalanceLoading,
        usdcBalanceError,
        error,
        connect,
        disconnect,
        switchToArc,
        refreshUSDCBalance
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(WalletContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/contexts/WalletContext.tsx",
        lineNumber: 233,
        columnNumber: 10
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1a8a99b._.js.map