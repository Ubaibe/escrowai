import { isAddress } from "viem";
import { toUSDCBaseUnits, USDC_DECIMALS } from "./usdc";
import { DEFAULT_USDC_ADDRESS } from "./config";

export interface EscrowFormData {
  seller: string;
  amount: string;
  deadline: string;
}

export interface EscrowFormErrors {
  seller?: string;
  amount?: string;
  deadline?: string;
  general?: string;
}

export function validateAddress(address: string): boolean {
  if (!address || typeof address !== "string") return false;
  return isAddress(address.trim());
}

export function validateSellerAddress(
  buyerAddress: string | undefined,
  sellerAddress: string,
): { valid: boolean; error?: string } {
  if (!sellerAddress || !sellerAddress.trim()) {
    return { valid: false, error: "Seller address is required" };
  }
  if (!isAddress(sellerAddress.trim())) {
    return { valid: false, error: "Invalid seller wallet address" };
  }
  if (buyerAddress && sellerAddress.trim().toLowerCase() === buyerAddress.toLowerCase()) {
    return { valid: false, error: "Seller cannot be the same as the buyer" };
  }
  return { valid: true };
}

export function validateAmount(
  amount: string,
  usdcBalance?: bigint,
): { valid: boolean; error?: string; baseUnits?: bigint } {
  if (!amount || !amount.trim()) {
    return { valid: false, error: "Amount is required" };
  }

  const cleanAmount = amount.trim();

  if (!/^\d+(\.\d{1,6})?$/.test(cleanAmount)) {
    return { valid: false, error: "Enter a valid USDC amount (up to 6 decimal places)" };
  }

  const [whole, fraction] = cleanAmount.split(".");
  const wholePart = BigInt(whole);
  const fractionPart = fraction ? BigInt(fraction.padEnd(USDC_DECIMALS, "0").slice(0, USDC_DECIMALS)) : 0n;

  if (wholePart === 0n && fractionPart === 0n) {
    return { valid: false, error: "Amount must be greater than zero" };
  }

  const baseUnits = toUSDCBaseUnits(BigInt(whole)) + fractionPart;

  if (usdcBalance !== undefined && baseUnits > usdcBalance) {
    return { valid: false, error: "Insufficient USDC balance" };
  }

  return { valid: true, baseUnits };
}

export function validateDeadline(
  deadline: string,
  currentTime: number = Math.floor(Date.now() / 1000),
): { valid: boolean; error?: string; unixTimestamp?: number } {
  if (!deadline) {
    return { valid: false, error: "Deadline is required" };
  }

  const selected = new Date(deadline);
  const unixSeconds = Math.floor(selected.getTime() / 1000);

  if (Number.isNaN(selected.getTime())) {
    return { valid: false, error: "Invalid date and time" };
  }

  if (unixSeconds <= currentTime) {
    return { valid: false, error: "Deadline must be in the future" };
  }

  return { valid: true, unixTimestamp: unixSeconds };
}

export function validateCreateEscrowForm(
  data: EscrowFormData,
  options: {
    buyerAddress?: string;
    usdcBalance?: bigint;
    currentTime?: number;
  } = {},
): EscrowFormErrors {
  const errors: EscrowFormErrors = {};

  const sellerResult = validateSellerAddress(options.buyerAddress, data.seller);
  if (!sellerResult.valid) {
    errors.seller = sellerResult.error;
  }

  const amountResult = validateAmount(data.amount, options.usdcBalance);
  if (!amountResult.valid) {
    errors.amount = amountResult.error;
  }

  const deadlineResult = validateDeadline(data.deadline, options.currentTime);
  if (!deadlineResult.valid) {
    errors.deadline = deadlineResult.error;
  }

  if (Object.keys(errors).length === 0) {
    return {};
  }

  return errors;
}

export function hasEscrowContractConfigured(): boolean {
  const addr =
    process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS ||
    process.env.ESCROW_CONTRACT_ADDRESS;
  return !!addr && /^0x[0-9a-fA-F]{40}$/.test(addr);
}

export function getConfiguredEscrowAddress(): string | undefined {
  const addr =
    process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS ||
    process.env.ESCROW_CONTRACT_ADDRESS;
  if (!addr || !/^0x[0-9a-fA-F]{40}$/.test(addr)) return undefined;
  return addr;
}

export function getConfiguredUsdcAddress(): string {
  return (
    process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS ||
    process.env.ARC_USDC_ADDRESS ||
    DEFAULT_USDC_ADDRESS
  );
}

export { USDC_DECIMALS };
