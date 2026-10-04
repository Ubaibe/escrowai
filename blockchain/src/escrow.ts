import type { Address, PublicClient, WalletClient, TransactionReceipt } from "viem";
import { decodeEventLog, getContract } from "viem";
import { ESCROW_AI_ABI } from "./abis";
import { getArcConfig } from "./config";

export interface EscrowData {
  id: bigint;
  buyer: Address;
  seller: Address;
  amount: bigint;
  createdAt: bigint;
  deadline: bigint;
  status: number;
}

export type EscrowStatus = "CREATED" | "FUNDED" | "RELEASED" | "REFUNDED";

export function statusToString(status: number): EscrowStatus {
  const statuses: EscrowStatus[] = ["CREATED", "FUNDED", "RELEASED", "REFUNDED"];
  return statuses[status] ?? "CREATED";
}

export function createEscrowContract(
  client: PublicClient | WalletClient,
  contractAddress?: Address,
) {
  const config = getArcConfig();
  const address = (contractAddress ?? config.escrowContractAddress) as Address | undefined;
  if (!address) {
    throw new Error(
      "EscrowAI contract address is not configured. Set ESCROW_CONTRACT_ADDRESS in your environment.",
    );
  }
  return getContract({
    address,
    abi: ESCROW_AI_ABI,
    client: client as any,
  }) as any;
}

export async function createEscrow(
  client: WalletClient,
  seller: Address,
  amount: bigint,
  deadline: bigint,
  contractAddress?: Address,
) {
  if (!client.account) {
    throw new Error("Wallet client must be connected with an account");
  }
  const escrow = createEscrowContract(client, contractAddress);
  return escrow.write.createEscrow([seller, amount, deadline], { account: client.account });
}

export function getEscrowIdFromReceipt(
  receipt: TransactionReceipt,
  contractAddress?: Address,
): bigint | null {
  for (const log of receipt.logs) {
    if (contractAddress && log.address.toLowerCase() !== contractAddress.toLowerCase()) {
      continue;
    }
    try {
      const event = decodeEventLog({
        abi: ESCROW_AI_ABI,
        topics: (log as any).topics,
        data: (log as any).data,
      }) as { eventName: string; args: { escrowId: bigint | string | number } | undefined };
      if (event.eventName === "EscrowCreated" && event.args !== undefined) {
        if (event.args.escrowId !== undefined) {
          return BigInt(event.args.escrowId);
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function fundEscrow(
  client: WalletClient,
  escrowId: bigint,
  contractAddress?: Address,
) {
  if (!client.account) {
    throw new Error("Wallet client must be connected with an account");
  }
  const escrow = createEscrowContract(client, contractAddress);
  return escrow.write.fundEscrow([escrowId], { account: client.account });
}

export async function releaseEscrow(
  client: WalletClient,
  escrowId: bigint,
  contractAddress?: Address,
) {
  if (!client.account) {
    throw new Error("Wallet client must be connected with an account");
  }
  const escrow = createEscrowContract(client, contractAddress);
  return escrow.write.releaseEscrow([escrowId], { account: client.account });
}

export async function refundEscrow(
  client: WalletClient,
  escrowId: bigint,
  contractAddress?: Address,
) {
  if (!client.account) {
    throw new Error("Wallet client must be connected with an account");
  }
  const escrow = createEscrowContract(client, contractAddress);
  return escrow.write.refundEscrow([escrowId], { account: client.account });
}

export async function getEscrow(
  client: PublicClient,
  escrowId: bigint,
  contractAddress?: Address,
): Promise<EscrowData> {
  const escrow = createEscrowContract(client, contractAddress);
  const result = (await escrow.read.getEscrow([escrowId])) as [
    bigint,
    Address,
    Address,
    bigint,
    bigint,
    bigint,
    number,
  ];
  return {
    id: BigInt(result[0]),
    buyer: result[1],
    seller: result[2],
    amount: BigInt(result[3]),
    createdAt: BigInt(result[4]),
    deadline: BigInt(result[5]),
    status: Number(result[6]),
  };
}

export async function isRefundable(
  client: PublicClient,
  escrowId: bigint,
  contractAddress?: Address,
): Promise<boolean> {
  const escrow = createEscrowContract(client, contractAddress);
  return (await escrow.read.isRefundable([escrowId])) as boolean;
}
