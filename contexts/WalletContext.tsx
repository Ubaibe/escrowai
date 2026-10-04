"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getArcConfig, ARC_CHAIN_ID, arcMainnet } from "@blockchain/config";
import { createPublicClient, http, type PublicClient, type Address } from "viem";
import { getUSDCBalance } from "@blockchain/usdc";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "wrong_network" | "error";

export interface EscrowTokenBalance {
  usdc: bigint | null;
  isLoading: boolean;
  error: string | null;
}

export interface WalletState {
  address: Address | null;
  chainId: number | null;
  chainIdLoading: boolean;
  isArcMainnet: boolean;
  connectionStatus: ConnectionStatus;
  publicClient: PublicClient | null;
  tokenBalance: EscrowTokenBalance;
  usdcBalance: bigint | null;
  usdcBalanceLoading: boolean;
  usdcBalanceError: string | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToArc: () => Promise<void>;
  refreshUSDCBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletState | undefined>(undefined);

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return ctx;
}

function createArcPublicClient(): PublicClient {
  const config = getArcConfig();
  return createPublicClient({
    chain: arcMainnet,
    transport: http(config.rpcUrl),
  }) as unknown as PublicClient;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<Address | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [chainIdLoading, setChainIdLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<bigint | null>(null);
  const [usdcBalanceLoading, setUsdcBalanceLoading] = useState(false);
  const [usdcBalanceError, setUsdcBalanceError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const config = getArcConfig();
  const isArcMainnet = chainId === ARC_CHAIN_ID;

  const refreshUSDCBalance = async () => {
    if (!address) {
      setUsdcBalance(null);
      return;
    }
    setUsdcBalanceLoading(true);
    setUsdcBalanceError(null);
    try {
      const client = createArcPublicClient();
      const balance = await getUSDCBalance(client, address, config.usdcAddress);
      setUsdcBalance(balance);
    } catch (err) {
      setUsdcBalanceError(err instanceof Error ? err.message : "Failed to fetch USDC balance");
    } finally {
      setUsdcBalanceLoading(false);
    }
  };

  const detectChain = async (provider: EthereumProvider) => {
    setChainIdLoading(true);
    try {
      const chainIdHex = await provider.request({ method: "eth_chainId" });
      const id = parseInt(chainIdHex as string, 16);
      setChainId(id);
    } catch (err) {
      console.error("Failed to detect chain:", err);
    } finally {
      setChainIdLoading(false);
    }
  };

  async function connect() {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("No Ethereum-compatible wallet detected. Install MetaMask or another Web3 wallet.");
      setConnectionStatus("error");
      return;
    }

    const provider = window.ethereum as EthereumProvider;
    setConnectionStatus("connecting");
    setError(null);

    try {
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts.length === 0) {
        setError("No accounts returned from wallet.");
        setConnectionStatus("error");
        return;
      }

      const signerAddress = accounts[0] as Address;
      setAddress(signerAddress);
      setPublicClient(createArcPublicClient());
      await detectChain(provider);
      setConnectionStatus("connected");
      await refreshUSDCBalance();
    } catch (err: any) {
      if (err.code === 4001) {
        setError("Wallet connection was rejected.");
      } else {
        setError(err.message ?? "Failed to connect wallet.");
      }
      setConnectionStatus("error");
    }
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
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("No Ethereum-compatible wallet detected.");
    }

    const provider = window.ethereum as EthereumProvider;

    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${ARC_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${ARC_CHAIN_ID.toString(16)}`,
              chainName: "Arc Mainnet",
              nativeCurrency: {
                name: "USDC",
                symbol: "USDC",
                decimals: 6,
              },
              rpcUrls: [config.rpcUrl],
              blockExplorerUrls: [config.explorer],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const provider = window.ethereum as EthereumProvider;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0] as Address);
        refreshUSDCBalance();
      }
    };

    const handleChainChanged = () => {
      if (address) {
        refreshUSDCBalance();
      }
      detectChain(provider);
    };

    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [address]);

  const value: WalletState = {
    address,
    chainId,
    chainIdLoading,
    isArcMainnet,
    connectionStatus,
    publicClient,
    tokenBalance: {
      usdc: usdcBalance,
      isLoading: usdcBalanceLoading,
      error: usdcBalanceError,
    },
    usdcBalance,
    usdcBalanceLoading,
    usdcBalanceError,
    error,
    connect,
    disconnect,
    switchToArc,
    refreshUSDCBalance,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
