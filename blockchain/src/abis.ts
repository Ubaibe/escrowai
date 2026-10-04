import type { Abi } from "viem";

export const ESCROW_AI_ABI = [
  {
    type: "constructor",
    inputs: [{ name: "usdcToken_", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    name: "BuyerEqualsSeller",
    type: "error",
    inputs: [],
  },
  {
    name: "DeadlineNotReached",
    type: "error",
    inputs: [],
  },
  {
    name: "EscrowNotFound",
    type: "error",
    inputs: [],
  },
  {
    name: "InvalidAmount",
    type: "error",
    inputs: [],
  },
  {
    name: "InvalidDeadline",
    type: "error",
    inputs: [],
  },
  {
    name: "InvalidSeller",
    type: "error",
    inputs: [],
  },
  {
    name: "InvalidStatus",
    type: "error",
    inputs: [],
  },
  {
    name: "InvalidTokenAddress",
    type: "error",
    inputs: [],
  },
  {
    name: "Unauthorized",
    type: "error",
    inputs: [],
  },
  {
    name: "EscrowCreated",
    type: "event",
    inputs: [
      { name: "escrowId", type: "uint256", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "seller", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "deadline", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    name: "EscrowFunded",
    type: "event",
    inputs: [
      { name: "escrowId", type: "uint256", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    name: "EscrowReleased",
    type: "event",
    inputs: [
      { name: "escrowId", type: "uint256", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "seller", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    name: "EscrowRefunded",
    type: "event",
    inputs: [
      { name: "escrowId", type: "uint256", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    name: "createEscrow",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "seller", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "escrowId", type: "uint256" }],
  },
  {
    name: "fundEscrow",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "escrowId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "releaseEscrow",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "escrowId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "refundEscrow",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "escrowId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getEscrow",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "escrowId", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "buyer", type: "address" },
      { name: "seller", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "createdAt", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "status", type: "uint8" },
    ],
  },
  {
    name: "isRefundable",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "escrowId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "usdcToken",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const satisfies Abi;

export const USDC_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const satisfies Abi;
