import { defineChain } from "viem";

export const ARC_CHAIN_ID = 5042;
export const ARC_RPC_URL = "https://rpc.mainnet.arc.io";
export const ARC_EXPLORER = "https://explorer.arc.io";

export const ARC_NATIVE_CURRENCY = {
  name: "USDC",
  symbol: "USDC",
  decimals: 6,
} as const;

export const DEFAULT_USDC_ADDRESS =
  "0x3600000000000000000000000000000000000000" as `0x${string}`;

export const arcMainnet = defineChain({
  id: ARC_CHAIN_ID,
  name: "Arc Mainnet",
  nativeCurrency: ARC_NATIVE_CURRENCY,
  rpcUrls: {
    default: { http: [ARC_RPC_URL] },
  },
  blockExplorers: {
    default: { name: "Arc Explorer", url: ARC_EXPLORER },
  },
});

export interface ArcConfig {
  chainId: number;
  rpcUrl: string;
  explorer: string;
  nativeCurrency: typeof ARC_NATIVE_CURRENCY;
  usdcAddress: `0x${string}`;
  escrowContractAddress?: `0x${string}`;
}

export function getArcConfig(): ArcConfig {
  const usdcAddressRaw =
    process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS ||
    process.env.ARC_USDC_ADDRESS ||
    DEFAULT_USDC_ADDRESS;
  const usdcAddress = usdcAddressRaw as `0x${string}`;

  const escrowContractAddress = (
    process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS ||
    process.env.ESCROW_CONTRACT_ADDRESS
  ) as `0x${string}` | undefined;

  return {
    chainId: ARC_CHAIN_ID,
    rpcUrl: process.env.NEXT_PUBLIC_ARC_RPC_URL || process.env.ARC_RPC_URL || ARC_RPC_URL,
    explorer: ARC_EXPLORER,
    nativeCurrency: ARC_NATIVE_CURRENCY,
    usdcAddress,
    escrowContractAddress:
      escrowContractAddress && /^0x[0-9a-fA-F]{40}$/.test(escrowContractAddress)
        ? escrowContractAddress
        : undefined,
  };
}
