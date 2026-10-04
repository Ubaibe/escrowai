"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useWallet } from "@/contexts/WalletContext";
import {
  validateCreateEscrowForm,
  validateAmount,
  validateDeadline,
  validateSellerAddress,
  getConfiguredEscrowAddress,
  type EscrowFormData,
  type EscrowFormErrors,
} from "@blockchain/validation";
import { createArcPublicClient, createBrowserWalletClient } from "@blockchain/clients";
import { createEscrow, getEscrowIdFromReceipt, getEscrow, type EscrowData } from "@blockchain/escrow";
import { EscrowReview } from "./EscrowReview";

export interface CreateEscrowFormProps {
  onEscrowCreated?: (escrowId: bigint, txHash: string) => void;
}

export function CreateEscrowForm({ onEscrowCreated }: CreateEscrowFormProps) {
  const { address, isArcMainnet, connectionStatus } = useWallet();
  const [formData, setFormData] = useState<EscrowFormData>({
    seller: "",
    amount: "",
    deadline: "",
  });
  const [errors, setErrors] = useState<EscrowFormErrors>({});
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdEscrowId, setCreatedEscrowId] = useState<bigint | null>(null);

  const validate = () => {
    const formErrors = validateCreateEscrowForm(formData, {
      buyerAddress: address ?? undefined,
    });

    if (!address) {
      formErrors.general = "Connect your wallet to create an escrow.";
    } else if (!isArcMainnet) {
      formErrors.general = "Switch to Arc Mainnet to create an escrow.";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setShowReview(true);
    }
  };

  const handleConfirm = async () => {
    if (!address || !isArcMainnet) return;

    const escrowAddr = getConfiguredEscrowAddress();
    if (!escrowAddr) {
      setErrors({ general: "EscrowAI contract address is not configured." });
      return;
    }

    const sellerResult = validateSellerAddress(address, formData.seller);
    if (!sellerResult.valid) {
      setErrors({ seller: sellerResult.error });
      return;
    }

    const amountResult = validateAmount(formData.amount);
    if (!amountResult.valid || !amountResult.baseUnits) {
      setErrors({ amount: amountResult.error });
      return;
    }

    const deadlineResult = validateDeadline(formData.deadline);
    if (!deadlineResult.valid || !deadlineResult.unixTimestamp) {
      setErrors({ deadline: deadlineResult.error });
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const walletClient = createBrowserWalletClient(address);
      const hash = await createEscrow(
        walletClient,
        formData.seller.trim() as `0x${string}`,
        amountResult.baseUnits,
        BigInt(deadlineResult.unixTimestamp),
        escrowAddr as `0x${string}`,
      );

      const publicClient = createArcPublicClient();

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "reverted") {
        setErrors({ general: "The escrow transaction failed." });
        return;
      }

      const escrowId = getEscrowIdFromReceipt(receipt, escrowAddr as `0x${string}`);
      if (escrowId === null) {
        setErrors({
          general:
            "Escrow transaction confirmed, but the escrow ID could not be determined from the transaction receipt.",
        });
        return;
      }

      let escrowData: EscrowData | null = null;
      try {
        escrowData = await getEscrow(publicClient, escrowId, escrowAddr as `0x${string}`);
      } catch (readErr: any) {
        console.error("Failed to read escrow back from chain:", readErr);
      }

      onEscrowCreated?.(escrowId, hash);
      setCreatedEscrowId(escrowId);
      setShowReview(false);
      setFormData({ seller: "", amount: "", deadline: "" });
      void escrowData;
    } catch (err: any) {
      if (err?.code === 4001) {
        setErrors({ general: "Transaction was rejected in your wallet." });
      } else {
        setErrors({ general: err?.message ?? "Failed to create escrow." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (showReview) {
    return (
      <EscrowReview
        formData={formData}
        buyerAddress={address ?? ""}
        isArcMainnet={isArcMainnet}
        onClose={() => setShowReview(false)}
        onConfirm={handleConfirm}
        submitting={submitting}
      />
    );
  }

  if (connectionStatus !== "connected" || !address) {
    return (
      <Card title="Create Escrow" description="Connect your wallet to begin">
        <p className="text-sm text-muted-foreground">
          You must connect your wallet and be on Arc Mainnet to create an escrow.
        </p>
      </Card>
    );
  }

  if (createdEscrowId !== null) {
    return (
      <Card title="Escrow Created" description="Your escrow has been deployed to Arc Mainnet">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Escrow ID</span>
            <span className="font-mono font-medium">{createdEscrowId.toString()}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Use the Escrow Lookup above to view details or manage this escrow.
          </p>
        </div>
      </Card>
    );
  }

  if (!isArcMainnet) {
    return (
      <Card title="Create Escrow" description="Wrong network">
        <p className="text-sm text-destructive">
          Switch to Arc Mainnet (chain ID 5042) to create an escrow.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Create Escrow" description="Enter escrow details">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Seller wallet address"
          placeholder="0x..."
          value={formData.seller}
          onChange={(e) =>
            setFormData({ ...formData, seller: e.target.value })
          }
          error={errors.seller}
        />

        <Input
          label="USDC amount"
          placeholder="e.g. 25.50"
          type="number"
          step="0.000001"
          min="0.000001"
          value={formData.amount}
          onChange={(e) =>
            setFormData({ ...formData, amount: e.target.value })
          }
          error={errors.amount}
        />

        <Input
          label="Deadline"
          type="datetime-local"
          value={formData.deadline}
          onChange={(e) =>
            setFormData({ ...formData, deadline: e.target.value })
          }
          error={errors.deadline}
        />

        {errors.general && (
          <p className="text-sm text-destructive">{errors.general}</p>
        )}

        <Button type="submit" variant="primary" className="w-full">
          Create Escrow
        </Button>
      </form>
    </Card>
  );
}
