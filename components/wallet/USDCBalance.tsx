"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useWallet } from "@/contexts/WalletContext";
import { usdcToString } from "@blockchain/usdc";

export function USDCBalance() {
  const { address, usdcBalance, usdcBalanceLoading, usdcBalanceError, refreshUSDCBalance, isArcMainnet } =
    useWallet();

  if (!address || !isArcMainnet) {
    return null;
  }

  return (
    <Card title="USDC Balance" description="Arc Mainnet USDC">
      <div className="flex items-center justify-between">
        <div>
          {usdcBalanceLoading ? (
            <p className="text-2xl font-bold text-muted-foreground">Loading…</p>
          ) : usdcBalanceError ? (
            <p className="text-sm text-destructive">{usdcBalanceError}</p>
          ) : usdcBalance !== null ? (
            <>
              <p className="text-2xl font-bold">{usdcToString(usdcBalance)}</p>
              <p className="text-sm text-muted-foreground">USDC</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No balance data</p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={refreshUSDCBalance} disabled={usdcBalanceLoading}>
          Refresh
        </Button>
      </div>
    </Card>
  );
}
