import { createPublicClient, createWalletClient, custom, http, type PublicClient, type WalletClient, type Address } from "viem";
import { arcMainnet, getArcConfig } from "./config";

export function createArcPublicClient(): PublicClient {
  const config = getArcConfig();
  return createPublicClient({
    chain: arcMainnet,
    transport: http(config.rpcUrl),
  }) as unknown as PublicClient;
}

export function createArcWalletClient(account: `0x${string}`): WalletClient {
  const config = getArcConfig();
  if (account === "0x0000000000000000000000000000000000000000") {
    throw new Error("Wallet client requires a non-zero account address");
  }
  return createWalletClient({
    chain: arcMainnet,
    transport: http(config.rpcUrl),
    account,
  }) as unknown as WalletClient;
}

export function createBrowserWalletClient(account: Address): WalletClient {
  if (typeof window === "undefined") {
    throw new Error("Browser wallet client can only be created in a browser environment");
  }
  if (!window.ethereum) {
    throw new Error("No Ethereum-compatible provider (window.ethereum) detected");
  }
  return createWalletClient({
    chain: arcMainnet,
    transport: custom(window.ethereum as any),
    account,
  }) as unknown as WalletClient;
}
