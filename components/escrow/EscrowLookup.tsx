"use client";

import { useState, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useWallet } from "@/contexts/WalletContext";
import {
  createEscrowContract,
  type EscrowData,
} from "@blockchain/escrow";
import { getConfiguredEscrowAddress } from "@blockchain/validation";
import { createArcPublicClient } from "@blockchain/clients";
import { EscrowDetails } from "./EscrowDetails";

export function EscrowLookup() {
  const { isArcMainnet } = useWallet();
  const [escrowIdInput, setEscrowIdInput] = useState("");
  const [result, setResult] = useState<EscrowData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!isArcMainnet) {
      setError("Connect to Arc Mainnet to look up escrows.");
      return;
    }

    const escrowAddr = getConfiguredEscrowAddress();
    if (!escrowAddr) {
      setError("EscrowAI contract address is not configured.");
      return;
    }

    let id: bigint;
    try {
      id = BigInt(escrowIdInput);
    } catch {
      setError("Invalid escrow ID.");
      return;
    }

    setLoading(true);
    try {
      const publicClient = createArcPublicClient();
      const escrow = createEscrowContract(publicClient, escrowAddr as `0x${string}`);
      const data = await escrow.read.getEscrow([id]);
      setResult({
        id: BigInt(data[0]),
        buyer: data[1] as `0x${string}`,
        seller: data[2] as `0x${string}`,
        amount: BigInt(data[3]),
        createdAt: BigInt(data[4]),
        deadline: BigInt(data[5]),
        status: Number(data[6]),
      });
    } catch (err: any) {
      if (err?.message?.includes("EscrowNotFound")) {
        setError("Escrow not found.");
      } else {
        setError(err?.message ?? "Failed to fetch escrow.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Escrow Lookup" description="Enter an escrow ID to view details">
        <form onSubmit={handleLookup} className="space-y-3">
          <Input
            label="Escrow ID"
            type="number"
            min="1"
            value={escrowIdInput}
            onChange={(e) => setEscrowIdInput(e.target.value)}
            placeholder="e.g. 1"
            disabled={!isArcMainnet || loading}
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={!isArcMainnet || loading || !escrowIdInput}
          >
            {loading ? "Loading…" : "Lookup"}
          </Button>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </Card>

      {result && <EscrowDetails data={result} />}
    </div>
  );
}
