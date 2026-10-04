"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useWallet } from "@/contexts/WalletContext";
import { usdcToString } from "@blockchain/usdc";

export function WalletStatus() {
  const {
    address,
    connectionStatus,
    isArcMainnet,
    chainId,
    usdcBalance,
    usdcBalanceLoading,
    usdcBalanceError,
  } = useWallet();

  if (connectionStatus === "disconnected" || !address) {
    return null;
  }

  if (connectionStatus === "connecting") {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">Connecting to your wallet…</p>
      </Card>
    );
  }

  if (connectionStatus === "error") {
    return (
      <Card>
        <p className="text-sm text-destructive">
          {usdcBalanceError ?? "Connection error occurred."}
        </p>
      </Card>
    );
  }

  const networkLabel = isArcMainnet
    ? "Arc Mainnet"
    : chainId
      ? `Chain ${chainId} (wrong network)`
      : "Unknown network";

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Network</span>
          <Badge variant={isArcMainnet ? "default" : "destructive"}>
            {networkLabel}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">USDC balance</span>
          {usdcBalanceLoading ? (
            <span className="text-sm text-muted-foreground">Loading…</span>
          ) : usdcBalanceError ? (
            <span className="text-sm text-destructive">{usdcBalanceError}</span>
          ) : usdcBalance !== null ? (
            <span className="font-medium">{usdcToString(usdcBalance)} USDC</span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>

        {!isArcMainnet && (
          <p className="text-xs text-destructive">
            Switch to Arc Mainnet to create or manage escrows.
          </p>
        )}
      </div>
    </Card>
  );
}
