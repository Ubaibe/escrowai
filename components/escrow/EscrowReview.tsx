"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toUSDCBaseUnits, USDC_DECIMALS } from "@blockchain/usdc";
import { type EscrowFormData } from "@blockchain/validation";

export interface EscrowReviewProps {
  formData: EscrowFormData;
  buyerAddress: string;
  isArcMainnet: boolean;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
}

export function EscrowReview({
  formData,
  buyerAddress,
  isArcMainnet,
  onClose,
  onConfirm,
  submitting,
}: EscrowReviewProps) {
  const sellerDisplay = formData.seller
    ? `${formData.seller.slice(0, 6)}...${formData.seller.slice(-4)}`
    : "";

  const buyerDisplay = buyerAddress
    ? `${buyerAddress.slice(0, 6)}...${buyerAddress.slice(-4)}`
    : "";

  const amountBaseUnits = (() => {
    try {
      const [whole, fraction] = formData.amount.split(".");
      const wholePart = BigInt(whole ?? "0");
      const fractionPart = fraction
        ? BigInt(fraction.padEnd(USDC_DECIMALS, "0").slice(0, USDC_DECIMALS))
        : 0n;
      return toUSDCBaseUnits(wholePart) + fractionPart;
    } catch {
      return null;
    }
  })();

  const deadlineDate = formData.deadline
    ? new Date(formData.deadline)
    : null;

  const networkColor = isArcMainnet ? "text-arc-400" : "text-destructive";
  const networkLabel = isArcMainnet
    ? "Arc Mainnet (5042)"
    : "Wrong network — switch to Arc Mainnet";

  return (
    <div className="space-y-4">
      <Badge variant="outline" className="mb-2">
        Review Escrow
      </Badge>

      <div className="space-y-3">
        <div>
          <span className="text-sm text-muted-foreground">Buyer</span>
          <span className="ml-2 font-mono text-sm">{buyerDisplay}</span>
        </div>

        <div>
          <span className="text-sm text-muted-foreground">Seller</span>
          <span className="ml-2 font-mono text-sm">{sellerDisplay}</span>
        </div>

        <div>
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="ml-2 font-medium">
            {formData.amount} USDC
            {amountBaseUnits !== null && (
              <span className="ml-2 text-muted-foreground">
                ({amountBaseUnits.toString()} base units)
              </span>
            )}
          </span>
        </div>

        <div>
          <span className="text-sm text-muted-foreground">Deadline</span>
          <span className="ml-2 text-sm">
            {deadlineDate ? deadlineDate.toLocaleString() : "—"}
          </span>
        </div>

        <div>
          <span className="text-sm text-muted-foreground">Network</span>
          <span className={`ml-2 font-medium ${networkColor}`}>{networkLabel}</span>
        </div>

        <div>
          <span className="text-sm text-muted-foreground">Contract</span>
          <span className="ml-2 text-sm">EscrowAI</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose} disabled={submitting}>
          Back
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={submitting}>
          {submitting ? "Confirm in wallet…" : "Confirm & Create Escrow"}
        </Button>
      </div>
    </div>
  );
}
