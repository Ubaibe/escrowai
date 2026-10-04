"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useWallet } from "@/contexts/WalletContext";
import { ARC_CHAIN_ID } from "@blockchain/config";

export function NetworkStatus() {
  const { chainId, chainIdLoading, isArcMainnet, connectionStatus, switchToArc, address } =
    useWallet();

  if (connectionStatus === "disconnected" || !address) {
    return null;
  }

  if (chainIdLoading) {
    return (
      <Badge variant="outline">
        <span className="animate-pulse">Detecting network…</span>
      </Badge>
    );
  }

  if (!isArcMainnet) {
    return (
      <Card
        title="Wrong network"
        description={
          chainId
            ? `Connected to chain ${chainId}. Arc Mainnet (5042) is required.`
            : "Unknown network"
        }
      >
        <Button
          variant="primary"
          size="sm"
          onClick={switchToArc}
          className="mt-2"
        >
          Switch to Arc ({ARC_CHAIN_ID})
        </Button>
      </Card>
    );
  }

  return (
    <Badge variant="default" className="bg-arc-500/10 text-arc-400">
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-arc-400" />
        Arc Mainnet
      </span>
    </Badge>
  );
}
