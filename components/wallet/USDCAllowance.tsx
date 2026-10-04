"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useWallet } from "@/contexts/WalletContext";
import { createArcPublicClient, createBrowserWalletClient } from "@blockchain/clients";
import { getUSDCAllowance, approveUSDC, usdcToString } from "@blockchain/usdc";
import { getConfiguredEscrowAddress } from "@blockchain/validation";
import { getArcConfig } from "@blockchain/config";

type AllowanceStatus = "idle" | "checking" | "approving" | "confirmed" | "failed";

export function USDCAllowance() {
  const { address, isArcMainnet } = useWallet();
  const [allowance, setAllowance] = useState<bigint | null>(null);
  const [status, setStatus] = useState<AllowanceStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!address || !isArcMainnet) {
    return null;
  }

  const config = getArcConfig();
  const escrowAddr = getConfiguredEscrowAddress();

  const handleCheckAllowance = async () => {
    if (!escrowAddr) {
      setError("EscrowAI contract address is not configured.");
      return;
    }
    setStatus("checking");
    setError(null);
    try {
      const publicClient = createArcPublicClient();
      const allowanceValue = await getUSDCAllowance(
        publicClient,
        address as `0x${string}`,
        escrowAddr as `0x${string}`,
        config.usdcAddress,
      );
      setAllowance(allowanceValue);
      setStatus("idle");
    } catch (err: any) {
      setError(err?.message ?? "Failed to check allowance.");
      setStatus("failed");
    }
  };

  const handleApprove = async () => {
    if (!escrowAddr) {
      setError("EscrowAI contract address is not configured.");
      return;
    }

    const maxAmount = BigInt("0x" + "f".repeat(64));

    setStatus("approving");
    setError(null);
    setTxHash(null);
    try {
      const walletClient = createBrowserWalletClient(address as `0x${string}`);
      const hash = await approveUSDC(
        walletClient,
        address as `0x${string}`,
        escrowAddr as `0x${string}`,
        maxAmount,
        config.usdcAddress,
      );
      setTxHash(hash);
      setStatus("confirmed");
    } catch (err: any) {
      if (err?.code === 4001) {
        setError("Approval was rejected in your wallet.");
      } else {
        setError(err?.message ?? "Failed to approve USDC.");
      }
      setStatus("failed");
    }
  };

  const renderButton = () => {
    if (status === "checking") {
      return (
        <Button variant="outline" size="sm" disabled>
          Checking…
        </Button>
      );
    }
    if (status === "approving") {
      return (
        <Button variant="primary" size="sm" disabled>
          Pending in wallet…
        </Button>
      );
    }
    if (allowance === null && status !== "failed") {
      return (
        <Button variant="primary" size="sm" onClick={handleCheckAllowance}>
          Check Allowance
        </Button>
      );
    }
    if (allowance === 0n) {
      return (
        <Button variant="primary" size="sm" onClick={handleApprove} disabled={status === "failed"}>
          Approve USDC
        </Button>
      );
    }
    return (
      <Button variant="outline" size="sm" onClick={handleCheckAllowance}>
        Refresh
      </Button>
    );
  };

  return (
    <Card title="USDC Allowance" description="Token approval for EscrowAI contract">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">EscrowAI contract</span>
          <span className="font-mono text-sm">{escrowAddr ?? "Not configured"}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Allowance</span>
          <span className="font-medium">
            {status === "checking" ? "Checking…" : allowance !== null ? `${usdcToString(allowance)} USDC` : "—"}
          </span>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {txHash && (
          <div className="text-xs">
            <span className="text-muted-foreground">Approve tx: </span>
            <a
              href={`${config.explorer}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-mono"
            >
              {txHash.slice(0, 10)}…
            </a>
          </div>
        )}

        {renderButton()}
      </div>
    </Card>
  );
}
