import type { Address, PublicClient, WalletClient } from "viem";
import { getContract } from "viem";
import { USDC_ABI } from "./abis";
import { getArcConfig } from "./config";

export const USDC_DECIMALS = 6;

export function toUSDCBaseUnits(amount: bigint | number): bigint {
  return BigInt(amount) * BigInt(10 ** USDC_DECIMALS);
}

export function fromUSDCBaseUnits(baseUnits: bigint): bigint {
  if (baseUnits < 0n) {
    throw new Error("Base units cannot be negative");
  }
  return baseUnits / BigInt(10 ** USDC_DECIMALS);
}

export function usdcToString(amount: bigint): string {
  const integerPart = amount / BigInt(10 ** USDC_DECIMALS);
  const fractional = amount % BigInt(10 ** USDC_DECIMALS);
  if (fractional === 0n) {
    return integerPart.toString();
  }
  const fractionStr = fractional
    .toString()
    .padStart(USDC_DECIMALS, "0")
    .replace(/0+$/, "");
  return `${integerPart.toString()}.${fractionStr}`;
}

export function createUSDCClient(
  client: PublicClient | WalletClient,
  tokenAddress?: Address,
) {
  const config = getArcConfig();
  const address = (tokenAddress ?? config.usdcAddress) as Address;
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error("USDC token address is not configured");
  }
  return getContract({
    address,
    abi: USDC_ABI,
    client: client as any,
  }) as any;
}

export async function getUSDCBalance(
  client: PublicClient,
  owner: Address,
  tokenAddress?: Address,
): Promise<bigint> {
  const usdc = createUSDCClient(client, tokenAddress);
  return (await usdc.read.balanceOf([owner])) as bigint;
}

export async function getUSDCAllowance(
  client: PublicClient,
  owner: Address,
  spender: Address,
  tokenAddress?: Address,
): Promise<bigint> {
  const usdc = createUSDCClient(client, tokenAddress);
  return (await usdc.read.allowance([owner, spender])) as bigint;
}

export async function approveUSDC(
  client: WalletClient,
  owner: Address,
  spender: Address,
  amount: bigint,
  tokenAddress?: Address,
) {
  if (!client.account) {
    throw new Error("Wallet client must be connected with an account");
  }
  const usdc = createUSDCClient(client, tokenAddress);
  return usdc.write.approve([spender, amount], { account: owner });
}
