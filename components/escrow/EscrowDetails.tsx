"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { usdcToString } from "@blockchain/usdc";
import { statusToString, type EscrowData } from "@blockchain/escrow";
import { ARC_EXPLORER } from "@blockchain/config";
import { shortAddress } from "@/lib/utils";

export interface EscrowDetailsProps {
  data: EscrowData;
}

export function EscrowDetails({ data }: EscrowDetailsProps) {
  const status = statusToString(data.status);
  const statusVariant: "default" | "secondary" | "outline" | "destructive" =
    status === "RELEASED" || status === "REFUNDED" ? "secondary" : "default";

  const createdAtDate = new Date(Number(data.createdAt) * 1000);
  const deadlineDate = new Date(Number(data.deadline) * 1000);

  const isExpired = Number(data.deadline) <= Math.floor(Date.now() / 1000);
  const statusBadgeText = isExpired && status === "FUNDED" ? "FUNDED (expired)" : status;

  return (
    <Card title="Escrow Details">
      <div className="grid grid-cols-[auto_1fr] gap-2 text-sm">
        <span className="text-muted-foreground">Escrow ID</span>
        <span className="font-mono">{data.id.toString()}</span>

        <span className="text-muted-foreground">Buyer</span>
        <span className="font-mono">{shortAddress(data.buyer)}</span>

        <span className="text-muted-foreground">Seller</span>
        <span className="font-mono">{shortAddress(data.seller)}</span>

        <span className="text-muted-foreground">Amount</span>
        <span>{usdcToString(data.amount)} USDC</span>

        <span className="text-muted-foreground">Created</span>
        <span>{createdAtDate.toLocaleString()}</span>

        <span className="text-muted-foreground">Deadline</span>
        <span>{deadlineDate.toLocaleString()}</span>

        <span className="text-muted-foreground">Status</span>
        <Badge variant={statusVariant} size="sm">
          {statusBadgeText}
        </Badge>

        <span className="text-muted-foreground">Explorer</span>
        <span className="text-xs">
          Escrow: <a href={`${ARC_EXPLORER}/address/${data.buyer}`} target="_blank" rel="noopener noreferrer" className="underline">Arc Explorer</a>
        </span>
      </div>
    </Card>
  );
}
