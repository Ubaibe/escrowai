"use client";

import { Button } from "@/components/ui/Button";
import { useWallet } from "@/contexts/WalletContext";
import { useState } from "react";

export function WalletConnect() {
  const { address, connectionStatus, connect, disconnect, error } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } finally {
      setIsConnecting(false);
    }
  };

  if (address && connectionStatus === "connected") {
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <span className="text-muted-foreground">Connected:</span>{" "}
          <span className="font-mono font-medium">{shortAddress}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  if (connectionStatus === "error" && error) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-destructive">{error}</span>
        <Button variant="outline" size="sm" onClick={handleConnect} disabled={isConnecting}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="md"
      onClick={handleConnect}
      disabled={isConnecting || connectionStatus === "connecting"}
    >
      {isConnecting || connectionStatus === "connecting" ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
