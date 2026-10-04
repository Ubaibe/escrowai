import type { PublicClient } from "viem";
import { getArcConfig, ARC_CHAIN_ID, DEFAULT_USDC_ADDRESS } from "./config";

export function isArcMainnet(chainId: number | bigint): boolean {
  return BigInt(chainId) === BigInt(ARC_CHAIN_ID);
}

export function isUSDCAddress(address: string): boolean {
  const config = getArcConfig();
  return address.toLowerCase() === config.usdcAddress.toLowerCase();
}

export function isDefaultUSDCAddress(address: string): boolean {
  return address.toLowerCase() === DEFAULT_USDC_ADDRESS.toLowerCase();
}

export function hasEscrowContract(): boolean {
  const config = getArcConfig();
  return config.escrowContractAddress !== undefined;
}

export async function getConnectedChain(publicClient: PublicClient): Promise<bigint | null> {
  try {
    const chain = await publicClient.getChainId();
    return BigInt(chain);
  } catch {
    return null;
  }
}

export async function isOnArcMainnet(publicClient: PublicClient): Promise<boolean> {
  const chainId = await getConnectedChain(publicClient);
  if (chainId === null) return false;
  return isArcMainnet(chainId);
}
